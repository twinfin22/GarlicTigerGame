// Game Configuration
export const GAME_CONFIG = {
  // Screen dimensions (16:9 mobile portrait base)
  WIDTH: 360,
  HEIGHT: 640,

  // Colors (Game Boy monochrome style)
  COLORS: {
    BLACK: 0x1a1a1a,
    DARK_GRAY: 0x4a4a4a,
    MID_GRAY: 0x8a8a8a,
    LIGHT_GRAY: 0xcacaca,
    WHITE: 0xf0f0f0,
    RED: 0xff4444, // For wrong answers
    GREEN: 0x44ff44, // For correct answers
  },

  // Typography
  FONTS: {
    MAIN: 'Press Start 2P',
    FALLBACK: 'monospace',
  },

  // Text sizes
  TEXT_SIZES: {
    TINY: 8,
    SMALL: 10,
    MEDIUM: 12,
    LARGE: 16,
    TITLE: 20,
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
