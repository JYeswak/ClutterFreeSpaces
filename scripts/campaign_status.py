#!/usr/bin/env python3
"""
Campaign Status Report Generator
===============================

Provides comprehensive status report for ClutterFreeSpaces email campaigns.
Shows available contacts, recent performance, and next available send dates.
"""

import sqlite3
import sys
from datetime import datetime, timedelta

sys.path.append("outreach/campaigns")
from timing_controller import EmailTimingController

DB_PATH = "outreach/data/b2b_outreach.db"


def get_campaign_status():
    """Generate comprehensive campaign status report"""

    print("🎯 CLUTTERFREE SPACES CAMPAIGN STATUS")
    print("=" * 50)

    # Database connection
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Overall statistics
    cursor.execute(
        """
        SELECT
            COUNT(DISTINCT email_address) as contacts_reached,
            COUNT(*) as total_emails_sent,
            MIN(sent_date) as first_send,
            MAX(sent_date) as last_send
        FROM campaign_sends
    """
    )
    overall = cursor.fetchone()

    print(f"📊 Overall Campaign Statistics:")
    print(f"   Unique contacts reached: {overall[0]}")
    print(f"   Total emails sent: {overall[1]}")
    print(f"   Campaign period: {overall[2][:10]} to {overall[3][:10]}")
    print()

    # 2. Recent sending performance
    cursor.execute(
        """
        SELECT
            DATE(sent_date) as send_date,
            COUNT(DISTINCT email_address) as unique_emails,
            COUNT(*) as total_sends
        FROM campaign_sends
        WHERE sent_date >= date('now', '-7 days')
        GROUP BY DATE(sent_date)
        ORDER BY send_date DESC
    """
    )
    recent_sends = cursor.fetchall()

    print(f"📈 Last 7 Days Performance:")
    for date, unique, total in recent_sends:
        duplicate_ratio = "✅" if unique == total else f"⚠️ ({total-unique} dupes)"
        print(f"   {date}: {unique} unique emails {duplicate_ratio}")
    print()

    # 3. Available contacts by campaign type
    controller = EmailTimingController()
    campaign_types = [
        "real_estate_email1",
        "storage_facilities_email1",
        "home_builder_email1",
        "insurance_agent_email1",
        "estate_attorney_email1",
        "senior_living_email1",
        "general",
    ]

    print(f"🎯 Available Contacts (15-day exclusion):")
    total_available = 0
    for campaign in campaign_types:
        try:
            contacts = controller.get_sendable_contacts(campaign, limit=1000)
            available = len(contacts)
            total_available += available
            status = "✅" if available > 0 else "⏳"
            print(f"   {status} {campaign}: {available} contacts")
        except Exception as e:
            print(f"   ❌ {campaign}: Error - {e}")

    print(f"\n   📊 Total Available: {total_available} contacts")
    print()

    # 4. Next availability date
    cursor.execute(
        """
        SELECT
            DATE(MIN(sent_date), '+15 days') as next_available_date,
            COUNT(DISTINCT email_address) as contacts_becoming_available
        FROM campaign_sends
        WHERE sent_date >= date('now', '-15 days')
    """
    )
    next_available = cursor.fetchone()

    print(f"⏰ Contact Recycling Schedule:")
    print(f"   Next contacts available: {next_available[0]}")
    print(f"   Contacts becoming available: {next_available[1]}")
    print()

    # 5. Validation status
    cursor.execute(
        """
        SELECT
            COUNT(*) as total_validated,
            COUNT(CASE WHEN result = 'deliverable' THEN 1 END) as deliverable,
            COUNT(CASE WHEN result = 'risky' THEN 1 END) as risky
        FROM email_validations
    """
    )
    validation = cursor.fetchone()

    print(f"✅ Email Validation Status:")
    print(f"   Total validated: {validation[0]} emails")
    print(f"   Deliverable: {validation[1]} ({validation[1]/validation[0]*100:.1f}%)")
    print(f"   Risky: {validation[2]} ({validation[2]/validation[0]*100:.1f}%)")
    print()

    conn.close()

    # 6. Recommendations
    print(f"💡 Recommendations:")
    if total_available == 0:
        print(f"   • Wait until {next_available[0]} for contact recycling")
        print(
            f"   • Consider validating additional contacts from business_contacts table"
        )
        print(f"   • Expand to new business types or geographic areas")
    else:
        print(f"   • {total_available} contacts ready for immediate campaigns")
        print(f"   • Maintain daily sending schedule")

    if validation[0] < 1000:
        print(f"   • Continue email validation to build larger pool")

    print(f"   • Monitor SendGrid reputation and engagement metrics")


if __name__ == "__main__":
    get_campaign_status()
