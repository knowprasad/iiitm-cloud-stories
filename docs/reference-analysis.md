# Reference Analysis: DevFest Bhopal 2026 Badge Studio

## 1. Overview & Product Archetype
The reference website is **[DevFest Bhopal 2026 Badge Studio](https://devfest.bhopal.dev/badge)**, built by the GDG Cloud Bhopal team.
It is an interactive attendee badge and social-card generator enabling conference attendees, speakers, and volunteers to create personalized, branded graphics for LinkedIn, X (Twitter), Instagram, and WhatsApp.

The product solves a major community marketing goal:
- Converting registered attendees into vocal advocates on social media before the event.
- Providing high-aesthetic social collateral that students and developers take pride in sharing.
- Delivering zero-friction utility: no logins, no paywalls, instant client-side rendering, and instant export.

---

## 2. Visual Hierarchy & Composition

### Layout Structure
* **Header / Hero Section**:
  * Eyebrow & Title: Bold, punchy statement (`"Pass secured. Now flex it! 🎟️"`) with high tracking and heavy weight (`font-black tracking-tight`).
  * Subtitle: Clear reassurance (`"Add your photo and name, then share it on LinkedIn, Instagram or X. Just for sharing: your KonfHub ticket is what gets you in."`).
* **Two-Column Desktop Split (`lg:grid-cols-2 lg:gap-12`)**:
  * **Left Column (Sticky Preview)**:
    * Stays anchored on desktop scroll (`lg:sticky lg:top-24`).
    * **3D Perspective Tilt Card**: CSS 3D transform (`perspective: 1400px`, `rotateX`, `rotateY`, `scale3d(1.01, 1.01, 1.01)`, `preserve-3d`).
    * **Specular Reflection**: Subtle radial gradient overlay that glides across the badge surface based on cursor/touch position.
    * **Elevated Shadow**: Deep warm realistic drop shadow (`rgba(158, 42, 31, 0.533) 0px 30px 70px -20px`).
    * **Direct Interaction**: Floating `+ Photo` overlay button positioned right above the avatar spot for immediate affordance.
  * **Right Column (Editor Card)**:
    * Contained inside a card (`rounded-2xl sm:rounded-3xl border border-df-border bg-df-bg-raised p-4 sm:p-7 shadow-xl`).
    * Streamlined primary controls:
      1. Photo upload (circular thumbnail with camera icon + "Upload photo" button).
      2. Full Name input (large, prominent, max 40 chars).
      3. Theme Selector (horizontal pills with split circular gradient swatches).
    * Secondary controls tucked neatly into an expandable accordion (`<details> More options: @handle, size, role, stickers`):
      1. GitHub Avatar fetcher (`"or use your GitHub photo"` + `Fetch` button).
      2. Attendee Kind (`I'm attending / speaking / volunteering`).
      3. Social Handle (`@handle` for Instagram, X, YouTube).
      4. Layout switch: `Creator` (photo hero + handle) vs `Ticket` (event pass with QR & notch perforations).
      5. Output Size / Format: `Post` (4:5 / 1:1), `Story` (9:16), `Wide` (16:9).
      6. Professional Role dropdown (Full Stack, AI/ML, Cloud Architect, DevOps, Student, etc.).
      7. Favorite Track dropdown (Generative AI, Cloud & DevOps, Android & Flutter, Web, Open Source).
      8. Interactive Stickers: Multi-select chips (max 3) with custom emoji badges.
    * Action Bar:
      1. High-contrast primary CTA: `🚀 Share my badge` (`bg-df-yellow text-df-ink shadow-xl font-black uppercase`).
      2. Secondary row: `Download`, `LinkedIn`, `X`.
      3. Expandable social caption (`▸ See the caption` + `Copy caption` button).
      4. Registration CTA footer card (`Haven't booked your pass yet? Regular passes are live... Get Tickets →`).
* **Mobile Experience (`lg:hidden`)**:
  * Single column flow: Header -> 3D Card Preview -> Form.
  * **Persistent Bottom Floating Action Bar**: Fixed glassmorphic pill bar (`fixed inset-x-3 bottom-3 z-40 backdrop-blur-lg border p-2 shadow-2xl`) containing quick `🚀 Share` and `📥 Download` buttons so the user can export at any scroll depth.

---

## 3. Design System & Theme Foundations

### Color Palette & Variables
| Semantic Token | Value | Role |
| :--- | :--- | :--- |
| `bg-df-bg` | `#f8f9fa` / `#faf5ea` | Warm ivory / clean off-white canvas |
| `bg-df-bg-raised` | `#ffffff` / `#fdfaf5` | Raised card surface with depth |
| `text-df-fg` | `#1a1a1a` / `#202124` | Primary ink / high contrast text |
| `text-df-fg/70` | `#5f6368` / `#4a3622` | Muted labels and secondary copy |
| `df-yellow` | `#fbbc05` / `#ffd27a` | High-energy Google / GDG Yellow accent |
| `df-blue` | `#4285f4` | Official Google Blue |
| `df-red` | `#ea4335` | Official Google Red |
| `df-green` | `#34a853` | Official Google Green |
| `df-purple` | `#a142f4` | Gemini Violet |
| `border-df-border` | `rgba(0, 0, 0, 0.08)` | Refined hairline borders |

### Discovered Theme Configurations
From reverse engineering the bundle chunks:
1. **Bhimbetka (Heritage Red & Sandstone)**:
   * Background: Warm sandstone gradient `["#ddb98f", "#c99c6b"]`, border `#9e2a1f`, accent `#9e2a1f`.
   * Artistic motif: Prehistoric rock-art builders, earthy red-ochre.
2. **City of Lakes (Upper Lake Teal)**:
   * Background: Cream & ivory `["#fbf7ee", "#f3ead8"]`, accent `#1a7f8e`, stub `#0d4b57`, border `#1a7f8e`.
   * Artistic motif: Water ripples, lakeside skyline contour.
3. **Bagh Night (Indigo & Zari Gold)**:
   * Background: Dark indigo `["#232947", "#191d36"]`, accent `#e9c98f`, gold `#e3c063`, border `#c9a13b`.
   * Artistic motif: Traditional Bagh block-print geometric florals.
4. **Gemini Glow (Midnight & Vertex AI)**:
   * Background: Deep navy `["#0d1330", "#1a1446"]`, accent `#8ab4f8`, border `#6c7ff2`, glow `#d7aefb`.
   * Artistic motif: AI sparkles, multi-color radial gradient orbs.

---

## 4. Canvas & Export Engineering Measurements

### Canvas Canvas Resolutions & Aspect Ratios
* **Portrait (Feed Post)**: `1080 × 1350 px` (4:5 aspect ratio)
  * Margin `m = 36px`, corner radius `r = 40px`, ticket notch radius `nr = 26px`.
  * Ticket perforation split line: `y = 1030px`.
* **Story / Status**: `1080 × 1920 px` (9:16 aspect ratio)
  * Centered vertical composition, safe areas top (`240px`) and bottom (`190px`) to avoid Instagram/WhatsApp UI obstruction.
* **Square (Post)**: `1080 × 1080 px` (1:1 aspect ratio)
  * Balanced compact layout for general feeds.
* **Landscape / Wide (X Header / Post)**: `1200 × 675 px` (16:9 aspect ratio)
  * Side-by-side arrangement: Photo on the left (`x = 56px, w = 430px`), Ticket stub on the right (`perf at x = 880px`).

### Ticket Perforation Notch Math
The ticket layout uses exact arc mathematics:
```typescript
// Arc notch on perforation axis:
context.arc(xNotch, yEdge, notchRadius, Math.PI, 0, true);
```
With dashed guide line or dotted tear lines across the boundary: `context.setLineDash([8, 6])`.

---

## 5. Implementation Strategy for Google Cloud Study Jams 2026

We will preserve the outstanding interaction model and visual fidelity, while tailoring it completely for **Google Cloud Study Jams with Community 2026**:

1. **Brand & Event Identity**:
   * Event: **Google Cloud Study Jams with Community 2026**
   * Host: **GDG on Campus**
   * Hashtags: `#GoogleCloudStudyJams #GDGOnCampus #StudyJams2026 #GoogleCloud #GeminiAI`
2. **Three High-Impact Templates**:
   * **Cloud Explorer**: Clean modern Google Cloud white/blue tech aesthetic with isometric cloud architecture patterns.
   * **Builder Edition**: Sleek dark mode midnight theme (`#0a0f1d`) with Vertex AI / Gemini glowing gradients and code brackets.
   * **Campus Edition**: High-energy GDG on Campus community palette (Google 4-colors, celebratory student badges, warm festive touches).
3. **Two Distinct Layout Modes**:
   * **Creator Pass**: Big portrait photo hero, name, handle, role, learning track, and custom stickers.
   * **Boarding Ticket**: Authentic conference pass styling with perforation cutouts, barcode, QR code link to Study Jams registration, and track badge.
4. **Interactive Studio Features**:
   * Real-time Canvas engine with 2x Retina rendering.
   * Mouse/touch 3D perspective card tilt with specular light sweep.
   * Image upload with interactive crop & zoom slider.
   * GitHub avatar lookup with rate-limit and error fallbacks.
   * Dynamic name autoscaling (so 35-character names never overflow).
   * Web Share API integration (with PNG file attachment where supported) and direct download fallback.
   * 1-click social caption copy with dynamic role and track interpolation.
   * Reusable event configuration schema (`src/config/eventConfig.ts`) so future GDG events (DevFest, Hackathons, Solution Challenge) can be launched simply by passing a new config.
