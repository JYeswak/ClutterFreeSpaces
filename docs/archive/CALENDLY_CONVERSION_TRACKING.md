# 📅 Enhanced Calendly Conversion Tracking Setup

## 🎯 Current Status: ✅ Basic Tracking Working
You're seeing Calendly clicks as "click" events in GA4 real-time - this confirms your analytics is working correctly!

## 🚀 Enhanced Calendly Tracking Setup

### **Step 1: Enhanced Click Tracking**
Add this code to your Squarespace **Code Injection (Header)**:

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
})();
</script>
```

### **Step 2: Calendly Webhook Integration (Advanced)**
For complete conversion tracking, set up Calendly webhooks:

```javascript
<!-- Calendly Conversion Completion Tracking -->
<script>
// Listen for Calendly events (when booking is completed)
window.addEventListener('message', function(e) {
  if (e.data.type === 'calendly.event_scheduled') {
    // Booking completed successfully
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase', {
        'transaction_id': e.data.event.uri,
        'value': 199, // Estimated consultation value
        'currency': 'USD',
        'event_category': 'Booking Conversion',
        'event_label': 'Consultation Booked'
      });
    }
    
    console.log('🎉 Booking completed:', e.data.event);
  }
});
</script>
```

---

## 📊 What You'll See in GA4

### **Enhanced Events (After Implementation)**
Instead of generic "click" events, you'll see:

```
Event Name: calendly_booking_click
Parameters:
- event_category: "Booking" 
- event_label: "RV Organization" (or other service)
- booking_button_text: "Book Free Consultation"
- service_context: Auto-detected service type
- value: 1
```

### **Conversion Events**
```
Event Name: purchase  
Parameters:
- transaction_id: Calendly booking ID
- value: 199 (consultation value)
- currency: USD
```

---

## 🎯 Calendly Conversion Goals Setup

### **In GA4: Create Conversion Events**
1. **Go to**: GA4 → **Configure** → **Events**
2. **Click**: "Create Event"
3. **Event Name**: `calendly_conversion`
4. **Conditions**: 
   - Event name equals `calendly_booking_click`
   - Mark as conversion: Yes

### **Enhanced Goal Tracking**
Set up these conversion events:
```
✓ calendly_booking_click (Booking Intent)
✓ purchase (Booking Completed) 
✓ consultation_scheduled (Service Specific)
✓ rv_consultation_booked (RV Specific)
```

---

## 📈 Calendly Performance Metrics

### **Track These KPIs**:
```
Booking Funnel:
1. Service page views
2. Calendly button clicks  
3. Calendly page visits
4. Bookings completed
5. Consultation shows/no-shows
```

### **Service-Specific Tracking**:
```
RV Organization:
- RV page visits → Calendly clicks → Bookings

Whole House:
- Service page → Consultation requests → Conversions

Virtual Consultations:
- Virtual page → Booking rate → Follow-up services
```

---

## 🔧 Testing Your Enhanced Tracking

### **Test Steps**:
1. **Add the enhanced code** to Squarespace header
2. **Wait 10 minutes** for code to propagate
3. **Open GA4 Real-time** events
4. **Click a booking button** on your site
5. **Check console** for enhanced logging
6. **Verify GA4** shows `calendly_booking_click` event

### **Debugging Console Commands**:
```javascript
// Test enhanced tracking manually
gtag('event', 'calendly_booking_click', {
  'event_category': 'Booking',
  'event_label': 'Test Service',
  'booking_button_text': 'Test Button',
  'value': 1
});

console.log('Test booking event sent');
```

---

## 💡 Advanced Calendly Analytics

### **UTM Parameter Tracking**
Add UTM parameters to your Calendly links:
```html
<!-- Example enhanced Calendly link -->
<a href="https://calendly.com/your-link?utm_source=website&utm_medium=service_page&utm_campaign=rv_organization">
  Book RV Consultation
</a>
```

### **Service Attribution**
Track which services drive the most bookings:
```
High Performers:
- RV Organization → Booking rate
- Virtual Consultation → Conversion rate  
- Whole House → Average project value
```

---

## 📊 Expected Results

### **Before Enhancement** (Current):
- Generic "click" events
- No service attribution
- Basic booking tracking

### **After Enhancement**:
- ✅ **Service-specific tracking**: Know which services drive bookings
- ✅ **Booking funnel analysis**: See drop-off points
- ✅ **Conversion value tracking**: Measure ROI per service
- ✅ **Campaign attribution**: Track marketing effectiveness

### **Weekly Booking Reports**:
```
Service Performance:
- RV Organization: 12 clicks → 3 bookings (25% rate)
- Whole House: 8 clicks → 2 bookings (25% rate)
- Virtual: 15 clicks → 6 bookings (40% rate)

Total Conversion Value: $1,194 (6 consultations × $199)
```

---

## 🚨 Troubleshooting

### **If Enhanced Events Don't Show**:
1. **Check console** for JavaScript errors
2. **Verify code placement** in header (not footer)
3. **Clear browser cache** and test again
4. **Wait 24 hours** for GA4 to recognize new events

### **If Calendly Webhooks Don't Work**:
1. **Check Calendly settings** for webhook permissions
2. **Verify domain** is authorized in Calendly
3. **Test with Calendly's** event simulator

**🎯 Ready to upgrade your Calendly tracking!** Implement the enhanced code and you'll get much more detailed insights into which services drive the most bookings and the complete conversion funnel.