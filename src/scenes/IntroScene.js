// IntroScene - Bilingual story intro with typewriter effect (240x160 GBA native)

import Phaser from 'phaser';
import { GAME, SCENES } from '../config.js';
import { STORY_TEXT } from '../data/storyText.js';
import { audioManager } from '../utils/AudioManager.js';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.INTRO });
  }

  create() {
    // Black background
    this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.fadeIn(300);

    // State
    this.storyIndex = 0;
    this.isTyping = false;
    this.typewriterTimer = null;
    this.skipRequested = false;
    this.transitioning = false;

    // Text objects (reused each entry)
    this.koText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 - 12, '', {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '9px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: GAME.WIDTH - 40 },
    }).setOrigin(0.5).setAlpha(0);

    this.enText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 + 10, '', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: '#AAAAAA',
      align: 'center',
      wordWrap: { width: GAME.WIDTH - 40 },
    }).setOrigin(0.5).setAlpha(0);

    // "Skip" hint at bottom-right
    this.add.text(GAME.WIDTH - 8, GAME.HEIGHT - 6, 'ESC TO SKIP', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '5px',
      color: '#555555',
    }).setOrigin(1, 1);

    // Track rapid presses for skip-all detection
    this._skipPressCount = 0;
    this._skipPressTimer = null;

    // Input: skip / advance
    const handleInput = () => {
      audioManager.resume();
      if (this.transitioning) return;

      if (this.isTyping) {
        // Skip typewriter animation — show full text immediately
        this.skipRequested = true;
      } else {
        // Advance to next story entry
        this.advanceStory();
      }
    };

    // Skip entire intro on Escape / X key
    const handleSkipAll = (event) => {
      const key = event.key || event.code;
      if (key === 'Escape' || key === 'x' || key === 'X') {
        audioManager.resume();
        if (!this.transitioning) {
          this.transitionToOverworld();
        }
      }
    };

    this.input.keyboard.on('keydown', handleInput);
    this.input.keyboard.on('keydown', handleSkipAll);
    this.input.on('pointerdown', handleInput);

    this.events.once('shutdown', () => {
      this.input.keyboard.off('keydown', handleInput);
      this.input.keyboard.off('keydown', handleSkipAll);
      this.input.off('pointerdown', handleInput);
      if (this.typewriterTimer) {
        this.typewriterTimer.destroy();
        this.typewriterTimer = null;
      }
    });

    // Start showing the first entry after a short delay
    this.time.delayedCall(400, () => {
      this.showStoryEntry();
    });
  }

  showStoryEntry() {
    if (this.storyIndex >= STORY_TEXT.length) {
      this.transitionToOverworld();
      return;
    }

    const entry = STORY_TEXT[this.storyIndex];

    // null entry = 1-second pause (blank screen)
    if (entry.ko === null && entry.en === null) {
      this.koText.setAlpha(0);
      this.enText.setAlpha(0);
      this.isTyping = false;
      this.time.delayedCall(1000, () => {
        this.storyIndex++;
        this.showStoryEntry();
      });
      return;
    }

    const koFull = entry.ko || '';
    const enFull = entry.en || '';

    // Check for the "4000 years" flash trigger
    const shouldFlash = koFull.includes('4000년이 지났다');

    if (shouldFlash) {
      this.triggerScreenFlash();
    }

    // Reset text
    this.koText.setText('').setAlpha(1);
    this.enText.setText('').setAlpha(0);

    // Typewriter effect for Korean text
    this.isTyping = true;
    this.skipRequested = false;
    let charIndex = 0;

    this.typewriterTimer = this.time.addEvent({
      delay: GAME.TYPEWRITER_MS,
      callback: () => {
        if (this.skipRequested) {
          // Skip to full text
          this.koText.setText(koFull);
          this.enText.setText(enFull).setAlpha(1);
          this.isTyping = false;
          if (this.typewriterTimer) {
            this.typewriterTimer.destroy();
            this.typewriterTimer = null;
          }
          return;
        }

        charIndex++;
        this.koText.setText(koFull.substring(0, charIndex));

        // Play typewriter tick every few chars
        if (charIndex % 2 === 0) {
          audioManager.playTypewriter();
        }

        if (charIndex >= koFull.length) {
          // Korean text done — show English text with fade
          this.enText.setText(enFull);
          this.tweens.add({
            targets: this.enText,
            alpha: 1,
            duration: 200,
          });
          this.isTyping = false;
          if (this.typewriterTimer) {
            this.typewriterTimer.destroy();
            this.typewriterTimer = null;
          }
        }
      },
      repeat: koFull.length - 1,
    });
  }

  advanceStory() {
    // Fade out current text, then show next
    this.tweens.add({
      targets: [this.koText, this.enText],
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.storyIndex++;
        this.showStoryEntry();
      },
    });
  }

  triggerScreenFlash() {
    // White flash overlay
    const flash = this.add.rectangle(
      GAME.WIDTH / 2, GAME.HEIGHT / 2,
      GAME.WIDTH, GAME.HEIGHT,
      0xFFFFFF
    ).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: flash,
      alpha: 1,
      duration: 100,
      yoyo: true,
      hold: 80,
      onComplete: () => {
        flash.destroy();
      },
    });
  }

  transitionToOverworld() {
    if (this.transitioning) return;
    this.transitioning = true;

    // Fade out all text
    this.tweens.add({
      targets: [this.koText, this.enText],
      alpha: 0,
      duration: 300,
    });

    // Brief "The Journey Begins..." text
    const journeyKo = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 - 8, '여정이 시작된다...', {
      fontFamily: `'${GAME.FONT_KO}', sans-serif`,
      fontSize: '9px',
      color: '#FFFFFF',
    }).setOrigin(0.5).setAlpha(0);

    const journeyEn = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2 + 8, 'The Journey Begins...', {
      fontFamily: `'${GAME.FONT_EN}', ${GAME.FONT_FALLBACK}`,
      fontSize: '7px',
      color: '#AAAAAA',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: [journeyKo, journeyEn],
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        this.cameras.main.fadeOut(500);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.OVERWORLD);
        });
      },
    });
  }
}
