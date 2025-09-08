#!/usr/bin/env python3
"""
ClutterFreeSpaces Campaign Management System
Manages outreach campaigns, email scheduling, and follow-ups

Usage:
    python3 campaign_manager.py --create --type=home_organization
    python3 campaign_manager.py --send --campaign-id=1 --limit=20
    python3 campaign_manager.py --status --campaign-id=1
"""

import argparse
import json
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path
import time
import random

try:
    import sendgrid
    from sendgrid.helpers.mail import Mail, Email, To, Content

    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False
    # Fallback to SMTP
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

from outreach.config.settings import (
    SENDGRID_API_KEY,
    SMTP_SERVER,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    FROM_EMAIL,
    FROM_NAME,
    DAILY_OUTREACH_LIMIT,
    CAMPAIGN_DEFAULTS,
    logger,
)
from outreach.lib.database import db


class CampaignManager:
    """Manages outreach campaigns and email sending"""

    def __init__(self):
        self.logger = logger
        self.sent_today = 0
        self.daily_limit = DAILY_OUTREACH_LIMIT

    def create_campaign(self, campaign_data: Dict) -> int:
        """Create a new outreach campaign"""
        # Set default values
        defaults = CAMPAIGN_DEFAULTS.copy()
        defaults.update(campaign_data)

        # Validate required fields
        required_fields = ["name", "campaign_type"]
        for field in required_fields:
            if field not in defaults:
                raise ValueError(f"Required field missing: {field}")

        # Create campaign in database
        campaign_id = db.create_campaign(defaults)
        if campaign_id:
            self.logger.info(
                f"Created campaign: {defaults['name']} (ID: {campaign_id})"
            )
            return campaign_id
        else:
            raise Exception("Failed to create campaign in database")

    def get_campaign_targets(self, campaign_id: int) -> List[Dict]:
        """Get target contacts for a campaign based on campaign type"""
        campaign = db.get_campaign(campaign_id)
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")

        campaign_type = campaign["campaign_type"]

        # Define business types for each campaign
        business_type_mapping = {
            "home_organization": [
                "cleaning_company",
                "real_estate_agent",
                "property_management",
                "moving_company",
                "storage_facility",
                "home_staging",
                "senior_living",
                "interior_designer",
            ],
            "rv_organization": [
                "rv_dealer",
                "rv_park",
                "rv_service",
                "rv_rental",
                "outdoor_store",
                "travel_agency",
                "rv_club",
            ],
        }

        target_business_types = business_type_mapping.get(campaign_type, [])

        if not target_business_types:
            self.logger.warning(
                f"No business types defined for campaign type: {campaign_type}"
            )
            return []

        # Get businesses and contacts that haven't been contacted in this campaign
        query = """
        SELECT 
            b.id as business_id,
            b.name as business_name,
            b.city,
            b.state,
            b.partnership_potential,
            bt.type_name as business_type,
            bt.commission_rate,
            bc.id as contact_id,
            bc.first_name,
            bc.last_name,
            bc.email,
            bc.title,
            bc.decision_maker
        FROM businesses b
        JOIN business_types bt ON b.business_type_id = bt.id
        LEFT JOIN business_contacts bc ON b.id = bc.business_id
        WHERE bt.type_name IN ({})
            AND b.status NOT IN ('partner', 'closed')
            AND (bc.email IS NOT NULL AND bc.email != '')
            AND NOT EXISTS (
                SELECT 1 FROM outreach_activities oa 
                WHERE oa.campaign_id = ? 
                AND oa.business_id = b.id
            )
        ORDER BY b.partnership_potential DESC, bt.priority_score DESC, bc.decision_maker DESC
        """.format(
            ",".join("?" * len(target_business_types))
        )

        params = tuple(target_business_types) + (campaign_id,)
        return [dict(row) for row in db.execute_query(query, params)]

    def schedule_outreach_activities(self, campaign_id: int, limit: int = None) -> int:
        """Schedule outreach activities for a campaign"""
        targets = self.get_campaign_targets(campaign_id)

        if not targets:
            self.logger.info(f"No targets found for campaign {campaign_id}")
            return 0

        if limit:
            targets = targets[:limit]

        scheduled_count = 0

        for target in targets:
            # Skip if no contact information
            if not target["contact_id"] or not target["email"]:
                continue

            # Select appropriate email template based on business type
            template_info = self._select_email_template(target["business_type"])

            # Create outreach activity
            activity_data = {
                "campaign_id": campaign_id,
                "contact_id": target["contact_id"],
                "business_id": target["business_id"],
                "activity_type": "email",
                "subject": template_info["subject"],
                "content": template_info["body"],
                "scheduled_at": datetime.now().isoformat(),
                "status": "scheduled",
                "follow_up_needed": True,
                "follow_up_date": (datetime.now() + timedelta(days=5))
                .date()
                .isoformat(),
                "follow_up_type": "email",
            }

            activity_id = db.log_outreach_activity(activity_data)
            if activity_id:
                scheduled_count += 1
                self.logger.info(
                    f"Scheduled outreach to {target['business_name']} "
                    f"({target['first_name']} {target['last_name']})"
                )

        return scheduled_count

    def _select_email_template(self, business_type: str) -> Dict[str, str]:
        """Select appropriate email template for business type"""

        # Template mapping for different business types
        home_templates = {
            "cleaning_company": {
                "subject": "Partnership Opportunity: Add $2,000+ Monthly Revenue",
                "template_path": "home_campaign/cleaning_company.html",
            },
            "real_estate_agent": {
                "subject": "Help Your Listings Sell 23% Faster with Professional Organization",
                "template_path": "home_campaign/real_estate.html",
            },
            "moving_company": {
                "subject": "Reduce Customer Complaints by 40% with Pre-Move Organization",
                "template_path": "home_campaign/moving_company.html",
            },
            "storage_facility": {
                "subject": "Help Your Customers Downsize BEFORE They Rent Storage",
                "template_path": "home_campaign/storage_facility.html",
            },
        }

        rv_templates = {
            "rv_dealer": {
                "subject": "Partnership Opportunity: Montana's Only RV Organization Service",
                "template_path": "rv_campaign/rv_dealer.html",
            },
            "rv_park": {
                "subject": "Help Your Guests Enjoy Their Stay More with RV Organization",
                "template_path": "rv_campaign/rv_park.html",
            },
            "rv_service": {
                "subject": "Add $2,000+ Monthly Revenue with RV Organization Services",
                "template_path": "rv_campaign/rv_service.html",
            },
        }

        # Combine templates
        all_templates = {**home_templates, **rv_templates}

        # Get template for business type or use generic
        template_info = all_templates.get(
            business_type,
            {
                "subject": "Partnership Opportunity with ClutterFreeSpaces",
                "template_path": "generic/partnership.html",
            },
        )

        # Load template content (simplified version for now)
        body = self._load_template_content(
            template_info["template_path"], business_type
        )

        return {"subject": template_info["subject"], "body": body}

    def _load_template_content(self, template_path: str, business_type: str) -> str:
        """Load email template content (simplified version)"""
        # For now, return a basic template
        # In production, this would load from template files

        base_templates = {
            "cleaning_company": """
Hi [CONTACT_NAME],

I hope this message finds you well! I'm Chanel, owner of ClutterFreeSpaces, Montana's premier professional organizing service.

I'm reaching out because I believe we can create a powerful partnership that benefits both our businesses and, more importantly, our clients.

Many of your cleaning clients struggle with clutter before you arrive, making your job harder and less effective. They love the clean space you provide, but within days, the clutter returns because there's no organizational system in place.

Our partnership could offer:
✅ Pre-Cleaning Organization - We organize spaces before your team cleans
✅ Higher Customer Satisfaction - Clients see dramatic, lasting transformations  
✅ Additional Revenue Stream - 20% commission on every referral
✅ Premium Service Positioning - Offer something no other Montana cleaning company provides

I'd love to discuss how this partnership could work specifically for [BUSINESS_NAME].

Would you be open to a quick 15-minute call this week?

Best regards,
Chanel
ClutterFreeSpaces
(406) 285-1525
""",
            "rv_dealer": """
Hi [CONTACT_NAME],

I'm Chanel from ClutterFreeSpaces, Montana's only professional organizing service specializing in RV organization.

Montana has over 45,000 registered RVs, yet most new RV owners feel overwhelmed when they receive their RV. We can help [BUSINESS_NAME] offer a unique customer service that no other Montana RV dealer provides.

What ClutterFreeSpaces offers your customers:
✅ Professional RV organization setup before customer pickup  
✅ Montana-specific expertise (weight limits, weather, remote travel)
✅ 30-day follow-up support included
✅ Customer education on RV organization best practices

Benefits for [BUSINESS_NAME]:
🎯 Customer Differentiation - Only Montana dealer offering this service
🎯 Enhanced Customer Satisfaction - Organized RV delivery creates wow factor
🎯 Additional Revenue - 20% commission opportunity

Would you be available for a 15-minute call this week to explore this opportunity?

Best regards,
Chanel
ClutterFreeSpaces - Montana's RV Organization Specialists
(406) 285-1525
""",
        }

        # Return appropriate template or generic one
        return base_templates.get(
            business_type, base_templates.get("cleaning_company", "")
        )

    def send_pending_outreach(self, limit: int = None) -> int:
        """Send pending outreach emails"""
        if limit is None:
            limit = self.daily_limit

        # Get pending outreach activities
        pending_activities = db.get_pending_outreach(limit)

        if not pending_activities:
            self.logger.info("No pending outreach activities found")
            return 0

        sent_count = 0

        for activity in pending_activities:
            try:
                # Send email
                success = self._send_email(
                    to_email=activity["email"],
                    to_name=f"{activity['first_name']} {activity['last_name']}",
                    subject=activity["subject"],
                    body=activity["content"],
                    business_name=activity["business_name"],
                )

                if success:
                    # Update activity status
                    db.update_activity_status(
                        activity["id"], "sent", sent_at=datetime.now().isoformat()
                    )

                    sent_count += 1
                    self.logger.info(
                        f"Sent email to {activity['email']} - {activity['business_name']}"
                    )

                    # Add delay between emails
                    time.sleep(random.uniform(1, 3))

                else:
                    # Mark as failed
                    db.update_activity_status(
                        activity["id"], "failed", error_message="Failed to send email"
                    )

            except Exception as e:
                self.logger.error(f"Error sending email to {activity['email']}: {e}")
                db.update_activity_status(
                    activity["id"], "failed", error_message=str(e)
                )

        return sent_count

    def _send_email(
        self, to_email: str, to_name: str, subject: str, body: str, business_name: str
    ) -> bool:
        """Send individual email using SendGrid (preferred) or SMTP fallback"""

        # Personalize the email content
        personalized_body = body.replace("[CONTACT_NAME]", to_name.split()[0])
        personalized_body = personalized_body.replace("[BUSINESS_NAME]", business_name)

        # Try SendGrid first
        if SENDGRID_AVAILABLE and SENDGRID_API_KEY:
            return self._send_email_sendgrid(
                to_email, to_name, subject, personalized_body, business_name
            )
        else:
            # Fallback to SMTP
            return self._send_email_smtp(to_email, to_name, subject, personalized_body)

    def _convert_to_html(self, plain_text: str, business_name: str = None) -> str:
        """Convert plain text email to HTML format with professional styling"""
        import re

        # Escape HTML characters
        html_text = (
            plain_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        )

        # Convert line breaks to HTML
        html_text = html_text.replace("\n\n", "</p><p>").replace("\n", "<br>")

        # Wrap in paragraphs
        html_text = f"<p>{html_text}</p>"

        # Convert bullet points (lines starting with • or ✅)
        html_text = re.sub(r"<p>([•✅].*?)</p>", r"<ul><li>\1</li></ul>", html_text)
        html_text = re.sub(r"</ul><br><ul>", "", html_text)  # Merge consecutive lists

        # Convert email addresses to mailto links
        html_text = re.sub(
            r"([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})",
            r'<a href="mailto:\1">\1</a>',
            html_text,
        )

        # Convert phone numbers to tel links
        html_text = re.sub(
            r"\(?(\d{3})\)?[-. ]?(\d{3})[-. ]?(\d{4})",
            r'<a href="tel:\1\2\3">(\1) \2-\3</a>',
            html_text,
        )

        # Convert website URLs to clickable links with UTM tracking
        def add_utm_params(match):
            url = match.group(1)
            separator = "&" if "?" in url else "?"
            utm_params = (
                f"utm_source=clutterfreespaces_outreach&"
                f"utm_medium=email&utm_campaign=b2b_outreach&"
                f"utm_term={business_name.replace(' ', '_').lower() if business_name else 'unknown'}&"
                f"utm_content=initial_outreach"
            )
            tracked_url = f"{url}{separator}{utm_params}"
            return f'<a href="{tracked_url}" target="_blank">{url}</a>'

        html_text = re.sub(r'(https?://[^\s<>"]+)', add_utm_params, html_text)

        # Create professional HTML email template
        html_template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Partnership Opportunity - ClutterFreeSpaces</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }}
        .email-container {{
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4CAF50;
        }}
        .logo {{
            color: #4CAF50;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }}
        .tagline {{
            color: #666;
            font-size: 14px;
        }}
        .content p {{
            margin-bottom: 15px;
        }}
        .content ul {{
            margin: 15px 0;
            padding-left: 20px;
        }}
        .content li {{
            margin-bottom: 8px;
            list-style-type: none;
            position: relative;
        }}
        .content li:before {{
            content: "✓";
            color: #4CAF50;
            position: absolute;
            left: -20px;
            font-weight: bold;
        }}
        .footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
        }}
        .contact-info {{
            margin: 20px 0;
        }}
        .contact-info a {{
            color: #4CAF50;
            text-decoration: none;
        }}
        .unsubscribe {{
            margin-top: 20px;
        }}
        .unsubscribe a {{
            color: #999;
            font-size: 11px;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">ClutterFreeSpaces</div>
            <div class="tagline">Montana's Professional Organization Specialists</div>
        </div>
        
        <div class="content">
            {html_text}
        </div>
        
        <div class="contact-info">
            <p><strong>Chanel Basolo</strong><br>
            Professional Organizer & Owner<br>
            <a href="tel:4062851525">(406) 285-1525</a><br>
            <a href="mailto:contact@clutter-free-spaces.com">contact@clutter-free-spaces.com</a><br>
            <a href="https://www.clutter-free-spaces.com" target="_blank">www.clutter-free-spaces.com</a></p>
        </div>
        
        <div class="footer">
            <p>This email was sent to explore a potential business partnership opportunity.</p>
            <div class="unsubscribe">
                [%unsubscribe%]
            </div>
        </div>
    </div>
    
    <!-- Tracking pixel -->
    [%open_tracking%]
</body>
</html>
        """

        return html_template

    def _send_email_sendgrid(
        self,
        to_email: str,
        to_name: str,
        subject: str,
        body: str,
        business_name: str = None,
    ) -> bool:
        """Send email via SendGrid API with basic tracking"""
        try:
            sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)

            # Create email components
            from_email = Email(FROM_EMAIL, FROM_NAME)
            to_email_obj = To(to_email, to_name)

            # Create plain text content
            plain_content = Content("text/plain", body)

            # Create HTML content
            html_body = self._convert_to_html(body, business_name)
            html_content = Content("text/html", html_body)

            # Create mail object
            mail = Mail(from_email, to_email_obj, subject, plain_content)
            mail.add_content(html_content)

            # Add basic tracking
            try:
                from sendgrid.helpers.mail import (
                    TrackingSettings,
                    ClickTracking,
                    OpenTracking,
                )

                tracking_settings = TrackingSettings()

                # Enable click tracking
                click_tracking = ClickTracking()
                click_tracking.enable = True
                tracking_settings.click_tracking = click_tracking

                # Enable open tracking
                open_tracking = OpenTracking()
                open_tracking.enable = True
                tracking_settings.open_tracking = open_tracking

                mail.tracking_settings = tracking_settings
            except ImportError:
                # Skip tracking if not available
                pass

            # Set reply-to email
            mail.reply_to = Email(
                "hello@clutter-free-spaces.com", "Chanel - ClutterFreeSpaces"
            )

            # Send email
            response = sg.send(mail)

            if response.status_code in [200, 201, 202]:
                self.logger.info(
                    f"SendGrid email sent successfully to {to_email} "
                    f"(Business: {business_name or 'Unknown'}) - "
                    f"Status: {response.status_code}"
                )
                return True
            else:
                error_body = (
                    response.body.decode("utf-8")
                    if hasattr(response.body, "decode")
                    else str(response.body)
                )
                self.logger.error(
                    f"SendGrid error {response.status_code}: {error_body}"
                )
                return False

        except Exception as e:
            self.logger.error(f"SendGrid failed to send email to {to_email}: {e}")
            return False

    def _send_email_smtp(
        self, to_email: str, to_name: str, subject: str, body: str
    ) -> bool:
        """Send email via SMTP (fallback method)"""
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
            msg["To"] = f"{to_name} <{to_email}>"
            msg["Subject"] = subject

            # Create text part
            text_part = MIMEText(body, "plain")
            msg.attach(text_part)

            # Connect to SMTP server and send
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)

            self.logger.info(f"SMTP email sent successfully to {to_email}")
            return True

        except Exception as e:
            self.logger.error(f"SMTP failed to send email to {to_email}: {e}")
            return False

    def get_campaign_performance(self, campaign_id: int) -> Dict:
        """Get performance metrics for a campaign"""
        campaign = db.get_campaign(campaign_id)
        if not campaign:
            return {}

        stats = db.get_campaign_stats(campaign_id)

        # Get additional metrics
        query = """
        SELECT 
            COUNT(DISTINCT b.id) as unique_businesses_contacted,
            COUNT(DISTINCT CASE WHEN oa.replied_at IS NOT NULL THEN b.id END) as businesses_replied,
            AVG(b.partnership_potential) as avg_partnership_potential
        FROM outreach_activities oa
        JOIN businesses b ON oa.business_id = b.id
        WHERE oa.campaign_id = ?
        """

        additional_stats = db.execute_query(query, (campaign_id,))
        if additional_stats:
            stats.update(dict(additional_stats[0]))

        # Calculate additional metrics
        if stats.get("unique_businesses_contacted", 0) > 0:
            stats["business_reply_rate"] = round(
                (
                    stats.get("businesses_replied", 0)
                    / stats["unique_businesses_contacted"]
                )
                * 100,
                2,
            )
        else:
            stats["business_reply_rate"] = 0

        return {"campaign": campaign, "stats": stats}

    def schedule_follow_ups(self, campaign_id: int) -> int:
        """Schedule follow-up emails for a campaign"""
        # Get activities that need follow-ups
        query = """
        SELECT oa.*, bc.email, bc.first_name, bc.last_name, b.name as business_name
        FROM outreach_activities oa
        JOIN business_contacts bc ON oa.contact_id = bc.id
        JOIN businesses b ON oa.business_id = b.id
        WHERE oa.campaign_id = ?
            AND oa.follow_up_needed = 1
            AND oa.follow_up_date <= date('now')
            AND oa.status = 'sent'
            AND oa.replied_at IS NULL
        """

        activities_needing_followup = db.execute_query(query, (campaign_id,))

        scheduled_count = 0

        for activity in activities_needing_followup:
            # Determine follow-up sequence number
            existing_followups = db.execute_query(
                """
                SELECT COUNT(*) as count FROM outreach_activities 
                WHERE campaign_id = ? AND business_id = ? AND activity_type = 'email'
                """,
                (campaign_id, activity["business_id"]),
            )

            followup_number = (
                existing_followups[0]["count"] if existing_followups else 1
            )

            # Don't send more than 3 follow-ups
            if followup_number > 3:
                continue

            # Get follow-up template
            followup_template = self._get_followup_template(followup_number)

            # Schedule follow-up activity
            followup_data = {
                "campaign_id": campaign_id,
                "contact_id": activity["contact_id"],
                "business_id": activity["business_id"],
                "activity_type": "email",
                "subject": followup_template["subject"],
                "content": followup_template["body"],
                "scheduled_at": datetime.now().isoformat(),
                "status": "scheduled",
                "follow_up_needed": followup_number < 3,
                "follow_up_date": (datetime.now() + timedelta(days=7))
                .date()
                .isoformat()
                if followup_number < 3
                else None,
                "follow_up_type": "email" if followup_number < 3 else None,
            }

            if db.log_outreach_activity(followup_data):
                scheduled_count += 1

                # Mark original activity as follow-up scheduled
                db.update_activity_status(
                    activity["id"], "sent", follow_up_needed=False
                )

        return scheduled_count

    def _get_followup_template(self, followup_number: int) -> Dict[str, str]:
        """Get follow-up email template"""

        templates = {
            2: {
                "subject": "Quick Question About [BUSINESS_NAME]'s Growth Goals",
                "body": """Hi [CONTACT_NAME],

I sent you a note earlier this week about a partnership opportunity between [BUSINESS_NAME] and ClutterFreeSpaces.

I wanted to follow up with a quick question:

What's your biggest challenge right now when it comes to customer satisfaction and retention?

I ask because that's exactly where our partnership could have the biggest impact for [BUSINESS_NAME].

Just 15 minutes on the phone would let me show you exactly how this partnership is working for other Montana businesses in your industry.

What does your schedule look like for a brief call this week?

Best regards,
Chanel
(406) 285-1525""",
            },
            3: {
                "subject": "Final Note - Partnership Opportunity",
                "body": """Hi [CONTACT_NAME],

I've reached out a couple of times about a partnership opportunity between ClutterFreeSpaces and [BUSINESS_NAME], but I understand you're busy running your business.

This will be my final email on this topic - I don't want to be pushy!

My offer stands: If you ever want to explore how professional organizing services could benefit [BUSINESS_NAME], I'm here for a no-pressure conversation.

Either way, I wish you continued success with [BUSINESS_NAME].

Best regards,
Chanel
ClutterFreeSpaces
(406) 285-1525

P.S. - If circumstances change or you think of questions down the road, don't hesitate to reach out.""",
            },
        }

        return templates.get(followup_number, templates[2])

    def test_sendgrid_email(self, to_email: str = "josh@elektrafi.net") -> bool:
        """Test SendGrid email functionality with a simple test email"""
        test_subject = "ClutterFreeSpaces SendGrid Test Email"
        test_body = """Hello!

This is a test email from the ClutterFreeSpaces outreach system to verify that our enhanced SendGrid integration is working properly.

Features being tested:
✅ Plain text and HTML content
✅ Professional email styling  
✅ Click and open tracking
✅ Custom arguments for analytics
✅ Unsubscribe handling
✅ UTM parameter tracking on links

If you receive this email, our SendGrid integration is working correctly!

Visit our website: https://www.clutter-free-spaces.com

Best regards,
ClutterFreeSpaces System Test"""

        try:
            success = self._send_email_sendgrid(
                to_email=to_email,
                to_name="Test Recipient",
                subject=test_subject,
                body=test_body,
                business_name="Test Business",
            )
        except Exception as e:
            self.logger.error(f"Exception in test_sendgrid_email: {e}")
            success = False

        if success:
            self.logger.info(f"✅ SendGrid test email sent successfully to {to_email}")
        else:
            self.logger.error(f"❌ SendGrid test email failed to send to {to_email}")

        return success


def main():
    """Main function for command-line usage"""
    parser = argparse.ArgumentParser(description="Manage outreach campaigns")

    # Campaign operations
    parser.add_argument("--create", action="store_true", help="Create a new campaign")
    parser.add_argument(
        "--type", choices=["home_organization", "rv_organization"], help="Campaign type"
    )
    parser.add_argument("--name", help="Campaign name")
    parser.add_argument("--description", help="Campaign description")

    # Scheduling operations
    parser.add_argument(
        "--schedule", action="store_true", help="Schedule outreach activities"
    )
    parser.add_argument("--campaign-id", type=int, help="Campaign ID")
    parser.add_argument("--limit", type=int, help="Limit number of activities")

    # Sending operations
    parser.add_argument(
        "--send", action="store_true", help="Send pending outreach emails"
    )

    # Follow-up operations
    parser.add_argument(
        "--follow-ups", action="store_true", help="Schedule follow-up emails"
    )

    # Status operations
    parser.add_argument("--status", action="store_true", help="Show campaign status")
    parser.add_argument(
        "--list-campaigns", action="store_true", help="List all campaigns"
    )

    # Testing operations
    parser.add_argument(
        "--test-sendgrid", action="store_true", help="Test SendGrid email functionality"
    )
    parser.add_argument(
        "--test-email",
        type=str,
        default="josh@elektrafi.net",
        help="Email address for testing",
    )

    args = parser.parse_args()

    manager = CampaignManager()

    try:
        if args.create:
            if not args.type or not args.name:
                parser.error("--create requires --type and --name")

            campaign_data = {
                "name": args.name,
                "campaign_type": args.type,
                "description": args.description
                or f"{args.type.replace('_', ' ').title()} Campaign",
                "status": "active",
                "start_date": datetime.now().date().isoformat(),
            }

            campaign_id = manager.create_campaign(campaign_data)
            print(f"✅ Created campaign: {args.name} (ID: {campaign_id})")

        elif args.schedule:
            if not args.campaign_id:
                parser.error("--schedule requires --campaign-id")

            scheduled_count = manager.schedule_outreach_activities(
                args.campaign_id, args.limit
            )
            print(f"✅ Scheduled {scheduled_count} outreach activities")

        elif args.send:
            sent_count = manager.send_pending_outreach(args.limit)
            print(f"✅ Sent {sent_count} outreach emails")

        elif args.follow_ups:
            if not args.campaign_id:
                parser.error("--follow-ups requires --campaign-id")

            followup_count = manager.schedule_follow_ups(args.campaign_id)
            print(f"✅ Scheduled {followup_count} follow-up emails")

        elif args.status:
            if not args.campaign_id:
                parser.error("--status requires --campaign-id")

            performance = manager.get_campaign_performance(args.campaign_id)
            campaign = performance["campaign"]
            stats = performance["stats"]

            print(f"\n📊 Campaign Performance: {campaign['name']}")
            print(f"   Type: {campaign['campaign_type']}")
            print(f"   Status: {campaign['status']}")
            print(f"   Created: {campaign['created_at']}")
            print(f"\n📈 Statistics:")
            print(f"   Total Activities: {stats.get('total_activities', 0)}")
            print(f"   Emails Sent: {stats.get('sent_count', 0)}")
            print(
                f"   Emails Opened: {stats.get('opened_count', 0)} ({stats.get('open_rate', 0)}%)"
            )
            print(
                f"   Replies Received: {stats.get('replied_count', 0)} ({stats.get('reply_rate', 0)}%)"
            )
            print(
                f"   Unique Businesses Contacted: {stats.get('unique_businesses_contacted', 0)}"
            )
            print(f"   Business Reply Rate: {stats.get('business_reply_rate', 0)}%")

        elif args.list_campaigns:
            campaigns = db.get_active_campaigns()
            print(f"\n📋 Active Campaigns:")
            for campaign in campaigns:
                print(
                    f"   {campaign['id']}. {campaign['name']} ({campaign['campaign_type']})"
                )
                print(
                    f"      Status: {campaign['status']}, Created: {campaign['created_at']}"
                )

        elif args.test_sendgrid:
            print(f"\n🧪 Testing SendGrid email functionality...")
            print(f"📧 Sending test email to: {args.test_email}")
            success = manager.test_sendgrid_email(args.test_email)
            if success:
                print("✅ SendGrid test completed successfully!")
                print("📱 Check your email to verify the message was received.")
                print("🔍 Check SendGrid dashboard for tracking analytics.")
            else:
                print("❌ SendGrid test failed. Check the logs for details.")

        else:
            parser.print_help()

    except Exception as e:
        print(f"❌ Error: {e}")
        logger.error(f"Campaign manager error: {e}")


if __name__ == "__main__":
    main()
