import { SHARE_MESSAGES, RESULT_CARD } from '../data/shareText.js';
import { BRANDING } from '../config.js';

export class ShareManager {
  static generateShareURL(stage) {
    const base = window.location.origin + window.location.pathname;
    return `${base}?stage=${stage}`;
  }

  static getShareText(stage) {
    const msg = SHARE_MESSAGES[stage] || SHARE_MESSAGES[0];
    return `${msg.ko}\n${msg.en}\n\n\uD83D\uDC2F Garlic Tiger | \uB9C8\uB298 \uD638\uB791\uC774\n${ShareManager.generateShareURL(stage)}`;
  }

  static async share(stage, totalTries) {
    const text = ShareManager.getShareText(stage);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Garlic Tiger | \uB9C8\uB298 \uD638\uB791\uC774',
          text,
          url: ShareManager.generateShareURL(stage),
        });
        return true;
      } catch (e) {
        // User cancelled or error — fallback to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Last resort: text area copy
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    }
  }

  static parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    const stage = parseInt(params.get('stage'), 10);
    return { stage: isNaN(stage) ? null : Math.min(5, Math.max(0, stage)) };
  }
}
