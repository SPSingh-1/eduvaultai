---
name: Lumina Enterprise
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#c0c1ff'
  on-tertiary: '#1000a9'
  tertiary-container: '#585be6'
  on-tertiary-container: '#f1eeff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-edge: 32px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is engineered for a high-stakes Enterprise AI environment, prioritizing clarity, technical sophistication, and a "future-premium" aesthetic. It targets C-suite executives and sales operations leaders who demand tools that feel as powerful as they are refined.

The visual language utilizes a **Glassmorphic** approach layered over a deep, structural foundation. This creates a sense of depth and data-transparency, essential for AI-driven insights. The aesthetic is high-end and polished, drawing inspiration from industry-leading tools like Linear and Stripe, characterized by extreme precision, subtle motion, and a spacious, intentional layout.

**Key Stylistic Pillars:**
- **Translucency:** UI surfaces utilize background blurs to maintain context and depth.
- **Precision:** 1px borders and razor-sharp alignment suggest technical reliability.
- **Atmospheric Motion:** Subtle, slow-moving mesh gradients in the background provide a sense of life without distracting from data-heavy tasks.
- **Modernism:** A focus on functional beauty where the interface recedes to let the AI-generated content shine.

## Colors

The palette is anchored in a deep, "obsidian" dark mode to reduce eye strain and provide a canvas for vibrant AI accents. 

- **Primary (#2563EB):** Used for critical actions, active states, and brand presence.
- **Accent (#10B981):** Represents "AI Success," growth metrics, and confirmed data points.
- **Tertiary (#6366F1):** A "logic" indigo used for secondary highlights and deep-link indicators.
- **Background (#0F172A):** The core canvas, providing a rich, high-contrast base for glass layers.

**Functional Applications:**
- **Surface:** A slightly lighter hex (#1E293B) at 60% opacity with a 20px blur.
- **Border:** White at 8-12% opacity to create "ghost" edges on glass cards.
- **Gradients:** Use a 45-degree linear gradient from Primary to Tertiary for high-impact AI moments.

## Typography

This design system relies exclusively on **Inter** to maintain a systematic, neutral, and highly legible interface. The type hierarchy is designed to handle complex data density while maintaining a clear "Onboarding Narrative" through oversized display styles.

- **Display Styles:** Use tight letter spacing (-0.04em) to create a compact, authoritative look for onboarding headers.
- **Body Text:** Standard tracking with generous line height (1.5x) to ensure readability in long-form sales intelligence reports.
- **Labels:** Small caps or all-caps with increased letter spacing are used for metadata and utility labels to differentiate them from interactive content.

## Layout & Spacing

The layout philosophy follows a **Fixed-Fluid Hybrid**. Onboarding steps are centered in a 1200px container to focus user attention, while the dashboard environment utilizes a fluid 12-column grid.

- **The 8px Rule:** All spacing increments must be multiples of 8 (8, 16, 24, 32, 48, 64).
- **Onboarding Focus:** Multi-step forms should utilize a 6-column center-aligned width (approx 600px) to prevent eye fatigue across ultra-wide monitors.
- **Responsive Behavior:** 
  - **Desktop:** 12 columns, 32px margins.
  - **Tablet:** 8 columns, 24px margins.
  - **Mobile:** 4 columns, 16px margins; typography scales down per the variables defined.

## Elevation & Depth

Hierarchy is achieved through **Tonal Stacking** and **Glassmorphism**, rather than traditional heavy shadows.

- **Level 0 (Base):** The #0F172A background.
- **Level 1 (Glass Cards):** Surface hex #1E293B at 40% opacity. 24px background blur. 1px solid border (White @ 10% opacity).
- **Level 2 (Popovers/Modals):** Surface hex #1E293B at 80% opacity. 40px background blur. Drop shadow: `0 20px 50px rgba(0,0,0,0.5)`.
- **AI Highlight:** Elements currently being processed by AI should feature a subtle "outer glow" using the Primary color at 20% opacity.

## Shapes

The design system uses **Large Rounded Corners** to soften the professional tone and make the high-tech AI feel approachable. 

- **Cards:** 24px radius is the standard for all main onboarding containers and dashboard widgets.
- **Interactive Elements:** Buttons and Input fields use a 12px radius, providing a distinct "clickable" feel that contrasts with the larger containers.
- **Chips:** Always fully pill-shaped (100px) to denote categorized data or AI tags.

## Components

**Buttons:**
- **Primary:** Gradient background (Primary to Tertiary), white text, 12px radius. Subtle "inner shine" 1px border at the top.
- **Ghost:** No background, 1px white @ 20% border. Transitions to 40% white on hover.

**Input Fields:**
- Darker background than the card surface (#0F172A @ 50%).
- 12px radius.
- Focus state: Border color changes to Primary with a 4px soft outer glow.

**Onboarding Progress Bar:**
- Thin 4px height.
- Background: White @ 10%.
- Fill: Accent Color (#10B981) with a subtle pulse animation on the leading edge.

**Cards:**
- Must use the Glassmorphic stack (Level 1 Elevation).
- Padding should be consistent at 32px for onboarding steps.

**AI Status Indicator:**
- A small, animated glowing dot using the Accent color, paired with a "Thinking..." label in `mono-code` typography.