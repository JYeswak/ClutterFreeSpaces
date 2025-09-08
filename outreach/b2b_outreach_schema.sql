-- B2B Outreach Database Schema for ClutterFreeSpaces
-- Dedicated database for Montana business outreach campaign
-- Created: September 8, 2025

-- Business Types Table
CREATE TABLE IF NOT EXISTS business_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT UNIQUE NOT NULL,
    description TEXT,
    priority_score INTEGER DEFAULT 5, -- 1-10 scale for outreach priority
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    business_type_id INTEGER,
    address TEXT,
    city TEXT,
    state TEXT DEFAULT 'Montana',
    zip_code TEXT,
    phone TEXT,
    website TEXT,
    email TEXT,
    google_place_id TEXT UNIQUE,
    latitude REAL,
    longitude REAL,
    rating REAL,
    review_count INTEGER,
    is_verified BOOLEAN DEFAULT 0,
    notes TEXT,
    discovered_via TEXT, -- 'google_places', 'manual', etc.
    outreach_status TEXT DEFAULT 'not_contacted', -- 'not_contacted', 'contacted', 'replied', 'interested', 'closed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_type_id) REFERENCES business_types(id)
);

-- Business Contacts Table (Multiple contacts per business)
CREATE TABLE IF NOT EXISTS business_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL,
    first_name TEXT,
    last_name TEXT,
    title TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    decision_maker BOOLEAN DEFAULT 0,
    influence_score INTEGER DEFAULT 5, -- 1-10 scale
    contact_preference TEXT DEFAULT 'email', -- 'email', 'phone', 'linkedin'
    best_time_to_contact TEXT,
    discovered_via TEXT, -- 'website_scraping', 'hunter_io', 'linkedin', 'manual'
    confidence_score INTEGER DEFAULT 0, -- 0-100 for data quality
    contact_type TEXT DEFAULT 'personal', -- 'personal', 'generic', 'role_based'
    status TEXT DEFAULT 'active', -- 'active', 'inactive', 'bounced', 'unsubscribed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    UNIQUE(business_id, email)
);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    subject_line TEXT NOT NULL,
    email_template TEXT NOT NULL,
    business_type_filter TEXT, -- Target specific business types
    priority_filter INTEGER, -- Target specific priority scores
    status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
    send_schedule TEXT, -- JSON for scheduling rules
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Sends Table (Track individual email sends)
CREATE TABLE IF NOT EXISTS campaign_sends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    business_id INTEGER NOT NULL,
    subject_line TEXT NOT NULL,
    email_content TEXT NOT NULL,
    send_status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    replied_at TIMESTAMP,
    bounce_reason TEXT,
    error_message TEXT,
    sendgrid_message_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id),
    FOREIGN KEY (contact_id) REFERENCES business_contacts(id),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Email Replies Table
CREATE TABLE IF NOT EXISTS email_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_send_id INTEGER,
    contact_id INTEGER NOT NULL,
    business_id INTEGER NOT NULL,
    from_email TEXT NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    sentiment TEXT, -- 'positive', 'neutral', 'negative', 'interested', 'not_interested'
    contains_meeting_request BOOLEAN DEFAULT 0,
    follow_up_required BOOLEAN DEFAULT 1,
    replied_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_send_id) REFERENCES campaign_sends(id),
    FOREIGN KEY (contact_id) REFERENCES business_contacts(id),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

-- Email Validation Results
CREATE TABLE IF NOT EXISTS email_validations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    validation_service TEXT, -- 'hunter_io', 'zerobounce', 'neverbounce'
    is_valid BOOLEAN,
    is_deliverable BOOLEAN,
    is_risky BOOLEAN,
    confidence_score INTEGER, -- 0-100
    validation_result TEXT, -- JSON with detailed results
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES business_contacts(id)
);

-- Outreach Performance Metrics
CREATE TABLE IF NOT EXISTS outreach_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_date DATE NOT NULL,
    business_type TEXT,
    total_businesses INTEGER DEFAULT 0,
    businesses_with_emails INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_delivered INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    emails_replied INTEGER DEFAULT 0,
    positive_replies INTEGER DEFAULT 0,
    meetings_booked INTEGER DEFAULT 0,
    customers_acquired INTEGER DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, business_type)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_businesses_type ON businesses(business_type_id);
CREATE INDEX IF NOT EXISTS idx_businesses_email ON businesses(email);
CREATE INDEX IF NOT EXISTS idx_businesses_outreach_status ON businesses(outreach_status);
CREATE INDEX IF NOT EXISTS idx_contacts_business ON business_contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON business_contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON business_contacts(status);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_contact ON campaign_sends(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_status ON campaign_sends(send_status);

-- Insert Default Business Types
INSERT OR IGNORE INTO business_types (type_name, description, priority_score) VALUES
('real_estate_agent', 'Real Estate Agents and Realtors', 9),
('cleaning_company', 'Residential and Commercial Cleaning Services', 10),
('moving_company', 'Moving and Relocation Services', 8),
('storage_facility', 'Self Storage and Storage Units', 7),
('rv_dealer', 'RV Sales and Service', 6),
('senior_living', 'Senior Living Communities and Care', 8),
('home_staging', 'Home Staging and Design Services', 9),
('property_management', 'Property Management Companies', 7),
('interior_designer', 'Interior Design Services', 8),
('home_organizer', 'Professional Home Organizers (Competitors)', 3),
('estate_sale', 'Estate Sale Companies', 6),
('junk_removal', 'Junk Removal and Hauling Services', 7),
('home_renovation', 'Home Renovation and Remodeling', 5),
('downsizing_service', 'Senior Downsizing Services', 9);

-- Views for Common Queries
CREATE VIEW IF NOT EXISTS businesses_with_contacts AS
SELECT 
    b.*,
    bt.type_name,
    bt.priority_score,
    COUNT(bc.id) as contact_count,
    GROUP_CONCAT(bc.email, '; ') as all_emails
FROM businesses b
JOIN business_types bt ON b.business_type_id = bt.id
LEFT JOIN business_contacts bc ON b.id = bc.business_id AND bc.status = 'active'
GROUP BY b.id;

CREATE VIEW IF NOT EXISTS campaign_performance AS
SELECT 
    c.name as campaign_name,
    COUNT(cs.id) as total_sends,
    COUNT(CASE WHEN cs.send_status = 'sent' THEN 1 END) as sent_count,
    COUNT(CASE WHEN cs.send_status = 'delivered' THEN 1 END) as delivered_count,
    COUNT(CASE WHEN cs.send_status = 'opened' THEN 1 END) as opened_count,
    COUNT(CASE WHEN cs.send_status = 'clicked' THEN 1 END) as clicked_count,
    COUNT(CASE WHEN cs.send_status = 'replied' THEN 1 END) as replied_count,
    ROUND(COUNT(CASE WHEN cs.send_status = 'opened' THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN cs.send_status = 'delivered' THEN 1 END), 0), 2) as open_rate,
    ROUND(COUNT(CASE WHEN cs.send_status = 'replied' THEN 1 END) * 100.0 / NULLIF(COUNT(CASE WHEN cs.send_status = 'delivered' THEN 1 END), 0), 2) as reply_rate
FROM email_campaigns c
LEFT JOIN campaign_sends cs ON c.id = cs.campaign_id
GROUP BY c.id;

-- Email Extraction Tracking
CREATE TABLE IF NOT EXISTS extraction_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_id INTEGER NOT NULL,
    extraction_method TEXT NOT NULL, -- 'basic_scraping', 'enhanced_scraping', 'hunter_io', 'manual'
    success BOOLEAN DEFAULT 0,
    emails_found INTEGER DEFAULT 0,
    error_message TEXT,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);