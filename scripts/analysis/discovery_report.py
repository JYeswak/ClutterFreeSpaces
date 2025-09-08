#!/usr/bin/env python3
"""
ClutterFreeSpaces Business Discovery Analysis Report
"""
import sqlite3


def main():
    # Connect to database
    db_path = "./.claude/data/metrics.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("📊 ClutterFreeSpaces Business Discovery Results")
    print("=" * 60)

    # Get business type counts with correct column names
    cursor.execute(
        """
    SELECT 
        bt.type_name as business_type,
        COUNT(b.id) as count,
        AVG(CASE WHEN b.phone IS NOT NULL THEN 1.0 ELSE 0.0 END) * 100 as phone_rate,
        AVG(CASE WHEN b.website IS NOT NULL THEN 1.0 ELSE 0.0 END) * 100 as website_rate,
        AVG(CASE WHEN b.email IS NOT NULL THEN 1.0 ELSE 0.0 END) * 100 as email_rate,
        AVG(b.google_rating) as avg_rating
    FROM business_types bt
    LEFT JOIN businesses b ON bt.id = b.business_type_id
    GROUP BY bt.id, bt.type_name
    HAVING COUNT(b.id) > 0
    ORDER BY count DESC
    """
    )

    results = cursor.fetchall()
    total_businesses = sum(row[1] for row in results)

    print(
        f"{'Business Type':<25} | {'Count':<5} | {'Phone':<6} | {'Website':<8} | {'Email':<6} | {'Rating':<6} | {'Status'}"
    )
    print("-" * 85)

    for (
        business_type,
        count,
        phone_rate,
        website_rate,
        email_rate,
        avg_rating,
    ) in results:
        if count >= 50:
            status = "✅ COMPLETED"
        elif count > 0:
            status = "🔄 IN PROGRESS"
        else:
            status = "⏳ PENDING"

        rating_str = f"{avg_rating:.1f}" if avg_rating else "N/A"
        print(
            f"{business_type:<25} | {count:<5} | {phone_rate:5.1f}% | {website_rate:7.1f}% | {email_rate:5.1f}% | {rating_str:<6} | {status}"
        )

    print("-" * 85)
    print(
        f"{'TOTAL DISCOVERED':<25} | {total_businesses:<5} | {'Businesses across Montana':<35}"
    )

    print()
    print("🎯 Discovery Progress Summary:")
    print("=" * 40)

    # Count completed types
    completed = sum(1 for row in results if row[1] >= 50)
    in_progress = sum(1 for row in results if 0 < row[1] < 50)
    total_types = 8  # Target types we're discovering

    print(f"✅ Completed Types    : {completed}/8")
    print(f"🔄 In Progress       : {in_progress}/8")
    print(f"⏳ Pending Types     : {total_types - completed - in_progress}/8")
    print()

    # Geographic distribution
    print("📍 Geographic Distribution:")
    print("-" * 30)
    cursor.execute(
        """
    SELECT city, COUNT(*) as count
    FROM businesses
    WHERE city IS NOT NULL AND city != '' AND city != 'Unknown'
    GROUP BY city
    ORDER BY count DESC
    LIMIT 8
    """
    )

    cities = cursor.fetchall()
    for city, count in cities:
        print(f"{city:<20}: {count:3} businesses")

    print()
    print("🌟 High-Quality Business Samples:")
    print("-" * 50)

    # Top rated businesses by type for completed categories
    completed_types = ["cleaning_company", "moving_company", "rv_dealer"]
    for btype in completed_types:
        cursor.execute(
            """
        SELECT b.name, b.city, b.phone, b.google_rating, b.review_count
        FROM businesses b
        JOIN business_types bt ON b.business_type_id = bt.id
        WHERE bt.type_name = ? AND b.google_rating IS NOT NULL
        ORDER BY b.google_rating DESC, b.review_count DESC
        LIMIT 3
        """,
            (btype,),
        )

        samples = cursor.fetchall()
        if samples:
            print(f'\n{btype.replace("_", " ").title()}:')
            for i, (name, city, phone, rating, reviews) in enumerate(samples, 1):
                phone_display = (
                    f"📞 {phone[:12]}..."
                    if phone and len(phone) > 12
                    else f"📞 {phone}"
                    if phone
                    else "❌ No phone"
                )
                print(
                    f"  {i}. {name[:40]:40} | {city:10} | ⭐ {rating}/5 ({reviews or 0} reviews) | {phone_display}"
                )

    print()
    print("📋 Next Steps Recommendations:")
    print("=" * 35)
    print("1. 🔄 Monitor remaining discovery processes")
    print("2. 🌐 Run contact enrichment for collected businesses")
    print("3. 📧 Create targeted outreach campaigns")
    print("4. 🎯 Start with highest-rated businesses for initial outreach")
    print("5. 📊 Track response rates and optimize messaging")

    conn.close()


if __name__ == "__main__":
    main()
