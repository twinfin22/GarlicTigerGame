// NPC.js - Non-player characters on the overworld
// Stand on map tiles, face random directions, trigger quiz scenes on interaction

import Phaser from 'phaser';
import { GAME } from '../config.js';
import { getSpritePalette } from '../data/palettes.js';
import * as Sprites from '../data/spriteData.js';
import { drawOverworldSprite } from '../utils/TileRenderer.js';
import { gameState } from '../utils/StateManager.js';

// Map NPC IDs to sprite data keys in spriteData.js
const NPC_SPRITE_MAP = {
  ajumma:  'NPC_AJUMMA',
  worker:  'NPC_WORKER',
  grandma: 'NPC_GRANDMA',
  senior:  'NPC_SENIOR',
  hipster: 'NPC_HIPSTER',
};

// Map NPC IDs to sprite palette names in palettes.js
const NPC_PALETTE_MAP = {
  ajumma:  'BROWN',
  worker:  'BLUE',
  grandma: 'RED',
  senior:  'BLUE',
  hipster: 'GREEN',
};

// Canonical NPC order (determines quiz index)
const NPC_ORDER = ['ajumma', 'worker', 'grandma', 'senior', 'hipster'];

export class NPC {
  /**
   * @param {Phaser.Scene} scene
   * @param {{ id: string, col: number, row: number, direction?: string, palette?: string }} config
   */
  constructor(scene, config) {
    this.scene = scene;
    this.id = config.id;
    this.tileCol = config.col;
    this.tileRow = config.row;
    this.direction = config.direction || 'down';
    this.paletteKey = config.palette || NPC_PALETTE_MAP[config.id] || 'GRAY';
    this.spriteKey = NPC_SPRITE_MAP[config.id] || null;

    // Pixel position (same formula as Tiger: center 16px sprite on tile)
    this.pixelX = config.col * 8 - 4;
    this.pixelY = config.row * 8 - 8;

    this.graphics = null;

    // Random facing-direction timer (frames)
    this.directionChangeTimer = 0;
    this.directionChangeInterval = Phaser.Math.Between(120, 240);

    this.create();
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  create() {
    this.graphics = this.scene.add.graphics();
    this.render();
  }

  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  render() {
    if (!this.graphics) return;
    this.graphics.clear();

    const spriteData = this.spriteKey ? Sprites[this.spriteKey] : null;
    if (!spriteData) return;

    const palette = getSpritePalette(this.paletteKey);
    drawOverworldSprite(this.graphics, 0, 0, spriteData, palette);

    this.graphics.setPosition(this.pixelX, this.pixelY);
  }

  // ---------------------------------------------------------------------------
  // Frame update
  // ---------------------------------------------------------------------------

  update() {
    // Periodically change the direction the NPC faces
    this.directionChangeTimer++;
    if (this.directionChangeTimer >= this.directionChangeInterval) {
      this.directionChangeTimer = 0;
      this.directionChangeInterval = Phaser.Math.Between(120, 240);

      const dirs = ['up', 'down', 'left', 'right'];
      this.direction = dirs[Math.floor(Math.random() * dirs.length)];

      // NPC overworld sprites are front-facing only, so the visual does not
      // change. We track direction for interaction-detection purposes.
    }
  }

  // ---------------------------------------------------------------------------
  // Interaction helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns true if the player tiger is facing this NPC and is exactly
   * one tile away in that direction.
   * @param {{ tileCol: number, tileRow: number, direction: string }} tiger
   */
  isAdjacentTo(tiger) {
    const dx = this.tileCol - tiger.tileCol;
    const dy = this.tileRow - tiger.tileRow;

    switch (tiger.direction) {
      case 'up':    return dx === 0 && dy === -1;
      case 'down':  return dx === 0 && dy === 1;
      case 'left':  return dx === -1 && dy === 0;
      case 'right': return dx === 1 && dy === 0;
      default:      return false;
    }
  }

  /**
   * Returns true if this NPC is within the visible viewport.
   * @param {number} cameraX - pixel X of camera top-left
   * @param {number} cameraY - pixel Y of camera top-left
   */
  isVisible(cameraX, cameraY) {
    const screenX = this.pixelX - cameraX;
    const screenY = this.pixelY - cameraY;
    // 16px sprite buffer on each side for partial visibility
    return screenX > -16 && screenX < GAME.WIDTH && screenY > -16 && screenY < GAME.HEIGHT;
  }

  /**
   * Quiz index for this NPC (0-4 based on canonical NPC order).
   * Returns -1 if the NPC ID is not in the order list.
   */
  getQuizIndex() {
    return NPC_ORDER.indexOf(this.id);
  }

  /** Whether this NPC has already been defeated */
  isDefeated() {
    return gameState.isNPCDefeated(this.id);
  }
}
