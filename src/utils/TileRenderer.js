// TileRenderer.js - Pokemon Gold style rendering engine
// All rendering for the 160x144 native resolution game

import { BG_PALETTES, SPRITE_PALETTES, BATTLE, getBgPalette, getSpritePalette, hexToCSS } from '../data/palettes.js';
import * as Sprites from '../data/spriteData.js';

// ==============================================
// CORE TILE DRAWING
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
    // For sprite palettes, index 0 maps to colors[0] which is null (transparent)
    if (colors[idx] === null) continue;
    graphics.fillStyle(colors[idx]);
    graphics.fillRect(x + (i % 16), y + Math.floor(i / 16), 1, 1);
  }
}

/**
 * Draw overworld sprites that use index -1 as transparent and 0-3 as actual colors
 * @param {Phaser.GameObjects.Graphics} graphics
 * @param {number} x - pixel x position
 * @param {number} y - pixel y position
 * @param {number[]} spriteData - array of color indices (-1=transparent, 0-3=colors)
 * @param {object} palette - { colors: [color0, color1, color2, color3] }
 */
export function drawOverworldSprite(graphics, x, y, spriteData, palette) {
  const colors = palette.colors;
  const w = Math.round(Math.sqrt(spriteData.length)); // 16 for 16x16, 8 for 8x8
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
 * @param {Phaser.GameObjects.Graphics} graphics
 * @param {number} x - pixel x position
 * @param {number} y - pixel y position
 * @param {number[]} spriteData - flat array of color indices
 * @param {number} width - sprite width in pixels
 * @param {number} height - sprite height in pixels (unused, derived from data length)
 * @param {object} palette - { colors: [color0, color1, color2, color3] }
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
 * Render the visible 20x18 tile window from a scrolling map
 * @param {Phaser.Scene} scene
 * @param {object} mapData - { terrain, collision, tallGrass, width, height }
 * @param {number} cameraX - pixel offset of camera (top-left corner)
 * @param {number} cameraY - pixel offset of camera
 * @param {number} frame - animation frame (0 or 1) for water/tall grass
 * @returns {Phaser.GameObjects.Graphics} the graphics object with rendered tiles
 */
export function renderViewport(scene, mapData, cameraX, cameraY, frame = 0) {
  const g = scene.add.graphics();
  const tileSize = 8;
  const startCol = Math.floor(cameraX / tileSize);
  const startRow = Math.floor(cameraY / tileSize);
  const offsetX = -(cameraX % tileSize);
  const offsetY = -(cameraY % tileSize);

  // Draw 21x19 tiles (1 extra for partial tile visibility during scrolling)
  for (let row = 0; row < 19; row++) {
    for (let col = 0; col < 21; col++) {
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

      drawTerrainTile(g, px, py, terrainType, frame);
    }
  }

  return g;
}

/**
 * Internal terrain tile renderer - draws the correct tile pattern for each terrain type
 * @param {Phaser.GameObjects.Graphics} g
 * @param {number} x - pixel x
 * @param {number} y - pixel y
 * @param {number} terrainType - terrain constant from mapData.js
 * @param {number} frame - animation frame for animated tiles
 */
function drawTerrainTile(g, x, y, terrainType, frame) {
  const greenPal = BG_PALETTES[2]; // GREEN
  const brownPal = BG_PALETTES[5]; // BROWN
  const waterPal = BG_PALETTES[3]; // WATER

  switch (terrainType) {
    case 0: // GRASS
      drawTile8(g, x, y, Sprites.TILE_GRASS, greenPal);
      break;
    case 1: // GRASS_ALT
      drawTile8(g, x, y, Sprites.TILE_GRASS_ALT, greenPal);
      break;
    case 2: // TALL_GRASS
      drawTile8(g, x, y, Sprites.TILE_TALL_GRASS, greenPal);
      break;
    case 3: // PATH
      drawTile8(g, x, y, Sprites.TILE_PATH, brownPal);
      break;
    case 4: // WATER (animated)
      drawTile8(g, x, y, frame === 0 ? Sprites.TILE_WATER_1 : Sprites.TILE_WATER_2, waterPal);
      break;
    case 5: // FENCE
      drawTile8(g, x, y, Sprites.TILE_FENCE, brownPal);
      break;
    case 6: { // BRIDGE
      g.fillStyle(brownPal.colors[0]);
      g.fillRect(x, y, 8, 8);
      g.fillStyle(brownPal.colors[1]);
      g.fillRect(x + 1, y, 6, 8);
      break;
    }
    default: // Default to grass
      drawTile8(g, x, y, Sprites.TILE_GRASS, greenPal);
  }
}

// ==============================================
// UI DRAWING FUNCTIONS
// ==============================================

/**
 * Pokemon Gold dialog border (double-line frame)
 * 1px black outer + 1px white inner + 1px black inner
 * @param {Phaser.GameObjects.Graphics} graphics
 * @param {number} x - top-left x
 * @param {number} y - top-left y
 * @param {number} w - width
 * @param {number} h - height
 */
export function drawDialogFrame(graphics, x, y, w, h) {
  // White fill
  graphics.fillStyle(BATTLE.BOX_FILL);
  graphics.fillRect(x, y, w, h);

  // Outer black border (1px)
  graphics.lineStyle(1, BATTLE.BORDER);
  graphics.strokeRect(x, y, w, h);

  // Inner white line (1px inset)
  graphics.lineStyle(1, BATTLE.BOX_FILL);
  graphics.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // Inner-inner black line (2px inset) - the actual Pokemon Gold double border
  graphics.lineStyle(1, BATTLE.BORDER);
  graphics.strokeRect(x + 2, y + 2, w - 4, h - 4);
}

/**
 * Draw HP bar at given position
 * 48px total width; green > 50%, yellow > 20%, red <= 20%
 * @param {Phaser.GameObjects.Graphics} graphics
 * @param {number} x - bar x position
 * @param {number} y - bar y position
 * @param {number} current - current HP
 * @param {number} max - maximum HP
 */
export function drawHPBar(graphics, x, y, current, max) {
  const barWidth = 48;
  const barHeight = 2;
  const ratio = Math.max(0, Math.min(1, current / max));
  const fillWidth = Math.round(barWidth * ratio);

  // Background (dark)
  graphics.fillStyle(0x383838);
  graphics.fillRect(x, y, barWidth, barHeight);

  // Fill color based on ratio
  let color = BATTLE.HP_GREEN;
  if (ratio <= 0.2) color = BATTLE.HP_RED;
  else if (ratio <= 0.5) color = BATTLE.HP_YELLOW;

  if (fillWidth > 0) {
    graphics.fillStyle(color);
    graphics.fillRect(x, y, fillWidth, barHeight);
  }
}

/**
 * Draw Pokemon Gold menu box with cursor (right-aligned overlay style)
 * @param {Phaser.GameObjects.Graphics} graphics
 * @param {number} x - top-left x
 * @param {number} y - top-left y
 * @param {number} w - width
 * @param {number} h - height
 */
export function drawMenuBox(graphics, x, y, w, h) {
  drawDialogFrame(graphics, x, y, w, h);
}

/**
 * Draw cursor triangle (right-pointing) at position
 * @param {Phaser.GameObjects.Graphics} graphics
 * @param {number} x - left x of triangle
 * @param {number} y - top y of triangle
 */
export function drawCursor(graphics, x, y) {
  graphics.fillStyle(BATTLE.TEXT);
  graphics.fillTriangle(x, y, x, y + 6, x + 4, y + 3);
}

/**
 * Draw continue indicator triangle (down-pointing) at position
 * @param {Phaser.GameObjects.Graphics} graphics
 * @param {number} x - left x of triangle
 * @param {number} y - top y of triangle
 */
export function drawContinueIndicator(graphics, x, y) {
  graphics.fillStyle(BATTLE.TEXT);
  graphics.fillTriangle(x, y, x + 6, y, x + 3, y + 4);
}

// ==============================================
// BATTLE TRANSITION
// ==============================================

/**
 * Horizontal bar wipe transition (alternating from L/R)
 * Pokemon Gold style battle entry
 * @param {Phaser.Scene} scene
 * @param {Function} callback - called when transition completes
 */
export function createBattleTransition(scene, callback) {
  const width = 160;
  const height = 144;
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
 * @param {Phaser.Scene} scene
 * @param {number} x - center x position
 * @param {number} y - center y position
 * @param {number} count - current garlic count
 * @param {number} total - total garlics needed
 * @returns {{ container: Phaser.GameObjects.Container, text: Phaser.GameObjects.Text }}
 */
export function drawGarlicCounter(scene, x, y, count, total) {
  const container = scene.add.container(x, y);

  // Background
  const bg = scene.add.graphics();
  bg.fillStyle(0x383838, 0.8);
  bg.fillRect(-20, -6, 40, 12);
  container.add(bg);

  // Garlic icon (8x8)
  const garlicG = scene.add.graphics();
  if (Sprites.UI_GARLIC) {
    drawOverworldSprite(garlicG, -18, -4, Sprites.UI_GARLIC, getBgPalette('GRAY'));
  }
  container.add(garlicG);

  // Count text
  const text = scene.add.text(4, 0, `${count}/${total}`, {
    fontFamily: 'Press Start 2P',
    fontSize: '8px',
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
 * stage 0 = normal tiger
 * stage 1 = fur starts shedding (lighter skin)
 * stage 2 = getting longer
 * stage 3 = lost TH sound (speech bubble appears)
 * stage 4 = hair turned black
 * stage 5 = fully Korean
 * @param {Phaser.Scene} scene
 * @param {number} x - pixel x
 * @param {number} y - pixel y
 * @param {number} stage - transformation stage (0-5)
 * @param {object} [palette] - optional override palette
 * @returns {Phaser.GameObjects.Graphics}
 */
export function drawTigerAtStage(scene, x, y, stage, palette) {
  const g = scene.add.graphics();
  const spriteData = Sprites.TIGER_FRONT;
  const spritePal = getSpritePalette('TIGER');

  // Clone palette colors for stage modifications
  const colors = [...spritePal.colors];

  // Progressive transformation:
  // Stage 1+: lighter skin tone
  if (stage >= 1) colors[2] = 0xF8F8F8;
  // Stage 4+: black hair
  if (stage >= 4) colors[1] = 0x383838;

  const customPalette = { colors };

  if (spriteData) {
    for (let i = 0; i < spriteData.length; i++) {
      const idx = spriteData[i];
      if (idx >= 0 && idx < 4 && customPalette.colors[idx] !== null) {
        g.fillStyle(customPalette.colors[idx]);
        g.fillRect(x + (i % 16), y + Math.floor(i / 16), 1, 1);
      }
    }
  }

  // Speech bubble at stage 3+ (tiger losing ability to say "TH")
  if (stage >= 3) {
    const bx = x + 17;
    const by = y;
    g.fillStyle(0xF8F8F8);
    g.fillRect(bx, by, 14, 8);
    g.fillTriangle(bx, by + 3, bx, by + 7, bx - 2, by + 5);
    g.lineStyle(1, 0x383838);
    g.strokeRect(bx, by, 14, 8);

    scene.add.text(bx + 1, by + 1, 'TH?', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#383838',
    });
  }

  return g;
}

/**
 * Draw Hanok gate for intro/victory scenes
 * @param {Phaser.Scene} scene
 * @param {number} x - center x position
 * @param {number} y - top y position of gate body
 * @param {object} [options]
 * @param {boolean} [options.open=false] - whether the gate is open
 * @returns {Phaser.GameObjects.Graphics}
 */
export function drawHanokGate(scene, x, y, options = {}) {
  const { open = false } = options;
  const g = scene.add.graphics();

  // Gate structure (scaled to 160x144 screen)
  g.fillStyle(0x686868);
  g.fillRect(x - 50, y, 100, 60);

  // Gate opening
  g.fillStyle(open ? 0xF0E0D0 : 0x383838);
  g.fillRect(x - 20, y + 20, 40, 40);

  if (!open) {
    // Closed doors
    g.fillStyle(0x989898);
    g.fillRect(x - 18, y + 22, 17, 36);
    g.fillRect(x + 1, y + 22, 17, 36);
    // Door panels
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
    fontFamily: 'Press Start 2P',
    fontSize: '6px',
    color: '#383838',
  }).setOrigin(0.5);

  return g;
}
