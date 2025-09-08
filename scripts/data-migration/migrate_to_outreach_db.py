#!/usr/bin/env python3
"""
Migration Script: Move B2B Outreach Data to Dedicated Database
Migrates data from .claude/data/metrics.db to outreach/data/b2b_outreach.db
"""

import sqlite3
import os
from datetime import datetime


def migrate_data():
    """Migrate B2B outreach data to dedicated database"""

    # Database paths
    source_db = ".claude/data/metrics.db"
    target_db = "outreach/data/b2b_outreach.db"

    if not os.path.exists(source_db):
        print(f"❌ Source database not found: {source_db}")
        return False

    if not os.path.exists(target_db):
        print(f"❌ Target database not found: {target_db}")
        return False

    print("🔄 Starting B2B Outreach Data Migration")
    print("=" * 50)

    # Connect to both databases
    source_conn = sqlite3.connect(source_db)
    target_conn = sqlite3.connect(target_db)

    source_cursor = source_conn.cursor()
    target_cursor = target_conn.cursor()

    try:
        # 1. Migrate business_types
        print("\n📊 Migrating business types...")
        source_cursor.execute("SELECT * FROM business_types")
        business_types = source_cursor.fetchall()

        # Get column info for business_types
        source_cursor.execute("PRAGMA table_info(business_types)")
        bt_columns = [col[1] for col in source_cursor.fetchall()]

        migrated_types = 0
        for row in business_types:
            type_data = dict(zip(bt_columns, row))
            target_cursor.execute(
                """INSERT OR REPLACE INTO business_types 
                   (id, type_name, description, created_at) 
                   VALUES (?, ?, ?, ?)""",
                (
                    type_data.get("id"),
                    type_data.get("type_name"),
                    type_data.get("description", ""),
                    type_data.get("created_at"),
                ),
            )
            migrated_types += 1
        print(f"✅ Migrated {migrated_types} business types")

        # 2. Migrate businesses
        print("\n🏢 Migrating businesses...")
        source_cursor.execute("SELECT * FROM businesses")
        businesses = source_cursor.fetchall()

        # Get column info for businesses
        source_cursor.execute("PRAGMA table_info(businesses)")
        b_columns = [col[1] for col in source_cursor.fetchall()]

        migrated_businesses = 0
        for row in businesses:
            business_data = dict(zip(b_columns, row))
            target_cursor.execute(
                """INSERT OR REPLACE INTO businesses 
                   (id, name, business_type_id, address, city, state, zip_code, phone, website, email, 
                    google_place_id, latitude, longitude, rating, review_count, notes, 
                    discovered_via, created_at, updated_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    business_data.get("id"),
                    business_data.get("name"),
                    business_data.get("business_type_id"),
                    business_data.get("address"),
                    business_data.get("city"),
                    business_data.get("state", "Montana"),
                    business_data.get("zip_code"),
                    business_data.get("phone"),
                    business_data.get("website"),
                    business_data.get("email"),
                    business_data.get("google_place_id"),
                    business_data.get("latitude"),
                    business_data.get("longitude"),
                    business_data.get("rating"),
                    business_data.get("review_count"),
                    business_data.get("notes"),
                    business_data.get("discovered_via", "google_places"),
                    business_data.get("created_at"),
                    business_data.get("updated_at"),
                ),
            )
            migrated_businesses += 1
        print(f"✅ Migrated {migrated_businesses} businesses")

        # 3. Migrate business_contacts
        print("\n📧 Migrating business contacts...")
        source_cursor.execute("SELECT * FROM business_contacts")
        contacts = source_cursor.fetchall()

        # Get column info for business_contacts
        source_cursor.execute("PRAGMA table_info(business_contacts)")
        c_columns = [col[1] for col in source_cursor.fetchall()]

        migrated_contacts = 0
        for row in contacts:
            contact_data = dict(zip(c_columns, row))
            target_cursor.execute(
                """INSERT OR IGNORE INTO business_contacts 
                   (id, business_id, first_name, last_name, title, email, phone, 
                    linkedin_url, decision_maker, influence_score, contact_preference,
                    best_time_to_contact, discovered_via, confidence_score, contact_type,
                    status, created_at, updated_at) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    contact_data.get("id"),
                    contact_data.get("business_id"),
                    contact_data.get("first_name", ""),
                    contact_data.get("last_name", ""),
                    contact_data.get("title", ""),
                    contact_data.get("email"),
                    contact_data.get("phone", ""),
                    contact_data.get("linkedin_url", ""),
                    contact_data.get("decision_maker", 0),
                    contact_data.get("influence_score", 5),
                    contact_data.get("contact_preference", "email"),
                    contact_data.get("best_time_to_contact", ""),
                    contact_data.get("discovered_via", "unknown"),
                    contact_data.get("confidence_score", 0),
                    contact_data.get("contact_type", "personal"),
                    contact_data.get("status", "active"),
                    contact_data.get("created_at"),
                    contact_data.get("updated_at"),
                ),
            )
            migrated_contacts += 1
        print(f"✅ Migrated {migrated_contacts} business contacts")

        # Commit all changes
        target_conn.commit()

        # 4. Verify migration
        print("\n🔍 Verifying migration...")
        target_cursor.execute("SELECT COUNT(*) FROM business_types")
        bt_count = target_cursor.fetchone()[0]

        target_cursor.execute("SELECT COUNT(*) FROM businesses")
        b_count = target_cursor.fetchone()[0]

        target_cursor.execute("SELECT COUNT(*) FROM business_contacts")
        c_count = target_cursor.fetchone()[0]

        print(f"📊 Target database now contains:")
        print(f"   • Business Types: {bt_count}")
        print(f"   • Businesses: {b_count}")
        print(f"   • Business Contacts: {c_count}")

        # 5. Create summary view
        target_cursor.execute(
            """
            SELECT bt.type_name, COUNT(b.id) as business_count, 
                   COUNT(CASE WHEN b.email IS NOT NULL AND b.email != '' THEN 1 END) as with_email
            FROM business_types bt
            LEFT JOIN businesses b ON bt.id = b.business_type_id
            GROUP BY bt.type_name
            ORDER BY business_count DESC
        """
        )

        print(f"\n📈 Business Summary by Type:")
        for type_name, count, with_email in target_cursor.fetchall():
            email_pct = (with_email / count * 100) if count > 0 else 0
            print(
                f"   • {type_name}: {count} businesses ({with_email} with emails - {email_pct:.1f}%)"
            )

        print(f"\n✅ Migration completed successfully!")
        print(f"🎯 New database location: {target_db}")

        return True

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        target_conn.rollback()
        return False

    finally:
        source_conn.close()
        target_conn.close()


def update_scripts_database_path():
    """Update all scripts to use the new database path"""
    scripts_to_update = [
        "hunter_email_finder.py",
        "enhanced_basic_extractor.py",
        "enhanced_email_extractor.py",
        "manual_scraper.py",
        "email_count.py",
        "deep_analysis.py",
    ]

    old_path = ".claude/data/metrics.db"
    new_path = "outreach/data/b2b_outreach.db"

    print(f"\n🔧 Updating script database paths...")

    for script in scripts_to_update:
        if os.path.exists(script):
            try:
                with open(script, "r") as f:
                    content = f.read()

                if old_path in content:
                    updated_content = content.replace(old_path, new_path)
                    with open(script, "w") as f:
                        f.write(updated_content)
                    print(f"   ✅ Updated {script}")
                else:
                    print(f"   ➡️  {script} (no changes needed)")

            except Exception as e:
                print(f"   ❌ Failed to update {script}: {e}")

    print(f"✅ Database path updates complete!")


if __name__ == "__main__":
    success = migrate_data()
    if success:
        update_scripts_database_path()
        print(f"\n🎉 B2B Outreach system is now using dedicated database!")
        print(f"📁 Database: outreach/data/b2b_outreach.db")
        print(f"📋 Schema: outreach/b2b_outreach_schema.sql")
    else:
        print(f"\n💥 Migration failed. Please check the errors above.")
