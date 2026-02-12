// Game Configuration — Pokemon Gold GBC Style (160x144 native)

export const GAME = {
  WIDTH: 160,
  HEIGHT: 144,
  TILE: 8,
  SPRITE: 16,
  MAP_COLS: 32,
  MAP_ROWS: 32,
  MAP_VIEW_COLS: 20,  // tiles visible horizontally (160/8)
  MAP_VIEW_ROWS: 18,  // tiles visible vertically (144/8)
  WALK_PX_PER_FRAME: 2,
  WALK_FRAMES: 8,     // 8 frames to cross one 16px tile at 2px/frame
  TOTAL_GARLICS: 5,
  ENCOUNTER_MIN_STEPS: 3,
  ENCOUNTER_CHANCE: 0.25,
  TYPEWRITER_MS: 30,
  DIALOG_LINES: 2,
  DIALOG_CHARS_PER_LINE: 18,
  FONT: 'Press Start 2P',
  FONT_SIZE: 8,
  FONT_FALLBACK: 'monospace',
};

export const SCENES = {
  BOOT: 'BootScene',
  TITLE: 'TitleScene',
  INTRO: 'IntroScene',
  OVERWORLD: 'OverworldScene',
  QUIZ: 'QuizScene',
  TRANSFORM: 'TransformScene',
  GAME_OVER: 'GameOverScene',
  VICTORY: 'VictoryScene',
  SCROLL: 'ScrollScene',
};

export const INITIAL_STATE = {
  garlicsCollected: 0,
  currentQuiz: 0,
  transformationStage: 0,
  tilesWalked: 0,
  stepsInGrass: 0,
  gameStarted: false,
  gameCompleted: false,
  defeatedNPCs: [],
};

export const BRANDING = {
  URL: 'https://localnomad.club',
  NAME: 'LocalNomad',
};

// Tile type constants
export const TILE = {
  EMPTY: 0,
  GRASS: 1,
  TALL_GRASS: 2,
  PATH: 3,
  WATER: 4,
  TREE_TOP: 5,
  TREE_TRUNK: 6,
  BUILDING_WALL: 7,
  BUILDING_ROOF: 8,
  DOOR: 9,
  FENCE: 10,
  SIGN: 11,
  BRIDGE: 12,
  TOWER_BASE: 13,
  TOWER_TOP: 14,
  SUBWAY: 15,
  STORE_TOP: 16,
  STORE_BOTTOM: 17,
};

// Solid (non-walkable) tiles
export const SOLID_TILES = [
  TILE.WATER, TILE.TREE_TOP, TILE.TREE_TRUNK,
  TILE.BUILDING_WALL, TILE.BUILDING_ROOF,
  TILE.FENCE, TILE.TOWER_BASE, TILE.TOWER_TOP,
  TILE.STORE_TOP,
];
