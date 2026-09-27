---
name: Executive Intelligence Layer
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#353944'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2f0'
  on-surface-variant: '#c3c5d8'
  inverse-surface: '#dfe2f0'
  inverse-on-surface: '#2d303b'
  outline: '#8d90a1'
  outline-variant: '#434656'
  surface-tint: '#b7c4ff'
  primary: '#b7c4ff'
  on-primary: '#002780'
  primary-container: '#2d63ff'
  on-primary-container: '#f9f7ff'
  inverse-primary: '#004dea'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#008259'
  on-tertiary-container: '#e1ffec'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b4'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131d'
  on-background: '#dfe2f0'
  surface-variant: '#31353f'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for the "Executive & Intelligence" tier, prioritizing high-density information architecture with an "AI Operating System" aesthetic. The visual language centers on **Sophisticated Minimalism** and **Glassmorphism**, creating an environment that feels like a high-stakes control tower.

The personality is clinical yet powerful—evoking the precision of a high-end developer tool (like Linear) with the polished fluidity of premium fintech (like Stripe). It leverages depth, motion, and light to represent intelligence nodes and real-time market shifts.

**Design Pillars:**
- **Density Over Spacing:** Maximizing screen real estate for multi-dimensional data without sacrificing legibility.
- **Luminosity:** Using light as a functional signifier for "active" AI processes.
- **Tactile Digitalism:** Surfaces feel like physical glass layers stacked over a deep, infinite "Ink" void.

## Colors

This design system utilizes a "Deep Sea" dark mode palette to reduce cognitive load during long analytical sessions while allowing vibrant AI-driven accents to pop with high functional contrast.

- **Primary (AI Blue):** #2d63ff — Used for primary actions and active intelligence states.
- **Secondary (Intelligence Violet):** #8b5cf6 — Used for generative AI insights and synthesis indicators.
- **Surface (Ink):** #050811 — The foundational background color.
- **Market Opportunity (Emerald):** #10b981 — Positive growth and "Greenlight" market signals.
- **Competitive Risk (Amber):** #f59e0b — Critical alerts, churn risks, and competitor movements.
- **Intelligence Nodes (Sapphire):** #3b82f6 — Passive data points and secondary structural elements.

**Functional Gradients:**
- *AI Glow:* A linear gradient from `primary` to `secondary` at 45 degrees, used for progress bars and high-level summaries.
- *Glass Stroke:* A white-to-transparent 1px stroke at 10% opacity for card definitions.

## Typography

The typography system relies on **Inter** for its neutral, enterprise-grade clarity. To handle high-density data, the scale is tighter than consumer applications, favoring smaller sizes with generous line heights for readability.

**Usage Guidelines:**
- **Display-lg:** Reserved for high-level "Control Tower" metrics.
- **Label-caps:** Used for metadata headers, small category tags, and table headers.
- **Mono-data:** While Inter is the primary face, use a secondary Monospace font (JetBrains Mono or similar) for live tickers, coordinate data, and market pricing to ensure numerical alignment.
- **Contrast:** Always use `white` for primary text and `slate-400` (or 60% opacity white) for secondary/supporting descriptions.

## Layout & Spacing

The design system employs a **12-column Fluid Grid** with a maximum container width of 1600px to accommodate wide-screen data visualizations. 

- **The 4px Rule:** All spacing increments must be multiples of 4px to maintain visual mathematical harmony.
- **Sidebars:** Left-hand navigation is fixed at 240px. Contextual right-hand intelligence panels use a "Drawer" model, sliding over content with a backdrop blur.
- **Density:** In "Intelligence View," reduce component padding by 50% to allow for "At-a-glance" executive monitoring.
- **Mobile:** Elements reflow into a single column. "Control Tower" charts should switch to simplified sparklines to maintain performance.

## Elevation & Depth

This system ignores traditional shadows in favor of **Luminous Depth** and **Backdrop Blurs**.

1.  **Level 0 (Base):** #050811 (Ink).
2.  **Level 1 (Cards):** Surface color at 4% opacity white overlay with a 1px border at 10% opacity.
3.  **Level 2 (Modals/Overlays):** Backdrop blur of 20px with a subtle inner glow (1px white stroke at 15% opacity).
4.  **Level 3 (AI Interaction):** Elements currently being processed by AI should have a "Glow" shadow using the Primary AI Blue (#2d63ff) at 20% opacity with a 30px spread.

**Glassmorphism:** Apply `backdrop-filter: blur(12px)` to all sidebars and top-level navigation bars to create a sense of environmental continuity.

## Shapes

The shape language is defined by the **20px Executive Corner**. This large radius provides a sophisticated, "premium hardware" feel that softens the high-density data on the interior.

- **Large Containers/Cards:** 20px (rounded-xl/2xl).
- **Buttons & Inputs:** 8px (rounded-md) to maintain a professional, sharp edge within the larger containers.
- **Chips/Status Tags:** Fully rounded (pill) to distinguish them from actionable buttons.

## Components

**Command Bar (⌘K):**
A floating, centered input with a 40px backdrop blur. It uses a 1px border with a violet-to-blue gradient transition. It is the primary navigation method for the "AI Operating System."

**Executive Cards:**
- 20px corner radius.
- 1px subtle border (#ffffff10).
- No background color (fully transparent) except for the backdrop blur when positioned over other elements.
- Header area includes a "Node Icon" using the Sapphire accent.

**Buttons:**
- **Primary:** Solid #2d63ff with a white label. 
- **Ghost:** 1px white border at 10% opacity, white text. On hover, the border glows with the Primary AI Blue.

**Status Indicators:**
- Use "Pulse" animations for real-time market nodes.
- High-contrast glows: A 4px circle with an 8px outer glow of the same color (Emerald/Amber/Sapphire).

**Intelligence Input:**
- Input fields should be "borderless" with only a bottom 1px highlight that expands to a full glow when focused. 
- Placeholder text is in a 40% opacity slate to emphasize the clinical feel.