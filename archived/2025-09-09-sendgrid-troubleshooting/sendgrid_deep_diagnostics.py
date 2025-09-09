#!/usr/bin/env python3
"""
Deep SendGrid API Diagnostics
Comprehensive testing to isolate authentication issues
"""

import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


def test_api_key_permissions():
    """Test detailed API key permissions"""

    api_key = os.getenv("SENDGRID_API_KEY") or os.getenv("SendGrid_API_Key")
    if not api_key:
        print("❌ No SendGrid API key found")
        return False

    print(f"🔑 API Key: {api_key[:15]}...{api_key[-10:]} ({len(api_key)} chars)")

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    # Test multiple endpoints to isolate permission issues
    endpoints = [
        ("User Account", "GET", "https://api.sendgrid.com/v3/user/account"),
        ("API Keys", "GET", "https://api.sendgrid.com/v3/api_keys"),
        (
            "Sender Auth",
            "GET",
            "https://api.sendgrid.com/v3/user/settings/sender_authentication",
        ),
        ("Stats", "GET", "https://api.sendgrid.com/v3/user/stats"),
        ("Scopes", "GET", "https://api.sendgrid.com/v3/scopes"),
        ("Profile", "GET", "https://api.sendgrid.com/v3/user/profile"),
        ("Mail Send", "POST", "https://api.sendgrid.com/v3/mail/send"),
    ]

    results = {}

    for name, method, url in endpoints:
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            else:  # POST
                # Minimal test payload for mail/send
                test_payload = {
                    "personalizations": [{"to": [{"email": "test@example.com"}]}],
                    "from": {"email": "contact@clutter-free-spaces.com"},
                    "subject": "Test",
                    "content": [{"type": "text/plain", "value": "Test"}],
                }
                response = requests.post(
                    url, headers=headers, json=test_payload, timeout=10
                )

            results[name] = {
                "status": response.status_code,
                "success": response.status_code < 400,
                "response": response.text[:200]
                if response.text
                else "No response body",
            }

            if response.status_code == 200:
                print(f"✅ {name}: Success ({response.status_code})")
            elif response.status_code == 401:
                print(f"❌ {name}: Unauthorized ({response.status_code})")
            elif response.status_code == 403:
                print(f"⚠️ {name}: Forbidden ({response.status_code})")
            else:
                print(f"⚠️ {name}: {response.status_code}")

        except Exception as e:
            results[name] = {"error": str(e)}
            print(f"❌ {name}: Error - {e}")

    return results


def test_raw_curl_equivalent():
    """Test the exact same request using requests that would work with curl"""

    api_key = os.getenv("SENDGRID_API_KEY") or os.getenv("SendGrid_API_Key")

    print("\n🧪 RAW API TEST (curl equivalent)")
    print("-" * 50)

    # Show the exact curl command
    curl_command = f"""
curl -X GET "https://api.sendgrid.com/v3/user/account" \\
  -H "Authorization: Bearer {api_key}" \\
  -H "Content-Type: application/json"
    """
    print(f"📋 Equivalent curl command:{curl_command}")

    # Test with minimal headers
    response = requests.get(
        "https://api.sendgrid.com/v3/user/account",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "ClutterFreeSpaces/1.0",
        },
        timeout=10,
    )

    print(f"🔍 Response Status: {response.status_code}")
    print(f"🔍 Response Headers: {dict(response.headers)}")
    print(f"🔍 Response Body: {response.text}")

    return response.status_code == 200


def test_environment_variables():
    """Validate environment variable setup"""

    print("\n🔧 ENVIRONMENT VALIDATION")
    print("-" * 50)

    # Check both possible env var names
    sg_key_1 = os.getenv("SENDGRID_API_KEY")
    sg_key_2 = os.getenv("SendGrid_API_Key")

    print(f"SENDGRID_API_KEY: {'✅ Set' if sg_key_1 else '❌ Not set'}")
    print(f"SendGrid_API_Key: {'✅ Set' if sg_key_2 else '❌ Not set'}")

    if sg_key_1 and sg_key_2:
        if sg_key_1 == sg_key_2:
            print("✅ Both variables contain the same key")
        else:
            print("⚠️ Variables contain different keys!")
            print(f"   SENDGRID_API_KEY: {sg_key_1[:15]}...{sg_key_1[-10:]}")
            print(f"   SendGrid_API_Key: {sg_key_2[:15]}...{sg_key_2[-10:]}")

    active_key = sg_key_1 or sg_key_2
    if active_key:
        # Validate key format
        if active_key.startswith("SG.") and len(active_key) == 69:
            print("✅ API key format is correct")
        else:
            print(
                f"⚠️ API key format may be incorrect: starts with '{active_key[:3]}', length {len(active_key)}"
            )

    return active_key


def test_network_connectivity():
    """Test basic network connectivity to SendGrid"""

    print("\n🌐 NETWORK CONNECTIVITY TEST")
    print("-" * 50)

    try:
        # Test basic connectivity
        response = requests.get("https://api.sendgrid.com", timeout=5)
        print(f"✅ SendGrid API reachable: {response.status_code}")

        # Test with no auth (should get 401 but proves connectivity)
        response = requests.get("https://api.sendgrid.com/v3/user/account", timeout=5)
        print(f"✅ API endpoint reachable: {response.status_code} (expected 401)")

        return True
    except Exception as e:
        print(f"❌ Network connectivity failed: {e}")
        return False


def compare_with_working_config():
    """Compare current config with what worked yesterday"""

    print("\n🔄 CONFIGURATION COMPARISON")
    print("-" * 50)

    # Check if the EmailCampaignManager config matches
    try:
        import sys

        sys.path.append("outreach/campaigns")
        from email_campaign_manager import EmailCampaignManager

        manager = EmailCampaignManager()
        print(f"✅ EmailCampaignManager from_email: {manager.from_email}")
        print(f"✅ EmailCampaignManager from_name: {manager.from_name}")

        # Check if it uses the same API key
        api_key = os.getenv("SENDGRID_API_KEY") or os.getenv("SendGrid_API_Key")
        manager_key = manager.sg.api_key if hasattr(manager, "sg") else "Unknown"

        if api_key == manager_key:
            print("✅ Same API key used by both")
        else:
            print("⚠️ Different API keys detected")

        manager.close()
        return True

    except Exception as e:
        print(f"❌ Could not load EmailCampaignManager: {e}")
        return False


def main():
    """Run comprehensive SendGrid diagnostics"""

    print("🔬 SENDGRID DEEP DIAGNOSTICS")
    print("=" * 60)
    print(f"🕐 Timestamp: {datetime.now().isoformat()}")
    print()

    # Test 1: Environment variables
    api_key = test_environment_variables()
    if not api_key:
        print("❌ Cannot proceed without API key")
        return 1

    # Test 2: Network connectivity
    if not test_network_connectivity():
        print("❌ Network issues detected")
        return 1

    # Test 3: Raw API test
    raw_success = test_raw_curl_equivalent()

    # Test 4: Detailed permissions
    print("\n🔐 API PERMISSIONS TEST")
    print("-" * 50)
    results = test_api_key_permissions()

    # Test 5: Compare with working config
    compare_with_working_config()

    # Analysis
    print("\n📊 DIAGNOSTIC SUMMARY")
    print("-" * 50)

    success_count = sum(
        1 for r in results.values() if isinstance(r, dict) and r.get("success", False)
    )
    total_tests = len(results)

    print(f"📈 Successful API calls: {success_count}/{total_tests}")

    if success_count == 0:
        print("❌ Complete API failure - likely API key revoked or service issue")
        print("💡 Recommended actions:")
        print("   1. Check SendGrid dashboard for account status")
        print("   2. Regenerate API key with Full Access")
        print("   3. Contact SendGrid support if account locked")
    elif success_count < total_tests:
        print("⚠️ Partial API access - limited permissions")
        print("💡 Check API key scopes in SendGrid dashboard")
    else:
        print("✅ All API endpoints accessible")

    # Save detailed results
    with open("sendgrid_diagnostic_results.json", "w") as f:
        json.dump(
            {
                "timestamp": datetime.now().isoformat(),
                "api_key_length": len(api_key),
                "api_key_prefix": api_key[:15],
                "results": results,
            },
            f,
            indent=2,
        )

    print(f"\n💾 Detailed results saved: sendgrid_diagnostic_results.json")

    return 0 if success_count > 0 else 1


if __name__ == "__main__":
    exit(main())
