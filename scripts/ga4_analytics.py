#!/usr/bin/env python3
"""
GA4 Analytics Integration for ClutterFreeSpaces
Pulls website traffic data, email campaign performance, and visitor insights
Uses Google Cloud Application Default Credentials
"""

import os
import sys
from datetime import datetime, timedelta
import json
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import (
        RunReportRequest,
        RunRealtimeReportRequest,
        Dimension,
        Metric,
        DateRange,
        OrderBy,
        MetricOrderBy,
    )
    from google.oauth2 import service_account

    GA4_AVAILABLE = True
except ImportError:
    print(
        "⚠️ Google Analytics Data API not installed. Run: pip install google-analytics-data"
    )
    GA4_AVAILABLE = False


class GA4Analytics:
    """Google Analytics 4 data client for ClutterFreeSpaces"""

    def __init__(self):
        self.property_id = os.getenv(
            "GA4_PROPERTY_ID", "441154484"
        )  # ClutterFreeSpaces GA4 property
        self.measurement_id = os.getenv("GA4_MEASUREMENT_ID", "G-Y71YECTN4F")

        if not GA4_AVAILABLE:
            raise ImportError("Google Analytics Data API not available")

        # Use Application Default Credentials (ADC) from gcloud
        try:
            self.client = BetaAnalyticsDataClient()
            print(f"✅ Connected to GA4 property: {self.property_id}")
        except Exception as e:
            print(f"❌ Failed to connect to GA4: {e}")
            print("   Try running: gcloud auth application-default login")
            raise

    def get_traffic_overview(self, days_back: int = 7) -> Dict:
        """Get basic traffic overview for the last N days"""

        try:
            request = RunReportRequest(
                property=f"properties/{self.property_id}",
                dimensions=[Dimension(name="date"), Dimension(name="hour")],
                metrics=[
                    Metric(name="sessions"),
                    Metric(name="screenPageViews"),
                    Metric(name="totalUsers"),
                    Metric(name="averageSessionDuration"),
                    Metric(name="bounceRate"),
                ],
                date_ranges=[
                    DateRange(start_date=f"{days_back}daysAgo", end_date="today")
                ],
                order_bys=[OrderBy(dimension={"dimension_name": "date"}, desc=False)],
            )

            response = self.client.run_report(request=request)

            # Process response
            traffic_data = {
                "total_sessions": 0,
                "total_page_views": 0,
                "total_users": 0,
                "hourly_patterns": {},
                "daily_breakdown": {},
            }

            for row in response.rows:
                date = row.dimension_values[0].value
                hour = row.dimension_values[1].value
                sessions = int(row.metric_values[0].value or 0)
                page_views = int(row.metric_values[1].value or 0)
                users = int(row.metric_values[2].value or 0)

                # Aggregate totals
                traffic_data["total_sessions"] += sessions
                traffic_data["total_page_views"] += page_views
                traffic_data["total_users"] += users

                # Track hourly patterns
                if hour not in traffic_data["hourly_patterns"]:
                    traffic_data["hourly_patterns"][hour] = {"sessions": 0, "users": 0}
                traffic_data["hourly_patterns"][hour]["sessions"] += sessions
                traffic_data["hourly_patterns"][hour]["users"] += users

                # Track daily breakdown
                if date not in traffic_data["daily_breakdown"]:
                    traffic_data["daily_breakdown"][date] = {
                        "sessions": 0,
                        "users": 0,
                        "page_views": 0,
                    }
                traffic_data["daily_breakdown"][date]["sessions"] += sessions
                traffic_data["daily_breakdown"][date]["users"] += users
                traffic_data["daily_breakdown"][date]["page_views"] += page_views

            return traffic_data

        except Exception as e:
            print(f"❌ Error fetching traffic overview: {e}")
            return {}

    def get_email_campaign_performance(self, days_back: int = 7) -> Dict:
        """Track performance of email campaigns"""

        try:
            request = RunReportRequest(
                property=f"properties/{self.property_id}",
                dimensions=[
                    Dimension(name="firstUserSource"),
                    Dimension(name="firstUserMedium"),
                    Dimension(name="firstUserCampaign"),
                    Dimension(name="date"),
                ],
                metrics=[
                    Metric(name="sessions"),
                    Metric(name="totalUsers"),
                    Metric(name="screenPageViews"),
                    Metric(name="averageSessionDuration"),
                    Metric(name="conversions"),  # Contact form submissions
                ],
                date_ranges=[
                    DateRange(start_date=f"{days_back}daysAgo", end_date="today")
                ],
                dimension_filter={
                    "filter": {
                        "field_name": "firstUserSource",
                        "string_filter": {"match_type": "CONTAINS", "value": "email"},
                    }
                },
            )

            response = self.client.run_report(request=request)

            email_performance = {
                "total_email_sessions": 0,
                "total_email_users": 0,
                "campaigns": {},
                "daily_performance": {},
            }

            for row in response.rows:
                source = row.dimension_values[0].value
                medium = row.dimension_values[1].value
                campaign = row.dimension_values[2].value
                date = row.dimension_values[3].value

                sessions = int(row.metric_values[0].value or 0)
                users = int(row.metric_values[1].value or 0)
                page_views = int(row.metric_values[2].value or 0)
                duration = float(row.metric_values[3].value or 0)
                conversions = int(row.metric_values[4].value or 0)

                # Aggregate email totals
                email_performance["total_email_sessions"] += sessions
                email_performance["total_email_users"] += users

                # Track by campaign
                campaign_key = f"{source}/{medium}/{campaign}"
                if campaign_key not in email_performance["campaigns"]:
                    email_performance["campaigns"][campaign_key] = {
                        "sessions": 0,
                        "users": 0,
                        "page_views": 0,
                        "conversions": 0,
                    }

                email_performance["campaigns"][campaign_key]["sessions"] += sessions
                email_performance["campaigns"][campaign_key]["users"] += users
                email_performance["campaigns"][campaign_key]["page_views"] += page_views
                email_performance["campaigns"][campaign_key][
                    "conversions"
                ] += conversions

                # Daily tracking
                if date not in email_performance["daily_performance"]:
                    email_performance["daily_performance"][date] = {
                        "sessions": 0,
                        "users": 0,
                    }
                email_performance["daily_performance"][date]["sessions"] += sessions
                email_performance["daily_performance"][date]["users"] += users

            return email_performance

        except Exception as e:
            print(f"❌ Error fetching email campaign performance: {e}")
            return {}

    def get_realtime_visitors(self) -> Dict:
        """Get real-time visitor data"""

        try:
            request = RunRealtimeReportRequest(
                property=f"properties/{self.property_id}",
                dimensions=[
                    Dimension(name="city"),
                    Dimension(name="deviceCategory"),
                    Dimension(name="unifiedScreenName"),
                ],
                metrics=[Metric(name="activeUsers")],
            )

            response = self.client.run_realtime_report(request=request)

            realtime_data = {
                "active_users": 0,
                "by_device": {},
                "by_city": {},
                "by_page": {},
            }

            for row in response.rows:
                city = row.dimension_values[0].value
                device = row.dimension_values[1].value
                page = row.dimension_values[2].value
                active_users = int(row.metric_values[0].value or 0)

                realtime_data["active_users"] += active_users

                # Track by device
                if device in realtime_data["by_device"]:
                    realtime_data["by_device"][device] += active_users
                else:
                    realtime_data["by_device"][device] = active_users

                # Track by city
                if city in realtime_data["by_city"]:
                    realtime_data["by_city"][city] += active_users
                else:
                    realtime_data["by_city"][city] = active_users

                # Track by page
                if page in realtime_data["by_page"]:
                    realtime_data["by_page"][page] += active_users
                else:
                    realtime_data["by_page"][page] = active_users

            return realtime_data

        except Exception as e:
            print(f"❌ Error fetching realtime data: {e}")
            return {"active_users": 0}

    def get_peak_hours(self, days_back: int = 30) -> List[int]:
        """Identify peak traffic hours for optimal email sending"""

        traffic_data = self.get_traffic_overview(days_back)
        hourly_patterns = traffic_data.get("hourly_patterns", {})

        # Sort hours by session count
        sorted_hours = sorted(
            hourly_patterns.items(), key=lambda x: x[1]["sessions"], reverse=True
        )

        # Return top 3 peak hours
        peak_hours = [int(hour) for hour, _ in sorted_hours[:3]]
        return peak_hours

    def generate_analytics_summary(self, days_back: int = 7) -> Dict:
        """Generate comprehensive analytics summary"""

        print(f"📊 Generating GA4 analytics summary for last {days_back} days...")

        summary = {
            "date_generated": datetime.now().isoformat(),
            "period": f"{days_back} days",
            "traffic_overview": self.get_traffic_overview(days_back),
            "email_performance": self.get_email_campaign_performance(days_back),
            "realtime_visitors": self.get_realtime_visitors(),
            "peak_hours": self.get_peak_hours(30),
            "recommendations": [],
        }

        # Generate recommendations
        traffic = summary["traffic_overview"]
        if traffic.get("total_sessions", 0) > 0:
            avg_daily_sessions = traffic["total_sessions"] / days_back
            summary["recommendations"].append(
                f"📈 Average {avg_daily_sessions:.0f} sessions per day"
            )

        email_perf = summary["email_performance"]
        if email_perf.get("total_email_sessions", 0) > 0:
            summary["recommendations"].append(
                f"📧 Email campaigns drove {email_perf['total_email_sessions']} sessions"
            )

        peak_hours = summary["peak_hours"]
        if peak_hours:
            formatted_hours = [f"{h}:00" for h in peak_hours]
            summary["recommendations"].append(
                f"⏰ Peak traffic hours: {', '.join(formatted_hours)} (optimal for email sends)"
            )

        return summary


def main():
    """Main function for CLI usage"""

    if not GA4_AVAILABLE:
        print("❌ Google Analytics Data API not installed")
        return 1

    try:
        analytics = GA4Analytics()

        print("🚀 CLUTTERFRESPACES GA4 ANALYTICS")
        print("=" * 50)

        # Generate summary
        summary = analytics.generate_analytics_summary(days_back=7)

        # Display key metrics
        traffic = summary["traffic_overview"]
        print(f"\n📈 TRAFFIC OVERVIEW (Last 7 days)")
        print(f"   Total Sessions: {traffic.get('total_sessions', 0):,}")
        print(f"   Total Users: {traffic.get('total_users', 0):,}")
        print(f"   Page Views: {traffic.get('total_page_views', 0):,}")

        # Email performance
        email_perf = summary["email_performance"]
        print(f"\n📧 EMAIL CAMPAIGN PERFORMANCE")
        print(f"   Email Sessions: {email_perf.get('total_email_sessions', 0):,}")
        print(f"   Email Users: {email_perf.get('total_email_users', 0):,}")

        # Realtime
        realtime = summary["realtime_visitors"]
        print(f"\n⚡ REALTIME")
        print(f"   Active Users: {realtime.get('active_users', 0)}")

        # Peak hours
        peak_hours = summary["peak_hours"]
        if peak_hours:
            formatted_hours = [f"{h}:00" for h in peak_hours]
            print(f"\n⏰ PEAK HOURS: {', '.join(formatted_hours)}")

        # Recommendations
        print(f"\n💡 RECOMMENDATIONS")
        for rec in summary["recommendations"]:
            print(f"   {rec}")

        # Save detailed summary
        output_file = f"analytics_summary_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        with open(output_file, "w") as f:
            json.dump(summary, f, indent=2, default=str)
        print(f"\n💾 Detailed report saved: {output_file}")

        return 0

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
