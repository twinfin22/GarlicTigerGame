// IntroScene - Hanok gate with guards introducing the quest

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { DialogueBox } from '../objects/DialogueBox.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { getPalette, drawSprite, SPRITES } from '../utils/GBGraphics.js';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.INTRO });
    this.dialogueBox = null;
    this.dialogueIndex = 0;
    this.dialogues = [
      { speaker: 'Guard', text: 'Halt! This is the K-Digital Fortress.' },
      { speaker: 'Guard', text: 'Outsiders cannot enter. Only Koreans may pass!' },
      { speaker: 'Tiger', text: 'But I want to become Korean...' },
      { speaker: 'Guard', text: 'Then you must eat garlic. Bring us 5 garlics from the land of Korea.' },
      { speaker: 'Guard', text: 'Only then will you transform and be worthy to enter...' },
    ];
  }

  create() {
    const { width, height } = this.scale;
    const { FONTS, TEXT_SIZES } = GAME_CONFIG;
    const p = getPalette();
    this.palette = p;

    // Reset state
    gameState.reset();
    this.dialogueIndex = 0;

    // Background - use palette
    this.cameras.main.setBackgroundColor(p.darkest);
    this.cameras.main.fadeIn(500);

    // Draw Hanok gate
    this.drawHanokGate(width / 2, 200);

    // Draw guards
    this.drawGuard(width / 2 - 60, 350, false);
    this.drawGuard(width / 2 + 60, 350, true);

    // Draw tiger (player)
    this.drawSmallTiger(width / 2, 480);

    // Garlic counter UI
    this.createGarlicCounter();

    // Create dialogue box
    this.dialogueBox = new DialogueBox(
      this,
      20,
      height - 140,
      width - 40,
      120
    );

    // Start dialogue after a brief pause
    this.time.delayedCall(500, () => {
      this.showNextDialogue();
    });

    // Input to advance dialogue
    this.input.on('pointerdown', () => {
      this.handleInput();
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.handleInput();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.handleInput();
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

    // Show transition text
    const { width, height } = this.scale;
    const p = this.palette;
    const lightestHex = '#' + p.lightest.toString(16).padStart(6, '0');

    const transitionText = this.add.text(width / 2, height / 2, 'The Journey Begins...', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: GAME_CONFIG.TEXT_SIZES.MEDIUM + 'px',
      color: lightestHex,
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

  drawHanokGate(x, y) {
    const p = this.palette;
    const g = this.add.graphics();
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');

    // Main gate structure
    g.fillStyle(p.dark);
    g.fillRect(x - 100, y, 200, 120);

    // Gate opening (dark)
    g.fillStyle(p.darkest);
    g.fillRect(x - 40, y + 40, 80, 80);

    // Gate doors (closed)
    g.fillStyle(p.light);
    g.fillRect(x - 38, y + 42, 36, 76);
    g.fillRect(x + 2, y + 42, 36, 76);

    // Door details
    g.fillStyle(p.dark);
    g.fillRect(x - 30, y + 50, 20, 30);
    g.fillRect(x + 10, y + 50, 20, 30);

    // Roof - traditional Korean curved roof
    g.fillStyle(p.darkest);
    // Main roof
    g.fillRect(x - 120, y - 20, 240, 25);
    // Curved edges (simplified)
    g.fillTriangle(x - 120, y - 20, x - 140, y + 5, x - 100, y + 5);
    g.fillTriangle(x + 120, y - 20, x + 140, y + 5, x + 100, y + 5);

    // Roof tiles pattern
    g.fillStyle(p.dark);
    for (let i = -110; i < 110; i += 20) {
      g.fillRect(x + i, y - 18, 2, 20);
    }

    // Second roof tier
    g.fillStyle(p.dark);
    g.fillRect(x - 90, y - 40, 180, 22);
    g.fillTriangle(x - 90, y - 40, x - 105, y - 18, x - 75, y - 18);
    g.fillTriangle(x + 90, y - 40, x + 105, y - 18, x + 75, y - 18);

    // Pillars
    g.fillStyle(p.light);
    g.fillRect(x - 95, y, 15, 120);
    g.fillRect(x + 80, y, 15, 120);

    // Sign above gate
    g.fillStyle(p.lightest);
    g.fillRect(x - 50, y + 10, 100, 25);
    g.lineStyle(2, p.dark);
    g.strokeRect(x - 50, y + 10, 100, 25);

    // Sign text
    this.add.text(x, y + 22, 'K-DIGITAL', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '10px',
      color: darkestHex,
    }).setOrigin(0.5);
  }

  drawGuard(x, y, mirrored = false) {
    const p = this.palette;
    const g = this.add.graphics();

    // Draw guard sprite instead of procedural
    drawSprite(g, x - 16, y - 40, SPRITES.GUARD, 16, 2);

    // Spear
    const dir = mirrored ? -1 : 1;
    g.fillStyle(p.light);
    g.fillRect(x + (25 * dir), y - 60, 4, 90);
    // Spear tip
    g.fillStyle(p.lightest);
    g.fillTriangle(
      x + (27 * dir), y - 60,
      x + (23 * dir), y - 75,
      x + (31 * dir), y - 75
    );
  }

  drawSmallTiger(x, y) {
    const g = this.add.graphics();

    // Draw tiger sprite
    drawSprite(g, x - 16, y - 32, SPRITES.TIGER_FRONT, 16, 2);
  }

  createGarlicCounter() {
    const { width } = this.scale;
    const { FONTS, TEXT_SIZES } = GAME_CONFIG;
    const p = this.palette;
    const lightestHex = '#' + p.lightest.toString(16).padStart(6, '0');

    const container = this.add.container(width - 60, 30);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(p.darkest, 0.8);
    bg.fillRect(-40, -15, 80, 30);
    bg.lineStyle(2, p.lightest);
    bg.strokeRect(-40, -15, 80, 30);
    container.add(bg);

    // Garlic icon using palette
    const garlicIcon = this.add.graphics();
    garlicIcon.fillStyle(p.lightest);
    garlicIcon.fillCircle(-25, 0, 8);
    container.add(garlicIcon);

    // Counter text
    const counterText = this.add.text(5, 0, '0/5', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: lightestHex,
    }).setOrigin(0.5);
    container.add(counterText);
  }
}
