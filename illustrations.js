// Original vector illustrations. Coordinates describe head, shoulder, hip,
// and the two articulated arms and legs; no remote image assets are needed.
const pose = (head, shoulder, hip, arms, legs, extra = {}) => ({ head, shoulder, hip, arms, legs, ...extra });
const line = (...points) => points;
const pushTop = pose([92, 101], [116, 117], [185, 143], [line([120, 118], [132, 154], [142, 189]), line([113, 117], [111, 153], [111, 189])], [line([185, 142], [230, 162], [274, 186]), line([180, 147], [223, 167], [263, 188])]);
const pushLow = pose([87, 147], [112, 158], [184, 171], [line([116, 156], [150, 173], [142, 189]), line([109, 159], [140, 179], [111, 189])], [line([185, 167], [230, 177], [274, 186]), line([181, 173], [222, 181], [263, 188])]);
const stand = pose([152, 45], [154, 69], [155, 124], [line([159, 73], [183, 89], [204, 92]), line([150, 73], [178, 96], [202, 96])], [line([160, 125], [172, 157], [178, 187]), line([150, 125], [140, 157], [138, 187])]);
const hang = pose([160, 73], [160, 96], [160, 140], [line([174, 97], [195, 61], [213, 27]), line([146, 97], [125, 61], [107, 27])], [line([167, 141], [173, 164], [174, 186]), line([153, 141], [147, 164], [146, 186])], { front: true });
const pullTop = pose([160, 29], [160, 53], [160, 104], [line([174, 56], [207, 80], [213, 27]), line([146, 56], [113, 80], [107, 27])], [line([167, 104], [178, 141], [165, 169]), line([153, 104], [143, 140], [151, 169])], { front: true });
const lying = pose([62, 177], [88, 179], [161, 180], [line([91, 176], [125, 183], [149, 187]), line([87, 181], [117, 191], [145, 193])], [line([161, 178], [207, 140], [241, 186]), line([160, 182], [205, 150], [232, 189])]);
const hollow = pose([61, 153], [85, 168], [157, 180], [line([91, 163], [119, 157], [143, 154]), line([85, 170], [114, 166], [140, 163])], [line([159, 178], [204, 149], [250, 130]), line([157, 183], [204, 157], [249, 139])]);
const support = pose([160, 48], [160, 72], [160, 122], [line([174, 76], [190, 108], [198, 139]), line([146, 76], [130, 108], [122, 139])], [line([167, 125], [170, 155], [174, 180]), line([153, 125], [150, 155], [146, 180])], { front: true });
const sideSupport = pose([146, 47], [148, 71], [153, 122], [line([153, 74], [166, 103], [177, 131]), line([144, 74], [146, 107], [147, 140])], [line([157, 123], [172, 155], [177, 182]), line([150, 125], [157, 155], [160, 184])]);
const prone = pose([160, 42], [160, 70], [160, 127], [line([146, 72], [112, 92], [110, 57]), line([174, 72], [208, 92], [210, 57])], [line([152, 130], [146, 160], [141, 189]), line([168, 130], [174, 160], [179, 189])], { front: true, prone: true });
const card = (name, view, equipment, labels, descriptions, poses, cue, motion = '') => ({ name, view, equipment, labels, descriptions, poses, cue, motion });

export const ILLUSTRATIONS = {
  'wall-push': card('Wall push-up', 'SIDE VIEW', 'wall', ['Set up', 'Bend & press'], ['Stand facing a wall with straight arms and hands at chest height.', 'Bend your elbows to bring your chest toward the wall, keeping your body aligned.'], [
    pose([164, 49], [163, 73], [146, 129], [line([166, 74], [206, 77], [249, 77]), line([161, 78], [206, 85], [249, 85])], [line([149, 129], [139, 159], [126, 188]), line([143, 130], [131, 160], [118, 188])]),
    pose([209, 63], [198, 85], [160, 135], [line([201, 84], [224, 107], [249, 77]), line([195, 88], [216, 115], [249, 85])], [line([164, 135], [145, 163], [126, 188]), line([157, 136], [138, 165], [118, 188])])
  ], 'Move as one line from head to heel.', 'M196 40h30m-7-6 7 6-7 6'),
  'knee-push': card('Knee push-up', 'SIDE VIEW', 'mat', ['Arms straight', 'Lower with control'], ['Support your body on your hands and knees with a straight line from shoulders to knees.', 'Bend your elbows and lower your chest while keeping your knees on the mat.'], [
    { ...pushTop, hip: [178, 151], legs: [line([179, 149], [224, 187], [265, 160]), line([175, 155], [218, 190], [258, 165])] },
    { ...pushLow, hip: [175, 174], legs: [line([177, 171], [224, 187], [265, 160]), line([174, 176], [218, 190], [258, 165])] }
  ], 'Keep knees grounded and hips in line.', 'M59 121v33m-6-7 6 7 6-7'),
  push: card('Push-up', 'SIDE VIEW', 'mat', ['High position', 'Lower with control'], ['Hands and toes support a braced body with straight arms.', 'Lower your chest between your hands, keeping shoulders, hips, and ankles aligned.'], [pushTop, pushLow], 'Keep your trunk braced through the rep.', 'M55 121v33m-6-7 6 7 6-7'),
  archer: card('Archer push-up', 'FRONT VIEW', 'mat', ['Wide stance', 'Shift to one side'], ['Set your hands wide and distribute your weight between them.', 'Bend one arm and move your chest toward that hand while the opposite arm stays extended.'], [
    pose([160, 98], [160, 121], [160, 151], [line([176, 123], [215, 156], [263, 190]), line([144, 123], [105, 156], [57, 190])], [line([169, 151], [183, 174], [193, 189]), line([151, 151], [137, 174], [127, 189])], { front: true }),
    pose([106, 123], [126, 145], [159, 165], [line([139, 145], [203, 166], [263, 190]), line([113, 145], [76, 160], [57, 190])], [line([167, 163], [182, 179], [193, 189]), line([152, 166], [138, 180], [127, 189])], { front: true })
  ], 'Alternate sides. Use only a controlled range.', 'M193 98h-40m7-6-7 6 7 6'),
  'prone-w': card('Prone W raise', 'TOP VIEW', 'floor', ['Arms in a W', 'Gently lift'], ['Lie face down with bent elbows and arms arranged in a W.', 'Lift hands and elbows slightly away from the floor without lifting your trunk.'], [prone, { ...prone, arms: [line([146, 72], [108, 88], [105, 49]), line([174, 72], [212, 88], [215, 49])] }], 'A small lift. Keep your neck relaxed.', 'M87 76V51m-5 6 5-6 5 6M233 76V51m-5 6 5-6 5 6'),
  'reverse-snow': card('Reverse snow angel', 'TOP VIEW', 'floor', ['Arms by hips', 'Sweep overhead'], ['Lie face down with your arms beside your hips and legs relaxed.', 'Sweep your slightly lifted arms out and toward overhead, keeping your ribs on the floor.'], [
    { ...prone, arms: [line([146, 72], [124, 101], [119, 133]), line([174, 72], [196, 101], [201, 133])] },
    { ...prone, arms: [line([146, 72], [111, 55], [130, 23]), line([174, 72], [209, 55], [190, 23])] }
  ], 'Sweep slowly; keep the chest grounded.', 'M84 125Q60 70 93 37m-10 2 10-2-1 10M236 125Q260 70 227 37m10 2-10-2 1 10'),
  'band-row': card('Band row', 'SIDE VIEW', 'band', ['Reach forward', 'Row toward ribs'], ['Stand facing a secure chest-height band anchor with arms extended.', 'Draw your elbows back and bring the band toward your ribs without shrugging.'], [
    { ...stand, head: [207, 43], shoulder: [207, 69], hip: [209, 126], arms: [line([207, 74], [166, 87], [124, 89]), line([204, 80], [165, 94], [124, 96])], legs: [line([214, 125], [221, 158], [229, 188]), line([204, 127], [188, 159], [180, 188])] },
    { ...stand, head: [207, 43], shoulder: [207, 69], hip: [209, 126], arms: [line([209, 74], [236, 101], [195, 99]), line([204, 80], [226, 109], [190, 106])], legs: [line([214, 125], [221, 158], [229, 188]), line([204, 127], [188, 159], [180, 188])] }
  ], 'Secure the anchor. Pull without shrugging.', 'M135 66h42m-7-6 7 6-7 6'),
  'scap-pull': card('Scapular pull-up', 'FRONT VIEW', 'bar', ['Controlled hang', 'Shoulders down'], ['Hang from the bar with straight elbows.', 'Draw shoulders down for a small body lift while the elbows remain straight.'], [hang,
    { ...hang, head: [160, 65], shoulder: [160, 88], hip: [160, 132], arms: [line([174, 89], [194, 58], [213, 27]), line([146, 89], [126, 58], [107, 27])], legs: [line([167, 133], [173, 156], [174, 178]), line([153, 133], [147, 156], [146, 178])] }
  ], 'Straight elbows. Only a small lift.', 'M246 112V88m-6 7 6-7 6 7'),
  pull: card('Pull-up', 'FRONT VIEW', 'bar', ['Controlled hang', 'Pull upward'], ['Hang from the bar with a comfortable grip and a still body.', 'Bend your elbows and pull upward until your chin clears the bar without swinging.'], [hang, pullTop], 'Pull with control; avoid swinging.', 'M251 127V69m-6 7 6-7 6 7'),
  'tempo-pull': card('Tempo pull-up', 'FRONT VIEW', 'bar', ['Pause at the top', 'Lower for 3 seconds'], ['Hold the top of a controlled pull-up briefly.', 'Lower your body steadily toward a straight-arm hang over three seconds.'], [pullTop, { ...hang, head: [160, 52], shoulder: [160, 76], hip: [160, 124], arms: [line([174, 79], [203, 75], [213, 27]), line([146, 79], [117, 75], [107, 27])], legs: [line([167, 125], [176, 151], [167, 176]), line([153, 125], [144, 151], [152, 176])] }], 'Make the lowering phase last 3 seconds.', 'M251 74v50m-6-7 6 7 6-7'),
  squat: card('Bodyweight squat', 'SIDE VIEW', 'floor', ['Stand tall', 'Sit down & back'], ['Stand with your feet comfortably apart and heels grounded.', 'Bend your hips and knees, reaching your arms forward as you descend.'], [stand,
    pose([167, 86], [152, 105], [120, 142], [line([156, 106], [185, 108], [216, 109]), line([150, 111], [182, 118], [211, 119])], [line([122, 139], [174, 146], [178, 187]), line([117, 146], [151, 155], [138, 187])])
  ], 'Heels down. Choose a comfortable depth.', 'M86 70v50m-6-7 6 7 6-7'),
  lunge: card('Reverse lunge', 'SIDE VIEW', 'floor', ['Stand tall', 'Step back & lower'], ['Stand tall with feet under your hips.', 'Step one foot back, bending both knees while the front foot stays flat.'], [stand,
    pose([154, 69], [151, 93], [146, 137], [line([155, 96], [177, 114], [200, 105]), line([146, 96], [123, 120], [107, 106])], [line([151, 136], [199, 139], [202, 188]), line([141, 139], [123, 184], [76, 188])])
  ], 'Keep the front foot planted.', 'M130 169H87m7-6-7 6 7 6'),
  pistol: card('Assisted pistol squat', 'SIDE VIEW', 'post', ['Hold a support', 'Lower on one leg'], ['Hold a stable support and lift one foot in front of you.', 'Lower on the standing leg with assistance while extending the other leg forward.'], [
    pose([152, 45], [153, 70], [158, 124], [line([156, 72], [205, 78], [254, 80]), line([150, 76], [201, 88], [254, 90])], [line([162, 125], [187, 145], [217, 149]), line([153, 126], [150, 158], [146, 188])]),
    pose([171, 96], [155, 116], [127, 153], [line([159, 115], [207, 108], [254, 100]), line([152, 120], [204, 117], [254, 110])], [line([130, 151], [186, 157], [235, 162]), line([124, 156], [164, 157], [146, 188])])
  ], 'Use the support throughout the movement.', 'M80 92v42m-6-7 6 7 6-7'),
  bridge: card('Glute bridge', 'SIDE VIEW', 'mat', ['Feet planted', 'Lift your hips'], ['Lie on your back with knees bent and both feet on the floor.', 'Press through your feet and lift your hips while shoulders stay on the mat.'], [lying,
    { ...lying, hip: [160, 147], legs: [line([161, 145], [207, 140], [241, 186]), line([159, 150], [205, 150], [232, 189])] }
  ], 'Squeeze glutes without arching your back.', 'M157 124V99m-6 7 6-7 6 7'),
  deadbug: card('Dead bug', 'SIDE VIEW', 'mat', ['Arms up, knees bent', 'Reach opposite limbs'], ['Lie on your back with arms pointing up and hips and knees bent.', 'Reach one arm overhead and extend the opposite leg while keeping your lower back grounded.'], [
    { ...lying, arms: [line([91, 176], [94, 140], [96, 104]), line([87, 181], [85, 145], [84, 110])], legs: [line([162, 177], [187, 131], [232, 132]), line([160, 181], [179, 139], [225, 141])] },
    { ...lying, arms: [line([91, 176], [94, 140], [96, 104]), line([87, 181], [55, 163], [27, 145])], legs: [line([162, 177], [211, 177], [263, 179]), line([160, 181], [179, 139], [225, 141])] }
  ], 'Opposite arm and leg. Back grounded.', 'M111 86Q60 87 34 116m0-9v9h9M238 152l23 10m-4-8 4 8-9 2'),
  hollow: card('Hollow body hold', 'SIDE VIEW', 'mat', ['Tuck & brace', 'Extend & hold'], ['Lie on your back, lift your shoulders slightly, and bring your knees toward your chest.', 'Extend your legs into a controlled hollow shape with arms reaching alongside your body.'], [
    { ...hollow, legs: [line([159, 178], [170, 127], [216, 136]), line([157, 183], [163, 134], [208, 145])] }, hollow
  ], 'Keep the lower back on the mat.'),
  'long-hollow': card('Extended hollow hold', 'SIDE VIEW', 'mat', ['Find your hollow', 'Reach long & hold'], ['Establish a hollow hold with shoulders and legs raised and your arms beside you.', 'Reach your arms overhead and lengthen your legs while your lower back stays grounded.'], [hollow,
    { ...hollow, arms: [line([91, 163], [61, 144], [30, 127]), line([85, 170], [56, 153], [25, 136])], legs: [line([159, 178], [218, 164], [276, 150]), line([157, 183], [215, 173], [271, 158])] }
  ], 'Lengthen without letting the back arch.'),
  pike: card('Pike push-up', 'SIDE VIEW', 'mat', ['Hips high', 'Bend your elbows'], ['Form an inverted V with hips high, hands planted, and arms straight.', 'Bend your elbows and lower your head toward the floor while maintaining the pike shape.'], [
    pose([94, 133], [115, 120], [169, 62], [line([117, 119], [103, 151], [90, 189]), line([111, 125], [89, 157], [73, 189])], [line([170, 64], [211, 122], [254, 188]), line([164, 69], [201, 130], [240, 188])]),
    pose([89, 166], [112, 151], [164, 87], [line([116, 148], [130, 174], [90, 189]), line([108, 154], [113, 181], [73, 189])], [line([166, 88], [208, 136], [254, 188]), line([160, 93], [199, 143], [240, 188])])
  ], 'Keep hips high; do not load your head.', 'M49 129v30m-6-7 6 7 6-7'),
  lean: card('Planche lean', 'SIDE VIEW', 'mat', ['Start in a plank', 'Lean forward & hold'], ['Start in a straight-arm plank with hands under your shoulders.', 'Shift your shoulders forward of your wrists, keeping elbows straight and toes grounded.'], [pushTop,
    pose([66, 105], [89, 120], [171, 148], [line([94, 120], [118, 154], [142, 189]), line([87, 125], [99, 156], [111, 189])], [line([174, 146], [224, 167], [274, 186]), line([169, 151], [215, 172], [263, 188])])
  ], 'Lean gently. Keep your feet grounded.', 'M117 78H77m7-6-7 6 7 6'),
  plank: card('High plank', 'SIDE VIEW', 'mat', ['Plant your hands', 'Brace & hold'], ['Place your hands on the floor and set your knees down to prepare.', 'Extend your legs and hold a straight line from shoulders to heels with steady breathing.'], [
    { ...pushTop, hip: [175, 144], legs: [line([177, 142], [200, 188], [248, 189]), line([172, 148], [191, 190], [236, 193])] }, pushTop
  ], 'Hands under shoulders. Breathe steadily.'),
  support: card('Parallel bar support', 'FRONT VIEW', 'parallel', ['Feet supported', 'Press down & hold'], ['Grip stable parallel bars with feet on the ground and arms straight.', 'Press into the bars and gently lift your feet, keeping shoulders down.'], [
    { ...support, legs: [line([167, 125], [170, 157], [174, 194]), line([153, 125], [150, 157], [146, 194])] }, support
  ], 'Straight arms. Keep shoulders down.'),
  lsit: card('Tuck L-sit', 'SIDE VIEW', 'parallel-side', ['Stable support', 'Tuck knees & hold'], ['Support yourself on parallel bars with arms straight.', 'Draw both knees toward your chest while pressing down through the bars.'], [sideSupport,
    { ...sideSupport, head: [135, 46], shoulder: [138, 70], hip: [143, 119], arms: [line([143, 74], [162, 102], [177, 131]), line([134, 74], [140, 107], [147, 140])], legs: [line([147, 118], [191, 90], [211, 115]), line([140, 122], [184, 101], [207, 126])] }
  ], 'Draw knees up without swinging.')
};

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const path = points => points.map((p, i) => `${i ? 'L' : 'M'}${p.join(' ')}`).join(' ');
function stroke(points, color, width) { return `<path d="${path(points)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`; }
function limb(points, leg, far) {
  const skin = far ? '#aa8065' : '#e4b894';
  const [root, joint, end] = points;
  const shortsEnd = [root[0] + (joint[0] - root[0]) * .57, root[1] + (joint[1] - root[1]) * .57];
  return stroke(points, '#172118', leg ? 18 : 13) + stroke(points, skin, leg ? 13 : 9) + (leg ? stroke([root, shortsEnd], far ? '#374c3d' : '#48614e', 17) + stroke([end, [end[0] + 10, end[1] + 1]], '#e0e5cf', 8) : `<circle cx="${end[0]}" cy="${end[1]}" r="5" fill="${skin}"/>`);
}
function athlete(p) {
  const [sx, sy] = p.shoulder, [hx, hy] = p.hip;
  const distance = Math.hypot(hx - sx, hy - sy);
  const nx = -(hy - sy) / distance, ny = (hx - sx) / distance;
  const sw = p.front ? 18 : 12, hw = p.front ? 12 : 9;
  const a = [sx + nx * sw, sy + ny * sw], b = [sx - nx * sw, sy - ny * sw], c = [hx - nx * hw, hy - ny * hw], d = [hx + nx * hw, hy + ny * hw];
  const [x, y] = p.head;
  return `<g class="illustrated-athlete">${limb(p.legs[0], true, true)}${limb(p.arms[0], false, true)}${stroke([p.head, p.shoulder], '#d8a984', 11)}<path d="${path([a, b, c, d])}Z" fill="#c9f66b" stroke="#192518" stroke-width="2.5" stroke-linejoin="round"/>${stroke([[sx + nx * 5, sy + ny * 5], [hx + nx * 5, hy + ny * 5]], '#e4ffad', 2)}${limb(p.legs[1], true, false)}${limb(p.arms[1], false, false)}<circle cx="${x}" cy="${y}" r="12" fill="#e4b894" stroke="#192518" stroke-width="2"/><path d="M${x - 11} ${y - 1}Q${x - 13} ${y - 15} ${x + 1} ${y - 13}Q${x + 13} ${y - 12} ${x + 11} ${y - 3}Q${x + 3} ${y - 8} ${x - 3} ${y - 2}Z" fill="#26382d"/>${p.prone ? '' : `<circle cx="${x + (p.front ? 4 : -5)}" cy="${y + 2}" r="1.2" fill="#26382d"/>`}</g>`;
}
function equipment(kind, p) {
  const floor = '<ellipse cx="160" cy="198" rx="124" ry="7" fill="#0b140e" opacity=".45"/><path d="M22 199H298" stroke="#59704c" stroke-width="1"/>';
  const bar = '<path d="M72 198V27H248V198" fill="none" stroke="#637c60" stroke-width="6" stroke-linecap="round"/><path d="M93 27H227" stroke="#dce8ce" stroke-width="5" stroke-linecap="round"/>';
  const parallel = '<g fill="none" stroke-linecap="round"><path d="M104 196V139h38v57M179 196V139h38v57" stroke="#637c60" stroke-width="5"/><path d="M98 139h51m24 0h50" stroke="#dce8ce" stroke-width="6"/></g>';
  const sideBars = '<g fill="none" stroke-linecap="round"><path d="M137 189v-58h70v58" stroke="#53694f" stroke-width="4"/><path d="M130 131h84" stroke="#aabca0" stroke-width="5"/><path d="M112 198v-58h72v58" stroke="#637c60" stroke-width="5"/><path d="M105 140h86" stroke="#dce8ce" stroke-width="6"/></g>';
  const wall = '<path d="M253 27v171h22V27" fill="#334630" stroke="#637c60" stroke-width="2"/><path d="m257 41 14-9m-14 28 14-9m-14 28 14-9m-14 28 14-9m-14 28 14-9m-14 28 14-9m-14 28 14-9m-14 28 14-9" stroke="#53674b"/>';
  const post = '<path d="M256 33v163m-13 0h26" stroke="#8da37a" stroke-width="7" stroke-linecap="round"/>';
  const band = `<path d="M54 33v163" stroke="#637c60" stroke-width="6"/><circle cx="54" cy="84" r="4" fill="#dce8ce"/>${p.arms.map(a => stroke([[54, 84], a[2]], '#e9cb79', 2.5)).join('')}`;
  const mat = '<path d="M40 190h246l15 9H24Z" fill="#435b3e" stroke="#6c8556" stroke-width="1"/>';
  return floor + ({ bar, parallel, 'parallel-side': sideBars, wall, post, band, mat }[kind] || '');
}
let sequence = 0;
export function exerciseIllustration(id, { phase = 1, decorative = false } = {}) {
  const art = ILLUSTRATIONS[id];
  if (!art) return '';
  const index = phase === 0 ? 0 : 1;
  const uid = `exercise-art-${++sequence}`;
  const p = art.poses[index];
  return `<svg class="exercise-art" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" ${decorative ? 'aria-hidden="true"' : `role="img" aria-labelledby="${uid}-title ${uid}-desc"`}><title id="${uid}-title">${esc(art.name)} — ${esc(art.labels[index])}</title><desc id="${uid}-desc">${esc(art.descriptions[index])}</desc><circle cx="160" cy="113" r="83" fill="#31452b" opacity=".65"/><circle cx="160" cy="113" r="98" fill="none" stroke="#718c58" stroke-width=".6" opacity=".25"/><path d="M31 108h258M160 16v184" fill="none" stroke="#718c58" stroke-width=".6" stroke-dasharray="3 6" opacity=".25"/>${equipment(art.equipment, p)}${athlete(p)}${index && art.motion ? `<path class="movement-arrow" d="${art.motion}" fill="none" stroke="#e9cb79" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : ''}</svg>`;
}
export function exerciseGuide(id) {
  const art = ILLUSTRATIONS[id];
  if (!art) return '';
  return `<section class="movement-guide" aria-label="${esc(art.name)} illustrated guide"><div class="guide-topline"><span>THE MOVEMENT, IN FOCUS</span><span>${art.view}</span></div><div class="movement-frames">${art.labels.map((label, i) => `<figure class="movement-frame">${exerciseIllustration(id, { phase: i })}<figcaption><span>0${i + 1}</span>${esc(label)}</figcaption></figure>`).join('')}</div><p class="visual-cue">${esc(art.cue)}</p></section>`;
}
