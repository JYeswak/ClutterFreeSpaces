"""
ClutterFreeSpaces B2B Outreach Configuration
Configuration settings for the outreach system
"""

import os
from pathlib import Path

# Load environment variables
try:
    from dotenv import load_dotenv

    # Try to find .env file in project root
    env_path = Path(__file__).parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass  # dotenv not installed, environment variables should be set manually

# Base paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
OUTREACH_ROOT = PROJECT_ROOT / "outreach"
DATABASE_PATH = PROJECT_ROOT / ".claude" / "data" / "metrics.db"

# API Keys and External Services
GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLECLOUD_API_KEY")  # Using your existing env var
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")  # Backup/legacy
YELP_API_KEY = os.getenv("YELP_API_KEY")
SENDGRID_API_KEY = os.getenv("SendGrid_API_Key")  # Using your existing SendGrid key

# Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
FROM_EMAIL = os.getenv("FROM_EMAIL", "contact@clutter-free-spaces.com")
FROM_NAME = os.getenv("FROM_NAME", "Chanel Basolo - ClutterFreeSpaces")

# Rate Limiting and Scraping Behavior
DAILY_DISCOVERY_LIMIT = int(os.getenv("DAILY_DISCOVERY_LIMIT", "50"))
DAILY_OUTREACH_LIMIT = int(os.getenv("DAILY_OUTREACH_LIMIT", "20"))
SCRAPING_DELAY_SECONDS = int(os.getenv("SCRAPING_DELAY_SECONDS", "2"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))

# Geographic Targeting
TARGET_LOCATIONS = [
    {"city": "Missoula", "state": "MT", "radius": 30},
    {"city": "Kalispell", "state": "MT", "radius": 25},
    {"city": "Bozeman", "state": "MT", "radius": 25},
    {"city": "Great Falls", "state": "MT", "radius": 20},
    {"city": "Helena", "state": "MT", "radius": 20},
    {"city": "Butte", "state": "MT", "radius": 15},
]

# Business Type Priorities (matches database)
BUSINESS_PRIORITIES = {
    # Home Organization Campaign
    "cleaning_company": {"priority": 90, "commission": 0.20},
    "real_estate_agent": {"priority": 95, "commission": 0.15},
    "property_management": {"priority": 80, "commission": 0.20},
    "moving_company": {"priority": 85, "commission": 0.25},
    "storage_facility": {"priority": 75, "commission": 0.20},
    "home_staging": {"priority": 85, "commission": 0.15},
    "senior_living": {"priority": 90, "commission": 0.20},
    "interior_designer": {"priority": 70, "commission": 0.15},
    # RV Organization Campaign
    "rv_dealer": {"priority": 95, "commission": 0.20},
    "rv_park": {"priority": 80, "commission": 0.15},
    "rv_service": {"priority": 85, "commission": 0.20},
    "rv_rental": {"priority": 75, "commission": 0.25},
    "outdoor_store": {"priority": 70, "commission": 0.15},
    "travel_agency": {"priority": 60, "commission": 0.20},
    "rv_club": {"priority": 50, "commission": 0.10},
}

# Google Maps Search Keywords
GOOGLE_MAPS_KEYWORDS = {
    "cleaning_company": [
        "house cleaning service",
        "residential cleaning",
        "commercial cleaning",
        "maid service",
        "janitorial service",
        "deep cleaning service",
    ],
    "real_estate_agent": [
        "real estate agent",
        "realtor",
        "real estate broker",
        "property agent",
        "home sales",
        "real estate office",
    ],
    "property_management": [
        "property management",
        "rental management",
        "property manager",
        "apartment management",
        "rental property service",
    ],
    "moving_company": [
        "moving company",
        "movers",
        "moving service",
        "relocation service",
        "local movers",
        "long distance movers",
    ],
    "storage_facility": [
        "self storage",
        "storage units",
        "storage facility",
        "mini storage",
        "secure storage",
        "climate controlled storage",
    ],
    "home_staging": [
        "home staging",
        "home stager",
        "interior staging",
        "property staging",
        "real estate staging",
        "home design",
    ],
    "senior_living": [
        "senior living",
        "assisted living",
        "retirement community",
        "senior care",
        "elder care",
        "nursing home",
    ],
    "interior_designer": [
        "interior designer",
        "interior design",
        "home design",
        "interior decorator",
        "space planning",
    ],
    "rv_dealer": [
        "RV dealer",
        "RV sales",
        "motorhome dealer",
        "travel trailer dealer",
        "recreational vehicle dealer",
        "RV center",
    ],
    "rv_park": [
        "RV park",
        "RV campground",
        "motorhome park",
        "RV resort",
        "recreational vehicle park",
        "camping resort",
    ],
    "rv_service": [
        "RV service",
        "RV repair",
        "motorhome service",
        "RV maintenance",
        "recreational vehicle repair",
        "RV parts",
    ],
    "rv_rental": [
        "RV rental",
        "motorhome rental",
        "travel trailer rental",
        "recreational vehicle rental",
        "RV hire",
    ],
    "outdoor_store": [
        "outdoor gear",
        "camping store",
        "outdoor equipment",
        "sporting goods",
        "adventure gear",
        "outdoor outfitter",
    ],
    "travel_agency": [
        "travel agency",
        "travel agent",
        "vacation planning",
        "tour operator",
        "travel consultant",
        "RV travel",
    ],
    "rv_club": [
        "RV club",
        "motorhome club",
        "RV association",
        "recreational vehicle club",
        "RV group",
    ],
}

# Yelp Categories (Yelp API category aliases)
YELP_CATEGORIES = {
    "cleaning_company": ["home_cleaning", "commercial_cleaning"],
    "real_estate_agent": ["real_estate_agents", "real_estate_services"],
    "property_management": ["propertymgmt"],
    "moving_company": ["movers"],
    "storage_facility": ["self_storage"],
    "home_staging": ["homestaging", "interiordesign"],
    "senior_living": ["seniorcare", "assistedliving"],
    "interior_designer": ["interiordesign"],
    "rv_dealer": ["rvdealers"],
    "rv_park": ["rvparks", "campgrounds"],
    "rv_service": ["auto_repair", "rvrepair"],  # RV repair often under auto repair
    "rv_rental": ["car_rental"],  # Often categorized with car rentals
    "outdoor_store": ["outdoor_gear", "sporting_goods"],
    "travel_agency": ["travel_services"],
    "rv_club": [],  # Usually not in Yelp business categories
}

# Website Contact Extraction Patterns
EMAIL_PATTERNS = [
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b",
    r"mailto:([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})",
]

PHONE_PATTERNS = [
    r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",  # (406) 123-4567 or 406-123-4567
    r"\d{3}[-.\s]?\d{3}[-.\s]?\d{4}",  # 406.123.4567
    r"\+1[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",  # +1 (406) 123-4567
]

# Common contact page paths to check
CONTACT_PATHS = [
    "/contact",
    "/contact-us",
    "/contact.html",
    "/about",
    "/about-us",
    "/team",
    "/staff",
    "/leadership",
    "/management",
    "/owners",
]

# User agents for web scraping
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
]

# Campaign Templates Base Configuration
CAMPAIGN_DEFAULTS = {
    "daily_send_limit": 20,
    "follow_up_sequence": [
        {"delay_days": 5, "template": "follow_up_1"},
        {"delay_days": 10, "template": "follow_up_2"},
        {"delay_days": 20, "template": "follow_up_3"},
    ],
    "max_follow_ups": 3,
    "response_tracking_enabled": True,
}

# Logging Configuration
import logging


def setup_logging():
    """Configure logging for the outreach system"""
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Create logs directory if it doesn't exist
    logs_dir = OUTREACH_ROOT / "logs"
    logs_dir.mkdir(exist_ok=True)

    # Configure file handler
    file_handler = logging.FileHandler(logs_dir / "outreach.log")
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(logging.Formatter(log_format))

    # Configure console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.WARNING)
    console_handler.setFormatter(logging.Formatter(log_format))

    # Configure root logger
    logging.basicConfig(level=logging.INFO, handlers=[file_handler, console_handler])

    return logging.getLogger("outreach")


# Initialize logging when imported
logger = setup_logging()
