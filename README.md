# Google Cloud Study Jams — ABV-IIITM Gwalior

A playful, student-only story-card generator for GDG on Campus ABV-IIITM Gwalior.

**[Try the live site](https://iiitm-cloud-stories-review.vercel.app)** · [Source on GitHub](https://github.com/knowprasad/iiitm-cloud-stories)

Built with React 19, TypeScript, Vite, and the Canvas API. The website layout takes inspiration from [DevFest Bhopal's badge studio](https://devfest.bhopal.dev/badge), while the three illustrated card templates are made for this campus. Design notes and references are in [docs/design-direction.md](docs/design-direction.md).

## Make a story

Enter your name at the top, then choose Cloud buddies, Campus scrapbook, or Builder mode. Each has its own layout and illustration style. Add an optional photo and mood sticker. Tap a selected mood again to remove it. Without a photo, the card uses initials as part of the design.

Choosing a photo opens **Frame your photo**, with the actual card preview beside zoom and position controls. Each style remembers its crop independently. Portrait photos start top-aligned, with a wider crop for the shallower cloud and builder frames; zoom can go down to 0.5× to give a face more room. **Reset this crop** resets only the selected style. Crops stay in this tab and reset when a different photo is chosen.

**Copy caption** is a visible action next to Share and Download; the mobile action bar includes a Caption shortcut. All cards have larger chapter details and handles, a reserved name area, and multi-line name wrapping. Common long names use two lines; dense scripts can use a third line rather than being clipped.

Use **Share my story** to open your device's native share menu with the 1080 × 1920 PNG attached. Available apps depend on the phone and browser; Instagram or WhatsApp may be offered when installed. If file sharing is unavailable, the card downloads with instructions for posting it manually. **Download PNG** is also always available after entering a name. The image is prepared before the tap so the share menu retains the browser's required user activation.

Sharing is optional. The card does not register a participant or award a credential. All photo processing happens in the browser; photos and names are not uploaded or stored. Inputs reset when the tab is refreshed. A short entrance animation and download confetti respect reduced-motion settings.

## Campus identity

The supplied chapter logo lives at `public/gdg-iiitm-gwalior.png` and is used in the page header and all three exported cards. `src/config/storyEvent.ts` fixes the campus name, official social links, three templates, and mood options. Exported cards and captions include `@gdg_oncampus_iiitm`. The footer links to Instagram and LinkedIn; the header logo opens the official GDG community chapter page. Students do not edit chapter settings.

## Libraries and tools

Versions below match the committed `package-lock.json`.

| Library / tool | Version | Used for |
| --- | --- | --- |
| React and React DOM | 19.3.1 | Interactive editor, template selection, and live preview |
| TypeScript | 5.9.3 | Type checking |
| Vite | 6.4.5 | Local development and production builds |
| Lucide React | 1.61.0 | Interface icons |
| canvas-confetti | 1.9.4 | Download celebration, respecting reduced-motion preferences |
| Vitest | 5.0.5 | Automated tests |
| jsdom | 30.1.3 | Browser-like test environment |

The Canvas API renders the cards, the Web Share API opens the device's native share menu, and the Clipboard API copies captions. These are browser APIs rather than npm libraries. The active page uses plain CSS in `src/story.css`; Tailwind CSS, PostCSS, Autoprefixer, `clsx`, `tailwind-merge`, and `qrcode` remain installed for the original badge-studio code.

## Development

- `npm install`
- `npm run dev`
- `npm test`
- `npm run build`
- `npm run preview`

Deploy the generated `dist` folder to a static host. No backend or API keys are needed. Google Fonts supplies Fredoka, Caveat, Plus Jakarta Sans, and JetBrains Mono; system fonts provide fallbacks when offline.

## Implementation

The active flow uses `src/App.tsx`, `src/story.css`, `src/config/storyEvent.ts`, and `src/engine/storyRenderer.ts`. Thumbnails, the live preview, and downloads share the same canvas renderer. It explicitly loads the fonts and chapter logo before drawing. Original badge-studio components remain in the repository to preserve earlier work; they are not imported by the active app. There is no poster, event switcher, registration form, or certification claim in the student flow.
