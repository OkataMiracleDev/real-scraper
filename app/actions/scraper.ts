'use server';

import { prisma } from '@/lib/db';
import { inngest } from '@/lib/inngest/client';

export async function startScrapeJob(location: string = 'lagos', maxPages: number = 5) {
  const job = await prisma.scrapeJob.create({
    data: {
      status: 'pending',
      source: 'Nigeria Property Centre',
      progress: 0,
      total: maxPages * 20,
      leadsFound: 0,
    },
  });

  await inngest.send({
    name: 'scrape/start',
    data: {
      jobId: job.id,
      location,
      maxPages,
    },
  });

  return { jobId: job.id };
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
