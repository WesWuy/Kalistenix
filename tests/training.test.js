import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PROFILE, LEVELS, GOALS, EQUIPMENT, makePlan, schedule, weekDates, recommendation, validateProfile, validHistory, EXERCISES } from '../training.js';

test('every combination produces a complete plan using only selected equipment', () => {
  for (const level of LEVELS) for (const goal of GOALS) for (const days of [2, 3, 4]) for (let mask = 0; mask < 8; mask++) {
    const equipment = EQUIPMENT.filter((_, i) => mask & (1 << i));
    for (const history of [[], [{ sets: [] }]]) {
      const plan = makePlan({ ...DEFAULT_PROFILE, level, goal, days, equipment }, history);
      assert.ok(plan.exercises.length >= 3);
      assert.ok(plan.exercises.every(e => e.equipment.every(x => equipment.includes(x))));
      assert.ok(plan.exercises.every(e => e.min > 0 && e.max >= e.min && e.sets >= 2));
    }
  }
});
test('four-day plan alternates upper and lower; shorter weeks are full body', () => {
  const profile = { ...DEFAULT_PROFILE, days: 4 };
  assert.equal(makePlan(profile).focus, 'Push · Pull · Skill');
  assert.equal(makePlan(profile, [{ sets: [] }]).focus, 'Legs · Core');
  assert.equal(makePlan(DEFAULT_PROFILE).focus, 'Full body');
  assert.deepEqual(schedule(3), [0, 2, 4]);
  assert.deepEqual(schedule(2), [0, 3]);
});
test('week dates use Monday and survive year boundaries', () => {
  assert.deepEqual(weekDates(new Date(2027, 0, 3, 10)), ['2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03']);
});
test('progression requires two complete controlled exposures with manageable effort', () => {
  const good = { completed: true, form: true, effort: 'Right on', sets: [{ exerciseId: 'wall-push', value: 10 }, { exerciseId: 'wall-push', value: 10 }] };
  assert.equal(recommendation('wall-push', [good]).ready, false);
  assert.equal(recommendation('wall-push', [good, good]).ready, true);
  assert.equal(recommendation('wall-push', [good, { ...good, effort: 'Hard' }]).ready, false);
  assert.equal(recommendation('wall-push', [good, { ...good, form: false }]).ready, false);
  assert.equal(recommendation('wall-push', [good, { ...good, completed: false }]).ready, false);
  assert.equal(recommendation('wall-push', [good, { ...good, sets: [{ exerciseId: 'wall-push', value: 9 }] }]).ready, false);
});
test('profile and backup validators reject malformed data', () => {
  assert.equal(validateProfile(DEFAULT_PROFILE), true);
  assert.equal(validateProfile({ ...DEFAULT_PROFILE, level: 'Expert' }), false);
  assert.equal(validateProfile({ ...DEFAULT_PROFILE, equipment: ['Unsafe anchor'] }), false);
  assert.equal(validHistory([]), true);
  assert.equal(validHistory([{ sets: [] }]), false);
  const session = { id: '1', date: '2026-11-12', title: 'Test', minutes: 15, completed: true, form: true, effort: 'Easy', sets: [{ exerciseId: 'push', index: 0, value: 8 }] };
  assert.equal(validHistory([session]), true);
  assert.equal(validHistory([{ ...session, sets: [{ exerciseId: '<script>', index: 0, value: 8 }] }]), false);
  assert.equal(validHistory([{ ...session, minutes: -10 }]), false);
  assert.equal(validHistory([{ ...session, date: '2026-02-30' }]), false);
  assert.equal(validHistory([{ ...session, sets: [...session.sets, ...session.sets] }]), false);
  assert.equal(validHistory([session, session]), false);
});
test('exercise ids are unique and every movement has technique and regression guidance', () => {
  assert.equal(new Set(EXERCISES.map(e => e.id)).size, EXERCISES.length);
  assert.ok(EXERCISES.every(e => e.cue.length > 30 && e.easier.length > 10));
});
