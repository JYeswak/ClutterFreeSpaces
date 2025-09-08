#!/usr/bin/env python3
"""
ClutterFreeSpaces Google Maps Business Scraper
Discovers businesses in target Montana cities using Google Places API (preferred) or web scraping fallback

Setup:
1. For Google Places API (recommended):
   - Enable Places API in Google Cloud Console
   - Create API key with Places API access
   - Set GOOGLE_CLOUD_API_KEY environment variable

2. For web scraping fallback:
   - No setup required, but less reliable and slower

Usage:
    python3 google_maps_scraper.py --type=rv_dealer --city=Missoula --radius=30
    python3 google_maps_scraper.py --type=cleaning_company --limit=50
    python3 google_maps_scraper.py --all-types --city=Kalispell
"""

import argparse
import time
import json
import re
import sys
import os
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path
import requests
from bs4 import BeautifulSoup
import random

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent.parent.parent))

from outreach.config.settings import (
    TARGET_LOCATIONS,
    GOOGLE_MAPS_KEYWORDS,
    BUSINESS_PRIORITIES,
    SCRAPING_DELAY_SECONDS,
    MAX_RETRIES,
    USER_AGENTS,
    DAILY_DISCOVERY_LIMIT,
    logger,
)
from outreach.lib.database import db

# Try to import the Google Places API scraper
try:
    from outreach.scraping.google_places_api import GooglePlacesAPIScraper

    PLACES_API_AVAILABLE = True
except ImportError:
    PLACES_API_AVAILABLE = False


class GoogleMapsBusinessScraper:
    """Scraper for discovering businesses via Google Maps search"""

    def __init__(self):
        self.logger = logger
        self.session = requests.Session()
        self.businesses_found = 0
        self.daily_limit = DAILY_DISCOVERY_LIMIT

        # Set a random user agent
        self.session.headers.update(
            {
                "User-Agent": random.choice(USER_AGENTS),
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
            }
        )

    def search_google_maps(
        self, query: str, location: str, max_results: int = 20
    ) -> List[Dict]:
        """
        Search Google Maps for businesses (web scraping approach)
        This is the fallback method when Google Places API is not available
        """
        businesses = []

        try:
            # Construct Google Maps search URL
            search_url = f"https://www.google.com/maps/search/{query}+in+{location}"

            self.logger.info(f"Searching: {search_url}")

            # Make the request
            response = self.session.get(search_url)
            response.raise_for_status()

            # Parse the response - this is challenging as Google uses dynamic content
            # We'll look for business cards in the HTML
            soup = BeautifulSoup(response.content, "html.parser")

            # Try to extract business information from the page
            # Note: Google Maps uses dynamic loading, so this might be limited
            business_elements = self._extract_business_info_from_html(soup)

            for element in business_elements[:max_results]:
                business_data = self._parse_business_element(element, query, location)
                if business_data:
                    businesses.append(business_data)

            # Add delay to be respectful
            time.sleep(SCRAPING_DELAY_SECONDS)

        except Exception as e:
            self.logger.error(f"Error searching Google Maps: {e}")

        return businesses

    def _extract_business_info_from_html(self, soup: BeautifulSoup) -> List:
        """
        Extract business information from Google Maps HTML
        This is a best-effort approach as Google's HTML structure changes frequently
        """
        business_elements = []

        # Look for common patterns in Google Maps results
        # These selectors may need updating as Google changes their HTML

        # Try different selectors that Google Maps might use
        selectors = [
            "[data-result-index]",  # Common result container
            '[jsaction*="pane"]',  # Pane elements
            "[data-cid]",  # Business ID containers
            ".section-result",  # Result sections
            '[role="article"]',  # Article role elements
        ]

        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                business_elements.extend(elements)
                break

        return business_elements

    def _parse_business_element(
        self, element, query: str, location: str
    ) -> Optional[Dict]:
        """
        Parse a business element from Google Maps HTML
        Extract name, address, rating, and other available info
        """
        try:
            business = {
                "discovered_via": "google_maps",
                "search_query": query,
                "search_location": location,
                "scraped_at": datetime.now().isoformat(),
            }

            # Try to extract business name
            name_selectors = [
                '[data-value="Name"]',
                ".section-result-title",
                "h3",
                ".fontHeadlineSmall",
                '[aria-label*="Name"]',
            ]

            business["name"] = self._extract_text_by_selectors(element, name_selectors)

            # Try to extract address
            address_selectors = [
                '[data-value="Address"]',
                ".section-result-address",
                '[aria-label*="Address"]',
                'span[title*="Street"]',
            ]

            address_text = self._extract_text_by_selectors(element, address_selectors)
            if address_text:
                business["address"] = address_text
                # Parse city and state from address if possible
                city_state = self._parse_city_state_from_address(address_text)
                if city_state:
                    business.update(city_state)

            # Try to extract rating
            rating_selectors = [
                '[data-value="Rating"]',
                ".section-result-rating",
                '[aria-label*="star"]',
                'span[role="img"]',
            ]

            rating_text = self._extract_text_by_selectors(element, rating_selectors)
            if rating_text:
                rating = self._parse_rating(rating_text)
                if rating:
                    business["google_rating"] = rating

            # Try to extract phone number
            phone_selectors = [
                '[data-value="Phone"]',
                'span[data-dtype="d3ph"]',
                '[aria-label*="phone"]',
            ]

            business["phone"] = self._extract_text_by_selectors(
                element, phone_selectors
            )

            # Try to extract website
            website_selectors = [
                'a[data-value="Website"]',
                'a[data-dtype="d3website"]',
                'a[href*="http"]',
            ]

            website_element = element.find("a", href=True)
            if website_element:
                href = website_element.get("href", "")
                if href.startswith("http") and "google.com" not in href:
                    business["website"] = href

            # Only return if we have at least a name
            if business.get("name"):
                return business

        except Exception as e:
            self.logger.error(f"Error parsing business element: {e}")

        return None

    def _extract_text_by_selectors(
        self, element, selectors: List[str]
    ) -> Optional[str]:
        """Try multiple CSS selectors to extract text"""
        for selector in selectors:
            found = element.select_one(selector)
            if found:
                text = found.get_text(strip=True)
                if text:
                    return text
        return None

    def _parse_city_state_from_address(self, address: str) -> Optional[Dict]:
        """Parse city and state from address string"""
        # Look for Montana patterns: "City, MT" or "City, Montana"
        patterns = [
            r"([A-Za-z\s]+),\s*(MT|Montana)\s*\d*",
            r"([A-Za-z\s]+)\s+(MT|Montana)\s*\d*",
        ]

        for pattern in patterns:
            match = re.search(pattern, address)
            if match:
                city = match.group(1).strip()
                state = (
                    "MT"
                    if match.group(2).upper() in ["MT", "MONTANA"]
                    else match.group(2)
                )
                return {"city": city, "state": state}

        return None

    def _parse_rating(self, rating_text: str) -> Optional[float]:
        """Extract numeric rating from text"""
        # Look for patterns like "4.5 stars" or "4.5 out of 5"
        rating_pattern = r"(\d+\.?\d*)\s*(?:stars?|out of|\/)"
        match = re.search(rating_pattern, rating_text)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass
        return None

    def discover_businesses_by_type(
        self, business_type: str, location_filter: Dict = None, limit: int = 50
    ) -> List[Dict]:
        """
        Discover businesses of a specific type in target locations
        """
        if business_type not in GOOGLE_MAPS_KEYWORDS:
            self.logger.error(f"Unknown business type: {business_type}")
            return []

        # Get business type ID for database storage
        business_type_id = db.get_business_type_id(business_type)
        if not business_type_id:
            self.logger.error(f"Business type {business_type} not found in database")
            return []

        discovered_businesses = []
        keywords = GOOGLE_MAPS_KEYWORDS[business_type]

        # Determine which locations to search
        locations_to_search = self._get_locations_to_search(location_filter)

        for location in locations_to_search:
            if len(discovered_businesses) >= limit:
                break

            location_str = f"{location['city']}, {location['state']}"
            self.logger.info(f"Searching {business_type} in {location_str}")

            for keyword in keywords:
                if len(discovered_businesses) >= limit:
                    break

                # Search Google Maps
                search_results = self.search_google_maps(
                    keyword,
                    location_str,
                    max_results=min(20, limit - len(discovered_businesses)),
                )

                for result in search_results:
                    if len(discovered_businesses) >= limit:
                        break

                    # Enrich with business type information
                    result["business_type_id"] = business_type_id
                    result["business_type"] = business_type
                    result["city"] = location["city"]
                    result["state"] = location["state"]

                    # Calculate partnership potential based on business priorities
                    priority_info = BUSINESS_PRIORITIES.get(business_type, {})
                    result["partnership_potential"] = priority_info.get("priority", 50)

                    # Check if business already exists in database
                    if result.get("name"):
                        existing_id = db.check_business_exists(
                            result["name"], result["city"]
                        )
                        if existing_id:
                            self.logger.info(
                                f"Business already exists: {result['name']} (ID: {existing_id})"
                            )
                            continue

                    discovered_businesses.append(result)
                    self.logger.info(
                        f"Found: {result.get('name', 'Unknown')} in {result.get('city', 'Unknown')}"
                    )

                # Be respectful with delays between searches
                time.sleep(
                    SCRAPING_DELAY_SECONDS * 2
                )  # Longer delay between keyword searches

        return discovered_businesses

    def _get_locations_to_search(self, location_filter: Dict = None) -> List[Dict]:
        """Get list of locations to search based on filter"""
        if location_filter:
            if location_filter.get("city"):
                # Search for specific city
                for location in TARGET_LOCATIONS:
                    if location["city"].lower() == location_filter["city"].lower():
                        return [location]
                # If city not in predefined list, create location dict
                return [
                    {
                        "city": location_filter["city"],
                        "state": location_filter.get("state", "MT"),
                        "radius": location_filter.get("radius", 25),
                    }
                ]
            return TARGET_LOCATIONS
        return TARGET_LOCATIONS

    def save_businesses_to_database(self, businesses: List[Dict]) -> int:
        """Save discovered businesses to the database"""
        saved_count = 0

        for business in businesses:
            try:
                # Insert the business
                business_id = db.insert_business(business)
                if business_id:
                    saved_count += 1
                    self.logger.info(
                        f"Saved business: {business.get('name')} (ID: {business_id})"
                    )

            except Exception as e:
                self.logger.error(
                    f"Error saving business {business.get('name', 'Unknown')}: {e}"
                )

        return saved_count

    def save_to_json(self, businesses: List[Dict], filename: str) -> None:
        """Save businesses to JSON file for backup"""
        output_file = Path(__file__).parent.parent / "data" / "raw" / filename
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, "w") as f:
            json.dump(businesses, f, indent=2, default=str)

        self.logger.info(f"Saved {len(businesses)} businesses to {output_file}")


def main():
    """Main function for command-line usage"""
    parser = argparse.ArgumentParser(
        description="Discover businesses using Google Places API or web scraping"
    )
    parser.add_argument(
        "--type",
        help="Business type to search for",
        choices=list(GOOGLE_MAPS_KEYWORDS.keys()),
    )
    parser.add_argument(
        "--all-types", action="store_true", help="Search for all business types"
    )
    parser.add_argument("--city", help="Specific city to search in")
    parser.add_argument(
        "--state", default="MT", help="State to search in (default: MT)"
    )
    parser.add_argument("--radius", type=int, default=25, help="Search radius in miles")
    parser.add_argument(
        "--limit", type=int, default=50, help="Maximum businesses to discover per type"
    )
    parser.add_argument(
        "--save-json", action="store_true", help="Save results to JSON file"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Don't save to database, just show results",
    )
    parser.add_argument(
        "--force-web-scraping",
        action="store_true",
        help="Force web scraping even if Places API is available",
    )

    args = parser.parse_args()

    if not args.type and not args.all_types:
        parser.error("Must specify --type or --all-types")

    # Check if Google Places API is available and preferred
    use_places_api = (
        PLACES_API_AVAILABLE
        and os.getenv("GOOGLECLOUD_API_KEY")
        and not args.force_web_scraping
    )

    if use_places_api:
        print("🎯 Using Google Places API for accurate business discovery")
        scraper = GooglePlacesAPIScraper()
    else:
        if not args.force_web_scraping:
            print("⚠️  Google Places API not available, falling back to web scraping")
            print("   Set GOOGLE_CLOUD_API_KEY environment variable for better results")
        else:
            print("🔄 Using web scraping as requested")
        scraper = GoogleMapsBusinessScraper()

    # Set up location filter
    location_filter = None
    if args.city:
        location_filter = {
            "city": args.city,
            "state": args.state,
            "radius": args.radius,
        }

    # Determine business types to search
    business_types = [args.type] if args.type else list(GOOGLE_MAPS_KEYWORDS.keys())

    all_businesses = []

    for business_type in business_types:
        print(f"\n🔍 Discovering {business_type} businesses...")

        try:
            if use_places_api:
                # Google Places API scraper expects different parameters
                locations = []
                if location_filter:
                    locations = [location_filter]
                else:
                    locations = TARGET_LOCATIONS

                businesses = scraper.discover_businesses_by_type(
                    business_type=business_type,
                    locations=locations,
                    max_per_location=args.limit,
                    get_details=True,
                    dry_run=args.dry_run,
                )
            else:
                # Google Maps web scraper
                businesses = scraper.discover_businesses_by_type(
                    business_type, location_filter, args.limit
                )

            if businesses:
                print(f"✅ Found {len(businesses)} {business_type} businesses")

                if args.save_json:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"{business_type}_{timestamp}.json"
                    if hasattr(scraper, "save_to_json"):
                        scraper.save_to_json(businesses, filename)

                if not args.dry_run:
                    # Google Places API scraper handles saving internally
                    # Web scraper needs manual saving
                    if hasattr(scraper, "save_businesses_to_database"):
                        saved_count = scraper.save_businesses_to_database(businesses)
                        print(f"💾 Saved {saved_count} businesses to database")
                    else:
                        print(f"💾 Businesses saved automatically via API")

                all_businesses.extend(businesses)
            else:
                print(f"❌ No {business_type} businesses found")

        except Exception as e:
            print(f"❌ Error searching for {business_type}: {e}")
            logger.error(f"Error in business type {business_type}: {e}")

    # Summary
    print(f"\n📊 Discovery Summary:")
    print(f"   Total businesses found: {len(all_businesses)}")
    if not args.dry_run:
        print(f"   Businesses saved to database: {len(all_businesses)}")

    # Show sample results
    if all_businesses and args.dry_run:
        print(f"\n📋 Sample Results:")
        for i, business in enumerate(all_businesses[:5]):
            print(
                f"   {i+1}. {business.get('name', 'Unknown')} - {business.get('city', 'Unknown')}"
            )
            if business.get("address"):
                print(f"      Address: {business['address']}")
            if business.get("phone"):
                print(f"      Phone: {business['phone']}")
            if business.get("website"):
                print(f"      Website: {business['website']}")
            print()


if __name__ == "__main__":
    main()
