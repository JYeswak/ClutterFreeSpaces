#!/usr/bin/env python3
"""
Daily Campaign Sender - ClutterFreeSpaces
Sends optimal batch of emails daily while respecting anti-spam rules
"""

import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from outreach.campaigns.timing_controller import EmailTimingController
from outreach.campaigns.email_campaign_manager import EmailCampaignManager
from datetime import datetime


def main():
    """Send daily batch of emails with proper timing controls"""

    print(f"🚀 DAILY CAMPAIGN SENDER - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 70)

    # Initialize controllers
    timing_controller = EmailTimingController()
    campaign_manager = EmailCampaignManager()

    # Check if we can send emails now
    sent_today, remaining_capacity = timing_controller.get_daily_send_capacity()
    is_business_hours = timing_controller.is_business_hours()

    print(f"📧 Emails sent today: {sent_today}")
    print(f"📮 Remaining capacity: {remaining_capacity}")
    print(f"⏰ Business hours: {'Yes' if is_business_hours else 'No'}")

    if not is_business_hours:
        print("\n⚠️  Outside business hours (8 AM - 5 PM MT). Exiting.")
        return

    if remaining_capacity <= 0:
        print(
            f"\n✅ Daily limit reached ({sent_today} emails sent). Try again tomorrow."
        )
        return

    # Get optimal batch of contacts to email
    print(f"\n🎯 Getting optimal send batch...")

    # Prioritize different campaign types
    campaign_types = [
        "real_estate_email1",  # High-value real estate agents first
        "storage_facilities_email1",  # Storage partnerships
        "home_builder_email1",  # New market segment
        "insurance_agent_email1",  # Insurance partnerships
        "estate_attorney_email1",  # Premium legal clients
        "senior_living_email1",  # Senior care segment
        "general",  # Catch-all for other segments
    ]

    total_sent = 0
    max_per_campaign = min(
        10, remaining_capacity // len(campaign_types)
    )  # Distribute evenly

    for campaign_type in campaign_types:
        if total_sent >= remaining_capacity:
            break

        print(f"\n📋 Processing {campaign_type}...")

        # Get contacts ready for this campaign type
        sendable_contacts = timing_controller.get_sendable_contacts(
            campaign_type, limit=max_per_campaign
        )

        if not sendable_contacts:
            print(f"   ℹ️  No contacts ready for {campaign_type}")
            continue

        print(f"   ✅ Found {len(sendable_contacts)} sendable contacts")

        # Send emails to these contacts
        for contact in sendable_contacts:
            if total_sent >= remaining_capacity:
                break

            # Double-check timing rules before sending
            can_send, reason = timing_controller.can_send_to_contact(
                contact["id"], campaign_type
            )

            if not can_send:
                print(f"   ⚠️  Skipping {contact['business_name']}: {reason}")
                continue

            try:
                # Create campaign context for this contact
                campaign_context = {
                    "business_name": contact["business_name"],
                    "business_type": contact["business_type"],
                    "first_name": contact["first_name"] or "there",
                    "contact_name": f"{contact['first_name']} {contact['last_name']}".strip()
                    or contact["business_name"],
                }

                # Send the email (this will update campaign_sends table)
                success = campaign_manager.send_to_contact(
                    contact_id=contact["id"],
                    email=contact["email"],
                    campaign_type=campaign_type,
                    context=campaign_context,
                )

                if success:
                    total_sent += 1
                    print(
                        f"   ✅ Sent to {contact['business_name']} ({contact['email']})"
                    )
                else:
                    print(f"   ❌ Failed to send to {contact['business_name']}")

            except Exception as e:
                print(f"   ❌ Error sending to {contact['business_name']}: {e}")

    # Final status
    print(f"\n🎉 DAILY SENDING COMPLETE")
    print(f"📊 Total emails sent: {total_sent}")
    print(
        f"📈 Daily progress: {sent_today + total_sent}/{timing_controller.rules.max_daily_sends}"
    )

    # Update next send times for all sequences
    updated_sequences = timing_controller.update_campaign_sequences()
    print(f"🔄 Updated {updated_sequences} campaign sequences for proper timing")

    return total_sent


if __name__ == "__main__":
    emails_sent = main()
    print(f"\nProcess completed. {emails_sent} emails sent.")
