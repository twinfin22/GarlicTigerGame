// TitleScene - Authentic Game Boy style title screen

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { getPalette, drawDialogBox, drawSprite, SPRITES } from '../utils/GBGraphics.js';
import { shareManager } from '../utils/ShareManager.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.TITLE });
  }

  create() {
    const { width, height } = this.scale;
    const p = getPalette();

    // Reset game state
    gameState.reset();

    // Check if this is a shared link with a stage
    const sharedStage = shareManager.getSharedStage();

    // Fill background with lightest color (like GB boot)
    this.cameras.main.setBackgroundColor(p.lightest);

    // Draw decorative border (Pokemon style)
    this.drawBorder();

    // Title logo area
    this.drawTitleLogo(width / 2, 50);

    // If shared stage, show friend's tiger - otherwise show normal title
    if (sharedStage !== null && sharedStage > 0) {
      this.drawSharedTiger(width / 2, 130, sharedStage);
    } else {
      // Draw tiger sprite (centered)
      this.drawTigerSprite(width / 2, 130);

      // Draw garlic decorations
      this.drawGarlicSprite(width / 2 - 50, 130);
      this.drawGarlicSprite(width / 2 + 50, 130);
    }

    // Subtitle - changes based on shared state
    if (sharedStage !== null && sharedStage > 0) {
      const stageNames = ['Tiger', 'Furless', 'Tall', 'Seuree', 'Dark Hair', 'Korean'];
      this.add.text(width / 2, 175, `Friend's tiger:`, {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#' + p.dark.toString(16).padStart(6, '0'),
      }).setOrigin(0.5);

      this.add.text(width / 2, 190, stageNames[sharedStage], {
        fontFamily: 'Press Start 2P',
        fontSize: '10px',
        color: '#' + p.darkest.toString(16).padStart(6, '0'),
      }).setOrigin(0.5);

      this.add.text(width / 2, 208, 'Can you beat them?', {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#' + p.dark.toString(16).padStart(6, '0'),
      }).setOrigin(0.5);
    } else {
      this.add.text(width / 2, 175, 'Eat 5 garlics', {
        fontFamily: 'Press Start 2P',
        fontSize: '10px',
        color: '#' + p.darkest.toString(16).padStart(6, '0'),
      }).setOrigin(0.5);

      this.add.text(width / 2, 192, 'to become Korean!', {
        fontFamily: 'Press Start 2P',
        fontSize: '10px',
        color: '#' + p.darkest.toString(16).padStart(6, '0'),
      }).setOrigin(0.5);
    }

    // Menu box (Pokemon style)
    this.drawMenuBox(width / 2, 240);

    // Blinking "PRESS START" text - larger for readability
    const pressStart = this.add.text(width / 2, 265, 'PRESS START', {
      fontFamily: 'Press Start 2P',
      fontSize: '10px',
      color: '#' + p.darkest.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    // Classic Game Boy blink effect (on/off, not fade)
    this.time.addEvent({
      delay: 500,
      callback: () => {
        pressStart.visible = !pressStart.visible;
      },
      loop: true,
    });

    // Copyright/branding
    this.add.text(width / 2, height - 15, '2024 LOCALNOMAD', {
      fontFamily: 'Press Start 2P',
      fontSize: '8px',
      color: '#' + p.dark.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    // Input handling
    this.input.on('pointerdown', () => {
      audioManager.resume();
      audioManager.playConfirm();
      this.startGame();
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      audioManager.playConfirm();
      this.startGame();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      audioManager.playConfirm();
      this.startGame();
    });

    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }

  drawBorder() {
    const { width, height } = this.scale;
    const p = getPalette();
    const g = this.add.graphics();

    // Clean black border (Pokemon style)
    g.lineStyle(2, p.darkest);
    g.strokeRect(4, 4, width - 8, height - 8);
  }

  drawTitleLogo(x, y) {
    const p = getPalette();
    const g = this.add.graphics();

    // "GARLIC" text background box
    g.fillStyle(p.darkest);
    g.fillRect(x - 55, y - 5, 110, 22);
    g.fillStyle(p.lightest);
    g.fillRect(x - 53, y - 3, 106, 18);

    this.add.text(x, y + 5, 'GARLIC', {
      fontFamily: 'Press Start 2P',
      fontSize: '12px',
      color: '#' + p.darkest.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    // "TIGER" text with shadow
    this.add.text(x + 1, y + 27, 'TIGER', {
      fontFamily: 'Press Start 2P',
      fontSize: '14px',
      color: '#' + p.dark.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    this.add.text(x, y + 26, 'TIGER', {
      fontFamily: 'Press Start 2P',
      fontSize: '14px',
      color: '#' + p.darkest.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);
  }

  drawTigerSprite(x, y) {
    const g = this.add.graphics();
    // Draw at 2x scale for title screen
    drawSprite(g, x - 16, y - 16, SPRITES.TIGER_FRONT, 16, 2);
  }

  drawSharedTiger(x, y, stage) {
    const p = getPalette();
    const g = this.add.graphics();
    const scale = 2;

    // Tiger appearance based on transformation stage
    const bodyColor = stage >= 4 ? p.dark : p.light;
    const furColor = stage >= 1 ? p.lightest : bodyColor;

    // Body gets longer at stage 2+
    const bodyHeight = (16 + (stage >= 2 ? 8 : 0)) * scale;
    const bodyWidth = 12 * scale;

    // Body
    g.fillStyle(furColor);
    g.fillRect(x - bodyWidth / 2, y - bodyHeight / 2, bodyWidth, bodyHeight);

    // Stripes (only if stage 0)
    if (stage < 1) {
      g.fillStyle(p.dark);
      g.fillRect(x - bodyWidth / 2 + 4, y - bodyHeight / 2 + 8, 6, 4);
      g.fillRect(x - bodyWidth / 2 + 14, y - bodyHeight / 2 + 8, 6, 4);
    }

    // Head
    const headColor = stage >= 4 ? p.dark : bodyColor;
    g.fillStyle(headColor);
    g.fillRect(x - 10 * scale, y - bodyHeight / 2 - 14 * scale, 20 * scale, 14 * scale);

    // Eyes
    g.fillStyle(p.darkest);
    g.fillRect(x - 6 * scale, y - bodyHeight / 2 - 10 * scale, 3 * scale, 3 * scale);
    g.fillRect(x + 3 * scale, y - bodyHeight / 2 - 10 * scale, 3 * scale, 3 * scale);

    // Ears
    g.fillStyle(headColor);
    g.fillTriangle(
      x - 10 * scale, y - bodyHeight / 2 - 14 * scale,
      x - 10 * scale, y - bodyHeight / 2 - 22 * scale,
      x - 4 * scale, y - bodyHeight / 2 - 14 * scale
    );
    g.fillTriangle(
      x + 10 * scale, y - bodyHeight / 2 - 14 * scale,
      x + 10 * scale, y - bodyHeight / 2 - 22 * scale,
      x + 4 * scale, y - bodyHeight / 2 - 14 * scale
    );

    // Mouth (happy)
    g.lineStyle(2, p.darkest);
    g.beginPath();
    g.arc(x, y - bodyHeight / 2 - 4 * scale, 4 * scale, 0.3, Math.PI - 0.3);
    g.strokePath();

    // Stage indicator badge
    g.fillStyle(p.darkest);
    g.fillRect(x + 25, y - 20, 50, 18);
    g.fillStyle(p.lightest);
    g.fillRect(x + 27, y - 18, 46, 14);

    this.add.text(x + 50, y - 11, `${stage}/5`, {
      fontFamily: 'Press Start 2P',
      fontSize: '8px',
      color: '#' + p.darkest.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);
  }

  drawGarlicSprite(x, y) {
    const g = this.add.graphics();
    drawSprite(g, x - 8, y - 8, SPRITES.GARLIC, 8, 2);
  }

  drawMenuBox(x, y) {
    const g = this.add.graphics();
    const p = getPalette();

    // Pokemon-style menu box (clean, no shadows)
    const boxWidth = 120;
    const boxHeight = 40;

    // White fill
    g.fillStyle(p.lightest);
    g.fillRect(x - boxWidth/2, y - boxHeight/2, boxWidth, boxHeight);

    // Black border
    g.lineStyle(2, p.darkest);
    g.strokeRect(x - boxWidth/2 + 1, y - boxHeight/2 + 1, boxWidth - 2, boxHeight - 2);
  }

  startGame() {
    // Classic screen wipe transition
    const { width, height } = this.scale;
    const p = getPalette();

    const wipe = this.add.rectangle(0, height / 2, 0, height, p.darkest).setOrigin(0, 0.5);

    this.tweens.add({
      targets: wipe,
      width: width,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        this.scene.start(SCENES.INTRO);
      },
    });
  }
}
