#!/usr/bin/env python3
"""
SendGrid Email Client for ClutterFreeSpaces B2B Outreach
Professional email delivery with tracking and compliance
"""

import os
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlencode

import sendgrid
from sendgrid.helpers.mail import (
    Mail,
    Email,
    To,
    Content,
    Substitution,
    ClickTracking,
    OpenTracking,
)

from ..config.settings import (
    SENDGRID_API_KEY,
    DATABASE_PATH,
    FROM_EMAIL,
    FROM_NAME,
    DAILY_OUTREACH_LIMIT,
)


class SendGridClient:
    """Professional email client using SendGrid API"""

    def __init__(self):
        self.api_key = SENDGRID_API_KEY
        if not self.api_key:
            raise ValueError("SendGrid API key not found in environment")

        self.sg = sendgrid.SendGridAPIClient(api_key=self.api_key)
        self.db_path = DATABASE_PATH
        self.from_email = FROM_EMAIL
        self.from_name = FROM_NAME

        # Setup logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def _get_db_connection(self) -> sqlite3.Connection:
        """Get database connection with foreign keys enabled"""
        conn = sqlite3.connect(self.db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        conn.row_factory = sqlite3.Row
        return conn

    def check_daily_limit(self) -> Tuple[int, int]:
        """Check how many emails sent today vs daily limit"""
        today = datetime.now().date()

        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT COUNT(*) as sent_today
                FROM email_sends 
                WHERE DATE(sent_at) = ?
                AND status NOT IN ('failed', 'bounced')
            """,
                (today,),
            )

            sent_today = cursor.fetchone()["sent_today"]
            return sent_today, DAILY_OUTREACH_LIMIT

    def is_unsubscribed(self, email: str) -> bool:
        """Check if email address is unsubscribed"""
        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM unsubscribes WHERE email = ?", (email,))
            return cursor.fetchone() is not None

    def send_campaign_email(
        self,
        campaign_id: int,
        contact_id: int,
        sequence_id: Optional[int],
        to_email: str,
        to_name: str,
        subject: str,
        html_content: str,
        text_content: str,
        business_name: str = "",
        custom_vars: Optional[Dict] = None,
    ) -> Tuple[bool, str, str]:
        """
        Send a campaign email with full tracking

        Returns:
            (success: bool, message_id: str, error_message: str)
        """

        # Check daily limit
        sent_today, daily_limit = self.check_daily_limit()
        if sent_today >= daily_limit:
            return False, "", f"Daily limit of {daily_limit} emails reached"

        # Check unsubscribe status
        if self.is_unsubscribed(to_email):
            return False, "", "Email address is unsubscribed"

        try:
            # Create unsubscribe link
            unsubscribe_url = self._generate_unsubscribe_link(to_email, campaign_id)

            # Replace placeholders in content
            personalized_vars = {
                "business_name": business_name,
                "contact_name": to_name,
                "first_name": to_name.split()[0] if to_name else "there",
                "unsubscribe_url": unsubscribe_url,
                **(custom_vars or {}),
            }

            # Personalize content
            final_subject = self._personalize_content(subject, personalized_vars)
            final_html = self._personalize_content(html_content, personalized_vars)
            final_text = self._personalize_content(text_content, personalized_vars)

            # Add unsubscribe footer if not present
            if "unsubscribe" not in final_html.lower():
                final_html += self._get_unsubscribe_footer(unsubscribe_url)

            if "unsubscribe" not in final_text.lower():
                final_text += f"\\n\\nTo unsubscribe: {unsubscribe_url}"

            # Build SendGrid email
            from_email_obj = Email(self.from_email, self.from_name)
            to_email_obj = To(to_email, to_name)

            mail = Mail(
                from_email=from_email_obj,
                to_emails=to_email_obj,
                subject=final_subject,
                html_content=Content("text/html", final_html),
                plain_text_content=Content("text/plain", final_text),
            )

            # Enable tracking
            mail.tracking_settings = self._get_tracking_settings()

            # Send email
            response = self.sg.send(mail)

            if response.status_code in [200, 202]:
                # Extract message ID from response headers
                message_id = response.headers.get("X-Message-Id", "")

                # Record send in database
                self._record_email_send(
                    campaign_id,
                    contact_id,
                    sequence_id,
                    message_id,
                    final_subject,
                    final_html,
                    final_text,
                )

                self.logger.info(
                    f"Email sent successfully to {to_email} (Message ID: {message_id})"
                )
                return True, message_id, ""

            else:
                error_msg = f"SendGrid error: Status {response.status_code}"
                self.logger.error(f"Failed to send email to {to_email}: {error_msg}")
                return False, "", error_msg

        except Exception as e:
            error_msg = f"Exception sending email: {str(e)}"
            self.logger.error(f"Failed to send email to {to_email}: {error_msg}")
            return False, "", error_msg

    def _get_tracking_settings(self):
        """Configure email tracking settings"""
        # Enable click tracking
        click_tracking = ClickTracking(enable=True, enable_text=True)

        # Enable open tracking
        open_tracking = OpenTracking(enable=True)

        return {"click_tracking": click_tracking, "open_tracking": open_tracking}

    def _personalize_content(self, content: str, variables: Dict[str, str]) -> str:
        """Replace placeholder variables in content"""
        if not content:
            return ""

        result = content
        for key, value in variables.items():
            placeholder = f"{{{key}}}"
            result = result.replace(placeholder, str(value))

            # Also support {{key}} format
            placeholder_double = f"{{{{{key}}}}}"
            result = result.replace(placeholder_double, str(value))

        return result

    def _generate_unsubscribe_link(self, email: str, campaign_id: int) -> str:
        """Generate unique unsubscribe link"""
        # Simple token generation - in production, use more secure methods
        import hashlib

        token = hashlib.md5(f"{email}{campaign_id}".encode()).hexdigest()

        params = {"email": email, "token": token, "campaign": campaign_id}

        base_url = "https://www.clutter-free-spaces.com/unsubscribe"
        return f"{base_url}?{urlencode(params)}"

    def _get_unsubscribe_footer(self, unsubscribe_url: str) -> str:
        """Get HTML unsubscribe footer"""
        return f"""
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666; text-align: center;">
            You received this email because you or your business was identified as a potential partner for ClutterFreeSpaces.<br>
            If you no longer wish to receive these emails, you can <a href="{unsubscribe_url}" style="color: #666;">unsubscribe here</a>.
            <br><br>
            ClutterFreeSpaces | Montana's Premier Home Organization Service<br>
            <a href="mailto:contact@clutter-free-spaces.com" style="color: #666;">contact@clutter-free-spaces.com</a>
        </p>
        """

    def _record_email_send(
        self,
        campaign_id: int,
        contact_id: int,
        sequence_id: Optional[int],
        message_id: str,
        subject: str,
        html_content: str,
        text_content: str,
    ):
        """Record email send in database"""
        with self._get_db_connection() as conn:
            cursor = conn.cursor()

            # Insert email send record
            cursor.execute(
                """
                INSERT INTO email_sends (
                    campaign_id, contact_id, sequence_id, sendgrid_message_id,
                    subject, body_html, body_text, sent_at, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    campaign_id,
                    contact_id,
                    sequence_id,
                    message_id,
                    subject,
                    html_content,
                    text_content,
                    datetime.now().isoformat(),
                    "sent",
                ),
            )

            # Update campaign contact stats
            cursor.execute(
                """
                UPDATE campaign_contacts 
                SET emails_sent = emails_sent + 1,
                    last_email_sent = CURRENT_TIMESTAMP
                WHERE campaign_id = ? AND contact_id = ?
            """,
                (campaign_id, contact_id),
            )

            conn.commit()

    def handle_webhook_event(self, event_data: Dict) -> bool:
        """
        Handle SendGrid webhook events (delivered, opened, clicked, etc.)

        Expected to be called from a webhook endpoint
        """
        try:
            event_type = event_data.get("event")
            message_id = event_data.get("sg_message_id", "")
            timestamp = datetime.fromtimestamp(event_data.get("timestamp", 0))

            # Map event types to database fields
            event_mapping = {
                "delivered": "delivered_at",
                "open": "opened_at",
                "click": "clicked_at",
                "bounce": "bounced_at",
                "unsubscribe": "unsubscribed_at",
            }

            if event_type not in event_mapping:
                return True  # Ignore unknown events

            field_name = event_mapping[event_type]

            with self._get_db_connection() as conn:
                cursor = conn.cursor()

                # Update email send record
                cursor.execute(
                    f"""
                    UPDATE email_sends 
                    SET {field_name} = ?, status = ?
                    WHERE sendgrid_message_id LIKE ?
                """,
                    (timestamp.isoformat(), event_type, f"%{message_id}%"),
                )

                # Update campaign contact stats
                if event_type == "open":
                    cursor.execute(
                        """
                        UPDATE campaign_contacts 
                        SET emails_opened = emails_opened + 1
                        WHERE contact_id IN (
                            SELECT contact_id FROM email_sends 
                            WHERE sendgrid_message_id LIKE ?
                        )
                    """,
                        (f"%{message_id}%",),
                    )

                elif event_type == "click":
                    cursor.execute(
                        """
                        UPDATE campaign_contacts 
                        SET emails_clicked = emails_clicked + 1
                        WHERE contact_id IN (
                            SELECT contact_id FROM email_sends 
                            WHERE sendgrid_message_id LIKE ?
                        )
                    """,
                        (f"%{message_id}%",),
                    )

                elif event_type == "unsubscribe":
                    # Add to unsubscribe list
                    email = event_data.get("email", "")
                    if email:
                        cursor.execute(
                            """
                            INSERT OR IGNORE INTO unsubscribes (email, method, unsubscribed_at)
                            VALUES (?, 'sendgrid_webhook', ?)
                        """,
                            (email, timestamp.isoformat()),
                        )

                conn.commit()

            self.logger.info(
                f"Processed webhook event: {event_type} for message {message_id}"
            )
            return True

        except Exception as e:
            self.logger.error(f"Error processing webhook event: {e}")
            return False

    def add_unsubscribe(
        self, email: str, method: str = "manual", campaign_id: Optional[int] = None
    ) -> bool:
        """Add email to unsubscribe list"""
        try:
            with self._get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT OR IGNORE INTO unsubscribes (email, method, campaign_id, unsubscribed_at)
                    VALUES (?, ?, ?, ?)
                """,
                    (email, method, campaign_id, datetime.now().isoformat()),
                )

                # Update any active campaign contacts
                cursor.execute(
                    """
                    UPDATE campaign_contacts 
                    SET status = 'unsubscribed'
                    WHERE contact_id IN (
                        SELECT id FROM business_contacts WHERE email = ?
                    )
                """,
                    (email,),
                )

                conn.commit()

            self.logger.info(f"Added {email} to unsubscribe list via {method}")
            return True

        except Exception as e:
            self.logger.error(f"Error adding unsubscribe for {email}: {e}")
            return False

    def get_campaign_stats(self, campaign_id: int) -> Dict:
        """Get comprehensive campaign statistics"""
        with self._get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM campaign_performance WHERE campaign_id = ?
            """,
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
                AND sent_at >= date('now', '-7 days')
                GROUP BY DATE(sent_at)
                ORDER BY send_date DESC
            """,
                (campaign_id,),
            )

            stats["daily_activity"] = [dict(row) for row in cursor.fetchall()]

            return stats


# Utility functions for campaign management
def test_sendgrid_connection() -> bool:
    """Test SendGrid API connection"""
    try:
        client = SendGridClient()
        # Simple API test - check API key validity
        response = client.sg.user.profile.get()
        return response.status_code == 200
    except Exception as e:
        print(f"SendGrid connection test failed: {e}")
        return False


def send_test_email(to_email: str, to_name: str = "Test Contact") -> bool:
    """Send a test email to verify everything works"""
    try:
        client = SendGridClient()

        # Dummy campaign data for test
        success, message_id, error = client.send_campaign_email(
            campaign_id=0,  # Test campaign
            contact_id=0,  # Test contact
            sequence_id=None,
            to_email=to_email,
            to_name=to_name,
            subject="ClutterFreeSpaces - Email System Test",
            html_content="""
            <h2>Hello {contact_name}!</h2>
            <p>This is a test email from the ClutterFreeSpaces B2B outreach system.</p>
            <p>If you're receiving this, the email integration is working correctly!</p>
            <p>Best regards,<br>The ClutterFreeSpaces Team</p>
            """,
            text_content="""
            Hello {contact_name}!
            
            This is a test email from the ClutterFreeSpaces B2B outreach system.
            If you're receiving this, the email integration is working correctly!
            
            Best regards,
            The ClutterFreeSpaces Team
            """,
            business_name="Test Business",
        )

        if success:
            print(f"Test email sent successfully! Message ID: {message_id}")
            return True
        else:
            print(f"Test email failed: {error}")
            return False

    except Exception as e:
        print(f"Test email exception: {e}")
        return False


if __name__ == "__main__":
    # Command line interface for testing
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == "test-connection":
            success = test_sendgrid_connection()
            print(f"SendGrid connection: {'✓ SUCCESS' if success else '✗ FAILED'}")
            sys.exit(0 if success else 1)

        elif sys.argv[1] == "test-email" and len(sys.argv) > 2:
            success = send_test_email(
                sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "Test Contact"
            )
            sys.exit(0 if success else 1)

    print("Usage:")
    print("  python sendgrid_client.py test-connection")
    print("  python sendgrid_client.py test-email your-email@domain.com 'Your Name'")
