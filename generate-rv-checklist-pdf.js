const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Color scheme
const colors = {
  primary: "#2C5F66", // Deep teal
  secondary: "#E17B47", // Warm orange
  accent: "#87CEEB", // Light blue
  text: "#333333", // Charcoal gray
  lightGray: "#F5F5F5",
  white: "#FFFFFF",
};

function generateRVChecklistPDF() {
  console.log("📄 Generating RV Organization Checklist PDF...");

  // Create a new PDF document
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: 54, // 0.75 inch
      bottom: 54,
      left: 54,
      right: 54,
    },
  });

  const outputPath = path.join(
    __dirname,
    "downloads",
    "rv-organization-checklist.pdf",
  );
  doc.pipe(fs.createWriteStream(outputPath));

  // Page dimensions
  const pageWidth = doc.page.width;
  const contentWidth =
    pageWidth - doc.page.margins.left - doc.page.margins.right;

  // Header
  addHeader(doc, contentWidth);

  // Introduction
  addIntroduction(doc, contentWidth);

  // Checklist sections
  addPreTripChecklist(doc, contentWidth);
  addKitchenSection(doc, contentWidth);
  addBedroomSection(doc, contentWidth);
  addStorageSection(doc, contentWidth);
  addWeightSection(doc, contentWidth);
  addSeasonalSection(doc, contentWidth);

  // New page for tips and contact
  doc.addPage();
  addMontanaTips(doc, contentWidth);
  addContactInfo(doc, contentWidth);
  addFooter(doc, contentWidth);

  // Finalize the PDF
  doc.end();

  console.log(`✅ PDF generated successfully: ${outputPath}`);
  return outputPath;
}

function addHeader(doc, contentWidth) {
  // Logo space and company name
  doc
    .fillColor(colors.primary)
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("CLUTTER FREE SPACES", doc.page.margins.left, 40);

  doc
    .fillColor(colors.secondary)
    .fontSize(12)
    .font("Helvetica")
    .text(
      "Transforming RV Living Through Smart Organization",
      doc.page.margins.left,
      70,
    );

  // Main title
  doc
    .fillColor(colors.primary)
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(
      "The Ultimate Montana RV Organization Checklist",
      doc.page.margins.left,
      110,
      {
        width: contentWidth,
        align: "center",
      },
    );

  doc
    .fillColor(colors.text)
    .fontSize(14)
    .font("Helvetica-Oblique")
    .text(
      "Your Complete Guide to Clutter-Free RV Living in Big Sky Country",
      doc.page.margins.left,
      140,
      {
        width: contentWidth,
        align: "center",
      },
    );

  // Horizontal line
  doc
    .strokeColor(colors.accent)
    .lineWidth(2)
    .moveTo(doc.page.margins.left, 170)
    .lineTo(doc.page.margins.left + contentWidth, 170)
    .stroke();

  doc.y = 190;
}

function addIntroduction(doc, contentWidth) {
  doc
    .fillColor(colors.text)
    .fontSize(11)
    .font("Helvetica")
    .text(
      "Print this checklist and keep it handy in your RV. Check off items as you complete them, and refer back regularly to maintain your organized space. Montana's diverse seasons and terrain present unique challenges - this checklist addresses them all.",
      doc.page.margins.left,
      doc.y,
      {
        width: contentWidth,
        align: "justify",
      },
    );

  doc.y += 20;
}

function addSection(doc, contentWidth, title, icon, items) {
  // Check if we need a new page
  if (doc.y > doc.page.height - 200) {
    doc.addPage();
  }

  // Section header
  doc
    .fillColor(colors.primary)
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(`${icon} ${title}`, doc.page.margins.left, doc.y);

  doc.y += 25;

  // Items
  items.forEach((item) => {
    if (doc.y > doc.page.height - 100) {
      doc.addPage();
    }

    // Checkbox
    const checkboxY = doc.y;
    doc
      .rect(doc.page.margins.left, checkboxY, 12, 12)
      .strokeColor(colors.text)
      .lineWidth(1)
      .stroke();

    // Item text
    doc
      .fillColor(colors.text)
      .fontSize(10)
      .font("Helvetica")
      .text(item, doc.page.margins.left + 20, checkboxY + 1, {
        width: contentWidth - 20,
        height: 20,
      });

    doc.y = checkboxY + 18;
  });

  doc.y += 10;
}

function addPreTripChecklist(doc, contentWidth) {
  const items = [
    "Emergency kit secured and accessible - Place in consistent location everyone knows",
    "Fire extinguisher unobstructed - Clear 3-foot radius around extinguisher",
    "First aid kit stocked and visible - Check expiration dates on medications",
    "Flashlights/headlamps in designated spots - One per sleeping area plus main living space",
    "Heavy items stored low and centered - Batteries, tools, canned goods in lower compartments",
    "Weight distributed evenly side-to-side - Use bathroom scale to check individual tire weights",
    "All storage compartments latched and locked - Double-check exterior bays and interior cabinets",
    "Loose items secured for mountain driving - Montana's steep grades demand extra security",
    "Winter gear accessible but stowed - Montana weather changes quickly",
    "Moisture absorbers placed strategically - Prevent condensation in closed storage areas",
    "Ventilation systems clear - Remove any items blocking vents or fans",
    "Seasonal clothing rotated - Store out-of-season items in hard-to-reach areas",
  ];

  addSection(doc, contentWidth, "PRE-TRIP CHECKLIST (12 ITEMS)", "🚐", items);
}

function addKitchenSection(doc, contentWidth) {
  const items = [
    "Magnetic spice jars on fridge/range hood - Save cabinet space while keeping spices accessible",
    "Nesting cookware with removable handles - Essential for limited cabinet depth",
    "Collapsible measuring cups and mixing bowls - Expand storage by 40%",
    "Over-sink cutting board installed - Creates extra counter space when needed",
    "Drawer dividers for utensils - Prevent sliding during travel on mountain roads",
    "Can goods secured with retention bars - Montana's rough roads require extra security",
    "Designated coffee/tea station - Morning routines need consistency in cold weather",
    "Pantry items in clear, airtight containers - Prevent pests and moisture",
  ];

  addSection(doc, contentWidth, "KITCHEN ORGANIZATION (8 ITEMS)", "🍳", items);
}

function addBedroomSection(doc, contentWidth) {
  const items = [
    "Wardrobe organized by frequency of use - Daily items at eye level, seasonal items up high",
    "Under-bed storage maximized - Use vacuum bags for bulky winter clothes",
    "Shoe organization system - Muddy hiking boots need designated drying area",
    "Personal hygiene items in caddies - Easy to grab for campground facilities",
    "Multi-purpose furniture utilized - Ottomans with storage, fold-down tables",
    "Electronics organized with cable management - Prevent tangles during setup",
    "Reading materials in accessible rack - Montana's long winter evenings call for books",
    "Games and activities stored compactly - Weather delays happen - be prepared",
    "Throw blankets easily accessible - Mountain evenings get cold quickly",
  ];

  addSection(doc, contentWidth, "BEDROOM/LIVING SPACE (9 ITEMS)", "🛏️", items);
}

function addStorageSection(doc, contentWidth) {
  const items = [
    "Heavy items in front storage bay - Improve tongue weight and stability",
    "Outdoor gear in easily accessible bay - Camping chairs, grills, recreation equipment",
    "Tools and maintenance supplies organized - Use clear bins with detailed labels",
    "Water and sewer equipment separate - Prevent cross-contamination",
    "Moisture protection in all bays - Montana's snow and rain require extra vigilance",
    "Secure latching system checked - Vibration from rough roads can loosen latches",
    "Bay lighting installed - Early mornings and late evenings are common in Montana",
  ];

  addSection(
    doc,
    contentWidth,
    "STORAGE BAY MANAGEMENT (7 ITEMS)",
    "🗃️",
    items,
  );
}

function addWeightSection(doc, contentWidth) {
  const items = [
    "Weigh RV at certified scale - Find scales at truck stops along I-90 and I-15",
    "Document weight distribution - Keep record of successful loading configurations",
    "Water tanks only 1/3 full when traveling - Reduce weight and improve handling",
    "Propane tanks properly secured - Montana law requires specific mounting",
    "Side-to-side weight within 100 lbs - Use individual wheel scales for precision",
    "Tongue weight 10-15% of trailer weight - Critical for stability on mountain passes",
  ];

  addSection(
    doc,
    contentWidth,
    "WEIGHT DISTRIBUTION GUIDE (6 ITEMS)",
    "⚖️",
    items,
  );
}

function addSeasonalSection(doc, contentWidth) {
  const items = [
    "Spring: Winter gear stored, summer gear accessible - Rotate heavy coats for jackets",
    "Summer: Cooling supplies prioritized - Fans, extra water, sun protection reachable",
    "Fall: Heating supplies checked and accessible - Extra blankets, heaters, winter clothes",
    "Winter: RV winterization supplies organized - Antifreeze, pipe insulation, skirting",
    "Year-Round: Quarterly deep organization check - Rotate items, check for damage",
  ];

  addSection(
    doc,
    contentWidth,
    "SEASONAL ROTATION SCHEDULE (5 ITEMS)",
    "📅",
    items,
  );
}

function addMontanaTips(doc, contentWidth) {
  // Montana-specific tips section
  doc
    .fillColor(colors.primary)
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("💡 MONTANA-SPECIFIC TIPS", doc.page.margins.left, doc.y);

  doc.y += 25;

  const tips = [
    {
      title: "High Altitude Considerations",
      items: [
        "• Propane appliances may need adjustment above 3,000 feet",
        "• Keep extra water - dehydration happens faster at elevation",
        "• Store altitude sickness remedies in first aid kit",
      ],
    },
    {
      title: "Weather Preparedness",
      items: [
        "• Always have 72 hours of supplies accessible",
        "• Keep ice scrapers and snow brushes handy year-round",
        "• Store extra batteries - cold weather drains them faster",
      ],
    },
    {
      title: "Wildlife Safety",
      items: [
        "• Secure all food items in hard containers",
        "• Keep bear spray accessible when camping",
        "• Store scented items (soap, toothpaste) in sealed containers",
      ],
    },
  ];

  tips.forEach((tipSection) => {
    if (doc.y > doc.page.height - 150) {
      doc.addPage();
    }

    doc
      .fillColor(colors.secondary)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(tipSection.title, doc.page.margins.left, doc.y);

    doc.y += 15;

    tipSection.items.forEach((item) => {
      doc
        .fillColor(colors.text)
        .fontSize(10)
        .font("Helvetica")
        .text(item, doc.page.margins.left, doc.y);
      doc.y += 12;
    });

    doc.y += 5;
  });
}

function addContactInfo(doc, contentWidth) {
  // Call to action section
  doc
    .fillColor(colors.primary)
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("🎯 READY FOR PROFESSIONAL HELP?", doc.page.margins.left, doc.y + 20);

  doc.y += 45;

  doc
    .fillColor(colors.text)
    .fontSize(11)
    .font("Helvetica")
    .text(
      "Take your RV organization to the next level with a personalized consultation. Book your FREE 30-minute assessment to discover your biggest organization opportunities.",
      doc.page.margins.left,
      doc.y,
      {
        width: contentWidth,
        align: "justify",
      },
    );

  doc.y += 30;

  // Contact information
  doc
    .fillColor(colors.primary)
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("📞 CONTACT CLUTTER FREE SPACES", doc.page.margins.left, doc.y);

  doc.y += 20;

  const contactInfo = [
    "🌐 Website: ClutterFreeSpaces.com",
    "📧 Email: hello@clutterfreeSpaces.com",
    "📱 Phone: (406) 555-0123",
    "📅 Book Consultation: ClutterFreeSpaces.com/consultation",
  ];

  contactInfo.forEach((info) => {
    doc
      .fillColor(colors.text)
      .fontSize(11)
      .font("Helvetica")
      .text(info, doc.page.margins.left, doc.y);
    doc.y += 15;
  });

  doc.y += 10;

  // Social media
  doc
    .fillColor(colors.secondary)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(
      "Follow us for weekly organization tips:",
      doc.page.margins.left,
      doc.y,
    );

  doc.y += 15;

  const social = [
    "🔵 Facebook: @ClutterFreeSpaces",
    "📸 Instagram: @ClutterFreeSpaces",
    "📌 Pinterest: @ClutterFreeSpaces",
  ];

  social.forEach((platform) => {
    doc
      .fillColor(colors.text)
      .fontSize(10)
      .font("Helvetica")
      .text(platform, doc.page.margins.left, doc.y);
    doc.y += 12;
  });
}

function addFooter(doc, contentWidth) {
  // Footer
  const footerY = doc.page.height - 40;

  doc
    .fillColor(colors.accent)
    .lineWidth(1)
    .moveTo(doc.page.margins.left, footerY - 10)
    .lineTo(doc.page.margins.left + contentWidth, footerY - 10)
    .stroke();

  doc
    .fillColor(colors.text)
    .fontSize(9)
    .font("Helvetica")
    .text(
      "© 2024 Clutter Free Spaces. All rights reserved. Montana RV Edition v1.0",
      doc.page.margins.left,
      footerY,
      {
        width: contentWidth,
        align: "center",
      },
    );
}

// Generate the PDF
if (require.main === module) {
  generateRVChecklistPDF();
}

module.exports = { generateRVChecklistPDF };
