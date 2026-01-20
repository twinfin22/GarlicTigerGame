// VictoryScene - Return to Hanok gate as a Korean

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { DialogueBox } from '../objects/DialogueBox.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.VICTORY });
    this.dialogueBox = null;
    this.dialogueIndex = 0;
    this.dialogues = [
      { speaker: 'Guard', text: 'Ohh... I sense the spirit of Korea within you!' },
      { speaker: 'Guard', text: 'Welcome, new Korean. You may enter the fortress.' },
    ];
    this.gateOpened = false;
  }

  create() {
    const { width, height } = this.scale;
    const { COLORS, FONTS, TEXT_SIZES } = GAME_CONFIG;

    this.dialogueIndex = 0;
    this.gateOpened = false;

    // Play victory sound
    audioManager.playVictory();

    // Background
    this.cameras.main.setBackgroundColor(COLORS.BLACK);
    this.cameras.main.fadeIn(500);

    // Draw Hanok gate (initially closed)
    this.drawHanokGate(width / 2, 200, false);

    // Draw guards (impressed)
    this.drawGuard(width / 2 - 60, 350, false, true);
    this.drawGuard(width / 2 + 60, 350, true, true);

    // Draw transformed tiger (final form)
    this.drawFinalTiger(width / 2, 480);

    // Celebration particles
    this.createCelebrationParticles();

    // Victory text
    this.add.text(width / 2, 30, 'VICTORY!', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TITLE + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    // Create dialogue box
    this.dialogueBox = new DialogueBox(
      this,
      20,
      height - 140,
      width - 40,
      120
    );

    // Start dialogue
    this.time.delayedCall(1500, () => {
      this.showNextDialogue();
    });

    // Input handling
    this.input.on('pointerdown', () => {
      audioManager.resume();
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
    const { width } = this.scale;

    this.dialogueBox.hide();
    audioManager.playConfirm();

    // Animate gate opening
    const leftDoor = this.add.rectangle(width / 2 - 20, 240, 36, 76, 0x6a6a6a);
    const rightDoor = this.add.rectangle(width / 2 + 20, 240, 36, 76, 0x6a6a6a);

    this.tweens.add({
      targets: leftDoor,
      x: width / 2 - 55,
      duration: 1000,
      ease: 'Power2',
    });

    this.tweens.add({
      targets: rightDoor,
      x: width / 2 + 55,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        this.gateOpened = true;
        this.showEnterPrompt();
      },
    });

    // Light from inside
    const light = this.add.rectangle(width / 2, 240, 70, 76, 0xf0f0f0, 0);
    this.tweens.add({
      targets: light,
      alpha: 0.3,
      duration: 1000,
      delay: 500,
    });
  }

  showEnterPrompt() {
    const { width, height } = this.scale;

    const prompt = this.add.text(width / 2, height - 80, 'Tap to enter the fortress...', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: GAME_CONFIG.TEXT_SIZES.TINY + 'px',
      color: '#8a8a8a',
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

    // Tiger walks into gate animation
    const { width, height } = this.scale;

    const walkingTiger = this.add.container(width / 2, 480);
    this.drawFinalTigerGraphics(walkingTiger);

    this.tweens.add({
      targets: walkingTiger,
      y: 240,
      scale: 0.5,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        this.cameras.main.fadeOut(500, 240, 240, 240);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.SCROLL);
        });
      },
    });
  }

  drawHanokGate(x, y, open = false) {
    const g = this.add.graphics();

    // Main gate structure
    g.fillStyle(0x4a4a4a);
    g.fillRect(x - 100, y, 200, 120);

    // Gate opening (dark or lit)
    g.fillStyle(open ? 0xf0f0f0 : 0x1a1a1a);
    g.fillRect(x - 40, y + 40, 80, 80);

    if (!open) {
      // Closed doors
      g.fillStyle(0x6a6a6a);
      g.fillRect(x - 38, y + 42, 36, 76);
      g.fillRect(x + 2, y + 42, 36, 76);

      // Door details
      g.fillStyle(0x3a3a3a);
      g.fillRect(x - 30, y + 50, 20, 30);
      g.fillRect(x + 10, y + 50, 20, 30);
    }

    // Roof
    g.fillStyle(0x2a2a2a);
    g.fillRect(x - 120, y - 20, 240, 25);
    g.fillTriangle(x - 120, y - 20, x - 140, y + 5, x - 100, y + 5);
    g.fillTriangle(x + 120, y - 20, x + 140, y + 5, x + 100, y + 5);

    // Roof tiles
    g.fillStyle(0x1a1a1a);
    for (let i = -110; i < 110; i += 20) {
      g.fillRect(x + i, y - 18, 2, 20);
    }

    // Second tier
    g.fillStyle(0x3a3a3a);
    g.fillRect(x - 90, y - 40, 180, 22);

    // Pillars
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 95, y, 15, 120);
    g.fillRect(x + 80, y, 15, 120);

    // Sign
    g.fillStyle(0xf0f0f0);
    g.fillRect(x - 50, y + 10, 100, 25);
    g.lineStyle(2, 0x4a4a4a);
    g.strokeRect(x - 50, y + 10, 100, 25);

    this.add.text(x, y + 22, 'K-DIGITAL', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: '#1a1a1a',
    }).setOrigin(0.5);
  }

  drawGuard(x, y, mirrored = false, impressed = false) {
    const g = this.add.graphics();
    const dir = mirrored ? -1 : 1;

    // Body
    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 15, y - 20, 30, 50);
    g.fillStyle(0x4a4a4a);
    g.fillRect(x - 5, y - 15, 10, 45);

    // Head
    g.fillStyle(0xcacaca);
    g.fillCircle(x, y - 35, 12);

    // Gat
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 20, y - 50, 40, 8);
    g.fillRect(x - 8, y - 65, 16, 18);

    if (impressed) {
      // Surprised/impressed eyes (wide)
      g.fillStyle(0x1a1a1a);
      g.fillCircle(x - 5, y - 36, 4);
      g.fillCircle(x + 5, y - 36, 4);

      // Open mouth (amazed)
      g.fillStyle(0x1a1a1a);
      g.fillCircle(x, y - 28, 3);

      // Sweat drop
      g.fillStyle(0x8a8a8a);
      g.fillEllipse(x + 12, y - 45, 3, 5);
    } else {
      g.fillStyle(0x1a1a1a);
      g.fillRect(x - 6, y - 38, 3, 3);
      g.fillRect(x + 3, y - 38, 3, 3);
    }

    // Spear
    g.fillStyle(0x8a8a8a);
    g.fillRect(x + (25 * dir), y - 60, 4, 90);
    g.fillStyle(0xf0f0f0);
    g.fillTriangle(x + (27 * dir), y - 60, x + (23 * dir), y - 75, x + (31 * dir), y - 75);
  }

  drawFinalTiger(x, y) {
    const container = this.add.container(x, y);
    this.drawFinalTigerGraphics(container);
  }

  drawFinalTigerGraphics(container) {
    const g = this.add.graphics();

    // Final form: elongated, black hair, bowing posture
    const bodyHeight = 35;
    const bodyWidth = 18;

    // Body (no fur, smooth)
    g.fillStyle(0xf0f0f0);
    g.fillRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);

    // Head (black hair)
    g.fillStyle(0x2a2a2a);
    g.fillRect(-10, -bodyHeight / 2 - 15, 20, 15);

    // Eyes
    g.fillStyle(0x1a1a1a);
    g.fillRect(-6, -bodyHeight / 2 - 10, 4, 4);
    g.fillRect(2, -bodyHeight / 2 - 10, 4, 4);

    // Ears
    g.fillStyle(0x2a2a2a);
    g.fillTriangle(-10, -bodyHeight / 2 - 15, -10, -bodyHeight / 2 - 23, -4, -bodyHeight / 2 - 15);
    g.fillTriangle(10, -bodyHeight / 2 - 15, 10, -bodyHeight / 2 - 23, 4, -bodyHeight / 2 - 15);

    // Happy smile
    g.lineStyle(2, 0x1a1a1a);
    g.beginPath();
    g.arc(0, -bodyHeight / 2 - 3, 5, 0.2, Math.PI - 0.2);
    g.strokePath();

    // Speech bubble
    g.fillStyle(0xf0f0f0);
    g.fillRect(15, -bodyHeight / 2 - 25, 45, 18);
    g.fillTriangle(15, -bodyHeight / 2 - 17, 15, -bodyHeight / 2 - 7, 8, -bodyHeight / 2 - 12);

    container.add(g);

    const bubbleText = this.add.text(20, -bodyHeight / 2 - 22, '감사!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: '#1a1a1a',
    });
    container.add(bubbleText);

    // Sparkles around the tiger
    for (let i = 0; i < 5; i++) {
      const sparkle = this.add.star(
        Phaser.Math.Between(-30, 30),
        Phaser.Math.Between(-50, 30),
        4,
        2,
        5,
        0xf0f0f0
      );
      container.add(sparkle);

      this.tweens.add({
        targets: sparkle,
        alpha: 0.3,
        scale: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1,
        delay: i * 100,
      });
    }
  }

  createCelebrationParticles() {
    const { width, height } = this.scale;

    // Confetti-like particles
    for (let i = 0; i < 30; i++) {
      const particle = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(-50, 0),
        4,
        8,
        Phaser.Math.RND.pick([0xf0f0f0, 0xcacaca, 0x8a8a8a])
      );

      this.tweens.add({
        targets: particle,
        y: height + 50,
        x: particle.x + Phaser.Math.Between(-100, 100),
        angle: Phaser.Math.Between(0, 360),
        duration: Phaser.Math.Between(3000, 5000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }
}
