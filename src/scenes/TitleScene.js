// TitleScene - Pokemon Gold title layout (160x144 native)

import Phaser from 'phaser';
import { GAME, SCENES, BRANDING } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { inputHandler } from '../utils/InputHandler.js';
import { BG_PALETTES, BATTLE, hexToCSS, getSpritePalette } from '../data/palettes.js';
import * as Sprites from '../data/spriteData.js';
import { drawOverworldSprite, drawDialogFrame, drawTigerAtStage, drawGarlicCounter, drawCursor } from '../utils/TileRenderer.js';
import { shareManager } from '../utils/ShareManager.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.TITLE });
  }

  create() {
    // Reset game state
    gameState.reset();
    inputHandler.init(this);

    // Check for shared stage in URL
    const sharedStage = shareManager.getSharedStage();

    // Cream background
    this.cameras.main.setBackgroundColor(0xF0E0D0);

    // 1px black border at edges
    const border = this.add.graphics();
    border.lineStyle(1, 0x000000);
    border.strokeRect(0, 0, 160, 144);

    // === Title Logo ===
    // "GARLIC" in a black-outlined box, centered near top
    const titleG = this.add.graphics();
    titleG.fillStyle(0x000000);
    titleG.fillRect(40, 14, 80, 14);
    titleG.fillStyle(0xF0E0D0);
    titleG.fillRect(41, 15, 78, 12);

    this.add.text(80, 21, 'GARLIC', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#000000',
    }).setOrigin(0.5);

    // "TIGER" large text with shadow below
    this.add.text(81, 35, 'TIGER', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#686868',
    }).setOrigin(0.5);

    this.add.text(80, 34, 'TIGER', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#000000',
    }).setOrigin(0.5);

    // === Tiger sprite ===
    const displayStage = (sharedStage !== null && sharedStage > 0) ? sharedStage : 0;
    const tigerG = drawTigerAtStage(this, 72, 48, displayStage);

    // Idle bounce animation
    this.tweens.add({
      targets: tigerG,
      y: tigerG.y - 1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Garlic decorations flanking tiger (8x8)
    if (Sprites.UI_GARLIC) {
      const garlicLeft = this.add.graphics();
      drawOverworldSprite(garlicLeft, 52, 56, Sprites.UI_GARLIC, BG_PALETTES[0]);

      const garlicRight = this.add.graphics();
      drawOverworldSprite(garlicRight, 100, 56, Sprites.UI_GARLIC, BG_PALETTES[0]);
    }

    // === Subtitle text ===
    if (sharedStage !== null && sharedStage > 0) {
      const stageNames = ['Tiger', 'Furless', 'Tall', 'Seuree', 'Dark Hair', 'Korean'];
      this.add.text(80, 72, "Friend's tiger:", {
        fontFamily: GAME.FONT,
        fontSize: '6px',
        color: '#686868',
      }).setOrigin(0.5);

      this.add.text(80, 82, stageNames[sharedStage], {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: '#000000',
      }).setOrigin(0.5);

      this.add.text(80, 92, 'Can you beat them?', {
        fontFamily: GAME.FONT,
        fontSize: '6px',
        color: '#686868',
      }).setOrigin(0.5);
    } else {
      this.add.text(80, 90, 'Eat 5 garlics', {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: '#000000',
      }).setOrigin(0.5);

      this.add.text(80, 100, 'to become Korean!', {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: '#000000',
      }).setOrigin(0.5);
    }

    // === Blinking "PRESS START" ===
    const pressStart = this.add.text(80, 120, 'PRESS START', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#000000',
    }).setOrigin(0.5);

    this.time.addEvent({
      delay: 500,
      callback: () => { pressStart.visible = !pressStart.visible; },
      loop: true,
    });

    // === Copyright ===
    this.add.text(80, 136, '2024 LOCALNOMAD', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: '#686868',
    }).setOrigin(0.5);

    // === Input handling ===
    const startGame = () => {
      audioManager.resume();
      audioManager.playConfirm();
      this.startGame();
    };

    inputHandler.on('action', startGame);

    // Hide loading screen element
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      inputHandler.destroy();
    });
  }

  startGame() {
    // Screen wipe transition
    const wipe = this.add.rectangle(0, 72, 0, 144, 0x383838).setOrigin(0, 0.5);

    this.tweens.add({
      targets: wipe,
      width: 160,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        this.scene.start(SCENES.INTRO);
      },
    });
  }
}
