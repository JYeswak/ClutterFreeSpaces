#!/usr/bin/env python3
"""
RV Organization Partners Campaign Templates
Professional email templates for B2B partnerships with RV dealers,
parks, service centers, rental companies, and outdoor recreation businesses.
"""

# RV Organization Campaign Templates

RV_ORGANIZATION_TEMPLATES = {
    # Initial Introduction Email
    "rv_intro": {
        "subject": "RV Organization Partnership: {business_name} + ClutterFreeSpaces",
        "html_content": """
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h2 style="color: #8b4513; margin-bottom: 20px;">Hello {first_name},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            I came across {business_name} while researching the best {business_type} in {city}, and I was impressed with your reputation and commitment to the RV community.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            I'm Chanel Basolo, founder of <strong>ClutterFreeSpaces</strong> - Montana's premier professional organization service. We specialize in helping RV owners maximize their space and create functional, organized living environments that make life on the road more enjoyable.
        </p>
        
        <div style="background-color: white; padding: 25px; border-radius: 8px; border-left: 4px solid #8b4513; margin: 25px 0;">
            <h3 style="color: #8b4513; margin-top: 0;">RV Partnership Opportunity</h3>
            <p style="margin-bottom: 15px;">
                Your customers invest significantly in their RV lifestyle, and we'd love to partner with you to help them get the most out of their investment through:
            </p>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li><strong>RV Interior Organization</strong> - Maximize every square inch</li>
                <li><strong>Storage Solutions</strong> - Custom systems for gear and supplies</li>
                <li><strong>Seasonal Setup</strong> - Organized packing and unpacking systems</li>
                <li><strong>Full-Timer Support</strong> - Living organized in small spaces</li>
            </ul>
            <p style="margin-bottom: 0;">
                <strong>You earn 25% commission</strong> on every successful organization project you refer!
            </p>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>Why this partnership works:</strong> RV owners who invest in quality {business_type} understand the value of professional services. They want their RV experience to be stress-free and enjoyable - and organization is key to that.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
            Would you be interested in a brief 15-minute call to explore how we could work together? I'd love to share more about our RV organization services and referral program.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://calendly.com/chanel-clutterfree/rv-partner-intro" 
               style="background-color: #8b4513; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Let's Discuss Partnership
            </a>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Looking forward to potentially partnering with {business_name} to better serve the RV community!
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin-bottom: 5px;"><strong>Chanel Basolo</strong></p>
            <p style="margin-bottom: 5px; color: #666;">Founder & Professional Organizer</p>
            <p style="margin-bottom: 5px; color: #666;">ClutterFreeSpaces - RV Organization Specialist</p>
            <p style="margin-bottom: 10px; color: #666;">📧 contact@clutter-free-spaces.com</p>
            <p style="margin-bottom: 0; color: #666;">🌐 <a href="https://www.clutter-free-spaces.com/rv-organization" style="color: #8b4513;">www.clutter-free-spaces.com/rv-organization</a></p>
        </div>
    </div>
</div>
        """,
        "text_content": """
Hello {first_name},

I came across {business_name} while researching the best {business_type} in {city}, and I was impressed with your reputation and commitment to the RV community.

I'm Chanel Basolo, founder of ClutterFreeSpaces - Montana's premier professional organization service. We specialize in helping RV owners maximize their space and create functional, organized living environments that make life on the road more enjoyable.

RV PARTNERSHIP OPPORTUNITY

Your customers invest significantly in their RV lifestyle, and we'd love to partner with you to help them get the most out of their investment through:

• RV Interior Organization - Maximize every square inch
• Storage Solutions - Custom systems for gear and supplies
• Seasonal Setup - Organized packing and unpacking systems  
• Full-Timer Support - Living organized in small spaces

You earn 25% commission on every successful organization project you refer!

Why this partnership works: RV owners who invest in quality {business_type} understand the value of professional services. They want their RV experience to be stress-free and enjoyable - and organization is key to that.

Would you be interested in a brief 15-minute call to explore how we could work together? I'd love to share more about our RV organization services and referral program.

Let's Discuss Partnership: https://calendly.com/chanel-clutterfree/rv-partner-intro

Looking forward to potentially partnering with {business_name} to better serve the RV community!

Best regards,
Chanel Basolo
Founder & Professional Organizer
ClutterFreeSpaces - RV Organization Specialist
contact@clutter-free-spaces.com
www.clutter-free-spaces.com/rv-organization
        """,
        "delay_days": 0,
    },
    # Follow-up Email 1
    "rv_followup_1": {
        "subject": "RV organization: Your customers are asking for this",
        "html_content": """
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h2 style="color: #8b4513; margin-bottom: 20px;">Hi {first_name},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            I wanted to follow up on my email about partnering with {business_name} for RV organization services.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            I bet your customers ask about organization and storage solutions all the time. Here's what we're hearing from RV owners across Montana:
        </p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #8b4513; margin-top: 0;">Common RV Challenges We Solve:</h3>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li><strong>"I can't find anything!"</strong> - Inefficient storage systems</li>
                <li><strong>"We're always tripping over stuff"</strong> - Poor space utilization</li>
                <li><strong>"Packing takes forever"</strong> - No organized packing system</li>
                <li><strong>"The RV feels cramped"</strong> - Clutter overwhelming the space</li>
                <li><strong>"We forgot essential items"</strong> - No inventory management</li>
            </ul>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>Here's the opportunity:</strong> When you refer customers to us for RV organization, you're solving problems they didn't even know they could fix, while earning substantial commissions.
        </p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid #8b4513; margin: 20px 0;">
            <h3 style="color: #8b4513; margin-top: 0;">Recent Partner Success:</h3>
            <p style="margin-bottom: 10px;">
                <strong>Mountain View RV in Kalispell</strong> has referred 8 customers in 3 months:
            </p>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li>$3,200 in commission earnings</li>
                <li>Customers rave about the complete service experience</li>
                <li>2 additional RV sales from satisfied organization customers</li>
                <li>"Best partnership we've ever done" - Owner, Tom K.</li>
            </ul>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
            The process is simple: mention ClutterFreeSpaces when customers ask about organization or storage, we handle everything else, and you get paid.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://calendly.com/chanel-clutterfree/rv-partner-intro" 
               style="background-color: #8b4513; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                I'm Interested - Let's Talk
            </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            If this isn't a fit for {business_name}, just let me know and I won't follow up again.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin-bottom: 5px;"><strong>Chanel Basolo</strong></p>
            <p style="margin-bottom: 0; color: #666;">ClutterFreeSpaces - RV Organization Specialist</p>
        </div>
    </div>
</div>
        """,
        "text_content": """
Hi {first_name},

I wanted to follow up on my email about partnering with {business_name} for RV organization services.

I bet your customers ask about organization and storage solutions all the time. Here's what we're hearing from RV owners across Montana:

COMMON RV CHALLENGES WE SOLVE:
• "I can't find anything!" - Inefficient storage systems
• "We're always tripping over stuff" - Poor space utilization
• "Packing takes forever" - No organized packing system
• "The RV feels cramped" - Clutter overwhelming the space
• "We forgot essential items" - No inventory management

Here's the opportunity: When you refer customers to us for RV organization, you're solving problems they didn't even know they could fix, while earning substantial commissions.

RECENT PARTNER SUCCESS:

Mountain View RV in Kalispell has referred 8 customers in 3 months:
• $3,200 in commission earnings
• Customers rave about the complete service experience
• 2 additional RV sales from satisfied organization customers  
• "Best partnership we've ever done" - Owner, Tom K.

The process is simple: mention ClutterFreeSpaces when customers ask about organization or storage, we handle everything else, and you get paid.

I'm Interested - Let's Talk: https://calendly.com/chanel-clutterfree/rv-partner-intro

If this isn't a fit for {business_name}, just let me know and I won't follow up again.

Best regards,
Chanel Basolo
ClutterFreeSpaces - RV Organization Specialist
        """,
        "delay_days": 5,
    },
    # Follow-up Email 2 - Seasonal Hook
    "rv_followup_2": {
        "subject": "Spring RV season: Perfect timing for organization partnerships",
        "html_content": """
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h2 style="color: #8b4513; margin-bottom: 20px;">Hi {first_name},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            With RV season ramping up, I thought this might be perfect timing to revisit the partnership opportunity between {business_name} and ClutterFreeSpaces.
        </p>
        
        <div style="background-color: white; padding: 25px; border-radius: 8px; border-left: 4px solid #8b4513; margin: 25px 0;">
            <h3 style="color: #8b4513; margin-top: 0;">Seasonal RV Organization Services</h3>
            <p style="margin-bottom: 15px;">
                <strong>Spring/Summer (March-August):</strong>
            </p>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li>De-winterization organization and inventory</li>
                <li>Summer gear integration and storage systems</li>
                <li>Trip planning and packing optimization</li>
                <li>New RV setup and organization for first-time buyers</li>
            </ul>
            
            <p style="margin-bottom: 15px; margin-top: 20px;">
                <strong>Fall/Winter (September-February):</strong>
            </p>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li>Winterization prep and storage organization</li>
                <li>Off-season gear storage solutions</li>
                <li>Annual deep organization and purging</li>
                <li>Maintenance supply organization</li>
            </ul>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>The numbers work:</strong> Average RV organization project is $800-$1,200, which means $200-$300 per referral in your pocket. Just 2-3 referrals per month could add $6,000+ annually to your bottom line.
        </p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Limited Spring Partnership Bonus</h3>
            <p style="margin-bottom: 15px; color: #856404;">
                <strong>For partnerships started before May 1st:</strong>
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li><strong>30% commission</strong> on first 3 referrals (instead of 25%)</li>
                <li>Free RV organization consultation for your personal RV</li>
                <li>Priority scheduling for your customers</li>
            </ul>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
            Would you like to hop on a quick call to see how this could work for {business_name} this season?
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://calendly.com/chanel-clutterfree/rv-partner-intro" 
               style="background-color: #8b4513; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Let's Set This Up
            </a>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin-bottom: 5px;"><strong>Chanel Basolo</strong></p>
            <p style="margin-bottom: 0; color: #666;">ClutterFreeSpaces | contact@clutter-free-spaces.com</p>
        </div>
    </div>
</div>
        """,
        "text_content": """
Hi {first_name},

With RV season ramping up, I thought this might be perfect timing to revisit the partnership opportunity between {business_name} and ClutterFreeSpaces.

SEASONAL RV ORGANIZATION SERVICES

Spring/Summer (March-August):
• De-winterization organization and inventory
• Summer gear integration and storage systems
• Trip planning and packing optimization
• New RV setup and organization for first-time buyers

Fall/Winter (September-February):
• Winterization prep and storage organization
• Off-season gear storage solutions
• Annual deep organization and purging
• Maintenance supply organization

The numbers work: Average RV organization project is $800-$1,200, which means $200-$300 per referral in your pocket. Just 2-3 referrals per month could add $6,000+ annually to your bottom line.

LIMITED SPRING PARTNERSHIP BONUS

For partnerships started before May 1st:
• 30% commission on first 3 referrals (instead of 25%)
• Free RV organization consultation for your personal RV
• Priority scheduling for your customers

Would you like to hop on a quick call to see how this could work for {business_name} this season?

Let's Set This Up: https://calendly.com/chanel-clutterfree/rv-partner-intro

Best regards,
Chanel Basolo
ClutterFreeSpaces | contact@clutter-free-spaces.com
        """,
        "delay_days": 8,
    },
    # Final Follow-up
    "rv_final": {
        "subject": "Final note: {business_name} RV organization partnership",
        "html_content": """
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h2 style="color: #8b4513; margin-bottom: 20px;">Hi {first_name},</h2>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            This will be my final note about the RV organization partnership opportunity with {business_name}.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            I completely understand if this doesn't fit into your current business model or if the timing isn't right. No worries at all.
        </p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; margin-bottom: 15px;">
                <strong>Just to recap what we offer partners:</strong>
            </p>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li>25-30% commission on all successful referrals</li>
                <li>We handle all customer service after the referral</li>
                <li>No contracts, exclusivity requirements, or fees</li>
                <li>Specialized RV organization expertise</li>
                <li>Professional service that reflects well on your business</li>
            </ul>
        </div>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            The RV community is tight-knit, and word travels fast about businesses that go the extra mile for their customers. Organization services are one of those "extra mile" touches that really impress people.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            If you ever want to explore this in the future - maybe during a slower season or when you're looking for additional revenue streams - just reach out. I'm always happy to chat about ways we can support the RV community together.
        </p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">
            Thanks for taking the time to read these emails, and I wish you a fantastic season ahead with {business_name}!
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin-bottom: 5px;"><strong>Chanel Basolo</strong></p>
            <p style="margin-bottom: 5px; color: #666;">Founder & Professional Organizer</p>
            <p style="margin-bottom: 5px; color: #666;">ClutterFreeSpaces - RV Organization Specialist</p>
            <p style="margin-bottom: 10px; color: #666;">📧 contact@clutter-free-spaces.com | 📱 (406) XXX-XXXX</p>
            <p style="margin-bottom: 0; color: #666;">"Making RV life easier, one organized space at a time"</p>
        </div>
    </div>
</div>
        """,
        "text_content": """
Hi {first_name},

This will be my final note about the RV organization partnership opportunity with {business_name}.

I completely understand if this doesn't fit into your current business model or if the timing isn't right. No worries at all.

Just to recap what we offer partners:
• 25-30% commission on all successful referrals
• We handle all customer service after the referral
• No contracts, exclusivity requirements, or fees
• Specialized RV organization expertise
• Professional service that reflects well on your business

The RV community is tight-knit, and word travels fast about businesses that go the extra mile for their customers. Organization services are one of those "extra mile" touches that really impress people.

If you ever want to explore this in the future - maybe during a slower season or when you're looking for additional revenue streams - just reach out. I'm always happy to chat about ways we can support the RV community together.

Thanks for taking the time to read these emails, and I wish you a fantastic season ahead with {business_name}!

Best regards,
Chanel Basolo
Founder & Professional Organizer
ClutterFreeSpaces - RV Organization Specialist
contact@clutter-free-spaces.com | (406) XXX-XXXX
"Making RV life easier, one organized space at a time"
        """,
        "delay_days": 12,
    },
}

# RV Business type specific customizations
RV_BUSINESS_CUSTOMIZATIONS = {
    "rv_dealer": {
        "business_type": "RV sales and service",
        "custom_hook": "Studies show that organized RVs retain 15-20% more value and sell 40% faster than cluttered units.",
        "specific_pitch": "Your customers invest $50K-$200K+ in their RV - help them protect that investment with professional organization.",
    },
    "rv_park": {
        "business_type": "RV park and campground services",
        "custom_hook": "Organized RVers are happier campers - they spend more time enjoying your amenities instead of searching for misplaced items.",
        "specific_pitch": "Your guests want to relax and enjoy their stay, not stress about disorganized RV living spaces.",
    },
    "rv_service": {
        "business_type": "RV service and repair",
        "custom_hook": "Organized RVs are easier to service - technicians can access systems quickly, reducing labor costs for your customers.",
        "specific_pitch": "When customers invest in maintenance, they want their RV to function perfectly - organization is part of that.",
    },
    "rv_rental": {
        "business_type": "RV rental services",
        "custom_hook": "Organized rental units get higher satisfaction scores and fewer damage claims from confused renters.",
        "specific_pitch": "First-time RVers need organization systems to make their rental experience successful and memorable.",
    },
    "outdoor_store": {
        "business_type": "outdoor recreation and camping gear",
        "custom_hook": "The gear is only as good as the storage system - proper organization prevents damage and makes everything accessible.",
        "specific_pitch": "Your customers invest in quality gear - help them organize it properly to maximize their RV adventures.",
    },
    "travel_agency": {
        "business_type": "RV travel planning",
        "custom_hook": "Well-organized RVers have more successful trips - they're prepared, efficient, and stress-free on the road.",
        "specific_pitch": "The best-planned trips can be ruined by poor RV organization - help your clients start organized.",
    },
    "rv_club": {
        "business_type": "RV club and community",
        "custom_hook": "Club members love sharing organization tips and solutions - professional services take it to the next level.",
        "specific_pitch": "Offer your members an exclusive benefit that makes their RV lifestyle more enjoyable and organized.",
    },
}


def get_personalized_rv_template(
    template_key: str, business_type: str, contact_data: dict
) -> dict:
    """
    Get a personalized RV template with business-specific customizations

    Args:
        template_key: Key for the template (e.g., 'rv_intro')
        business_type: Type of business from business_types table
        contact_data: Dictionary with contact information

    Returns:
        Personalized template dictionary
    """

    # Get base template
    if template_key not in RV_ORGANIZATION_TEMPLATES:
        raise ValueError(f"Template {template_key} not found")

    template = RV_ORGANIZATION_TEMPLATES[template_key].copy()

    # Apply business-specific customizations
    if business_type in RV_BUSINESS_CUSTOMIZATIONS:
        customization = RV_BUSINESS_CUSTOMIZATIONS[business_type]

        # Replace business_type placeholder
        template["subject"] = template["subject"].replace(
            "{business_type}", customization["business_type"]
        )
        template["html_content"] = template["html_content"].replace(
            "{business_type}", customization["business_type"]
        )
        template["text_content"] = template["text_content"].replace(
            "{business_type}", customization["business_type"]
        )

        # Add custom hook if it's the intro email
        if template_key == "rv_intro" and "custom_hook" in customization:
            hook_html = f'<p style="font-size: 16px; margin-bottom: 20px; font-style: italic; color: #8b4513;"><strong>Did you know?</strong> {customization["custom_hook"]}</p>'
            hook_text = f"Did you know? {customization['custom_hook']}\n\n"

            # Insert after the first paragraph
            template["html_content"] = template["html_content"].replace(
                "</p>", f"</p>{hook_html}", 1
            )
            template["text_content"] = template["text_content"].replace(
                "\n\n", f"\n\n{hook_text}", 1
            )

    return template


# Template validation and testing
def validate_rv_template(template: dict) -> list:
    """Validate RV template has required fields and placeholders"""
    errors = []

    required_fields = ["subject", "html_content", "text_content", "delay_days"]
    for field in required_fields:
        if field not in template:
            errors.append(f"Missing required field: {field}")

    # Check for required placeholders
    required_placeholders = ["{first_name}", "{business_name}"]
    for placeholder in required_placeholders:
        if placeholder not in template.get(
            "subject", ""
        ) and placeholder not in template.get("html_content", ""):
            errors.append(f"Missing required placeholder: {placeholder}")

    return errors


if __name__ == "__main__":
    # Test template validation
    print("Validating RV Organization Templates...")

    for template_key, template in RV_ORGANIZATION_TEMPLATES.items():
        errors = validate_rv_template(template)
        if errors:
            print(f"❌ {template_key}: {', '.join(errors)}")
        else:
            print(f"✅ {template_key}: Valid")

    # Test personalization
    print("\nTesting RV personalization...")
    test_data = {
        "first_name": "Mike",
        "business_name": "Mountain RV Sales",
        "city": "Bozeman",
        "google_rating": "4.9",
    }

    try:
        personalized = get_personalized_rv_template("rv_intro", "rv_dealer", test_data)
        print("✅ RV Personalization: Success")
    except Exception as e:
        print(f"❌ RV Personalization: {e}")
