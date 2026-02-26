import { chromium } from 'playwright';
import { prisma } from '@/lib/db';

interface AgentData {
  name: string;
  phone?: string;
  email?: string;
  location?: string;
  profileUrl?: string;
  website?: string;
  propertyTypes: string[];
}

interface PropertyData {
  title: string;
  price?: string;
  location: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  url: string;
  imageUrl?: string;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

function randomDelay(min: number = 2000, max: number = 5000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
}

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function scrapeNigeriaPropertyCentre(
  jobId: string,
  location: string = 'lagos',
  maxPages: number = 5,
  onProgress?: (current: number, total: number, leadsFound: number) => void
) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    userAgent: getRandomUserAgent(),
    viewport: { width: 1920, height: 1080 },
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const page = await context.newPage();
  let totalLeads = 0;
  let itemsProcessed = 0;

  try {
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      // Check if job was cancelled
      const jobBeforePage = await prisma.scrapeJob.findUnique({ where: { id: jobId } });
      if (jobBeforePage?.cancelled) {
        console.log('Scrape job cancelled by user');
        break;
      }

      const url = `https://nigeriapropertycentre.com/for-sale/properties/${location}?page=${pageNum}`;
      
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await randomDelay(3000, 6000);

      const propertyLinks = await page.$$eval(
        '.content-link, .property-link, a[href*="/for-sale/"]',
        (links) => links.map((link) => (link as HTMLAnchorElement).href).filter(href => href.includes('/for-sale/'))
      );

      const uniqueLinks = [...new Set(propertyLinks)].slice(0, 20);
      const totalItems = maxPages * 20;

      for (let i = 0; i < uniqueLinks.length; i++) {
        // Check if job was cancelled
        const jobBeforeProperty = await prisma.scrapeJob.findUnique({ where: { id: jobId } });
        if (jobBeforeProperty?.cancelled) {
          console.log('Scrape job cancelled by user');
          break;
        }

        try {
          await page.goto(uniqueLinks[i], { waitUntil: 'domcontentloaded', timeout: 30000 });
          await randomDelay(2000, 4000);

          const agentData = await extractAgentData(page, uniqueLinks[i]);
          const propertyData = await extractPropertyData(page, uniqueLinks[i]);

          if (agentData && propertyData) {
            const isLead = !!agentData.phone && (!agentData.website || agentData.website.includes('nigeriapropertycentre.com'));

            // Create or find agent - use phone/email as unique identifier
            const uniqueKey = agentData.phone || agentData.email || agentData.name;
            
            let agent = await prisma.agent.findFirst({
              where: {
                OR: [
                  { phone: agentData.phone },
                  { email: agentData.email },
                  { name: agentData.name }
                ]
              }
            });

            if (!agent) {
              agent = await prisma.agent.create({
                data: {
                  name: agentData.name,
                  phone: agentData.phone,
                  email: agentData.email,
                  location: agentData.location,
                  propertyTypes: agentData.propertyTypes,
                  profileUrl: agentData.profileUrl,
                  website: agentData.website,
                  isLead,
                  source: 'Nigeria Property Centre',
                },
              });
            }

            await prisma.property.create({
              data: {
                ...propertyData,
                agentId: agent.id,
              },
            });

            if (isLead) totalLeads++;
          }

          itemsProcessed++;

          if (onProgress) {
            onProgress(itemsProcessed, totalItems, totalLeads);
          }

          await prisma.scrapeJob.update({
            where: { id: jobId },
            data: {
              progress: itemsProcessed,
              total: totalItems,
              leadsFound: totalLeads,
            },
          });

        } catch (error) {
          console.error(`Error scraping property ${uniqueLinks[i]}:`, error);
        }
      }
      
      // Check if cancelled after processing page
      const jobAfterPage = await prisma.scrapeJob.findUnique({ where: { id: jobId } });
      if (jobAfterPage?.cancelled) {
        break;
      }
    }

    // Update final status
    const finalJob = await prisma.scrapeJob.findUnique({ where: { id: jobId } });
    if (!finalJob?.cancelled) {
      await prisma.scrapeJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
    }

  } catch (error) {
    console.error('Scraping error:', error);
    await prisma.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });
  } finally {
    await browser.close();
  }

  return totalLeads;
}

async function extractAgentData(page: any, url: string): Promise<AgentData | null> {
  try {
    const agentData = await page.evaluate(() => {
      const nameEl = document.querySelector('.agent-name, .contact-name, [class*="agent"] h3, [class*="agent"] h4');
      const phoneEl = document.querySelector('.agent-phone, .contact-phone, a[href^="tel:"]');
      const emailEl = document.querySelector('.agent-email, a[href^="mailto:"]');
      const websiteEl = document.querySelector('.agent-website, a[href*="http"]');
      
      return {
        name: nameEl?.textContent?.trim() || 'Unknown Agent',
        phone: phoneEl?.textContent?.trim() || phoneEl?.getAttribute('href')?.replace('tel:', ''),
        email: emailEl?.textContent?.trim() || emailEl?.getAttribute('href')?.replace('mailto:', ''),
        website: websiteEl?.getAttribute('href'),
        profileUrl: window.location.href,
      };
    });

    return {
      ...agentData,
      propertyTypes: [],
      location: undefined,
    };
  } catch (error) {
    return null;
  }
}

async function extractPropertyData(page: any, url: string): Promise<PropertyData | null> {
  try {
    return await page.evaluate((pageUrl: string) => {
      const titleEl = document.querySelector('h1, .property-title, [class*="title"]');
      const priceEl = document.querySelector('.price, [class*="price"]');
      const locationEl = document.querySelector('.location, [class*="location"]');
      const typeEl = document.querySelector('.property-type, [class*="type"]');
      const bedroomsEl = document.querySelector('[class*="bedroom"]');
      const bathroomsEl = document.querySelector('[class*="bathroom"]');
      const imageEl = document.querySelector('img[src*="property"], .property-image img');

      return {
        title: titleEl?.textContent?.trim() || 'Untitled Property',
        price: priceEl?.textContent?.trim(),
        location: locationEl?.textContent?.trim() || 'Unknown',
        type: typeEl?.textContent?.trim() || 'Unknown',
        bedrooms: parseInt(bedroomsEl?.textContent?.match(/\d+/)?.[0] || '0'),
        bathrooms: parseInt(bathroomsEl?.textContent?.match(/\d+/)?.[0] || '0'),
        url: pageUrl,
        imageUrl: (imageEl as HTMLImageElement)?.src,
      };
    }, url);
  } catch (error) {
    return null;
  }
}
