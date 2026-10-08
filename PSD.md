# bnuuy: Product Spec Document

Version 1.3, 2026-10-08 (1.1: hosting moved from Cloudflare Pages to GitHub Pages; 1.2: adventure scenes show the bunny on its adventure; 1.3: Sunday church easter egg). This document is the single source of truth for building bnuuy. It covers what to build, why, and how. The implementation checklist lives in `PSD_PROGRESS.md`.

---

## 1. Overview

### Problem
The creator wants to make a cozy virtual pet game as a gift for their friend. Existing virtual pet games are not personal and do not feature pixel-art bunnies.

### Product
bnuuy is a Tamagotchi-style web game. The player adopts one pixel-art bunny, names it and cares for it in real time. The bunny grows from baby to teen to adult. How well it is cared for decides how it looks as an adult. The bunny can go on adventures and comes home with outfits.

### Users
- **Primary:** the creator's friend, playing on her phone.
- **Secondary:** anyone else who finds the game and likes it.

There are no accounts. Every player's bunny lives only in their own browser.

### Value proposition
A cute, low-pressure companion that feels alive. The bunny keeps living while the game is closed, reacts to care and collects outfits over time.

### Success criteria
- The friend plays regularly and enjoys it.
- She can install it on her phone's home screen and play offline.
- The bunny never "breaks": no lost saves, no stuck states, no deaths.

---

## 2. Scope

### MVP (build this)
- Adopt one bunny and name it.
- Four needs that drop in real time: tummy (hunger), happiness, cleanliness, energy.
- Five care actions: feed, play, clean, sleep (and wake), medicine.
- Droppings that appear on the floor as cleanliness drops.
- Sick and depressed states, with recovery.
- Three life stages: baby, teen, adult. The adult look depends on past care.
- Eight timed adventures (1 to 12 hours). Each drops one outfit on its first completion.
- A wardrobe to put on or take off one outfit at a time.
- A save code to back up and restore the game.
- Start over with a new bunny.
- Sound effects generated in code, muted by default.
- Installable PWA that works offline.
- Developer-only tools: a time-skip panel and a sprite gallery, opened with `?dev=1`.
- Pixel art made with the PixelLab MCP server.
- Sunday easter egg (version 1.3): on Sundays the Home scene is a church, and the bunny says a little prayer every 7 seconds.

### Deferred (do not build now)
- Notifications when the bunny needs care (needs a server for Web Push).
- A play mini-game (play is a single button in the MVP).
- More adventures and outfits.
- Wearing several outfit pieces at once (for example a hat and a cloak).

### Explicitly excluded (never build)
- Bunny death or running away.
- More than one bunny at a time.
- Choosing fur colour or breed at adoption.
- Accounts, a backend, a database or cloud sync.

---

## 3. Use cases

All use cases assume the game first catches up on time that passed (see section 8.2).

### UC1: Adopt a bunny
- **Actor:** player without a bunny.
- **Trigger:** opens the game for the first time, or after starting over.
- **Steps:** the Adopt screen shows a baby bunny. The player types a name (1 to 16 characters) and taps "Adopt".
- **Outcome:** a baby bunny with all needs at 100 exists. The Home screen opens.
- **Alternative:** the player taps "Have a save code?" and restores a bunny instead (UC13).

### UC2: Check on the bunny
- **Actor:** player.
- **Trigger:** opens the game or returns to the tab.
- **Steps:** the game advances the simulation from the last saved time to now.
- **Outcome:** needs, droppings, mood, stage and adventure status are up to date. Any queued events (grew up, came home) show as cards, one at a time.

### UC3: Feed
- **Trigger:** taps "Feed" while the bunny is home and awake.
- **Outcome:** a carrot appears and is eaten. Tummy rises by 30 (maximum 100).
- **Refusal:** if tummy is 90 or more, the bunny shakes its head and a bubble says "<name> is full!". Nothing changes.

### UC4: Play
- **Trigger:** taps "Play" while home and awake.
- **Outcome:** the bunny hops and hearts float up. Happiness rises by 25 (maximum 100). Energy drops by 10.
- **Refusal:** if energy is below 10, the bunny shakes its head: "<name> is too tired to play."

### UC5: Clean
- **Trigger:** taps "Clean" while home and awake.
- **Outcome:** droppings fade out with sparkles. Cleanliness becomes 100.

### UC6: Sleep and wake
- **Trigger:** taps "Sleep" while home and awake.
- **Outcome:** the room darkens and "Zzz" floats up. Energy refills over 8 hours. Other needs drop at half speed. The button changes to "Wake".
- **Refusal:** if energy is 90 or more: "<name> isn't sleepy."
- **Wake:** tapping "Wake" ends sleep early. The bunny also wakes by itself when energy reaches 100.
- **Auto-sleep:** if energy reaches 0 while awake, the bunny falls asleep by itself.

### UC7: Give medicine
- **Trigger:** taps "Medicine" while home and awake.
- **Outcome:** if sick, a medicine bottle appears with sparkles and the bunny is cured.
- **Refusal:** if not sick: "<name> isn't sick."

### UC8: Watch the bunny grow
- **Trigger:** the bunny's age passes 24 hours (teen) or 96 hours (adult).
- **Outcome:** a card announces the new stage. On reaching adult, the card also shows the adult look (fluffy, normal or scruffy).

### UC9: Send the bunny on an adventure
- **Actor:** player with a teen or adult bunny.
- **Steps:** opens Adventures, picks one, confirms in a dialog.
- **Outcome:** the bunny leaves. Home shows an empty room with a countdown. Needs are paused.
- **Blocked when:** the bunny is a baby, asleep, sick, depressed or already away. The screen explains why.

### UC10: Bunny comes home
- **Trigger:** the adventure time ends (while the game is open or closed).
- **Outcome:** a card shows the bunny is back.
  - First completion of that adventure: the outfit is added to the wardrobe and put on.
  - Repeat completion: happiness becomes 100.

### UC11: Change outfit
- **Steps:** opens Wardrobe, taps an owned outfit to wear it, or taps "Take off".
- **Outcome:** the bunny wears the chosen outfit (or none) on Home.

### UC12: Back up with a save code
- **Steps:** opens Settings, taps "Show save code", taps "Copy".
- **Outcome:** the code is on the clipboard. "Copied!" appears.

### UC13: Restore from a save code
- **Steps:** pastes a code in Settings (or on the Adopt screen) and taps "Load".
- **Outcome:** if valid, and after confirming replacement of any current bunny, the saved bunny is restored and caught up to now.
- **Error:** an invalid code shows "This save code doesn't work. Check that you copied all of it."

### UC14: Start over
- **Steps:** Settings, "Start over", confirm.
- **Outcome:** the bunny and wardrobe are deleted. The Adopt screen opens. The sound setting is kept.

### UC15: Toggle sound
- **Steps:** Settings, sound switch.
- **Outcome:** sound effects play or stop. The choice is saved.

### UC16: Developer tools
- **Actor:** the creator or the implementing agent.
- **Trigger:** opens the game with `?dev=1` in the URL.
- **Outcome:** a small "DEV" button opens a panel with time-skip buttons, need shortcuts, a "Force Sunday" switch and a link to the sprite gallery (`#/dev/sprites`).

### UC17: Sunday at church
- **Actor:** player with a bunny that is home.
- **Trigger:** opens the game on a Sunday, by the device's local time (00:00 to 23:59).
- **Outcome:** the Home scene shows a cozy Catholic church interior instead of the room. Every 7 seconds the awake bunny closes its eyes, puts its paws together and bows slightly for 2 seconds, with a small sparkle above its head. On Monday the room returns.
- **Not shown:** while the bunny is away (the adventure scene wins) and on the Adopt screen. An asleep bunny sleeps in the darkened church and does not pray.

---

## 4. Tech stack and architecture

### 4.1 Stack

| Choice | Reason |
|---|---|
| TypeScript (strict) | Type safety for game rules and save data. |
| Vite | Fast dev server, simple static build, PWA plugin. |
| No UI framework | Only five screens. Plain DOM keeps the bundle tiny and the code readable. |
| HTML canvas | Crisp pixel-art rendering with layered sprites. |
| localStorage | The game is single-device. No server is needed. |
| Web Audio API | Chiptune sound effects generated in code. No audio files. |
| vite-plugin-pwa | Manifest, service worker and offline caching with little config. |
| Vitest | Unit tests for the pure game logic. |
| Playwright | One end-to-end test of the full flow in a mobile viewport. |
| GitHub Pages + GitHub Actions | Free static hosting with HTTPS. A workflow builds and deploys on every push to `main`. |
| PixelLab MCP | AI tool that produces real pixel art (grid-aligned, limited palette, transparent backgrounds). |
| Pixelify Sans via `@fontsource/pixelify-sans` | Readable pixel font, self-hosted so it works offline. |
| `pngjs` and `tsx` (dev only) | Small Node scripts that process sprites and icons. |

Use Node 22 LTS or newer.

### 4.2 Architecture principles
- **Game logic is pure.** Everything in `src/game/` is a pure function of `(state, now)`. No DOM, no `Date.now()`, no storage access. This makes the rules fully unit-testable.
- **One store.** `src/store.ts` holds the current `GameState`. UI code calls `dispatch(action)`. The store gets the time from the clock module, runs `advance` then the action, saves to storage and notifies listeners.
- **One clock.** `src/clock.ts` returns `Date.now() + devOffset`. All code that needs the time uses it. The dev offset is 0 unless the dev panel changed it.
- **Screens render from state.** Each screen has `mount(container)` and `update(state)`. Never insert user text (the bunny's name) with `innerHTML`; use `textContent`.
- **Hash routing.** Routes are `#/`, `#/adventures`, `#/wardrobe`, `#/settings` and `#/dev/sprites`. Hash routing needs no server configuration.
- **Art is made once, during development.** The game ships PNG files. It never calls PixelLab at runtime.

### 4.3 Folder structure

```
bnuuy/
  .github/workflows/
    deploy.yml             build and deploy to GitHub Pages
  index.html
  vite.config.ts
  playwright.config.ts
  tsconfig.json
  package.json
  public/
    icons/                 PWA and apple-touch icons (generated)
  src/
    main.ts                bootstrap: load save, preload sprites, start loop, router
    store.ts               state holder, dispatch, save, listeners
    clock.ts               now() with dev offset
    router.ts
    game/
      types.ts
      constants.ts         all rates and thresholds from section 8
      catalog.ts           adventures and outfits
      simulate.ts          advance(state, now)
      actions.ts           feed, play, clean, sleep, wake, medicine, startAdventure, equip, unequip, adopt
      stage.ts             stage from age, adult variant from care
      mood.ts              mood and droppings from state
      sunday.ts            isSunday(now) by local time
      validate.ts          name validation, state shape validation
      saveCode.ts          encode and decode save codes
      storage.ts           load and save with an injectable Storage
      *.test.ts            unit tests next to the code
    render/
      spriteManifest.ts    every sprite key, file and expected size
      sprites.ts           preload, placeholder fallback
      scene.ts             draws room, droppings, bunny layers, effects
      animations.ts        programmatic animations (bob, hop, shake, carrot, sparkles)
    audio/
      sfx.ts
    ui/
      screens/             adopt.ts, home.ts, adventures.ts, wardrobe.ts, settings.ts, devSprites.ts
      components/          needBar.ts, dialog.ts, eventCard.ts, bubble.ts, devPanel.ts
    styles/
      main.css
    assets/
      sprites/             final PNGs used by the game
  art/
    ART_LOG.md             prompts, tool calls and decisions per sprite
    palette.png            the shared palette image
    raw/                   unprocessed PixelLab downloads
  tools/
    extract-layer.ts       diff a dressed sprite against its base to make an outfit layer
    make-icons.ts          upscale the app icon to PWA sizes
    check-sprites.ts       verify every manifest sprite exists with the right size
  e2e/
    flow.spec.ts
```

### 4.4 Runtime flow
1. `main.ts` registers the service worker, requests persistent storage (`navigator.storage.persist()`), loads the save and preloads all sprites.
2. A 1-second interval calls `store.tick()`, which runs `advance(state, clock.now())` and saves.
3. On `visibilitychange` to visible, the store ticks immediately.
4. A `requestAnimationFrame` loop redraws the scene for animations.
5. On the `storage` event for the save key (another tab changed it), the store reloads from storage.

### 4.5 Auth, external services, secrets
- No auth and no accounts.
- No runtime external services and no runtime environment variables.
- Development-only services: PixelLab (via MCP, token in the user's Claude Code config) and GitHub (the user pushes to deploy). See section 10.

---

## 5. Data model

### 5.1 Types

```ts
type Stage = 'baby' | 'teen' | 'adult';
type AdultVariant = 'fluffy' | 'normal' | 'scruffy';
type Mood = 'happy' | 'content' | 'sad' | 'sick' | 'sleeping';

type AdventureId =
  | 'garden-stroll' | 'beach-day' | 'bakery-shift' | 'office-job'
  | 'wizard-school' | 'pirate-voyage' | 'epic-quest' | 'space-mission';

type OutfitId =
  | 'flower-crown' | 'sun-hat' | 'chef-hat' | 'suit'
  | 'wizard-hat' | 'pirate-hat' | 'hobbit-cloak' | 'astronaut-helmet';

interface Needs {
  hunger: number;       // 0..100, shown as "Tummy", 100 = full
  happiness: number;    // 0..100
  cleanliness: number;  // 0..100
  energy: number;       // 0..100
}

interface Bunny {
  name: string;
  adoptedAt: number;             // epoch ms
  lastUpdatedAt: number;         // epoch ms, simulation time
  needs: Needs;
  asleep: boolean;
  sick: boolean;
  depressed: boolean;
  zeroMs: { hunger: number; cleanliness: number; happiness: number }; // continuous time at 0
  care: { weightedSum: number; durationMs: number };                  // for the adult variant
  adultVariant: AdultVariant | null;                                  // set once, on becoming adult
  adventure: { id: AdventureId; startedAt: number; endsAt: number } | null;
  completedAdventures: AdventureId[];
  wardrobe: OutfitId[];
  equippedOutfit: OutfitId | null;
  events: GameEvent[];           // shown as cards, oldest first
}

type GameEvent =
  | { type: 'grew-up'; stage: 'teen' | 'adult'; variant?: AdultVariant }
  | { type: 'returned'; adventureId: AdventureId; outfitFound: OutfitId | null };

interface Settings { soundOn: boolean } // default { soundOn: false }

interface GameState {
  version: 1;
  bunny: Bunny | null;
  settings: Settings;
}
```

The stage is never stored. It is derived from `adoptedAt` and the current time.

### 5.2 Catalogue (static data in `catalog.ts`)

| Adventure id | Name | Duration | Flavour text | Outfit id | Outfit name |
|---|---|---|---|---|---|
| garden-stroll | Garden Stroll | 1 h | A sunny wander among the tulips. | flower-crown | Flower crown |
| beach-day | Beach Day | 2 h | Sand, waves and a very big sandcastle. | sun-hat | Straw sun hat |
| bakery-shift | Bakery Shift | 3 h | Kneading dough and sampling carrot cake. | chef-hat | Chef's hat |
| office-job | Office Job | 4 h | Spreadsheets, meetings and free coffee. | suit | Suit and tie |
| wizard-school | Wizard School | 6 h | Learning to turn carrots into more carrots. | wizard-hat | Wizard hat |
| pirate-voyage | Pirate Voyage | 8 h | Sailing the seven seas for buried treasure. | pirate-hat | Pirate hat |
| epic-quest | Epic Quest | 10 h | A long journey to toss a ring into a volcano. | hobbit-cloak | Hobbit cloak |
| space-mission | Space Mission | 12 h | One small hop for a bunny. | astronaut-helmet | Astronaut helmet |

### 5.3 Storage keys (localStorage)

| Key | Content |
|---|---|
| `bnuuy:save` | JSON of `GameState` |
| `bnuuy:save-broken` | Raw copy of a save that failed to load, kept for recovery |
| `bnuuy:dev-time-offset` | Dev clock offset in ms (only set by the dev panel) |
| `bnuuy:dev-force-sunday` | `"1"` when the dev panel's "Force Sunday" switch is on; missing otherwise |

### 5.4 Save code format
`BNUUY1.<payload>.<checksum>`
- `payload`: base64url of the UTF-8 JSON of `GameState`. Use `TextEncoder` before encoding so names with emoji work.
- `checksum`: FNV-1a 32-bit hash of the payload string, as 8 lowercase hex characters.
- Decoding: remove all whitespace, check the `BNUUY1.` prefix, verify the checksum, decode, parse, then validate the shape and value ranges with `validate.ts`. Any failure gives the same user message (UC13). A code with a higher version prefix gives "This save code was made with a newer version of bnuuy."

---

## 6. Views and UX

All screens are mobile-first, portrait, single column, with a maximum content width of 480 px centred on larger screens. Touch targets are at least 48 × 48 px.

### 6.1 Loading and app-level states
- **Loading:** centred "Loading…" in the pixel font while sprites preload.
- **Load error:** if sprites fail to load: "Couldn't load bnuuy. Check your connection and reload." with a "Reload" button.
- **Storage unavailable:** a banner on every screen: "Your browser is blocking saving. Your bunny will be lost when you close this tab." The game still runs in memory.
- **Broken save:** if `bnuuy:save` exists but fails validation, copy it to `bnuuy:save-broken` and show: "Your save couldn't be read." with two buttons: "Load a save code" and "Start over". Never delete a broken save silently.

### 6.2 Adopt (`#/` when there is no bunny)
- **Purpose:** create the bunny.
- **Components:** title "bnuuy", the baby bunny sprite (content face, idle bob) on the room background, a name input with placeholder "Name your bunny", an "Adopt" button, a "Have a save code?" link that reveals a textarea and "Load" button.
- **States:** validation error under the input ("Pick a name of 1 to 16 characters."); save code error under the textarea.
- **Interaction:** Enter in the input submits.

### 6.3 Home (`#/`)
- **Purpose:** see and care for the bunny.
- **Header:** name, stage and age (for example "Teen · 2 d 4 h"; adults show the variant, "Adult (Fluffy)"). Three icon buttons with text labels underneath: Adventures (map icon), Wardrobe (hanger icon), Settings (gear icon).
- **Status chips** (below header, only when relevant): "Sleeping", "Sick: give medicine", "Feeling down: play to cheer up".
- **Scene canvas:** the room (the church on Sundays) with the bunny, droppings and effects (see 6.8).
- **Need bars:** a 2 × 2 grid: Tummy, Happy, Clean, Energy. Each has an icon-free text label and a segmented pixel bar with 10 segments. Bars turn the danger colour below 25.
- **Action bar** (sticky at the bottom): Feed, Play, Clean, Sleep (or Wake), Medicine. Each button has a 16 × 16 pixel icon and a text label.
- **States:**
  - Asleep: room darkened, all actions disabled except Wake.
  - Away: the scene shows the adventure (6.8) with the bunny on it, and a banner above the scene says "<name> is on <adventure>. Back in 3 h 12 min." Need bars show frozen values with the label "Paused". All actions disabled.
  - Events queued: show the first event card as a modal (6.9).
- **Refusals:** a speech bubble above the bunny for 2 seconds plus the head-shake animation.

### 6.4 Adventures (`#/adventures`)
- **Purpose:** start an adventure.
- **Components:** back button, title, a list of eight cards. Each card shows the 32 × 32 icon, name, flavour text, duration and reward ("Reward: Flower crown" or, if already found, "Found ✓ · Happiness boost"), and a "Start" button.
- **States:**
  - Baby: the list is dimmed with a banner: "Adventures unlock when <name> is a teen (in 5 h 20 min)."
  - Asleep, sick or depressed: banner with the reason ("<name> is asleep.", "<name> is sick.", "<name> is feeling down."), all Start buttons disabled.
  - Away: banner "<name> is on <adventure>. Back in 2 h 3 min.", all Start buttons disabled.
- **Interaction:** "Start" opens a confirm dialog: "Send <name> on <adventure>? Back in <duration>. Needs pause while <name> is away." Buttons "Send" and "Not now". "Send" starts the adventure and returns to Home.

### 6.5 Wardrobe (`#/wardrobe`)
- **Purpose:** choose an outfit.
- **Components:** back button, title, a large preview canvas of the bunny in the current outfit, a "Take off" button (only when wearing something), and a grid of eight outfit slots.
  - Owned slot: thumbnail of the bunny wearing that outfit, the outfit name, selected border if equipped. Tap to wear.
  - Unowned slot: the outfit layer drawn as a faint plum silhouette, "???" and the hint "Found on <adventure>".
- **States:**
  - No outfits yet: "No outfits yet. Send <name> on an adventure to find some!" with a button to Adventures.
  - Baby: "Outfits fit once <name> is a teen."
  - Away: "<name> is away. Change outfits when <name> is home."

### 6.6 Settings (`#/settings`)
- **Components:** back button, title, and three sections.
  - **Sound:** a switch labelled "Sound effects".
  - **Save code:** "Show save code" reveals a read-only textarea with the code and a "Copy" button (uses `navigator.clipboard.writeText`; falls back to selecting the text). Below it, "Load a save code": textarea, "Load" button, error message area. If a bunny exists, loading asks: "Replace <current name> with <loaded name>?"
  - **Start over:** a danger button. Dialog: "Say goodbye to <name>? This can't be undone. Copy your save code first if you might want <name> back." Buttons "Start over" and "Cancel".
  - A small footer with the app version.

### 6.7 Dev tools (`?dev=1`)
- **DEV button:** fixed bottom-right, small, only when the URL has `dev=1`.
- **Panel:** current clock time and offset; a read-only readout of the needs (rounded), stage, mood, droppings, asleep, sick, depressed and adventure; buttons "+10 min", "+1 h", "+6 h", "+1 day", "+4 days"; "Make healthy" (all needs 100, awake, not sick, not depressed, zero timers reset); "Empty needs" (all needs 0); a "Force Sunday" switch (stored in `bnuuy:dev-force-sunday`, shows the church on any day); link "Sprite gallery".
- **Time skip** adds to the clock offset, saves it to `bnuuy:dev-time-offset` and ticks the store, so the normal catch-up logic runs.
- The gallery route only works when `dev=1` is in the URL.
- **Sprite gallery (`#/dev/sprites`):** every sprite from the manifest at 4× scale with its key and size. Then a grid of every body × face combination. Then every outfit on every body and face it can be worn with. Then items, effects, icons and the room. Then a "Sunday" section: the church with each body in the prayer pose, and the prayer pose with every outfit it can be worn with. Missing sprites show as placeholders with their key in red.

### 6.8 Scene rendering
- **Logical size:** 128 × 128 scene pixels.
- **Scaling:** pick the largest whole-number scale in device pixels that fits the container width (`floor(containerCssWidth × devicePixelRatio / 128)`, minimum 1). Set the canvas backing size to 128 × scale and its CSS size to backing size ÷ devicePixelRatio. Set `imageSmoothingEnabled = false` and CSS `image-rendering: pixelated`.
- **Draw order:** background (room, church or adventure scene), droppings, bunny body+face sprite, outfit layer, prayer paws layer (only while praying), effects, sleep overlay (`rgba(40, 30, 70, 0.55)` over the whole scene), Zzz effect on top of the overlay.
- **Positions (scene pixels, top-left of sprite):** bunny 64 × 64 at (32, 56). Dropping slots (16 × 16): (6, 100), (106, 100), (14, 112), (98, 112), filled in that order.
- **Away on an adventure:** the background is that adventure's scene (`scene-<adventureId>`) instead of the room, and no droppings are drawn. The bunny is drawn in full colour at the usual position, with the happy face and wearing the outfit that adventure rewards (even on the first trip), with the idle bob and the occasional happy sparkle.
- **Sunday:** when the bunny is home and it is Sunday by the device's local time (`new Date(now).getDay() === 0`, with `now` from the clock module so the dev offset counts), or the dev "Force Sunday" switch is on, the background is `room-church` instead of `room`. Everything else stays the same: droppings, moods, effects, sleep overlay and one-shot animations.
- **Prayer** (Sundays only):
  - Timing: the bunny prays while `timeMs mod 7000` is 5000 or more. That is 2 seconds out of every 7.
  - Pose: the body is drawn with `bunny-<body>-praying` whatever the mood: closed eyes, and a round lap with no front feet on the ground, because the front paws are raised. The `pray-paws-<shape>` layer is drawn on top of the outfit, so the paws stay visible over the suit or the cloak. The idle bob pauses.
  - Bow: y offset +1 from 300 ms to 1700 ms into the prayer.
  - Sparkle: `fx-sparkle` above the head from 600 ms to 1400 ms into the prayer.
  - No prayer while asleep or while a one-shot animation plays. A one-shot animation that starts during a prayer ends the prayer at once.
  - The rain cloud of a depressed bunny stays visible during the prayer.
- **Programmatic animations** (no extra sprite frames):
  - Idle bob: bunny y offset alternates 0 and −1 every 600 ms.
  - Feed: carrot at (56, 84), shrinks in 3 steps over 900 ms.
  - Play: two hops (y offset 0 → −6 → 0) over 800 ms, hearts float up and fade.
  - Clean: droppings fade out over 600 ms, sparkles at their positions.
  - Medicine: bottle at (56, 40) for 600 ms, then sparkles around the bunny.
  - Refusal (head shake): x offset ±1 alternating 6 times over 600 ms.
  - Sleeping: Zzz rises and loops above the bunny's head.
  - Depressed: rain cloud bobs above the bunny's head.
  - Happy: an occasional sparkle near the bunny.
- **Reduced motion:** if `prefers-reduced-motion: reduce`, skip bob, hops, shakes and floating effects. State changes still show instantly. The prayer pose still shows, without the bow and the sparkle.
- **Accessibility:** the canvas has an `aria-label` that describes the scene, for example "Clover, a teen bunny, looks happy. 2 droppings on the floor." While away: "Clover is on Garden Stroll, wearing the flower crown and looking happy." On Sundays: "Clover, a teen bunny, is at church and looks happy. 2 droppings on the floor." The label does not change during a prayer, so screen readers are not interrupted every 7 seconds.

### 6.9 Event cards
A modal `<dialog>` with a small canvas preview, text and a "Yay!" button. Dismissing removes the event from the queue and saves.
- Teen: "<name> grew into a teen! Adventures are now open."
- Adult: "<name> is all grown up!" plus "Fluffy and shiny", "Soft and cozy" (normal) or "A little scruffy, but loved".
- Returned with outfit: "<name> is back from <adventure> and found a <outfit>! <name> is wearing it now."
- Returned again: "<name> is back from <adventure> and had a wonderful time! Happiness is full."

### 6.10 Accessibility
- All buttons have visible text labels.
- Need bars use `role="meter"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"` and an `aria-label`.
- Dialogs use `<dialog>` with `showModal()` so focus is trapped and Escape closes (Escape counts as the cancel option).
- Text and controls meet WCAG AA contrast.

---

## 7. Visual design direction

### 7.1 Tone
Cozy, soft and warm. Think Neko Atsume and Animal Crossing: pastel colours, chunky friendly UI, no harsh edges or alarming reds. The UI frames the bunny; the bunny is the star.

### 7.2 Colour tokens (CSS custom properties on `:root`)

| Token | Hex | Use |
|---|---|---|
| `--cream` | `#FFF6EC` | Page background |
| `--cream-deep` | `#F6E6D3` | Panels, cards |
| `--pink` | `#F7B6C8` | Primary buttons, Tummy bar |
| `--pink-deep` | `#E68AA8` | Button pressed, theme colour |
| `--mint` | `#BFE8D4` | Clean bar, success |
| `--mint-deep` | `#7FCBA9` | Accents |
| `--lavender` | `#D5C6EF` | Energy bar, secondary buttons |
| `--butter` | `#FBE7A1` | Happy bar, highlights |
| `--plum` | `#4A3B4F` | Text, borders, outlines |
| `--plum-soft` | `#7A6A80` | Secondary text, shadows |
| `--danger` | `#E0707A` | Low bars, danger button |

The game uses a light theme only (`color-scheme: light`).

### 7.3 Typography
Pixelify Sans everywhere, self-hosted through `@fontsource/pixelify-sans`. Sizes: 16 px body, 20 px subheadings, 28 px headings, line height 1.4. If the package is unavailable, self-host the woff2 files from Google Fonts in `public/fonts/`.

### 7.4 Components
- Panels and buttons: 3 px solid `--plum` border, 6 px radius, a hard shadow `0 4px 0 var(--plum-soft)`.
- Buttons move down 2 px and lose the shadow while pressed.
- Disabled buttons: 50% opacity, no shadow.
- Generous spacing (16 px base unit). Low density: one main thing per area.

### 7.5 Pixel art style
- Cute, chibi, front-facing, sitting bunny. Cream-white fur, pink inner ears and cheeks, dark plum outline (`#4A3B4F`), soft pastel shading.
- All sprites share one palette (`art/palette.png`, at most 32 colours, built from the colour tokens plus fur and shading tones).
- Transparent backgrounds for everything except the room.

### 7.6 Sound
Short, soft chiptune blips with Web Audio (square and triangle oscillators, white-noise buffer for swishes), master gain about 0.1.

| Event | Sound |
|---|---|
| Feed | three short noise "munch" blips |
| Play | quick rising squeak arpeggio |
| Clean | soft noise swish |
| Medicine | high sparkle arpeggio |
| Sleep | three descending notes |
| Wake | three ascending notes |
| Refusal | two low boops |
| Adventure start / return | four-note fanfare |
| Grow up | rising scale |

Create or resume the `AudioContext` on the first user gesture. Play nothing when sound is off. Sound is off by default.

---

## 8. Business rules and edge cases

### 8.1 Constants (all in `constants.ts`)

| Rule | Value |
|---|---|
| Hunger drop (awake) | 100 per 8 h (12.5 / h) |
| Happiness drop (awake) | 100 per 12 h |
| Cleanliness drop (awake) | 100 per 12 h |
| Energy drop (awake) | 100 per 16 h (6.25 / h) |
| Energy refill (asleep) | 100 per 8 h (12.5 / h) |
| Other needs while asleep | half the awake drop rate |
| Feed | +30 hunger; refused at hunger ≥ 90 |
| Play | +25 happiness, −10 energy; refused at energy < 10 |
| Clean | cleanliness = 100 |
| Sleep | refused at energy ≥ 90 |
| Auto-wake | energy reaches 100 while asleep |
| Auto-sleep | energy reaches 0 while awake |
| Sick | hunger or cleanliness at 0 for 2 h continuously |
| Depressed | happiness at 0 for 2 h continuously |
| Depressed ends | happiness > 50 |
| Droppings | `min(4, floor((100 − cleanliness) / 25))` |
| Teen | age ≥ 24 h |
| Adult | age ≥ 96 h |
| Adult variant | care score ≥ 70 fluffy, ≥ 40 normal, else scruffy |
| Name | trimmed length 1 to 16 |
| Simulation step | at most 60 s |

### 8.2 Simulation (`advance(state, now)`)
1. If there is no bunny, return the state unchanged.
2. If `now < lastUpdatedAt` (clock moved backwards), set `lastUpdatedAt = now` and change nothing else.
3. Walk from `lastUpdatedAt` to `now` in steps. Each step is at most 60 seconds and also ends exactly at the next boundary: the teen birthday, the adult birthday or the adventure end.
4. For each step of length `dt`:
   1. **Away:** if on an adventure, needs, zero timers and care do not change.
   2. **Asleep:** hunger, happiness and cleanliness drop at half rate. Energy rises at the refill rate. If energy reaches 100, set it to 100 and wake up.
   3. **Awake:** all four needs drop at the awake rates. If energy reaches 0, set it to 0 and fall asleep.
   4. Clamp all needs to 0..100.
   5. **Zero timers** (not while away): for hunger, cleanliness and happiness, add `dt` if the value is 0, otherwise reset to 0.
   6. **Sick:** becomes true when `zeroMs.hunger` or `zeroMs.cleanliness` reaches 2 h.
   7. **Depressed:** becomes true when `zeroMs.happiness` reaches 2 h. Becomes false when happiness is above 50.
   8. **Care** (not while away, only while the stage at the step start is baby or teen): add `average(needs) × dt` to `weightedSum` and `dt` to `durationMs`.
   9. **Birthdays:** if the step ends on the teen birthday, queue a `grew-up` teen event. If it ends on the adult birthday, set `adultVariant` from `weightedSum / durationMs` (use `normal` if `durationMs` is 0) and queue a `grew-up` adult event.
   10. **Adventure end:** if the step ends at `endsAt`, finish the adventure. If the outfit is not owned, add it to the wardrobe, equip it and queue a `returned` event with the outfit. Otherwise set happiness to 100 and queue a `returned` event with `outfitFound: null`. Add the id to `completedAdventures` if it is not there. Clear `adventure`.
5. Set `lastUpdatedAt = now`.

A week of absence is about 10,000 steps. This is fast enough to run synchronously.

### 8.3 Actions (`actions.ts`)
Every action first runs `advance(state, now)`. Every action returns `{ state, result }` where `result` is `'ok'` or `{ refused: reason }`.

| Action | Allowed when | Effect |
|---|---|---|
| adopt(name) | no bunny, valid name | new bunny, all needs 100, `adoptedAt = lastUpdatedAt = now` |
| feed | home, awake | see 8.1; also reset `zeroMs.hunger` |
| play | home, awake | see 8.1; if depressed and happiness > 50, depressed = false |
| clean | home, awake | cleanliness 100; reset `zeroMs.cleanliness` |
| sleep | home, awake | asleep = true (or refusal) |
| wake | home, asleep | asleep = false |
| medicine | home, awake | if sick: sick = false, reset `zeroMs.hunger` and `zeroMs.cleanliness`; else refusal |
| startAdventure(id) | teen or adult, home, awake, not sick, not depressed | `adventure = { id, startedAt: now, endsAt: now + duration }` |
| equip(outfitId) | home, outfit owned | `equippedOutfit = outfitId` (allowed while asleep) |
| unequip | home | `equippedOutfit = null` |
| dismissEvent | an event is queued | remove the first event |
| startOver | always | `bunny = null`, keep settings |
| setSound(on) | always | `settings.soundOn = on` |
| loadState(state) | valid state | replace state, then `advance` to now |

The UI disables buttons for actions that are not allowed. Refusals (full, tired, not sleepy, not sick) still reach the logic so the bunny can react.

### 8.4 Mood (`mood.ts`)
In priority order:
1. `sleeping` if asleep.
2. `sick` if sick.
3. `sad` if depressed (with the rain cloud effect) or any need is below 25.
4. `happy` if all needs are 60 or more.
5. `content` otherwise.

### 8.5 Edge cases
- **Long absence:** the bunny ends up sick and depressed, ages normally and never dies.
- **Several events at once** (for example, came home and grew up): show them in the order they happened.
- **Growing up while away:** allowed. Care during the adventure is not counted.
- **Growing up while asleep:** allowed.
- **Two tabs open:** last write wins. The other tab reloads state on the `storage` event.
- **Tab in the background:** browsers slow down timers. The `visibilitychange` tick catches up.
- **Save code with spaces or line breaks:** strip all whitespace before decoding.
- **Name with emoji or HTML characters:** stored as is, always rendered with `textContent`.
- **iOS Safari storage:** Safari may delete website data after 7 days without a visit. Installed home-screen apps are not affected. The app requests persistent storage, and the save code is the backup.
- **Dev offset after leaving dev mode:** the offset stays in localStorage so timestamps remain consistent. It only exists on devices where `?dev=1` was used.
- **Sunday starts or ends while the game is open:** the scene switches on the next render, without a reload.
- **Time zones:** Sunday follows the device's local time. Travelling to another time zone moves the church day with the device.
- **Force Sunday without dev mode:** the switch is only read when the URL has `dev=1`, so a leftover `bnuuy:dev-force-sunday` has no effect in normal play.

---

## 9. Art pipeline (PixelLab MCP)

### 9.1 Setup (done once by the user)
The user creates a PixelLab account, gets an API token at https://api.pixellab.ai/mcp, and adds the server to Claude Code:

```
claude mcp add --transport http pixellab https://api.pixellab.ai/mcp --header "Authorization: Bearer <TOKEN>"
```

The token lives only in the user's Claude Code config. Never write it into the repository.

### 9.2 How PixelLab works
- Creation tools return a job id immediately. Poll with the matching `get_*` tool (for images, `get_image`) until the result is ready, then download the PNG.
- Useful tools (names may change; list the server's tools first and adapt):
  - `create_image_pro`: best quality, accepts `reference_images` and a style image. Use for the master sprite and new bodies.
  - `create_image_pixflux`: fast, supports `no_background` and an init image.
  - `inpaint_image_pro_flash` / `inpaint_image`: regenerate only a rectangle (`mask_x`, `mask_y`, `mask_width`, `mask_height`) and keep the rest. Use for faces and outfits.
  - `edit_image_pro_flash` / `edit_image`: text-guided edits of an existing image.
  - `create_1_direction_object`: single items (carrot, dropping, icons).
  - `reduce_colors`: snap an image to `art/palette.png`.
  - `unzoom_image`, `correct_pixelart`: clean up results that are upscaled or messy.
- Limits: most images up to 512 × 512; inpainting and references up to 256 × 256.
- If a tool cannot produce an exact size, generate at a supported size and downscale with `unzoom_image` or nearest-neighbour. Never use smoothing.

### 9.3 Sprite list

All bunny and outfit sprites are 64 × 64 with the bunny sitting bottom-centred, feet on row 60. All stages share this canvas, so every layer lines up at the same origin.

| Group | Files | Size | Count |
|---|---|---|---|
| Bunny bodies × faces | `bunny-{baby,teen,adult-fluffy,adult-normal,adult-scruffy}-{happy,content,sad,sick,sleeping}.png` | 64 × 64 | 25 |
| Outfit layers | `outfit-{outfitId}-{teen,adult}.png` | 64 × 64 | 16 |
| Room | `room.png` (front view: pastel wall, window, wooden floor, round rug in the centre) | 128 × 128 | 1 |
| Adventure scenes | `scene-{adventureId}.png` (front view of the adventure's place, ground from row 94, plain ground where the bunny sits) | 128 × 128 | 8 |
| Items and effects | `item-carrot`, `item-medicine`, `item-dropping`, `fx-heart`, `fx-sparkle`, `fx-zzz` | 16 × 16 | 6 |
| Rain cloud | `fx-rain-cloud` | 32 × 16 | 1 |
| UI icons | `icon-ball`, `icon-broom`, `icon-moon`, `icon-sun`, `icon-map`, `icon-hanger`, `icon-gear` | 16 × 16 | 7 |
| Adventure icons | `adventure-{adventureId}.png` | 32 × 32 | 8 |
| App icon | `app-icon.png` (bunny face on pink) | 64 × 64 | 1 |
| Church | `room-church.png` (front view of a cozy Catholic church interior, same layout as the adventure scenes) | 128 × 128 | 1 |
| Praying bodies | `bunny-{baby,teen,adult-fluffy,adult-normal,adult-scruffy}-praying.png` (sleeping face, round lap without front feet) | 64 × 64 | 5 |
| Prayer paws | `pray-paws-{baby,teen,adult}.png` (front paws pressed together in front of the chest; the adult layer serves all three adult variants) | 64 × 64 | 3 |

Feed and Medicine buttons reuse `item-carrot` and `item-medicine` as icons. Total: 82 files in `src/assets/sprites/`.

Size guide within the 64 × 64 canvas: baby about 32 px tall (big head, tiny body), teen about 44 px (longer ears, slimmer), adult about 56 px. The three adult variants share the same pose and outline; only fur texture and shine differ.

### 9.4 Rules for consistency
- **Master first.** Make `bunny-adult-normal-content` first. It is the style reference for everything else. Get the user's approval before continuing.
- **Bodies from the master.** Make the other four bodies (content face) with the master as reference image.
- **Face rectangles.** After making each body, decide its face rectangle (x, y, width, height covering eyes, cheeks and mouth). Record it in `art/ART_LOG.md` and in `spriteManifest.ts`.
- **Faces by inpainting.** For each body, inpaint only the face rectangle to make the other moods. Everything outside the face must stay identical.
  - happy: closed happy eyes, open smile, blush.
  - content: open eyes, small smile.
  - sad: teary eyes, small frown.
  - sick: tired eyes, green tinge, a small bandage or thermometer that stays inside the face rectangle.
  - sleeping: closed eyes, relaxed mouth.
- **Outfits by inpainting, then extraction.** Inpaint the outfit onto `bunny-teen-content` and `bunny-adult-normal-content`. Then run `npx tsx tools/extract-layer.ts <base.png> <dressed.png> <out.png>`. It keeps only pixels that differ from the base and makes the rest transparent.
- **Outfits never cover the face rectangle**, so every mood stays visible. The astronaut helmet is a clear glass bubble outline around the head.
- **One palette.** Run `reduce_colors` with `art/palette.png` on every final sprite.
- **Log everything** in `art/ART_LOG.md`: sprite key, tool, prompt, job id, and any manual fixes. This makes sprites reproducible.
- **Review in the gallery.** After each group, open `/bnuuy/?dev=1#/dev/sprites`, take a screenshot with Playwright, look at it, and redo anything off-model or misaligned. Small fixes can be done by editing pixels with `pngjs`.

### 9.5 Base prompt
"cute chibi bunny, front view, sitting, cream white fur, pink inner ears and cheeks, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background". Add stage and variant words:
- baby: "tiny baby bunny, big head, small round body"
- teen: "young bunny, longer ears, slimmer body"
- adult fluffy: "extra fluffy shiny fur, sparkles in the fur, healthy glow"
- adult normal: "soft neat fur"
- adult scruffy: "messy fur tufts, slightly dull fur, still cute"

### 9.6 Placeholders
Until a sprite exists, `sprites.ts` draws a placeholder: the expected size filled with `--pink`, a 1 px `--plum` border and the first letter of the key. Features can be built and tested before all art is done.

### 9.7 Sunday art (version 1.3)
- **Budget:** at most 150 generations for the church and the paws together. On 2026-10-08 the account had 1,010 generations left; the allowance refills on 2026-11-07. Check `get_balance` before starting. If the budget runs out, stop and ask the user.
- **Church (`room-church`):** use the method of the adventure scenes in `art/ART_LOG.md`. That is `create_image_pro`, 128 × 128, opaque, with `room.png` as style image (`style_copy` `["color_palette", "shading"]`) and the same layout sketch as reference image. The sketch file was not kept, so recreate it from its description in `art/ART_LOG.md` and save it as `art/layout-sketch.png`. Then fill the plain ground patch with `inpaint_image_pro_flash`. Prompt: "cozy cute pixel art background scene for a pet bunny game, front view: the inside of a small Catholic church, an altar with a white cloth and a simple golden cross, a round stained-glass rose window in soft pastel colours, tall lit candles, wooden pews along the left and right edges, warm soft light, a stone floor with an empty patch in the centre bottom where a small character will sit, soft pastel colours, low contrast in the centre, dark plum outlines on objects, no characters, no people, no animals, no text, clean pixel art". The church is drawn with respect: no jokes or odd details in the art itself.
- **Prayer paws (`pray-paws-<shape>`):** for each shape, inpaint the chest of `bunny-baby-sleeping`, `bunny-teen-sleeping` and `bunny-adult-normal-sleeping` with `inpaint_image_pro_flash`. Use a rectangle mask directly below the face rectangle that never overlaps it. Prompt: "the bunny's two front paws raised and pressed together in prayer in front of its chest, cream fur, pink paw pads, dark plum outline, pixel art". Then run `tools/extract-layer.ts` against the same base. The layer keeps only the paws and their outline; remove any other changed pixels with `pixelart_workbench`, which is free. If inpainting fails twice for a shape, draw the paws by hand with `pixelart_workbench`.
- **Praying bodies (`bunny-<body>-praying`):** stack the paws layer on the sleeping sprite of baby, teen and adult-normal. Inpaint the front legs between the hind feet with `inpaint_image_pro_flash` ("soft round fluffy belly and lap resting on the ground ... no front feet"). For the fluffy and scruffy adults, copy the pixels that changed on adult-normal; on scruffy, shift each fur tone one step darker. Outfit layers must not draw anything in the lap below the garment, or the legs show again.
- **Checks:** the paws never cover the face rectangle; they line up on the fluffy, normal and scruffy adults; they read well over every outfit; no front feet show in the prayer pose. Run `reduce_colors` with `art/palette.png` and log every call in `art/ART_LOG.md`.

---

## 10. Environment and deployment

### 10.1 Prerequisites
- Node 22 LTS or newer, npm.
- Claude Code with the PixelLab MCP server connected (section 9.1).
- A GitHub account and a public repository named `bnuuy`. On a free account, GitHub Pages only works for public repositories, so the code and these documents are public.

### 10.2 Environment variables
None at runtime. Nothing secret is stored in the repository.

### 10.3 npm scripts

| Script | Command |
|---|---|
| `dev` | `vite` |
| `build` | `tsc --noEmit && vite build` |
| `preview` | `vite preview --port 4173` |
| `typecheck` | `tsc --noEmit` |
| `test` | `vitest run` |
| `test:e2e` | `playwright test` |
| `check:sprites` | `tsx tools/check-sprites.ts` |
| `icons` | `tsx tools/make-icons.ts` |

There is no `deploy` script. Deploys run in GitHub Actions (10.4).

### 10.4 Deploy
- Vite's `base` is `/bnuuy/`, the repository name. The dev server and preview also serve the game at `/bnuuy/`.
- `.github/workflows/deploy.yml` runs on every push to `main`, and by hand from the Actions tab. It runs `npm ci`, `npm test` and `npm run build`, uploads `dist` with `actions/upload-pages-artifact`, and publishes it with `actions/deploy-pages`.
- First deploy, done once by the user:
  1. Create a public repository named `bnuuy` on GitHub.
  2. In the repository, open Settings > Pages and set Source to "GitHub Actions".
  3. Run `git remote add origin <repository URL>` and `git push -u origin main`.
  If the first workflow run fails because Pages was not enabled yet, rerun it from the Actions tab.
- The site is served at `https://<username>.github.io/bnuuy/`. Record the URL in the notes of `PSD_PROGRESS.md`.
- If the repository gets another name, change `base` in `vite.config.ts`, and `baseURL` and the `webServer` URL in `playwright.config.ts`, to match.

### 10.5 PWA
- `vite-plugin-pwa` with `registerType: 'autoUpdate'`.
- Manifest: `name` "bnuuy", `short_name` "bnuuy", `description` "A cozy pixel bunny to care for.", `display` "standalone", `orientation` "portrait", `start_url` and `scope` "/bnuuy/" (both follow Vite's `base`), `background_color` `#FFF6EC`, `theme_color` `#E68AA8`.
- Icons generated by `tools/make-icons.ts` from `app-icon.png` with nearest-neighbour scaling: `pwa-192x192.png` (×3), `pwa-512x512.png` (×8), `pwa-maskable-512x512.png` (bunny ×6 centred on a pink 512 × 512 square, inside the safe zone), and `apple-touch-icon.png` (192 × 192). Link the apple touch icon in `index.html`.
- Workbox `globPatterns`: `**/*.{js,css,html,png,svg,woff2,webmanifest}`, so the game works offline.

### 10.6 Git
- Initialise a git repository with a `.gitignore` (`node_modules`, `dist`, `test-results`, `playwright-report`).
- Commit only when the user asks. Claude Code never pushes. The user pushes `main` to deploy.

---

## 11. Testing strategy

### 11.1 Unit tests (Vitest, `src/game/*.test.ts`)
Game logic is pure, so tests pass explicit timestamps. Required coverage:
- Awake decay: exact need values after 1 h and 8 h.
- Sleep: half-rate decay, energy refill, auto-wake at 100, auto-sleep at 0.
- Zero timers: sick after exactly 2 h at zero hunger, and also at zero cleanliness; not sick at 1 h 59 min.
- Medicine cures and resets timers; refused when not sick.
- Depressed after 2 h at zero happiness; ends only above 50.
- Each action's effect and each refusal (boundaries: hunger 89 vs 90, energy 9 vs 10, energy 89 vs 90).
- Droppings count at cleanliness 100, 75, 74, 50, 1, 0.
- Stage boundaries at 23:59, 24:00, 95:59, 96:00.
- Care score and adult variant at the 70 and 40 boundaries; care not counted while away.
- Adventures: start rules (baby, asleep, sick, depressed, already away), needs paused, outfit on first return and auto-equipped, happiness 100 on repeat return, events queued.
- Catch-up: one `advance` over 7 days gives the same result as many small `advance` calls.
- Clock moving backwards changes nothing except `lastUpdatedAt`.
- Save code: round trip (including an emoji name), whitespace tolerance, wrong checksum, wrong prefix, newer version, invalid JSON, out-of-range values.
- Storage: load, save, broken save is copied to `bnuuy:save-broken`, missing storage handled (use a fake `Storage` object).
- Name validation.
- `tools/extract-layer.ts`: identical pixels become transparent, changed pixels are kept.
- Sunday: `isSunday` is false on Saturday 23:59 and Monday 00:00, and true on Sunday 00:00 and 23:59. Build the dates with the local `Date` constructor (for example `new Date(2026, 9, 11)`, a Sunday) so the tests pass in any time zone.
- `sceneViewOf`: church background on a Sunday at home; no church while away; "Force Sunday" gives the church on a weekday.
- `describeScene` on a Sunday mentions the church and still reports the droppings.
- Prayer timing: not praying at 0 ms and 4,999 ms; praying at 5,000 ms and 6,999 ms; not praying at 7,000 ms; never while asleep or during a one-shot animation.

### 11.2 End-to-end test (Playwright, `e2e/flow.spec.ts`)
Chromium with the `Pixel 7` device profile, against `npm run preview`, using `/bnuuy/?dev=1` so the time-skip panel is available. One test covers:
1. Adopt "Clover"; Home shows the name and four full bars.
2. Feed is refused at full tummy (bubble visible).
3. Skip 4 h; feed works; droppings appear on the scene (check the canvas `aria-label`).
4. Skip 1 day; the teen event card appears; dismiss it. Tap "Make healthy" (the bunny may be asleep or sick after a day alone).
5. Start Garden Stroll; Home shows the away card; skip 1 h; the return card names the flower crown.
6. Wardrobe shows the flower crown as worn; take it off; put it back on.
7. Settings: copy the save code (read it from the textarea), start over, Adopt screen appears.
8. Load the code on the Adopt screen; Clover is back with the flower crown.

The test must pass on every day of the week. No assertion may depend on the church background or the prayer.

### 11.3 Other checks
- `npm run typecheck` passes with `strict: true`.
- `npm run check:sprites` confirms all 82 sprites exist with the right sizes.
- Manual: the sprite gallery looks right to the user.
- Manual: Chrome DevTools > Application shows a valid manifest and an active service worker; reloading offline still works.
- Manual: layout at 360, 390, 768 and 1280 px widths has no horizontal scroll and the scene stays crisp.
- Manual (user): install on her phone's home screen and play.

---

## 12. Definition of done

The MVP is done when every item is true:

- [x] `npm run typecheck`, `npm test` and `npm run test:e2e` all pass.
- [x] `npm run check:sprites` passes; all 73 sprites are real PixelLab art (no placeholders).
- [x] The user approved the master bunny and the final sprite gallery.
- [x] Adopting, all five actions, all refusals, sleep, sickness, depression, growth and all eight adventures work as specified in section 8.
- [x] Needs keep changing while the game is closed, and the game catches up correctly when reopened.
- [x] The adult look depends on care (verified by unit tests at the boundaries).
- [x] Outfits drop on first completion, are auto-equipped, and can be changed in the Wardrobe.
- [x] A save code restores the exact bunny in a fresh browser profile.
- [x] Start over works and keeps the sound setting.
- [x] Sound is off by default and toggles in Settings.
- [x] The game is deployed to GitHub Pages and the URL is recorded in `PSD_PROGRESS.md`.
- [x] The game is installable as a PWA and loads offline after the first visit.
- [x] Layout works from 360 px to desktop widths; pixels stay crisp.
- [x] `?dev=1` shows the dev panel; without it, no dev UI is visible.
- [x] The user confirmed it works on the friend's phone.

Version 1.3 (Sunday easter egg) is done when every item is true:

- [x] `npm run typecheck`, `npm test` and `npm run test:e2e` all pass.
- [x] `npm run check:sprites` passes with 82 sprites; the church, the five praying bodies and the three paws layers are real PixelLab art.
- [x] On a Sunday (or with "Force Sunday"), Home shows the church, and the awake bunny prays every 7 seconds as specified in 6.8.
- [x] The paws show correctly with every body and every outfit in the sprite gallery.
- [x] On other days, and while the bunny is away, nothing changes.
- [x] The Sunday art used at most 150 generations.
- [x] The user approved the church and the prayer.

---

## 13. Open questions

None. The user chooses a PixelLab plan before the art phase starts.
