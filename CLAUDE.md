# CLAUDE.md — Ade & Omolade memories site

A private, one-page memories website for a couple, **Ade and Omolade** (together since
**29 May 2026**). The owner does **not** code: explain things in plain language, make the
technical decisions yourself, and always show them the result.

Feel: soft, cute, premium. Lots of air, gentle motion, nothing loud. Light ("day") and dark
("night") themes.

- Repository: https://github.com/MrTeee001/OmAde (branch `claude/happy-mccarthy-3s4g5e` — the only branch)
- Deploy: Netlify (settings in `netlify.toml`; see "Deploying" below)

---

## Tech stack

- **Vite 8 + React 19 + TypeScript 7** (`tsc -b` runs as part of the build)
- **Tailwind CSS v4** via `@tailwindcss/vite` (theme tokens in `src/index.css`)
- **three.js + @react-three/fiber 9 + @react-three/drei 10** — the 3D cube
- **GSAP 3.15** — `ScrollTrigger` (pinning/scrubbing), `SplitText` (letters), `Physics2DPlugin` (ribbons)
- **Lenis** — smooth scrolling, wired to GSAP's ticker
- Fonts are **self-hosted** via `@fontsource-variable/fraunces` (headings, uses the `SOFT` axis)
  and `@fontsource-variable/manrope` (body). No Google Fonts requests.
- No backend. A tiny Vite plugin (`plugins/memoriesManifest.ts`) lists the media files at build time.

## Commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ on http://localhost:4173
npx tsc -b         # typecheck only
```

Node 22 (Vite 8 needs ≥ 20.19).

---

## Where things live

```
index.html                 noindex meta, inline theme script (sets data-theme before first paint)
netlify.toml               Netlify build + headers
plugins/memoriesManifest.ts  scans public/memories (photos/videos) + public/audio (song) → virtual module
public/memories/           ALL photos & videos (any file names) — shuffled and dealt out every visit
public/closing/closing.jpg THE closing photo (their feet on a zebra crossing). Fixed, never shuffled.
public/audio/song.mp3      background song
src/memories.ts            ALL the words on the site (the owner edits this)
src/App.tsx                page order, smooth scroll, reveal-on-scroll, intro on/off
src/index.css              design tokens (light + dark), all component styles
src/main.tsx               html classes (intro / js-motion / lite), fonts, scroll restoration
src/components/
  Intro.tsx                opening sequence (envelope, names, ribbons, 3D fly-in)
  Hero.tsx                 hero text, counter, cube slot, pinned cube timeline, grid spots, Close
  cube/CubeCanvas.tsx      the r3f scene: cube, separation into cards, idle drift
  cube/faceMaterial.ts     face shader (rounded corners, border, lighting)
  cube/textures.ts         photo/video textures for faces (+ themed placeholder)
  cube/stage.ts            shared state between DOM and 3D; PHASES; OPEN_DURATION
  sections/Memories.tsx    "Our memories" frames down a drawing line
  sections/LittleThings.tsx, Reel.tsx, Letters.tsx, Closing.tsx
  Header.tsx               A🌹O logo (top left) + day/night toggle (top right)
  Song.tsx                 background music + Music on/off button (bottom left)
  Counter.tsx, Lightbox.tsx, MediaTile.tsx, CubeGrid.tsx (reduced-motion grid), Background.tsx, FloatingHearts.tsx
src/lib/
  deal.ts      shuffles all media each page load and assigns it to cube / frames / reel
  media.ts     getMedia(), allMedia, songUrl
  music.ts     shared "is the song playing / does it need a tap" state
  time.ts      Lagos-time counter maths
  theme.ts     setTheme / follow device setting
  scroll.ts    Lenis handle: pauseScroll, resumeScroll, glideTo
  ready.ts     heroReady promise (cube warmed up) — the intro waits for it
  device.ts    hasWebGL, isLiteDevice;  motion.ts prefersReducedMotion;  useInView.ts
```

## Page order

1. **Opening sequence** (overlay) → 2. **Hero** (names, counter, 3D cube) → 3. **Our memories** →
4. **The little things** → 5. **Moving pictures** (reel) → 6. **To each other** (letters) →
7. **Closing** photo + footer "Ade & Omolade, since 29 May 2026".

---

## How the main pieces work

### Text — `src/memories.ts`
Names, start date, hero label/optional line, little things (two lists: `adeOnOmolade` shown
blue, `omoladeOnAde` shown rose), two letters (paragraph arrays; greeting "Omolade," / "Ade,"
and sign-off "Yours, Ade" / "Yours, Omolade" are added by `Letters.tsx`), optional closing line.
Empty strings (`''`) are hidden. **The owner wants no placeholder text and no captions anywhere.**

### Media — `public/memories/` (any names) → `src/lib/deal.ts`
- The Vite plugin lists every `.jpg .jpeg .png .webp .gif .avif .mp4 .webm .m4v .mov` file.
- On **every page load** `deal.ts` shuffles the whole pile and deals it: reel gets up to 4 **videos**,
  cube gets the next **6** (photos or videos), **everything else** becomes an "Our memories" frame.
  Nothing is saved — every visit is different. This is a deliberate owner request.
- Sections with nothing to show are hidden (no videos → no reel; no leftovers → no memories).
- Missing spots show a soft gradient tile; real files that fail to load show a plain tile (no file names).
- The **closing photo is fixed** (`public/closing/closing.jpg`, 4:5 crop, zoomed out to show both
  pairs of feet). It is deliberately outside the pile.
- **Videos are always silent**: audio tracks were stripped from the files and there is no sound toggle.

**Adding media (do this when the owner sends files):**
```bash
# photos: resize, strip location/EXIF
convert in.JPG -auto-orient -resize 'x1600>' -strip -quality 82 -interlace Plane public/memories/NAME.jpg
# videos: H.264 + yuv420p (plays everywhere), NO audio, metadata stripped, fast start
ffmpeg -i in.MOV -map 0:v:0 -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -vf "scale='min(720,iw)':-2" \
  -an -map_metadata -1 -movflags +faststart public/memories/NAME.mp4
```
Keep the owner's original base names. Check for exact duplicates (md5) first. iPhone HEVC `.MOV`
must be re-encoded (Chrome/Firefox can't play HEVC). Keep each file < 15 MB.

### Opening sequence — `src/components/Intro.tsx`
Plays on **every** load (nothing remembered). Layer is see-through over the page background; the
hero's heading is hidden (`[data-intro-target]`) and the counter/cube/hint wait (`[data-late]`)
while `html.intro` is set. Timeline (seconds):
- 0–1.2 envelope rises (real 3D panels in a CSS `perspective` "camera"/"world").
- **1.2 music gate**: if the song can't play yet (browser needs a tap — most phones), the timeline
  pauses with a pulsing seal and "Tap to open"; the tap starts the song (Song.tsx listens on
  `window` capture) and resumes. If the song is already playing, no wait.
- 1.2–2.4 seal pulse, top flap folds open (no letter paper — owner's request).
- 2.4–3.8 "Ade ♥ Omolade" pop up out of the envelope; at 2.9 a small sparkle burst plus a
  **ribbon shower** (Physics2D: half fountain from the envelope, half rain from the top;
  150 desktop / 90 phone, fewer on lite devices) pours over the whole screen.
- 4.3–5.75 flaps open toward the camera, camera flies into the envelope, names FLIP onto the hero
  `<h1>` spans (`[data-name="first|amp|second"]`), heart cross-fades into the rose "&".
- Waits for fonts and `heroReady` (cube's first frames, capped 4 s) before starting so nothing jumps.
- Skip button jumps to the end. Reduced motion: names → 600 ms fade.
- Dev only: `?intro-pause` creates the timeline paused; `window.__intro` is the timeline.

### Hero + 3D cube — `Hero.tsx`, `cube/*`
- Counter: whole **Lagos calendar days** since `startDate` + Lagos clock time, via
  `Intl.DateTimeFormat({ timeZone: 'Africa/Lagos' })` (`lib/time.ts`). Independent of the visitor's zone.
- Cube at rest: slanted 25° forward / 20° sideways, clockwise spin (18 s/turn), leans ≤10° and drifts
  ≤12 px toward the cursor, floats 8 px / 5 s, grows 4% on hover with a "Tap to open" label.
  Sideways finger drag spins it. Dark mode: body turns pearl (`BODY_NIGHT`).
- **One timeline drives the opening** (`stage.progress` 0→1): ScrollTrigger pins the hero for
  2.6 × viewport height. **Clicking the cube just glides the page to the end of that pin**
  (`glideTo(st.end, OPEN_DURATION)`), Close / Escape glide back to the start — so click and scroll
  can never disagree. Phases in `cube/stage.ts`: glide 0–0.25, separate 0.2–0.6, settle 0.55–0.92.
- Faces separate from the cube's real orientation, settle into DOM-measured grid spots
  (3×2 desktop, 2×3 mobile) as rounded cards, then drift softly. Card click → `Lightbox` (no caption).
- The canvas is a fixed full-screen layer that maps DOM rects to world space every frame;
  it stops rendering when the hero is off screen and while the intro covers it.

### Other sections
- **Our memories**: frames alternate left/right down a self-drawing centre line with a travelling
  heart; each frame straightens from a 2–3° tilt. **On mobile, frames fly in from alternating
  sides** (left, right, left…).
- **The little things**: floating cards, blue (Ade's lines) / rose (Omolade's lines).
- **Moving pictures**: section pins and the row of (silent) clips slides sideways with scroll.
- **To each other**: two ruled-notepaper letters (±1° tilt), lines revealed with SplitText;
  blue wax dot on Ade's, rose on Omolade's.

### Music — `Song.tsx` + `lib/music.ts`
- `public/audio/song.mp3`, plays softly (`VOLUME = 0.12`) **from the very beginning** (`START_AT = 0`,
  the owner trimmed the file), loops to the beginning.
- On by default; **only the visitor turns it off** (Music button, bottom left; off-state kept in
  `sessionStorage` for the tab).
- Position saved in `sessionStorage` → a reload carries on; closing the tab = next visit starts at 0.
- Browsers block sound until the first tap: it tries immediately, otherwise starts on the first
  tap — and the intro waits at the letter for that tap (see above). Volume goes through Web Audio
  (GainNode created on the tap) so it is also soft on iPhones.

### Themes
- Tokens in `src/index.css`: light values on `:root`, dark on `:root[data-theme='dark']`
  (Tailwind's `--color-*` are overridden there too). Use the tokens (`--surface`, `--surface-border`,
  `--shadow-soft`, `--paper…`, `--env-…`) — never hard-code colours in components.
- `index.html` inline script picks the theme before first paint: saved choice (`localStorage.theme`)
  else the device setting. `Header.tsx` toggles via `lib/theme.ts`.

### Accessibility / performance
- `prefers-reduced-motion`: no intro animation (fade), no cube (simple `CubeGrid`), no pins.
- No WebGL → same simple grid. "Lite" devices (≤4 cores/≤4 GB/save-data, or frame drops via drei
  `PerformanceMonitor`) get lower DPR, calmer background, fewer ribbons.
- Images `loading="lazy"`; videos get no `src` until near the screen and play only while visible.
- `noindex, nofollow` meta + Netlify `X-Robots-Tag`; all media metadata (GPS etc.) stripped.

---

## Gotchas (learned the hard way)

- **IntersectionObserver**: always read the **last** entry (`entries[entries.length - 1]`) — the
  pin re-measure delivers "off, on" in one batch and reading the first hid the cube.
- **Face shader**: sample the texture and take `fwidth` **before** `discard`, and guard
  `fwidth` with `max(…, 1e-4)` — otherwise a diagonal seam appears on cards.
- Don't use `smoothstep` with edge0 > edge1 in GLSL (undefined).
- Keep GSAP's default `lagSmoothing` (don't set it to 0): a long main-thread stall would make the
  intro jump ahead.
- React StrictMode runs effects twice in dev — anything persisted on cleanup must ignore not-yet-loaded
  state (the song only saves a position while actually playing).
- Pinned sections: create ScrollTriggers in page order (Hero → Memories → Reel …).
- Section headings/text use `data-reveal` (fade up via `useReveal` in App). Hero elements must not.

## Testing tips

- Headless Chromium here: launch with `--use-angle=swiftshader --enable-unsafe-swiftshader`.
  It is slow; use `?intro-pause` + `window.__intro.seek(t)` for deterministic intro frames, or
  `window.__intro.parent.timeScale(0.15)` to slow everything down.
- Playwright's Chromium **cannot decode H.264/AAC** — real videos look like blank tiles there. That
  is the test browser, not the site. Use VP9-in-.mp4 test files if you need moving video in tests.
- Never `return` a GSAP object from `page.evaluate` (it hangs serialising it) — wrap in `{ … }`.
- Default autoplay policy blocks sound (tests the "Tap to open" path); add
  `--autoplay-policy=no-user-gesture-required` to test the auto-start path.
- Check both themes (`colorScheme: 'dark'`) and phone width (390×844, `isMobile`, `hasTouch`).

## Deploying (Netlify)

`netlify.toml`: build `npm run build`, publish `dist`, Node 22, noindex + cache headers.
Connect once in Netlify: **Add new site → Import an existing project → GitHub → MrTeee001/OmAde →
branch `claude/happy-mccarthy-3s4g5e`** (settings are read from `netlify.toml`). After that, every
push to that branch redeploys automatically. Media is served from `dist/memories`, `dist/closing`,
`dist/audio` (copied from `public/`).

## Owner's decisions to respect

Intro on every load · song on by default, from the start, never sound from videos · no captions or
placeholder text · closing photo fixed (feet) · all other media randomly re-dealt every visit ·
counter on Lagos time · logo "A🌹O" (red rose) · day/night toggle top right · Close button for the
opened cube · ask before big redesigns, but make technical choices yourself.

---

## How to edit later (plain language, for Ade & Omolade)

You don't need to code. Open a new chat with Claude Code on this project and just say what you
want — Claude reads this file first and knows how everything works. For example:

- **Change words** (letters, the little things, a line under your names or under the closing
  photo): send the new text and say where it goes. All the words live in one file,
  `src/memories.ts`.
- **Add photos or videos**: send them (zip is fine) and say "add these to the memories". They'll be
  resized, cleaned of hidden location data, and mixed into the random shuffle automatically —
  no names or choosing needed. Videos will be silent, like the others.
- **Remove a photo or video**: describe it or send a screenshot, and ask for it to be removed.
- **Change the song**: send the audio file and say "replace the song".
- **Change the closing picture**: send the photo and say "make this the closing picture".
- **Change the start date** or names: just say the new one.

After any change, ask Claude to "save and push it". If the site is connected to Netlify, the live
site updates by itself a minute or two later.
