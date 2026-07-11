---
version: alpha
name: Pillioo-design-system
description: "A calm, light-mode healthcare operations interface built around off-white surfaces, ink navy, muted teal, and low-saturation semantic colors. The system is designed for pharmacists reviewing recall tickets, evidence, inventory impact, workflow state, and approval history. Information density is inspired by modern B2B tools, while readability and restrained color use take priority over decorative styling."

colors:
  primary: "#1E2A44"
  on-primary: "#FFFFFF"
  primary-hover: "#2A3A5C"
  primary-focus: "#3A4C70"
  primary-soft: "#EEF1F6"

  secondary: "#365C59"
  on-secondary: "#FFFFFF"
  secondary-hover: "#416C68"
  secondary-soft: "#EDF3F2"

  text-primary: "#1C2430"
  text-secondary: "#596273"
  text-muted: "#8A93A3"
  text-disabled: "#AEB5C0"

  canvas: "#F6F7F9"
  surface-1: "#FFFFFF"
  surface-2: "#F0F2F5"
  surface-3: "#E9ECF0"

  border: "#DDE1E7"
  border-strong: "#C8CDD6"
  overlay: "#1C243080"

  danger: "#9B4A4A"
  danger-soft: "#F7EEEE"
  warning: "#A66B32"
  warning-soft: "#F8F1E8"
  success: "#4F765E"
  success-soft: "#EEF4F0"
  info: "#4D668C"
  info-soft: "#EEF2F7"

typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -1.0px
  display-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.7px
  headline:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.5px
  page-title:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: -0.3px
  card-title:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.1px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.60
    letterSpacing: 0
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0
  mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px

  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"

  button-secondary:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.primary}"
    borderColor: "{colors.border}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 10px 16px

  button-tertiary:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 12px

  card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px

  card-muted:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px

  ticket-row:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 14px 16px

  ticket-row-selected:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border-strong}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 14px 16px

  evidence-card:
    backgroundColor: "{colors.secondary-soft}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 20px

  text-input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-primary}"
    placeholderColor: "{colors.text-muted}"
    borderColor: "{colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 10px 12px

  text-input-focused:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.primary-focus}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 10px 12px

  tab-default:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 12px

  tab-selected:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 8px 12px

  badge-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 8px

  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 8px

  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 8px

  badge-info:
    backgroundColor: "{colors.info-soft}"
    textColor: "{colors.info}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 8px

  sidebar:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-secondary}"
    borderColor: "{colors.border}"
    typography: "{typography.body-sm}"
    width: 240px

  top-nav:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    typography: "{typography.body-sm}"
    height: 56px

  modal:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 24px
---

## Overview

Pillioo uses a light, restrained visual system designed for healthcare operations rather than consumer marketing. The interface should feel calm, trustworthy, and easy to scan during repeated review work.

The base canvas is a soft off-white (`{colors.canvas}`), while cards, tables, modals, and primary work areas use pure white (`{colors.surface-1}`). Hierarchy is created with subtle gray surfaces and thin borders instead of strong shadows or decorative gradients.

The main brand color is ink navy (`{colors.primary}`). It is reserved for the Pillioo wordmark, primary actions, selected navigation, active tabs, and important links. Muted teal (`{colors.secondary}`) is used selectively for evidence, retrieval, and analysis-related elements.

Semantic colors are intentionally desaturated. Danger, warning, success, and information states should remain recognizable without appearing loud or playful.

### Key Characteristics

- Light-mode healthcare operations interface
- Off-white canvas with white cards and panels
- Ink navy as the primary brand color
- Muted teal for evidence and analysis contexts
- Low-saturation semantic colors
- Thin borders and restrained depth
- Dense but readable ticket, evidence, and approval views
- No dark full-page canvas
- No bright gradients or decorative color blocks

## Colors

### Brand

- **Primary** (`{colors.primary}`): Pillioo wordmark, main CTA, selected navigation, active tabs, key links
- **Primary Hover** (`{colors.primary-hover}`): Hovered primary buttons and emphasized interactive states
- **Primary Focus** (`{colors.primary-focus}`): Focus rings and keyboard navigation indicators
- **Primary Soft** (`{colors.primary-soft}`): Selected rows, active menu backgrounds, subtle information emphasis

- **Secondary** (`{colors.secondary}`): Evidence, retrieval, source, and analysis-related emphasis
- **Secondary Soft** (`{colors.secondary-soft}`): Evidence cards and low-intensity analysis backgrounds

### Surface

- **Canvas** (`{colors.canvas}`): Application background
- **Surface 1** (`{colors.surface-1}`): Cards, tables, panels, modals, sidebar
- **Surface 2** (`{colors.surface-2}`): Muted panels, secondary sections, table headers
- **Surface 3** (`{colors.surface-3}`): Disabled or nested background areas
- **Border** (`{colors.border}`): Default separators and card outlines
- **Border Strong** (`{colors.border-strong}`): Selected, focused, or structurally important borders

### Text

- **Text Primary** (`{colors.text-primary}`): Page titles, drug names, ticket titles, major values
- **Text Secondary** (`{colors.text-secondary}`): Descriptions, labels, metadata, supporting copy
- **Text Muted** (`{colors.text-muted}`): Timestamps, placeholders, low-priority information
- **Text Disabled** (`{colors.text-disabled}`): Disabled controls and unavailable values

### Semantic

- **Danger** (`{colors.danger}`): Critical recall, workflow failure, destructive action
- **Danger Soft** (`{colors.danger-soft}`): Background for critical badges and alerts

- **Warning** (`{colors.warning}`): Review required, insufficient evidence, pending confirmation
- **Warning Soft** (`{colors.warning-soft}`): Background for warning badges and alerts

- **Success** (`{colors.success}`): Approved, sufficient evidence, workflow completed
- **Success Soft** (`{colors.success-soft}`): Background for success badges and alerts

- **Info** (`{colors.info}`): Processing, newly detected event, general system information
- **Info Soft** (`{colors.info-soft}`): Background for informational badges and alerts

## Color Usage Rules

1. Use `{colors.primary}` only for the most important interactive action or selected state.
2. Do not use semantic colors as large page or card backgrounds.
3. Pair each semantic foreground color with its corresponding soft background.
4. Use `{colors.secondary}` primarily for evidence, retrieval, citations, and AI analysis.
5. Keep most of the interface neutral: canvas, white surfaces, gray borders, and dark text.
6. Avoid placing several saturated colors in the same section.
7. Never communicate state through color alone; include a label or icon.

## Typography

### Font Family

- **Inter**: Default interface font for headings, body text, buttons, tables, and form labels
- **JetBrains Mono**: Ticket IDs, recall numbers, NDC values, source IDs, and technical metadata

### Hierarchy

| Token | Size | Weight | Use |
|---|---:|---:|---|
| `{typography.display-lg}` | 40px | 600 | Landing or major empty-state headline |
| `{typography.display-md}` | 32px | 600 | Major section opening |
| `{typography.headline}` | 28px | 600 | Main dashboard heading |
| `{typography.page-title}` | 24px | 600 | Ticket detail and page title |
| `{typography.card-title}` | 18px | 600 | Card and panel title |
| `{typography.body-lg}` | 16px | 400 | Important explanatory text |
| `{typography.body}` | 14px | 400 | Default UI body and table content |
| `{typography.body-sm}` | 13px | 400 | Metadata and dense UI labels |
| `{typography.caption}` | 12px | 400 | Timestamps, badges, helper text |
| `{typography.button}` | 14px | 500 | Button and tab labels |
| `{typography.mono}` | 12px | 400 | Technical identifiers |

## Layout

### Spacing

Use a 4px base unit.

- 4px: icon and compact label gap
- 8px: inline control spacing
- 12px: badge and compact row spacing
- 16px: default component gap
- 24px: card padding and section grouping
- 32px: major content separation
- 48px: page section separation
- 64px: large landing or empty-state sections

### Main Application Layout

- Desktop sidebar width: 240px
- Top navigation height: 56px
- Main content max width: 1440px
- Default page padding: 24px to 32px
- Card grid: 4-up summary cards, 2-up analysis panels, 1-up detailed tables
- Ticket detail view may use a 2-column or 3-column layout depending on available width

### Recommended Ticket Detail Structure

- Left or top: ticket identity, recall information, workflow stage
- Center: evidence, AI summary, inventory impact, recommended action
- Right: approval status, reviewer, audit history, actions

## Elevation and Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | `{colors.canvas}` with no shadow | Application background |
| 1 | White surface with 1px `{colors.border}` | Cards, rows, tables, sidebar |
| 2 | White surface with stronger border or very subtle shadow | Modal, dropdown, selected panel |
| Focus | 2px `{colors.primary-focus}` ring | Keyboard focus and active input |

Avoid strong shadows. Depth should come primarily from surface contrast, borders, and spacing.

## Shapes

| Token | Value | Use |
|---|---:|---|
| `{rounded.xs}` | 4px | Compact tags and tiny controls |
| `{rounded.sm}` | 6px | Inline labels |
| `{rounded.md}` | 8px | Buttons, inputs, tabs, ticket rows |
| `{rounded.lg}` | 12px | Cards and panels |
| `{rounded.xl}` | 16px | Modals and large feature panels |
| `{rounded.pill}` | 9999px | Status badges only |
| `{rounded.full}` | 9999px | Avatars and circular icons |

Do not make every component pill-shaped. Buttons and inputs should normally use 8px corners.

## Components

### Buttons

#### Primary Button

Use for the single most important action in a section.

Examples:
- Start Review
- Approve
- Run Workflow
- Save Report

Style:
- Background: `{colors.primary}`
- Text: `{colors.on-primary}`
- Hover: `{colors.primary-hover}`
- Radius: `{rounded.md}`

#### Secondary Button

Use for supporting actions.

Examples:
- View Evidence
- Open History
- Export Report

Style:
- Background: `{colors.surface-1}`
- Text: `{colors.primary}`
- Border: `{colors.border}`

#### Destructive Action

Destructive actions should not reuse the primary button style.

Style:
- Default background: `{colors.danger-soft}`
- Text: `{colors.danger}`
- Strong destructive confirmation may use `{colors.danger}` with white text

### Cards

Cards should use:
- White background
- 1px neutral border
- 12px radius
- 20px to 24px padding
- Little or no shadow

Do not apply brand or semantic colors to an entire general-purpose card.

### Ticket Rows

Default ticket rows remain white. Selected rows use `{colors.primary-soft}`. Criticality and workflow status should appear as compact badges rather than full-row colors.

### Evidence Cards

Evidence and citation panels may use `{colors.secondary-soft}` as a subtle background. Use `{colors.secondary}` for source icons, section labels, and evidence links.

### Inputs

Inputs use white backgrounds, neutral borders, and dark text. Focused inputs receive a navy focus ring. Placeholder text uses `{colors.text-muted}`.

### Status Badges

| State | Background | Text |
|---|---|---|
| Critical / Failed | `{colors.danger-soft}` | `{colors.danger}` |
| Review Required / Insufficient | `{colors.warning-soft}` | `{colors.warning}` |
| Approved / Sufficient / Complete | `{colors.success-soft}` | `{colors.success}` |
| Processing / New / Informational | `{colors.info-soft}` | `{colors.info}` |

Badges should include clear text. Do not rely only on red, amber, green, or blue.

### Navigation

The default sidebar and top navigation use white surfaces with neutral borders.

Selected navigation item:
- Background: `{colors.primary-soft}`
- Text: `{colors.primary}`
- Optional icon: `{colors.primary}`

Do not use a full navy sidebar in the default theme.

## Do and Don't

### Do

- Keep most of the screen white, off-white, and neutral gray.
- Use navy sparingly for important actions and selected states.
- Use muted teal for evidence and analysis contexts.
- Pair semantic colors with soft backgrounds.
- Preserve clear contrast for drug names, ticket titles, and recommended actions.
- Use borders and spacing before adding shadows.
- Keep ticket tables and review panels information-dense but readable.

### Don't

- Do not use a black or charcoal page background.
- Do not use bright blue, red, orange, and green together as large fills.
- Do not color entire ticket rows by status.
- Do not use gradients as primary backgrounds.
- Do not use strong shadows on every card.
- Do not use muted text for critical medical or workflow information.
- Do not introduce additional brand colors without updating this document.

## Responsive Behavior

### Breakpoints

| Name | Width | Behavior |
|---|---:|---|
| Desktop XL | 1440px | Full sidebar and multi-column dashboard |
| Desktop | 1200px | Full sidebar, reduced card width |
| Tablet | 1024px | Sidebar collapses, 2-column grids |
| Mobile Large | 768px | Single-column panels and drawer navigation |
| Mobile | 480px | Compact spacing, stacked ticket metadata |

### Touch Targets

- Buttons and inputs: minimum 40px height
- Primary mobile actions: minimum 44px height
- Icon-only buttons: minimum 40px by 40px
- Status badges are informational and should not be the only tap target

### Collapsing Strategy

- Summary cards: 4-up -> 2-up -> 1-up
- Ticket detail columns: 3-column -> 2-column -> 1-column
- Sidebar: fixed -> collapsed icon rail -> drawer
- Tables: preserve key columns and move secondary data into row details
- Approval actions: remain visible near the bottom or in a sticky action area

## Iteration Guide

1. Use only the color tokens defined in this document.
2. Add a new token before introducing a new raw hex value.
3. Build neutral layout and hierarchy before applying semantic colors.
4. Check primary action prominence: normally one filled navy button per section.
5. Check every state badge for both text label and sufficient contrast.
6. Check long evidence and report text at normal zoom.
7. Run `npx @google/design.md lint DESIGN.md` after edits.
8. Review desktop and mobile layouts before merging.

## Known Gaps

- Chart colors are not yet defined. Until required, prefer navy, muted teal, and neutral gray.
- Dark mode is not included in the current MVP.
- Data visualization, empty states, and illustration styles require separate rules if introduced.
- Final accessibility contrast should be validated in implementation.
