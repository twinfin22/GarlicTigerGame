// BootScene - Initial loading and setup

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Nothing to preload in boot scene
  }

  create() {
    // Initialize audio manager
    audioManager.init();

    // Set game background color
    this.cameras.main.setBackgroundColor(GAME_CONFIG.COLORS.BLACK);

    // Show loading text
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'Loading...', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: GAME_CONFIG.TEXT_SIZES.MEDIUM + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    // Proceed to title scene after a brief moment
    this.time.delayedCall(500, () => {
      this.scene.start(SCENES.TITLE);
    });
  }
}
