#!/usr/bin/env python3
"""
Flexible Daily Campaign Sender
Sends to available contacts rather than hardcoded campaign types
"""

import sys
import os
import sqlite3
from datetime import datetime
from typing import List, Dict, Any

sys.path.append("outreach/campaigns")
from email_campaign_manager import EmailCampaignManager


class FlexibleCampaignSender:
    def __init__(self):
        self.db_path = "outreach/data/b2b_outreach.db"
        self.manager = EmailCampaignManager()

        # Business type to campaign template mapping
        self.template_mapping = {
            "real_estate_agent": "real_estate_email1",
            "property_management": "real_estate_email1",
            "insurance_agent": "insurance_agent_email1",
            "estate_attorney": "estate_attorney_email1",
            "divorce_attorney": "estate_attorney_email1",
            "senior_living": "senior_living_email1",
            "elderly_care": "senior_living_email1",
            "home_health_agency": "senior_living_email1",
            "storage_facility": "storage_facilities_email1",
            "home_builder": "home_builder_email1",
            "property_inspector": "property_inspector_email1",
            "home_stager": "home_stager_email1",
            "bank_mortgage": "bank_mortgage_email1",
        }

    def get_available_contacts(self, limit: int = 40) -> List[Dict[str, Any]]:
        """Get available contacts that haven't been emailed in 15 days"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        query = """
        SELECT
            bc.id,
            bc.email,
            bc.first_name || ' ' || COALESCE(bc.last_name, '') as name,
            b.name as business_name,
            bt.type_name as business_type
        FROM business_contacts bc
        JOIN businesses b ON bc.business_id = b.id
        LEFT JOIN business_types bt ON b.business_type_id = bt.id
        JOIN email_validations ev ON bc.email = ev.email
        WHERE ev.result = 'deliverable'
          AND bc.email NOT IN (
            SELECT DISTINCT email_address
            FROM campaign_sends
            WHERE email_address IS NOT NULL
          )
        ORDER BY bc.id
        LIMIT ?
        """

        cursor.execute(query, (limit,))
        results = cursor.fetchall()
        conn.close()

        contacts = []
        for contact_id, email, name, business_name, business_type in results:
            contacts.append(
                {
                    "id": contact_id,
                    "email": email,
                    "name": name.strip() if name else "",
                    "business_name": business_name,
                    "business_type": business_type,
                    "first_name": name.split()[0] if name and name.strip() else "there",
                }
            )

        return contacts

    def determine_template(self, business_type: str, business_name: str) -> str:
        """Determine appropriate email template based on business type/name"""
        if business_type and business_type.lower() in self.template_mapping:
            return self.template_mapping[business_type.lower()]

        # Fallback to business name keywords
        business_name_lower = business_name.lower()

        if any(term in business_name_lower for term in ["insurance", "medicare"]):
            return "insurance_agent_email1"
        elif any(
            term in business_name_lower for term in ["mortgage", "loan", "lending"]
        ):
            return "bank_mortgage_email1"
        elif any(
            term in business_name_lower for term in ["real estate", "realtor", "realty"]
        ):
            return "real_estate_email1"
        elif any(term in business_name_lower for term in ["law", "attorney", "legal"]):
            return "estate_attorney_email1"
        elif any(term in business_name_lower for term in ["inspection", "inspector"]):
            return "property_inspector_email1"
        elif any(
            term in business_name_lower
            for term in ["senior", "elderly", "care", "assisted"]
        ):
            return "senior_living_email1"
        elif any(term in business_name_lower for term in ["storage", "warehouse"]):
            return "storage_facilities_email1"
        elif any(
            term in business_name_lower
            for term in ["builder", "construction", "contractor"]
        ):
            return "home_builder_email1"
        else:
            return "real_estate_email1"  # Default fallback

    def send_daily_batch(self, limit: int = 40, test_mode: bool = False) -> int:
        """Send daily batch of emails to available contacts"""
        if test_mode:
            limit = 5
            print(f"🧪 TEST MODE: Limiting to {limit} emails")

        print(
            f"🚀 Flexible Campaign Sender - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        )
        print("=" * 70)

        # Get available contacts
        contacts = self.get_available_contacts(limit)
        print(f"📊 Found {len(contacts)} available contacts")

        if not contacts:
            print("⚠️ No contacts available for sending today")
            return 0

        # Group contacts by template type for reporting
        template_counts = {}
        sent_count = 0
        errors = []

        for contact in contacts:
            try:
                # Create contact object for email manager
                class ContactObj:
                    def __init__(self, contact_id, email, name, business_name):
                        self.id = contact_id
                        self.email = email
                        self.name = name
                        self.business_name = business_name
                        self.first_name = name.split()[0] if name else "there"
                        self.last_name = (
                            name.split()[-1] if name and len(name.split()) > 1 else ""
                        )
                        self.title = ""

                contact_obj = ContactObj(
                    contact["id"],
                    contact["email"],
                    contact["name"],
                    contact["business_name"],
                )

                # Determine template
                template = self.determine_template(
                    contact["business_type"], contact["business_name"]
                )

                # Track template usage
                template_counts[template] = template_counts.get(template, 0) + 1

                # Create template object
                class TemplateObj:
                    def __init__(self, template_name):
                        self.subject = f'Partner with ClutterFree Spaces - {template_name.replace("_email1", "").replace("_", " ").title()}'
                        self.html_file = (
                            f"outreach/campaigns/templates/{template_name}.html"
                        )
                        self.plain_text = f"Hi {{first_name}}, I'm Chanel from ClutterFree Spaces in Missoula, Montana. I help {template_name.replace('_email1', '').replace('_', ' ')} professionals..."
                        self.campaign_type = template_name.replace("_email1", "")
                        self.sequence_order = 1
                        self.delay_days = 15

                template_obj = TemplateObj(template)

                # Send email
                result = self.manager.send_email(contact_obj, template_obj)

                if result:
                    sent_count += 1
                    print(
                        f"✅ {sent_count}/{len(contacts)} - Sent to {contact['email']} ({template})"
                    )
                else:
                    errors.append(f"Failed to send to {contact['email']}")
                    print(f"❌ Failed to send to {contact['email']}")

            except Exception as e:
                error_msg = f"Error sending to {contact['email']}: {e}"
                errors.append(error_msg)
                print(f"❌ {error_msg}")

        # Summary
        print(f"\n📊 Campaign Summary:")
        print(f"   Total sent: {sent_count}/{len(contacts)}")
        print(f"   Success rate: {(sent_count/len(contacts)*100):.1f}%")
        print(f"   Date: {datetime.now().strftime('%Y-%m-%d')}")

        if template_counts:
            print(f"\n📧 Templates used:")
            for template, count in template_counts.items():
                print(f"   {template}: {count} emails")

        if errors:
            print(f"\n⚠️ Errors ({len(errors)}):")
            for error in errors[:5]:  # Show first 5 errors
                print(f"   {error}")
            if len(errors) > 5:
                print(f"   ... and {len(errors) - 5} more")

        return sent_count

    def close(self):
        """Clean up resources"""
        if hasattr(self.manager, "close"):
            self.manager.close()


def main():
    """Main function for CLI usage"""
    import argparse

    parser = argparse.ArgumentParser(description="Send flexible daily email campaigns")
    parser.add_argument(
        "--limit", type=int, default=40, help="Number of emails to send (default: 40)"
    )
    parser.add_argument(
        "--test", action="store_true", help="Test mode - send only 5 emails"
    )

    args = parser.parse_args()

    try:
        sender = FlexibleCampaignSender()
        sent_count = sender.send_daily_batch(limit=args.limit, test_mode=args.test)
        sender.close()

        return 0 if sent_count > 0 else 1

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
