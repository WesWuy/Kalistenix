export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const GOALS = ['Build strength', 'Unlock skills', 'Build consistency'];
export const EQUIPMENT = ['Pull-up bar', 'Resistance band', 'Parallel bars'];
// Optional; only used to choose which athlete appears in exercise images. '' = not specified.
export const GENDERS = ['', 'female', 'male'];
export const DEFAULT_PROFILE = { name: '', level: 'Beginner', goal: 'Build strength', days: 3, equipment: [] };
const exercise = (id, name, pattern, level, equipment, min, max, unit, cue, easier) => ({ id, name, pattern, level, equipment, min, max, unit, cue, easier });
export const EXERCISES = [
  exercise('wall-push', 'Wall push-up', 'Push', 'Beginner', [], 5, 10, 'reps', 'Hands at chest height on a solid wall. Bend your elbows with your body in a straight line, then press away.', 'Stand closer to the wall.'),
  exercise('knee-push', 'Knee push-up', 'Push', 'Beginner', [], 5, 10, 'reps', 'Keep a straight line from knees to shoulders. Lower with control and keep elbows comfortably close to your body.', 'Use a wall push-up.'),
  exercise('push', 'Push-up', 'Push', 'Intermediate', [], 6, 12, 'reps', 'Brace your trunk. Lower your chest between your hands without sagging, then press the floor away.', 'Use knee or wall push-ups.'),
  exercise('archer', 'Archer push-up', 'Push', 'Advanced', [], 3, 6, 'reps / side', 'Use a wide hand position. Shift toward one hand as you lower, keeping the other arm softly extended. Alternate sides.', 'Use regular push-ups or reduce the side shift.'),
  exercise('prone-w', 'Prone W raise', 'Pull prep', 'Beginner', [], 8, 12, 'reps', 'Lie face down, arms in a W. Gently lift hands and elbows, squeeze shoulder blades, then lower. Keep your neck relaxed.', 'Lift through a smaller comfortable range.'),
  exercise('reverse-snow', 'Reverse snow angel', 'Pull prep', 'Intermediate', [], 8, 12, 'reps', 'Lie face down. Lift your arms slightly and slowly sweep them from your hips toward overhead. Keep ribs on the floor.', 'Use prone W raises.'),
  exercise('band-row', 'Band row', 'Pull', 'Beginner', ['Resistance band'], 8, 12, 'reps', 'Use an intact band with a secure, rated anchor at chest height. Pull elbows back without shrugging; return slowly.', 'Use a lighter band or less stretch.'),
  exercise('scap-pull', 'Scapular pull-up', 'Pull', 'Beginner', ['Pull-up bar'], 4, 8, 'reps', 'On a secure bar, keep elbows straight and gently draw shoulders down to lift slightly. Lower under control.', 'Keep feet supported to reduce the load.'),
  exercise('pull', 'Pull-up', 'Pull', 'Intermediate', ['Pull-up bar'], 3, 8, 'reps', 'Start from a controlled hang. Pull elbows down without swinging; lower slowly through a comfortable range.', 'Use foot assistance on a secure support or scapular pull-ups.'),
  exercise('tempo-pull', 'Tempo pull-up', 'Pull', 'Advanced', ['Pull-up bar'], 4, 8, 'reps', 'Pull without momentum, pause briefly at the top, then lower for three seconds. Keep each repetition controlled.', 'Use regular pull-ups or foot assistance.'),
  exercise('squat', 'Bodyweight squat', 'Legs', 'Beginner', [], 8, 12, 'reps', 'Stand comfortably, bend hips and knees, and keep heels grounded. Descend only as far as you can control.', 'Use a shallower squat with a stable support.'),
  exercise('lunge', 'Reverse lunge', 'Legs', 'Intermediate', [], 6, 10, 'reps / side', 'Step back and lower with control. Keep your front foot planted and return by pressing through that foot.', 'Reduce depth or hold a stable support.'),
  exercise('pistol', 'Assisted pistol squat', 'Legs', 'Advanced', [], 3, 6, 'reps / side', 'Hold a stable support. Extend one leg and squat on the other to a controlled depth. Use support throughout.', 'Use a reverse lunge or reduce the depth.'),
  exercise('bridge', 'Glute bridge', 'Legs', 'Beginner', [], 8, 12, 'reps', 'Lie on your back with feet planted. Lift hips by squeezing your glutes, without arching your lower back.', 'Lift through a smaller range.'),
  exercise('deadbug', 'Dead bug', 'Core', 'Beginner', [], 5, 8, 'reps / side', 'Lie on your back, knees bent at 90 degrees. Slowly extend opposite arm and leg, keeping your back gently grounded.', 'Move only one limb at a time.'),
  exercise('hollow', 'Hollow body hold', 'Core', 'Intermediate', [], 15, 30, 'sec', 'Press your lower back gently into the floor. Lift shoulders and legs only as far as you can maintain that position.', 'Bend your knees and bring your arms alongside your body.'),
  exercise('long-hollow', 'Extended hollow hold', 'Core', 'Advanced', [], 20, 40, 'sec', 'Keep arms overhead and legs extended with your lower back grounded. Breathe steadily and stop before your back arches.', 'Bend knees or bring arms beside you.'),
  exercise('pike', 'Pike push-up', 'Skill', 'Intermediate', [], 4, 8, 'reps', 'Raise hips into an inverted V. Bend elbows and lower your head toward the floor with control, then press back up.', 'Reduce the depth; do not load your head or neck.'),
  exercise('lean', 'Planche lean', 'Skill', 'Advanced', [], 8, 15, 'sec', 'From a straight-arm plank, gently shift shoulders forward of wrists. Keep feet on the floor and stop if wrists hurt.', 'Reduce the forward lean or use a normal plank.'),
  exercise('plank', 'High plank', 'Core', 'Beginner', [], 15, 25, 'sec', 'Place hands under shoulders. Brace your trunk and keep a straight line from head to heels while breathing.', 'Place knees on the floor.'),
  exercise('support', 'Parallel bar support', 'Skill', 'Intermediate', ['Parallel bars'], 10, 20, 'sec', 'On stable bars, support yourself with straight arms and shoulders gently down. Keep feet close to the floor.', 'Keep toes on the floor for assistance.'),
  exercise('lsit', 'Tuck L-sit', 'Skill', 'Advanced', ['Parallel bars'], 8, 15, 'sec', 'On stable bars, press shoulders down and draw knees toward your chest. Hold without swinging or shrugging.', 'Use a support hold with feet touching the floor.')
];
export const getExercise = id => EXERCISES.find(e => e.id === id);
export const PATHS = [
  { id: 'push', title: 'The stronger push-up', subtitle: 'Own every rep.', pattern: 'Push', steps: ['wall-push', 'knee-push', 'push', 'archer'] },
  { id: 'pull', title: 'Your first strict pull-up', subtitle: 'Build your pulling foundation.', pattern: 'Pull', steps: ['scap-pull', 'pull', 'tempo-pull'] },
  { id: 'core', title: 'A core built for control', subtitle: 'Find strength in stillness.', pattern: 'Core', steps: ['deadbug', 'plank', 'hollow', 'long-hollow'] },
  { id: 'legs', title: 'Single-leg strength', subtitle: 'Build from the ground up.', pattern: 'Legs', steps: ['squat', 'lunge', 'pistol'] }
];
export function validateProfile(value) {
  return !!value && typeof value.name === 'string' && value.name.length <= 40 && LEVELS.includes(value.level) && GOALS.includes(value.goal) && [2, 3, 4].includes(value.days) && Array.isArray(value.equipment) && value.equipment.every(e => EQUIPMENT.includes(e)) && (value.gender === undefined || GENDERS.includes(value.gender));
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function weekDates(date = new Date()) {
  const monday = new Date(date); monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => { const day = new Date(monday); day.setDate(day.getDate() + i); return localDate(day); });
}
export function schedule(days) { return days === 2 ? [0, 3] : days === 4 ? [0, 1, 3, 4] : [0, 2, 4]; }
export function recommendation(id, history = []) {
  const e = getExercise(id);
  const recent = history.filter(s => s.sets.some(set => set.exerciseId === id)).slice(-2);
  // Progress only after two exposures at the top of the range with good form and manageable effort.
  const ready = recent.length === 2 && recent.every(s => s.completed === true && s.form === true && ['Easy', 'Right on'].includes(s.effort) && s.sets.filter(set => set.exerciseId === id).length >= 2 && s.sets.filter(set => set.exerciseId === id).every(set => set.value >= e.max));
  return { ready, target: e.min, max: e.max };
}
export function makePlan(profile = DEFAULT_PROFILE, history = []) {
  const level = LEVELS.indexOf(profile.level);
  const has = equipment => profile.equipment.includes(equipment);
  const push = ['wall-push', 'push', 'archer'][level];
  const pull = has('Pull-up bar') ? ['scap-pull', 'pull', 'tempo-pull'][level] : has('Resistance band') ? 'band-row' : level ? 'reverse-snow' : 'prone-w';
  const legs = ['squat', 'lunge', 'pistol'][level];
  const core = ['deadbug', 'hollow', 'long-hollow'][level];
  const skill = level === 0 ? 'plank' : has('Parallel bars') ? level === 2 ? 'lsit' : 'support' : level === 2 ? 'lean' : 'pike';
  let ids = profile.goal === 'Unlock skills' ? [skill, push, pull, legs, core] : [push, pull, legs, 'bridge', core];
  const split = profile.days === 4;
  const lower = split && history.length % 2 === 1;
  if (split) ids = lower ? [legs, 'bridge', core, ...(profile.goal === 'Unlock skills' ? ['plank'] : [])] : [push, pull, skill];
  const sets = profile.goal === 'Build consistency' || level === 0 ? 2 : 3;
  return {
    title: split ? lower ? 'Lower body & control' : 'Upper body & skill' : ['Build your foundation', 'Strength in motion', 'Master your bodyweight'][level],
    focus: split ? lower ? 'Legs · Core' : 'Push · Pull · Skill' : 'Full body',
    minutes: ids.length * sets * 2 + 5,
    rest: level === 2 ? 120 : 90,
    exercises: ids.map(id => ({ ...getExercise(id), sets, ...recommendation(id, history) })),
    pullLimited: !has('Pull-up bar') && !has('Resistance band')
  };
}
export function completedSets(session) { return session ? session.sets.filter(s => Number.isFinite(s.value) && s.value > 0) : []; }
export function validHistory(value) {
  return Array.isArray(value) && value.every(s => s && typeof s.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.date) && Number.isFinite(Date.parse(s.date)) && new Date(s.date).toISOString().slice(0, 10) === s.date && typeof s.title === 'string' && s.title.length <= 100 && Number.isFinite(s.minutes) && s.minutes >= 0 && typeof s.form === 'boolean' && typeof s.completed === 'boolean' && ['Easy', 'Right on', 'Hard'].includes(s.effort) && Array.isArray(s.sets) && s.sets.length > 0 && s.sets.every(t => getExercise(t.exerciseId) && Number.isInteger(t.index) && t.index >= 0 && t.index < 10 && Number.isInteger(t.value) && t.value > 0 && t.value <= 999) && new Set(s.sets.map(t => `${t.exerciseId}:${t.index}`)).size === s.sets.length) && new Set(value.map(s => s.id)).size === value.length;
}
