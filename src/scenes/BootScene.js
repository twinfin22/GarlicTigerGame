// BootScene - Game Boy style boot sequence

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { getPalette } from '../utils/GBGraphics.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // No external assets needed - using procedural graphics
  }

  create() {
    const p = getPalette();
    const { width, height } = this.scale;

    // Initialize audio manager
    audioManager.init();

    // Game Boy style boot - starts with lightest color
    this.cameras.main.setBackgroundColor(p.lightest);

    // Classic "ding" sound on boot (optional)
    // audioManager.playConfirm();

    // Nintendo-style logo animation (simplified)
    const logoText = this.add.text(width / 2, height / 2 - 20, 'LocalNomad', {
      fontFamily: 'Press Start 2P',
      fontSize: '8px',
      color: '#' + p.darkest.toString(16).padStart(6, '0'),
    }).setOrigin(0.5).setAlpha(0);

    const presentsText = this.add.text(width / 2, height / 2, 'presents', {
      fontFamily: 'Press Start 2P',
      fontSize: '6px',
      color: '#' + p.dark.toString(16).padStart(6, '0'),
    }).setOrigin(0.5).setAlpha(0);

    // Fade in sequence
    this.tweens.add({
      targets: logoText,
      alpha: 1,
      duration: 500,
      delay: 200,
    });

    this.tweens.add({
      targets: presentsText,
      alpha: 1,
      duration: 500,
      delay: 500,
    });

    // Proceed to title scene
    this.time.delayedCall(1500, () => {
      // Classic wipe transition
      const wipe = this.add.rectangle(width / 2, 0, width, 0, p.darkest).setOrigin(0.5, 0);

      this.tweens.add({
        targets: wipe,
        height: height,
        duration: 300,
        ease: 'Linear',
        onComplete: () => {
          this.scene.start(SCENES.TITLE);
        },
      });
    });
  }
}
