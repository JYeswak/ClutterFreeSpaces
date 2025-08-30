# Production Testing Checklist

Test these endpoints and functionality after deployment to ensure everything works correctly.

## Pre-Deployment Checklist

- [ ] Environment variables configured in Railway/hosting platform
- [ ] CORS domains updated for Squarespace sites
- [ ] PDF file exists in downloads directory
- [ ] All sensitive data removed from code (API keys in environment only)

## Health & Basic Functionality

### 1. Health Check
- [ ] Visit: `https://your-app.railway.app/health`
- [ ] Should return: `{"status":"healthy","timestamp":"..."}`

### 2. API Test Endpoint
- [ ] Visit: `https://your-app.railway.app/api/test`  
- [ ] Should return JSON with templates object
- [ ] Verify all template IDs are present

### 3. PDF Download
- [ ] Visit: `https://your-app.railway.app/downloads/rv-organization-checklist.pdf`
- [ ] PDF should download/display properly
- [ ] Check file size is reasonable (not 0 bytes)

## Email Functionality Testing

### 4. Newsletter Signup (Critical)
Test with Postman, curl, or browser console:

```javascript
fetch('https://your-app.railway.app/api/newsletter-signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'Test',
    email: 'your-email@example.com',
    rvType: 'Class A',
    biggestChallenge: 'Kitchen',
    timeline: 'ASAP',
    montanaResident: false,
    gdprConsent: true
  })
})
.then(r => r.json())
.then(console.log);
```

Expected response:
- [ ] Status 200
- [ ] `success: true`
- [ ] Valid `leadScore` number
- [ ] `segment` (HOT/WARM/COLD)
- [ ] `checklistUrl` pointing to PDF

### 5. Quiz Guide Delivery
Test the quiz endpoint:

```javascript
fetch('https://your-app.railway.app/api/send-guide', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'your-email@example.com',
    style: 'detailed',
    source: 'website',
    quiz_results: {
      q1: 'A', q2: 'B', q3: 'A', q4: 'C', q5: 'A'
    }
  })
})
.then(r => r.json())
.then(console.log);
```

Expected response:
- [ ] Status 200
- [ ] `success: true`
- [ ] `leadScore` calculated

## Email Delivery Verification

### 6. SendGrid Dashboard
- [ ] Login to SendGrid dashboard
- [ ] Check Activity Feed for sent emails
- [ ] Verify emails were delivered successfully
- [ ] No bounce/spam issues

### 7. Received Emails
- [ ] Check inbox for welcome emails
- [ ] Verify email formatting looks correct
- [ ] Check all links work (consultation booking, etc.)
- [ ] PDF attachment/link works

## Integration Testing

### 8. Airtable CRM (Optional)
If Airtable is configured:
- [ ] Check Airtable base for new lead records
- [ ] Verify all fields populated correctly
- [ ] Lead score and segment recorded

### 9. CORS Testing
From Squarespace site console:
```javascript
fetch('https://your-app.railway.app/api/test')
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

- [ ] No CORS errors in browser console
- [ ] Request completes successfully

## Performance & Reliability

### 10. Response Times
- [ ] Health check responds < 2 seconds
- [ ] API endpoints respond < 5 seconds
- [ ] PDF download starts promptly

### 11. Error Handling
Test with invalid data:
```javascript
fetch('https://your-app.railway.app/api/newsletter-signup', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({}) // Missing required fields
})
.then(r => r.json())
.then(console.log);
```

- [ ] Returns proper error status (400)
- [ ] Error message is informative
- [ ] Server doesn't crash

### 12. Load Testing (Optional)
- [ ] Send 10 concurrent requests
- [ ] All complete successfully
- [ ] No timeouts or errors

## Production Monitoring Setup

### 13. Logging
- [ ] Check Railway/hosting platform logs
- [ ] Successful requests logged
- [ ] Errors logged with details
- [ ] No sensitive data in logs

### 14. Alerts (Optional)
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure email alerts for downtime
- [ ] Monitor SendGrid usage/quotas

## Squarespace Integration

### 15. Update Form URLs
Replace localhost URLs in Squarespace forms:
- [ ] Newsletter signup forms
- [ ] Quiz result handlers
- [ ] Any other API calls

### 16. Test Forms Live
- [ ] Submit newsletter signup from live Squarespace site
- [ ] Complete organization quiz from live site
- [ ] Verify emails received and CRM updated

## Security Verification

### 17. Environment Variables
- [ ] No API keys visible in public code
- [ ] Environment variables properly set
- [ ] No .env file in repository

### 18. HTTPS
- [ ] All endpoints use HTTPS
- [ ] No mixed content warnings
- [ ] SSL certificate valid

## Final Production Checklist

- [ ] All critical tests passing
- [ ] Forms updated with production URLs
- [ ] Monitoring configured
- [ ] Documentation updated with production URLs
- [ ] Backup plan documented for rollbacks
- [ ] Team notified of new production API

## Emergency Contacts & Rollback

**If something breaks:**
1. Check Railway logs first
2. Verify environment variables
3. Test health endpoint
4. Check SendGrid dashboard
5. Rollback: Use previous Railway deployment or revert git commit

**Support Resources:**
- Railway docs: https://docs.railway.app
- SendGrid docs: https://docs.sendgrid.com
- Airtable API docs: https://airtable.com/api

---

**Remember:** Test with real email addresses you control to verify the complete flow!