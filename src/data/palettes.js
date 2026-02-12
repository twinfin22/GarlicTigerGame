// Pokemon Gold (GBC) Color Palettes
// Authentic Game Boy Color palette data
// 8 BG palettes x 4 colors each, 8 sprite palettes x 3+transparent colors

// Background palettes - 4 colors each (lightest to darkest)
export const BG_PALETTES = [
  { name: 'GRAY',   colors: [0xF0E0D0, 0x989898, 0x686868, 0x383838] },
  { name: 'RED',    colors: [0xF0E0D0, 0xF898C0, 0xF05030, 0x383838] },
  { name: 'GREEN',  colors: [0xF0E0D0, 0x78A008, 0x486800, 0x383838] },
  { name: 'WATER',  colors: [0xF0E0D0, 0x7880F8, 0x4848F8, 0x383838] },
  { name: 'YELLOW', colors: [0xF0E0D0, 0xE0B018, 0xA87010, 0x383838] },
  { name: 'BROWN',  colors: [0xD0C088, 0xA88838, 0x806818, 0x383838] },
  { name: 'ROOF',   colors: [0xF0E0D0, 0x8898F8, 0x7080F8, 0x383838] },
  { name: 'TEXT',   colors: [0xF8F880, 0xF8F880, 0x704800, 0x000000] },
];

// Sprite palettes - color 0 is always transparent (null)
export const SPRITE_PALETTES = [
  { name: 'TIGER',  colors: [null, 0xF89838, 0x383838, 0xF8F8F8] },
  { name: 'RED',    colors: [null, 0xF83000, 0xC82020, 0x383838] },
  { name: 'GREEN',  colors: [null, 0x78A008, 0x306828, 0x383838] },
  { name: 'BLUE',   colors: [null, 0x4890F8, 0x2050A8, 0x383838] },
  { name: 'BROWN',  colors: [null, 0xC89848, 0x885828, 0x383838] },
  { name: 'PINK',   colors: [null, 0xF898C0, 0xC85888, 0x383838] },
  { name: 'GRAY',   colors: [null, 0xB8B8B8, 0x686868, 0x383838] },
  { name: 'GOLD',   colors: [null, 0xE0B018, 0xA87010, 0x383838] },
];

// Battle/UI specific colors
export const BATTLE = {
  BG: 0xF8F8F8,
  TEXT: 0x000000,
  HP_GREEN: 0x00F800,
  HP_YELLOW: 0xF8F800,
  HP_RED: 0xF80000,
  BORDER: 0x000000,
  BOX_FILL: 0xF8F8F8,
};

// Overworld-specific color assignments (maps to BG palette indices)
export const OVERWORLD_COLORS = {
  GRASS_LIGHT: BG_PALETTES[2].colors[1],   // GREEN palette light
  GRASS_DARK: BG_PALETTES[2].colors[2],     // GREEN palette dark
  TALL_GRASS: BG_PALETTES[2].colors[2],     // GREEN palette dark
  PATH: BG_PALETTES[5].colors[0],           // BROWN palette lightest
  PATH_DARK: BG_PALETTES[5].colors[1],      // BROWN palette mid
  WATER: BG_PALETTES[3].colors[2],          // WATER palette dark
  WATER_LIGHT: BG_PALETTES[3].colors[1],    // WATER palette light
  BUILDING: BG_PALETTES[0].colors[0],       // GRAY palette lightest
  BUILDING_DARK: BG_PALETTES[0].colors[1],  // GRAY palette mid
  ROOF: BG_PALETTES[6].colors[2],           // ROOF palette dark
  ROOF_LIGHT: BG_PALETTES[6].colors[1],     // ROOF palette light
  TREE: BG_PALETTES[2].colors[2],           // GREEN palette dark
  TREE_LIGHT: BG_PALETTES[2].colors[1],     // GREEN palette light
  FENCE: BG_PALETTES[5].colors[1],          // BROWN palette mid
  BLACK: 0x383838,
  CREAM: 0xF0E0D0,
};

// UI color assignments
export const UI_COLORS = {
  BOX_BG: 0xF8F8F8,
  BOX_BORDER: 0x000000,
  TEXT_DARK: 0x383838,
  TEXT_LIGHT: 0xF0E0D0,
  HIGHLIGHT: 0xF89838,
  CURSOR: 0x383838,
  SHADOW: 0x989898,
};

// Screen transition colors
export const TRANSITION = {
  FADE_COLOR: 0x000000,
  FLASH_COLOR: 0xF8F8F8,
};

/**
 * Get a BG palette by name or index.
 * @param {string|number} nameOrIndex - Palette name (e.g. 'GREEN') or index (0-7)
 * @returns {{ name: string, colors: number[] }} The palette object
 */
export function getBgPalette(nameOrIndex) {
  if (typeof nameOrIndex === 'number') {
    if (nameOrIndex < 0 || nameOrIndex >= BG_PALETTES.length) {
      throw new Error(`BG palette index out of range: ${nameOrIndex}`);
    }
    return BG_PALETTES[nameOrIndex];
  }
  const palette = BG_PALETTES.find(p => p.name === nameOrIndex);
  if (!palette) {
    throw new Error(`BG palette not found: ${nameOrIndex}`);
  }
  return palette;
}

/**
 * Get a sprite palette by name or index.
 * @param {string|number} nameOrIndex - Palette name (e.g. 'TIGER') or index (0-7)
 * @returns {{ name: string, colors: (number|null)[] }} The palette object
 */
export function getSpritePalette(nameOrIndex) {
  if (typeof nameOrIndex === 'number') {
    if (nameOrIndex < 0 || nameOrIndex >= SPRITE_PALETTES.length) {
      throw new Error(`Sprite palette index out of range: ${nameOrIndex}`);
    }
    return SPRITE_PALETTES[nameOrIndex];
  }
  const palette = SPRITE_PALETTES.find(p => p.name === nameOrIndex);
  if (!palette) {
    throw new Error(`Sprite palette not found: ${nameOrIndex}`);
  }
  return palette;
}

/**
 * Convert a hex color number to a CSS color string.
 * @param {number} hex - Color as hex number (e.g. 0xF0E0D0)
 * @returns {string} CSS color string (e.g. '#f0e0d0')
 */
export function hexToCSS(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
}

/**
 * Convert a hex color number to Phaser-compatible RGB components.
 * @param {number} hex - Color as hex number (e.g. 0xF0E0D0)
 * @returns {{ r: number, g: number, b: number }} RGB components (0-255)
 */
export function hexToRGB(hex) {
  return {
    r: (hex >> 16) & 0xFF,
    g: (hex >> 8) & 0xFF,
    b: hex & 0xFF,
  };
}
