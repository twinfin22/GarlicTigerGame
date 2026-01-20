// ScrollScene - Final scene with scroll reveal and email capture

import Phaser from 'phaser';
import { GAME_CONFIG, SCENES } from '../config.js';
import { audioManager } from '../utils/AudioManager.js';
import { shareManager } from '../utils/ShareManager.js';

export class ScrollScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.SCROLL });
    this.nameInput = null;
    this.emailInput = null;
  }

  create() {
    const { width, height } = this.scale;
    const { COLORS, FONTS, TEXT_SIZES } = GAME_CONFIG;

    // Background (mystical interior)
    this.cameras.main.setBackgroundColor(0x2a2a2a);
    this.cameras.main.fadeIn(500);

    // Draw Hanok interior
    this.drawHanokInterior();

    // Floating scroll
    this.createFloatingScroll(width / 2, 200);

    // Scroll content icons
    this.createScrollIcons(width / 2, 240);

    // Scroll title
    this.add.text(width / 2, 340, 'The Sacred Scroll of', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TINY + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    this.add.text(width / 2, 360, 'K-Digital Economy', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.SMALL + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    this.add.text(width / 2, 390, 'Your Complete Guide to\nSettling in Korea', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TINY + 'px',
      color: '#8a8a8a',
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    // Email capture form
    this.createEmailForm();

    // LocalNomad branding
    this.add.text(width / 2, height - 20, 'Powered by LocalNomad', {
      fontFamily: FONTS.MAIN,
      fontSize: '6px',
      color: '#4a4a4a',
    }).setOrigin(0.5);
  }

  drawHanokInterior() {
    const { width, height } = this.scale;
    const g = this.add.graphics();

    // Floor
    g.fillStyle(0x3a3a3a);
    g.fillRect(0, height * 0.6, width, height * 0.4);

    // Floor pattern (traditional)
    g.lineStyle(1, 0x4a4a4a);
    for (let x = 0; x < width; x += 40) {
      g.lineBetween(x, height * 0.6, x, height);
    }
    for (let y = height * 0.6; y < height; y += 40) {
      g.lineBetween(0, y, width, y);
    }

    // Walls
    g.fillStyle(0x2a2a2a);
    g.fillRect(0, 0, 20, height * 0.6);
    g.fillRect(width - 20, 0, 20, height * 0.6);

    // Traditional window frames
    g.fillStyle(0x4a4a4a);
    g.fillRect(40, 50, 60, 80);
    g.fillRect(width - 100, 50, 60, 80);

    // Window paper
    g.fillStyle(0x5a5a5a);
    g.fillRect(45, 55, 50, 70);
    g.fillRect(width - 95, 55, 50, 70);

    // Window lattice
    g.lineStyle(2, 0x4a4a4a);
    // Left window
    g.lineBetween(70, 55, 70, 125);
    g.lineBetween(45, 90, 95, 90);
    // Right window
    g.lineBetween(width - 70, 55, width - 70, 125);
    g.lineBetween(width - 95, 90, width - 45, 90);

    // Hanging lanterns
    this.drawLantern(80, 30);
    this.drawLantern(width - 80, 30);

    // Mystical light rays
    g.fillStyle(0xf0f0f0);
    g.alpha = 0.05;
    g.fillTriangle(width / 2, 0, width / 2 - 100, 150, width / 2 + 100, 150);
    g.alpha = 1;
  }

  drawLantern(x, y) {
    const g = this.add.graphics();

    // String
    g.lineStyle(1, 0x6a6a6a);
    g.lineBetween(x, 0, x, y);

    // Lantern body
    g.fillStyle(0x5a5a5a);
    g.fillRect(x - 10, y, 20, 30);

    // Glow
    g.fillStyle(0x8a8a8a);
    g.fillRect(x - 8, y + 5, 16, 20);

    // Tassels
    g.lineStyle(1, 0x6a6a6a);
    g.lineBetween(x - 5, y + 30, x - 5, y + 40);
    g.lineBetween(x + 5, y + 30, x + 5, y + 40);
  }

  createFloatingScroll(x, y) {
    const g = this.add.graphics();

    // Scroll background
    g.fillStyle(0xf0e8d8);
    g.fillRect(x - 120, y - 60, 240, 120);

    // Scroll roll tops
    g.fillStyle(0x8a7a6a);
    g.fillRect(x - 130, y - 65, 260, 12);
    g.fillRect(x - 130, y + 53, 260, 12);

    // Roll end caps
    g.fillStyle(0x6a5a4a);
    g.fillCircle(x - 130, y - 59, 8);
    g.fillCircle(x + 130, y - 59, 8);
    g.fillCircle(x - 130, y + 59, 8);
    g.fillCircle(x + 130, y + 59, 8);

    // Scroll border
    g.lineStyle(2, 0x6a5a4a);
    g.strokeRect(x - 120, y - 60, 240, 120);

    // Glow effect
    const glow = this.add.rectangle(x, y, 260, 140, 0xf0f0f0, 0.1);

    // Floating animation
    this.tweens.add({
      targets: [g, glow],
      y: y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  createScrollIcons(x, y) {
    const icons = [
      { symbol: 'A', label: 'Apps' },
      { symbol: 'B', label: 'Banking' },
      { symbol: 'H', label: 'Housing' },
      { symbol: 'V', label: 'Visa' },
      { symbol: 'T', label: 'Transit' },
    ];

    const startX = x - 100;
    const spacing = 50;

    icons.forEach((icon, i) => {
      const iconX = startX + i * spacing;

      // Icon circle
      const g = this.add.graphics();
      g.fillStyle(0x4a4a4a);
      g.fillCircle(iconX, y, 18);
      g.lineStyle(1, 0x2a2a2a);
      g.strokeCircle(iconX, y, 18);

      // Icon text
      this.add.text(iconX, y, icon.symbol, {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '10px',
        color: '#f0e8d8',
      }).setOrigin(0.5);

      // Label
      this.add.text(iconX, y + 30, icon.label, {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: '6px',
        color: '#1a1a1a',
      }).setOrigin(0.5);
    });
  }

  createEmailForm() {
    const { width, height } = this.scale;
    const { FONTS, TEXT_SIZES, COLORS } = GAME_CONFIG;

    const formY = 440;

    // Form title
    this.add.text(width / 2, formY, 'Receive your copy of the scroll?', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TINY + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    // Create HTML form overlay using safe DOM methods
    this.createHTMLForm();

    // Get Guide button
    this.createButton(width / 2, formY + 80, 'GET THE GUIDE', () => {
      this.showEmailPrompt();
    });

    // Share button
    this.createButton(width / 2, formY + 130, 'SHARE VICTORY', () => {
      this.shareVictory();
    });

    // Visit LocalNomad
    const visitText = this.add.text(width / 2, formY + 175, 'Visit localnomad.club', {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TINY + 'px',
      color: '#8a8a8a',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    visitText.on('pointerdown', () => {
      window.open(GAME_CONFIG.BRANDING.URL, '_blank');
    });

    visitText.on('pointerover', () => {
      visitText.setColor('#f0f0f0');
    });

    visitText.on('pointerout', () => {
      visitText.setColor('#8a8a8a');
    });
  }

  createHTMLForm() {
    // Create form container using safe DOM methods
    const formDiv = document.createElement('div');
    formDiv.id = 'email-form';
    formDiv.style.display = 'none';
    formDiv.style.position = 'fixed';
    formDiv.style.top = '50%';
    formDiv.style.left = '50%';
    formDiv.style.transform = 'translate(-50%, -50%)';
    formDiv.style.background = '#1a1a1a';
    formDiv.style.border = '3px solid #f0f0f0';
    formDiv.style.padding = '20px';
    formDiv.style.zIndex = '1000';
    formDiv.style.fontFamily = "'Press Start 2P', monospace";
    formDiv.style.width = '280px';

    // Title text
    const titleDiv = document.createElement('div');
    titleDiv.style.color = '#f0f0f0';
    titleDiv.style.fontSize = '10px';
    titleDiv.style.marginBottom = '15px';
    titleDiv.style.textAlign = 'center';
    titleDiv.style.lineHeight = '1.5';
    titleDiv.textContent = 'Enter your email to receive the K-Digital Guide!';
    formDiv.appendChild(titleDiv);

    // Name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'game-name';
    nameInput.placeholder = 'Name';
    nameInput.style.width = '100%';
    nameInput.style.padding = '10px';
    nameInput.style.marginBottom = '10px';
    nameInput.style.background = '#2a2a2a';
    nameInput.style.border = '2px solid #8a8a8a';
    nameInput.style.color = '#f0f0f0';
    nameInput.style.fontFamily = "'Press Start 2P', monospace";
    nameInput.style.fontSize = '8px';
    nameInput.style.boxSizing = 'border-box';
    formDiv.appendChild(nameInput);

    // Email input
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'game-email';
    emailInput.placeholder = 'Email';
    emailInput.style.width = '100%';
    emailInput.style.padding = '10px';
    emailInput.style.marginBottom = '15px';
    emailInput.style.background = '#2a2a2a';
    emailInput.style.border = '2px solid #8a8a8a';
    emailInput.style.color = '#f0f0f0';
    emailInput.style.fontFamily = "'Press Start 2P', monospace";
    emailInput.style.fontSize = '8px';
    emailInput.style.boxSizing = 'border-box';
    formDiv.appendChild(emailInput);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.id = 'submit-email';
    submitBtn.textContent = 'SEND MY SCROLL';
    submitBtn.style.width = '100%';
    submitBtn.style.padding = '12px';
    submitBtn.style.background = '#f0f0f0';
    submitBtn.style.border = 'none';
    submitBtn.style.color = '#1a1a1a';
    submitBtn.style.fontFamily = "'Press Start 2P', monospace";
    submitBtn.style.fontSize = '8px';
    submitBtn.style.cursor = 'pointer';
    submitBtn.style.marginBottom = '10px';
    formDiv.appendChild(submitBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-form';
    closeBtn.textContent = 'CLOSE';
    closeBtn.style.width = '100%';
    closeBtn.style.padding = '8px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = '1px solid #8a8a8a';
    closeBtn.style.color = '#8a8a8a';
    closeBtn.style.fontFamily = "'Press Start 2P', monospace";
    closeBtn.style.fontSize = '8px';
    closeBtn.style.cursor = 'pointer';
    formDiv.appendChild(closeBtn);

    document.body.appendChild(formDiv);

    // Event listeners
    submitBtn.addEventListener('click', () => {
      this.submitEmail();
    });

    closeBtn.addEventListener('click', () => {
      this.hideEmailForm();
    });
  }

  showEmailPrompt() {
    audioManager.playSelect();
    const form = document.getElementById('email-form');
    if (form) {
      form.style.display = 'block';
    }
  }

  hideEmailForm() {
    const form = document.getElementById('email-form');
    if (form) {
      form.style.display = 'none';
    }
  }

  submitEmail() {
    const nameEl = document.getElementById('game-name');
    const emailEl = document.getElementById('game-email');

    const name = nameEl ? nameEl.value : '';
    const email = emailEl ? emailEl.value : '';

    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    // Log for now (replace with actual form submission)
    console.log('Form submitted:', { name, email });

    // Send to backend
    this.sendToBackend(name, email);
  }

  async sendToBackend(name, email) {
    // Option 1: Formspree (free, no config needed)
    // Replace YOUR_FORM_ID with actual Formspree form ID when ready
    // const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID';

    try {
      // For demo, just show success
      // Uncomment below for real submission:
      /*
      const response = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, source: 'garlic-tiger-game' }),
      });

      if (!response.ok) throw new Error('Submission failed');
      */

      // Show success
      this.hideEmailForm();
      this.showSuccessMessage();
      audioManager.playCorrect();
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Oops! Something went wrong. Please try again.');
    }
  }

  showSuccessMessage() {
    const { width, height } = this.scale;

    // Success overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a, 0.9);

    // Carrier pigeon animation
    this.add.text(width / 2, height / 2 - 50, 'A carrier pigeon has', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: GAME_CONFIG.TEXT_SIZES.SMALL + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 20, 'been dispatched!', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: GAME_CONFIG.TEXT_SIZES.SMALL + 'px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    // Pigeon icon (using > as placeholder)
    const pigeon = this.add.text(width / 2, height / 2 + 30, '>', {
      fontFamily: GAME_CONFIG.FONTS.MAIN,
      fontSize: '24px',
      color: '#f0f0f0',
    }).setOrigin(0.5);

    // Flying animation
    this.tweens.add({
      targets: pigeon,
      x: width + 50,
      y: height / 2 - 50,
      duration: 2000,
      ease: 'Power2',
    });

    // Check email message
    this.time.delayedCall(2000, () => {
      this.add.text(width / 2, height / 2 + 80, 'Check your email soon!', {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: GAME_CONFIG.TEXT_SIZES.TINY + 'px',
        color: '#8a8a8a',
      }).setOrigin(0.5);

      // Tap to dismiss
      const dismissText = this.add.text(width / 2, height - 50, 'Tap to continue', {
        fontFamily: GAME_CONFIG.FONTS.MAIN,
        fontSize: GAME_CONFIG.TEXT_SIZES.TINY + 'px',
        color: '#6a6a6a',
      }).setOrigin(0.5);

      this.input.once('pointerdown', () => {
        overlay.destroy();
        dismissText.destroy();
      });
    });
  }

  async shareVictory() {
    audioManager.playSelect();
    const result = await shareManager.share(5, true);

    if (result.success) {
      const { width, height } = this.scale;
      const feedback = this.add.text(
        width / 2,
        height / 2,
        result.method === 'clipboard' ? 'Copied!' : 'Shared!',
        {
          fontFamily: GAME_CONFIG.FONTS.MAIN,
          fontSize: GAME_CONFIG.TEXT_SIZES.SMALL + 'px',
          color: '#44ff44',
          backgroundColor: '#1a1a1a',
          padding: { x: 15, y: 10 },
        }
      ).setOrigin(0.5);

      this.tweens.add({
        targets: feedback,
        alpha: 0,
        duration: 500,
        delay: 1500,
        onComplete: () => feedback.destroy(),
      });
    }
  }

  createButton(x, y, text, callback) {
    const { FONTS, TEXT_SIZES, COLORS } = GAME_CONFIG;

    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.WHITE);
    bg.fillRect(-100, -18, 200, 36);
    bg.lineStyle(2, COLORS.DARK_GRAY);
    bg.strokeRect(-100, -18, 200, 36);

    const buttonText = this.add.text(0, 0, text, {
      fontFamily: FONTS.MAIN,
      fontSize: TEXT_SIZES.TINY + 'px',
      color: '#1a1a1a',
    }).setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setSize(200, 36);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(COLORS.LIGHT_GRAY);
      bg.fillRect(-100, -18, 200, 36);
      bg.lineStyle(2, COLORS.WHITE);
      bg.strokeRect(-100, -18, 200, 36);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(COLORS.WHITE);
      bg.fillRect(-100, -18, 200, 36);
      bg.lineStyle(2, COLORS.DARK_GRAY);
      bg.strokeRect(-100, -18, 200, 36);
    });

    container.on('pointerdown', callback);

    return container;
  }

  shutdown() {
    // Cleanup HTML form when leaving scene
    const form = document.getElementById('email-form');
    if (form) {
      form.remove();
    }
  }
}
