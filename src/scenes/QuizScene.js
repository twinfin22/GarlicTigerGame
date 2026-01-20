// QuizScene - NPC quiz encounters

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { DialogueBox } from '../objects/DialogueBox.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import quizData from '../data/quizData.json';

export class QuizScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.QUIZ });
    this.currentQuiz = null;
    this.dialogueBox = null;
    this.choiceButtons = [];
    this.npcSprite = null;
    this.phase = 'dialogue'; // 'dialogue', 'choices', 'result'
  }

  create() {
    const { width, height } = this.scale;
    const { COLORS, FONTS, TEXT_SIZES } = GAME_CONFIG;

    // Get current quiz
    const quizIndex = gameState.getCurrentQuizIndex();
    this.currentQuiz = quizData.quizzes[quizIndex];

    if (!this.currentQuiz) {
      // No more quizzes - shouldn't happen, but safety check
      this.scene.start(SCENES.VICTORY);
      return;
    }

    this.phase = 'dialogue';

    // Background
    this.cameras.main.setBackgroundColor(COLORS.BLACK);
    this.cameras.main.fadeIn(300);

    // Draw NPC
    this.drawNPC();

    // NPC name tag
    this.add.text(width / 2, 220, this.currentQuiz.npcName, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#f0f0f0',
      backgroundColor: '#4a4a4a',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);

    // Garlic counter
    this.createGarlicCounter();

    // Create dialogue box
    this.dialogueBox = new DialogueBox(
      this,
      20,
      250,
      width - 40,
      100
    );

    // Show NPC dialogue
    this.dialogueBox.showText(this.currentQuiz.dialogue, null, () => {
      // Enable tap to show choices
    });

    // Create choice buttons (hidden initially)
    this.createChoiceButtons();

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

    // Number key shortcuts for choices
    ['ONE', 'TWO', 'THREE'].forEach((key, index) => {
      this.input.keyboard.on(`keydown-${key}`, () => {
        if (this.phase === 'choices') {
          this.selectChoice(this.currentQuiz.choices[index].id);
        }
      });
    });
  }

  handleInput() {
    if (this.phase === 'dialogue') {
      if (this.dialogueBox.isTyping) {
        this.dialogueBox.skipToEnd();
      } else {
        this.showChoices();
      }
    }
  }

  showChoices() {
    this.phase = 'choices';
    this.dialogueBox.hide();

    // Show choice buttons with animation
    this.choiceButtons.forEach((btn, index) => {
      btn.container.setVisible(true);
      btn.container.setAlpha(0);
      this.tweens.add({
        targets: btn.container,
        alpha: 1,
        y: btn.targetY,
        duration: 200,
        delay: index * 100,
      });
    });
  }

  createChoiceButtons() {
    const { width, height } = this.scale;
    const { FONTS, TEXT_SIZES, COLORS } = GAME_CONFIG;

    const startY = 370;
    const buttonHeight = 70;
    const buttonSpacing = 10;

    this.choiceButtons = this.currentQuiz.choices.map((choice, index) => {
      const y = startY + index * (buttonHeight + buttonSpacing);

      const container = this.add.container(width / 2, y - 20);
      container.setVisible(false);

      // Button background
      const bg = this.add.graphics();
      bg.fillStyle(COLORS.DARK_GRAY);
      bg.fillRect(-160, -buttonHeight / 2, 320, buttonHeight);
      bg.lineStyle(2, COLORS.WHITE);
      bg.strokeRect(-160, -buttonHeight / 2, 320, buttonHeight);
      container.add(bg);

      // Choice letter
      const letter = this.add.text(-140, 0, choice.id + ')', {
        fontFamily: FONTS.MAIN,
        fontSize: TEXT_SIZES.SMALL + 'px',
        color: '#f0f0f0',
      }).setOrigin(0, 0.5);
      container.add(letter);

      // Choice text (word wrapped)
      const text = this.add.text(-115, 0, choice.text, {
        fontFamily: FONTS.MAIN,
        fontSize: TEXT_SIZES.TINY + 'px',
        color: '#cacaca',
        wordWrap: { width: 250 },
        lineSpacing: 4,
      }).setOrigin(0, 0.5);
      container.add(text);

      // Make interactive
      container.setSize(320, buttonHeight);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(COLORS.MID_GRAY);
        bg.fillRect(-160, -buttonHeight / 2, 320, buttonHeight);
        bg.lineStyle(3, COLORS.WHITE);
        bg.strokeRect(-160, -buttonHeight / 2, 320, buttonHeight);
        audioManager.playSelect();
      });

      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(COLORS.DARK_GRAY);
        bg.fillRect(-160, -buttonHeight / 2, 320, buttonHeight);
        bg.lineStyle(2, COLORS.WHITE);
        bg.strokeRect(-160, -buttonHeight / 2, 320, buttonHeight);
      });

      container.on('pointerdown', () => {
        this.selectChoice(choice.id);
      });

      return { container, bg, targetY: y };
    });
  }

  selectChoice(choiceId) {
    if (this.phase !== 'choices') return;
    this.phase = 'result';

    // Disable all buttons
    this.choiceButtons.forEach((btn) => {
      btn.container.disableInteractive();
    });

    const isCorrect = choiceId === this.currentQuiz.correct;

    if (isCorrect) {
      this.handleCorrectAnswer();
    } else {
      this.handleWrongAnswer();
    }
  }

  handleCorrectAnswer() {
    audioManager.playCorrect();

    // Flash screen green briefly
    const flash = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x44ff44,
      0.3
    );

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    // Show "You got a garlic!" message
    const { width, height } = this.scale;
    const garlicMsg = this.add.text(width / 2, height / 2, 'You got a garlic!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: GAME_CONFIG.TEXT_SIZES.MEDIUM + 'px',
      color: '#f0f0f0',
      backgroundColor: '#1a1a1a',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setAlpha(0);

    // Draw flying garlic animation
    const garlicIcon = this.add.graphics();
    garlicIcon.fillStyle(0xf0f0f0);
    garlicIcon.fillCircle(0, 0, 15);
    garlicIcon.fillCircle(-8, 5, 10);
    garlicIcon.fillCircle(8, 5, 10);
    garlicIcon.setPosition(width / 2, height / 2 + 50);

    this.tweens.add({
      targets: garlicMsg,
      alpha: 1,
      duration: 300,
    });

    audioManager.playGarlicCollect();

    // Animate garlic flying to counter
    this.tweens.add({
      targets: garlicIcon,
      x: width - 60,
      y: 30,
      scale: 0.5,
      duration: 800,
      delay: 500,
      ease: 'Power2',
      onComplete: () => {
        garlicIcon.destroy();
        gameState.addGarlic();
        this.updateGarlicCounter();

        // Transition to transformation
        this.time.delayedCall(500, () => {
          this.scene.start(SCENES.TRANSFORM, {
            transformation: this.currentQuiz.transformation,
          });
        });
      },
    });
  }

  handleWrongAnswer() {
    audioManager.playWrong();

    // Flash screen red
    const flash = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0xff4444,
      0.5
    );

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        flash.destroy();
        // Transition to game over
        this.time.delayedCall(500, () => {
          this.scene.start(SCENES.GAME_OVER, {
            wrongFeedback: this.currentQuiz.wrongFeedback,
          });
        });
      },
    });

    // Show wrong text
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'WRONG!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: GAME_CONFIG.TEXT_SIZES.LARGE + 'px',
      color: '#ff4444',
    }).setOrigin(0.5);
  }

  drawNPC() {
    const { width } = this.scale;
    const x = width / 2;
    const y = 120;

    switch (this.currentQuiz.npc) {
      case 'ajumma':
        this.drawAjumma(x, y);
        break;
      case 'worker':
        this.drawWorker(x, y);
        break;
      case 'grandma':
        this.drawGrandma(x, y);
        break;
      case 'senior':
        this.drawSenior(x, y);
        break;
      case 'hipster':
        this.drawHipster(x, y);
        break;
      default:
        this.drawGenericNPC(x, y);
    }
  }

  drawAjumma(x, y) {
    const g = this.add.graphics();

    // Body (apron)
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 25, y, 50, 60);

    // Apron
    g.fillStyle(0xf0f0f0);
    g.fillRect(x - 20, y + 10, 40, 45);

    // Head
    g.fillStyle(0xcacaca);
    g.fillCircle(x, y - 15, 25);

    // Curly perm hair
    g.fillStyle(0x4a4a4a);
    for (let i = -20; i <= 20; i += 8) {
      g.fillCircle(x + i, y - 35, 8);
    }
    g.fillCircle(x - 25, y - 20, 7);
    g.fillCircle(x + 25, y - 20, 7);

    // Eyes (stern but warm)
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 12, y - 18, 6, 4);
    g.fillRect(x + 6, y - 18, 6, 4);

    // Slight smile
    g.lineStyle(2, 0x1a1a1a);
    g.beginPath();
    g.arc(x, y - 5, 8, 0.2, Math.PI - 0.2);
    g.strokePath();

    // Hands on hips
    g.fillStyle(0xcacaca);
    g.fillCircle(x - 30, y + 20, 8);
    g.fillCircle(x + 30, y + 20, 8);
  }

  drawWorker(x, y) {
    const g = this.add.graphics();

    // Body (uniform)
    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 20, y, 40, 55);

    // Uniform details
    g.fillStyle(0x4a4a4a);
    g.fillRect(x - 15, y + 5, 30, 8);

    // Head
    g.fillStyle(0xcacaca);
    g.fillCircle(x, y - 15, 22);

    // Hair
    g.fillStyle(0x2a2a2a);
    g.fillRect(x - 18, y - 35, 36, 15);

    // Tired eyes (half closed)
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 10, y - 15, 6, 2);
    g.fillRect(x + 4, y - 15, 6, 2);

    // Earbud
    g.fillStyle(0xf0f0f0);
    g.fillCircle(x + 22, y - 10, 4);
    g.lineStyle(1, 0xf0f0f0);
    g.lineBetween(x + 22, y - 6, x + 15, y + 20);

    // Name tag
    g.fillStyle(0xf0f0f0);
    g.fillRect(x - 12, y + 15, 24, 10);
  }

  drawGrandma(x, y) {
    const g = this.add.graphics();

    // Body (hiking vest)
    g.fillStyle(0x5a5a5a);
    g.fillRect(x - 22, y, 44, 55);

    // Vest pockets
    g.fillStyle(0x4a4a4a);
    g.fillRect(x - 18, y + 15, 15, 12);
    g.fillRect(x + 3, y + 15, 15, 12);

    // Head
    g.fillStyle(0xcacaca);
    g.fillCircle(x, y - 15, 22);

    // Visor
    g.fillStyle(0x3a3a3a);
    g.fillRect(x - 25, y - 30, 50, 8);
    g.fillRect(x - 30, y - 28, 60, 5);

    // Gray hair under visor
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 18, y - 25, 36, 8);

    // Stern staring eyes
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 10, y - 15, 6, 5);
    g.fillRect(x + 4, y - 15, 6, 5);

    // Frown
    g.lineStyle(2, 0x1a1a1a);
    g.lineBetween(x - 8, y - 2, x + 8, y - 2);

    // Hiking poles
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 35, y - 20, 4, 80);
    g.fillRect(x + 31, y - 20, 4, 80);
  }

  drawSenior(x, y) {
    const g = this.add.graphics();

    // Body (wrinkled suit)
    g.fillStyle(0x4a4a4a);
    g.fillRect(x - 22, y, 44, 55);

    // Tie (loosened)
    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 5, y, 10, 35);

    // Head (red/flushed face)
    g.fillStyle(0xd0a0a0);
    g.fillCircle(x, y - 15, 22);

    // Hair (disheveled)
    g.fillStyle(0x2a2a2a);
    g.fillRect(x - 15, y - 35, 30, 12);

    // Drunk eyes (squinty, happy)
    g.fillStyle(0x1a1a1a);
    g.lineStyle(2, 0x1a1a1a);
    g.beginPath();
    g.arc(x - 8, y - 15, 5, Math.PI, 0);
    g.strokePath();
    g.beginPath();
    g.arc(x + 8, y - 15, 5, Math.PI, 0);
    g.strokePath();

    // Drunk smile
    g.beginPath();
    g.arc(x, y - 2, 10, 0.3, Math.PI - 0.3);
    g.strokePath();

    // Soju bottle
    g.fillStyle(0x8a8a8a);
    g.fillRect(x + 25, y + 10, 12, 30);
    g.fillStyle(0x5a9a5a);
    g.fillRect(x + 27, y + 15, 8, 20);
  }

  drawHipster(x, y) {
    const g = this.add.graphics();

    // Body (oversized tee)
    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 28, y, 56, 55);

    // Head
    g.fillStyle(0xcacaca);
    g.fillCircle(x, y - 15, 22);

    // Bucket hat
    g.fillStyle(0x4a4a4a);
    g.fillRect(x - 28, y - 30, 56, 8);
    g.fillRect(x - 20, y - 45, 40, 18);

    // Hair peeking out
    g.fillStyle(0x3a3a3a);
    g.fillRect(x - 22, y - 25, 10, 8);
    g.fillRect(x + 12, y - 25, 10, 8);

    // Cool eyes
    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 10, y - 15, 5, 4);
    g.fillRect(x + 5, y - 15, 5, 4);

    // Slight smirk
    g.lineStyle(2, 0x1a1a1a);
    g.lineBetween(x - 5, y - 3, x + 8, y - 5);

    // Tote bag
    g.fillStyle(0x8a8a8a);
    g.fillRect(x + 20, y + 10, 20, 30);
    g.lineStyle(1, 0x5a5a5a);
    g.strokeRect(x + 22, y + 15, 16, 20);
  }

  drawGenericNPC(x, y) {
    const g = this.add.graphics();

    g.fillStyle(0x6a6a6a);
    g.fillRect(x - 20, y, 40, 50);

    g.fillStyle(0xcacaca);
    g.fillCircle(x, y - 15, 20);

    g.fillStyle(0x1a1a1a);
    g.fillRect(x - 8, y - 18, 4, 4);
    g.fillRect(x + 4, y - 18, 4, 4);
  }

  createGarlicCounter() {
    const { width } = this.scale;
    const { FONTS, TEXT_SIZES, COLORS } = GAME_CONFIG;

    const container = this.add.container(width - 60, 30);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.BLACK, 0.9);
    bg.fillRect(-45, -18, 90, 36);
    bg.lineStyle(2, COLORS.WHITE);
    bg.strokeRect(-45, -18, 90, 36);
    container.add(bg);

    const garlicIcon = this.add.graphics();
    garlicIcon.fillStyle(0xf0f0f0);
    garlicIcon.fillCircle(-28, 0, 10);
    garlicIcon.fillCircle(-33, 5, 6);
    garlicIcon.fillCircle(-23, 5, 6);
    container.add(garlicIcon);

    this.garlicCounterText = this.add.text(10, 0, `${gameState.getGarlics()}/5`, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.MEDIUM + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);
    container.add(this.garlicCounterText);
  }

  updateGarlicCounter() {
    if (this.garlicCounterText) {
      this.garlicCounterText.setText(`${gameState.getGarlics()}/5`);
    }
  }
}
