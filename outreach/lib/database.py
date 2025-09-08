"""
ClutterFreeSpaces B2B Outreach Database Utilities
Shared database functions for the outreach system
"""

import sqlite3
import json
from datetime import datetime, date
from typing import Dict, List, Optional, Any, Tuple
from pathlib import Path

try:
    from outreach.config.settings import DATABASE_PATH, logger
except ImportError:
    # When running from outreach directory, use relative import
    from config.settings import DATABASE_PATH, logger


class OutreachDB:
    """Database manager for B2B outreach system"""

    def __init__(self, db_path: Path = DATABASE_PATH):
        self.db_path = db_path
        self.logger = logger

    def get_connection(self) -> sqlite3.Connection:
        """Get database connection with proper configuration"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable dict-like access to rows
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def execute_query(self, query: str, params: tuple = ()) -> List[sqlite3.Row]:
        """Execute a SELECT query and return results"""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute(query, params)
                return cursor.fetchall()
        except Exception as e:
            self.logger.error(f"Query failed: {query}, Error: {e}")
            raise

    def execute_update(self, query: str, params: tuple = ()) -> int:
        """Execute INSERT/UPDATE/DELETE and return affected rows"""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute(query, params)
                conn.commit()
                return cursor.rowcount
        except Exception as e:
            self.logger.error(f"Update failed: {query}, Error: {e}")
            raise

    def execute_insert(self, query: str, params: tuple = ()) -> int:
        """Execute INSERT and return the new row ID"""
        try:
            with self.get_connection() as conn:
                cursor = conn.execute(query, params)
                conn.commit()
                return cursor.lastrowid
        except Exception as e:
            self.logger.error(f"Insert failed: {query}, Error: {e}")
            raise

    # Business Type Management
    def get_business_type_id(self, type_name: str) -> Optional[int]:
        """Get business type ID by name"""
        query = "SELECT id FROM business_types WHERE type_name = ?"
        result = self.execute_query(query, (type_name,))
        return result[0]["id"] if result else None

    def get_all_business_types(self) -> List[Dict]:
        """Get all business types with priorities"""
        query = """
        SELECT id, type_name, category, description, priority_score, commission_rate
        FROM business_types
        ORDER BY priority_score DESC, type_name
        """
        return [dict(row) for row in self.execute_query(query)]

    # Business Management
    def insert_business(self, business_data: Dict) -> int:
        """Insert a new business and return its ID"""
        query = """
        INSERT INTO businesses (
            business_type_id, name, address, city, state, zip_code,
            phone, website, email, facebook_url, linkedin_url,
            google_maps_url, yelp_url, years_in_business, employee_count,
            estimated_annual_revenue, google_rating, review_count,
            partnership_potential, market_reach, customer_overlap_score,
            discovered_via, status, notes
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
        """

        params = (
            business_data.get("business_type_id"),
            business_data.get("name"),
            business_data.get("address"),
            business_data.get("city"),
            business_data.get("state", "MT"),
            business_data.get("zip_code"),
            business_data.get("phone"),
            business_data.get("website"),
            business_data.get("email"),
            business_data.get("facebook_url"),
            business_data.get("linkedin_url"),
            business_data.get("google_maps_url"),
            business_data.get("yelp_url"),
            business_data.get("years_in_business"),
            business_data.get("employee_count"),
            business_data.get("estimated_annual_revenue"),
            business_data.get("google_rating"),
            business_data.get("review_count"),
            business_data.get("partnership_potential", 50),
            business_data.get("market_reach", "local"),
            business_data.get("customer_overlap_score", 50),
            business_data.get("discovered_via"),
            business_data.get("status", "discovered"),
            business_data.get("notes"),
        )

        return self.execute_insert(query, params)

    def update_business(self, business_id: int, updates: Dict) -> int:
        """Update business data"""
        if not updates:
            return 0

        # Build dynamic update query
        set_clauses = []
        params = []

        for field, value in updates.items():
            set_clauses.append(f"{field} = ?")
            params.append(value)

        params.append(business_id)

        query = f"""
        UPDATE businesses 
        SET {', '.join(set_clauses)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """

        return self.execute_update(query, tuple(params))

    def get_business(self, business_id: int) -> Optional[Dict]:
        """Get business by ID with business type info"""
        query = """
        SELECT b.*, bt.type_name, bt.category, bt.commission_rate
        FROM businesses b
        JOIN business_types bt ON b.business_type_id = bt.id
        WHERE b.id = ?
        """
        result = self.execute_query(query, (business_id,))
        return dict(result[0]) if result else None

    def search_businesses(self, filters: Dict = None, limit: int = 100) -> List[Dict]:
        """Search businesses with optional filters"""
        where_clauses = []
        params = []

        if filters:
            if "business_type" in filters:
                where_clauses.append("bt.type_name = ?")
                params.append(filters["business_type"])

            if "city" in filters:
                where_clauses.append("b.city ILIKE ?")
                params.append(f"%{filters['city']}%")

            if "status" in filters:
                where_clauses.append("b.status = ?")
                params.append(filters["status"])

            if "min_partnership_potential" in filters:
                where_clauses.append("b.partnership_potential >= ?")
                params.append(filters["min_partnership_potential"])

        where_clause = " AND ".join(where_clauses) if where_clauses else "1=1"

        query = f"""
        SELECT b.*, bt.type_name, bt.category, bt.priority_score
        FROM businesses b
        JOIN business_types bt ON b.business_type_id = bt.id
        WHERE {where_clause}
        ORDER BY b.partnership_potential DESC, bt.priority_score DESC
        LIMIT ?
        """

        params.append(limit)
        return [dict(row) for row in self.execute_query(query, tuple(params))]

    def check_business_exists(self, name: str, city: str) -> Optional[int]:
        """Check if business already exists (by name and city)"""
        query = "SELECT id FROM businesses WHERE LOWER(name) = LOWER(?) AND LOWER(city) = LOWER(?)"
        result = self.execute_query(query, (name, city))
        return result[0]["id"] if result else None

    # Contact Management
    def insert_contact(self, contact_data: Dict) -> int:
        """Insert a new business contact"""
        query = """
        INSERT INTO business_contacts (
            business_id, first_name, last_name, title, email, phone,
            linkedin_url, decision_maker, influence_score, contact_preference,
            best_time_to_contact, discovered_via, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        params = (
            contact_data.get("business_id"),
            contact_data.get("first_name"),
            contact_data.get("last_name"),
            contact_data.get("title"),
            contact_data.get("email"),
            contact_data.get("phone"),
            contact_data.get("linkedin_url"),
            contact_data.get("decision_maker", False),
            contact_data.get("influence_score", 50),
            contact_data.get("contact_preference", "email"),
            contact_data.get("best_time_to_contact"),
            contact_data.get("discovered_via"),
            contact_data.get("status", "discovered"),
        )

        return self.execute_insert(query, params)

    def get_business_contacts(self, business_id: int) -> List[Dict]:
        """Get all contacts for a business"""
        query = """
        SELECT * FROM business_contacts 
        WHERE business_id = ?
        ORDER BY decision_maker DESC, influence_score DESC
        """
        return [dict(row) for row in self.execute_query(query, (business_id,))]

    def update_contact(self, contact_id: int, updates: Dict) -> int:
        """Update contact data"""
        if not updates:
            return 0

        set_clauses = []
        params = []

        for field, value in updates.items():
            set_clauses.append(f"{field} = ?")
            params.append(value)

        params.append(contact_id)

        query = f"""
        UPDATE business_contacts 
        SET {', '.join(set_clauses)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """

        return self.execute_update(query, tuple(params))

    # Campaign Management
    def create_campaign(self, campaign_data: Dict) -> int:
        """Create a new outreach campaign"""
        query = """
        INSERT INTO outreach_campaigns (
            name, campaign_type, description, status, start_date, end_date,
            daily_send_limit, email_subject_template, email_body_template,
            follow_up_sequence, target_contacts, target_responses,
            target_partnerships, expected_revenue
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        params = (
            campaign_data.get("name"),
            campaign_data.get("campaign_type"),
            campaign_data.get("description"),
            campaign_data.get("status", "draft"),
            campaign_data.get("start_date"),
            campaign_data.get("end_date"),
            campaign_data.get("daily_send_limit", 20),
            campaign_data.get("email_subject_template"),
            campaign_data.get("email_body_template"),
            json.dumps(campaign_data.get("follow_up_sequence", [])),
            campaign_data.get("target_contacts"),
            campaign_data.get("target_responses"),
            campaign_data.get("target_partnerships"),
            campaign_data.get("expected_revenue"),
        )

        return self.execute_insert(query, params)

    def get_campaign(self, campaign_id: int) -> Optional[Dict]:
        """Get campaign by ID"""
        query = "SELECT * FROM outreach_campaigns WHERE id = ?"
        result = self.execute_query(query, (campaign_id,))
        if result:
            campaign = dict(result[0])
            # Parse JSON fields
            if campaign["follow_up_sequence"]:
                campaign["follow_up_sequence"] = json.loads(
                    campaign["follow_up_sequence"]
                )
            return campaign
        return None

    def get_active_campaigns(self) -> List[Dict]:
        """Get all active campaigns"""
        query = "SELECT * FROM outreach_campaigns WHERE status = 'active' ORDER BY created_at DESC"
        campaigns = []
        for row in self.execute_query(query):
            campaign = dict(row)
            if campaign["follow_up_sequence"]:
                campaign["follow_up_sequence"] = json.loads(
                    campaign["follow_up_sequence"]
                )
            campaigns.append(campaign)
        return campaigns

    # Outreach Activity Management
    def log_outreach_activity(self, activity_data: Dict) -> int:
        """Log an outreach activity"""
        query = """
        INSERT INTO outreach_activities (
            campaign_id, contact_id, business_id, activity_type, subject,
            content, scheduled_at, sent_at, status, follow_up_needed,
            follow_up_date, follow_up_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        params = (
            activity_data.get("campaign_id"),
            activity_data.get("contact_id"),
            activity_data.get("business_id"),
            activity_data.get("activity_type"),
            activity_data.get("subject"),
            activity_data.get("content"),
            activity_data.get("scheduled_at"),
            activity_data.get("sent_at"),
            activity_data.get("status", "scheduled"),
            activity_data.get("follow_up_needed", True),
            activity_data.get("follow_up_date"),
            activity_data.get("follow_up_type"),
        )

        return self.execute_insert(query, params)

    def update_activity_status(self, activity_id: int, status: str, **kwargs) -> int:
        """Update activity status and optional fields"""
        updates = {"status": status}
        updates.update(kwargs)

        set_clauses = []
        params = []

        for field, value in updates.items():
            set_clauses.append(f"{field} = ?")
            params.append(value)

        params.append(activity_id)

        query = f"""
        UPDATE outreach_activities 
        SET {', '.join(set_clauses)}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """

        return self.execute_update(query, tuple(params))

    def get_pending_outreach(self, limit: int = 50) -> List[Dict]:
        """Get pending outreach activities"""
        query = """
        SELECT oa.*, bc.email, bc.first_name, bc.last_name, 
               b.name as business_name, oc.name as campaign_name
        FROM outreach_activities oa
        JOIN business_contacts bc ON oa.contact_id = bc.id
        JOIN businesses b ON oa.business_id = b.id
        JOIN outreach_campaigns oc ON oa.campaign_id = oc.id
        WHERE oa.status = 'scheduled' AND oa.scheduled_at <= datetime('now')
        ORDER BY oa.scheduled_at ASC
        LIMIT ?
        """
        return [dict(row) for row in self.execute_query(query, (limit,))]

    # Analytics and Reporting
    def get_campaign_stats(self, campaign_id: int) -> Dict:
        """Get campaign performance statistics"""
        query = """
        SELECT 
            COUNT(*) as total_activities,
            COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
            COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_count,
            COUNT(CASE WHEN replied_at IS NOT NULL THEN 1 END) as replied_count,
            COUNT(CASE WHEN response_sentiment = 'positive' THEN 1 END) as positive_responses,
            COUNT(CASE WHEN response_sentiment = 'interested' THEN 1 END) as interested_responses
        FROM outreach_activities
        WHERE campaign_id = ?
        """
        result = self.execute_query(query, (campaign_id,))
        stats = dict(result[0]) if result else {}

        # Calculate rates
        if stats.get("sent_count", 0) > 0:
            stats["open_rate"] = round(
                (stats.get("opened_count", 0) / stats["sent_count"]) * 100, 2
            )
            stats["reply_rate"] = round(
                (stats.get("replied_count", 0) / stats["sent_count"]) * 100, 2
            )
        else:
            stats["open_rate"] = 0
            stats["reply_rate"] = 0

        return stats

    def get_business_type_performance(self) -> List[Dict]:
        """Get performance metrics by business type"""
        query = """
        SELECT 
            bt.type_name,
            bt.category,
            COUNT(DISTINCT b.id) as total_businesses,
            COUNT(DISTINCT bc.id) as total_contacts,
            COUNT(CASE WHEN b.status = 'contacted' THEN 1 END) as contacted_count,
            COUNT(CASE WHEN b.status = 'qualified' THEN 1 END) as qualified_count,
            COUNT(CASE WHEN b.status = 'partner' THEN 1 END) as partner_count,
            AVG(b.partnership_potential) as avg_partnership_potential
        FROM business_types bt
        LEFT JOIN businesses b ON bt.id = b.business_type_id
        LEFT JOIN business_contacts bc ON b.id = bc.business_id
        GROUP BY bt.id, bt.type_name, bt.category
        ORDER BY bt.priority_score DESC
        """
        return [dict(row) for row in self.execute_query(query)]

    def get_daily_activity_summary(self, days: int = 7) -> List[Dict]:
        """Get daily activity summary for the last N days"""
        query = """
        SELECT 
            DATE(sent_at) as activity_date,
            COUNT(*) as total_sent,
            COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as total_opened,
            COUNT(CASE WHEN replied_at IS NOT NULL THEN 1 END) as total_replied,
            activity_type
        FROM outreach_activities
        WHERE sent_at >= date('now', '-' || ? || ' days')
        GROUP BY DATE(sent_at), activity_type
        ORDER BY activity_date DESC
        """
        return [dict(row) for row in self.execute_query(query, (days,))]

    # Utility Methods
    def get_next_activities_due(self, days_ahead: int = 7) -> List[Dict]:
        """Get activities due in the next N days"""
        query = """
        SELECT oa.*, bc.email, bc.first_name, bc.last_name, 
               b.name as business_name, oc.name as campaign_name
        FROM outreach_activities oa
        JOIN business_contacts bc ON oa.contact_id = bc.id
        JOIN businesses b ON oa.business_id = b.id
        JOIN outreach_campaigns oc ON oa.campaign_id = oc.id
        WHERE oa.follow_up_date <= date('now', '+' || ? || ' days')
            AND oa.follow_up_needed = 1
            AND oa.status NOT IN ('failed', 'completed')
        ORDER BY oa.follow_up_date ASC
        """
        return [dict(row) for row in self.execute_query(query, (days_ahead,))]

    def cleanup_old_cache(self, days_old: int = 7) -> int:
        """Clean up old API cache entries"""
        query = (
            "DELETE FROM api_cache WHERE created_at < date('now', '-' || ? || ' days')"
        )
        return self.execute_update(query, (days_old,))


# Convenience instance for importing
db = OutreachDB()
