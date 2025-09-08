-- ClutterFreeSpaces B2B Outreach Extension
-- Additional tables for business-to-business outreach campaigns
-- Run this after the main schema.sql to add B2B functionality

PRAGMA foreign_keys = ON;

-- Business types for segmentation
CREATE TABLE IF NOT EXISTS business_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT UNIQUE NOT NULL, -- 'rv_dealer', 'cleaning_company', 'real_estate', etc.
    category TEXT NOT NULL, -- 'rv_campaign' or 'home_campaign'
    description TEXT,
    priority_score INTEGER DEFAULT 50, -- 1-100 for targeting priority
    commission_rate REAL DEFAULT 0.20, -- Default commission rate
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_type_id INTEGER NOT NULL,
    
    -- Basic Business Info
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT DEFAULT 'MT',
    zip_code TEXT,
    phone TEXT,
    website TEXT,
    
    -- Business Details
    email TEXT,
    facebook_url TEXT,
    linkedin_url TEXT,
    google_maps_url TEXT,
    yelp_url TEXT,
    
    -- Business Intelligence
    years_in_business INTEGER,
    employee_count INTEGER,
    estimated_annual_revenue INTEGER,
    google_rating REAL,
    review_count INTEGER,
    
    -- Targeting Info
    partnership_potential INTEGER DEFAULT 50, -- 1-100 score
    market_reach TEXT, -- 'local', 'regional', 'statewide'
    customer_overlap_score INTEGER DEFAULT 50, -- How much their customers match ours
    
    -- Data Source
    discovered_via TEXT, -- 'google_maps', 'yelp', 'manual', 'referral'
    last_verified TIMESTAMP,
    
    -- Status
    status TEXT DEFAULT 'discovered', -- 'discovered', 'researched', 'contacted', 'qualified', 'partner'
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_type_id) REFERENCES business_types(id),
    UNIQUE(name, city) -- Prevent duplicates in same city
);

-- Individual contacts at businesses
CREATE TABLE IF NOT EXISTS business_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL,
    
    -- Contact Info
    first_name TEXT,
    last_name TEXT,
    title TEXT, -- 'Owner', 'Manager', 'Sales Director', etc.
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    
    -- Contact Intelligence
    decision_maker BOOLEAN DEFAULT FALSE,
    influence_score INTEGER DEFAULT 50, -- 1-100 how influential they are
    contact_preference TEXT DEFAULT 'email', -- 'email', 'phone', 'linkedin'
    best_time_to_contact TEXT, -- 'morning', 'afternoon', 'evening'
    
    -- Data Source
    discovered_via TEXT, -- 'website_scrape', 'linkedin', 'manual', 'referral'
    
    -- Status
    status TEXT DEFAULT 'discovered', -- 'discovered', 'contacted', 'responded', 'qualified', 'partner'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    UNIQUE(business_id, email) -- One email per business
);

-- Outreach campaigns (home vs RV)
CREATE TABLE IF NOT EXISTS outreach_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Campaign Details
    name TEXT NOT NULL UNIQUE,
    campaign_type TEXT NOT NULL, -- 'home_organization', 'rv_organization'
    description TEXT,
    
    -- Campaign Settings
    status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
    start_date DATE,
    end_date DATE,
    daily_send_limit INTEGER DEFAULT 20,
    
    -- Templates
    email_subject_template TEXT,
    email_body_template TEXT,
    follow_up_sequence TEXT, -- JSON array of follow-up templates
    
    -- Goals & Metrics
    target_contacts INTEGER,
    target_responses INTEGER,
    target_partnerships INTEGER,
    expected_revenue REAL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual outreach activities
CREATE TABLE IF NOT EXISTS outreach_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    business_id INTEGER NOT NULL,
    
    -- Outreach Details
    activity_type TEXT NOT NULL, -- 'email', 'phone', 'linkedin', 'meeting'
    subject TEXT, -- Email subject or call topic
    content TEXT, -- Email body or call notes
    
    -- Timing
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    
    -- Response Tracking
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    replied_at TIMESTAMP,
    response_content TEXT,
    response_sentiment TEXT, -- 'positive', 'negative', 'neutral', 'interested'
    
    -- Status
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'sent', 'delivered', 'opened', 'replied', 'failed'
    error_message TEXT,
    
    -- Follow-up
    follow_up_needed BOOLEAN DEFAULT TRUE,
    follow_up_date DATE,
    follow_up_type TEXT, -- 'email', 'phone', 'linkedin'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id),
    FOREIGN KEY (contact_id) REFERENCES business_contacts(id),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Partnership opportunities and status
CREATE TABLE IF NOT EXISTS partnership_opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL,
    contact_id INTEGER,
    
    -- Opportunity Details
    opportunity_type TEXT NOT NULL, -- 'referral_program', 'commission_partner', 'joint_venture'
    estimated_monthly_revenue REAL,
    commission_rate REAL,
    contract_length_months INTEGER,
    
    -- Status Tracking
    stage TEXT DEFAULT 'initial_contact', -- 'initial_contact', 'discovery', 'proposal', 'negotiation', 'agreement', 'active', 'paused', 'ended'
    probability INTEGER DEFAULT 25, -- 0-100% chance of closing
    
    -- Key Dates
    first_contact_date DATE,
    proposal_sent_date DATE,
    expected_close_date DATE,
    actual_close_date DATE,
    
    -- Partnership Details
    services_offered TEXT, -- JSON array of services we'll provide
    partner_obligations TEXT, -- What they need to do
    success_metrics TEXT, -- How we'll measure success
    
    -- Notes & Communication
    notes TEXT,
    last_communication_date DATE,
    next_action TEXT,
    next_action_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (contact_id) REFERENCES business_contacts(id)
);

-- Track partnerships that become active
CREATE TABLE IF NOT EXISTS active_partnerships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id INTEGER NOT NULL,
    business_id INTEGER NOT NULL,
    
    -- Partnership Terms
    partnership_type TEXT NOT NULL,
    commission_rate REAL NOT NULL,
    monthly_minimum REAL DEFAULT 0,
    contract_start_date DATE NOT NULL,
    contract_end_date DATE,
    
    -- Performance Tracking
    total_referrals INTEGER DEFAULT 0,
    total_revenue_generated REAL DEFAULT 0,
    total_commissions_paid REAL DEFAULT 0,
    last_referral_date DATE,
    
    -- Status
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'terminated'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (opportunity_id) REFERENCES partnership_opportunities(id),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Track individual referrals from partners
CREATE TABLE IF NOT EXISTS partner_referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partnership_id INTEGER NOT NULL,
    business_id INTEGER NOT NULL,
    
    -- Referral Details
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    service_type TEXT, -- 'home_organization', 'rv_organization'
    
    -- Financial
    service_value REAL,
    commission_amount REAL,
    commission_paid BOOLEAN DEFAULT FALSE,
    commission_paid_date DATE,
    
    -- Status
    referral_status TEXT DEFAULT 'received', -- 'received', 'contacted', 'consultation', 'booked', 'completed', 'lost'
    conversion_date DATE,
    
    -- Source Attribution
    referral_source TEXT, -- How they heard about us from partner
    partner_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (partnership_id) REFERENCES active_partnerships(id),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_type ON businesses(business_type_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_partnership_potential ON businesses(partnership_potential);

CREATE INDEX IF NOT EXISTS idx_contacts_business ON business_contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON business_contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_decision_maker ON business_contacts(decision_maker);

CREATE INDEX IF NOT EXISTS idx_activities_campaign ON outreach_activities(campaign_id);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON outreach_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON outreach_activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_sent_at ON outreach_activities(sent_at);

CREATE INDEX IF NOT EXISTS idx_opportunities_business ON partnership_opportunities(business_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON partnership_opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_probability ON partnership_opportunities(probability);

-- Views for common B2B queries
CREATE VIEW IF NOT EXISTS high_value_prospects AS
SELECT 
    b.id,
    b.name,
    b.city,
    bt.type_name,
    bt.category,
    b.partnership_potential,
    b.google_rating,
    b.status,
    COUNT(bc.id) as contact_count,
    MAX(bc.decision_maker) as has_decision_maker
FROM businesses b
JOIN business_types bt ON b.business_type_id = bt.id
LEFT JOIN business_contacts bc ON b.id = bc.business_id
WHERE b.partnership_potential >= 70
    AND b.status IN ('discovered', 'researched', 'contacted')
GROUP BY b.id
ORDER BY b.partnership_potential DESC, b.google_rating DESC;

CREATE VIEW IF NOT EXISTS campaign_performance AS
SELECT 
    oc.id,
    oc.name,
    oc.campaign_type,
    oc.status,
    COUNT(oa.id) as total_activities,
    COUNT(CASE WHEN oa.status = 'sent' THEN 1 END) as emails_sent,
    COUNT(CASE WHEN oa.opened_at IS NOT NULL THEN 1 END) as emails_opened,
    COUNT(CASE WHEN oa.replied_at IS NOT NULL THEN 1 END) as replies_received,
    ROUND(COUNT(CASE WHEN oa.opened_at IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN oa.status = 'sent' THEN 1 END), 0), 2) as open_rate,
    ROUND(COUNT(CASE WHEN oa.replied_at IS NOT NULL THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN oa.status = 'sent' THEN 1 END), 0), 2) as reply_rate
FROM outreach_campaigns oc
LEFT JOIN outreach_activities oa ON oc.id = oa.campaign_id
GROUP BY oc.id;

CREATE VIEW IF NOT EXISTS partnership_pipeline AS
SELECT 
    po.id,
    b.name as business_name,
    bt.type_name as business_type,
    po.stage,
    po.opportunity_type,
    po.estimated_monthly_revenue,
    po.probability,
    po.expected_close_date,
    CASE 
        WHEN po.expected_close_date < date('now') THEN 'overdue'
        WHEN po.expected_close_date <= date('now', '+7 days') THEN 'due_this_week'
        WHEN po.expected_close_date <= date('now', '+30 days') THEN 'due_this_month'
        ELSE 'future'
    END as urgency
FROM partnership_opportunities po
JOIN businesses b ON po.business_id = b.id
JOIN business_types bt ON b.business_type_id = bt.id
WHERE po.stage NOT IN ('ended')
ORDER BY po.probability DESC, po.expected_close_date ASC;

-- Triggers to update timestamps
CREATE TRIGGER IF NOT EXISTS update_businesses_timestamp 
    AFTER UPDATE ON businesses
BEGIN
    UPDATE businesses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_contacts_timestamp 
    AFTER UPDATE ON business_contacts
BEGIN
    UPDATE business_contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_campaigns_timestamp 
    AFTER UPDATE ON outreach_campaigns
BEGIN
    UPDATE outreach_campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_opportunities_timestamp 
    AFTER UPDATE ON partnership_opportunities
BEGIN
    UPDATE partnership_opportunities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Campaign Sequences Table for drip campaigns
CREATE TABLE IF NOT EXISTS campaign_sequences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    sequence_order INTEGER NOT NULL,
    
    -- Email Details
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    delay_days INTEGER DEFAULT 3, -- Days after previous email
    
    -- Tracking
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id),
    UNIQUE(campaign_id, sequence_order)
);

-- Campaign Contacts - Track which contacts are in which campaigns
CREATE TABLE IF NOT EXISTS campaign_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    
    -- Enrollment Info
    enrolled_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_sequence INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'unsubscribed', 'bounced'
    
    -- Next Action
    next_email_due TIMESTAMP,
    last_email_sent TIMESTAMP,
    
    -- Tracking
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    replied BOOLEAN DEFAULT FALSE,
    reply_date TIMESTAMP,
    converted BOOLEAN DEFAULT FALSE,
    conversion_date TIMESTAMP,
    
    -- Notes
    notes TEXT,
    
    FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id),
    FOREIGN KEY (contact_id) REFERENCES business_contacts(id),
    UNIQUE(campaign_id, contact_id)
);

-- Email Sends - Individual email tracking
CREATE TABLE IF NOT EXISTS email_sends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    sequence_id INTEGER,
    
    -- SendGrid Data
    sendgrid_message_id TEXT,
    
    -- Email Details
    subject TEXT NOT NULL,
    body_html TEXT,
    body_text TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Tracking Events
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    bounced_at TIMESTAMP,
    replied_at TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    
    -- Status
    status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'replied', 'unsubscribed'
    bounce_reason TEXT,
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    
    FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id),
    FOREIGN KEY (contact_id) REFERENCES business_contacts(id),
    FOREIGN KEY (sequence_id) REFERENCES campaign_sequences(id)
);

-- Unsubscribes - Compliance tracking
CREATE TABLE IF NOT EXISTS unsubscribes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER,
    email TEXT NOT NULL,
    
    -- Unsubscribe Details
    unsubscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method TEXT, -- 'email_link', 'reply', 'manual'
    campaign_id INTEGER, -- Which campaign triggered unsubscribe
    
    -- Compliance
    ip_address TEXT,
    user_agent TEXT,
    
    FOREIGN KEY (contact_id) REFERENCES business_contacts(id),
    FOREIGN KEY (campaign_id) REFERENCES outreach_campaigns(id),
    UNIQUE(email) -- One unsubscribe record per email
);

-- Enhanced Campaign Performance View
DROP VIEW IF EXISTS campaign_performance;
CREATE VIEW campaign_performance AS
SELECT 
    oc.id as campaign_id,
    oc.name as campaign_name,
    oc.campaign_type,
    oc.status,
    
    -- Enrollment Stats
    COUNT(DISTINCT cc.contact_id) as total_enrolled,
    COUNT(DISTINCT CASE WHEN cc.status = 'active' THEN cc.contact_id END) as active_contacts,
    COUNT(DISTINCT CASE WHEN cc.status = 'completed' THEN cc.contact_id END) as completed_contacts,
    COUNT(DISTINCT CASE WHEN cc.status = 'unsubscribed' THEN cc.contact_id END) as unsubscribed_contacts,
    
    -- Email Stats
    COUNT(DISTINCT es.id) as total_emails_sent,
    COUNT(DISTINCT CASE WHEN es.delivered_at IS NOT NULL THEN es.id END) as emails_delivered,
    COUNT(DISTINCT CASE WHEN es.opened_at IS NOT NULL THEN es.id END) as emails_opened,
    COUNT(DISTINCT CASE WHEN es.clicked_at IS NOT NULL THEN es.id END) as emails_clicked,
    COUNT(DISTINCT CASE WHEN es.replied_at IS NOT NULL THEN es.id END) as emails_replied,
    COUNT(DISTINCT CASE WHEN es.bounced_at IS NOT NULL THEN es.id END) as emails_bounced,
    
    -- Conversion Stats
    COUNT(DISTINCT CASE WHEN cc.replied = TRUE THEN cc.contact_id END) as total_replies,
    COUNT(DISTINCT CASE WHEN cc.converted = TRUE THEN cc.contact_id END) as total_conversions,
    
    -- Performance Metrics
    CASE WHEN COUNT(DISTINCT es.id) > 0 THEN 
        ROUND(COUNT(DISTINCT CASE WHEN es.delivered_at IS NOT NULL THEN es.id END) * 100.0 / COUNT(DISTINCT es.id), 2)
    END as delivery_rate,
    
    CASE WHEN COUNT(DISTINCT CASE WHEN es.delivered_at IS NOT NULL THEN es.id END) > 0 THEN 
        ROUND(COUNT(DISTINCT CASE WHEN es.opened_at IS NOT NULL THEN es.id END) * 100.0 / 
              COUNT(DISTINCT CASE WHEN es.delivered_at IS NOT NULL THEN es.id END), 2)
    END as open_rate,
    
    CASE WHEN COUNT(DISTINCT CASE WHEN es.opened_at IS NOT NULL THEN es.id END) > 0 THEN 
        ROUND(COUNT(DISTINCT CASE WHEN es.clicked_at IS NOT NULL THEN es.id END) * 100.0 / 
              COUNT(DISTINCT CASE WHEN es.opened_at IS NOT NULL THEN es.id END), 2)
    END as click_through_rate,
    
    CASE WHEN COUNT(DISTINCT cc.contact_id) > 0 THEN 
        ROUND(COUNT(DISTINCT CASE WHEN cc.replied = TRUE THEN cc.contact_id END) * 100.0 / 
              COUNT(DISTINCT cc.contact_id), 2)
    END as reply_rate,
    
    CASE WHEN COUNT(DISTINCT cc.contact_id) > 0 THEN 
        ROUND(COUNT(DISTINCT CASE WHEN cc.converted = TRUE THEN cc.contact_id END) * 100.0 / 
              COUNT(DISTINCT cc.contact_id), 2)
    END as conversion_rate

FROM outreach_campaigns oc
LEFT JOIN campaign_contacts cc ON oc.id = cc.campaign_id
LEFT JOIN email_sends es ON oc.id = es.campaign_id
GROUP BY oc.id, oc.name, oc.campaign_type, oc.status;

-- Additional indexes for email campaign performance
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_status ON campaign_contacts(status);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_next_due ON campaign_contacts(next_email_due);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_sends_sendgrid_id ON email_sends(sendgrid_message_id);
CREATE INDEX IF NOT EXISTS idx_unsubscribes_email ON unsubscribes(email);

-- Insert initial business types
INSERT OR IGNORE INTO business_types (type_name, category, description, priority_score, commission_rate) VALUES
-- Home Organization Campaign
('cleaning_company', 'home_campaign', 'Residential and commercial cleaning services', 90, 0.20),
('real_estate_agent', 'home_campaign', 'Real estate agents and brokers', 95, 0.15),
('property_management', 'home_campaign', 'Property management companies', 80, 0.20),
('moving_company', 'home_campaign', 'Moving and relocation services', 85, 0.25),
('storage_facility', 'home_campaign', 'Self-storage and storage facilities', 75, 0.20),
('home_staging', 'home_campaign', 'Home staging and interior design', 85, 0.15),
('senior_living', 'home_campaign', 'Senior living communities and services', 90, 0.20),
('interior_designer', 'home_campaign', 'Interior design professionals', 70, 0.15),

-- RV Organization Campaign  
('rv_dealer', 'rv_campaign', 'RV sales dealerships', 95, 0.20),
('rv_park', 'rv_campaign', 'RV parks and campgrounds', 80, 0.15),
('rv_service', 'rv_campaign', 'RV service and repair centers', 85, 0.20),
('rv_rental', 'rv_campaign', 'RV rental companies', 75, 0.25),
('outdoor_store', 'rv_campaign', 'Outdoor recreation and camping stores', 70, 0.15),
('travel_agency', 'rv_campaign', 'Travel agencies specializing in RV travel', 60, 0.20),
('rv_club', 'rv_campaign', 'RV clubs and associations', 50, 0.10);