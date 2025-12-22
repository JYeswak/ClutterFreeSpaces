#!/usr/bin/env python3
"""
Batch Email Harvester - Continuously runs Hunter.io until all businesses are processed
"""

import subprocess
import time
import sqlite3
from datetime import datetime


def get_remaining_businesses():
    """Get count of businesses still needing email discovery"""
    conn = sqlite3.connect("outreach/data/b2b_outreach.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT COUNT(*) 
        FROM businesses b
        WHERE (b.email IS NULL OR b.email = '')
        AND b.website IS NOT NULL AND b.website != ''
    """
    )

    count = cursor.fetchone()[0]
    conn.close()
    return count


def run_hunter_batch():
    """Run one batch of Hunter.io email discovery"""
    try:
        result = subprocess.run(
            ["python3", "scripts/scrapers/hunter_email_finder.py"],
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout per batch
        )

        if result.returncode == 0:
            # Extract emails found from output
            output_lines = result.stdout.split("\n")
            for line in output_lines:
                if "Total emails found:" in line:
                    emails_found = int(line.split(":")[1].strip())
                    return emails_found

        return 0
    except Exception as e:
        print(f"Error running Hunter batch: {e}")
        return 0


def main():
    """Main batch harvesting loop"""

    print("🚀 BATCH EMAIL HARVESTER - CONTINUOUS MODE")
    print("=" * 60)

    start_time = datetime.now()
    total_emails_found = 0
    batch_number = 1

    while True:
        remaining = get_remaining_businesses()

        if remaining == 0:
            print(f"\n🎉 EMAIL HARVESTING COMPLETE!")
            print(f"📊 Total emails found: {total_emails_found}")
            print(f"⏱️ Total time: {datetime.now() - start_time}")
            break

        print(f"\n🔄 BATCH {batch_number} - {remaining} businesses remaining")
        print("-" * 50)

        emails_found = run_hunter_batch()
        total_emails_found += emails_found

        print(f"✅ Batch {batch_number}: {emails_found} emails found")
        print(f"📈 Running total: {total_emails_found} emails")

        batch_number += 1

        # Brief pause between batches to respect API limits
        time.sleep(2)

    print(f"\n📊 FINAL RESULTS:")
    print(f"  Total batches run: {batch_number - 1}")
    print(f"  Total emails harvested: {total_emails_found}")
    print(f"  Processing time: {datetime.now() - start_time}")
    print(f"  Database is now fully harvested! 🎯")


if __name__ == "__main__":
    main()
