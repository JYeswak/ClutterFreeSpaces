#!/usr/bin/env python3
"""
Campaign Scheduler - ClutterFreeSpaces
Properly schedules email campaigns for optimal timing using cron/at
"""

import subprocess
import sys
from datetime import datetime, timedelta


class CampaignScheduler:
    """Schedules campaigns for specific times instead of immediate launch"""

    def __init__(self):
        self.campaign_script = "python3 /Users/josh/Desktop/Projects/ClutterFreeSpaces/scripts/day2_campaign_launcher.py"

    def schedule_at_time(self, time_str: str, batch_name: str):
        """Schedule campaign using 'at' command for specific time"""
        try:
            # Use 'at' command to schedule
            cmd = f'echo "{self.campaign_script}" | at {time_str}'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

            if result.returncode == 0:
                print(f"✅ {batch_name} scheduled for {time_str}")
                print(f"   Job ID: {result.stderr.strip()}")
            else:
                print(f"❌ Failed to schedule {batch_name}: {result.stderr}")
                return False

        except Exception as e:
            print(f"❌ Error scheduling {batch_name}: {e}")
            return False

        return True

    def schedule_cron_job(self, minute: int, hour: int, command: str, description: str):
        """Add a cron job for recurring campaigns"""
        cron_entry = f"{minute} {hour} * * * {command}"

        try:
            # Add to crontab
            result = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
            existing_cron = result.stdout if result.returncode == 0 else ""

            # Add new entry if not already present
            if command not in existing_cron:
                new_cron = existing_cron + f"\n{cron_entry}  # {description}\n"

                # Write back to crontab
                process = subprocess.Popen(
                    ["crontab", "-"], stdin=subprocess.PIPE, text=True
                )
                process.communicate(input=new_cron)

                print(f"✅ Cron job added: {description} at {hour:02d}:{minute:02d}")
            else:
                print(f"⚠️  Cron job already exists for: {description}")

        except Exception as e:
            print(f"❌ Error adding cron job: {e}")
            return False

        return True

    def show_scheduled_jobs(self):
        """Show all scheduled 'at' jobs"""
        try:
            result = subprocess.run(["atq"], capture_output=True, text=True)
            if result.stdout.strip():
                print("📅 Scheduled Jobs:")
                print(result.stdout)
            else:
                print("📅 No jobs currently scheduled")
        except Exception as e:
            print(f"❌ Error checking scheduled jobs: {e}")


def main():
    """Schedule campaigns for proper timing"""

    scheduler = CampaignScheduler()
    current_time = datetime.now()

    print("⏰ CAMPAIGN SCHEDULER - Staggered Timing")
    print("=" * 60)
    print(f"Current time: {current_time.strftime('%H:%M MDT')}")

    # For today (if it's still early enough)
    if current_time.hour < 13:  # Before 1 PM
        print("\n📧 SCHEDULING TODAY'S REMAINING BATCHES:")

        # Schedule afternoon batch for 1 PM
        scheduler.schedule_at_time("1:00 PM today", "Afternoon Batch")

        # Schedule evening batch for 4 PM
        scheduler.schedule_at_time("4:00 PM today", "Evening Batch")

    # For recurring daily campaigns (optional)
    print("\n🔄 WANT TO SET UP RECURRING CAMPAIGNS?")
    print("   This would create daily scheduled campaigns")
    response = input("Add recurring daily campaigns? (y/n): ").lower()

    if response == "y":
        # Morning batch at 8 AM
        scheduler.schedule_cron_job(
            0, 8, scheduler.campaign_script, "Morning Campaign Batch"
        )

        # Afternoon batch at 1 PM
        scheduler.schedule_cron_job(
            0, 13, scheduler.campaign_script, "Afternoon Campaign Batch"
        )

        # Evening batch at 4 PM
        scheduler.schedule_cron_job(
            0, 16, scheduler.campaign_script, "Evening Campaign Batch"
        )

        print("\n✅ Daily recurring campaigns set up!")
        print("   They'll run automatically at 8 AM, 1 PM, and 4 PM")

    # Show what's scheduled
    print("\n" + "=" * 60)
    scheduler.show_scheduled_jobs()

    print("\n💡 SCHEDULING TIPS:")
    print("   • Use 'atq' to see scheduled jobs")
    print("   • Use 'atrm <job_id>' to cancel a job")
    print("   • Use 'crontab -l' to see recurring jobs")
    print("   • Use 'crontab -e' to edit recurring jobs")


if __name__ == "__main__":
    main()
