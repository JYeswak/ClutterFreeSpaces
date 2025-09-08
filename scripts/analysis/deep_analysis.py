#!/usr/bin/env python3
"""
Deep analysis of email extraction results
"""

import sqlite3
from collections import defaultdict


def analyze_extraction():
    conn = sqlite3.connect("outreach/data/b2b_outreach.db")
    cursor = conn.cursor()

    print("🔍 DEEP ANALYSIS OF EMAIL EXTRACTION RESULTS")
    print("=" * 60)

    # 1. Overall statistics
    cursor.execute("SELECT COUNT(*) FROM businesses")
    total_businesses = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM businesses WHERE email IS NOT NULL AND email != ''"
    )
    businesses_with_email = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(*) FROM businesses WHERE website IS NOT NULL AND website != ''"
    )
    businesses_with_website = cursor.fetchone()[0]

    cursor.execute(
        "SELECT COUNT(DISTINCT email) FROM business_contacts WHERE email IS NOT NULL AND email != ''"
    )
    unique_contact_emails = cursor.fetchone()[0]

    print(f"\n📊 OVERALL STATISTICS:")
    print(f"  Total businesses: {total_businesses}")
    print(
        f"  Businesses with websites: {businesses_with_website} ({100*businesses_with_website/total_businesses:.1f}%)"
    )
    print(
        f"  Businesses with emails: {businesses_with_email} ({100*businesses_with_email/total_businesses:.1f}%)"
    )
    print(f"  Unique contact emails: {unique_contact_emails}")
    print(f"  Total unique emails: {businesses_with_email + unique_contact_emails}")

    # 2. Business type breakdown
    print(f"\n📈 BREAKDOWN BY BUSINESS TYPE:")
    cursor.execute(
        """
        SELECT bt.type_name, 
               COUNT(b.id) as total,
               COUNT(CASE WHEN b.website IS NOT NULL AND b.website != '' THEN 1 END) as with_website,
               COUNT(CASE WHEN b.email IS NOT NULL AND b.email != '' THEN 1 END) as with_email
        FROM businesses b
        JOIN business_types bt ON b.business_type_id = bt.id
        GROUP BY bt.type_name
        ORDER BY total DESC
    """
    )

    results = cursor.fetchall()
    for type_name, total, with_website, with_email in results:
        website_pct = 100 * with_website / total if total > 0 else 0
        email_pct = 100 * with_email / total if total > 0 else 0
        print(
            f"  {type_name:20} Total: {total:4} | Websites: {with_website:4} ({website_pct:5.1f}%) | Emails: {with_email:4} ({email_pct:5.1f}%)"
        )

    # 3. Website extraction potential
    print(f"\n🌐 WEBSITE EXTRACTION POTENTIAL:")
    cursor.execute(
        """
        SELECT COUNT(*) FROM businesses 
        WHERE website IS NOT NULL AND website != '' 
        AND (email IS NULL OR email = '')
    """
    )
    businesses_with_website_no_email = cursor.fetchone()[0]
    print(f"  Businesses with website but NO email: {businesses_with_website_no_email}")
    print(f"  These are prime targets for email extraction!")

    # 4. Analyze website patterns
    print(f"\n🔗 WEBSITE DOMAIN ANALYSIS:")
    cursor.execute(
        """
        SELECT website FROM businesses 
        WHERE website IS NOT NULL AND website != ''
        LIMIT 500
    """
    )

    domain_counts = defaultdict(int)
    for (website,) in cursor.fetchall():
        if website:
            # Extract domain
            domain = website.lower()
            if "//" in domain:
                domain = domain.split("//")[1]
            if "/" in domain:
                domain = domain.split("/")[0]

            # Count TLD
            if "." in domain:
                tld = domain.split(".")[-1]
                domain_counts[tld] += 1

    print("  Top domain extensions:")
    for tld, count in sorted(domain_counts.items(), key=lambda x: x[1], reverse=True)[
        :10
    ]:
        print(f"    .{tld}: {count}")

    # 5. Email extraction failures analysis
    print(f"\n❌ WHY EMAILS WEREN'T FOUND:")

    # Check for websites that might be social media only
    cursor.execute(
        """
        SELECT COUNT(*) FROM businesses 
        WHERE website LIKE '%facebook.com%' 
        AND (email IS NULL OR email = '')
    """
    )
    facebook_only = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*) FROM businesses 
        WHERE (website LIKE '%instagram.com%' OR website LIKE '%linkedin.com%')
        AND (email IS NULL OR email = '')
    """
    )
    social_only = cursor.fetchone()[0]

    print(f"  Facebook pages (no email): {facebook_only}")
    print(f"  Other social media only: {social_only}")

    # 6. Sample websites without emails for investigation
    print(f"\n🔍 SAMPLE WEBSITES WITHOUT EMAILS (for investigation):")
    cursor.execute(
        """
        SELECT b.name, b.website, bt.type_name
        FROM businesses b
        JOIN business_types bt ON b.business_type_id = bt.id
        WHERE b.website IS NOT NULL AND b.website != ''
        AND (b.email IS NULL OR b.email = '')
        AND b.website NOT LIKE '%facebook.com%'
        AND b.website NOT LIKE '%instagram.com%'
        AND bt.type_name IN ('real_estate_agent', 'cleaning_company', 'moving_company', 'rv_dealer')
        LIMIT 10
    """
    )

    samples = cursor.fetchall()
    for name, website, btype in samples:
        print(f"  [{btype}] {name}")
        print(f"    Website: {website}")

    # 7. Success rate by extraction method
    print(f"\n📊 EXTRACTION METHOD ANALYSIS:")
    cursor.execute(
        """
        SELECT discovered_via, COUNT(*) as count
        FROM business_contacts
        WHERE email IS NOT NULL AND email != ''
        GROUP BY discovered_via
    """
    )

    methods = cursor.fetchall()
    for method, count in methods:
        print(f"  {method or 'Unknown'}: {count} emails")

    conn.close()


if __name__ == "__main__":
    analyze_extraction()
