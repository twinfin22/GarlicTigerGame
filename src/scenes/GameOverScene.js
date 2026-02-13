// GameOverScene - Result Card screen (240x160 GBA native)
// Shows final results, share button, play again button
// Bilingual text throughout (Korean + English)

import Phaser from 'phaser';
import { GAME, SCENES, BRANDING } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { StateManager } from '../utils/StateManager.js';
import { InputHandler } from '../utils/InputHandler.js';
import { ShareManager } from '../utils/ShareManager.js';
import { SHARE_MESSAGES, RESULT_CARD, TRANSFORMATION_LABELS } from '../data/shareText.js';
import { ASSET_MANIFEST } from '../data/assetManifest.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME_OVER });
  }

  create() {
    this.selectedButton = 0;
    this.buttons = [];
    this.inputHandler = new InputHandler(this);

    // Flag-based action input (more reliable than JustDown polling)
    this._actionFlag = false;
    this._actionCooldown = 0;
    this._dirCooldown = 0;
    const ACTION_COOLDOWN_MS = 150;
    const DIR_COOLDOWN_MS = 200;

    this._onKeyDown = (event) => {
      const key = event.key || event.code;
      const now = Date.now();
      if (key === ' ' || key === 'Space' || key === 'Enter' || key === 'z' || key === 'Z') {
        if (now - this._actionCooldown > ACTION_COOLDOWN_MS) {
          this._actionFlag = true;
          this._actionCooldown = now;
        }
      }
    };
    this.input.keyboard.on('keydown', this._onKeyDown);

    // Mobile touch action support
    this._onPointerDown = () => {
      const now = Date.now();
      if (now - this._actionCooldown > ACTION_COOLDOWN_MS) {
        this._actionFlag = true;
        this._actionCooldown = now;
      }
    };
    this.input.on('pointerdown', this._onPointerDown);

    const stage = StateManager.getStage();
    const totalTries = StateManager.getTotalTries();
    const garlics = stage; // garlics === stage since each garlic = 1 stage

    // Dark background
    this.cameras.main.setBackgroundColor(0x111111);
    this.cameras.main.fadeIn(300);

    // White card overlay
    const cardX = 12;
    const cardY = 8;
    const cardW = GAME.WIDTH - 24;
    const cardH = GAME.HEIGHT - 16;

    const card = this.add.graphics();
    card.fillStyle(0xFFFFFF);
    card.fillRect(cardX, cardY, cardW, cardH);
    card.lineStyle(2, 0x000000);
    card.strokeRect(cardX, cardY, cardW, cardH);

    // Inner border
    card.lineStyle(1, 0xCCCCCC);
    card.strokeRect(cardX + 3, cardY + 3, cardW - 6, cardH - 6);

    // --- Title ---
    this.add.text(GAME.WIDTH / 2, cardY + 12, RESULT_CARD.title.ko, {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '10px',
      color: '#000000',
    }).setOrigin(0.5);

    this.add.text(GAME.WIDTH / 2, cardY + 24, RESULT_CARD.title.en, {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: '#666666',
    }).setOrigin(0.5);

    // --- Tiger sprite ---
    const tigerX = GAME.WIDTH / 2;
    const tigerY = cardY + 52;
    this._drawTigerAtStage(tigerX, tigerY, stage);

    // --- Garlic count ---
    const garlicKey = ASSET_MANIFEST.korean.garlic.key;
    const statY = tigerY + 26;

    if (this.textures.exists(garlicKey)) {
      const garlicIcon = this.add.image(GAME.WIDTH / 2 - 30, statY, garlicKey);
      garlicIcon.setDisplaySize(12, 12);
    }

    this.add.text(GAME.WIDTH / 2 - 16, statY, `${garlics} / ${GAME.TOTAL_GARLICS}`, {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '8px',
      color: '#000000',
    }).setOrigin(0, 0.5);

    // --- Stage label ---
    const stageLabel = stage > 0 && stage <= TRANSFORMATION_LABELS.length
      ? TRANSFORMATION_LABELS[stage - 1]
      : { ko: '\ud638\ub791\uc774', en: 'Tiger' };

    this.add.text(GAME.WIDTH / 2, statY + 12, stageLabel.ko, {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '8px',
      color: '#333333',
    }).setOrigin(0.5);

    this.add.text(GAME.WIDTH / 2, statY + 22, stageLabel.en, {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '6px',
      color: '#888888',
    }).setOrigin(0.5);

    // --- Total tries ---
    const triesY = statY + 34;
    this.add.text(GAME.WIDTH / 2, triesY, `${totalTries}${RESULT_CARD.tries_label.ko}`, {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '7px',
      color: '#555555',
    }).setOrigin(0.5);

    this.add.text(GAME.WIDTH / 2, triesY + 10, `${totalTries} ${RESULT_CARD.tries_label.en}`, {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '6px',
      color: '#999999',
    }).setOrigin(0.5);

    // Perfect badge
    if (totalTries === garlics && garlics === GAME.TOTAL_GARLICS) {
      this.add.text(GAME.WIDTH / 2, triesY + 22, `\u2605 ${RESULT_CARD.perfect.ko} / ${RESULT_CARD.perfect.en} \u2605`, {
        fontFamily: `'${GAME.FONT_KO}', sans-serif`,
        fontSize: '7px',
        color: '#FFD700',
      }).setOrigin(0.5);
    }

    // --- Buttons ---
    const btnY = GAME.HEIGHT - 28;

    this._createButton(GAME.WIDTH / 2 - 50, btnY, RESULT_CARD.share_btn.ko, RESULT_CARD.share_btn.en, 0);
    this._createButton(GAME.WIDTH / 2 + 50, btnY, RESULT_CARD.play_again.ko, RESULT_CARD.play_again.en, 1);

    // Cursor
    this.cursorGraphics = this.add.graphics();
    this._updateCursor();

    // Branding
    this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 6, BRANDING.NAME, {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '5px',
      color: '#AAAAAA',
    }).setOrigin(0.5);

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      if (this.inputHandler) this.inputHandler.destroy();
      if (this._onKeyDown) this.input.keyboard.off('keydown', this._onKeyDown);
      if (this._onPointerDown) this.input.off('pointerdown', this._onPointerDown);
    });
  }

  _drawTigerAtStage(x, y, stage) {
    const spriteSize = 40;

    // Try flexible_neck frame for the stage
    const frameIndex = Math.min(Math.max(0, (stage - 1) * 2), 11);
    const frameKey = stage > 0 ? `flexible_neck_${frameIndex}` : null;

    if (frameKey && this.textures.exists(frameKey)) {
      const tiger = this.add.image(x, y, frameKey);
      tiger.setDisplaySize(spriteSize, spriteSize);
      return tiger;
    }

    // Fallback: tiger overworld sprite
    if (this.textures.exists('tiger')) {
      const tiger = this.add.sprite(x, y, 'tiger', 0);
      tiger.setDisplaySize(spriteSize, spriteSize);
      return tiger;
    }

    // Last fallback
    const g = this.add.graphics();
    g.fillStyle(0xF89838);
    g.fillRect(x - spriteSize / 2, y - spriteSize / 2, spriteSize, spriteSize);
    return g;
  }

  _createButton(x, y, labelKo, labelEn, index) {
    const btnW = 80;
    const btnH = 18;

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x333333);
    bg.fillRect(x - btnW / 2, y - btnH / 2, btnW, btnH);
    bg.lineStyle(1, 0x000000);
    bg.strokeRect(x - btnW / 2, y - btnH / 2, btnW, btnH);

    // Korean text
    this.add.text(x, y - 3, labelKo, {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '7px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    // English text (smaller, below)
    this.add.text(x, y + 6, labelEn, {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '5px',
      color: '#CCCCCC',
    }).setOrigin(0.5);

    // Interactive hit area
    const hitArea = this.add.rectangle(x, y, btnW, btnH, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    hitArea.on('pointerover', () => {
      this.selectedButton = index;
      this._updateCursor();
    });
    hitArea.on('pointerdown', () => {
      this._selectButton(index);
    });

    this.buttons.push({ x, y, w: btnW, h: btnH, bg, index });
  }

  _updateCursor() {
    if (!this.cursorGraphics) return;
    this.cursorGraphics.clear();

    const btn = this.buttons[this.selectedButton];
    if (!btn) return;

    // Draw cursor triangle to the left of the selected button
    this.cursorGraphics.fillStyle(0xFFD700);
    const cx = btn.x - btn.w / 2 - 8;
    const cy = btn.y;
    this.cursorGraphics.fillTriangle(cx, cy - 4, cx, cy + 4, cx + 6, cy);
  }

  _selectButton(index) {
    audioManager.playConfirm();

    if (index === 0) {
      // Share
      this._shareResult();
    } else {
      // Play Again
      StateManager.reset();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.TITLE);
      });
    }
  }

  async _shareResult() {
    const stage = StateManager.getStage();
    const totalTries = StateManager.getTotalTries();

    try {
      const shared = await ShareManager.share(stage, totalTries);
      if (shared) {
        const feedback = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, 'Shared!', {
          fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
          fontSize: '9px',
          color: '#FFFFFF',
          backgroundColor: '#333333',
          padding: { x: 8, y: 4 },
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
          targets: feedback,
          alpha: 0,
          duration: 300,
          delay: 1200,
          onComplete: () => feedback.destroy(),
        });
      }
    } catch (error) {
      console.warn('Share failed:', error);
    }
  }

  update() {
    if (!this.inputHandler) return;

    // Consume flag-based action input
    const action = this._actionFlag;
    this._actionFlag = false;

    // Navigate buttons with left/right (with cooldown to prevent skipping)
    const now = Date.now();
    const dir = this.inputHandler.getDirection();
    if ((dir === 'left' || dir === 'right') && now - this._dirCooldown > 200) {
      this._dirCooldown = now;
      audioManager.playSelect();
      if (dir === 'left') {
        this.selectedButton = Math.max(0, this.selectedButton - 1);
      } else {
        this.selectedButton = Math.min(this.buttons.length - 1, this.selectedButton + 1);
      }
      this._updateCursor();
    }

    // Select with action button
    if (action) {
      this._selectButton(this.selectedButton);
    }
  }
}
