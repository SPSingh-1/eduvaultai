---
name: EduVault Cyber-Command
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
  on-primary: '#122f5f'
  primary-container: '#7890c6'
  on-primary-container: '#082858'
  inverse-primary: '#455e90'
  secondary: '#d0bcff'
  on-secondary: '#37265e'
  secondary-container: '#503f79'
  on-secondary-container: '#c2aef0'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#2c4677'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#210f48'
  on-secondary-fixed-variant: '#4d3d76'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dbe2fd'
  surface-variant: '#2d3449'
  surface-main: '#0b1326'
  surface-glass: rgba(255, 255, 255, 0.04)
  border-glass: rgba(255, 255, 255, 0.1)
  glow-primary: rgba(173, 198, 255, 0.1)
  glow-tertiary: rgba(78, 222, 163, 0.1)
  terminal-timestamp: '#4edea3'
typography:
  kpi-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  kpi-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  grid-cell:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  mono-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  grid-header:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  grid-compact: 8px
  gutter: 16px
  grid-wide: 24px
  margin-page: 24px
---

## Brand & Style
The brand personality is authoritative, technologically advanced, and high-performance. It targets elite operations managers and AI supervisors who require a "mission control" experience. 

The visual style is **Glassmorphism mixed with futuristic Cyber-Command** aesthetics. It utilizes deep space backgrounds, glowing data points, and translucent layers to create a sense of depth and intelligence. The emotional response should be one of "total situational awareness" and "automated efficiency," achieved through high-fidelity visual feedback, subtle animations (scanning lines, pulsing nodes), and a sophisticated dark-mode interface.

## Colors
The palette is built on a "Deep Space" foundation (`#0b1326`) with high-vibrancy accents. 

- **Primary (Blue/Lavender):** Used for core navigation, interactive state indicators, and primary action buttons.
- **Secondary (Purple):** Reserved for "AI Intelligence" roles, insights, and decorative gradients.
- **Tertiary (Neon Green):** Signals "Optimal Status," health, success, and active terminal processes.
- **Neutral:** A range of deep navy tints used for containment and layout structure.

Interaction states rely on increasing the opacity of glass layers rather than simple color shifts. Gradients (Primary to Secondary) are used exclusively for high-impact actions like "Deploy Hunter."

## Typography
The system uses a single font family, **Inter**, but differentiates roles through extreme weight and size variances. 

- **Data-Heavy Roles:** Utilize `kpi-xl` and `kpi-md` for immediate visual impact of numerical status.
- **Metadata/Terminal:** `mono-label` and `grid-header` use uppercase styling and wide tracking to simulate a technical, monospaced HUD feel.
- **Mobile Scaling:** On mobile, `kpi-xl` should scale down to `kpi-md` (32px), and `headline-sm` remains constant as the primary page title.

## Layout & Spacing
The layout uses a **12-column fluid bento-grid system**. 

- **Containers:** The main content area is capped at `1600px` to maintain legibility on ultra-wide monitors.
- **Sidebar:** A fixed `256px` (w-64) sidebar handles secondary navigation.
- **Rhythm:** An 8px base unit drives the grid. Large bento-boxes use `24px` padding, while internal cards use `16px`. 
- **Adaptation:** On mobile, the sidebar collapses into a hamburger menu, and the 12-column grid reflows to a single vertical stack. Bento-cards that span 4 or 6 columns on desktop expand to full width on mobile.

## Elevation & Depth
Depth is created through **translucency and blurs** rather than traditional shadows.

1.  **Level 0 (Background):** Solid `#0b1326` with subtle topographic or network-mesh textures at 30% opacity.
2.  **Level 1 (Panels):** `glass-panel` style using `rgba(255, 255, 255, 0.04)` with a `20px` backdrop-blur and a subtle `1px` white border at 10% opacity.
3.  **Level 2 (Interactive):** Hovering over a glass panel increases background opacity to 8% and border opacity to 20%.
4.  **Level 3 (Overlays):** Modals and dropdowns use the same glass style but with a `shadow-xl` to ensure separation from the underlying grid.

## Shapes
The shape language is "Hyper-Rounded" for large layout containers and "Soft" for interactive elements.

- **Main Bento Sections:** Use a large `24px` corner radius to create a soft, modern containment.
- **Inner Cards & Buttons:** Use `8px` (rounded-lg) for a precise, technical feel.
- **Special Elements:** Progress bars and system-status pills use `full` (9999px) rounding to contrast against the structured grid.

## Components
- **Buttons:** Primary buttons use a linear gradient (`primary` to `secondary`) with `on-primary` text. Ghost buttons use the `glass-panel` style with a border. All buttons should have a `active:scale-95` transition.
- **Workforce Cards:** Must feature a color-coded vertical status bar (Left: 4px width) matching the agent's current state (Green for active, Blue for processing, Grey for standby).
- **Live Terminal:** Text should be 11px Inter, using `tertiary` for timestamps and `primary` for system tags.
- **Progress Bars:** Ultra-thin (4px - 6px) with a glowing "thumb" or lead-edge to simulate active data flow.
- **Input Fields:** Dark surfaces with `inner-shadow` and `primary` rings on focus.
- **Badges/Pills:** Use a subtle background tint of the status color (10% opacity) with high-vibrancy text and a 0.05em tracking.