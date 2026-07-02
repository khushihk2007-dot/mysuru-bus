# Mysore Transit Live — Design System Spec

Welcome to the Mysore Transit Live Design System, a professional, data-centric, and calm design language engineered for real-time public transit tracking and intelligence. Inspired by standard dashboard systems like Apple Maps, Stripe, Linear, and FlightRadar24, this system prioritizes extreme legibility, high data density, and professional restraint over decorative design trends.

---

## 1. DESIGN PRINCIPLES

- **Calm over Flashy**: We avoid bright neon grids, gaming aesthetics, glassmorphic overlays, and heavy gradients. We use a muted, flat aesthetic with hairline borders and soft shadow elevation.
- **Clarity over Decoration**: Colors, shapes, and borders are semantic. Every color is functional. Every icon is utility-driven.
- **Warm Light Mode**: Mysore Transit Live primarily targets a light theme utilizing warm whites (`#FAF9F5`), elevated card surfaces (`#FFFFFF`), and soft charcoal slates (`#181E29`) for typography to feel friendly and legible.
- **Rich Dark Mode**: Support is built in for deep charcoal backgrounds rather than pure black, ensuring excellent contrast and readability during night tracking.
- **8-Point Spacing Grid**: Every margin, padding, gap, and layout spacing utilizes strict 8-point increments (from 4px to 96px).

---

## 2. FOLDER STRUCTURE

All design-system tokens and reusable component items are organized under these specific paths:

```
src/
├── design/                   # JS Design Tokens
│   ├── colors.js             # Semantic palette and route mappings
│   ├── spacing.js            # 8-point spacing tokens & tailwind maps
│   ├── typography.js         # Typography scale, weights, and heights
│   ├── radius.js             # Border radius tokens (Small to Circle)
│   ├── shadows.js            # Shadow elevations (Level 0 to Level 4)
│   ├── animations.js         # Motion durations, easings, transitions
│   ├── breakpoints.js        # Responsive breakpoints
│   └── zIndex.js             # Layout layer heights
│
├── styles/                   # Global style configuration
│   └── globals.css           # CSS Variables, Tailwind v4 @theme, base overrides
│
└── components/               # Unified Reusable UI Component library
    ├── index.js              # Aggregated main exports file
    ├── buttons/              # CVA-based Button suite
    ├── forms/                # Form inputs, selectors, and controls
    ├── search/               # Floating search and result components
    ├── navigation/           # Rails, Sidebars, Tabs, Breadcrumbs, Pagination
    ├── cards/                # Info, Stats, Route, Bus, Stop, Depot cards
    ├── feedback/             # Badges, Chips, Empty states, Loaders, Toasts
    ├── map/                  # Zoom, locate, compass, layers, scale, overlays
    ├── drawers/              # BottomSheet, Side drawers, info panels
    ├── dialogs/              # Confirm, delete, detail, settings dialogs
    ├── overlays/             # Tooltips and profile/filter/route dropdowns
    ├── timeline/             # Vertical, horizontal, and route progress timelines
    ├── lists/                # Bus, Route, Stop, Search Result collections
    ├── tables/               # Sortable data tables with footers
    ├── status/               # Live, Moving, Stopped, Delayed dots and indicators
    └── layout/               # Accordions and Framer Motion wrappers
```

---

## 3. COLOR SYSTEM

Colors are driven by CSS variables defined in `src/app/globals.css` and mapped to Tailwind colors inside `@theme`.

### Semantic Tokens
- **Primary**: Navy Indigo (`hsl(215 90% 32%)` for light, `hsl(215 90% 55%)` for dark).
- **Secondary**: Slate Grey (`hsl(214 15% 94%)` for light, `hsl(215 12% 18%)` for dark).
- **Surface**: Subtle background panel color (`hsl(215 15% 96%)` for light, `hsl(215 15% 12%)` for dark).
- **Border**: Hairline dividers (`hsl(214 16% 91%)` for light, `hsl(215 12% 20%)` for dark).
- **Status Dots**: 
  - `Live / Moving`: Emerald green (`hsl(142 70% 32%)` / `hsl(142 60% 45%)`)
  - `Stopped`: Cyan info blue (`hsl(199 89% 38%)` / `hsl(199 80% 50%)`)
  - `Delayed`: Amber warning (`hsl(35 90% 48%)` / `hsl(35 80% 50%)`)
  - `Offline / Error`: Muted slate / crimson red (`hsl(0 84% 44%)` / `hsl(0 75% 55%)`)

### Route Colors
We define **16 distinct route colors** that remain distinguishable on both light and dark backgrounds by applying luminance adjustments in dark mode:
- Route 1 (Crimson) to Route 16 (Steel). Refer to [colors.js](file:///d:/projects/mysore-bus/src/design/colors.js).

---

## 4. TYPOGRAPHY SCALE

Using the Next.js `Geist` font family linked with system font-stacks. Defined in `src/design/typography.js`:

| Token | Class / Equivalent | Font Size | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display` | 2.25rem (36px) | Extrabold | 1 (none) |
| **Heading 1** | `h1` | 1.875rem (30px) | Bold | 1.25 (tight) |
| **Heading 2** | `h2` | 1.5rem (24px) | Semibold | 1.375 (snug) |
| **Heading 3** | `h3` | 1.25rem (20px) | Semibold | 1.375 (snug) |
| **Title** | `title` | 1.125rem (18px) | Semibold | 1.5 (normal) |
| **Subtitle** | `subtitle` | 1rem (16px) | Medium | 1.625 (relaxed) |
| **Body Large**| `bodyLarge` | 1rem (16px) | Normal | 1.625 (relaxed) |
| **Body** | `body` | 0.875rem (14px) | Normal | 1.5 (normal) |
| **Body Small**| `bodySmall` | 0.75rem (12px) | Normal | 1.5 (normal) |
| **Caption** | `caption` | 0.75rem (12px) | Normal | 1 (none) |
| **Overline** | `overline` | 11px | Bold (Caps) | 1 (none) |
| **Code** | `code` | 0.75rem (12px) | Monospace | 1.5 (normal) |

---

## 5. SPACING SYSTEM

Defined in `src/design/spacing.js`. Margin hardcoding is prohibited.

- **4px (`xs`)**: Mini gaps, badge padding.
- **8px (`sm`)**: Standard card padding, small gaps.
- **12px (`md`)**: Section gaps, secondary lists.
- **16px (`lg`)**: Content panels, layout padding.
- **20px (`xl`)**: Side panel borders.
- **24px (`2xl`)**: Large layout partitions.
- **32px (`3xl`)**: Sub-page offsets.
- **40px / 48px / 64px / 80px / 96px**: Grid spacing.

---

## 6. RADIUS SYSTEM

Radius tokens defined in `src/design/radius.js`:

- **Small (`sm`)**: 4px – checkbox, small badge, mini button.
- **Medium (`md`)**: 6px – default button, standard input.
- **Large (`lg`)**: 8px – standard card, control panels.
- **XL (`xl`)**: 12px – popup lists, dropdown overlays.
- **2XL (`2xl`)**: 16px – side sheets, desktop dialog panels.
- **Pill (`pill`)**: 9999px – chips, toggle switches.
- **Circle (`circle`)**: 100% (Aspect Square) – avatars.

---

## 7. SHADOW & ELEVATION

Shadow tokens defined in `src/design/shadows.js`:

- **Level 0**: No shadow.
- **Level 1**: Standard cards, table rows (`shadow-sm`).
- **Level 2**: Floating controls, map control widgets (`shadow-md`).
- **Level 3**: Dropdown popovers, list flyouts (`shadow-lg`).
- **Level 4**: Modals, sheets, dialog boxes (`shadow-xl`).

---

## 8. ANIMATION SYSTEM

Motion curves defined in `src/design/animations.js` are optimized for utility. No spinning icons or heavy bounces:

- **Durations**: Very Fast (75ms), Fast (150ms), Medium (300ms), Slow (500ms).
- **Easing**: Apple-like premium transition curve: `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Subtle Motions**:
  - `Hover Lift`: Hovering lifts element up by 2px, active clicks press it back down by 0.5px.
  - `Hover Scale`: Tiny scaling (`scale-101`) with active click depression (`scale-99`).
  - `Drawer Slide`: Smooth sliding drawers.
  - `Map Loader`: Subtly fading overlay with a pulsing radar signal beacon.

---

## 9. Z-INDEX HIERARCHY

All layered interfaces must conform to these layout heights, defined in `src/design/zIndex.js`:

```
z-index: 75  →  Tooltips (topmost)
z-index: 60  →  Toast alerts
z-index: 50  →  Dialogs / Modals
z-index: 40  →  Drawers / Sheets
z-index: 30  →  Floating Map Controls
z-index: 20  →  Dropdown menus
z-index: 10  →  Sticky headers
z-index: 0   →  Cards / Content layers
z-index: -10 →  Map / Background layer
```

---

## 10. REUSABLE COMPONENTS SUMMARY

1. **Buttons**: Integrated variant flags for Primary, Secondary, Ghost, Outline, Link, Destructive, Success, FAB, Icon, and Loading/Disabled button variants.
2. **Forms**: Inputs (Standard, Search with clear, Eye-toggle Password, Number Stepper, OTP Focus Grid, Autocomplete, Textarea), dropdown Select, searchable Combobox, and input selectors (Checkbox, Switch, RadioGroup, RadioButton, Slider).
3. **Search**: Floating search bar, search result list, autocompletes, recent history, filter badges, and voice search indicators.
4. **Navigation**: Main layouts (Desktop Rail, Top Nav, Bottom Tab Nav, Collapsible Sidebars, Breadcrumbs, Tabs, and Table Pagination).
5. **Cards**: 12 transit cards (Info, Stats, Route, Bus Speed/Occupancy, Stop arrival, Depot capacity, Analytics Chart, Interactive action, Hover map card, Glass cards, Feature cards, Settings card).
6. **Badges/Chips**: Beacons (Live, Online, Offline, Moving, Stopped, Delayed, On-time, Favorite, Warning, Success, Danger, Neutral) and tags (Route, Stop, Bus, Status, Filter, Favorite chips).
7. **Empty/Loading**: Skeletons (Card, List, Sidebar, Search, Panel, Timeline) and loader widgets (LoadingSpinner, LinearProgress, CircularProgress).
8. **Drawers/Dialogs**: BottomSheet sliding draw, SideDrawer (left/right), Floating drawers, and Modals (Confirm, Delete, Info, Route details, Settings dialogs).
9. **Overlays**: Position-aware Tooltips (Small, Rich, Keyboard shortcut kbd) and Dropdown actions (Profile, Filter checkbox list, Context-menu, Route picker, Quick Settings).
10. **Timeline/Lists**: Event pipelines (Vertical, Horizontal, Step progress, Stop sequence progress, Activity logs) and optimized row selectors (Bus, Route, Stop, Search Result, Activities, Notifications, Favorites lists).
11. **Tables**: Generic sortable data tables with empty templates, skeleton loading placeholders, and pagination footer tools.
12. **Status**: Real-time status dots (Moving, Stopped, Offline, GPS lost warning, Live beacon, Delayed).
13. **Layout**: Interactive Accordions (Settings, FAQs, Advisories) and Framer Motion wrappers (Fade, Slide, Scale, ButtonTap, Floating).

---

## 11. ACCESSIBILITY COMPLIANCE (WCAG AA)

- **Color Contrast**: Muted secondary text scales have been kept above 4.5:1. Primary actions are high contrast.
- **Focus Rings**: Standard inputs, buttons, and switches have outline-free glowing focus rings (`ring-ring ring-offset-2`).
- **Keyboard Friendly**: Custom controls like checkboxes, radios, switches, dropdowns, sheets, and dialogs are fully interactive via keyboard events (ESC, Space, Enter keys).
- **Target Size**: Floating buttons, navigation items, and control switches maintain a minimum click target of `36px` to `48px` to ensure touch accuracy.
