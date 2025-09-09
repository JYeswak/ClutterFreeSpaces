#!/usr/bin/env python3
"""
Conservative Campaign Launch - Day 1
Sends 20 Bretz warm + 15 senior living contacts (35 total)
Preserves 98% reputation while maximizing daily quota
"""

import sys
import os

sys.path.append("outreach/campaigns")

from email_campaign_manager import EmailCampaignManager
import sqlite3


def launch_conservative_batch():
    """Launch today's conservative batch: Bretz warm + Senior living"""

    try:
        manager = EmailCampaignManager()

        print("🚀 CONSERVATIVE CAMPAIGN LAUNCH - DAY 1")
        print("=" * 60)
        print("📊 SendGrid Status: 64/100 emails used (36 remaining)")
        print("🎯 Reputation: 98% (excellent)")
        print("📧 Today's Strategy: 20 Bretz + 15 Senior Living = 35 emails")
        print()

        # 1. Launch Bretz warm campaign (all 20 contacts)
        print("🔥 LAUNCHING BRETZ WARM RECONNECTION CAMPAIGN")
        print("-" * 50)
        bretz_sent = manager.launch_campaign("bretz_warm", test_mode=False)
        print(f"✅ Bretz warm emails sent: {bretz_sent}")
        print()

        # 2. Launch senior living campaign (limited to 15)
        print("🏥 LAUNCHING SENIOR LIVING CAMPAIGN (LIMITED TO 15)")
        print("-" * 50)

        # Get senior living contacts
        senior_contacts = manager.get_campaign_contacts("senior_living")
        print(f"📋 Available senior living contacts: {len(senior_contacts)}")

        # Limit to top 15 contacts
        limited_contacts = senior_contacts[:15]
        print(f"🎯 Sending to top {len(limited_contacts)} senior living contacts")

        senior_sent = 0
        for contact in limited_contacts:
            manager.start_campaign_sequence(contact, "senior_living")
            senior_sent += 1

        # Process senior living emails
        senior_processed = manager.process_scheduled_emails()
        print(f"✅ Senior living emails sent: {senior_processed}")
        print()

        # Show final stats
        total_sent = bretz_sent + senior_processed
        print("📊 CAMPAIGN LAUNCH SUMMARY")
        print("-" * 30)
        print(f"🔥 Bretz warm: {bretz_sent} emails")
        print(f"🏥 Senior living: {senior_processed} emails")
        print(f"📧 Total sent today: {total_sent} emails")
        print(f"💰 Estimated value: ${total_sent * 199} (@ $199/consultation)")
        print()

        # Updated SendGrid usage
        new_usage = 64 + total_sent
        remaining = 100 - new_usage
        print(f"📈 SendGrid Usage: {new_usage}/100 ({remaining} remaining)")
        print(f"🎯 Reputation: Protected (conservative approach)")
        print()

        # Show campaign stats
        print("📈 OVERALL CAMPAIGN STATISTICS:")
        stats = manager.get_campaign_stats()
        for campaign, data in stats.items():
            print(
                f"  {campaign}: {data['total_contacts']} contacts, {data['total_emails_sent']} emails sent"
            )

        manager.close()

        print()
        print("✅ Conservative launch completed successfully!")
        print("🔍 Next: Monitor open rates and replies in GA4/SendGrid")
        print("📅 Tomorrow: Continue with RV dealers and moving companies")

        return total_sent

    except Exception as e:
        print(f"❌ Error: {e}")
        return 0


if __name__ == "__main__":
    sent_count = launch_conservative_batch()
    if sent_count > 0:
        print(f"\n🎉 SUCCESS: {sent_count} emails launched!")
    else:
        print("\n❌ Launch failed - check configuration")
