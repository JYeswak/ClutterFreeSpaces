#!/usr/bin/env python3
"""
Campaign Manager for ClutterFreeSpaces B2B Outreach
Comprehensive campaign creation, management, and execution system
"""

import os
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any

from .sendgrid_client import SendGridClient
from ..templates.home_organization_templates import (
    HOME_ORGANIZATION_TEMPLATES,
    get_personalized_template,
    HOME_BUSINESS_CUSTOMIZATIONS,
)
from ..templates.rv_organization_templates import (
    RV_ORGANIZATION_TEMPLATES,
    get_personalized_rv_template,
    RV_BUSINESS_CUSTOMIZATIONS,
)
from ..config.settings import DATABASE_PATH, DAILY_OUTREACH_LIMIT


class CampaignManager:
    """Main campaign management system"""

    def __init__(self):
        self.db_path = DATABASE_PATH
        self.sendgrid_client = SendGridClient()

        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def _get_db_connection(self) -> sqlite3.Connection:
        """Get database connection with foreign keys enabled"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        conn.row_factory = sqlite3.Row
        return conn

    def create_campaign(
        self,
        name: str,
        campaign_type: str,
        description: str = "",
        target_contacts: int = 100,
        daily_limit: int = 20,
    ) -> int:
        """
        Create a new outreach campaign

        Args:
            name: Campaign name
            campaign_type: 'home_organization' or 'rv_organization'
            description: Campaign description
            target_contacts: Target number of contacts
            daily_limit: Daily email send limit

        Returns:
            Campaign ID
        """

        if campaign_type not in ["home_organization", "rv_organization"]:
            raise ValueError(
                "campaign_type must be 'home_organization' or 'rv_organization'"
            )

        with self._get_db_connection() as conn:
            cursor = conn.cursor()

            # Create campaign
            cursor.execute(
                """
                INSERT INTO outreach_campaigns (
                    name, campaign_type, description, status, daily_send_limit,
                    target_contacts, start_date
                ) VALUES (?, ?, ?, 'draft', ?, ?, ?)
            """,
                (
                    name,
                    campaign_type,
                    description,
                    daily_limit,
                    target_contacts,
                    datetime.now().date(),
                ),
            )

            campaign_id = cursor.lastrowid

            # Create campaign sequences based on template type
            if campaign_type == "home_organization":
                templates = [
                    ("home_intro", 0),
                    ("home_followup_1", 4),
                    ("home_followup_2", 7),
                    ("home_final", 10),
                ]
                template_dict = HOME_ORGANIZATION_TEMPLATES
            else:  # rv_organization
                templates = [
                    ("rv_intro", 0),
                    ("rv_followup_1", 5),
                    ("rv_followup_2", 8),
                    ("rv_final", 12),
                ]
                template_dict = RV_ORGANIZATION_TEMPLATES

            # Create sequences
            for i, (template_key, delay_days) in enumerate(templates, 1):
                template = template_dict[template_key]

                cursor.execute(
                    """
                    INSERT INTO campaign_sequences (
                        campaign_id, sequence_order, subject_template, 
                        body_template, delay_days
                    ) VALUES (?, ?, ?, ?, ?)
                """,
                    (
                        campaign_id,
                        i,
                        template["subject"],
                        json.dumps(
                            {
                                "html": template["html_content"],
                                "text": template["text_content"],
                            }
                        ),
                        delay_days,
                    ),
                )

            conn.commit()

        self.logger.info(
            f"Created campaign '{name}' (ID: {campaign_id}) with {len(templates)} sequences"
        )
        return campaign_id

    def get_eligible_contacts(
        self, campaign_type: str, limit: Optional[int] = None
    ) -> List[Dict]:
        """
        Get contacts eligible for a campaign based on business type and status

        Args:
            campaign_type: 'home_organization' or 'rv_organization'
            limit: Maximum number of contacts to return

        Returns:
            List of contact dictionaries
        """

        with self._get_db_connection() as conn:
            cursor = conn.cursor()

            # Map campaign type to business type category
            category = (
                "home_campaign"
                if campaign_type == "home_organization"
                else "rv_campaign"
            )

            query = """
                SELECT 
                    bc.id as contact_id,
                    bc.first_name,
                    bc.last_name,
                    bc.title,
                    bc.email,
                    bc.phone,
                    bc.decision_maker,
                    bc.influence_score,
                    
                    b.id as business_id,
                    b.name as business_name,
                    b.city,
                    b.state,
                    b.phone as business_phone,
                    b.website,
                    b.google_rating,
                    b.partnership_potential,
                    b.status as business_status,
                    
                    bt.type_name as business_type,
                    bt.category,
                    bt.priority_score,
                    bt.commission_rate
                    
                FROM business_contacts bc
                JOIN businesses b ON bc.business_id = b.id
                JOIN business_types bt ON b.business_type_id = bt.id
                
                WHERE bt.category = ?
                    AND bc.email IS NOT NULL
                    AND bc.email != ''
                    AND bc.status IN ('discovered', 'researched')
                    AND b.status IN ('discovered', 'researched', 'contacted')
                    AND bc.email NOT IN (SELECT email FROM unsubscribes)
                    AND bc.id NOT IN (
                        SELECT contact_id FROM campaign_contacts 
                        WHERE status IN ('active', 'completed')
                    )
                
                ORDER BY 
                    b.partnership_potential DESC,
                    bt.priority_score DESC,
                    bc.decision_maker DESC,
                    bc.influence_score DESC
            """

            params = [category]

            if limit:
                query += " LIMIT ?"
                params.append(limit)

            cursor.execute(query, params)

            contacts = []
            for row in cursor.fetchall():
                contact = dict(row)

                # Add computed fields
                contact[
                    "full_name"
                ] = f"{contact['first_name']} {contact['last_name']}".strip()
                if not contact["full_name"]:
                    contact["full_name"] = contact["title"] or "Contact"

                contact["display_name"] = (
                    contact["first_name"] or contact["full_name"].split()[0]
                )

                contacts.append(contact)

            return contacts

    def enroll_contacts_in_campaign(
        self, campaign_id: int, contact_ids: List[int]
    ) -> int:
        """
        Enroll contacts in a campaign

        Args:
            campaign_id: Campaign ID
            contact_ids: List of contact IDs to enroll

        Returns:
            Number of contacts enrolled
        """

        enrolled_count = 0

        with self._get_db_connection() as conn:
            cursor = conn.cursor()

            # Get campaign details
            cursor.execute(
                "SELECT * FROM outreach_campaigns WHERE id = ?", (campaign_id,)
            )
            campaign = dict(cursor.fetchone() or {})

            if not campaign:
                raise ValueError(f"Campaign {campaign_id} not found")

            for contact_id in contact_ids:
                try:
                    # Check if already enrolled
                    cursor.execute(
                        """
                        SELECT 1 FROM campaign_contacts 
                        WHERE campaign_id = ? AND contact_id = ?
                    """,
                        (campaign_id, contact_id),
                    )

                    if cursor.fetchone():
                        self.logger.warning(
                            f"Contact {contact_id} already enrolled in campaign {campaign_id}"
                        )
                        continue

                    # Calculate first email due date (immediate for sequence 1)
                    next_email_due = datetime.now()

                    # Enroll contact
                    cursor.execute(
                        """
                        INSERT INTO campaign_contacts (
                            campaign_id, contact_id, enrolled_date, 
                            current_sequence, status, next_email_due
                        ) VALUES (?, ?, ?, 1, 'active', ?)
                    """,
                        (campaign_id, contact_id, datetime.now(), next_email_due),
                    )

                    enrolled_count += 1

                except Exception as e:
                    self.logger.error(f"Failed to enroll contact {contact_id}: {e}")
                    continue

            conn.commit()

        self.logger.info(
            f"Enrolled {enrolled_count} contacts in campaign {campaign_id}"
        )
        return enrolled_count

    def send_pending_emails(
        self,
        campaign_id: Optional[int] = None,
        dry_run: bool = False,
        max_sends: Optional[int] = None,
    ) -> Dict:
        """
        Send pending emails for campaigns

        Args:
            campaign_id: Specific campaign ID, or None for all campaigns
            dry_run: If True, don't actually send emails
            max_sends: Maximum emails to send

        Returns:
            Dictionary with send statistics
        """

        # Check daily limit
        sent_today, daily_limit = self.sendgrid_client.check_daily_limit()
        if sent_today >= daily_limit:
            return {
                "status": "daily_limit_reached",
                "sent_today": sent_today,
                "daily_limit": daily_limit,
                "emails_sent": 0,
            }

        available_sends = min(daily_limit - sent_today, max_sends or daily_limit)

        stats = {
            "emails_sent": 0,
            "emails_failed": 0,
            "contacts_processed": 0,
            "campaigns_processed": 0,
            "errors": [],
        }

        with self._get_db_connection() as conn:
            cursor = conn.cursor()

            # Get pending emails
            query = """
                SELECT 
                    cc.id as campaign_contact_id,
                    cc.campaign_id,
                    cc.contact_id,
                    cc.current_sequence,
                    cc.next_email_due,
                    
                    oc.name as campaign_name,
                    oc.campaign_type,
                    oc.status as campaign_status,
                    
                    cs.id as sequence_id,
                    cs.subject_template,
                    cs.body_template,
                    
                    bc.first_name,
                    bc.last_name,
                    bc.email,
                    bc.title,
                    
                    b.name as business_name,
                    b.city,
                    b.state,
                    b.google_rating,
                    
                    bt.type_name as business_type
                    
                FROM campaign_contacts cc
                JOIN outreach_campaigns oc ON cc.campaign_id = oc.id
                JOIN campaign_sequences cs ON oc.id = cs.campaign_id AND cc.current_sequence = cs.sequence_order
                JOIN business_contacts bc ON cc.contact_id = bc.id
                JOIN businesses b ON bc.business_id = b.id
                JOIN business_types bt ON b.business_type_id = bt.id
                
                WHERE cc.status = 'active'
                    AND oc.status = 'active'
                    AND cc.next_email_due <= ?
                    AND bc.email NOT IN (SELECT email FROM unsubscribes)
            """

            params = [datetime.now()]

            if campaign_id:
                query += " AND cc.campaign_id = ?"
                params.append(campaign_id)

            query += " ORDER BY cc.next_email_due ASC"

            if available_sends > 0:
                query += " LIMIT ?"
                params.append(available_sends)

            cursor.execute(query, params)
            pending_emails = cursor.fetchall()

            processed_campaigns = set()

            for row in pending_emails:
                if stats["emails_sent"] >= available_sends:
                    break

                email_data = dict(row)
                stats["contacts_processed"] += 1
                processed_campaigns.add(email_data["campaign_id"])

                try:
                    # Parse template body
                    body_templates = json.loads(email_data["body_template"])

                    # Personalize content
                    personalization_data = {
                        "first_name": email_data["first_name"] or "there",
                        "business_name": email_data["business_name"],
                        "city": email_data["city"],
                        "google_rating": str(email_data["google_rating"] or "great"),
                        "business_type": email_data["business_type"],
                    }

                    # Get business-specific customizations
                    if email_data["campaign_type"] == "home_organization":
                        customizations = HOME_BUSINESS_CUSTOMIZATIONS.get(
                            email_data["business_type"], {}
                        )
                    else:
                        customizations = RV_BUSINESS_CUSTOMIZATIONS.get(
                            email_data["business_type"], {}
                        )

                    # Add custom variables
                    if "business_type" in customizations:
                        personalization_data["business_type"] = customizations[
                            "business_type"
                        ]

                    if dry_run:
                        self.logger.info(
                            f"DRY RUN: Would send email to {email_data['email']} for campaign {email_data['campaign_name']}"
                        )
                        stats["emails_sent"] += 1
                        continue

                    # Send email
                    (
                        success,
                        message_id,
                        error_msg,
                    ) = self.sendgrid_client.send_campaign_email(
                        campaign_id=email_data["campaign_id"],
                        contact_id=email_data["contact_id"],
                        sequence_id=email_data["sequence_id"],
                        to_email=email_data["email"],
                        to_name=f"{email_data['first_name']} {email_data['last_name']}".strip()
                        or email_data["title"]
                        or "Contact",
                        subject=email_data["subject_template"],
                        html_content=body_templates["html"],
                        text_content=body_templates["text"],
                        business_name=email_data["business_name"],
                        custom_vars=personalization_data,
                    )

                    if success:
                        stats["emails_sent"] += 1

                        # Update campaign contact
                        self._update_campaign_contact_after_send(
                            email_data["campaign_contact_id"],
                            email_data["current_sequence"],
                        )

                        self.logger.info(
                            f"Sent email to {email_data['email']} (Campaign: {email_data['campaign_name']})"
                        )

                    else:
                        stats["emails_failed"] += 1
                        stats["errors"].append(f"{email_data['email']}: {error_msg}")
                        self.logger.error(
                            f"Failed to send to {email_data['email']}: {error_msg}"
                        )

                except Exception as e:
                    stats["emails_failed"] += 1
                    stats["errors"].append(f"{email_data['email']}: {str(e)}")
                    self.logger.error(
                        f"Exception sending to {email_data['email']}: {e}"
                    )

            stats["campaigns_processed"] = len(processed_campaigns)

        return stats

    def _update_campaign_contact_after_send(
        self, campaign_contact_id: int, current_sequence: int
    ):
        """Update campaign contact after successful email send"""

        with self._get_db_connection() as conn:
            cursor = conn.cursor()

            # Get sequence info for next email
            cursor.execute(
                """
                SELECT cs.sequence_order, cs.delay_days
                FROM campaign_contacts cc
                JOIN campaign_sequences cs ON cc.campaign_id = cs.campaign_id
                WHERE cc.id = ? AND cs.sequence_order > ?
                ORDER BY cs.sequence_order ASC
                LIMIT 1
            """,
                (campaign_contact_id, current_sequence),
            )

            next_sequence = cursor.fetchone()

            if next_sequence:
                # Schedule next email
                next_due = datetime.now() + timedelta(days=next_sequence["delay_days"])

                cursor.execute(
                    """
                    UPDATE campaign_contacts
                    SET current_sequence = ?, next_email_due = ?
                    WHERE id = ?
                """,
                    (next_sequence["sequence_order"], next_due, campaign_contact_id),
                )

            else:
                # Campaign sequence complete
                cursor.execute(
                    """
                    UPDATE campaign_contacts
                    SET status = 'completed', next_email_due = NULL
                    WHERE id = ?
                """,
                    (campaign_contact_id,),
                )

            conn.commit()

    def get_campaign_stats(self, campaign_id: Optional[int] = None) -> Dict:
        """Get comprehensive campaign statistics"""

        with self._get_db_connection() as conn:
            cursor = conn.cursor()

            if campaign_id:
                # Single campaign stats
                cursor.execute(
                    "SELECT * FROM campaign_performance WHERE campaign_id = ?",
                    (campaign_id,),
                )
                stats = dict(cursor.fetchone() or {})

                # Add recent activity
                cursor.execute(
                    """
                    SELECT 
                        DATE(sent_at) as send_date,
                        COUNT(*) as emails_sent,
                        COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as delivered,
                        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened,
                        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as clicked
                    FROM email_sends 
                    WHERE campaign_id = ?
                    AND sent_at >= date('now', '-30 days')
                    GROUP BY DATE(sent_at)
                    ORDER BY send_date DESC
                """,
                    (campaign_id,),
                )

                stats["daily_activity"] = [dict(row) for row in cursor.fetchall()]

            else:
                # All campaigns overview
                cursor.execute(
                    "SELECT * FROM campaign_performance ORDER BY campaign_id"
                )
                campaigns = [dict(row) for row in cursor.fetchall()]

                # Overall totals
                cursor.execute(
                    """
                    SELECT 
                        COUNT(DISTINCT campaign_id) as total_campaigns,
                        COUNT(DISTINCT contact_id) as total_contacts,
                        COUNT(*) as total_emails_sent,
                        COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as total_delivered,
                        COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as total_opened,
                        COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END) as total_clicked,
                        COUNT(CASE WHEN replied_at IS NOT NULL THEN 1 END) as total_replied
                    FROM email_sends
                """
                )

                totals = dict(cursor.fetchone() or {})

                stats = {
                    "campaigns": campaigns,
                    "totals": totals,
                    "overall_open_rate": round(
                        totals.get("total_opened", 0)
                        * 100.0
                        / max(totals.get("total_delivered", 1), 1),
                        2,
                    ),
                    "overall_click_rate": round(
                        totals.get("total_clicked", 0)
                        * 100.0
                        / max(totals.get("total_opened", 1), 1),
                        2,
                    ),
                    "overall_reply_rate": round(
                        totals.get("total_replied", 0)
                        * 100.0
                        / max(totals.get("total_delivered", 1), 1),
                        2,
                    ),
                }

        return stats

    def activate_campaign(self, campaign_id: int) -> bool:
        """Activate a campaign"""

        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE outreach_campaigns 
                SET status = 'active', start_date = ? 
                WHERE id = ?
            """,
                (datetime.now().date(), campaign_id),
            )

            success = cursor.rowcount > 0
            conn.commit()

        if success:
            self.logger.info(f"Activated campaign {campaign_id}")

        return success

    def pause_campaign(self, campaign_id: int) -> bool:
        """Pause a campaign"""

        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE outreach_campaigns 
                SET status = 'paused' 
                WHERE id = ?
            """,
                (campaign_id,),
            )

            success = cursor.rowcount > 0
            conn.commit()

        if success:
            self.logger.info(f"Paused campaign {campaign_id}")

        return success

    def get_pending_email_count(self, campaign_id: Optional[int] = None) -> int:
        """Get count of pending emails"""

        with self._get_db_connection() as conn:
            cursor = conn.cursor()

            query = """
                SELECT COUNT(*) as pending_count
                FROM campaign_contacts cc
                JOIN outreach_campaigns oc ON cc.campaign_id = oc.id
                WHERE cc.status = 'active'
                    AND oc.status = 'active'
                    AND cc.next_email_due <= ?
            """

            params = [datetime.now()]

            if campaign_id:
                query += " AND cc.campaign_id = ?"
                params.append(campaign_id)

            cursor.execute(query, params)
            result = cursor.fetchone()

            return result["pending_count"] if result else 0


# Utility functions for command line interface
def create_home_organization_campaign(name: str, description: str = "") -> int:
    """Create a home organization campaign with default settings"""
    manager = CampaignManager()
    return manager.create_campaign(
        name=name,
        campaign_type="home_organization",
        description=description,
        target_contacts=50,
        daily_limit=15,
    )


def create_rv_organization_campaign(name: str, description: str = "") -> int:
    """Create an RV organization campaign with default settings"""
    manager = CampaignManager()
    return manager.create_campaign(
        name=name,
        campaign_type="rv_organization",
        description=description,
        target_contacts=30,
        daily_limit=10,
    )


if __name__ == "__main__":
    # Command line interface for testing
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]
        manager = CampaignManager()

        if command == "test-home-campaign":
            campaign_id = create_home_organization_campaign(
                "Test Home Organization Campaign",
                "Test campaign for home organization partners",
            )
            print(f"Created home campaign: {campaign_id}")

        elif command == "test-rv-campaign":
            campaign_id = create_rv_organization_campaign(
                "Test RV Organization Campaign",
                "Test campaign for RV organization partners",
            )
            print(f"Created RV campaign: {campaign_id}")

        elif command == "send-test" and len(sys.argv) > 2:
            campaign_id = int(sys.argv[2])
            dry_run = len(sys.argv) > 3 and sys.argv[3] == "--dry-run"

            stats = manager.send_pending_emails(
                campaign_id, dry_run=dry_run, max_sends=1
            )
            print(f"Send results: {stats}")

        elif command == "stats":
            campaign_id = int(sys.argv[2]) if len(sys.argv) > 2 else None
            stats = manager.get_campaign_stats(campaign_id)
            print(json.dumps(stats, indent=2, default=str))

        else:
            print("Unknown command")

    else:
        print("Usage:")
        print("  python campaign_manager.py test-home-campaign")
        print("  python campaign_manager.py test-rv-campaign")
        print("  python campaign_manager.py send-test <campaign_id> [--dry-run]")
        print("  python campaign_manager.py stats [campaign_id]")
