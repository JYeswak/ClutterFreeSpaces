#!/usr/bin/env node

/**
 * Referral Program Email Templates for ClutterFreeSpaces
 * Encouraging satisfied clients to refer other Montana RVers
 */

const referralEmailTemplates = {
  // Initial referral program introduction (sent with Day 30 check-in)
  referral_program_intro: {
    template_name: "Referral Program Introduction",
    subject: "Help a Fellow RVer & Save $30 Each! 🏔️",
    trigger: "Sent with 30-day check-in email or after positive review",
    html_content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Referral Program - ClutterFreeSpaces</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .referral-box { background: #fefce8; padding: 25px; border-radius: 12px; border-left: 4px solid #eab308; margin: 20px 0; text-align: center; }
        .savings-highlight { background: #ea580c; color: white; padding: 15px; border-radius: 8px; font-size: 18px; font-weight: bold; margin: 15px 0; }
        .how-it-works { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step { display: flex; align-items: center; margin: 15px 0; }
        .step-number { background: #0369a1; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Know Another RVer Who Could Use Help? 🚐</h1>
            <p>You both save money when you share the ClutterFreeSpaces experience!</p>
        </div>
        
        <div class="content">
            <p>Hi {{firstName}},</p>
            
            <p>Since you've experienced the transformation that comes with professional RV organization, I have a special request.</p>
            
            <div class="referral-box">
                <h2 style="color: #eab308; margin-top: 0;">🎯 Montana RVer Referral Program</h2>
                <div class="savings-highlight">
                    You Save $30 • They Save $30
                </div>
                <p><strong>When you refer another Montana RVer who books our service, you both get $30 off!</strong></p>
            </div>
            
            <div class="how-it-works">
                <h3 style="color: #0369a1; margin-top: 0;">How It Works:</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div>Tell your RV friends about ClutterFreeSpaces and mention they'll save $30</div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div>Have them mention your name when they book their consultation</div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div>They get $30 off their service, and you get a $30 credit for future services</div>
                </div>
            </div>
            
            <p><strong>Perfect Candidates for Referrals:</strong></p>
            <ul>
                <li>RV friends struggling with storage and organization</li>
                <li>New RV owners feeling overwhelmed by their space</li>
                <li>Fellow Montana RVers preparing for travel season</li>
                <li>Neighbors who've admired your newly organized RV</li>
            </ul>
            
            <p><strong>What to Tell Them:</strong></p>
            <p><em>"I just had ClutterFreeSpaces organize my RV, and it's been a game-changer! Chanel understands Montana RV life and created solutions that actually work on mountain roads. Plus, you'll save $30 when you mention my name!"</em></p>
            
            <div style="text-align: center; margin: 30px 0;">
                <p><strong>Your Referral Code: {{firstName}}30</strong></p>
                <p style="font-size: 16px; color: #64748b;">Have them call (406) 285-1525 and mention this code</p>
            </div>
            
            <p>Thanks for helping spread the word about organized RV living in Montana!</p>
            
            <p>Happy trails,<br>
            Chanel</p>
        </div>
        
        <div class="footer">
            <p><strong>ClutterFreeSpaces</strong><br>
            Montana's Premier RV & Home Organization<br>
            (406) 285-1525 | contact@clutter-free-spaces.com</p>
        </div>
    </div>
</body>
</html>`,
    plain_content: `Hi {{firstName}},

Since you've experienced the transformation that comes with professional RV organization, I have a special request.

MONTANA RVER REFERRAL PROGRAM
You Save $30 • They Save $30

When you refer another Montana RVer who books our service, you both get $30 off!

HOW IT WORKS:
1. Tell your RV friends about ClutterFreeSpaces 
2. Have them mention your name when they book
3. They get $30 off, you get $30 credit

PERFECT CANDIDATES:
- RV friends struggling with storage
- New RV owners feeling overwhelmed  
- Fellow Montana RVers preparing for travel season
- Neighbors who've admired your organized RV

WHAT TO TELL THEM:
"I just had ClutterFreeSpaces organize my RV, and it's been a game-changer! Chanel understands Montana RV life and created solutions that work on mountain roads. Plus, you'll save $30 when you mention my name!"

Your Referral Code: {{firstName}}30
Have them call (406) 285-1525 and mention this code.

Thanks for helping spread the word!

Chanel
ClutterFreeSpaces
(406) 285-1525 | contact@clutter-free-spaces.com`,
  },

  // Thank you email when someone makes a referral
  referral_thank_you: {
    template_name: "Referral Thank You",
    subject: "Thank you for your referral! Your $30 credit is ready ✨",
    trigger: "Sent when referred client books service",
    html_content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content=\"width=device-width, initial-scale=1.0\">
    <title>Referral Thank You - ClutterFreeSpaces</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .credit-box { background: #dcfce7; padding: 25px; border-radius: 12px; border-left: 4px solid #16a34a; margin: 20px 0; text-align: center; }
        .credit-amount { background: #16a34a; color: white; padding: 15px; border-radius: 8px; font-size: 20px; font-weight: bold; margin: 10px 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You, {{firstName}}! 🙏</h1>
            <p>Your referral just made another RVer's life easier</p>
        </div>
        
        <div class="content">
            <p>Fantastic news! {{referredName}} just booked their RV organization service, and they mentioned your name.</p>
            
            <div class="credit-box">
                <h2 style="color: #16a34a; margin-top: 0;">Your Referral Credit is Ready!</h2>
                <div class="credit-amount">$30 Credit Applied</div>
                <p>This credit has been added to your account and can be used toward:</p>
                <ul style="text-align: left;">
                    <li>Future RV organization maintenance sessions</li>
                    <li>Seasonal organization tune-ups</li>
                    <li>Additional storage optimization</li>
                    <li>Home organization services</li>
                </ul>
            </div>
            
            <p><strong>What happens next:</strong></p>
            <p>I'll be working with {{referredName}} to transform their RV space just like we did with yours. They're going to love the difference proper organization makes!</p>
            
            <p><strong>Keep referring!</strong> There's no limit to how many referral credits you can earn. Every Montana RVer deserves to experience the peace of mind that comes with a well-organized space.</p>
            
            <p>Thank you for trusting us enough to recommend ClutterFreeSpaces to your friends. Word-of-mouth referrals from satisfied clients like you are the highest compliment we can receive.</p>
            
            <p>Happy travels,<br>
            Chanel</p>
            
            <p><em>P.S. Your referral credit never expires, so use it whenever you're ready!</em></p>
        </div>
        
        <div class="footer">
            <p><strong>ClutterFreeSpaces</strong><br>
            Montana's Premier RV & Home Organization<br>
            (406) 285-1525 | contact@clutter-free-spaces.com</p>
        </div>
    </div>
</body>
</html>`,
    plain_content: `Hi {{firstName}},

Fantastic news! {{referredName}} just booked their RV organization service and mentioned your name.

YOUR REFERRAL CREDIT IS READY!
$30 Credit Applied to Your Account

This credit can be used toward:
- Future RV organization maintenance sessions
- Seasonal organization tune-ups  
- Additional storage optimization
- Home organization services

WHAT HAPPENS NEXT:
I'll be working with {{referredName}} to transform their RV space just like we did with yours.

KEEP REFERRING! 
No limit to referral credits you can earn. Every Montana RVer deserves organized peace of mind.

Thank you for trusting us enough to recommend ClutterFreeSpaces!

Happy travels,
Chanel

P.S. Your referral credit never expires!

ClutterFreeSpaces
(406) 285-1525 | contact@clutter-free-spaces.com`,
  },

  // Welcome email for referred clients
  referred_client_welcome: {
    template_name: "Referred Client Welcome",
    subject:
      "Welcome! Your $30 discount is confirmed (thanks to {{referrerName}}!) 🎉",
    trigger: "Sent when referred client books consultation",
    html_content: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome - ClutterFreeSpaces</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .discount-box { background: #fef3c7; padding: 25px; border-radius: 12px; border-left: 4px solid #f59e0b; margin: 20px 0; text-align: center; }
        .discount-amount { background: #f59e0b; color: white; padding: 15px; border-radius: 8px; font-size: 18px; font-weight: bold; margin: 10px 0; }
        .what-to-expect { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to ClutterFreeSpaces! 🏔️</h1>
            <p>We're excited to help transform your RV organization</p>
        </div>
        
        <div class="content">
            <p>Hi {{firstName}},</p>
            
            <p>Thank you so much for scheduling your RV organization consultation! {{referrerName}} has excellent taste in referring you to us - they know firsthand how much professional organization can improve the RV experience.</p>
            
            <div class="discount-box">
                <h2 style="color: #f59e0b; margin-top: 0;">Your Friend Referral Discount</h2>
                <div class="discount-amount">$30 Off Applied!</div>
                <p>Thanks to {{referrerName}}'s referral, your service is automatically discounted by $30</p>
            </div>
            
            <div class="what-to-expect">
                <h3 style="color: #0369a1; margin-top: 0;">What to Expect at Your Consultation:</h3>
                <ul>
                    <li><strong>RV Space Assessment:</strong> I'll evaluate your current organization and storage challenges</li>
                    <li><strong>Montana-Specific Solutions:</strong> Strategies designed for our climate and terrain</li>
                    <li><strong>Custom Organization Plan:</strong> Tailored to your RV model and travel style</li>
                    <li><strong>Product Recommendations:</strong> Specific storage solutions that work in RVs</li>
                    <li><strong>Timeline & Investment:</strong> Clear expectations for the transformation process</li>
                </ul>
            </div>
            
            <p><strong>A Few Questions to Consider Before We Meet:</strong></p>
            <ul>
                <li>What's your biggest RV organization frustration right now?</li>
                <li>How do you typically use your RV (weekend trips, extended travel, full-time living)?</li>
                <li>What areas of your RV feel most chaotic or stressful?</li>
                <li>Do you have any specific Montana adventures planned that we should organize for?</li>
            </ul>
            
            <p><strong>Your Consultation Details:</strong><br>
            Date: [SCHEDULED_DATE]<br>
            Time: [SCHEDULED_TIME]<br>
            Location: [RV_LOCATION]<br>
            Duration: 60-90 minutes</p>
            
            <p>I'm looking forward to meeting you and seeing how we can make your RV life more organized and enjoyable!</p>
            
            <p>Feel free to call or text with any questions before our appointment.</p>
            
            <p>Best regards,<br>
            Chanel</p>
            
            <p><em>P.S. Don't forget to thank {{referrerName}} for the great referral - they just saved you $30!</em></p>
        </div>
        
        <div class="footer">
            <p><strong>ClutterFreeSpaces</strong><br>
            Montana's Premier RV & Home Organization<br>
            (406) 285-1525 | contact@clutter-free-spaces.com</p>
        </div>
    </div>
</body>
</html>`,
    plain_content: `Hi {{firstName}},

Thank you for scheduling your RV organization consultation! {{referrerName}} has excellent taste - they know how much professional organization improves RV life.

YOUR FRIEND REFERRAL DISCOUNT: $30 OFF APPLIED!
Thanks to {{referrerName}}'s referral, your service is automatically discounted.

WHAT TO EXPECT AT YOUR CONSULTATION:
- RV Space Assessment of current challenges
- Montana-Specific Solutions for our climate/terrain  
- Custom Organization Plan for your RV model
- Product Recommendations that work in RVs
- Clear Timeline & Investment expectations

QUESTIONS TO CONSIDER:
- What's your biggest RV organization frustration?
- How do you use your RV? (weekend/extended/full-time)
- What areas feel most chaotic?
- Any specific Montana adventures planned?

YOUR CONSULTATION DETAILS:
Date: [SCHEDULED_DATE]
Time: [SCHEDULED_TIME] 
Location: [RV_LOCATION]
Duration: 60-90 minutes

Looking forward to meeting you and transforming your RV organization!

Best regards,
Chanel

P.S. Don't forget to thank {{referrerName}} for saving you $30!

ClutterFreeSpaces
(406) 285-1525 | contact@clutter-free-spaces.com`,
  },
};

// Airtable fields needed for referral tracking
const referralAirtableFields = {
  required_fields: [
    "Referred By (Text)", // Name of person who made referral
    "Referral Code (Text)", // e.g., "Sarah30"
    "Referral Status (Single select)", // Options: Pending, Credited, Used
    "Referral Credit Amount (Number)", // Dollar amount of credit
    "Referral Date (Date)", // When referral was made
    "Credit Used Date (Date)", // When credit was applied
    "Referrer Email (Email)", // To send thank you emails
  ],
  single_select_options: {
    "Referral Status": ["Pending", "Credited", "Used", "Expired"],
  },
};

// Referral program configuration
const referralProgramConfig = {
  referral_discount: 30, // Dollar amount off for both parties
  credit_expiration_days: 365, // Credits valid for 1 year
  max_referrals_per_customer: null, // No limit
  referral_codes_format: "firstName30", // e.g., "Sarah30"

  tracking_fields: {
    referrer_name: "",
    referrer_email: "",
    referred_name: "",
    referred_email: "",
    referral_date: "",
    booking_date: "",
    service_completed: false,
    credit_issued: false,
    credit_used: false,
  },
};

// Referral email automation workflow
const referralWorkflow = {
  step_1: {
    trigger: "30 days after service OR after positive review",
    action: "Send referral program introduction email",
    template: "referral_program_intro",
  },

  step_2: {
    trigger: "When referred client mentions referrer name and books",
    action:
      "Send thank you email to referrer + welcome email to referred client",
    templates: ["referral_thank_you", "referred_client_welcome"],
    airtable_update: "Add referral credit to referrer account",
  },

  step_3: {
    trigger: "When referrer uses credit for future service",
    action: "Apply credit and update tracking",
    airtable_update: "Mark credit as used",
  },

  step_4: {
    trigger: "Quarterly",
    action: "Send referral program reminder to eligible clients",
    filter: "Clients who haven't referred in 90+ days",
  },
};

module.exports = {
  referralEmailTemplates,
  referralAirtableFields,
  referralProgramConfig,
  referralWorkflow,
};

/**
 * Implementation Guide:
 *
 * 1. Add referral tracking fields to Airtable "Leads" table
 * 2. Deploy referral email templates to SendGrid
 * 3. Update booking process to capture referral codes
 * 4. Set up automation to send referral emails
 * 5. Create system to track and apply referral credits
 * 6. Train staff on referral program process
 *
 * Success Metrics:
 * - Referral conversion rate (referrals → bookings)
 * - Average referrals per satisfied customer
 * - Revenue generated from referral program
 * - Customer lifetime value increase from referrals
 */
