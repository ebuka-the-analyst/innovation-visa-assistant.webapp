# UK Innovator Founder Visa Assistant

## Overview
The UK Innovator Founder Visa Assistant is an AI-powered platform designed to assist applicants with the UK Innovator Founder Visa process. The project aims to provide comprehensive tools and guidance, covering compliance, documentation, team management, business planning, financial modeling, and growth strategies. The goal is to deliver PhD-level quality tools, each valued at £80-100, to streamline the visa application process and maximize success rates. The platform focuses on 100% accuracy with UK Innovator Founder visa requirements ONLY (as of November 23, 2025) and offers interactive, data-driven insights. The ambition is to become the UK's #1 Visa AI Assistant.

**Current Progress:** 35 production-ready tools complete (13 Compliance + 13 Documentation + 9 Team)

## Recent Changes (November 23, 2025)

### Team Tools Batch Complete (9/9)
All Team Tools completed with 100% UK Innovator Founder visa focus, architect-approved PASS rating:

1. **Compensation Planning** - Budget planning for job creation (5 jobs @ £25k+ for ILR), employer NI (13.8%), pension (3%), real salary calculations
2. **Role Designer** - Organizational design for scalability, role clarity, team structure planning
3. **Succession Planning** - Business continuity (ISO 22301), critical role coverage, succession readiness scoring
4. **Culture Framework** - Culture strength assessment, retention impact, values alignment for team viability
5. **Diversity & Inclusion** - Innovation through diversity (McKinsey research: +25% innovation), pay equity analysis, talent pool expansion
6. **Leadership Development** - Leadership bench strength (McKinsey 9-Box), development ROI (2.5x), productivity gains (+25%)
7. **Retention Strategy** - Turnover cost analysis (1.5x salary), retention health scoring, risk mitigation for viability
8. **Performance Management** - Team performance scoring, pay-performance alignment, execution capability demonstration
9. **Skills Matrix** - Skill coverage analysis, critical gap identification, business continuity planning

**Key Features (All 9 Tools):**
- 4 distinct Recharts dashboards per tool (Bar/Line/Pie/Radar/Area/Scatter combinations)
- Documented calculation methodologies with formulas in export reports
- 100% alignment with Innovation/Viability/Scalability visa criteria
- GOV.UK sources cited (Innovator Founder visa, November 2025)
- Zero Skilled Worker visa references (no SOC codes, no £41,700/£38,700/£25,600 thresholds)
- localStorage save/restore functionality
- ToolUtilityBar integration (Save, Tips, Plan, Export, Restore, QR, Share)
- File upload support for supporting documents
- Smart recommendations based on visa requirements

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