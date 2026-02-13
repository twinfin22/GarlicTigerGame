// QuizScene - Pokemon FireRed/LeafGreen GBA-style battle quiz encounters
// 240x160 native resolution with Gen 3 battle layout and bilingual text

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { StateManager } from '../utils/StateManager.js';
import { InputHandler } from '../utils/InputHandler.js';
import { DialogueBox } from '../objects/DialogueBox.js';
import { ASSET_MANIFEST } from '../data/assetManifest.js';
import { createBattleTransition } from '../utils/TileRenderer.js';
import quizData from '../data/quizData.json';

// NPC key → asset texture key mapping
const NPC_TEXTURE_MAP = {
  npc_ajumma: 'npc_ajumma',
  npc_grandma: 'npc_grandma',
  npc_friends: 'npc_businessman',   // use businessman sprite for friend group
  npc_friend: 'npc_student',        // use student sprite for friend
};

// Battle layout constants (240x160 GBA native)
const LAYOUT = {
  NPC_X: 170,
  NPC_Y: 16,
  NPC_SIZE: 64,
  TIGER_X: 30,
  TIGER_Y: 56,
  TIGER_SIZE: 64,
  ENEMY_LABEL_X: 10,
  ENEMY_LABEL_Y: 6,
  PLAYER_LABEL_X: 130,
  PLAYER_LABEL_Y: 88,
  BATTLE_BG_COLOR: 0xF8F8F8,
  TEXT_COLOR: '#000000',
  TEXT_COLOR_EN: '#444444',
};

// Elevator button mashing animation constants
const ELEVATOR = {
  BUTTON_X: 180,
  BUTTON_Y: 48,
  BUTTON_SIZE: 12,
  MASH_INTERVAL: 120,
};

export class QuizScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.QUIZ });
  }

  init(data) {
    this.quizId = data.quizId;
    this.currentQuiz = quizData.quizzes.find(q => q.id === this.quizId);
  }

  create() {
    // State
    this.phase = 'transition';
    this.dialogueSeqIndex = 0;
    this.inputHandler = new InputHandler(this);
    this.dialogueBox = null;
    this.elevatorMashTimer = null;
    this.elevatorPressCount = 0;

    // Flag-based action input (more reliable than JustDown polling)
    this._actionFlag = false;
    this._cancelFlag = false;
    this._actionCooldown = 0;
    const ACTION_COOLDOWN_MS = 150;

    this._onKeyDown = (event) => {
      const key = event.key || event.code;
      const now = Date.now();
      if (key === ' ' || key === 'Space' || key === 'Enter' || key === 'z' || key === 'Z') {
        if (now - this._actionCooldown > ACTION_COOLDOWN_MS) {
          this._actionFlag = true;
          this._actionCooldown = now;
        }
      }
      if (key === 'x' || key === 'X' || key === 'Escape') {
        this._cancelFlag = true;
      }
    };
    this.input.keyboard.on('keydown', this._onKeyDown);

    // Mobile touch action support
    this._onPointerDown = () => {
      const now = Date.now();
      if (now - this._actionCooldown > ACTION_COOLDOWN_MS) {
        this._actionFlag = true;
        this._actionCooldown = now;
      }
    };
    this.input.on('pointerdown', this._onPointerDown);

    if (!this.currentQuiz) {
      this.scene.start(SCENES.VICTORY);
      return;
    }

    // White battle background
    this.cameras.main.setBackgroundColor(LAYOUT.BATTLE_BG_COLOR);

    // Run battle transition, then reveal battle layout
    createBattleTransition(this, () => this._startBattle());

    // Cleanup on shutdown
    this.events.once('shutdown', () => {
      if (this.inputHandler) this.inputHandler.destroy();
      if (this.dialogueBox) this.dialogueBox.destroy();
      if (this.elevatorMashTimer) this.elevatorMashTimer.destroy();
      if (this._onKeyDown) this.input.keyboard.off('keydown', this._onKeyDown);
      if (this._onPointerDown) this.input.off('pointerdown', this._onPointerDown);
    });
  }

  // ====================================================
  // BATTLE ENTRY
  // ====================================================

  _startBattle() {
    this.cameras.main.setBackgroundColor(LAYOUT.BATTLE_BG_COLOR);

    const isElevator = this.currentQuiz.id === 2;

    if (isElevator) {
      this._setupElevatorBattle();
    } else {
      this._setupNPCBattle();
    }

    // Draw enemy HUD
    this._drawEnemyHUD();

    // Draw player HUD
    this._drawPlayerHUD();

    // Create dialogue box after a short delay
    this.time.delayedCall(500, () => {
      this.dialogueBox = new DialogueBox(this);
      this._startDialogueSequence();
    });
  }

  _setupElevatorBattle() {
    // Show elevator background image
    const elevatorKey = ASSET_MANIFEST.korean.elevator_bg.key;
    if (this.textures.exists(elevatorKey)) {
      const bg = this.add.image(GAME.WIDTH / 2, GAME.HEIGHT / 2 - 20, elevatorKey);
      bg.setDisplaySize(GAME.WIDTH, GAME.HEIGHT - 48);
      bg.setOrigin(0.5);
    } else {
      // Fallback: draw elevator interior
      const g = this.add.graphics();
      g.fillStyle(0xC0C0C0);
      g.fillRect(40, 8, 160, 90);
      g.fillStyle(0x808080);
      g.fillRect(100, 12, 4, 82);
      // Door panel lines
      g.lineStyle(1, 0x606060);
      g.lineBetween(100, 12, 100, 94);
      g.lineBetween(104, 12, 104, 94);
    }

    // Elevator close door button with mashing animation
    this._drawElevatorButton();

    // Tiger sprite bottom-left
    this._drawTigerSprite();
  }

  _drawElevatorButton() {
    // Button panel
    const g = this.add.graphics();
    g.fillStyle(0x505050);
    g.fillRect(ELEVATOR.BUTTON_X - 2, ELEVATOR.BUTTON_Y - 2, ELEVATOR.BUTTON_SIZE + 4, ELEVATOR.BUTTON_SIZE + 4);

    // Button face
    this.elevatorButton = this.add.graphics();
    this._drawButtonNormal();

    // "><" close door icon on button
    this.buttonIcon = this.add.text(
      ELEVATOR.BUTTON_X + ELEVATOR.BUTTON_SIZE / 2,
      ELEVATOR.BUTTON_Y + ELEVATOR.BUTTON_SIZE / 2,
      '><',
      {
        fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
        fontSize: '6px',
        color: '#FFFFFF',
      }
    ).setOrigin(0.5);

    // Mashing counter text
    this.mashText = this.add.text(
      ELEVATOR.BUTTON_X + ELEVATOR.BUTTON_SIZE / 2,
      ELEVATOR.BUTTON_Y + ELEVATOR.BUTTON_SIZE + 8,
      '',
      {
        fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
        fontSize: '6px',
        color: LAYOUT.TEXT_COLOR,
      }
    ).setOrigin(0.5);

    // Auto-mash animation for visual flair
    this.elevatorMashTimer = this.time.addEvent({
      delay: ELEVATOR.MASH_INTERVAL,
      callback: () => {
        if (this.phase !== 'dialogueSeq' && this.phase !== 'question') return;
        this.elevatorPressCount++;
        this.mashText.setText(`x${this.elevatorPressCount}`);

        // Flash button pressed
        this.elevatorButton.clear();
        this.elevatorButton.fillStyle(0xFF4444);
        this.elevatorButton.fillRect(ELEVATOR.BUTTON_X, ELEVATOR.BUTTON_Y, ELEVATOR.BUTTON_SIZE, ELEVATOR.BUTTON_SIZE);

        this.time.delayedCall(60, () => this._drawButtonNormal());
      },
      loop: true,
    });
  }

  _drawButtonNormal() {
    if (!this.elevatorButton) return;
    this.elevatorButton.clear();
    this.elevatorButton.fillStyle(0x808080);
    this.elevatorButton.fillRect(ELEVATOR.BUTTON_X, ELEVATOR.BUTTON_Y, ELEVATOR.BUTTON_SIZE, ELEVATOR.BUTTON_SIZE);
  }

  _setupNPCBattle() {
    // NPC sprite top-right
    this._drawNPCSprite();

    // Tiger sprite bottom-left
    this._drawTigerSprite();
  }

  _drawNPCSprite() {
    const npcKey = this.currentQuiz.npcKey;
    const textureKey = NPC_TEXTURE_MAP[npcKey] || npcKey;

    if (textureKey && this.textures.exists(textureKey)) {
      const npc = this.add.image(LAYOUT.NPC_X + LAYOUT.NPC_SIZE / 2, LAYOUT.NPC_Y + LAYOUT.NPC_SIZE / 2, textureKey);
      npc.setDisplaySize(LAYOUT.NPC_SIZE, LAYOUT.NPC_SIZE);

      // Slide in from right
      npc.x = GAME.WIDTH + 40;
      this.tweens.add({
        targets: npc,
        x: LAYOUT.NPC_X + LAYOUT.NPC_SIZE / 2,
        duration: 400,
        ease: 'Cubic.easeOut',
      });
    } else {
      // Fallback: colored rectangle placeholder
      const g = this.add.graphics();
      g.fillStyle(0x888888);
      g.fillRect(0, 0, LAYOUT.NPC_SIZE, LAYOUT.NPC_SIZE);
      g.fillStyle(0x606060);
      g.fillRect(16, 4, 32, 32);
      g.setPosition(GAME.WIDTH + 40, LAYOUT.NPC_Y);

      this.tweens.add({
        targets: g,
        x: LAYOUT.NPC_X,
        duration: 400,
        ease: 'Cubic.easeOut',
      });
    }
  }

  _drawTigerSprite() {
    const stage = StateManager.getStage();
    const frameKey = `flexible_neck_${Math.min(stage, 11)}`;

    if (this.textures.exists('tiger')) {
      const tiger = this.add.sprite(LAYOUT.TIGER_X + LAYOUT.TIGER_SIZE / 2, LAYOUT.TIGER_Y + LAYOUT.TIGER_SIZE / 2, 'tiger', 0);
      tiger.setDisplaySize(LAYOUT.TIGER_SIZE, LAYOUT.TIGER_SIZE);

      // Slide in from left
      tiger.x = -40;
      this.tweens.add({
        targets: tiger,
        x: LAYOUT.TIGER_X + LAYOUT.TIGER_SIZE / 2,
        duration: 400,
        ease: 'Cubic.easeOut',
      });
    } else {
      // Fallback placeholder
      const g = this.add.graphics();
      g.fillStyle(0xF89838);
      g.fillRect(0, 0, LAYOUT.TIGER_SIZE, LAYOUT.TIGER_SIZE);
      g.fillStyle(0x383838);
      g.fillRect(8, 12, LAYOUT.TIGER_SIZE - 16, 2);
      g.fillRect(8, 24, LAYOUT.TIGER_SIZE - 16, 2);
      g.setPosition(-40, LAYOUT.TIGER_Y);

      this.tweens.add({
        targets: g,
        x: LAYOUT.TIGER_X,
        duration: 400,
        ease: 'Cubic.easeOut',
      });
    }
  }

  _drawEnemyHUD() {
    const nameKo = this.currentQuiz.npcName.ko;
    const nameEn = this.currentQuiz.npcName.en;
    const displayName = nameEn.length > 16 ? nameEn.substring(0, 15) + '.' : nameEn;

    // Background panel
    const bg = this.add.graphics();
    bg.fillStyle(0xF8F8D8);
    bg.fillRect(LAYOUT.ENEMY_LABEL_X, LAYOUT.ENEMY_LABEL_Y, 110, 22);
    bg.lineStyle(1, 0x000000);
    bg.strokeRect(LAYOUT.ENEMY_LABEL_X, LAYOUT.ENEMY_LABEL_Y, 110, 22);

    // Name (Korean)
    this.add.text(LAYOUT.ENEMY_LABEL_X + 4, LAYOUT.ENEMY_LABEL_Y + 2, nameKo, {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '8px',
      color: LAYOUT.TEXT_COLOR,
    });

    // Name (English)
    this.add.text(LAYOUT.ENEMY_LABEL_X + 4, LAYOUT.ENEMY_LABEL_Y + 12, displayName, {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '6px',
      color: LAYOUT.TEXT_COLOR_EN,
    });
  }

  _drawPlayerHUD() {
    const bg = this.add.graphics();
    bg.fillStyle(0xF8F8D8);
    bg.fillRect(LAYOUT.PLAYER_LABEL_X, LAYOUT.PLAYER_LABEL_Y, 100, 16);
    bg.lineStyle(1, 0x000000);
    bg.strokeRect(LAYOUT.PLAYER_LABEL_X, LAYOUT.PLAYER_LABEL_Y, 100, 16);

    this.add.text(LAYOUT.PLAYER_LABEL_X + 4, LAYOUT.PLAYER_LABEL_Y + 3, 'TIGER  Lv5', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: LAYOUT.TEXT_COLOR,
    });
  }

  // ====================================================
  // DIALOGUE SEQUENCE
  // ====================================================

  _startDialogueSequence() {
    const seq = this.currentQuiz.dialogueSequence;
    if (seq && seq.length > 0) {
      this.phase = 'dialogueSeq';
      this.dialogueSeqIndex = 0;
      this.dialogueBox.showText(seq[0].ko, seq[0].en);
    } else {
      this._showQuestion();
    }
  }

  _showQuestion() {
    this.phase = 'question';
    this.dialogueBox.showText(
      this.currentQuiz.question.ko,
      this.currentQuiz.question.en
    );
  }

  _showChoices() {
    this.phase = 'choices';
    this.dialogueBox.showChoices(this.currentQuiz.choices);
  }

  // ====================================================
  // RESULT HANDLING
  // ====================================================

  _handleCorrect() {
    this.phase = 'result';
    audioManager.playCorrect();

    // Green flash
    const flash = this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0x58A058, 0.4);
    flash.setDepth(50);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy(),
    });

    // Show correct feedback in dialogue box
    this.dialogueBox.showText(
      this.currentQuiz.correctFeedback.ko,
      this.currentQuiz.correctFeedback.en
    );

    audioManager.playGarlicCollect();

    // Complete quiz in state
    StateManager.completeQuiz(this.quizId);

    this.time.delayedCall(2000, () => {
      this.scene.start(SCENES.TRANSFORM, {
        quizId: this.quizId,
        transformation: this.currentQuiz.transformation,
      });
    });
  }

  _handleWrong() {
    this.phase = 'wrongFeedback';
    audioManager.playWrong();
    StateManager.recordWrongAnswer(this.quizId);

    // Screen shake + red flash
    this.cameras.main.shake(300, 0.02);
    const flash = this.add.rectangle(GAME.WIDTH / 2, GAME.HEIGHT / 2, GAME.WIDTH, GAME.HEIGHT, 0xF85858, 0.5);
    flash.setDepth(50);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => flash.destroy(),
    });

    // Show wrong feedback
    this.dialogueBox.showText(
      this.currentQuiz.wrongFeedback.ko,
      this.currentQuiz.wrongFeedback.en
    );

    // After player reads feedback, show retry prompt
    this.time.delayedCall(2500, () => {
      this.phase = 'retryPrompt';
      this.dialogueBox.showText(
        '\ub2e4\uc2dc \ub3c4\uc804\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?',
        'Try again?'
      );
      this.dialogueBox.showChoices([
        { id: 'retry', ko: '\ub2e4\uc2dc \ub3c4\uc804!', en: 'Try again!' },
        { id: 'leave', ko: '\ub3cc\uc544\uac00\uae30', en: 'Leave' },
      ]);
    });
  }

  // ====================================================
  // UPDATE LOOP
  // ====================================================

  update() {
    if (!this.inputHandler || !this.dialogueBox) return;

    // Advance typewriter
    if (this.dialogueBox.isAnimating) {
      this.dialogueBox.updateTypewriter();
    }

    // Handle action button via flag (avoids JustDown unreliability)
    if (this._actionFlag) {
      this._actionFlag = false;
      audioManager.resume();
      this._handleAction();
    }

    // Handle direction input for choices (with cooldown to prevent skipping)
    if (this.dialogueBox.isChoice) {
      const dir = this.inputHandler.getDirection();
      const now = Date.now();
      if ((dir === 'up' || dir === 'down') && now - (this._dirCooldown || 0) > 200) {
        this._dirCooldown = now;
        audioManager.playSelect();
        this.dialogueBox.moveCursor(dir);
      }
    }

    // Handle cancel button (return to overworld during retry)
    if (this._cancelFlag && this.phase === 'retryPrompt') {
      this._cancelFlag = false;
      audioManager.playSelect();
      this.scene.start(SCENES.OVERWORLD);
    } else {
      this._cancelFlag = false;
    }
  }

  _handleAction() {
    switch (this.phase) {
      case 'transition':
        break;

      case 'dialogueSeq':
        if (this.dialogueBox.isAnimating) {
          // Skip animation — show full text immediately, then advance on next press
          this.dialogueBox.skipAnimation();
        } else {
          // Text fully shown — advance to next dialogue entry
          audioManager.playConfirm();
          this.dialogueSeqIndex++;
          const seq = this.currentQuiz.dialogueSequence;
          if (this.dialogueSeqIndex < seq.length) {
            this.dialogueBox.showText(
              seq[this.dialogueSeqIndex].ko,
              seq[this.dialogueSeqIndex].en
            );
          } else {
            this._showQuestion();
          }
        }
        break;

      case 'question':
        if (this.dialogueBox.isAnimating) {
          this.dialogueBox.skipAnimation();
        } else {
          audioManager.playConfirm();
          this._showChoices();
        }
        break;

      case 'choices':
        if (this.dialogueBox.isChoice) {
          audioManager.playConfirm();
          const selectedIdx = this.dialogueBox.getSelectedChoice();
          const choiceId = this.currentQuiz.choices[selectedIdx].id;
          const isCorrect = choiceId === this.currentQuiz.correct;

          if (isCorrect) {
            this._handleCorrect();
          } else {
            this._handleWrong();
          }
        }
        break;

      case 'wrongFeedback':
        if (this.dialogueBox.isAnimating) {
          this.dialogueBox.skipAnimation();
        }
        break;

      case 'retryPrompt':
        if (this.dialogueBox.isChoice) {
          audioManager.playConfirm();
          const retryIdx = this.dialogueBox.getSelectedChoice();
          const retryChoices = ['retry', 'leave'];
          if (retryChoices[retryIdx] === 'retry') {
            // Restart quiz
            this.dialogueBox.hide();
            this.phase = 'dialogueSeq';
            this.dialogueSeqIndex = 0;
            this._startDialogueSequence();
          } else {
            this.scene.start(SCENES.OVERWORLD);
          }
        }
        break;

      case 'result':
        break;

      default:
        break;
    }
  }
}
