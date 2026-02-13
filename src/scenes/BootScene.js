// BootScene - Asset loading + LocalNomad splash (240x160 GBA native)

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { ASSET_MANIFEST } from '../data/assetManifest.js';
import { audioManager } from '../utils/AudioManager.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // --- Loading bar UI ---
    const barX = 40;
    const barY = GAME.HEIGHT / 2;
    const barW = GAME.WIDTH - 80;
    const barH = 8;

    // Outline
    const barBorder = this.add.rectangle(barX + barW / 2, barY, barW, barH)
      .setStrokeStyle(1, 0x000000)
      .setFillStyle(0x000000, 0);

    // Fill bar
    const barFill = this.add.rectangle(barX + 1, barY, 0, barH - 2, 0x3B82F6)
      .setOrigin(0, 0.5);

    // "LOADING..." text above bar
    const loadingText = this.add.text(GAME.WIDTH / 2, barY - 14, 'LOADING...', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '8px',
      color: '#000000',
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      barFill.width = (barW - 2) * value;
    });

    this.load.on('complete', () => {
      barBorder.destroy();
      barFill.destroy();
      loadingText.destroy();
    });

    // --- Load all assets from ASSET_MANIFEST ---

    // Tilesets — primary loaded as spritesheet (16x16 tiles), rest as images
    for (const [name, entry] of Object.entries(ASSET_MANIFEST.tilesets)) {
      if (name === 'primary') {
        this.load.spritesheet(entry.key, entry.path, {
          frameWidth: 16,
          frameHeight: 16,
        });
      } else {
        this.load.image(entry.key, entry.path);
      }
    }

    // Sprites
    for (const [name, entry] of Object.entries(ASSET_MANIFEST.sprites)) {
      if (entry.frameWidth && entry.frameHeight) {
        // Spritesheet (tiger overworld)
        this.load.spritesheet(entry.key, entry.path, {
          frameWidth: entry.frameWidth,
          frameHeight: entry.frameHeight,
        });
      } else {
        this.load.image(entry.key, entry.path);
      }
    }

    // Korean assets (all images)
    for (const entry of Object.values(ASSET_MANIFEST.korean)) {
      this.load.image(entry.key, entry.path);
    }

    // Tilemap JSON data
    if (ASSET_MANIFEST.tilemapData) {
      this.load.json(ASSET_MANIFEST.tilemapData.key, ASSET_MANIFEST.tilemapData.path);
    }
  }

  create() {
    // Initialize audio on first user interaction
    const initAudio = () => {
      audioManager.init();
      document.removeEventListener('pointerdown', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
    document.addEventListener('pointerdown', initAudio, { once: true });
    document.addEventListener('keydown', initAudio, { once: true });

    // Also init immediately (works on desktop, may be suspended on mobile)
    audioManager.init();

    // Create tiger walk/idle animations if spritesheet loaded
    if (this.textures.exists('tiger')) {
      const directions = ['down', 'left', 'right', 'up'];
      directions.forEach((dir, dirIndex) => {
        const rowStart = dirIndex * 4;

        // Idle animation (single frame)
        if (!this.anims.exists(`tiger_${dir}_idle`)) {
          this.anims.create({
            key: `tiger_${dir}_idle`,
            frames: [{ key: 'tiger', frame: rowStart }],
            frameRate: 1,
          });
        }

        // Walk animation (4 frames per direction)
        if (!this.anims.exists(`tiger_${dir}_walk`)) {
          this.anims.create({
            key: `tiger_${dir}_walk`,
            frames: this.anims.generateFrameNumbers('tiger', {
              start: rowStart,
              end: rowStart + 3,
            }),
            frameRate: 8,
            repeat: -1,
          });
        }
      });
    }

    // White background for splash
    this.cameras.main.setBackgroundColor(0xFFFFFF);

    // "LocalNomad" splash text, centered
    const logoText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 - 8, 'LocalNomad', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '10px',
      color: '#000000',
    }).setOrigin(0.5).setAlpha(0);

    // "presents" text below
    const presentsText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 + 8, 'presents', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: '#888888',
    }).setOrigin(0.5).setAlpha(0);

    // Fade in
    this.tweens.add({ targets: logoText, alpha: 1, duration: 400, delay: 100 });
    this.tweens.add({ targets: presentsText, alpha: 1, duration: 400, delay: 300 });

    // Wait for fonts, then transition after 1.5s splash
    const transitionDelay = 1500;

    const doTransition = () => {
      // Fade out to white then start TitleScene
      this.cameras.main.fadeOut(300, 255, 255, 255);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.TITLE);
      });
    };

    // Wait for custom fonts to be ready
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.time.delayedCall(transitionDelay, doTransition);
      });
    } else {
      this.time.delayedCall(transitionDelay, doTransition);
    }

    // Hide loading screen element if present
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }
}
