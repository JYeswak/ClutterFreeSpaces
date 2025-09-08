#!/usr/bin/env python3
"""
Enhanced Email Extractor for ClutterFreeSpaces B2B Outreach
Advanced email extraction with JavaScript rendering, deobfuscation, and multi-source discovery
"""

import sqlite3
import re
import time
import asyncio
import sys
from datetime import datetime
from typing import List, Dict, Set, Optional, Tuple
from urllib.parse import urljoin, urlparse
import aiohttp
import requests
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
import random
import json

# Email patterns for deobfuscation
EMAIL_PATTERNS = [
    # Standard email pattern
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
    # Obfuscated patterns
    r"\b[A-Za-z0-9._%+-]+\s*\[\s*at\s*\]\s*[A-Za-z0-9.-]+\s*\[\s*dot\s*\]\s*[A-Z|a-z]{2,}\b",
    r"\b[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+\s*\.\s*[A-Z|a-z]{2,}\b",
    r"\b[A-Za-z0-9._%+-]+\s*\(at\)\s*[A-Za-z0-9.-]+\s*\(dot\)\s*[A-Z|a-z]{2,}\b",
    # Encoded patterns
    r"mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})",
]

# Common email obfuscation replacements
DEOBFUSCATION_PATTERNS = [
    (r"\s*\[at\]\s*", "@"),
    (r"\s*\(at\)\s*", "@"),
    (r"\s*\[dot\]\s*", "."),
    (r"\s*\(dot\)\s*", "."),
    (r"\s*AT\s*", "@"),
    (r"\s*DOT\s*", "."),
    (r"\s+", ""),
]

# Additional contact page paths
EXTENDED_CONTACT_PATHS = [
    "/contact",
    "/contact-us",
    "/contact.html",
    "/about",
    "/about-us",
    "/team",
    "/staff",
    "/leadership",
    "/management",
    "/owners",
    "/directory",
    "/people",
    "/agents",
    "/services",
    "/info",
    "/information",
    "/reach-us",
    "/get-in-touch",
    "/connect",
    "/find-us",
    "/locations",
    "/office",
    "/offices",
    "/headquarters",
    "/support",
    "/help",
    "/customer-service",
    "/customer-care",
    "/sales",
    "/inquiries",
    "/quote",
    "/request-quote",
    "/free-estimate",
    "/booking",
    "/appointments",
    "/schedule",
]


class EnhancedEmailExtractor:
    """Enhanced email extractor with JavaScript rendering and advanced techniques"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
            }
        )
        self.extracted_count = 0

    def extract_from_database_batch(
        self, batch_size: int = 50, business_type: str = None
    ):
        """Extract emails from a batch of businesses without emails"""
        conn = sqlite3.connect("outreach/data/b2b_outreach.db")
        cursor = conn.cursor()

        # Build query
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

        print(f"🎯 Enhanced Email Extraction - Processing {len(businesses)} businesses")
        print("=" * 60)

        total_extracted = 0

        for business_id, name, website, btype in businesses:
            print(f"\n📋 [{btype}] {name}")
            print(f"🌐 Website: {website}")

            # Try multiple extraction methods
            emails = self.extract_emails_comprehensive(website)

            if emails:
                print(f"✅ Found {len(emails)} email(s): {', '.join(emails)}")
                self.save_emails_to_database(business_id, emails, "enhanced_extraction")
                total_extracted += len(emails)
            else:
                print("❌ No emails found")

            # Rate limiting
            time.sleep(2)

        print(f"\n🏆 Enhanced Extraction Complete!")
        print(f"📊 Total emails extracted: {total_extracted}")
        return total_extracted

    def extract_emails_comprehensive(self, website_url: str) -> List[str]:
        """Comprehensive email extraction using multiple techniques"""
        if not website_url.startswith(("http://", "https://")):
            website_url = "https://" + website_url

        all_emails = set()

        try:
            # Method 1: Basic scraping with deobfuscation
            emails = self.extract_basic_with_deobfuscation(website_url)
            all_emails.update(emails)

            # Method 2: JavaScript rendering (if needed)
            if len(all_emails) == 0:
                emails = asyncio.run(self.extract_with_javascript(website_url))
                all_emails.update(emails)

            # Method 3: Deep link analysis
            if len(all_emails) < 2:
                emails = self.extract_from_contact_pages(website_url)
                all_emails.update(emails)

            # Method 4: Social media and external links
            if len(all_emails) < 2:
                emails = self.extract_from_external_sources(website_url)
                all_emails.update(emails)

        except Exception as e:
            print(f"❌ Error in comprehensive extraction: {e}")

        return list(all_emails)

    def extract_basic_with_deobfuscation(self, url: str) -> List[str]:
        """Basic extraction with deobfuscation capabilities"""
        emails = set()

        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            # Parse HTML
            soup = BeautifulSoup(response.content, "html.parser")

            # Extract text content
            text_content = soup.get_text()

            # Find emails with all patterns
            for pattern in EMAIL_PATTERNS:
                matches = re.findall(pattern, text_content, re.IGNORECASE)
                for match in matches:
                    email = self.deobfuscate_email(match)
                    if self.is_valid_business_email(email):
                        emails.add(email.lower())

            # Check mailto links
            mailto_links = soup.find_all("a", href=re.compile(r"^mailto:", re.I))
            for link in mailto_links:
                href = link.get("href", "")
                email_match = re.search(r"mailto:([^?]+)", href, re.I)
                if email_match:
                    email = email_match.group(1).strip()
                    if self.is_valid_business_email(email):
                        emails.add(email.lower())

            # Check form actions and hidden fields
            forms = soup.find_all("form")
            for form in forms:
                action = form.get("action", "")
                if "@" in action:
                    email_match = re.search(
                        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}", action
                    )
                    if email_match and self.is_valid_business_email(
                        email_match.group(0)
                    ):
                        emails.add(email_match.group(0).lower())

            # Check meta tags
            meta_tags = soup.find_all("meta")
            for meta in meta_tags:
                content = (
                    meta.get("content", "")
                    + " "
                    + meta.get("name", "")
                    + " "
                    + meta.get("property", "")
                )
                for pattern in EMAIL_PATTERNS:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    for match in matches:
                        email = self.deobfuscate_email(match)
                        if self.is_valid_business_email(email):
                            emails.add(email.lower())

        except Exception as e:
            print(f"❌ Basic extraction error for {url}: {e}")

        return list(emails)

    async def extract_with_javascript(self, url: str) -> List[str]:
        """Extract emails using JavaScript rendering with Playwright"""
        emails = set()

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
                )
                page = await context.new_page()

                # Navigate and wait for content
                await page.goto(url, timeout=30000)
                await page.wait_for_timeout(3000)  # Wait for JavaScript to load

                # Get page content after JavaScript execution
                content = await page.content()
                text_content = await page.evaluate("document.body.innerText")

                # Parse with BeautifulSoup
                soup = BeautifulSoup(content, "html.parser")

                # Extract emails from rendered content
                for pattern in EMAIL_PATTERNS:
                    matches = re.findall(pattern, text_content, re.IGNORECASE)
                    for match in matches:
                        email = self.deobfuscate_email(match)
                        if self.is_valid_business_email(email):
                            emails.add(email.lower())

                # Check for dynamically loaded contact info
                contact_elements = await page.query_selector_all(
                    "[data-email], [data-contact], .email, .contact-email"
                )
                for element in contact_elements:
                    text = await element.inner_text()
                    for pattern in EMAIL_PATTERNS:
                        matches = re.findall(pattern, text, re.IGNORECASE)
                        for match in matches:
                            email = self.deobfuscate_email(match)
                            if self.is_valid_business_email(email):
                                emails.add(email.lower())

                await browser.close()

        except Exception as e:
            print(f"❌ JavaScript extraction error for {url}: {e}")

        return list(emails)

    def extract_from_contact_pages(self, base_url: str) -> List[str]:
        """Extract emails from contact and about pages"""
        emails = set()

        for path in EXTENDED_CONTACT_PATHS[:10]:  # Limit to avoid being blocked
            try:
                contact_url = urljoin(base_url, path)
                emails_found = self.extract_basic_with_deobfuscation(contact_url)
                emails.update(emails_found)

                if len(emails) >= 3:  # Stop if we have enough emails
                    break

                time.sleep(1)  # Rate limiting

            except Exception as e:
                continue

        return list(emails)

    def extract_from_external_sources(self, url: str) -> List[str]:
        """Extract emails from social media profiles and external directories"""
        emails = set()

        try:
            # Parse domain for company name
            domain = urlparse(url).netloc.replace("www.", "")
            company_name = domain.split(".")[0]

            # Try common email patterns
            common_prefixes = [
                "info",
                "contact",
                "hello",
                "admin",
                "support",
                "sales",
                "office",
            ]
            for prefix in common_prefixes:
                potential_email = f"{prefix}@{domain}"
                # Note: In a production system, you'd validate these emails
                # For now, we'll just add them as potential contacts to verify later

        except Exception as e:
            pass

        return list(emails)

    def deobfuscate_email(self, email_text: str) -> str:
        """Deobfuscate common email obfuscation patterns"""
        cleaned = email_text.strip()

        for pattern, replacement in DEOBFUSCATION_PATTERNS:
            cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

        return cleaned

    def is_valid_business_email(self, email: str) -> bool:
        """Validate if email is a legitimate business email"""
        if not email or "@" not in email:
            return False

        email = email.lower().strip()

        # Filter out common false positives
        invalid_patterns = [
            "example.com",
            "test.com",
            "demo.com",
            "placeholder.com",
            "yoursite.com",
            "yourdomain.com",
            "domain.com",
            "email.com",
            "noreply",
            "no-reply",
            "donotreply",
            "privacy@",
            "abuse@",
            "postmaster@",
            "webmaster@",
            "admin@localhost",
            "root@localhost",
        ]

        for pattern in invalid_patterns:
            if pattern in email:
                return False

        # Check for valid email structure
        if not re.match(
            r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$", email, re.IGNORECASE
        ):
            return False

        return True

    def save_emails_to_database(self, business_id: int, emails: List[str], method: str):
        """Save extracted emails to the database"""
        if not emails:
            return

        conn = sqlite3.connect("outreach/data/b2b_outreach.db")
        cursor = conn.cursor()

        try:
            # Update business with primary email
            primary_email = emails[0]
            cursor.execute(
                "UPDATE businesses SET email = ?, updated_at = datetime('now') WHERE id = ?",
                (primary_email, business_id),
            )

            # Add all emails as contacts
            for email in emails:
                cursor.execute(
                    """
                    INSERT OR IGNORE INTO business_contacts 
                    (business_id, email, discovered_via, status, created_at)
                    VALUES (?, ?, ?, 'active', datetime('now'))
                """,
                    (business_id, email, method),
                )

            conn.commit()
            self.extracted_count += len(emails)

        except Exception as e:
            print(f"❌ Database error: {e}")
        finally:
            conn.close()


def main():
    """Main function"""
    import argparse

    parser = argparse.ArgumentParser(description="Enhanced Email Extractor")
    parser.add_argument("--batch", type=int, default=50, help="Batch size")
    parser.add_argument("--type", type=str, help="Business type to focus on")
    parser.add_argument("--test-url", type=str, help="Test extraction on specific URL")

    args = parser.parse_args()

    extractor = EnhancedEmailExtractor()

    if args.test_url:
        print(f"🧪 Testing extraction on: {args.test_url}")
        emails = extractor.extract_emails_comprehensive(args.test_url)
        print(f"📧 Found emails: {emails}")
    else:
        extractor.extract_from_database_batch(args.batch, args.type)


if __name__ == "__main__":
    main()
