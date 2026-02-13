# Garlic Tiger — Full Game Implementation Prompt

## Project Overview

**Garlic Tiger** (마늘 호랑이) is a Pokemon-style browser game built with **Phaser 3 + Vite**. A tiger from the Korean Dangun myth tries to become Korean by experiencing modern Korean culture and collecting 5 garlics. The game's visual style is **Pokemon FireRed/LeafGreen (GBA Gen 3)** — NOT Game Boy Color.

**Purpose**: Viral entertainment game. Non-commercial. No coupon, no monetization. "Made by LocalNomad" credit only.

---

## CRITICAL: Style Migration (GBC → GBA)

The existing codebase was built for Pokemon Gold (GBC) style. You MUST migrate everything to **Pokemon Gen 3 (GBA FireRed/LeafGreen)** style:

### Resolution Change
- **OLD**: 160×144 (GBC) with 8×8 tiles and 16×16 sprites
- **NEW**: 240×160 (GBA) with 16×16 tiles and 32×32 sprites
- Update `src/config.js`: `WIDTH: 240`, `HEIGHT: 160`, `TILE: 16`, `SPRITE: 32`
- Update `MAP_VIEW_COLS` and `MAP_VIEW_ROWS` accordingly (15 cols × 10 rows)
- Update `index.html` and `style.css` for the new aspect ratio

### Visual Style Change
- **OLD**: Pokemon Gold cream background (#F0E0D0), 4-color palette restrictions, GBC aesthetic
- **NEW**: Full-color GBA palette, brighter colors, white/light backgrounds, richer detail
- Update `main.js` backgroundColor to white or light gray
- Remove/replace `src/data/palettes.js` (GBC palettes no longer needed)
- Remove/replace `src/data/spriteData.js` (procedural sprites replaced by real PNGs)
- Remove/replace `src/utils/TileRenderer.js` (procedural tile rendering replaced by tileset images)

---

## Asset Integration

All assets are already downloaded and organized in `/assets/`. Replace ALL procedural graphics with these real image assets.

### Folder Structure
```
assets/
├── korean/              # Nano Banana AI-generated Korean-specific props
│   ├── garlic.png       # 3 garlic versions (whole, peeled, golden glowing)
│   ├── hanok gate.png   # Korean traditional gate (dancheong colors)
│   ├── 포장마차.png      # Korean street food cart
│   ├── chicken pcpang.png  # 치킨집 + PC방 buildings
│   ├── convenience-store.png  # Korean convenience store
│   ├── npc.png          # 5 Korean NPCs (아줌마, 아저씨, 배달기사, 여대생, 할머니)
│   ├── food-items.png   # Korean food items (소주, 맥주, 치킨, 떡볶이, etc.)
│   ├── elevator.png     # Elevator interior (for Quiz 2)
│   └── flexible neck.png  # Tiger transformation stage
├── tiger/
│   ├── tiger_overworld.png  # 128×128 sprite sheet (4 dirs × 4 frames, 32×32 each)
│   ├── tiger_original_v1.png  # Reference only
│   └── tiger_original_v2.png  # Reference only
├── tilesets/            # DeviantArt Gen 3 community tilesets (non-commercial)
│   ├── ekat_s_mega_gen_3_set_by_ekat99_deh8jtt.png  # PRIMARY outdoor tileset
│   ├── _free__new_tiles_mastersheet_by_magiscarf_daq6lcu.png  # Supplementary
│   ├── brick_city_by_ekat99_detatok.png  # City tiles
│   ├── city_tiles_by_magiscarf_dbmaxoo.png  # City tiles
│   ├── apartment_building_tiles_01_by_j_treecko252_dexy3pk.png  # Apartments
│   ├── skyscraper_tiles_01_by_j_treecko252_dexy3w5.png  # Tall buildings
│   ├── gatehouse_by_ekat99_delg49i.png  # Gate exterior
│   ├── gatehouse_interior_by_ekat99_delg47t.png  # Gate interior
│   ├── basic_interior_collection_by_ekat99_depkwpd.png  # Interiors
│   ├── brick_cafe_by_ekat99_dep4gnf.png  # Cafe interior
│   ├── park_tileset_by_ekat99_deh8jen.png  # Park/nature
│   ├── sign_tiles_by_j_treecko252_demq2hh.png  # Signs
│   ├── misc_pokemon_tiles_by_ekat99_dekfn6f.png  # Misc objects
│   └── ... (more tilesets)
├── itch-io/             # Supplementary (may not match Gen 3 style)
└── unused/              # GBC-style assets (DO NOT USE)
```

### Tiger Sprite Sheet Format
The file `tiger/tiger_overworld.png` is a 128×128 PNG:
- 4 rows: DOWN, UP, LEFT, RIGHT
- 4 columns: walk animation frames
- Each frame: 32×32 pixels
- Transparent background (alpha channel)
- Load with `this.load.spritesheet('tiger', 'assets/tiger/tiger_overworld.png', { frameWidth: 32, frameHeight: 32 })`

### Korean Props (Nano Banana Generated)
These are AI-generated images at various resolutions. They need to be:
1. Loaded as images (not sprite sheets)
2. Cropped/scaled at runtime to fit the game world (16px tiles)
3. Some contain multiple versions in a grid — extract the best one programmatically or use the whole image as a texture and draw a sub-region

### Tileset Processing
The DeviantArt tilesets are standard Pokemon Gen 3 format:
- 16×16 pixel tiles arranged in grid sheets
- Use Phaser's tilemap system OR extract individual tiles at load time
- PRIMARY tileset for outdoor: `ekat_s_mega_gen_3_set_by_ekat99_deh8jtt.png`
- The existing procedural `mapData.js` tile indices will NOT match — you need to create a new map using the actual tileset tile indices
- **Recommended approach**: Define the overworld map as a 2D array referencing tileset coordinates, then render using Phaser's tilemap or a custom renderer that draws from the tileset image

---

## Quiz Data — MUST Match Game Design Doc

**IMPORTANT**: The current `src/data/quizData.json` does NOT match the authoritative game design in `docs/GAME_DESIGN_DOC.md`. You MUST rewrite quizData.json to match the design doc EXACTLY. All dialogue must be **bilingual (Korean first, English below)**.

### The 5 Quizzes (from GAME_DESIGN_DOC.md):

**Quiz 1: 식당 아줌마 — "내가 쏠!"** (Restaurant)
- Location: Restaurant building
- NPC: 곱슬 파마 아줌마 with apron
- Question: "자, 누가 낼 거야? / So... who's paying?"
- A: 카카오페이로 1/N 하자 / Let's split it equally on KakaoPay
- B: 나는 내가 먹은 것만 낼게... / I'll just pay for what I ordered...
- **C: 내가 쏠! / I got this one!** ← CORRECT
- Transformation 1: Flexible neck (자동 꾸벅 인사)

**Quiz 2: 엘리베이터 — 빨리빨리** (Apartment)
- Location: Apartment building → elevator interior
- NPC: None (situation quiz)
- Question: "다음으로 해야 할 일은? / What do you do next?"
- A: 기다린다. 자동으로 닫히겠지. / Wait. It'll close automatically.
- B: 닫힘 버튼을 한 번 누른다. / Press the close button once.
- **C: 닫힘 버튼이 닳아 없어질 때까지 연타한다. / Mash the close button until it wears out.** ← CORRECT
- Transformation 2: Fur shedding (매끈해짐)

**Quiz 3: 지하철 할머니 — 어르신 공경** (Subway)
- Location: Subway station
- NPC: 등산 풀장비 할머니
- Question: "할머니가 너를 쳐다보고 계신다. 어떻게 할래? / She's eyeing you. What do you do?"
- A: 눈 피하고 자는 척한다 / Avoid eye contact, pretend to sleep
- B: 이어폰 끼고 K-pop 볼륨 올린다 / Put on headphones, turn up the K-pop
- **C: 할머니, 짐 들어드릴까요? / Excuse me, halmeoni. Can I help you with your bag?** ← CORRECT
- Transformation 3: "TH" pronunciation impossible ("Three" → "Seuree")

**Quiz 4: 치킨집 — 눈치** (Chicken Restaurant)
- Location: 치킨집
- NPC: Friends at table
- Question: "마지막 한 조각. 어떻게 할래? / The last piece. What do you do?"
- A: 맛있게 먹는다! 아까우니까. / Eat it! Can't let it go to waste.
- **B: "아 나 배불러~" 하면서 안 먹는다. / "아 I'm so full~" and don't eat it.** ← CORRECT
- C: "야 너 먹어" 하고 남한테 양보한다. / "Here, you eat it" and offer to someone.
- Transformation 4: Shorter limbs, longer torso

**Quiz 5: 친구 — 한국어 응답 체계** (Cafe)
- Location: Cafe
- NPC: Korean friend
- Question: "안 간다. 뭐라고 대답해야 할까? / You're not going. How should you answer?"
- **A: 응, 안 가. / Yes, I'm not going. (Korean way)** ← CORRECT
- B: 아니, 안 가. / No, I'm not going. (English way)
- C: 음... 아직 모르겠어. / Hmm... not sure yet.
- Transformation 5: Black hair (FINAL TRANSFORMATION)

### Wrong Answer Handling
- NO game over on wrong answers
- NPC gives humorous feedback (bilingual)
- Show "다시 해볼래? / Try again?" prompt
- "응!" → retry same quiz
- "나중에..." → return to overworld, can revisit later
- Track wrong answer count per quiz for end screen

---

## Game Flow — Scene by Scene

### 1. BootScene
- Load all assets (tilesets, sprites, Korean props, fonts)
- Show "LocalNomad" logo briefly (text only is fine)
- Preload Google Font "Press Start 2P"
- Transition to TitleScene

### 2. TitleScene
- "GARLIC TIGER" title text (large, centered)
- "마늘 호랑이" subtitle
- Tiger sprite idle animation below title
- "PRESS START" blinking text
- If URL has `?stage=X` parameter, show shared tiger state
- Background: simple or patterned (Gen 3 style title screen)

### 3. IntroScene
- Black background, text appears line by line (typewriter effect)
- Full Dangun myth opening from GAME_DESIGN_DOC.md (bilingual)
- Each text block: Korean line first, then English translation below
- Player presses A/Space/tap to advance each block
- After story → transition to Overworld

### 4. OverworldScene — THE MAIN GAME MAP
This is the most complex scene. Build a scrolling top-down map with 5 quiz locations.

**Map Layout** (from GAME_DESIGN_DOC.md):
```
┌──────────────────────────────────┐
│                                  │
│   [식당/Restaurant]  [아파트/Apt] │
│                                  │
│          [지하철역/Subway]        │
│                                  │
│   [치킨집/Chicken]   [카페/Cafe] │
│                                  │
│        ★ Start Position          │
│                                  │
└──────────────────────────────────┘
```

**Rendering approach**:
- Use the primary tileset (`ekat_s_mega_gen_3_set_by_ekat99_deh8jtt.png`) for ground, paths, trees, fences
- Use building tilesets for the 5 locations
- Use Korean props (chicken pcpang.png, convenience-store.png, etc.) as overlay sprites for Korean-specific buildings
- Create a map array (at least 30×30 tiles) with tile indices
- Implement camera follow (Phaser camera follows tiger)
- 4-directional grid movement (16px per tile step)

**Buildings & Interaction**:
- Each building has a door tile or interaction zone
- Walk up to door + press A → enter building → start quiz scene
- Use Korean prop images as building facades where available
- Cleared locations: NPC says "이미 마늘을 받았잖아! / You already got the garlic!"

**Overworld Mini-Events** (between locations):
- Signs: "성수동 방면 →", "강남 ↓" — press A to read (bilingual)
- Vending machine: press A → "바나나맛 우유 획득! / Got banana milk!" message
- Pigeon flock: scatter animation when tiger walks near
- Flyer ajumma: walk near → "전단지요~" speech bubble
- Convenience store: enter → "삼각김밥의 유혹을 느낀다... / Feeling the temptation of triangle gimbap..."

**Tiger Visual Changes on Overworld**:
After each quiz, the tiger sprite should visually change. Since we only have the base tiger sprite sheet currently, implement a sprite-swap system:
- Store the current transformation stage (0-5) in StateManager
- Have a mapping: stage → sprite sheet key
- For now, use the same base sprite for all stages (placeholder)
- The system must be ready to swap in new sprites later when they're created
- Apply visual effects as fallback: tint changes, scale adjustments, particle effects

### 5. QuizScene
- Pokemon battle-style layout (NPC on top, tiger on bottom)
- Show NPC dialogue sequence first (typewriter, bilingual)
- Then show the question with 3 choices (A/B/C)
- Pokemon-style selection cursor (arrow indicator)
- Keyboard (arrow keys + A/Space) and touch/click input
- On correct: celebration effect → show feedback → garlic collect animation → transition to TransformScene
- On wrong: show feedback → "Try again?" prompt → retry or exit to overworld

**Dialog Box Style** (Gen 3):
- White background with 2px black border
- Bottom of screen, full width
- "Press Start 2P" font at appropriate size for 240×160
- Typewriter text reveal
- ▼ indicator for "press to continue"

### 6. TransformScene
- Pokemon evolution-style sequence
- Screen flash white
- Tiger sprite morphs (scale up → flash → show new form)
- Bilingual transformation text from GAME_DESIGN_DOC.md
- "What?! The tiger's [body part]... is [changing]?!"
- Show garlic count update (X/5)
- Return to overworld after animation

### 7. VictoryScene (5/5 garlics collected)
- Epic transformation sequence
- Full-size tiger final form display
- "축하합니다! / Congratulations!" text
- "호랑이가 한국인이 되었습니다! / The tiger has become Korean!" text
- Transition to result card

### 8. GameOverScene → Result Card + Share
This is actually the RESULT/SHARE screen (rename from GameOverScene if needed):

**Result Card Display**:
```
┌─────────────────────────┐
│     나의 호랑이 / My Tiger │
│                          │
│    [Tiger sprite]        │
│                          │
│    한국인화: X/5          │
│    Korean Level: X/5     │
│                          │
│  ✓ Unlocked abilities    │
│                          │
│  X번 만에 한국인 달성!     │
│  Became Korean in X tries│
│                          │
│  [Share]                 │
│  Made by LocalNomad      │
└─────────────────────────┘
```

**Stage-specific share messages** (from GAME_DESIGN_DOC.md):
- 0/5: "아직 100% 호랑이. 한국은 먼 나라..."
- 1/5: "고개는 숙일 줄 안다"
- 2/5: "빨리빨리 체질이 되어가는 중"
- 3/5: "TH 발음은 포기했다"
- 4/5: "거의 한국인인데... 아직 1개 남았다"
- 5/5: "호랑이에서 한국인이 되었습니다 🐯"

**Share functionality**:
- Generate shareable URL with `?stage=X` parameter
- Web Share API (mobile) + clipboard fallback
- Share text includes the stage message + game URL
- **NO coupon button** — removed from design

### 9. ScrollScene — REMOVE or SIMPLIFY
The original ScrollScene was for email capture + coupon. Since we removed the coupon:
- Either remove ScrollScene entirely
- Or simplify to just show the "Made by LocalNomad" credit with a link
- DO NOT implement email capture (Airtable integration not needed)

---

## Technical Specifications

### State Management (`src/utils/StateManager.js`)
Track these values:
```javascript
{
  garlicsCollected: 0,        // 0-5
  transformationStage: 0,     // 0-5
  completedQuizzes: [],       // array of quiz IDs [1,2,3...]
  wrongAnswerCounts: {},       // { quizId: count }
  totalWrongAnswers: 0,
  playerPosition: { x, y },   // overworld position
  gameCompleted: false,
}
```

### Input System
- **Desktop**: Arrow keys for movement, Space/Enter/Z for confirm (A button), X/Esc for cancel (B button)
- **Mobile**: On-screen D-pad + A/B buttons (overlay on game canvas)
- Touch support for menu selection (tap on choices)

### Audio (`src/utils/AudioManager.js`)
- Keep the Web Audio API approach for 8-bit sound effects
- Key sounds: menu select, text advance, correct answer, wrong answer, garlic collect, transformation jingle, walking footsteps
- Background music: simple looping chiptune (optional, can be added later)
- All audio should be Gen 3 style (slightly richer than GBC but still retro)

### Font
- "Press Start 2P" from Google Fonts
- Preload in BootScene
- For bilingual text: Korean characters may not render in Press Start 2P — use a fallback like "DungGeunMo" (둥근모) or system sans-serif for Korean lines, Press Start 2P for English lines

### Deployment
- Vite build → static files
- Deploy to Vercel
- Remove `api/subscribe.js` (email capture removed)
- Remove Airtable environment variables from vercel.json
- Keep vercel.json for routing only

---

## Files to Create/Modify

### Must Rewrite (existing but wrong style):
- `src/config.js` — Resolution 240×160, tile size 16, sprite size 32
- `src/main.js` — Update game config, remove GBC references
- `src/data/quizData.json` — Match GAME_DESIGN_DOC.md exactly (bilingual)
- `src/data/mapData.js` — New overworld map using real tileset indices
- `src/scenes/BootScene.js` — Load real image assets instead of procedural generation
- `src/scenes/TitleScene.js` — Gen 3 style title screen
- `src/scenes/IntroScene.js` — Bilingual Dangun myth text
- `src/scenes/OverworldScene.js` — Real tileset rendering, building interaction, mini-events
- `src/scenes/QuizScene.js` — Match design doc quizzes, bilingual dialogue, retry system
- `src/scenes/TransformScene.js` — Match design doc transformations
- `src/scenes/VictoryScene.js` — Result card with share (no coupon)
- `src/scenes/GameOverScene.js` — Convert to share/result card (or merge with VictoryScene)
- `src/objects/Tiger.js` — Load real sprite sheet, transformation stage system
- `src/objects/DialogueBox.js` — Gen 3 style dialog, bilingual support
- `src/utils/TileRenderer.js` — Replace with tileset-based renderer or remove entirely
- `src/utils/StateManager.js` — Add completedQuizzes, wrongAnswerCounts
- `src/utils/ShareManager.js` — Remove coupon, keep share functionality

### May Remove:
- `src/data/palettes.js` — GBC palette system (not needed for Gen 3)
- `src/data/spriteData.js` — Procedural sprite definitions (replaced by real PNGs)
- `src/scenes/ScrollScene.js` — Email capture scene (no longer needed)
- `api/subscribe.js` — Airtable email API (no longer needed)
- `.env.local` — Airtable keys (no longer needed)

### Update:
- `index.html` — Viewport meta for 240×160, update title
- `style.css` — Scale game canvas appropriately
- `vercel.json` — Remove API function routing
- `CLAUDE.md` — Update to reflect Gen 3 style and removed coupon

---

## Implementation Order (Recommended)

1. **Config & Setup**: Update config.js, main.js, index.html for 240×160 GBA resolution
2. **Asset Loading**: Rewrite BootScene to load all real image assets
3. **Tiger Object**: Rewrite Tiger.js to use real sprite sheet with transformation stage system
4. **Dialog System**: Rewrite DialogueBox.js for Gen 3 style with bilingual support
5. **Title & Intro**: Simple scenes, good for testing the new resolution
6. **Overworld Map**: The hardest part — tileset rendering, map layout, camera, movement, building interaction
7. **Quiz System**: Rewrite QuizScene with correct design doc content, retry logic
8. **Transform Scene**: Evolution-style animation sequences
9. **Victory & Share**: Result card, share functionality, stage messages
10. **Polish**: Mini-events, sound effects, mobile controls, visual effects

---

## Key Reminders

- **ALL text is bilingual**: Korean first (larger or same size), English below (can be slightly smaller/dimmer)
- **NO coupon**: Remove all references to coupons, Airtable, email capture
- **NO game over**: Wrong answers allow retry, never block progress
- **Free exploration**: Player can visit 5 locations in any order
- **"Made by LocalNomad"**: Show credit on title screen and result card with link to localnomad.club
- **Mobile-first**: Game must work well on phone browsers (touch controls essential)
- **Keep it fun**: The humor in the quiz dialogue is the viral hook — preserve the Korean cultural comedy exactly as written in the design doc
- **Tiger transformation sprites are placeholder**: Use base tiger for all 5 stages for now, but build the swap system so new sprites can be dropped in later

---

## Reference Files

- **Game Design**: `docs/GAME_DESIGN_DOC.md` — THE authoritative source for all game content
- **Project Guide**: `CLAUDE.md` — Technical setup info (needs updating for Gen 3)
- **Assets**: `assets/` folder — All organized image assets ready to use
