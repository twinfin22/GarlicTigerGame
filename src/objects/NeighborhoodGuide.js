import { GAME } from '../config.js';
import { UI_COLORS, hexToCSS } from '../data/palettes.js';
import { NEIGHBORHOOD_STOPS, GUIDE_TEXT } from '../data/neighborhoodGuide.js';
import { StateManager } from '../utils/StateManager.js';
import { drawMenuBox } from '../utils/TileRenderer.js';

export class NeighborhoodGuide {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(1100).setVisible(false);
  }

  get isVisible() { return this.container.visible; }

  toggle() {
    if (this.isVisible) { this.container.setVisible(false); return; }
    this.container.removeAll(true);
    const box = this.scene.add.graphics();
    drawMenuBox(box, 3, 3, GAME.WIDTH - 6, GAME.HEIGHT - 6);
    this.container.add(box);
    const text = (x, y, value, size = 8) => {
      const label = this.scene.add.text(x, y, value, {
        fontFamily: `'${GAME.FONT_KO}', ${GAME.FONT_FALLBACK}`,
        fontSize: `${size}px`, color: hexToCSS(UI_COLORS.TEXT_DARK),
      });
      this.container.add(label);
    };
    text(10, 9, `${GUIDE_TEXT.title.ko} / ${GUIDE_TEXT.title.en}`, 10);
    NEIGHBORHOOD_STOPS.forEach((stop, i) => {
      const y = 27 + i * 21;
      const done = StateManager.isQuizCompleted(stop.quizId);
      text(10, y, `${done ? '[+]' : '[ ]'} ${stop.name.ko}: ${stop.lesson.ko}`, 7);
      // Tips stay available; the stamp records completed encounters.
      text(10, y + 10, `${stop.name.en}: ${stop.lesson.en}`, 6);
    });
    text(10, GAME.HEIGHT - 25, GUIDE_TEXT.note.ko, 7);
    text(10, GAME.HEIGHT - 17, GUIDE_TEXT.note.en, 6);
    text(10, GAME.HEIGHT - 9, GUIDE_TEXT.help.ko + ' / ' + GUIDE_TEXT.help.en, 6);
    this.container.setVisible(true);
  }

  destroy() { this.container.destroy(); }
}
