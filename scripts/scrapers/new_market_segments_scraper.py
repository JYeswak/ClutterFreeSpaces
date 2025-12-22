#!/usr/bin/env python3
"""
New Market Segments Scraper - ClutterFreeSpaces
Expands beyond current segments to find new business categories
"""

import os
import sqlite3
import googlemaps
import time
from datetime import datetime
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class NewMarketSegmentsScraper:
    """Google Places scraper for new business categories"""

    def __init__(self):
        self.api_key = os.getenv("GOOGLECLOUD_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLECLOUD_API_KEY not found in environment variables")

        self.gmaps = googlemaps.Client(key=self.api_key)
        self.conn = sqlite3.connect("outreach/data/b2b_outreach.db")
        self.cursor = self.conn.cursor()

        # New high-value market segments for ClutterFreeSpaces
        self.new_segments = {
            "home_builder": {
                "types": ["general_contractor", "home_builder"],
                "keywords": [
                    "custom home builder",
                    "home construction",
                    "residential builder",
                ],
                "priority_score": 85,
            },
            "insurance_agent": {
                "types": ["insurance_agency"],
                "keywords": ["insurance agent", "home insurance", "property insurance"],
                "priority_score": 80,
            },
            "bank_mortgage": {
                "types": ["bank", "credit_union", "mortgage_broker"],
                "keywords": ["mortgage broker", "home loans", "real estate financing"],
                "priority_score": 75,
            },
            "estate_attorney": {
                "types": ["lawyer"],
                "keywords": ["estate attorney", "probate lawyer", "estate planning"],
                "priority_score": 90,
            },
            "home_health_agency": {
                "types": ["health"],
                "keywords": ["home health", "home care", "in-home care"],
                "priority_score": 85,
            },
            "airbnb_host": {
                "types": ["lodging"],
                "keywords": ["vacation rental", "airbnb", "short-term rental"],
                "priority_score": 70,
            },
            "divorce_attorney": {
                "types": ["lawyer"],
                "keywords": ["divorce attorney", "family lawyer", "divorce mediation"],
                "priority_score": 85,
            },
            "property_inspector": {
                "types": ["real_estate_agency"],
                "keywords": [
                    "home inspector",
                    "property inspection",
                    "real estate inspector",
                ],
                "priority_score": 75,
            },
            "elderly_care": {
                "types": ["health"],
                "keywords": ["elderly care", "geriatric care", "aging in place"],
                "priority_score": 90,
            },
            "home_stager": {
                "types": ["real_estate_agency"],
                "keywords": ["home staging", "property staging", "real estate staging"],
                "priority_score": 95,
            },
        }

        # Montana cities to search
        self.montana_cities = [
            "Missoula, MT",
            "Bozeman, MT",
            "Billings, MT",
            "Great Falls, MT",
            "Helena, MT",
            "Kalispell, MT",
            "Butte, MT",
            "Anaconda, MT",
            "Havre, MT",
            "Miles City, MT",
        ]

    def ensure_business_type_exists(self, type_name: str, priority_score: int):
        """Ensure business type exists in database"""
        self.cursor.execute(
            "SELECT id FROM business_types WHERE type_name = ?", (type_name,)
        )

        existing = self.cursor.fetchone()
        if existing:
            return existing[0]

        # Create new business type
        self.cursor.execute(
            """
            INSERT INTO business_types (type_name, priority_score, created_at)
            VALUES (?, ?, datetime('now'))
            """,
            (type_name, priority_score),
        )

        self.conn.commit()
        return self.cursor.lastrowid

    def search_businesses_by_type(self, segment_name: str, location: str) -> List[Dict]:
        """Search for businesses using Google Places API"""

        segment_config = self.new_segments[segment_name]
        businesses = []

        print(f"\n🔍 Searching {segment_name} in {location}")

        # Search by types
        for place_type in segment_config["types"]:
            try:
                # Get coordinates for the location first
                geocode_result = self.gmaps.geocode(location)
                if not geocode_result:
                    continue

                location_coords = geocode_result[0]["geometry"]["location"]

                places_result = self.gmaps.places_nearby(
                    location=location_coords,
                    radius=50000,
                    type=place_type,  # 50km radius
                )

                for place in places_result.get("results", []):
                    business_data = self.extract_business_data(place, segment_name)
                    if business_data:
                        businesses.append(business_data)

                time.sleep(0.1)  # Rate limiting

            except Exception as e:
                print(f"❌ Error searching {place_type} in {location}: {e}")

        # Search by keywords
        for keyword in segment_config["keywords"]:
            try:
                places_result = self.gmaps.places(
                    query=f"{keyword} {location}", type="establishment"
                )

                for place in places_result.get("results", []):
                    business_data = self.extract_business_data(place, segment_name)
                    if business_data:
                        businesses.append(business_data)

                time.sleep(0.1)  # Rate limiting

            except Exception as e:
                print(f"❌ Error searching '{keyword}' in {location}: {e}")

        return businesses

    def extract_business_data(self, place: Dict, segment_name: str) -> Optional[Dict]:
        """Extract business data from Google Places result"""

        try:
            # Get place details for more info
            place_details = self.gmaps.place(
                place_id=place["place_id"],
                fields=[
                    "name",
                    "formatted_address",
                    "formatted_phone_number",
                    "website",
                    "rating",
                    "user_ratings_total",
                    "geometry",
                    "business_status",
                ],
            )

            details = place_details.get("result", {})

            # Skip if business is permanently closed
            if details.get("business_status") == "CLOSED_PERMANENTLY":
                return None

            # Extract location
            location = details.get("geometry", {}).get("location", {})

            return {
                "name": details.get("name", ""),
                "address": details.get("formatted_address", ""),
                "phone": details.get("formatted_phone_number", ""),
                "website": details.get("website", ""),
                "google_place_id": place["place_id"],
                "latitude": location.get("lat"),
                "longitude": location.get("lng"),
                "rating": details.get("rating"),
                "review_count": details.get("user_ratings_total", 0),
                "segment_name": segment_name,
                "discovered_via": "google_places_new_segments",
            }

        except Exception as e:
            print(f"❌ Error extracting business data: {e}")
            return None

    def save_business(self, business_data: Dict, business_type_id: int) -> bool:
        """Save business to database"""

        # Check if business already exists
        self.cursor.execute(
            "SELECT id FROM businesses WHERE google_place_id = ?",
            (business_data["google_place_id"],),
        )

        if self.cursor.fetchone():
            return False  # Already exists

        try:
            self.cursor.execute(
                """
                INSERT INTO businesses (
                    name, business_type_id, address, phone, website,
                    google_place_id, latitude, longitude, rating,
                    review_count, discovered_via, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                (
                    business_data["name"],
                    business_type_id,
                    business_data["address"],
                    business_data["phone"],
                    business_data["website"],
                    business_data["google_place_id"],
                    business_data["latitude"],
                    business_data["longitude"],
                    business_data["rating"],
                    business_data["review_count"],
                    business_data["discovered_via"],
                ),
            )

            self.conn.commit()
            return True

        except Exception as e:
            print(f"❌ Error saving business: {e}")
            return False

    def scrape_new_segments(self):
        """Scrape all new market segments"""

        print("🚀 NEW MARKET SEGMENTS SCRAPER")
        print("=" * 60)

        total_businesses = 0

        for segment_name, segment_config in self.new_segments.items():
            print(f"\n🎯 SCRAPING {segment_name.upper()}")
            print("-" * 50)

            # Ensure business type exists
            business_type_id = self.ensure_business_type_exists(
                segment_name, segment_config["priority_score"]
            )

            segment_total = 0

            # Search all Montana cities
            for city in self.montana_cities:
                businesses = self.search_businesses_by_type(segment_name, city)

                for business_data in businesses:
                    if self.save_business(business_data, business_type_id):
                        segment_total += 1
                        print(f"✅ {business_data['name']} - {city}")

                time.sleep(0.5)  # Rate limiting between cities

            print(f"📊 {segment_name}: {segment_total} new businesses added")
            total_businesses += segment_total

        print(f"\n🎉 SCRAPING COMPLETE!")
        print(f"📊 Total new businesses added: {total_businesses}")

        return total_businesses

    def close(self):
        """Close database connection"""
        self.conn.close()


def main():
    """Main function"""

    try:
        scraper = NewMarketSegmentsScraper()
        total_added = scraper.scrape_new_segments()

        print(f"\n✅ New market segments scraping complete!")
        print(f"📊 {total_added} businesses added to database")

    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    finally:
        scraper.close()

    return 0


if __name__ == "__main__":
    exit(main())
