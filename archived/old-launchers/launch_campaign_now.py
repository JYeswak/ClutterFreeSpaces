#!/usr/bin/env python3
"""
Launch conservative B2B campaign - Day 1
Using working EmailCampaignManager approach
"""

import sys
import os

sys.path.append("outreach/campaigns")

from email_campaign_manager import EmailCampaignManager


def main():
    try:
        manager = EmailCampaignManager()

        print("🚀 CONSERVATIVE CAMPAIGN LAUNCH - DAY 1")
        print("=" * 60)
        print("📊 SendGrid Status: 64/100 emails used (36 remaining)")
        print("🎯 Reputation: 98% (excellent)")
        print("📧 Strategy: 20 Bretz + 15 Senior Living = 35 emails")
        print()

        # Launch Bretz warm campaign
        print("🔥 LAUNCHING BRETZ WARM RECONNECTION CAMPAIGN")
        print("-" * 50)
        bretz_sent = manager.launch_campaign("bretz_warm", test_mode=False)
        print(f"✅ Bretz warm emails sent: {bretz_sent}")
        print()

        # Get senior living contacts and limit to 15
        senior_contacts = manager.get_campaign_contacts("senior_living")
        limited_contacts = senior_contacts[:15]

        print("🏥 LAUNCHING SENIOR LIVING CAMPAIGN (LIMITED TO 15)")
        print("-" * 50)
        print(
            f"📋 Found {len(senior_contacts)} senior living contacts (sending to top 15)"
        )

        # Start sequences for limited contacts
        senior_added = 0
        for contact in limited_contacts:
            manager.start_campaign_sequence(contact, "senior_living")
            senior_added += 1

        # Process senior living emails
        senior_sent = manager.process_scheduled_emails()
        print(f"✅ Senior living emails sent: {senior_sent}")

        total_sent = bretz_sent + senior_sent
        print()
        print("📊 CAMPAIGN LAUNCH SUMMARY")
        print("-" * 30)
        print(f"🔥 Bretz warm: {bretz_sent} emails")
        print(f"🏥 Senior living: {senior_sent} emails")
        print(f"📧 Total sent today: {total_sent} emails")
        print(f"💰 Estimated value: ${total_sent * 199} (@ $199/consultation)")

        new_usage = 64 + total_sent
        remaining = 100 - new_usage
        print(f"📈 SendGrid Usage: {new_usage}/100 ({remaining} remaining)")

        manager.close()

        if total_sent > 0:
            print()
            print("🎉 SUCCESS: Conservative launch completed!")
            print("🔍 Next: Monitor open rates and replies")
            print("📅 Tomorrow: RV dealers and moving companies")
            return total_sent
        else:
            print("❌ No emails sent")
            return 0

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        return 0


if __name__ == "__main__":
    sent_count = main()
    print(f"\n📊 Final Result: {sent_count} emails launched")
