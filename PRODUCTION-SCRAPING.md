# Production Scraping Solutions

## The Problem

Playwright requires browser binaries and cannot run on Vercel's serverless functions. You'll see the scraper stuck at 0% in production.

## Solutions for Production

### Option 1: Use a Dedicated Server (Recommended)

Deploy the scraper to a server with persistent processes:

#### A. Railway.app (Easiest)
1. Sign up at https://railway.app
2. Create new project from GitHub
3. Add environment variables (DATABASE_URL, etc.)
4. Railway will auto-detect Next.js and deploy
5. Playwright will work out of the box

#### B. DigitalOcean App Platform
1. Sign up at https://www.digitalocean.com
2. Create new app from GitHub
3. Choose "Web Service" type
4. Add environment variables
5. Deploy

#### C. AWS EC2 / Azure VM
- More control but requires server management
- Install Node.js, Playwright, and dependencies
- Run `npm run build && npm start`

### Option 2: Use External Scraping Services

Replace Playwright with API-based scrapers:

#### A. Bright Data (formerly Luminati)
```typescript
// lib/scraper/brightdata-scraper.ts
export async function scrapeBrightData(url: string) {
  const response = await fetch('https://api.brightdata.com/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BRIGHTDATA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  return response.json();
}
```

#### B. ScrapingBee
```typescript
export async function scrapeWithBee(url: string) {
  const response = await fetch(
    `https://app.scrapingbee.com/api/v1/?api_key=${process.env.SCRAPINGBEE_API_KEY}&url=${encodeURIComponent(url)}`
  );
  return response.text();
}
```

#### C. Apify
- Pre-built scrapers for common sites
- Pay per scrape
- https://apify.com

### Option 3: Hybrid Approach (Best for Scale)

1. **Frontend on Vercel** (current setup)
2. **Scraper on separate service** (Railway/Render)
3. **Communication via API**

#### Setup:

1. Deploy scraper to Railway:
```bash
# Create separate scraper service
mkdir scraper-service
cd scraper-service
# Copy scraper files
# Add API endpoint
```

2. Update your Vercel app to call the scraper service:
```typescript
// app/api/scrape/route.ts
export async function POST(request: NextRequest) {
  const { location, maxPages } = await request.json();
  
  // Call external scraper service
  const response = await fetch(`${process.env.SCRAPER_SERVICE_URL}/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, maxPages }),
  });
  
  return response.json();
}
```

### Option 4: Use Vercel Cron + External Runner

1. Set up a cron job on Vercel
2. Trigger scraping on an external service
3. Store results in MongoDB

## Quick Fix for Testing

For now, you can:

1. **Run locally**: The scraper works perfectly on your local machine
2. **Use ngrok**: Expose your local server to the internet temporarily
3. **Manual scraping**: Run scraper locally and upload results

## Recommended Production Stack

```
┌─────────────────┐
│  Vercel         │  ← Frontend + Dashboard
│  (Next.js UI)   │
└────────┬────────┘
         │
         │ API calls
         ▼
┌─────────────────┐
│  Railway        │  ← Scraper Service
│  (Playwright)   │
└────────┬────────┘
         │
         │ Store data
         ▼
┌─────────────────┐
│  MongoDB Atlas  │  ← Database
└─────────────────┘
```

## Cost Comparison

| Service | Cost | Pros | Cons |
|---------|------|------|------|
| Railway | $5-20/mo | Easy, Playwright works | Need separate deploy |
| Bright Data | $500+/mo | Professional, reliable | Expensive |
| ScrapingBee | $49+/mo | Good balance | API limits |
| DigitalOcean | $12+/mo | Full control | More setup |

## Next Steps

1. Choose a solution based on your budget and scale
2. If testing: Run locally with `npm run dev`
3. If production: Deploy scraper to Railway (5 min setup)
4. Update environment variables accordingly

## Need Help?

Check the Railway deployment guide: https://docs.railway.app/guides/nextjs
