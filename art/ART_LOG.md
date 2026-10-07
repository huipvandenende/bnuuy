# bnuuy art log

Every sprite is recorded here with its tool, prompt, job id and any manual fixes, so it can be reproduced. See `PSD.md` section 9.

## Palette

`art/palette.png` is 32 × 16 px: 32 colours in 4 × 4 px swatches, 8 per row. It was generated with a one-off `pngjs` script (2026-10-07).

| # | Hex | Use |
|---|---|---|
| 1 | `#FFF6EC` | cream (token) |
| 2 | `#F6E6D3` | cream-deep (token) |
| 3 | `#F7B6C8` | pink (token), inner ears, cheeks |
| 4 | `#E68AA8` | pink-deep (token) |
| 5 | `#BFE8D4` | mint (token) |
| 6 | `#7FCBA9` | mint-deep (token) |
| 7 | `#D5C6EF` | lavender (token) |
| 8 | `#FBE7A1` | butter (token) |
| 9 | `#4A3B4F` | plum (token), outline |
| 10 | `#7A6A80` | plum-soft (token) |
| 11 | `#E0707A` | danger (token) |
| 12 | `#FFFFFF` | fur highlight |
| 13 | `#EFE3D6` | fur shade |
| 14 | `#D9C8BA` | fur shadow |
| 15 | `#B8A79E` | dull fur (scruffy) |
| 16 | `#2E2333` | deep outline, eyes |
| 17 | `#C99A6E` | wood light |
| 18 | `#A9784F` | wood |
| 19 | `#7E5638` | wood dark |
| 20 | `#A8D8F0` | sky, glass |
| 21 | `#6FA8D6` | blue |
| 22 | `#4E5FA8` | navy (suit, space) |
| 23 | `#9CCB86` | leaf, sick tint |
| 24 | `#5E9A54` | dark green |
| 25 | `#F2C14E` | gold |
| 26 | `#F29A4A` | carrot orange |
| 27 | `#C8662E` | dark orange |
| 28 | `#C9C6D3` | light grey |
| 29 | `#8E8A9A` | grey |
| 30 | `#9B6BB8` | purple (wizard) |
| 31 | `#F4D6E0` | light blush |
| 32 | `#D8B36A` | straw |

## Face rectangles

These match `FACE_RECTS` in `src/render/spriteManifest.ts` (x, y, width, height in the 64 x 64 sprite). They cover the eyes, cheeks, nose and mouth with a 1 px margin.

| Body | Rectangle | Body height |
|---|---|---|
| baby | 23, 40, 18 x 9 | 34 px (y 27 to 60) |
| teen | 23, 34, 19 x 9 | 47 px (y 14 to 60) |
| adult-normal, adult-fluffy, adult-scruffy | 20, 26, 24 x 11 | 60 px (y 1 to 60) |

The heights are also used by `src/render/scene.ts` (`BODY_HEIGHTS`) to place the Zzz, rain cloud and hearts above the head.

## Budget

The PixelLab account started on the trial plan (40 generations, one job at a time). On 2026-10-07 the user upgraded to Tier 1 (2,000 generations per cycle, reset on 2026-11-07), so the PSD 9.4 method (Pro images, inpainting) is used from the Pro master onwards. Costs: `create_image_pixflux` and `create_image_pixen` 1 generation; `create_image_pro_flash`, `inpaint_image_pro_flash` and `edit_image_pro_flash` 5; `create_image_pro`, `edit_image`, `inpaint_image` and `create_1_direction_object` 20 to 40; `reduce_colors` 0.1; `pixelart_workbench` free.

## Sprites

### bunny-adult-normal-content (master)

- Date: 2026-10-07. Generations used: 23.1 (3 for the first candidates, 20 for the Pro set, 0.1 for one `reduce_colors` test).
- Base prompt (PSD 9.5 plus adult normal and content words): "cute chibi bunny, front view, sitting, cream white fur, pink inner ears and cheeks, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background, adult bunny with tall upright ears, soft neat fur, open eyes, small smile".
- Candidates, all 64 × 64 with `no_background`, `direction` south, `outline` "single color outline":
  - A: `create_image_pixflux`, seed 1, `shading` "basic shading", `detail` "medium detail", forced palette `art/palette.png`. Job `6610361d-b1ac-4c32-8248-55feaaba0999`. Raw file `art/raw/master-a-pixflux-s1.png`. First choice on the trial plan; replaced by Pro candidate 9. The fixed version is kept as `art/raw/master-a-final.png`.
  - B: `create_image_pixen`, seed 3, `detail` "medium detail". Job `1c86d9a4-b1a2-42fa-a5de-16ca775974c2`. Raw file `art/raw/master-b-pixen-s3.png`. Rejected: three-quarter view, saturated, 28 colours outside the palette.
  - C: `create_image_pixflux`, seed 2, same settings as A, prompt ending "big shiny dark eyes, small happy smile, content and calm". Job `06a53364-d2fc-4fb3-9628-0b1c32117eb4`. Raw file `art/raw/master-c-pixflux-s2.png`. Rejected: greyish fur, only 48 px tall.
  - Pro set: `create_image_pro`, seed 11, 64 × 64, `no_background`, prompt as above plus "bunny fills most of the canvas height, feet at the bottom". Job `60d16949-93b2-4083-86e4-d8d67ff199ad`, 16 candidates in `art/raw/master-pro/pro-s11-<index>.png`. All share one front-facing pose, 60 px tall. **Chosen: candidate 9** (cream fur, pink ears, rosy cheeks, clear smile).
- Palette for Pro candidate 9: `reduce_colors` with `art/palette.png` (job `ef964ee2-e4cf-4535-836f-f32b2f961963`, `art/raw/master-pro/pro-s11-9-palette.png`) turned the fur beige (`--cream-deep`) and the outline almost black. Instead, the 26 colours were mapped to the palette by hand: main fur to cream `#FFF6EC`, outline to plum `#4A3B4F`, eyes to `#2E2333`, body shading to `#D9C8BA` and `#EFE3D6`, ear and cheek pinks to `#F7B6C8`, `#F4D6E0` and `#E68AA8`, inner lines to plum-soft `#7A6A80`, eye shine to white. The sprite was moved up 1 px so the feet are on row 60 (bounding box x 17 to 46, y 1 to 60, 60 px tall). Result: 10 palette colours, `art/raw/master-pro/pro-s11-9-final.png`, installed as `bunny-adult-normal-content.png`.
- Manual fixes on A with `pngjs` (free), kept for reference:
  - Moved 2 px left and 2 px down: the bunny is centred, 54 px tall, with its feet on row 60 (bounding box x 17 to 46, y 7 to 60).
  - Recoloured off-style palette colours: brown `#7E5638` to pink-deep `#E68AA8` (to plum `#4A3B4F` inside the eyes), `#A9784F` to fur shadow `#D9C8BA` (to plum-soft `#7A6A80` inside the eyes), dark orange `#C8662E` to pink-deep, `#E0707A` to pink `#F7B6C8`, dull fur `#B8A79E` to fur shadow.
  - Removed the two plum "eyebrow" pixels at (25, 31) and (35, 31), which made the bunny look worried.
- Result for A: 7 colours, all from `art/palette.png`.

## Shared helpers (scratch scripts, not in the repo)

- Palette mapping: either a hand-written colour map, or nearest palette colour by the "redmean" distance with optional per-colour overrides. Pixels with alpha below 128 become fully transparent.
- Every face and outfit check confirmed that pixels outside the inpainting mask are byte-identical to the base sprite.

### bunny-teen-content

- `create_image_pro`, 48 x 48, seed 22, `no_background`, master as `reference_images` ("the same bunny character: copy its cream fur colours, plum outline, soft shading, eye and smile style"). Prompt: base prompt plus "young bunny, longer ears, slimmer body, open eyes, small smile, same character as the reference, fills the canvas height". Job `497a5ac3-d424-4f86-b9cf-9b158da41ad1`, 16 candidates in `art/raw/teen/`. Chosen: candidate 0. 20 generations.
- Colours mapped by hand to the palette (eyes and mouth to `#2E2333`, outline to `#4A3B4F`), then pasted into 64 x 64 at offset (8, 13): 47 px tall, feet on row 60. Final: `art/raw/teen/teen-s22-0-final.png`.

### bunny-baby-content

- Attempt 1: `create_image_pro` 36 x 36 with the master as reference (job `522e09be-e2ee-4cdd-ab53-dd92b5c1da04`, 25 generations). Rejected: broken outlines, adult proportions.
- Attempt 2: 40 x 40 with the master as style image (job `0e98a79e-e545-4f05-8bdf-8ec7fad2365e`, 25 generations). Good baby proportions but every candidate was cropped at the ear tips and feet.
- Attempt 3: 48 x 48, style image, prompt adds "full body in frame with a small empty margin" (job `bb4c14cd-d4c5-4764-b888-bb77520d2eb1`, 20 generations). Candidate 13 was complete (one floppy ear) but 48 px tall, as tall as the teen.
- Attempt 4: 40 x 40 again with the margin wording (job `0b656964-63be-4d9e-bd04-975e3c916c05`, 25 generations). Still cropped.
- Final: candidate 13 of attempt 3, upscaled x8 onto white and redrawn with `image_to_pixelart` (faithful, `init_image_strength` 200, output 40 x 40, seed 71, job `1079cc9d-3317-4757-8f0b-d59914e0c7de`, 1 generation). The white background was removed with a flood fill from the edges, colours were mapped to the palette with a few hand fixes, and the sprite was pasted at offset (12, 24): 34 px tall, feet on row 60. The noisy face was then replaced by inpainting (see faces). Four plum pixels at (30 to 33, 51) were recoloured to `#D9C8BA`. Base without face: `art/raw/baby5/baby13-pixelart-cleaned.png`.

### bunny-adult-fluffy-content and bunny-adult-scruffy-content

- `inpaint_image_pro_flash` on the master with a mask of every opaque pixel that is not outline, not next to transparency and not inside the adult face rectangle, so the outline and face stay identical. 5 generations each.
  - Fluffy: seed 43, "very fluffy glossy pure white fur with many soft fluffy tufts, bright white star sparkles and shiny glints in the fur, radiant healthy glow, pink inner ears with shine, clean pixel art". Job `cd32f3da-294b-42eb-a621-42324b7e9e5c`. A first try (seed 41, job `678a96b6-4367-4478-80de-d644c9ea6f17`) was too close to the normal adult.
  - Scruffy: seed 42, "messy scruffy fur with uneven tufts, slightly dull greyish cream fur, a few darker patches, ruffled texture, still cute, soft pastel shading, pink inner ears, clean pixel art". Job `853dfd49-a80f-4654-9cfc-5eb436e92a0d`. Cream `#FFF6EC` inside the face rectangle was recoloured to the scruffy fur tone `#EFE3D6` so the face does not look like a pale band.
- Both mapped to the nearest palette colours. Afterwards the master's silhouette and outline pixels were copied in, so all three adults share one outline exactly.

### Faces (happy, sad, sick, sleeping, and the baby's content face)

- `inpaint_image_pro_flash`, rectangle mask = the body's face rectangle, `output_method` "Modify current layer", 5 generations each. Prompts all start "cute kawaii bunny face" ("baby bunny face" for the baby) and end "cream fur, pixel art with dark plum lines":
  - happy: "closed happy eyes drawn as upward curved arcs, open smiling mouth, rosy pink blush cheeks"
  - sad: "big teary eyes with small light blue tears, small downturned frowning mouth, pink cheeks"
  - sick: "tired half-closed droopy eyes, pale light green tinge on the cheeks, a small thermometer sticking out of the mouth"
  - sleeping: "peacefully closed eyes drawn as gentle downward curved lines, relaxed small closed mouth, soft pink cheeks"
  - baby content: "calm content expression: two open round dark eyes with a tiny white shine, a small cute w-shaped bunny mouth with a tiny pink nose, soft pink cheeks" (seed 85; seed 80 gave a dotted mouth)
- Adult faces were made once on adult-normal (seeds 51 to 54) and copied into the fluffy and scruffy bodies (face rectangle only; for scruffy, `#FFF6EC` became `#EFE3D6`). Teen seeds 61 to 64, baby seeds 81 to 84. Raw results in `art/raw/faces/`.

### Outfits

- `inpaint_image_pro_flash` on `bunny-teen-content` and `bunny-adult-normal-content`, 5 generations each, with a mask PNG per outfit kind that never includes the face rectangle:
  - hats (flower crown, sun hat, chef's hat, wizard hat, pirate hat): adult x 10 to 53, y 0 to 25; teen x 12 to 51, y 6 to 33
  - suit: adult x 12 to 51, y 37 to 61; teen x 14 to 49, y 43 to 61
  - hobbit cloak: adult x 8 to 55, y 28 to 62; teen x 10 to 53, y 32 to 62
  - astronaut helmet: adult x 6 to 57, y 0 to 44; teen x 8 to 55, y 6 to 50
- Prompts (adult seeds 101 to 108, teen seeds 111 to 118):
  - flower-crown: "a crown of small pastel flowers, pink tulips and white daisies with little green leaves, resting on top of the bunny's head between its ears"
  - sun-hat: "a wide-brimmed straw sun hat with a pink ribbon band sitting on the bunny's head, its long ears poking up through the brim"
  - chef-hat: "a tall white puffy chef's toque hat sitting on the bunny's head between its ears"
  - suit: "a smart navy blue suit jacket with a white shirt collar and a red necktie, worn on the bunny's body"
  - wizard-hat: "a tall pointy purple wizard hat with small gold stars sitting on the bunny's head, its long ears poking out at the sides"
  - pirate-hat: "a black pirate tricorn hat with a small white skull emblem and gold trim sitting on the bunny's head, its ears poking up behind"
  - hobbit-cloak: "a green hooded traveller's cloak draped over the bunny's shoulders and around its body, the hood resting behind the head, fastened at the neck with a small gold leaf brooch"
  - astronaut-helmet: "a clear round glass astronaut helmet bubble with a light grey outline and a white shine highlight enclosing the bunny's whole head and ears, a white collar ring at the neck, the face clearly visible through the glass"
- Each dressed image was mapped to the nearest palette colours, then `npx tsx tools/extract-layer.ts <base> <dressed> <layer>` kept only the changed pixels. Isolated clusters smaller than 8 px (adult) or 6 px (teen) were removed; these were tiny ear-outline changes. Raw results in `art/raw/outfits/`.

### app-icon

- `create_image_pro`, 64 x 64, opaque, seed 131, master as reference. Prompt: "app icon: close-up of the same cute cream white bunny's head with both pink-lined ears, happy closed eyes and a small smile, rosy cheeks, centred on a flat soft pink background, dark plum outline, clean kawaii pixel art". Job `d7a6220a-c81a-49dd-b3a3-51668a548859`, 20 generations. Chosen: candidate 0 (`art/raw/app-icon/chosen-s131-0.png`).
- Mapped to the nearest palette colours with the outline to `#4A3B4F` and shading to `#E68AA8`. The bottom row was a white edge artifact and was painted `#F7B6C8`. `npm run icons` then wrote the four PWA icons.

## Room, items, effects and icons

Made by a helper agent with `create_image_pro` (23 calls, 460 generations) and hand fixes; merged from its own log.

This file covers the 22 non-bunny sprites. The main agent merges it into `art/ART_LOG.md`. Date: 2026-10-07.

### Common settings

- Tool: `create_image_pro` for every sprite. Cost: 20 generations per call. A 16 × 16, 32 × 16 or 32 × 32 call returns 64 candidates; a 128 × 128 call returns 4.
- Style image: `src/assets/sprites/bunny-adult-normal-content.png` (the master).
- `style_copy`: `["outline", "color_palette", "shading"]`, except the room, which used `["color_palette", "shading"]`.
- `no_background`: true, except the room (false).
- Raw candidates: `art/raw/items/<key>/<index>.png`. "Candidate N" below means file `N.png` in that folder.
- `reduce_colors` was not used. It is not needed, because every sprite was mapped to `art/palette.png` with one of the methods below.

### Palette methods

- **Snap**: each opaque pixel (alpha 128 or more) gets the nearest palette colour in CIELAB space. The palette used is all 32 colours except deep outline `#2E2333`, so dark outlines land on plum `#4A3B4F`. Pixels with alpha below 128 become fully transparent. Every other pixel becomes fully opaque.
- **Snap with overrides**: the same, but some source colours are mapped by hand. The overrides are listed per sprite.
- **Redrawn**: the candidate looked muddy or unreadable at its size, so the sprite was redrawn by hand. Only palette colours were used, with a plum `#4A3B4F` outline, and the candidate's silhouette, layout or colours served as reference. The final PNG is the source of truth for these sprites.

### Budget

23 calls × 20 = **460 generations** (limit for this group: 600). There were no failed or repeated calls.

### Sprites

### room (128 × 128)

- Job `142c2cfe-2d77-48dc-a444-5e34319b1ce2`, seed 120. **Chosen: candidate 0** of 4.
- Prompt: "cozy cute pixel art room interior for a pet bunny game, straight-on front view of the back wall, soft pastel lavender wallpaper with tiny subtle pattern, a white framed window with light blue sky and soft curtains on the upper left, a small framed picture on the upper right, a cream baseboard, warm light wooden plank floor across the bottom quarter, a round soft pink rug in the centre of the floor, the centre of the room is empty and calm, low contrast, soft pastel colours, dark plum outlines on objects, clean pixel art".
- Reference image: a flat block-out drawn with `pngjs`, with usage "composition and layout: keep the window, picture frame, baseboard line, floor line and rug in the same positions and sizes". It has a lavender wall to row 89, a cream baseboard on rows 90 to 93, a wood floor from row 94, a window at x 10 to 46 and y 14 to 52, a frame at x 88 to 114 and y 24 to 46, and a pink rug ellipse centred at (64, 115).
- Result: the lavender wall has faint dots, cream curtains and a carrot picture. The baseboard is on rows 90 to 93 and the floor starts on row 94.
- Manual fixes (`pngjs`):
  - Removed a cushion from the rug centre and filled it with rug pink.
  - Repainted the whole floor: wood light `#C99A6E` with a wood `#A9784F` plank line every 6 rows, from row 99. This also removed the rug's soft shadow.
  - Moved the rug down 3 px, so it covers x 28 to 99 and y 98 to 127, centred at (64, 113). The dropping slots stay on bare floor.
- Hand colour map: `462d42` and `502e41` to plum; `fff6d2` (curtains) to cream `#FFF6EC`; `c39676` to wood light; `e3d9f3` and `f6e8e2` (wall dots) to cream; `f0aebc` and `b2706f` (rug border) to pink-deep `#E68AA8`; `d48a9d` (border stitches) to light blush `#F4D6E0`. Every other colour is the nearest palette colour in CIELAB. Result: 18 colours.

### item-carrot (16 × 16)

- Job `16c486db-5b91-464b-a278-b5a1ba075c1a`, seed 101. **Chosen: candidate 9.**
- Prompt: "a cute small orange carrot with a green leafy top, game item icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snapped to carrot orange, dark orange, leaf, dark green, plum and butter.
- Manual fixes: most candidates had a sleepy face. The face lines became dark orange `#C8662E` ridges, because the bunny eats this carrot. Added a butter highlight on the left, dark orange shading on the right and a light leaf highlight.

### item-medicine (16 × 16)

- Job `12c93cec-069d-4bea-bbae-d838d49dab45`, seed 102. Candidate 0 was used for the silhouette.
- Prompt: "a cute small medicine bottle with a pink cap and a white label with a pink cross, game item icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: redrawn. All 64 candidates were muddy, with about 31 colours and an unreadable label.
- Design: a rounded mint cap (`#BFE8D4` and `#7FCBA9`), a light blush glass neck, pink liquid with pink-deep shading, a white label with a pink-deep cross and a white glass shine.

### item-dropping (16 × 16)

- Job `59842419-c016-4743-950e-fba59a9f9859`, seed 103. Candidate 7 was used for the layout: one lump resting on two.
- Prompt: "a tiny cute pile of three round brown bunny droppings, little pellets stacked, small game item, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: redrawn. The candidates looked like poop-emoji mounds.
- Design: three round 7 × 7 pellets, each with a wood light highlight, a wood `#A9784F` body, a wood dark `#7E5638` shade and a plum outline. Bounding box: x 1 to 14, y 3 to 14.

### fx-heart (16 × 16)

- Job `b88d2dfc-88a8-4a72-bbf0-591754bf374d`, seed 104. **Chosen: candidate 9.**
- Prompt: "a small cute pink heart with a white shine highlight, floating love effect, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snapped, then cleaned by hand. The fill is pink `#F7B6C8`, with pink-deep shading on the lower right and a white and blush shine at the top left.

### fx-sparkle (16 × 16)

- Job `1a5f5b6c-b48c-4112-8310-3a229f54bef2`, seed 105. Candidate 0 was used for the colours.
- Prompt: "a small cute four-pointed twinkle sparkle star, butter yellow with a white centre, magic shine effect, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: redrawn. All candidates were round diamonds, not twinkles.
- Design: a four-point twinkle with arms of 5 px, tapering towards the tips. It is butter with a white centre, gold shading on the lower and right arms and a 1 px plum outline.

### fx-zzz (16 × 16)

- Job `d2ea89dd-6b6c-4d79-a981-28e23c445d7f`, seed 106. Candidate 6 was used for the style (lavender Z).
- Prompt: "the sleepy letters \"Zzz\", one big letter Z and two smaller letters z going up diagonally, lavender with dark plum outline, sleep effect, soft pastel, kawaii, clean pixel art, transparent background".
- Palette: redrawn. The small letters were unreadable, and a full outline filled in the letter gaps.
- Design: three letters rising to the right: Z 6 × 6, z 4 × 4 and z 3 × 3. Each has lavender `#D5C6EF` strokes, a white top bar, plum-soft inner shading and a plum drop shadow to the right and below. There is no full outline, so the letter shapes stay open. The sprite is always drawn over the dark sleep overlay, where it reads well.

### fx-rain-cloud (32 × 16)

- Job `ec9ce07e-07f3-4a3c-b71b-53c05bd0012e`, seed 107. **Chosen: candidate 9.**
- Prompt: "a small soft fluffy grey-lavender rain cloud with a few small light blue raindrops falling below it, sad weather effect, wide cloud, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snapped, then cleaned by hand.
- Manual fixes:
  - Kept the outline and the sad face (closed eyes, frown, blush).
  - The top bump was clipped at row 0, so it was closed and rounded.
  - The fill noise became light grey `#C9C6D3`, with a white top highlight and lavender and grey `#8E8A9A` bottom shading.
  - Few candidates had raindrops, and they were cut off, so five drops were added on rows 13 to 15 (sky `#A8D8F0` over blue `#6FA8D6`).

### icon-ball (16 × 16)

- Job `42b85050-2ab1-43ef-9496-c43664a1e224`, seed 111. **Chosen: candidate 29**, which has stripes and no face.
- Prompt: "a small round toy ball with a pink and butter yellow stripe, bouncy play ball icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snapped, then redrawn on the same layout. It has vertical butter and pink stripes, gold and pink-deep shading on the right and a white shine.

### icon-broom (16 × 16)

- Job `e1d22e13-61ef-47e0-b0aa-b1ee15303398`, seed 112. Candidate 2 was used for the colours.
- Prompt: "a small cleaning broom standing diagonally, wooden handle and straw bristles, broom icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: redrawn. The candidates had no outline and a very small head.
- Design: an upright broom with a 2 px wood handle, a pink-deep band, flared butter and straw bristles with gold tips, and a plum outline.

### icon-moon (16 × 16)

- Job `29c23969-41dd-48ee-b1f2-f201efc0ffbb`, seed 113. Candidate 0 was used for the pose.
- Prompt: "a crescent moon, butter yellow, sleep night icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: redrawn. The snapped candidate was noisy.
- Design: a crescent made from two circles. It is butter, with a gold inner edge, a plum outline and a small white star.

### icon-sun (16 × 16)

- Job `fc9a67ce-3b46-4525-8a3d-27439e201cad`, seed 114. No candidate was usable.
- Prompt: "a round sun with short rays all around, warm butter yellow and gold, wake up day icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: redrawn. Every candidate was a disc with black marks.
- Design: an 8 px butter disc with a white shine and gold shading, four 2 × 2 gold rays and four diagonal dot rays, all with a plum outline.

### icon-map (16 × 16)

- Job `bd4fee80-8545-4d1c-8663-436e60f0400b`, seed 115. No candidate was usable.
- Prompt: "a small folded treasure map, cream parchment paper with a dashed red path and an X mark, adventure map icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: redrawn. All candidates were unreadable pink blobs.
- Design: a folded map with three panels: cream, then fur shadow `#D9C8BA` in the middle, then cream. The top and bottom edges zigzag. A pink-deep dashed path leads to a coral `#E0707A` X.

### icon-hanger (16 × 16)

- Job `5797a349-de49-48b5-871e-ce27c3572ba3`, seed 116. Candidate 0 was used for the shape.
- Prompt: "a simple clothes hanger with a hook on top and a triangle shape, wardrobe icon, wooden hanger, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: redrawn on the same shape. It has a light grey hook, a wood light triangle, a wood bar and a plum outline.

### icon-gear (16 × 16)

- Job `f016c4aa-5a3e-441a-8b24-00ec2e44b88e`, seed 117. **Chosen: candidate 0.**
- Prompt: "a settings cog gear wheel with teeth and a hole in the middle, lavender and grey, settings icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snapped to lavender, purple, plum, white, plum-soft and light grey, with the outer edge forced to plum. The fill was then re-shaded by position: white where x + y ≤ 8, purple `#9B6BB8` where x + y ≥ 20 and lavender elsewhere.

### adventure-garden-stroll (32 × 32)

- Job `ba99451b-5a3e-419c-9383-ec7111409632`, seed 121. **Chosen: candidate 20.**
- Prompt: "two cute pink and butter yellow tulips with green leaves growing from a small patch of grass, garden stroll adventure icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snap. No manual fixes. 9 colours.

### adventure-beach-day (32 × 32)

- Job `2c83bd0b-b4e8-416b-813c-10918f2dcab5`, seed 122. **Chosen: candidate 25** (sandcastle with a heart flag).
- Prompt: "a cute little sandcastle with a tiny pink flag on top, a small blue wave and a seashell beside it, beach day adventure icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snap. The peach sand became butter `#FBE7A1` with straw shading. A pale cream mapping was also tried, but it looked washed out on the cream cards. No manual fixes.

### adventure-bakery-shift (32 × 32)

- Job `95648ef8-943e-4e8b-aa51-9f6be2f73395`, seed 123. **Chosen: candidate 36** (slice of carrot cake).
- Prompt: "a slice of cute carrot cake with cream frosting layers and a tiny orange carrot decoration on top, bakery shift adventure icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snap with overrides on rows 12 to 31 only, so the carrot on top stays orange. The overrides are `de895b`, `df7747` and `e6814b` to wood light; `b6623f`, `c9774f`, `c56d44` and `ad6444` to wood; and `a65638` to wood dark. A plain snap made the sponge a harsh dark orange.

### adventure-office-job (32 × 32)

- Job `c8c1e904-843c-49c4-bf10-189038cd360f`, seed 124. **Chosen: candidate 4** (laptop with a pink screen, coffee mug and papers).
- Prompt: "a small open laptop with a pink screen next to a steaming coffee mug and a stack of papers, office job adventure icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snap. No manual fixes. 12 colours.

### adventure-wizard-school (32 × 32)

- Job `ea37804b-94c0-427a-8757-e366fcb35a84`, seed 125. **Chosen: candidate 56** (purple spellbook with a star and a star wand).
- Prompt: "a cute purple spellbook with a gold star on the cover and a small magic wand with a star tip beside it, sparkles, wizard school adventure icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snap. No manual fixes. 11 colours.

### adventure-pirate-voyage (32 × 32)

- Job `a1e73137-d7b2-4865-b0d8-595e2045519a`, seed 126. **Chosen: candidate 29** (open chest with gold coins).
- Prompt: "a small cute wooden treasure chest, slightly open, with gold coins and a pearl peeking out, pirate voyage adventure icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snap with overrides, because a plain snap turned the wood grey. The overrides are `f7ce88` and `f3c07e` to gold `#F2C14E`; `e5ae78` to straw; `c9908b` and `9e676d` to wood; `d6a397` to wood light; and `8e5c62` to wood dark.

### adventure-epic-quest (32 × 32)

- Job `3f73228e-7a76-40e1-8bc0-dbe929b31c89`, seed 127. **Chosen: candidate 4** (gold ring in front of a volcano with an orange glow).
- Prompt: "a shiny gold ring floating in front of a small rounded volcano mountain with a little orange glow at the top, epic quest adventure icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snap. The volcano became dull grey-brown rock. No manual fixes.

### adventure-space-mission (32 × 32)

- Job `a13b0b1a-32c2-4f0f-9d26-d79a97fddca9`, seed 128. **Chosen: candidate 8** (diagonal pink and white rocket with a flame and stars).
- Prompt: "a cute little white and pink rocket ship with a round blue window and a small orange flame, flying upward, with two tiny stars, space mission adventure icon, centred, dark plum outline, soft pastel shading, kawaii, clean pixel art, transparent background".
- Palette: snap. No manual fixes. 17 colours.

### Review

- `npm run check:sprites` reports all 22 files at the correct sizes.
- The palette check shows every file in palette, with no semi-transparent pixels.
- Screenshots were checked in the gallery (4× grid and live scenes with the feed, play, clean and medicine animations), on the home screen (icons at 2×) and on the adventures screen (icons at 2×).

## Adventure scenes (PSD 1.2)

Eight 128 x 128 backgrounds, `scene-<adventureId>.png`, made on 2026-10-07. 220 generations in total.

- **Generation:** `create_image_pro`, 128 x 128, opaque, 4 candidates per call, 20 generations each. Style image `src/assets/sprites/room.png` with `style_copy` `["color_palette", "shading"]`. Reference image: a flat layout sketch (backdrop to row 89, ground line on rows 90 to 93, ground from row 94, a pale oval centred at (64, 113)) with usage "composition and layout only: keep the backdrop down to row 89, the ground line on rows 90 to 93, ground from row 94, and keep the light oval patch at the bottom centre empty and plain". Every prompt starts "cozy cute pixel art background scene for a pet bunny game, front view:" and ends "an empty patch ... in the centre bottom where a small character will sit, soft pastel colours, low contrast in the centre, dark plum outlines on objects, no characters, no animals, clean pixel art".
- **Ground fill:** every candidate copied the sketch's oval as a blank patch, so it was replaced with `inpaint_image_pro_flash` (6 generations each, "Modify current layer") using an elliptical mask centred at (64, 113), 82 x 34 px, and a prompt describing that scene's ground ("plain soft green grass lawn continuing evenly ...", "the checkered tile floor continuing evenly ...", and so on).
- **Clean-up (scratch script):** some fills left a thin curve where the oval's edge had been. Inside the fill area, clusters of colours that are uncommon in the ground of the same rows and at least 20 px wide were repainted with the most common nearby ground colour. On the pirate deck this would have erased the treasure chest, so only the leftover cream oval corners on rows 118 to 127 were repainted. Epic Quest needed no clean-up.
- **Palette:** nearest palette colour in CIELAB for garden, office, wizard school, pirate, epic quest and space; nearest by "redmean" RGB distance for beach and bakery, which kept the beach's pink sky and yellow sand and the bakery's checkered floor.

| Scene | Job | Chosen | Fill job |
|---|---|---|---|
| garden-stroll (tulips, picket fence, watering can) | `0e3b5eca-9ccb-47a5-b688-7f142c446322` | 1 | `5d95ff4d-96a6-4e5d-8643-bb833e4897e6` |
| beach-day (umbrella, sandcastle, shells) | `16f33a91-f547-488d-9472-7dd981546f1b` | 1 | `aa1dccae-60a2-4c5f-915d-8fc354650ba6` |
| bakery-shift (bread shelves, carrot cake, oven) | `39831868-23fa-4117-bab9-6417b67a41d5` | 0 | `978d9ff0-a2d1-44af-aec2-d7134bbe5783` |
| office-job (desk, computer, mug, plant, city window) | `f1dee591-ba7c-4709-a20e-d8f4198b1d95` | 1 | `8b2b41b3-8942-475a-8693-0beabf17d9ee` |
| wizard-school (bookshelf, moon window, candles, potions, owl) | `42597d09-ffc2-4eb0-8de3-2bcd80dd4c69` | 0 | `de4c341d-6357-4021-87a8-e3c48344ab00` |
| pirate-voyage (sail, mast, chest, barrel, sea) | `1f320769-1c31-48bb-8453-51d9f8bc8097` | 0 | `5290453f-a6bc-4e4d-a5e9-a947995b9add` |
| epic-quest (path through hills to a smoking volcano) | `78e17696-3063-45b2-a6e0-fce99d10b405` | 3 | `afc6bc31-0b75-4f6f-9f91-dbf550cc049f` |
| space-mission (moon ground, ringed planet, Earth, rocket) | `ecfad0e6-6844-438c-b8ca-404946f0ef59` | 1 | `c5a73d00-bbae-4d0f-b87b-a38687d3c2dd` |

Raw candidates are in `art/raw/scenes/<scene>-<index>.png`, fills in `<scene>-filled.png`, and cleaned versions before palette mapping in `<scene>-clean.png`.
