// ShareManager - Handles share functionality

import { GAME_CONFIG } from '../config.js';

class ShareManager {
  constructor() {
    this.gameUrl = GAME_CONFIG.BRANDING.URL;
  }

  // Check if Web Share API is available
  canShare() {
    return navigator.share !== undefined;
  }

  // Get transformation stage names
  getStageName(stage) {
    const names = ['Tiger', 'Furless Tiger', 'Tall Tiger', 'Seuree', 'Dark-Haired', 'Korean'];
    return names[stage] || 'Tiger';
  }

  // Generate share text based on result
  getShareText(garlicsCollected, isVictory = false) {
    if (isVictory) {
      return `🐯➡️🧑 I became Korean in Garlic Tiger! Collected all 5 garlics! Can you do it? 🧄`;
    }
    return `🐯 I collected ${garlicsCollected}/5 garlics on my journey to become Korean! Can you beat me? 🧄`;
  }

  // Generate share text with transformation stage
  getShareTextWithStage(garlicsCollected, stage) {
    const stageName = this.getStageName(stage);
    if (stage === 5) {
      return `🐯➡️🧑 I became Korean in Garlic Tiger! Can you do it too? 🧄`;
    }
    return `🐯 My tiger became "${stageName}" (${garlicsCollected}/5 garlics)! Can you help them become Korean? 🧄`;
  }

  // Generate URL with stage parameter for friends to see
  getShareUrl(stage) {
    const baseUrl = this.gameUrl || window.location.origin + window.location.pathname;
    return `${baseUrl}?stage=${stage}`;
  }

  // Share using Web Share API
  async share(garlicsCollected, isVictory = false) {
    const shareData = {
      title: 'Garlic Tiger | LocalNomad',
      text: this.getShareText(garlicsCollected, isVictory),
      url: this.gameUrl,
    };

    if (this.canShare()) {
      try {
        await navigator.share(shareData);
        return { success: true, method: 'native' };
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
        return { success: false, method: 'none' };
      }
    } else {
      // Fallback: Copy to clipboard
      return this.copyToClipboard(garlicsCollected, isVictory);
    }
  }

  // Share with transformation stage included
  async shareWithStage(garlicsCollected, stage) {
    const shareUrl = this.getShareUrl(stage);
    const shareText = this.getShareTextWithStage(garlicsCollected, stage);

    const shareData = {
      title: 'Garlic Tiger | LocalNomad',
      text: shareText,
      url: shareUrl,
    };

    if (this.canShare()) {
      try {
        await navigator.share(shareData);
        return { success: true, method: 'native' };
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
        return { success: false, method: 'none' };
      }
    } else {
      // Fallback: Copy to clipboard
      return this.copyToClipboardWithStage(garlicsCollected, stage);
    }
  }

  // Fallback: Copy share text to clipboard
  async copyToClipboard(garlicsCollected, isVictory = false) {
    const text = `${this.getShareText(garlicsCollected, isVictory)}\n\nPlay now: ${this.gameUrl}`;

    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    } catch (err) {
      console.error('Copy failed:', err);
      return { success: false, method: 'none' };
    }
  }

  // Copy with stage parameter
  async copyToClipboardWithStage(garlicsCollected, stage) {
    const shareUrl = this.getShareUrl(stage);
    const text = `${this.getShareTextWithStage(garlicsCollected, stage)}\n\nSee my tiger & play: ${shareUrl}`;

    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    } catch (err) {
      console.error('Copy failed:', err);
      return { success: false, method: 'none' };
    }
  }

  // Check URL for shared stage parameter
  getSharedStage() {
    const params = new URLSearchParams(window.location.search);
    const stage = parseInt(params.get('stage'), 10);
    return isNaN(stage) ? null : Math.min(Math.max(stage, 0), 5);
  }

  // Generate share image (canvas-based)
  async generateShareImage(scene, garlicsCollected, transformStage) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 315; // Optimal for social sharing

      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 600, 315);

      // Border
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 580, 295);

      // Title
      ctx.fillStyle = '#f0f0f0';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GARLIC TIGER', 300, 50);

      // Garlic count
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(`${garlicsCollected}/5 GARLICS`, 300, 150);

      // Transformation stage text
      const stageTexts = [
        'Just a tiger...',
        'Fur is shedding!',
        'Getting longer!',
        'Lost the TH sound!',
        'Hair turned black!',
        'FULLY KOREAN!',
      ];
      ctx.fillText(stageTexts[transformStage], 300, 180);

      // Challenge text
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('Can you become Korean?', 300, 230);

      // Branding
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = '#8a8a8a';
      ctx.fillText('localnomad.club', 300, 290);

      // Convert to data URL
      resolve(canvas.toDataURL('image/png'));
    });
  }
}

// Singleton
export const shareManager = new ShareManager();
