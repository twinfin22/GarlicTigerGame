// DialogueBox - RPG style dialogue with typewriter effect

import { GAME_CONFIG } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';

export class DialogueBox {
  constructor(scene, x, y, width, height) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.container = null;
    this.background = null;
    this.nameTag = null;
    this.textContent = null;
    this.indicator = null;

    this.currentText = '';
    this.displayedText = '';
    this.charIndex = 0;
    this.typewriterTimer = null;
    this.isTyping = false;
    this.onComplete = null;

    this.create();
  }

  create() {
    const { COLORS, TEXT_SIZES, FONTS } = GAME_CONFIG;

    // Container for all dialogue elements
    this.container = this.scene.add.container(this.x, this.y);

    // Background box
    this.background = this.scene.add.graphics();
    this.background.fillStyle(COLORS.BLACK, 0.95);
    this.background.fillRect(0, 0, this.width, this.height);
    this.background.lineStyle(3, COLORS.WHITE);
    this.background.strokeRect(0, 0, this.width, this.height);

    // Inner border for retro feel
    this.background.lineStyle(1, COLORS.DARK_GRAY);
    this.background.strokeRect(4, 4, this.width - 8, this.height - 8);

    this.container.add(this.background);

    // Name tag (initially hidden)
    this.nameTag = this.scene.add.text(10, -20, '', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#f0f0f0',
      backgroundColor: '#1a1a1a',
      padding: { x: 6, y: 4 },
    });
    this.container.add(this.nameTag);

    // Main text content
    this.textContent = this.scene.add.text(15, 15, '', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#f0f0f0',
      wordWrap: { width: this.width - 30 },
      lineSpacing: 8,
    });
    this.container.add(this.textContent);

    // Continue indicator (blinking triangle)
    this.indicator = this.scene.add.text(this.width - 25, this.height - 20, '▼', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#f0f0f0',
    });
    this.indicator.setVisible(false);
    this.container.add(this.indicator);

    // Blinking animation for indicator
    this.scene.tweens.add({
      targets: this.indicator,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.hide();
  }

  show() {
    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200,
    });
  }

  hide() {
    this.container.setVisible(false);
  }

  setName(name) {
    if (name) {
      this.nameTag.setText(name);
      this.nameTag.setVisible(true);
    } else {
      this.nameTag.setVisible(false);
    }
  }

  // Show text with typewriter effect
  showText(text, speakerName = null, onComplete = null) {
    this.show();
    this.setName(speakerName);
    this.currentText = text;
    this.displayedText = '';
    this.charIndex = 0;
    this.onComplete = onComplete;
    this.isTyping = true;
    this.indicator.setVisible(false);

    this.textContent.setText('');

    // Start typewriter effect
    this.typewriterTimer = this.scene.time.addEvent({
      delay: GAME_CONFIG.SETTINGS.TYPEWRITER_SPEED,
      callback: this.typeNextChar,
      callbackScope: this,
      repeat: text.length - 1,
    });
  }

  typeNextChar() {
    if (this.charIndex < this.currentText.length) {
      this.displayedText += this.currentText[this.charIndex];
      this.textContent.setText(this.displayedText);
      this.charIndex++;

      // Play typewriter sound occasionally
      if (this.charIndex % 2 === 0 && this.currentText[this.charIndex - 1] !== ' ') {
        audioManager.playTypewriter();
      }
    }

    if (this.charIndex >= this.currentText.length) {
      this.finishTyping();
    }
  }

  // Skip to end of text
  skipToEnd() {
    if (this.isTyping) {
      if (this.typewriterTimer) {
        this.typewriterTimer.destroy();
      }
      this.displayedText = this.currentText;
      this.textContent.setText(this.displayedText);
      this.finishTyping();
    }
  }

  finishTyping() {
    this.isTyping = false;
    this.indicator.setVisible(true);
    if (this.onComplete) {
      this.onComplete();
    }
  }

  isComplete() {
    return !this.isTyping;
  }

  destroy() {
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
    }
    this.container.destroy();
  }
}
