# Railway Deployment Guide

## The MongoDB Connection Error

If you see this error:
```
no record found for Query { name: Name("_mongodb._tcp.cluster.mongodb.net.railway.internal.")
```

Railway is incorrectly trying to resolve your MongoDB Atlas URL as a Railway internal service.

## Fix Steps

### 1. Get Your MongoDB Atlas Connection String

1. Go to MongoDB Atlas → Database → Connect
2. Choose "Drivers"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Format It Correctly

Add your database name between `.net/` and `?`:

```
mongodb+srv://scraper:YOUR_PASSWORD@freescraper.kf05qtn.mongodb.net/real-estate-scraper?retryWrites=true&w=majority
```

**Important**: 
- Replace `YOUR_PASSWORD` with your actual password
- Keep the `?retryWrites=true&w=majority` at the end
- Add the database name `/real-estate-scraper` before the `?`

### 3. Set Environment Variable in Railway

1. Go to Railway Dashboard → Your Project
2. Click on your service
3. Go to "Variables" tab
4. Add or update `DATABASE_URL`:
   ```
   mongodb+srv://scraper:mimi@freescraper.kf05qtn.mongodb.net/real-estate-scraper?retryWrites=true&w=majority
   ```
5. Add `NEXT_PUBLIC_APP_URL`:
   ```
   ${{RAILWAY_PUBLIC_DOMAIN}}
   ```
   (Railway will auto-replace this with your actual domain)

### 4. Whitelist Railway IPs in MongoDB Atlas

Railway uses dynamic IPs, so you need to allow all IPs:

1. MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

**Security Note**: For production, consider using MongoDB Atlas Private Endpoints or VPC Peering instead.

### 5. Redeploy

After setting environment variables:

1. Go to Deployments tab in Railway
2. Click "Redeploy" on the latest deployment

OR push a new commit:
```bash
git commit --allow-empty -m "Trigger Railway redeploy"
git push
```

## Verify It's Working

Check the logs in Railway:
- Should see: `✓ Ready in XXXms`
- Should NOT see: DNS resolution errors

Visit your Railway URL and the dashboard should load without errors.

## Common Issues

### Issue: Still seeing `.railway.internal` in errors

**Solution**: Railway might be auto-detecting MongoDB. Make sure:
- You don't have a MongoDB plugin added in Railway
- Your `DATABASE_URL` is set as a custom variable, not auto-generated
- Delete any auto-generated MongoDB variables

### Issue: Authentication failed

**Solution**: 
- Check your password doesn't contain special characters that need URL encoding
- Use MongoDB Atlas → Database Access to verify user credentials
- Try resetting the password

### Issue: Connection timeout

**Solution**:
- Verify 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access
- Check your MongoDB cluster is running (not paused)
- Try connecting from your local machine first to verify credentials

## Test Connection Locally First

Before deploying, test your connection string locally:

```bash
# Update .env with your connection string
npm run dev
```

If it works locally, it should work on Railway with the same connection string.

## Alternative: Use Railway's MongoDB Plugin

If you prefer, you can use Railway's built-in MongoDB:

1. Railway Dashboard → Add Service → Database → MongoDB
2. Railway will auto-generate `MONGO_URL`
3. Update your code to use `MONGO_URL` instead of `DATABASE_URL`
4. Run `npx prisma db push` after deployment

**Note**: Railway's MongoDB is not managed like Atlas and requires more maintenance.
