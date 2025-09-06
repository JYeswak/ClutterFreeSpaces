#!/bin/bash

# Daily Review Request Automation for ClutterFreeSpaces
# Run this script daily at 9 AM to check for new clients needing review requests

# Change to project directory
cd "$(dirname "$0")"

# Set environment variables (replace with your actual values)
export AIRTABLE_BASE_ID="your-airtable-base-id"
export AIRTABLE_API_KEY="your-airtable-api-key"
export SendGrid_API_Key="your-sendgrid-api-key"

# Run the review automation
echo "$(date): Starting daily review automation check..."
node review-automation-system.js

# Log completion
echo "$(date): Daily review automation completed"