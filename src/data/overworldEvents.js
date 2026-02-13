// overworldEvents.js - Random overworld encounters on tall grass tiles
// Triggered when player walks on tall grass, with minimum step cooldown

import { StateManager } from '../utils/StateManager.js';

export const MIN_STEPS_BETWEEN_ENCOUNTERS = 8;

export const RANDOM_ENCOUNTERS = [
  {
    id: 'pigeon',
    weight: 25,
    text: { ko: '비둘기 떼가 흩어졌다!', en: 'The pigeons scattered!' },
  },
  {
    id: 'flyer',
    weight: 20,
    text: { ko: '바람에 전단지가 날아왔다!', en: 'A flyer blew in on the wind!' },
  },
  {
    id: 'delivery',
    weight: 15,
    text: { ko: '배달 오토바이가 지나갔다!', en: 'A delivery scooter zoomed by!' },
  },
  {
    id: 'busker',
    weight: 15,
    text: { ko: '어디선가 버스킹 음악이 들린다...', en: 'Busking music drifts from somewhere...' },
  },
  {
    id: 'stray_cat',
    weight: 15,
    text: { ko: '길고양이가 슬쩍 쳐다본다.', en: 'A stray cat glances your way.' },
  },
  {
    id: 'wind',
    weight: 10,
    text: { ko: '시원한 바람이 분다~', en: 'A cool breeze blows~' },
  },
];

const TOTAL_WEIGHT = RANDOM_ENCOUNTERS.reduce((sum, e) => sum + e.weight, 0);

/**
 * Roll for a random encounter. Returns encounter object or null.
 * Only triggers if enough steps have passed since last encounter.
 * ~30% base chance per tall grass tile.
 */
export function rollEncounter() {
  if (StateManager.stepsSinceEncounter < MIN_STEPS_BETWEEN_ENCOUNTERS) {
    return null;
  }

  // 30% chance to trigger
  if (Math.random() > 0.3) return null;

  // Weighted random selection
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const encounter of RANDOM_ENCOUNTERS) {
    roll -= encounter.weight;
    if (roll <= 0) {
      StateManager.resetEncounterSteps();
      return encounter;
    }
  }

  return RANDOM_ENCOUNTERS[0]; // fallback
}
