// VictoryScene - Epic victory celebration (240x160 GBA native)
// Fully transformed tiger at stage 5, confetti, bilingual text

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { StateManager } from '../utils/StateManager.js';
import { InputHandler } from '../utils/InputHandler.js';
import { ASSET_MANIFEST } from '../data/assetManifest.js';

// Confetti colors (bright, celebratory)
const CONFETTI_COLORS = [
  0xFF4444, 0x44FF44, 0x4444FF, 0xFFFF44,
  0xFF44FF, 0x44FFFF, 0xFF8844, 0xFFFFFF,
];

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.VICTORY });
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

    // Black background, fade in
    this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.fadeIn(500);

    // Play victory music
    audioManager.playVictory();

    // Epic white flash at start
    const flash = this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0xFFFFFF, 1);
    flash.setDepth(200);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });

    // Congratulations text (Korean)
    const congratsKo = this.add.text(GAME.WIDTH / 2, 14, '\ucd95\ud558\ud569\ub2c8\ub2e4!', {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '11px',
      color: '#FFD700',
    }).setOrigin(0.5).setAlpha(0);

    // Congratulations text (English)
    const congratsEn = this.add.text(GAME.WIDTH / 2, 28, 'Congratulations!', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '9px',
      color: '#FFFFFF',
    }).setOrigin(0.5).setAlpha(0);

    // Fade in congratulations with bounce
    this.tweens.add({
      targets: [congratsKo, congratsEn],
      alpha: 1,
      duration: 600,
      delay: 300,
    });

    // Pulsing glow on congrats text
    this.tweens.add({
      targets: congratsKo,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      delay: 900,
    });

    // Draw fully transformed tiger sprite (stage 5) — centered
    const tigerY = GAME.HEIGHT / 2 + 2;
    this._drawFinalTiger(GAME.WIDTH / 2, tigerY);

    // "You are now Korean!" text (bilingual)
    const nowKoreanKo = this.add.text(GAME.WIDTH / 2, tigerY + 40, '\ud638\ub791\uc774\uac00 \ud55c\uad6d\uc778\uc774 \ub418\uc5c8\uc2b5\ub2c8\ub2e4!', {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '8px',
      color: '#F0E0D0',
    }).setOrigin(0.5).setAlpha(0);

    const nowKoreanEn = this.add.text(GAME.WIDTH / 2, tigerY + 52, 'The tiger has become Korean!', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: '#AAAAAA',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [nowKoreanKo, nowKoreanEn],
      alpha: 1,
      duration: 500,
      delay: 1200,
    });

    // Confetti effect
    this._startConfetti();

    // After delay, allow transition to GameOverScene (result card)
    this.time.delayedCall(3500, () => {
      this.canContinue = true;

      const promptKo = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 12, '\uc544\ubb34 \ubc84\ud2bc\uc774\ub098 \ub204\ub974\uc138\uc694', {
        fontFamily: `'${GAME.FONT_KO}', sans-serif`,
        fontSize: '7px',
        color: '#888888',
      }).setOrigin(0.5);

      this.tweens.add({
        targets: promptKo,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    });

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      if (this.inputHandler) this.inputHandler.destroy();
      if (this._onKeyDown) this.input.keyboard.off('keydown', this._onKeyDown);
      if (this._onPointerDown) this.input.off('pointerdown', this._onPointerDown);
    });
  }

  _drawFinalTiger(x, y) {
    // Try flexible_neck frame for stage 5
    const frameKey = 'flexible_neck_10'; // late-stage frame
    const spriteSize = 64;

    if (this.textures.exists(frameKey)) {
      const tiger = this.add.image(x, y, frameKey);
      tiger.setDisplaySize(spriteSize, spriteSize);

      // Gentle floating animation
      this.tweens.add({
        targets: tiger,
        y: y - 3,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      return tiger;
    }

    // Fallback: tiger sprite with tint
    if (this.textures.exists('tiger')) {
      const tiger = this.add.sprite(x, y, 'tiger', 0);
      tiger.setDisplaySize(spriteSize, spriteSize);
      tiger.setTint(0xFFCCBB);

      this.tweens.add({
        targets: tiger,
        y: y - 3,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      return tiger;
    }

    // Last fallback
    const g = this.add.graphics();
    g.fillStyle(0xF8C888);
    g.fillRect(x - 32, y - 32, 64, 64);
    return g;
  }

  _startConfetti() {
    // Create confetti particles as colored rectangles falling
    this.time.addEvent({
      delay: 80,
      callback: () => {
        const x = Phaser.Math.Between(0, GAME.WIDTH);
        const color = Phaser.Utils.Array.GetRandom(CONFETTI_COLORS);
        const size = Phaser.Math.Between(2, 4);

        const confetti = this.add.rectangle(x, -5, size, size, color);
        confetti.setDepth(150);
        confetti.setAngle(Phaser.Math.Between(0, 360));

        this.tweens.add({
          targets: confetti,
          y: GAME.HEIGHT + 10,
          x: x + Phaser.Math.Between(-30, 30),
          angle: confetti.angle + Phaser.Math.Between(-180, 180),
          duration: Phaser.Math.Between(2000, 3500),
          ease: 'Linear',
          onComplete: () => confetti.destroy(),
        });
      },
      repeat: 60, // ~60 confetti pieces
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
        this.scene.start(SCENES.GAME_OVER);
      });
    }
  }
}
