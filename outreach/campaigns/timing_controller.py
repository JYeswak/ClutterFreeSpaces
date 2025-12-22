#!/usr/bin/env python3
"""
Email Timing Controller - ClutterFreeSpaces
Enforces anti-spam rules and maintains optimal send rates
"""

import sqlite3
from datetime import datetime, timedelta
from typing import List, Tuple, Optional
from dataclasses import dataclass


@dataclass
class SendingRules:
    min_days_between_emails: int = 15  # 2 emails per month max
    max_daily_sends: int = 40  # Target 30-50/day
    business_hours_only: bool = True
    send_start_hour: int = 8  # 8 AM
    send_end_hour: int = 17  # 5 PM


class EmailTimingController:
    """Controls email sending timing to prevent spam and optimize delivery"""

    def __init__(self, db_path: str = "outreach/data/b2b_outreach.db"):
        self.db_path = db_path
        self.rules = SendingRules()

    def can_send_to_contact(
        self, contact_id: int, campaign_type: str
    ) -> Tuple[bool, str]:
        """Check if we can send to a specific contact"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Get last email sent to this contact (any campaign)
        cursor.execute(
            """
            SELECT MAX(sent_date) 
            FROM campaign_sends 
            WHERE contact_id = ?
        """,
            (contact_id,),
        )

        last_sent = cursor.fetchone()[0]
        conn.close()

        if not last_sent:
            return True, "No previous emails sent"

        last_sent_date = datetime.fromisoformat(last_sent)
        days_since_last = (datetime.now() - last_sent_date).days

        if days_since_last < self.rules.min_days_between_emails:
            days_remaining = self.rules.min_days_between_emails - days_since_last
            return (
                False,
                f"Must wait {days_remaining} more days (last sent: {last_sent_date.date()})",
            )

        return True, f"OK - last email was {days_since_last} days ago"

    def get_daily_send_capacity(self) -> Tuple[int, int]:
        """Get how many emails we can still send today"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        today = datetime.now().date()
        cursor.execute(
            """
            SELECT COUNT(*) 
            FROM campaign_sends 
            WHERE date(sent_date) = ?
        """,
            (today,),
        )

        sent_today = cursor.fetchone()[0]
        conn.close()

        remaining = max(0, self.rules.max_daily_sends - sent_today)
        return sent_today, remaining

    def get_campaign_business_types(self, campaign_type: str) -> List[str]:
        """Map campaign types to appropriate business types"""
        campaign_mapping = {
            "real_estate_email1": ["real_estate_agent", "property_management"],
            "storage_facilities_email1": ["storage_facility"],
            "home_builder_email1": ["home_builder"],
            "insurance_agent_email1": ["insurance_agent"],
            "estate_attorney_email1": ["estate_attorney", "divorce_attorney"],
            "senior_living_email1": [
                "senior_living",
                "elderly_care",
                "home_health_agency",
            ],
            "moving_company_email1": ["moving_company"],
            "cleaning_companies_email1": ["cleaning_company"],
            "rv_dealer_email1": ["rv_dealer"],
            "rv_parks_email1": ["rv_park"],
            "airbnb_host_email1": ["airbnb_host"],
            "home_stager_email1": ["home_stager"],
            "property_inspector_email1": ["property_inspector"],
            "bank_mortgage_email1": ["bank_mortgage"],
            "general": [
                "property_management",
                "home_stager",
                "property_inspector",
                "bank_mortgage",
            ],  # Fallback for misc types
        }

        # Remove "_email1" suffix if present
        clean_campaign_type = campaign_type.replace("_email1", "")
        return campaign_mapping.get(
            campaign_type, campaign_mapping.get(clean_campaign_type, [])
        )

    def get_sendable_contacts(
        self, campaign_type: str, limit: int = None
    ) -> List[dict]:
        """Get contacts that are ready to receive emails for specific campaign type"""
        # Get appropriate business types for this campaign
        target_business_types = self.get_campaign_business_types(campaign_type)

        if not target_business_types:
            print(f"⚠️ No business type mapping found for campaign: {campaign_type}")
            return []

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Create placeholders for business types
        business_type_placeholders = ",".join("?" * len(target_business_types))

        # Get contacts who haven't been emailed in 15+ days AND match business type AND are validated
        cursor.execute(
            f"""
            SELECT DISTINCT bc.id, bc.email, bc.first_name, bc.last_name,
                   bc.title, b.name as business_name, bt.type_name,
                   MAX(cs.sent_date) as last_email_date, ev.result as validation_result
            FROM business_contacts bc
            JOIN businesses b ON bc.business_id = b.id
            JOIN business_types bt ON b.business_type_id = bt.id
            JOIN email_validations ev ON bc.email = ev.email
            LEFT JOIN campaign_sends cs ON bc.id = cs.contact_id
            WHERE bc.status = 'active'
            AND bc.email IS NOT NULL
            AND bc.email != ''
            AND ev.result IN ('deliverable', 'risky')
            AND bt.type_name IN ({business_type_placeholders})
            AND bc.email NOT IN (
                SELECT DISTINCT email_address
                FROM campaign_sends
                WHERE email_address IS NOT NULL
                  AND julianday('now') - julianday(sent_date) < ?
            )
            GROUP BY bc.id
            ORDER BY last_email_date ASC NULLS FIRST
        """,
            (*target_business_types, self.rules.min_days_between_emails),
        )

        contacts = []
        for row in cursor.fetchall():
            contact = {
                "id": row[0],
                "email": row[1],
                "first_name": row[2] or "",
                "last_name": row[3] or "",
                "title": row[4] or "",
                "business_name": row[5],
                "business_type": row[6],
                "last_email_date": row[7],
                "validation_result": row[8],
            }
            contacts.append(contact)

        conn.close()

        print(
            f"   📋 Found {len(contacts)} {'/'.join(target_business_types)} contacts for {campaign_type}"
        )

        if limit:
            contacts = contacts[:limit]

        return contacts

    def is_business_hours(self) -> bool:
        """Check if it's currently business hours (Mountain Time)"""
        if not self.rules.business_hours_only:
            return True

        now = datetime.now()
        return self.rules.send_start_hour <= now.hour <= self.rules.send_end_hour

    def get_optimal_send_batch(self, campaign_type: str) -> Tuple[List[dict], dict]:
        """Get the optimal batch of contacts to email right now"""
        sent_today, remaining_capacity = self.get_daily_send_capacity()

        status = {
            "sent_today": sent_today,
            "remaining_capacity": remaining_capacity,
            "is_business_hours": self.is_business_hours(),
            "can_send_now": remaining_capacity > 0 and self.is_business_hours(),
        }

        if not status["can_send_now"]:
            return [], status

        # Get contacts ready to email
        sendable_contacts = self.get_sendable_contacts(
            campaign_type, limit=min(remaining_capacity, 20)  # Reasonable batch size
        )

        return sendable_contacts, status

    def update_campaign_sequences(self):
        """Update all campaign sequences to enforce 15-day delays"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Update next_email_date for all sequences to be 15 days from last send
        cursor.execute(
            """
            UPDATE campaign_sequences 
            SET next_email_date = datetime(
                COALESCE(
                    (SELECT MAX(sent_date) FROM campaign_sends 
                     WHERE campaign_sends.contact_id = campaign_sequences.contact_id),
                    datetime('now', '-1 day')
                ), 
                '+15 days'
            )
            WHERE next_email_date IS NULL 
            OR next_email_date < datetime('now')
        """
        )

        updated_count = cursor.rowcount
        conn.commit()
        conn.close()

        return updated_count


def main():
    """Test the timing controller"""
    controller = EmailTimingController()

    print("📊 EMAIL TIMING CONTROLLER STATUS")
    print("=" * 50)

    # Check daily capacity
    sent_today, remaining = controller.get_daily_send_capacity()
    print(f"📧 Emails sent today: {sent_today}")
    print(f"📮 Remaining capacity: {remaining}")
    print(f"⏰ Business hours: {controller.is_business_hours()}")

    # Check sendable contacts
    sendable = controller.get_sendable_contacts("general", limit=10)
    print(f"\n✅ Contacts ready to email: {len(sendable)}")

    for contact in sendable[:5]:
        can_send, reason = controller.can_send_to_contact(contact["id"], "general")
        print(f"   • {contact['business_name']} - {reason}")

    # Update sequences
    updated = controller.update_campaign_sequences()
    print(f"\n🔄 Updated {updated} campaign sequences for 15-day delays")

    # Get optimal batch
    batch, status = controller.get_optimal_send_batch("general")
    print(f"\n🎯 Optimal batch size: {len(batch)} contacts")
    print(f"📈 Status: {status}")


if __name__ == "__main__":
    main()
