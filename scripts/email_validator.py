#!/usr/bin/env python3
"""
ClutterFreeSpaces Email Validation System
=========================================

Robust, resumable email validation system using Hunter.io API.
Handles rate limits, timeouts, computer restarts, and provides comprehensive progress tracking.

Features:
- Resume from any point (crash-resistant)
- Rate limiting (50 requests/minute max)
- Comprehensive error handling
- Progress tracking with ETA
- Detailed logging
- Validation quality reporting

Author: ClutterFreeSpaces QA System
Date: September 2025
"""

import sqlite3
import requests
import time
import json
import sys
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import signal
from pathlib import Path

# Configuration
HUNTER_API_KEY = "6a44218c2307a63696b5fa7309dd38f4f66e0e16"
HUNTER_API_URL = "https://api.hunter.io/v2/email-verifier"
DB_PATH = "outreach/data/b2b_outreach.db"
LOG_PATH = "scripts/logs/email_validation.log"
RATE_LIMIT_REQUESTS = 50  # per minute
RATE_LIMIT_DELAY = 60 / RATE_LIMIT_REQUESTS  # 1.2 seconds between requests
BATCH_SIZE = 10  # Process in small batches for better error recovery
MAX_RETRIES = 3
TIMEOUT_SECONDS = 30


class EmailValidator:
    """Robust email validation system with Hunter.io API"""

    def __init__(self):
        self.setup_logging()
        self.db_path = DB_PATH
        self.api_key = HUNTER_API_KEY
        self.session = requests.Session()
        self.session.timeout = TIMEOUT_SECONDS
        self.total_validated = 0
        self.session_start = datetime.now()
        self.graceful_shutdown = False

        # Setup graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def setup_logging(self):
        """Setup comprehensive logging"""
        log_dir = Path("scripts/logs")
        log_dir.mkdir(parents=True, exist_ok=True)

        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s - %(levelname)s - %(message)s",
            handlers=[logging.FileHandler(LOG_PATH), logging.StreamHandler(sys.stdout)],
        )
        self.logger = logging.getLogger(__name__)

    def _signal_handler(self, signum, frame):
        """Handle graceful shutdown on SIGINT/SIGTERM"""
        self.logger.info(f"Received signal {signum}. Initiating graceful shutdown...")
        self.graceful_shutdown = True

    def get_database_connection(self) -> sqlite3.Connection:
        """Get database connection with proper error handling"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            return conn
        except Exception as e:
            self.logger.error(f"Database connection failed: {e}")
            raise

    def get_validation_status(self) -> Dict:
        """Get current validation status and progress"""
        with self.get_database_connection() as conn:
            cursor = conn.cursor()

            # Total emails in businesses_clean
            cursor.execute(
                """
                SELECT COUNT(DISTINCT email) as total_unique_emails
                FROM businesses_clean 
                WHERE email IS NOT NULL AND email != ''
            """
            )
            total_emails = cursor.fetchone()["total_unique_emails"]

            # Already validated emails
            cursor.execute(
                """
                SELECT COUNT(DISTINCT email) as validated_emails
                FROM email_validations 
                WHERE email IS NOT NULL
            """
            )
            validated_count = cursor.fetchone()["validated_emails"]

            # Emails needing validation
            cursor.execute(
                """
                SELECT DISTINCT email 
                FROM businesses_clean 
                WHERE email IS NOT NULL 
                AND email != ''
                AND email NOT IN (SELECT email FROM email_validations WHERE email IS NOT NULL)
            """
            )
            pending_emails = [row["email"] for row in cursor.fetchall()]

            # Validation results distribution
            cursor.execute(
                """
                SELECT result, COUNT(*) as count
                FROM email_validations 
                WHERE result IS NOT NULL
                GROUP BY result
            """
            )
            result_distribution = {
                row["result"]: row["count"] for row in cursor.fetchall()
            }

            return {
                "total_emails": total_emails,
                "validated_count": validated_count,
                "pending_count": len(pending_emails),
                "pending_emails": pending_emails,
                "result_distribution": result_distribution,
                "completion_percentage": (validated_count / total_emails * 100)
                if total_emails > 0
                else 0,
            }

    def validate_email_with_hunter(self, email: str) -> Optional[Dict]:
        """Validate single email with Hunter.io API"""
        url = f"{HUNTER_API_URL}?email={email}&api_key={self.api_key}"

        for attempt in range(MAX_RETRIES):
            try:
                self.logger.debug(f"Validating {email} (attempt {attempt + 1})")

                response = self.session.get(url, timeout=TIMEOUT_SECONDS)

                if response.status_code == 200:
                    data = response.json()
                    if "data" in data:
                        result = data["data"]

                        # Calculate score-based result classification
                        score = result.get("score", 0)
                        if score >= 90:
                            classification = "deliverable"
                        elif score >= 50:
                            classification = "risky"
                        else:
                            classification = "undeliverable"

                        validation_result = {
                            "email": email,
                            "result": classification,
                            "score": score,
                            "regexp": result.get("regexp", False),
                            "gibberish": result.get("gibberish", False),
                            "disposable": result.get("disposable", False),
                            "webmail": result.get("webmail", False),
                            "mx_records": result.get("mx_records", False),
                            "smtp_server": result.get("smtp_server", False),
                            "smtp_check": result.get("smtp_check", False),
                            "validated_at": datetime.now().isoformat(),
                        }

                        self.logger.info(
                            f"✓ {email}: {classification} (score: {score})"
                        )
                        return validation_result

                elif response.status_code == 429:
                    # Rate limit exceeded
                    self.logger.warning(f"Rate limit exceeded. Waiting 60 seconds...")
                    time.sleep(60)
                    continue

                elif response.status_code == 401:
                    self.logger.error("Invalid API key")
                    raise Exception("Invalid Hunter.io API key")

                else:
                    self.logger.warning(
                        f"API error {response.status_code} for {email}: {response.text}"
                    )
                    if attempt < MAX_RETRIES - 1:
                        time.sleep(2**attempt)  # Exponential backoff
                        continue

            except requests.exceptions.Timeout:
                self.logger.warning(
                    f"Timeout validating {email} (attempt {attempt + 1})"
                )
                if attempt < MAX_RETRIES - 1:
                    time.sleep(2**attempt)
                    continue

            except requests.exceptions.RequestException as e:
                self.logger.warning(f"Request error validating {email}: {e}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(2**attempt)
                    continue

        self.logger.error(f"✗ Failed to validate {email} after {MAX_RETRIES} attempts")
        return None

    def save_validation_result(self, validation_result: Dict):
        """Save validation result to database"""
        with self.get_database_connection() as conn:
            cursor = conn.cursor()

            # Get business_id for the email (just use the first one if multiple)
            cursor.execute(
                """
                SELECT id FROM businesses_clean 
                WHERE email = ? 
                LIMIT 1
            """,
                (validation_result["email"],),
            )

            business_row = cursor.fetchone()
            business_id = business_row["id"] if business_row else None

            # Insert validation result
            cursor.execute(
                """
                INSERT INTO email_validations 
                (business_id, email, result, score, regexp, gibberish, disposable, 
                 webmail, mx_records, smtp_server, smtp_check, validated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    business_id,
                    validation_result["email"],
                    validation_result["result"],
                    validation_result["score"],
                    validation_result["regexp"],
                    validation_result["gibberish"],
                    validation_result["disposable"],
                    validation_result["webmail"],
                    validation_result["mx_records"],
                    validation_result["smtp_server"],
                    validation_result["smtp_check"],
                    validation_result["validated_at"],
                ),
            )

            conn.commit()
            self.logger.debug(
                f"Saved validation result for {validation_result['email']}"
            )

    def calculate_eta(self, remaining_emails: int, session_validated: int) -> str:
        """Calculate estimated time to completion"""
        if session_validated == 0:
            return "Calculating..."

        session_duration = (datetime.now() - self.session_start).total_seconds()
        avg_time_per_email = session_duration / session_validated
        remaining_seconds = remaining_emails * avg_time_per_email

        eta = datetime.now() + timedelta(seconds=remaining_seconds)
        return eta.strftime("%H:%M:%S")

    def print_progress(
        self, current: int, total: int, email: str, session_validated: int
    ):
        """Print detailed progress information"""
        percentage = (current / total * 100) if total > 0 else 0
        eta = self.calculate_eta(total - current, session_validated)

        print(f"\n{'='*60}")
        print(f"EMAIL VALIDATION PROGRESS")
        print(f"{'='*60}")
        print(f"Current Email: {email}")
        print(f"Progress: {current}/{total} ({percentage:.1f}%)")
        print(f"Session Validated: {session_validated}")
        print(f"ETA: {eta}")
        print(f"Rate: {RATE_LIMIT_REQUESTS} requests/minute")
        print(f"{'='*60}")

    def run_validation(self, resume: bool = True):
        """Run the email validation process"""
        self.logger.info("Starting email validation process...")

        # Get current status
        status = self.get_validation_status()

        print(f"\n{'='*80}")
        print(f"CLUTTERFREE SPACES EMAIL VALIDATION SYSTEM")
        print(f"{'='*80}")
        print(f"Total unique emails: {status['total_emails']}")
        print(f"Already validated: {status['validated_count']}")
        print(f"Pending validation: {status['pending_count']}")
        print(f"Completion: {status['completion_percentage']:.1f}%")

        if status["result_distribution"]:
            print(f"\nCurrent Results Distribution:")
            for result, count in status["result_distribution"].items():
                percentage = count / status["validated_count"] * 100
                print(f"  {result.title()}: {count} ({percentage:.1f}%)")

        print(f"{'='*80}")

        if status["pending_count"] == 0:
            print("🎉 All emails are already validated!")
            return

        pending_emails = status["pending_emails"]
        total_to_validate = len(pending_emails)
        session_validated = 0

        self.logger.info(f"Starting validation of {total_to_validate} emails...")

        for i, email in enumerate(pending_emails, 1):
            if self.graceful_shutdown:
                self.logger.info("Graceful shutdown initiated. Stopping validation.")
                break

            self.print_progress(i, total_to_validate, email, session_validated)

            # Validate email
            result = self.validate_email_with_hunter(email)

            if result:
                self.save_validation_result(result)
                session_validated += 1
                self.total_validated += 1

            # Rate limiting
            if i < total_to_validate:  # Don't delay after last email
                time.sleep(RATE_LIMIT_DELAY)

        # Final status
        final_status = self.get_validation_status()

        print(f"\n{'='*80}")
        print(f"VALIDATION SESSION COMPLETE")
        print(f"{'='*80}")
        print(f"Emails validated this session: {session_validated}")
        print(f"Total completion: {final_status['completion_percentage']:.1f}%")
        print(f"Remaining: {final_status['pending_count']} emails")

        if final_status["pending_count"] == 0:
            print(f"🎉 ALL EMAILS VALIDATED! Ready for campaign launch.")

        self.logger.info(
            f"Validation session complete. Validated {session_validated} emails."
        )

    def generate_quality_report(self) -> Dict:
        """Generate comprehensive validation quality report"""
        with self.get_database_connection() as conn:
            cursor = conn.cursor()

            # Overall stats
            cursor.execute(
                """
                SELECT 
                    COUNT(*) as total_validated,
                    AVG(score) as avg_score,
                    MIN(score) as min_score,
                    MAX(score) as max_score
                FROM email_validations
            """
            )
            overall_stats = cursor.fetchone()

            # Result distribution
            cursor.execute(
                """
                SELECT result, COUNT(*) as count
                FROM email_validations 
                GROUP BY result
                ORDER BY count DESC
            """
            )
            result_distribution = {
                row["result"]: row["count"] for row in cursor.fetchall()
            }

            # Quality flags analysis
            cursor.execute(
                """
                SELECT 
                    SUM(CASE WHEN disposable = 1 THEN 1 ELSE 0 END) as disposable_count,
                    SUM(CASE WHEN gibberish = 1 THEN 1 ELSE 0 END) as gibberish_count,
                    SUM(CASE WHEN webmail = 1 THEN 1 ELSE 0 END) as webmail_count,
                    SUM(CASE WHEN mx_records = 1 THEN 1 ELSE 0 END) as valid_mx_count,
                    SUM(CASE WHEN smtp_check = 1 THEN 1 ELSE 0 END) as smtp_valid_count
                FROM email_validations
            """
            )
            quality_flags = cursor.fetchone()

            # High-quality emails (deliverable + high score)
            cursor.execute(
                """
                SELECT COUNT(*) as high_quality_count
                FROM email_validations 
                WHERE result = 'deliverable' AND score >= 95
            """
            )
            high_quality = cursor.fetchone()["high_quality_count"]

            # Risky emails that might be recoverable
            cursor.execute(
                """
                SELECT COUNT(*) as recoverable_risky
                FROM email_validations 
                WHERE result = 'risky' AND score >= 70 AND disposable = 0 AND gibberish = 0
            """
            )
            recoverable_risky = cursor.fetchone()["recoverable_risky"]

            return {
                "overall_stats": dict(overall_stats),
                "result_distribution": result_distribution,
                "quality_flags": dict(quality_flags),
                "high_quality_count": high_quality,
                "recoverable_risky_count": recoverable_risky,
                "total_validated": overall_stats["total_validated"]
                if overall_stats
                else 0,
            }


def main():
    """Main function"""
    validator = EmailValidator()

    if len(sys.argv) > 1:
        if sys.argv[1] == "report":
            # Generate quality report only
            report = validator.generate_quality_report()

            print(f"\n{'='*80}")
            print(f"EMAIL VALIDATION QUALITY REPORT")
            print(f"{'='*80}")

            if report["total_validated"] > 0:
                print(f"Total Validated: {report['total_validated']}")
                print(f"Average Score: {report['overall_stats']['avg_score']:.1f}")
                print(
                    f"Score Range: {report['overall_stats']['min_score']} - {report['overall_stats']['max_score']}"
                )

                print(f"\nResult Distribution:")
                for result, count in report["result_distribution"].items():
                    percentage = count / report["total_validated"] * 100
                    print(f"  {result.title()}: {count} ({percentage:.1f}%)")

                print(f"\nQuality Analysis:")
                print(
                    f"  High Quality (deliverable, 95+ score): {report['high_quality_count']}"
                )
                print(
                    f"  Recoverable Risky (70+ score, clean): {report['recoverable_risky_count']}"
                )
                print(
                    f"  Disposable Emails: {report['quality_flags']['disposable_count']}"
                )
                print(
                    f"  Gibberish Emails: {report['quality_flags']['gibberish_count']}"
                )
                print(
                    f"  Webmail Addresses: {report['quality_flags']['webmail_count']}"
                )
                print(
                    f"  Valid MX Records: {report['quality_flags']['valid_mx_count']}"
                )
                print(f"  SMTP Verified: {report['quality_flags']['smtp_valid_count']}")

                # Campaign recommendations
                deliverable = report["result_distribution"].get("deliverable", 0)
                total = report["total_validated"]

                print(f"\n{'='*80}")
                print(f"CAMPAIGN READINESS ASSESSMENT")
                print(f"{'='*80}")

                if deliverable / total >= 0.7:
                    print("✅ EXCELLENT - Ready for campaign launch")
                    print(
                        f"   {deliverable}/{total} ({deliverable/total*100:.1f}%) deliverable emails"
                    )
                elif deliverable / total >= 0.5:
                    print("⚠️  GOOD - Proceed with caution")
                    print(
                        f"   {deliverable}/{total} ({deliverable/total*100:.1f}%) deliverable emails"
                    )
                    print("   Consider removing undeliverable emails")
                else:
                    print("❌ POOR - Clean list before launch")
                    print(
                        f"   Only {deliverable}/{total} ({deliverable/total*100:.1f}%) deliverable"
                    )
                    print("   High risk of reputation damage")
            else:
                print("No validated emails found. Run validation first.")

            print(f"{'='*80}")
            return

        elif sys.argv[1] == "status":
            # Show current status only
            status = validator.get_validation_status()

            print(f"\n{'='*60}")
            print(f"VALIDATION STATUS")
            print(f"{'='*60}")
            print(f"Total emails: {status['total_emails']}")
            print(f"Validated: {status['validated_count']}")
            print(f"Pending: {status['pending_count']}")
            print(f"Completion: {status['completion_percentage']:.1f}%")
            print(f"{'='*60}")
            return

    # Run full validation
    try:
        validator.run_validation()
    except KeyboardInterrupt:
        validator.logger.info("Validation interrupted by user")
    except Exception as e:
        validator.logger.error(f"Validation failed: {e}")
        raise


if __name__ == "__main__":
    main()
