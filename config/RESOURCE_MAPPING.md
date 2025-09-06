# Resource Name Mapping System

## Overview
This document explains the resource name mapping system that prevents "undefined" values from appearing in email subjects and content.

## Problem Solved
Previously, the frontend would send values like 'Kitchen Guide', 'Seasonal Guide', 'Daily Routine' but the backend had incomplete mappings, causing "undefined" to appear in emails.

## Current Mapping Structure

### Frontend Form Values (Primary)
These are the values sent from forms on the website:
- `"Kitchen Guide"` → `"Kitchen Organization Essentials Guide"`
- `"Seasonal Guide"` → `"Montana Seasonal Gear Organization Guide"`
- `"Daily Routine"` → `"Daily Maintenance Routine Guide"`
- `"Closet Guide"` → `"Closet & Bedroom Organization Guide"`
- `"Office Guide"` → `"Home Office Setup Guide"`
- `"Mudroom Guide"` → `"Mudroom & Entryway Solutions Guide"`
- `"All Guides"` → `"Complete Organization Bundle"`

### File-Based Identifiers (Backend)
These correspond to actual HTML files in `/downloads/`:
- `"kitchen-organization-essentials"` → `"Kitchen Organization Essentials Guide"`
- `"montana-seasonal-gear-guide"` → `"Montana Seasonal Gear Organization Guide"`
- `"daily-maintenance-routine"` → `"Daily Maintenance Routine Guide"`
- `"closet-bedroom-organization"` → `"Closet & Bedroom Organization Guide"`
- `"home-office-setup"` → `"Home Office Setup Guide"`
- `"mudroom-entryway-solutions"` → `"Mudroom & Entryway Solutions Guide"`
- `"printable-labels-templates"` → `"Printable Labels & Templates"`
- `"organization-checklists"` → `"Organization Checklists"`
- `"planning-worksheets"` → `"Planning Worksheets"`

### Additional Resources
- `"Labels & Templates"` → `"Printable Labels & Templates"`
- `"Organization Checklists"` → `"Organization Checklists"`
- `"Planning Worksheets"` → `"Planning Worksheets"`

### Short Form Identifiers (Robustness)
- `"kitchen"` → `"Kitchen Organization Essentials Guide"`
- `"seasonal"` → `"Montana Seasonal Gear Organization Guide"`
- `"daily"` → `"Daily Maintenance Routine Guide"`
- `"closet"` → `"Closet & Bedroom Organization Guide"`
- `"office"` → `"Home Office Setup Guide"`
- `"mudroom"` → `"Mudroom & Entryway Solutions Guide"`

## Edge Case Handling
The system handles problematic values gracefully:
- `null` → `"Organization Resources"`
- `undefined` → `"Organization Resources"`
- `""` (empty string) → `"Organization Resources"`
- Unknown values → Uses the original value as-is

## Lead Scoring
The `calculateResourceLeadScore()` function uses the same mapping structure to ensure consistent scoring across all resource identifiers.

## Files Updated
1. `/config/api-server.js` - Main mapping logic in `sendResourceEmail()` function
2. `/config/api-server.js` - Lead scoring in `calculateResourceLeadScore()` function

## Testing
Run the test script to verify all mappings work correctly:
```bash
node config/test-resource-mapping.js
```

The test verifies:
- All frontend values map correctly
- No "undefined" values appear in email subjects
- Edge cases are handled properly
- Lead scoring works for all identifiers

## Maintenance
When adding new resources:
1. Add the frontend form value to the mapping
2. Add the file-based identifier (if different)
3. Add appropriate lead score value
4. Update test cases
5. Run tests to verify

## Available Downloads
Current files in `/downloads/` directory:
- `kitchen-organization-essentials.html`
- `montana-seasonal-gear-guide.html`
- `daily-maintenance-routine.html`
- `closet-bedroom-organization.html`
- `home-office-setup.html`
- `mudroom-entryway-solutions.html`
- `printable-labels-templates.html`
- `organization-checklists.html`
- `planning-worksheets.html`
- `rv-organization-checklist.pdf`

## Success Criteria
✅ No "undefined" values in email subjects or content  
✅ All frontend form values properly mapped  
✅ Consistent lead scoring across all identifiers  
✅ Graceful handling of edge cases  
✅ Maintainable and well-documented system