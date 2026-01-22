// Tiger - Player character with transformation states

import { GAME_CONFIG } from '../config.js';
import { gameState } from '../utils/StateManager.js';
import { getPalette, drawSprite, SPRITES } from '../utils/GBGraphics.js';

export class Tiger {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.speed = 2;
    this.isMoving = false;
    this.targetX = x;
    this.targetY = y;
    this.direction = 'down';
    this.walkFrame = 0;
    this.stepCount = 0;

    this.create();
  }

  create() {
    // Create placeholder tiger sprite (will be replaced with actual art)
    this.sprite = this.scene.add.container(this.x, this.y);

    // Draw placeholder tiger based on transformation stage
    this.updateSprite();
  }

  updateSprite() {
    // Clear existing graphics
    this.sprite.removeAll(true);

    const stage = gameState.getTransformationStage();
    const g = this.scene.add.graphics();
    const p = getPalette();

    // Select sprite based on direction and walk frame
    let spriteData;
    const walkFrame = this.walkFrame || 0;

    switch (this.direction) {
      case 'up':
        spriteData = SPRITES.TIGER_BACK;
        break;
      case 'left':
      case 'right':
        spriteData = SPRITES.TIGER_SIDE;
        break;
      case 'down':
      default:
        // Alternate between walk frames for animation
        spriteData = walkFrame === 0 ? SPRITES.TIGER_FRONT : SPRITES.TIGER_FRONT_WALK1;
        break;
    }

    // Draw the tiger sprite at 2x scale (16x16 * 2 = 32x32)
    const scale = 2;
    const offsetX = -16; // Center the 32px wide sprite
    const offsetY = -16; // Center the 32px tall sprite

    // Apply transformation effects based on stage
    if (stage >= 4) {
      // Stage 4+: Black hair - draw with darker palette override
      this.drawTransformedSprite(g, offsetX, offsetY, spriteData, 16, scale, stage);
    } else {
      // Normal tiger sprite
      drawSprite(g, offsetX, offsetY, spriteData, 16, scale);
    }

    // Flip sprite horizontally for left direction
    if (this.direction === 'left') {
      g.setScale(-1, 1);
    }

    this.sprite.add(g);

    // Stage 3+: Speech bubble showing pronunciation change
    if (stage >= 3) {
      const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');
      const lightestHex = '#' + p.lightest.toString(16).padStart(6, '0');

      const bubble = this.scene.add.graphics();
      bubble.fillStyle(p.lightest);
      bubble.fillRect(12, -24, 20, 12);
      bubble.fillTriangle(12, -18, 12, -12, 8, -15);
      bubble.lineStyle(1, p.darkest);
      bubble.strokeRect(12, -24, 20, 12);
      this.sprite.add(bubble);

      const bubbleText = this.scene.add.text(14, -22, 'TH?', {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '6px',
        color: darkestHex,
      });
      this.sprite.add(bubbleText);
    }
  }

  drawTransformedSprite(graphics, x, y, spriteData, width, scale, stage) {
    const p = getPalette();
    // Modified palette for transformation stages
    const colors = [
      p.darkest,
      stage >= 4 ? p.darkest : p.dark, // Black hair at stage 4+
      stage >= 1 ? p.lightest : p.light, // Loses fur at stage 1
      p.lightest,
    ];

    spriteData.forEach((colorIdx, i) => {
      if (colorIdx >= 0) {
        const px = (i % width) * scale;
        const py = Math.floor(i / width) * scale;
        graphics.fillStyle(colors[colorIdx]);
        graphics.fillRect(x + px, y + py, scale, scale);
      }
    });
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.setPosition(x, y);
  }

  moveTo(targetX, targetY) {
    // Determine direction based on movement
    const dx = targetX - this.x;
    const dy = targetY - this.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else {
      this.direction = dy > 0 ? 'down' : 'up';
    }

    this.targetX = targetX;
    this.targetY = targetY;
    this.isMoving = true;

    // Toggle walk frame for animation
    this.walkFrame = (this.walkFrame + 1) % 2;
    this.updateSprite();
  }

  moveInDirection(direction) {
    this.direction = direction;
    const moveAmount = 4;

    switch (direction) {
      case 'up':
        this.targetY = this.y - moveAmount;
        break;
      case 'down':
        this.targetY = this.y + moveAmount;
        break;
      case 'left':
        this.targetX = this.x - moveAmount;
        break;
      case 'right':
        this.targetX = this.x + moveAmount;
        break;
    }
    this.isMoving = true;
  }

  update() {
    if (!this.isMoving) return false;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.speed) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.isMoving = false;
      this.sprite.setPosition(this.x, this.y);
      return true; // Arrived at destination
    }

    const vx = (dx / distance) * this.speed;
    const vy = (dy / distance) * this.speed;

    this.x += vx;
    this.y += vy;
    this.sprite.setPosition(this.x, this.y);

    return false; // Still moving
  }

  destroy() {
    this.sprite.destroy();
  }
}
