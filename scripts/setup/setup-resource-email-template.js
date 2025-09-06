const sgClient = require("@sendgrid/client");
require("dotenv").config();

// Set API key
sgClient.setApiKey(process.env.SendGrid_API_Key);

const resourceEmailTemplate = {
  name: "Resource Download Delivery - All Guides",
  subject: "{{name}}, Your Montana Home Organization Guides Are Here! 📥",
  html: `
  <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #333;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2D5A87 0%, #1e3a5f 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Your Free Organization Guides!</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Everything you need to organize your Montana home</p>
    </div>
    
    <!-- Personal Message -->
    <div style="padding: 30px 20px;">
      <h2 style="color: #2D5A87; font-size: 24px; margin-bottom: 20px;">Hi {{name}}! 👋</h2>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Thanks for your interest in getting organized! I'm excited to share these Montana-specific guides with you.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        As someone who's helped over 100 Montana families transform their homes, I know that our unique lifestyle (hello, seasonal gear!) requires special organization strategies. These guides are packed with practical tips that actually work in Big Sky Country.
      </p>
    </div>
    
    <!-- Download Buttons -->
    <div style="background: #f8f9fa; padding: 30px 20px; margin: 0 20px; border-radius: 10px;">
      <h3 style="color: #2D5A87; text-align: center; margin-bottom: 25px; font-size: 20px;">📥 Download Your Guides</h3>
      
      <div style="text-align: center;">
        <!-- Kitchen Guide -->
        <div style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 8px; border: 2px solid #2D5A87;">
          <h4 style="color: #2D5A87; margin: 0 0 10px 0;">🍳 Kitchen Organization Essentials</h4>
          <p style="margin: 0 0 15px 0; color: #666;">Pantry systems, cabinet optimization, and counter clutter solutions</p>
          <a href="{{downloadLinks.kitchenGuide}}" style="background: #2D5A87; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Download Kitchen Guide</a>
        </div>
        
        <!-- Seasonal Guide -->
        <div style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 8px; border: 2px solid #2D5A87;">
          <h4 style="color: #2D5A87; margin: 0 0 10px 0;">🏔️ Montana Seasonal Gear Organization</h4>
          <p style="margin: 0 0 15px 0; color: #666;">Ski equipment, camping gear, hunting supplies, and seasonal rotation systems</p>
          <a href="{{downloadLinks.seasonalGuide}}" style="background: #2D5A87; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Download Seasonal Guide</a>
        </div>
        
        <!-- Daily Routine -->
        <div style="margin-bottom: 20px; padding: 20px; background: white; border-radius: 8px; border: 2px solid #2D5A87;">
          <h4 style="color: #2D5A87; margin: 0 0 10px 0;">✅ Daily Maintenance Routine</h4>
          <p style="margin: 0 0 15px 0; color: #666;">Simple habits to keep your organized home functioning perfectly</p>
          <a href="{{downloadLinks.dailyRoutine}}" style="background: #2D5A87; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Download Daily Routine</a>
        </div>
      </div>
    </div>
    
    <!-- Next Steps -->
    <div style="padding: 30px 20px;">
      <h3 style="color: #2D5A87; font-size: 20px; margin-bottom: 20px;">What's Next?</h3>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        These guides will get you started, but I know that sometimes you need a personalized approach. Every Montana home is different!
      </p>
      
      <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="color: #2D5A87; margin: 0 0 15px 0;">🎯 Ready for Personal Help?</h4>
        <p style="margin: 0 0 15px 0; color: #555;">I offer free 30-minute consultations where we'll:</p>
        <ul style="color: #555; padding-left: 20px;">
          <li>Assess your specific challenges</li>
          <li>Create a personalized organization plan</li>
          <li>Discuss timeline and investment</li>
          <li>Answer all your questions</li>
        </ul>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://calendly.com/chanelnbasolo/30min" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">Schedule My Free Consultation</a>
        </div>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        <strong>Questions about the guides?</strong> Just reply to this email - I personally read every message and love helping with specific challenges!
      </p>
    </div>
    
    <!-- Social Proof -->
    <div style="background: #f8f9fa; padding: 25px 20px; margin: 0 20px 20px 20px; border-radius: 8px; border-left: 4px solid #28a745;">
      <p style="font-style: italic; color: #555; margin: 0 0 10px 0; font-size: 14px;">
        "Chanel's seasonal guide was exactly what we needed! Our garage went from chaos to perfectly organized in one weekend. The Montana-specific tips made all the difference."
      </p>
      <p style="margin: 0; color: #2D5A87; font-weight: 600; font-size: 14px;">— Sarah M., Missoula</p>
    </div>
    
    <!-- Footer -->
    <div style="border-top: 2px solid #e9ecef; padding: 20px; text-align: center; color: #666;">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: #2D5A87;">Chanel @ Clutter Free Spaces</p>
      <p style="margin: 0 0 5px 0; font-size: 14px;">📞 (406) 551-3364</p>
      <p style="margin: 0 0 5px 0; font-size: 14px;">📧 contact@clutter-free-spaces.com</p>
      <p style="margin: 0 0 15px 0; font-size: 14px;">🌐 www.clutter-free-spaces.com</p>
      <p style="margin: 0; font-size: 12px; color: #999;">Proudly serving Missoula, Hamilton, Stevensville, and all of Western Montana</p>
    </div>
  </div>`,
};

async function createResourceTemplate() {
  console.log("Creating SendGrid resource delivery template...\n");

  try {
    // Create template
    const templateRequest = {
      url: "/v3/templates",
      method: "POST",
      body: {
        name: resourceEmailTemplate.name,
        generation: "dynamic",
      },
    };

    const [templateResponse] = await sgClient.request(templateRequest);
    const templateId = templateResponse.body.id;

    console.log(
      `✅ Created template: ${resourceEmailTemplate.name} (ID: ${templateId})`,
    );

    // Create version with content
    const versionRequest = {
      url: `/v3/templates/${templateId}/versions`,
      method: "POST",
      body: {
        template_id: templateId,
        active: 1,
        name: `${resourceEmailTemplate.name} - Version 1`,
        html_content: resourceEmailTemplate.html,
        subject: resourceEmailTemplate.subject,
        generate_plain_content: true,
      },
    };

    await sgClient.request(versionRequest);
    console.log(`   📝 Added content version\n`);

    console.log(`🎉 Resource template created successfully!`);
    console.log(`📋 Template ID: ${templateId}`);
    console.log(`💡 Update your API server with this template ID:\n`);
    console.log(`const templateId = "d-${templateId}";`);

    return templateId;
  } catch (error) {
    console.error(
      `❌ Error creating resource template:`,
      error.response?.body || error.message,
    );
    throw error;
  }
}

// Run the script
createResourceTemplate()
  .then((templateId) => {
    console.log(`\n🚀 Ready to use! Template ID: d-${templateId}`);
  })
  .catch((error) => {
    console.error("\n❌ Failed to create template:", error);
    process.exit(1);
  });
