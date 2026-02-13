import { GAME } from '../config.js';

export class Tiger extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    // Use 'tiger' key from asset manifest
    // x, y in world pixels (grid * TILE)
    super(scene, x, y, 'tiger', 0);
    scene.add.existing(this);

    this.gridX = Math.floor(x / GAME.TILE);
    this.gridY = Math.floor(y / GAME.TILE);
    this.isMoving = false;
    this.moveDirection = 'down';
    this.transformationStage = 0;
    this.walkFrame = 0;
    this.walkProgress = 0;

    // Create animations: 4 dirs x 4 frames
    // Tiger spritesheet: 4 rows (DOWN=0-3, LEFT=4-7, RIGHT=8-11, UP=12-15)
    this.createAnimations(scene);
    this.setOrigin(0.5, 0.5);
  }

  createAnimations(scene) {
    const dirs = ['down', 'left', 'right', 'up'];
    dirs.forEach((dir, i) => {
      if (!scene.anims.exists(`tiger_${dir}`)) {
        scene.anims.create({
          key: `tiger_${dir}`,
          frames: scene.anims.generateFrameNumbers('tiger', { start: i * 4, end: i * 4 + 3 }),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!scene.anims.exists(`tiger_${dir}_idle`)) {
        scene.anims.create({
          key: `tiger_${dir}_idle`,
          frames: [{ key: 'tiger', frame: i * 4 }],
          frameRate: 1,
        });
      }
    });
  }

  // Grid movement: move exactly one tile (16px) with animation
  move(direction) {
    if (this.isMoving) return false;

    this.moveDirection = direction;
    this.isMoving = true;
    this.walkProgress = 0;

    // Target grid position
    const dx = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
    const dy = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
    this.targetGridX = this.gridX + dx;
    this.targetGridY = this.gridY + dy;
    this.startX = this.x;
    this.startY = this.y;

    this.play(`tiger_${direction}`, true);
    return true;
  }

  updateMovement() {
    if (!this.isMoving) return;

    this.walkProgress += GAME.WALK_PX_PER_FRAME;
    const t = Math.min(this.walkProgress / GAME.TILE, 1);

    this.x = this.startX + (this.targetGridX - this.gridX) * GAME.TILE * t;
    this.y = this.startY + (this.targetGridY - this.gridY) * GAME.TILE * t;

    if (t >= 1) {
      this.gridX = this.targetGridX;
      this.gridY = this.targetGridY;
      this.x = this.gridX * GAME.TILE + GAME.TILE / 2;
      this.y = this.gridY * GAME.TILE + GAME.TILE / 2;
      this.isMoving = false;
      this.play(`tiger_${this.moveDirection}_idle`);
    }
  }

  setStage(n) {
    this.transformationStage = n;
    // Visual effects per stage
    if (n === 0) this.clearTint();
    else if (n === 1) this.setTint(0xFFEE88); // yellow tint
    else if (n === 2) { this.setTint(0xFFDD66); this.setScale(1.0); }
    else if (n === 3) this.setTint(0xFFCC44);
    else if (n === 4) { this.setTint(0xFF9944); this.setScale(0.9, 1.1); }
    else if (n === 5) { this.setTint(0x332211); this.setScale(0.85, 1.05); }
  }

  playBowAnimation() {
    // Quick tilt for bow effect
    this.scene.tweens.add({
      targets: this,
      angle: 15,
      duration: 150,
      yoyo: true,
      onComplete: () => { this.angle = 0; },
    });
  }

  getWorldPosition() {
    return {
      x: this.gridX * GAME.TILE + GAME.TILE / 2,
      y: this.gridY * GAME.TILE + GAME.TILE / 2,
    };
  }
}
