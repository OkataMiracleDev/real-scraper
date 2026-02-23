import { inngest } from './client';
import { scrapeNigeriaPropertyCentre } from '../scraper/nigeria-property-centre';
import { prisma } from '../db';

export const scrapeRealEstateJob = inngest.createFunction(
  { id: 'scrape-real-estate' },
  { event: 'scrape/start' },
  async ({ event, step }) => {
    const { jobId, location, maxPages } = event.data;

    await step.run('scrape-properties', async () => {
      await scrapeNigeriaPropertyCentre(
        jobId,
        location,
        maxPages,
        async (current, total, leadsFound) => {
          await prisma.scrapeJob.update({
            where: { id: jobId },
            data: {
              progress: current,
              total,
              leadsFound,
            },
          });
        }
      );
    });

    return { jobId, status: 'completed' };
  }
);
