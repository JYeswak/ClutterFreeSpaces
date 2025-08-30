# ClutterFreeSpaces Newsletter Forms - Testing Checklist

## 🧪 Pre-Deployment Testing

### API & CORS Testing

- [ ] **API Endpoint Health Check**
  ```bash
  curl https://your-api-domain.com/health
  # Should return: {"status": "healthy", "timestamp": "..."}
  ```

- [ ] **CORS Configuration Test**
  ```bash
  curl -H "Origin: https://your-site.squarespace.com" \
       https://your-api-domain.com/api/cors-test
  # Should return: {"success": true, "message": "CORS is configured correctly"}
  ```

- [ ] **Newsletter Signup API Test**
  ```bash
  curl -H "Origin: https://your-site.squarespace.com" \
       -H "Content-Type: application/json" \
       -X POST \
       https://your-api-domain.com/api/newsletter-signup \
       -d '{
         "firstName": "Test User",
         "email": "test@example.com",
         "rvType": "class-a",
         "biggestChallenge": "kitchen",
         "timeline": "asap",
         "montanaResident": false,
         "gdprConsent": true,
         "leadScore": 75,
         "abTestVariation": "a",
         "source": "test"
       }'
  # Should return: {"success": true, "leadScore": ..., "segment": "..."}
  ```

---

## 📋 Form-Specific Testing

### 1. Inline Newsletter Form

#### **Visual & Layout Testing**
- [ ] Form loads without JavaScript errors (check console)
- [ ] ClutterFreeSpaces branding colors display correctly
- [ ] Montana badge appears at top
- [ ] Form is centered and properly sized
- [ ] All field labels are visible and readable
- [ ] Required field asterisks (*) are red
- [ ] Dropdown arrows appear correctly

#### **Functionality Testing**
- [ ] **A/B Test Variation**
  - Refresh page multiple times
  - Verify headline alternates between variations A & B
  - Check `window.cfsNewsletterVariation` in console

- [ ] **Lead Scoring**
  - Fill in first name → Score should appear and show progress
  - Add email → Score increases
  - Select RV type → Score increases based on selection
  - Select challenge → Score increases (weight-management = highest)
  - Select timeline → Score increases (ASAP = highest)
  - Check Montana resident → Score increases by 15 points
  - Verify color changes: Red (<40), Orange (40-69), Green (70+)

- [ ] **Form Validation**
  - Submit empty form → Should show error for required fields
  - Enter invalid email → Should show email format error
  - Uncheck GDPR consent → Should prevent submission
  - Fill all required fields → Should submit successfully

- [ ] **Success Flow**
  - Submit complete form
  - Success message appears
  - Form resets to empty state
  - Lead score indicator hides

#### **Mobile Testing (375px width)**
- [ ] Form stacks to single column
- [ ] Text remains readable
- [ ] Buttons are touch-friendly (44px+ height)
- [ ] No horizontal scrolling
- [ ] Font size prevents iOS zoom

---

### 2. Exit-Intent Popup Form

#### **Trigger Testing (Desktop)**
- [ ] **Exit Intent Detection**
  - Wait 1+ seconds on page
  - Scroll down 40%+ of page
  - Move mouse to top edge of browser
  - Popup should appear with animation

- [ ] **Cookie Persistence**
  - Trigger popup and close it
  - Refresh page and try exit intent again
  - Popup should NOT appear (cookie set for 7 days)
  - Clear cookies and test again

#### **Trigger Testing (Mobile)**
- [ ] **Scroll-Based Exit Intent**
  - Scroll down 40%+ of page
  - Scroll quickly upward to top
  - Popup should trigger

#### **Popup Functionality**
- [ ] **Close Methods**
  - Click X button → Popup closes
  - Click outside popup overlay → Popup closes
  - Press Escape key → Popup closes
  - All methods set dismissal cookie

- [ ] **Form Testing**
  - Lead scoring updates as fields filled
  - Validation works (same as inline form)
  - Success message shows
  - Auto-closes after 3 seconds on success

#### **Visual Testing**
- [ ] Backdrop blur effect works
- [ ] Popup slides in smoothly
- [ ] Close button is visible and accessible
- [ ] Urgency badge displays correctly
- [ ] Mobile responsive (single column on small screens)

---

### 3. Footer Persistent Form

#### **Trigger Testing**
- [ ] **Scroll Activation**
  - Scroll to 30% of page → Form should appear
  - Form slides up smoothly from bottom
  - Remains visible while scrolling

- [ ] **Dismissal Testing**
  - Click X button → Form hides and sets cookie
  - Refresh page → Form should not reappear
  - Cookie expires after 3 days

#### **Form Functionality**
- [ ] **Simplified Lead Scoring**
  - Enter name → Score appears (30 points)
  - Enter email → Score increases (40 points)
  - Professional email domain → Bonus points (+30)
  - Score bar updates with colors

- [ ] **Submission Flow**
  - Submit with valid data
  - Success message appears
  - Form auto-hides after 4 seconds
  - Dismissal cookie set

#### **Visual Testing**
- [ ] Teal gradient background displays correctly
- [ ] White text is readable over background
- [ ] Form inputs have proper contrast
- [ ] Mobile layout stacks vertically
- [ ] Privacy policy link works

---

## 🌐 Cross-Browser Testing

### Desktop Browsers
- [ ] **Chrome (Latest)**
  - All forms load and function correctly
  - Animations smooth
  - No console errors

- [ ] **Firefox (Latest)**
  - CORS requests work
  - Form submissions successful
  - Exit intent triggers properly

- [ ] **Safari (Latest)**
  - All styling displays correctly
  - JavaScript functions work
  - No webkit-specific issues

- [ ] **Edge (Latest)**
  - Form compatibility confirmed
  - All features functional

### Mobile Browsers
- [ ] **Safari iOS**
  - Forms responsive
  - No zoom on input focus
  - Touch targets adequate size

- [ ] **Chrome Android**
  - All functionality works
  - Performance acceptable
  - No Android-specific bugs

---

## 📱 Device Testing

### Mobile Devices
- [ ] **iPhone (375px - 414px)**
  - Portrait orientation
  - Forms fully functional
  - Exit intent works via scroll

- [ ] **Android (360px - 412px)**
  - All forms responsive
  - Performance good
  - No layout issues

### Tablet Devices
- [ ] **iPad (768px - 1024px)**
  - Forms display at appropriate sizes
  - Touch interactions work
  - Both portrait and landscape

---

## 🔗 Integration Testing

### Squarespace Integration
- [ ] **Inline Form (Code Block)**
  - Added to correct page location
  - Doesn't conflict with existing CSS
  - Maintains Squarespace styling

- [ ] **Popup & Footer (Code Injection)**
  - Added to Footer Code Injection
  - Loads after page content
  - Doesn't interfere with Squarespace functionality

### Third-Party Integrations
- [ ] **Google Analytics**
  - Conversion events fire correctly
  - Lead scores tracked as values
  - Events appear in GA4 real-time reports

- [ ] **Facebook Pixel** (if installed)
  - Lead events tracked
  - Custom parameters included
  - Events visible in Facebook Events Manager

---

## 📊 Data Flow Testing

### SendGrid Integration
- [ ] **Contact Creation**
  - Submit test form
  - Check SendGrid dashboard for new contact
  - Verify custom fields populated
  - Confirm list assignment based on lead score

### Airtable Integration
- [ ] **CRM Record Creation**
  - Submit form with various lead scores
  - Check Airtable for new records
  - Verify segmentation (HOT/WARM/COLD)
  - Confirm all fields mapped correctly

### Email Automation
- [ ] **Welcome Sequence**
  - Submit with different lead scores
  - Verify appropriate email sequence triggers
  - Check emails received in test inbox
  - Confirm personalization works

---

## ⚡ Performance Testing

### Page Load Impact
- [ ] **Before Integration**
  - Measure page load time
  - Check Lighthouse scores

- [ ] **After Integration**
  - Confirm no significant performance degradation
  - JavaScript loads asynchronously
  - Forms don't block page rendering

### Network Testing
- [ ] **Slow Connection**
  - Test on slow 3G simulation
  - Forms should still be functional
  - Appropriate loading states shown

- [ ] **Offline Handling**
  - Disconnect internet
  - Submit form → Should show network error
  - Reconnect → Form should work again

---

## 🔒 Security Testing

### Input Validation
- [ ] **XSS Prevention**
  - Try submitting `<script>alert('xss')</script>` in fields
  - Should be properly escaped/sanitized

- [ ] **SQL Injection** (if applicable)
  - Test malicious SQL in form fields
  - API should handle safely

### CORS Security
- [ ] **Unauthorized Origins**
  - Test API request from unauthorized domain
  - Should return CORS error

- [ ] **Proper Headers**
  - Check response includes security headers
  - CORS headers only for allowed origins

---

## 📈 Analytics & Tracking

### Event Tracking
- [ ] **Google Analytics 4**
  - Form view events
  - Form submission events
  - Conversion events with lead scores
  - A/B test variation tracking

- [ ] **Facebook Pixel**
  - Lead events firing
  - Custom parameters included
  - Value tracking for lead scores

### Debug Information
- [ ] **Console Logging**
  - Enable debug mode
  - Check console for detailed logs
  - Verify all events tracked properly

---

## ✅ Final Checklist

### Pre-Launch
- [ ] All API endpoints updated with production URLs
- [ ] CORS configured for production domains
- [ ] All test data cleared from systems
- [ ] Analytics tracking IDs updated for production
- [ ] Privacy policy links point to correct pages

### Post-Launch Monitoring
- [ ] Monitor API logs for errors
- [ ] Check form submission success rates
- [ ] Verify email sequences triggering
- [ ] Monitor analytics for conversion tracking
- [ ] Test forms weekly for continued functionality

---

## 🚨 Red Flags / Stop Deployment

**Do NOT deploy if any of these occur:**

- [ ] **CORS errors** from Squarespace domain
- [ ] **API returning 500 errors** on test submissions
- [ ] **JavaScript console errors** on form load
- [ ] **Forms not responsive** on mobile devices
- [ ] **SendGrid/Airtable integration failing**
- [ ] **Email sequences not triggering**
- [ ] **Analytics events not firing**

---

## 📞 Emergency Rollback Plan

If issues occur after deployment:

1. **Remove forms immediately**:
   - Delete Code Blocks (inline form)
   - Clear Footer Code Injection (popup/footer forms)

2. **Check API logs** for error patterns

3. **Verify integrations**:
   - SendGrid contact creation
   - Airtable record creation
   - Email sequence triggers

4. **Re-test in staging** before re-deployment

---

**Testing Complete?** ✅ All items checked = Ready for production deployment!