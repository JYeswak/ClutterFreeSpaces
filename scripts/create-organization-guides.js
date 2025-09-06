const sgClient = require("@sendgrid/client");
require("dotenv").config();

sgClient.setApiKey(process.env.SendGrid_API_Key);

const guideTemplates = {
  detailed: {
    name: "Detailed Organizer Guide Template",
    subject: "Your Detailed Organizer Guide - Systems That Work Perfectly!",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>🎯 Your Detailed Organizer Guide</h1>
      
      <p>Hi {{name}},</p>
      
      <p>You're a <strong>Detailed Organizer</strong> - you love precise systems and logical organization! Here's your personalized guide:</p>
      
      <h2>🏷️ Your Organization Superpowers:</h2>
      <ul>
        <li>You create systems that work flawlessly long-term</li>
        <li>You love labels, lists, and logical categories</li>
        <li>You're willing to invest time upfront for perfect results</li>
        <li>You notice when things are out of place</li>
      </ul>
      
      <h2>📋 Perfect Systems For You:</h2>
      
      <h3>1. The Master Inventory System</h3>
      <ul>
        <li>Label everything with specific categories</li>
        <li>Keep digital inventory lists</li>
        <li>Use clear, uniform containers</li>
        <li>Create "home zones" for each item type</li>
      </ul>
      
      <h3>2. The Daily Maintenance Checklist</h3>
      <ul>
        <li>5-minute morning organization scan</li>
        <li>Evening "reset" routine (10 minutes)</li>
        <li>Weekly deep organization check</li>
        <li>Monthly system optimization</li>
      </ul>
      
      <h3>3. Your RV Organization Blueprint</h3>
      <ul>
        <li>Zone-based storage: cooking, sleeping, working, living</li>
        <li>Vertical space maximization with labeled shelving</li>
        <li>Weight distribution tracking system</li>
        <li>Seasonal rotation schedule</li>
      </ul>
      
      <h2>🛍️ Your Shopping List:</h2>
      <ul>
        <li>P-Touch label maker + extra tape</li>
        <li>Clear stackable storage bins (various sizes)</li>
        <li>Expandable drawer dividers</li>
        <li>Over-door shoe organizers</li>
        <li>Command hooks and strips</li>
      </ul>
      
      <h2>⚠️ Watch Out For These Traps:</h2>
      <ul>
        <li>Over-categorizing (too many small categories)</li>
        <li>Perfectionism paralysis</li>
        <li>Creating systems others can't maintain</li>
        <li>Spending too much time organizing vs. living</li>
      </ul>
      
      <div style="background: #E3F2FD; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>🎁 Special Bonus: Your Free 30-Minute Consultation</h3>
        <p>Let's create the perfect organization system for YOUR space!</p>
        <a href="https://calendly.com/chanelnbasolo/30min?utm_source=guide&utm_campaign=detailed" 
           style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
           Book My Free Consultation
        </a>
      </div>
      
      <p>Questions about implementing these systems? Just reply to this email - I personally read every message!</p>
      
      <p>Happy organizing!</p>
      <p>Chanel</p>
    </div>`,
  },

  visual: {
    name: "Visual Organizer Guide Template",
    subject: "Your Visual Organizer Guide - Beautiful & Functional Spaces!",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>👁️ Your Visual Organizer Guide</h1>
      
      <p>Hi {{name}},</p>
      
      <p>You're a <strong>Visual Organizer</strong> - you need to see your belongings to remember them! Here's your personalized guide:</p>
      
      <h2>✨ Your Organization Superpowers:</h2>
      <ul>
        <li>You create beautiful, Instagram-worthy spaces</li>
        <li>You remember where things are by seeing them</li>
        <li>You make organization look effortless and stylish</li>
        <li>You inspire others with your aesthetic sense</li>
      </ul>
      
      <h2>🏡 Perfect Systems For You:</h2>
      
      <h3>1. The Clear Container Method</h3>
      <ul>
        <li>Use clear bins for everything</li>
        <li>Glass jars for pantry items</li>
        <li>Mesh bags for laundry sorting</li>
        <li>Clear shoe boxes for accessories</li>
      </ul>
      
      <h3>2. The Open Display System</h3>
      <ul>
        <li>Open shelving for daily items</li>
        <li>Floating shelves for decor + function</li>
        <li>Pegboards for tools and crafts</li>
        <li>Baskets that look good empty or full</li>
      </ul>
      
      <h3>3. Your RV Visual Organization</h3>
      <ul>
        <li>Clear curtains instead of cabinet doors</li>
        <li>Magnetic spice jars on visible surfaces</li>
        <li>Mesh pockets on walls and doors</li>
        <li>Color-coded storage by category</li>
      </ul>
      
      <h2>🛍️ Your Shopping List:</h2>
      <ul>
        <li>Clear stackable drawers</li>
        <li>Glass storage jars</li>
        <li>Woven baskets (natural textures)</li>
        <li>Acrylic organizers</li>
        <li>LED strip lights for inside cabinets</li>
      </ul>
      
      <h2>⚠️ Watch Out For These Traps:</h2>
      <ul>
        <li>Buying containers before decluttering</li>
        <li>Choosing form over function</li>
        <li>Creating systems that look good but don't work</li>
        <li>Overwhelming yourself with too many visible items</li>
      </ul>
      
      <div style="background: #FCE4EC; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>🎁 Special Bonus: Your Free 30-Minute Consultation</h3>
        <p>Let's create a beautiful AND functional space together!</p>
        <a href="https://calendly.com/chanelnbasolo/30min?utm_source=guide&utm_campaign=visual" 
           style="background: #E91E63; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
           Book My Free Consultation
        </a>
      </div>
      
      <p>Want to see your space featured on our Instagram? Reply with before/after photos!</p>
      
      <p>Beautiful organizing,</p>
      <p>Chanel</p>
    </div>`,
  },

  flexible: {
    name: "Flexible Organizer Guide Template",
    subject: "Your Flexible Organizer Guide - Systems That Adapt With You!",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>🌊 Your Flexible Organizer Guide</h1>
      
      <p>Hi {{name}},</p>
      
      <p>You're a <strong>Flexible Organizer</strong> - you need systems that evolve with your changing life! Here's your personalized guide:</p>
      
      <h2>🔄 Your Organization Superpowers:</h2>
      <ul>
        <li>You adapt to change quickly and easily</li>
        <li>You like having multiple options for everything</li>
        <li>You create systems that work for different seasons/phases</li>
        <li>You're great at making do with what you have</li>
      </ul>
      
      <h2>🛠️ Perfect Systems For You:</h2>
      
      <h3>1. The Modular System</h3>
      <ul>
        <li>Adjustable shelving that can be reconfigured</li>
        <li>Stackable bins that work alone or together</li>
        <li>Multi-purpose furniture with storage</li>
        <li>Rolling carts that move where needed</li>
      </ul>
      
      <h3>2. The Three-Zone Method</h3>
      <ul>
        <li>Daily Zone: items used every day</li>
        <li>Weekly Zone: items used regularly</li>
        <li>Seasonal Zone: items used occasionally</li>
        <li>Zones can shift based on your current needs!</li>
      </ul>
      
      <h3>3. Your RV Flexible Organization</h3>
      <ul>
        <li>Collapsible storage that adapts to space needs</li>
        <li>Multi-use items (ottoman = storage + seating)</li>
        <li>Removable organizers that relocate easily</li>
        <li>Seasonal setup changes (winter vs summer gear)</li>
      </ul>
      
      <h2>🛍️ Your Shopping List:</h2>
      <ul>
        <li>Collapsible fabric bins</li>
        <li>Adjustable drawer dividers</li>
        <li>Rolling storage carts</li>
        <li>Modular cube organizers</li>
        <li>Velcro and removable hooks</li>
      </ul>
      
      <h2>⚠️ Watch Out For These Traps:</h2>
      <ul>
        <li>Buying too many organizing products</li>
        <li>Never committing to one system long enough</li>
        <li>Creating so many options you can't choose</li>
        <li>Reorganizing instead of maintaining</li>
      </ul>
      
      <div style="background: #E8F5E8; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>🎁 Special Bonus: Your Free 30-Minute Consultation</h3>
        <p>Let's design a system that grows and changes with you!</p>
        <a href="https://calendly.com/chanelnbasolo/30min?utm_source=guide&utm_campaign=flexible" 
           style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
           Book My Free Consultation
        </a>
      </div>
      
      <p>Need a system tweak for your changing life? Just reply - I love problem-solving!</p>
      
      <p>Adaptable organizing,</p>
      <p>Chanel</p>
    </div>`,
  },

  simple: {
    name: "Simple Organizer Guide Template",
    subject: "Your Simple Organizer Guide - Easy Systems That Actually Work!",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>⚡ Your Simple Organizer Guide</h1>
      
      <p>Hi {{name}},</p>
      
      <p>You're a <strong>Simple Organizer</strong> - you want systems that are quick, easy, and low-maintenance! Here's your personalized guide:</p>
      
      <h2>🚀 Your Organization Superpowers:</h2>
      <ul>
        <li>You get things done without overthinking</li>
        <li>You focus on what really matters</li>
        <li>You create systems anyone can follow</li>
        <li>You don't let perfect be the enemy of good</li>
      </ul>
      
      <h2>💪 Perfect Systems For You:</h2>
      
      <h3>1. The One-Minute Rule</h3>
      <ul>
        <li>If it takes less than 1 minute, do it now</li>
        <li>Put things away immediately after use</li>
        <li>Quick daily tidying (set timer for 10 minutes)</li>
        <li>Weekly 30-minute organization session</li>
      </ul>
      
      <h3>2. The Big Bin Method</h3>
      <ul>
        <li>One big bin per category (not lots of small ones)</li>
        <li>Basic categories: Keep, Donate, Trash</li>
        <li>Simple labels (or no labels at all)</li>
        <li>Everything has ONE designated home</li>
      </ul>
      
      <h3>3. Your RV Simple Organization</h3>
      <ul>
        <li>One bin per person for personal items</li>
        <li>Basic categories: Kitchen, Clothes, Tools, Fun</li>
        <li>Easy-access storage for daily items</li>
        <li>Monthly "15-minute declutter" routine</li>
      </ul>
      
      <h2>🛍️ Your Shopping List:</h2>
      <ul>
        <li>Large fabric bins (few colors)</li>
        <li>Over-door shoe organizer</li>
        <li>Command hooks (variety pack)</li>
        <li>Basic plastic drawers</li>
        <li>That's it! Keep it simple!</li>
      </ul>
      
      <h2>⚠️ Watch Out For These Traps:</h2>
      <ul>
        <li>Buying too many organizing products</li>
        <li>Creating systems with too many steps</li>
        <li>Getting overwhelmed by Pinterest-perfect spaces</li>
        <li>Starting too many organization projects at once</li>
      </ul>
      
      <div style="background: #FFF3E0; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>🎁 Special Bonus: Your Free 30-Minute Consultation</h3>
        <p>Let's create the simplest system that actually works for your life!</p>
        <a href="https://calendly.com/chanelnbasolo/30min?utm_source=guide&utm_campaign=simple" 
           style="background: #FF9800; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
           Book My Free Consultation
        </a>
      </div>
      
      <p>Keep it simple, keep it working!</p>
      <p>Chanel</p>
    </div>`,
  },
};

async function createGuideTemplates() {
  console.log("Creating personalized organization guide templates...\n");

  const createdTemplates = {};

  for (const [style, template] of Object.entries(guideTemplates)) {
    try {
      const request = {
        url: "/v3/templates",
        method: "POST",
        body: {
          name: template.name,
          generation: "dynamic",
        },
      };

      const [response] = await sgClient.request(request);
      const templateId = response.body.id;

      console.log(`✅ Created ${style} guide template (ID: ${templateId})`);

      // Create version with content
      const versionRequest = {
        url: `/v3/templates/${templateId}/versions`,
        method: "POST",
        body: {
          template_id: templateId,
          active: 1,
          name: `${template.name} - Version 1`,
          html_content: template.html,
          subject: template.subject,
          generate_plain_content: true,
        },
      };

      await sgClient.request(versionRequest);
      createdTemplates[style] = templateId;
      console.log(`   📝 Added content version\n`);
    } catch (error) {
      console.error(
        `❌ Error creating ${style} guide template:`,
        error.response?.body || error.message,
      );
    }
  }

  console.log("📋 Guide Template IDs:");
  Object.entries(createdTemplates).forEach(([style, id]) => {
    console.log(`   ${style}: ${id}`);
  });

  return createdTemplates;
}

// Run the script
createGuideTemplates().catch(console.error);
