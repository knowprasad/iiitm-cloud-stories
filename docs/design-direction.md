# Campus story direction

Audience: students at ABV-IIITM Gwalior. Purpose: a small, optional way to celebrate joining Google Cloud Study Jams.

The chapter name and supplied logo are fixed. The student chooses one of three compositions, enters their name, optionally adds a photo and mood, and downloads a story. There are no poster or chapter-settings controls.

## Visual system

- Page: paper blue `#fafbff`, ink `#29364f`, cloud blue `#3762d9`, sunny yellow `#f4c459`, lavender `#a89bd6`.
- Fredoka provides the rounded headline and cloud-card display. Plus Jakarta Sans handles controls. Caveat supplies handwritten scrapbook notes. JetBrains Mono appears in the builder card.
- Cloud buddies uses an illustrated cloud portrait and smiling cloud companions.
- Campus scrapbook uses graph paper, a tilted instant-photo frame, tape, and handwritten captions.
- Builder mode uses cobalt, a browser/terminal photo frame, oversize type, and small code details.

## Online reference pass

- [DevFest Bhopal Badge Studio](https://devfest.bhopal.dev/badge): primary website-layout reference requested by the event lead. Adapted the preview-first layout, white editor panel, warm yellow Share action, direct photo-upload affordance, tactile card shadows, and mobile quick actions. The exported templates and campus identity remain specific to ABV-IIITM Gwalior.
- [Canva Polaroid story collection](https://www.canva.com/instagram-stories/templates/polaroid/): photo-frame and scrapbook layout reference.
- [GDG Bucharest DevFest 2024 graphics](https://gdg.community.dev/events/details/google-gdg-bucharest-presents-devfest-bucharest-2024/): bold type, friendly geometry, and community-branding reference.

No reference artwork or paid template assets are bundled. Card illustrations are drawn directly in the application. The supplied ABV-IIITM Gwalior logo is used intact.

## Behavior

Thumbnails, preview, and PNG exports share a renderer. Fonts load before rendering and fall back to system fonts if unavailable. Photos are processed locally and are not persisted. Mood stickers toggle off when selected again. Crop sliders use the same geometry as the exported image. Entrance animation, decorative float, and download confetti respect reduced-motion preferences. Cards and captions include the confirmed Instagram handle `@gdg_oncampus_iiitm`; footer links include Instagram and LinkedIn, and the header logo links to the official GDG chapter page.

The Share action hands a prepared PNG to the device's native share menu, where supported. Available destinations depend on the device and installed apps. Unsupported browsers save the PNG with manual sharing instructions. Cancelling the share menu does not trigger a download.
