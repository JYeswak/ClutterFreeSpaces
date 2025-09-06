# ClutterFreeSpaces API Deployment Guide

## Quick Deploy to Railway (Recommended)

Railway is the simplest free hosting option for Node.js APIs. No Docker knowledge required.

### Step 1: Prepare Your Environment Variables

1. Copy your current `.env` file values:
   - `SendGrid_API_Key` (Required for email functionality)
   - `AIRTABLE_API_KEY` (Optional - for CRM integration)  
   - `AIRTABLE_BASE_ID` (Optional - for CRM integration)

### Step 2: Deploy to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if needed
   - Select the ClutterFreeSpaces repository

3. **Configure Environment Variables**
   - After deployment starts, click on your service
   - Go to "Variables" tab
   - Add these variables:
     ```
     NODE_ENV=production
     SendGrid_API_Key=your_actual_sendgrid_key
     AIRTABLE_API_KEY=your_actual_airtable_key
     AIRTABLE_BASE_ID=your_actual_base_id
     ```
   - Railway automatically sets `PORT` for you

4. **Deploy**
   - Railway will automatically build and deploy your app
   - You'll get a URL like: `https://your-app-name.railway.app`

### Step 3: Update Squarespace Forms

Replace your current localhost API endpoints with your new Railway URL:

**Old (localhost):**
```javascript
fetch('http://localhost:3001/api/newsletter-signup', {
```

**New (production):**
```javascript
fetch('https://your-app-name.railway.app/api/newsletter-signup', {
```

### Step 4: Test Your Deployment

1. **Health Check**: Visit `https://your-app-name.railway.app/health`
2. **API Test**: Visit `https://your-app-name.railway.app/api/test`
3. **PDF Download**: Visit `https://your-app-name.railway.app/downloads/rv-organization-checklist.pdf`

## Alternative: Deploy to Vercel

If you prefer Vercel (also free):

### Requirements
- Install Vercel CLI: `npm i -g vercel`
- Create `vercel.json` configuration

### Deploy Commands
```bash
vercel login
vercel --prod
```

### Environment Variables
Set in Vercel dashboard or via CLI:
```bash
vercel env add SendGrid_API_Key
vercel env add AIRTABLE_API_KEY  
vercel env add AIRTABLE_BASE_ID
```

## Alternative: Deploy to Render

If you prefer Render (also free):

1. **Create Render Account**: Go to [render.com](https://render.com)
2. **New Web Service**: Connect GitHub repo
3. **Configure**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Add your variables
4. **Deploy**: Automatic on git push

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SendGrid_API_Key` | Yes | Your SendGrid API key for email sending |
| `AIRTABLE_API_KEY` | No | Airtable Personal Access Token |
| `AIRTABLE_BASE_ID` | No | Your Airtable base ID |
| `NODE_ENV` | No | Set to 'production' for production |
| `PORT` | No | Automatically set by hosting platforms |

## Security Notes

- Never commit `.env` files to git
- Use environment variables for all sensitive data
- Railway/Vercel/Render encrypt environment variables
- CORS is configured for your Squarespace domains only

## Troubleshooting

### API Not Responding
- Check Railway logs in dashboard
- Verify environment variables are set correctly
- Ensure health check passes: `/health`

### CORS Errors
- Verify your Squarespace domain is in the CORS whitelist
- Check browser console for exact domain being used
- Add additional domains to `corsOptions.origin` array if needed

### SendGrid Errors
- Verify API key is valid and has mail send permissions
- Check SendGrid dashboard for send logs
- Ensure templates exist and are active

### Airtable Errors  
- Verify Personal Access Token has correct base permissions
- Check base ID matches your Airtable base
- Airtable errors are non-blocking - API will work without it

## Production Monitoring

- Railway provides automatic logs and metrics
- Health check endpoint: `/health`
- API test endpoint: `/api/test`
- Monitor SendGrid dashboard for email delivery

## Updates and Redeployment

Railway auto-deploys on every git push to your main branch. To update:

1. Make changes locally
2. Commit and push to GitHub
3. Railway automatically redeploys
4. Verify health check passes

## Cost Considerations

**Railway Free Tier:**
- $5 credit monthly
- Usually covers small API usage
- Upgrade if you exceed limits

**Alternatives:**
- Vercel: Generous free tier for APIs
- Render: Free tier with some limitations
- Heroku: No longer offers free tier

Choose Railway for simplicity and reliability.