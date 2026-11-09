# Garlic Tiger: neighborhood onboarding slice

## Diagnosis

Current main (4e32bd6) is Phaser 3 + Vite at 240 × 160, with a 40 × 35 tile map and five fixed quiz destinations. Historical `SESSION-SUMMARY.md` and `POKEMON_GOLD_REPLICA_PROMPT.md` describe a different 160 × 144 GBC implementation. They are history, not the current runtime specification. `CLAUDE.md` also mentions a deleted GBGraphics helper; use the existing palettes and TileRenderer helpers instead.

The strongest handheld-RPG feeling comes from a coherent loop: explore → notice someone → talk → make a choice → see a small change → collect a memory. A retro font over disconnected quizzes does not produce that loop.

## Implemented first slice

- A compact bilingual **동네 수첩 / FIELD NOTES**, opened and closed with X, Escape, or mobile B. Five stamps record completed encounters in any order.
- A persistent direction-and-destination hint. Suggested order starts near spawn, without locking other destinations.
- A one-time welcome introduces the guide. It does not repeat after each quiz. Resetting the run resets the welcome.
- Mobile A now reaches overworld interaction and dialogue handling. Cancelled touches clear button/direction state.
- Overworld shutdown cleanup is registered with Phaser, avoiding accumulated event handlers and mobile overlays on scene reentry.
- Restaurant, elevator, and last-piece questions teach agreeing how to pay, safe boarding, and asking others. Treating the entire table, button mashing, and leaving food are no longer mandatory cultural rules. Tiger transformation comedy remains unchanged.
- Repaired malformed npm lockfile entries that blocked a clean install. Added repeatable Node tests.

## Art and design direction

Keep 240 × 160 for this first slice rather than break every existing layout by changing resolution. Use one small original palette family, consistent tile scale and outlines, square dialogue borders, short paginated messages, deliberate grid movement, a distinct confirmation sound, and a collectible neighborhood notebook. Do not copy Pokémon characters, maps, logos, music, or sprites. Existing tileset licenses must be audited before any public release; the repository warns that some assets are non-commercial and must not be redistributed.

Next milestones:

1. A polished single-block vertical slice: one street, convenience store, subway entrance and two original NPCs. Replace mismatched art with original 16 × 16 tiles and consistent character proportions.
2. Task-based onboarding: recharge a transit card, find the right platform, sort rubbish according to the local rules, and order a meal with useful phrases. Verify changing local policies and avoid presenting social habits as universal laws.
3. Choice consequences instead of trivia punishment: retry naturally, explain why, record a useful phrase or practical tip. Preserve the playful tiger/garlic story.
4. A small start menu, deliberate save/continue with validation, sound toggle, text speed, and mobile-safe layout. No automatic account signup.
5. Device QA and licensed-asset review before release. Audit long preexisting quiz/transformation text for 160-pixel-height clipping. Reconsider accent/body-change jokes with the intended audience rather than silently rewriting the premise.

## Verification

- Node tests cover bilingual destination coverage, free-order progression, duplicate completion/reset behavior, reachability from spawn, and corrected answers.
- Production Vite build passes. Existing Phaser bundle-size warning remains.
- Browser playtest is **not verified**: local Chromium could not start due environment socket restrictions; the permitted retry failed during environment setup. The available cloud browser could not reach the local development server. No claim is made about screenshot appearance, real mobile behavior, or full-game completion.
- Changes are proposed on a separate branch for review. No merge or production deployment is requested. `main` auto-deploys to Vercel, so release must be a separate deliberate step.

Run: `npm ci`, `npm test`, `npm run build`, `npm run dev -- --host 127.0.0.1`.
