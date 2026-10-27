# DESIGN.md - Aksaventra Dashboard

## 1. Visual Theme & Atmosphere
The design must convey **technical reliability**, **precision**, and **operational control**. It should not feel like a social network or a gaming app. The interface is engineered for seamless viewing on a laptop, desktop, or tablet in an Indonesian residential, commercial, or enterprise setting. The overall atmosphere is a streamlined, high-contrast command center—similar to an enterprise analytics dashboard, but simplified and intuitive for the end user.

## 2. Color Palette
- **Primary Background:** `#121212` (Dark Mode for visual efficiency, reduced eye strain, and sharp data contrast).
- **Card Surface:** `#1E1E1E` (Elevated surface for modules and widgets).
- **Primary Accent (Brand & Data):** `#00E5FF` (Electric Cyan) for primary data visualization, main KPIs, active states, and primary action buttons.
- **Alert Accent:** `#FF453A` (Crimson Red) for critical anomalies, threshold spikes, or system warnings.
- **Secondary Accent:** `#32D74B` (Emerald Green) for "Live/Online" status indicators, optimal performance, or positive growth metrics.
- **Primary Text:** `#FFFFFF` (High contrast for primary headings and critical values).
- **Secondary Text:** `#98989D` (Muted Gray for axis labels, timestamps, and metadata).

## 3. Component Stylings
- **Cards:** `border-radius: 16px`. Background `#1E1E1E`. Internal padding of `20px`. Subtle border: `1px solid #2C2C2E` to define structure without visual clutter.
- **Charts:** Grid lines in `#2C2C2E`. Primary data lines in `#00E5FF` paired with `#30D158` or translucent cyan for smooth area gradients. No thick border lines.
- **Tables:** Rows separated with `border-bottom: 1px solid #2C2C2E`. Row hover state shifts background to `#252525` for scannability.
- **Alerts:** Notification box with `#3A1C1C` background, `#FF453A` red text, and an indicator left border of `4px solid #FF453A`.

## 4. Typography
- **Headings:** Inter, Semi Bold, `24px` (Clean, modern geometric sans-serif for section titles).
- **KPI Metrics (Units, Volume, Rp):** JetBrains Mono or Fira Code (Monospace font for tabular numbers to prevent layout shift during live updates), Bold, `32px`.
- **Body & Labels:** Inter Regular, `14px`.

## 5. Layout Principles
- **Grid:** 12-column responsive layout.
- **Spacing:** Strict multiples of `8px` (`8px`, `16px`, `24px`, `32px`) for consistent rhythm and alignment.
- **Dashboard Structure:** 
  - **Top Row:** 3-column summary view (4 columns each) for top-level KPIs.
  - **Main Content:** Primary analytical chart occupying 8 columns on the left; real-time Alerts & Activity Panel occupying 4 columns on the right.

## 6. Do's and Don'ts
- ✅ **Do:** Use smooth area charts with subtle gradients to visualize trends and soften sudden spikes.
- ✅ **Do:** Always include the financial or local currency equivalent in Indonesian Rupiah (`Rp`) alongside primary consumption/performance metrics where applicable.
- ❌ **Don't:** Use pastel colors or pure white backgrounds (they cause glare and fatigue during prolonged monitoring sessions).
- ❌ **Don't:** Use generic, playful clipart icons. Prefer sharp, technical vector icons (e.g., pulse, nodes, gauge, server, or lightning bolt).