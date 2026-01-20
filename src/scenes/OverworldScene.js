// OverworldScene - Top-down map of Korea with tiger movement

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { Tiger } from '../objects/Tiger.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.OVERWORLD });
    this.tiger = null;
    this.cursors = null;
    this.tilesMoved = 0;
    this.garlicCounterText = null;
    this.isTransitioning = false;
    this.touchStartPos = null;
    this.virtualDPad = null;
  }

  create() {
    const { width, height } = this.scale;
    const { COLORS } = GAME_CONFIG;

    this.isTransitioning = false;
    gameState.resetTilesWalked();

    // Background
    this.cameras.main.setBackgroundColor(COLORS.BLACK);
    this.cameras.main.fadeIn(300);

    // Draw the map
    this.drawMap();

    // Create tiger at center
    this.tiger = new Tiger(this, width / 2, height / 2);

    // Create UI
    this.createUI();

    // Create virtual D-pad for mobile
    this.createVirtualDPad();

    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Touch/click to move
    this.input.on('pointerdown', (pointer) => {
      if (pointer.y < height - 120) { // Not on D-pad area
        this.touchStartPos = { x: pointer.x, y: pointer.y };
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (this.touchStartPos && pointer.y < height - 120) {
        const dx = pointer.x - this.touchStartPos.x;
        const dy = pointer.y - this.touchStartPos.y;

        // Swipe detection
        if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
          if (Math.abs(dx) > Math.abs(dy)) {
            this.moveTiger(dx > 0 ? 'right' : 'left');
          } else {
            this.moveTiger(dy > 0 ? 'down' : 'up');
          }
        }
      }
      this.touchStartPos = null;
    });

    // Instructions text
    this.add.text(width / 2, 50, 'Explore Korea!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: GAME_CONFIG.TEXT_SIZES.SMALL + 'px',
      color: '#8a8a8a',
    }).setOrigin(0.5);
  }

  update() {
    if (this.isTransitioning) return;

    // Keyboard movement
    if (this.cursors.left.isDown) {
      this.moveTiger('left');
    } else if (this.cursors.right.isDown) {
      this.moveTiger('right');
    } else if (this.cursors.up.isDown) {
      this.moveTiger('up');
    } else if (this.cursors.down.isDown) {
      this.moveTiger('down');
    }

    // Update tiger and check for movement completion
    if (this.tiger.update()) {
      this.onTileMoved();
    }
  }

  moveTiger(direction) {
    if (this.tiger.isMoving || this.isTransitioning) return;

    const { width, height } = this.scale;
    const padding = 40;

    // Calculate new position
    let newX = this.tiger.x;
    let newY = this.tiger.y;
    const moveAmount = 16;

    switch (direction) {
      case 'up':
        newY -= moveAmount;
        break;
      case 'down':
        newY += moveAmount;
        break;
      case 'left':
        newX -= moveAmount;
        break;
      case 'right':
        newX += moveAmount;
        break;
    }

    // Boundary check
    if (newX < padding || newX > width - padding ||
        newY < 80 || newY > height - 150) {
      return;
    }

    this.tiger.moveTo(newX, newY);
    audioManager.playWalk();
  }

  onTileMoved() {
    gameState.addTilesWalked();
    const tilesWalked = gameState.getTilesWalked();

    // Check for random encounter
    const encounterThreshold = GAME_CONFIG.SETTINGS.TILES_BEFORE_ENCOUNTER;
    const encounterChance = Math.min((tilesWalked - encounterThreshold + 5) / 10, 0.8);

    if (tilesWalked >= encounterThreshold - 3 && Math.random() < encounterChance) {
      this.triggerEncounter();
    }
  }

  triggerEncounter() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    audioManager.playSelect();
    gameState.resetTilesWalked();

    // Pokemon-style battle transition
    this.battleTransition();
  }

  battleTransition() {
    const { width, height } = this.scale;

    // Create horizontal line wipe effect
    const lines = [];
    const lineCount = 20;
    const lineHeight = height / lineCount;

    for (let i = 0; i < lineCount; i++) {
      const line = this.add.rectangle(
        i % 2 === 0 ? -width : width * 2,
        i * lineHeight + lineHeight / 2,
        width,
        lineHeight,
        0x1a1a1a
      );
      lines.push(line);

      this.tweens.add({
        targets: line,
        x: width / 2,
        duration: 300,
        delay: i * 20,
        ease: 'Power2',
      });
    }

    // Transition to quiz after animation
    this.time.delayedCall(600, () => {
      this.scene.start(SCENES.QUIZ);
    });
  }

  drawMap() {
    const { width, height } = this.scale;
    const g = this.add.graphics();

    // Ground tiles (simplified grid pattern)
    g.fillStyle(0x2a2a2a);
    g.fillRect(0, 0, width, height);

    // Grid pattern
    g.lineStyle(1, 0x3a3a3a);
    for (let x = 0; x < width; x += 32) {
      g.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 32) {
      g.lineBetween(0, y, width, y);
    }

    // Draw map elements
    this.drawNamsanTower(width - 60, 150);
    this.drawHanRiver(width / 2, height / 2 - 50);
    this.drawConvenienceStore(80, 200);
    this.drawSubwayEntrance(width - 100, height - 200);
    this.drawNeonSigns(150, 350);
    this.drawBuildings();
  }

  drawNamsanTower(x, y) {
    const g = this.add.graphics();

    // Tower base
    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 15, y + 20, 30, 40);

    // Tower body
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 8, y - 40, 16, 60);

    // Tower top
    g.fillStyle(0xf0f0f0);
    g.fillRect(x - 3, y - 70, 6, 30);

    // Observation deck
    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 12, y - 20, 24, 15);

    // Antenna
    g.fillStyle(0xf0f0f0);
    g.fillRect(x - 1, y - 85, 2, 15);

    // Label
    this.add.text(x, y + 70, 'N Tower', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '6px',
      color: '#6a6a6a',
    }).setOrigin(0.5);
  }

  drawHanRiver(x, y) {
    const g = this.add.graphics();

    // River (wavy horizontal line)
    g.fillStyle(0x4a4a4a);
    g.fillRect(0, y, this.scale.width, 25);

    // Wave pattern
    g.fillStyle(0x5a5a5a);
    for (let i = 0; i < this.scale.width; i += 20) {
      g.fillRect(i, y + 5, 10, 3);
      g.fillRect(i + 10, y + 15, 10, 3);
    }

    // Bridge
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 40, y - 5, 80, 35);
    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 35, y + 5, 15, 15);
    g.fillRect(x + 20, y + 5, 15, 15);
  }

  drawConvenienceStore(x, y) {
    const g = this.add.graphics();

    // Building
    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 25, y - 20, 50, 40);

    // Sign
    g.fillStyle(0xf0f0f0);
    g.fillRect(x - 20, y - 18, 40, 12);

    // Door
    g.fillStyle(0x3a3a3a);
    g.fillRect(x - 8, y, 16, 20);

    // Label
    this.add.text(x, y - 12, 'CU', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '6px',
      color: '#1a1a1a',
    }).setOrigin(0.5);
  }

  drawSubwayEntrance(x, y) {
    const g = this.add.graphics();

    // Entrance structure
    g.fillStyle(0x5a5a5a);
    g.fillRect(x - 20, y - 15, 40, 30);

    // Stairs (going down)
    g.fillStyle(0x3a3a3a);
    g.fillRect(x - 15, y - 10, 30, 20);

    // Stair lines
    g.lineStyle(1, 0x1a1a1a);
    for (let i = 0; i < 5; i++) {
      g.lineBetween(x - 15, y - 10 + i * 4, x + 15, y - 10 + i * 4);
    }

    // Railing
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 18, y - 15, 4, 25);
    g.fillRect(x + 14, y - 15, 4, 25);

    // Subway sign
    this.add.text(x, y - 25, '지하철', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '6px',
      color: '#8a8a8a',
    }).setOrigin(0.5);
  }

  drawNeonSigns(x, y) {
    // Korean text signs (simulated neon)
    const signs = ['PC방', '노래방', '치킨'];
    signs.forEach((text, i) => {
      const signX = x + i * 60;

      const g = this.add.graphics();
      g.fillStyle(0x4a4a4a);
      g.fillRect(signX - 20, y - 10, 40, 20);
      g.lineStyle(1, 0x8a8a8a);
      g.strokeRect(signX - 20, y - 10, 40, 20);

      this.add.text(signX, y, text, {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '7px',
        color: '#cacaca',
      }).setOrigin(0.5);
    });
  }

  drawBuildings() {
    const g = this.add.graphics();
    const { width, height } = this.scale;

    // Random buildings in background
    const buildings = [
      { x: 50, y: 100, w: 30, h: 50 },
      { x: 280, y: 120, w: 40, h: 70 },
      { x: 180, y: 450, w: 35, h: 45 },
      { x: 300, y: 400, w: 25, h: 55 },
    ];

    buildings.forEach((b) => {
      g.fillStyle(0x3a3a3a);
      g.fillRect(b.x, b.y, b.w, b.h);

      // Windows
      g.fillStyle(0x5a5a5a);
      for (let wy = b.y + 5; wy < b.y + b.h - 5; wy += 10) {
        for (let wx = b.x + 5; wx < b.x + b.w - 5; wx += 8) {
          g.fillRect(wx, wy, 4, 6);
        }
      }
    });
  }

  createUI() {
    const { width } = this.scale;
    const { FONTS, TEXT_SIZES, COLORS } = GAME_CONFIG;

    // Garlic counter
    const container = this.add.container(width - 60, 30);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.BLACK, 0.9);
    bg.fillRect(-45, -18, 90, 36);
    bg.lineStyle(2, COLORS.WHITE);
    bg.strokeRect(-45, -18, 90, 36);
    container.add(bg);

    // Garlic icon
    const garlicIcon = this.add.graphics();
    garlicIcon.fillStyle(0xf0f0f0);
    garlicIcon.fillCircle(-28, 0, 10);
    garlicIcon.fillCircle(-33, 5, 6);
    garlicIcon.fillCircle(-23, 5, 6);
    container.add(garlicIcon);

    // Counter text
    this.garlicCounterText = this.add.text(10, 0, `${gameState.getGarlics()}/5`, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.MEDIUM + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);
    container.add(this.garlicCounterText);
  }

  createVirtualDPad() {
    const { width, height } = this.scale;
    const { COLORS } = GAME_CONFIG;

    const dpadX = 70;
    const dpadY = height - 70;
    const buttonSize = 40;

    // D-pad background
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.DARK_GRAY, 0.5);
    bg.fillCircle(dpadX, dpadY, 60);

    // Direction buttons
    const directions = [
      { dir: 'up', x: 0, y: -buttonSize },
      { dir: 'down', x: 0, y: buttonSize },
      { dir: 'left', x: -buttonSize, y: 0 },
      { dir: 'right', x: buttonSize, y: 0 },
    ];

    directions.forEach(({ dir, x, y }) => {
      const btn = this.add.rectangle(
        dpadX + x,
        dpadY + y,
        buttonSize - 5,
        buttonSize - 5,
        COLORS.MID_GRAY,
        0.8
      ).setInteractive();

      // Arrow symbols
      const arrows = { up: '▲', down: '▼', left: '◀', right: '▶' };
      this.add.text(dpadX + x, dpadY + y, arrows[dir], {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '12px',
        color: '#1a1a1a',
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        btn.setFillStyle(COLORS.WHITE, 1);
        this.moveTiger(dir);
      });

      btn.on('pointerup', () => {
        btn.setFillStyle(COLORS.MID_GRAY, 0.8);
      });

      btn.on('pointerout', () => {
        btn.setFillStyle(COLORS.MID_GRAY, 0.8);
      });
    });

    // Hint text
    this.add.text(width - 70, height - 50, 'Walk around\nto find NPCs', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: '#6a6a6a',
      align: 'center',
    }).setOrigin(0.5);
  }
}
