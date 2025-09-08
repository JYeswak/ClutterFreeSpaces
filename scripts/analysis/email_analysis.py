#!/usr/bin/env python3
"""
Email Extraction Opportunity Analysis
"""
import sqlite3


def main():
    # Connect to database
    db_path = "./.claude/data/metrics.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("📧 Email Extraction Opportunity Analysis")
    print("=" * 50)

    # Count businesses with websites by type
    cursor.execute(
        """
    SELECT 
        bt.type_name,
        COUNT(b.id) as total_businesses,
        COUNT(CASE WHEN b.website IS NOT NULL THEN 1 END) as has_website,
        COUNT(CASE WHEN b.email IS NOT NULL THEN 1 END) as has_email,
        ROUND(100.0 * COUNT(CASE WHEN b.website IS NOT NULL THEN 1 END) / COUNT(b.id), 1) as website_percentage
    FROM business_types bt
    LEFT JOIN businesses b ON bt.id = b.business_type_id
    GROUP BY bt.id, bt.type_name
    HAVING COUNT(b.id) > 0
    ORDER BY has_website DESC
    """
    )

    results = cursor.fetchall()
    total_with_websites = 0
    total_businesses = 0

    print(
        f"{'Business Type':<25} | {'Total':<5} | {'Websites':<8} | {'Emails':<6} | {'% w/Website':<10}"
    )
    print("-" * 70)

    for business_type, total, websites, emails, percentage in results:
        total_with_websites += websites
        total_businesses += total
        print(
            f"{business_type:<25} | {total:<5} | {websites:<8} | {emails:<6} | {percentage:<10}%"
        )

    print("-" * 70)
    overall_percentage = (
        round(100.0 * total_with_websites / total_businesses, 1)
        if total_businesses > 0
        else 0
    )
    print(
        f"{'TOTAL':<25} | {total_businesses:<5} | {total_with_websites:<8} | {'0':<6} | {overall_percentage:<10}%"
    )

    print()
    print("📊 Email Extraction Potential:")
    print(f"   Businesses with websites: {total_with_websites:,}")
    print(
        f"   Estimated extractable emails: {int(total_with_websites * 0.6):,} (60% success rate)"
    )
    print()
    print("📋 Next Steps:")
    print("1. Run email extraction on businesses with websites")
    print("2. Start with highest-priority business types")
    print("3. Use rate limiting to avoid being blocked")
    print(f"4. Command: /outreach-enrich --batch=50")

    conn.close()


if __name__ == "__main__":
    main()
