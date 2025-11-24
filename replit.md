# UK Innovator Founder Visa Assistant

## Overview
The UK Innovator Founder Visa Assistant is an AI-powered platform designed to guide applicants through the UK Innovator Founder Visa process. It provides comprehensive tools and guidance across compliance, documentation, team management, business planning, financial modeling, and growth strategies. The project aims to deliver PhD-level quality tools, ensuring 100% accuracy with UK Innovator Founder visa requirements. The ambition is to become the UK's #1 Visa AI Assistant. The platform currently features 128 production-ready, PhD-level tools across 8 categories.

## User Preferences
- **Preferred Language:** Everyday English
- **Critical Deadline:** 3-week visa application deadline
- **Development Speed:** Batch-first approach for rapid delivery
- **Quality Focus:** PhD-level tools worth £80-100 each

## System Architecture

### UI/UX Decisions
The platform features a modern, clean design using `Shadcn UI` components. Branding uses a professional logo incorporating UK elements with growth symbolism in an orange (`#ffa536`) and blue (`#11b6e9`) gradient color scheme. The favicon features a UK flag with an upward arrow symbolizing innovation and growth. Tool pages are constrained for optimal readability, supporting dark mode and mobile responsiveness. Each tool includes a `ToolUtilityBar` for consistent actions, and `Recharts` is used for professional data visualizations. The admin dashboard uses Glassmorphism effects, gradient backgrounds, and Framer Motion animations for a professional and interactive experience.

### Technical Implementations
The frontend is built with `React`, `TypeScript`, and `Vite`, using `Wouter` for routing and `TanStack React Query` for data management. `localStorage` handles client-side progress saving. The backend, developed with `Express.js` and `Node.js`, provides API routes, robust authentication, and database integration. Each tool features `Save Progress`, `Smart Tips`, `Action Plan`, `Export Report`, `Restore`, `QR Code Mobile Transfer`, `Social Share Buttons`, `File Upload MVP`, real compliance scoring, interactive checklists, and business logic specific to visa requirements. Performance optimizations include backend compression (Gzip/brotli), `React Query` optimization, resource hints, and critical lazy loading for all tool pages to reduce initial bundle size and improve load times.

### System Design Choices
The project follows a batch development approach, with 128 tools categorized into Compliance, Documentation, Team, Business, Financial, Growth, Innovation, and Defense. Authentication uses a dual system with email/password and Google OAuth, including smart conflict detection, server-side Cloudflare Turnstile bot protection, token-based email verification, and secure password reset functionality with 1-hour expiring tokens. A comprehensive, admin-only dashboard provides real-time analytics, user and business plan management, tool usage insights, and system health monitoring, protected by `requireAdmin` middleware. The system supports demo business plans to showcase full functionality to new users.

## External Dependencies
- **Database:** `PostgreSQL` managed by `Neon`.
- **ORM:** `Drizzle ORM`.
- **Charting Library:** `Recharts`.
- **UI Framework:** `Shadcn UI`.
- **Authentication:** Google OAuth 2.0 (passport-google-oauth20).
- **Session Management:** `express-session` with `connect-pg-simple`.
- **Bot Protection:** Cloudflare Turnstile.
- **Email Service:** Resend.
- **Deployment:** Railway.