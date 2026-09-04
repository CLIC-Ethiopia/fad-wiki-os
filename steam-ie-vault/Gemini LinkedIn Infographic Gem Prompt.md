---
name: icp-prospect-discovery
description: Discover, evaluate, and qualify target prospective clients (solo founders and boutique service agencies, 1-10 headcount, across niches like event venues, coaching practices, and boutique marketing agencies) and log vetted, tiered prospect profiles into Google Sheets. Trigger when the user asks to find target clients, discover new prospects, qualify leads for AI automation consulting, run ICP prospect vetting, or log vetted prospects to the spreadsheet.
allowed-tools: google drive sheets_agent
---

# ICP Prospect Discovery

A skill for sourcing, inspecting, qualifying, and logging target prospective clients for an AI automation consulting agency into a Google Sheets prospect tracker.

## When to Use

- When the user asks to find, source, or discover target prospective clients or leads in designated service niches (event venues, coaching practices, boutique agencies).
- When the user asks to evaluate, qualify, or tier prospective client websites based on operational bottlenecks and AI automation fit.
- When the user requests updating or appending vetted prospect profiles into the Google Sheets Prospect Tracker.

## Target ICP and Qualification Criteria

- Target Niches: US-based boutique agencies, event venue managers, coaching practices, and consulting solo founders.
- Team Size: Approximately 1-10 people. Avoid large enterprise corporations, SaaS software products, or non-US entities.
- Operational Indicators: Service businesses managing client inquiries, booking coordination, retainer reporting, diagnostic intakes, or multi-step onboarding workflows.
- Tiering Rubric:
  - Tier 1: Direct ICP match, 1-10 employees, visible operational bottlenecks (manual web forms, high-touch tour/discovery scheduling, multi-step onboarding, fragmented client reporting).
  - Tier 2: Strong ICP match and target headcount, but specific operational friction is internal or not fully verifiable from public site data.
  - Disqualified: Software SaaS companies, enterprise organizations, non-US operations, or companies with no clear fit for service workflow automation.

## Step-by-Step Workflow

### 1. Deduplication Check
- Search Google Drive for the existing spreadsheet tracker (for example, "Prospect Tracker") using Drive tools.
- Read existing rows to ensure discovered prospects are not duplicate entries.
- If the sheet is empty, initialize column headers: `[Company Name, Website, Contact/Founder, Niche, Location, Tier, Fit Rationale, Recommended Automation Angle, Date Added]`.

### 2. Market Sourcing
- Perform web searches across target niches and US geographic locations to identify candidate boutique businesses and founder-led practices.
- Filter out job boards, directories, large franchises, and venture-funded SaaS platforms.

### 3. Site Inspection and Fact Verification
- Browse candidate websites and public pages.
- Verify and extract factual details:
  - Company Name and verified Website URL
  - Principal / Founder / Owner Name
  - Core Service Offering and Geographic Location
  - Estimated Team Size (confirming 1-10 headcount)
- Identify 1-2 concrete automation or workflow opportunities tailored to their service delivery (e.g., inquiry qualification bots, multi-step onboarding sync, automated retainer reporting).

### 4. Qualification and Tiering
- Evaluate each candidate against the tiering rubric.
- Assign Tier 1, Tier 2, or Disqualified based on factual site evidence.

### 5. Pipeline Logging
- Use the sheets tool to append qualified Tier 1 and Tier 2 prospects to the Google Sheets Prospect Tracker.
- Populate all 9 columns accurately with clear rationales and actionable automation pitch angles.

### 6. Summary Delivery
- Deliver a concise summary in chat containing:
  - Total candidates evaluated
  - Qualification breakdown (Tier 1 count, Tier 2 count, Disqualified count)
  - Bulleted list of Tier 1 additions highlighting key founder, location, operational fit, and recommended automation angle.
  - Clickable markdown links to the updated spreadsheet and candidate websites.
- Pause for human review after data logging.

## Operational Rules

- Analytical and data logging role only: Never draft outbound outreach, send emails, contact prospects, or initiate communication with external parties.
- Strict factual grounding: Base all company data, founder names, and operational signals on verified public information. Do not hallucinate contact info or team size.
- Stop at human checkpoint: Complete spreadsheet updates and deliver the chat summary, then wait for user review.

## Gotchas

- Avoid SaaS / Tech Companies: Always check if the company is selling software rather than services. Software companies must be classified as Disqualified.
- Headcount Verification: Check team pages, about pages, or leadership sections to avoid mid-market or large agencies (10+ staff).
- Formatting: Ensure spreadsheet updates preserve existing rows and follow clean tabular conventions without overwriting previous data.
