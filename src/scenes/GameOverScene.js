// GameOverScene - Game over with share functionality

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { shareManager } from '../utils/ShareManager.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME_OVER });
    this.wrongFeedback = '';
  }

  init(data) {
    this.wrongFeedback = data.wrongFeedback || 'You chose poorly...';
  }

  create() {
    const { width, height } = this.scale;
    const { COLORS, FONTS, TEXT_SIZES } = GAME_CONFIG;

    // Play game over sound
    audioManager.playGameOver();

    // Dark background
    this.cameras.main.setBackgroundColor(COLORS.BLACK);

    // Border
    const border = this.add.graphics();
    border.lineStyle(4, COLORS.WHITE);
    border.strokeRect(10, 10, width - 20, height - 20);

    // GAME OVER text
    const gameOverText = this.add.text(width / 2, 80, 'GAME OVER', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TITLE + 'px',
      color: '#ff4444',
    }).setOrigin(0.5);

    // Shake animation
    this.tweens.add({
      targets: gameOverText,
      x: width / 2 + 5,
      duration: 50,
      yoyo: true,
      repeat: 5,
    });

    // Draw current tiger state
    this.drawTigerState(width / 2, 200);

    // Garlic count message
    const garlics = gameState.getGarlics();
    this.add.text(width / 2, 300, `You collected ${garlics}/5 garlics`, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    this.add.text(width / 2, 330, 'on your journey...', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#8a8a8a',
    }).setOrigin(0.5);

    // Wrong answer feedback
    const feedbackBg = this.add.rectangle(width / 2, 400, width - 60, 80, COLORS.DARK_GRAY);

    this.add.text(width / 2, 400, this.wrongFeedback, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TINY + 'px',
      color: '#cacaca',
      wordWrap: { width: width - 80 },
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Buttons
    this.createButton(width / 2, 500, 'TRY AGAIN', () => {
      audioManager.playConfirm();
      this.restartGame();
    });

    this.createButton(width / 2, 560, 'SHARE', () => {
      audioManager.playSelect();
      this.shareResult();
    });

    // Encouragement based on progress
    let encouragement = '';
    if (garlics === 0) {
      encouragement = 'The journey of 1000 miles begins with a single step!';
    } else if (garlics < 3) {
      encouragement = 'Good start! You\'re learning Korean culture!';
    } else if (garlics < 5) {
      encouragement = 'So close! Almost became Korean!';
    }

    if (encouragement) {
      this.add.text(width / 2, height - 50, encouragement, {
        fontFamily: FONTS.MAIN,
        fontSize: TEXT_SIZES.TINY + 'px',
        color: '#6a6a6a',
        wordWrap: { width: width - 60 },
        align: 'center',
      }).setOrigin(0.5);
    }
  }

  drawTigerState(x, y) {
    const stage = gameState.getTransformationStage();
    const g = this.add.graphics();

    const scale = 1.5;
    const bodyColor = stage >= 4 ? 0x2a2a2a : 0xcacaca;
    const furColor = stage >= 1 ? 0xf0f0f0 : bodyColor;

    // Body
    const bodyHeight = (20 + (stage >= 2 ? 10 : 0)) * scale;
    const bodyWidth = 16 * scale;

    g.fillStyle(furColor);
    g.fillRect(x - bodyWidth / 2, y - bodyHeight / 2, bodyWidth, bodyHeight);

    // Stripes (stage 0 only)
    if (stage < 1) {
      g.fillStyle(0x4a4a4a);
      g.fillRect(x - bodyWidth / 2 + 3, y - bodyHeight / 2 + 6, 5, 3);
      g.fillRect(x - bodyWidth / 2 + 12, y - bodyHeight / 2 + 6, 5, 3);
    }

    // Head
    const headColor = stage >= 4 ? 0x2a2a2a : bodyColor;
    g.fillStyle(headColor);
    g.fillRect(x - 12, y - bodyHeight / 2 - 18, 24, 18);

    // Sad eyes (X eyes for game over)
    g.lineStyle(2, 0x1a1a1a);
    // Left eye X
    g.lineBetween(x - 10, y - bodyHeight / 2 - 14, x - 5, y - bodyHeight / 2 - 9);
    g.lineBetween(x - 10, y - bodyHeight / 2 - 9, x - 5, y - bodyHeight / 2 - 14);
    // Right eye X
    g.lineBetween(x + 5, y - bodyHeight / 2 - 14, x + 10, y - bodyHeight / 2 - 9);
    g.lineBetween(x + 5, y - bodyHeight / 2 - 9, x + 10, y - bodyHeight / 2 - 14);

    // Ears
    g.fillStyle(headColor);
    g.fillTriangle(x - 12, y - bodyHeight / 2 - 18, x - 12, y - bodyHeight / 2 - 28, x - 5, y - bodyHeight / 2 - 18);
    g.fillTriangle(x + 12, y - bodyHeight / 2 - 18, x + 12, y - bodyHeight / 2 - 28, x + 5, y - bodyHeight / 2 - 18);

    // Sad mouth
    g.lineStyle(2, 0x1a1a1a);
    g.beginPath();
    g.arc(x, y - bodyHeight / 2 - 2, 6, Math.PI + 0.3, -0.3);
    g.strokePath();

    // Tears
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 12, y - bodyHeight / 2 - 6, 2, 8);
    g.fillRect(x + 10, y - bodyHeight / 2 - 6, 2, 8);

    // Speech bubble showing transformation stage
    if (stage > 0) {
      const stageTexts = ['', 'No fur...', 'So long...', 'Seuree...', 'Dark hair...'];
      const bubbleText = stageTexts[Math.min(stage, 4)];

      if (bubbleText) {
        g.fillStyle(0xf0f0f0);
        g.fillRect(x + 20, y - bodyHeight / 2 - 35, 60, 20);
        g.fillTriangle(x + 20, y - bodyHeight / 2 - 25, x + 20, y - bodyHeight / 2 - 15, x + 12, y - bodyHeight / 2 - 20);

        this.add.text(x + 25, y - bodyHeight / 2 - 30, bubbleText, {
          fontFamily: GAME_CONFIG.FONTS.MAIN,
          fontSize: '6px',
          color: '#1a1a1a',
        });
      }
    }
  }

  createButton(x, y, text, callback) {
    const { FONTS, TEXT_SIZES, COLORS } = GAME_CONFIG;

    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.WHITE);
    bg.fillRect(-100, -20, 200, 40);
    bg.lineStyle(3, COLORS.DARK_GRAY);
    bg.strokeRect(-100, -20, 200, 40);

    const buttonText = this.add.text(0, 0, text, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#1a1a1a',
    }).setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setSize(200, 40);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(COLORS.LIGHT_GRAY);
      bg.fillRect(-100, -20, 200, 40);
      bg.lineStyle(3, COLORS.WHITE);
      bg.strokeRect(-100, -20, 200, 40);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(COLORS.WHITE);
      bg.fillRect(-100, -20, 200, 40);
      bg.lineStyle(3, COLORS.DARK_GRAY);
      bg.strokeRect(-100, -20, 200, 40);
    });

    container.on('pointerdown', callback);

    return container;
  }

  restartGame() {
    gameState.reset();
    this.cameras.main.fadeOut(500, 26, 26, 26);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.INTRO);
    });
  }

  async shareResult() {
    const garlics = gameState.getGarlics();
    const result = await shareManager.share(garlics, false);

    if (result.success) {
      // Show feedback
      const { width, height } = this.scale;
      const feedback = this.add.text(
        width / 2,
        height / 2,
        result.method === 'clipboard' ? 'Copied to clipboard!' : 'Shared!',
        {
          fontFamily: GAME_CONFIG.FONTS.MAIN,
          fontSize: GAME_CONFIG.TEXT_SIZES.SMALL + 'px',
          color: '#44ff44',
          backgroundColor: '#1a1a1a',
          padding: { x: 15, y: 10 },
        }
      ).setOrigin(0.5);

      this.tweens.add({
        targets: feedback,
        alpha: 0,
        duration: 500,
        delay: 1500,
        onComplete: () => feedback.destroy(),
      });
    }
  }
}
