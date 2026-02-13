// Game Configuration — Pokemon FireRed/LeafGreen GBA Style (240x160 native)

export const GAME = {
  WIDTH: 240,
  HEIGHT: 160,
  TILE: 16,
  SPRITE: 32,
  MAP_COLS: 40,
  MAP_ROWS: 35,
  MAP_VIEW_COLS: 15,  // tiles visible horizontally (240/16)
  MAP_VIEW_ROWS: 10,  // tiles visible vertically (160/16)
  WALK_PX_PER_FRAME: 2,
  WALK_FRAMES: 8,     // 8 frames to cross one 16px tile at 2px/frame
  TOTAL_GARLICS: 5,
  TYPEWRITER_MS: 30,
  DIALOG_LINES: 3,           // bilingual needs more lines
  DIALOG_CHARS_PER_LINE: 28, // wider screen fits more chars
  FONT_EN: 'Press Start 2P',
  FONT_KO: 'Galmuri11',
  FONT_SIZE: 8,
  FONT_FALLBACK: 'monospace',
};

export const QUIZ_LOCATIONS = {
  restaurant: { x: 6, y: 9, quizId: 1 },
  apartment:  { x: 28, y: 9, quizId: 2 },
  subway:     { x: 18, y: 18, quizId: 3 },
  chicken:    { x: 6, y: 26, quizId: 4 },
  cafe:       { x: 28, y: 26, quizId: 5 },
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
};

export const INITIAL_STATE = {
  garlicsCollected: 0,
  currentQuiz: 0,
  transformationStage: 0,
  tilesWalked: 0,
  gameStarted: false,
  gameCompleted: false,
  defeatedNPCs: [],
};

export const BRANDING = {
  URL: 'https://localnomad.club',
  NAME: 'LocalNomad',
};

// Tile type constants (Gen 3 tileset compatible)
export const TILE = {
  EMPTY: 0,
  GRASS: 1,
  TALL_GRASS: 2,
  PATH: 3,
  WATER: 4,
  TREE: 5,
  BUILDING_WALL: 6,
  BUILDING_ROOF: 7,
  DOOR: 8,
  FENCE: 9,
  SIGN: 10,
  BRIDGE: 11,
  LEDGE: 12,
  SAND: 13,
  FLOWER: 14,
  ROOF_EDGE: 15,
  WINDOW: 16,
  STAIRS: 17,
};

// Solid (non-walkable) tiles
export const SOLID_TILES = [
  TILE.WATER,
  TILE.TREE,
  TILE.BUILDING_WALL,
  TILE.BUILDING_ROOF,
  TILE.FENCE,
  TILE.LEDGE,
  TILE.ROOF_EDGE,
  TILE.WINDOW,
];
