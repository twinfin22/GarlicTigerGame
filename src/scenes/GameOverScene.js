// GameOverScene - Game over with share functionality

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { shareManager } from '../utils/ShareManager.js';
import { getPalette } from '../utils/GBGraphics.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME_OVER });
    this.wrongFeedback = '';
    this.selectedButton = 0;
  }

  init(data) {
    this.wrongFeedback = data.wrongFeedback || 'You chose poorly...';
  }

  create() {
    const { width, height } = this.scale;
    const p = getPalette();
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');
    const lightestHex = '#' + p.lightest.toString(16).padStart(6, '0');
    const darkHex = '#' + p.dark.toString(16).padStart(6, '0');

    // Play game over sound
    audioManager.playGameOver();

    // Game Boy style dark background
    this.cameras.main.setBackgroundColor(p.darkest);

    // Border (clean Pokemon style)
    const border = this.add.graphics();
    border.lineStyle(2, p.lightest);
    border.strokeRect(4, 4, width - 8, height - 8);

    // GAME OVER text
    const gameOverText = this.add.text(width / 2, 25, 'GAME OVER', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '12px',
      color: lightestHex,
    }).setOrigin(0.5);

    // Shake animation
    this.tweens.add({
      targets: gameOverText,
      x: width / 2 + 3,
      duration: 50,
      yoyo: true,
      repeat: 3,
    });

    // Draw current tiger state (smaller, positioned higher)
    this.drawTigerState(width / 2, 70);

    // Garlic count and stage info
    const garlics = gameState.getGarlics();
    const stage = gameState.getTransformationStage();
    const stageNames = ['Tiger', 'Furless', 'Tall', 'Seuree', 'Dark Hair', 'Korean'];

    this.add.text(width / 2, 115, `${garlics}/5 garlics - ${stageNames[stage]}`, {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: lightestHex,
    }).setOrigin(0.5);

    // Wrong answer feedback (compact)
    this.add.text(width / 2, 140, this.wrongFeedback, {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '7px',
      color: darkHex,
      wordWrap: { width: width - 40 },
      align: 'center',
    }).setOrigin(0.5);

    // Buttons - compact layout at bottom
    this.buttons = [];
    this.buttonTexts = [];

    this.createCompactButton(width / 2 - 70, 185, 'RETRY', () => {
      audioManager.playConfirm();
      this.restartGame();
    }, 0);

    this.createCompactButton(width / 2 + 70, 185, 'SHARE', () => {
      audioManager.playSelect();
      this.shareResult();
    }, 1);

    // Selection cursor
    this.cursor = this.add.text(0, 185, '>', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '10px',
      color: lightestHex,
    }).setOrigin(0.5);
    this.updateCursor();

    // Encouragement at bottom
    let encouragement = garlics === 0 ? 'Try again!' :
                        garlics < 3 ? 'Getting there!' :
                        'So close!';

    this.add.text(width / 2, 220, encouragement, {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '7px',
      color: darkHex,
    }).setOrigin(0.5);

    // Share prompt
    this.add.text(width / 2, 240, 'Share your tiger with friends!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '6px',
      color: darkHex,
    }).setOrigin(0.5);

    // Keyboard controls
    this.input.keyboard.on('keydown-LEFT', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-SPACE', () => this.selectButton());
    this.input.keyboard.on('keydown-ENTER', () => this.selectButton());
  }

  drawTigerState(x, y) {
    const stage = gameState.getTransformationStage();
    const p = getPalette();
    const g = this.add.graphics();

    const scale = 1;
    const bodyColor = stage >= 4 ? p.dark : p.light;
    const furColor = stage >= 1 ? p.lightest : bodyColor;

    // Body (compact)
    const bodyHeight = (16 + (stage >= 2 ? 6 : 0)) * scale;
    const bodyWidth = 12 * scale;

    g.fillStyle(furColor);
    g.fillRect(x - bodyWidth / 2, y - bodyHeight / 2, bodyWidth, bodyHeight);

    // Stripes (stage 0 only)
    if (stage < 1) {
      g.fillStyle(p.dark);
      g.fillRect(x - bodyWidth / 2 + 2, y - bodyHeight / 2 + 4, 3, 2);
      g.fillRect(x - bodyWidth / 2 + 7, y - bodyHeight / 2 + 4, 3, 2);
    }

    // Head
    const headColor = stage >= 4 ? p.dark : bodyColor;
    g.fillStyle(headColor);
    g.fillRect(x - 8, y - bodyHeight / 2 - 12, 16, 12);

    // Sad eyes (X eyes for game over)
    g.lineStyle(1, p.darkest);
    g.lineBetween(x - 6, y - bodyHeight / 2 - 9, x - 3, y - bodyHeight / 2 - 6);
    g.lineBetween(x - 6, y - bodyHeight / 2 - 6, x - 3, y - bodyHeight / 2 - 9);
    g.lineBetween(x + 3, y - bodyHeight / 2 - 9, x + 6, y - bodyHeight / 2 - 6);
    g.lineBetween(x + 3, y - bodyHeight / 2 - 6, x + 6, y - bodyHeight / 2 - 9);

    // Ears
    g.fillStyle(headColor);
    g.fillTriangle(x - 8, y - bodyHeight / 2 - 12, x - 8, y - bodyHeight / 2 - 18, x - 4, y - bodyHeight / 2 - 12);
    g.fillTriangle(x + 8, y - bodyHeight / 2 - 12, x + 8, y - bodyHeight / 2 - 18, x + 4, y - bodyHeight / 2 - 12);

    // Sad mouth
    g.lineStyle(1, p.darkest);
    g.beginPath();
    g.arc(x, y - bodyHeight / 2 - 2, 4, Math.PI + 0.3, -0.3);
    g.strokePath();

    // Tears
    g.fillStyle(p.light);
    g.fillRect(x - 7, y - bodyHeight / 2 - 4, 1, 5);
    g.fillRect(x + 6, y - bodyHeight / 2 - 4, 1, 5);
  }

  createCompactButton(x, y, text, callback, index) {
    const p = getPalette();
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');

    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(p.lightest);
    bg.fillRect(-45, -12, 90, 24);
    bg.lineStyle(2, p.darkest);
    bg.strokeRect(-45, -12, 90, 24);

    const buttonText = this.add.text(0, 0, text, {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: darkestHex,
    }).setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setSize(90, 24);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.selectedButton = index;
      this.updateCursor();
    });

    container.on('pointerdown', callback);

    this.buttons.push({ container, callback, bg });
    this.buttonTexts.push(buttonText);

    return container;
  }

  moveSelection(dir) {
    audioManager.playSelect();
    this.selectedButton += dir;
    if (this.selectedButton < 0) this.selectedButton = this.buttons.length - 1;
    if (this.selectedButton >= this.buttons.length) this.selectedButton = 0;
    this.updateCursor();
  }

  updateCursor() {
    if (this.buttons[this.selectedButton]) {
      const btn = this.buttons[this.selectedButton].container;
      this.cursor.setPosition(btn.x - 55, btn.y);
    }
  }

  selectButton() {
    if (this.buttons[this.selectedButton]) {
      this.buttons[this.selectedButton].callback();
    }
  }

  restartGame() {
    gameState.reset();
    const p = getPalette();
    this.cameras.main.fadeOut(300,
      (p.darkest >> 16) & 0xff,
      (p.darkest >> 8) & 0xff,
      p.darkest & 0xff
    );
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.TITLE);
    });
  }

  async shareResult() {
    const garlics = gameState.getGarlics();
    const stage = gameState.getTransformationStage();
    const result = await shareManager.shareWithStage(garlics, stage);

    if (result.success) {
      // Show feedback
      const { width, height } = this.scale;
      const p = getPalette();
      const feedback = this.add.text(
        width / 2,
        height / 2,
        result.method === 'clipboard' ? 'Copied!' : 'Shared!',
        {
          fontFamily: GAME_CONFIG.FONTS.MAIN,
          fontSize: '10px',
          color: '#' + p.lightest.toString(16).padStart(6, '0'),
          backgroundColor: '#' + p.dark.toString(16).padStart(6, '0'),
          padding: { x: 10, y: 5 },
        }
      ).setOrigin(0.5);

      this.tweens.add({
        targets: feedback,
        alpha: 0,
        duration: 300,
        delay: 1000,
        onComplete: () => feedback.destroy(),
      });
    }
  }
}
