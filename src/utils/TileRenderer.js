// TileRenderer.js - Gen 3 GBA tileset-based renderer + legacy UI drawing
// Renders tiles from spritesheet tilesets and provides Pokemon-style UI utilities

import { GAME } from '../config.js';

// ==============================================
// TILESET-BASED TILE RENDERER (Gen 3 GBA)
// ==============================================

/**
 * TileRenderer - draws tiles from a tileset spritesheet image.
 * Uses Phaser's image + setCrop to extract individual tiles.
 */
export class TileRenderer {
  constructor(scene) {
    this.scene = scene;
    this.tilesetData = null;
  }

  /**
   * Load tileset mapping data (from tileset_map.json)
   * @param {object} data - { tileWidth, tileHeight, cols, rows, tiles: { [id]: { col, row } } }
   */
  loadTilesetData(data) {
    this.tilesetData = data;
  }

  /**
   * Draw a tile from the primary tileset at a world position.
   * @param {string} tileId - tile identifier (e.g. 'grass_1', 'path_h')
   * @param {number} worldX - pixel x in world coords
   * @param {number} worldY - pixel y in world coords
   * @returns {Phaser.GameObjects.Image|Phaser.GameObjects.Rectangle} the placed tile
   */
  drawTile(tileId, worldX, worldY) {
    if (!this.tilesetData || !this.tilesetData.tiles[tileId]) {
      // Fallback: draw colored rectangle
      return this.drawFallbackTile(tileId, worldX, worldY);
    }

    const tile = this.tilesetData.tiles[tileId];
    const cols = this.tilesetData.cols;
    const frameIndex = tile.row * cols + tile.col;

    const img = this.scene.add.image(worldX + GAME.TILE / 2, worldY + GAME.TILE / 2, 'tileset_primary', frameIndex);
    img.setOrigin(0.5, 0.5);
    return img;
  }

  /**
   * Draw a color-coded fallback rectangle for tiles missing from the tileset.
   * @param {string} tileId - tile identifier
   * @param {number} worldX - pixel x
   * @param {number} worldY - pixel y
   * @returns {Phaser.GameObjects.Rectangle}
   */
  drawFallbackTile(tileId, worldX, worldY) {
    const colors = {
      grass: 0x7EC850,
      path: 0xD2B48C,
      water: 0x5090D0,
      tree: 0x306030,
      building: 0x808080,
      roof: 0xA04040,
      door: 0x804020,
      fence: 0x906840,
      sand: 0xE8D8A0,
      flower: 0xFF8080,
      default: 0xCCCCCC,
    };

    let color = colors.default;
    for (const [key, c] of Object.entries(colors)) {
      if (tileId && tileId.startsWith(key)) {
        color = c;
        break;
      }
    }

    const rect = this.scene.add.rectangle(
      worldX + GAME.TILE / 2,
      worldY + GAME.TILE / 2,
      GAME.TILE,
      GAME.TILE,
      color
    );
    rect.setOrigin(0.5, 0.5);
    return rect;
  }
}

// ==============================================
// LEGACY UI DRAWING (preserved for all existing imports)
// ==============================================

// Import palettes and sprite data for legacy functions
// These are lazy-loaded to avoid circular dependency issues
let _palettes = null;
let _sprites = null;

async function _loadPalettes() {
  if (!_palettes) {
    try {
      _palettes = await import('../data/palettes.js');
    } catch (e) {
      // Palettes module not available; provide sensible defaults
      _palettes = {
        BG_PALETTES: [],
        SPRITE_PALETTES: [],
        BATTLE: {
          BOX_FILL: 0xF8F8F8,
          BORDER: 0x383838,
          TEXT: 0x383838,
          HP_GREEN: 0x58A058,
          HP_YELLOW: 0xF8D878,
          HP_RED: 0xF85858,
        },
        getBgPalette: () => ({ colors: [0xF8F8F8, 0xA8A8A8, 0x585858, 0x383838] }),
        getSpritePalette: () => ({ colors: [null, 0x383838, 0xF89868, 0xF8D878] }),
        hexToCSS: (h) => `#${h.toString(16).padStart(6, '0')}`,
      };
    }
  }
  return _palettes;
}

async function _loadSprites() {
  if (!_sprites) {
    try {
      _sprites = await import('../data/spriteData.js');
    } catch (e) {
      _sprites = {};
    }
  }
  return _sprites;
}

// Eagerly try to load (for sync callers relying on module-level init)
let _palettesSync = null;
let _spritesSync = null;

try {
  // Dynamic import is async, but we set up the sync references once resolved
  import('../data/palettes.js').then(m => { _palettesSync = m; _palettes = m; }).catch(() => {});
  import('../data/spriteData.js').then(m => { _spritesSync = m; _sprites = m; }).catch(() => {});
} catch (e) {
  // Static analysis might complain; safe to ignore
}

// Safe palette/sprite accessors that work synchronously after first import
const getPalettes = () => {
  if (_palettesSync) return _palettesSync;
  // Fallback defaults
  return {
    BG_PALETTES: [],
    BATTLE: {
      BOX_FILL: 0xF8F8F8,
      BORDER: 0x383838,
      TEXT: 0x383838,
      HP_GREEN: 0x58A058,
      HP_YELLOW: 0xF8D878,
      HP_RED: 0xF85858,
    },
    getBgPalette: () => ({ colors: [0xF8F8F8, 0xA8A8A8, 0x585858, 0x383838] }),
    getSpritePalette: () => ({ colors: [null, 0x383838, 0xF89868, 0xF8D878] }),
    hexToCSS: (h) => `#${h.toString(16).padStart(6, '0')}`,
  };
};

const getSprites = () => _spritesSync || {};

// ==============================================
// CORE TILE DRAWING (legacy pixel-level)
// ==============================================

/**
 * Draw a single 8x8 tile using palette colors
 * @param {Phaser.GameObjects.Graphics} graphics
 * @param {number} x - pixel x position
 * @param {number} y - pixel y position
 * @param {number[]} tileData - 64-element array of color indices (0-3, -1=transparent)
 * @param {object} palette - { colors: [color0, color1, color2, color3] }
 */
export function drawTile8(graphics, x, y, tileData, palette) {
  const colors = palette.colors;
  for (let i = 0; i < 64; i++) {
    const idx = tileData[i];
    if (idx >= 0 && idx < 4) {
      graphics.fillStyle(colors[idx]);
      graphics.fillRect(x + (i % 8), y + Math.floor(i / 8), 1, 1);
    }
  }
}

/**
 * Draw a 16x16 sprite (2x2 tiles) with palette
 * Sprite palette: index 0 = transparent, 1-3 = colors
 */
export function drawSprite16(graphics, x, y, spriteData, palette) {
  const colors = palette.colors;
  for (let i = 0; i < 256; i++) {
    const idx = spriteData[i];
    if (idx === undefined || idx === null || idx < 0) continue;
    if (colors[idx] === null) continue;
    graphics.fillStyle(colors[idx]);
    graphics.fillRect(x + (i % 16), y + Math.floor(i / 16), 1, 1);
  }
}

/**
 * Draw overworld sprites using index -1 as transparent and 0-3 as actual colors
 */
export function drawOverworldSprite(graphics, x, y, spriteData, palette) {
  const colors = palette.colors;
  const w = Math.round(Math.sqrt(spriteData.length));
  for (let i = 0; i < spriteData.length; i++) {
    const idx = spriteData[i];
    if (idx >= 0 && idx < 4 && colors[idx] !== null) {
      graphics.fillStyle(colors[idx]);
      graphics.fillRect(x + (i % w), y + Math.floor(i / w), 1, 1);
    }
  }
}

/**
 * Draw large battle sprites (48x48, 56x56, etc.)
 */
export function drawSpriteLarge(graphics, x, y, spriteData, width, height, palette) {
  const colors = palette.colors;
  for (let i = 0; i < spriteData.length; i++) {
    const idx = spriteData[i];
    if (idx >= 0 && idx < 4 && colors[idx] !== null) {
      graphics.fillStyle(colors[idx]);
      graphics.fillRect(x + (i % width), y + Math.floor(i / width), 1, 1);
    }
  }
}

// ==============================================
// VIEWPORT RENDERER (scrolling map)
// ==============================================

/**
 * Render the visible tile window from a scrolling map.
 * Now supports both old 8px tile maps and new 16px tile maps.
 */
export function renderViewport(scene, mapData, cameraX, cameraY, frame = 0) {
  const g = scene.add.graphics();
  const tileSize = GAME.TILE; // 16 for Gen 3, was 8 for GBC
  const startCol = Math.floor(cameraX / tileSize);
  const startRow = Math.floor(cameraY / tileSize);
  const offsetX = -(cameraX % tileSize);
  const offsetY = -(cameraY % tileSize);

  const viewCols = Math.ceil(GAME.WIDTH / tileSize) + 1;
  const viewRows = Math.ceil(GAME.HEIGHT / tileSize) + 1;

  for (let row = 0; row < viewRows; row++) {
    for (let col = 0; col < viewCols; col++) {
      const mapCol = startCol + col;
      const mapRow = startRow + row;

      if (mapCol < 0 || mapCol >= mapData.width || mapRow < 0 || mapRow >= mapData.height) {
        // Out of bounds - draw dark border
        g.fillStyle(0x383838);
        g.fillRect(offsetX + col * tileSize, offsetY + row * tileSize, tileSize, tileSize);
        continue;
      }

      const tileIdx = mapRow * mapData.width + mapCol;
      const terrainType = mapData.terrain[tileIdx];
      const px = offsetX + col * tileSize;
      const py = offsetY + row * tileSize;

      drawTerrainTile(g, px, py, terrainType, frame, tileSize);
    }
  }

  return g;
}

/**
 * Internal terrain tile renderer - draws colored rectangles for each terrain type.
 * Used by the legacy renderViewport path; the new MapBuilder uses tileset images instead.
 */
function drawTerrainTile(g, x, y, terrainType, frame, tileSize = 16) {
  // Gen 3 GBA colors (richer than GBC)
  const COLORS = {
    GRASS: 0x7EC850,
    GRASS_ALT: 0x68B840,
    TALL_GRASS: 0x58A830,
    PATH: 0xD2B48C,
    WATER_1: 0x5090D0,
    WATER_2: 0x4080C0,
    FENCE: 0x906840,
    BRIDGE: 0xC8A870,
    DARK: 0x383838,
  };

  const Sprites = getSprites();
  const pal = getPalettes();

  // Try pixel-level rendering if sprite data is available and tile size is 8
  if (tileSize === 8 && Sprites.TILE_GRASS && pal.BG_PALETTES && pal.BG_PALETTES.length > 0) {
    const greenPal = pal.BG_PALETTES[2];
    const brownPal = pal.BG_PALETTES[5];
    const waterPal = pal.BG_PALETTES[3];

    switch (terrainType) {
      case 0: drawTile8(g, x, y, Sprites.TILE_GRASS, greenPal); return;
      case 1: drawTile8(g, x, y, Sprites.TILE_GRASS_ALT || Sprites.TILE_GRASS, greenPal); return;
      case 2: drawTile8(g, x, y, Sprites.TILE_TALL_GRASS || Sprites.TILE_GRASS, greenPal); return;
      case 3: drawTile8(g, x, y, Sprites.TILE_PATH, brownPal); return;
      case 4: drawTile8(g, x, y, frame === 0 ? Sprites.TILE_WATER_1 : (Sprites.TILE_WATER_2 || Sprites.TILE_WATER_1), waterPal); return;
      case 5: drawTile8(g, x, y, Sprites.TILE_FENCE || Sprites.TILE_PATH, brownPal); return;
      case 6:
        g.fillStyle(brownPal.colors[0]);
        g.fillRect(x, y, 8, 8);
        g.fillStyle(brownPal.colors[1]);
        g.fillRect(x + 1, y, 6, 8);
        return;
      default: drawTile8(g, x, y, Sprites.TILE_GRASS, greenPal); return;
    }
  }

  // Fallback: solid color rectangles (works at any tile size)
  switch (terrainType) {
    case 0: g.fillStyle(COLORS.GRASS); break;
    case 1: g.fillStyle(COLORS.GRASS_ALT); break;
    case 2: g.fillStyle(COLORS.TALL_GRASS); break;
    case 3: g.fillStyle(COLORS.PATH); break;
    case 4: g.fillStyle(frame === 0 ? COLORS.WATER_1 : COLORS.WATER_2); break;
    case 5: g.fillStyle(COLORS.FENCE); break;
    case 6: g.fillStyle(COLORS.BRIDGE); break;
    default: g.fillStyle(COLORS.GRASS); break;
  }
  g.fillRect(x, y, tileSize, tileSize);
}

// ==============================================
// UI DRAWING FUNCTIONS
// ==============================================

/**
 * Pokemon-style dialog border (double-line frame)
 */
export function drawDialogFrame(graphics, x, y, w, h) {
  const B = getPalettes().BATTLE;

  // White fill
  graphics.fillStyle(B.BOX_FILL);
  graphics.fillRect(x, y, w, h);

  // Outer black border (1px)
  graphics.lineStyle(1, B.BORDER);
  graphics.strokeRect(x, y, w, h);

  // Inner white line (1px inset)
  graphics.lineStyle(1, B.BOX_FILL);
  graphics.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // Inner-inner black line (2px inset)
  graphics.lineStyle(1, B.BORDER);
  graphics.strokeRect(x + 2, y + 2, w - 4, h - 4);
}

/**
 * Draw HP bar at given position
 */
export function drawHPBar(graphics, x, y, current, max) {
  const B = getPalettes().BATTLE;
  const barWidth = 48;
  const barHeight = 2;
  const ratio = Math.max(0, Math.min(1, current / max));
  const fillWidth = Math.round(barWidth * ratio);

  graphics.fillStyle(0x383838);
  graphics.fillRect(x, y, barWidth, barHeight);

  let color = B.HP_GREEN;
  if (ratio <= 0.2) color = B.HP_RED;
  else if (ratio <= 0.5) color = B.HP_YELLOW;

  if (fillWidth > 0) {
    graphics.fillStyle(color);
    graphics.fillRect(x, y, fillWidth, barHeight);
  }
}

/**
 * Draw Pokemon menu box with cursor (right-aligned overlay style)
 */
export function drawMenuBox(graphics, x, y, w, h) {
  drawDialogFrame(graphics, x, y, w, h);
}

/**
 * Draw cursor triangle (right-pointing) at position
 */
export function drawCursor(graphics, x, y) {
  const B = getPalettes().BATTLE;
  graphics.fillStyle(B.TEXT);
  graphics.fillTriangle(x, y, x, y + 6, x + 4, y + 3);
}

/**
 * Draw continue indicator triangle (down-pointing) at position
 */
export function drawContinueIndicator(graphics, x, y) {
  const B = getPalettes().BATTLE;
  graphics.fillStyle(B.TEXT);
  graphics.fillTriangle(x, y, x + 6, y, x + 3, y + 4);
}

// ==============================================
// BATTLE TRANSITION
// ==============================================

/**
 * Horizontal bar wipe transition (alternating from L/R)
 */
export function createBattleTransition(scene, callback) {
  const width = GAME.WIDTH;
  const height = GAME.HEIGHT;
  const barCount = 12;
  const barHeight = Math.ceil(height / barCount);

  for (let i = 0; i < barCount; i++) {
    const bar = scene.add.rectangle(
      i % 2 === 0 ? -width : width * 2,
      i * barHeight + barHeight / 2,
      width,
      barHeight + 1,
      0x383838
    );

    scene.tweens.add({
      targets: bar,
      x: width / 2,
      duration: 200,
      delay: i * 25,
      ease: 'Cubic.easeOut',
    });
  }

  scene.time.delayedCall(barCount * 25 + 250, callback);
}

// ==============================================
// GARLIC COUNTER HUD
// ==============================================

/**
 * Draw garlic counter overlay (top-right of screen)
 */
export function drawGarlicCounter(scene, x, y, count, total) {
  const container = scene.add.container(x, y);
  const Sprites = getSprites();
  const pal = getPalettes();

  // Background
  const bg = scene.add.graphics();
  bg.fillStyle(0x383838, 0.8);
  bg.fillRect(-20, -6, 40, 12);
  container.add(bg);

  // Garlic icon (8x8)
  const garlicG = scene.add.graphics();
  if (Sprites.UI_GARLIC && pal.getBgPalette) {
    drawOverworldSprite(garlicG, -18, -4, Sprites.UI_GARLIC, pal.getBgPalette('GRAY'));
  }
  container.add(garlicG);

  // Count text
  const text = scene.add.text(4, 0, `${count}/${total}`, {
    fontFamily: GAME.FONT_EN,
    fontSize: `${GAME.FONT_SIZE}px`,
    color: '#F8F8F8',
  }).setOrigin(0.5);
  container.add(text);

  return { container, text };
}

// ==============================================
// SHARED DRAWING UTILITIES
// ==============================================

/**
 * Draw tiger at any transformation stage
 */
export function drawTigerAtStage(scene, x, y, stage, palette) {
  const g = scene.add.graphics();
  const Sprites = getSprites();
  const pal = getPalettes();

  const spriteData = Sprites.TIGER_FRONT;
  if (!spriteData) return g;

  const spritePal = pal.getSpritePalette ? pal.getSpritePalette('TIGER') : { colors: [null, 0x383838, 0xF89868, 0xF8D878] };

  // Clone palette colors for stage modifications
  const colors = [...spritePal.colors];

  // Progressive transformation
  if (stage >= 1) colors[2] = 0xF8F8F8;
  if (stage >= 4) colors[1] = 0x383838;

  const customPalette = { colors };

  for (let i = 0; i < spriteData.length; i++) {
    const idx = spriteData[i];
    if (idx >= 0 && idx < 4 && customPalette.colors[idx] !== null) {
      g.fillStyle(customPalette.colors[idx]);
      g.fillRect(x + (i % 16), y + Math.floor(i / 16), 1, 1);
    }
  }

  // Speech bubble at stage 3+
  if (stage >= 3) {
    const bx = x + 17;
    const by = y;
    g.fillStyle(0xF8F8F8);
    g.fillRect(bx, by, 14, 8);
    g.fillTriangle(bx, by + 3, bx, by + 7, bx - 2, by + 5);
    g.lineStyle(1, 0x383838);
    g.strokeRect(bx, by, 14, 8);

    scene.add.text(bx + 1, by + 1, 'TH?', {
      fontFamily: GAME.FONT_EN,
      fontSize: '6px',
      color: '#383838',
    });
  }

  return g;
}

/**
 * Draw Hanok gate for intro/victory scenes
 */
export function drawHanokGate(scene, x, y, options = {}) {
  const { open = false } = options;
  const g = scene.add.graphics();

  // Gate structure
  g.fillStyle(0x686868);
  g.fillRect(x - 50, y, 100, 60);

  // Gate opening
  g.fillStyle(open ? 0xF0E0D0 : 0x383838);
  g.fillRect(x - 20, y + 20, 40, 40);

  if (!open) {
    g.fillStyle(0x989898);
    g.fillRect(x - 18, y + 22, 17, 36);
    g.fillRect(x + 1, y + 22, 17, 36);
    g.fillStyle(0x686868);
    g.fillRect(x - 14, y + 26, 10, 16);
    g.fillRect(x + 5, y + 26, 10, 16);
  }

  // Roof (bottom tier)
  g.fillStyle(0x383838);
  g.fillRect(x - 60, y - 10, 120, 12);
  g.fillTriangle(x - 60, y - 10, x - 70, y + 2, x - 50, y + 2);
  g.fillTriangle(x + 60, y - 10, x + 70, y + 2, x + 50, y + 2);

  // Second roof tier
  g.fillStyle(0x686868);
  g.fillRect(x - 45, y - 20, 90, 11);

  // Pillars
  g.fillStyle(0x989898);
  g.fillRect(x - 48, y, 8, 60);
  g.fillRect(x + 40, y, 8, 60);

  // Sign plaque
  g.fillStyle(0xF0E0D0);
  g.fillRect(x - 25, y + 5, 50, 12);
  g.lineStyle(1, 0x686868);
  g.strokeRect(x - 25, y + 5, 50, 12);

  scene.add.text(x, y + 11, 'K-DIGITAL', {
    fontFamily: GAME.FONT_EN,
    fontSize: '6px',
    color: '#383838',
  }).setOrigin(0.5);

  return g;
}
