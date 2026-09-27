---
name: Synthetic Intelligence OS
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394e'
  surface-container-lowest: '#060d20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3e'
  surface-container-highest: '#2d3449'
  on-surface: '#dbe2fd'
  on-surface-variant: '#c3c5d8'
  inverse-surface: '#dbe2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a1'
  outline-variant: '#434656'
  surface-tint: '#b7c4ff'
  primary: '#b7c4ff'
  on-primary: '#002780'
  primary-container: '#2d63ff'
  on-primary-container: '#f9f7ff'
  inverse-primary: '#004dea'
  secondary: '#e6feff'
  on-secondary: '#003739'
  secondary-container: '#00f4fe'
  on-secondary-container: '#006c71'
  tertiary: '#ffba20'
  on-tertiary: '#412d00'
  tertiary-container: '#956a00'
  on-tertiary-container: '#fff6ee'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b4'
  secondary-fixed: '#63f7ff'
  secondary-fixed-dim: '#00dce5'
  on-secondary-fixed: '#002021'
  on-secondary-fixed-variant: '#004f53'
  tertiary-fixed: '#ffdea8'
  tertiary-fixed-dim: '#ffba20'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5e4200'
  background: '#0b1326'
  on-background: '#dbe2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 32px
  gutter: 16px
  module-gap: 24px
  element-padding-sm: 8px 12px
  element-padding-md: 12px 16px
---

## Brand & Style

The design system is engineered for a high-performance, AI-first enterprise environment. It prioritizes clarity, technical sophistication, and "Explainable AI" transparency. The aesthetic is a hybrid of **Minimalist Glassmorphism** and **Corporate Modern**, drawing inspiration from elite developer-centric tools.

The target audience consists of sales leaders and operations managers who require high-density data visualization without cognitive overload. The UI must feel like a precision instrument—responsive, deep, and authoritative. 

Key visual principles:
- **Optical Depth:** Use of translucency and background blurs to maintain context.
- **Agent Awareness:** Real-time feedback via neon-glow state indicators.
- **Density & Precision:** Tight internal padding within modules to maximize information display while using expansive external margins to prevent clutter.

## Colors

The palette is anchored by a deep slate neutral (#0B1326) to provide a high-contrast base for technical data.

- **Primary:** A vibrant electric blue used for primary actions and focus states.
- **Secondary (Neon):** A cyan-tinted accent for highlight states and AI-generated content indicators.
- **Surface Strategy:** Use nested layers of slate. Each elevation level slightly increases in brightness and decreases in transparency.
- **Semantic Neon:** Status indicators utilize high-saturation "neon" variants of green (Running) and amber (Thinking) to ensure agent states are immediately scannable against the dark background.

## Typography

The design system utilizes **Inter** for all UI elements to ensure maximum legibility and a modern, systematic feel. 

- **Scale:** Use `headline-sm` (20px) for standard module headers.
- **Labels:** Technical data and confidence scores should use `label-md` or the `mono-label` (JetBrains Mono) for a "code-adjacent" aesthetic that emphasizes precision.
- **Hierarchy:** Reserve `display-lg` for dashboard summaries (e.g., total leads generated). All headings should use a tight letter-spacing to maintain a professional, compact appearance.

## Layout & Spacing

This design system uses a **Fluid Grid** with fixed-width sidebars. The primary content area follows a 12-column layout to accommodate dense information dashboards.

- **Rhythm:** A strict 4px baseline grid ensures vertical consistency.
- **Information Density:** Internal module padding is kept at `element-padding-md` (16px) to allow for more data points per screen, while `module-gap` (24px) provides enough "air" to prevent visual fatigue.
- **Responsiveness:** On mobile, the 12-column grid collapses to a single column, with `container-padding` reduced to 16px. Glassmorphic layers should lose their blur on mobile to preserve performance.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism**. Shadows are used sparingly; depth is instead created by border-strokes and background blurs.

- **Base Layer (Level 0):** Background (#0B1326).
- **Surface Layer (Level 1):** Semi-transparent slate (#151E2D at 80% opacity) with a 20px background blur.
- **Hover/Active Layer (Level 2):** Slightly lighter slate with a 1px solid border (White at 10% opacity) to define edges.
- **Glow Effects:** High-importance AI states (Running/Thinking) project a soft 8px radial glow in their respective status color to draw the user's eye to active processes.

## Shapes

The design system adopts a **Rounded** aesthetic to soften the technical nature of the OS.

- **Primary Cards:** Always use `rounded-xl` (1.5rem / 24px) or a custom 20px radius as specified to create a "containerized" feel.
- **Buttons/Inputs:** Use `rounded-md` (0.5rem / 8px) for a more precise, functional look.
- **Status Pills:** Use a fully rounded/pill shape for status indicators and confidence scores.

## Components

### Buttons & Inputs
- **Primary Action:** Solid electric blue with white text. Subtle 4px glow on hover.
- **Ghost Input:** Transparent background with a 1px border. On focus, the border glows with the primary color.
- **Density:** Standard height for inputs and buttons is 36px to maintain high-density requirements.

### Cards & Modules
- **AI Card:** 20px corner radius. Features a "Glass" header with a thin bottom border separating the header from content.
- **Confidence Badge:** A pill-shaped component displaying a percentage (e.g., "98% Match"). Color-coded based on threshold: Green (>90%), Yellow (70-90%), Red (<70%).

### AI State Indicators
- **Running:** Neon Green dot with a slow "pulse" animation.
- **Thinking:** Amber dot with a rotating orbit animation.
- **Activity Log:** A monospaced list component with timestamp, event, and "explainability" link. Use low-contrast text (#94A3B8) for timestamps.

### Lists & Data Tables
- **Zebra Striping:** Do not use. Use 1px bottom borders (White at 5% opacity) to separate rows.
- **Interactive Rows:** On hover, rows should take on a Level 2 surface color (#1E293B) and show a primary-colored vertical accent bar on the left edge.