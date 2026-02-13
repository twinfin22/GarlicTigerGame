# Garlic Tiger

GBA-style (Pokemon FireRed/LeafGreen) browser game. Tiger collects 5 garlics through Korean culture quizzes to transform into a Korean. Built with Phaser 3 + Vite. Non-commercial project.

## Commands

- `npm run dev` — Vite dev server (localhost:5173)
- `npm run build` — Production build
- `npm run preview` — Preview production build
- Deployment: Vercel (auto-deploy from main branch)

## Code Style

- ES modules only (`import`/`export`), no CommonJS
- Named exports for scenes: `export class BootScene extends Phaser.Scene {}`
- All player-facing text MUST be bilingual: `{ ko: "한국어", en: "English" }`
- Fonts: `Press Start 2P` (English), `Galmuri11` (Korean) — see `GAME.FONT_EN`, `GAME.FONT_KO` in config.js
- Import game constants from `src/config.js` — never hardcode dimensions or tile sizes
- Use `getPalette()` from `src/utils/GBGraphics.js` for all colors
- Use `drawDialogBox()` for Pokemon-style dialog (white box, 2px black border)

## Architecture

- **Scene flow**: Boot → Title → Intro → Overworld → Quiz → Transform → Victory
- **State**: `StateManager.js` holds game progress (garlics, quiz completion, transformation stage)
- **Map**: Tile-based 40×35 grid, 5 fixed quiz locations defined in `config.js` `QUIZ_LOCATIONS` — no random encounters
- **Quiz data**: `src/data/quizData.json` is the source of truth for all quiz content. Game design details in `docs/GAME_DESIGN_DOC.md`
- **Audio**: `AudioManager.js` generates Pokemon Gen 3 style sounds procedurally (Web Audio API), no audio files needed

## Game Specs

- Native resolution: 240×160 (GBA), scaled with `Phaser.Scale.FIT`
- Tile: 16×16, Sprite: 32×32, Map view: 15×10 tiles
- IMPORTANT: All UI must fit within 160px native height
- Phaser config requires: `pixelArt: true`, `roundPixels: true`, `antialias: false`

## Assets

- `assets/tilesets/` — GBA-era 16×16 tilesets (non-commercial license, do NOT redistribute)
- `assets/tiger/` — Tiger sprite sheets (128×128 PNG, 4 rows × 4 frames, 32×32 per frame)
- `assets/korean/` — Korean props generated via Nano Banana (buildings, signs, food)
- `assets/sprites/` — NPC and object sprites
- `assets/itch-io/` — Supplementary itch.io assets
- `assets/unused/` — OLD GBC-style assets, do NOT use these
- Tiger sprite rows: DOWN(0) / UP(1) / LEFT(2) / RIGHT(3)

## Gotchas

- Vite/Rollup platform mismatch: if `Cannot find module @rollup/rollup-linux-arm64-gnu`, run `npm install @rollup/rollup-linux-arm64-gnu --save-optional`
- node_modules may have permission issues — do NOT delete and reinstall; work around with optional deps
- Galmuri11 font loaded from jsDelivr CDN — requires internet connection for Korean text
- Camera zoom must match scale factor; wrong zoom = map appears cut off
- Tile collision: check `SOLID_TILES` array in config.js, not individual tile checks

## Subagents

Custom subagents defined in `.claude/agents/`. Run in parallel via Task tool, each with isolated context.

| Agent | Model | Role | Owns |
|-------|-------|------|------|
| `asset-pipeline` | sonnet | Tileset processing, sprite generation | `assets/processed/*` |
| `map-designer` | sonnet | Map layout, tile placement, interactions | `src/data/mapData.js` |
| `gameplay-dev` | inherit | State, encounters, quiz logic | `StateManager.js`, `overworldEvents.js`, `overworldText.js` |
| `scale-camera` | sonnet | Sprite scale, camera smoothness | `Tiger.js`, `NPC.js`, `MapBuilder.js` |
| `qa-tester` | haiku | Static: build validation, asset file checks | read-only |
| `playtester` | sonnet | Dynamic: browser playtest, screenshots, visual bugs | read-only |

IMPORTANT: No two agents write the same file. Check ownership before assigning work.
Run order: code agents (parallel) → `qa-tester` → `playtester` → fix cycle.

## Reference Docs

- `docs/GAME_DESIGN_DOC.md` — Authoritative game content (story, quizzes, NPC dialogue)
- `docs/AGENT_TEAM_PROMPT.md` — Multi-agent orchestration prompt for parallel development
- `docs/PLAYTEST_CYCLE_PROMPT.md` — Browser-based play-fix testing cycle
- `docs/VISUAL_OVERHAUL_PROMPT.md` — 4-agent parallel visual/gameplay overhaul
