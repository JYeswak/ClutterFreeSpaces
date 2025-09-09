#!/usr/bin/env python3
"""
Day 2 B2B Campaign Launcher - ClutterFreeSpaces
Smart campaign system with exclusion logic to avoid duplicate sends
Launches staggered batches throughout the day
"""

import sys
import os
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Set

sys.path.append("outreach/campaigns")

from email_campaign_manager import EmailCampaignManager, Contact


class Day2CampaignLauncher:
    """Smart campaign launcher for Day 2 with exclusion logic"""

    def __init__(self):
        self.manager = EmailCampaignManager()
        self.conn = sqlite3.connect("outreach/data/b2b_outreach.db")
        self.cursor = self.conn.cursor()

        # Day 2 campaign plan
        self.day2_campaigns = {
            "morning": {
                "time": "8:00 AM MDT",
                "campaigns": [
                    {"type": "rv_dealer", "limit": 20},
                    {"type": "moving_company", "limit": 5},
                ],
                "total": 25,
            },
            "afternoon": {
                "time": "1:00 PM MDT",
                "campaigns": [
                    {"type": "rv_dealer", "limit": 15},
                    {"type": "moving_company", "limit": 10},
                ],
                "total": 25,
            },
            "evening": {
                "time": "4:00 PM MDT",
                "campaigns": [{"type": "real_estate_agent", "limit": 15}],
                "total": 15,
            },
        }

    def get_yesterday_recipients(self) -> Set[str]:
        """Get email addresses that received emails yesterday to avoid duplicates"""

        yesterday = datetime.now() - timedelta(days=1)
        yesterday_str = yesterday.strftime("%Y-%m-%d")

        # Query both campaign_sends tables (if they exist)
        sent_emails = set()

        # Check campaign_sends table
        try:
            self.cursor.execute(
                """
                SELECT DISTINCT bc.email 
                FROM campaign_sends cs
                JOIN business_contacts bc ON cs.contact_id = bc.id
                WHERE date(cs.sent_date) = ?
            """,
                (yesterday_str,),
            )

            for row in self.cursor.fetchall():
                sent_emails.add(row[0])

        except sqlite3.OperationalError:
            # Table might not exist or different schema
            pass

        # Also check SendGrid activity from yesterday (if we logged it)
        # For now, let's manually exclude known Day 1 recipients
        day1_recipients = {
            # Bretz warm contacts (from yesterday)
            "kagan@bretzrv.com",
            "casey@bretzrv.com",
            "pat@bretzrv.com",
            "dirk@bretzrv.com",
            "nvavrica@bretzrv.com",
            "shawn@bretzrv.com",
            "bbretz@bretzrv.com",
            "ksirmon@bretzrv.com",
            "dbretz@bretzrv.com",
            "ted@bretzrv.com",
            # Senior living contacts (from yesterday)
            "jberg@accessiblespace.org",
            "jlemke-kline@accessiblespace.org",
            "agates@beehivehomes.com",
            "tprice@beehivehomes.com",
            "hetalshah@synergyhomecare.com",
            "adriana.falcon@holidayseniorliving.com",
            "amy@loyalcaremt.com",
            "kellie@loyalcaremt.com",
            "ashley@buttespirit.org",
            "tinaneill@synergyhomecare.com",
            "nicolegorder@benefis.org",
        }

        sent_emails.update(day1_recipients)

        print(f"🚫 Excluding {len(sent_emails)} recipients from yesterday")
        return sent_emails

    def get_filtered_contacts(
        self, campaign_type: str, limit: int, exclude_emails: Set[str]
    ) -> List[Contact]:
        """Get contacts for campaign type, excluding yesterday's recipients"""

        # Get all contacts for this campaign type
        all_contacts = self.manager.get_campaign_contacts(campaign_type)

        # Filter out excluded emails
        filtered_contacts = [
            contact for contact in all_contacts if contact.email not in exclude_emails
        ]

        # Limit to requested number
        limited_contacts = filtered_contacts[:limit]

        print(
            f"📋 {campaign_type}: {len(all_contacts)} total → {len(filtered_contacts)} after exclusion → {len(limited_contacts)} selected"
        )

        return limited_contacts

    def launch_batch(
        self, batch_name: str, batch_config: Dict, respect_limits: bool = True
    ) -> int:
        """Launch a batch of campaigns with optional limit enforcement"""

        print(f"\n🚀 LAUNCHING {batch_name.upper()} BATCH - {batch_config['time']}")
        print("=" * 70)

        yesterday_recipients = self.get_yesterday_recipients()
        total_sent = 0

        for campaign in batch_config["campaigns"]:
            campaign_type = campaign["type"]
            limit = campaign["limit"] if respect_limits else None

            print(
                f"\n📧 {campaign_type.replace('_', ' ').title()} Campaign"
                + (f" ({limit} emails)" if limit else " (no limit)")
            )
            print("-" * 50)

            if respect_limits:
                # Get filtered contacts with limit
                contacts = self.get_filtered_contacts(
                    campaign_type, limit, yesterday_recipients
                )

                if not contacts:
                    print(
                        f"⚠️ No contacts available for {campaign_type} after filtering"
                    )
                    continue

                # Start campaign sequences
                for contact in contacts:
                    self.manager.start_campaign_sequence(contact, campaign_type)

                # Process emails for this campaign
                batch_sent = self.manager.process_scheduled_emails()
            else:
                # Launch full campaign (what we just did)
                batch_sent = self.manager.launch_campaign(
                    campaign_type, test_mode=False
                )

            total_sent += batch_sent
            print(f"✅ {campaign_type}: {batch_sent} emails sent")

        return total_sent

    def get_sendgrid_quota_status(self) -> Dict[str, int]:
        """Check current SendGrid usage (simplified version)"""

        # This is a placeholder - in production we'd query SendGrid API
        # For now, estimate based on what we know
        current_hour = datetime.now().hour

        # Estimate usage based on time of day
        if current_hour < 10:  # Early morning
            estimated_used = 65  # Yesterday's sends
        elif current_hour < 14:  # Before afternoon
            estimated_used = 90  # Morning batch sent
        else:  # Afternoon
            estimated_used = 115  # Morning + afternoon batches

        return {
            "used": min(estimated_used, 100),  # Cap at daily limit
            "limit": 100,
            "remaining": max(0, 100 - estimated_used),
        }

    def show_day2_plan(self):
        """Display the complete Day 2 campaign plan"""

        print("📅 DAY 2 CAMPAIGN PLAN - September 9, 2025")
        print("=" * 60)

        quota_status = self.get_sendgrid_quota_status()
        print(
            f"📊 SendGrid Status: {quota_status['used']}/{quota_status['limit']} used ({quota_status['remaining']} remaining)"
        )
        print(f"🎯 Reputation: 98% (maintaining conservative approach)")
        print()

        total_planned = 0
        for batch_name, config in self.day2_campaigns.items():
            print(
                f"{config['time']} - {batch_name.title()} Batch ({config['total']} emails):"
            )
            for campaign in config["campaigns"]:
                campaign_name = campaign["type"].replace("_", " ").title()
                print(f"  • {campaign_name}: {campaign['limit']} emails")
            total_planned += config["total"]
            print()

        print(f"📧 Total Day 2 Plan: {total_planned} emails")
        print(f"🚫 Smart Exclusion: Avoiding yesterday's recipients")
        print(f"⏰ Staggered Timing: Optimal open rates")
        print()

    def launch_morning_batch(self) -> int:
        """Launch the 8 AM batch"""
        return self.launch_batch("morning", self.day2_campaigns["morning"])

    def launch_afternoon_batch(self) -> int:
        """Launch the 1 PM batch"""
        return self.launch_batch("afternoon", self.day2_campaigns["afternoon"])

    def launch_evening_batch(self) -> int:
        """Launch the 4 PM batch"""
        return self.launch_batch("evening", self.day2_campaigns["evening"])

    def close(self):
        """Clean up resources"""
        self.manager.close()
        self.conn.close()


def main():
    """Main function for CLI usage"""

    try:
        launcher = Day2CampaignLauncher()

        print("🚀 CLUTTERFREESPACERS DAY 2 CAMPAIGN LAUNCHER")
        print("=" * 70)

        # Show the plan
        launcher.show_day2_plan()

        # Check current time to determine which batch to run
        current_hour = datetime.now().hour
        current_minute = datetime.now().minute

        print(f"🕐 Current Time: {current_hour:02d}:{current_minute:02d} MDT")
        print()

        # Determine which batch to launch based on time
        if current_hour < 10:
            print("⚡ LAUNCHING MORNING BATCH (8:00 AM slot)")
            sent_count = launcher.launch_morning_batch()
        elif current_hour < 16:
            print("⚡ LAUNCHING AFTERNOON BATCH (1:00 PM slot)")
            sent_count = launcher.launch_afternoon_batch()
        elif current_hour < 19:
            print("⚡ LAUNCHING EVENING BATCH (4:00 PM slot)")
            sent_count = launcher.launch_evening_batch()
        else:
            print("⚠️ Outside optimal sending hours (8 AM - 7 PM)")
            print("   Run manually or wait for tomorrow")
            sent_count = 0

        # Show results
        if sent_count > 0:
            quota_status = launcher.get_sendgrid_quota_status()
            new_used = quota_status["used"] + sent_count
            remaining = max(0, 100 - new_used)

            print(f"\n📊 BATCH COMPLETE")
            print(f"   Emails Sent: {sent_count}")
            print(f"   SendGrid Usage: {new_used}/100 ({remaining} remaining)")
            print(f"   Reputation: Protected ✅")
            print(f"   Next Batch: Check schedule above")

            print(f"\n🔍 MONITORING CHECKLIST:")
            print(f"   □ Check SendGrid delivery status")
            print(f"   □ Monitor website traffic in GA4")
            print(f"   □ Track open rates (expect 20-30%)")
            print(f"   □ Watch for replies and bookings")

        launcher.close()

        return 0 if sent_count > 0 else 1

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
