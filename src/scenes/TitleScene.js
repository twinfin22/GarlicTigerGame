// TitleScene - Pokemon FireRed/LeafGreen GBA title screen (240x160 native)

import Phaser from 'phaser';
import { GAME, SCENES, BRANDING } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { ShareManager } from '../utils/ShareManager.js';
import { StateManager } from '../utils/StateManager.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.TITLE });
  }

  create() {
    // Reset game state for a fresh run
    StateManager.reset();

    // White background (Gen 3 FRLG style)
    this.cameras.main.setBackgroundColor(0xFFFFFF);
    this.cameras.main.fadeIn(300);

    // Check for shared stage in URL
    const { stage: sharedStage } = ShareManager.parseURLParams();

    // === Title text ===
    this.add.text(GAME.WIDTH / 2, 24, 'GARLIC TIGER', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '12px',
      color: '#000000',
    }).setOrigin(0.5);

    // Korean subtitle
    this.add.text(GAME.WIDTH / 2, 40, '마늘 호랑이', {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '10px',
      color: '#444444',
    }).setOrigin(0.5);

    // === Tiger sprite ===
    let tigerSprite = null;
    if (this.textures.exists('tiger')) {
      tigerSprite = this.add.sprite(GAME.WIDTH / 2, 80, 'tiger');
      tigerSprite.play('tiger_down_idle');

      // Idle bounce
      this.tweens.add({
        targets: tigerSprite,
        y: tigerSprite.y - 2,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // === Shared stage info ===
    if (sharedStage !== null && sharedStage > 0) {
      const stageNames = ['Tiger', 'Furless', 'Tall', 'Seuree', 'Dark Hair', 'Korean'];
      this.add.text(GAME.WIDTH / 2, 108, "Friend's tiger:", {
        fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
        fontSize: '7px',
        color: '#666666',
      }).setOrigin(0.5);

      this.add.text(GAME.WIDTH / 2, 118, stageNames[sharedStage] || 'Unknown', {
        fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
        fontSize: '8px',
        color: '#000000',
      }).setOrigin(0.5);

      this.add.text(GAME.WIDTH / 2, 128, 'Can you beat them?', {
        fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
        fontSize: '7px',
        color: '#666666',
      }).setOrigin(0.5);
    } else {
      this.add.text(GAME.WIDTH / 2, 108, 'Eat 5 garlics', {
        fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
        fontSize: '8px',
        color: '#000000',
      }).setOrigin(0.5);

      this.add.text(GAME.WIDTH / 2, 118, 'to become Korean!', {
        fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
        fontSize: '8px',
        color: '#000000',
      }).setOrigin(0.5);
    }

    // === Blinking "PRESS START" ===
    const pressStart = this.add.text(GAME.WIDTH / 2, 140, 'PRESS START', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '8px',
      color: '#000000',
    }).setOrigin(0.5);

    this.time.addEvent({
      delay: 500,
      callback: () => { pressStart.visible = !pressStart.visible; },
      loop: true,
    });

    // === Copyright ===
    this.add.text(GAME.WIDTH / 2, 155, `2026 ${BRANDING.NAME.toUpperCase()}`, {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '6px',
      color: '#999999',
    }).setOrigin(0.5);

    // === Input handling ===
    const startGame = () => {
      // Prevent double-trigger
      this.input.keyboard.off('keydown', startGame);
      this.input.off('pointerdown', startGame);

      audioManager.resume();
      audioManager.playConfirm();
      this.transitionToIntro();
    };

    this.input.keyboard.on('keydown', startGame);
    this.input.on('pointerdown', startGame);

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', startGame);
      this.input.off('pointerdown', startGame);
    });
  }

  transitionToIntro() {
    // Screen wipe transition (horizontal bar from left)
    const wipe = this.add.rectangle(0, GAME.HEIGHT / 2, 0, GAME.HEIGHT, 0x000000).setOrigin(0, 0.5);

    this.tweens.add({
      targets: wipe,
      width: GAME.WIDTH,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        this.scene.start(SCENES.INTRO);
      },
    });
  }
}
