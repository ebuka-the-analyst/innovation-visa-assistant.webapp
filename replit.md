# VisaPrep AI - Business Plan Generator

## Overview

VisaPrep AI is a SaaS application that generates professional business plans for UK Innovation Visa applicants. The platform uses AI (OpenAI GPT) to create comprehensive, endorsing body-ready business plans covering the three key visa criteria: Innovation, Viability, and Scalability. Users complete a multi-step questionnaire, purchase a tier (Basic, Premium, or Enterprise), and receive a professionally formatted PDF business plan within minutes.

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
- Questionnaire: Multi-step form collecting business information across 4 stages (Business Overview, Innovation, Viability, Scalability)
- Generation: Real-time progress tracking with animated AI agent workflow

**State Management Pattern**
- Server state handled by React Query with custom `apiRequest` helper
- Form state managed locally with React Hook Form
- URL parameters for cross-page data flow (tier selection, plan ID, session ID)

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript throughout for type consistency
- Custom logging middleware for API request tracking
- Session-based architecture (no authentication implemented yet)

**API Design**
- RESTful endpoints under `/api` prefix
- Key endpoints:
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

**Users Table** (authentication foundation, not fully implemented)
- `id`: UUID primary key
- `username`: Unique identifier
- `password`: Hashed password storage

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