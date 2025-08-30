# ClutterFreeSpaces Airtable CRM Setup Guide

Since the Airtable Meta API has limitations, let's set up the CRM manually through the UI, then connect it programmatically.

## Step 1: Create Base in Airtable UI

1. Go to https://airtable.com
2. Click "Create a base"
3. Choose "Start from scratch"
4. Name: "ClutterFreeSpaces CRM"

## Step 2: Create Tables

### Table 1: Leads
**Fields to add:**
- Name (Single line text)
- Email (Email)
- Phone (Phone number)
- Lead Score (Number, precision 0)
- Organization Style (Single select: Detailed, Visual, Flexible, Simple)
- Lead Source (Single select: Quiz, Facebook, Website, Referral, Google, ManyChat)
- Status (Single select: New Lead, Contacted, Consultation Scheduled, Proposal Sent, Client, Not Interested)
- Location (Single line text)
- Space Type (Multiple select: RV/Motorhome, Home Office, Bedroom, Kitchen, Garage, Closet, Whole House)
- Budget Range (Single select: Under $300, $300-500, $500-800, $800-1200, Over $1200, Not Specified)
- Timeline (Single select: ASAP, Within 2 weeks, Within a month, Next 2-3 months, Just exploring)
- Notes (Long text)
- Quiz Answers (Long text)
- Date Created (Created time)
- Last Contact (Date & time)
- Next Follow-up (Date)
- Calendly Booking URL (URL)

### Table 2: Projects
**Fields to add:**
- Project Name (Single line text)
- Client (Link to Leads table)
- Project Type (Single select: Free Consultation, Quick Win Session, Full Organization Project, Maintenance Session, Virtual Consultation)
- Status (Single select: Scheduled, In Progress, Completed, Cancelled, Rescheduled)
- Scheduled Date (Date & time)
- Duration (Hours) (Number, precision 1)
- Revenue (Currency)
- Space Type (Multiple select: RV/Motorhome, Home Office, Bedroom, Kitchen, Garage, Closet, Whole House)
- Before Photos (Attachment)
- After Photos (Attachment)
- Project Notes (Long text)
- Client Feedback (Long text)
- Date Created (Created time)

### Table 3: Tasks
**Fields to add:**
- Task (Single line text)
- Related Lead (Link to Leads table)
- Related Project (Link to Projects table)
- Task Type (Single select: Follow-up Call, Send Email, Send Proposal, Schedule Session, Check-in, Request Review)
- Priority (Single select: High, Medium, Low)
- Due Date (Date)
- Status (Single select: To Do, In Progress, Completed, Cancelled)
- Notes (Long text)
- Date Created (Created time)
- Completed Date (Date & time)

### Table 4: Analytics
**Fields to add:**
- Date (Date)
- New Leads (Number)
- Consultations Booked (Number)
- Projects Completed (Number)
- Revenue (Currency)
- Lead Sources (Long text)
- Notes (Long text)

## Step 3: Get Your Base ID

1. Open your base in Airtable
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. Copy the `appXXXXXXXXXXXXXX` part - this is your Base ID

## Step 4: Add Sample Data

Add these sample records to test:

**Leads Table:**
- Name: Sarah Johnson, Email: sarah.j@email.com, Lead Score: 85, Style: Visual, Source: Quiz, Status: Client
- Name: Mike Thompson, Email: mike.t@email.com, Lead Score: 65, Style: Simple, Source: Facebook, Status: Consultation Scheduled

**Projects Table:**
- Project Name: Sarah J - RV Organization, Type: Full Organization Project, Status: Completed, Revenue: $640

## Step 5: Update Environment Variables

Add to your `.env` file:
```
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

## Step 6: Test API Connection

I'll create a test script to verify everything works.