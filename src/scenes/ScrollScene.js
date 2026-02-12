// ScrollScene - Final scroll absorption and email capture
// Phase flow: walking -> absorbing -> captured -> form -> final

import Phaser from 'phaser';
import { GAME, SCENES, BRANDING } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { shareManager } from '../utils/ShareManager.js';
import { inputHandler } from '../utils/InputHandler.js';
import { BG_PALETTES, BATTLE, hexToCSS } from '../data/palettes.js';
import { drawTigerAtStage, drawDialogFrame } from '../utils/TileRenderer.js';

// Palette shortcuts
const CREAM = 0xF0E0D0;
const BLACK = 0x383838;
const DARK_BG = 0x383838;
const SCROLL_CREAM = 0xF0E0D0;
const GRAY_MID = 0x989898;
const GRAY_LIGHT = 0x686868;

export class ScrollScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.SCROLL });
    this.phase = 'walking';
    this.sparkleGraphics = [];
    this.emailInput = null;
    this.scrollContainer = null;
    this.scrollGlow = null;
    this.tigerContainer = null;
    this.instructionText = null;
    this.messageText = null;
  }

  create() {
    this.phase = 'walking';
    this.sparkleGraphics = [];

    // Dark background
    this.cameras.main.setBackgroundColor(DARK_BG);
    this.cameras.main.fadeIn(500);

    // Draw the mystical room environment
    this.drawMysticalRoom();

    // Create glowing scroll at top center
    this.createGlowingScroll(GAME.WIDTH / 2, 36);

    // Create tiger (stage 5) at bottom center
    this.tigerContainer = this.add.container(GAME.WIDTH / 2, GAME.HEIGHT - 28);
    const tigerG = drawTigerAtStage(this, -8, -12, 5);
    this.tigerContainer.add(tigerG);

    // Blinking "Tap to approach" instruction
    this.instructionText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 8, 'Tap to approach', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: hexToCSS(CREAM),
    }).setOrigin(0.5);

    this.time.addEvent({
      delay: 500,
      callback: () => {
        if (this.instructionText && this.instructionText.active) {
          this.instructionText.visible = !this.instructionText.visible;
        }
      },
      loop: true,
    });

    // Input handling
    this.input.on('pointerdown', () => this.handleInput());
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', () => this.handleInput());
      this.input.keyboard.on('keydown-ENTER', () => this.handleInput());
    }

    // Clean up HTML elements on scene shutdown
    this.events.on('shutdown', () => this.cleanup());
    this.events.on('destroy', () => this.cleanup());
  }

  // ========================================
  // PHASE 1: Mystical Room
  // ========================================

  drawMysticalRoom() {
    const g = this.add.graphics();

    // Floor area (lower 40% of screen)
    const floorY = Math.floor(GAME.HEIGHT * 0.6);
    g.fillStyle(GRAY_LIGHT);
    g.fillRect(0, floorY, GAME.WIDTH, GAME.HEIGHT - floorY);

    // Floor tile grid lines
    g.lineStyle(1, BLACK);
    for (let x = 0; x < GAME.WIDTH; x += 16) {
      g.lineBetween(x, floorY, x, GAME.HEIGHT);
    }
    for (let y = floorY; y < GAME.HEIGHT; y += 16) {
      g.lineBetween(0, y, GAME.WIDTH, y);
    }

    // Left pillar
    g.fillStyle(GRAY_MID);
    g.fillRect(0, 0, 10, floorY);
    g.lineStyle(1, BLACK);
    g.lineBetween(10, 0, 10, floorY);
    // Pillar detail lines
    g.fillStyle(GRAY_LIGHT);
    g.fillRect(2, 4, 6, 2);
    g.fillRect(2, floorY - 6, 6, 2);

    // Right pillar
    g.fillStyle(GRAY_MID);
    g.fillRect(GAME.WIDTH - 10, 0, 10, floorY);
    g.lineStyle(1, BLACK);
    g.lineBetween(GAME.WIDTH - 10, 0, GAME.WIDTH - 10, floorY);
    g.fillStyle(GRAY_LIGHT);
    g.fillRect(GAME.WIDTH - 8, 4, 6, 2);
    g.fillRect(GAME.WIDTH - 8, floorY - 6, 6, 2);

    // Light rays from scroll position (subtle triangles)
    const rayG = this.add.graphics();
    rayG.fillStyle(CREAM, 0.08);
    rayG.fillTriangle(
      GAME.WIDTH / 2, 20,
      GAME.WIDTH / 2 - 50, floorY,
      GAME.WIDTH / 2 + 50, floorY
    );

    // Korean symbols on the walls
    const symbols = ['\uCC9C', '\uC9C0', '\uC778', '\uD654']; // 천 지 인 화
    symbols.forEach((s, i) => {
      const sx = 18 + i * 34;
      this.add.text(sx, 16, s, {
        fontFamily: GAME.FONT,
        fontSize: '8px',
        color: hexToCSS(GRAY_LIGHT),
      });
    });
  }

  // ========================================
  // Glowing Scroll
  // ========================================

  createGlowingScroll(x, y) {
    this.scrollContainer = this.add.container(x, y);

    // Outer glow (pulsing circle)
    this.scrollGlow = this.add.graphics();
    this.scrollGlow.fillStyle(CREAM, 0.25);
    this.scrollGlow.fillCircle(0, 0, 22);
    this.scrollContainer.add(this.scrollGlow);

    // Inner glow
    const innerGlow = this.add.graphics();
    innerGlow.fillStyle(GRAY_MID, 0.4);
    innerGlow.fillCircle(0, 0, 15);
    this.scrollContainer.add(innerGlow);

    // Scroll body (cream rectangle)
    const scrollBody = this.add.graphics();
    scrollBody.fillStyle(CREAM);
    scrollBody.fillRect(-18, -10, 36, 20);
    this.scrollContainer.add(scrollBody);

    // Roll caps (top and bottom bars)
    const rolls = this.add.graphics();
    rolls.fillStyle(GRAY_MID);
    rolls.fillRect(-20, -12, 40, 3);
    rolls.fillRect(-20, 9, 40, 3);
    // End cap circles
    rolls.fillStyle(GRAY_LIGHT);
    rolls.fillCircle(-20, -10, 2);
    rolls.fillCircle(20, -10, 2);
    rolls.fillCircle(-20, 10, 2);
    rolls.fillCircle(20, 10, 2);
    this.scrollContainer.add(rolls);

    // Inner text on scroll
    const scrollText = this.add.text(0, 0, '\uD55C\uAD6D\uC758 \uBE44\uBC00', { // 한국의 비밀
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: hexToCSS(BLACK),
    }).setOrigin(0.5);
    this.scrollContainer.add(scrollText);

    // Pulsing glow animation
    this.tweens.add({
      targets: this.scrollGlow,
      alpha: 0.08,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Floating animation
    this.tweens.add({
      targets: this.scrollContainer,
      y: y - 3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Pixel-art cross sparkles around scroll
    this.createSparkles(x, y);
  }

  createSparkles(cx, cy) {
    for (let i = 0; i < 8; i++) {
      const sx = cx + Phaser.Math.Between(-28, 28);
      const sy = cy + Phaser.Math.Between(-18, 18);

      // Pixel-art cross pattern (vertical + horizontal)
      const sparkle = this.add.graphics();
      sparkle.fillStyle(CREAM);
      sparkle.fillRect(0, -1, 1, 3); // vertical
      sparkle.fillRect(-1, 0, 3, 1); // horizontal
      sparkle.setPosition(sx, sy);

      this.tweens.add({
        targets: sparkle,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 800,
        delay: i * 200,
        yoyo: true,
        repeat: -1,
      });

      this.sparkleGraphics.push(sparkle);
    }
  }

  // ========================================
  // Input Handling
  // ========================================

  handleInput() {
    audioManager.resume();

    switch (this.phase) {
      case 'walking':
        this.startWalking();
        break;
      case 'absorbing':
        // Wait for animation to complete
        break;
      case 'captured':
        this.showEmailForm();
        break;
      case 'form':
        // Form handles its own input via HTML elements and buttons
        break;
      default:
        break;
    }
  }

  // ========================================
  // PHASE 2: Scroll Absorption
  // ========================================

  startWalking() {
    this.phase = 'absorbing';

    // Remove instruction text
    if (this.instructionText) {
      this.instructionText.destroy();
      this.instructionText = null;
    }

    audioManager.playWalk();

    // Tiger walks up to scroll position
    this.tweens.add({
      targets: this.tigerContainer,
      y: GAME.HEIGHT / 2 + 16,
      duration: 1500,
      ease: 'Linear',
      onComplete: () => this.absorbScroll(),
    });
  }

  absorbScroll() {
    const tigerY = GAME.HEIGHT / 2 + 16;

    audioManager.playCorrect();

    // Flash effect (full screen white flash)
    const flash = this.add.rectangle(
      GAME.WIDTH / 2, GAME.HEIGHT / 2,
      GAME.WIDTH, GAME.HEIGHT,
      CREAM, 0.8
    );
    flash.setDepth(10);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    // Scroll shrinks into tiger
    this.tweens.add({
      targets: this.scrollContainer,
      y: tigerY,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
    });

    // Sparkles fly into tiger
    this.sparkleGraphics.forEach((sparkle, i) => {
      this.tweens.add({
        targets: sparkle,
        x: GAME.WIDTH / 2,
        y: tigerY,
        alpha: 0,
        duration: 600,
        delay: i * 50,
      });
    });

    // Tiger glow effect after scroll absorbed
    this.time.delayedCall(800, () => {
      this.tigerGlowEffect(tigerY);
    });
  }

  tigerGlowEffect(tigerY) {
    // Expanding glow circle around tiger
    const glow = this.add.graphics();
    glow.fillStyle(CREAM, 0.5);
    glow.fillCircle(GAME.WIDTH / 2, tigerY, 20);

    this.tweens.add({
      targets: glow,
      alpha: 0,
      scaleX: 2.5,
      scaleY: 2.5,
      duration: 1000,
      onComplete: () => {
        glow.destroy();
        this.showCapturedMessage();
      },
    });
  }

  // ========================================
  // PHASE 3: Message Display
  // ========================================

  showCapturedMessage() {
    this.phase = 'captured';

    // Dialogue-style message box at bottom of screen
    const boxX = 4;
    const boxY = GAME.HEIGHT - 40;
    const boxW = GAME.WIDTH - 8;
    const boxH = 36;

    const boxG = this.add.graphics();
    drawDialogFrame(boxG, boxX, boxY, boxW, boxH);

    // Message text inside the dialog box
    this.add.text(GAME.WIDTH / 2, boxY + 10, "The scroll's knowledge", {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: hexToCSS(BATTLE.TEXT),
    }).setOrigin(0.5);

    this.add.text(GAME.WIDTH / 2, boxY + 22, 'flows into you!', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: hexToCSS(BATTLE.TEXT),
    }).setOrigin(0.5);

    // Blinking continue indicator (down triangle)
    const indicator = this.add.graphics();
    indicator.fillStyle(BATTLE.TEXT);
    indicator.fillTriangle(
      boxX + boxW - 10, boxY + boxH - 8,
      boxX + boxW - 6, boxY + boxH - 8,
      boxX + boxW - 8, boxY + boxH - 4
    );

    this.tweens.add({
      targets: indicator,
      alpha: 0.3,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });
  }

  // ========================================
  // PHASE 4: Email Capture Form
  // ========================================

  showEmailForm() {
    this.phase = 'form';
    audioManager.playSelect();

    // Clear all game objects
    this.children.removeAll();

    // Remove any leftover email input
    if (this.emailInput) {
      this.emailInput.remove();
      this.emailInput = null;
    }

    // Dark background with cream border
    this.cameras.main.setBackgroundColor(DARK_BG);

    const border = this.add.graphics();
    border.lineStyle(2, CREAM);
    border.strokeRect(4, 4, GAME.WIDTH - 8, GAME.HEIGHT - 8);

    // "SACRED SCROLL" title (y~12)
    this.add.text(GAME.WIDTH / 2, 12, 'SACRED SCROLL', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: hexToCSS(CREAM),
    }).setOrigin(0.5);

    // "K-Digital Guide" subtitle (y~24)
    this.add.text(GAME.WIDTH / 2, 24, 'K-Digital Guide', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: hexToCSS(GRAY_MID),
    }).setOrigin(0.5);

    // Small scroll icon (y~34)
    const scrollIcon = this.add.graphics();
    scrollIcon.fillStyle(CREAM);
    scrollIcon.fillRect(GAME.WIDTH / 2 - 10, 32, 20, 12);
    scrollIcon.fillStyle(GRAY_MID);
    scrollIcon.fillRect(GAME.WIDTH / 2 - 12, 31, 24, 2);
    scrollIcon.fillRect(GAME.WIDTH / 2 - 12, 43, 24, 2);

    // "Receive the Sacred Scroll?" prompt (y~48)
    this.add.text(GAME.WIDTH / 2, 52, 'Receive the', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: hexToCSS(CREAM),
    }).setOrigin(0.5);

    this.add.text(GAME.WIDTH / 2, 62, 'Sacred Scroll?', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: hexToCSS(CREAM),
    }).setOrigin(0.5);

    // Email input area
    this.createInGameEmailForm();
  }

  createInGameEmailForm() {
    const inputY = 78;

    // Email input box background: cream fill, black border
    const inputBox = this.add.graphics();
    inputBox.fillStyle(CREAM);
    inputBox.fillRect(12, inputY - 6, GAME.WIDTH - 24, 12);
    inputBox.lineStyle(1, BLACK);
    inputBox.strokeRect(12, inputY - 6, GAME.WIDTH - 24, 12);

    // Create HTML email input overlaid on canvas
    this.createEmailInput(inputY);

    // "GET ACCESS" button
    this.createButton(GAME.WIDTH / 2, inputY + 20, 'GET ACCESS', () => {
      this.submitEmailForm();
    });

    // "SKIP" button
    this.createButton(GAME.WIDTH / 2, inputY + 36, 'SKIP', () => {
      if (this.emailInput) {
        this.emailInput.remove();
        this.emailInput = null;
      }
      this.showFinalScreen();
    });

    // "No spam, ever." text
    this.add.text(GAME.WIDTH / 2, inputY + 50, 'No spam, ever.', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: hexToCSS(GRAY_MID),
    }).setOrigin(0.5);

    // "Unsubscribe anytime." text
    this.add.text(GAME.WIDTH / 2, inputY + 60, 'Unsubscribe anytime.', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: hexToCSS(GRAY_MID),
    }).setOrigin(0.5);
  }

  createEmailInput(y) {
    const canvas = this.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / GAME.WIDTH;
    const scaleY = rect.height / GAME.HEIGHT;

    const input = document.createElement('input');
    input.type = 'email';
    input.id = 'scroll-email';
    input.placeholder = 'your@email.com';
    input.style.position = 'fixed';
    input.style.left = (rect.left + 12 * scaleX) + 'px';
    input.style.top = (rect.top + (y - 5) * scaleY) + 'px';
    input.style.width = ((GAME.WIDTH - 24) * scaleX) + 'px';
    input.style.height = (10 * scaleY) + 'px';
    input.style.padding = '2px 4px';
    input.style.border = 'none';
    input.style.background = 'transparent';
    input.style.color = '#383838';
    input.style.fontFamily = "'Press Start 2P', monospace";
    input.style.fontSize = (6 * scaleY) + 'px';
    input.style.outline = 'none';
    input.style.zIndex = '1000';

    document.body.appendChild(input);
    this.emailInput = input;
    this.time.delayedCall(100, () => input.focus());

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.submitEmailForm();
    });
  }

  createButton(x, y, text, callback) {
    const btnW = 70;
    const btnH = 12;
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(GRAY_MID);
    bg.fillRect(-btnW / 2, -btnH / 2, btnW, btnH);
    bg.lineStyle(1, BLACK);
    bg.strokeRect(-btnW / 2, -btnH / 2, btnW, btnH);
    container.add(bg);

    const btnText = this.add.text(0, 0, text, {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: hexToCSS(CREAM),
    }).setOrigin(0.5);
    container.add(btnText);

    container.setSize(btnW, btnH);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(CREAM);
      bg.fillRect(-btnW / 2, -btnH / 2, btnW, btnH);
      bg.lineStyle(1, BLACK);
      bg.strokeRect(-btnW / 2, -btnH / 2, btnW, btnH);
      btnText.setColor(hexToCSS(BLACK));
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(GRAY_MID);
      bg.fillRect(-btnW / 2, -btnH / 2, btnW, btnH);
      bg.lineStyle(1, BLACK);
      bg.strokeRect(-btnW / 2, -btnH / 2, btnW, btnH);
      btnText.setColor(hexToCSS(CREAM));
    });

    container.on('pointerdown', () => {
      audioManager.playSelect();
      callback();
    });

    return container;
  }

  // ========================================
  // Email Submission
  // ========================================

  submitEmailForm() {
    const email = this.emailInput ? this.emailInput.value : '';

    if (!email || !email.includes('@')) {
      this.showInGameMessage('Enter valid email!', false);
      return;
    }

    this.sendToAirtable(email);
  }

  async sendToAirtable(email) {
    const API_ENDPOINT = '/api/subscribe';
    try {
      this.showInGameMessage('Sending...', true);
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'garlic-tiger-game' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed');

      if (this.emailInput) {
        this.emailInput.remove();
        this.emailInput = null;
      }
      audioManager.playCorrect();
      this.showInGameMessage('Scroll sent!', true);
      this.time.delayedCall(1500, () => this.showFinalScreen());
    } catch (error) {
      console.error('Subscription error:', error);
      this.showInGameMessage('Error! Try again.', false);
    }
  }

  showInGameMessage(text, success) {
    // Remove previous message if any
    if (this.messageText) {
      this.messageText.destroy();
      this.messageText = null;
    }

    const textColor = success ? hexToCSS(CREAM) : hexToCSS(0xF05030);
    const bgColor = hexToCSS(BLACK);

    this.messageText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, text, {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: textColor,
      backgroundColor: bgColor,
      padding: { x: 4, y: 3 },
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: this.messageText,
      alpha: 0,
      duration: 300,
      delay: 1200,
      onComplete: () => {
        if (this.messageText) {
          this.messageText.destroy();
          this.messageText = null;
        }
      },
    });
  }

  // ========================================
  // PHASE 5: Final Screen
  // ========================================

  showFinalScreen() {
    // Remove email input if still present
    if (this.emailInput) {
      this.emailInput.remove();
      this.emailInput = null;
    }

    // Clear all game objects
    this.children.removeAll();
    this.cameras.main.setBackgroundColor(DARK_BG);

    // Cream border
    const border = this.add.graphics();
    border.lineStyle(2, CREAM);
    border.strokeRect(4, 4, GAME.WIDTH - 8, GAME.HEIGHT - 8);

    // "CONGRATULATIONS!" title
    this.add.text(GAME.WIDTH / 2, 16, 'CONGRATULATIONS!', {
      fontFamily: GAME.FONT,
      fontSize: '8px',
      color: hexToCSS(CREAM),
    }).setOrigin(0.5);

    // "You are now Korean!" subtitle
    this.add.text(GAME.WIDTH / 2, 28, 'You are now Korean!', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: hexToCSS(GRAY_MID),
    }).setOrigin(0.5);

    // Tiger sprite (stage 5, centered)
    const tigerX = GAME.WIDTH / 2 - 8;
    const tigerY = 42;
    drawTigerAtStage(this, tigerX, tigerY, 5);

    // Pixel sparkles around tiger
    for (let i = 0; i < 6; i++) {
      const sparkle = this.add.graphics();
      sparkle.fillStyle(CREAM);
      const sx = GAME.WIDTH / 2 + Phaser.Math.Between(-24, 24);
      const sy = tigerY + 8 + Phaser.Math.Between(-16, 16);
      sparkle.fillRect(sx, sy - 1, 1, 3);    // vertical
      sparkle.fillRect(sx - 1, sy, 3, 1);    // horizontal

      this.tweens.add({
        targets: sparkle,
        alpha: 0.3,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 600,
        delay: i * 100,
        yoyo: true,
        repeat: -1,
      });
    }

    // "SHARE VICTORY" button
    this.createButton(GAME.WIDTH / 2, 84, 'SHARE VICTORY', async () => {
      const result = await shareManager.shareWithStage(5, 5);
      if (result.success) {
        this.showInGameMessage('Shared!', true);
      }
    });

    // "PLAY AGAIN" button
    this.createButton(GAME.WIDTH / 2, 100, 'PLAY AGAIN', () => {
      this.scene.start(SCENES.TITLE);
    });

    // "localnomad.club" branding link at bottom
    const brandText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT - 12, 'localnomad.club', {
      fontFamily: GAME.FONT,
      fontSize: '6px',
      color: hexToCSS(GRAY_LIGHT),
    }).setOrigin(0.5);

    brandText.setInteractive({ useHandCursor: true });
    brandText.on('pointerdown', () => {
      window.open(BRANDING.URL, '_blank');
    });
  }

  // ========================================
  // Cleanup
  // ========================================

  cleanup() {
    if (this.emailInput) {
      this.emailInput.remove();
      this.emailInput = null;
    }
  }

  shutdown() {
    this.cleanup();
  }
}
