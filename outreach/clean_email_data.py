#!/usr/bin/env python3
"""
Email Data Cleaner for B2B Outreach Database
Removes malformed emails and improves data quality
"""

import sqlite3
import re
from datetime import datetime


def clean_email_data():
    """Clean malformed emails from the outreach database"""

    conn = sqlite3.connect("outreach/data/b2b_outreach.db")
    cursor = conn.cursor()

    print("🧹 Starting Email Data Cleanup")
    print("=" * 50)

    # Get all business_contacts emails for analysis
    cursor.execute("SELECT id, email, business_id FROM business_contacts")
    contacts = cursor.fetchall()

    cleaned_count = 0
    deleted_count = 0

    for contact_id, email, business_id in contacts:
        original_email = email

        # Check if email is malformed
        if is_malformed_email(email):
            print(f"❌ Deleting malformed email: {email}")
            cursor.execute("DELETE FROM business_contacts WHERE id = ?", (contact_id,))
            deleted_count += 1
            continue

        # Try to clean the email
        cleaned_email = clean_email(email)

        if cleaned_email != original_email and is_valid_email(cleaned_email):
            # Check if this cleaned email already exists for this business
            cursor.execute(
                "SELECT id FROM business_contacts WHERE business_id = ? AND email = ? AND id != ?",
                (business_id, cleaned_email, contact_id),
            )
            existing = cursor.fetchone()

            if existing:
                # Delete this duplicate instead of updating
                print(
                    f"❌ Deleting duplicate after cleaning: {original_email} (cleaned to {cleaned_email})"
                )
                cursor.execute(
                    "DELETE FROM business_contacts WHERE id = ?", (contact_id,)
                )
                deleted_count += 1
            else:
                print(f"🔧 Cleaning: {original_email} → {cleaned_email}")
                cursor.execute(
                    "UPDATE business_contacts SET email = ? WHERE id = ?",
                    (cleaned_email, contact_id),
                )
                cleaned_count += 1
        elif cleaned_email != original_email:
            # If cleaning didn't produce a valid email, delete it
            print(f"❌ Deleting unfixable email: {original_email}")
            cursor.execute("DELETE FROM business_contacts WHERE id = ?", (contact_id,))
            deleted_count += 1

    # Clean business emails too
    cursor.execute(
        "SELECT id, email FROM businesses WHERE email IS NOT NULL AND email != ''"
    )
    businesses = cursor.fetchall()

    for business_id, email in businesses:
        original_email = email

        if is_malformed_email(email):
            print(f"❌ Clearing malformed business email: {email}")
            cursor.execute(
                "UPDATE businesses SET email = NULL WHERE id = ?", (business_id,)
            )
            continue

        cleaned_email = clean_email(email)

        if cleaned_email != original_email and is_valid_email(cleaned_email):
            print(f"🔧 Cleaning business: {original_email} → {cleaned_email}")
            cursor.execute(
                "UPDATE businesses SET email = ? WHERE id = ?",
                (cleaned_email, business_id),
            )
            cleaned_count += 1
        elif cleaned_email != original_email:
            print(f"❌ Clearing unfixable business email: {original_email}")
            cursor.execute(
                "UPDATE businesses SET email = NULL WHERE id = ?", (business_id,)
            )

    # Remove duplicate contacts (same business_id + email)
    print(f"\n🔍 Removing duplicate contacts...")
    cursor.execute(
        """
        DELETE FROM business_contacts 
        WHERE id NOT IN (
            SELECT MIN(id) 
            FROM business_contacts 
            GROUP BY business_id, email
        )
    """
    )
    duplicates_removed = cursor.rowcount

    conn.commit()

    # Final count
    cursor.execute("SELECT COUNT(*) FROM business_contacts")
    final_contact_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT email) FROM business_contacts")
    unique_emails = cursor.fetchone()[0]

    print(f"\n✅ Email Data Cleanup Complete!")
    print(f"   • Cleaned emails: {cleaned_count}")
    print(f"   • Deleted malformed: {deleted_count}")
    print(f"   • Removed duplicates: {duplicates_removed}")
    print(f"   • Final contact count: {final_contact_count}")
    print(f"   • Unique emails: {unique_emails}")

    conn.close()
    return unique_emails


def is_malformed_email(email):
    """Check if email is obviously malformed"""
    if not email or len(email) < 5:
        return True

    # Contains phone numbers or other non-email content
    if re.search(r"\d{3}[-.]?\d{3}[-.]?\d{4}", email):
        return True

    # Contains multiple @ symbols in wrong places
    if email.count("@") != 1:
        return True

    # Contains obvious concatenation errors
    if "comfirst" in email or "commailing" in email or "comamerican" in email:
        return True

    # Contains phone number prefixes
    if email.startswith(("406-", "59047", "59601", "59602", "541-")):
        return True

    return False


def clean_email(email):
    """Attempt to clean a malformed email"""
    if not email:
        return email

    email = email.strip().lower()

    # Remove common concatenation suffixes
    suffixes_to_remove = [
        "comfirst",
        "commailing",
        "comamerican",
        "comcole",
        "first",
        "mailing",
        "american",
        "cole",
    ]

    for suffix in suffixes_to_remove:
        if email.endswith(suffix):
            # Try to find the .com part and keep only up to that
            com_index = email.find(".com")
            if com_index > 0:
                email = email[: com_index + 4]
                break

    # Remove phone numbers from beginning
    email = re.sub(r"^[\d\-\.]+", "", email)

    # Remove zip codes from beginning
    email = re.sub(r"^59\d{3}", "", email)

    return email


def is_valid_email(email):
    """Validate email format"""
    if not email or "@" not in email:
        return False

    pattern = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$"
    return bool(re.match(pattern, email, re.IGNORECASE))


if __name__ == "__main__":
    clean_email_data()
