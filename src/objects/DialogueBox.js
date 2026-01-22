// DialogueBox - Pokemon-style dialogue with typewriter effect

import { GAME_CONFIG } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { getPalette } from '../utils/GBGraphics.js';

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
    const p = getPalette();
    const darkHex = '#' + p.darkest.toString(16).padStart(6, '0');
    const lightHex = '#' + p.lightest.toString(16).padStart(6, '0');

    // Container for all dialogue elements
    this.container = this.scene.add.container(this.x, this.y);

    // Draw Pokemon-style dialog box
    this.background = this.scene.add.graphics();
    this.drawPokemonBox();

    this.container.add(this.background);

    // Name tag (Pokemon style - sits on top border)
    this.nameTag = this.scene.add.text(8, -8, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '10px',
      color: darkHex,
      backgroundColor: lightHex,
      padding: { x: 4, y: 2 },
    });
    this.container.add(this.nameTag);

    // Main text content - larger for readability
    this.textContent = this.scene.add.text(10, 12, '', {
      fontFamily: 'Press Start 2P',
      fontSize: '10px',
      color: darkHex,
      wordWrap: { width: this.width - 20 },
      lineSpacing: 8,
    });
    this.container.add(this.textContent);

    // Continue indicator (blinking triangle - Pokemon style)
    this.indicator = this.scene.add.graphics();
    this.drawIndicator();
    this.indicator.setPosition(this.width - 16, this.height - 14);
    this.indicator.setVisible(false);
    this.container.add(this.indicator);

    // Classic blink (not smooth fade)
    this.scene.time.addEvent({
      delay: 300,
      callback: () => {
        if (this.indicator.visible) {
          this.indicator.alpha = this.indicator.alpha === 1 ? 0 : 1;
        }
      },
      loop: true,
    });

    this.hide();
  }

  drawPokemonBox() {
    const p = getPalette();
    const w = this.width;
    const h = this.height;

    this.background.clear();

    // White fill
    this.background.fillStyle(p.lightest);
    this.background.fillRect(0, 0, w, h);

    // Black 2px border (clean Pokemon style)
    this.background.lineStyle(2, p.darkest);
    this.background.strokeRect(1, 1, w - 2, h - 2);
  }

  drawIndicator() {
    const p = getPalette();
    this.indicator.clear();
    this.indicator.fillStyle(p.darkest);
    // Small triangle pointing down
    this.indicator.fillTriangle(0, 0, 8, 0, 4, 6);
  }

  show() {
    this.container.setVisible(true);
    this.container.setAlpha(1);
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
    this.indicator.alpha = 1;

    this.textContent.setText('');

    // Start typewriter effect (faster for Game Boy feel)
    this.typewriterTimer = this.scene.time.addEvent({
      delay: 25, // Faster typewriter
      callback: this.typeNextChar,
      callbackScope: this,
      repeat: text.length - 1,
    });
  }

  typeNextChar() {
    if (this.charIndex < this.currentText.length) {
      const char = this.currentText[this.charIndex];
      this.displayedText += char;
      this.textContent.setText(this.displayedText);
      this.charIndex++;

      // Play typewriter sound for non-space characters
      if (char !== ' ' && char !== '\n') {
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
