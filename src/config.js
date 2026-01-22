// Game Configuration
export const GAME_CONFIG = {
  // Screen dimensions - Game Boy aspect ratio scaled up (160x144 original)
  // Using 2.5x scale for mobile: 400x360, but we need portrait so we rotate concept
  WIDTH: 320,
  HEIGHT: 288, // True Game Boy ratio scaled 2x

  // Pokemon Red/Blue style palette - bright and colorful
  COLORS: {
    DARKEST: 0x000000,   // Pure black (borders/text)
    DARK: 0x555555,      // Dark gray (secondary)
    LIGHT: 0xaaaaaa,     // Light gray (disabled/shadow)
    LIGHTEST: 0xffffff,  // Pure white (backgrounds)
    // Pokemon-style environment colors
    GRASS_LIGHT: 0x90ee90,  // Light green grass
    GRASS_DARK: 0x228b22,   // Darker grass accent
    PATH: 0xd2b48c,         // Tan/brown path
    WATER: 0x87ceeb,        // Sky blue water
    TREE_GREEN: 0x228b22,   // Forest green
    ROOF_RED: 0xcd5c5c,     // Indian red for roofs
    // Legacy references (kept for compatibility)
    BLACK: 0x000000,
    DARK_GRAY: 0x555555,
    LIGHT_GRAY: 0xaaaaaa,
    WHITE: 0xffffff,
  },

  // Use Pokemon Red/Blue clean palette
  USE_GREEN_PALETTE: false,

  // Typography
  FONTS: {
    MAIN: 'Press Start 2P',
    FALLBACK: 'monospace',
  },

  // Text sizes - LARGER for readability
  TEXT_SIZES: {
    TINY: 10,
    SMALL: 12,
    MEDIUM: 14,
    LARGE: 18,
    TITLE: 24,
  },

  // Game settings
  SETTINGS: {
    TOTAL_GARLICS: 5,
    TILES_BEFORE_ENCOUNTER: 12,
    TYPEWRITER_SPEED: 30, // ms per character
    TRANSITION_DURATION: 500,
  },

  // LocalNomad branding
  BRANDING: {
    URL: 'https://localnomad.club',
    NAME: 'LocalNomad',
  },
};

// Scene keys
export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  TITLE: 'TitleScene',
  INTRO: 'IntroScene',
  OVERWORLD: 'OverworldScene',
  QUIZ: 'QuizScene',
  TRANSFORM: 'TransformScene',
  GAME_OVER: 'GameOverScene',
  VICTORY: 'VictoryScene',
  SCROLL: 'ScrollScene',
};

// Game state defaults
export const INITIAL_STATE = {
  garlicsCollected: 0,
  currentQuiz: 0,
  transformationStage: 0,
  tilesWalked: 0,
  gameStarted: false,
  gameCompleted: false,
};
