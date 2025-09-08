#!/usr/bin/env python3
"""
ClutterFreeSpaces Website Contact Extractor
Scrapes business websites to extract contact information (emails, phones)

Usage:
    python3 website_contact_extractor.py --batch=50
    python3 website_contact_extractor.py --business-id=123
    python3 website_contact_extractor.py --website=https://example.com
"""

import argparse
import time
import re
import sys
from datetime import datetime
from typing import List, Dict, Optional, Set, Tuple
from pathlib import Path
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
import random

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

from outreach.config.settings import (
    EMAIL_PATTERNS,
    PHONE_PATTERNS,
    CONTACT_PATHS,
    SCRAPING_DELAY_SECONDS,
    MAX_RETRIES,
    USER_AGENTS,
    logger,
)
from outreach.lib.database import db


class WebsiteContactExtractor:
    """Extract contact information from business websites"""

    def __init__(self):
        self.logger = logger
        self.session = requests.Session()
        self.session.timeout = 30

        # Set a random user agent
        self.session.headers.update(
            {
                "User-Agent": random.choice(USER_AGENTS),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
            }
        )

    def extract_contact_info(self, website_url: str) -> Dict:
        """
        Extract contact information from a website
        Returns dict with emails, phones, and other contact info
        """
        contact_info = {
            "website": website_url,
            "emails": set(),
            "phones": set(),
            "social_links": {},
            "contact_pages": [],
            "extracted_at": datetime.now().isoformat(),
        }

        try:
            # Normalize URL
            if not website_url.startswith(("http://", "https://")):
                website_url = "https://" + website_url

            # First, try to extract from the main page
            main_page_info = self._scrape_page_for_contacts(website_url)
            if main_page_info:
                contact_info["emails"].update(main_page_info.get("emails", []))
                contact_info["phones"].update(main_page_info.get("phones", []))
                contact_info["social_links"].update(
                    main_page_info.get("social_links", {})
                )

            # Then try common contact pages
            for contact_path in CONTACT_PATHS:
                contact_url = urljoin(website_url, contact_path)

                # Skip if we've already found sufficient contact info
                if (
                    len(contact_info["emails"]) >= 3
                    and len(contact_info["phones"]) >= 2
                ):
                    break

                try:
                    page_info = self._scrape_page_for_contacts(contact_url)
                    if page_info:
                        contact_info["emails"].update(page_info.get("emails", []))
                        contact_info["phones"].update(page_info.get("phones", []))
                        contact_info["social_links"].update(
                            page_info.get("social_links", {})
                        )
                        contact_info["contact_pages"].append(contact_url)

                    # Respectful delay between page requests
                    time.sleep(SCRAPING_DELAY_SECONDS / 2)

                except Exception as e:
                    self.logger.debug(f"Could not scrape {contact_url}: {e}")
                    continue

        except Exception as e:
            self.logger.error(f"Error extracting contact info from {website_url}: {e}")

        # Convert sets to lists for JSON serialization
        contact_info["emails"] = list(contact_info["emails"])
        contact_info["phones"] = list(contact_info["phones"])

        return contact_info

    def _scrape_page_for_contacts(self, url: str) -> Optional[Dict]:
        """Scrape a single page for contact information"""
        try:
            response = self.session.get(url)
            response.raise_for_status()

            # Parse the HTML
            soup = BeautifulSoup(response.content, "html.parser")

            # Extract text content for pattern matching
            page_text = soup.get_text()

            # Find emails
            emails = self._extract_emails(page_text, soup)

            # Find phone numbers
            phones = self._extract_phones(page_text, soup)

            # Find social media links
            social_links = self._extract_social_links(soup)

            return {
                "emails": emails,
                "phones": phones,
                "social_links": social_links,
                "url": url,
            }

        except requests.RequestException as e:
            self.logger.debug(f"Request failed for {url}: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Error scraping {url}: {e}")
            return None

    def _extract_emails(self, page_text: str, soup: BeautifulSoup) -> Set[str]:
        """Extract email addresses from page text and HTML"""
        emails = set()

        # Search in page text
        for pattern in EMAIL_PATTERNS:
            matches = re.findall(pattern, page_text, re.IGNORECASE)
            for match in matches:
                # Clean up the email
                email = match.lower().strip()
                if self._is_valid_email(email):
                    emails.add(email)

        # Search in mailto links
        mailto_links = soup.find_all("a", href=re.compile(r"^mailto:", re.I))
        for link in mailto_links:
            href = link.get("href", "")
            email_match = re.search(r"mailto:([^?]+)", href, re.I)
            if email_match:
                email = email_match.group(1).lower().strip()
                if self._is_valid_email(email):
                    emails.add(email)

        return emails

    def _extract_phones(self, page_text: str, soup: BeautifulSoup) -> Set[str]:
        """Extract phone numbers from page text"""
        phones = set()

        for pattern in PHONE_PATTERNS:
            matches = re.findall(pattern, page_text)
            for match in matches:
                # Clean up the phone number
                phone = re.sub(r"[^\d]", "", match)
                # Focus on US phone numbers (10 digits)
                if len(phone) == 10:
                    # Format as (XXX) XXX-XXXX
                    formatted_phone = f"({phone[:3]}) {phone[3:6]}-{phone[6:]}"
                    phones.add(formatted_phone)
                elif len(phone) == 11 and phone.startswith("1"):
                    # Handle +1 prefix
                    phone = phone[1:]
                    formatted_phone = f"({phone[:3]}) {phone[3:6]}-{phone[6:]}"
                    phones.add(formatted_phone)

        return phones

    def _extract_social_links(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract social media links"""
        social_platforms = {
            "facebook": ["facebook.com", "fb.com"],
            "linkedin": ["linkedin.com"],
            "twitter": ["twitter.com", "x.com"],
            "instagram": ["instagram.com"],
            "youtube": ["youtube.com", "youtu.be"],
        }

        social_links = {}

        # Find all links
        links = soup.find_all("a", href=True)

        for link in links:
            href = link.get("href", "").lower()

            for platform, domains in social_platforms.items():
                for domain in domains:
                    if domain in href and platform not in social_links:
                        # Clean up the URL
                        if href.startswith("//"):
                            href = "https:" + href
                        elif not href.startswith(("http://", "https://")):
                            href = "https://" + href

                        social_links[platform] = href
                        break

        return social_links

    def _is_valid_email(self, email: str) -> bool:
        """Validate email address and filter out common false positives"""
        if not email or "@" not in email:
            return False

        # Filter out common false positives
        false_positives = [
            "example.com",
            "test.com",
            "demo.com",
            "placeholder.com",
            "yoursite.com",
            "yourdomain.com",
            "email.com",
            "mail.com",
            "@sentry.wixpress.com",
            "@wix.com",
            "noreply@",
            "no-reply@",
            "@googletagmanager.com",
            "@google-analytics.com",
        ]

        for fp in false_positives:
            if fp in email.lower():
                return False

        # Basic email format validation
        try:
            local, domain = email.split("@")
            if not local or not domain or "." not in domain:
                return False
            return True
        except ValueError:
            return False

    def enrich_businesses_batch(
        self, batch_size: int = 50, status_filter: str = None
    ) -> int:
        """
        Enrich businesses in batch by extracting contact info from their websites
        Returns number of businesses processed
        """
        # Get businesses that have websites but need contact enrichment
        filters = {}
        if status_filter:
            filters["status"] = status_filter

        # Find businesses with websites but missing contact info
        query = """
        SELECT b.id, b.name, b.website, b.email, b.phone, b.city, b.state
        FROM businesses b 
        WHERE b.website IS NOT NULL 
            AND b.website != ''
            AND (b.email IS NULL OR b.email = '')
        ORDER BY b.partnership_potential DESC, b.created_at DESC
        LIMIT ?
        """

        businesses = db.execute_query(query, (batch_size,))

        if not businesses:
            self.logger.info("No businesses found that need contact enrichment")
            return 0

        processed_count = 0

        for business in businesses:
            business_dict = dict(business)
            self.logger.info(
                f"Enriching: {business_dict['name']} - {business_dict['website']}"
            )

            try:
                # Extract contact info from website
                contact_info = self.extract_contact_info(business_dict["website"])

                # Prepare updates
                updates = {}

                # Update email if found
                if contact_info["emails"]:
                    # Use the first email found (could be improved with better selection logic)
                    updates["email"] = contact_info["emails"][0]

                # Update phone if found and not already present
                if contact_info["phones"] and not business_dict["phone"]:
                    updates["phone"] = contact_info["phones"][0]

                # Update social media links
                if contact_info["social_links"]:
                    if contact_info["social_links"].get("facebook"):
                        updates["facebook_url"] = contact_info["social_links"][
                            "facebook"
                        ]
                    if contact_info["social_links"].get("linkedin"):
                        updates["linkedin_url"] = contact_info["social_links"][
                            "linkedin"
                        ]

                # Update last verified timestamp
                updates["last_verified"] = datetime.now().isoformat()

                # Save updates to database
                if updates:
                    rows_updated = db.update_business(business_dict["id"], updates)
                    if rows_updated:
                        self.logger.info(
                            f"Updated {business_dict['name']} with: {list(updates.keys())}"
                        )

                        # Create contact records for additional emails/phones found
                        self._create_contact_records(business_dict["id"], contact_info)

                processed_count += 1

                # Respectful delay between website scrapes
                time.sleep(SCRAPING_DELAY_SECONDS)

            except Exception as e:
                self.logger.error(f"Error enriching {business_dict['name']}: {e}")
                continue

        return processed_count

    def _create_contact_records(self, business_id: int, contact_info: Dict) -> None:
        """Create individual contact records from extracted information"""
        # For now, we'll create generic contact records for additional emails found
        # In the future, this could be enhanced to identify specific people

        for i, email in enumerate(
            contact_info["emails"][1:], 1
        ):  # Skip first email (used for business)
            contact_data = {
                "business_id": business_id,
                "email": email,
                "discovered_via": "website_scrape",
                "title": f"Contact {i}",  # Generic title
                "status": "discovered",
            }

            try:
                contact_id = db.insert_contact(contact_data)
                if contact_id:
                    self.logger.info(
                        f"Created contact record for {email} (ID: {contact_id})"
                    )
            except Exception as e:
                self.logger.error(f"Error creating contact for {email}: {e}")

    def enrich_single_business(self, business_id: int) -> bool:
        """Enrich a single business by ID"""
        business = db.get_business(business_id)
        if not business:
            self.logger.error(f"Business ID {business_id} not found")
            return False

        if not business.get("website"):
            self.logger.error(f"Business {business['name']} has no website to scrape")
            return False

        self.logger.info(
            f"Enriching business: {business['name']} - {business['website']}"
        )

        try:
            contact_info = self.extract_contact_info(business["website"])

            updates = {}

            if contact_info["emails"] and not business.get("email"):
                updates["email"] = contact_info["emails"][0]

            if contact_info["phones"] and not business.get("phone"):
                updates["phone"] = contact_info["phones"][0]

            if contact_info["social_links"]:
                if contact_info["social_links"].get("facebook") and not business.get(
                    "facebook_url"
                ):
                    updates["facebook_url"] = contact_info["social_links"]["facebook"]
                if contact_info["social_links"].get("linkedin") and not business.get(
                    "linkedin_url"
                ):
                    updates["linkedin_url"] = contact_info["social_links"]["linkedin"]

            updates["last_verified"] = datetime.now().isoformat()

            if updates:
                rows_updated = db.update_business(business_id, updates)
                if rows_updated:
                    self.logger.info(f"Updated business with: {list(updates.keys())}")
                    self._create_contact_records(business_id, contact_info)
                    return True

        except Exception as e:
            self.logger.error(f"Error enriching business: {e}")

        return False

    def extract_from_url(self, website_url: str) -> Dict:
        """Extract contact info from a single URL (for testing)"""
        return self.extract_contact_info(website_url)


def main():
    """Main function for command-line usage"""
    parser = argparse.ArgumentParser(
        description="Extract contact information from business websites"
    )
    parser.add_argument(
        "--batch",
        type=int,
        default=50,
        help="Process businesses in batch (default: 50)",
    )
    parser.add_argument(
        "--business-id", type=int, help="Enrich a specific business by ID"
    )
    parser.add_argument(
        "--website", help="Extract contact info from a specific website URL"
    )
    parser.add_argument("--status", help="Filter businesses by status")
    parser.add_argument(
        "--dry-run", action="store_true", help="Show results without saving to database"
    )

    args = parser.parse_args()

    extractor = WebsiteContactExtractor()

    if args.website:
        # Extract from specific website
        print(f"🔍 Extracting contact info from: {args.website}")
        contact_info = extractor.extract_from_url(args.website)

        print(f"\n📧 Emails found: {len(contact_info['emails'])}")
        for email in contact_info["emails"]:
            print(f"   • {email}")

        print(f"\n📞 Phone numbers found: {len(contact_info['phones'])}")
        for phone in contact_info["phones"]:
            print(f"   • {phone}")

        print(f"\n🔗 Social media links found: {len(contact_info['social_links'])}")
        for platform, url in contact_info["social_links"].items():
            print(f"   • {platform.title()}: {url}")

        if contact_info["contact_pages"]:
            print(f"\n📄 Contact pages checked:")
            for page in contact_info["contact_pages"]:
                print(f"   • {page}")

    elif args.business_id:
        # Enrich specific business
        print(f"🏢 Enriching business ID: {args.business_id}")
        if not args.dry_run:
            success = extractor.enrich_single_business(args.business_id)
            if success:
                print("✅ Business enriched successfully")
            else:
                print("❌ Failed to enrich business")
        else:
            business = db.get_business(args.business_id)
            if business and business.get("website"):
                contact_info = extractor.extract_from_url(business["website"])
                print(f"Would update {business['name']} with:")
                print(f"   Emails: {contact_info['emails']}")
                print(f"   Phones: {contact_info['phones']}")
            else:
                print("❌ Business not found or has no website")

    else:
        # Batch enrichment
        print(f"🔄 Processing {args.batch} businesses for contact enrichment...")

        if not args.dry_run:
            processed_count = extractor.enrich_businesses_batch(args.batch, args.status)
            print(f"✅ Processed {processed_count} businesses")
        else:
            # Show what would be processed
            query = """
            SELECT b.id, b.name, b.website, b.city, b.state
            FROM businesses b 
            WHERE b.website IS NOT NULL 
                AND b.website != ''
                AND (b.email IS NULL OR b.email = '')
            ORDER BY b.partnership_potential DESC
            LIMIT ?
            """

            businesses = db.execute_query(query, (args.batch,))
            print(f"Would process {len(businesses)} businesses:")

            for i, business in enumerate(businesses[:10], 1):
                print(f"   {i}. {business['name']} - {business['website']}")

            if len(businesses) > 10:
                print(f"   ... and {len(businesses) - 10} more")


if __name__ == "__main__":
    main()
