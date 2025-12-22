#!/usr/bin/env python3
"""
Email Validation Progress Monitor

Monitors the ongoing email validation process and provides periodic status updates.
"""

import sqlite3
import time
import sys
from datetime import datetime


def get_validation_status():
    """Get current validation status"""
    db_path = "outreach/data/b2b_outreach.db"

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Total emails
        cursor.execute(
            """
            SELECT COUNT(DISTINCT email) as total
            FROM businesses_clean
            WHERE email IS NOT NULL AND email <> ''
        """
        )
        total_emails = cursor.fetchone()[0]

        # Validated emails
        cursor.execute("SELECT COUNT(*) FROM email_validations")
        validated = cursor.fetchone()[0]

        # Results distribution
        cursor.execute(
            """
            SELECT result, COUNT(*) as count
            FROM email_validations
            GROUP BY result
        """
        )
        results = dict(cursor.fetchall())

        # Recent validations (last 10 minutes)
        cursor.execute(
            """
            SELECT COUNT(*)
            FROM email_validations
            WHERE datetime(validated_at) > datetime('now', '-10 minutes')
        """
        )
        recent = cursor.fetchone()[0]

        conn.close()

        return {
            "total": total_emails,
            "validated": validated,
            "remaining": total_emails - validated,
            "completion_pct": (validated / total_emails * 100)
            if total_emails > 0
            else 0,
            "results": results,
            "recent_10min": recent,
        }

    except Exception as e:
        print(f"Error checking status: {e}")
        return None


def print_status_update(status):
    """Print formatted status update"""
    print(f"\n{'='*60}")
    print(f"EMAIL VALIDATION STATUS - {datetime.now().strftime('%H:%M:%S')}")
    print(f"{'='*60}")
    print(
        f"Progress: {status['validated']}/{status['total']} ({status['completion_pct']:.1f}%)"
    )
    print(f"Remaining: {status['remaining']} emails")
    print(f"Recent activity: {status['recent_10min']} validations in last 10 minutes")

    if status["results"]:
        print(f"\nResults Distribution:")
        for result, count in status["results"].items():
            pct = (count / status["validated"] * 100) if status["validated"] > 0 else 0
            print(f"  {result.title()}: {count} ({pct:.1f}%)")

    # Calculate ETA based on recent activity
    if status["recent_10min"] > 0:
        rate_per_hour = status["recent_10min"] * 6  # 6 ten-minute periods per hour
        eta_hours = status["remaining"] / rate_per_hour if rate_per_hour > 0 else 0
        print(f"\nEstimated completion: {eta_hours:.1f} hours")

    print(f"{'='*60}")


def main():
    """Monitor validation progress"""
    print("Email Validation Monitor - Press Ctrl+C to stop")

    try:
        while True:
            status = get_validation_status()
            if status:
                print_status_update(status)

                if status["remaining"] == 0:
                    print("🎉 VALIDATION COMPLETE!")
                    break

            time.sleep(300)  # Check every 5 minutes

    except KeyboardInterrupt:
        print("\nMonitoring stopped by user")


if __name__ == "__main__":
    main()
