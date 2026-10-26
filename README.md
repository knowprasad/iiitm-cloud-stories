# Event Badge Studio — Google Cloud Study Jams 2026

A production-quality, public-facing event badge and social-card generator built for **Google Cloud Study Jams with Community 2026** (organized by **GDG on Campus**) and designed with a reusable multi-campaign architecture for future student conferences, hackathons, and developer gatherings.

Inspired by the visual design, high-contrast typography, and interaction model of [DevFest Bhopal Badge Studio](https://devfest.bhopal.dev/badge).

---

## 🌟 Key Features

### 1. Interactive 3D Perspective Tilt Card
* Real-time CSS 3D card tilt (`perspective: 1400px`, `preserve-3d`) tracking cursor or touch movements with specular light sheen reflections.
* True-to-life physical conference pass appearance with subtle elevation shadows.

### 2. High-Resolution Canvas Rendering Engine
* Crystal-clear offscreen HTML Canvas rendering supporting 2x Retina exports.
* **4 Social Output Formats**:
  * **Portrait Post (4:5)**: `1080 × 1350 px` (Optimized for LinkedIn and Instagram feed).
  * **Story / Status (9:16)**: `1080 × 1920 px` (Instagram Stories, WhatsApp Status).
  * **Square Post (1:1)**: `1080 × 1080 px` (Standard feed card).
  * **Wide Header (16:9)**: `1200 × 675 px` (Twitter / X landscape post).
* **2 Distinct Layout Archetypes**:
  * **Ticket Pass**: Authentic conference ticket complete with circular notch perforations, tear lines, authentic barcode graphic, event credentials, and live working QR code pointing to event resources.
  * **Creator Card**: Bold hero portrait, prominent attendee name with auto font-scaling, social `@handle`, role pill, track tag, and stickers.

### 3. Multiple Curated Themes
* **Cloud Explorer**: Clean modern Google Cloud Blue (`#4285F4`) aesthetic with cloud infrastructure circuit motifs.
* **Builder Edition**: Sleek dark-mode midnight palette (`#0D1330`) with glowing Vertex AI & Gemini violet/gold gradients.
* **Campus Edition**: Warm ivory canvas (`#FAF5EA`) with celebratory Google 4-color geometry and collegiate energy.

### 4. Photo Customization & Privacy
* Processed **100% locally in the browser** — no user photos are ever uploaded or stored on any server.
* Supports JPG, PNG, and WebP uploads.
* Interactive **Crop & Zoom modal** with scale controls (1x to 3x) and horizontal/vertical pan adjustments.
* **GitHub Avatar Fetcher**: Enter a GitHub username to automatically fetch public high-res profile photos with built-in rate-limit handling and error feedback.
* **Monogram Fallback**: If no photo is uploaded, renders a stylish gradient monogram with the attendee's initials.

### 5. Multi-Select Stickers & Badges
* Choose up to 3 decorative stickers:
  * ☁️ Cloud Native
  * 🤖 Built with Gemini
  * ☕ Chai & Code
  * ⚡ Ship to Prod
  * 📱 Flutter Fan
  * 🚀 10x Builder
  * ❤️ GDG on Campus
  * 🌐 Open Source
  * 🏆 Jam Certified

### 6. Seamless Export & Honest Sharing
* High-contrast primary CTA (`🚀 Share my badge`) triggering celebratory confetti bursts (`canvas-confetti`).
* **Web Share API**: Directly invokes native OS sharing dialog with attached PNG file where supported.
* **Social Feed Fallback**: Direct 1-click links for LinkedIn and X (Twitter) prefilled with event hashtags (`#GoogleCloudStudyJams #GDGOnCampus #StudyJams2026`).
* **1-Click Copy Caption**: Expandable caption with personalized role, track, and registration details.
* **Mobile-First Floating Bar**: Fixed glassmorphic bottom bar (`lg:hidden`) for effortless sharing and downloading on phones.

### 7. Reusable Multi-Campaign Architecture
* Decoupled from hardcoded event logic via `src/config/eventConfig.ts`.
* Switch between campaigns with the top campaign selector modal (e.g., *Google Cloud Study Jams 2026* vs *DevFest Campus 2026*).

---

## 🛠️ Tech Stack & Architecture

* **Framework**: React 19 + TypeScript
* **Build Tool**: Vite 6
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **QR Generation**: QRCode
* **Effects**: Canvas Confetti
* **Testing**: Vitest + JSDOM

### Directory Structure
```
c:/PROJECTS/GDG_Cloud _Badge/
├── docs/
│   └── reference-analysis.md    # Reverse-engineering discoveries & measurements
├── src/
│   ├── config/
│   │   └── eventConfig.ts       # Campaign declarations, themes, roles, tracks
│   ├── engine/
│   │   └── canvasRenderer.ts    # High-res canvas rendering, notch math & layouts
│   ├── types/
│   │   └── badge.ts             # TypeScript definitions
│   ├── utils/
│   │   ├── github.ts            # GitHub profile avatar fetcher
│   │   ├── qrcode.ts            # QR code generator
│   │   └── share.ts             # Web Share API, download & social intents
│   ├── components/
│   │   ├── Header.tsx           # Event branding, navigation & hero
│   │   ├── PreviewCard.tsx      # 3D interactive tilt badge preview
│   │   ├── EditorCard.tsx       # Photo, name, theme, and options editor
│   │   ├── ActionButtons.tsx    # Share CTA, download, LinkedIn, X & caption
│   │   ├── MobileActionBar.tsx  # Persistent bottom floating bar
│   │   ├── PhotoAdjustModal.tsx # Interactive crop, zoom & pan modal
│   │   └── EventModal.tsx       # Multi-campaign switcher modal
│   ├── tests/
│   │   ├── dimensions.test.ts   # Output format calibrations
│   │   ├── eventConfig.test.ts  # Schema & caption interpolation tests
│   │   ├── github.test.ts       # Username validation tests
│   │   └── share.test.ts        # Intent URL generation tests
│   ├── App.tsx                  # Main orchestration container
│   ├── main.tsx                 # Entrypoint
│   └── index.css                # Global styles & keyframe animations
├── tailwind.config.js           # Design tokens & color system
├── vite.config.ts               # Vite configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18+ (tested on Node.js v24)
* npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run Test Suite
```bash
npm test
```
Executes all 13 unit and integration tests covering dimensions, caption generation, GitHub validation, and social links.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized production bundle inside `dist/`.

### 5. Preview Production Build Locally
```bash
npm run preview
```
Serves the built application locally at `http://localhost:4173`.

---

## 🌐 Deployment Instructions

The application is a pure client-side Single Page Application (SPA), making it fast, free, and straightforward to host on modern edge platforms:

### Deploy to Cloudflare Pages
1. Push your repository to GitHub.
2. In Cloudflare Dashboard, go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Set build configuration:
   * **Framework preset**: `Vite`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
4. Click **Save and Deploy**.

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` from the project root and accept defaults (Framework: `Vite`, Output: `dist`).

### Deploy to Firebase Hosting
1. Run `firebase init hosting`.
2. Set public directory to `dist` and configure as a single-page app (`y`).
3. Build and deploy: `npm run build && firebase deploy --only hosting`.

---

## 🎨 Adding a New Campaign

To launch a badge generator for another event (e.g. Hackathon or Workshop):
1. Open [`src/config/eventConfig.ts`](file:///c:/PROJECTS/GDG_Cloud%20_Badge/src/config/eventConfig.ts).
2. Create an `EventConfig` object with your event's title, dates, registration link, themes, roles, tracks, and custom hashtags.
3. Add it to `availableEvents`.
The application immediately supports it without modifying any component code!
