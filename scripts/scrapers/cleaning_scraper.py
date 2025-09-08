#!/usr/bin/env python3
"""
Manual website scraper for cleaning companies
Extracts contact information from cleaning company websites
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

        print(f"🧹 Scraping cleaning company: {url}")
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Extract all text content
        text_content = soup.get_text()

        # Find email addresses using regex
        email_pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
        emails = set(re.findall(email_pattern, text_content))

        # Filter out common false positives
        filtered_emails = set()
        for email in emails:
            if not any(
                x in email.lower()
                for x in [
                    "example.com",
                    "test.com",
                    "domain.com",
                    "yoursite.com",
                    "placeholder",
                    "noreply",
                    "no-reply",
                ]
            ):
                filtered_emails.add(email)

        return list(filtered_emails)

    except Exception as e:
        print(f"❌ Error scraping {url}: {str(e)}")
        return []


def get_cleaning_companies():
    """Get cleaning companies without email addresses for manual scraping"""
    conn = sqlite3.connect(".claude/data/metrics.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT b.id, b.name, b.website, bt.type_name 
        FROM businesses b
        JOIN business_types bt ON b.business_type_id = bt.id
        WHERE bt.type_name = 'cleaning_company' 
        AND b.website IS NOT NULL 
        AND b.website != '' 
        AND (b.email IS NULL OR b.email = '') 
        ORDER BY b.name 
        LIMIT 15
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
            notes = COALESCE(notes, '') || 'Email extracted via cleaning company scraper on ' || datetime('now') || '. ',
            updated_at = datetime('now')
        WHERE id = ?
    """,
        (primary_email, business_id),
    )

    conn.commit()
    conn.close()

    print(f"✅ Updated cleaning company {business_id} with email: {primary_email}")


def main():
    """Main manual scraping function for cleaning companies"""
    print("🧹 Starting Cleaning Company Website Scraping")
    print("=" * 50)

    businesses = get_cleaning_companies()

    if not businesses:
        print("No cleaning companies found for manual scraping.")
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

        # Rate limiting
        time.sleep(3)

    print(f"\n🏆 Cleaning Company Scraping Complete!")
    print(f"📊 Total emails extracted: {total_emails_found}")


if __name__ == "__main__":
    main()
