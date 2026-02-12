// VictoryScene - Gate opening scene (160x144 native)

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { inputHandler } from '../utils/InputHandler.js';
import { BG_PALETTES, BATTLE, hexToCSS, getSpritePalette } from '../data/palettes.js';
import * as Sprites from '../data/spriteData.js';
import { drawOverworldSprite, drawDialogFrame, drawTigerAtStage, drawHanokGate } from '../utils/TileRenderer.js';
import { DialogueBox } from '../objects/DialogueBox.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.VICTORY });
    this.dialogueBox = null;
    this.dialogueIndex = 0;
    this.dialogues = [
      { speaker: 'Guard', text: 'The guards recognize you!' },
      { speaker: 'Guard', text: 'Welcome, new Korean.' },
    ];
    this.gateOpened = false;
  }

  create() {
    this.dialogueIndex = 0;
    this.gateOpened = false;
    inputHandler.init(this);

    // Play victory sound
    audioManager.playVictory();

    // Dark background, fade in
    this.cameras.main.setBackgroundColor(0x383838);
    this.cameras.main.fadeIn(500);

    // "VICTORY!" text at top
    this.add.text(80, 8, 'VICTORY!', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#F0E0D0',
    }).setOrigin(0.5);

    // Draw Hanok gate (closed initially)
    this.gateGraphics = drawHanokGate(this, 80, 16, { open: false });

    // Draw 2 guards with exclamation marks
    this.drawGuardWithExclamation(24, 60, false);
    this.drawGuardWithExclamation(136, 60, true);

    // Draw fully transformed tiger (stage 5) below gate
    this.tigerGraphics = drawTigerAtStage(this, 72, 82, 5);

    // Create dialogue box (Pokemon Gold style, fixed at y=112)
    this.dialogueBox = new DialogueBox(this);

    // Start dialogue after delay
    this.time.delayedCall(1500, () => {
      this.showNextDialogue();
    });

    // Input handling
    inputHandler.on('action', () => {
      audioManager.resume();
      this.handleInput();
    });

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      inputHandler.destroy();
      if (this.dialogueBox) this.dialogueBox.destroy();
    });
  }

  handleInput() {
    if (this.dialogueBox.isTyping) {
      this.dialogueBox.skipToEnd();
    } else if (this.dialogueIndex < this.dialogues.length) {
      this.dialogueIndex++;
      if (this.dialogueIndex < this.dialogues.length) {
        audioManager.playSelect();
        this.showNextDialogue();
      } else {
        this.openGate();
      }
    } else if (this.gateOpened) {
      this.transitionToScroll();
    }
  }

  showNextDialogue() {
    const dialogue = this.dialogues[this.dialogueIndex];
    this.dialogueBox.showText(dialogue.text, dialogue.speaker);
  }

  openGate() {
    this.dialogueBox.hide();
    audioManager.playConfirm();

    // Remove closed gate, redraw as open
    this.gateGraphics.destroy();
    this.gateGraphics = drawHanokGate(this, 80, 16, { open: true });

    // Light effect from inside the gate
    const light = this.add.rectangle(80, 46, 36, 40, 0xF0E0D0, 0);
    this.tweens.add({
      targets: light,
      alpha: 0.4,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        this.gateOpened = true;
        this.showEnterPrompt();
      },
    });
  }

  showEnterPrompt() {
    const prompt = this.add.text(80, 136, 'Tap to enter...', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: '#989898',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: prompt,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  transitionToScroll() {
    audioManager.playConfirm();

    // Tiger walks through gate (tween up)
    const walkingTiger = drawTigerAtStage(this, 72, 82, 5);
    this.tigerGraphics.setVisible(false);

    this.tweens.add({
      targets: walkingTiger,
      y: -20,
      duration: 1500,
      ease: 'Power2',
    });

    // Light overlay fade to white
    const lightOverlay = this.add.rectangle(80, 72, 160, 144, 0xF0E0D0, 0);
    lightOverlay.setDepth(100);

    this.tweens.add({
      targets: lightOverlay,
      alpha: 1,
      duration: 1500,
      delay: 500,
      ease: 'Power2',
      onComplete: () => {
        this.scene.start(SCENES.SCROLL);
      },
    });
  }

  drawGuardWithExclamation(x, y, mirrored) {
    const g = this.add.graphics();

    // Draw guard sprite
    if (Sprites.GUARD) {
      drawOverworldSprite(g, x - 8, y - 8, Sprites.GUARD, getSpritePalette('GRAY'));
    } else {
      // Fallback: simple guard shape
      g.fillStyle(0x989898);
      g.fillRect(x - 4, y - 8, 8, 16);
      g.fillStyle(0x686868);
      g.fillRect(x - 3, y - 6, 6, 4);
    }

    // Exclamation mark above guard
    if (Sprites.EXCLAMATION) {
      drawOverworldSprite(g, x - 4, y - 18, Sprites.EXCLAMATION, getSpritePalette('RED'));
    } else {
      // Fallback: simple "!" text
      this.add.text(x, y - 16, '!', {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: '#F83000',
      }).setOrigin(0.5);
    }

    // Spear
    const dir = mirrored ? -1 : 1;
    g.fillStyle(0x989898);
    g.fillRect(x + (10 * dir), y - 14, 2, 28);
    g.fillStyle(0xF0E0D0);
    g.fillTriangle(
      x + (11 * dir), y - 14,
      x + (9 * dir), y - 20,
      x + (13 * dir), y - 20
    );
  }
}
