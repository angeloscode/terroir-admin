# Build Prompt: Атлас вкуса

## Goal

Build a production static homepage for «Терруар Чёрного моря». The wine collection is the hero; terroir explains how place becomes character. The sea is one environmental factor, not the sole subject. Match the approved visual reference with real semantic UI, real local video, and tactile local imagery.

## Canvas

- Reference desktop: 1440 × 900; wide desktop up to 1920.
- Content width: fluid with 32–64 px gutters; editorial text capped at readable measures.
- Sticky video scenes use 100svh inside tall scroll tracks.
- Stack complex layouts before 900 px; fully mobile at 720 px.
- No horizontal page overflow at 320 px.

## Visual direction

“Атлас вкуса”: cinematic agriculture, a collector’s wine folio and a restrained field notebook. Vineyard-row geometry, soil textures, fine rules, coordinates and folio numbers create specificity. Avoid ocean-brand blue, gold luxury clichés and generic ecommerce cards.

## Typography

- Display: Prata 400 with Cyrillic, used at large sizes only.
- UI/body: Commissioner Variable, 300–650.
- Display sizes use clamp(); short italic accents may use the display face.
- UI labels are uppercase with 0.14–0.2em tracking; body copy stays sentence case.

## Color tokens

- Ink: #101510
- Deep vineyard: #172018
- Grape skin: #5b2534
- Clay: #b75c3d
- Limestone: #eee9df
- Chalk: #f7f3ea
- Moss muted: #8d9588
- Hairline dark/light at 18–25% opacity.

## Structure

1. Accessible 18+ dialog over a local poster.
2. Header with all approved anchors.
3. Fullscreen `0902.mp4` hero: one H1, short introduction and actions; no ticker.
4. Sticky continuation of the video with three phrases and a large manifesto.
5. Second fullscreen video chapter: “Одно море — разные терруары”.
6. Separate explanation: the sea is part of a multi-factor system.
7. Seven accessible expert factor panels and a methodology link.
8. Two image-led terroir dossiers with clearly unconfirmed metadata.
9. Authored wine collection with a local bottle placeholder and four non-factual folios.
10. Accessible SVG coastline map plus search and filters; no fabricated coordinates.
11. Films, blog, research and interview cards.
12. Where-to-buy / HoReCa split.
13. Footer with navigation and alcohol warning.

## Motion

- Age gate opens into the hero with opacity and mask-like transforms.
- Video stories use sticky scenes, IntersectionObserver and a single requestAnimationFrame loop.
- Scroll copy appears via opacity/transform only.
- Background videos pause when offscreen or the tab is hidden.
- Reduced motion and Save-Data replace video motion with posters and normal document flow.

## Media

- The supplied MP4 is local and reused from browser cache for the two chapters.
- The first video preloads metadata; the second loads near viewport.
- Generated photographs are deliberate placeholders, never presented as documentary proof of the named plots.
- Every lower image is lazy-loaded and dimensioned.

## Do not

- No marquee or running line.
- No `Nº 01 / TRE CIME / MONT BLANC` analogue.
- No 3D, custom cursor, ocean-first hero, fake coordinates, fake scientific measurements or invented wine tasting notes.
- No screenshot-as-background and no browser chrome.
- No generic rounded SaaS cards, glassmorphism or purple gradients.

## Acceptance criteria

- All approved sections and header links exist.
- One H1, semantic landmarks, skip link and visible focus.
- Gate works with keyboard and persists locally.
- Both video scenes are visually stable on desktop and have deliberate mobile/reduced-motion fallbacks.
- Seven factors are accessible without hover.
- Map search/filter/list work and expose an empty state.
- Docker production build serves the page and MP4 byte ranges on localhost.
- Browser screenshots at 1440, 1024, 768 and 390 px show no overlap, clipping or horizontal overflow.
