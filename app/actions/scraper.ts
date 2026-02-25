'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function startScrapeJob(location: string = 'lagos', maxPages: number = 5) {
  try {
    const job = await prisma.scrapeJob.create({
      data: {
        status: 'pending',
        source: 'Nigeria Property Centre',
        progress: 0,
        total: maxPages * 20,
        leadsFound: 0,
      },
    });

    // Start scraping in background (non-blocking)
    startBackgroundScrape(job.id, location, maxPages).catch(async (error) => {
      console.error('Failed to start scrape:', error);
      await prisma.scrapeJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          error: error.message || 'Failed to start scraper',
          completedAt: new Date(),
        },
      });
    });

    return { jobId: job.id };
  } catch (error) {
    console.error('Error creating scrape job:', error);
    throw new Error('Failed to create scrape job');
  }
}

async function startBackgroundScrape(jobId: string, location: string, maxPages: number) {
  try {
    // Check if we're in a serverless environment
    if (process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT) {
      throw new Error('Playwright cannot run on serverless/Railway. Please run locally or use a scraping API service.');
    }

    // Import dynamically to avoid blocking
    const { scrapeNigeriaPropertyCentre } = await import('@/lib/scraper/nigeria-property-centre');
    await scrapeNigeriaPropertyCentre(jobId, location, maxPages);
  } catch (error) {
    console.error('Background scrape error:', error);
    await prisma.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown scraping error',
        completedAt: new Date(),
      },
    });
    throw error;
  }
}

export async function getScrapeJobStatus(jobId: string) {
  const job = await prisma.scrapeJob.findUnique({
    where: { id: jobId },
  });

  return job;
}

export async function getAgents(filters?: {
  location?: string;
  propertyType?: string;
  leadsOnly?: boolean;
}) {
  const where: any = {};

  if (filters?.location) {
    where.location = { contains: filters.location, mode: 'insensitive' };
  }

  if (filters?.propertyType) {
    where.propertyTypes = { has: filters.propertyType };
  }

  if (filters?.leadsOnly) {
    where.isLead = true;
  }

  const agents = await prisma.agent.findMany({
    where,
    include: {
      properties: true,
    },
    orderBy: {
      scrapedAt: 'desc',
    },
  });

  return agents;
}

export async function getAgentStats() {
  const totalAgents = await prisma.agent.count();
  const totalLeads = await prisma.agent.count({ where: { isLead: true } });
  
  const agentsByLocation = await prisma.agent.groupBy({
    by: ['location'],
    _count: true,
    where: {
      location: { not: null },
    },
  });

  return {
    totalAgents,
    totalLeads,
    agentsByLocation: agentsByLocation.map(item => ({
      location: item.location || 'Unknown',
      count: item._count,
    })),
  };
}
