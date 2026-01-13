# UK Innovator Founder Visa Assistant - Design Guidelines

## Brand Identity

The UK Innovator Founder Visa Assistant uses a professional NHS Blue-inspired color palette that conveys trust, authority, and UK governmental credibility. This design language reflects the platform's official nature as a visa assistance service.

## Core Design Elements

### A. Color Palette

**Primary Colors**
| Color | Hex | HSL | Usage |
|-------|-----|-----|-------|
| NHS Blue (Primary) | #005EB8 | 209, 100%, 36% | Primary brand, buttons, links |
| NHS Dark Blue | #003087 | 219, 100%, 27% | Headers, footers, sidebar |
| NHS Light Blue | #41B6E6 | 197, 76%, 58% | Accents, highlights, Nova agent |
| NHS Bright Blue | #0072CE | 206, 100%, 40% | Interactive elements |

**Accent Colors**
| Color | Hex | HSL | Usage |
|-------|-----|-----|-------|
| Gold (CTA) | #eab308 | 48, 96%, 47% | Primary calls-to-action, Sterling agent |
| Gold Hover | #ca8a04 | 45, 93%, 40% | Button hover states |
| Emerald Green (Success) | #059669 | 160, 84%, 39% | Success states, Atlas agent |
| Emerald Dark | #047857 | 162, 90%, 28% | Green hover states |

**AI Agent Color System**
| Agent | Role | Primary | Gradient |
|-------|------|---------|----------|
| Nova | Innovation | #41B6E6 | from-[#41B6E6] to-[#0072CE] |
| Sterling | Financial | #eab308 | from-[#eab308] to-[#ca8a04] |
| Atlas | Growth | #059669 | from-[#059669] to-[#047857] |
| Sage | Compliance | #005EB8 | from-[#005EB8] to-[#003087] |

**Semantic Colors**
| Purpose | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | HSL 210 40% 98% | HSL 219 100% 6% |
| Card | #FFFFFF | HSL 219 80% 10% |
| Border | HSL 209 30% 85% | HSL 209 60% 20% |
| Destructive | HSL 0 84% 60% | HSL 0 84% 60% |

### B. Typography

**Primary Font**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
**Display Font**: Fraunces, Georgia, serif (headlines only)
**Monospace Font**: ui-monospace, SFMono-Regular, Menlo, monospace

**PHD-LEVEL FLUID TYPOGRAPHY SYSTEM** (ADHD-Friendly, Device-Perfect):

| Token | CSS Variable | Clamp Formula | Usage |
|-------|--------------|---------------|-------|
| --fs-xs | text-fluid-xs | clamp(0.75rem, 0.7rem + 0.2vw, 0.9rem) | Captions, timestamps |
| --fs-sm | text-fluid-sm | clamp(0.9rem, 0.85rem + 0.3vw, 1.05rem) | Labels, descriptions |
| --fs-md | text-fluid-md | clamp(1rem, 0.95rem + 0.4vw, 1.2rem) | Body text, buttons |
| --fs-lg | text-fluid-lg | clamp(1.3rem, 1.1rem + 0.8vw, 1.8rem) | Section headings |
| --fs-xl | text-fluid-xl | clamp(1.8rem, 1.5rem + 1.5vw, 2.8rem) | Page titles |
| --fs-xxl | text-fluid-xxl | clamp(2.4rem, 2rem + 2vw, 3.6rem) | Hero text only |

**PHD-LEVEL FLUID SPACING SYSTEM**:

| Token | CSS Variable | Clamp Formula | Usage |
|-------|--------------|---------------|-------|
| --space-xs | gap-fluid-xs, p-fluid-xs | clamp(0.4rem, 0.3rem + 0.5vw, 0.8rem) | Tight spacing |
| --space-sm | gap-fluid-sm, p-fluid-sm | clamp(0.6rem, 0.5rem + 0.8vw, 1.2rem) | Small gaps |
| --space-md | gap-fluid-md, p-fluid-md | clamp(1rem, 0.8rem + 1vw, 2rem) | Default padding |
| --space-lg | gap-fluid-lg, p-fluid-lg | clamp(1.5rem, 1.2rem + 2vw, 3rem) | Section spacing |
| --space-xl | gap-fluid-xl, p-fluid-xl | clamp(2.5rem, 2rem + 3vw, 5rem) | Page margins |

**ADHD-Friendly Design Rules**:
- NEVER use text-3xl, text-4xl, text-5xl or larger on any page
- All text scales fluidly with viewport - no jarring size changes
- Use fluid-panel class for cards with perfect responsive padding
- Use fluid-grid class for auto-fit responsive layouts
- Content MUST fit in user's first viewport when possible
- Strong contrast, generous spacing, predictable layout rhythm

**Settings**:
- Line-height: 1.6 (body), 1.2 (headings)
- Letter-spacing: -0.02em (large headings)
- Use `tabular-nums` for financial tables
- Fluid radius: clamp(10px, 1vw, 18px)

### C. Layout System

**Spacing Tokens** (4px base unit):
- Core units: 2, 4, 8, 12, 16, 20, 24 (Tailwind: p-2, p-4, p-8, etc.)
- Section margins: 16 (64px) for major content blocks
- Card padding: 6 (24px)
- Button padding: 3 vertical, 6 horizontal

**Grid System**:
- 12-column fluid grid
- Gutters: 24px (desktop), 16px (tablet), 12px (mobile)
- Container max-widths: sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px

**Border Radius**: 0.75rem (12px) - Rounded but not pill-shaped

**Breakpoints**:
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

### D. Component Library

**Glassmorphism Effects**:
- Light mode: `rgba(255, 255, 255, 0.7)` background
- Dark mode: `rgba(15, 23, 42, 0.7)` background
- Border: `rgba(255, 255, 255, 0.5)` (light) / `rgba(255, 255, 255, 0.1)` (dark)
- Shadow: `0 8px 32px rgba(31, 38, 135, 0.15)` (light) / `rgba(0, 94, 184, 0.2)` (dark)
- Blur: `backdrop-filter: blur(12px)`

**Cards**:
- Semi-transparent backgrounds with glassmorphism
- Subtle NHS Blue-tinted shadows
- Hover: elevate with `translateY(-8px)`, shimmer gradient animation

**AI Agent Avatars** (4 characters):
1. **Nova** (Innovation - NHS Light Blue #41B6E6): Hexagon/circuit geometric design
2. **Sterling** (Financial - Gold #eab308): Calculator/growth chart motifs
3. **Atlas** (Growth - Emerald #059669): Expanding node network
4. **Sage** (Compliance - NHS Blue #005EB8): Checkmark/shield elements
- Size: 80px circular avatars
- Animated gradient backgrounds with rotating particles
- Active agent: 1.3x scale, pulsing animation

**Buttons**:
- Primary: NHS Blue background (#005EB8), white text
- Gold CTA: Gold background (#eab308), NHS Dark Blue text (#003087)
- Outline: White border on dark backgrounds with hover elevation
- Ghost: Transparent with hover elevation
- Glassmorphic background with blur for special uses
- Hover: subtle elevation, scale(1.02)
- Active: press effect with scale(0.98)

**Sidebar** (Fixed across themes):
- Background: NHS Dark Blue (#003087)
- Text: White (#FFFFFF)
- Active Item: Lighter blue highlight
- Border: Darker blue accent

**Header/Navigation**:
- Background: NHS Dark Blue (#003087)
- Logo/Text: White
- CTA Button: Gold (#eab308)

### E. Animations

**Custom Keyframe Animations**:
- `rotate-glow`: NHS Blue rotating glow (3s linear infinite)
- `rotate-glow-gold`: Gold rotating glow for tools widget
- `pulse-glow`: NHS Blue pulsing glow for chat
- `pulse-glow-gold`: Gold pulsing glow for tools
- `ping-slow`: 7s double flash with 5s pause
- `widget-swipe-pulse`: Gold ADHD-friendly swipe animation

**Timing Functions**:
- Entrances: ease-out (0.25s)
- Exits: ease-in (0.2s)
- State changes: ease-in-out (0.3s)
- Playful bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)

**GPU-Optimized**:
- Use transform/opacity only for animations
- Apply will-change sparingly, remove after completion

### F. Shadows

**NHS Blue-Tinted Shadow Scale**:
- shadow-2xs: `0px 1px 2px hsl(209 100% 36% / 0.05)`
- shadow-xs: `0px 1px 3px hsl(209 100% 36% / 0.08)`
- shadow-sm: `0px 2px 4px hsl(209 100% 36% / 0.08)`
- shadow: `0px 4px 6px hsl(209 100% 36% / 0.08)`
- shadow-md: `0px 6px 10px hsl(209 100% 36% / 0.10)`
- shadow-lg: `0px 10px 15px hsl(209 100% 36% / 0.12)`
- shadow-xl: `0px 20px 25px hsl(209 100% 36% / 0.12)`
- shadow-2xl: `0px 25px 50px hsl(209 100% 36% / 0.25)`

### G. Charts (Recharts)

| Chart Variable | Color | Purpose |
|----------------|-------|---------|
| chart-1 | NHS Blue (209, 100%, 36%) | Primary data |
| chart-2 | Emerald (160, 84%, 39%) | Secondary data |
| chart-3 | Purple (280, 65%, 60%) | Tertiary data |
| chart-4 | Gold (43, 96%, 56%) | Accent data |
| chart-5 | Cyan (190, 95%, 39%) | Additional data |

## Page-Specific Guidelines

**Landing Page**:
- Hero: Split layout with NHS Blue gradient accents
- Headline: Professional, authority-conveying messaging
- Dual CTA: NHS Blue primary + Gold secondary
- Trust signals with UK government-inspired styling

**Pricing Page**:
- Three-tier cards with NHS Blue hierarchy
- Featured tier: Gold accent, elevated positioning
- Trust badges with NHS styling

**Dashboard**:
- NHS Dark Blue sidebar navigation
- White/light content area
- Gold accent for important actions
- NHS Blue for navigation and links

## Accessibility

- Color contrast: min 4.5:1 (text), 3:1 (large text)
- Keyboard navigation: visible focus indicators (NHS Blue outline)
- ARIA landmarks: nav, main, aside
- Touch targets: min 44x44px
- Reduced motion: respect `prefers-reduced-motion`

## Implementation Notes

- Mobile-first CSS with progressive enhancement
- Use Tailwind for utility-first styling
- Radix UI (via Shadcn) for accessible primitives
- CSS variables for all brand colors
- Dark mode via `.dark` class toggle
- Target 60fps animations
