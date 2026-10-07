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

- [x] **1.1 Create the project.** Create `package.json`, `tsconfig.json` (`strict: true`), `vite.config.ts`, `index.html` (title "bnuuy") and `src/main.ts` for a vanilla TypeScript Vite app. Install `vite` and `typescript`. Add the `dev`, `build`, `preview` and `typecheck` scripts from `PSD.md` 10.3. Do not let any scaffolding tool delete `PSD.md` or `PSD_PROGRESS.md`: either scaffold in a temporary folder and move files in, or write the files by hand.
  Verify: `npm run build` succeeds; `npm run dev` serves a page that shows "bnuuy".
  Note: TypeScript 7.0, Vite 8 and Vitest 4 were the current versions. `index.html` now shows "Loading…" until the app starts.

- [x] **1.2 Initialise git.** Run `git init` and add a `.gitignore` with `node_modules`, `dist`, `test-results` and `playwright-report`.
  Verify: `git status` lists no files from those folders.
  Note: done before task 1.1, together with the initial commit of the spec documents. `.gitignore` also ignores `.DS_Store` and `*.log`.

- [x] **1.3 Set up Vitest.** Install `vitest`, add the `test` script, and add one trivial test in `src/game/`.
  Verify: `npm test` passes.

- [x] **1.4 Set up Playwright.** Install `@playwright/test` and Chromium. Configure one project with the `Pixel 7` device profile, `baseURL` `http://localhost:4173`, and a `webServer` that runs `npm run build && npm run preview`. Add the `test:e2e` script and a smoke test that checks the page title is "bnuuy".
  Verify: `npm run test:e2e` passes.
  Note: the smoke test was replaced by `e2e/flow.spec.ts` in task 5.2; it also checks the title. After the move to GitHub Pages, `baseURL` and the `webServer` URL are `http://localhost:4173/bnuuy/`.

- [x] **1.5 Base styles.** Add `src/styles/main.css` with the colour tokens (`PSD.md` 7.2), `color-scheme: light`, cream page background, centred column with a maximum width of 480 px, and Pixelify Sans via `@fontsource/pixelify-sans` (7.3).
  Verify: screenshot of the dev server at 390 px width shows the pixel font on a cream background.

- [x] **1.6 First deploy. CHECKPOINT.** Add `.github/workflows/deploy.yml` and set Vite's `base` to `/bnuuy/` (`PSD.md` 10.4). Ask the user to create a public GitHub repository named `bnuuy`, set Settings > Pages > Source to "GitHub Actions", add the remote and push `main`.
  Verify: the printed URL loads the page. Write the URL in the Notes section below.
  Note: switched from Cloudflare Pages to GitHub Pages at the user's request (2026-10-07). Wrangler and the `deploy` script were removed. The first workflow run failed at "Set up Pages" because the push came before Pages was enabled; a rerun succeeded. The live site loads, installs its service worker and keeps the bunny after an offline reload.

- [x] **1.7 Check the PixelLab connection. CHECKPOINT if missing.** Check whether PixelLab MCP tools are available in this session. If not, ask the user to follow `PSD.md` 9.1 and restart Claude Code.
  Verify: a cheap read-only PixelLab call (for example listing characters or objects) succeeds. Record the available image tool names in the Notes section.
  Note: connected on 2026-10-07; `get_balance` reports a trial plan with 40 generations and one job at a time. Image tools: `create_image_pixflux` (1 generation, forced palette, img2img), `create_image_pixen` (1), `create_image_pro_flash` (5), `create_image_pro` (20 to 40), `inpaint_image_pro_flash` and `edit_image_pro_flash` (5), `inpaint_image` and `edit_image` (20), `create_1_direction_object` (20 to 40), `reduce_colors`, `unzoom_image` and `correct_pixelart` (0.1), `image_to_pixelart` (1), `pixelart_workbench` (free).

## Phase 2: Foundation

- [x] **2.1 Types, constants and catalogue.** Create `src/game/types.ts`, `constants.ts` and `catalog.ts` exactly as in `PSD.md` 5.1, 5.2 and 8.1.
  Verify: `npm run typecheck` passes; a unit test checks there are 8 adventures with unique outfits and durations 1, 2, 3, 4, 6, 8, 10 and 12 hours.

- [x] **2.2 Clock.** Create `src/clock.ts` with `now()` returning `Date.now()` plus the offset stored in `bnuuy:dev-time-offset` (0 if missing or storage is unavailable), and `addOffset(ms)`.
  Verify: unit test with a fake storage object.

- [x] **2.3 Simulation: awake decay.** Create `advance(state, now)` in `src/game/simulate.ts` with the step loop (at most 60 s per step), awake decay, clamping, and the backwards-clock rule (`PSD.md` 8.2 steps 1 to 3, 4.3, 4.4, 5).
  Verify: unit tests for exact values after 1 h and 8 h, clamping at 0, and a backwards clock.

- [x] **2.4 Simulation: sleep.** Add half-rate decay while asleep, energy refill, auto-wake at 100 and auto-sleep at 0 (8.2 step 4.2 and 4.3).
  Verify: unit tests for each rule.

- [x] **2.5 Simulation: sick and depressed.** Add zero timers, sickness and depression (8.2 steps 4.5 to 4.7).
  Verify: unit tests: sick at exactly 2 h of zero hunger and of zero cleanliness, not sick at 1 h 59 min; depressed at 2 h of zero happiness; depression ends only above 50.

- [x] **2.6 Stages, care and growth events.** Create `src/game/stage.ts`. Add care accumulation, step boundaries at birthdays, adult variant locking and `grew-up` events (8.2 steps 3, 4.8, 4.9).
  Verify: unit tests for stage at 23:59, 24:00, 95:59 and 96:00; variant at care scores 70, 69.9, 40 and 39.9; one event per birthday.

- [x] **2.7 Mood and droppings.** Create `src/game/mood.ts` (8.4 and the droppings formula in 8.1).
  Verify: unit tests for every mood priority and droppings at cleanliness 100, 75, 74, 50, 1 and 0.

- [x] **2.8 Validation.** Create `src/game/validate.ts` with name validation and full `GameState` shape and range validation.
  Verify: unit tests for valid state, missing fields, wrong types, out-of-range needs, unknown ids, and names of length 0, 1, 16 and 17 after trimming.

- [x] **2.9 Storage.** Create `src/game/storage.ts`: load and save `bnuuy:save` with an injectable `Storage`; on invalid data copy the raw value to `bnuuy:save-broken` and report "broken"; report "unavailable" if storage throws (`PSD.md` 6.1).
  Verify: unit tests with a fake `Storage` for each case.

- [x] **2.10 Store.** Create `src/store.ts` with `getState`, `dispatch`, `tick`, `subscribe`, saving after every change, and reloading on the `storage` event (4.2, 4.4).
  Verify: unit test that `dispatch` advances time before an action and saves the result (fake clock and fake storage).
  Note: the store also exposes `reload()` (used by the `storage` event), `isStorageAvailable()` and `isSaveBroken()`. While the save is broken, the store does not write `bnuuy:save` until the player loads a code or starts over.

- [x] **2.11 App shell and router.** Create `src/router.ts` and empty screens for every route in `PSD.md` 4.2. Add the loading screen, load error screen, storage-unavailable banner and broken-save screen (6.1).
  Verify: in the dev server, changing the hash shows each screen; corrupting `bnuuy:save` by hand in DevTools shows the broken-save screen and `bnuuy:save-broken` holds the old value.
  Note: verified with a script: an invalid save shows the broken-save screen, `bnuuy:save-broken` holds the raw value, and `bnuuy:save` is not overwritten by ticks.

- [x] **2.12 Sprite manifest and loader.** Create `src/render/spriteManifest.ts` listing all 65 sprites with expected sizes (`PSD.md` 9.3), `src/render/sprites.ts` (preload with `import.meta.glob`, placeholder fallback from 9.6), and `tools/check-sprites.ts` with the `check:sprites` script. Install `pngjs` and `tsx` as dev dependencies.
  Verify: `npm run check:sprites` runs and reports 65 missing sprites.

- [x] **2.13 Scene renderer.** Create `src/render/scene.ts` and `src/render/animations.ts` with whole-number scaling, draw order, positions, idle bob, sleep overlay and the reduced-motion rule (6.8). Use placeholders for now.
  Verify: screenshots at 360 px and 1280 px widths show a crisp scene with placeholder blocks in the right positions.
  Note: screens must append the canvas to its container before calling `createScene`, because the scene sizes itself from `canvas.parentElement`.

- [x] **2.14 Game loop.** In `src/main.ts`, tick the store every second and on `visibilitychange`, run the `requestAnimationFrame` render loop, and call `navigator.storage.persist()` (4.4).
  Verify: with a test bunny saved in localStorage, `lastUpdatedAt` increases every second in DevTools.

- [x] **2.15 Dev panel.** Create `src/ui/components/devPanel.ts` (6.7): DEV button only with `?dev=1`, state readout, time-skip buttons, "Make healthy", "Empty needs" and the gallery link.
  Verify: with a test bunny in storage, at `/?dev=1`, "+1 h" lowers the tummy readout by 12.5; without `?dev=1` there is no DEV button.

- [x] **2.16 Sprite gallery.** Create `src/ui/screens/devSprites.ts` (6.7) showing every manifest sprite and all combinations, with missing sprites marked in red.
  Verify: `/?dev=1#/dev/sprites` shows all 65 entries as placeholders; `/#/dev/sprites` without `dev=1` does not show the gallery.
  Note: the last gallery section shows four live scenes with buttons that trigger every one-shot animation, so items and effects can be reviewed in context.

## Phase 3: Art

Follow `PSD.md` section 9 for every task. Log every sprite in `art/ART_LOG.md`. After each task, screenshot the gallery and review it before ticking the box.

- [x] **3.1 Palette.** Create `art/palette.png` with at most 32 colours: the colour tokens from 7.2 plus fur, shading and outline tones. Start `art/ART_LOG.md`.
  Verify: a small script or `pngjs` check confirms 32 colours or fewer.
  Note: `art/palette.png` is 32 × 16 px with 32 colours in 4 × 4 swatches. The colour list is in `art/ART_LOG.md`. Done before the art checkpoint because it does not need PixelLab.

- [x] **3.2 Master bunny. CHECKPOINT.** Make `bunny-adult-normal-content.png` (64 × 64, transparent, feet on row 60) using the base prompt in 9.5. Run `reduce_colors` with the palette.
  Verify: show the gallery screenshot to the user and get approval. Iterate until approved.
  Note: approved by the user on 2026-10-07. Made with `create_image_pro` (candidate 9 of 16), with its colours mapped to `art/palette.png` by hand because `reduce_colors` turned the fur beige. 60 px tall, feet on row 60. Details in `art/ART_LOG.md`.

- [x] **3.3 Other bodies.** Make `bunny-baby-content`, `bunny-teen-content`, `bunny-adult-fluffy-content` and `bunny-adult-scruffy-content` with the master as reference (9.3 size guide, 9.5 prompts).
  Verify: the gallery shows five bodies that look like the same bunny; adult variants share one outline.
  Note: the teen came from `create_image_pro` with the master as reference. The baby needed four Pro attempts (they cropped the ears or kept adult proportions); the final baby is a complete 48 px Pro candidate redrawn at 40 px with `image_to_pixelart`. The fluffy and scruffy adults were made by inpainting only the fur inside the master's outline, and the master's outline was copied back in, so all three adults share one outline exactly. Actual heights are 34, 47 and 60 px (size guide: 32, 44, 56); `BODY_HEIGHTS` in `scene.ts` uses the actual heights.

- [x] **3.4 Faces.** For each of the five bodies, inpaint the face rectangle to make happy, sad, sick and sleeping (20 sprites, 9.4).
  Verify: the gallery body × face grid is complete; pixels outside the face rectangle match the content sprite (check with a quick `pngjs` diff).
  Note: faces were inpainted with `inpaint_image_pro_flash` in each body's face rectangle (`FACE_RECTS` updated). The adult moods were made once on adult-normal and copied into the fluffy and scruffy bodies. The baby's content face was also inpainted, because its redrawn face was noisy. A pixel diff confirmed that nothing outside the face rectangles changed.

- [x] **3.5 Layer extraction tool.** Create `tools/extract-layer.ts`.
  Verify: unit test: identical pixels become transparent, changed pixels are kept, mismatched sizes throw.
  Note: done early because it does not need PixelLab.

- [x] **3.6 Outfits.** Make all 16 outfit layers by inpainting onto the teen and adult-normal content sprites and extracting with the tool (9.4). Outfits must not cover the face rectangle.
  Verify: the gallery shows every outfit on every compatible body and face; faces stay visible; nothing floats or is misaligned on the fluffy and scruffy adults.
  Note: all 16 outfits were inpainted with mask images that exclude the face rectangle and extracted with `tools/extract-layer.ts`. Isolated clusters under 8 px (6 px for teens) were removed. The suit and wizard hat needed hand colour overrides so navy and purple did not collapse to plum.

- [x] **3.7 Room.** Make `room.png` (128 × 128): pastel wall, window, wooden floor, round rug in the centre.
  Verify: the scene with the master bunny at (32, 56) looks like the bunny sits on the rug.
  Note: made by a helper agent. Lavender wall, curtained window, carrot picture, wood floor from row 94, pink rug centred at (64, 113); the dropping spots stay on bare floor.

- [x] **3.8 Items and effects.** Make `item-carrot`, `item-medicine`, `item-dropping`, `fx-heart`, `fx-sparkle`, `fx-zzz` (16 × 16) and `fx-rain-cloud` (32 × 16).
  Verify: gallery review.
  Note: the medicine bottle, dropping, sparkle and Zzz were redrawn by hand at 16 px using the Pro candidates as a guide, because the generated 16 px candidates were muddy. The carrot, heart and rain cloud are generated, with small fixes.

- [x] **3.9 UI icons.** Make `icon-ball`, `icon-broom`, `icon-moon`, `icon-sun`, `icon-map`, `icon-hanger` and `icon-gear` (16 × 16).
  Verify: gallery review; each icon is recognisable at 2× scale.
  Note: the ball, broom, moon, sun, map and hanger were redrawn by hand at 16 px using the Pro candidates as a guide; the gear is generated. All use palette colours and plum outlines.

- [x] **3.10 Adventure icons.** Make the eight `adventure-<id>.png` icons (32 × 32).
  Verify: gallery review.
  Note: all eight are generated with `create_image_pro` and mapped to the palette; bakery and pirate needed a few hand colour overrides.

- [x] **3.11 App and PWA icons.** Make `app-icon.png` (64 × 64). Create `tools/make-icons.ts` and the `icons` script to produce the four PWA icons in `public/icons/` (`PSD.md` 10.5).
  Verify: `npm run icons` writes 192, 512, maskable 512 and apple-touch icons with crisp pixels.
  Note: `tools/make-icons.ts` and the `icons` script exist. Until `app-icon.png` exists, the script warns and uses a placeholder icon, so the PWA has valid icons. Re-run `npm run icons` after the app icon is made.
  Note: `app-icon.png` is a `create_image_pro` close-up of the bunny's head on pink (candidate 0 of 16). `npm run icons` regenerated the four PWA icons from it.

- [x] **3.12 Final art pass. CHECKPOINT.** Make sure every sprite uses the palette and has the right size.
  Verify: `npm run check:sprites` passes with no missing sprites. Show the full gallery to the user and get approval.
  Note: `npm run check:sprites` reports 65 of 65 ok and every sprite uses only `art/palette.png` colours. The user approved the full gallery on 2026-10-07.

## Phase 4: Features

Each task is end to end: logic with unit tests, then UI, then a manual check in the browser (use `?dev=1` to skip time).

- [x] **4.1 Adopt (UC1).** Add the `adopt` action and the Adopt screen (6.2). The save code link can be a stub until 4.17.
  Verify: unit tests for `adopt`; in the browser, an invalid name shows the error and a valid name opens Home.

- [x] **4.2 Home display (UC2).** Build the Home header, status chips, need bars and scene (6.3, 6.8), including the canvas `aria-label`.
  Verify: after "Empty needs" in the dev panel, bars turn the danger colour, droppings show and the mood face is sad.

- [x] **4.3 Sound effects.** Create `src/audio/sfx.ts` with every sound in 7.6, gated by `settings.soundOn`, with the `AudioContext` created on the first user gesture.
  Verify: temporarily set `soundOn` to true in DevTools; each sound plays on demand from the console. No sound plays with the default setting.
  Note: with `?dev=1`, `window.bnuuy.playSound(name)` plays a sound from the console.

- [x] **4.4 Feed (UC3).** Add the `feed` action, the button, the carrot animation, the refusal bubble with head shake, and the munch sound.
  Verify: unit tests at hunger 89 and 90; in the browser, feeding at full shows "<name> is full!".

- [x] **4.5 Play (UC4).** Add `play`, the hop and hearts animation, refusal, and sound.
  Verify: unit tests at energy 9 and 10 and depression ending above 50; browser check.

- [x] **4.6 Clean (UC5).** Add `clean`, the droppings fade and sparkles, and sound.
  Verify: unit test; in the browser, skip 6 h then clean: droppings disappear and the bar is full.

- [x] **4.7 Sleep and wake (UC6).** Add `sleep` and `wake`, the dark overlay, Zzz, the Wake button, disabled actions while asleep, and sounds.
  Verify: unit tests for refusal at energy 90 and wake; in the browser, skip 6 h, tap Sleep, skip 6 h: the bunny is awake by itself and energy is full.
  Note: Sleep and Wake share one button whose label and icon switch, so keyboard focus is not lost.

- [x] **4.8 Medicine (UC7).** Add `medicine`, the bottle animation and sound, the sick chip, and the rain cloud for depression.
  Verify: unit tests; in the browser, "Empty needs" then skip 2 h shows the sick chip (the bunny falls asleep at zero energy); wake it, give medicine, and the chip clears.

- [x] **4.9 Event cards and growth (UC8).** Build the event card dialog (6.9) and the `dismissEvent` action. Show `grew-up` events.
  Verify: in the browser, skip 1 day shows the teen card; skip 4 days shows the adult card with the variant text.
  Note: in the return card the outfit name is lowercased and gets "a" or "an" ("found an astronaut helmet").

- [x] **4.10 Adventure logic (UC9, UC10).** Add `startAdventure` and adventure completion in `simulate.ts` (8.2 step 4.1 and 4.10, 8.3).
  Verify: unit tests for all start rules, paused needs, outfit on first return and auto-equip, happiness 100 on repeat, events, and care not counted while away. Add the catch-up test: one `advance` over 7 days equals many small `advance` calls.

- [x] **4.11 Adventures screen (UC9).** Build the list, lock banners and the confirm dialog (6.4).
  Verify: in the browser, a baby sees the lock banner with a countdown; after skipping 1 day and "Make healthy", the teen can start Garden Stroll after confirming.

- [x] **4.12 Away and return (UC10).** Show the away card and paused bars on Home, and the `returned` event cards.
  Verify: in the browser, start Garden Stroll, skip 1 h, and the return card names the flower crown; the bunny wears it.

- [x] **4.13 Wardrobe (UC11).** Add `equip` and `unequip`, and build the Wardrobe screen with all states (6.5).
  Verify: unit tests; in the browser, equip and take off outfits; unowned slots show silhouettes and hints.

- [x] **4.14 Settings and sound toggle (UC15).** Build the Settings screen layout and the sound switch with `setSound`.
  Verify: the switch persists across reloads; sounds play only when on.

- [x] **4.15 Save code logic.** Create `src/game/saveCode.ts` (`PSD.md` 5.4).
  Verify: unit tests from `PSD.md` 11.1 (round trip with emoji name, whitespace, checksum, prefix, newer version, invalid JSON, out-of-range values).

- [x] **4.16 Show and copy save code (UC12).** Add the "Show save code" section with the Copy button and fallback.
  Verify: in the browser, Copy puts the code on the clipboard and shows "Copied!".

- [x] **4.17 Load save code (UC13).** Add loading in Settings (with the replace confirmation) and on the Adopt screen. Add the `loadState` action.
  Verify: in a fresh browser profile, pasting a code restores the bunny; a broken code shows the error message.

- [x] **4.18 Start over (UC14).** Add the danger button, confirm dialog and `startOver` action.
  Verify: unit test that settings are kept; in the browser, confirming opens Adopt and cancelling changes nothing.

## Phase 5: Tests and polish

- [x] **5.1 PWA.** Install and configure `vite-plugin-pwa` (`PSD.md` 10.5). Link the apple touch icon.
  Verify: after `npm run build && npm run preview`, Chrome DevTools > Application shows a valid manifest with icons and an active service worker; with the network set to Offline, a reload still loads the game.
  Note: verified with Playwright against `vite preview`: manifest fields and three icons load, the service worker is activated, and an offline reload shows the game with the pixel font.

- [x] **5.2 End-to-end test.** Write `e2e/flow.spec.ts` exactly as in `PSD.md` 11.2.
  Verify: `npm run test:e2e` passes.

- [x] **5.3 Unit test audit.** Compare the tests against the list in `PSD.md` 11.1 and add any that are missing.
  Verify: `npm test` passes and every item in 11.1 has a test.
  Note: a separate review pass confirmed every item in `PSD.md` 11.1 has a test (304 unit tests in 17 files). The review also led to these fixes, each with a test: birthdays do not fire again after the clock moves back past them; save validation requires timestamps between 2020 and 2100 and adventure lengths that match the catalogue (a hand-made code could otherwise keep the bunny away for good or freeze the tab); `store.reload()` clears the broken-save state when another tab writes a valid save; dialogs are labelled by their message; the Adventures countdown is no longer a live region; "Take off" keeps keyboard focus.

- [x] **5.4 Accessibility pass.** Check labels, meters, dialogs, focus order, contrast and reduced motion (6.8, 6.10).
  Verify: keyboard-only play works on desktop; with reduced motion enabled in DevTools, nothing bobs or floats.
  Note: keyboard flow verified with Playwright (Tab order, Enter on actions, Escape cancels dialogs, Cancel gets initial focus in confirm dialogs). With reduced motion, scene frames 700 ms apart are identical. Danger buttons use 20 px bold text because plum on `--danger` is 3.3:1 (AA for large text).

- [x] **5.5 Responsive pass.** Check every screen at 360, 390, 768 and 1280 px widths.
  Verify: screenshots show no horizontal scroll, readable text and a crisp scene.
  Note: verified with Playwright screenshots of every screen and dialog at 360, 390, 768 and 1280 px; `scrollWidth` equals the viewport width everywhere.

- [x] **5.6 Final deploy.** Ask the user to push `main`; the workflow deploys it.
  Verify: the live URL works, installs as a PWA and works offline after the first visit.
  Note: pushed commit `133e2ad` on 2026-10-07; the workflow deployed it. The live site loads the real art without errors, activates its service worker and keeps an adopted bunny after an offline reload.

- [x] **5.7 Definition of done.** Go through every item in `PSD.md` section 12 and tick the ones that are verified.
  Verify: all items except the last are ticked.
  Note: every item in `PSD.md` section 12 is verified and ticked. The sprite item is ticked with one known deviation: 10 of the 16 px sprites were redrawn by hand with PixelLab candidates as a guide (see the 3.8 and 3.9 notes); the user approved the final gallery.

- [x] **5.8 Phone test. CHECKPOINT.** Ask the user to install the game on their friend's phone and play for a day.
  Verify: the user confirms it works. Tick the last item in `PSD.md` section 12.
  Note: the user reported on 2026-10-07 that their friend plays it and loves it.

## Phase 6: Adventure scenes (PSD 1.2)

- [x] **6.1 Scene code.** While away, draw `scene-<adventureId>` instead of the room, hide the droppings, and draw the bunny with the happy face and the adventure's reward outfit (`PSD.md` 6.8). Replace the away card with a banner above the scene (6.3). Add the scene sprites to the manifest and the gallery.
  Verify: unit tests for `sceneViewOf` and `describeScene` while away; `npm run typecheck`, `npm test` and `npm run test:e2e` pass.
  Note: `SceneView.away` became `SceneView.adventure`. The Home away card became a banner above the scene. The gallery has an "Adventure scenes" section.

- [x] **6.2 Scene art.** Make the eight `scene-<adventureId>.png` backgrounds (128 × 128) with PixelLab, with plain ground where the bunny sits. Log them in `art/ART_LOG.md`.
  Verify: `npm run check:sprites` reports 73 ok; every scene uses only palette colours; the gallery shows each scene with a bunny in its outfit.
  Note: 220 generations. Details and job ids in `art/ART_LOG.md`.

- [x] **6.3 Review. CHECKPOINT.** Show the eight scenes to the user.
  Verify: the user approves them.
  Note: approved by the user on 2026-10-07.

---

## Notes

- **Deploy URL:** https://huipvandenende.github.io/bnuuy/ (repository https://github.com/huipvandenende/bnuuy)
- **PixelLab tools available:** see the note under task 1.7. The user upgraded to Tier 1 (2,000 generations per cycle, 8 concurrent jobs). The art phase used 781 generations. Every sprite is logged in `art/ART_LOG.md`.
- **Deviations and discoveries:**
  - Hosting moved from Cloudflare Pages to GitHub Pages (`PSD.md` 10.4). The game is served under `/bnuuy/`, also locally.
  - Work continued past the blocked checkpoints 1.6 and 1.7. Phases 2, 4 and most of 5 were built and verified with placeholder sprites (`PSD.md` 9.6). Tasks 3.1 and 3.5 were done early because they need no PixelLab art.
  - `src/game/testHelpers.ts` holds shared unit test helpers (fake `Storage`, bunny builders).
  - `src/ui/` also has `app.ts` (screen switching), `screen.ts`, `dom.ts`, `format.ts`, `pixelCanvas.ts`, `components/saveCodeLoader.ts` and `screens/brokenSave.ts`. `src/render/loop.ts` runs the shared `requestAnimationFrame` loop. `src/browserStorage.ts` safely gets `localStorage`.
  - `FACE_RECTS` in `src/render/spriteManifest.ts` are estimates (baby 22, 40, 20 × 10; teen 23, 34, 18 × 10; adults 21, 27, 22 × 12). Update them in task 3.3 when the real bodies exist.
  - Simulation steps follow a fixed 60 s grid from the original `lastUpdatedAt`; birthdays and adventure ends split a grid cell. This keeps one long `advance` equal to many short ones.
