import { QUIZ_LOCATIONS } from '../config.js';

// Small, original field-guide pages. Coordinates stay in the map configuration.
export const NEIGHBORHOOD_STOPS = [
  { location: 'chicken', name: { ko: '치킨집', en: 'CHICKEN' }, lesson: { ko: '마지막 한 조각, 먼저 물어보기', en: 'Ask before the last bite.' } },
  { location: 'cafe', name: { ko: '카페', en: 'CAFE' }, lesson: { ko: '응, 안 가! 뜻을 끝까지 말하기', en: 'Say the whole answer.' } },
  { location: 'subway', name: { ko: '지하철', en: 'SUBWAY' }, lesson: { ko: '도움이 필요한지 먼저 물어보기', en: 'Offer help, then listen.' } },
  { location: 'restaurant', name: { ko: '식당', en: 'DINER' }, lesson: { ko: '계산 방법은 함께 정하기', en: 'Agree how to split the bill.' } },
  { location: 'apartment', name: { ko: '아파트', en: 'APARTMENT' }, lesson: { ko: '급해도 안전하게 기다리기', en: 'Wait safely, even in a hurry.' } },
].map(stop => ({ ...stop, ...QUIZ_LOCATIONS[stop.location] }));

export function getNextStop(completedQuizzes) {
  return NEIGHBORHOOD_STOPS.find(stop => !completedQuizzes.includes(stop.quizId)) || null;
}

export const GUIDE_TEXT = {
  title: { ko: '동네 수첩', en: 'FIELD NOTES' },
  help: { ko: 'X/B: 닫기', en: 'X/B: CLOSE' },
  welcome: { ko: '동네에 온 걸 환영해! X/B로 수첩을 펴 봐.', en: 'Welcome! X/B opens your guide.' },
  hint: { ko: '방향키: 이동  Z/A: 대화  X/B: 수첩', en: 'MOVE: arrows  TALK: Z/A  GUIDE: X/B' },
  note: { ko: '한 동네의 이야기, 모두의 규칙은 아니야.', en: 'One neighborhood, not universal rules.' },
};
