import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { NEIGHBORHOOD_STOPS, getNextStop } from '../src/data/neighborhoodGuide.js';
import { StateManager } from '../src/utils/StateManager.js';
import { MAP_LAYERS, isWalkable } from '../src/data/mapData.js';

test('five bilingual stops cover every quiz exactly once', () => {
  assert.deepEqual(NEIGHBORHOOD_STOPS.map(s => s.quizId).sort(), [1,2,3,4,5]);
  for (const stop of NEIGHBORHOOD_STOPS) {
    assert.ok(stop.name.ko && stop.name.en && stop.lesson.ko && stop.lesson.en);
    assert.ok(stop.x >= 0 && stop.y >= 0);
  }
});
test('guide suggests uncompleted stops without forcing the order', () => {
  assert.equal(getNextStop([]).quizId, 4);
  assert.equal(getNextStop([4, 1, 5]).quizId, 3);
  assert.equal(getNextStop([1,2,3,4,5]), null);
});
test('returning from a quiz keeps guide progress; fresh run resets it', () => {
  StateManager.reset();
  StateManager.guideIntroduced = true;
  StateManager.completeQuiz(4);
  StateManager.completeQuiz(4);
  assert.equal(StateManager.garlicsCollected, 1);
  assert.equal(StateManager.guideIntroduced, true);
  StateManager.reset();
  assert.equal(StateManager.guideIntroduced, false);
});
test('all destination interaction neighborhoods are reachable from spawn', () => {
  const start = StateManager.playerPosition;
  const seen = new Set([`${start.x},${start.y}`]), queue = [start];
  const npcTiles = new Set(NEIGHBORHOOD_STOPS.filter(s=>s.quizId!==2).map(s=>`${s.x},${s.y}`));
  for (let i=0; i<queue.length; i++) {
    const {x,y}=queue[i];
    for (const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
      if (!seen.has(key) && !npcTiles.has(key) && isWalkable(nx,ny)) {seen.add(key);queue.push({x:nx,y:ny});}
    }
  }
  for (const stop of NEIGHBORHOOD_STOPS) {
    assert.ok([[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>seen.has(`${stop.x+dx},${stop.y+dy}`)), stop.location);
  }
});
test('quiz answers exist and practical onboarding is not forced etiquette', () => {
  const {quizzes} = JSON.parse(readFileSync(new URL('../src/data/quizData.json',import.meta.url)));
  for (const q of quizzes) assert.ok(q.choices.some(c=>c.id===q.correct));
  assert.equal(quizzes[0].correct,'A');
  assert.equal(quizzes[1].correct,'B');
  assert.equal(quizzes[3].correct,'C');
});
