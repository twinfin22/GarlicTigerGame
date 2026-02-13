// mapData.js - 40x35 Seoul overworld map (Gen 3 GBA style)
// Procedurally generated layers instead of literal arrays

import { GAME } from '../config.js';

// Helper: fill a rectangular region
const fillRect = (layer, x, y, w, h, val) => {
  for (let row = y; row < y + h && row < layer.length; row++) {
    for (let col = x; col < x + w && col < layer[0].length; col++) {
      layer[row][col] = val;
    }
  }
};

// Helper: create 2D array
const createGrid = (cols, rows, fill = 'grass_1') =>
  Array.from({ length: rows }, () => Array(cols).fill(fill));

const COLS = GAME.MAP_COLS; // 40
const ROWS = GAME.MAP_ROWS; // 35

// === GROUND LAYER ===
const ground = createGrid(COLS, ROWS, 'grass_1');

// Grass variety (alternate patches for visual interest)
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    if ((x + y) % 7 === 0) ground[y][x] = 'grass_2';
    if ((x * 3 + y * 5) % 11 === 0) ground[y][x] = 'grass_3';
  }
}

// Paths -- main vertical path (center)
fillRect(ground, 19, 5, 2, 28, 'path_v');
// Horizontal connectors
fillRect(ground, 4, 9, 36, 2, 'path_h');   // top row connecting restaurant & apartment
fillRect(ground, 4, 18, 36, 2, 'path_h');   // middle row for subway
fillRect(ground, 4, 26, 36, 2, 'path_h');   // bottom row connecting chicken & cafe
// Cross paths at intersections
fillRect(ground, 19, 9, 2, 2, 'path_cross');
fillRect(ground, 19, 18, 2, 2, 'path_cross');
fillRect(ground, 19, 26, 2, 2, 'path_cross');

// Spawn area path
fillRect(ground, 18, 30, 4, 3, 'path_h');

// Water feature (small pond in park area)
fillRect(ground, 15, 6, 3, 2, 'water_1');

// Sand/park areas
fillRect(ground, 10, 5, 5, 3, 'sand_1');

// Flower patches
ground[5][12] = 'flowers_1';
ground[5][13] = 'flowers_2';
ground[6][11] = 'flowers_1';
ground[7][12] = 'flowers_2';

// === DECORATION LAYER ===
const decoration = createGrid(COLS, ROWS, null);

// Border trees (top)
fillRect(decoration, 0, 0, COLS, 3, 'tree_top');
// Border trees (bottom)
fillRect(decoration, 0, 33, COLS, 2, 'tree_top');
// Border trees (left)
fillRect(decoration, 0, 0, 3, ROWS, 'tree_trunk');
// Border trees (right)
fillRect(decoration, 37, 0, 3, ROWS, 'tree_trunk');

// Fence along paths
fillRect(decoration, 4, 8, 1, 1, 'fence');
fillRect(decoration, 35, 8, 1, 1, 'fence');

// Additional tree clusters for visual interest
fillRect(decoration, 12, 12, 2, 2, 'tree_leaves');
fillRect(decoration, 30, 12, 2, 2, 'tree_leaves');
fillRect(decoration, 8, 21, 2, 2, 'tree_leaves');
fillRect(decoration, 33, 21, 2, 2, 'tree_leaves');

// === BUILDINGS LAYER ===
const buildings = createGrid(COLS, ROWS, null);

// Restaurant (Quiz 1) -- top-left area
fillRect(buildings, 4, 7, 4, 2, 'building_wall');
fillRect(buildings, 4, 6, 4, 1, 'roof_1');
buildings[9][6] = 'door'; // door at (6, 9)

// Apartment (Quiz 2) -- top-right area
fillRect(buildings, 26, 7, 4, 2, 'building_wall');
fillRect(buildings, 26, 6, 4, 1, 'roof_1');
buildings[9][28] = 'door'; // door at (28, 9)

// Subway (Quiz 3) -- center
fillRect(buildings, 16, 16, 6, 2, 'building_wall');
fillRect(buildings, 16, 15, 6, 1, 'roof_2');
buildings[18][18] = 'door'; // door at (18, 18)

// Chicken shop (Quiz 4) -- bottom-left
fillRect(buildings, 4, 24, 4, 2, 'building_wall');
fillRect(buildings, 4, 23, 4, 1, 'roof_1');
buildings[26][6] = 'door'; // door at (6, 26)

// Cafe (Quiz 5) -- bottom-right
fillRect(buildings, 26, 24, 4, 2, 'building_wall');
fillRect(buildings, 26, 23, 4, 1, 'roof_2');
buildings[26][28] = 'door'; // door at (28, 26)

// === COLLISION LAYER (auto-derived) ===
const collision = createGrid(COLS, ROWS, 0);
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    // Water is solid
    if (ground[y][x] && ground[y][x].startsWith('water')) collision[y][x] = 1;
    // Trees are solid
    if (decoration[y][x] && (decoration[y][x].startsWith('tree') || decoration[y][x] === 'fence')) collision[y][x] = 1;
    // Buildings are solid (except doors)
    if (buildings[y][x] && buildings[y][x] !== 'door') collision[y][x] = 1;
  }
}

// === INTERACTIONS ===
const interactions = [
  { type: 'door', x: 6, y: 9, quizId: 1, label: { ko: '\uC2DD\uB2F9', en: 'Restaurant' } },
  { type: 'door', x: 28, y: 9, quizId: 2, label: { ko: '\uC544\uD30C\uD2B8', en: 'Apartment' } },
  { type: 'door', x: 18, y: 18, quizId: 3, label: { ko: '\uC9C0\uD558\uCCA0\uC5ED', en: 'Subway' } },
  { type: 'door', x: 6, y: 26, quizId: 4, label: { ko: '\uCE58\uD0A8\uC9D1', en: 'Chicken' } },
  { type: 'door', x: 28, y: 26, quizId: 5, label: { ko: '\uCE74\uD398', en: 'Cafe' } },
  { type: 'sign', x: 12, y: 15, textId: 'sign_seongsu' },
  { type: 'sign', x: 22, y: 23, textId: 'sign_gangnam' },
  { type: 'sign', x: 30, y: 15, textId: 'sign_hongdae' },
  { type: 'vending', x: 14, y: 20 },
  { type: 'convenience', x: 32, y: 18 },
  { type: 'pigeon', x: 25, y: 14 },
  { type: 'flyer', x: 10, y: 22 },
];

export const MAP_LAYERS = {
  ground,
  buildings,
  decoration,
  collision,
  interactions,
  playerSpawn: { x: 20, y: 31 },
};

// === BACKWARDS COMPATIBILITY ===
// The old OverworldScene imports MAP, NPC_SPAWNS, PLAYER_START, etc.
// Provide them as flat-array wrappers for scenes that haven't migrated yet.

// TERRAIN constants (legacy compat -- old numeric system)
export const TERRAIN = {
  GRASS: 0,
  GRASS_ALT: 1,
  TALL_GRASS: 2,
  PATH: 3,
  WATER: 4,
  FENCE: 5,
  BRIDGE: 6,
};

// Map string tile IDs to legacy numeric terrain types
const tileIdToTerrain = (id) => {
  if (!id) return TERRAIN.GRASS;
  if (id.startsWith('path')) return TERRAIN.PATH;
  if (id.startsWith('water')) return TERRAIN.WATER;
  if (id.startsWith('sand')) return TERRAIN.PATH; // sand is walkable
  if (id.startsWith('grass')) return TERRAIN.GRASS;
  if (id.startsWith('flowers')) return TERRAIN.GRASS;
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

// Exported legacy MAP object
export const MAP = {
  width: COLS,
  height: ROWS,
  terrain,
  collision: flatCollision,
  tallGrass: terrain.map(() => 0), // no tall grass in new map; encounters are door-based
};

/**
 * Generate collision and tallGrass arrays from terrain data.
 * Legacy compat -- the flat collision array is already built above.
 */
export function generateMapData() {
  // Already computed during module init; this is a no-op for backwards compat.
}

// NPC spawn positions (tile coordinates)
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
