# VisaPrep - Innovator Founder Visa Platform

## Overview

VisaPrep is a SaaS application that generates professional business plans for UK Innovator Founder visa applicants. It features the Innovator Founder Visa Assistant for real-time guidance. The platform uses AI (OpenAI GPT) to create comprehensive, endorsing body-ready business plans covering the three key visa criteria: Innovation, Viability, and Scalability. Users complete a multi-step questionnaire, purchase a tier (Basic, Premium, or Enterprise), and receive a professionally formatted PDF business plan within minutes.

## Critical Information - Updated November 2025

### Innovator Founder Visa (Replaced Old Innovator Visa)

**Official Sources:**
- GOV.UK Innovator Founder visa page (updated November 2025)
- Home Office guidance Version 9.0 (published November 11, 2025)
- Endorsing bodies guidance for internal assessment

**Key Changes from Old Visa:**
- NO fixed £50,000 minimum investment requirement for INDIVIDUAL applicants
- Funding must be "appropriate" and "sufficient" for YOUR business plan
- Could be less than, equal to, or more than £50k depending on business needs
- Endorsing bodies assess appropriateness AND legitimacy of funds

**TEAM APPLICANTS (New Business):**
- Each co-founder must independently have £50,000 available to invest
- Each co-founder needs SEPARATE endorsement (not linked applications)
- Each must individually score 70 points
- Each must have own contact point meetings (minimum 2 per person)

**Official Requirements:**
- Personal savings: £1,270 (28 consecutive days) - mandatory for all
- Business funding: "Appropriate" amount (no fixed minimum for individuals)
- Endorsement letter: Must confirm no concerns over fund legitimacy/sources
- Must be genuine, original business plan meeting market needs/competitive advantage
- Realistic and achievable based on available resources
- Evidence of structured planning with job creation and growth potential
- No investment needed if business already established/endorsed
- Points: 70 total (50 from business criteria + 10 English B2 + 10 financial)

**Visa Fees (Nov 2025):**
- Application: £1,274 (outside UK) or £1,590 (extension/switch in UK)
- Endorsement assessment: £1,000
- Per-meeting fee: £500 each (minimum 2 meetings required)
- Duration: 3 years, then settlement eligible after continuous 3-year residence

**English Language Requirements:**
- Level B2 (reading, writing, speaking, listening)
- Can prove via UK school qualification (GCSE, A Level, Scottish National 4/5)
- UK degree taught in English (even if studied outside UK)
- Non-UK degree taught in English + Ecctis assessment
- Previous visa English proof can be reused

**Business Requirements (Endorser Assessment):**
- **Innovative**: Genuine, original business plan meeting market needs OR creating competitive advantage
- **Viable**: Realistic and achievable based on applicant's available resources, skills, knowledge, market awareness
- **Scalable**: Evidence of structured planning including job creation and growth into national/international markets
- Solo founder or instrumental part of founding team (cannot just join already-trading business)

**Switching Restrictions:**
- Cannot switch from: Visitor, Short-term Student, Parent of Child Student, Seasonal Worker, domestic worker
- Students can only switch if:
  - Completed their course, OR
  - Studying PhD for at least 12 months full-time AND have completed at least 12 months (CONFLICT: check separately)
- Immigration bail applicants cannot switch

**Partner & Dependants:**
- Marriage/civil partnership recognized in UK, OR
- 2+ year cohabitation, OR
- 2+ year relationship (non-cohabiting acceptable if cultural reasons)
- Must provide evidence of ongoing commitment (regular communication, financial support, care for children, time together)
- Partner savings: £285 (on top of £1,270 main applicant)
- First child: £315
- Each additional child: £200

**Documents Required:**
- Endorsement letter (within 3 months of application)
- Valid passport or travel document
- Bank statements showing £1,270 for 28 consecutive days
- English language proof
- Tuberculosis test (if from designated country)
- Certified translations if documents not in English/Welsh

**Personal Savings - STRICT RULES:**
- Cannot use investment funds for personal maintenance
- Cannot use money earned illegally in UK
- Must have been in applicant's bank account (not partner/family)
- Already in UK 12+ months = automatic exemption

**Settlement After 3 Years:**
- Continuous residence (max 180-day absences per 12-month period)
- Knowledge of Life in the UK test required
- Endorsement letter still required (within 3 months)
- Business must show significant achievements against business plan

## Database Architecture

**ORM and Migrations**
- Drizzle ORM for type-safe database operations
- PostgreSQL via Neon Database (@neondatabase/serverless)
- Schema-first approach with shared type definitions

**Database Schema**

**Users Table** (authentication system)
- `id`: UUID primary key
- `email`: Unique email address
- `password`: Hashed password (bcrypt, null for Google OAuth users)
- `googleId`: Google OAuth identifier
- `displayName`: User's display name
- `emailVerified`: Boolean flag for email verification status
- `verificationCode`: 6-digit code for email verification
- `codeExpiresAt`: Expiration timestamp for verification code (15 minutes)
- `lastCodeSentAt`: Timestamp of last verification email sent (for rate limiting)
- `verificationAttempts`: Counter for failed verification attempts (max 5)
- `createdAt`: Account creation timestamp

**Business Plans Table** (core entity)
- `id`: UUID primary key
- `tier`: Subscription level (basic/premium/enterprise)
- Business details: `businessName`, `industry`, `problem`, `uniqueness`, `technology`
- Viability fields: `experience`, `funding`, `revenue`
- Scalability fields: `jobCreation`, `expansion`, `vision`
- Generated outputs: `generatedContent`, `pdfUrl`
- Payment tracking: `stripeSessionId`
- `status`: Plan generation status (pending/processing/completed/failed)
- `createdAt`: Timestamp

## Features Ready to Develop (From Official Documents)

### Tier 1: Core Calculators (High Priority)
1. **Points Scoring Calculator** - Validates 70-point requirement (50 business + 10 English + 10 financial)
2. **Personal Savings Validator** - £1,270 for 28 days + dependant amounts
3. **Fee Estimator** - Application (£1,274-£1,590) + Endorsement (£1,000) + per-meeting (£500)
4. **Funding Appropriateness Checker** - Assess if funding amount matches business stage/needs
5. **Income & Viability Analyzer** - Revenue projections, runway calculations, sustainability

### Tier 2: Compliance & Eligibility Checkers
6. **English Language Qualification Checker** - Validates GCSE/A-Level/UK degree/Ecctis
7. **Switch Eligibility Validator** - Checks visa history (Student PhD 12-month rule, restrictions)
8. **Business Type Validator** - Ensures business is "new" (not joining existing trading business)
9. **Partner & Dependant Checker** - Evidence requirements (marriage, cohabitation, 2+ years)
10. **Document Compliance Checker** - Endorsement letter (3-month rule), translations, TB test

### Tier 3: Team & Settlement Planning
11. **Team Modeller** - Co-founder £50k validator, separate endorsement tracker
12. **Contact Point Meeting Scheduler** - Tracks minimum 2 meetings per applicant per visa period
13. **Settlement Planner** - 3-year continuous residence calculator, 180-day absence tracker
14. **Knowledge of Life in UK Test Guide** - Settlement requirement simulator
15. **Visa Extension Timeline Planner** - When to reapply, endorsement refresh timing

### Tier 4: Business Assessment Support
16. **Innovation Validator** - Checks for genuine, original plan + market need + competitive advantage
17. **Viability Analyzer** - Realistic planning, resource availability, applicant skills/knowledge assessment
18. **Scalability Planner** - Job creation numbers, growth trajectory, market expansion strategy
19. **Due Diligence Report Generator** - Fund source legitimacy checklist, wealth verification support
20. **Funding Source Validator** - Guidance on "appropriate" funds, legitimacy concerns, documentation

### Tier 5: Administrative & Tracking
21. **Endorsement Letter Template Generator** - Auto-fill template with applicant details
22. **Document Checklist Manager** - Personalized list based on applicant profile
23. **Timeline Calculator** - 3-week decision time, biometric appointment booking
24. **Endorsing Body Directory Mapper** - Link to approved endorsing bodies by sector
25. **Status Tracker Dashboard** - Application stage, endorsement validity dates, next actions

## PhD Scrutiny Issues ⚠️ CRITICAL DISCREPANCY

**ISSUE DETECTED**: The documents contain conflicting information about PhD students switching visas:

1. **Overview page says**: "you're studying for a PhD full time, and have been for at least 24 months"
2. **Eligibility page says**: "have completed at least 12 months of that course" (for PhD)

**WHICH IS CORRECT?** 
- 12 months (from Eligibility section) 
- OR 24 months (from Overview section)?

**ACTION REQUIRED**: This must be verified with Home Office before platform launch, as this affects PhD student visa switching eligibility significantly. Recommend:
- Email Home Office clarification
- Add platform disclaimer for PhD students until verified
- Flag in questionnaire with link to official guidance

**PLATFORM TREATMENT**: Currently implementing **12-month rule** (from Eligibility page) as this is more specific and detailed, but add RED WARNING on platform about this discrepancy.

## User Preferences

Preferred communication style: Simple, everyday language.

## Email Verification System

**Verification Flow**
1. User signs up with email/password → Account created, verification code generated
2. 6-digit code sent to email address (15-minute expiration)
3. User redirected to verification page to enter code
4. Code verified → Email marked as verified, user logged in
5. Google OAuth users automatically verified (trusted emails)

**Feature Flag: EMAIL_VERIFICATION_REQUIRED**
- **Default**: `false` (verification optional for MVP launch)

