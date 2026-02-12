// Tiger.js - Player character with Pokemon Gold movement
// 2px/frame, 8 frames per 16px tile, native 160x144 resolution

import { GAME } from '../config.js';
import { gameState } from '../utils/StateManager.js';
import { getSpritePalette } from '../data/palettes.js';
import * as Sprites from '../data/spriteData.js';
import { drawOverworldSprite } from '../utils/TileRenderer.js';

export class Tiger {
  constructor(scene, col, row) {
    this.scene = scene;
    this.tileCol = col;
    this.tileRow = row;

    // Pixel position = tile * 8 (tile size) for top-left of sprite
    // Sprite is 16x16, centered on a 16x16 area (2x2 tiles)
    // pixelX/Y represent the top-left corner of the 16x16 sprite
    this.pixelX = col * 8 - 4; // center the 16px sprite on the tile
    this.pixelY = row * 8 - 8; // offset up so feet align with tile

    this.direction = 'down';
    this.isMoving = false;
    this.targetX = this.pixelX;
    this.targetY = this.pixelY;

    this.walkFrame = 0;   // 0-7 during movement (8 frames per tile)
    this.walkToggle = 0;  // alternates 0/1 each completed step
    this.stepCount = 0;

    this.graphics = null;
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

    const stage = gameState.getTransformationStage();
    const spriteData = this._getSpriteFrame();
    const palette = this._getPalette(stage);

    // Draw at local origin (0,0); position via graphics.setPosition
    drawOverworldSprite(this.graphics, 0, 0, spriteData, palette);

    // Flip horizontally for left direction
    if (this.direction === 'left') {
      this.graphics.setScale(-1, 1);
      this.graphics.setPosition(this.pixelX + 16, this.pixelY);
    } else {
      this.graphics.setScale(1, 1);
      this.graphics.setPosition(this.pixelX, this.pixelY);
    }
  }

  /**
   * Walk cycle per direction:
   *   Tile is 8px, speed is 2px/frame → 4 frames per tile.
   *   walkFrame 0-1 -> walkA sprite
   *   walkFrame 2-3 -> walkB sprite
   * Standing still -> base (standing) frame.
   */
  _getSpriteFrame() {
    if (!this.isMoving) {
      switch (this.direction) {
        case 'up':
          return Sprites.TIGER_BACK;
        case 'left':
        case 'right':
          return Sprites.TIGER_SIDE;
        case 'down':
        default:
          return Sprites.TIGER_FRONT;
      }
    }

    // During movement: alternate walk sprites
    // 4 frames per tile (8px at 2px/frame): frames 0-1 walkA, frames 2-3 walkB
    const useWalkB = this.walkFrame >= 2;

    switch (this.direction) {
      case 'down':
        return useWalkB ? Sprites.TIGER_FRONT_WALK2 : Sprites.TIGER_FRONT_WALK1;
      case 'up':
        return useWalkB ? Sprites.TIGER_BACK_WALK2 : Sprites.TIGER_BACK_WALK1;
      case 'left':
      case 'right':
        return useWalkB ? Sprites.TIGER_SIDE_WALK2 : Sprites.TIGER_SIDE_WALK1;
      default:
        return Sprites.TIGER_FRONT;
    }
  }

  /**
   * Build a palette with transformation-stage modifications.
   * Base palette = TIGER sprite palette from palettes.js.
   * Stage 1+: lighter skin (losing fur)
   * Stage 4+: black hair
   */
  _getPalette(stage) {
    const base = getSpritePalette('TIGER');
    const colors = [...base.colors];

    if (stage >= 1) colors[2] = 0xF8F8F8; // Lighter skin (losing fur)
    if (stage >= 4) colors[1] = 0x383838; // Black hair

    return { colors };
  }

  // ---------------------------------------------------------------------------
  // Tile-aligned movement
  // ---------------------------------------------------------------------------

  /**
   * Begin a one-tile move in the given direction.
   * Returns false if the tiger is already mid-move.
   * The caller is responsible for collision checks before calling this.
   */
  startMove(direction) {
    if (this.isMoving) return false;

    this.direction = direction;

    // Calculate next tile
    let nextCol = this.tileCol;
    let nextRow = this.tileRow;
    switch (direction) {
      case 'up':    nextRow--; break;
      case 'down':  nextRow++; break;
      case 'left':  nextCol--; break;
      case 'right': nextCol++; break;
    }

    // Commit to the new tile position immediately
    this.tileCol = nextCol;
    this.tileRow = nextRow;
    this.targetX = nextCol * 8 - 4;
    this.targetY = nextRow * 8 - 8;

    this.isMoving = true;
    this.walkFrame = 0;
    this.walkToggle = (this.walkToggle + 1) % 2;

    this.render();
    return true;
  }

  /**
   * Call every frame. Moves 2px toward the target tile.
   * Returns true on the frame the tiger arrives at the target.
   */
  update() {
    if (!this.isMoving) return false;

    const speed = GAME.WALK_PX_PER_FRAME; // 2
    const dx = this.targetX - this.pixelX;
    const dy = this.targetY - this.pixelY;

    if (Math.abs(dx) <= speed && Math.abs(dy) <= speed) {
      // Snap to target
      this.pixelX = this.targetX;
      this.pixelY = this.targetY;
      this.isMoving = false;
      this.walkFrame = 0;
      this.stepCount++;
      this.render();
      return true; // arrived
    }

    // Move toward target (only one axis at a time for tile-aligned movement)
    if (dx !== 0) {
      this.pixelX += Math.sign(dx) * speed;
    } else if (dy !== 0) {
      this.pixelY += Math.sign(dy) * speed;
    }

    this.walkFrame++;

    this.render();
    return false;
  }

  // ---------------------------------------------------------------------------
  // Position helpers
  // ---------------------------------------------------------------------------

  /** World center position (for camera targeting) */
  getCenterX() { return this.pixelX + 8; }
  getCenterY() { return this.pixelY + 8; }

  /** Teleport to a tile position without animation */
  setPosition(col, row) {
    this.tileCol = col;
    this.tileRow = row;
    this.pixelX = col * 8 - 4;
    this.pixelY = row * 8 - 8;
    this.targetX = this.pixelX;
    this.targetY = this.pixelY;
    this.isMoving = false;
    this.walkFrame = 0;
    this.render();
  }
}
