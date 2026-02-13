# Garlic Tiger — Agent Team Build Prompt (Gen 3 / GBA)

You are the **Orchestrator** for building the Garlic Tiger game. You coordinate multiple subagents (via the Task tool) working in parallel phases. Each agent has strict file ownership — never let two agents write to the same file.

---

## TERMINAL: Pre-flight Setup

Run these commands FIRST before starting any agent work:

```bash
# 1. Navigate to project and verify structure
cd garlicGame && ls -la src/ assets/

# 2. Install dependencies
npm install

# 3. Verify Phaser is installed
node -e "const p = require('phaser'); console.log('Phaser OK')"

# 4. Install image processing tools (for Agent B asset pipeline)
pip install Pillow --break-system-packages 2>/dev/null || pip3 install Pillow --break-system-packages

# 5. Create processed assets output directory
mkdir -p assets/processed/korean

# 6. Verify dev server works (quick test, kill after 5s)
timeout 5 npx vite --port 3000 2>&1 | head -5 || echo "Vite check done"

# 7. Back up current source before rewrite
cp -r src/ src_backup_$(date +%Y%m%d)/
```

---

## PROJECT CONTEXT

**Garlic Tiger** (마늘 호랑이) is a Pokemon-style browser game (Phaser 3 + Vite). A tiger from the Korean Dangun myth tries to become Korean by experiencing modern Korean culture and collecting 5 garlics.

- **Visual style**: Pokemon FireRed/LeafGreen (GBA Gen 3) — NOT Game Boy Color
- **Resolution**: 240x160 (GBA), tiles 16x16, sprites 32x32
- **Purpose**: Non-commercial viral entertainment. No coupon, no monetization. "Made by LocalNomad" credit only.
- **Dialogue**: ALL text bilingual — Korean first, English below
- **Authoritative game content**: `docs/GAME_DESIGN_DOC.md`

The existing codebase was built for Pokemon Gold (GBC) style and needs complete migration to Gen 3.

---

## ARCHITECTURE OVERVIEW

```
                    ┌──────────────────┐
                    │   ORCHESTRATOR   │
                    │   (You = Main)   │
                    └────────┬─────────┘
                             │
        Phase 1: Foundation ─┤── 3 agents in PARALLEL
        Phase 2: Core Systems┤── 3 agents in PARALLEL
        Phase 3: Scenes ─────┤── 3 agents in PARALLEL
        Phase 4: Integration ─── 1 agent, sequential
```

**CRITICAL RULES:**
1. Launch all agents within a phase using a SINGLE message with multiple Task tool calls (subagent_type: "general-purpose")
2. Wait for ALL agents in a phase to complete before starting next phase
3. After each phase, run the Gate Check commands to verify no errors
4. Each agent has FILE OWNERSHIP — agents must NOT touch files outside their list
5. Tell each agent to read `docs/GAME_DESIGN_DOC.md` for authoritative game content

---

## PHASE 1: Foundation (3 agents in parallel)

---

### Agent A — Config & Project Setup

```
ROLE: Update project configuration from GBC (160x144) to GBA (240x160).

FILE OWNERSHIP (only touch these files):
- src/config.js
- src/main.js
- index.html
- style.css
- vercel.json
- CLAUDE.md

TASKS:

1. REWRITE src/config.js:
   - WIDTH: 240, HEIGHT: 160 (GBA resolution)
   - TILE: 16, SPRITE: 32
   - MAP_VIEW_COLS: 15, MAP_VIEW_ROWS: 10
   - WALK_PX_PER_FRAME: 2, WALK_FRAMES: 8 (16px per tile)
   - Remove ENCOUNTER_MIN_STEPS and ENCOUNTER_CHANCE (no random encounters — fixed locations)
   - Add QUIZ_LOCATIONS object mapping location names to grid positions
   - Keep SCENES object, BRANDING, FONT settings
   - Update TILE type constants for Gen 3 tileset compatibility
   - Update SOLID_TILES accordingly

2. REWRITE src/main.js:
   - backgroundColor: 0xFFFFFF (white, not GBC cream)
   - Remove ScrollScene from scene array (email capture removed)
   - Keep all other scenes, physics, input, render, scale settings
   - Keep mobile touch prevention and visibility change handlers

3. UPDATE index.html:
   - <title>: "Garlic Tiger | 마늘 호랑이"
   - Viewport meta: width=device-width, initial-scale=1
   - Add Google Fonts: Press Start 2P + Galmuri11 (Korean pixel font)
   - Remove any Airtable or email-related scripts

4. UPDATE style.css:
   - Game container max-width for 240x160 ratio (480x320 at 2x, 720x480 at 3x)
   - Background: #111 (dark contrast)
   - image-rendering: pixelated on canvas

5. UPDATE vercel.json:
   - Remove "functions" and "routes" for api/subscribe
   - Keep basic config

6. UPDATE CLAUDE.md:
   - All references: GBC/Gold -> GBA/FireRed-LeafGreen
   - Resolution: 240x160, Tile: 16x16, Sprite: 32x32
   - Remove coupon/email/Airtable references
   - Add: "Non-commercial. Free tilesets under non-commercial license."
```

---

### Agent B — Asset Processing Pipeline

```
ROLE: Process raw image assets into game-ready formats using Python/Pillow.

FILE OWNERSHIP:
- assets/processed/* (create all outputs here)
- src/data/assetManifest.js (NEW file)

DO NOT touch src/scenes/, src/objects/, src/utils/, or any other src/ files.

TASKS:

1. ANALYZE PRIMARY TILESET:
   Open assets/tilesets/ekat_s_mega_gen_3_set_by_ekat99_deh8jtt.png with Pillow.
   Calculate grid dimensions (width/16, height/16).
   Visually inspect tile positions and create a reference map.
   Output: assets/processed/tileset_map.json
   {
     "tileWidth": 16, "tileHeight": 16,
     "cols": N, "rows": N,
     "tiles": {
       "grass_1": {"col": X, "row": Y},
       "path_h": {"col": X, "row": Y},
       "tree_top": {"col": X, "row": Y},
       "water": {"col": X, "row": Y},
       "door": {"col": X, "row": Y},
       ... (map all useful tile types)
     }
   }

2. PROCESS KOREAN PROP IMAGES (assets/korean/):
   For each image, use Python/Pillow to:
   a. Detect and remove gray/white background (make transparent)
   b. If image contains a grid of items, auto-detect and extract individual sprites
   c. Crop to content bounds, resize to game-appropriate size
   d. Save to assets/processed/korean/

   Specific outputs:
   - garlic.png -> garlic_item.png (32x32, the golden glowing version)
   - npc.png -> npc_ajumma.png, npc_ajussi.png, npc_delivery.png, npc_student.png, npc_grandma.png
   - food-items.png -> soju.png, beer.png, chicken_food.png, tteokbokki.png (16x16 or 32x32)
   - hanok gate.png -> hanok_gate.png (3-4 tiles wide)
   - chicken pcpang.png -> chicken_shop.png, pc_bang.png (separate buildings)
   - convenience-store.png -> conv_store.png (cropped)
   - 포장마차.png -> pojangmacha.png (cropped)
   - elevator.png -> elevator_bg.png (cleaned for quiz background)

3. CREATE src/data/assetManifest.js:
   ```javascript
   export const ASSET_MANIFEST = {
     tilesets: {
       primary: { key: 'tileset_primary', path: 'assets/tilesets/ekat_s_mega_gen_3_set_by_ekat99_deh8jtt.png' },
       buildings: { key: 'tileset_buildings', path: 'assets/tilesets/brick_city_by_ekat99_detatok.png' },
       apartments: { key: 'tileset_apts', path: 'assets/tilesets/apartment_building_tiles_01_by_j_treecko252_dexy3pk.png' },
       park: { key: 'tileset_park', path: 'assets/tilesets/park_tileset_by_ekat99_deh8jen.png' },
       signs: { key: 'tileset_signs', path: 'assets/tilesets/sign_tiles_by_j_treecko252_demq2hh.png' },
       cafe: { key: 'tileset_cafe', path: 'assets/tilesets/brick_cafe_by_ekat99_dep4gnf.png' },
       misc: { key: 'tileset_misc', path: 'assets/tilesets/misc_pokemon_tiles_by_ekat99_dekfn6f.png' },
     },
     sprites: {
       tiger: { key: 'tiger', path: 'assets/tiger/tiger_overworld.png', frameWidth: 32, frameHeight: 32 },
     },
     korean: {
       garlic: { key: 'garlic', path: 'assets/processed/korean/garlic_item.png' },
       npc_ajumma: { key: 'npc_ajumma', path: 'assets/processed/korean/npc_ajumma.png' },
       npc_grandma: { key: 'npc_grandma', path: 'assets/processed/korean/npc_grandma.png' },
       // ... all processed korean assets
     },
     tilemap: { key: 'tilemap_data', path: 'assets/processed/tileset_map.json' },
   };
   ```

4. VERIFY all outputs exist and are valid PNG:
   Python script to check each file in assets/processed/.
```

---

### Agent C — Quiz Data & All Game Text

```
ROLE: Rewrite all game text data to match GAME_DESIGN_DOC.md exactly, bilingual Korean-English.

FILE OWNERSHIP:
- src/data/quizData.json (REWRITE)
- src/data/storyText.js (NEW)
- src/data/overworldText.js (NEW)
- src/data/shareText.js (NEW)

DO NOT touch any scene files, config, or other data files.

IMPORTANT: Read docs/GAME_DESIGN_DOC.md first. Copy ALL text verbatim from there.

TASKS:

1. REWRITE src/data/quizData.json — All 5 quizzes from GAME_DESIGN_DOC.md:
   Each quiz must have this structure:
   {
     "id": N, "location": "...", "npcKey": "...",
     "npcName": { "ko": "...", "en": "..." },
     "dialogueSequence": [{ "ko": "...", "en": "..." }, ...],
     "question": { "ko": "...", "en": "..." },
     "choices": [{ "id": "A", "ko": "...", "en": "..." }, ...],
     "correct": "X",
     "wrongFeedback": { "ko": "...", "en": "..." },
     "correctFeedback": { "ko": "...", "en": "..." },
     "transformation": {
       "stage": N,
       "title": { "ko": "...", "en": "..." },
       "description": { "ko": "...", "en": "..." },
       "gameplayEffect": { "ko": "...", "en": "..." }
     }
   }

   The 5 quizzes (correct answers):
   - Quiz 1: 식당 아줌마 "내가 쏠!" (correct: C)
   - Quiz 2: 엘리베이터 빨리빨리 (correct: C) — NO NPC, situation quiz
   - Quiz 3: 지하철 할머니 (correct: C)
   - Quiz 4: 치킨집 눈치 (correct: B)
   - Quiz 5: 친구 응/아니 (correct: A)

2. CREATE src/data/storyText.js — Dangun myth intro:
   export const STORY_TEXT = [
     { ko: "옛날 옛적, 곰과 호랑이에게 기회가 주어졌다.", en: "Long ago, a bear and a tiger were given a chance." },
     { ko: "마늘과 쑥을 먹고 100일을 버티면, 인간이 될 수 있다고.", en: "Eat garlic and mugwort for 100 days, and you shall become human." },
     { ko: "곰은 해냈다.", en: "The bear made it." },
     { ko: "호랑이는... 포기했다.", en: "The tiger... gave up." },
     { ko: null, en: null },  // dramatic pause
     { ko: "...4000년이 지났다.", en: "...4000 years have passed." },
     { ko: null, en: null },  // scene transition beat
     { ko: "호랑이는 여전히 바깥에서 한국을 바라보고 있다.", en: "The tiger is still watching Korea from the outside." },
     { ko: "이번에는 포기하지 않겠다. 다시 도전한다.", en: "This time, no giving up. Time to try again." },
     { ko: "한국인처럼 행동하면, 마늘이 모인다.", en: "Act like a Korean, and the garlic will come." },
     { ko: "마늘 5개를 모으면... 드디어 한국인이 될 수 있다.", en: "Collect 5 garlics... and finally become Korean." },
   ];

3. CREATE src/data/overworldText.js — Signs, mini-events, retry prompt:
   export const SIGNS = [
     { id: 'sign_seongsu', ko: "← 성수동 방면", en: "← Seongsu-dong" },
     { id: 'sign_gangnam', ko: "강남 ↓", en: "Gangnam ↓" },
     { id: 'sign_hongdae', ko: "홍대입구 →", en: "Hongdae →" },
   ];
   export const MINI_EVENTS = {
     vending_machine: { ko: "바나나맛 우유 획득!", en: "Got banana milk!" },
     convenience_store: { ko: "삼각김밥의 유혹을 느낀다...", en: "Feeling the temptation of triangle gimbap..." },
     flyer_ajumma: { ko: "전단지요~", en: "Flyer~" },
     pigeon: { ko: "비둘기 떼가 흩어졌다!", en: "The pigeons scattered!" },
   };
   export const ALREADY_CLEARED = { ko: "이미 마늘을 받았잖아!", en: "You already got the garlic!" };
   export const RETRY_PROMPT = {
     question: { ko: "다시 해볼래?", en: "Try again?" },
     yes: { ko: "응!", en: "Yes!" },
     no: { ko: "나중에...", en: "Later..." },
   };

4. CREATE src/data/shareText.js — Share messages, result card, transformation labels:
   export const SHARE_MESSAGES = {
     0: { ko: "아직 100% 호랑이. 한국은 먼 나라...", en: "Still 100% tiger." },
     1: { ko: "고개는 숙일 줄 안다", en: "At least knows how to bow" },
     2: { ko: "빨리빨리 체질이 되어가는 중", en: "Becoming a 빨리빨리 person" },
     3: { ko: "TH 발음은 포기했다", en: "Has given up on TH" },
     4: { ko: "거의 한국인인데... 아직 1개 남았다", en: "Almost Korean... one more to go" },
     5: { ko: "호랑이에서 한국인이 되었습니다", en: "Tiger to Korean. Complete." },
   };
   export const RESULT_CARD = {
     title: { ko: "나의 호랑이", en: "My Tiger" },
     level_label: { ko: "한국인화", en: "Korean Level" },
     tries_label: { ko: "번 만에 한국인 달성!", en: "tries to become Korean!" },
     perfect: { ko: "천재 호랑이", en: "Genius Tiger" },
     share_btn: { ko: "공유하기", en: "Share" },
     credit: "Made by LocalNomad",
     url: "https://localnomad.club",
   };
   export const TRANSFORMATION_LABELS = [
     { ko: "꾸벅 인사 마스터", en: "Bowing Master" },
     { ko: "빨리빨리 체질", en: "빨리빨리 Constitution" },
     { ko: "\"Seuree\" 발음", en: "\"Seuree\" Pronunciation" },
     { ko: "눈치 레벨: 한국인", en: "눈치 Level: Korean" },
     { ko: "응/아니 완벽 구사", en: "응/아니 Mastery" },
   ];
```

---

### Phase 1 Gate Check

```bash
node -e "import('./src/config.js').then(m => console.log('Config:', m.GAME.WIDTH, 'x', m.GAME.HEIGHT))" --input-type=module
node -e "const q = require('./src/data/quizData.json'); console.log('Quizzes:', q.quizzes.length, '| Bilingual:', q.quizzes.every(q => q.question.ko && q.question.en))"
node -e "import('./src/data/assetManifest.js').then(m => console.log('Assets:', Object.keys(m.ASSET_MANIFEST)))" --input-type=module
ls assets/processed/korean/ | head -10
timeout 10 npx vite build 2>&1 | tail -20
```

---

## PHASE 2: Core Systems (3 agents in parallel)

---

### Agent D — Game Objects (Tiger + Dialogue + NPC)

```
ROLE: Rewrite game objects for real image assets and bilingual text.

FILE OWNERSHIP:
- src/objects/Tiger.js
- src/objects/DialogueBox.js
- src/objects/NPC.js

READ ONLY: src/config.js, src/data/assetManifest.js, src/data/quizData.json

TASKS:

1. REWRITE src/objects/Tiger.js:
   class Tiger extends Phaser.GameObjects.Sprite
   - Spritesheet: 'tiger' key, 4 rows (DOWN=0-3, UP=4-7, LEFT=8-11, RIGHT=12-15)
   - Grid movement: exactly 16px (one TILE) per step with walk animation (4 frames)
   - Idle: frame 0 of current direction
   - Property: transformationStage (0-5)
   - setStage(n): visual effects per stage as placeholder until real sprites exist
     0=normal, 1=yellow tint, 2=lighter+faster, 3=speech bubble "seuree?",
     4=squished scale, 5=dark overlay
   - playBowAnimation(): quick tilt for 꾸벅 effect (stage >= 1)
   - getFrame(direction, frameIndex): helper for correct frame number

2. REWRITE src/objects/DialogueBox.js:
   class DialogueBox extends Phaser.GameObjects.Container
   - Gen 3 style: white fill, 2px black border, 4px padding
   - Full width (240px), height ~48px, bottom of screen
   - Bilingual rendering: Korean (Galmuri11/sans-serif, 9px, #000) on top,
     English (Press Start 2P, 7px, #444) below, 2px gap
   - Typewriter effect (30ms/char)
   - Blinking triangle when text complete
   - Methods: showText(ko, en), showChoices(choices), moveCursor(dir),
     getSelectedChoice(), hide(), isAnimating(), skipAnimation()
   - Multi-page support for long text

3. REWRITE src/objects/NPC.js:
   class NPC extends Phaser.GameObjects.Sprite
   - Properties: npcKey, position, quizId, isCleared
   - Load NPC sprite from processed Korean assets
   - Idle animation (bob or frame cycle)
   - Interaction zone: 1 tile radius
   - Visual indicator: "!" bubble (or checkmark if cleared)
   - interact(): returns quiz data if not cleared
```

---

### Agent E — Map & Tileset Rendering

```
ROLE: Build the overworld map system using real Gen 3 tilesets.

FILE OWNERSHIP:
- src/data/mapData.js (REWRITE)
- src/utils/TileRenderer.js (REWRITE)
- src/utils/MapBuilder.js (NEW)

READ ONLY: src/config.js, src/data/assetManifest.js, assets/processed/tileset_map.json

TASKS:

1. REWRITE src/utils/TileRenderer.js:
   Tileset-based renderer using Phaser textures.
   - Load tileset images, extract 16x16 tile frames
   - drawTile(scene, tileId, worldX, worldY)
   - Support multiple tileset sources
   - Cache for performance

2. REWRITE src/data/mapData.js:
   40x35 tile map (640x560 pixels):

   Layout:
   Rows 0-4: Trees/border (top)
   Rows 5-6: Park area
   Rows 7-12: 식당 (left ~col 4-8) | paths | 아파트 (right ~col 25-30)
   Rows 13-15: Connecting paths
   Rows 16-20: 지하철역 (center ~col 15-20)
   Rows 21-23: Connecting paths
   Rows 24-29: 치킨집 (left ~col 4-8) | paths | 카페 (right ~col 25-30)
   Rows 30-31: Start area (spawn col 20, row 31)
   Rows 32-34: Trees/border (bottom)
   Edges: Trees/fences cols 0-2 and 37-39

   Export MAP_LAYERS = {
     ground: 2D array (grass, paths, water),
     buildings: 2D array (building tiles, 0=empty),
     decoration: 2D array (trees, fences, signs),
     collision: 2D array (0=walkable, 1=solid),
     interactions: [
       { type:'door', x:6, y:9, quizId:1, label:{ko:'식당',en:'Restaurant'} },
       { type:'door', x:28, y:9, quizId:2, label:{ko:'아파트',en:'Apartment'} },
       { type:'door', x:18, y:18, quizId:3, label:{ko:'지하철역',en:'Subway'} },
       { type:'door', x:6, y:26, quizId:4, label:{ko:'치킨집',en:'Chicken'} },
       { type:'door', x:28, y:26, quizId:5, label:{ko:'카페',en:'Cafe'} },
       { type:'sign', x:12, y:15, textId:'sign_seongsu' },
       { type:'sign', x:22, y:23, textId:'sign_gangnam' },
       { type:'vending', x:14, y:20 },
       { type:'convenience', x:32, y:18 },
     ],
     playerSpawn: { x:20, y:31 },
   };

3. CREATE src/utils/MapBuilder.js:
   class MapBuilder
   - buildMap(scene, mapLayers): render all layers
   - getCollisionAt(x, y): solid check
   - getInteractionAt(x, y): door/sign/event check
   - placeKoreanBuildings(scene): overlay Korean prop sprites at building locations
   - Camera: follow player, bounded to map
```

---

### Agent F — Utility Systems

```
ROLE: Update all utility modules.

FILE OWNERSHIP:
- src/utils/StateManager.js
- src/utils/InputHandler.js
- src/utils/ShareManager.js
- src/utils/AudioManager.js

READ ONLY: src/config.js, src/data/shareText.js

TASKS:

1. REWRITE src/utils/StateManager.js:
   Singleton with:
   { garlicsCollected:0, transformationStage:0, completedQuizzes:[],
     wrongAnswerCounts:{}, totalWrongAnswers:0,
     playerPosition:{x:20,y:31}, gameCompleted:false }
   Methods: completeQuiz(id), recordWrongAnswer(id), isQuizCompleted(id),
   getStage(), getTotalTries(), savePosition(x,y), reset(), getShareData()

2. REWRITE src/utils/InputHandler.js:
   Desktop + Mobile unified:
   - Arrow keys -> direction, Space/Enter/Z -> ACTION, X/Esc -> CANCEL
   - Mobile: DOM overlay D-pad (bottom-left) + A/B buttons (bottom-right)
   - Auto-detect touch devices, show/hide mobile controls
   - Methods: getDirection(), isActionPressed(), isCancelPressed(), update()

3. REWRITE src/utils/ShareManager.js:
   - REMOVE all coupon and Airtable/email logic
   - generateShareURL(stage): URL with ?stage=N
   - getShareText(stage): bilingual message from shareText.js
   - share(stage, totalTries): Web Share API -> clipboard fallback
   - parseURLParams(): read ?stage=X from URL

4. UPDATE src/utils/AudioManager.js:
   Keep Web Audio oscillators, update for Gen 3 style (richer tones):
   Sounds: menuSelect, textAdvance, correctAnswer, wrongAnswer,
   garlicCollect, transformation, walk, doorEnter, bowEffect
```

---

### Phase 2 Gate Check

```bash
timeout 15 npx vite build 2>&1 | tail -30
node -e "
import('./src/data/mapData.js').then(m => {
  const g = m.MAP_LAYERS.ground;
  console.log('Map:', g[0]?.length, 'x', g.length, '| Interactions:', m.MAP_LAYERS.interactions.length);
})" --input-type=module
```

---

## PHASE 3: Scene Implementation (3 agents in parallel)

---

### Agent G — Boot + Title + Intro Scenes

```
ROLE: Implement opening sequence scenes.

FILE OWNERSHIP:
- src/scenes/BootScene.js
- src/scenes/TitleScene.js
- src/scenes/IntroScene.js

READ ONLY: src/config.js, src/data/assetManifest.js, src/data/storyText.js,
src/objects/*, src/utils/*

TASKS:

1. BootScene: Load ALL assets from assetManifest (tilesets, tiger spritesheet,
   Korean props, tileset_map.json). Loading bar. Show "LocalNomad" 1.5s.

2. TitleScene: "GARLIC TIGER" (Press Start 2P) + "마늘 호랑이" (Galmuri11).
   Tiger idle animation center. "PRESS START" blinking. "Made by LocalNomad" bottom.
   ?stage=X URL param check for shared tiger display.

3. IntroScene: Black bg. STORY_TEXT bilingual typewriter.
   Korean: white, 10px. English: #999, 7px. null = 1s pause.
   Action press = skip/advance. Screen flash on "4000년이 지났다".
```

---

### Agent H — Overworld Scene (LARGEST)

```
ROLE: Build the main overworld exploration scene.

FILE OWNERSHIP:
- src/scenes/OverworldScene.js

READ ONLY: src/config.js, src/data/mapData.js, src/data/overworldText.js,
src/data/assetManifest.js, src/objects/*, src/utils/*

TASKS:

REWRITE src/scenes/OverworldScene.js:

create():
- MapBuilder.buildMap(this, MAP_LAYERS)
- Place Korean building overlays
- Create Tiger at spawn/saved position
- Create 5 NPCs at quiz door locations
- Camera follow Tiger, bounded to map
- DialogueBox (hidden), InputHandler
- Mini-event triggers (signs, vending, pigeons, flyer ajumma)
- Garlic HUD: top-left, garlic icon + "X/5" (fixed to camera)

update():
- If dialogue active: handle dialogue input only
- Else: read direction, check collision, move Tiger 16px with animation
- Action button: check interactions (door->quiz, sign->text, vending->message)
- Auto-bow near NPCs if stage >= 1
- Random "seuree?" bubble if stage >= 3
- Update garlic HUD

enterQuiz(quizId): save position, scene.start('QuizScene', {quizId})
After all 5 quizzes: scene.start('VictoryScene')

Mini-events: pigeon scatter, flyer ajumma speech bubble, convenience store text
```

---

### Agent I — Quiz + Transform + Victory + Result Scenes

```
ROLE: Build quiz, transformation, and ending scenes.

FILE OWNERSHIP:
- src/scenes/QuizScene.js
- src/scenes/TransformScene.js
- src/scenes/VictoryScene.js
- src/scenes/GameOverScene.js (repurpose as ResultCard)
- DELETE: src/scenes/ScrollScene.js

READ ONLY: src/config.js, src/data/quizData.json, src/data/shareText.js,
src/data/overworldText.js, src/objects/*, src/utils/*

TASKS:

1. QuizScene: Receives {quizId}. Pokemon battle layout (NPC top, tiger bottom).
   Dialogue sequence (typewriter bilingual) -> question -> 3 choices with cursor.
   Correct: sound + feedback + garlic animation + TransformScene.
   Wrong: sound + feedback + retry prompt ("응!"=retry, "나중에..."=overworld).
   Quiz 2 special: elevator background, no NPC, "닫힘" button animation.

2. TransformScene: Receives {transformation}. Pokemon evolution style.
   White flash -> tiger center 2x -> rapid flash 3x -> bilingual transform text ->
   garlic count "X/5" -> gameplay effect text -> action -> overworld.

3. VictoryScene: After 5th garlic. Epic flash + "축하합니다!/Congratulations!" +
   "호랑이가 한국인이 되었습니다!" + confetti particles -> ResultCard.

4. GameOverScene (ResultCard): Result card layout:
   "나의 호랑이/My Tiger" + tiger sprite + progress "한국인화: X/5" +
   transformation labels + try count + share button (ShareManager) +
   "Made by LocalNomad" + "Play Again?" -> reset -> TitleScene.

5. DELETE ScrollScene.js. Remove any remaining imports.
```

---

### Phase 3 Gate Check

```bash
# Full build check
npx vite build 2>&1 | tail -30

# Verify no old references
grep -r "ScrollScene" src/ --include="*.js"
grep -r "coupon" src/ --include="*.js" -i
grep -r "airtable" src/ --include="*.js" -i
grep -r "subscribe" src/ --include="*.js"

# Verify all scenes export
for s in BootScene TitleScene IntroScene OverworldScene QuizScene TransformScene VictoryScene GameOverScene; do
  node -e "import('./src/scenes/${s}.js').then(()=>console.log('OK: ${s}')).catch(e=>console.log('FAIL: ${s}',e.message))" --input-type=module
done

# Start dev server for testing
npx vite --port 3000 --host
```

---

## PHASE 4: Integration & QA (single agent)

---

### Agent J — Integration Testing & Bug Fixes

```
ROLE: Run complete game, find and fix all bugs. Can modify ANY file.

FILE OWNERSHIP: ALL files (full write access for bug fixes)

TASKS:

1. npm run dev (start Vite)

2. TEST EACH SCENE IN ORDER:
   - BootScene: assets load? no 404s? font ready?
   - TitleScene: bilingual text? tiger animation? PRESS START? ?stage=X param?
   - IntroScene: typewriter? Korean+English? pauses? skip? transition?
   - OverworldScene: map renders? no gaps? movement? collision? camera? doors?
     signs? vending? garlic HUD? mobile controls?
   - QuizScene (all 5): dialogue? choices? cursor? correct flow? wrong flow?
     retry? elevator background for Q2?
   - TransformScene: flash? visual change? text? garlic count?
   - VictoryScene: epic sequence? congrats text?
   - ResultCard: labels? try count? share? play again?

3. COMMON BUGS TO CHECK:
   - Asset paths (Vite public directory serving)
   - Font loading (Google Fonts URL, fallback)
   - Scene transition data passing
   - Mobile touch not registering
   - Tileset rendering offsets
   - Dialog box text overflow at 240px width
   - Web Audio needing user gesture
   - Korean text rendering (font fallback)

4. FIX all issues found.

5. FINAL BUILD:
   npx vite build && npx vite preview --port 4000

6. CLEANUP:
   Remove src_backup_*/, unused src/data/palettes.js, src/data/spriteData.js
   Verify .gitignore covers node_modules, dist, .env*
```

---

## TERMINAL: Final Deploy

```bash
# Production build
npx vite build

# Test production locally
npx vite preview --port 4000

# Git commit
git add -A
git commit -m "Rebuild: GBC->GBA Gen3, real tilesets, bilingual quizzes, no coupon"

# Deploy
npx vercel --prod
# Or: git push origin main
```

---

## FILE OWNERSHIP MATRIX

```
File                        | A | B | C | D | E | F | G | H | I | J
----------------------------|---|---|---|---|---|---|---|---|---|---
src/config.js               | W |   |   | R | R | R | R | R | R | W
src/main.js                 | W |   |   |   |   |   |   |   |   | W
index.html, style.css       | W |   |   |   |   |   |   |   |   | W
vercel.json, CLAUDE.md      | W |   |   |   |   |   |   |   |   | W
src/data/assetManifest.js   |   | W |   | R |   |   | R |   |   | W
assets/processed/*          |   | W |   |   |   |   |   |   |   | W
src/data/quizData.json      |   |   | W |   |   |   |   |   | R | W
src/data/storyText.js       |   |   | W |   |   |   | R |   |   | W
src/data/overworldText.js   |   |   | W |   |   |   |   | R | R | W
src/data/shareText.js       |   |   | W |   |   | R |   |   | R | W
src/data/mapData.js         |   |   |   |   | W |   |   | R |   | W
src/objects/Tiger.js        |   |   |   | W |   |   | R | R | R | W
src/objects/DialogueBox.js  |   |   |   | W |   |   | R | R | R | W
src/objects/NPC.js          |   |   |   | W |   |   |   | R | R | W
src/utils/TileRenderer.js   |   |   |   |   | W |   |   | R |   | W
src/utils/MapBuilder.js     |   |   |   |   | W |   |   | R |   | W
src/utils/StateManager.js   |   |   |   |   |   | W |   | R | R | W
src/utils/InputHandler.js   |   |   |   |   |   | W | R | R | R | W
src/utils/ShareManager.js   |   |   |   |   |   | W |   |   | R | W
src/utils/AudioManager.js   |   |   |   |   |   | W | R | R | R | W
src/scenes/BootScene.js     |   |   |   |   |   |   | W |   |   | W
src/scenes/TitleScene.js    |   |   |   |   |   |   | W |   |   | W
src/scenes/IntroScene.js    |   |   |   |   |   |   | W |   |   | W
src/scenes/OverworldScene.js|   |   |   |   |   |   |   | W |   | W
src/scenes/QuizScene.js     |   |   |   |   |   |   |   |   | W | W
src/scenes/TransformScene.js|   |   |   |   |   |   |   |   | W | W
src/scenes/VictoryScene.js  |   |   |   |   |   |   |   |   | W | W
src/scenes/GameOverScene.js |   |   |   |   |   |   |   |   | W | W

W = Write    R = Read only    (blank) = Don't touch
Agent J can write anywhere.
```

---

## ORCHESTRATOR EXECUTION FLOW

```
1. Run Pre-flight terminal commands

2. Phase 1: Launch Agent A + B + C as 3 parallel Task calls (single message)
   -> Wait for all 3
   -> Run Phase 1 Gate Check
   -> Fix any issues

3. Phase 2: Launch Agent D + E + F as 3 parallel Task calls
   -> Wait for all 3
   -> Run Phase 2 Gate Check
   -> Fix any issues

4. Phase 3: Launch Agent G + H + I as 3 parallel Task calls
   -> Wait for all 3
   -> Run Phase 3 Gate Check
   -> Fix any issues

5. Phase 4: Launch Agent J (single Task call)
   -> Wait for completion
   -> Run Final Deploy commands

Each Task: subagent_type "general-purpose", include full agent prompt section,
tell agent to read docs/GAME_DESIGN_DOC.md for game content.
```
