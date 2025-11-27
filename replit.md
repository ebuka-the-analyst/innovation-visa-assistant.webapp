# UK Innovator Founder Visa Assistant

## Overview
The UK Innovator Founder Visa Assistant is an AI-powered platform designed to guide applicants through the UK Innovator Founder Visa process. It offers comprehensive tools and guidance across compliance, documentation, team management, business planning, financial modeling, and growth strategies, with the aim of delivering expert-level quality and 100% accuracy with UK Innovator Founder visa requirements. The project currently features 109 production-ready, professional-grade tools across 8 categories, aspiring to become the UK's #1 Visa AI Assistant.

## User Preferences
- **Preferred Language:** Everyday English
- **Critical Deadline:** 3-week visa application deadline
- **Development Speed:** Batch-first approach for rapid delivery
- **Quality Focus:** Expert-level tools worth £80-100 each

## System Architecture

### UI/UX Decisions
The platform features a modern, clean design utilizing `Shadcn UI` components, supporting dark mode and mobile responsiveness. Branding includes a professional logo with UK elements and growth symbolism in an orange (`#ffa536`) and blue (`#11b6e9`) gradient. `Recharts` is used for professional data visualizations, and the admin dashboard incorporates Glassmorphism effects and Framer Motion animations.

### Technical Implementations
The frontend is built with `React`, `TypeScript`, and `Vite`, using `Wouter` for routing and `TanStack React Query` for data management. `localStorage` handles client-side progress saving. The backend, developed with `Express.js` and `Node.js`, provides API routes, robust authentication, and database integration. Each tool includes features like `Save Progress`, `Smart Tips`, `Action Plan`, `Export Report`, `Restore`, `QR Code Mobile Transfer`, `Social Share Buttons`, `File Upload MVP`, real compliance scoring, and interactive checklists. Performance optimizations include backend compression, `React Query` optimization, resource hints, and critical lazy loading.

### System Design Choices
The project follows a batch development approach, categorizing 108 tools into Compliance, Documentation, Team, Business, Financial, Growth, Innovation, and Defense. Authentication uses a dual system with email/password and Google OAuth, incorporating server-side Cloudflare Turnstile bot protection and token-based email verification. A comprehensive, admin-only dashboard provides real-time analytics, user and business plan management, tool usage insights, and system health monitoring. The platform implements a production-ready, bulletproof tier-based access control system with five tiers (Free, Basic, Premium, Enterprise, Ultimate), enforced by a `ToolAccessGuard` component, `useTierAccess` hook, and `PremiumUpgradeOverlay`.

The system includes comprehensive, enterprise-grade SEO infrastructure following 2025 best practices, focusing on E-E-A-T signals, Core Web Vitals, and AI search readiness. This involves a `robots.txt`, `sitemap.xml`, `SEOHead` component, Schema library, and custom Express middleware for server-side meta injection. Comprehensive SEO content pages include an FAQ page and an Ultimate Guide.

An auto-save and session persistence system ensures data integrity, with full session state saved to `localStorage` for AI interview sessions and a `useAutoSaveWithIndicator` hook for tools. An AI-driven tool mode system allows tools to operate in either an AI-guided conversational interface or a traditional form-based input, supported by four specialized AI agents (Nova, Sterling, Atlas, Sage). A founder visa application prefill system helps pre-populate forms with founder data (`shared/founderData.ts`) and includes OISC compliance integration for all exports. A real-time error logging system captures and tracks client, API, AI, auth, export, and database errors, with live monitoring and resolution workflow in the admin dashboard.

## External Dependencies
- **Database:** `PostgreSQL` managed by `Neon`.
- **ORM:** `Drizzle ORM`.
- **Charting Library:** `Recharts`.
- **UI Framework:** `Shadcn UI`.
- **Authentication:** Google OAuth 2.0 (via `passport-google-oauth20`).
- **Session Management:** `express-session` with `connect-pg-simple`.
- **Bot Protection:** Cloudflare Turnstile.
- **Email Service:** Resend.
- **Deployment:** Railway.