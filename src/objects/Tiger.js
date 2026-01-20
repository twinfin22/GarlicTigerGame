// Tiger - Player character with transformation states

import { GAME_CONFIG } from '../config.js';
import { gameState } from '../utils/StateManager.js';

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

    // Base colors
    const bodyColor = stage >= 4 ? 0x2a2a2a : 0xcacaca; // Black hair at stage 4+
    const stripeColor = 0x4a4a4a;

    // Body dimensions change with stage
    const bodyHeight = 20 + (stage >= 2 ? 8 : 0); // Elongates at stage 2
    const bodyWidth = 16;

    // Draw body
    g.fillStyle(stage >= 1 ? 0xf0f0f0 : bodyColor); // Loses fur (becomes lighter) at stage 1
    g.fillRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);

    // Draw stripes (only if fur still present - stage 0)
    if (stage < 1) {
      g.fillStyle(stripeColor);
      g.fillRect(-bodyWidth / 2 + 2, -bodyHeight / 2 + 4, 3, 2);
      g.fillRect(-bodyWidth / 2 + 8, -bodyHeight / 2 + 4, 3, 2);
      g.fillRect(-bodyWidth / 2 + 4, -bodyHeight / 2 + 10, 4, 2);
    }

    // Draw head
    const headColor = stage >= 4 ? 0x2a2a2a : bodyColor;
    g.fillStyle(headColor);
    g.fillRect(-8, -bodyHeight / 2 - 12, 16, 12);

    // Eyes
    g.fillStyle(stage >= 4 ? 0x1a1a1a : 0x1a1a1a);
    g.fillRect(-5, -bodyHeight / 2 - 8, 3, 3);
    g.fillRect(2, -bodyHeight / 2 - 8, 3, 3);

    // Ears
    g.fillStyle(headColor);
    g.fillTriangle(-8, -bodyHeight / 2 - 12, -8, -bodyHeight / 2 - 18, -3, -bodyHeight / 2 - 12);
    g.fillTriangle(8, -bodyHeight / 2 - 12, 8, -bodyHeight / 2 - 18, 3, -bodyHeight / 2 - 12);

    // Stage 3: Speech bubble showing pronunciation change
    if (stage >= 3) {
      g.fillStyle(0xf0f0f0);
      g.fillRect(10, -bodyHeight / 2 - 20, 20, 12);
      g.fillTriangle(10, -bodyHeight / 2 - 14, 10, -bodyHeight / 2 - 8, 6, -bodyHeight / 2 - 11);
    }

    // Stage 5: Show bowing capability (slightly bent)
    if (stage >= 5) {
      // Add small bow indicator
      g.fillStyle(0x8a8a8a);
      g.fillRect(-2, bodyHeight / 2, 4, 3);
    }

    this.sprite.add(g);

    // Add stage 3 text if applicable
    if (stage >= 3) {
      const bubbleText = this.scene.add.text(12, -bodyHeight / 2 - 18, 'TH?', {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '6px',
        color: '#1a1a1a',
      });
      this.sprite.add(bubbleText);
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.setPosition(x, y);
  }

  moveTo(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.isMoving = true;
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
