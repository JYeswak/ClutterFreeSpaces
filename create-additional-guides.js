#!/usr/bin/env node

/**
 * Create additional organization guide PDFs
 * Referenced in the organization style quiz
 */

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

// Ensure downloads directory exists
const downloadsDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

const guides = {
  detailed: {
    title: "Detailed Organizer Guide",
    filename: "detailed-organizer-guide.pdf",
    description: "Comprehensive step-by-step RV organization system",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 3px solid #2c5530; padding-bottom: 30px; margin-bottom: 40px;">
          <h1 style="color: #2c5530; font-size: 2.5rem; margin-bottom: 15px;">
            🗂️ The Detailed Organizer's RV Guide
          </h1>
          <p style="font-size: 1.2rem; color: #666;">
            Step-by-step systems for systematic RV organization
          </p>
          <p style="color: #4a7c59; font-weight: bold;">Montana-tested solutions for detail-oriented RVers</p>
        </div>

        <div style="background: #f0f7f1; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #2c5530; margin-bottom: 15px;">🎯 Your Systematic Approach</h2>
          <p>You prefer detailed plans and comprehensive systems. This guide provides the structured approach you need to organize your RV methodically and maintain it effortlessly.</p>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          📋 Phase 1: Complete Assessment & Planning
        </h2>
        <div style="background: white; padding: 20px; border-left: 4px solid #4a7c59; margin-bottom: 20px;">
          <h3 style="color: #2c5530;">Step 1: Comprehensive RV Audit</h3>
          <ul style="margin: 15px 0;">
            <li>Create detailed floor plan with measurements</li>
            <li>Photograph every storage area from 3 angles</li>
            <li>Inventory all items with categorization system</li>
            <li>Document current pain points and usage patterns</li>
            <li>Assess seasonal vs. permanent storage needs</li>
          </ul>
        </div>

        <div style="background: white; padding: 20px; border-left: 4px solid #4a7c59; margin-bottom: 20px;">
          <h3 style="color: #2c5530;">Step 2: Master Plan Development</h3>
          <ul style="margin: 15px 0;">
            <li>Design zone-based organization system</li>
            <li>Create detailed item-to-location mapping</li>
            <li>Establish category hierarchy and labeling system</li>
            <li>Plan seasonal rotation schedules</li>
            <li>Design maintenance and review protocols</li>
          </ul>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          🔨 Phase 2: Systematic Implementation
        </h2>
        <div style="background: white; padding: 20px; border-left: 4px solid #4a7c59; margin-bottom: 20px;">
          <h3 style="color: #2c5530;">Kitchen Organization System</h3>
          <p><strong>Zone 1: Food Preparation</strong></p>
          <ul style="margin: 10px 0;">
            <li>Cutting boards: Over-sink expandable + compact stored sets</li>
            <li>Knives: Magnetic strips or in-drawer knife blocks</li>
            <li>Small appliances: Dedicated cabinet with power strips</li>
          </ul>
          <p><strong>Zone 2: Food Storage</strong></p>
          <ul style="margin: 10px 0;">
            <li>Pantry: Clear stackable containers with detailed labeling</li>
            <li>Refrigerator: Compartment organization with expiration tracking</li>
            <li>Dry goods: Rotating inventory system with master list</li>
          </ul>
          <p><strong>Zone 3: Cleaning & Maintenance</strong></p>
          <ul style="margin: 10px 0;">
            <li>Under-sink: Tiered organizers for supplies</li>
            <li>Dish storage: Nested sets with protective dividers</li>
            <li>Cleaning schedule: Posted weekly/monthly task lists</li>
          </ul>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          📊 Phase 3: Monitoring & Optimization
        </h2>
        <div style="background: white; padding: 20px; border-left: 4px solid #4a7c59; margin-bottom: 20px;">
          <h3 style="color: #2c5530;">Tracking Systems</h3>
          <ul style="margin: 15px 0;">
            <li><strong>Weekly Reviews:</strong> 30-minute system check and adjustments</li>
            <li><strong>Monthly Audits:</strong> Comprehensive organization assessment</li>
            <li><strong>Seasonal Overhauls:</strong> Complete system updates and improvements</li>
            <li><strong>Usage Tracking:</strong> Monitor which systems work best</li>
            <li><strong>Continuous Improvement:</strong> Document and refine successful strategies</li>
          </ul>
        </div>

        <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin: 30px 0;">
          <h3 style="color: #2c5530; margin-bottom: 15px;">🏔️ Montana-Specific Considerations</h3>
          <ul>
            <li><strong>Altitude Changes:</strong> Pressure-resistant storage for sealed items</li>
            <li><strong>Temperature Swings:</strong> Climate-controlled sensitive storage</li>
            <li><strong>Wind Resistance:</strong> Secure latching systems for all compartments</li>
            <li><strong>Dust Protection:</strong> Sealed containers for electronics and textiles</li>
          </ul>
        </div>

        <div style="text-align: center; background: #2c5530; color: white; padding: 30px; border-radius: 10px; margin: 40px 0;">
          <h3 style="margin-bottom: 15px;">Ready for Personal Guidance?</h3>
          <p style="margin-bottom: 20px;">
            Get a custom organization plan designed specifically for your RV and travel style.
          </p>
          <p style="font-size: 1.2rem; font-weight: bold;">
            📅 Book Your 30-Minute Consultation<br>
            🔗 https://calendly.com/chanelnbasolo/30min
          </p>
        </div>

        <div style="text-align: center; border-top: 2px solid #e9ecef; padding-top: 20px; margin-top: 40px;">
          <p style="color: #666;">
            <strong>Chanel Basolo</strong><br>
            Montana RV Organization Expert<br>
            📞 (406) 285-1525 | 📧 contact@clutter-free-spaces.com<br>
            🌐 www.clutter-free-spaces.com
          </p>
        </div>
      </div>
    `,
  },

  visual: {
    title: "Visual Organizer Guide",
    filename: "visual-organizer-guide.pdf",
    description: "Color-coded, visual RV organization system",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 3px solid #2c5530; padding-bottom: 30px; margin-bottom: 40px;">
          <h1 style="color: #2c5530; font-size: 2.5rem; margin-bottom: 15px;">
            🎨 The Visual Organizer's RV Guide
          </h1>
          <p style="font-size: 1.2rem; color: #666;">
            Color-coded systems for visual learners
          </p>
          <p style="color: #4a7c59; font-weight: bold;">See everything at a glance - Montana style</p>
        </div>

        <div style="background: #fff3cd; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 5px solid #ffc107;">
          <h2 style="color: #856404; margin-bottom: 15px;">🌈 Your Visual Approach</h2>
          <p>You organize best when you can see everything. This guide uses color-coding, visual cues, and open storage solutions perfect for visual learners.</p>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          🏷️ Color-Coding Master System
        </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 30px;">
          <div style="background: #ff6b6b; color: white; padding: 15px; border-radius: 8px; flex: 1; min-width: 200px; text-align: center;">
            <strong>🔴 RED = Kitchen</strong><br>
            Food, cooking, dining
          </div>
          <div style="background: #4ecdc4; color: white; padding: 15px; border-radius: 8px; flex: 1; min-width: 200px; text-align: center;">
            <strong>🔵 BLUE = Bathroom</strong><br>
            Personal care, hygiene
          </div>
          <div style="background: #45b7d1; color: white; padding: 15px; border-radius: 8px; flex: 1; min-width: 200px; text-align: center;">
            <strong>🟡 YELLOW = Bedroom</strong><br>
            Clothing, sleep, personal
          </div>
          <div style="background: #96ceb4; color: white; padding: 15px; border-radius: 8px; flex: 1; min-width: 200px; text-align: center;">
            <strong>🟢 GREEN = Living</strong><br>
            Electronics, entertainment
          </div>
          <div style="background: #ffeaa7; color: #2d3436; padding: 15px; border-radius: 8px; flex: 1; min-width: 200px; text-align: center;">
            <strong>🟠 ORANGE = Maintenance</strong><br>
            Tools, RV care, repair
          </div>
          <div style="background: #dda0dd; color: white; padding: 15px; border-radius: 8px; flex: 1; min-width: 200px; text-align: center;">
            <strong>🟣 PURPLE = Outdoor</strong><br>
            Camping, recreation, gear
          </div>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          👀 Visual Storage Solutions
        </h2>
        <div style="background: white; padding: 20px; border-left: 4px solid #ff6b6b; margin-bottom: 20px;">
          <h3 style="color: #c0392b;">🔴 Kitchen Visual Systems</h3>
          <ul style="margin: 15px 0;">
            <li><strong>Open Shelving:</strong> Clear containers with red labels/lids</li>
            <li><strong>Magnetic Board:</strong> Red magnetic containers for spices</li>
            <li><strong>Glass Jars:</strong> See-through storage with red accent rings</li>
            <li><strong>Hanging Racks:</strong> Visible utensil storage with red hooks</li>
          </ul>
        </div>

        <div style="background: white; padding: 20px; border-left: 4px solid #45b7d1; margin-bottom: 20px;">
          <h3 style="color: #2980b9;">🟡 Bedroom Visual Organization</h3>
          <ul style="margin: 15px 0;">
            <li><strong>Open Cubbies:</strong> Folded clothes visible in yellow bins</li>
            <li><strong>Hanging Organizers:</strong> Clear pockets with yellow trim</li>
            <li><strong>Jewelry Displays:</strong> Visible storage on yellow backgrounds</li>
            <li><strong>Shoe Racks:</strong> Open designs with yellow labels</li>
          </ul>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          📸 Visual Management Tools
        </h2>
        <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #2c5530;">Photo Inventory System</h3>
          <ul style="margin: 15px 0;">
            <li><strong>Cabinet Photos:</strong> Inside-door photos showing ideal organization</li>
            <li><strong>Before/After:</strong> Progress tracking with visual comparisons</li>
            <li><strong>Quick Reference:</strong> Phone photos of where everything belongs</li>
            <li><strong>Seasonal Setup:</strong> Visual guides for different configurations</li>
          </ul>
        </div>

        <div style="background: #fff3cd; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #ffc107;">
          <h3 style="color: #856404; margin-bottom: 15px;">🏔️ Montana Visual Adaptations</h3>
          <ul>
            <li><strong>Bright Labels:</strong> High-contrast colors for low light conditions</li>
            <li><strong>Weather Icons:</strong> Visual indicators for seasonal items</li>
            <li><strong>Elevation Markers:</strong> Color codes for altitude-sensitive items</li>
            <li><strong>Wind Indicators:</strong> Visual cues for items that need securing</li>
          </ul>
        </div>

        <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin: 40px 0;">
          <h3 style="margin-bottom: 15px;">See Your RV's Full Potential!</h3>
          <p style="margin-bottom: 20px;">
            Get a visual organization plan designed specifically for your space and style.
          </p>
          <p style="font-size: 1.2rem; font-weight: bold;">
            📅 Book Your 30-Minute Consultation<br>
            🔗 https://calendly.com/chanelnbasolo/30min
          </p>
        </div>

        <div style="text-align: center; border-top: 2px solid #e9ecef; padding-top: 20px; margin-top: 40px;">
          <p style="color: #666;">
            <strong>Chanel Basolo</strong><br>
            Montana RV Organization Expert<br>
            📞 (406) 285-1525 | 📧 contact@clutter-free-spaces.com<br>
            🌐 www.clutter-free-spaces.com
          </p>
        </div>
      </div>
    `,
  },

  flexible: {
    title: "Flexible Organizer Guide",
    filename: "flexible-organizer-guide.pdf",
    description: "Adaptable RV organization for changing needs",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 3px solid #2c5530; padding-bottom: 30px; margin-bottom: 40px;">
          <h1 style="color: #2c5530; font-size: 2.5rem; margin-bottom: 15px;">
            🔄 The Flexible Organizer's RV Guide
          </h1>
          <p style="font-size: 1.2rem; color: #666;">
            Adaptable systems that change with your needs
          </p>
          <p style="color: #4a7c59; font-weight: bold;">Montana-ready modular organization</p>
        </div>

        <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 5px solid #2196f3;">
          <h2 style="color: #1565c0; margin-bottom: 15px;">🌊 Your Adaptable Approach</h2>
          <p>You need systems that can flex with your changing lifestyle. This guide provides modular solutions that adapt to different trips, seasons, and evolving needs.</p>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          🧩 Modular Organization Principles
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="color: #7b1fa2; margin-bottom: 10px;">🔧 Multi-Function Items</h3>
            <p>Everything serves 2+ purposes</p>
          </div>
          <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="color: #2e7d32; margin-bottom: 10px;">📦 Stackable Systems</h3>
            <p>Easy reconfiguration as needed</p>
          </div>
          <div style="background: #fff3e0; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="color: #ef6c00; margin-bottom: 10px;">🏷️ Removable Labels</h3>
            <p>Update organization without waste</p>
          </div>
          <div style="background: #e1f5fe; padding: 20px; border-radius: 10px; text-align: center;">
            <h3 style="color: #0277bd; margin-bottom: 10px;">🔄 Quick Transitions</h3>
            <p>15-minute reorganization max</p>
          </div>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          🎒 Flexible Storage Solutions
        </h2>
        <div style="background: white; padding: 20px; border-left: 4px solid #2196f3; margin-bottom: 20px;">
          <h3 style="color: #1565c0;">Kitchen Adaptability</h3>
          <ul style="margin: 15px 0;">
            <li><strong>Nesting Bowls:</strong> Expand for cooking, compact for storage</li>
            <li><strong>Magnetic Containers:</strong> Move anywhere metal surfaces exist</li>
            <li><strong>Collapsible Everything:</strong> Strainers, measuring cups, storage</li>
            <li><strong>Adjustable Dividers:</strong> Reconfigure drawer organization instantly</li>
            <li><strong>Rolling Carts:</strong> Mobile workspace that stores compactly</li>
          </ul>
        </div>

        <div style="background: white; padding: 20px; border-left: 4px solid #4caf50; margin-bottom: 20px;">
          <h3 style="color: #2e7d32;">Bedroom Flexibility</h3>
          <ul style="margin: 15px 0;">
            <li><strong>Vacuum Bags:</strong> Seasonal compression for clothes</li>
            <li><strong>Modular Cubes:</strong> Reconfigure storage layout easily</li>
            <li><strong>Under-bed Rolling Bins:</strong> Access without bed adjustment</li>
            <li><strong>Hanging Shoe Organizers:</strong> Multi-purpose pockets for anything</li>
            <li><strong>Collapsible Hampers:</strong> Laundry or general storage as needed</li>
          </ul>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          📅 Seasonal Adaptation Strategies
        </h2>
        <div style="background: #fff8e1; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #f57f17;">☀️ Summer Configuration</h3>
          <ul style="margin: 15px 0;">
            <li>Lightweight clothing in easy-access areas</li>
            <li>Outdoor gear prominently positioned</li>
            <li>Cooling items (fans, shade) readily available</li>
            <li>Water sports equipment in primary storage</li>
          </ul>
        </div>

        <div style="background: #e8eaf6; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #3f51b5;">❄️ Winter Configuration</h3>
          <ul style="margin: 15px 0;">
            <li>Insulation gear in accessible locations</li>
            <li>Indoor entertainment systems expanded</li>
            <li>Heating supplies and tools prominent</li>
            <li>Summer items compressed and stored</li>
          </ul>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          🔄 Quick Transition Protocols
        </h2>
        <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #2c5530;">15-Minute Reorganization System</h3>
          <ol style="margin: 15px 0;">
            <li><strong>Minutes 1-3:</strong> Remove everything from target area</li>
            <li><strong>Minutes 4-6:</strong> Clean and assess new needs</li>
            <li><strong>Minutes 7-12:</strong> Reconfigure storage solutions</li>
            <li><strong>Minutes 13-15:</strong> Replace items in new organization</li>
          </ol>
        </div>

        <div style="background: #e3f2fd; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #2196f3;">
          <h3 style="color: #1565c0; margin-bottom: 15px;">🏔️ Montana Flexibility Needs</h3>
          <ul>
            <li><strong>Weather Adaptability:</strong> Quick changes for sudden weather</li>
            <li><strong>Altitude Adjustments:</strong> Reorganize for elevation changes</li>
            <li><strong>Season Flexibility:</strong> Rapid transitions for Montana's short seasons</li>
            <li><strong>Activity Changes:</strong> Hiking to skiing configuration shifts</li>
          </ul>
        </div>

        <div style="text-align: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; border-radius: 10px; margin: 40px 0;">
          <h3 style="margin-bottom: 15px;">Adapt Your Space Perfectly!</h3>
          <p style="margin-bottom: 20px;">
            Get flexible organization systems designed for your changing RV lifestyle.
          </p>
          <p style="font-size: 1.2rem; font-weight: bold;">
            📅 Book Your 30-Minute Consultation<br>
            🔗 https://calendly.com/chanelnbasolo/30min
          </p>
        </div>

        <div style="text-align: center; border-top: 2px solid #e9ecef; padding-top: 20px; margin-top: 40px;">
          <p style="color: #666;">
            <strong>Chanel Basolo</strong><br>
            Montana RV Organization Expert<br>
            📞 (406) 285-1525 | 📧 contact@clutter-free-spaces.com<br>
            🌐 www.clutter-free-spaces.com
          </p>
        </div>
      </div>
    `,
  },

  simple: {
    title: "Simple Organizer Guide",
    filename: "simple-organizer-guide.pdf",
    description: "Easy, minimal RV organization solutions",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 3px solid #2c5530; padding-bottom: 30px; margin-bottom: 40px;">
          <h1 style="color: #2c5530; font-size: 2.5rem; margin-bottom: 15px;">
            ✨ The Simple Organizer's RV Guide
          </h1>
          <p style="font-size: 1.2rem; color: #666;">
            Easy solutions that just work
          </p>
          <p style="color: #4a7c59; font-weight: bold;">Montana-simple organization that sticks</p>
        </div>

        <div style="background: #f0f8f0; padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 5px solid #4caf50;">
          <h2 style="color: #2e7d32; margin-bottom: 15px;">🌟 Your Simple Approach</h2>
          <p>You want organization that's effortless to maintain. This guide focuses on the essentials - simple systems that work without constant attention.</p>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          🎯 The 80/20 Organization Rule
        </h2>
        <div style="background: white; padding: 20px; border-left: 4px solid #4caf50; margin-bottom: 20px;">
          <p style="font-size: 1.1rem; margin-bottom: 15px;"><strong>Focus on the 20% of organization that solves 80% of your problems.</strong></p>
          <ul style="margin: 15px 0;">
            <li><strong>Daily Items:</strong> Only organize what you use every day</li>
            <li><strong>One-Touch Rule:</strong> Put things away in one movement</li>
            <li><strong>Visible Storage:</strong> If you can't see it, you'll forget it</li>
            <li><strong>Minimal Categories:</strong> 5 categories max per area</li>
          </ul>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          🏠 Simple Room-by-Room Solutions
        </h2>
        <div style="background: #fff3e0; padding: 20px; border-left: 4px solid #ff9800; margin-bottom: 20px;">
          <h3 style="color: #ef6c00;">Kitchen - 5 Simple Systems</h3>
          <ol style="margin: 15px 0;">
            <li><strong>One-Basket Meals:</strong> All ingredients for common meals in single containers</li>
            <li><strong>Magnetic Strip:</strong> Knives and metal utensils on fridge side</li>
            <li><strong>Over-Sink Board:</strong> Cutting board that extends counter space</li>
            <li><strong>Clear Containers:</strong> See what you have, no labeling needed</li>
            <li><strong>Single Dish Set:</strong> Service for 4 max - less washing, less storage</li>
          </ol>
        </div>

        <div style="background: #e1f5fe; padding: 20px; border-left: 4px solid #03a9f4; margin-bottom: 20px;">
          <h3 style="color: #0277bd;">Bedroom - 3 Simple Systems</h3>
          <ol style="margin: 15px 0;">
            <li><strong>One-Week Wardrobe:</strong> 7 outfits max in RV, rest stored elsewhere</li>
            <li><strong>Dirty Clothes Bag:</strong> One mesh bag, wash when full</li>
            <li><strong>Bedside Basket:</strong> Everything you need within arm's reach</li>
          </ol>
        </div>

        <div style="background: #fce4ec; padding: 20px; border-left: 4px solid #e91e63; margin-bottom: 20px;">
          <h3 style="color: #c2185b;">Bathroom - 2 Simple Systems</h3>
          <ol style="margin: 15px 0;">
            <li><strong>Shower Caddy:</strong> All toiletries in one portable container</li>
            <li><strong>Medicine Bag:</strong> All health items in one zippered pouch</li>
          </ol>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          ⏰ 5-Minute Daily Maintenance
        </h2>
        <div style="background: #e8f5e8; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #2c5530;">Morning Routine (2 minutes)</h3>
          <ul style="margin: 10px 0;">
            <li>Make bed and clear nightstand</li>
            <li>Put away any items from yesterday</li>
          </ul>
          
          <h3 style="color: #2c5530;">Evening Routine (3 minutes)</h3>
          <ul style="margin: 10px 0;">
            <li>Clear kitchen counter (1 minute)</li>
            <li>Put away daily items (1 minute)</li>
            <li>Set up tomorrow's essentials (1 minute)</li>
          </ul>
        </div>

        <h2 style="color: #2c5530; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin: 30px 0 20px 0;">
          🛍️ Simple Shopping List
        </h2>
        <div style="background: #fff; padding: 20px; border: 2px solid #e9ecef; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #2c5530;">Essential Organization Items ($50 total)</h3>
          <ul style="margin: 15px 0;">
            <li><strong>Command Strips ($10):</strong> Hooks and hangers for walls</li>
            <li><strong>Clear Shoe Boxes ($15):</strong> Stackable see-through storage</li>
            <li><strong>Mesh Laundry Bag ($5):</strong> Dirty clothes and general storage</li>
            <li><strong>Over-Sink Cutting Board ($15):</strong> Extend counter space</li>
            <li><strong>Shower Caddy ($5):</strong> Portable bathroom organization</li>
          </ul>
        </div>

        <div style="background: #f0f8f0; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 5px solid #4caf50;">
          <h3 style="color: #2e7d32; margin-bottom: 15px;">🏔️ Montana Keep-It-Simple Rules</h3>
          <ul>
            <li><strong>Weather Ready:</strong> Keep rain gear and warm clothes accessible</li>
            <li><strong>Altitude Simple:</strong> Use containers that don't pop open</li>
            <li><strong>Wind Secure:</strong> Everything has a secure storage spot</li>
            <li><strong>Dust Protected:</strong> Keep essentials in closed containers</li>
          </ul>
        </div>

        <div style="background: #fffde7; padding: 25px; border-radius: 10px; margin-bottom: 20px;">
          <h3 style="color: #f57f17;">🚫 What NOT to Organize</h3>
          <p style="margin-bottom: 15px;"><strong>Don't waste time on these in your RV:</strong></p>
          <ul>
            <li>Items you use less than once per month</li>
            <li>Detailed labeling systems (use clear containers instead)</li>
            <li>Complex seasonal rotations</li>
            <li>Perfectly matched container sets</li>
            <li>Organizing items you could just get rid of</li>
          </ul>
        </div>

        <div style="text-align: center; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 30px; border-radius: 10px; margin: 40px 0;">
          <h3 style="margin-bottom: 15px;">Keep It Simple & Effective!</h3>
          <p style="margin-bottom: 20px;">
            Get personalized simple systems that actually work for your RV lifestyle.
          </p>
          <p style="font-size: 1.2rem; font-weight: bold;">
            📅 Book Your 30-Minute Consultation<br>
            🔗 https://calendly.com/chanelnbasolo/30min
          </p>
        </div>

        <div style="text-align: center; border-top: 2px solid #e9ecef; padding-top: 20px; margin-top: 40px;">
          <p style="color: #666;">
            <strong>Chanel Basolo</strong><br>
            Montana RV Organization Expert<br>
            📞 (406) 285-1525 | 📧 contact@clutter-free-spaces.com<br>
            🌐 www.clutter-free-spaces.com
          </p>
        </div>
      </div>
    `,
  },
};

async function createGuide(guideKey, guideData) {
  const outputPath = path.join(downloadsDir, guideData.filename);

  console.log(`📄 Creating ${guideData.title}...`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set content and create PDF
  await page.setContent(guideData.content);
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "0.5in",
      right: "0.5in",
      bottom: "0.5in",
      left: "0.5in",
    },
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(
    `✅ Created ${guideData.filename} (${Math.round(stats.size / 1024)}KB)`,
  );

  return {
    filename: guideData.filename,
    title: guideData.title,
    size: stats.size,
    path: outputPath,
  };
}

async function createAllGuides() {
  console.log("📚 Creating Additional Organization Guides");
  console.log("=========================================");
  console.log("Creating style-specific guides referenced in quiz...\n");

  const results = [];

  for (const [key, guide] of Object.entries(guides)) {
    try {
      const result = await createGuide(key, guide);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to create ${guide.title}:`, error.message);
    }
  }

  console.log("\n📊 GUIDE CREATION SUMMARY:");
  console.log("==========================");
  console.log(
    `✅ Created: ${results.length}/${Object.keys(guides).length} guides`,
  );
  console.log(`📁 Location: ${downloadsDir}\n`);

  results.forEach((result) => {
    console.log(`📄 ${result.title}`);
    console.log(`   📁 ${result.filename}`);
    console.log(`   📏 ${Math.round(result.size / 1024)}KB\n`);
  });

  console.log("🎉 All guides created and ready for download!");
  console.log("These PDFs are now available via the organization quiz.");

  return results;
}

// Run if called directly
if (require.main === module) {
  createAllGuides().catch(console.error);
}

module.exports = { createAllGuides };
