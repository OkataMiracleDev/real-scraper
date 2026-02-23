# Nigeria Real Estate Lead Generator

A Next.js 15 application for scraping and analyzing real estate agents from Nigerian property portals.

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
- Playwright with stealth plugin
- Prisma ORM + MongoDB
- Inngest for background jobs
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

6. Set up Inngest (for background jobs):
- Sign up at https://www.inngest.com
- Get your event key and signing key
- Add them to `.env`
- Run Inngest dev server: `npx inngest-cli dev`

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
- Stealth plugin to bypass bot detection
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
