// IntroScene - Hanok gate with guards introducing the quest

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { DialogueBox } from '../objects/DialogueBox.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';

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
    const { COLORS, FONTS, TEXT_SIZES } = GAME_CONFIG;

    // Reset state
    gameState.reset();
    this.dialogueIndex = 0;

    // Background
    this.cameras.main.setBackgroundColor(COLORS.BLACK);
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
    const transitionText = this.add.text(width / 2, height / 2, 'The Journey Begins...', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: GAME_CONFIG.TEXT_SIZES.MEDIUM + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: transitionText,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        this.cameras.main.fadeOut(500, 26, 26, 26);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.OVERWORLD);
        });
      },
    });
  }

  drawHanokGate(x, y) {
    const g = this.add.graphics();

    // Main gate structure
    g.fillStyle(0x4a4a4a);
    g.fillRect(x - 100, y, 200, 120);

    // Gate opening (dark)
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 40, y + 40, 80, 80);

    // Gate doors (closed)
    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 38, y + 42, 36, 76);
    g.fillRect(x + 2, y + 42, 36, 76);

    // Door details
    g.fillStyle(0x3a3a3a);
    g.fillRect(x - 30, y + 50, 20, 30);
    g.fillRect(x + 10, y + 50, 20, 30);

    // Roof - traditional Korean curved roof
    g.fillStyle(0x2a2a2a);
    // Main roof
    g.fillRect(x - 120, y - 20, 240, 25);
    // Curved edges (simplified)
    g.fillTriangle(x - 120, y - 20, x - 140, y + 5, x - 100, y + 5);
    g.fillTriangle(x + 120, y - 20, x + 140, y + 5, x + 100, y + 5);

    // Roof tiles pattern
    g.fillStyle(0x1a1a1a);
    for (let i = -110; i < 110; i += 20) {
      g.fillRect(x + i, y - 18, 2, 20);
    }

    // Second roof tier
    g.fillStyle(0x3a3a3a);
    g.fillRect(x - 90, y - 40, 180, 22);
    g.fillTriangle(x - 90, y - 40, x - 105, y - 18, x - 75, y - 18);
    g.fillTriangle(x + 90, y - 40, x + 105, y - 18, x + 75, y - 18);

    // Pillars
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 95, y, 15, 120);
    g.fillRect(x + 80, y, 15, 120);

    // Sign above gate
    g.fillStyle(0xf0f0f0);
    g.fillRect(x - 50, y + 10, 100, 25);
    g.lineStyle(2, 0x4a4a4a);
    g.strokeRect(x - 50, y + 10, 100, 25);

    // Sign text
    this.add.text(x, y + 22, 'K-DIGITAL', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: '#1a1a1a',
    }).setOrigin(0.5);
  }

  drawGuard(x, y, mirrored = false) {
    const g = this.add.graphics();
    const dir = mirrored ? -1 : 1;

    // Body (robe)
    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 15, y - 20, 30, 50);

    // Robe details
    g.fillStyle(0x4a4a4a);
    g.fillRect(x - 5, y - 15, 10, 45);

    // Head
    g.fillStyle(0xcacaca);
    g.fillCircle(x, y - 35, 12);

    // Gat (traditional hat)
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 20, y - 50, 40, 8);
    g.fillRect(x - 8, y - 65, 16, 18);

    // Eyes
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 6, y - 38, 3, 3);
    g.fillRect(x + 3, y - 38, 3, 3);

    // Spear
    g.fillStyle(0x8a8a8a);
    g.fillRect(x + (25 * dir), y - 60, 4, 90);
    // Spear tip
    g.fillStyle(0xf0f0f0);
    g.fillTriangle(
      x + (27 * dir), y - 60,
      x + (23 * dir), y - 75,
      x + (31 * dir), y - 75
    );
  }

  drawSmallTiger(x, y) {
    const g = this.add.graphics();

    // Body
    g.fillStyle(0xcacaca);
    g.fillRect(x - 12, y - 15, 24, 30);

    // Stripes
    g.fillStyle(0x4a4a4a);
    g.fillRect(x - 8, y - 10, 4, 2);
    g.fillRect(x + 4, y - 10, 4, 2);
    g.fillRect(x - 5, y, 5, 2);

    // Head
    g.fillStyle(0xcacaca);
    g.fillRect(x - 10, y - 30, 20, 18);

    // Ears
    g.fillTriangle(x - 10, y - 30, x - 10, y - 40, x - 4, y - 30);
    g.fillTriangle(x + 10, y - 30, x + 10, y - 40, x + 4, y - 30);

    // Eyes
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 6, y - 25, 4, 4);
    g.fillRect(x + 2, y - 25, 4, 4);
  }

  createGarlicCounter() {
    const { width } = this.scale;
    const { FONTS, TEXT_SIZES, COLORS } = GAME_CONFIG;

    const container = this.add.container(width - 60, 30);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.BLACK, 0.8);
    bg.fillRect(-40, -15, 80, 30);
    bg.lineStyle(2, COLORS.WHITE);
    bg.strokeRect(-40, -15, 80, 30);
    container.add(bg);

    // Garlic icon (small)
    const garlicIcon = this.add.graphics();
    garlicIcon.fillStyle(0xf0f0f0);
    garlicIcon.fillCircle(-25, 0, 8);
    container.add(garlicIcon);

    // Counter text
    const counterText = this.add.text(5, 0, '0/5', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);
    container.add(counterText);
  }
}
