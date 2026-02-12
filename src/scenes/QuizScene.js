// QuizScene - Pokemon Gold GBC-style battle quiz encounters
// Native 160x144 resolution with authentic battle layout

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { gameState } from '../utils/StateManager.js';
import { inputHandler } from '../utils/InputHandler.js';
import { BATTLE, getSpritePalette, hexToCSS } from '../data/palettes.js';
import * as Sprites from '../data/spriteData.js';
import {
  drawSpriteLarge,
  drawOverworldSprite,
  drawDialogFrame,
  drawHPBar,
  drawCursor,
  drawContinueIndicator,
  createBattleTransition,
} from '../utils/TileRenderer.js';
import quizData from '../data/quizData.json';

// Map NPC field names to battle sprite keys in spriteData.js
const NPC_BATTLE_SPRITES = {
  ajumma: 'NPC_AJUMMA_BATTLE',
  worker: 'NPC_WORKER_BATTLE',
  grandma: 'NPC_GRANDMA_BATTLE',
  senior: 'NPC_SENIOR_BATTLE',
  hipster: 'NPC_HIPSTER_BATTLE',
};

// Map NPC field names to sprite palette names
const NPC_PALETTE_MAP = {
  ajumma: 'BROWN',
  worker: 'BLUE',
  grandma: 'RED',
  senior: 'BLUE',
  hipster: 'GREEN',
};

// Battle layout constants (native 160x144)
const LAYOUT = {
  NPC_SPRITE_X: 104,
  NPC_SPRITE_Y: 8,
  NPC_SPRITE_W: 56,
  NPC_SPRITE_H: 56,
  TIGER_SPRITE_X: 8,
  TIGER_SPRITE_Y: 48,
  TIGER_SPRITE_W: 48,
  TIGER_SPRITE_H: 48,
  ENEMY_LABEL_X: 8,
  ENEMY_LABEL_Y: 4,
  ENEMY_HP_X: 8,
  ENEMY_HP_Y: 12,
  PLAYER_LABEL_X: 88,
  PLAYER_LABEL_Y: 88,
  PLAYER_HP_X: 88,
  PLAYER_HP_Y: 96,
  DIALOG_X: 0,
  DIALOG_Y: 112,
  DIALOG_W: 160,
  DIALOG_H: 32,
  TEXT_PAD_X: 8,
  TEXT_PAD_Y: 5,
};

// Menu items for the 2x2 action menu
const MENU_ITEMS = [
  { label: 'ANSWER', col: 0, row: 0 },
  { label: 'HELP', col: 1, row: 0 },
  { label: 'RUN', col: 0, row: 1 },
  { label: 'ITEM', col: 1, row: 1 },
];

export class QuizScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.QUIZ });
  }

  create() {
    // --------------------------------------------------
    // State initialization
    // --------------------------------------------------
    this.phase = 'transition';
    // phases: transition -> dialogueSeq -> question -> menu -> choices -> result
    this.dialogueSeqIndex = 0;
    this.selectedChoice = 0;
    this.selectedMenuItem = 0;
    this.fullText = '';
    this.displayedText = '';
    this.charIndex = 0;
    this.isTyping = false;
    this.typeTimer = null;
    this.blinkTimer = null;

    // Graphics references for cleanup
    this.dialogBoxGraphics = null;
    this.dialogueText = null;
    this.continueIndicatorGraphics = null;
    this.choiceTexts = [];
    this.choiceCursorGraphics = [];
    this.menuCursorGraphics = null;
    this.menuTexts = [];
    this.npcSpriteGraphics = null;
    this.tigerSpriteGraphics = null;

    // Get quiz data
    const quizIndex = gameState.getCurrentQuizIndex();
    this.currentQuiz = quizData.quizzes[quizIndex];

    if (!this.currentQuiz) {
      this.scene.start(SCENES.VICTORY);
      return;
    }

    // White battle background
    this.cameras.main.setBackgroundColor(BATTLE.BG);

    // Initialize input handler for this scene
    inputHandler.init(this);
    this._bindInput();

    // Run battle transition, then reveal the battle layout
    createBattleTransition(this, () => this._startBattle());
  }

  // ====================================================
  // INPUT BINDING
  // ====================================================

  _bindInput() {
    inputHandler.on('action', () => this._handleAction());
    inputHandler.on('move', (dir) => this._handleMove(dir));
  }

  // ====================================================
  // PHASE 1: BATTLE ENTRY
  // ====================================================

  _startBattle() {
    // Clear transition bars by redrawing clean background
    this.cameras.main.setBackgroundColor(BATTLE.BG);

    // Draw NPC name label + HP bar (top-left area)
    this._drawEnemyHUD();

    // Draw Player name label + HP bar (bottom-right area)
    this._drawPlayerHUD();

    // Slide NPC in from right
    this._slideNPCIn();

    // Slide Tiger in from left
    this._slideTigerIn();

    // After slide-in animations complete, start dialogue
    this.time.delayedCall(600, () => {
      this._drawDialogBox();
      this._startDialogueSequence();
    });
  }

  _drawEnemyHUD() {
    const name = this.currentQuiz.npcName;
    // Truncate to fit if needed (max ~12 chars at 8px font on 160px screen)
    const displayName = name.length > 12 ? name.substring(0, 11) + '.' : name;

    // Name label
    this.add.text(LAYOUT.ENEMY_LABEL_X, LAYOUT.ENEMY_LABEL_Y, displayName, {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: hexToCSS(BATTLE.TEXT),
    });

    // Level indicator
    this.add.text(LAYOUT.ENEMY_LABEL_X + 60, LAYOUT.ENEMY_LABEL_Y, 'Lv5', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: hexToCSS(BATTLE.TEXT),
    });

    // HP bar for enemy (starts full, cosmetic)
    this.enemyHPGraphics = this.add.graphics();
    drawHPBar(this.enemyHPGraphics, LAYOUT.ENEMY_HP_X, LAYOUT.ENEMY_HP_Y + 8, 100, 100);
  }

  _drawPlayerHUD() {
    // Tiger name + level
    this.add.text(LAYOUT.PLAYER_LABEL_X, LAYOUT.PLAYER_LABEL_Y, 'TIGER', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: hexToCSS(BATTLE.TEXT),
    });

    this.add.text(LAYOUT.PLAYER_LABEL_X + 48, LAYOUT.PLAYER_LABEL_Y, 'Lv5', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: hexToCSS(BATTLE.TEXT),
    });

    // HP bar for player (always full)
    this.playerHPGraphics = this.add.graphics();
    drawHPBar(this.playerHPGraphics, LAYOUT.PLAYER_HP_X, LAYOUT.PLAYER_HP_Y + 8, 100, 100);
  }

  _slideNPCIn() {
    const npcKey = NPC_BATTLE_SPRITES[this.currentQuiz.npc];
    const paletteKey = NPC_PALETTE_MAP[this.currentQuiz.npc] || 'GRAY';
    const palette = getSpritePalette(paletteKey);

    this.npcSpriteGraphics = this.add.graphics();

    // Draw the NPC battle sprite
    const spriteData = npcKey ? Sprites[npcKey] : null;
    if (spriteData) {
      drawSpriteLarge(
        this.npcSpriteGraphics, 0, 0,
        spriteData,
        LAYOUT.NPC_SPRITE_W, LAYOUT.NPC_SPRITE_H,
        palette
      );
    } else {
      // Fallback: draw a simple placeholder silhouette
      this._drawPlaceholderNPC(this.npcSpriteGraphics, palette);
    }

    // Start off-screen right, slide in
    this.npcSpriteGraphics.setPosition(200, LAYOUT.NPC_SPRITE_Y);

    this.tweens.add({
      targets: this.npcSpriteGraphics,
      x: LAYOUT.NPC_SPRITE_X,
      duration: 400,
      ease: 'Cubic.easeOut',
    });
  }

  _slideTigerIn() {
    const stage = gameState.getTransformationStage();
    const basePalette = getSpritePalette('TIGER');
    const colors = [...basePalette.colors];

    // Apply transformation stage palette modifications
    if (stage >= 1) colors[2] = 0xF8F8F8;
    if (stage >= 4) colors[1] = 0x383838;
    const palette = { colors };

    this.tigerSpriteGraphics = this.add.graphics();

    // Use TIGER_BATTLE_BACK if available, fall back to TIGER_BACK
    const spriteData = Sprites.TIGER_BATTLE_BACK || Sprites.TIGER_BACK;
    if (spriteData) {
      drawSpriteLarge(
        this.tigerSpriteGraphics, 0, 0,
        spriteData,
        LAYOUT.TIGER_SPRITE_W, LAYOUT.TIGER_SPRITE_H,
        palette
      );
    } else {
      // Fallback placeholder
      this._drawPlaceholderTiger(this.tigerSpriteGraphics, palette);
    }

    // Start off-screen left, slide in
    this.tigerSpriteGraphics.setPosition(-48, LAYOUT.TIGER_SPRITE_Y);

    this.tweens.add({
      targets: this.tigerSpriteGraphics,
      x: LAYOUT.TIGER_SPRITE_X,
      duration: 400,
      ease: 'Cubic.easeOut',
    });
  }

  /**
   * Draw a placeholder NPC silhouette when battle sprite data is not available.
   */
  _drawPlaceholderNPC(graphics, palette) {
    const w = LAYOUT.NPC_SPRITE_W;
    const h = LAYOUT.NPC_SPRITE_H;
    const c = palette.colors;

    // Body outline
    graphics.fillStyle(c[3] || 0x383838);
    graphics.fillRect(12, 4, 32, 52);

    // Body fill
    graphics.fillStyle(c[1] || 0xB8B8B8);
    graphics.fillRect(14, 6, 28, 48);

    // Head
    graphics.fillStyle(c[2] || 0x686868);
    graphics.fillRect(18, 0, 20, 20);

    // Eyes
    graphics.fillStyle(c[3] || 0x383838);
    graphics.fillRect(22, 8, 4, 4);
    graphics.fillRect(30, 8, 4, 4);
  }

  /**
   * Draw a placeholder tiger back silhouette when battle sprite data is not available.
   */
  _drawPlaceholderTiger(graphics, palette) {
    const c = palette.colors;

    // Body
    graphics.fillStyle(c[1] || 0xF89838);
    graphics.fillRect(8, 8, 32, 40);

    // Head (top)
    graphics.fillStyle(c[1] || 0xF89838);
    graphics.fillRect(12, 0, 24, 16);

    // Ears
    graphics.fillStyle(c[1] || 0xF89838);
    graphics.fillRect(12, 0, 6, 6);
    graphics.fillRect(30, 0, 6, 6);

    // Stripes
    graphics.fillStyle(c[2] || 0x383838);
    graphics.fillRect(14, 14, 20, 2);
    graphics.fillRect(14, 22, 20, 2);
    graphics.fillRect(14, 30, 20, 2);
  }

  // ====================================================
  // DIALOG BOX
  // ====================================================

  _drawDialogBox() {
    if (this.dialogBoxGraphics) this.dialogBoxGraphics.destroy();
    this.dialogBoxGraphics = this.add.graphics();
    drawDialogFrame(
      this.dialogBoxGraphics,
      LAYOUT.DIALOG_X, LAYOUT.DIALOG_Y,
      LAYOUT.DIALOG_W, LAYOUT.DIALOG_H
    );
  }

  _clearDialogContent() {
    if (this.dialogueText) {
      this.dialogueText.destroy();
      this.dialogueText = null;
    }
    if (this.continueIndicatorGraphics) {
      this.continueIndicatorGraphics.destroy();
      this.continueIndicatorGraphics = null;
    }
    if (this.blinkTimer) {
      this.blinkTimer.destroy();
      this.blinkTimer = null;
    }
    if (this.typeTimer) {
      this.typeTimer.destroy();
      this.typeTimer = null;
    }
    this._clearMenuItems();
    this._clearChoiceItems();
  }

  _clearMenuItems() {
    if (this.menuCursorGraphics) {
      this.menuCursorGraphics.destroy();
      this.menuCursorGraphics = null;
    }
    this.menuTexts.forEach((t) => t.destroy());
    this.menuTexts = [];
  }

  _clearChoiceItems() {
    this.choiceCursorGraphics.forEach((g) => g.destroy());
    this.choiceCursorGraphics = [];
    this.choiceTexts.forEach((t) => t.destroy());
    this.choiceTexts = [];
  }

  // ====================================================
  // PHASE 2: DIALOGUE SEQUENCE
  // ====================================================

  _startDialogueSequence() {
    const seq = this.currentQuiz.dialogueSequence;
    if (seq && seq.length > 0) {
      this.phase = 'dialogueSeq';
      this.dialogueSeqIndex = 0;
      this._showTypewriterText(seq[0]);
    } else {
      // No sequence, go straight to question
      this._showQuestion();
    }
  }

  _showQuestion() {
    this.phase = 'question';
    this._showTypewriterText(this.currentQuiz.dialogue);
  }

  /**
   * Display text in the dialog box with typewriter effect.
   * Text wraps within the dialog box area (2 lines max at 8px font).
   */
  _showTypewriterText(text) {
    this._clearDialogContent();
    this._drawDialogBox();

    this.fullText = text;
    this.displayedText = '';
    this.charIndex = 0;
    this.isTyping = true;

    // Calculate available text width inside the double-border dialog frame
    const textWidth = LAYOUT.DIALOG_W - (LAYOUT.TEXT_PAD_X * 2) - 4; // account for border

    this.dialogueText = this.add.text(
      LAYOUT.DIALOG_X + LAYOUT.TEXT_PAD_X,
      LAYOUT.DIALOG_Y + LAYOUT.TEXT_PAD_Y,
      '',
      {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: hexToCSS(BATTLE.TEXT),
        wordWrap: { width: textWidth },
        lineSpacing: 2,
      }
    );

    // Typewriter timer
    this.typeTimer = this.time.addEvent({
      delay: GAME.TYPEWRITER_MS,
      callback: () => {
        if (this.charIndex < this.fullText.length) {
          this.displayedText += this.fullText[this.charIndex];
          this.dialogueText.setText(this.displayedText);
          this.charIndex++;
          // Play typewriter sound for non-space characters
          if (this.fullText[this.charIndex - 1] !== ' ') {
            audioManager.playTypewriter();
          }
        } else {
          this._finishTyping();
        }
      },
      repeat: text.length - 1,
    });
  }

  _finishTyping() {
    this.isTyping = false;
    if (this.typeTimer) {
      this.typeTimer.destroy();
      this.typeTimer = null;
    }
    if (this.dialogueText) {
      this.dialogueText.setText(this.fullText);
    }

    // Show blinking down-arrow continue indicator at bottom-right of dialog box
    this.continueIndicatorGraphics = this.add.graphics();
    drawContinueIndicator(
      this.continueIndicatorGraphics,
      LAYOUT.DIALOG_X + LAYOUT.DIALOG_W - 14,
      LAYOUT.DIALOG_Y + LAYOUT.DIALOG_H - 10
    );

    this.blinkTimer = this.time.addEvent({
      delay: 400,
      callback: () => {
        if (this.continueIndicatorGraphics) {
          this.continueIndicatorGraphics.visible = !this.continueIndicatorGraphics.visible;
        }
      },
      loop: true,
    });
  }

  _skipTypewriter() {
    if (this.typeTimer) {
      this.typeTimer.destroy();
      this.typeTimer = null;
    }
    this.displayedText = this.fullText;
    if (this.dialogueText) {
      this.dialogueText.setText(this.fullText);
    }
    this._finishTyping();
  }

  // ====================================================
  // PHASE 3: ACTION MENU (2x2 grid)
  // ====================================================

  _showActionMenu() {
    this.phase = 'menu';
    this.selectedMenuItem = 0;
    this._clearDialogContent();
    this._drawDialogBox();

    // "What will TIGER do?" prompt text
    this.dialogueText = this.add.text(
      LAYOUT.DIALOG_X + LAYOUT.TEXT_PAD_X,
      LAYOUT.DIALOG_Y + LAYOUT.TEXT_PAD_Y,
      'What will TIGER do?',
      {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: hexToCSS(BATTLE.TEXT),
      }
    );

    // 2x2 menu grid
    const menuBaseX = LAYOUT.DIALOG_X + LAYOUT.TEXT_PAD_X + 8;
    const menuBaseY = LAYOUT.DIALOG_Y + LAYOUT.TEXT_PAD_Y + 12;
    const colSpacing = 72; // horizontal distance between columns
    const rowSpacing = 10; // vertical distance between rows

    this.menuTexts = [];
    MENU_ITEMS.forEach((item) => {
      const tx = menuBaseX + item.col * colSpacing;
      const ty = menuBaseY + item.row * rowSpacing;
      const text = this.add.text(tx, ty, item.label, {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: hexToCSS(BATTLE.TEXT),
      });
      this.menuTexts.push(text);
    });

    // Cursor
    this.menuCursorGraphics = this.add.graphics();
    this._updateMenuCursor();
  }

  _updateMenuCursor() {
    if (!this.menuCursorGraphics) return;
    this.menuCursorGraphics.clear();

    const item = MENU_ITEMS[this.selectedMenuItem];
    const menuBaseX = LAYOUT.DIALOG_X + LAYOUT.TEXT_PAD_X + 8;
    const menuBaseY = LAYOUT.DIALOG_Y + LAYOUT.TEXT_PAD_Y + 12;
    const colSpacing = 72;
    const rowSpacing = 10;

    const cx = menuBaseX + item.col * colSpacing - 6;
    const cy = menuBaseY + item.row * rowSpacing + 1;
    drawCursor(this.menuCursorGraphics, cx, cy);
  }

  // ====================================================
  // PHASE 4: CHOICE SELECTION
  // ====================================================

  _showChoices() {
    this.phase = 'choices';
    this.selectedChoice = 0;
    this._clearDialogContent();
    this._drawDialogBox();

    const choices = this.currentQuiz.choices;
    const labels = ['A', 'B', 'C'];
    const startX = LAYOUT.DIALOG_X + LAYOUT.TEXT_PAD_X + 6;
    const startY = LAYOUT.DIALOG_Y + LAYOUT.TEXT_PAD_Y;
    const lineHeight = 9;

    this.choiceTexts = [];
    this.choiceCursorGraphics = [];

    choices.forEach((choice, i) => {
      const y = startY + i * lineHeight;

      // Cursor graphic (right-pointing triangle)
      const cursorG = this.add.graphics();
      drawCursor(cursorG, startX - 6, y + 1);
      cursorG.visible = (i === 0);
      this.choiceCursorGraphics.push(cursorG);

      // Choice label: "A) text"
      const label = labels[i] || choice.id;
      // Truncate long choice text to fit within dialog box
      let choiceText = choice.text;
      if (choiceText.length > GAME.DIALOG_CHARS_PER_LINE) {
        choiceText = choiceText.substring(0, GAME.DIALOG_CHARS_PER_LINE - 1) + '\u2026';
      }
      const text = this.add.text(startX, y, `${label})${choiceText}`, {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: hexToCSS(BATTLE.TEXT),
      });
      this.choiceTexts.push(text);
    });
  }

  _updateChoiceCursor() {
    this.choiceCursorGraphics.forEach((g, i) => {
      g.visible = (i === this.selectedChoice);
    });
  }

  // ====================================================
  // PHASE 5: RESULT
  // ====================================================

  _handleCorrect() {
    this.phase = 'result';
    audioManager.playCorrect();

    // Green tinted flash
    const flash = this.add.rectangle(80, 72, 160, 144, BATTLE.HP_GREEN, 0.4);
    flash.setDepth(50);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy(),
    });

    // Deplete enemy HP bar
    if (this.enemyHPGraphics) {
      this.enemyHPGraphics.clear();
      drawHPBar(this.enemyHPGraphics, LAYOUT.ENEMY_HP_X, LAYOUT.ENEMY_HP_Y + 8, 0, 100);
    }

    // Show "CORRECT!" in dialog box
    this._clearDialogContent();
    this._drawDialogBox();
    this.dialogueText = this.add.text(
      LAYOUT.DIALOG_X + LAYOUT.TEXT_PAD_X,
      LAYOUT.DIALOG_Y + LAYOUT.TEXT_PAD_Y + 4,
      'CORRECT!',
      {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: hexToCSS(BATTLE.TEXT),
      }
    );

    audioManager.playGarlicCollect();

    this.time.delayedCall(1200, () => {
      // Mark the NPC as defeated so they can't be re-battled
      if (this.currentQuiz.npc) {
        gameState.defeatNPC(this.currentQuiz.npc);
      }
      gameState.addGarlic();
      this.scene.start(SCENES.TRANSFORM, {
        transformation: this.currentQuiz.transformation,
      });
    });
  }

  _handleWrong() {
    this.phase = 'result';
    audioManager.playWrong();

    // Screen shake
    this.cameras.main.shake(300, 0.02);

    // Red flash
    const flash = this.add.rectangle(80, 72, 160, 144, BATTLE.HP_RED, 0.5);
    flash.setDepth(50);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => flash.destroy(),
    });

    // Show "WRONG!" in dialog box
    this._clearDialogContent();
    this._drawDialogBox();
    this.dialogueText = this.add.text(
      LAYOUT.DIALOG_X + LAYOUT.TEXT_PAD_X,
      LAYOUT.DIALOG_Y + LAYOUT.TEXT_PAD_Y + 4,
      'WRONG!',
      {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: hexToCSS(BATTLE.TEXT),
      }
    );

    this.time.delayedCall(1500, () => {
      this.scene.start(SCENES.GAME_OVER, {
        wrongFeedback: this.currentQuiz.wrongFeedback,
      });
    });
  }

  // ====================================================
  // INPUT HANDLING
  // ====================================================

  _handleAction() {
    audioManager.resume();

    switch (this.phase) {
      case 'transition':
        // Ignore input during transition
        break;

      case 'dialogueSeq':
        if (this.isTyping) {
          this._skipTypewriter();
        } else {
          // Advance to next dialogue in sequence
          audioManager.playConfirm();
          this.dialogueSeqIndex++;
          const seq = this.currentQuiz.dialogueSequence;
          if (this.dialogueSeqIndex < seq.length) {
            this._showTypewriterText(seq[this.dialogueSeqIndex]);
          } else {
            // Sequence complete, show the question
            this._showQuestion();
          }
        }
        break;

      case 'question':
        if (this.isTyping) {
          this._skipTypewriter();
        } else {
          // Question fully displayed, show action menu
          audioManager.playConfirm();
          this._showActionMenu();
        }
        break;

      case 'menu':
        this._selectMenuItem();
        break;

      case 'choices':
        this._confirmChoice();
        break;

      case 'result':
        // Ignore input during result display
        break;

      default:
        break;
    }
  }

  _handleMove(direction) {
    if (this.phase === 'menu') {
      this._navigateMenu(direction);
    } else if (this.phase === 'choices') {
      this._navigateChoices(direction);
    }
  }

  // ====================================================
  // MENU NAVIGATION
  // ====================================================

  _navigateMenu(direction) {
    const current = MENU_ITEMS[this.selectedMenuItem];
    let newCol = current.col;
    let newRow = current.row;

    switch (direction) {
      case 'up':    newRow = Math.max(0, newRow - 1); break;
      case 'down':  newRow = Math.min(1, newRow + 1); break;
      case 'left':  newCol = Math.max(0, newCol - 1); break;
      case 'right': newCol = Math.min(1, newCol + 1); break;
    }

    const newIndex = MENU_ITEMS.findIndex((m) => m.col === newCol && m.row === newRow);
    if (newIndex >= 0 && newIndex !== this.selectedMenuItem) {
      audioManager.playMenuSelect();
      this.selectedMenuItem = newIndex;
      this._updateMenuCursor();
    }
  }

  _selectMenuItem() {
    const item = MENU_ITEMS[this.selectedMenuItem];

    if (item.label === 'ANSWER') {
      audioManager.playConfirm();
      this._showChoices();
    } else {
      // Other menu items show a "Can't do that!" message
      audioManager.playWrong();
      this._showCantDoThat();
    }
  }

  _showCantDoThat() {
    const prevPhase = this.phase;
    this.phase = 'cantdo';

    this._clearDialogContent();
    this._drawDialogBox();

    this.dialogueText = this.add.text(
      LAYOUT.DIALOG_X + LAYOUT.TEXT_PAD_X,
      LAYOUT.DIALOG_Y + LAYOUT.TEXT_PAD_Y + 4,
      "Can't do that now!",
      {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: hexToCSS(BATTLE.TEXT),
      }
    );

    // After a brief delay, return to the action menu
    this.time.delayedCall(800, () => {
      if (this.phase === 'cantdo') {
        this._showActionMenu();
      }
    });
  }

  // ====================================================
  // CHOICE NAVIGATION
  // ====================================================

  _navigateChoices(direction) {
    if (direction !== 'up' && direction !== 'down') return;

    const numChoices = this.currentQuiz.choices.length;
    if (direction === 'up') {
      this.selectedChoice = (this.selectedChoice - 1 + numChoices) % numChoices;
    } else {
      this.selectedChoice = (this.selectedChoice + 1) % numChoices;
    }

    audioManager.playMenuSelect();
    this._updateChoiceCursor();
  }

  _confirmChoice() {
    const choiceId = this.currentQuiz.choices[this.selectedChoice].id;
    const isCorrect = choiceId === this.currentQuiz.correct;

    audioManager.playConfirm();

    if (isCorrect) {
      this._handleCorrect();
    } else {
      this._handleWrong();
    }
  }

  // ====================================================
  // CLEANUP
  // ====================================================

  shutdown() {
    // Clean up input handler listeners when leaving scene
    inputHandler.removeAllListeners();
    if (this.typeTimer) this.typeTimer.destroy();
    if (this.blinkTimer) this.blinkTimer.destroy();
  }
}
