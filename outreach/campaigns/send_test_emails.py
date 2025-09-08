#!/usr/bin/env python3
"""
Send test emails for ClutterFreeSpaces campaigns to joshua@clutter-free-spaces.com
"""

import sys

sys.path.append("outreach/campaigns")

from email_campaign_manager import EmailCampaignManager, EmailTemplate, Contact


def send_test_emails():
    """Send test emails for each campaign type"""

    try:
        manager = EmailCampaignManager()

        # Test contact (Josh)
        test_contact = Contact(
            id=999,
            email="joshua@clutter-free-spaces.com",
            first_name="Josh",
            last_name="Nowak",
            title="Director of Operations",
            business_name="ElektraFi (Test Business)",
            business_type="test_business",
            is_warm=False,
        )

        # Test Bretz warm connection version
        bretz_test_contact = Contact(
            id=998,
            email="joshua@clutter-free-spaces.com",
            first_name="Josh",
            last_name="Nowak",
            title="Former Colleague",
            business_name="Bretz RV & Marine (Test)",
            business_type="rv_dealer",
            is_warm=True,
        )

        print("📧 SENDING TEST EMAILS TO joshua@clutter-free-spaces.com")
        print("=" * 60)

        # Send Bretz warm email #1
        bretz_template = manager.templates["bretz_warm"][0]
        if manager.send_email(bretz_test_contact, bretz_template):
            print("✅ Sent: Bretz Warm Connection Email #1")
        else:
            print("❌ Failed: Bretz Warm Connection Email #1")

        # Create additional test templates for other campaign types
        test_templates = [
            EmailTemplate(
                name="rv_dealer_test",
                subject="[TEST] Help your RV customers love their purchase even more",
                html_file="bretz_warm_email1.html",  # Using existing template as base
                plain_text="Hi Josh, This is a test of the RV dealer campaign template...",
                campaign_type="rv_dealer",
                sequence_order=1,
            ),
            EmailTemplate(
                name="senior_living_test",
                subject="[TEST] Making Montana senior living spaces feel like home",
                html_file="bretz_warm_email1.html",  # Using existing template as base
                plain_text="Hi Josh, This is a test of the senior living campaign template...",
                campaign_type="senior_living",
                sequence_order=1,
            ),
            EmailTemplate(
                name="moving_company_test",
                subject="[TEST] Make your moves smoother with pre/post organization",
                html_file="bretz_warm_email1.html",  # Using existing template as base
                plain_text="Hi Josh, This is a test of the moving company campaign template...",
                campaign_type="moving_company",
                sequence_order=1,
            ),
            EmailTemplate(
                name="real_estate_test",
                subject="[TEST] Organized homes sell 50% faster in Montana",
                html_file="bretz_warm_email1.html",  # Using existing template as base
                plain_text="Hi Josh, This is a test of the real estate campaign template...",
                campaign_type="real_estate_agent",
                sequence_order=1,
            ),
            EmailTemplate(
                name="government_test",
                subject="[TEST] Organizational services for Montana facilities",
                html_file="bretz_warm_email1.html",  # Using existing template as base
                plain_text="Dear Josh, This is a test of the government facilities campaign template...",
                campaign_type="government",
                sequence_order=1,
            ),
        ]

        # Send test emails for each campaign type
        for template in test_templates:
            # Modify the contact business type for context
            test_contact.business_type = template.campaign_type
            test_contact.business_name = (
                f"Test {template.campaign_type.replace('_', ' ').title()}"
            )

            if manager.send_email(test_contact, template):
                print(f"✅ Sent: {template.name}")
            else:
                print(f"❌ Failed: {template.name}")

        print(f"\n🎉 Test email sending complete!")
        print(f"📧 Check joshua@clutter-free-spaces.com for 6 test emails")
        print(f"💡 Each email shows different campaign targeting and messaging")

        manager.close()
        return True

    except Exception as e:
        print(f"❌ Error sending test emails: {e}")
        return False


if __name__ == "__main__":
    success = send_test_emails()
    exit(0 if success else 1)
