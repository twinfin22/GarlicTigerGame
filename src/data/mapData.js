// mapData.js - 40x35 Seoul overworld map (Gen 3 GBA style)
// Procedurally generated layers — rich Pokemon-town layout with
// asymmetric buildings, winding paths, central park, and varied borders.

import { GAME } from '../config.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fill a rectangular region on a 2D layer */
const fillRect = (layer, x, y, w, h, val) => {
  for (let row = y; row < y + h && row < layer.length; row++) {
    for (let col = x; col < x + w && col < layer[0].length; col++) {
      layer[row][col] = val;
    }
  }
};

/** Create a 2D array (rows x cols) filled with a default value */
const createGrid = (cols, rows, fill = 'grass_1') =>
  Array.from({ length: rows }, () => Array(cols).fill(fill));

const COLS = GAME.MAP_COLS; // 40
const ROWS = GAME.MAP_ROWS; // 35

// ===================================================================
//  GROUND LAYER
// ===================================================================
const ground = createGrid(COLS, ROWS, 'grass_1');

// --- Grass variety (staggered patches for visual interest) ----------
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    if ((x + y) % 7 === 0) ground[y][x] = 'grass_2';
    if ((x * 3 + y * 5) % 13 === 0 && ground[y][x] === 'grass_1') {
      ground[y][x] = 'grass_2';
    }
  }
}

// --- Winding path network -------------------------------------------

// Main north-south boulevard (slightly off-center, 2 tiles wide)
fillRect(ground, 19, 4, 2, 29, 'path_v');

// Southern entry promenade (wider near spawn)
fillRect(ground, 17, 30, 6, 3, 'path_h');
fillRect(ground, 18, 28, 4, 2, 'path_v');

// Top east-west avenue — connects Restaurant (Quiz 1) and Apartment (Quiz 2)
// Curve: goes straight from x=4..12, dips south at 12-14, then continues east
fillRect(ground, 4, 9, 9, 1, 'path_h');
fillRect(ground, 12, 10, 1, 2, 'path_v');
fillRect(ground, 12, 12, 8, 1, 'path_h');
fillRect(ground, 19, 10, 1, 2, 'path_v'); // re-join main boulevard
fillRect(ground, 19, 9, 2, 1, 'path_cross');
fillRect(ground, 20, 9, 1, 4, 'path_v');
fillRect(ground, 20, 12, 8, 1, 'path_h');
fillRect(ground, 27, 10, 1, 2, 'path_v');
fillRect(ground, 27, 9, 8, 1, 'path_h');

// Middle east-west avenue — connects to Subway (Quiz 3)
// Gentle S-curve via intermediate segments
fillRect(ground, 4, 18, 7, 1, 'path_h');
fillRect(ground, 10, 17, 1, 2, 'path_v');
fillRect(ground, 10, 17, 5, 1, 'path_h');
fillRect(ground, 14, 17, 1, 2, 'path_v');
fillRect(ground, 14, 18, 5, 1, 'path_h');
fillRect(ground, 19, 18, 2, 1, 'path_cross');
fillRect(ground, 20, 18, 7, 1, 'path_h');
fillRect(ground, 26, 17, 1, 2, 'path_v');
fillRect(ground, 26, 17, 5, 1, 'path_h');
fillRect(ground, 30, 17, 1, 2, 'path_v');
fillRect(ground, 30, 18, 5, 1, 'path_h');

// Bottom east-west avenue — connects Chicken (Quiz 4) and Cafe (Quiz 5)
// Mild curve through the bottom area
fillRect(ground, 4, 26, 6, 1, 'path_h');
fillRect(ground, 9, 26, 1, 2, 'path_v');
fillRect(ground, 9, 27, 5, 1, 'path_h');
fillRect(ground, 13, 26, 1, 2, 'path_v');
fillRect(ground, 13, 26, 7, 1, 'path_h');
fillRect(ground, 19, 26, 2, 1, 'path_cross');
fillRect(ground, 20, 26, 6, 1, 'path_h');
fillRect(ground, 25, 25, 1, 2, 'path_v');
fillRect(ground, 25, 25, 6, 1, 'path_h');
fillRect(ground, 30, 25, 1, 2, 'path_v');
fillRect(ground, 30, 26, 5, 1, 'path_h');

// Short alleyways between buildings
fillRect(ground, 10, 7, 1, 3, 'path_v');   // alley east of Restaurant
fillRect(ground, 25, 7, 1, 3, 'path_v');   // alley west of Apartment
fillRect(ground, 10, 24, 1, 3, 'path_v');  // alley east of Chicken
fillRect(ground, 25, 24, 1, 3, 'path_v');  // alley west of Cafe

// Diagonal shortcuts (approx — stepped tiles)
// Park access from main boulevard heading NW
ground[14][18] = 'path_v';
ground[13][17] = 'path_h';

// --- Central Park (rows 12-16, cols 16-24) --------------------------
// Sand / seating area
fillRect(ground, 16, 13, 3, 2, 'sand_1');
fillRect(ground, 22, 13, 3, 2, 'sand_2');
fillRect(ground, 19, 15, 3, 1, 'sand_path');

// Pond (water feature)
fillRect(ground, 18, 13, 4, 1, 'water_edge');
fillRect(ground, 18, 14, 4, 2, 'water_1');
fillRect(ground, 19, 14, 2, 1, 'water_2');
fillRect(ground, 18, 16, 4, 1, 'water_edge');

// Flower garden around park
ground[12][16] = 'flowers_1';
ground[12][17] = 'flowers_2';
ground[12][18] = 'flowers_1';
ground[12][22] = 'flowers_2';
ground[12][23] = 'flowers_1';
ground[12][24] = 'flowers_2';
ground[16][16] = 'flowers_2';
ground[16][17] = 'flowers_1';
ground[17][22] = 'flowers_2';
ground[17][23] = 'flowers_1';
ground[17][24] = 'flowers_2';

// --- Tall grass patches (use grass_3 visually) ----------------------
// Patch A: NE clearing (cols 31-34, rows 13-15) — 5 tiles
const tallGrassPositions = [];
const placeTallGrass = (x, y) => {
  ground[y][x] = 'grass_3';
  tallGrassPositions.push({ x, y });
};

// Patch A — northeast wilderness (5 tiles)
placeTallGrass(31, 13);
placeTallGrass(32, 13);
placeTallGrass(33, 13);
placeTallGrass(31, 14);
placeTallGrass(32, 14);

// Patch B — southwest grove (4 tiles)
placeTallGrass(5, 20);
placeTallGrass(6, 20);
placeTallGrass(5, 21);
placeTallGrass(6, 21);

// Patch C — south-center hidden area (4 tiles)
placeTallGrass(15, 29);
placeTallGrass(16, 29);
placeTallGrass(15, 30);
placeTallGrass(16, 30);

// --- Water border accents (east edge, rows 4-8) --------------------
fillRect(ground, 37, 4, 3, 2, 'water_1');
fillRect(ground, 37, 6, 3, 1, 'water_edge');

// Small stream along south border
fillRect(ground, 5, 33, 8, 1, 'water_edge');
fillRect(ground, 5, 34, 8, 1, 'water_1');

// ===================================================================
//  DECORATION LAYER (trees, fences, non-walkable decor)
// ===================================================================
const decoration = createGrid(COLS, ROWS, null);

// --- Border: top edge (mixed trees) ---------------------------------
fillRect(decoration, 0, 0, COLS, 3, 'tree_top');
// Break the monotony: some tree_leaves clusters at top
fillRect(decoration, 10, 0, 3, 2, 'tree_leaves');
fillRect(decoration, 25, 0, 4, 2, 'tree_leaves');
fillRect(decoration, 35, 1, 2, 2, 'tree_leaves');

// --- Border: bottom edge (mixed trees + water already on ground) ----
fillRect(decoration, 0, 33, 5, 2, 'tree_top');
fillRect(decoration, 13, 33, 24, 2, 'tree_top');
// Water tiles on ground handle cols 5-12 at rows 33-34 (no tree there)
fillRect(decoration, 37, 33, 3, 2, 'tree_trunk');

// --- Border: left edge (tree_trunk with gaps for paths) -------------
fillRect(decoration, 0, 0, 3, 9, 'tree_trunk');
// gap at row 9 for top avenue path
fillRect(decoration, 0, 10, 3, 8, 'tree_trunk');
// gap at row 18 for middle avenue path
fillRect(decoration, 0, 19, 3, 7, 'tree_trunk');
// gap at row 26 for bottom avenue path
fillRect(decoration, 0, 27, 3, 6, 'tree_trunk');

// --- Border: right edge (tree_trunk + water accent) -----------------
fillRect(decoration, 37, 0, 3, 4, 'tree_trunk');
// water accent at rows 4-6 handled by ground layer; keep trees above/below
fillRect(decoration, 37, 7, 3, 2, 'tree_trunk');
// gap at row 9 for top avenue path
fillRect(decoration, 37, 10, 3, 7, 'tree_trunk');
// gap at row 17-18 for middle avenue path
fillRect(decoration, 37, 19, 3, 6, 'tree_trunk');
// gap at row 25-26 for bottom avenue path
fillRect(decoration, 37, 27, 3, 6, 'tree_trunk');

// --- Interior tree clusters (asymmetric) ----------------------------
// NW grove
fillRect(decoration, 12, 4, 2, 2, 'tree_leaves');
fillRect(decoration, 14, 5, 1, 1, 'tree_top');

// Between top buildings — decorative trees
fillRect(decoration, 14, 7, 2, 1, 'tree_top');
fillRect(decoration, 23, 7, 2, 1, 'tree_top');

// West of central park
fillRect(decoration, 14, 14, 2, 2, 'tree_leaves');

// East of central park
fillRect(decoration, 25, 14, 2, 1, 'tree_top');
fillRect(decoration, 25, 15, 1, 1, 'tree_trunk');

// South clusters
fillRect(decoration, 12, 22, 1, 2, 'tree_leaves');
fillRect(decoration, 33, 22, 2, 1, 'tree_top');
fillRect(decoration, 33, 23, 1, 1, 'tree_trunk');

// Near spawn area — welcoming trees
fillRect(decoration, 14, 31, 2, 1, 'tree_top');
fillRect(decoration, 24, 31, 2, 1, 'tree_top');

// --- Fences ---------------------------------------------------------
// Park fence (north side of central park)
for (let fx = 16; fx <= 24; fx++) {
  decoration[12][fx] = decoration[12][fx] || 'fence';
}
// Park fence (south side)
for (let fx = 16; fx <= 24; fx++) {
  if (!ground[17][fx].startsWith('path') && !ground[17][fx].startsWith('flowers')) {
    decoration[17][fx] = 'fence';
  }
}

// Fence along south spawn corridor
fillRect(decoration, 16, 32, 8, 1, 'fence');

// ===================================================================
//  BUILDINGS LAYER
// ===================================================================
const buildings = createGrid(COLS, ROWS, null);

// ----- Restaurant (Quiz 1) — top-left — 6 wide x 4 tall -----------
// Roof: row 5-6, Wall: row 7-8, Door at (6,9)
fillRect(buildings, 4, 5, 6, 1, 'roof_1');
fillRect(buildings, 4, 6, 6, 1, 'roof_edge');
fillRect(buildings, 4, 7, 6, 1, 'building_accent');
fillRect(buildings, 4, 8, 6, 1, 'building_wall');
buildings[8][5] = 'building_accent';
buildings[8][8] = 'building_accent';
buildings[9][6] = 'door'; // door at (6, 9)

// ----- Apartment (Quiz 2) — top-right — 7 wide x 5 tall -----------
// Taller building (apartment block feel)
fillRect(buildings, 26, 4, 7, 1, 'roof_2');
fillRect(buildings, 26, 5, 7, 1, 'roof_edge');
fillRect(buildings, 26, 6, 7, 1, 'building_accent');
fillRect(buildings, 26, 7, 7, 1, 'building_wall');
fillRect(buildings, 26, 8, 7, 1, 'building_wall');
buildings[7][28] = 'building_accent';
buildings[7][31] = 'building_accent';
buildings[9][28] = 'door'; // door at (28, 9)

// ----- Subway Station (Quiz 3) — center — 8 wide x 4 tall ---------
fillRect(buildings, 15, 15, 8, 1, 'roof_2');
fillRect(buildings, 15, 16, 8, 1, 'roof_edge');
fillRect(buildings, 15, 17, 8, 2, 'building_wall');
buildings[17][16] = 'building_accent';
buildings[17][21] = 'building_accent';
buildings[17][18] = 'building_floor'; // entrance area
buildings[17][19] = 'building_floor';
buildings[18][18] = 'door'; // door at (18, 18)

// ----- Chicken Shop (Quiz 4) — bottom-left — 6 wide x 4 tall ------
fillRect(buildings, 4, 22, 6, 1, 'roof_1');
fillRect(buildings, 4, 23, 6, 1, 'roof_edge');
fillRect(buildings, 4, 24, 6, 2, 'building_wall');
buildings[24][5] = 'building_accent';
buildings[24][8] = 'building_accent';
buildings[26][6] = 'door'; // door at (6, 26)

// ----- Cafe (Quiz 5) — bottom-right — 6 wide x 5 tall -------------
// Slightly different proportions from Chicken Shop (asymmetric)
fillRect(buildings, 27, 21, 6, 1, 'roof_2');
fillRect(buildings, 27, 22, 6, 1, 'roof_edge');
fillRect(buildings, 27, 23, 6, 1, 'building_accent');
fillRect(buildings, 27, 24, 6, 2, 'building_wall');
buildings[24][29] = 'building_accent';
buildings[24][31] = 'building_accent';
buildings[26][28] = 'door'; // door at (28, 26)

// ----- Convenience Store (small, decorative — not a quiz) ----------
fillRect(buildings, 32, 17, 3, 1, 'roof_1');
fillRect(buildings, 32, 18, 3, 1, 'building_wall');
buildings[18][33] = 'building_accent';

// ===================================================================
//  COLLISION LAYER (auto-derived from other layers)
// ===================================================================
const collision = createGrid(COLS, ROWS, 0);
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    // Water is solid
    if (ground[y][x] && ground[y][x].startsWith('water')) collision[y][x] = 1;
    // Trees & fences are solid
    if (decoration[y][x] && (decoration[y][x].startsWith('tree') || decoration[y][x] === 'fence')) collision[y][x] = 1;
    // Buildings are solid (except doors)
    if (buildings[y][x] && buildings[y][x] !== 'door') collision[y][x] = 1;
  }
}

// ===================================================================
//  INTERACTIONS
// ===================================================================
const interactions = [
  // 5 quiz doors (EXACT coordinates — contract with other agents)
  { type: 'door', x: 6, y: 9, quizId: 1, label: { ko: '식당', en: 'Restaurant' } },
  { type: 'door', x: 28, y: 9, quizId: 2, label: { ko: '아파트', en: 'Apartment' } },
  { type: 'door', x: 18, y: 18, quizId: 3, label: { ko: '지하철역', en: 'Subway' } },
  { type: 'door', x: 6, y: 26, quizId: 4, label: { ko: '치킨집', en: 'Chicken' } },
  { type: 'door', x: 28, y: 26, quizId: 5, label: { ko: '카페', en: 'Cafe' } },

  // 7 signs (textIds are a contract with Agent D's overworldText.js)
  { type: 'sign', x: 8,  y: 10, textId: 'sign_seongsu' },   // near Restaurant
  { type: 'sign', x: 30, y: 10, textId: 'sign_gangnam' },    // near Apartment
  { type: 'sign', x: 16, y: 12, textId: 'sign_hongdae' },    // west side of park
  { type: 'sign', x: 24, y: 12, textId: 'sign_itaewon' },    // east side of park
  { type: 'sign', x: 19, y: 19, textId: 'sign_myeongdong' }, // below Subway
  { type: 'sign', x: 8,  y: 27, textId: 'sign_bukchon' },    // near Chicken Shop
  { type: 'sign', x: 30, y: 27, textId: 'sign_namsan' },     // near Cafe

  // 3 vending machines (near buildings)
  { type: 'vending', x: 10, y: 9 },     // east side of Restaurant
  { type: 'vending', x: 33, y: 9 },     // east side of Apartment
  { type: 'vending', x: 10, y: 26 },    // east side of Chicken Shop

  // 1 convenience store
  { type: 'convenience', x: 33, y: 18 },

  // 2 pigeons (open grassy areas)
  { type: 'pigeon', x: 28, y: 14 },     // NE grass clearing
  { type: 'pigeon', x: 7, y: 15 },      // west grass clearing

  // 1 flyer
  { type: 'flyer', x: 14, y: 18 },      // near middle avenue

  // 2 NEW interaction types
  { type: 'bench', x: 17, y: 13, textId: 'park_bench' },     // central park sand area
  { type: 'food_cart', x: 20, y: 27, textId: 'food_cart' },   // near bottom path junction
];

// ===================================================================
//  EXPORT: MAP_LAYERS (primary)
// ===================================================================
export const MAP_LAYERS = {
  ground,
  buildings,
  decoration,
  collision,
  interactions,
  playerSpawn: { x: 20, y: 31 },
};

// ===================================================================
//  BACKWARDS COMPATIBILITY
// ===================================================================

// TERRAIN constants (legacy compat — old numeric system)
export const TERRAIN = {
  GRASS: 0,
  GRASS_ALT: 1,
  TALL_GRASS: 2,
  PATH: 3,
  WATER: 4,
  FENCE: 5,
  BRIDGE: 6,
};

/** Map string tile IDs to legacy numeric terrain types */
const tileIdToTerrain = (id) => {
  if (!id) return TERRAIN.GRASS;
  if (id.startsWith('path')) return TERRAIN.PATH;
  if (id.startsWith('water')) return TERRAIN.WATER;
  if (id.startsWith('sand')) return TERRAIN.PATH; // sand is walkable
  if (id.startsWith('grass')) return TERRAIN.GRASS;
  if (id.startsWith('flowers')) return TERRAIN.GRASS;
  if (id.startsWith('wood')) return TERRAIN.PATH;
  return TERRAIN.GRASS;
};

// Build flat terrain array (COLS * ROWS) from ground layer
const terrain = [];
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    terrain.push(tileIdToTerrain(ground[y][x]));
  }
}

// Build flat collision array from 2D collision grid
const flatCollision = [];
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    flatCollision.push(collision[y][x]);
  }
}

// Build flat tallGrass array — 1 at tall grass positions, 0 elsewhere
const tallGrassFlat = new Array(COLS * ROWS).fill(0);
for (const pos of tallGrassPositions) {
  tallGrassFlat[pos.y * COLS + pos.x] = 1;
}

// Exported legacy MAP object
export const MAP = {
  width: COLS,
  height: ROWS,
  terrain,
  collision: flatCollision,
  tallGrass: tallGrassFlat,
};

/**
 * Generate collision and tallGrass arrays from terrain data.
 * Legacy compat — the flat collision array is already built above.
 */
export function generateMapData() {
  // Already computed during module init; this is a no-op for backwards compat.
}

// NPC spawn positions (tile coordinates — next to their respective buildings)
export const NPC_SPAWNS = [
  { id: 'ajumma',  col: 5,  row: 9,  direction: 'down',  palette: 'BROWN' },
  { id: 'hipster', col: 27, row: 9,  direction: 'down',  palette: 'GREEN' },
  { id: 'worker',  col: 17, row: 18, direction: 'left',  palette: 'BLUE'  },
  { id: 'grandma', col: 5,  row: 26, direction: 'down',  palette: 'RED'   },
  { id: 'senior',  col: 27, row: 26, direction: 'right', palette: 'BLUE'  },
];

// Player spawn position (tile coordinates, must be walkable)
export const PLAYER_START = {
  col: MAP_LAYERS.playerSpawn.x,
  row: MAP_LAYERS.playerSpawn.y,
};

/**
 * Check if a tile is walkable
 * @param {number} col - tile column (0 to COLS-1)
 * @param {number} row - tile row (0 to ROWS-1)
 * @returns {boolean}
 */
export function isWalkable(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  return MAP.collision[row * COLS + col] === 0;
}

/**
 * Check if a tile is tall grass (triggers encounters)
 * @param {number} col - tile column
 * @param {number} row - tile row
 * @returns {boolean}
 */
export function isTallGrass(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  return MAP.tallGrass[row * COLS + col] === 1;
}

/**
 * Get terrain type at tile coordinates
 * @param {number} col - tile column
 * @param {number} row - tile row
 * @returns {number} terrain type constant, or -1 if out of bounds
 */
export function getTerrainAt(col, row) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1;
  return MAP.terrain[row * COLS + col];
}

/**
 * Convert tile coordinates to pixel coordinates
 * @param {number} col - tile column
 * @param {number} row - tile row
 * @returns {{ x: number, y: number }} pixel position (top-left of tile)
 */
export function tileToPixel(col, row) {
  return { x: col * GAME.TILE, y: row * GAME.TILE };
}

/**
 * Convert pixel coordinates to tile coordinates
 * @param {number} x - pixel x
 * @param {number} y - pixel y
 * @returns {{ col: number, row: number }} tile coordinates
 */
export function pixelToTile(x, y) {
  return { col: Math.floor(x / GAME.TILE), row: Math.floor(y / GAME.TILE) };
}
