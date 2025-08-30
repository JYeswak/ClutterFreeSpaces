# 🎯 Quick Reference Card - Squarespace Deployment

## 🔧 What You Need to Update

### 1. API Endpoint URLs (CRITICAL)
**In all 3 form files, change:**
```javascript
const API_ENDPOINT = 'http://localhost:3001/api/newsletter-signup';
```
**To:**
```javascript
const API_ENDPOINT = 'https://YOUR-PRODUCTION-URL.com/api/newsletter-signup';
```

### 2. CORS Configuration (CRITICAL)
**Add to your api-server.js:**
```javascript
app.use(cors({
  origin: [
    'https://www.clutter-free-spaces.com',
    'https://clutter-free-spaces.com', 
    'https://clutter-free-spaces.squarespace.com'
  ]
}));
```

## 📍 Squarespace Placement Locations

### **Form 1: Inline (Primary)**
- **Location:** Pages → RV Organization Page → After "Why Choose Me" section
- **Method:** Add Code Block
- **File:** `inline-newsletter-form.html`

### **Form 2: Exit-Intent Popup**
- **Location:** Settings → Advanced → Code Injection → Footer
- **File:** `exit-intent-popup-form.html`

### **Form 3: Footer Persistent**
- **Location:** Same Footer Code Injection (below popup code)
- **File:** `footer-persistent-form.html`

## ✅ Test Checklist

After deployment, test:
- [ ] Form displays properly on page
- [ ] Lead score updates as user types
- [ ] Form submission succeeds
- [ ] Success message with PDF link appears
- [ ] Email arrives in inbox
- [ ] Airtable record creates
- [ ] Works on mobile devices

## 🚨 If Something Breaks

1. **Check browser console** for JavaScript errors
2. **Test API endpoint** directly: `https://your-url.com/health`
3. **Verify CORS** is allowing your Squarespace domain
4. **Check form field names** match API expectations

## 📞 Form Field Requirements

**Required fields your forms must include:**
- `firstName` (text)
- `email` (email)
- `rvType` (select)
- `biggestChallenge` (select) 
- `timeline` (select)
- `montanaResident` (checkbox)
- `gdprConsent` (checkbox)
- `abTestVariation` (hidden field: A/B)

## 🎯 Expected Results

**Successful submission returns:**
```json
{
  "success": true,
  "leadScore": 85,
  "segment": "HOT",
  "checklistUrl": "/downloads/rv-organization-checklist.pdf",
  "message": "Welcome! Check your email...",
  "airtableId": "rec123..."
}
```

## 🚀 Priority Order

1. **Deploy API to production** (get your live URL)
2. **Update form endpoints** (critical - forms won't work without this)
3. **Deploy inline form first** (highest conversion location)
4. **Test thoroughly** before adding popup/footer forms
5. **Monitor for first few days** to catch any issues

That's it! Your newsletter system is ready to generate leads! 🎉