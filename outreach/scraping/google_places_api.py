#!/usr/bin/env python3
"""
ClutterFreeSpaces Google Places API Business Scraper
Uses Google Places API for accurate business discovery

Setup:
1. Enable Places API in Google Cloud Console
2. Create API key with Places API access
3. Set GOOGLE_CLOUD_API_KEY environment variable

Usage:
    python3 google_places_api.py --type=rv_dealer --city=Missoula --radius=30
    python3 google_places_api.py --type=cleaning_company --limit=50
"""

import argparse
import time
import json
import os
import sys
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import requests

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

from outreach.config.settings import (
    TARGET_LOCATIONS,
    GOOGLE_MAPS_KEYWORDS,
    BUSINESS_PRIORITIES,
    DAILY_DISCOVERY_LIMIT,
    logger,
)
from outreach.lib.database import db


class GooglePlacesAPIScraper:
    """Business discovery using Google Places API"""

    def __init__(self):
        self.logger = logger
        self.api_key = os.getenv("GOOGLECLOUD_API_KEY")
        self.businesses_found = 0
        self.daily_limit = DAILY_DISCOVERY_LIMIT

        if not self.api_key:
            raise ValueError(
                "GOOGLECLOUD_API_KEY environment variable not set. "
                "Please set your Google Cloud API key."
            )

    def search_places(
        self, query: str, location: Dict[str, any], max_results: int = 20
    ) -> List[Dict]:
        """
        Search for places using Google Places API Text Search

        Args:
            query: Search query (e.g., "RV dealer")
            location: Dict with city, state, radius
            max_results: Maximum number of results to return

        Returns:
            List of business dictionaries
        """
        businesses = []

        try:
            # Construct search query with location
            search_query = f"{query} in {location['city']}, {location['state']}"

            # Google Places Text Search API endpoint
            url = "https://maps.googleapis.com/maps/api/place/textsearch/json"

            params = {
                "query": search_query,
                "key": self.api_key,
                "radius": location.get("radius", 25) * 1000,  # Convert km to meters
                "region": "us",  # Bias results to US
                "language": "en",
            }

            self.logger.info(f"Searching Google Places: {search_query}")

            response = requests.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            if data.get("status") == "OK":
                places = data.get("results", [])

                for place in places[:max_results]:
                    business_data = self._parse_place_data(place, query)
                    if business_data:
                        businesses.append(business_data)

                self.logger.info(f"Found {len(businesses)} businesses for '{query}'")

            elif data.get("status") == "ZERO_RESULTS":
                self.logger.info(f"No results found for '{search_query}'")

            else:
                error_msg = data.get("error_message", data.get("status"))
                self.logger.warning(f"Places API error: {error_msg}")

            # Respect API rate limits
            time.sleep(0.1)

        except Exception as e:
            self.logger.error(f"Error searching Google Places: {e}")

        return businesses

    def _parse_place_data(self, place: Dict, business_type: str) -> Optional[Dict]:
        """
        Parse Google Places API response into our business format

        Args:
            place: Place data from Google Places API
            business_type: The business type being searched for

        Returns:
            Standardized business dictionary or None if invalid
        """
        try:
            # Extract location information
            location = place.get("geometry", {}).get("location", {})
            address_components = place.get("formatted_address", "").split(", ")

            # Parse city and state from address
            city = "Unknown"
            state = "MT"

            if len(address_components) >= 2:
                # Usually format: "123 Main St, City, MT 59801, USA"
                for component in address_components:
                    if "MT" in component:
                        parts = component.strip().split()
                        if len(parts) >= 2:
                            city = " ".join(parts[:-2]) if len(parts) > 2 else parts[0]
                            state = "MT"
                        break

            # Get additional details if available
            rating = place.get("rating")
            price_level = place.get("price_level")
            user_ratings_total = place.get("user_ratings_total")

            business_data = {
                "name": place.get("name", "Unknown Business"),
                "address": place.get("formatted_address", ""),
                "city": city,
                "state": state,
                "phone": None,  # Not available in text search, need details API
                "website": None,  # Not available in text search, need details API
                "google_place_id": place.get("place_id"),
                "latitude": location.get("lat"),
                "longitude": location.get("lng"),
                "rating": rating,
                "price_level": price_level,
                "user_ratings_total": user_ratings_total,
                "business_type": business_type,
                "types": place.get("types", []),
                "discovered_via": "google_places_api",
                "discovered_at": datetime.now().isoformat(),
            }

            return business_data

        except Exception as e:
            self.logger.error(f"Error parsing place data: {e}")
            return None

    def get_place_details(self, place_id: str) -> Dict:
        """
        Get additional details for a place using Place Details API
        This gets phone numbers, websites, and other contact info

        Args:
            place_id: Google Place ID

        Returns:
            Dictionary with additional place details
        """
        details = {}

        try:
            url = "https://maps.googleapis.com/maps/api/place/details/json"

            params = {
                "place_id": place_id,
                "fields": "formatted_phone_number,website,opening_hours,business_status",
                "key": self.api_key,
            }

            response = requests.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            if data.get("status") == "OK":
                result = data.get("result", {})

                details = {
                    "phone": result.get("formatted_phone_number"),
                    "website": result.get("website"),
                    "business_status": result.get("business_status"),
                    "opening_hours": result.get("opening_hours", {}).get(
                        "weekday_text", []
                    ),
                }

            # Respect API rate limits
            time.sleep(0.1)

        except Exception as e:
            self.logger.error(f"Error getting place details: {e}")

        return details

    def discover_businesses_by_type(
        self,
        business_type: str,
        locations: List[Dict] = None,
        max_per_location: int = 20,
        get_details: bool = True,
        dry_run: bool = False,
    ) -> List[Dict]:
        """
        Discover businesses of a specific type across Montana locations

        Args:
            business_type: Type of business to search for
            locations: List of location dicts, defaults to TARGET_LOCATIONS
            max_per_location: Maximum businesses per location
            get_details: Whether to fetch detailed contact info
            dry_run: If True, don't save to database

        Returns:
            List of discovered businesses
        """
        if locations is None:
            locations = TARGET_LOCATIONS

        # Get business type ID for database storage
        business_type_id = db.get_business_type_id(business_type)
        if not business_type_id:
            self.logger.error(f"Business type {business_type} not found in database")
            return []

        all_businesses = []
        keywords = GOOGLE_MAPS_KEYWORDS.get(business_type, [business_type])

        self.logger.info(f"Starting discovery for {business_type}")
        self.logger.info(f"Search keywords: {keywords}")
        self.logger.info(f"Target locations: {[loc['city'] for loc in locations]}")

        for location in locations:
            self.logger.info(f"Searching in {location['city']}, {location['state']}")

            location_businesses = []

            # Try each keyword for this business type
            for keyword in keywords:
                if len(location_businesses) >= max_per_location:
                    break

                businesses = self.search_places(
                    keyword, location, max_per_location - len(location_businesses)
                )

                # Get detailed contact information if requested
                if get_details and businesses:
                    self.logger.info(
                        f"Fetching details for {len(businesses)} businesses..."
                    )

                    for business in businesses:
                        if business.get("google_place_id"):
                            details = self.get_place_details(
                                business["google_place_id"]
                            )
                            business.update(details)

                location_businesses.extend(businesses)

                # Remove duplicates based on name and city
                seen = set()
                unique_businesses = []
                for biz in location_businesses:
                    key = (biz["name"].lower(), biz["city"].lower())
                    if key not in seen:
                        seen.add(key)
                        unique_businesses.append(biz)

                location_businesses = unique_businesses[:max_per_location]

            self.logger.info(
                f"Found {len(location_businesses)} unique businesses in {location['city']}"
            )
            all_businesses.extend(location_businesses)

        # Save to database unless dry run
        if not dry_run and all_businesses:
            self.logger.info(f"Saving {len(all_businesses)} businesses to database")
            saved_count = 0

            for business in all_businesses:
                try:
                    # Ensure business_type_id is set
                    business["business_type_id"] = business_type_id
                    business_id = db.insert_business(business)
                    if business_id:
                        saved_count += 1
                except Exception as e:
                    self.logger.error(f"Error saving business {business['name']}: {e}")

            self.logger.info(f"Successfully saved {saved_count} businesses")

        return all_businesses


def main():
    parser = argparse.ArgumentParser(description="Google Places API Business Discovery")

    parser.add_argument("--type", required=True, help="Business type to search for")
    parser.add_argument("--city", help="Specific city to search (optional)")
    parser.add_argument("--state", default="MT", help="State to search (default: MT)")
    parser.add_argument(
        "--radius",
        type=int,
        default=25,
        help="Search radius in kilometers (default: 25)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=50,
        help="Maximum businesses to discover (default: 50)",
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Show results without saving to database"
    )
    parser.add_argument(
        "--no-details",
        action="store_true",
        help="Skip fetching detailed contact information",
    )
    parser.add_argument(
        "--save-json", action="store_true", help="Save results to JSON backup file"
    )

    args = parser.parse_args()

    try:
        scraper = GooglePlacesAPIScraper()

        # Determine locations to search
        if args.city:
            locations = [
                {"city": args.city, "state": args.state, "radius": args.radius}
            ]
        else:
            locations = TARGET_LOCATIONS

        # Calculate max per location to stay under limit
        max_per_location = max(1, args.limit // len(locations))

        print(f"\n🔍 Discovering {args.type} businesses...")
        if args.dry_run:
            print("🔄 DRY RUN MODE - No data will be saved")

        businesses = scraper.discover_businesses_by_type(
            business_type=args.type,
            locations=locations,
            max_per_location=max_per_location,
            get_details=not args.no_details,
            dry_run=args.dry_run,
        )

        print(f"\n📊 Discovery Summary:")
        print(f"   Total businesses found: {len(businesses)}")
        if not args.dry_run:
            print(f"   Businesses saved to database: {len(businesses)}")

        # Show sample results
        if businesses:
            print(f"\n📋 Sample Results:")
            for i, business in enumerate(businesses[:5]):
                print(f"   {i+1}. {business['name']}")
                print(f"      📍 {business['city']}, {business['state']}")
                if business.get("phone"):
                    print(f"      📞 {business['phone']}")
                if business.get("website"):
                    print(f"      🌐 {business['website']}")
                if business.get("rating"):
                    print(
                        f"      ⭐ {business['rating']}/5 ({business.get('user_ratings_total', 0)} reviews)"
                    )
                print()

        # Save JSON backup if requested
        if args.save_json and businesses:
            filename = f"businesses_{args.type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            filepath = Path(__file__).parent.parent / "data" / filename
            filepath.parent.mkdir(exist_ok=True)

            with open(filepath, "w") as f:
                json.dump(businesses, f, indent=2, default=str)
            print(f"💾 Results saved to: {filepath}")

    except KeyboardInterrupt:
        print("\n⚠️ Discovery interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error during discovery: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
