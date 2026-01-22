// OverworldScene - Top-down map of Korea with tiger movement

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { Tiger } from '../objects/Tiger.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { getPalette, drawSprite, SPRITES } from '../utils/GBGraphics.js';

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
    const p = getPalette();
    const { COLORS } = GAME_CONFIG;

    this.isTransitioning = false;
    gameState.resetTilesWalked();

    // Background - BRIGHT green like Pokemon!
    this.cameras.main.setBackgroundColor(COLORS.GRASS_LIGHT);
    this.cameras.main.fadeIn(300);

    // Draw the map with bright procedural tiles
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

    // Instructions text - white box with black text (Pokemon style)
    const instructionBg = this.add.graphics();
    instructionBg.fillStyle(0xffffff);
    instructionBg.fillRect(width / 2 - 70, 35, 140, 24);
    instructionBg.lineStyle(2, 0x000000);
    instructionBg.strokeRect(width / 2 - 70, 35, 140, 24);

    this.add.text(width / 2, 47, 'Explore Korea!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '10px',
      color: '#000000',
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

    // Boundary check - allow movement in the playable area
    if (newX < padding || newX > width - padding ||
        newY < 80 || newY > height - 80) {
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
    const p = getPalette();

    // Create horizontal line wipe effect (Pokemon style)
    const lines = [];
    const lineCount = 20;
    const lineHeight = height / lineCount;

    for (let i = 0; i < lineCount; i++) {
      const line = this.add.rectangle(
        i % 2 === 0 ? -width : width * 2,
        i * lineHeight + lineHeight / 2,
        width,
        lineHeight,
        p.darkest
      );
      lines.push(line);

      this.tweens.add({
        targets: line,
        x: width / 2,
        duration: 300,
        delay: i * 20,
        ease: 'Linear', // Step-like feel
      });
    }

    // Transition to quiz after animation
    this.time.delayedCall(600, () => {
      console.log('Battle transition complete, starting QuizScene...');
      this.scene.start(SCENES.QUIZ);
    });
  }

  drawMap() {
    const { width, height } = this.scale;

    // Draw bright procedural background (no tilesets needed)
    this.drawProceduralBackground();

    // Draw map elements on top
    this.drawNamsanTower(width - 60, 120);
    this.drawHanRiver(width / 2, height / 2 - 30);
    this.drawConvenienceStore(80, 180);
    this.drawSubwayEntrance(width - 100, height - 180);
    this.drawNeonSigns(150, 320);
    this.drawProceduralBuildings();
    this.drawProceduralTrees();
  }

  drawProceduralBackground() {
    const { width, height } = this.scale;
    const { COLORS } = GAME_CONFIG;
    const g = this.add.graphics();
    const tileSize = 16;

    // Draw grass pattern - bright green with subtle variation
    for (let y = 0; y < height; y += tileSize) {
      for (let x = 0; x < width; x += tileSize) {
        // Alternate between two shades for texture
        const shade = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        g.fillStyle(shade ? COLORS.GRASS_LIGHT : 0x7ed87e);
        g.fillRect(x, y, tileSize, tileSize);

        // Add small grass detail marks
        if (Math.random() > 0.7) {
          g.fillStyle(COLORS.GRASS_DARK);
          g.fillRect(x + 4, y + 8, 2, 4);
          g.fillRect(x + 10, y + 6, 2, 4);
        }
      }
    }

    // Draw paths - tan/brown crossing paths
    this.drawProceduralPaths(g);
  }

  drawProceduralPaths(g) {
    const { width, height } = this.scale;
    const { COLORS } = GAME_CONFIG;
    const pathWidth = 24;

    // Horizontal main path
    const pathY = height / 2 - pathWidth / 2;
    g.fillStyle(COLORS.PATH);
    g.fillRect(30, pathY, width - 60, pathWidth);

    // Path border (darker)
    g.fillStyle(0xb8956e);
    g.fillRect(30, pathY, width - 60, 2);
    g.fillRect(30, pathY + pathWidth - 2, width - 60, 2);

    // Vertical crossing path
    const pathX = width / 2 - pathWidth / 2;
    g.fillStyle(COLORS.PATH);
    g.fillRect(pathX, 70, pathWidth, height - 150);

    // Path border
    g.fillStyle(0xb8956e);
    g.fillRect(pathX, 70, 2, height - 150);
    g.fillRect(pathX + pathWidth - 2, 70, 2, height - 150);
  }

  drawProceduralTrees() {
    const { width, height } = this.scale;
    const { COLORS } = GAME_CONFIG;

    // Tree positions around edges
    const treePositions = [
      { x: 25, y: 100 },
      { x: 45, y: 200 },
      { x: 280, y: 95 },
      { x: 285, y: 195 },
      { x: 20, y: height - 120 },
      { x: 290, y: height - 115 },
    ];

    treePositions.forEach(pos => {
      const g = this.add.graphics();

      // Tree trunk (brown)
      g.fillStyle(0x8b4513);
      g.fillRect(pos.x + 10, pos.y + 20, 12, 20);

      // Tree foliage (layered circles for Pokemon style)
      g.fillStyle(COLORS.TREE_GREEN);
      g.fillCircle(pos.x + 16, pos.y, 18);
      g.fillCircle(pos.x + 8, pos.y + 10, 14);
      g.fillCircle(pos.x + 24, pos.y + 10, 14);

      // Highlight
      g.fillStyle(0x32cd32);
      g.fillCircle(pos.x + 12, pos.y - 5, 8);
    });
  }

  drawProceduralBuildings() {
    const { COLORS } = GAME_CONFIG;

    // Building positions
    const buildings = [
      { x: 60, y: 70, w: 50, h: 40 },
      { x: 230, y: 200, w: 60, h: 45 },
    ];

    buildings.forEach(b => {
      const g = this.add.graphics();

      // Building body (white/cream)
      g.fillStyle(0xffffff);
      g.fillRect(b.x, b.y, b.w, b.h);

      // Roof (red like Pokemon)
      g.fillStyle(COLORS.ROOF_RED);
      g.fillTriangle(
        b.x - 5, b.y,
        b.x + b.w / 2, b.y - 20,
        b.x + b.w + 5, b.y
      );

      // Door
      g.fillStyle(0x8b4513);
      g.fillRect(b.x + b.w / 2 - 8, b.y + b.h - 25, 16, 25);

      // Windows
      g.fillStyle(COLORS.WATER);
      g.fillRect(b.x + 8, b.y + 10, 12, 12);
      g.fillRect(b.x + b.w - 20, b.y + 10, 12, 12);

      // Black border
      g.lineStyle(2, 0x000000);
      g.strokeRect(b.x, b.y, b.w, b.h);
    });
  }

  drawNamsanTower(x, y) {
    const g = this.add.graphics();

    // Tower base (gray concrete)
    g.fillStyle(0x808080);
    g.fillRect(x - 15, y + 20, 30, 40);

    // Tower body (white)
    g.fillStyle(0xffffff);
    g.fillRect(x - 8, y - 40, 16, 60);
    g.lineStyle(1, 0x000000);
    g.strokeRect(x - 8, y - 40, 16, 60);

    // Tower top (red observation deck)
    g.fillStyle(0xff6b6b);
    g.fillRect(x - 12, y - 20, 24, 15);

    // Antenna (white with red tip)
    g.fillStyle(0xffffff);
    g.fillRect(x - 1, y - 70, 2, 30);
    g.fillStyle(0xff0000);
    g.fillRect(x - 2, y - 75, 4, 8);

    // Label
    this.add.text(x, y + 70, 'N Tower', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: '#000000',
    }).setOrigin(0.5);
  }

  drawHanRiver(x, y) {
    const { width } = this.scale;
    const { COLORS } = GAME_CONFIG;
    const g = this.add.graphics();

    // River - bright blue water
    g.fillStyle(COLORS.WATER);
    g.fillRect(0, y, width, 32);

    // Water wave pattern
    g.fillStyle(0x6bb3d9);
    for (let wx = 0; wx < width; wx += 20) {
      g.fillRect(wx, y + 8, 10, 2);
      g.fillRect(wx + 5, y + 20, 10, 2);
    }

    // Bridge
    g.fillStyle(0xd2b48c);
    g.fillRect(x - 45, y - 5, 90, 42);
    g.lineStyle(2, 0x000000);
    g.strokeRect(x - 45, y - 5, 90, 42);

    // Bridge arches
    g.fillStyle(0x8b4513);
    g.fillRect(x - 35, y + 10, 20, 20);
    g.fillRect(x + 15, y + 10, 20, 20);
  }

  drawConvenienceStore(x, y) {
    const g = this.add.graphics();

    // Building - white with red accent
    g.fillStyle(0xffffff);
    g.fillRect(x - 30, y - 25, 60, 50);
    g.lineStyle(2, 0x000000);
    g.strokeRect(x - 30, y - 25, 60, 50);

    // Red stripe (CU branding)
    g.fillStyle(0xff6b6b);
    g.fillRect(x - 30, y - 25, 60, 12);

    // Door
    g.fillStyle(0x87ceeb);
    g.fillRect(x - 8, y, 16, 25);
    g.lineStyle(1, 0x000000);
    g.strokeRect(x - 8, y, 16, 25);

    // Label
    this.add.text(x, y - 17, 'CU', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }

  drawSubwayEntrance(x, y) {
    const g = this.add.graphics();

    // Yellow entrance canopy (Seoul Metro style)
    g.fillStyle(0xffd700);
    g.fillRect(x - 25, y - 20, 50, 15);
    g.lineStyle(2, 0x000000);
    g.strokeRect(x - 25, y - 20, 50, 15);

    // Stairs (gray)
    g.fillStyle(0x808080);
    g.fillRect(x - 18, y - 5, 36, 30);

    // Stair lines
    g.lineStyle(1, 0xffffff);
    for (let i = 0; i < 6; i++) {
      g.lineBetween(x - 18, y - 5 + i * 5, x + 18, y - 5 + i * 5);
    }

    // Railing (blue)
    g.fillStyle(0x4169e1);
    g.fillRect(x - 22, y - 5, 4, 30);
    g.fillRect(x + 18, y - 5, 4, 30);

    // Subway sign
    this.add.text(x, y - 12, '지하철', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '7px',
      color: '#000000',
    }).setOrigin(0.5);
  }

  drawNeonSigns(x, y) {
    // Skip neon signs - they're below visible area (y=320 is off screen)
    // This function was drawing off-screen elements
  }

  createUI() {
    const { width } = this.scale;
    const { FONTS, TEXT_SIZES } = GAME_CONFIG;

    // Garlic counter - white box with black border (Pokemon style)
    const container = this.add.container(width - 55, 25);

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff);
    bg.fillRect(-45, -15, 90, 30);
    bg.lineStyle(2, 0x000000);
    bg.strokeRect(-45, -15, 90, 30);
    container.add(bg);

    // Garlic icon (yellow/white garlic)
    const garlicIcon = this.add.graphics();
    garlicIcon.fillStyle(0xfffacd);
    garlicIcon.fillCircle(-25, 0, 8);
    garlicIcon.fillCircle(-30, 4, 5);
    garlicIcon.fillCircle(-20, 4, 5);
    garlicIcon.lineStyle(1, 0x000000);
    garlicIcon.strokeCircle(-25, 0, 8);
    container.add(garlicIcon);

    // Counter text
    this.garlicCounterText = this.add.text(10, 0, `${gameState.getGarlics()}/5`, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#000000',
    }).setOrigin(0.5);
    container.add(this.garlicCounterText);
  }

  createVirtualDPad() {
    const { width, height } = this.scale;

    const dpadX = 70;
    const dpadY = height - 65;
    const buttonSize = 36;

    // D-pad background (white circle)
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.9);
    bg.fillCircle(dpadX, dpadY, 55);
    bg.lineStyle(2, 0x000000);
    bg.strokeCircle(dpadX, dpadY, 55);

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
        buttonSize - 4,
        buttonSize - 4,
        0xe0e0e0,
        1
      ).setInteractive();
      btn.setStrokeStyle(1, 0x000000);

      // Arrow symbols
      const arrows = { up: '▲', down: '▼', left: '◀', right: '▶' };
      this.add.text(dpadX + x, dpadY + y, arrows[dir], {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '10px',
        color: '#000000',
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        btn.setFillStyle(0xaaaaaa, 1);
        this.moveTiger(dir);
      });

      btn.on('pointerup', () => {
        btn.setFillStyle(0xe0e0e0, 1);
      });

      btn.on('pointerout', () => {
        btn.setFillStyle(0xe0e0e0, 1);
      });
    });

    // Hint text box
    const hintBg = this.add.graphics();
    hintBg.fillStyle(0xffffff, 0.9);
    hintBg.fillRect(width - 120, height - 70, 100, 40);
    hintBg.lineStyle(1, 0x000000);
    hintBg.strokeRect(width - 120, height - 70, 100, 40);

    this.add.text(width - 70, height - 50, 'Walk around\nto find NPCs', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '7px',
      color: '#000000',
      align: 'center',
    }).setOrigin(0.5);
  }
}
