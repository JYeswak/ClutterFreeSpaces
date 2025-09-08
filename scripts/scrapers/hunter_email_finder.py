#!/usr/bin/env python3
"""
Hunter.io Email Finder for ClutterFreeSpaces B2B Outreach
Discovers email addresses for businesses using the Hunter.io API
"""

import os
import sqlite3
import requests
import time
import sys
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import urlparse
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class HunterEmailFinder:
    """Hunter.io API integration for email discovery"""

    def __init__(self):
        # Try both possible environment variable names
        self.api_key = os.getenv("HUNTER_API_KEY") or os.getenv("HUNTER.IO_API_KEY")
        if not self.api_key:
            raise ValueError("HUNTER_API_KEY not found in environment variables")

        self.base_url = "https://api.hunter.io/v2"
        self.session = requests.Session()
        self.found_count = 0
        self.api_calls_made = 0

    def find_emails_for_businesses_without_emails(
        self, batch_size: int = 20, business_type: str = None
    ):
        """Find emails for businesses that don't have emails but have websites"""
        conn = sqlite3.connect("outreach/data/b2b_outreach.db")
        cursor = conn.cursor()

        # Get businesses with websites but no emails
        query = """
            SELECT b.id, b.name, b.website, bt.type_name
            FROM businesses b
            JOIN business_types bt ON b.business_type_id = bt.id
            WHERE b.website IS NOT NULL AND b.website != ''
            AND (b.email IS NULL OR b.email = '')
        """

        params = []
        if business_type:
            query += " AND bt.type_name = ?"
            params.append(business_type)

        query += " ORDER BY RANDOM() LIMIT ?"
        params.append(batch_size)

        cursor.execute(query, params)
        businesses = cursor.fetchall()
        conn.close()

        print(f"🔍 Hunter.io Email Discovery - Processing {len(businesses)} businesses")
        print("=" * 70)

        total_found = 0

        for business_id, name, website, btype in businesses:
            print(f"\n📋 [{btype}] {name}")
            print(f"🌐 Website: {website}")

            # Extract domain from website
            domain = self.extract_domain(website)
            if not domain:
                print("❌ Could not extract domain")
                continue

            print(f"🔍 Searching domain: {domain}")

            # Search for emails using Hunter.io
            emails = self.search_domain_emails(domain)

            if emails:
                print(
                    f"✅ Found {len(emails)} email(s): {', '.join([e['value'] for e in emails])}"
                )
                self.save_emails_to_database(business_id, emails, "hunter_io_discovery")
                total_found += len(emails)
            else:
                print("❌ No emails found via Hunter.io")

            # Rate limiting - Hunter.io allows 10 calls/second for paid plans
            time.sleep(0.5)

        print(f"\n🏆 Hunter.io Discovery Complete!")
        print(f"📊 Total emails found: {total_found}")
        print(f"🌐 API calls made: {self.api_calls_made}")

        return total_found

    def extract_domain(self, website: str) -> Optional[str]:
        """Extract clean domain from website URL"""
        try:
            if not website.startswith(("http://", "https://")):
                website = "https://" + website

            parsed = urlparse(website)
            domain = parsed.netloc.lower()

            # Remove www. prefix
            if domain.startswith("www."):
                domain = domain[4:]

            return domain
        except Exception as e:
            print(f"❌ Error extracting domain from {website}: {e}")
            return None

    def search_domain_emails(self, domain: str) -> List[Dict]:
        """Search for emails on a domain using Hunter.io Domain Search API"""
        try:
            url = f"{self.base_url}/domain-search"
            params = {
                "domain": domain,
                "api_key": self.api_key,
                "limit": 10,  # Limit results to avoid hitting API limits
                "type": "personal",  # Focus on personal emails, not generic ones
            }

            response = self.session.get(url, params=params, timeout=30)
            self.api_calls_made += 1

            if response.status_code == 200:
                data = response.json()

                if data.get("data") and data["data"].get("emails"):
                    emails = data["data"]["emails"]

                    # Filter and format emails
                    valid_emails = []
                    for email_data in emails:
                        email = email_data.get("value", "").lower()

                        # Filter out generic/role-based emails
                        if self.is_valid_business_email(email):
                            valid_emails.append(
                                {
                                    "value": email,
                                    "type": email_data.get("type", "unknown"),
                                    "confidence": email_data.get("confidence", 0),
                                    "first_name": email_data.get("first_name", ""),
                                    "last_name": email_data.get("last_name", ""),
                                    "position": email_data.get("position", ""),
                                }
                            )

                    return valid_emails

            elif response.status_code == 429:
                print("⚠️  Rate limit reached, waiting...")
                time.sleep(60)  # Wait 1 minute
                return self.search_domain_emails(domain)  # Retry

            elif response.status_code == 401:
                print("❌ Invalid API key")
                return []

            else:
                print(f"❌ Hunter.io API error: {response.status_code}")
                return []

        except Exception as e:
            print(f"❌ Error searching domain {domain}: {e}")
            return []

    def is_valid_business_email(self, email: str) -> bool:
        """Validate if email is a legitimate business email (not generic)"""
        if not email or "@" not in email:
            return False

        email = email.lower().strip()

        # Filter out generic/role-based emails
        generic_prefixes = [
            "noreply",
            "no-reply",
            "donotreply",
            "support",
            "help",
            "info",
            "admin",
            "webmaster",
            "postmaster",
            "abuse",
            "privacy",
            "legal",
            "marketing",
            "sales",
            "billing",
            "accounts",
        ]

        email_prefix = email.split("@")[0]

        for generic in generic_prefixes:
            if generic in email_prefix:
                return False

        # Filter out common test/example domains
        invalid_domains = [
            "example.com",
            "test.com",
            "demo.com",
            "placeholder.com",
            "yoursite.com",
            "yourdomain.com",
            "domain.com",
        ]

        for domain in invalid_domains:
            if domain in email:
                return False

        return True

    def save_emails_to_database(
        self, business_id: int, emails: List[Dict], method: str
    ):
        """Save Hunter.io discovered emails to the database"""
        if not emails:
            return

        conn = sqlite3.connect("outreach/data/b2b_outreach.db")
        cursor = conn.cursor()

        try:
            # Update business with primary email (highest confidence)
            primary_email = max(emails, key=lambda x: x.get("confidence", 0))
            cursor.execute(
                "UPDATE businesses SET email = ?, updated_at = datetime('now') WHERE id = ?",
                (primary_email["value"], business_id),
            )

            # Add all emails as contacts with Hunter.io metadata
            for email_data in emails:
                cursor.execute(
                    """
                    INSERT OR IGNORE INTO business_contacts 
                    (business_id, first_name, last_name, title, email, 
                     discovered_via, status, confidence_score, contact_type, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, datetime('now'))
                """,
                    (
                        business_id,
                        email_data.get("first_name", ""),
                        email_data.get("last_name", ""),
                        email_data.get("position", ""),
                        email_data["value"],
                        method,
                        email_data.get("confidence", 0),
                        email_data.get("type", "personal"),
                    ),
                )

            conn.commit()
            self.found_count += len(emails)

        except Exception as e:
            print(f"❌ Database error: {e}")
        finally:
            conn.close()


def main():
    """Main function"""
    import argparse

    parser = argparse.ArgumentParser(description="Hunter.io Email Discovery")
    parser.add_argument("--batch", type=int, default=20, help="Batch size")
    parser.add_argument("--type", type=str, help="Business type to focus on")
    parser.add_argument(
        "--test-domain", type=str, help="Test Hunter.io on specific domain"
    )

    args = parser.parse_args()

    try:
        finder = HunterEmailFinder()

        if args.test_domain:
            print(f"🧪 Testing Hunter.io on domain: {args.test_domain}")
            emails = finder.search_domain_emails(args.test_domain)
            print(f"📧 Found emails: {[e['value'] for e in emails]}")
        else:
            finder.find_emails_for_businesses_without_emails(args.batch, args.type)

    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("Please ensure HUNTER_API_KEY is set in your .env file")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
