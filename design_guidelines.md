# VisaPrep AI - Design Guidelines

## Design Approach

**Reference-Based Approach**: Draw inspiration from premium SaaS platforms (Stripe, Linear, Notion) while incorporating futuristic holographic aesthetics. The design must convey innovation, trust, and professionalism—critical for visa applicants demonstrating business credibility.

## Core Design Elements

### A. Typography

**Primary Font**: Inter or Satoshi (UI elements, body text)
**Display Font**: Fraunces or Playfair Display (headlines only)

**Type Scale** (Perfect Fourth - 1.333 ratio):
- h1: 87px (display headlines)
- h2: 65px (section headers)
- h3: 49px (subsection headers)
- h4: 37px (card titles)
- h5: 28px (component headers)
- h6: 21px (labels)
- body: 16px (mobile 14px, desktop 18px)
- caption: 12px

**Settings**:
- Line-height: 1.5 (body), 1.2 (headings)
- Letter-spacing: -0.02em (large headings)
- Use `tabular-nums` for financial tables
- Responsive sizing with clamp(): `clamp(2rem, 5vw, 5.4rem)`

### B. Layout System

**Spacing Tokens** (4px base unit):
- Core units: 2, 4, 8, 12, 16, 20, 24 (Tailwind: p-2, p-4, p-8, etc.)
- Section margins: 16 (64px) for major content blocks
- Card padding: 6 (24px)
- Button padding: 3 vertical, 6 horizontal

**Grid System**:
- 12-column fluid grid
- Gutters: 24px (desktop), 16px (tablet), 12px (mobile)
- Container max-widths: sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px

**Breakpoints**:
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

### C. Component Library

**Holographic Cards**:
- Glassmorphic design: `backdrop-filter: blur(20px)`
- Semi-transparent backgrounds: `rgba(17, 182, 233, 0.1)`
- Subtle borders: `1px solid rgba(255, 255, 255, 0.18)`
- Multi-layer shadows: `0 8px 32px rgba(17, 182, 233, 0.15)` + inset highlights
- Hover: elevate with `translateY(-8px)`, shimmer gradient animation

**AI Agent Avatars** (4 characters):
1. **Nova** (Innovation - #11b6e9): Hexagon/circuit geometric design
2. **Sterling** (Financial - #FFD700): Calculator/growth chart motifs
3. **Atlas** (Growth - #10B981): Expanding node network
4. **Sage** (Compliance - #8B5CF6): Checkmark/shield elements
- Size: 80px circular avatars
- Animated gradient backgrounds with rotating particles
- Active agent: 1.3x scale, pulsing animation

**Agent Handover Animation**:
- Horizontal lineup (vertical on mobile)
- SVG path animation connecting agents (500ms ease-in-out)
- Document icon travels along path using CSS offset-path
- Particle stream effect (Three.js) showing data transfer
- Progress percentage and time remaining below

**Spatial Timeline** (Generation Progress):
- Fixed position: left 5% (desktop), bottom 80px (mobile)
- Nodes: 40px circles with icons
- Connected by gradient SVG paths with stroke-dasharray animation
- Active node: pulsing scale + rotating orbital ring
- States: completed (green checkmark), pending (hollow), current (animated)

**AR-Inspired Panels** (Modals/Dialogs):
- Ultra-low opacity dark background: `rgba(10, 10, 10, 0.85)`
- Heavy backdrop blur: 30px
- Entrance: slide from right + fade + subtle rotation
- Holographic corner indicators (triangular SVGs with animated gradients)
- Gesture interactions: swipe to dismiss (mobile), parallax cursor tracking (desktop)

**Buttons**:
- Glassmorphic background with blur
- Hover: `hue-rotate(15deg)`, `scale(1.02)`, elevated shadow
- Active: `translateZ(-10px)` 3D press effect
- On images: blurred background, no custom hover states (native Button styling)

**Forms & Inputs**:
- Floating label pattern
- Touch targets: min 44px height
- Inline validation on blur
- Error states: red left border, icon, shake animation
- Progressive disclosure for follow-up questions

**Progress Indicators**:
- Circular: SVG circle with stroke-dasharray (280px diameter)
- Inside ring: active agent avatar + percentage
- Typewriter animation for task descriptions
- Ambient particle background (floating dots in brand colors)

**Document Cards**:
- Aspect ratio 16:9, min-height 240px
- Top: holographic gradient + icon + date
- Middle: title (2-line truncation)
- Bottom: status badge + action buttons
- Hover sequence: elevate → shimmer → reveal preview button

**Navigation**:
- Desktop: 280px sidebar (collapsible to 64px icons)
- Mobile: bottom tab bar (5 icons)
- Sticky header: 60px (desktop), 48px (mobile)
- Z-index: sidebar 10, header 20, modals 1000

### D. Animations

**Timing Functions**:
- Entrances: ease-out (0.25s)
- Exits: ease-in (0.2s)
- State changes: ease-in-out (0.3s)
- Playful bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)

**Key Animations**:
- Route transitions: fade + translateY(20px→0), 400ms, stagger children 50ms
- Button press: scale(0.97), 100ms
- Loading skeletons: shimmer gradient sweep, 2s infinite
- Scroll-triggered: Intersection Observer, opacity 0→1 + translateY(40px→0)
- Use transform/opacity only (GPU-accelerated)
- Apply will-change sparingly, remove after completion

**3D Effects**:
- Perspective containers: `perspective: 1000px`
- Pricing cards: hover applies `translateZ(50px) rotateY(-5deg)` to selected, `translateZ(-20px)` to siblings
- Scroll animations: cards rotate from `rotateX(-15deg)` to flat on entry

## Page-Specific Guidelines

**Landing Page**:
- Hero: Split layout (55% text, 45% 3D mockup of business plan)
- Headline: "Get Your UK Innovation Visa Approved - AI-Generated Business Plans in Minutes"
- Dual CTA: primary button + "See Sample Plan" link
- Trust signals: "Join 500+ approved applicants" with count-up animation
- Sections: Hero, Features (cards), Pricing, Testimonials, FAQ

**Pricing Page**:
- Three-tier cards: Basic (gray), Premium (brand gradient, elevated, "Most Popular"), Enterprise (navy)
- Center tier: translateY(-20px), scale(1.05)
- Below: testimonial carousel, FAQ accordion, trust badges

**Questionnaire**:
- Full-screen steps with progression indicator
- Step circles: 40px, filled/hollow/pulsing
- Autosave with "Saved" indicator
- Encouraging micro-copy with completion percentage

**Dashboard**:
- Sidebar navigation (280px)
- Main: 8-column content + 4-column contextual sidebar
- Document cards in grid
- Sticky header with search and notifications

**Document Preview**:
- Split-pane: 60% PDF preview, 40% metadata/tools
- Zoom controls, page navigation, full-screen toggle
- Thumbnail sidebar (collapsible)
- Share: unique URL, QR code, copy link

## Images

**Hero Section**: Large 3D mockup of professional business plan document rotating in space (right 45% of hero). Background: subtle animated gradient mesh suggesting tech/innovation.

**Pricing Cards**: Icon illustrations for each tier (Basic: document outline, Premium: starred document with glow, Enterprise: crowned document).

**Testimonial Section**: User photos in circular frames (if available), or use abstract avatars with brand color gradients.

**Feature Cards**: Abstract icon illustrations representing each feature (AI brain for generation, shield for compliance, rocket for scalability).

No large background hero images—use gradient meshes and 3D elements instead to maintain futuristic aesthetic.

## Accessibility

- Color contrast: min 4.5:1 (text), 3:1 (large text)
- Keyboard navigation: visible focus indicators (3px outline, 2px offset)
- ARIA landmarks: nav, main, aside
- Form labels: for/id pairing, aria-describedby for errors
- Touch targets: min 44x44px
- Reduced motion: detect `prefers-reduced-motion`, disable non-essential animations

## Implementation Notes

- Mobile-first CSS with progressive enhancement
- Use Tailwind for utility-first styling
- Radix UI (via Shadcn) for accessible primitives
- React Query for server state
- React Hook Form + Zod for forms
- Performance: Virtual scrolling for long lists, lazy loading for images, code splitting by route
- Target 60fps: use transform/opacity only, monitor with React DevTools Profiler