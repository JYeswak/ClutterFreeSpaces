#!/usr/bin/env python3
"""
Day 3 & Day 4 B2B Campaign Scheduler - ClutterFreeSpaces
Schedules remaining 65 contacts across two days (32-33 emails each)
September 10-11, 2025
"""

import sys
import os
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Set

sys.path.append("outreach/campaigns")

from email_campaign_manager import EmailCampaignManager, Contact


class Day3Day4CampaignScheduler:
    """Schedule remaining campaigns across Day 3 & 4 with smart distribution"""

    def __init__(self):
        self.manager = EmailCampaignManager()

        # Day 3 & 4 campaign distribution
        self.day3_campaigns = {
            "morning": {
                "date": "September 10, 2025",
                "time": "8:00 AM",
                "campaigns": [
                    {
                        "type": "real_estate_agent",
                        "limit": 16,
                        "template": "real_estate",
                    },
                    {"type": "rv_park", "limit": 16, "template": "rv_parks"},
                ],
                "total": 32,
            }
        }

        self.day4_campaigns = {
            "morning": {
                "date": "September 11, 2025",
                "time": "8:00 AM",
                "campaigns": [
                    {
                        "type": "senior_living",
                        "limit": 11,
                        "template": "senior_living",
                    },  # Remaining 11
                    {
                        "type": "cleaning_company",
                        "limit": 8,
                        "template": "cleaning_companies",
                    },
                    {
                        "type": "storage_facility",
                        "limit": 4,
                        "template": "storage_facilities",
                    },
                    {
                        "type": "moving_company",
                        "limit": 5,
                        "template": "moving_company",
                    },  # Remaining 5
                    {
                        "type": "real_estate_agent",
                        "limit": 5,
                        "template": "real_estate",
                    },  # Remaining 5
                ],
                "total": 33,
            }
        }

    def get_unsent_contacts_by_type(
        self, db_campaign_type: str, template_type: str
    ) -> List[Contact]:
        """Get contacts that haven't been sent emails yet for a specific campaign type"""

        # Direct database query to get unsent contacts
        query = """
            SELECT DISTINCT bc.id, bc.email, bc.first_name, bc.last_name, bc.title,
                   b.name as business_name, bt.type_name as business_type, 0 as is_warm
            FROM businesses b
            JOIN business_types bt ON b.business_type_id = bt.id
            LEFT JOIN business_contacts bc ON b.id = bc.business_id AND bc.status = 'active'
            LEFT JOIN campaign_sends cs ON bc.id = cs.contact_id
            WHERE bt.type_name = ?
            AND bc.email IS NOT NULL
            AND cs.contact_id IS NULL
            ORDER BY bc.email
        """

        self.manager.cursor.execute(query, (db_campaign_type,))
        rows = self.manager.cursor.fetchall()

        contacts = []
        for row in rows:
            contacts.append(
                Contact(
                    id=row[0],
                    email=row[1],
                    first_name=row[2] or "",
                    last_name=row[3] or "",
                    title=row[4] or "",
                    business_name=row[5] or "",
                    business_type=row[6] or "",
                    is_warm=bool(row[7]),
                )
            )

        return contacts

    def show_campaign_plan(self):
        """Display the complete Day 3 & 4 campaign plan"""

        print("📅 DAY 3 & DAY 4 CAMPAIGN PLAN")
        print("=" * 50)
        print("📊 Remaining contacts: 65 total")
        print("📧 Split: 32 emails (Day 3) + 33 emails (Day 4)")
        print()

        # Day 3 Plan
        print("🌅 DAY 3 - September 10, 2025 (Tuesday)")
        print("-" * 40)
        day3_config = self.day3_campaigns["morning"]
        print(
            f"⏰ {day3_config['time']} - Morning Batch ({day3_config['total']} emails):"
        )

        for campaign in day3_config["campaigns"]:
            contacts = self.get_unsent_contacts_by_type(
                campaign["type"], campaign["template"]
            )
            available = len(contacts)
            sending = min(campaign["limit"], available)
            print(
                f"  • {campaign['type'].replace('_', ' ').title()}: {sending}/{available} contacts"
            )

        print()

        # Day 4 Plan
        print("🌅 DAY 4 - September 11, 2025 (Wednesday)")
        print("-" * 40)
        day4_config = self.day4_campaigns["morning"]
        print(
            f"⏰ {day4_config['time']} - Morning Batch ({day4_config['total']} emails):"
        )

        for campaign in day4_config["campaigns"]:
            contacts = self.get_unsent_contacts_by_type(
                campaign["type"], campaign["template"]
            )
            available = len(contacts)
            sending = min(campaign["limit"], available)
            print(
                f"  • {campaign['type'].replace('_', ' ').title()}: {sending}/{available} contacts"
            )

        print()
        print("🎯 STRATEGY:")
        print("✅ Focus on high-value prospects (real estate, RV parks)")
        print("✅ Complete partial campaigns (senior living, moving)")
        print("✅ Conservative daily limits (32-33 emails)")
        print("✅ Morning sends for optimal open rates")

    def launch_day3_batch(self) -> int:
        """Launch Day 3 campaigns"""

        print(f"\n🚀 LAUNCHING DAY 3 BATCH - September 10, 2025")
        print("=" * 60)

        total_sent = 0
        day3_config = self.day3_campaigns["morning"]

        for campaign in day3_config["campaigns"]:
            campaign_type = campaign["type"]
            template_type = campaign["template"]
            limit = campaign["limit"]

            print(
                f"\n📧 {campaign_type.replace('_', ' ').title()} Campaign ({limit} emails)"
            )
            print("-" * 50)

            # Get unsent contacts
            contacts = self.get_unsent_contacts_by_type(campaign_type, template_type)

            if not contacts:
                print(f"⚠️ No unsent contacts available for {campaign_type}")
                continue

            # Limit to requested number
            selected_contacts = contacts[:limit]
            print(
                f"📋 Selected {len(selected_contacts)} contacts from {len(contacts)} available"
            )

            # Start campaign sequences using template type
            for contact in selected_contacts:
                self.manager.start_campaign_sequence(contact, template_type)

            # Process emails for this campaign
            batch_sent = self.manager.process_scheduled_emails()
            total_sent += batch_sent

            print(f"✅ {campaign_type}: {batch_sent} emails sent")

        return total_sent

    def launch_day4_batch(self) -> int:
        """Launch Day 4 campaigns"""

        print(f"\n🚀 LAUNCHING DAY 4 BATCH - September 11, 2025")
        print("=" * 60)

        total_sent = 0
        day4_config = self.day4_campaigns["morning"]

        for campaign in day4_config["campaigns"]:
            campaign_type = campaign["type"]
            template_type = campaign["template"]
            limit = campaign["limit"]

            print(
                f"\n📧 {campaign_type.replace('_', ' ').title()} Campaign ({limit} emails)"
            )
            print("-" * 50)

            # Get unsent contacts
            contacts = self.get_unsent_contacts_by_type(campaign_type, template_type)

            if not contacts:
                print(f"⚠️ No unsent contacts available for {campaign_type}")
                continue

            # Limit to requested number
            selected_contacts = contacts[:limit]
            print(
                f"📋 Selected {len(selected_contacts)} contacts from {len(contacts)} available"
            )

            # Start campaign sequences using template type
            for contact in selected_contacts:
                self.manager.start_campaign_sequence(contact, template_type)

            # Process emails for this campaign
            batch_sent = self.manager.process_scheduled_emails()
            total_sent += batch_sent

            print(f"✅ {campaign_type}: {batch_sent} emails sent")

        return total_sent

    def schedule_campaigns(self):
        """Schedule campaigns using 'at' command for future execution"""

        print("\n📅 SCHEDULING DAY 3 & DAY 4 CAMPAIGNS")
        print("=" * 50)

        # Day 3 - September 10, 2025 at 8:00 AM
        day3_script = f"cd {os.getcwd()} && python3 scripts/day3_day4_campaign_scheduler.py --launch-day3"
        day3_time = "8:00 AM Sep 10 2025"

        print(f"📅 Scheduling Day 3 for {day3_time}...")
        cmd = f'echo "{day3_script}" | at "{day3_time}"'
        result = os.system(cmd)

        if result == 0:
            print(f"✅ Day 3 batch scheduled successfully")
        else:
            print(f"❌ Failed to schedule Day 3 batch")

        # Day 4 - September 11, 2025 at 8:00 AM
        day4_script = f"cd {os.getcwd()} && python3 scripts/day3_day4_campaign_scheduler.py --launch-day4"
        day4_time = "8:00 AM Sep 11 2025"

        print(f"📅 Scheduling Day 4 for {day4_time}...")
        cmd = f'echo "{day4_script}" | at "{day4_time}"'
        result = os.system(cmd)

        if result == 0:
            print(f"✅ Day 4 batch scheduled successfully")
        else:
            print(f"❌ Failed to schedule Day 4 batch")

        print(f"\n🎯 SCHEDULED CAMPAIGNS:")
        print(f"📅 Day 3: September 10, 8:00 AM - 32 emails")
        print(f"📅 Day 4: September 11, 8:00 AM - 33 emails")
        print(f"\n💡 Use 'atq' to view scheduled jobs")
        print(f"💡 Use 'atrm <job_id>' to cancel if needed")

    def close(self):
        """Clean up resources"""
        self.manager.close()


def main():
    """Main function with command line options"""

    scheduler = Day3Day4CampaignScheduler()

    try:
        if "--launch-day3" in sys.argv:
            # Launch Day 3 batch (called by 'at' scheduler)
            sent = scheduler.launch_day3_batch()
            print(f"\n✅ Day 3 batch complete: {sent} emails sent")

        elif "--launch-day4" in sys.argv:
            # Launch Day 4 batch (called by 'at' scheduler)
            sent = scheduler.launch_day4_batch()
            print(f"\n✅ Day 4 batch complete: {sent} emails sent")

        elif "--schedule" in sys.argv:
            # Schedule both days
            scheduler.schedule_campaigns()

        else:
            # Show plan and ask for confirmation
            print("📧 CLUTTERFREESPACES DAY 3 & 4 CAMPAIGN SCHEDULER")
            print("=" * 60)

            scheduler.show_campaign_plan()

            print(f"\n❓ WHAT WOULD YOU LIKE TO DO?")
            print(f"1. Schedule both days automatically")
            print(f"2. Launch Day 3 now (testing)")
            print(f"3. Launch Day 4 now (testing)")
            print(f"4. Just show the plan (default)")

            choice = input(f"\nEnter choice (1-4): ").strip()

            if choice == "1":
                scheduler.schedule_campaigns()
            elif choice == "2":
                sent = scheduler.launch_day3_batch()
                print(f"\n✅ Day 3 test complete: {sent} emails sent")
            elif choice == "3":
                sent = scheduler.launch_day4_batch()
                print(f"\n✅ Day 4 test complete: {sent} emails sent")
            else:
                print(f"\n📋 Plan displayed. Use --schedule to schedule campaigns.")

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    finally:
        scheduler.close()

    return 0


if __name__ == "__main__":
    exit(main())
