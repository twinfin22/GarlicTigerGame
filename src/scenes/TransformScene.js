// TransformScene - Pokemon evolution screen (240x160 GBA native)
// Bilingual text, real sprite assets, evolution-style flickering animation

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { StateManager } from '../utils/StateManager.js';
import { InputHandler } from '../utils/InputHandler.js';
import { ASSET_MANIFEST } from '../data/assetManifest.js';

// Frame key for a given transformation stage (0-11 range mapped to flex neck frames)
const getFlexibleNeckKey = (stage) => {
  // Map stage 1-5 to frame indices 0-11 (2-3 frames per stage)
  const frameIndex = Math.min(Math.max(0, (stage - 1) * 2), 11);
  return `flexible_neck_${frameIndex}`;
};

export class TransformScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.TRANSFORM });
    this.transformation = null;
    this.quizId = null;
  }

  init(data) {
    this.quizId = data.quizId;
    this.transformation = data.transformation;
  }

  create() {
    this.inputHandler = new InputHandler(this);
    this.canContinue = false;

    // Flag-based action input (more reliable than JustDown polling)
    this._actionFlag = false;
    this._actionCooldown = 0;
    const ACTION_COOLDOWN_MS = 150;

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

    // Black background
    this.cameras.main.setBackgroundColor(0x000000);

    // Play transformation sound
    audioManager.playTransform();

    // "What?" and "TIGER is transforming!" text at top (bilingual)
    this.add.text(GAME.WIDTH / 2, 8, '\ubb50\uc57c?!', {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '9px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    this.add.text(GAME.WIDTH / 2, 20, 'What?!', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: '#CCCCCC',
    }).setOrigin(0.5);

    this.add.text(GAME.WIDTH / 2, 34, 'TIGER is transforming!', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: '#F0E0D0',
    }).setOrigin(0.5);

    // Current and new stage
    const newStage = this.transformation.stage;
    const oldStage = Math.max(0, newStage - 1);

    // Create tiger sprite center screen
    const centerX = GAME.WIDTH / 2;
    const centerY = GAME.HEIGHT / 2 + 4;
    const spriteSize = 64;

    // Old tiger (initially visible)
    this.oldTiger = this._createTigerSprite(centerX, centerY, oldStage, spriteSize);

    // New tiger (initially hidden)
    this.newTiger = this._createTigerSprite(centerX, centerY, newStage, spriteSize);
    this.newTiger.setVisible(false);

    // Create pixel-art sparkle effects around tiger
    this._createSparkles(centerX, centerY);

    // Pokemon evolution flickering animation
    this.flickerCount = 0;
    this.flickerTotal = 18;
    this.flickerDelay = 500;
    this.showingOld = true;
    this._startFlicker();

    // After flickering, do white flash then reveal final form
    this.time.delayedCall(3200, () => this._doWhiteFlash(centerX, centerY));

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      if (this.inputHandler) this.inputHandler.destroy();
      if (this._onKeyDown) this.input.keyboard.off('keydown', this._onKeyDown);
      if (this._onPointerDown) this.input.off('pointerdown', this._onPointerDown);
    });
  }

  _createTigerSprite(x, y, stage, size) {
    // Try to use a flexible_neck frame for the stage
    const frameKey = getFlexibleNeckKey(stage);

    if (stage > 0 && this.textures.exists(frameKey)) {
      const sprite = this.add.image(x, y, frameKey);
      sprite.setDisplaySize(size, size);
      return sprite;
    }

    // Fall back to tiger overworld sprite
    if (this.textures.exists('tiger')) {
      const sprite = this.add.sprite(x, y, 'tiger', 0);
      sprite.setDisplaySize(size, size);
      // Apply stage-based tint
      if (stage >= 3) sprite.setTint(0xFFDDCC);
      if (stage >= 5) sprite.setTint(0xFFCCBB);
      return sprite;
    }

    // Last fallback: colored rectangle
    const g = this.add.graphics();
    g.fillStyle(stage >= 3 ? 0xF8C888 : 0xF89838);
    g.fillRect(x - size / 2, y - size / 2, size, size);
    return g;
  }

  _createSparkles(cx, cy) {
    for (let i = 0; i < 12; i++) {
      const sparkle = this.add.graphics();
      const sx = Phaser.Math.Between(cx - 50, cx + 50);
      const sy = Phaser.Math.Between(cy - 30, cy + 30);

      // 3x3 cross pattern
      sparkle.fillStyle(0xFFFFFF);
      sparkle.fillRect(sx, sy - 1, 1, 3);
      sparkle.fillRect(sx - 1, sy, 3, 1);

      sparkle.setAlpha(0);

      this.tweens.add({
        targets: sparkle,
        alpha: 1,
        duration: Phaser.Math.Between(200, 400),
        delay: Phaser.Math.Between(0, 2500),
        yoyo: true,
        repeat: -1,
        hold: Phaser.Math.Between(100, 300),
      });
    }
  }

  _startFlicker() {
    if (this.flickerCount >= this.flickerTotal) return;

    this.time.delayedCall(this.flickerDelay, () => {
      this.showingOld = !this.showingOld;
      this.oldTiger.setVisible(this.showingOld);
      this.newTiger.setVisible(!this.showingOld);

      this.flickerCount++;
      const progress = this.flickerCount / this.flickerTotal;
      this.flickerDelay = Math.max(50, Math.floor(500 - (450 * progress)));

      this._startFlicker();
    });
  }

  _doWhiteFlash(centerX, centerY) {
    // Ensure new form is shown
    this.oldTiger.setVisible(false);
    this.newTiger.setVisible(true);

    // White flash
    const flash = this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0xFFFFFF, 1);
    flash.setDepth(100);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
        this._showTransformationResult();
      },
    });
  }

  _showTransformationResult() {
    const t = this.transformation;

    // Title background bar
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x333333, 0.8);
    titleBg.fillRect(10, GAME.HEIGHT / 2 + 28, GAME.WIDTH - 20, 16);
    titleBg.lineStyle(1, 0x666666);
    titleBg.strokeRect(10, GAME.HEIGHT / 2 + 28, GAME.WIDTH - 20, 16);

    // Title (Korean)
    const titleKo = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 + 32, t.title.ko, {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '9px',
      color: '#FFFFFF',
    }).setOrigin(0.5, 0).setAlpha(0);

    // Description (Korean + English)
    const descKo = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 + 50, t.description.ko, {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '7px',
      color: '#F0E0D0',
      wordWrap: { width: GAME.WIDTH - 24 },
      align: 'center',
      lineSpacing: 3,
    }).setOrigin(0.5, 0).setAlpha(0);

    const descEn = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 + 74, t.description.en, {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '6px',
      color: '#AAAAAA',
      wordWrap: { width: GAME.WIDTH - 24 },
      align: 'center',
      lineSpacing: 2,
    }).setOrigin(0.5, 0).setAlpha(0);

    // Garlic collected indicator
    const garlicKey = ASSET_MANIFEST.korean.garlic.key;
    let garlicIcon = null;
    if (this.textures.exists(garlicKey)) {
      garlicIcon = this.add.image(GAME.WIDTH / 2 - 16, GAME.HEIGHT - 32, garlicKey);
      garlicIcon.setDisplaySize(16, 16).setAlpha(0);
    }

    const garlicText = this.add.text(GAME.WIDTH / 2 + 4, GAME.HEIGHT - 32, '+1', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '9px',
      color: '#FFD700',
    }).setOrigin(0, 0.5).setAlpha(0);

    // Animate in
    this.tweens.add({
      targets: [titleKo, descKo, descEn],
      alpha: 1,
      duration: 500,
    });

    this.tweens.add({
      targets: [garlicIcon, garlicText].filter(Boolean),
      alpha: 1,
      duration: 400,
      delay: 400,
    });

    // "Press any key" prompt (bilingual)
    const continueKo = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 10, '\uc544\ubb34 \ubc84\ud2bc\uc774\ub098 \ub204\ub974\uc138\uc694', {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '7px',
      color: '#888888',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: continueKo,
      alpha: 1,
      duration: 500,
      delay: 800,
    });

    this.tweens.add({
      targets: continueKo,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      delay: 1300,
    });

    // Allow continue after delay
    this.time.delayedCall(1200, () => {
      this.canContinue = true;
    });
  }

  update() {
    if (!this.inputHandler) return;

    // Consume flag-based action input
    const action = this._actionFlag;
    this._actionFlag = false;

    if (this.canContinue && action) {
      this.canContinue = false;
      audioManager.playConfirm();

      this.cameras.main.fadeOut(500);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        // Check if game is complete (all 5 garlics)
        if (StateManager.getStage() >= GAME.TOTAL_GARLICS) {
          this.scene.start(SCENES.VICTORY);
        } else {
          this.scene.start(SCENES.OVERWORLD);
        }
      });
    }
  }
}
