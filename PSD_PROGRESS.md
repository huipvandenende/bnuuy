# bnuuy: Implementation Progress

## Instructions for the implementing agent

- `PSD.md` is the source of truth. Read it fully before starting. When you are unsure about anything, re-read the relevant section instead of guessing.
- Work through the tasks in order. Do not start a task before the previous one is verified.
- After verifying a task, change `- [ ]` to `- [x]`.
- If you deviate from `PSD.md` or discover something important, add an indented `Note:` line under the task. Also add it to the "Notes" section at the end if it affects later tasks.
- Never build deferred or excluded features (`PSD.md` section 2).
- Tasks marked **CHECKPOINT** need the user. Stop, explain what you need, and wait for their answer.
- Do not commit unless the user asks. Never push.
- Every task names how to verify it. A task is only done when that check passes.

---

## Phase 1: Scaffold

- [ ] **1.1 Create the project.** Create `package.json`, `tsconfig.json` (`strict: true`), `vite.config.ts`, `index.html` (title "bnuuy") and `src/main.ts` for a vanilla TypeScript Vite app. Install `vite` and `typescript`. Add the `dev`, `build`, `preview` and `typecheck` scripts from `PSD.md` 10.3. Do not let any scaffolding tool delete `PSD.md` or `PSD_PROGRESS.md`: either scaffold in a temporary folder and move files in, or write the files by hand.
  Verify: `npm run build` succeeds; `npm run dev` serves a page that shows "bnuuy".

- [x] **1.2 Initialise git.** Run `git init` and add a `.gitignore` with `node_modules`, `dist`, `test-results` and `playwright-report`.
  Verify: `git status` lists no files from those folders.
  Note: done before task 1.1, together with the initial commit of the spec documents. `.gitignore` also ignores `.DS_Store` and `*.log`.

- [ ] **1.3 Set up Vitest.** Install `vitest`, add the `test` script, and add one trivial test in `src/game/`.
  Verify: `npm test` passes.

- [ ] **1.4 Set up Playwright.** Install `@playwright/test` and Chromium. Configure one project with the `Pixel 7` device profile, `baseURL` `http://localhost:4173`, and a `webServer` that runs `npm run build && npm run preview`. Add the `test:e2e` script and a smoke test that checks the page title is "bnuuy".
  Verify: `npm run test:e2e` passes.

- [ ] **1.5 Base styles.** Add `src/styles/main.css` with the colour tokens (`PSD.md` 7.2), `color-scheme: light`, cream page background, centred column with a maximum width of 480 px, and Pixelify Sans via `@fontsource/pixelify-sans` (7.3).
  Verify: screenshot of the dev server at 390 px width shows the pixel font on a cream background.

- [ ] **1.6 First deploy. CHECKPOINT.** Install `wrangler` as a dev dependency and add the `deploy` script. Ask the user to run `! npx wrangler login`. Then run `npx wrangler pages project create bnuuy --production-branch main` and `npm run deploy`.
  Verify: the printed URL loads the page. Write the URL in the Notes section below.

- [ ] **1.7 Check the PixelLab connection. CHECKPOINT if missing.** Check whether PixelLab MCP tools are available in this session. If not, ask the user to follow `PSD.md` 9.1 and restart Claude Code.
  Verify: a cheap read-only PixelLab call (for example listing characters or objects) succeeds. Record the available image tool names in the Notes section.

## Phase 2: Foundation

- [ ] **2.1 Types, constants and catalogue.** Create `src/game/types.ts`, `constants.ts` and `catalog.ts` exactly as in `PSD.md` 5.1, 5.2 and 8.1.
  Verify: `npm run typecheck` passes; a unit test checks there are 8 adventures with unique outfits and durations 1, 2, 3, 4, 6, 8, 10 and 12 hours.

- [ ] **2.2 Clock.** Create `src/clock.ts` with `now()` returning `Date.now()` plus the offset stored in `bnuuy:dev-time-offset` (0 if missing or storage is unavailable), and `addOffset(ms)`.
  Verify: unit test with a fake storage object.

- [ ] **2.3 Simulation: awake decay.** Create `advance(state, now)` in `src/game/simulate.ts` with the step loop (at most 60 s per step), awake decay, clamping, and the backwards-clock rule (`PSD.md` 8.2 steps 1 to 3, 4.3, 4.4, 5).
  Verify: unit tests for exact values after 1 h and 8 h, clamping at 0, and a backwards clock.

- [ ] **2.4 Simulation: sleep.** Add half-rate decay while asleep, energy refill, auto-wake at 100 and auto-sleep at 0 (8.2 step 4.2 and 4.3).
  Verify: unit tests for each rule.

- [ ] **2.5 Simulation: sick and depressed.** Add zero timers, sickness and depression (8.2 steps 4.5 to 4.7).
  Verify: unit tests: sick at exactly 2 h of zero hunger and of zero cleanliness, not sick at 1 h 59 min; depressed at 2 h of zero happiness; depression ends only above 50.

- [ ] **2.6 Stages, care and growth events.** Create `src/game/stage.ts`. Add care accumulation, step boundaries at birthdays, adult variant locking and `grew-up` events (8.2 steps 3, 4.8, 4.9).
  Verify: unit tests for stage at 23:59, 24:00, 95:59 and 96:00; variant at care scores 70, 69.9, 40 and 39.9; one event per birthday.

- [ ] **2.7 Mood and droppings.** Create `src/game/mood.ts` (8.4 and the droppings formula in 8.1).
  Verify: unit tests for every mood priority and droppings at cleanliness 100, 75, 74, 50, 1 and 0.

- [ ] **2.8 Validation.** Create `src/game/validate.ts` with name validation and full `GameState` shape and range validation.
  Verify: unit tests for valid state, missing fields, wrong types, out-of-range needs, unknown ids, and names of length 0, 1, 16 and 17 after trimming.

- [ ] **2.9 Storage.** Create `src/game/storage.ts`: load and save `bnuuy:save` with an injectable `Storage`; on invalid data copy the raw value to `bnuuy:save-broken` and report "broken"; report "unavailable" if storage throws (`PSD.md` 6.1).
  Verify: unit tests with a fake `Storage` for each case.

- [ ] **2.10 Store.** Create `src/store.ts` with `getState`, `dispatch`, `tick`, `subscribe`, saving after every change, and reloading on the `storage` event (4.2, 4.4).
  Verify: unit test that `dispatch` advances time before an action and saves the result (fake clock and fake storage).

- [ ] **2.11 App shell and router.** Create `src/router.ts` and empty screens for every route in `PSD.md` 4.2. Add the loading screen, load error screen, storage-unavailable banner and broken-save screen (6.1).
  Verify: in the dev server, changing the hash shows each screen; corrupting `bnuuy:save` by hand in DevTools shows the broken-save screen and `bnuuy:save-broken` holds the old value.

- [ ] **2.12 Sprite manifest and loader.** Create `src/render/spriteManifest.ts` listing all 65 sprites with expected sizes (`PSD.md` 9.3), `src/render/sprites.ts` (preload with `import.meta.glob`, placeholder fallback from 9.6), and `tools/check-sprites.ts` with the `check:sprites` script. Install `pngjs` and `tsx` as dev dependencies.
  Verify: `npm run check:sprites` runs and reports 65 missing sprites.

- [ ] **2.13 Scene renderer.** Create `src/render/scene.ts` and `src/render/animations.ts` with whole-number scaling, draw order, positions, idle bob, sleep overlay and the reduced-motion rule (6.8). Use placeholders for now.
  Verify: screenshots at 360 px and 1280 px widths show a crisp scene with placeholder blocks in the right positions.

- [ ] **2.14 Game loop.** In `src/main.ts`, tick the store every second and on `visibilitychange`, run the `requestAnimationFrame` render loop, and call `navigator.storage.persist()` (4.4).
  Verify: with a test bunny saved in localStorage, `lastUpdatedAt` increases every second in DevTools.

- [ ] **2.15 Dev panel.** Create `src/ui/components/devPanel.ts` (6.7): DEV button only with `?dev=1`, state readout, time-skip buttons, "Make healthy", "Empty needs" and the gallery link.
  Verify: with a test bunny in storage, at `/?dev=1`, "+1 h" lowers the tummy readout by 12.5; without `?dev=1` there is no DEV button.

- [ ] **2.16 Sprite gallery.** Create `src/ui/screens/devSprites.ts` (6.7) showing every manifest sprite and all combinations, with missing sprites marked in red.
  Verify: `/?dev=1#/dev/sprites` shows all 65 entries as placeholders; `/#/dev/sprites` without `dev=1` does not show the gallery.

## Phase 3: Art

Follow `PSD.md` section 9 for every task. Log every sprite in `art/ART_LOG.md`. After each task, screenshot the gallery and review it before ticking the box.

- [ ] **3.1 Palette.** Create `art/palette.png` with at most 32 colours: the colour tokens from 7.2 plus fur, shading and outline tones. Start `art/ART_LOG.md`.
  Verify: a small script or `pngjs` check confirms 32 colours or fewer.

- [ ] **3.2 Master bunny. CHECKPOINT.** Make `bunny-adult-normal-content.png` (64 × 64, transparent, feet on row 60) using the base prompt in 9.5. Run `reduce_colors` with the palette.
  Verify: show the gallery screenshot to the user and get approval. Iterate until approved.

- [ ] **3.3 Other bodies.** Make `bunny-baby-content`, `bunny-teen-content`, `bunny-adult-fluffy-content` and `bunny-adult-scruffy-content` with the master as reference (9.3 size guide, 9.5 prompts).
  Verify: the gallery shows five bodies that look like the same bunny; adult variants share one outline.

- [ ] **3.4 Faces.** For each of the five bodies, inpaint the face rectangle to make happy, sad, sick and sleeping (20 sprites, 9.4).
  Verify: the gallery body × face grid is complete; pixels outside the face rectangle match the content sprite (check with a quick `pngjs` diff).

- [ ] **3.5 Layer extraction tool.** Create `tools/extract-layer.ts`.
  Verify: unit test: identical pixels become transparent, changed pixels are kept, mismatched sizes throw.

- [ ] **3.6 Outfits.** Make all 16 outfit layers by inpainting onto the teen and adult-normal content sprites and extracting with the tool (9.4). Outfits must not cover the face rectangle.
  Verify: the gallery shows every outfit on every compatible body and face; faces stay visible; nothing floats or is misaligned on the fluffy and scruffy adults.

- [ ] **3.7 Room.** Make `room.png` (128 × 128): pastel wall, window, wooden floor, round rug in the centre.
  Verify: the scene with the master bunny at (32, 56) looks like the bunny sits on the rug.

- [ ] **3.8 Items and effects.** Make `item-carrot`, `item-medicine`, `item-dropping`, `fx-heart`, `fx-sparkle`, `fx-zzz` (16 × 16) and `fx-rain-cloud` (32 × 16).
  Verify: gallery review.

- [ ] **3.9 UI icons.** Make `icon-ball`, `icon-broom`, `icon-moon`, `icon-sun`, `icon-map`, `icon-hanger` and `icon-gear` (16 × 16).
  Verify: gallery review; each icon is recognisable at 2× scale.

- [ ] **3.10 Adventure icons.** Make the eight `adventure-<id>.png` icons (32 × 32).
  Verify: gallery review.

- [ ] **3.11 App and PWA icons.** Make `app-icon.png` (64 × 64). Create `tools/make-icons.ts` and the `icons` script to produce the four PWA icons in `public/icons/` (`PSD.md` 10.5).
  Verify: `npm run icons` writes 192, 512, maskable 512 and apple-touch icons with crisp pixels.

- [ ] **3.12 Final art pass. CHECKPOINT.** Make sure every sprite uses the palette and has the right size.
  Verify: `npm run check:sprites` passes with no missing sprites. Show the full gallery to the user and get approval.

## Phase 4: Features

Each task is end to end: logic with unit tests, then UI, then a manual check in the browser (use `?dev=1` to skip time).

- [ ] **4.1 Adopt (UC1).** Add the `adopt` action and the Adopt screen (6.2). The save code link can be a stub until 4.17.
  Verify: unit tests for `adopt`; in the browser, an invalid name shows the error and a valid name opens Home.

- [ ] **4.2 Home display (UC2).** Build the Home header, status chips, need bars and scene (6.3, 6.8), including the canvas `aria-label`.
  Verify: after "Empty needs" in the dev panel, bars turn the danger colour, droppings show and the mood face is sad.

- [ ] **4.3 Sound effects.** Create `src/audio/sfx.ts` with every sound in 7.6, gated by `settings.soundOn`, with the `AudioContext` created on the first user gesture.
  Verify: temporarily set `soundOn` to true in DevTools; each sound plays on demand from the console. No sound plays with the default setting.

- [ ] **4.4 Feed (UC3).** Add the `feed` action, the button, the carrot animation, the refusal bubble with head shake, and the munch sound.
  Verify: unit tests at hunger 89 and 90; in the browser, feeding at full shows "<name> is full!".

- [ ] **4.5 Play (UC4).** Add `play`, the hop and hearts animation, refusal, and sound.
  Verify: unit tests at energy 9 and 10 and depression ending above 50; browser check.

- [ ] **4.6 Clean (UC5).** Add `clean`, the droppings fade and sparkles, and sound.
  Verify: unit test; in the browser, skip 6 h then clean: droppings disappear and the bar is full.

- [ ] **4.7 Sleep and wake (UC6).** Add `sleep` and `wake`, the dark overlay, Zzz, the Wake button, disabled actions while asleep, and sounds.
  Verify: unit tests for refusal at energy 90 and wake; in the browser, skip 6 h, tap Sleep, skip 6 h: the bunny is awake by itself and energy is full.

- [ ] **4.8 Medicine (UC7).** Add `medicine`, the bottle animation and sound, the sick chip, and the rain cloud for depression.
  Verify: unit tests; in the browser, "Empty needs" then skip 2 h shows the sick chip (the bunny falls asleep at zero energy); wake it, give medicine, and the chip clears.

- [ ] **4.9 Event cards and growth (UC8).** Build the event card dialog (6.9) and the `dismissEvent` action. Show `grew-up` events.
  Verify: in the browser, skip 1 day shows the teen card; skip 4 days shows the adult card with the variant text.

- [ ] **4.10 Adventure logic (UC9, UC10).** Add `startAdventure` and adventure completion in `simulate.ts` (8.2 step 4.1 and 4.10, 8.3).
  Verify: unit tests for all start rules, paused needs, outfit on first return and auto-equip, happiness 100 on repeat, events, and care not counted while away. Add the catch-up test: one `advance` over 7 days equals many small `advance` calls.

- [ ] **4.11 Adventures screen (UC9).** Build the list, lock banners and the confirm dialog (6.4).
  Verify: in the browser, a baby sees the lock banner with a countdown; after skipping 1 day and "Make healthy", the teen can start Garden Stroll after confirming.

- [ ] **4.12 Away and return (UC10).** Show the away card and paused bars on Home, and the `returned` event cards.
  Verify: in the browser, start Garden Stroll, skip 1 h, and the return card names the flower crown; the bunny wears it.

- [ ] **4.13 Wardrobe (UC11).** Add `equip` and `unequip`, and build the Wardrobe screen with all states (6.5).
  Verify: unit tests; in the browser, equip and take off outfits; unowned slots show silhouettes and hints.

- [ ] **4.14 Settings and sound toggle (UC15).** Build the Settings screen layout and the sound switch with `setSound`.
  Verify: the switch persists across reloads; sounds play only when on.

- [ ] **4.15 Save code logic.** Create `src/game/saveCode.ts` (`PSD.md` 5.4).
  Verify: unit tests from `PSD.md` 11.1 (round trip with emoji name, whitespace, checksum, prefix, newer version, invalid JSON, out-of-range values).

- [ ] **4.16 Show and copy save code (UC12).** Add the "Show save code" section with the Copy button and fallback.
  Verify: in the browser, Copy puts the code on the clipboard and shows "Copied!".

- [ ] **4.17 Load save code (UC13).** Add loading in Settings (with the replace confirmation) and on the Adopt screen. Add the `loadState` action.
  Verify: in a fresh browser profile, pasting a code restores the bunny; a broken code shows the error message.

- [ ] **4.18 Start over (UC14).** Add the danger button, confirm dialog and `startOver` action.
  Verify: unit test that settings are kept; in the browser, confirming opens Adopt and cancelling changes nothing.

## Phase 5: Tests and polish

- [ ] **5.1 PWA.** Install and configure `vite-plugin-pwa` (`PSD.md` 10.5). Link the apple touch icon.
  Verify: after `npm run build && npm run preview`, Chrome DevTools > Application shows a valid manifest with icons and an active service worker; with the network set to Offline, a reload still loads the game.

- [ ] **5.2 End-to-end test.** Write `e2e/flow.spec.ts` exactly as in `PSD.md` 11.2.
  Verify: `npm run test:e2e` passes.

- [ ] **5.3 Unit test audit.** Compare the tests against the list in `PSD.md` 11.1 and add any that are missing.
  Verify: `npm test` passes and every item in 11.1 has a test.

- [ ] **5.4 Accessibility pass.** Check labels, meters, dialogs, focus order, contrast and reduced motion (6.8, 6.10).
  Verify: keyboard-only play works on desktop; with reduced motion enabled in DevTools, nothing bobs or floats.

- [ ] **5.5 Responsive pass.** Check every screen at 360, 390, 768 and 1280 px widths.
  Verify: screenshots show no horizontal scroll, readable text and a crisp scene.

- [ ] **5.6 Final deploy.** Run `npm run deploy`.
  Verify: the live URL works, installs as a PWA and works offline after the first visit.

- [ ] **5.7 Definition of done.** Go through every item in `PSD.md` section 12 and tick the ones that are verified.
  Verify: all items except the last are ticked.

- [ ] **5.8 Phone test. CHECKPOINT.** Ask the user to install the game on their friend's phone and play for a day.
  Verify: the user confirms it works. Tick the last item in `PSD.md` section 12.

---

## Notes

- **Deploy URL:** (fill in after task 1.6)
- **PixelLab tools available:** (fill in after task 1.7)
- **Deviations and discoveries:**
