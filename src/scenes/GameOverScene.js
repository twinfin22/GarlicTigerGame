// GameOverScene - Pokemon-style game over (160x144 native)

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { inputHandler } from '../utils/InputHandler.js';
import { BG_PALETTES, BATTLE, hexToCSS, getSpritePalette } from '../data/palettes.js';
import * as Sprites from '../data/spriteData.js';
import { drawOverworldSprite, drawDialogFrame, drawTigerAtStage, drawGarlicCounter, drawCursor } from '../utils/TileRenderer.js';
import { shareManager } from '../utils/ShareManager.js';

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
    this.selectedButton = 0;
    inputHandler.init(this);

    // Play game over sound
    audioManager.playGameOver();

    // Dark background
    this.cameras.main.setBackgroundColor(0x383838);

    // 1px cream border
    const border = this.add.graphics();
    border.lineStyle(1, 0xF0E0D0);
    border.strokeRect(1, 1, 158, 142);

    // "GAME OVER" text with shake animation
    const gameOverText = this.add.text(80, 12, 'GAME OVER', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#F0E0D0',
    }).setOrigin(0.5);

    // Shake animation
    this.tweens.add({
      targets: gameOverText,
      x: 83,
      duration: 50,
      yoyo: true,
      repeat: 3,
    });

    // Tiger sprite at current stage
    const stage = gameState.getTransformationStage();
    drawTigerAtStage(this, 72, 26, stage);

    // Garlic count display: garlic icon + "X/5 - StageName"
    const garlics = gameState.getGarlics();
    const stageNames = ['Tiger', 'Furless', 'Tall', 'Seuree', 'Dark Hair', 'Korean'];

    // Draw garlic icon
    if (Sprites.UI_GARLIC) {
      const garlicG = this.add.graphics();
      drawOverworldSprite(garlicG, 24, 51, Sprites.UI_GARLIC, BG_PALETTES[0]);
    }

    this.add.text(80, 55, `${garlics}/5 - ${stageNames[stage]}`, {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#F0E0D0',
    }).setOrigin(0.5);

    // Wrong answer feedback text (6px, word-wrapped)
    this.add.text(80, 68, this.wrongFeedback, {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: '#989898',
      wordWrap: { width: 140 },
      align: 'center',
      lineSpacing: 3,
    }).setOrigin(0.5, 0);

    // === Two buttons: RETRY and SHARE ===
    this.buttons = [];
    this.buttonCallbacks = [];

    // RETRY button
    this.createButton(40, 102, 'RETRY', () => {
      audioManager.playConfirm();
      this.restartGame();
    }, 0);

    // SHARE button
    this.createButton(120, 102, 'SHARE', () => {
      audioManager.playSelect();
      this.shareResult();
    }, 1);

    // Cursor graphics
    this.cursorGraphics = this.add.graphics();
    this.updateCursor();

    // Encouragement text at bottom
    const encouragement = garlics === 0 ? 'Try again!' :
                          garlics < 3 ? 'Getting there!' :
                          'So close!';

    this.add.text(80, 120, encouragement, {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: '#989898',
    }).setOrigin(0.5);

    this.add.text(80, 132, 'Share your tiger!', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: '#686868',
    }).setOrigin(0.5);

    // Keyboard: LEFT/RIGHT to navigate, action to select
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-LEFT', () => this.moveSelection(-1));
      this.input.keyboard.on('keydown-RIGHT', () => this.moveSelection(1));
    }

    inputHandler.on('action', () => {
      this.selectButton();
    });

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      inputHandler.destroy();
    });
  }

  createButton(x, y, label, callback, index) {
    const g = this.add.graphics();

    // Button background
    g.fillStyle(0xF0E0D0);
    g.fillRect(x - 28, y - 7, 56, 14);
    g.lineStyle(1, 0x000000);
    g.strokeRect(x - 28, y - 7, 56, 14);

    // Button text
    this.add.text(x, y, label, {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#000000',
    }).setOrigin(0.5);

    this.buttons.push({ x, y, callback });
    this.buttonCallbacks.push(callback);

    // Make interactive via pointer
    const hitArea = this.add.rectangle(x, y, 56, 14, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerover', () => {
      this.selectedButton = index;
      this.updateCursor();
    });
    hitArea.on('pointerdown', callback);
  }

  moveSelection(dir) {
    audioManager.playSelect();
    this.selectedButton += dir;
    if (this.selectedButton < 0) this.selectedButton = this.buttons.length - 1;
    if (this.selectedButton >= this.buttons.length) this.selectedButton = 0;
    this.updateCursor();
  }

  updateCursor() {
    this.cursorGraphics.clear();
    if (this.buttons[this.selectedButton]) {
      const btn = this.buttons[this.selectedButton];
      // Draw cursor triangle left of the button
      drawCursor(this.cursorGraphics, btn.x - 36, btn.y - 3);
    }
  }

  selectButton() {
    if (this.buttons[this.selectedButton]) {
      this.buttons[this.selectedButton].callback();
    }
  }

  restartGame() {
    gameState.reset();
    this.cameras.main.fadeOut(300, 0x38, 0x38, 0x38);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(SCENES.TITLE);
    });
  }

  async shareResult() {
    const garlics = gameState.getGarlics();
    const stage = gameState.getTransformationStage();
    const result = await shareManager.shareWithStage(garlics, stage);

    if (result.success) {
      const feedbackText = result.method === 'clipboard' ? 'Copied!' : 'Shared!';
      const feedback = this.add.text(80, 72, feedbackText, {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: '#F0E0D0',
        backgroundColor: '#686868',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setDepth(200);

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
