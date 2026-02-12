// TransformScene - Pokemon evolution screen (160x144 native)

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { inputHandler } from '../utils/InputHandler.js';
import { BG_PALETTES, BATTLE, hexToCSS } from '../data/palettes.js';
import { drawTigerAtStage } from '../utils/TileRenderer.js';

export class TransformScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.TRANSFORM });
    this.transformation = null;
  }

  init(data) {
    this.transformation = data.transformation;
  }

  create() {
    inputHandler.init(this);

    // Dark background
    this.cameras.main.setBackgroundColor(0x383838);

    // Play transformation sound
    audioManager.playTransform();

    // "What?" and "TIGER is transforming!" text at top
    this.add.text(80, 10, 'What?', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#F0E0D0',
    }).setOrigin(0.5);

    this.add.text(80, 22, 'TIGER is', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#F0E0D0',
    }).setOrigin(0.5);

    this.add.text(80, 32, 'transforming!', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#F0E0D0',
    }).setOrigin(0.5);

    // Current and new stage
    const newStage = gameState.getTransformationStage();
    const oldStage = Math.max(0, newStage - 1);

    // Container for the flickering tiger sprites
    this.tigerContainer = this.add.container(0, 0);

    // Draw old stage tiger (initially visible), centered
    const tigerX = 72;
    const tigerY = 50;
    this.oldTiger = drawTigerAtStage(this, tigerX, tigerY, oldStage);
    this.tigerContainer.add(this.oldTiger);

    // Draw new stage tiger (initially hidden)
    this.newTiger = drawTigerAtStage(this, tigerX, tigerY, newStage);
    this.newTiger.setVisible(false);
    this.tigerContainer.add(this.newTiger);

    // Create pixel-art sparkle effects
    this.createPixelSparkles();

    // Pokemon evolution flickering animation
    // Start at 500ms intervals, accelerate to 50ms over ~3 seconds
    this.flickerCount = 0;
    this.flickerTotal = 18;
    this.flickerDelay = 500;
    this.showingOld = true;
    this.startFlicker();

    // After flickering completes, do white flash then reveal final form
    this.time.delayedCall(3200, () => {
      this.doWhiteFlash();
    });

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      inputHandler.destroy();
    });
  }

  startFlicker() {
    if (this.flickerCount >= this.flickerTotal) {
      return;
    }

    this.time.delayedCall(this.flickerDelay, () => {
      // Toggle visibility
      this.showingOld = !this.showingOld;
      this.oldTiger.setVisible(this.showingOld);
      this.newTiger.setVisible(!this.showingOld);

      this.flickerCount++;

      // Accelerate: linearly interpolate from 500ms to 50ms
      const progress = this.flickerCount / this.flickerTotal;
      this.flickerDelay = Math.max(50, Math.floor(500 - (450 * progress)));

      this.startFlicker();
    });
  }

  doWhiteFlash() {
    // Ensure new form is shown
    this.oldTiger.setVisible(false);
    this.newTiger.setVisible(true);

    // White flash (fullscreen rectangle)
    const flash = this.add.rectangle(80, 72, 160, 144, 0xF0E0D0, 1);
    flash.setDepth(100);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
        this.showTransformationResult();
      },
    });
  }

  createPixelSparkles() {
    // Create multiple pixel-art 3x3 cross sparkles
    for (let i = 0; i < 12; i++) {
      const sparkle = this.add.graphics();
      const sx = Phaser.Math.Between(20, 140);
      const sy = Phaser.Math.Between(45, 75);

      // 3x3 cross pattern
      sparkle.fillStyle(0x989898);
      sparkle.fillRect(sx, sy - 1, 1, 3); // vertical
      sparkle.fillRect(sx - 1, sy, 3, 1); // horizontal

      sparkle.setAlpha(0);

      // Random twinkling animation
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

  showTransformationResult() {
    // Show transformation title
    const titleBg = this.add.graphics();
    titleBg.fillStyle(0x686868);
    titleBg.fillRect(10, 82, 140, 14);
    titleBg.lineStyle(1, 0x383838);
    titleBg.strokeRect(10, 82, 140, 14);

    const title = this.add.text(80, 89, this.transformation.title, {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#F0E0D0',
    }).setOrigin(0.5).setAlpha(0);

    // Show description
    const description = this.add.text(80, 102, this.transformation.description, {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: '#F0E0D0',
      wordWrap: { width: 140 },
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5, 0).setAlpha(0);

    // Animate in
    this.tweens.add({
      targets: [title, description],
      alpha: 1,
      duration: 500,
    });

    // "Tap to continue" prompt
    const continueText = this.add.text(80, 134, 'Tap to continue', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: '#989898',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: continueText,
      alpha: 1,
      duration: 500,
      delay: 500,
    });

    this.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      delay: 1000,
    });

    // Allow continue after showing result
    this.time.delayedCall(1000, () => {
      inputHandler.on('action', () => {
        this.continueGame();
      });
    });
  }

  continueGame() {
    audioManager.playConfirm();

    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Check if game is complete
      if (gameState.isGameComplete()) {
        this.scene.start(SCENES.VICTORY);
      } else {
        this.scene.start(SCENES.OVERWORLD);
      }
    });
  }
}
