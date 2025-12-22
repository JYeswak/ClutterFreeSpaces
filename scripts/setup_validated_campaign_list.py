#!/usr/bin/env python3
"""
Setup Validated Campaign List - ClutterFreeSpaces
Migrates validated emails into the campaign system for daily outreach
"""

import sqlite3
from datetime import datetime


def setup_validated_campaigns():
    """Set up validated emails for campaign system"""

    print("🚀 SETTING UP VALIDATED EMAIL CAMPAIGN LIST")
    print("=" * 60)

    conn = sqlite3.connect("outreach/data/b2b_outreach.db")
    cursor = conn.cursor()

    # Create business_contacts table if it doesn't exist
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS business_contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            business_id INTEGER,
            email TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            title TEXT,
            phone TEXT,
            status TEXT DEFAULT 'active',
            validation_score INTEGER,
            validation_result TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (business_id) REFERENCES businesses_clean(id)
        )
    """
    )

    # Insert validated deliverable emails into business_contacts
    cursor.execute(
        """
        INSERT OR REPLACE INTO business_contacts
        (business_id, email, first_name, last_name, title, validation_score, hunter_validation_result, status)
        SELECT
            bc.id,
            bc.email,
            CASE
                WHEN bc.name LIKE '% %' THEN substr(bc.name, 1, instr(bc.name, ' ') - 1)
                ELSE bc.name
            END as first_name,
            CASE
                WHEN bc.name LIKE '% %' THEN substr(bc.name, instr(bc.name, ' ') + 1)
                ELSE ''
            END as last_name,
            '' as title,
            ev.score,
            ev.result,
            'active'
        FROM businesses_clean bc
        JOIN email_validations ev ON bc.email = ev.email
        WHERE ev.result IN ('deliverable', 'risky')
        AND ev.score >= 70
        AND bc.email IS NOT NULL
        AND bc.email != ''
    """
    )

    contacts_added = cursor.rowcount

    # Get summary by business type and validation result
    cursor.execute(
        """
        SELECT
            bt.type_name,
            bct.hunter_validation_result,
            COUNT(*) as count,
            ROUND(AVG(bct.validation_score), 1) as avg_score
        FROM business_contacts bct
        JOIN businesses_clean bc ON bct.business_id = bc.id
        JOIN business_types bt ON bc.business_type_id = bt.id
        WHERE bct.status = 'active'
        GROUP BY bt.type_name, bct.hunter_validation_result
        ORDER BY bt.type_name, bct.hunter_validation_result
    """
    )

    results = cursor.fetchall()

    # Print summary
    print(f"✅ Successfully set up {contacts_added} validated contacts for campaigns")
    print(f"📊 Breakdown by segment and quality:")
    print("-" * 80)

    current_type = None
    segment_totals = {}

    for type_name, result, count, avg_score in results:
        if type_name != current_type:
            if current_type is not None:
                total = segment_totals.get(current_type, 0)
                print(f"   Segment Total: {total} contacts")
                print()
            current_type = type_name
            print(f"🎯 {type_name.replace('_', ' ').title()}:")
            segment_totals[current_type] = 0

        segment_totals[current_type] += count
        if result:
            print(f"   {result.upper()}: {count} contacts (avg score: {avg_score})")
        else:
            print(f"   NO VALIDATION: {count} contacts (avg score: {avg_score})")

    if current_type:
        total = segment_totals.get(current_type, 0)
        print(f"   Segment Total: {total} contacts")

    # Overall totals
    cursor.execute(
        """
        SELECT
            hunter_validation_result,
            COUNT(*) as count,
            ROUND(AVG(validation_score), 1) as avg_score
        FROM business_contacts
        WHERE status = 'active'
        GROUP BY hunter_validation_result
        ORDER BY hunter_validation_result
    """
    )

    totals = cursor.fetchall()

    print("\n" + "=" * 60)
    print("🏆 OVERALL CAMPAIGN-READY TOTALS:")

    grand_total = 0
    for result, count, avg_score in totals:
        grand_total += count
        if result:
            print(f"   {result.upper()}: {count} contacts (avg score: {avg_score})")
        else:
            print(f"   NO VALIDATION: {count} contacts (avg score: {avg_score})")

    print(f"   TOTAL READY: {grand_total} contacts")

    # Daily sending calculations
    max_daily = 40
    days_to_complete = grand_total / max_daily

    print(f"\n📅 Campaign Timeline:")
    print(f"   Daily send limit: {max_daily} emails")
    print(f"   Days to complete initial outreach: {days_to_complete:.1f} days")
    print(f"   With 15-day delays, full cycle: ~{days_to_complete + 15:.0f} days")

    conn.commit()
    conn.close()

    return grand_total


if __name__ == "__main__":
    total_contacts = setup_validated_campaigns()
    print(
        f"\n✅ Setup complete! {total_contacts} validated contacts ready for daily campaigns."
    )
    print("🚀 Run 'python3 scripts/daily_campaign_sender.py' to start sending!")
