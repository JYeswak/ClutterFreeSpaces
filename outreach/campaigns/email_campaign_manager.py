#!/usr/bin/env python3
"""
Email Campaign Manager for ClutterFreeSpaces B2B Outreach
Manages 9 targeted campaigns with SendGrid integration
"""

import sqlite3
import os
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
import sendgrid
from sendgrid.helpers.mail import Mail, From, To, Subject, HtmlContent, PlainTextContent
from dotenv import load_dotenv

load_dotenv()


@dataclass
class EmailTemplate:
    name: str
    subject: str
    html_file: str
    plain_text: str
    campaign_type: str
    sequence_order: int
    delay_days: int = 3


@dataclass
class Contact:
    id: int
    email: str
    first_name: str
    last_name: str
    title: str
    business_name: str
    business_type: str
    is_warm: bool = False


class EmailCampaignManager:
    """Manages multi-sequence email campaigns for B2B outreach"""

    def __init__(self):
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY") or os.getenv(
            "SendGrid_API_Key"
        )
        if not self.sendgrid_api_key:
            raise ValueError(
                "SendGrid API key not found. Set SENDGRID_API_KEY or SendGrid_API_Key in .env"
            )

        self.sg = sendgrid.SendGridAPIClient(api_key=self.sendgrid_api_key)
        self.conn = sqlite3.connect("outreach/data/b2b_outreach.db")
        self.cursor = self.conn.cursor()

        # Create campaign tracking tables
        self._create_campaign_tables()

        # Define all email templates
        self.templates = self._load_templates()

        # Campaign settings
        self.from_email = "contact@clutter-free-spaces.com"
        self.from_name = "Chanel - Clutter Free Spaces"
        self.base_url = "https://www.clutter-free-spaces.com"

    def _create_campaign_tables(self):
        """Create campaign tracking tables if they don't exist"""

        # Campaign sends tracking
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS campaign_sends (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contact_id INTEGER NOT NULL,
                campaign_type TEXT NOT NULL,
                sequence_order INTEGER NOT NULL,
                email_subject TEXT NOT NULL,
                sent_date DATETIME NOT NULL,
                sendgrid_message_id TEXT,
                status TEXT DEFAULT 'sent',
                opened BOOLEAN DEFAULT FALSE,
                clicked BOOLEAN DEFAULT FALSE,
                replied BOOLEAN DEFAULT FALSE,
                bounced BOOLEAN DEFAULT FALSE,
                unsubscribed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (contact_id) REFERENCES business_contacts(id)
            )
        """
        )

        # Campaign sequences tracking
        self.cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS campaign_sequences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contact_id INTEGER NOT NULL,
                campaign_type TEXT NOT NULL,
                sequence_status TEXT DEFAULT 'active', -- active, paused, completed, unsubscribed
                next_email_date DATETIME,
                next_sequence_order INTEGER DEFAULT 1,
                total_emails_sent INTEGER DEFAULT 0,
                last_interaction_date DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (contact_id) REFERENCES business_contacts(id),
                UNIQUE(contact_id, campaign_type)
            )
        """
        )

        self.conn.commit()

    def _load_templates(self) -> Dict[str, List[EmailTemplate]]:
        """Load email templates for each campaign"""

        templates = {
            "bretz_warm": [
                EmailTemplate(
                    name="bretz_reconnect",
                    subject="Hi from Chanel - Remember me from Bretz? 🏔️",
                    html_file="bretz_warm_email1.html",
                    plain_text="Hi {first_name}, I hope this email finds you well! You might remember me - I worked at Bretz for 6 years before starting ClutterFreeSpaces here in Missoula...",
                    campaign_type="bretz_warm",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "rv_dealer": [
                EmailTemplate(
                    name="rv_dealer_intro",
                    subject="Less Stress, More Travel with RV Organization in Montana",
                    html_file="rv_dealer_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel from ClutterFreeSpaces here in Missoula. After 7+ years in the RV industry, I've noticed something that might interest you...",
                    campaign_type="rv_dealer",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "real_estate": [
                EmailTemplate(
                    name="real_estate_intro",
                    subject="Sell listings 50% faster",
                    html_file="real_estate_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel Basolo, a professional organizer in Missoula helping Montana real estate agents sell listings faster...",
                    campaign_type="real_estate",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "moving_company": [
                EmailTemplate(
                    name="moving_company_intro",
                    subject="Pre-move organization = 30% faster moves",
                    html_file="moving_company_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel from ClutterFreeSpaces in Missoula. I work with Montana moving companies to solve a problem that's costing you time and money...",
                    campaign_type="moving_company",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "senior_living": [
                EmailTemplate(
                    name="senior_living_intro",
                    subject="Resident room optimization",
                    html_file="senior_living_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel Basolo, a professional organizer here in Missoula. I specialize in helping seniors maintain their independence through smart organization...",
                    campaign_type="senior_living",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "rv_parks": [
                EmailTemplate(
                    name="rv_parks_intro",
                    subject="Guest satisfaction through RV organization",
                    html_file="rv_parks_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel Basolo, a professional organizer here in Missoula with 7+ years RV experience. I help Montana RV parks increase guest satisfaction...",
                    campaign_type="rv_parks",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "storage_facilities": [
                EmailTemplate(
                    name="storage_facilities_intro",
                    subject="Reducing storage turnover in Montana",
                    html_file="storage_facilities_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel Basolo, a professional organizer in Missoula. I help Montana storage customers actually use their units effectively...",
                    campaign_type="storage_facilities",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "cleaning_companies": [
                EmailTemplate(
                    name="cleaning_companies_intro",
                    subject="Faster, more profitable cleaning jobs",
                    html_file="cleaning_companies_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel Basolo, a professional organizer in Missoula. I help Montana cleaning services work faster and earn more...",
                    campaign_type="cleaning_companies",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "government": [
                EmailTemplate(
                    name="government_intro",
                    subject="Workplace efficiency through organization",
                    html_file="government_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel Basolo, a professional organizer born and raised here in Missoula, Montana. I help government offices improve efficiency through strategic organization...",
                    campaign_type="government",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "home_builder": [
                EmailTemplate(
                    name="home_builder_intro",
                    subject="New Home Organization Support",
                    html_file="home_builder_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel with ClutterFreeSpaces, serving Montana homebuyers and builders. I help new homeowners transition smoothly into their completed homes...",
                    campaign_type="home_builder",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "insurance_agent": [
                EmailTemplate(
                    name="insurance_agent_intro",
                    subject="Risk Reduction Through Organization",
                    html_file="insurance_agent_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel with ClutterFreeSpaces, serving Montana families and insurance professionals. Home organization directly impacts safety and risk factors...",
                    campaign_type="insurance_agent",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "estate_attorney": [
                EmailTemplate(
                    name="estate_attorney_intro",
                    subject="Estate Planning & Organization",
                    html_file="estate_attorney_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel with ClutterFreeSpaces, serving Montana families and estate planning professionals. Professional organization supports the estate planning process...",
                    campaign_type="estate_attorney",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
            "general": [
                EmailTemplate(
                    name="general_intro",
                    subject="Professional Organization Services in Montana",
                    html_file="general_email1.html",
                    plain_text="Hi {first_name}, I'm Chanel with ClutterFreeSpaces, serving Montana families and businesses. Professional organization services can support your clients or operations...",
                    campaign_type="general",
                    sequence_order=1,
                    delay_days=15,
                ),
            ],
        }

        return templates

    def get_campaign_contacts(self, campaign_type: str) -> List[Contact]:
        """Get contacts for a specific campaign type"""

        if campaign_type == "bretz_warm":
            # Warm Bretz connections
            query = """
                SELECT bc.id, bc.email, bc.first_name, bc.last_name, bc.title,
                       b.name as business_name, bt.type_name as business_type, bc.is_warm
                FROM business_contacts bc
                JOIN businesses b ON bc.business_id = b.id
                LEFT JOIN business_types bt ON b.business_type_id = bt.id
                WHERE bc.status = 'active'
                AND bc.hunter_validation_status IN ('deliverable', 'risky')
                AND bc.is_warm = 1
                ORDER BY bc.title DESC
            """
        elif campaign_type == "rv_dealer":
            # RV dealers (excluding Bretz)
            query = """
                SELECT bc.id, bc.email, bc.first_name, bc.last_name, bc.title,
                       b.name as business_name, bt.type_name as business_type, 
                       COALESCE(bc.is_warm, 0) as is_warm
                FROM business_contacts bc
                JOIN businesses b ON bc.business_id = b.id
                LEFT JOIN business_types bt ON b.business_type_id = bt.id
                WHERE bc.status = 'active'
                AND bc.hunter_validation_status IN ('deliverable', 'risky')
                AND bt.type_name = 'rv_dealer'
                AND bc.is_warm != 1
                ORDER BY bc.validation_score DESC
            """
        else:
            # Other campaign types
            query = """
                SELECT bc.id, bc.email, bc.first_name, bc.last_name, bc.title,
                       b.name as business_name, bt.type_name as business_type,
                       COALESCE(bc.is_warm, 0) as is_warm
                FROM business_contacts bc
                JOIN businesses b ON bc.business_id = b.id
                LEFT JOIN business_types bt ON b.business_type_id = bt.id
                WHERE bc.status = 'active'
                AND bc.hunter_validation_status IN ('deliverable', 'risky')
                AND bt.type_name = ?
                ORDER BY bc.validation_score DESC
            """

        if campaign_type not in ["bretz_warm", "rv_dealer"]:
            self.cursor.execute(query, (campaign_type,))
        else:
            self.cursor.execute(query)

        contacts = []
        for row in self.cursor.fetchall():
            contacts.append(
                Contact(
                    id=row[0],
                    email=row[1],
                    first_name=row[2] or "",
                    last_name=row[3] or "",
                    title=row[4] or "",
                    business_name=row[5] or "",
                    business_type=row[6] or "",
                    is_warm=bool(row[7]),
                )
            )

        return contacts

    def load_html_template(self, filename: str) -> str:
        """Load HTML template from file"""
        template_path = f"outreach/campaigns/templates/{filename}"
        try:
            with open(template_path, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return f"<html><body><h1>Template not found: {filename}</h1></body></html>"

    def personalize_email(
        self, template: str, contact: Contact, utm_params: Dict[str, str]
    ) -> str:
        """Personalize email template with contact data and UTM tracking"""

        # Basic personalization
        personalized = template.replace("{{first_name}}", contact.first_name or "there")
        personalized = personalized.replace("{{last_name}}", contact.last_name or "")
        personalized = personalized.replace("{{business_name}}", contact.business_name)
        personalized = personalized.replace("{{title}}", contact.title or "")

        # Add UTM tracking to all links
        for url_key, campaign_name in utm_params.items():
            utm_string = f"?utm_source=email&utm_medium=campaign&utm_campaign={campaign_name}&utm_content={url_key}"
            # Update existing UTM params in template
            personalized = personalized.replace(
                f"utm_campaign={url_key}", f"utm_campaign={campaign_name}"
            )

        return personalized

    def send_to_contact(
        self, contact_id: int, email: str, campaign_type: str, context: dict
    ) -> bool:
        """Send email to a specific contact by ID and campaign type"""

        # Create Contact object from provided data
        contact = Contact(
            id=contact_id,
            email=email,
            first_name=context.get("first_name", "there"),
            last_name="",  # Not used in templates
            title="",  # Not used in templates
            business_name=context.get("business_name", ""),
            business_type=context.get("business_type", ""),
        )

        # Get template for this campaign type
        # Remove "_email1" suffix if present to match template keys
        template_key = campaign_type.replace("_email1", "")
        templates = self.templates.get(template_key, [])

        if not templates:
            print(f"⚠️ No template found for campaign type: {template_key}")
            return False

        template = templates[0]  # Use first template in sequence

        # Send the email
        # Send the email (send_email method handles campaign_sends recording)
        success = self.send_email(contact, template)
        return success

    def send_email(self, contact: Contact, template: EmailTemplate) -> bool:
        """Send individual email using SendGrid"""

        try:
            # Check if we already sent this email today to prevent duplicates
            self.cursor.execute(
                """
                SELECT id FROM campaign_sends 
                WHERE contact_id = ? AND campaign_type = ? AND date(sent_date) = date('now')
                """,
                (contact.id, template.campaign_type),
            )

            if self.cursor.fetchone():
                print(
                    f"⚠️ DUPLICATE SKIP: Already sent {template.campaign_type} to {contact.email} today"
                )
                return False
            # Load and personalize template
            html_content = self.load_html_template(template.html_file)
            utm_params = {
                "main": template.campaign_type,
                "cta": f"{template.campaign_type}_cta",
            }
            personalized_html = self.personalize_email(
                html_content, contact, utm_params
            )

            # Create SendGrid email
            from_email = From(self.from_email, self.from_name)
            to_email = To(contact.email)
            subject = Subject(template.subject)
            html_content = HtmlContent(personalized_html)
            plain_text_content = PlainTextContent(
                template.plain_text.format(
                    first_name=contact.first_name or "there",
                    business_name=contact.business_name,
                )
            )

            mail = Mail(from_email, to_email, subject, plain_text_content, html_content)

            # Add unsubscribe group (required for API sends)
            from sendgrid.helpers.mail import Asm

            mail.asm = Asm(group_id=27918)  # User's unsubscribe group ID

            # Add custom args for tracking
            mail.custom_arg = {
                "campaign_type": template.campaign_type,
                "sequence_order": str(template.sequence_order),
                "contact_id": str(contact.id),
            }

            # Send email
            response = self.sg.send(mail)

            if response.status_code == 202:
                # Record successful send
                self.cursor.execute(
                    """
                    INSERT INTO campaign_sends 
                    (contact_id, campaign_type, sequence_order, email_subject, sent_date, status, sendgrid_message_id)
                    VALUES (?, ?, ?, ?, datetime('now'), 'sent', ?)
                """,
                    (
                        contact.id,
                        template.campaign_type,
                        template.sequence_order,
                        template.subject,
                        response.headers.get("X-Message-Id", ""),
                    ),
                )

                self.conn.commit()
                return True
            else:
                print(
                    f"❌ Failed to send to {contact.email}: Status {response.status_code}"
                )
                return False

        except Exception as e:
            print(f"❌ Error sending to {contact.email}: {e}")
            return False

    def start_campaign_sequence(self, contact: Contact, campaign_type: str):
        """Start email sequence for a contact"""

        # Check if already in this campaign
        self.cursor.execute(
            """
            SELECT id FROM campaign_sequences 
            WHERE contact_id = ? AND campaign_type = ?
        """,
            (contact.id, campaign_type),
        )

        if self.cursor.fetchone():
            print(f"⚠️ {contact.email} already in {campaign_type} campaign")
            return

        # Add to campaign sequence
        self.cursor.execute(
            """
            INSERT INTO campaign_sequences 
            (contact_id, campaign_type, next_email_date, next_sequence_order)
            VALUES (?, ?, datetime('now'), 1)
        """,
            (contact.id, campaign_type),
        )

        self.conn.commit()
        print(f"✅ Added {contact.email} to {campaign_type} campaign")

    def process_scheduled_emails(self):
        """Process and send all scheduled emails"""

        # Get all contacts ready for next email
        self.cursor.execute(
            """
            SELECT cs.contact_id, cs.campaign_type, cs.next_sequence_order,
                   bc.email, bc.first_name, bc.last_name, bc.title,
                   b.name as business_name, bt.type_name as business_type,
                   COALESCE(bc.is_warm, 0) as is_warm
            FROM campaign_sequences cs
            JOIN business_contacts bc ON cs.contact_id = bc.id
            JOIN businesses b ON bc.business_id = b.id
            LEFT JOIN business_types bt ON b.business_type_id = bt.id
            WHERE cs.sequence_status = 'active'
            AND cs.next_email_date <= datetime('now')
            AND bc.status = 'active'
            ORDER BY cs.next_email_date
        """
        )

        scheduled_emails = self.cursor.fetchall()
        print(f"📧 Processing {len(scheduled_emails)} scheduled emails...")

        sent_count = 0

        for row in scheduled_emails:
            contact_id, campaign_type, sequence_order = row[0], row[1], row[2]

            # Check if we already sent this email today to prevent duplicates
            self.cursor.execute(
                """
                SELECT id FROM campaign_sends 
                WHERE contact_id = ? AND campaign_type = ? AND date(sent_date) = date('now')
                """,
                (contact_id, campaign_type),
            )

            if self.cursor.fetchone():
                print(
                    f"⚠️ DUPLICATE SKIP: Already sent {campaign_type} to contact {contact_id} today"
                )
                continue

            # Create contact object
            contact = Contact(
                id=contact_id,
                email=row[3],
                first_name=row[4] or "",
                last_name=row[5] or "",
                title=row[6] or "",
                business_name=row[7] or "",
                business_type=row[8] or "",
                is_warm=bool(row[9]),
            )

            # Get template for this sequence
            campaign_templates = self.templates.get(campaign_type, [])
            template = None
            for t in campaign_templates:
                if t.sequence_order == sequence_order:
                    template = t
                    break

            if not template:
                print(
                    f"⚠️ No template found for {campaign_type} sequence {sequence_order}"
                )
                continue

            # Send email
            if self.send_email(contact, template):
                sent_count += 1
                print(f"✅ Sent {template.name} to {contact.email}")

                # Update sequence for next email
                next_sequence = sequence_order + 1
                next_templates = [
                    t for t in campaign_templates if t.sequence_order == next_sequence
                ]

                if next_templates:
                    # Schedule next email
                    next_template = next_templates[0]
                    next_date = datetime.now() + timedelta(
                        days=next_template.delay_days
                    )

                    self.cursor.execute(
                        """
                        UPDATE campaign_sequences 
                        SET next_sequence_order = ?,
                            next_email_date = ?,
                            total_emails_sent = total_emails_sent + 1,
                            last_interaction_date = datetime('now')
                        WHERE contact_id = ? AND campaign_type = ?
                    """,
                        (next_sequence, next_date, contact_id, campaign_type),
                    )
                else:
                    # Campaign complete
                    self.cursor.execute(
                        """
                        UPDATE campaign_sequences 
                        SET sequence_status = 'completed',
                            total_emails_sent = total_emails_sent + 1,
                            last_interaction_date = datetime('now')
                        WHERE contact_id = ? AND campaign_type = ?
                    """,
                        (contact_id, campaign_type),
                    )

                self.conn.commit()

                # Rate limiting - respect SendGrid limits
                time.sleep(0.1)  # 10 emails per second max

        print(f"📊 Sent {sent_count} emails successfully")
        return sent_count

    def launch_campaign(self, campaign_type: str, test_mode: bool = False):
        """Launch a campaign for all eligible contacts"""

        contacts = self.get_campaign_contacts(campaign_type)
        print(f"🚀 Launching {campaign_type} campaign for {len(contacts)} contacts")

        if test_mode:
            contacts = contacts[:3]  # Test with first 3 contacts only
            print(f"🧪 TEST MODE: Limited to {len(contacts)} contacts")

        launched_count = 0

        for contact in contacts:
            self.start_campaign_sequence(contact, campaign_type)
            launched_count += 1

        print(f"✅ Campaign launched for {launched_count} contacts")

        # Process immediate emails (sequence 1)
        return self.process_scheduled_emails()

    def get_campaign_stats(self, campaign_type: str = None) -> Dict:
        """Get campaign performance statistics"""

        where_clause = "WHERE cs.campaign_type = ?" if campaign_type else ""
        params = (campaign_type,) if campaign_type else ()

        self.cursor.execute(
            f"""
            SELECT 
                cs.campaign_type,
                COUNT(DISTINCT cs.contact_id) as total_contacts,
                SUM(cs.total_emails_sent) as total_emails_sent,
                COUNT(CASE WHEN cs.sequence_status = 'completed' THEN 1 END) as completed_sequences,
                COUNT(CASE WHEN cs.sequence_status = 'active' THEN 1 END) as active_sequences
            FROM campaign_sequences cs
            {where_clause}
            GROUP BY cs.campaign_type
        """,
            params,
        )

        stats = {}
        for row in self.cursor.fetchall():
            stats[row[0]] = {
                "total_contacts": row[1],
                "total_emails_sent": row[2],
                "completed_sequences": row[3],
                "active_sequences": row[4],
            }

        return stats

    def check_duplicate_sends(self) -> Dict[str, int]:
        """Check for and report any duplicate sends"""

        # Find contacts that received multiple emails of same type on same day
        self.cursor.execute(
            """
            SELECT 
                bc.email,
                cs.campaign_type,
                DATE(cs.sent_date) as send_date,
                COUNT(*) as duplicate_count
            FROM campaign_sends cs
            JOIN business_contacts bc ON cs.contact_id = bc.id
            GROUP BY bc.email, cs.campaign_type, DATE(cs.sent_date)
            HAVING COUNT(*) > 1
            ORDER BY COUNT(*) DESC, bc.email
            """
        )

        duplicates = self.cursor.fetchall()

        if duplicates:
            print("\n🚨 DUPLICATE EMAIL ALERT:")
            print("=" * 50)
            total_duplicates = 0

            for email, campaign_type, send_date, count in duplicates:
                print(f"⚠️ {email}: {count} emails ({campaign_type} on {send_date})")
                total_duplicates += count - 1  # Count extras only

            print(f"\n📊 Total duplicate emails sent: {total_duplicates}")
            print("🔧 This indicates a system issue that needs attention!")

            return {
                "total_affected_contacts": len(duplicates),
                "total_duplicate_emails": total_duplicates,
                "details": duplicates,
            }
        else:
            print("✅ No duplicate emails detected")
            return {"total_affected_contacts": 0, "total_duplicate_emails": 0}

    def close(self):
        """Close database connection"""
        self.conn.close()


def main():
    """Main function for testing and campaign management"""

    try:
        manager = EmailCampaignManager()

        print("📧 CLUTTERFREESPACES EMAIL CAMPAIGN MANAGER")
        print("=" * 60)

        # Launch Bretz warm campaign (highest priority)
        print("\n🔥 LAUNCHING BRETZ WARM CONNECTION CAMPAIGN")
        bretz_sent = manager.launch_campaign("bretz_warm", test_mode=False)

        # Show campaign stats
        print("\n📊 CAMPAIGN STATISTICS:")
        stats = manager.get_campaign_stats()
        for campaign, data in stats.items():
            print(
                f"  {campaign}: {data['total_contacts']} contacts, {data['total_emails_sent']} emails sent"
            )

        manager.close()

        print(f"\n✅ Campaign management complete!")
        print(f"   Next steps: Monitor opens/clicks in Google Analytics")

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
