#!/usr/bin/env python3
"""
Decision Maker Email Filter for ClutterFreeSpaces B2B Outreach
Filters business contacts to keep only key decision makers, removing staff emails
"""

import sqlite3
import re
from datetime import datetime


class DecisionMakerFilter:
    """Filter emails to key decision makers only"""

    def __init__(self):
        self.conn = sqlite3.connect("outreach/data/b2b_outreach.db")
        self.cursor = self.conn.cursor()

        # Decision maker indicators in titles/names
        self.decision_maker_titles = [
            "owner",
            "ceo",
            "president",
            "founder",
            "principal",
            "partner",
            "director",
            "manager",
            "supervisor",
            "lead",
            "head",
            "chief",
            "vp",
            "vice president",
            "executive",
            "administrator",
            "coordinator",
            "general manager",
            "operations manager",
            "sales manager",
            "office manager",
        ]

        # Staff/non-decision maker indicators
        self.staff_titles = [
            "assistant",
            "clerk",
            "receptionist",
            "secretary",
            "intern",
            "technician",
            "mechanic",
            "driver",
            "helper",
            "worker",
            "sales associate",
            "customer service",
            "support",
            "representative",
        ]

        # Generic/role-based emails to remove
        self.generic_prefixes = [
            "info",
            "admin",
            "support",
            "help",
            "sales",
            "billing",
            "accounts",
            "marketing",
            "hr",
            "careers",
            "jobs",
            "noreply",
            "no-reply",
            "donotreply",
        ]

    def score_decision_maker_likelihood(
        self, email, first_name="", last_name="", title=""
    ):
        """Score how likely an email belongs to a decision maker (0-100)"""
        score = 50  # Baseline score
        email = email.lower()
        title = title.lower() if title else ""

        # Check for generic/role-based emails (strong negative indicator)
        email_prefix = email.split("@")[0]
        for generic in self.generic_prefixes:
            if generic in email_prefix:
                return 0  # Definitely not a decision maker

        # Check title for decision maker indicators
        if title:
            for dm_title in self.decision_maker_titles:
                if dm_title in title:
                    score += 30
                    break

            for staff_title in self.staff_titles:
                if staff_title in title:
                    score -= 25
                    break

        # Check email pattern
        # Personal emails (first.last@domain) are usually decision makers
        name_pattern = r"^[a-z]+[\._][a-z]+@"
        if re.match(name_pattern, email):
            score += 15

        # Short emails (like bob@company.com) often indicate owners
        if len(email_prefix) <= 6 and not any(char.isdigit() for char in email_prefix):
            score += 10

        # Domain matching business name suggests owner
        if first_name and first_name.lower() in email_prefix:
            score += 15
        if last_name and last_name.lower() in email_prefix:
            score += 15

        # Penalize very long email addresses (often generic)
        if len(email_prefix) > 15:
            score -= 10

        # Penalize emails with numbers (often staff accounts)
        if any(char.isdigit() for char in email_prefix):
            score -= 5

        return max(0, min(100, score))

    def filter_to_decision_makers(
        self, min_score=60, max_per_business=2, preserve_warm_connections=True
    ):
        """Filter emails to keep only decision makers"""
        print(f"\n🎯 FILTERING TO DECISION MAKERS")
        print(f"   Min score: {min_score}, Max per business: {max_per_business}")
        print(f"   Preserve warm connections: {preserve_warm_connections}")
        print("=" * 60)

        # Get all contacts with business info
        self.cursor.execute(
            """
            SELECT bc.id, bc.business_id, bc.email, bc.first_name, bc.last_name, 
                   bc.title, bc.confidence_score, bc.contact_type, b.name as business_name,
                   bt.type_name
            FROM business_contacts bc
            JOIN businesses b ON bc.business_id = b.id
            JOIN business_types bt ON b.business_type_id = bt.id
            WHERE bc.status = 'active'
            ORDER BY bc.business_id, bc.confidence_score DESC
        """
        )

        all_contacts = self.cursor.fetchall()

        # Group by business and score each contact
        business_contacts = {}
        for contact in all_contacts:
            (
                contact_id,
                business_id,
                email,
                first_name,
                last_name,
                title,
                confidence,
                contact_type,
                business_name,
                btype,
            ) = contact

            if business_id not in business_contacts:
                business_contacts[business_id] = {
                    "name": business_name,
                    "type": btype,
                    "contacts": [],
                }

            dm_score = self.score_decision_maker_likelihood(
                email, first_name, last_name, title
            )

            business_contacts[business_id]["contacts"].append(
                {
                    "id": contact_id,
                    "email": email,
                    "first_name": first_name or "",
                    "last_name": last_name or "",
                    "title": title or "",
                    "confidence": confidence or 0,
                    "dm_score": dm_score,
                    "contact_type": contact_type or "personal",
                    "is_warm": contact_type == "warm_connection",
                }
            )

        # Filter and mark contacts
        kept_count = 0
        removed_count = 0

        for business_id, data in business_contacts.items():
            contacts = data["contacts"]

            # Special handling for warm connections (preserve all)
            warm_contacts = [c for c in contacts if c["is_warm"]]
            regular_contacts = [c for c in contacts if not c["is_warm"]]

            if warm_contacts and preserve_warm_connections:
                # Keep all warm connections
                for contact in warm_contacts:
                    kept_count += 1
                    print(f"🔥 WARM: Keeping {contact['email']} ({data['name']})")

            if len(regular_contacts) == 1:
                # Single regular contact - keep if score is reasonable
                contact = regular_contacts[0]
                if (
                    contact["dm_score"] >= min_score * 0.7
                ):  # More lenient for single contacts
                    kept_count += 1
                else:
                    if removed_count < 10:  # Show first few removals
                        print(
                            f"❌ Removing single low-quality contact: {contact['email']} (score: {contact['dm_score']})"
                        )
                    self.cursor.execute(
                        'UPDATE business_contacts SET status = "filtered_out" WHERE id = ?',
                        (contact["id"],),
                    )
                    removed_count += 1
            elif len(regular_contacts) > 1:
                # Multiple regular contacts - keep top decision makers
                # Sort by decision maker score first, then confidence
                regular_contacts.sort(
                    key=lambda x: (x["dm_score"], x["confidence"]), reverse=True
                )

                kept_for_business = 0
                for i, contact in enumerate(regular_contacts):
                    if (
                        kept_for_business < max_per_business
                        and contact["dm_score"] >= min_score
                    ):
                        # Keep this contact
                        kept_count += 1
                        kept_for_business += 1
                    else:
                        # Remove this contact
                        reason = (
                            f"score: {contact['dm_score']}"
                            if contact["dm_score"] < min_score
                            else "excess contact"
                        )
                        if removed_count < 10:  # Show first few removals
                            print(
                                f"❌ {data['name']}: Removing {contact['email']} ({reason})"
                            )

                        self.cursor.execute(
                            'UPDATE business_contacts SET status = "filtered_out" WHERE id = ?',
                            (contact["id"],),
                        )
                        removed_count += 1

        self.conn.commit()

        print(f"\n✅ FILTERING COMPLETE!")
        print(f"   • Emails kept: {kept_count}")
        print(f"   • Emails filtered out: {removed_count}")
        print(f"   • Reduction: {removed_count/(kept_count+removed_count)*100:.1f}%")

        return kept_count, removed_count

    def show_filtered_summary(self):
        """Show summary of filtered results"""
        print(f"\n📊 FINAL DECISION MAKER EMAIL SUMMARY")
        print("=" * 60)

        # Summary by business type
        self.cursor.execute(
            """
            SELECT bt.type_name, COUNT(bc.id) as active_emails,
                   COUNT(DISTINCT bc.business_id) as businesses_with_emails
            FROM business_types bt
            JOIN businesses b ON bt.id = b.business_type_id
            JOIN business_contacts bc ON b.id = bc.business_id
            WHERE bc.status = 'active'
            GROUP BY bt.type_name
            ORDER BY active_emails DESC
        """
        )

        results = self.cursor.fetchall()

        total_emails = 0
        total_businesses = 0

        print("📈 BY BUSINESS TYPE:")
        for btype, emails, businesses in results:
            print(f"  • {btype}: {emails} emails from {businesses} businesses")
            total_emails += emails
            total_businesses += businesses

        print(f"\n🎯 TOTALS:")
        print(f"  • Decision maker emails: {total_emails}")
        print(f"  • Businesses represented: {total_businesses}")
        print(f"  • Average per business: {total_emails/total_businesses:.1f}")

        # Show warm connections specifically
        self.cursor.execute(
            """
            SELECT COUNT(*) FROM business_contacts 
            WHERE status = 'active' AND contact_type = 'warm_connection'
        """
        )
        warm_count = self.cursor.fetchone()[0]

        print(f"  • Warm connections (Chanel): {warm_count}")

        # Show some examples
        print(f"\n✅ SAMPLE DECISION MAKER EMAILS:")
        self.cursor.execute(
            """
            SELECT b.name, bt.type_name, bc.email, bc.title, bc.contact_type
            FROM business_contacts bc
            JOIN businesses b ON bc.business_id = b.id
            JOIN business_types bt ON b.business_type_id = bt.id
            WHERE bc.status = 'active'
            ORDER BY bc.contact_type DESC, RANDOM()
            LIMIT 15
        """
        )

        samples = self.cursor.fetchall()
        for name, btype, email, title, contact_type in samples:
            title_display = f" ({title})" if title else ""
            warm_indicator = " 🔥" if contact_type == "warm_connection" else ""
            print(f"  • {name} [{btype}]: {email}{title_display}{warm_indicator}")

    def close(self):
        """Close database connection"""
        self.conn.close()


def main():
    """Main function"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Filter emails to decision makers only"
    )
    parser.add_argument(
        "--min-score", type=int, default=60, help="Minimum decision maker score (0-100)"
    )
    parser.add_argument(
        "--max-per-business", type=int, default=2, help="Maximum emails per business"
    )
    parser.add_argument(
        "--no-preserve-warm",
        action="store_true",
        help="Don't preserve warm connections (apply filtering to all)",
    )

    args = parser.parse_args()

    filter_tool = DecisionMakerFilter()

    try:
        # Perform filtering
        kept, removed = filter_tool.filter_to_decision_makers(
            min_score=args.min_score,
            max_per_business=args.max_per_business,
            preserve_warm_connections=not args.no_preserve_warm,
        )

        # Show final results
        filter_tool.show_filtered_summary()

        print(f"\n🎉 DECISION MAKER FILTERING COMPLETE!")
        print(f"   Ready for email validation and campaign launch")

    finally:
        filter_tool.close()


if __name__ == "__main__":
    main()
