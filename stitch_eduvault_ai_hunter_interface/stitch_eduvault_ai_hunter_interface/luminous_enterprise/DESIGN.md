---
name: Luminous Enterprise
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
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#7d4ce7'
  on-tertiary-container: '#f6edff'
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
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  display-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  max-width: 1440px
---

## Brand & Style
The design system is engineered for a premium, high-performance enterprise AI environment. It prioritizes clarity, technical sophistication, and a sense of "depth" that mimics a physical glass stack. 

The aesthetic is heavily rooted in **Modern Minimalism** with a sophisticated **Glassmorphism** overlay. The goal is to evoke trust through precision and innovation through light. Surfaces are not merely flat containers but layers of semi-transparent material that interact with the background through high-quality blurs and hairline strokes.

## Colors
The palette is optimized for a **Dark Mode** first experience to reduce eye strain during long analytical sessions while maintaining a high-end, "command center" feel.

- **Primary (Blue):** Used for primary actions, focus states, and key AI indicators.
- **Secondary (Green):** Reserved for success states and growth metrics.
- **Accent (Purple):** Used for "Magic" or AI-augmented features to differentiate from standard logic.
- **Surface Strategy:** Backgrounds use a deep Slate (#0F172A). UI containers use a lighter Surface (#1E293B) with an opacity of 70-80% to allow background blurs to emerge.

## Typography
The system utilizes **Inter** exclusively to maintain a systematic, utilitarian, and highly legible appearance across complex data sets.

- **Headlines:** Use Bold (700) or SemiBold (600) weights with tighter letter-spacing for a "compact" premium look.
- **Body:** Regular (400) weight ensures high readability. Use 1.6 line-height for long-form AI insights.
- **Labels:** Use Medium (500) weight with slight tracking for metadata and status chips.

## Layout & Spacing
The design system follows a **Fluid Grid** model with strict 8px increments for all internal spacing.

- **Desktop:** 12-column grid, 24px margins, 16px gutters.
- **Tablet:** 8-column grid, 24px margins.
- **Mobile:** 4-column grid, 16px margins.
- **Rhythm:** Use large vertical padding (64px+) between major sections to emphasize the minimal, high-end aesthetic and allow the glass containers to "breathe."

## Elevation & Depth
Depth is created through a combination of transparency and light.
- **Glass Effect:** All cards must use `backdrop-filter: blur(12px)` with a semi-transparent background color (`rgba(30, 41, 59, 0.7)`).
- **Hairline Borders:** Use 1px solid borders with a top-down gradient (white at 15% opacity to white at 5% opacity) to simulate light catching the edge of the glass.
- **Shadows:** Use large, soft shadows with low density. 
  - *Example:* `0 20px 50px rgba(0, 0, 0, 0.3)`.
- **Glows:** Primary elements and focus states should use a soft outer glow in the primary color (Blue) rather than a hard stroke.

## Shapes
To align with the high-end, approachable nature of the product, the design system uses generous rounding.
- **Standard Radius:** 18px for inputs and small cards.
- **Large Radius (rounded-lg):** 24px for main dashboard cards and login containers.
- **Pill Radius:** Used exclusively for status chips and tags to contrast against the structured layout.

## Components
- **Primary Button:** Features a subtle CSS gradient. On hover, implement a scale-up animation (1.02x) and a primary-colored box-shadow "glow."
- **Social Buttons:** Use "Outline" style with a 1px border. Background should be transparent, turning 5% white on hover.
- **Inputs:** Background uses the surface color at 50% opacity. On focus, the border color transitions to Primary Blue with a 4px blur glow.
- **Glass Login Card:** Centered, 24px radius, heavy backdrop-filter (20px), and a subtle internal "shine" gradient from top-left.
- **AI Insight Chips:** Pill-shaped, using the Accent (Purple) color with a 10% opacity background and solid text for a "soft" highlight.
- **Lists:** Rows should be separated by 1px ghost borders with 12px of vertical padding to maintain the airy, premium feel.