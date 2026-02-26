'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { startScrapeJob, getScrapeJobStatus } from '@/app/actions/scraper';
import { Loader2, Play, AlertTriangle } from 'lucide-react';

export function ScrapeControl() {
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [leadsFound, setLeadsFound] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      const job = await getScrapeJobStatus(jobId);
      if (job) {
        setStatus(job.status);
        setProgress(job.total > 0 ? Math.round((job.progress / job.total) * 100) : 0);
        setLeadsFound(job.leadsFound);

        if (job.status === 'completed' || job.status === 'failed') {
          setIsLoading(false);
          clearInterval(interval);
          
          if (job.status === 'failed' && job.error) {
            alert(`Scraping failed: ${job.error}`);
          }
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  const handleStartScrape = async () => {
    setIsLoading(true);
    try {
      const { jobId: newJobId } = await startScrapeJob('lagos', 5);
      setJobId(newJobId);
      setStatus('running');
    } catch (error) {
      console.error('Failed to start scrape:', error);
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scrape Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mounted && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              Scraping works locally. For production, see PRODUCTION-SCRAPING.md
            </div>
          </div>
        )}
        
        <Button
          onClick={handleStartScrape}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Scrape
            </>
          )}
        </Button>

        {jobId && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Status: {status}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Leads found: {leadsFound}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
