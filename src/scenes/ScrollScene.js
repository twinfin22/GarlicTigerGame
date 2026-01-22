// ScrollScene - Final scene with glowing scroll and email capture

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { shareManager } from '../utils/ShareManager.js';
import { getPalette } from '../utils/GBGraphics.js';

export class ScrollScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.SCROLL });
    this.phase = 'walking'; // walking, absorbing, captured, form
    this.tiger = null;
    this.scroll = null;
    this.glowParticles = [];
  }

  create() {
    const { width, height } = this.scale;
    const p = getPalette();

    this.phase = 'walking';

    // Mystical background
    this.cameras.main.setBackgroundColor(p.darkest);
    this.cameras.main.fadeIn(500);

    // Draw mystical room
    this.drawMysticalRoom();

    // Create glowing scroll at top
    this.createGlowingScroll(width / 2, 70);

    // Create tiger at bottom (will walk up)
    this.tiger = this.createTiger(width / 2, height - 50);

    // Instructions
    this.instructionText = this.add.text(width / 2, height - 20, 'Press SPACE to approach', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '7px',
      color: '#' + p.light.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    // Blink instruction
    this.time.addEvent({
      delay: 500,
      callback: () => {
        if (this.instructionText) {
          this.instructionText.visible = !this.instructionText.visible;
        }
      },
      loop: true,
    });

    // Input
    this.input.on('pointerdown', () => this.handleInput());
    this.input.keyboard.on('keydown-SPACE', () => this.handleInput());
    this.input.keyboard.on('keydown-ENTER', () => this.handleInput());
  }

  drawMysticalRoom() {
    const { width, height } = this.scale;
    const p = getPalette();
    const g = this.add.graphics();

    // Floor gradient effect
    g.fillStyle(p.dark);
    g.fillRect(0, height * 0.6, width, height * 0.4);

    // Floor tiles
    g.lineStyle(1, p.darkest);
    for (let x = 0; x < width; x += 32) {
      g.lineBetween(x, height * 0.6, x, height);
    }

    // Side walls/pillars
    g.fillStyle(p.dark);
    g.fillRect(0, 0, 15, height * 0.6);
    g.fillRect(width - 15, 0, 15, height * 0.6);

    // Light rays from scroll position
    g.fillStyle(p.light);
    g.alpha = 0.1;
    g.fillTriangle(width / 2, 40, width / 2 - 80, height * 0.6, width / 2 + 80, height * 0.6);
    g.alpha = 1;

    // Mystical symbols on walls
    const darkHex = '#' + p.dark.toString(16).padStart(6, '0');
    const symbols = ['?', '?', '?', '?'];
    symbols.forEach((s, i) => {
      this.add.text(30 + i * 65, 30, s, {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '8px',
        color: darkHex,
      });
    });
  }

  createGlowingScroll(x, y) {
    const p = getPalette();

    // Scroll container
    this.scrollContainer = this.add.container(x, y);

    // Outer glow (pulsing)
    this.scrollGlow = this.add.graphics();
    this.scrollGlow.fillStyle(p.lightest, 0.3);
    this.scrollGlow.fillCircle(0, 0, 45);
    this.scrollContainer.add(this.scrollGlow);

    // Inner glow
    const innerGlow = this.add.graphics();
    innerGlow.fillStyle(p.light, 0.5);
    innerGlow.fillCircle(0, 0, 30);
    this.scrollContainer.add(innerGlow);

    // Scroll body
    const scrollBody = this.add.graphics();
    scrollBody.fillStyle(p.lightest);
    scrollBody.fillRect(-35, -20, 70, 40);
    this.scrollContainer.add(scrollBody);

    // Scroll rolls (top and bottom)
    const rolls = this.add.graphics();
    rolls.fillStyle(p.light);
    rolls.fillRect(-40, -23, 80, 6);
    rolls.fillRect(-40, 17, 80, 6);
    // End caps
    rolls.fillStyle(p.dark);
    rolls.fillCircle(-40, -20, 4);
    rolls.fillCircle(40, -20, 4);
    rolls.fillCircle(-40, 20, 4);
    rolls.fillCircle(40, 20, 4);
    this.scrollContainer.add(rolls);

    // Scroll content hint (Korean text)
    const scrollText = this.add.text(0, 0, '?????', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: '#' + p.darkest.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);
    this.scrollContainer.add(scrollText);

    // Glow animation
    this.tweens.add({
      targets: this.scrollGlow,
      alpha: 0.1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Floating animation
    this.tweens.add({
      targets: this.scrollContainer,
      y: y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Sparkle particles
    this.createSparkles(x, y);
  }

  createSparkles(x, y) {
    const p = getPalette();

    for (let i = 0; i < 8; i++) {
      const sparkle = this.add.star(
        x + Phaser.Math.Between(-40, 40),
        y + Phaser.Math.Between(-30, 30),
        4, 1, 3,
        p.lightest
      );

      this.tweens.add({
        targets: sparkle,
        alpha: 0,
        scale: 0,
        duration: 800,
        delay: i * 200,
        yoyo: true,
        repeat: -1,
      });

      this.glowParticles.push(sparkle);
    }
  }

  createTiger(x, y) {
    const p = getPalette();
    const container = this.add.container(x, y);

    const g = this.add.graphics();

    // Final form tiger (Korean - black hair, tall)
    const bodyHeight = 24;
    const bodyWidth = 14;

    // Body
    g.fillStyle(p.lightest);
    g.fillRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);

    // Head (black hair)
    g.fillStyle(p.dark);
    g.fillRect(-8, -bodyHeight / 2 - 12, 16, 12);

    // Eyes
    g.fillStyle(p.darkest);
    g.fillRect(-5, -bodyHeight / 2 - 8, 3, 3);
    g.fillRect(2, -bodyHeight / 2 - 8, 3, 3);

    // Ears
    g.fillStyle(p.dark);
    g.fillTriangle(-8, -bodyHeight / 2 - 12, -8, -bodyHeight / 2 - 18, -4, -bodyHeight / 2 - 12);
    g.fillTriangle(8, -bodyHeight / 2 - 12, 8, -bodyHeight / 2 - 18, 4, -bodyHeight / 2 - 12);

    // Happy smile
    g.lineStyle(1, p.darkest);
    g.beginPath();
    g.arc(0, -bodyHeight / 2 - 3, 3, 0.3, Math.PI - 0.3);
    g.strokePath();

    container.add(g);
    return container;
  }

  handleInput() {
    audioManager.resume();

    switch (this.phase) {
      case 'walking':
        this.startWalking();
        break;
      case 'absorbing':
        // Wait for animation
        break;
      case 'captured':
        this.showEmailForm();
        break;
      case 'form':
        // Form handles its own input
        break;
    }
  }

  startWalking() {
    this.phase = 'absorbing';
    if (this.instructionText) this.instructionText.destroy();

    audioManager.playWalk();

    // Tiger walks up to scroll
    this.tweens.add({
      targets: this.tiger,
      y: 120,
      duration: 1500,
      ease: 'Linear',
      onComplete: () => this.absorbScroll(),
    });
  }

  absorbScroll() {
    const { width, height } = this.scale;
    const p = getPalette();

    audioManager.playCorrect();

    // Flash effect
    const flash = this.add.rectangle(width / 2, height / 2, width, height, p.lightest, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
    });

    // Scroll shrinks into tiger
    this.tweens.add({
      targets: this.scrollContainer,
      y: 120,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
    });

    // Particles fly into tiger
    this.glowParticles.forEach((particle, i) => {
      this.tweens.add({
        targets: particle,
        x: width / 2,
        y: 120,
        alpha: 0,
        duration: 600,
        delay: i * 50,
      });
    });

    // Tiger glows
    this.time.delayedCall(800, () => {
      this.tigerGlowEffect();
    });
  }

  tigerGlowEffect() {
    const { width, height } = this.scale;
    const p = getPalette();

    // Glow around tiger
    const tigerGlow = this.add.graphics();
    tigerGlow.fillStyle(p.lightest, 0.5);
    tigerGlow.fillCircle(width / 2, 120, 40);

    this.tweens.add({
      targets: tigerGlow,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 1000,
      onComplete: () => {
        tigerGlow.destroy();
        this.showCapturedMessage();
      },
    });
  }

  showCapturedMessage() {
    const { width, height } = this.scale;
    const p = getPalette();
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');
    const lightestHex = '#' + p.lightest.toString(16).padStart(6, '0');

    this.phase = 'captured';

    // Message box (Pokemon style)
    const boxY = height - 80;
    const boxH = 65;

    const box = this.add.graphics();
    box.fillStyle(p.lightest);
    box.fillRect(10, boxY, width - 20, boxH);
    box.lineStyle(3, p.darkest);
    box.strokeRect(10, boxY, width - 20, boxH);

    // Message
    this.add.text(width / 2, boxY + 15, 'The scroll\'s knowledge', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: darkestHex,
    }).setOrigin(0.5);

    this.add.text(width / 2, boxY + 30, 'flows into you!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: darkestHex,
    }).setOrigin(0.5);

    // Continue prompt
    const continueText = this.add.text(width - 25, boxY + boxH - 12, '?', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: darkestHex,
    });

    this.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });
  }

  showEmailForm() {
    const { width, height } = this.scale;
    const p = getPalette();
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');
    const lightestHex = '#' + p.lightest.toString(16).padStart(6, '0');
    const darkHex = '#' + p.dark.toString(16).padStart(6, '0');

    this.phase = 'form';
    audioManager.playSelect();

    // Clear previous UI
    this.children.removeAll();

    // Background
    this.cameras.main.setBackgroundColor(p.darkest);

    // Border
    const border = this.add.graphics();
    border.lineStyle(3, p.lightest);
    border.strokeRect(4, 4, width - 8, height - 8);

    // Title
    this.add.text(width / 2, 25, 'SACRED SCROLL', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '10px',
      color: lightestHex,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 45, 'K-Digital Guide', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: darkHex,
    }).setOrigin(0.5);

    // Small scroll icon
    const scrollIcon = this.add.graphics();
    scrollIcon.fillStyle(p.lightest);
    scrollIcon.fillRect(width / 2 - 20, 60, 40, 25);
    scrollIcon.fillStyle(p.light);
    scrollIcon.fillRect(width / 2 - 23, 58, 46, 4);
    scrollIcon.fillRect(width / 2 - 23, 83, 46, 4);

    // Prompt
    this.add.text(width / 2, 105, 'Receive your scroll?', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: lightestHex,
    }).setOrigin(0.5);

    // Email input area (in-game style)
    this.createInGameEmailForm(width / 2, 150);
  }

  createInGameEmailForm(x, y) {
    const { width, height } = this.scale;
    const p = getPalette();
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');
    const lightestHex = '#' + p.lightest.toString(16).padStart(6, '0');

    // Email input box
    const inputBox = this.add.graphics();
    inputBox.fillStyle(p.lightest);
    inputBox.fillRect(20, y - 12, width - 40, 24);
    inputBox.lineStyle(2, p.dark);
    inputBox.strokeRect(20, y - 12, width - 40, 24);

    // Create HTML input (positioned over game canvas)
    this.createEmailInput(y);

    // Submit button (matching localnomad.club style)
    this.createInGameButton(x, y + 40, 'GET FREE ACCESS', () => {
      this.submitEmailForm();
    });

    // Skip button
    this.createInGameButton(x, y + 75, 'SKIP', () => {
      this.showFinalScreen();
    });

    // Privacy note (matching localnomad.club)
    this.add.text(width / 2, y + 105, 'No spam, ever.', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '6px',
      color: '#' + p.dark.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    this.add.text(width / 2, y + 118, 'Unsubscribe anytime.', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '6px',
      color: '#' + p.dark.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);
  }

  createEmailInput(y) {
    // Position input over the game canvas
    const canvas = this.game.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / this.scale.width;
    const scaleY = rect.height / this.scale.height;

    // Create input element
    const input = document.createElement('input');
    input.type = 'email';
    input.id = 'scroll-email';
    input.placeholder = 'your@email.com';
    input.style.position = 'absolute';
    input.style.left = (rect.left + 22 * scaleX) + 'px';
    input.style.top = (rect.top + (y - 10) * scaleY) + 'px';
    input.style.width = ((this.scale.width - 44) * scaleX) + 'px';
    input.style.height = (20 * scaleY) + 'px';
    input.style.padding = '2px 8px';
    input.style.border = 'none';
    input.style.background = 'transparent';
    input.style.color = '#000000';
    input.style.fontFamily = "'Press Start 2P', monospace";
    input.style.fontSize = (7 * scaleY) + 'px';
    input.style.outline = 'none';
    input.style.zIndex = '1000';

    document.body.appendChild(input);
    this.emailInput = input;

    // Focus input
    this.time.delayedCall(100, () => input.focus());

    // Handle Enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitEmailForm();
      }
    });
  }

  createInGameButton(x, y, text, callback) {
    const p = getPalette();
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');

    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(p.light);
    bg.fillRect(-70, -12, 140, 24);
    bg.lineStyle(2, p.darkest);
    bg.strokeRect(-70, -12, 140, 24);
    container.add(bg);

    const btnText = this.add.text(0, 0, text, {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: darkestHex,
    }).setOrigin(0.5);
    container.add(btnText);

    container.setSize(140, 24);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(p.lightest);
      bg.fillRect(-70, -12, 140, 24);
      bg.lineStyle(2, p.darkest);
      bg.strokeRect(-70, -12, 140, 24);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(p.light);
      bg.fillRect(-70, -12, 140, 24);
      bg.lineStyle(2, p.darkest);
      bg.strokeRect(-70, -12, 140, 24);
    });

    container.on('pointerdown', () => {
      audioManager.playSelect();
      callback();
    });

    return container;
  }

  submitEmailForm() {
    const email = this.emailInput ? this.emailInput.value : '';

    if (!email || !email.includes('@')) {
      // Show error in game
      this.showInGameMessage('Enter valid email!', false);
      return;
    }

    // Send to Airtable
    this.sendToAirtable(email);
  }

  async sendToAirtable(email) {
    // Use serverless API endpoint for secure submission
    // API key is kept server-side, not exposed to frontend
    const API_ENDPOINT = '/api/subscribe';

    try {
      // Show loading state
      this.showInGameMessage('Sending...', true);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'garlic-tiger-game',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || 'Submission failed');
      }

      console.log('Email submitted successfully');

      // Remove input
      if (this.emailInput) {
        this.emailInput.remove();
        this.emailInput = null;
      }

      audioManager.playCorrect();
      this.showInGameMessage('Scroll sent!', true);

      this.time.delayedCall(1500, () => {
        this.showFinalScreen();
      });
    } catch (error) {
      console.error('Subscription error:', error);
      this.showInGameMessage('Error! Try again.', false);
    }
  }

  showInGameMessage(text, success) {
    const { width, height } = this.scale;
    const p = getPalette();

    const msg = this.add.text(width / 2, height / 2, text, {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '10px',
      color: success ? '#' + p.lightest.toString(16).padStart(6, '0') : '#ff6666',
      backgroundColor: '#' + p.darkest.toString(16).padStart(6, '0'),
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      duration: 300,
      delay: 1200,
      onComplete: () => msg.destroy(),
    });
  }

  showFinalScreen() {
    const { width, height } = this.scale;
    const p = getPalette();
    const darkestHex = '#' + p.darkest.toString(16).padStart(6, '0');
    const lightestHex = '#' + p.lightest.toString(16).padStart(6, '0');

    // Remove email input if still there
    if (this.emailInput) {
      this.emailInput.remove();
      this.emailInput = null;
    }

    // Clear and show final screen
    this.children.removeAll();
    this.cameras.main.setBackgroundColor(p.darkest);

    // Border
    const border = this.add.graphics();
    border.lineStyle(3, p.lightest);
    border.strokeRect(4, 4, width - 8, height - 8);

    // Congratulations
    this.add.text(width / 2, 40, 'CONGRATULATIONS!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '10px',
      color: lightestHex,
    }).setOrigin(0.5);

    this.add.text(width / 2, 60, 'You are now Korean!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '8px',
      color: '#' + p.light.toString(16).padStart(6, '0'),
    }).setOrigin(0.5);

    // Final tiger
    const finalTiger = this.createTiger(width / 2, 120);

    // Sparkles around tiger
    for (let i = 0; i < 6; i++) {
      const sparkle = this.add.star(
        width / 2 + Phaser.Math.Between(-40, 40),
        120 + Phaser.Math.Between(-30, 30),
        4, 1, 3, p.lightest
      );
      this.tweens.add({
        targets: sparkle,
        alpha: 0.3,
        scale: 0.5,
        duration: 600,
        delay: i * 100,
        yoyo: true,
        repeat: -1,
      });
    }

    // Buttons
    this.createInGameButton(width / 2, 180, 'SHARE VICTORY', async () => {
      const result = await shareManager.shareWithStage(5, 5);
      if (result.success) {
        this.showInGameMessage('Shared!', true);
      }
    });

    this.createInGameButton(width / 2, 215, 'PLAY AGAIN', () => {
      this.scene.start(SCENES.TITLE);
    });

    // Branding
    this.add.text(width / 2, height - 20, 'localnomad.club', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '7px',
      color: '#' + p.dark.toString(16).padStart(6, '0'),
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        window.open(GAME_CONFIG.BRANDING.URL, '_blank');
      });
  }

  shutdown() {
    // Cleanup HTML elements
    if (this.emailInput) {
      this.emailInput.remove();
      this.emailInput = null;
    }
  }
}
