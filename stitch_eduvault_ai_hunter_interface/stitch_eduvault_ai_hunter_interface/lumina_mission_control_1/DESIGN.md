---
name: Lumina Mission Control
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
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dbe2fd'
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
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style
The design system is engineered for high-stakes decision-making within the AI School Discovery Center. It evokes the precision of an aerospace cockpit—a "Mission Control" aesthetic that balances dense information architecture with an ethereal, futuristic atmosphere.

The style is a hybrid of **Corporate Modern** and **Glassmorphism**. It utilizes deep layered depth, vibrant background blurs, and luminous accents to differentiate AI-generated insights from static school data. The interface should feel like a high-performance operating system: responsive, authoritative, and sophisticated.

## Colors
The palette is rooted in a deep slate foundation to reduce eye strain during prolonged analysis. 

- **Primary (Blue):** Used for core action states, focus indicators, and primary branding.
- **Secondary (Emerald):** Reserved for AI-validated "Success" metrics, growth indicators, and active discovery statuses.
- **Tertiary (Indigo):** Used for auxiliary data streams and secondary interactive elements to provide depth without competing with the primary blue.
- **Surface Tints:** Use low-opacity versions of the primary blue (5-10%) for glass overlays to maintain color harmony with the background.

## Typography
The system uses **Inter** for all UI and editorial content to ensure maximum legibility at high densities. Its tall x-height and neutral character allow it to disappear, letting the data take center stage.

For technical data points, coordinates, and AI status codes, **JetBrains Mono** is introduced as a secondary label font. This monospaced addition reinforces the "Mission Control" aesthetic and ensures numerical data is perfectly aligned in tabular views. Keep letter spacing tight on headings but slightly tracked out for labels to maintain clarity against dark backgrounds.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a 12-column structure for desktop and a 4-column structure for mobile. To accommodate high-density utility, we utilize a 4px base unit.

- **Desktop:** 24px gutters provide enough "air" between complex data widgets to prevent visual claustrophobia.
- **Utility Density:** In dashboard views, use condensed vertical padding (8px-12px) for list items to maximize information density. 
- **Safe Zones:** High-level analytics should be contained within card modules that use 24px internal padding, creating a clear distinction between the "Control Panel" (navigation) and the "Viewscreen" (content).

## Elevation & Depth
Depth is communicated through **Glassmorphism** rather than traditional drop shadows. Surfaces are layered using varying levels of background blur and transparency.

- **Base Layer:** The solid #0b1326 slate.
- **Mid Layer (Cards/Panels):** 60% opacity of the background color with a 12px backdrop blur and a 1px inner border (white at 10% opacity) to define the edge.
- **Top Layer (Modals/Popovers):** 80% opacity with a 24px backdrop blur and a subtle 2px outer glow using the primary blue at 15% opacity.
- **Interactive States:** On hover, glass elements should increase their "luminosity" by slightly increasing the opacity of the background tint.

## Shapes
The shape language is **Soft (0.25rem)**. This subtle rounding suggests a modern, engineered feel without the "friendliness" of fully rounded corners. 

- **Utility Components:** Buttons and inputs use the base 4px (0.25rem) radius.
- **Container Modules:** Larger dashboard widgets and cards use 8px (0.5rem) to create a visual nesting hierarchy.
- **Status Indicators:** Small status dots and AI activity rings remain perfectly circular to contrast against the rigid grid.

## Components
- **Buttons:** Primary buttons feature a subtle outer glow (#2563eb at 30%) and a crisp 1px border. Secondary buttons are "ghost" style with a glass background that becomes more opaque on hover.
- **Inputs:** Dark field fills with a 1px border. When focused, the border glows with the primary blue and the label font shifts to JetBrains Mono.
- **Data Cards:** Utilize the glassmorphic style defined in Elevation. Headers within cards should have a subtle bottom divider (1px white at 5% opacity).
- **AI Discovery Chips:** Use the Emerald accent (#10b981). These should have a slight "pulse" animation when the AI is actively fetching new data for that specific category.
- **Scrollbars:** Custom-styled to be ultra-thin (4px), using the primary blue at 20% opacity for the track and 50% for the thumb, ensuring they don't distract from the content.
- **Status Badges:** Use JetBrains Mono for the text. Use a background glow rather than a solid fill to indicate active system statuses.