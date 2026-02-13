import { GAME } from '../config.js';

export class DialogueBox extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(1000);

    // Box dimensions: full width, 48px tall, bottom of screen
    const boxY = GAME.HEIGHT - 48;
    const boxW = GAME.WIDTH; // 240
    const boxH = 48;

    // Background
    this.bg = scene.add.rectangle(boxW / 2, boxY + boxH / 2, boxW - 4, boxH - 4, 0xFFFFFF);
    this.bg.setStrokeStyle(2, 0x000000);
    this.add(this.bg);

    // Korean text (top line)
    this.koText = scene.add.text(8, boxY + 6, '', {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '9px',
      color: '#000000',
      wordWrap: { width: boxW - 16 },
    });
    this.add(this.koText);

    // English text (below Korean)
    this.enText = scene.add.text(8, boxY + 22, '', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: '#444444',
      wordWrap: { width: boxW - 16 },
      maxLines: 3,
    });
    this.add(this.enText);

    // Blinking cursor triangle
    this.cursor = scene.add.triangle(boxW - 12, boxY + boxH - 8, 0, 0, 6, 0, 3, 4, 0x000000);
    this.add(this.cursor);
    this.cursor.setVisible(false);

    // Choice items
    this.choiceTexts = [];
    this.selectedChoice = 0;
    this.choiceCursor = null;

    // State
    this.isVisible = false;
    this.isAnimating = false;
    this.fullKoText = '';
    this.fullEnText = '';
    this.charIndex = 0;
    this.onComplete = null;
    this.isChoice = false;

    // Compatibility: alias for scenes that check `isTyping`
    this.isTyping = false;

    this.setVisible(false);
  }

  showText(ko, en, callback) {
    this.setVisible(true);
    this.isVisible = true;
    this.isAnimating = true;
    this.isTyping = true;
    this.isChoice = false;
    this.fullKoText = ko || '';
    this.fullEnText = en || '';
    this.charIndex = 0;
    this.koText.setText('');
    this.enText.setText('');
    this.cursor.setVisible(false);
    this.onComplete = callback || null;
    this.clearChoices();
  }

  showChoices(choices) {
    // choices = [{id, ko, en}, ...]
    this.selectedChoice = 0;
    this.clearChoices();
    this.isChoice = true;  // Set AFTER clearChoices (which resets it to false)

    // Clear existing question text so choices don't overlap (M1 fix)
    this.koText.setText('');
    this.enText.setText('');
    this.cursor.setVisible(false);

    const startY = GAME.HEIGHT - 48 + 6;
    const lineH = 14;

    choices.forEach((c, i) => {
      const text = this.scene.add.text(18, startY + i * lineH, `${c.ko} / ${c.en}`, {
        fontFamily: `'${GAME.FONT_KO}', sans-serif`,
        fontSize: '7px',
        color: '#000000',
        wordWrap: { width: GAME.WIDTH - 30, useAdvancedWrap: true },
      });
      text.setLineSpacing(-1);
      this.add(text);
      this.choiceTexts.push(text);
    });

    // Choice cursor
    this.choiceCursor = this.scene.add.text(8, startY, '\u25b6', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: '#000000',
    });
    this.add(this.choiceCursor);
    this.updateChoiceCursor();
  }

  moveCursor(dir) {
    if (!this.isChoice || this.choiceTexts.length === 0) return;
    if (dir === 'up') this.selectedChoice = Math.max(0, this.selectedChoice - 1);
    if (dir === 'down') this.selectedChoice = Math.min(this.choiceTexts.length - 1, this.selectedChoice + 1);
    this.updateChoiceCursor();
  }

  updateChoiceCursor() {
    if (this.choiceCursor && this.choiceTexts[this.selectedChoice]) {
      this.choiceCursor.setY(this.choiceTexts[this.selectedChoice].y);
    }
  }

  getSelectedChoice() {
    return this.selectedChoice;
  }

  updateTypewriter() {
    if (!this.isAnimating) return;

    this.charIndex++;
    const koSub = this.fullKoText.substring(0, this.charIndex);
    const enSub = this.fullEnText.substring(0, this.charIndex);
    this.koText.setText(koSub);
    this.enText.setText(enSub);

    if (this.charIndex >= Math.max(this.fullKoText.length, this.fullEnText.length)) {
      this.isAnimating = false;
      this.isTyping = false;
      this.cursor.setVisible(true);
      // Blink cursor
      this.scene.tweens.add({
        targets: this.cursor,
        alpha: 0,
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  skipAnimation() {
    if (!this.isAnimating) return;
    this.charIndex = Math.max(this.fullKoText.length, this.fullEnText.length);
    this.koText.setText(this.fullKoText);
    this.enText.setText(this.fullEnText);
    this.isAnimating = false;
    this.isTyping = false;
    this.cursor.setVisible(true);
  }

  // Alias for backward compatibility with scenes that call skipToEnd()
  skipToEnd() {
    this.skipAnimation();
  }

  clearChoices() {
    this.choiceTexts.forEach(t => t.destroy());
    this.choiceTexts = [];
    if (this.choiceCursor) { this.choiceCursor.destroy(); this.choiceCursor = null; }
    this.isChoice = false;
  }

  hide() {
    this.setVisible(false);
    this.isVisible = false;
    this.isAnimating = false;
    this.isTyping = false;
    this.clearChoices();
  }
}
