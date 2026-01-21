// Game Configuration
export const GAME_CONFIG = {
  // Screen dimensions - Game Boy aspect ratio scaled up (160x144 original)
  // Using 2.5x scale for mobile: 400x360, but we need portrait so we rotate concept
  WIDTH: 320,
  HEIGHT: 288, // True Game Boy ratio scaled 2x

  // Authentic Game Boy 4-color palette (DMG - Dot Matrix Game)
  // Original green-ish tint, but we'll use clean grayscale
  COLORS: {
    DARKEST: 0x0f380f,   // Black (GB: darkest green)
    DARK: 0x306230,      // Dark gray (GB: dark green)
    LIGHT: 0x8bac0f,     // Light gray (GB: light green)
    LIGHTEST: 0x9bbc0f,  // White (GB: lightest green)
    // Monochrome alternative (Game Boy Pocket style)
    BLACK: 0x202020,
    DARK_GRAY: 0x606060,
    LIGHT_GRAY: 0xa0a0a0,
    WHITE: 0xe0e0e0,
  },

  // Use Game Boy green palette for authentic feel
  USE_GREEN_PALETTE: true,

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
