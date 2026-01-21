// TitleScene - Authentic Game Boy style title screen

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { getPalette, drawDialogBox, drawSprite, SPRITES } from '../utils/GBGraphics.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.TITLE });
  }

  create() {
    const { width, height } = this.scale;
    const p = getPalette();

    // Reset game state
    gameState.reset();

    // Fill background with lightest color (like GB boot)
    this.cameras.main.setBackgroundColor(p.lightest);

    // Draw decorative border (Pokemon style)
    this.drawBorder();

    // Title logo area
    this.drawTitleLogo(width / 2, 50);

    // Draw tiger sprite (centered)
    this.drawTigerSprite(width / 2, 130);

    // Draw garlic decorations
    this.drawGarlicSprite(width / 2 - 50, 130);
    this.drawGarlicSprite(width / 2 + 50, 130);

    // Subtitle
    this.add.text(width / 2, 175, 'Eat 5 garlics', {
      fontFamily: 'Press Start 2P',
      fontSize: '8px',
      color: '#' + p.darkest.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    this.add.text(width / 2, 190, 'to become Korean!', {
      fontFamily: 'Press Start 2P',
      fontSize: '8px',
      color: '#' + p.darkest.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    // Menu box (Pokemon style)
    this.drawMenuBox(width / 2, 240);

    // Blinking "PRESS START" text
    const pressStart = this.add.text(width / 2, 265, 'PRESS START', {
      fontFamily: 'Press Start 2P',
      fontSize: '8px',
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
      fontSize: '6px',
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

    // Outer border
    g.fillStyle(p.darkest);
    g.fillRect(0, 0, width, 4);
    g.fillRect(0, height - 4, width, 4);
    g.fillRect(0, 0, 4, height);
    g.fillRect(width - 4, 0, 4, height);

    // Inner highlight
    g.fillStyle(p.dark);
    g.fillRect(4, 4, width - 8, 2);
    g.fillRect(4, height - 6, width - 8, 2);
    g.fillRect(4, 4, 2, height - 8);
    g.fillRect(width - 6, 4, 2, height - 8);
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

  drawGarlicSprite(x, y) {
    const g = this.add.graphics();
    drawSprite(g, x - 8, y - 8, SPRITES.GARLIC, 8, 2);
  }

  drawMenuBox(x, y) {
    const g = this.add.graphics();
    const p = getPalette();

    // Pokemon-style menu box
    const boxWidth = 120;
    const boxHeight = 40;

    // Shadow
    g.fillStyle(p.dark);
    g.fillRect(x - boxWidth/2 + 3, y - boxHeight/2 + 3, boxWidth, boxHeight);

    // Main box
    g.fillStyle(p.lightest);
    g.fillRect(x - boxWidth/2, y - boxHeight/2, boxWidth, boxHeight);

    // Border
    g.fillStyle(p.darkest);
    g.fillRect(x - boxWidth/2, y - boxHeight/2, boxWidth, 3);
    g.fillRect(x - boxWidth/2, y + boxHeight/2 - 3, boxWidth, 3);
    g.fillRect(x - boxWidth/2, y - boxHeight/2, 3, boxHeight);
    g.fillRect(x + boxWidth/2 - 3, y - boxHeight/2, 3, boxHeight);

    // Inner border
    g.fillStyle(p.light);
    g.fillRect(x - boxWidth/2 + 3, y - boxHeight/2 + 3, boxWidth - 6, 2);
    g.fillRect(x - boxWidth/2 + 3, y - boxHeight/2 + 3, 2, boxHeight - 6);
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
