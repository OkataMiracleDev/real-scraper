import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const maxDuration = 60; // Set max duration for Vercel

export async function POST(request: NextRequest) {
  try {
    const { location = 'lagos', maxPages = 5 } = await request.json();

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
          error: error.message || 'Failed to start scraper. Playwright may not be available in this environment.',
          completedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    console.error('POST /api/scrape error:', error);
    return NextResponse.json(
      { error: 'Failed to start scrape job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
  }

  const job = await prisma.scrapeJob.findUnique({
    where: { id: jobId },
  });

  return NextResponse.json(job);
}

async function startBackgroundScrape(jobId: string, location: string, maxPages: number) {
  try {
    // Check if we're in a serverless environment
    if (process.env.VERCEL) {
      throw new Error('Playwright cannot run on Vercel serverless functions. Please use a dedicated server or external scraping service.');
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

