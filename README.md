# Nigeria Real Estate Lead Generator

A Next.js 15 application for scraping and analyzing real estate agents from Nigerian property portals.

## ⚠️ Important: Deployment Notice

**This scraper uses Playwright which requires a server environment with browser binaries.**

- ✅ Works locally: `npm run dev`
- ❌ Doesn't work on Vercel (serverless limitations)
- ✅ Works on Railway, DigitalOcean, AWS EC2, Azure VMs

**Quick Solutions:**
1. **Run locally** - Works immediately
2. **Deploy to Railway** - 5 minute setup, see `QUICK-START.md`
3. **Use scraping API** - Replace Playwright with ScrapingBee/Bright Data

See `PRODUCTION-SCRAPING.md` for detailed deployment options.

## Features

- Scrapes Nigeria Property Centre for agent contact information
- Identifies independent agents without websites (qualified leads)
- WhatsApp direct links for easy contact
- Background job processing with Inngest
- Real-time progress tracking
- Export to CSV/Excel
- Location-based filtering and analytics
- Responsive dashboard with Shadcn/UI

## Tech Stack

- Next.js 15 (App Router)
- Playwright for web scraping
- Prisma ORM + MongoDB
- TanStack Table
- Recharts for visualizations
- Tailwind CSS + Shadcn/UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection string and Inngest keys.

4. Initialize Prisma:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Note: For production, you'll want to set up Inngest for background jobs. For development, you can test the scraper directly or deploy to a platform with longer timeouts.

## Usage

1. Click "Start Scrape" to begin scraping Nigeria Property Centre
2. Monitor progress in real-time
3. View results in the agents table
4. Filter by location or lead status
5. Export data to CSV or Excel
6. Click WhatsApp icons to contact agents directly

## Anti-Ban Features

- Random User-Agent rotation
- Human-like delays (2-5 seconds)
- Stealth browser flags to avoid detection
- Residential proxy support (configure in scraper)

## Deployment

Deploy to Vercel:
```bash
vercel
```

Make sure to:
- Add environment variables in Vercel dashboard
- Set up MongoDB Atlas
- Configure Inngest production keys

## License

MIT
