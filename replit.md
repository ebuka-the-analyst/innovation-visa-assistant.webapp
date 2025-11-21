# VisaPrep AI - Business Plan Generator

## Overview

VisaPrep AI is a SaaS application that generates professional business plans for UK Innovation Visa (Innovator Founder) applicants. The platform uses AI (OpenAI GPT) to create comprehensive, endorsing body-ready business plans covering the three key visa criteria: Innovation, Viability, and Scalability. Users complete a multi-step questionnaire, purchase a tier (Basic, Premium, or Enterprise), and receive a professionally formatted PDF business plan within minutes.

## Critical Information - Updated November 2025

### Innovator Founder Visa (Replaced Old Innovator Visa)

**Key Changes from Old Visa:**
- NO fixed £50,000 minimum investment requirement
- Funding must be "appropriate" and "sufficient" for YOUR business plan
- Could be less than, equal to, or more than £50k depending on business needs
- Endorsing bodies assess appropriateness based on your specific circumstances

**Official Requirements:**
- Personal savings: £1,270 (28 consecutive days)
- Business funding: "Appropriate" amount (no fixed minimum)
- No investment needed if business already established/endorsed

**Visa Fees (Nov 2025):**
- Application: £1,274 (outside UK) or £1,590 (extension/switch in UK)
- Endorsement assessment: £1,000
- Per-meeting fee: £500 each (minimum 2 meetings required)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**
- React with TypeScript for type safety and component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (replaces React Router)
- TanStack Query (React Query) for server state management and API calls
- Tailwind CSS for utility-first styling with custom design tokens

**UI Component System**
- shadcn/ui component library (Radix UI primitives) for accessible, customizable components
- Custom design system inspired by premium SaaS platforms (Stripe, Linear, Notion)
- Holographic/glassmorphic aesthetic with gradient accents
- Responsive design with mobile-first breakpoints
- Typography using Inter (UI) and Playfair Display (headings)

**Key Pages**
- Home: Marketing page with hero, features, AI agents showcase, pricing, testimonials, and FAQ
- Dashboard: Shows user's business plans with radar charts for Innovation/Viability/Scalability scores, demo data included
- Questionnaire: Multi-step form collecting business information across 4 stages (Business Overview, Innovation, Viability, Scalability)
- Generation: Real-time progress tracking with animated AI agent workflow
- Tools Hub: 104+ comprehensive visa application tools organized by category
- Endorser Investment Requirements: Official funding guidance based on GOV.UK

**State Management Pattern**
- Server state handled by React Query with custom `apiRequest` helper
- Form state managed locally with React Hook Form
- URL parameters for cross-page data flow (tier selection, plan ID, session ID)

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript throughout for type consistency
- Custom logging middleware for API request tracking
- Session-based authentication with Passport.js
- Email/password + Google OAuth authentication
- Email verification system with 6-digit codes

**API Design**
- RESTful endpoints under `/api` prefix
- Authentication endpoints:
  - `POST /api/auth/signup` - Create new account and send verification email
  - `POST /api/auth/login` - Email/password login
  - `POST /api/auth/verify-code` - Verify email with 6-digit code
  - `POST /api/auth/resend-code` - Resend verification code (rate limited)
  - `GET /api/auth/google` - Initiate Google OAuth flow
  - `GET /api/auth/callback/google` - Google OAuth callback
  - `POST /api/auth/logout` - End user session
  - `GET /api/auth/me` - Get current user
- Business plan endpoints:
  - `POST /api/questionnaire/submit` - Saves questionnaire data and creates business plan record
  - `POST /api/payment/create-checkout` - Initiates Stripe payment session
  - `POST /api/payment/verify` - Verifies payment completion
  - `POST /api/generate/:planId` - Triggers AI business plan generation
  - `GET /api/download/:planId` - Serves generated PDF

**Business Logic Flow**
1. User completes questionnaire → Creates pending business plan record
2. User redirected to Stripe checkout
3. Payment webhook or verification updates plan status
4. AI generation process creates business plan content using OpenAI
5. PDF generated from HTML template
6. User downloads completed PDF

**PDF Generation**
- Server-side HTML template rendering
- Professional business plan formatting with cover page, sections, and styling
- In-memory or file-based PDF storage (implementation varies by tier)

### Database Architecture

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

**Design Rationale**
- Single-table design for business plans keeps all questionnaire data together
- JSONB fields avoided in favor of typed columns for better type safety
- Status field enables workflow tracking and retry logic
- Stripe session ID links payment to business plan record

### External Dependencies

**Payment Processing**
- **Stripe**: Payment gateway for subscription tiers
  - Integration: `@stripe/stripe-js` (client), `stripe` SDK (server)
  - Webhook support for payment confirmation
  - Checkout Sessions for secure payment flow
  - Pricing: £49 (Basic), £99 (Premium), £199 (Enterprise)

**AI Content Generation**
- **OpenAI API**: GPT-4 for business plan generation
  - Integration: `openai` SDK
  - Generates comprehensive business plan content based on questionnaire responses
  - Tailored prompts for visa compliance (Innovation, Viability, Scalability criteria)

**Email Service**
- **Resend**: Transactional email service for verification codes
  - Integration: REST API with fetch
  - Sends 6-digit verification codes to new users
  - Professional HTML email templates with VisaPrep branding
  - Free tier: 100 emails/day, 3,000 emails/month
  - Configuration: `RESEND_API_KEY` environment variable
  - Default sender: `onboarding@resend.dev` (can be customized with verified domain)

**Database**
- **Neon Database**: Serverless PostgreSQL
  - Integration: `@neondatabase/serverless` with WebSocket support
  - Connection pooling for scalability
  - Environment-based configuration via `DATABASE_URL`

**Fonts**
- **Google Fonts**: Inter and Playfair Display
  - Loaded via CDN in HTML head
  - Inter for body text and UI elements
  - Playfair Display for serif headlines

**Asset Storage**
- Local file system for generated images (AI agent avatars, hero images)
- Stored in `attached_assets/generated_images/` directory
- Referenced via Vite aliases (`@assets`)

**Development Tools**
- **Replit-specific plugins**: Development banner, cartographer, runtime error overlay
  - Conditional loading in development mode only
  - Enhanced developer experience on Replit platform

**Styling Dependencies**
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS/Autoprefixer**: CSS processing pipeline
- **class-variance-authority**: Type-safe component variant management
- **tailwind-merge**: Intelligent class name merging via `cn()` utility

## Email Verification System

**Verification Flow**
1. User signs up with email/password → Account created, verification code generated
2. 6-digit code sent to email address (15-minute expiration)
3. User redirected to verification page to enter code
4. Code verified → Email marked as verified, user logged in
5. Google OAuth users automatically verified (trusted emails)

**Abuse Protection**
- **Code Expiration**: Verification codes expire after 15 minutes
- **Attempt Limiting**: Maximum 5 verification attempts per code
- **Rate Limiting**: 
  - Resend code: Max 1 email per 2 minutes
  - Prevents spam and abuse of email service
- **Attempt Counter**: Tracks failed verification attempts, resets on new code

**Email Templates**
- Professional HTML emails with VisaPrep branding
- Gradient header with logo
- Large, readable verification code display
- Security tips and help information
- Mobile-responsive design

**Implementation Details**
- Email sending: `server/email.ts` (Resend API integration)
- Code generation: Cryptographically random 6-digit numbers
- Storage: Database fields track code, expiration, attempts, and last sent time
- Frontend: Dedicated `/verify-email` page with countdown timers and UX feedback

**Feature Flag: EMAIL_VERIFICATION_REQUIRED**
- **Purpose**: Control whether email verification is required for signup
- **Default**: `false` (verification optional for MVP launch)
- **Location**: Environment variable in Replit Secrets
- **Behavior**:
  - When `false` (default): Users auto-verified and logged in immediately after signup, no verification email sent
  - When `true`: Traditional email verification flow with 6-digit code required
- **Rationale**: 
  - Resend free tier only sends to verified account email (benedict9211@gmail.com)
  - Domain verification required to send to other recipients
  - Feature flag allows MVP launch without blocking signups
  - Google OAuth provides trusted verified emails as recommended path
- **Security**: Acceptable risk for MVP given Stripe payment flow + rate limits + monitoring
- **Future**: Flip to `true` once domain verified in Resend (see resend.com/domains)
- **Files Modified**:
  - `server/authRoutes.ts`: Conditional verification logic
  - `client/src/pages/signup.tsx`: Conditional redirect (verify-email vs dashboard)

## Dashboard Demo Data

The dashboard includes realistic demo data for showcase purposes:
- **BhenMedia** (Premium tier, completed) - VisaPrep AI company with full business plan
- **NeuroData Analytics** (Enterprise tier, completed) - Healthcare AI/ML example
- **GreenTech Solutions** (Basic tier, generating) - Shows in-progress state
- **SwiftLegal AI** (Premium tier, pending) - Shows pending state

Demo data is replaced when user creates real business plans.
