# UK Innovator Founder Visa Assistant

## Overview
The UK Innovator Founder Visa Assistant is an AI-powered platform designed to assist applicants with the UK Innovator Founder Visa process. The project aims to provide comprehensive tools and guidance, covering compliance, documentation, team management, business planning, financial modeling, and growth strategies. The goal is to deliver PhD-level quality tools, each valued at £80-100, to streamline the visa application process and maximize success rates. The platform focuses on accuracy with UK visa requirements and offers interactive, data-driven insights. The ambition is to become the UK's #1 Visa AI Assistant.

## User Preferences
- **Preferred Language:** Everyday English
- **Critical Deadline:** 3-week visa application deadline
- **Development Speed:** Batch-first approach for rapid delivery
- **Quality Focus:** PhD-level tools worth £80-100 each

## System Architecture

### UI/UX Decisions
The platform utilizes a modern, clean design with `Shadcn UI` components. Branding includes the BhenMedia logo with an orange (`#ffa536`) and blue (`#11b6e9`) color scheme. All tool pages are constrained with `max-w-6xl mx-auto` or `max-w-7xl mx-auto` for optimal readability. The interface supports dark mode and is mobile-responsive. Each tool incorporates a `ToolUtilityBar` for consistent actions (Save, Tips, Plan, Export, Restore, QR, Share). Professional charts (Bar, Pie, Line, Scatter, Radar) are rendered using `Recharts` for data visualization.

### Technical Implementations
- **Frontend:** Built with `React`, `TypeScript`, and `Vite`. `Wouter` is used for client-side routing. `TanStack React Query` manages data fetching and caching. `localStorage` is used for client-side progress saving and session restoration.
- **Backend:** Developed with `Express.js` and `Node.js`, providing robust API routes, an authentication system, and database integration.
- **Key Features per Tool:**
    - `Save Progress`: Local storage with timestamps.
    - `Smart Tips`: Context-aware recommendations.
    - `Action Plan`: Prioritized 4-week timeline.
    - `Export Report`: Downloadable text files.
    - `Restore`: Load previous sessions.
    - `QR Code Mobile Transfer`: Scan QR codes to transfer work to mobile, storing state in `localStorage` and clearing after consumption.
    - `Social Share Buttons`: Share tools via WhatsApp, Email, Twitter, LinkedIn.
    - `File Upload MVP`: Upload documents (PDF, DOCX, TXT, JPG, PNG, HEIC) with mobile camera access, metadata tracking, and `localStorage` persistence.
    - Real compliance scoring (0-100%) with critical/high/medium priority assessments.
    - Interactive checklists and expandable guidance.
    - Real business logic and calculations for all tools.
    - `data-testid` attributes on interactive elements for testing.

### System Design Choices
The project follows a batch development approach, completing categories of tools before moving to the next. Each tool is designed to be production-ready, offering genuine value and interactive guidance based on UK visa requirements. The architecture supports a total of 110 tools across various categories (Compliance, Documentation, Team, Business, Financial, Growth, Innovation, Defense).

## External Dependencies
- **Database:** `PostgreSQL` managed by `Neon` for data storage.
- **ORM:** `Drizzle ORM` for database interactions.
- **Charting Library:** `Recharts` for professional data visualizations.
- **UI Framework:** `Shadcn UI` for frontend components.
- **Authentication:** Custom authentication system.
- **HMAC Security:** Used for session handoff token security.