# Railway Deployment Instructions - Review Automation

## ✅ What's Already Done

1. **Review email templates deployed** to SendGrid with template IDs
2. **Review automation system** integrated into `api-server.js`
3. **Scheduled automation** runs every 4 hours automatically
4. **API endpoints** for manual triggering and webhooks

## 🚀 Deploy to Railway

1. **Push to Git** (Railway will auto-deploy):
```bash
git add .
git commit -m "Add review automation system to Railway server"
git push
```

2. **Environment Variables** (should already be set in Railway):
   - `AIRTABLE_BASE_ID` = `your-airtable-base-id`
   - `AIRTABLE_API_KEY` = `your-airtable-api-key`  
   - `SendGrid_API_Key` = `your-sendgrid-api-key`

## 🔧 How the System Works on Railway

### **Automatic Scheduling**
- Runs **30 seconds** after server startup (initial check)
- Then runs **every 4 hours** automatically
- No cron jobs needed - built into the Node.js server

### **API Endpoints Available**
1. **Manual Trigger**: `POST /api/review-automation/run`
   - Test: `curl -X POST https://your-railway-url.railway.app/api/review-automation/run`

2. **Airtable Webhook**: `POST /api/review-automation/webhook`
   - For instant triggering when Status changes to "Client"
   - Set up in Airtable automations

3. **Health Check**: `GET /health`
   - Verify system is running

### **Server Logs Will Show**
```
🚀 Guide delivery server running on http://localhost:3001
⭐ Review automation system ACTIVE
⏰ Review automation scheduled every 4 hours
🤖 Running initial review automation check...
📊 Found X clients needing review requests
```

## 🎯 Testing the Deployment

1. **Check Server Logs** in Railway dashboard for automation messages
2. **Manual API Test**:
   ```bash
   curl -X POST https://your-railway-url.railway.app/api/review-automation/run
   ```
3. **Create Test Client** in Airtable with Status="Client" to trigger automation

## 📞 Optional: Set Up Airtable Webhook (Instant Triggering)

Instead of waiting 4 hours, trigger immediately when status changes:

1. **In Airtable** → Automations → Create New Automation
2. **Trigger**: When record matches conditions
   - Table: Leads
   - Condition: Status = "Client" AND Review Requested ≠ "true"
3. **Action**: Send webhook to URL:
   ```
   https://your-railway-url.railway.app/api/review-automation/webhook
   ```
4. **Webhook Body** (JSON):
   ```json
   {
     "recordId": "{{RECORD_ID}}",
     "fields": {
       "Status": "{{Status}}",
       "First Name": "{{First Name}}",
       "Email": "{{Email}}",
       "Service Completion Date": "{{Service Completion Date}}",
       "Review Requested": "{{Review Requested}}"
     }
   }
   ```

## ⚡ Benefits of Railway Deployment

✅ **Always Running** - No need to keep your computer on  
✅ **Automatic Scaling** - Handles multiple clients simultaneously  
✅ **Built-in Logging** - View all automation activity in Railway dashboard  
✅ **Instant Webhooks** - Optional real-time triggering from Airtable  
✅ **Same Server** - Uses your existing Railway deployment  

## 🔍 Monitoring & Troubleshooting

- **Railway Dashboard** → Logs tab shows all automation activity
- **Manual trigger** for testing: `/api/review-automation/run`
- **Health check** confirms system is running: `/health`
- **Environment variables** must include all SendGrid/Airtable keys

The system is now production-ready and will automatically handle review requests for all new clients! 🚀