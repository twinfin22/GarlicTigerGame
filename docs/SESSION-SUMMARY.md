# Session Summary — 2025-02-12

## Completed

Full rewrite of Garlic Tiger from Pokemon Red/Blue style (320x288, 16px tiles) to Pokemon Gold GBC pixel-perfect style (native 160x144, 8x8 tiles). 27 files changed, +4,655 / -3,187 lines. Commit `e394863`.

### New files created
- `src/data/palettes.js` — 8 BG + 8 sprite palettes with Pokemon Gold exact hex values
- `src/data/spriteData.js` — All sprite pixel arrays (tiles, characters, battle sprites, UI)
- `src/data/mapData.js` — 32x32 scrolling Seoul tilemap with collision/tallGrass detection
- `src/utils/TileRenderer.js` — Core 8x8 tile rendering engine (viewport, HP bars, menus, transitions)
- `src/utils/InputHandler.js` — Swipe-to-move, tap-to-interact, long-press menu, keyboard fallback
- `src/objects/NPC.js` — 5 overworld NPCs with adjacency detection and defeat tracking

### Files rewritten (all 22 existing source files)
- `src/main.js` — Phaser 160x144, pixelArt, CSS integer scaling
- `src/config.js` — Native resolution constants, `defeatedNPCs` in state
- All 9 scenes — BootScene, TitleScene, IntroScene, OverworldScene, QuizScene, TransformScene, VictoryScene, ScrollScene, GameOverScene
- `src/objects/Tiger.js` — 2px/frame, 4-frame walk cycle on 8px tiles
- `src/objects/DialogueBox.js` — 160x32 Pokemon Gold dialogue with pagination
- `src/utils/AudioManager.js` — 4-channel GB sound + encounter/menu sounds
- `src/utils/StateManager.js` — NPC defeat tracking added
- `src/utils/ShareManager.js` — Fixed import (BRANDING instead of GAME_CONFIG)
- `style.css`, `index.html` — Pixelated rendering, loading screen

### File deleted
- `src/utils/GBGraphics.js` — Replaced by palettes.js + spriteData.js + TileRenderer.js

### Bug fixes applied
1. **Tiger walk animation** — Threshold changed from `walkFrame >= 4` to `>= 2` (tiles are 8px = 4 frames, not 16px = 8 frames)
2. **Overworld dialogue blink** — Refactored to only create/destroy on state change instead of every frame
3. **NPC defeat tracking** — Added `gameState.defeatNPC()` call in QuizScene._handleCorrect()

## Pending

- **Browser testing** — Dev server was started but no visual QA was performed. Run `npm run dev` and play through the full flow.
- **Mobile testing** — Swipe-to-move and tap-to-interact need real device testing.
- **Text overflow audit** — Verify all dialogue/quiz text fits 18 chars/line at 160x144.
- **Performance audit** — OverworldScene redraws viewport every frame (~25K fillRect calls). May need optimization on low-end mobile.
- **Email form positioning** — ScrollScene email input uses fixed CSS positioning relative to canvas rect. Needs verification at different screen sizes.
- **Dead code cleanup** — `config.js` has unused `TILE` and `SOLID_TILES` exports (mapData.js uses its own `TERRAIN` enum).

## Key Decisions

- **Runtime battle sprite scaling**: Instead of storing massive 48x48/56x56 pixel arrays, `spriteData.js` uses a `scaleSpriteData()` helper that scales 16x16 overworld sprites to battle size at runtime.
- **No visible on-screen controls**: Input is entirely gesture-based (swipe/tap/long-press) + keyboard. No D-pad overlay.
- **Menu/dialogue optimization**: Refactored from "destroy and recreate every frame" to "create once, update cursor only" to fix blink timer and reduce GC pressure.
- **NPC quiz assignment**: Quizzes are sequential (quiz index = garlic count), not tied to specific NPC IDs. Both tall grass encounters and NPC interactions use the same sequential counter.

## Modified Files

See git diff above — 27 files total across src/data, src/objects, src/scenes, src/utils, and root config files.

## Next Steps

1. `npm run dev` — Play through the entire game flow in browser, check console for errors
2. Test on mobile device (iOS Safari, Android Chrome) — verify touch controls work
3. Audit text lengths — some quiz dialogue may overflow the 160x144 dialogue box
4. Consider adding `.gitignore` entries for the untracked prompt files (`AGENT_TEAM_PROMPT.md`, `POKEMON_GOLD_REPLICA_PROMPT.md`, `CODE_VERIFICATION_REPORT.txt`, `index-bundled.html`)
5. Deploy to Vercel and verify email capture + social sharing work in production

## Context to Preserve

- **Resolution**: 160x144 native, CSS scales via `Phaser.Scale.FIT`. All coordinates are in native pixels.
- **Tile system**: 8x8 base tiles, 16x16 sprites, 32x32 scrolling map. Camera follows tiger, clamps at edges.
- **Palette system**: `palettes.js` has Pokemon Gold exact colors. Sprites use index 0=transparent, 1-3=colors.
- **Build**: `npx vite build` passes clean. Output: ~98KB app JS + ~1.5MB Phaser.
- **Business logic preserved**: Airtable email capture in ScrollScene (`/api/subscribe`), ShareManager with `?stage=X` URL sharing.
