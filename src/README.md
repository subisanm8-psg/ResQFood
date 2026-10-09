# ResQFood — Smart Food Waste Redistribution Platform (Tamil Nadu)

ResQFood is an algorithmic food waste redistribution platform designed for Tamil Nadu. It connects restaurants, hotels, messes, caterers, and wedding halls directly with shelters, orphanages, old age homes, and community kitchens across all 38 districts of Tamil Nadu before food spoils.

Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, **Zustand** (with `localStorage` persistence), **React Router**, **react-i18next**, **Leaflet** with OpenStreetMap tiles, **Recharts**, and **Framer Motion**.

---

## 1. Quick Start

Run the application locally:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Test & Validation Scripts

- **Run algorithmic test suite**:
  ```bash
  npm test
  ```
  Runs Vitest test files covering matching algorithms, distance calculations, tiered pricing models, multi-dish validation, and translation key parity.

- **Check English & Tamil translation parity**:
  ```bash
  npm run check-lang
  ```
  Enforces 100% structural parity between `src/locales/en.json` and `src/locales/ta.json`.

- **Production Build**:
  ```bash
  npm run build
  ```

---

## 2. Demo Accounts & Credentials

The platform provides pre-seeded accounts for each role with one-click demo login buttons on the `/auth` page:

| Role | Email | Password | Display Entity | Special Behavior |
|---|---|---|---|---|
| **Admin** | `admin@resqfood.org` | `Admin@123` | TN Food Safety Directorate | Statewide oversight, partner verification, Help Fund audit, "View as" preview |
| **Provider** | `annapoorna@resqfood.org` | `Provider@123` | Annapoorna Mess (Coimbatore) | Multi-dish basket listing, waste logging, active inventory |
| **Low Charge Receiver** | `anbuillam@resqfood.org` | `Receiver@123` | Anbu Illam Orphanage (Erode) | Pays nominal delivery fee; 90% covered by Help Fund |
| **High Charge Receiver** | `tcs@resqfood.org` | `Receiver@123` | Tech Park Dining (Siruseri, Chennai) | Pays full logistics fee + 25% Help Fund contribution |

- **Admin Invite Code**: `RESQ-ADMIN-2026` (required when signing up a new Admin).
- **Security Note**: Passwords are pre-hashed and validated locally using the **Web Crypto API** (`SHA-256` with random per-user salt). This is designed for front-end demonstration security and client-side credential verification only.

---

## 3. Brand & Visual Design System

- **Product Name**: ResQFood (always untranslated).
- **Logo Mark**: Plate with a leaf SVG mark beside the wordmark.
- **Palette Tokens**:
  - **Butter yellow**: `#FFF3C4` (soft background), `#F9E08B` (accent), `#F2C94C` (buttons, highlights)
  - **Cream**: `#FFFBEA` (page background), `#FFFFFF` for rounded-2xl cards
  - **Brown**: `#5A3A22` (primary text & primary buttons), `#7B5233` (secondary), `#B8793A` (caramel accent), `#E8D9B5` (borders)
  - **Status**: Green `#4F8A5B` (safe), Amber `#E0A100` (warning), Red `#C0492F` (critical)
- **Typography**: Poppins for English, Noto Sans Tamil for Tamil. Large readable body ($\ge 16$px). Strictly **no emojis**; all visual accents use SVG illustrations and Lucide icons.

---

## 4. Bilingual Architecture (English & தமிழ்)

- Full internationalization powered by `react-i18next`.
- One-click instant language toggle (`English | தமிழ்`) in top navigation and auth screens; persists in `localStorage`.
- Everyday language translation:
  - Surplus food: "Extra food" / "மீதமுள்ள உணவு"
  - Expiry: "Use before" / "இதற்குள் பயன்படுத்தவும்"
  - Affordability tier: "How much can you pay?" / "நீங்கள் எவ்வளவு செலுத்த முடியும்?"
  - Subsidy Pool: "Help Fund" / "உதவி நிதி"
  - Urgency: "How urgent?" / "எவ்வளவு அவசரம்?"
  - Match scoring: "Finding the best match" / "சரியான பொருத்தத்தைக் கண்டறிகிறது"

---

## 5. Tamil Nadu Geospatial Network & Speed Model

- **Dataset**: All 38 districts of Tamil Nadu (`src/data/tamilnadu.ts`) with district headquarters, lat/lng boundaries, and >150 towns and villages.
- **Speed Calculation**:
  - Distance $< 8$ km: **25 km/h** (urban traffic)
  - Distance $\ge 8$ km: **40 km/h** (inter-town highway transit)
  $$\text{ETA}_{\text{minutes}} = \max\left(5, \frac{\text{Distance}_{\text{km}}}{\text{Speed}_{\text{km/h}}} \times 60\right)$$
- **Max Travel Distance Filter**: Configurable between 5 km and 150 km (default **60 km**). Candidate pairs exceeding this threshold are rejected with hard constraint reason: `"Too far"`.
- **Map Tiles**: OpenStreetMap standard tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`) with warm styling filter (`.leaflet-tile-pane`), bounded to Tamil Nadu coordinates `[[7.9, 76.1], [13.7, 80.5]]`.
- **Turn-by-turn road routing**: Fetches live road geometry from the OSRM project with straight-line fallback.

---

## 6. Algorithmic Formulation & Transparent Pricing

### Priority Ranking
Open food requests are ranked using a multi-factor linear weighting:
$$\text{Priority} = 0.40 \cdot U + 0.25 \cdot V + 0.20 \cdot W + 0.15 \cdot S$$
- $U$ (Urgency): Critical = 1.0, High = 0.75, Medium = 0.5, Low = 0.25
- $V$ (Vulnerability Score): Derived from receiver organization type and affordability tier
- $W$ (Wait Time): Clamped to 6 hours max: $\min(1.0, \Delta t / 6\text{h})$
- $S$ (Shortfall): Remaining unallocated demand ratio

### Match Suitability Score
$$\text{Score} = w_{\text{waste}} \cdot \text{ExpiryPressure} + w_{\text{dist}} \cdot (1 - \text{DistanceNorm}) + w_{\text{demand}} \cdot \text{HeadcountFit}$$
Default objective weights: $w_{\text{waste}} = 0.40$, $w_{\text{dist}} = 0.30$, $w_{\text{demand}} = 0.30$ (dynamically tunable via Demo Controls).

### Transparent Pricing & Help Fund
- **Food Packing & Handling**: Flat fee based on allocated portions.
- **Delivery Transit Cost**: Vehicle rate per km multiplied by route distance (minimum base fee applied).
- **Tier Settlement**:
  - **Low Tier (Nominal fee)**: Help Fund covers **90%** of delivery transit cost.
  - **Medium Tier (Standard)**: Pays 100% of base logistics cost.
  - **High Tier (Cross-subsidy contributor)**: Pays base logistics cost plus a **+25% Help Fund contribution**.

---

## 7. Key Features

1. **Multi-Dish Food Basket Listing**: Providers enter pickup details once at the top, select regional dishes from the Tamil Nadu catalogue (Idli, Pongal, Chettinad Chicken, Biryani, Halwa, etc.), view live basket totals, and publish in one atomic action.
2. **Multi-Request Receiver Creation**: Community receivers can submit multiple food requests with varied dietary preferences simultaneously.
3. **Admin Verification & Oversight**: Network administrators can verify or suspend providers and receivers, adjust the maximum travel distance threshold, and audit Help Fund transactions.
4. **Interactive Demo Drawer**: Tune algorithm weights, adjust simulated virtual clock speed (1x, 10x, 60x), and preview views as Provider or Receiver directly.
5. **Impact Analytics & Decision Log**: Benchmark smart vs baseline redistribution efficiency, view CO2 and landfill savings, and export decision logs to CSV.

---

## 8. Targeted Fixes & System Verification

The platform underwent four targeted fixes to ensure production-grade robustness and complete data consistency:

### Fix 1: Map Tiles Without API Keys
- Centralized tile source definitions in `/src/lib/mapTiles.ts`:
  - **OpenStreetMap standard**: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
  - Attribution: `© OpenStreetMap contributors`
  - `maxZoom`: 19
- Removed all dependencies on CARTO and tile fallback lists.
- Added CSS filter for warm theme harmony:
  ```css
  .leaflet-tile-pane { filter: saturate(0.75) sepia(0.2) brightness(1.03); }
  ```

### Fix 2: Consistent Indian Rupees (Rs.) Everywhere
- Centralized `formatRupees(amount, language)` in `/src/lib/currency.ts` utilizing `Intl.NumberFormat` (`en-IN` and `ta-IN`), formatted as `"Rs. 1,250"` and `"-Rs. 279"`, rounded to whole rupees.
- All pricing, budgets, and fund amounts are stored strictly as integers.
- Removed all stray dollar signs and `USD` strings across the entire user experience (proposals, modal breakdowns, Help Fund cards, Admin tiles, analytics charts, tooltips, and the Demo Drawer).
- CSV decision export includes an `amount_rs` column containing integer numbers without currency symbols.
- Added automated Vitest audit (`src/lib/__tests__/currencyAudit.test.ts`) that recursively scans `/src` and asserts zero occurrences of `USD` or `$` currency indicators.

### Fix 3: Pure Help Fund (Subsidy) Engine & Immutable Ledger
- Rebuilt `/src/lib/pricing.ts` with pure whole-rupee math:
  - **Food handling fee**: Rs. 2/portion, or Rs. 10/kg.
  - **Delivery cost**: $\max(\text{vehicle minimum}, \text{distance} \times \text{ratePerKm})$. Vehicle minimums: Auto Rs. 80, Cab Rs. 100, Mini Van Rs. 150, Large Van Rs. 250. Rates: Auto 12, Cab 14, Mini Van 18, Large Van 25.
  - **Low Tier**: Receiver pays $\min(10\% \text{ of basePrice}, \text{Rs. } 50)$; Help Fund covers remainder.
  - **High Tier**: Receiver pays basePrice $+ 25\%$; excess enters Help Fund as a contribution.
- The Help Fund operates on an immutable transaction ledger (`src/store/useAppStore.ts`), initialized with a Rs. 2,000 opening contribution:
  $$\text{Balance} = \sum \text{Contributions} - \sum \text{Subsidies} + \sum \text{Reversals}$$
- **Idempotent processing**: Accepting an offer locks payment so double-clicks do not drain the pool.
- **Insufficient balance guard**: When the Help Fund balance cannot cover a Low-tier request, the match stays proposed and displays:
  `'The Help Fund does not have enough money right now. Please try a smaller order or wait.'`
- **Cancellation reversal**: Cancelling before pickup logs a reversal transaction and immediately restores the fund balance.

### Fix 4: Real-Time Delivery Tracking & Cross-Dashboard Synchronization
- Unified delivery lifecycle state on every match:
  - `Partner assigned` (progress 0)
  - `Heading to pickup` (progress 0 to 0.25)
  - `Picked up` (progress 0.25 to 0.3)
  - `On the way` (progress 0.3 to 1.0)
  - `Delivered` (progress 1.0)
- The global simulated clock ticker drives route progress continuously and synchronizes across all views:
  - **Receiver**: Status chip and thin progress bar in the request row; animated van icon along progress track, addresses, courier info, countdown ETA, and a "Confirm Food Received" button enabled strictly at 100%.
  - **Provider**: Live tracking card in "Your deliveries" showing driver approach, status chip, and progress bar.
  - **Admin**: Moving van marker and road geometry on the statewide map, plus an "Active Deliveries in Transit" panel.
  - **Demo Controls**: Added a "Speed up this delivery (+35%)" button to accelerate transit testing in seconds.
- Route requests use `fetchRouteWithFallback` with a 5-second timeout and graceful straight-line fallback.

