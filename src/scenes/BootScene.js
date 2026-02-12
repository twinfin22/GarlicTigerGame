// BootScene - GameFreak-style logo splash (160x144 native)

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { inputHandler } from '../utils/InputHandler.js';
import { hexToCSS } from '../data/palettes.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  create() {
    // Initialize audio
    audioManager.init();
    inputHandler.init(this);

    // Black screen background
    this.cameras.main.setBackgroundColor(0x383838);

    // "LocalNomad" text fades in at center
    const logoText = this.add.text(80, 65, 'LocalNomad', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#F0E0D0',
    }).setOrigin(0.5).setAlpha(0);

    // "presents" text below
    const presentsText = this.add.text(80, 78, 'presents', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: '#989898',
    }).setOrigin(0.5).setAlpha(0);

    // Fade in sequence
    this.tweens.add({ targets: logoText, alpha: 1, duration: 500, delay: 200 });
    this.tweens.add({ targets: presentsText, alpha: 1, duration: 500, delay: 500 });

    // After 1.5s: vertical wipe to cream, then start TitleScene
    this.time.delayedCall(1500, () => {
      const wipe = this.add.rectangle(80, 0, 160, 0, 0xF0E0D0).setOrigin(0.5, 0);
      this.tweens.add({
        targets: wipe,
        height: 144,
        duration: 300,
        onComplete: () => {
          inputHandler.destroy();
          this.scene.start(SCENES.TITLE);
        },
      });
    });
  }
}
