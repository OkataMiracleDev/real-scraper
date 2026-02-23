'use server';

import { prisma } from '@/lib/db';

export async function startScrapeJob(location: string = 'lagos', maxPages: number = 5) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, maxPages }),
  });

  const data = await response.json();
  return data;
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
