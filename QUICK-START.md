# Quick Start Guide

## The scraper is stuck at 0% on Vercel - What do I do?

**Short answer**: Playwright can't run on Vercel. You have 3 options:

### Option 1: Run Locally (Fastest - 2 minutes)

```bash
# Clone and setup
git clone <your-repo>
cd real-scraper
npm install
npx playwright install chromium

# Add .env file
echo 'DATABASE_URL="your-mongodb-url"' > .env
echo 'NEXT_PUBLIC_APP_URL="http://localhost:3000"' >> .env

# Run
npm run dev
```

Open http://localhost:3000 and click "Start Scrape" - it will work!

### Option 2: Deploy to Railway (5 minutes)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo
4. Add environment variables:
   - `DATABASE_URL`: Your MongoDB connection string
   - `NEXT_PUBLIC_APP_URL`: Your Railway URL
5. Deploy!

Railway supports Playwright out of the box. Your scraper will work in production.

### Option 3: Use Scraping API Service (10 minutes)

Replace Playwright with ScrapingBee or Bright Data:

```typescript
// lib/scraper/api-scraper.ts
export async function scrapeWithAPI(url: string) {
  const response = await fetch(
    `https://app.scrapingbee.com/api/v1/?api_key=${process.env.SCRAPINGBEE_API_KEY}&url=${url}`
  );
  return response.text();
}
```

## Why doesn't it work on Vercel?

Vercel uses serverless functions which:
- Have no persistent file system
- Can't install browser binaries
- Timeout after 60 seconds

Playwright needs:
- Chrome/Chromium binary (~300MB)
- Persistent process
- Longer execution time

## What works where?

| Feature | Local | Vercel | Railway | DigitalOcean |
|---------|-------|--------|---------|--------------|
| UI Dashboard | ✅ | ✅ | ✅ | ✅ |
| Playwright Scraper | ✅ | ❌ | ✅ | ✅ |
| Database | ✅ | ✅ | ✅ | ✅ |
| Export CSV/Excel | ✅ | ✅ | ✅ | ✅ |

## Recommended Setup

**For Development**: Run locally
**For Production**: Deploy to Railway (frontend + scraper) or split:
- Frontend on Vercel
- Scraper on Railway
- Database on MongoDB Atlas

## Cost

- **Local**: Free
- **Railway**: $5/month (includes 500 hours)
- **Vercel + Railway**: $5/month (Vercel free tier + Railway)
- **ScrapingBee**: $49/month (1000 API calls)

## Need more help?

See `PRODUCTION-SCRAPING.md` for detailed deployment guides.
