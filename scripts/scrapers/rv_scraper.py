#!/usr/bin/env python3
"""
Manual website scraper for RV dealers and RV parks
Extracts contact information from RV business websites
"""

import requests
from bs4 import BeautifulSoup
import sqlite3
import re
from urllib.parse import urljoin
import time
import sys


def extract_emails_from_website(url):
    """Extract email addresses from a website"""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        print(f"🚐 Scraping RV business: {url}")
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Extract all text content
        text_content = soup.get_text()

        # Also look for email links
        mailto_links = soup.find_all("a", href=re.compile(r"^mailto:"))
        mailto_emails = [link["href"].replace("mailto:", "") for link in mailto_links]

        # Find email addresses using regex
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        text_emails = set(re.findall(email_pattern, text_content))

        # Combine all emails
        all_emails = set(mailto_emails + list(text_emails))

        # Filter out common false positives
        filtered_emails = set()
        for email in all_emails:
            email_clean = email.strip().lower()
            if (
                not any(
                    x in email_clean
                    for x in [
                        "example.com",
                        "test.com",
                        "domain.com",
                        "yoursite.com",
                        "placeholder",
                        "noreply",
                        "no-reply",
                        "privacy@",
                        "abuse@",
                    ]
                )
                and "@" in email_clean
            ):
                filtered_emails.add(email.strip())

        return list(filtered_emails)

    except Exception as e:
        print(f"❌ Error scraping {url}: {str(e)}")
        return []


def get_rv_businesses():
    """Get RV businesses without email addresses for manual scraping"""
    conn = sqlite3.connect(".claude/data/metrics.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT b.id, b.name, b.website, bt.type_name 
        FROM businesses b
        JOIN business_types bt ON b.business_type_id = bt.id
        WHERE bt.type_name IN ('rv_dealer', 'rv_park') 
        AND b.website IS NOT NULL 
        AND b.website != '' 
        AND (b.email IS NULL OR b.email = '') 
        ORDER BY bt.type_name, b.name 
        LIMIT 20
    """
    )

    businesses = cursor.fetchall()
    conn.close()

    return businesses


def update_business_email(business_id, emails):
    """Update business record with extracted email"""
    if not emails:
        return

    conn = sqlite3.connect(".claude/data/metrics.db")
    cursor = conn.cursor()

    # Use the first email found
    primary_email = emails[0]

    cursor.execute(
        """
        UPDATE businesses 
        SET email = ?,
            notes = COALESCE(notes, '') || 'Email extracted via RV scraper on ' || datetime('now') || '. ',
            updated_at = datetime('now')
        WHERE id = ?
    """,
        (primary_email, business_id),
    )

    conn.commit()
    conn.close()

    print(f"✅ Updated RV business {business_id} with email: {primary_email}")


def main():
    """Main manual scraping function for RV businesses"""
    print("🚐 Starting RV Business Website Scraping")
    print("=" * 45)

    businesses = get_rv_businesses()

    if not businesses:
        print("No RV businesses found for manual scraping.")
        return

    total_emails_found = 0

    for business_id, name, website, business_type in businesses:
        print(f"\n🏢 Business: {name} ({business_type})")
        print(f"🌐 Website: {website}")

        emails = extract_emails_from_website(website)

        if emails:
            print(f"📧 Found {len(emails)} email(s): {', '.join(emails)}")
            update_business_email(business_id, emails)
            total_emails_found += len(emails)
        else:
            print("❌ No emails found")

        # Rate limiting - RV sites can be slower
        time.sleep(4)

    print(f"\n🏆 RV Business Scraping Complete!")
    print(f"📊 Total emails extracted: {total_emails_found}")


if __name__ == "__main__":
    main()
