// DialogueBox.js - Pokemon Gold style dialogue (160x32, 2 lines)
import { GAME } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { BATTLE, hexToCSS } from '../data/palettes.js';
import { drawDialogFrame, drawCursor, drawContinueIndicator } from '../utils/TileRenderer.js';

export class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    this.x = 0;
    this.y = 112;      // 144 - 32 = 112
    this.width = 160;
    this.height = 32;

    this.container = null;
    this.bgGraphics = null;
    this.textObj = null;
    this.indicatorGraphics = null;
    this.nameTag = null;

    this.pages = [];
    this.currentPage = 0;
    this.currentText = '';
    this.displayedText = '';
    this.charIndex = 0;
    this.isTyping = false;
    this.typeTimer = null;
    this.onComplete = null;
    this.visible = false;

    // Choice state
    this.selectedChoice = 0;
    this.choices = null;
    this.onChoiceSelect = null;
    this.choiceContainer = null;

    this.create();
  }

  create() {
    this.container = this.scene.add.container(this.x, this.y);
    this.container.setDepth(100);

    // Background with Pokemon Gold double-line border
    this.bgGraphics = this.scene.add.graphics();
    this._drawFrame();
    this.container.add(this.bgGraphics);

    // Name tag (optional, sits above box)
    this.nameTag = this.scene.add.text(6, -8, '', {
      fontFamily: GAME.FONT,
      fontSize: GAME.FONT_SIZE + 'px',
      color: hexToCSS(BATTLE.TEXT),
      backgroundColor: hexToCSS(BATTLE.BOX_FILL),
      padding: { x: 2, y: 1 },
    });
    this.container.add(this.nameTag);
    this.nameTag.setVisible(false);

    // Main text (2 lines, 18 chars each)
    this.textObj = this.scene.add.text(8, 6, '', {
      fontFamily: GAME.FONT,
      fontSize: GAME.FONT_SIZE + 'px',
      color: hexToCSS(BATTLE.TEXT),
      wordWrap: { width: this.width - 16 },
      lineSpacing: 4,
    });
    this.container.add(this.textObj);

    // Continue indicator (blinking down-triangle)
    this.indicatorGraphics = this.scene.add.graphics();
    drawContinueIndicator(this.indicatorGraphics, this.width - 12, this.height - 10);
    this.indicatorGraphics.setVisible(false);
    this.container.add(this.indicatorGraphics);

    // Blink timer for continue indicator
    this.scene.time.addEvent({
      delay: 300,
      callback: () => {
        if (this.indicatorGraphics.visible) {
          this.indicatorGraphics.alpha = this.indicatorGraphics.alpha === 1 ? 0 : 1;
        }
      },
      loop: true,
    });

    this.hide();
  }

  _drawFrame() {
    this.bgGraphics.clear();
    drawDialogFrame(this.bgGraphics, 0, 0, this.width, this.height);
  }

  // Split text into pages of 2 lines, ~18 chars per line
  _paginate(text) {
    const maxCharsPerLine = GAME.DIALOG_CHARS_PER_LINE;
    const maxLines = GAME.DIALOG_LINES;

    // Word-wrap into lines
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 > maxCharsPerLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    }
    if (currentLine) lines.push(currentLine);

    // Group into pages of maxLines lines
    const pages = [];
    for (let i = 0; i < lines.length; i += maxLines) {
      pages.push(lines.slice(i, i + maxLines).join('\n'));
    }

    return pages.length > 0 ? pages : [''];
  }

  show() {
    this.container.setVisible(true);
    this.visible = true;
  }

  hide() {
    this.container.setVisible(false);
    this.visible = false;
    if (this.typeTimer) {
      this.typeTimer.destroy();
      this.typeTimer = null;
    }
  }

  showText(text, speaker = null, onComplete = null) {
    this.show();
    this.onComplete = onComplete;

    // Set speaker name
    if (speaker) {
      this.nameTag.setText(speaker);
      this.nameTag.setVisible(true);
    } else {
      this.nameTag.setVisible(false);
    }

    // Paginate text
    this.pages = this._paginate(text);
    this.currentPage = 0;
    this._showPage(this.pages[0]);
  }

  _showPage(pageText) {
    this.currentText = pageText;
    this.displayedText = '';
    this.charIndex = 0;
    this.isTyping = true;
    this.indicatorGraphics.setVisible(false);
    this.indicatorGraphics.alpha = 1;
    this.textObj.setText('');

    if (this.typeTimer) this.typeTimer.destroy();

    this.typeTimer = this.scene.time.addEvent({
      delay: GAME.TYPEWRITER_MS,
      callback: () => this._typeNextChar(),
      loop: true,
    });
  }

  _typeNextChar() {
    if (this.charIndex < this.currentText.length) {
      const char = this.currentText[this.charIndex];
      this.displayedText += char;
      this.textObj.setText(this.displayedText);
      this.charIndex++;

      if (char !== ' ' && char !== '\n') {
        audioManager.playTypewriter();
      }
    } else {
      this._finishTyping();
    }
  }

  _finishTyping() {
    this.isTyping = false;
    if (this.typeTimer) {
      this.typeTimer.destroy();
      this.typeTimer = null;
    }
    this.textObj.setText(this.currentText);
    this.indicatorGraphics.setVisible(true);
  }

  // Called when player presses A/tap
  advance() {
    if (this.isTyping) {
      // Skip to end of current page
      this.skipToEnd();
      return true; // consumed input
    }

    // Advance to next page
    this.currentPage++;
    if (this.currentPage < this.pages.length) {
      this._showPage(this.pages[this.currentPage]);
      return true; // consumed input
    }

    // All pages done
    this.indicatorGraphics.setVisible(false);
    if (this.onComplete) {
      this.onComplete();
    }
    return false; // input not consumed, caller should proceed
  }

  skipToEnd() {
    if (this.typeTimer) {
      this.typeTimer.destroy();
      this.typeTimer = null;
    }
    this.displayedText = this.currentText;
    this.textObj.setText(this.currentText);
    this._finishTyping();
  }

  isComplete() {
    return !this.isTyping && this.currentPage >= this.pages.length - 1;
  }

  // Show choices in the dialogue box (replaces text with selectable options)
  showChoices(items, onSelect) {
    // items: [{text, id}, ...]
    // onSelect: (selectedId) => {}
    this.show();
    this.isTyping = false;
    this.indicatorGraphics.setVisible(false);
    this.nameTag.setVisible(false);

    // Clear existing text
    this.textObj.setText('');

    this.selectedChoice = 0;
    this.choices = items;
    this.onChoiceSelect = onSelect;

    // Draw choices with cursor
    this._renderChoices();
  }

  _renderChoices() {
    if (this.choiceContainer) this.choiceContainer.destroy();

    this.choiceContainer = this.scene.add.container(0, 0);
    this.container.add(this.choiceContainer);

    const startY = 5;
    const lineH = 12;

    this.choices.forEach((choice, i) => {
      const y = startY + i * lineH;

      // Cursor arrow for selected item
      if (i === this.selectedChoice) {
        const cursorG = this.scene.add.graphics();
        drawCursor(cursorG, 4, y + 1);
        this.choiceContainer.add(cursorG);
      }

      const text = this.scene.add.text(12, y, choice.text, {
        fontFamily: GAME.FONT,
        fontSize: GAME.FONT_SIZE + 'px',
        color: hexToCSS(BATTLE.TEXT),
      });
      this.choiceContainer.add(text);
    });
  }

  moveChoice(dir) {
    if (!this.choices) return;
    this.selectedChoice += dir;
    if (this.selectedChoice < 0) this.selectedChoice = this.choices.length - 1;
    if (this.selectedChoice >= this.choices.length) this.selectedChoice = 0;
    audioManager.playSelect();
    this._renderChoices();
  }

  confirmChoice() {
    if (!this.choices || !this.onChoiceSelect) return;
    const selected = this.choices[this.selectedChoice];
    if (this.choiceContainer) {
      this.choiceContainer.destroy();
      this.choiceContainer = null;
    }
    this.onChoiceSelect(selected.id);
  }

  destroy() {
    if (this.typeTimer) this.typeTimer.destroy();
    if (this.choiceContainer) this.choiceContainer.destroy();
    if (this.container) this.container.destroy();
  }
}
