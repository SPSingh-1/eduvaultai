---
name: EduVault AI Sales Hunter
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
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
  tertiary: '#ffb596'
  on-tertiary: '#581e00'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
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
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
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
    letterSpacing: 0.01em
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The design system is engineered for a high-performance, AI-driven enterprise environment. It blends the utility of professional productivity tools with the futuristic, ethereal quality of modern AI interfaces. The aesthetic is rooted in **Minimalism** and **Glassmorphism**, creating a sense of depth and intelligence through layered transparency.

The UI should feel "lightweight" yet powerful—evoking the precision of a high-end data instrument. This is achieved through generous whitespace, razor-sharp typography, and subtle motion. The emotional response is one of confidence, clarity, and technological edge, positioning the product as an indispensable partner in the sales process.

## Colors

The palette is anchored by a deep enterprise blue, symbolizing stability and intelligence. Vibrant secondary and accent colors are reserved for high-value AI interactions and status indicators.

- **Primary (#2563EB):** Used for main actions and brand identity.
- **Secondary (#10B981):** Represents growth, success, and active sales states.
- **Accent (#8B5CF6):** Specifically reserved for "AI Magic" moments—automated insights, suggestions, and generative features.
- **Surface Strategy:** In dark mode, surfaces use varying opacities of white (1% to 8%) over the `#0F172A` background to create a tiered glass effect.

Subtle gradients are permitted, typically transitioning from a primary or accent color to a slightly more saturated variant (e.g., `Primary` to `Accent`) to indicate premium functionality.

## Typography

This design system utilizes **Inter** for its systematic, utilitarian clarity. The typographic hierarchy is driven by contrast in weight and negative space rather than excessive scale changes.

**Key Principles:**
- **Headings:** Always bold or semi-bold with tight letter-spacing to feel impactful and modern.
- **Body:** Features a spacious line height (1.5–1.6) to ensure long-form sales intelligence data remains legible.
- **Labels:** Used for metadata and UI controls, utilizing medium weights for clarity at small sizes.
- **Technical Data:** Use a monospaced font for ID strings or code snippets to reinforce the "Vault" and technical nature of the AI.

## Layout & Spacing

The layout philosophy follows a **Fluid-Fixed Hybrid**. Content is housed within a max-width container (1440px) for desktop, while the sidebar remains fixed.

**Grid System:**
- **Desktop:** 12-column grid, 24px gutters, 40px margins.
- **Tablet:** 8-column grid, 16px gutters, 24px margins.
- **Mobile:** 4-column grid, 16px gutters, 16px margins.

Spacing follows a geometric progression based on a 4px unit. Use large `2xl` padding for landing sections and hero AI modules to create a "premium breathable" feel similar to Linear. Smaller `sm/md` units should be used for data-dense tables and lead lists.

## Elevation & Depth

This design system uses **Tonal Glassmorphism** to establish hierarchy. Surfaces do not just "sit" on top of each other; they filter what is beneath them.

- **Level 0 (Background):** Pure `#0F172A`.
- **Level 1 (Cards/Sidebar):** White @ 3% opacity with a 20px backdrop blur and a 1px white @ 10% border.
- **Level 2 (Modals/Popovers):** White @ 6% opacity with a 40px backdrop blur and a soft, diffused shadow (`0 20px 40px rgba(0,0,0,0.4)`).
- **Shadows:** Use "Ambient Shadows"—low opacity, high blur, and slightly tinted with the primary blue color to avoid a "dirty" look on dark backgrounds.
- **Active States:** Elements being interacted with should gain a subtle outer glow using the Primary or Accent color.

## Shapes

The shape language is defined by significant **roundedness**, making the interface feel approachable and organic.

- **Containers & Cards:** 20px border radius is the standard for all primary modules.
- **Buttons & Inputs:** 12px border radius for a slightly tighter, more functional appearance.
- **Small Components:** Chips and badges use a fully rounded (pill) shape to distinguish them from actionable buttons.

Borders are strictly "Inner Borders" (1px), using low-contrast semi-transparent strokes to define shape without adding visual noise.

## Components

**Buttons:**
- **Primary:** Solid `#2563EB` with a subtle top-down gradient. 12px radius.
- **AI-Action:** Gradient from `#8B5CF6` to `#2563EB`. Used only for AI-generation tasks.
- **Ghost:** No background, 1px border at 10% opacity. Becomes 5% white background on hover.

**Cards:**
- All cards must use the 20px radius. Use `backdrop-filter: blur(20px)` and a subtle `linear-gradient` border to create the glass effect.

**Input Fields:**
- Backgrounds should be slightly darker than the surface they sit on. Focused states use a 2px Primary blue ring with a 4px blur.

**AI Insights Chip:**
- A unique component featuring a shifting gradient border and a small sparkle icon. Used to highlight lead scores or automated sales recommendations.

**Lead Lists:**
- Rows should have a subtle hover state (white @ 4% opacity) and utilize the `mono-label` typography for data attributes like "Lead ID" or "Probability Score."