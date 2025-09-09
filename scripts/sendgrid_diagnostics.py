#!/usr/bin/env python3
"""
SendGrid API Diagnostics
Tests API connection, permissions, and account status
"""

import os
import json
from dotenv import load_dotenv

load_dotenv()

try:
    import sendgrid
    from sendgrid.helpers.mail import (
        Mail,
        From,
        To,
        Subject,
        HtmlContent,
        PlainTextContent,
    )
    import requests

    SENDGRID_AVAILABLE = True
except ImportError:
    print("❌ SendGrid library not available")
    SENDGRID_AVAILABLE = False


def test_api_key_validity():
    """Test if API key is valid and has proper permissions"""

    api_key = os.getenv("SENDGRID_API_KEY") or os.getenv("SendGrid_API_Key")
    if not api_key:
        print("❌ No SendGrid API key found")
        return False

    print(f"🔑 API Key: {api_key[:15]}...{api_key[-10:]} ({len(api_key)} chars)")

    # Test API key with a simple request to user info
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    try:
        # Test with user/account endpoint (minimal permissions required)
        response = requests.get(
            "https://api.sendgrid.com/v3/user/account", headers=headers
        )

        if response.status_code == 200:
            account_info = response.json()
            print("✅ API Key Valid - Account Info:")
            print(f"   Type: {account_info.get('type', 'unknown')}")
            print(f"   Reputation: {account_info.get('reputation', 'unknown')}")
            return True
        elif response.status_code == 401:
            print("❌ API Key Invalid (401 Unauthorized)")
            print("   Check if key is correct or has been revoked")
            return False
        elif response.status_code == 403:
            print("⚠️ API Key Valid but Insufficient Permissions (403 Forbidden)")
            print("   Free trial accounts may have limited API access")
            return False
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ API Request Failed: {e}")
        return False


def test_sending_permissions():
    """Test if API key has sending permissions"""

    api_key = os.getenv("SENDGRID_API_KEY") or os.getenv("SendGrid_API_Key")
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    try:
        # Check sender authentication status
        response = requests.get(
            "https://api.sendgrid.com/v3/user/settings/sender_authentication",
            headers=headers,
        )

        if response.status_code == 200:
            auth_info = response.json()
            print("📧 Sender Authentication Status:")
            print(
                f"   Domain Authentication: {auth_info.get('domain_authentication', {}).get('enabled', 'unknown')}"
            )
            print(
                f"   Single Sender: {auth_info.get('single_sender_verification', {}).get('enabled', 'unknown')}"
            )
        else:
            print(f"⚠️ Could not check sender authentication: {response.status_code}")

    except Exception as e:
        print(f"⚠️ Error checking sender auth: {e}")


def test_quota_status():
    """Check current sending quota and usage"""

    api_key = os.getenv("SENDGRID_API_KEY") or os.getenv("SendGrid_API_Key")
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    try:
        # Get stats for today
        response = requests.get(
            "https://api.sendgrid.com/v3/user/stats", headers=headers
        )

        if response.status_code == 200:
            stats = response.json()
            if stats:
                latest_stats = stats[0] if stats else {}
                print("📊 Current Usage Stats:")
                print(
                    f"   Requests: {latest_stats.get('stats', [{}])[0].get('requests', 0) if latest_stats.get('stats') else 0}"
                )
                print(
                    f"   Delivered: {latest_stats.get('stats', [{}])[0].get('delivered', 0) if latest_stats.get('stats') else 0}"
                )
                print(f"   Date: {latest_stats.get('date', 'unknown')}")
            else:
                print("📊 No usage stats available (new account or no sends)")
        else:
            print(f"⚠️ Could not check quota: {response.status_code}")

    except Exception as e:
        print(f"⚠️ Error checking quota: {e}")


def test_simple_send():
    """Test a simple email send"""

    if not SENDGRID_AVAILABLE:
        print("❌ SendGrid library not available")
        return False

    api_key = os.getenv("SENDGRID_API_KEY") or os.getenv("SendGrid_API_Key")
    sg = sendgrid.SendGridAPIClient(api_key=api_key)

    # Simple test email using verified domain
    from_email = From("contact@clutter-free-spaces.com", "ClutterFreeSpaces")
    to_email = To("contact@clutter-free-spaces.com")
    subject = Subject("SendGrid API Test - Domain Verified")
    html_content = HtmlContent(
        "<p>This is a test email to verify SendGrid API is working with verified domain.</p>"
    )
    plain_content = PlainTextContent(
        "This is a test email to verify SendGrid API is working with verified domain."
    )

    mail = Mail(from_email, to_email, subject, plain_content, html_content)

    try:
        response = sg.send(mail)

        if response.status_code == 202:
            print("✅ Test Email Sent Successfully!")
            print(f"   Status: {response.status_code}")
            print(f"   Message ID: {response.headers.get('X-Message-Id', 'N/A')}")
            return True
        else:
            print(f"❌ Email Send Failed: {response.status_code}")
            print(f"   Response: {response.body}")
            return False

    except Exception as e:
        print(f"❌ Send Error: {e}")
        return False


def main():
    """Run comprehensive SendGrid diagnostics"""

    print("🔬 SENDGRID API DIAGNOSTICS")
    print("=" * 50)
    print()

    # Test 1: API Key Validity
    print("🧪 TEST 1: API Key Validity")
    print("-" * 30)
    api_valid = test_api_key_validity()
    print()

    if not api_valid:
        print("❌ Cannot proceed with other tests - API key invalid")
        return 1

    # Test 2: Sending Permissions
    print("🧪 TEST 2: Sending Permissions")
    print("-" * 30)
    test_sending_permissions()
    print()

    # Test 3: Quota Status
    print("🧪 TEST 3: Quota and Usage")
    print("-" * 30)
    test_quota_status()
    print()

    # Test 4: Simple Send
    print("🧪 TEST 4: Simple Email Send")
    print("-" * 30)
    send_success = test_simple_send()
    print()

    # Summary
    print("📋 DIAGNOSTIC SUMMARY")
    print("-" * 30)
    if api_valid and send_success:
        print("✅ All tests passed - SendGrid API is working")
        print("🚀 Ready to launch email campaigns")
    elif api_valid and not send_success:
        print("⚠️ API key valid but sending failed")
        print("💡 Possible issues:")
        print("   - Free trial sending restrictions")
        print("   - Domain authentication required")
        print("   - Daily quota reached")
        print("   - From address not verified")
    else:
        print("❌ API key issues detected")
        print("💡 Recommended actions:")
        print("   - Verify API key in SendGrid dashboard")
        print("   - Check if trial account has API restrictions")
        print("   - Consider upgrading to paid plan")

    print()
    print("🔗 Useful Links:")
    print("   SendGrid Dashboard: https://app.sendgrid.com")
    print("   API Key Settings: https://app.sendgrid.com/settings/api_keys")
    print("   Sender Authentication: https://app.sendgrid.com/settings/sender_auth")


if __name__ == "__main__":
    exit(main())
