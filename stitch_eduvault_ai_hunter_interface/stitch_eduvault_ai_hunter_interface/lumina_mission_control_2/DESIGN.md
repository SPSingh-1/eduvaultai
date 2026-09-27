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
  secondary: '#89ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a2e6'
  on-secondary-container: '#00344e'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
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
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-sm: 16px
  margin-md: 24px
  margin-lg: 40px
  panel-gap: 12px
---

## Brand & Style
The design system embodies a high-stakes, "Mission Control" aesthetic tailored for high-velocity sales intelligence and revenue automation. The personality is authoritative, predictive, and technical. It targets sales directors and operations specialists who require a "God-eye view" of their revenue pipeline.

The visual style is a fusion of **Modern Corporate** and **Glassmorphism**. It utilizes deep, layered surfaces to create a sense of vast digital space, while glowing accents and vibrant status indicators signify real-time data pulses. The interface should feel like a high-performance instrument—precise, dense with information, yet surgically clean.

## Colors
This design system operates exclusively in a **Dark Mode** environment. The foundation is built on `#0b1326` (Deep Slate), providing a low-fatigue background for prolonged data monitoring.

- **Primary (#2563eb):** Used for primary actions, active node connections, and key trend lines in predictive charts.
- **Secondary/Tertiary:** Supporting shades of sky blue and emerald are used for positive growth metrics and "healthy" automation states.
- **Surface Strategy:** Use nested layers of slate. Each level of elevation shifts slightly lighter or increases in glass-opacity to maintain hierarchy. 
- **Glow Effects:** Apply a subtle 8px-12px outer glow to active status indicators and primary buttons to simulate a "live" hardware interface.

## Typography
The system uses **Inter** for all UI and prose to ensure maximum legibility at high densities. **JetBrains Mono** is introduced as a secondary functional font for data-heavy readouts, automation node labels, and technical timestamps.

- **Headlines:** Use tight tracking (-0.01em to -0.02em) to maintain a modern, "compact" feel.
- **Data Display:** Numerical values in predictive charts and customer dossiers should favor tabular lining figures where possible.
- **Mobile Adaptation:** For screens under 768px, `display-lg` scales down to 32px to prevent layout breakage in dense dashboards.

## Layout & Spacing
The layout follows a **Fluid Grid** model with high-density spacing logic based on a 4px increment. 

- **Dashboard Layout:** A 12-column system is used for the main data views. Sidebars for navigation and customer dossiers are fixed (280px and 400px respectively), while the central "Mission Control" panel remains fluid.
- **Automation Editor:** Uses a "No Grid" canvas model with a background dot-matrix pattern spaced at 24px intervals. Nodes snap to this grid.
- **Margins:** Standardize on 24px inner padding for containers to allow data to breathe without wasting screen real estate.

## Elevation & Depth
Elevation is expressed through **Glassmorphism** and **Tonal Layers** rather than traditional shadows.

- **Level 0 (Background):** Deep Slate (#0b1326).
- **Level 1 (Panels):** Semi-transparent slate with a 1px border (#ffffff10) and a subtle backdrop blur (12px).
- **Level 2 (Modals/Popovers):** Higher transparency with a 20px backdrop blur and a slight inner glow on the top edge to simulate overhead lighting.
- **Interactions:** Hover states on cards should trigger a primary-colored "rim light" (a 1px border-image gradient) rather than a lift effect.

## Shapes
The design system utilizes **Soft (0.25rem)** roundedness to maintain a technical, engineered feel. 

- **Standard Elements:** Buttons, input fields, and tags use `0.25rem` (4px).
- **Large Containers:** Dashboard widgets and automation nodes use `rounded-lg` (8px).
- **Status Pips:** Small indicators for "Live" or "Offline" status remain perfectly circular.

## Components
Consistent implementation of these components ensures the Mission Control aesthetic:

- **Buttons:** Primary buttons use a solid `#2563eb` fill with a subtle 0-0-10px glow. Secondary buttons use a ghost style with a 1px border and a glass background.
- **Automation Nodes:** Rectangular cards with a colored "input/output" port on the sides. Use JetBrains Mono for the logic labels.
- **Status Indicators:** Small, pulsating circles. Blue = Processing, Green = Successful, Red = Alert/Failed.
- **Customer Dossiers:** Vertical high-density panels using `body-sm` and `label-caps`. Use hairline dividers (`#ffffff10`) to separate interaction history from predictive scores.
- **Predictive Charts:** Area charts with low-opacity primary color gradients under the line. Grid lines should be faint (`#ffffff05`).
- **Input Fields:** Darker than the panel background, using a focus state that adds a 1px primary border and a soft outer glow.