---
name: Cognitive Enterprise
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
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dbe2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#a078ff'
  on-tertiary-container: '#340080'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
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
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
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
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 40px
  gutter: 24px
  card-gap: 20px
  section-margin: 80px
---

## Brand & Style

The design system is engineered for a premium, AI-native enterprise ecosystem. It prioritizes a sense of **autonomy** and **computational intelligence**, evoking the feeling of a sophisticated co-pilot that manages complex growth engines with precision.

The aesthetic direction is a refined blend of **Modern Corporate** and **Glassmorphism**. It utilizes deep, atmospheric layering to create a sense of infinite digital space. Interfaces must feel high-fidelity and "low-friction," characterized by meticulous attention to detail, subtle motion, and a layout that breathes through generous whitespace. The emotional response should be one of absolute reliability, technological edge, and executive-level clarity.

## Colors

The palette is anchored in a deep slate base (**#0B1326**) to establish a premium dark-mode environment. 

- **Primary:** A vibrant Blue (#3B82F6) representing intelligence and enterprise stability.
- **Secondary:** Emerald Green (#10B981) specifically reserved for "Growth," "Active Status," and "AI Success" indicators.
- **Tertiary:** Violet (#8B5CF6) used sparingly for "Magic" or "Generative" AI moments and creative automation features.
- **Neutral/Surface:** Systematic layers of slate. Surfaces utilize varying opacities of white overlays on the base slate to create depth, rather than solid lighter grays.
- **Accents:** High-fidelity data visualizations should utilize a palette derived from the primary and secondary colors, ensuring high contrast against the dark background.

## Typography

This design system utilizes **Inter** as its primary typeface to achieve a clean, utilitarian, yet modern enterprise feel. Tight tracking is applied to larger headlines to maintain a structured, "engineered" look. 

**JetBrains Mono** is introduced for labels, metadata, and AI-generated status codes to reinforce the "engine" aspect of the product. 

- **Hierarchy:** Use weight (SemiBold/Bold) to denote importance rather than excessive size increases.
- **Contrast:** High-level headers use Pure White (#FFFFFF), while secondary body text uses a muted Slate-300 to maintain visual hierarchy without clutter.

## Layout & Spacing

The layout philosophy follows a **fixed-fluid hybrid model**. Content resides within a maximum-width container (1440px) on desktop, centering the "Engine" experience.

- **Grid:** A 12-column system with a generous 24px gutter.
- **Whitespace:** Emphasize vertical rhythm. Use 80px+ between major sections to prevent information density fatigue. 
- **Responsive:** On mobile, margins reduce to 16px, and multi-column card layouts collapse into a single-column vertical stack. 
- **Internal Padding:** Cards and containers must maintain a minimum internal padding of 24px to preserve the premium, airy feel.

## Elevation & Depth

Depth is achieved through **Glassmorphism and Tonal Layering** rather than traditional shadows.

- **Level 0 (Base):** The #0B1326 background.
- **Level 1 (Cards/Containers):** Surfaces use #162032 with a 1px solid border at 8% white opacity.
- **Level 2 (Modals/Overlays):** Semi-transparent surfaces with a `backdrop-filter: blur(20px)` and a slightly brighter top-border to simulate a light source from above.
- **Shadows:** Use only one type of shadow—a "Large Ambient Shadow": `0px 24px 48px rgba(0, 0, 0, 0.4)`. This is reserved for floating elements like dropdowns and active AI dialogs.

## Shapes

The design system employs a sophisticated rounded language to soften the industrial enterprise aesthetic.

- **Standard Elements:** Buttons and input fields use a **0.5rem (8px)** radius.
- **Containers:** Primary dashboard cards and large sections must use a specific **20px (1.25rem)** radius.
- **Interactive States:** Subtle scale transforms (1.02x) are encouraged on hover for cards to indicate interactivity within the glass-heavy environment.

## Components

- **Buttons:** 
  - *Primary:* Solid Blue (#3B82F6) with white text.
  - *Ghost:* No background, 1px white (8% opacity) border.
- **Input Fields:** Darker than the card background (#0B1326), 1px border, with active states highlighted by a subtle blue outer glow (0px 0px 0px 2px rgba(59, 130, 246, 0.3)).
- **Cards:** Defined by the 20px radius, glassmorphic background, and a subtle top-to-bottom linear gradient (White 5% to White 0%).
- **AI Status Chips:** Utilize JetBrains Mono. Use the Secondary Green for "Autonomous" states and Tertiary Violet for "Computing/Generating" states.
- **Progress Indicators:** Use thin, 4px height bars with glowing ends to represent data flow and AI engine processing activity.
- **Data Visualizations:** Charts should use rounded line caps and semi-transparent area fills to match the glassmorphic theme.