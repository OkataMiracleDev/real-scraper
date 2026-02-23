import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    startBackgroundScrape(job.id, location, maxPages);

    return NextResponse.json({ jobId: job.id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start scrape job' },
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
  // Import dynamically to avoid blocking
  const { scrapeNigeriaPropertyCentre } = await import('@/lib/scraper/nigeria-property-centre');
  
  try {
    await scrapeNigeriaPropertyCentre(jobId, location, maxPages);
  } catch (error) {
    console.error('Background scrape error:', error);
  }
}
