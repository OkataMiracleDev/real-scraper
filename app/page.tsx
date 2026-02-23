import { getAgents, getAgentStats } from './actions/scraper';
import { AgentsTable } from '@/components/dashboard/agents-table';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { LocationChart } from '@/components/dashboard/location-chart';
import { ScrapeControl } from '@/components/dashboard/scrape-control';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const agents = await getAgents({ leadsOnly: false });
  const stats = await getAgentStats();

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Real Estate Lead Generator</h1>
            <p className="text-muted-foreground">Nigerian Property Market Intelligence</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <StatsCards
              totalAgents={stats.totalAgents}
              totalLeads={stats.totalLeads}
              agentsByLocation={stats.agentsByLocation}
            />
          </div>
          <div className="lg:col-span-1">
            <ScrapeControl />
          </div>
        </div>

        {stats.agentsByLocation.length > 0 && (
          <LocationChart data={stats.agentsByLocation} />
        )}

        <div>
          <h2 className="mb-4 text-2xl font-semibold">Agent Directory</h2>
          <AgentsTable agents={agents} />
        </div>
      </div>
    </main>
  );
}
