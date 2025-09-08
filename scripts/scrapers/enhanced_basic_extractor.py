#!/usr/bin/env python3
"""
Enhanced Basic Email Extractor - No JavaScript rendering
Advanced email extraction with deobfuscation and extended contact page search
"""

import sqlite3
import re
import time
import sys
from datetime import datetime
from typing import List, Dict, Set, Optional
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
import random

# Enhanced email patterns for deobfuscation
EMAIL_PATTERNS = [
    # Standard email pattern
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
    # Obfuscated patterns
    r"\b[A-Za-z0-9._%+-]+\s*\[\s*at\s*\]\s*[A-Za-z0-9.-]+\s*\[\s*dot\s*\]\s*[A-Z|a-z]{2,}\b",
    r"\b[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+\s*\.\s*[A-Z|a-z]{2,}\b",
    r"\b[A-Za-z0-9._%+-]+\s*\(at\)\s*[A-Za-z0-9.-]+\s*\(dot\)\s*[A-Z|a-z]{2,}\b",
    # Common obfuscation
    r"\b[A-Za-z0-9._%+-]+\s*AT\s*[A-Za-z0-9.-]+\s*DOT\s*[A-Z|a-z]{2,}\b",
    # Encoded patterns
    r"mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})",
    # Spaced patterns
    r"\b[A-Za-z0-9._%+-]+\s+@\s+[A-Za-z0-9.-]+\s+\.\s+[A-Z|a-z]{2,}\b",
]

# Common email obfuscation replacements
DEOBFUSCATION_PATTERNS = [
    (r"\s*\[at\]\s*", "@"),
    (r"\s*\(at\)\s*", "@"),
    (r"\s*\[dot\]\s*", "."),
    (r"\s*\(dot\)\s*", "."),
    (r"\s*AT\s*", "@"),
    (r"\s*DOT\s*", "."),
    (r"\s+@\s+", "@"),
    (r"\s+\.\s+", "."),
    (r"\s+", ""),
]

# Extended contact page paths
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
    "/terms",
    "/privacy",
    "/legal",
    "/sitemap",
    "/company",
    "/business",
]


class EnhancedBasicExtractor:
    """Enhanced basic email extractor with advanced deobfuscation"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
            }
        )
        self.extracted_count = 0

    def extract_from_database_batch(
        self, batch_size: int = 25, business_type: str = None
    ):
        """Extract emails from a batch of businesses without emails"""
        conn = sqlite3.connect("outreach/data/b2b_outreach.db")
        cursor = conn.cursor()

        # Build query - focus on high-priority types first
        priority_types = [
            "real_estate_agent",
            "cleaning_company",
            "moving_company",
            "rv_dealer",
            "storage_facility",
        ]

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
        elif not business_type:
            # Prioritize high-value business types
            placeholders = ",".join(["?"] * len(priority_types))
            query += f" AND bt.type_name IN ({placeholders})"
            params.extend(priority_types)

        query += " ORDER BY RANDOM() LIMIT ?"
        params.append(batch_size)

        cursor.execute(query, params)
        businesses = cursor.fetchall()
        conn.close()

        print(
            f"🎯 Enhanced Basic Email Extraction - Processing {len(businesses)} businesses"
        )
        print("=" * 70)

        total_extracted = 0

        for business_id, name, website, btype in businesses:
            print(f"\n📋 [{btype}] {name}")
            print(f"🌐 Website: {website}")

            # Try comprehensive extraction
            emails = self.extract_emails_comprehensive(website)

            if emails:
                print(f"✅ Found {len(emails)} email(s): {', '.join(emails)}")
                self.save_emails_to_database(
                    business_id, emails, "enhanced_basic_extraction"
                )
                total_extracted += len(emails)
            else:
                print("❌ No emails found")

            # Rate limiting
            time.sleep(random.uniform(1.5, 3.0))

        print(f"\n🏆 Enhanced Basic Extraction Complete!")
        print(f"📊 Total emails extracted: {total_extracted}")
        return total_extracted

    def extract_emails_comprehensive(self, website_url: str) -> List[str]:
        """Comprehensive email extraction using multiple techniques"""
        if not website_url.startswith(("http://", "https://")):
            website_url = "https://" + website_url

        all_emails = set()

        try:
            print(f"  🔍 Method 1: Main page with deobfuscation...")
            emails = self.extract_with_deobfuscation(website_url)
            all_emails.update(emails)
            if emails:
                print(f"    ✅ Found {len(emails)} emails on main page")

            # Method 2: Extended contact pages
            if len(all_emails) < 2:
                print(f"  🔍 Method 2: Extended contact pages...")
                emails = self.extract_from_contact_pages(website_url)
                all_emails.update(emails)
                if emails:
                    print(f"    ✅ Found {len(emails)} emails on contact pages")

            # Method 3: Deep HTML analysis
            if len(all_emails) < 2:
                print(f"  🔍 Method 3: Deep HTML analysis...")
                emails = self.extract_from_deep_html(website_url)
                all_emails.update(emails)
                if emails:
                    print(f"    ✅ Found {len(emails)} emails in deep HTML")

        except Exception as e:
            print(f"❌ Error in comprehensive extraction: {e}")

        return list(all_emails)

    def extract_with_deobfuscation(self, url: str) -> List[str]:
        """Enhanced extraction with deobfuscation capabilities"""
        emails = set()

        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            # Parse HTML
            soup = BeautifulSoup(response.content, "html.parser")

            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()

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

            # Check data attributes and hidden content
            contact_elements = soup.find_all(attrs={"data-email": True})
            for element in contact_elements:
                email = element.get("data-email", "").strip()
                if self.is_valid_business_email(email):
                    emails.add(email.lower())

            # Check comments in HTML
            for comment in soup.find_all(
                string=lambda text: isinstance(text, str) and "@" in text
            ):
                for pattern in EMAIL_PATTERNS:
                    matches = re.findall(pattern, str(comment), re.IGNORECASE)
                    for match in matches:
                        email = self.deobfuscate_email(match)
                        if self.is_valid_business_email(email):
                            emails.add(email.lower())

        except Exception as e:
            print(f"    ❌ Basic extraction error for {url}: {e}")

        return list(emails)

    def extract_from_contact_pages(self, base_url: str) -> List[str]:
        """Extract emails from extended contact and about pages"""
        emails = set()
        pages_checked = 0

        for path in EXTENDED_CONTACT_PATHS[:15]:  # Check more pages but with limit
            if pages_checked >= 8:  # Reasonable limit to avoid being blocked
                break

            try:
                contact_url = urljoin(base_url, path)

                # Skip if it's the same as base URL
                if contact_url.lower() == base_url.lower():
                    continue

                emails_found = self.extract_with_deobfuscation(contact_url)
                emails.update(emails_found)
                pages_checked += 1

                if len(emails) >= 3:  # Stop if we have enough emails
                    break

                # Respectful delay
                time.sleep(random.uniform(0.5, 1.5))

            except Exception as e:
                continue

        return list(emails)

    def extract_from_deep_html(self, url: str) -> List[str]:
        """Deep HTML analysis for hidden emails"""
        emails = set()

        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            # Parse HTML
            soup = BeautifulSoup(response.content, "html.parser")

            # Check form actions
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

            # Check input values and placeholders
            inputs = soup.find_all(["input", "textarea"])
            for inp in inputs:
                for attr in ["value", "placeholder", "title"]:
                    value = inp.get(attr, "")
                    if "@" in value:
                        for pattern in EMAIL_PATTERNS:
                            matches = re.findall(pattern, value, re.IGNORECASE)
                            for match in matches:
                                email = self.deobfuscate_email(match)
                                if self.is_valid_business_email(email):
                                    emails.add(email.lower())

            # Check alt text in images
            images = soup.find_all("img")
            for img in images:
                alt_text = img.get("alt", "") + " " + img.get("title", "")
                for pattern in EMAIL_PATTERNS:
                    matches = re.findall(pattern, alt_text, re.IGNORECASE)
                    for match in matches:
                        email = self.deobfuscate_email(match)
                        if self.is_valid_business_email(email):
                            emails.add(email.lower())

            # Check noscript content
            noscripts = soup.find_all("noscript")
            for noscript in noscripts:
                text = noscript.get_text()
                for pattern in EMAIL_PATTERNS:
                    matches = re.findall(pattern, text, re.IGNORECASE)
                    for match in matches:
                        email = self.deobfuscate_email(match)
                        if self.is_valid_business_email(email):
                            emails.add(email.lower())

        except Exception as e:
            print(f"    ❌ Deep HTML error for {url}: {e}")

        return list(emails)

    def deobfuscate_email(self, email_text: str) -> str:
        """Deobfuscate common email obfuscation patterns"""
        cleaned = str(email_text).strip()

        for pattern, replacement in DEOBFUSCATION_PATTERNS:
            cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

        return cleaned.strip()

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
            "support@wordpress",
            "admin@wordpress",
            "info@gmail.com",
        ]

        for pattern in invalid_patterns:
            if pattern in email:
                return False

        # Check for valid email structure
        if not re.match(
            r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$", email, re.IGNORECASE
        ):
            return False

        # Minimum length check
        if len(email) < 6:
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

    parser = argparse.ArgumentParser(description="Enhanced Basic Email Extractor")
    parser.add_argument("--batch", type=int, default=25, help="Batch size")
    parser.add_argument("--type", type=str, help="Business type to focus on")
    parser.add_argument("--test-url", type=str, help="Test extraction on specific URL")

    args = parser.parse_args()

    extractor = EnhancedBasicExtractor()

    if args.test_url:
        print(f"🧪 Testing enhanced extraction on: {args.test_url}")
        emails = extractor.extract_emails_comprehensive(args.test_url)
        print(f"📧 Found emails: {emails}")
    else:
        extractor.extract_from_database_batch(args.batch, args.type)


if __name__ == "__main__":
    main()
