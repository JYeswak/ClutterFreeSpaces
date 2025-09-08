# 🎯 Complete Calendly Webhooks Setup Guide

## 🚀 Step-by-Step Implementation

### **Step 1: Add Enhanced Click Tracking**
1. **Go to**: Squarespace → Settings → Advanced → Code Injection
2. **Click**: Header section
3. **Paste this code**:

```javascript
<!-- Enhanced Calendly Conversion Tracking -->
<script>
(function() {
  'use strict';
  
  // Enhanced Calendly click tracking
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && (link.href.includes('calendly.com') || link.textContent.toLowerCase().includes('book') || link.textContent.toLowerCase().includes('schedule'))) {
      
      // Determine service type from page context
      const serviceType = determineServiceType();
      const linkText = link.textContent.trim();
      
      // Send enhanced event to GA4
      if (typeof gtag !== 'undefined') {
        gtag('event', 'calendly_booking_click', {
          'event_category': 'Booking',
          'event_label': serviceType,
          'booking_button_text': linkText,
          'page_location': window.location.href,
          'service_context': serviceType,
          'value': 1
        });
      }
      
      // Log for debugging
      console.log('📅 Calendly booking clicked:', {
        service: serviceType,
        button: linkText,
        url: link.href
      });
    }
  });
  
  // Determine service type based on page URL and content
  function determineServiceType() {
    const url = window.location.pathname.toLowerCase();
    const pageTitle = document.title.toLowerCase();
    
    if (url.includes('rv') || pageTitle.includes('rv')) return 'RV Organization';
    if (url.includes('whole-house') || pageTitle.includes('whole house')) return 'Whole House';
    if (url.includes('single-room') || pageTitle.includes('single room')) return 'Single Room';
    if (url.includes('garage') || pageTitle.includes('garage')) return 'Garage Organization';
    if (url.includes('virtual') || pageTitle.includes('virtual')) return 'Virtual Consultation';
    if (url.includes('consultation') || pageTitle.includes('consultation')) return 'Free Consultation';
    
    return 'General Service';
  }
  
  // Listen for Calendly widget events (when booking is completed)
  window.addEventListener('message', function(e) {
    if (e.origin !== 'https://calendly.com') return;
    
    if (e.data.event === 'calendly.event_scheduled') {
      // Booking completed successfully
      const serviceType = determineServiceType();
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
          'transaction_id': e.data.event_details?.event?.uri || 'calendly_' + Date.now(),
          'value': 199, // Estimated consultation value
          'currency': 'USD',
          'event_category': 'Booking Conversion',
          'event_label': serviceType + ' - Consultation Booked',
          'service_type': serviceType
        });
        
        // Also send specific conversion event
        gtag('event', 'consultation_booked', {
          'event_category': 'Conversion',
          'event_label': serviceType,
          'value': 199,
          'service_context': serviceType
        });
      }
      
      console.log('🎉 Booking completed:', {
        service: serviceType,
        event: e.data
      });
    }
  });
})();
</script>
```

4. **Click**: Save
5. **Wait**: 10 minutes for changes to propagate

---

## **Step 2: Set Up Calendly Webhooks**

### **2A: Access Calendly Webhooks**
1. **Go to**: [calendly.com](https://calendly.com)
2. **Click**: Your profile → Account Settings
3. **Navigate**: Developer → Webhooks
4. **Click**: "Create Webhook"

### **2B: Configure Webhook URL**
**Important**: We need to create a webhook endpoint first. Here are your options:

#### **Option A: Use Zapier (Easiest)**
1. **Go to**: [zapier.com](https://zapier.com)
2. **Create**: New Zap
3. **Trigger**: Calendly → "Invitee Created"
4. **Action**: Webhooks → "POST" to your Google Analytics

#### **Option B: Use a Simple Webhook Service**
1. **Go to**: [webhook.site](https://webhook.site) 
2. **Copy**: The unique webhook URL
3. **Use this temporarily** for testing

#### **Option C: Create Custom Endpoint (Advanced)**
We can create a simple webhook receiver on your Railway server.

---

## **Step 3: Test the Setup**

### **3A: Test Click Tracking**
1. **Open**: GA4 → Realtime → Events
2. **Open**: Your website in another tab
3. **Click**: Any booking button
4. **Check GA4**: Should see `calendly_booking_click` event

### **3B: Test Completion Tracking**
1. **Book**: A test appointment on your Calendly
2. **Complete**: The booking process
3. **Check GA4**: Should see `purchase` and `consultation_booked` events

### **3C: Verify Console Logging**
1. **Press**: F12 → Console
2. **Click**: Booking button
3. **Should see**: `📅 Calendly booking clicked: {service: "RV Organization", ...}`
4. **Complete booking**: Should see `🎉 Booking completed: {...}`

---

## **Step 4: Create GA4 Conversion Goals**

### **4A: Mark Events as Conversions**
1. **Go to**: GA4 → Configure → Conversions
2. **Click**: "New conversion event"
3. **Add these events as conversions**:
   ```
   ✓ calendly_booking_click (Booking Intent)
   ✓ purchase (Booking Completed)
   ✓ consultation_booked (Service Specific)
   ```

### **4B: Set Up Enhanced Ecommerce**
1. **Go to**: GA4 → Configure → Events
2. **Click**: "Create event"
3. **Configure**:
   - Event name: `booking_funnel`
   - Conditions: Event name contains "calendly"
   - Mark as conversion: Yes

---

## **Step 5: Advanced Webhook Setup (Railway Server)**

If you want a custom webhook endpoint, I can help you add this to your existing Railway server:

```javascript
// Add to your existing API server
app.post('/api/calendly-webhook', express.json(), (req, res) => {
  console.log('Calendly webhook received:', req.body);
  
  const event = req.body;
  
  // Send to Google Analytics via Measurement Protocol
  if (event.event === 'invitee.created') {
    // This is a successful booking
    const payload = {
      client_id: 'calendly_webhook',
      events: [{
        name: 'purchase',
        parameters: {
          transaction_id: event.payload.event.uri,
          value: 199,
          currency: 'USD',
          event_category: 'Calendly Webhook',
          event_label: 'Consultation Booked'
        }
      }]
    };
    
    // Send to GA4 (you'll need your Measurement ID)
    // Implementation depends on your GA4 setup
  }
  
  res.status(200).json({ received: true });
});
```

---

## **Step 6: Monitor Results**

### **Daily Metrics to Check**:
```
GA4 → Realtime → Events:
✓ calendly_booking_click (Booking attempts)
✓ purchase (Completed bookings)  
✓ consultation_booked (Service-specific completions)

GA4 → Reports → Conversions:
✓ Conversion rate by service type
✓ Revenue attribution by page
✓ Booking funnel performance
```

### **Weekly Analysis**:
```
Service Performance:
- RV Organization: X clicks → Y bookings (Z% conversion)
- Whole House: X clicks → Y bookings (Z% conversion)
- Virtual Consultation: X clicks → Y bookings (Z% conversion)

Revenue Tracking:
- Total booking value: $XXX (Y consultations × $199)
- Best converting pages
- Peak booking times
```

---

## **🎯 Expected Results**

### **Before (Generic Tracking)**:
- "click" events only
- No service attribution
- No completion tracking

### **After (Complete Setup)**:
- ✅ **Service-specific clicks**: Know which services get clicked
- ✅ **Completion tracking**: See actual bookings, not just clicks  
- ✅ **Revenue attribution**: $199 per consultation tracked
- ✅ **Funnel analysis**: Click-to-book conversion rates
- ✅ **Service optimization**: Focus on highest-converting services

---

## **🚨 Troubleshooting**

### **If Click Events Don't Fire**:
1. Check browser console for JavaScript errors
2. Verify gtag is defined: `console.log(typeof gtag)`
3. Clear browser cache and test again

### **If Webhook Events Don't Fire**:
1. Check Calendly webhook logs
2. Verify webhook URL is accessible
3. Test with a simple webhook.site URL first

### **If GA4 Events Don't Show**:
1. Wait 24-48 hours for new events to appear in reports
2. Check Realtime events for immediate feedback
3. Verify event names match exactly

**🚀 Ready to implement!** Start with Step 1 (the code injection) and test the click tracking. Then we can set up the webhook endpoint. Which approach do you want to take for the webhook URL?