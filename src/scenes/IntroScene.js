// IntroScene - Prof Oak-style intro at the gate (160x144 native)

import Phaser from 'phaser';
import { GAME, SCENES, BRANDING } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { inputHandler } from '../utils/InputHandler.js';
import { BG_PALETTES, BATTLE, hexToCSS, getSpritePalette } from '../data/palettes.js';
import * as Sprites from '../data/spriteData.js';
import { drawOverworldSprite, drawDialogFrame, drawTigerAtStage, drawHanokGate, drawGarlicCounter } from '../utils/TileRenderer.js';
import { DialogueBox } from '../objects/DialogueBox.js';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.INTRO });
    this.dialogueBox = null;
    this.dialogueIndex = 0;
    this.dialogues = [
      { speaker: 'Guard', text: 'Halt! This is the K-Digital Fortress.' },
      { speaker: 'Guard', text: 'Only Koreans may pass!' },
      { speaker: 'Tiger', text: 'But I want to become Korean...' },
      { speaker: 'Guard', text: 'Bring us 5 garlics from Korea.' },
      { speaker: 'Guard', text: 'Only then will you transform...' },
    ];
  }

  create() {
    // Reset state
    gameState.reset();
    this.dialogueIndex = 0;
    inputHandler.init(this);

    // Dark background, fade in
    this.cameras.main.setBackgroundColor(0x383838);
    this.cameras.main.fadeIn(500);

    // Draw Hanok gate (centered, scaled for 160x144)
    drawHanokGate(this, 80, 10);

    // Draw 2 guards flanking gate
    this.drawGuard(24, 60, false);
    this.drawGuard(136, 60, true);

    // Draw tiger below gate (stage 0)
    drawTigerAtStage(this, 72, 80, 0);

    // Garlic counter top-right (0/5)
    drawGarlicCounter(this, 140, 8, 0, GAME.TOTAL_GARLICS);

    // Create dialogue box (Pokemon Gold style, anchored at y=112)
    this.dialogueBox = new DialogueBox(this);

    // Start dialogue after brief pause
    this.time.delayedCall(500, () => {
      this.showNextDialogue();
    });

    // Input to advance dialogue
    inputHandler.on('action', () => {
      this.handleInput();
    });

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      inputHandler.destroy();
      if (this.dialogueBox) this.dialogueBox.destroy();
    });
  }

  handleInput() {
    audioManager.resume();

    if (this.dialogueBox.isTyping) {
      this.dialogueBox.skipToEnd();
    } else {
      this.dialogueIndex++;
      if (this.dialogueIndex < this.dialogues.length) {
        audioManager.playSelect();
        this.showNextDialogue();
      } else {
        this.transitionToOverworld();
      }
    }
  }

  showNextDialogue() {
    const dialogue = this.dialogues[this.dialogueIndex];
    this.dialogueBox.showText(dialogue.text, dialogue.speaker);
  }

  transitionToOverworld() {
    audioManager.playConfirm();
    this.dialogueBox.hide();

    // "The Journey Begins..." text
    const transitionText = this.add.text(80, 72, 'The Journey Begins...', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: '#F0E0D0',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: transitionText,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.OVERWORLD);
        });
      },
    });
  }

  drawGuard(x, y, mirrored) {
    const g = this.add.graphics();

    // Draw guard using GUARD sprite data if available, otherwise simple shape
    if (Sprites.GUARD) {
      drawOverworldSprite(g, x - 8, y - 8, Sprites.GUARD, getSpritePalette('GRAY'));
    } else {
      // Fallback: simple guard shape
      g.fillStyle(0x989898);
      g.fillRect(x - 4, y - 8, 8, 16);
      g.fillStyle(0x686868);
      g.fillRect(x - 3, y - 6, 6, 4);
    }

    // Spear
    const dir = mirrored ? -1 : 1;
    g.fillStyle(0x989898);
    g.fillRect(x + (10 * dir), y - 14, 2, 28);
    // Spear tip
    g.fillStyle(0xF0E0D0);
    g.fillTriangle(
      x + (11 * dir), y - 14,
      x + (9 * dir), y - 20,
      x + (13 * dir), y - 20
    );
  }
}
