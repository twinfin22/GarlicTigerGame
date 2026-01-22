// QuizScene - Pokemon-style NPC quiz encounters

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { getPalette, drawSprite, SPRITES } from '../utils/GBGraphics.js';
import quizData from '../data/quizData.json';

export class QuizScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.QUIZ });
  }

  create() {
    // Reset state
    this.choiceButtons = [];
    this.phase = 'dialogue';
    this.dialogueText = null;
    this.continueIndicator = null;
    this.selectedChoice = 0;

    // Clean up listeners
    this.input.removeAllListeners();
    if (this.input.keyboard) {
      this.input.keyboard.removeAllListeners();
    }

    const { width, height } = this.scale;
    const p = getPalette();
    this.palette = p;

    // Get quiz data
    const quizIndex = gameState.getCurrentQuizIndex();
    this.currentQuiz = quizData.quizzes[quizIndex];

    if (!this.currentQuiz) {
      this.scene.start(SCENES.VICTORY);
      return;
    }

    // White background
    this.cameras.main.setBackgroundColor(p.lightest);

    // Draw border frame
    this.drawBorder();

    // Draw NPC in upper area
    this.drawNPC(width / 2, 70);

    // NPC name label
    this.drawNameLabel(width / 2, 120);

    // Garlic counter in corner
    this.drawGarlicCounter();

    // Draw dialogue box at bottom
    this.drawDialogueBox();

    // Show dialogue text with typewriter
    this.showDialogue(this.currentQuiz.dialogue);

    // Input
    this.input.on('pointerdown', () => this.handleInput());
    this.input.keyboard.on('keydown-SPACE', () => this.handleInput());
    this.input.keyboard.on('keydown-ENTER', () => this.handleInput());
    this.input.keyboard.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.moveSelection(1));
  }

  drawBorder() {
    const { width, height } = this.scale;
    const p = this.palette;
    const g = this.add.graphics();

    // Clean black border (Pokemon style)
    g.lineStyle(2, p.darkest);
    g.strokeRect(4, 4, width - 8, height - 8);
  }

  drawNPC(x, y) {
    const g = this.add.graphics();
    const p = this.palette;

    // NPC background circle
    g.fillStyle(p.light);
    g.fillCircle(x, y, 40);
    g.lineStyle(2, p.darkest);
    g.strokeCircle(x, y, 40);

    // Draw procedural NPC character (Pokemon-style simple person)
    // Different colors for different NPC types
    const npcColors = {
      ajumma: 0xcd5c5c,    // Red dress
      worker: 0x4169e1,    // Blue uniform
      grandma: 0x8b4513,   // Brown hanbok
      senior: 0x2f4f4f,    // Dark gray suit
      hipster: 0x9370db,   // Purple shirt
    };
    const clothingColor = npcColors[this.currentQuiz.npc] || 0x4169e1;

    // Head (skin tone)
    g.fillStyle(0xffdab9);
    g.fillCircle(x, y - 12, 12);
    g.lineStyle(2, p.darkest);
    g.strokeCircle(x, y - 12, 12);

    // Hair
    g.fillStyle(p.darkest);
    g.fillRect(x - 10, y - 26, 20, 8);

    // Body/clothing
    g.fillStyle(clothingColor);
    g.fillRect(x - 14, y, 28, 24);
    g.lineStyle(2, p.darkest);
    g.strokeRect(x - 14, y, 28, 24);

    // Eyes
    g.fillStyle(p.darkest);
    g.fillRect(x - 6, y - 14, 4, 4);
    g.fillRect(x + 2, y - 14, 4, 4);
  }

  drawNameLabel(x, y) {
    const p = this.palette;
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');

    this.add.text(x, y, this.currentQuiz.npcName, {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '10px',
      color: darkestHex,
    }).setOrigin(0.5);
  }

  drawGarlicCounter() {
    const { width } = this.scale;
    const p = this.palette;
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');

    // Simple text counter in top right
    this.add.text(width - 10, 12, `🧄${gameState.getGarlics()}/5`, {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: darkestHex,
    }).setOrigin(1, 0);
  }

  drawDialogueBox() {
    const { width, height } = this.scale;
    const p = this.palette;
    const g = this.add.graphics();

    // Pokemon-style box at bottom
    const boxY = 140;
    const boxH = height - boxY - 10;

    // White fill
    g.fillStyle(p.lightest);
    g.fillRect(10, boxY, width - 20, boxH);

    // Black border (clean Pokemon style)
    g.lineStyle(2, p.darkest);
    g.strokeRect(11, boxY + 1, width - 22, boxH - 2);

    this.dialogueBoxY = boxY;
    this.dialogueBoxH = boxH;
  }

  showDialogue(text) {
    const { width } = this.scale;
    const p = this.palette;
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');

    // Clear previous
    if (this.dialogueText) this.dialogueText.destroy();
    if (this.continueIndicator) this.continueIndicator.destroy();

    this.fullText = text;
    this.displayedText = '';
    this.charIndex = 0;
    this.isTyping = true;

    this.dialogueText = this.add.text(20, this.dialogueBoxY + 10, '', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '9px',
      color: darkestHex,
      wordWrap: { width: width - 50 },
      lineSpacing: 4,
    });

    // Typewriter effect
    this.typeTimer = this.time.addEvent({
      delay: 30,
      callback: () => {
        if (this.charIndex < this.fullText.length) {
          this.displayedText += this.fullText[this.charIndex];
          this.dialogueText.setText(this.displayedText);
          this.charIndex++;
          if (this.fullText[this.charIndex - 1] !== ' ') {
            audioManager.playTypewriter();
          }
        } else {
          this.finishTyping();
        }
      },
      repeat: text.length - 1,
    });
  }

  finishTyping() {
    this.isTyping = false;
    if (this.typeTimer) this.typeTimer.destroy();
    this.dialogueText.setText(this.fullText);

    // Show continue indicator
    const { width, height } = this.scale;
    const p = this.palette;

    this.continueIndicator = this.add.text(width - 25, height - 20, '▼', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: '#' + p.darkest.toString(16).padStart(6, '0'),
    });

    // Blink
    this.time.addEvent({
      delay: 400,
      callback: () => {
        if (this.continueIndicator) {
          this.continueIndicator.visible = !this.continueIndicator.visible;
        }
      },
      loop: true,
    });
  }

  handleInput() {
    audioManager.resume();

    if (this.phase === 'dialogue') {
      if (this.isTyping) {
        // Skip to end
        if (this.typeTimer) this.typeTimer.destroy();
        this.displayedText = this.fullText;
        this.dialogueText.setText(this.fullText);
        this.finishTyping();
      } else {
        this.showChoices();
      }
    } else if (this.phase === 'choices') {
      this.selectChoice(this.currentQuiz.choices[this.selectedChoice].id);
    }
  }

  moveSelection(dir) {
    if (this.phase !== 'choices') return;

    audioManager.playSelect();
    this.selectedChoice += dir;
    if (this.selectedChoice < 0) this.selectedChoice = this.currentQuiz.choices.length - 1;
    if (this.selectedChoice >= this.currentQuiz.choices.length) this.selectedChoice = 0;

    this.updateChoiceHighlight();
  }

  showChoices() {
    this.phase = 'choices';
    this.selectedChoice = 0;

    // Hide dialogue
    if (this.dialogueText) this.dialogueText.destroy();
    if (this.continueIndicator) this.continueIndicator.destroy();

    const { width, height } = this.scale;
    const p = this.palette;
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');

    // Redraw box for choices
    const g = this.add.graphics();
    g.fillStyle(p.lightest);
    g.fillRect(10, this.dialogueBoxY, width - 20, this.dialogueBoxH);
    g.lineStyle(3, p.darkest);
    g.strokeRect(10, this.dialogueBoxY, width - 20, this.dialogueBoxH);

    // Draw choices
    this.choiceTexts = [];
    this.choiceCursors = [];

    const startY = this.dialogueBoxY + 12;
    const lineH = 28;

    this.currentQuiz.choices.forEach((choice, i) => {
      const y = startY + i * lineH;

      // Cursor
      const cursor = this.add.text(18, y, '▶', {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '8px',
        color: darkestHex,
      });
      cursor.visible = (i === 0);
      this.choiceCursors.push(cursor);

      // Choice text
      const text = this.add.text(32, y, `${choice.id}) ${choice.text}`, {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '8px',
        color: darkestHex,
        wordWrap: { width: width - 60 },
      });
      this.choiceTexts.push(text);

      // Make clickable
      text.setInteractive({ useHandCursor: true });
      text.on('pointerdown', () => {
        this.selectedChoice = i;
        this.selectChoice(choice.id);
      });
      text.on('pointerover', () => {
        this.selectedChoice = i;
        this.updateChoiceHighlight();
      });
    });
  }

  updateChoiceHighlight() {
    this.choiceCursors.forEach((cursor, i) => {
      cursor.visible = (i === this.selectedChoice);
    });
  }

  selectChoice(choiceId) {
    if (this.phase !== 'choices') return;
    this.phase = 'result';

    const isCorrect = choiceId === this.currentQuiz.correct;

    if (isCorrect) {
      this.handleCorrect();
    } else {
      this.handleWrong();
    }
  }

  handleCorrect() {
    const { width, height } = this.scale;
    const p = this.palette;

    audioManager.playCorrect();

    // Flash
    const flash = this.add.rectangle(width / 2, height / 2, width, height, p.light, 0.5);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });

    // Show message
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');
    const msg = this.add.text(width / 2, height / 2, '✓ CORRECT!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '12px',
      color: darkestHex,
      backgroundColor: '#' + p.lightest.toString(16).padStart(6, '0'),
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);

    audioManager.playGarlicCollect();

    this.time.delayedCall(1000, () => {
      gameState.addGarlic();
      this.scene.start(SCENES.TRANSFORM, {
        transformation: this.currentQuiz.transformation,
      });
    });
  }

  handleWrong() {
    const { width, height } = this.scale;
    const p = this.palette;

    audioManager.playWrong();

    // Flash dark
    const flash = this.add.rectangle(width / 2, height / 2, width, height, p.darkest, 0.6);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      yoyo: true,
      repeat: 2,
    });

    // Show message
    const lightestHex = '#' + p.lightest.toString(16).padStart(6, '0');
    this.add.text(width / 2, height / 2, '✗ WRONG!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '12px',
      color: lightestHex,
      backgroundColor: '#' + p.darkest.toString(16).padStart(6, '0'),
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      this.scene.start(SCENES.GAME_OVER, {
        wrongFeedback: this.currentQuiz.wrongFeedback,
      });
    });
  }
}
