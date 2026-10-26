# Google Cloud Study Jams — ABV-IIITM Gwalior

A playful, student-only story-card generator for GDG on Campus ABV-IIITM Gwalior.

**[Try the live site](https://iiitm-cloud-stories-review.vercel.app)** · [Source on GitHub](https://github.com/knowprasad/iiitm-cloud-stories)

Built with React 19, TypeScript, Vite, and the Canvas API. The website layout takes inspiration from [DevFest Bhopal's badge studio](https://devfest.bhopal.dev/badge), while the three illustrated card templates are made for this campus. Design notes and references are in [docs/design-direction.md](docs/design-direction.md).

## Make a story

Choose Cloud buddies, Campus scrapbook, or Builder mode. Each has its own layout and illustration style. Add a name, an optional photo, and an optional mood sticker. Tap a selected mood again to remove it. Without a photo, the card uses initials. Photo zoom and positioning are available under Adjust your photo.

Use **Share my story** to open your device's native share menu with the 1080 × 1920 PNG attached. Available apps depend on the phone and browser; Instagram or WhatsApp may be offered when installed. If file sharing is unavailable, the card downloads with instructions for posting it manually. **Download PNG** is also always available after entering a name. The image is prepared before the tap so the share menu retains the browser's required user activation.

Sharing is optional. The card does not register a participant or award a credential. All photo processing happens in the browser; photos and names are not uploaded or stored. Inputs reset when the tab is refreshed. A short entrance animation, small decorative float, and download confetti respect reduced-motion settings.

## Campus identity

The supplied chapter logo lives at `public/gdg-iiitm-gwalior.png` and is used in the page header and all three exported cards. `src/config/storyEvent.ts` fixes the campus name, official social links, three templates, and mood options. Exported cards and captions include `@gdg_oncampus_iiitm`. The footer links to Instagram and LinkedIn; the header logo opens the official GDG community chapter page. Students do not edit chapter settings.

## Development

- `npm install`
- `npm run dev`
- `npm test`
- `npm run build`
- `npm run preview`

Deploy the generated `dist` folder to a static host. No backend or API keys are needed. Google Fonts supplies Fredoka, Caveat, Plus Jakarta Sans, and JetBrains Mono; system fonts provide fallbacks when offline.

## Implementation

The active flow uses `src/App.tsx`, `src/story.css`, `src/config/storyEvent.ts`, and `src/engine/storyRenderer.ts`. Thumbnails, the live preview, and downloads share the same canvas renderer. It explicitly loads the fonts and chapter logo before drawing. Original badge-studio components remain in the repository to preserve earlier work; they are not imported by the active app. There is no poster, event switcher, registration form, or certification claim in the student flow.
