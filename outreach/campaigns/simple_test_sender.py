#!/usr/bin/env python3
"""
Simple test email sender without database tracking
"""

import os
import sendgrid
from sendgrid.helpers.mail import Mail, From, To, Subject, HtmlContent, PlainTextContent
from dotenv import load_dotenv

load_dotenv()


def send_test_emails():
    """Send test emails directly using SendGrid"""

    # Get API key
    api_key = os.getenv("SENDGRID_API_KEY") or os.getenv("SendGrid_API_Key")
    if not api_key:
        print("❌ SendGrid API key not found")
        return False

    sg = sendgrid.SendGridAPIClient(api_key=api_key)

    # Load HTML template
    try:
        with open("outreach/campaigns/templates/bretz_warm_email1.html", "r") as f:
            html_template = f.read()
    except FileNotFoundError:
        print("❌ Email template not found")
        return False

    # Test emails to send
    test_emails = [
        {
            "subject": "[TEST] Hi from Chanel - Remember me from Bretz? 🏔️",
            "campaign": "Bretz Warm Connection",
            "business": "Bretz RV & Marine (Test)",
            "context": "warm connection",
        },
        {
            "subject": "[TEST] Help your RV customers love their purchase even more",
            "campaign": "RV Dealer Cold Outreach",
            "business": "Montana RV Sales (Test)",
            "context": "cold outreach",
        },
        {
            "subject": "[TEST] Making Montana senior living spaces feel like home",
            "campaign": "Senior Living Facilities",
            "business": "Missoula Senior Center (Test)",
            "context": "empathy-focused approach",
        },
        {
            "subject": "[TEST] Make your moves smoother with pre/post organization",
            "campaign": "Moving Company Partnership",
            "business": "Big Sky Movers (Test)",
            "context": "partnership opportunity",
        },
        {
            "subject": "[TEST] Organized homes sell 50% faster in Montana",
            "campaign": "Real Estate Agent Outreach",
            "business": "Glacier Realty (Test)",
            "context": "ROI-focused pitch",
        },
        {
            "subject": "[TEST] Organizational services for Montana State Parks",
            "campaign": "Government Facilities",
            "business": "Montana State Parks (Test)",
            "context": "formal government approach",
        },
    ]

    print("📧 SENDING TEST EMAILS TO joshua@clutter-free-spaces.com")
    print("=" * 60)

    sent_count = 0

    for email_info in test_emails:
        try:
            # Personalize template
            personalized_html = html_template.replace("{{first_name}}", "Josh")
            personalized_html = personalized_html.replace(
                "{{business_name}}", email_info["business"]
            )

            # Add test context
            test_note = f"""
            <div style="background: #ffe6e6; border: 2px solid #ff4444; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <h3 style="color: #cc0000; margin: 0 0 10px 0;">🧪 TEST EMAIL</h3>
                <p style="margin: 0;"><strong>Campaign:</strong> {email_info["campaign"]}</p>
                <p style="margin: 0;"><strong>Target:</strong> {email_info["business"]}</p>
                <p style="margin: 0;"><strong>Context:</strong> {email_info["context"]}</p>
            </div>
            """
            personalized_html = personalized_html.replace(
                '<div class="content">', f'<div class="content">{test_note}'
            )

            # Create and send email
            from_email = From(
                "chanel@clutter-free-spaces.com", "Chanel - Clutter Free Spaces"
            )
            to_email = To("joshua@clutter-free-spaces.com")
            subject = Subject(email_info["subject"])
            html_content = HtmlContent(personalized_html)
            plain_text = PlainTextContent(
                f"Test email for {email_info['campaign']} campaign targeting {email_info['business']}"
            )

            mail = Mail(from_email, to_email, subject, plain_text, html_content)

            # Send
            response = sg.send(mail)

            if response.status_code == 202:
                print(f"✅ Sent: {email_info['campaign']}")
                sent_count += 1
            else:
                print(
                    f"❌ Failed: {email_info['campaign']} (Status: {response.status_code})"
                )

        except Exception as e:
            print(f"❌ Error sending {email_info['campaign']}: {e}")

    print(f"\n🎉 Test email sending complete!")
    print(
        f"📧 Successfully sent {sent_count} test emails to joshua@clutter-free-spaces.com"
    )
    print(f"💡 Check your inbox for samples of each campaign type")

    return sent_count > 0


if __name__ == "__main__":
    success = send_test_emails()
    exit(0 if success else 1)
