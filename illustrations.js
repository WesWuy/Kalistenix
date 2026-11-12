// Exercise artwork: two illustrated positions per exercise, stored as local
// JPEGs in assets/exercises/<id>-<0|1>.jpg (generated with Higgsfield, GPT Image 2.6,
// from one shared character and style reference). No remote image service is used at runtime.
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const card = (name, view, equipment, labels, descriptions, cue) => ({ name, view, equipment, labels, descriptions, cue });
export const IMAGE_WIDTH = 1024;
export const IMAGE_HEIGHT = 688;

export const ILLUSTRATIONS = {
  'wall-push': card('Wall push-up', 'SIDE VIEW', 'wall', ['Set up', 'Bend & press'], ['Stand facing a wall with straight arms and hands at chest height.', 'Bend your elbows to bring your chest toward the wall, keeping your body aligned.'], 'Move as one line from head to heel.'),
  'knee-push': card('Knee push-up', 'SIDE VIEW', 'mat', ['Arms straight', 'Lower with control'], ['Support your body on your hands and knees with a straight line from shoulders to knees.', 'Bend your elbows and lower your chest while keeping your knees on the mat.'], 'Keep knees grounded and hips in line.'),
  push: card('Push-up', 'SIDE VIEW', 'mat', ['High position', 'Lower with control'], ['Hands and toes support a braced body with straight arms.', 'Lower your chest between your hands, keeping shoulders, hips, and ankles aligned.'], 'Keep your trunk braced through the rep.'),
  archer: card('Archer push-up', 'FRONT VIEW', 'mat', ['Wide stance', 'Shift to one side'], ['Set your hands wide and distribute your weight between them.', 'Bend one arm and move your chest toward that hand while the opposite arm stays extended.'], 'Alternate sides. Use only a controlled range.'),
  'prone-w': card('Prone W raise', 'TOP VIEW', 'floor', ['Arms in a W', 'Gently lift'], ['Lie face down with bent elbows and arms arranged in a W.', 'Lift hands and elbows slightly away from the floor without lifting your trunk.'], 'A small lift. Keep your neck relaxed.'),
  'reverse-snow': card('Reverse snow angel', 'TOP VIEW', 'floor', ['Arms by hips', 'Sweep overhead'], ['Lie face down with your arms beside your hips and legs relaxed.', 'Sweep your slightly lifted arms out and toward overhead, keeping your ribs on the floor.'], 'Sweep slowly; keep the chest grounded.'),
  'band-row': card('Band row', 'SIDE VIEW', 'band', ['Reach forward', 'Row toward ribs'], ['Stand facing a secure chest-height band anchor with arms extended.', 'Draw your elbows back and bring the band toward your ribs without shrugging.'], 'Secure the anchor. Pull without shrugging.'),
  'scap-pull': card('Scapular pull-up', 'FRONT VIEW', 'bar', ['Controlled hang', 'Shoulders down'], ['Hang from the bar with straight elbows.', 'Draw shoulders down for a small body lift while the elbows remain straight.'], 'Straight elbows. Only a small lift.'),
  pull: card('Pull-up', 'FRONT VIEW', 'bar', ['Controlled hang', 'Pull upward'], ['Hang from the bar with a comfortable grip and a still body.', 'Bend your elbows and pull upward until your chin clears the bar without swinging.'], 'Pull with control; avoid swinging.'),
  'tempo-pull': card('Tempo pull-up', 'FRONT VIEW', 'bar', ['Pause at the top', 'Lower for 3 seconds'], ['Hold the top of a controlled pull-up briefly.', 'Lower your body steadily toward a straight-arm hang over three seconds.'], 'Make the lowering phase last 3 seconds.'),
  squat: card('Bodyweight squat', 'SIDE VIEW', 'floor', ['Stand tall', 'Sit down & back'], ['Stand with your feet comfortably apart and heels grounded.', 'Bend your hips and knees, reaching your arms forward as you descend.'], 'Heels down. Choose a comfortable depth.'),
  lunge: card('Reverse lunge', 'SIDE VIEW', 'floor', ['Stand tall', 'Step back & lower'], ['Stand tall with feet under your hips.', 'Step one foot back, bending both knees while the front foot stays flat.'], 'Keep the front foot planted.'),
  pistol: card('Assisted pistol squat', 'SIDE VIEW', 'post', ['Hold a support', 'Lower on one leg'], ['Hold a stable support and lift one foot in front of you.', 'Lower on the standing leg with assistance while extending the other leg forward.'], 'Use the support throughout the movement.'),
  bridge: card('Glute bridge', 'SIDE VIEW', 'mat', ['Feet planted', 'Lift your hips'], ['Lie on your back with knees bent and both feet on the floor.', 'Press through your feet and lift your hips while shoulders stay on the mat.'], 'Squeeze glutes without arching your back.'),
  deadbug: card('Dead bug', 'SIDE VIEW', 'mat', ['Arms up, knees bent', 'Reach opposite limbs'], ['Lie on your back with arms pointing up and hips and knees bent.', 'Reach one arm overhead and extend the opposite leg while keeping your lower back grounded.'], 'Opposite arm and leg. Back grounded.'),
  hollow: card('Hollow body hold', 'SIDE VIEW', 'mat', ['Tuck & brace', 'Extend & hold'], ['Lie on your back, lift your shoulders slightly, and bring your knees toward your chest.', 'Extend your legs into a controlled hollow shape with arms reaching alongside your body.'], 'Keep the lower back on the mat.'),
  'long-hollow': card('Extended hollow hold', 'SIDE VIEW', 'mat', ['Find your hollow', 'Reach long & hold'], ['Establish a hollow hold with shoulders and legs raised and your arms beside you.', 'Reach your arms overhead and lengthen your legs while your lower back stays grounded.'], 'Lengthen without letting the back arch.'),
  pike: card('Pike push-up', 'SIDE VIEW', 'mat', ['Hips high', 'Bend your elbows'], ['Form an inverted V with hips high, hands planted, and arms straight.', 'Bend your elbows and lower your head toward the floor while maintaining the pike shape.'], 'Keep hips high; do not load your head.'),
  lean: card('Planche lean', 'SIDE VIEW', 'mat', ['Start in a plank', 'Lean forward & hold'], ['Start in a straight-arm plank with hands under your shoulders.', 'Shift your shoulders forward of your wrists, keeping elbows straight and toes grounded.'], 'Lean gently. Keep your feet grounded.'),
  plank: card('High plank', 'SIDE VIEW', 'mat', ['Plant your hands', 'Brace & hold'], ['Place your hands on the floor and set your knees down to prepare.', 'Extend your legs and hold a straight line from shoulders to heels with steady breathing.'], 'Hands under shoulders. Breathe steadily.'),
  support: card('Parallel bar support', 'FRONT VIEW', 'parallel', ['Feet supported', 'Press down & hold'], ['Grip stable parallel bars with feet on the ground and arms straight.', 'Press into the bars and gently lift your feet, keeping shoulders down.'], 'Straight arms. Keep shoulders down.'),
  lsit: card('Tuck L-sit', 'SIDE VIEW', 'parallel-side', ['Stable support', 'Tuck knees & hold'], ['Support yourself on parallel bars with arms straight.', 'Draw both knees toward your chest while pressing down through the bars.'], 'Draw knees up without swinging.'),
};

// Two matching image sets: the default athlete in assets/exercises/, and a female
// athlete in assets/exercises/female/. The profile's optional gender picks the set.
let athlete = 'default';
export function setAthlete(gender) { athlete = gender === 'female' ? 'female' : 'default'; }
export const exerciseImage = (id, phase) => `./assets/exercises/${athlete === 'female' ? 'female/' : ''}${id}-${phase === 0 ? 0 : 1}.jpg`;

export function exerciseIllustration(id, { phase = 1, decorative = false, eager = false } = {}) {
  const art = ILLUSTRATIONS[id];
  if (!art) return '';
  const index = phase === 0 ? 0 : 1;
  const alt = decorative ? '' : `${art.name}, ${art.labels[index].toLowerCase()}: ${art.descriptions[index]}`;
  return `<img class="exercise-art" src="${exerciseImage(id, index)}" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" alt="${esc(alt)}"${decorative ? ' aria-hidden="true"' : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
}
export function exerciseGuide(id) {
  const art = ILLUSTRATIONS[id];
  if (!art) return '';
  return `<section class="movement-guide" aria-label="${esc(art.name)} illustrated guide"><div class="guide-topline"><span>THE MOVEMENT, IN FOCUS</span><span>${art.view}</span></div><div class="movement-frames">${art.labels.map((label, i) => `<figure class="movement-frame">${exerciseIllustration(id, { phase: i })}<figcaption><span>0${i + 1}</span>${esc(label)}</figcaption></figure>`).join('')}</div><p class="visual-cue">${esc(art.cue)}</p></section>`;
}
