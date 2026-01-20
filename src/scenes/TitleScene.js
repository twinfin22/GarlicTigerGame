// TitleScene - Game title and start screen

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.TITLE });
  }

  create() {
    const { width, height } = this.scale;
    const { COLORS, FONTS, TEXT_SIZES } = GAME_CONFIG;

    // Reset game state
    gameState.reset();

    // Background
    this.cameras.main.setBackgroundColor(COLORS.BLACK);

    // Draw decorative border
    const border = this.add.graphics();
    border.lineStyle(4, COLORS.WHITE);
    border.strokeRect(10, 10, width - 20, height - 20);
    border.lineStyle(2, COLORS.DARK_GRAY);
    border.strokeRect(20, 20, width - 40, height - 40);

    // Title
    this.add.text(width / 2, 120, 'GARLIC', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TITLE + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    this.add.text(width / 2, 160, 'TIGER', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TITLE + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    // Draw placeholder tiger sprite
    this.drawTitleTiger(width / 2, 280);

    // Garlic icons
    this.drawGarlicIcon(width / 2 - 80, 280);
    this.drawGarlicIcon(width / 2 + 80, 280);

    // Subtitle
    this.add.text(width / 2, 380, 'Eat 5 garlics to', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#cacaca',
    }).setOrigin(0.5);

    this.add.text(width / 2, 400, 'become Korean!', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#cacaca',
    }).setOrigin(0.5);

    // Start button
    const startButton = this.createButton(width / 2, 480, 'START GAME', () => {
      audioManager.playConfirm();
      this.startGame();
    });

    // Blinking "Press to start" text
    const pressText = this.add.text(width / 2, 540, 'Tap anywhere to begin', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TINY + 'px',
      color: '#8a8a8a',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: pressText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Branding
    this.add.text(width / 2, height - 40, 'by LocalNomad', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TINY + 'px',
      color: '#4a4a4a',
    }).setOrigin(0.5);

    // Input handling
    this.input.on('pointerdown', () => {
      audioManager.resume();
      audioManager.playConfirm();
      this.startGame();
    });

    // Keyboard input
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

  drawTitleTiger(x, y) {
    const g = this.add.graphics();

    // Body
    g.fillStyle(0xcacaca);
    g.fillRect(x - 20, y - 25, 40, 50);

    // Stripes
    g.fillStyle(0x4a4a4a);
    g.fillRect(x - 15, y - 20, 6, 3);
    g.fillRect(x + 9, y - 20, 6, 3);
    g.fillRect(x - 10, y - 10, 8, 3);
    g.fillRect(x + 5, y, 8, 3);

    // Head
    g.fillStyle(0xcacaca);
    g.fillRect(x - 16, y - 45, 32, 24);

    // Ears
    g.fillTriangle(x - 16, y - 45, x - 16, y - 58, x - 6, y - 45);
    g.fillTriangle(x + 16, y - 45, x + 16, y - 58, x + 6, y - 45);

    // Eyes
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 10, y - 38, 6, 6);
    g.fillRect(x + 4, y - 38, 6, 6);

    // Nose
    g.fillStyle(0x4a4a4a);
    g.fillTriangle(x - 3, y - 28, x + 3, y - 28, x, y - 24);

    // Tail
    g.fillStyle(0xcacaca);
    g.fillRect(x + 18, y + 10, 15, 4);
    g.fillRect(x + 30, y + 5, 4, 10);
  }

  drawGarlicIcon(x, y) {
    const g = this.add.graphics();

    // Garlic bulb
    g.fillStyle(0xf0f0f0);
    g.fillCircle(x, y, 15);
    g.fillCircle(x - 8, y + 5, 10);
    g.fillCircle(x + 8, y + 5, 10);

    // Stem
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 3, y - 22, 6, 10);

    // Outline
    g.lineStyle(2, 0x4a4a4a);
    g.strokeCircle(x, y, 15);
  }

  createButton(x, y, text, callback) {
    const { FONTS, TEXT_SIZES, COLORS } = GAME_CONFIG;

    const container = this.add.container(x, y);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.WHITE);
    bg.fillRect(-80, -20, 160, 40);
    bg.lineStyle(3, COLORS.DARK_GRAY);
    bg.strokeRect(-80, -20, 160, 40);

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#1a1a1a',
    }).setOrigin(0.5);

    container.add([bg, buttonText]);

    // Make interactive
    container.setSize(160, 40);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(COLORS.LIGHT_GRAY);
      bg.fillRect(-80, -20, 160, 40);
      bg.lineStyle(3, COLORS.WHITE);
      bg.strokeRect(-80, -20, 160, 40);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(COLORS.WHITE);
      bg.fillRect(-80, -20, 160, 40);
      bg.lineStyle(3, COLORS.DARK_GRAY);
      bg.strokeRect(-80, -20, 160, 40);
    });

    container.on('pointerdown', callback);

    return container;
  }

  startGame() {
    this.cameras.main.fadeOut(500, 26, 26, 26);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.INTRO);
    });
  }
}
