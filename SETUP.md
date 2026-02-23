# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB database (local or Atlas)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Playwright Browser
```bash
npx playwright install chromium
```

### 3. Set Up Environment Variables
Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:
```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/real-estate-scraper"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Scraper

1. Click the "Start Scrape" button on the dashboard
2. Watch the progress bar update in real-time
3. View scraped agents in the table below
4. Filter by location or lead status
5. Export data to CSV or Excel

## Troubleshooting

### MongoDB Connection Issues
- Make sure your IP is whitelisted in MongoDB Atlas
- Check your connection string format
- Verify database user credentials

### Playwright Issues
- Run `npx playwright install chromium` again
- On Windows, you may need to install Visual C++ Redistributable

### Scraping Timeout
- The scraper runs in the background
- For production, consider using a queue service like BullMQ or Inngest
- Current implementation works for development/testing

## Production Deployment

For production on Vercel:
1. Add environment variables in Vercel dashboard
2. Use a proper background job service (Inngest, QStash, or BullMQ)
3. Consider using a proxy service for scraping
4. Set up proper error monitoring

## Next Steps

- Customize CSS selectors in `lib/scraper/nigeria-property-centre.ts`
- Add more property portals (PropertyPro.ng, Jiji.ng, etc.)
- Implement proxy rotation for anti-ban
- Add email notifications when scraping completes
