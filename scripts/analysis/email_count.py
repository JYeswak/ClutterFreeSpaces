#!/usr/bin/env python3
"""
Comprehensive email count from all sources in the database
"""

import sqlite3


def count_emails():
    conn = sqlite3.connect("outreach/data/b2b_outreach.db")
    cursor = conn.cursor()

    print("📧 COMPREHENSIVE EMAIL COUNT ANALYSIS")
    print("=" * 50)

    # Count emails in businesses table
    cursor.execute(
        "SELECT COUNT(*) FROM businesses WHERE email IS NOT NULL AND email != ''"
    )
    business_emails = cursor.fetchone()[0]
    print(f"Emails in businesses table: {business_emails}")

    # Count emails in business_contacts table
    cursor.execute(
        "SELECT COUNT(*) FROM business_contacts WHERE email IS NOT NULL AND email != ''"
    )
    contact_emails = cursor.fetchone()[0]
    print(f"Emails in business_contacts table: {contact_emails}")

    # Count unique emails in business_contacts table
    cursor.execute(
        "SELECT COUNT(DISTINCT email) FROM business_contacts WHERE email IS NOT NULL AND email != ''"
    )
    unique_contact_emails = cursor.fetchone()[0]
    print(f"Unique emails in business_contacts: {unique_contact_emails}")

    # Get sample of emails from business_contacts
    cursor.execute(
        "SELECT email FROM business_contacts WHERE email IS NOT NULL AND email != '' LIMIT 10"
    )
    sample_emails = cursor.fetchall()
    print(f"\nSample emails from business_contacts:")
    for email in sample_emails:
        print(f"  - {email[0]}")

    # Count by business type
    print(f"\n📊 EMAIL COUNT BY BUSINESS TYPE:")
    cursor.execute(
        """
        SELECT bt.type_name, COUNT(DISTINCT bc.email) as email_count
        FROM business_types bt
        LEFT JOIN businesses b ON bt.id = b.business_type_id
        LEFT JOIN business_contacts bc ON b.id = bc.business_id
        WHERE bc.email IS NOT NULL AND bc.email != ''
        GROUP BY bt.type_name
        ORDER BY email_count DESC
    """
    )

    results = cursor.fetchall()
    total_unique = 0
    for type_name, count in results:
        print(f"  {type_name}: {count} emails")
        total_unique += count

    print(f"\n🎯 TOTAL UNIQUE EMAILS EXTRACTED: {total_unique}")

    conn.close()


if __name__ == "__main__":
    count_emails()
