// TransformScene - Pokemon-style evolution animation

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';

export class TransformScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.TRANSFORM });
    this.transformation = null;
  }

  init(data) {
    this.transformation = data.transformation;
  }

  create() {
    const { width, height } = this.scale;
    const { COLORS, FONTS, TEXT_SIZES } = GAME_CONFIG;

    // White flash background
    this.cameras.main.setBackgroundColor(0xf0f0f0);

    // Play transformation sound
    audioManager.playTransform();

    // Create sparkle particles
    this.createSparkles();

    // Title text
    this.add.text(width / 2, 80, 'The tiger is', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.MEDIUM + 'px',
      color: '#1a1a1a',
    }).setOrigin(0.5);

    this.add.text(width / 2, 110, 'transforming...!', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.MEDIUM + 'px',
      color: '#1a1a1a',
    }).setOrigin(0.5);

    // Draw transforming tiger
    this.tigerContainer = this.add.container(width / 2, height / 2 - 30);
    this.drawTransformingTiger();

    // Pulsing animation for tiger
    this.tweens.add({
      targets: this.tigerContainer,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 300,
      yoyo: true,
      repeat: 5,
      ease: 'Sine.easeInOut',
    });

    // Flashing effect
    this.createFlashingOverlay();

    // Show transformation description after animation
    this.time.delayedCall(2000, () => {
      this.showTransformationResult();
    });
  }

  createSparkles() {
    const { width, height } = this.scale;

    // Create multiple sparkle particles
    for (let i = 0; i < 20; i++) {
      const sparkle = this.add.star(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(150, height - 200),
        4,
        3,
        8,
        0x1a1a1a
      );

      // Random twinkling animation
      this.tweens.add({
        targets: sparkle,
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(500, 1000),
        delay: Phaser.Math.Between(0, 1500),
        yoyo: true,
        repeat: -1,
      });

      // Floating motion
      this.tweens.add({
        targets: sparkle,
        y: sparkle.y - 50,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  createFlashingOverlay() {
    const { width, height } = this.scale;

    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0);

    // Flash sequence
    this.tweens.add({
      targets: flash,
      alpha: 0.8,
      duration: 100,
      yoyo: true,
      repeat: 8,
      delay: 500,
    });
  }

  drawTransformingTiger() {
    const stage = gameState.getTransformationStage();
    const g = this.add.graphics();

    // Larger tiger sprite for transformation scene
    const scale = 2;

    // Colors based on transformation
    const bodyColor = stage >= 4 ? 0x2a2a2a : 0xcacaca;
    const furColor = stage >= 1 ? 0xf0f0f0 : bodyColor;

    // Body dimensions
    const bodyHeight = (20 + (stage >= 2 ? 12 : 0)) * scale;
    const bodyWidth = 16 * scale;

    // Draw body
    g.fillStyle(furColor);
    g.fillRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);

    // Draw stripes only if stage 0
    if (stage < 1) {
      g.fillStyle(0x4a4a4a);
      g.fillRect(-bodyWidth / 2 + 4, -bodyHeight / 2 + 8, 6, 4);
      g.fillRect(-bodyWidth / 2 + 16, -bodyHeight / 2 + 8, 6, 4);
      g.fillRect(-bodyWidth / 2 + 8, -bodyHeight / 2 + 20, 8, 4);
    }

    // Fur particles flying off (stage 1)
    if (stage === 1) {
      for (let i = 0; i < 8; i++) {
        const particle = this.add.circle(
          Phaser.Math.Between(-60, 60),
          Phaser.Math.Between(-80, 40),
          3,
          0xcacaca
        );
        this.tigerContainer.add(particle);

        this.tweens.add({
          targets: particle,
          x: particle.x + Phaser.Math.Between(-100, 100),
          y: particle.y + Phaser.Math.Between(-100, 100),
          alpha: 0,
          duration: 2000,
          ease: 'Power2',
        });
      }
    }

    // Draw head
    const headColor = stage >= 4 ? 0x2a2a2a : bodyColor;
    g.fillStyle(headColor);
    g.fillRect(-16, -bodyHeight / 2 - 24, 32, 24);

    // Eyes
    g.fillStyle(stage >= 4 ? 0x1a1a1a : 0x1a1a1a);
    g.fillRect(-10, -bodyHeight / 2 - 16, 6, 6);
    g.fillRect(4, -bodyHeight / 2 - 16, 6, 6);

    // Ears
    g.fillStyle(headColor);
    g.fillTriangle(-16, -bodyHeight / 2 - 24, -16, -bodyHeight / 2 - 36, -6, -bodyHeight / 2 - 24);
    g.fillTriangle(16, -bodyHeight / 2 - 24, 16, -bodyHeight / 2 - 36, 6, -bodyHeight / 2 - 24);

    // Stage 3: Speech bubble
    if (stage >= 3) {
      g.fillStyle(0xf0f0f0);
      g.fillRect(25, -bodyHeight / 2 - 40, 50, 25);
      g.fillTriangle(25, -bodyHeight / 2 - 28, 25, -bodyHeight / 2 - 18, 15, -bodyHeight / 2 - 23);

      const bubbleText = this.add.text(30, -bodyHeight / 2 - 35, 'Seuree!', {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '8px',
        color: '#1a1a1a',
      });
      this.tigerContainer.add(bubbleText);
    }

    // Stage 5: Bowing motion
    if (stage >= 5) {
      // Add bow motion
      this.tweens.add({
        targets: this.tigerContainer,
        angle: 15,
        duration: 500,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
      });
    }

    this.tigerContainer.add(g);
  }

  showTransformationResult() {
    const { width, height } = this.scale;
    const { FONTS, TEXT_SIZES, COLORS } = GAME_CONFIG;

    // Darken background slightly
    this.cameras.main.setBackgroundColor(0xe0e0e0);

    // Show transformation title
    const titleBg = this.add.rectangle(width / 2, height - 180, width - 40, 50, COLORS.BLACK);

    const title = this.add.text(width / 2, height - 180, this.transformation.title, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.MEDIUM + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5).setAlpha(0);

    // Show description
    const description = this.add.text(width / 2, height - 120, this.transformation.description, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#1a1a1a',
      wordWrap: { width: width - 60 },
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);

    // Animate in
    this.tweens.add({
      targets: [title, description],
      alpha: 1,
      duration: 500,
    });

    // Continue prompt
    const continueText = this.add.text(width / 2, height - 50, 'Tap to continue', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TINY + 'px',
      color: '#4a4a4a',
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
      this.input.once('pointerdown', () => {
        this.continueGame();
      });

      this.input.keyboard.once('keydown-SPACE', () => {
        this.continueGame();
      });

      this.input.keyboard.once('keydown-ENTER', () => {
        this.continueGame();
      });
    });
  }

  continueGame() {
    audioManager.playConfirm();

    this.cameras.main.fadeOut(500, 26, 26, 26);
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
