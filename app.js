import { CloudStore, cloudData, emptyData } from './cloud-store.js';
import { trainingApi } from './cloud-api.js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';
import { exerciseIllustration, exerciseGuide, ILLUSTRATIONS } from './illustrations.js';
import { LEVELS, GOALS, EQUIPMENT, DEFAULT_PROFILE, EXERCISES, PATHS, getExercise, validateProfile, localDate, weekDates, schedule, makePlan, completedSets, validHistory } from './training.js';

const KEY = 'kalistenix.v1';
let storageKey = KEY;
let accountUser = null;
let cloud = null;
let supabase = null;
let accountLoading = false;
let authReady = false;
let authFailed = false;
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icons = { home: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', plan: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 5h3m3 0h3"/>', skills: '<path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/>', library: '<path d="M4 4h6a2 2 0 0 1 2 2v15a3 3 0 0 0-3-2H4zm16 0h-6a2 2 0 0 0-2 2v15a3 3 0 0 1 3-2h5z"/>', progress: '<path d="M4 3v18h17M8 16l4-5 4 2 5-8"/>', arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', check: '<path d="m5 12 4 4L19 6"/>', bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7z"/>', settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>', flame: '<path d="M12 2c2 6 7 7 7 13a7 7 0 0 1-14 0c0-3 2-5 4-7 0 5 3 3 3-6z"/>', play: '<path d="m8 4 12 8-12 8z"/>', download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>' };
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.bolt}</svg>`;
let state = { profile: { ...DEFAULT_PROFILE }, history: [], mastered: [], active: null, configured: false };
let storageWarning = false;
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (saved && validateProfile(saved.profile) && validHistory(saved.history)) {
    state = { ...state, ...saved, mastered: Array.isArray(saved.mastered) ? saved.mastered.filter(id => getExercise(id)) : [] };
    if (state.active && !validActive(state.active)) state.active = null;
  }
} catch { storageWarning = true; }
let page = 'home';
let filter = 'All';
let query = '';
function validActive(s) {
  return s && typeof s.id === 'string' && Number.isFinite(s.startedAt) && Number.isFinite(s.restUntil) && Array.isArray(s.sets) && s.sets.every(t => getExercise(t.exerciseId) && Number.isInteger(t.index) && t.index >= 0 && t.index < 10 && Number.isFinite(t.value) && t.value > 0 && t.value <= 999) && s.plan && typeof s.plan.title === 'string' && Number.isFinite(s.plan.rest) && Array.isArray(s.plan.exercises) && s.plan.exercises.length > 0 && s.plan.exercises.every(e => getExercise(e.id) && Number.isInteger(e.sets) && e.sets >= 1 && e.sets <= 4);
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { storageWarning = true; toast('Device storage is unavailable. Export your progress before closing.'); }
  if (accountUser && cloud) cloud.save(state);
}
let toastTimeout;
function toast(text) { const t = document.querySelector('#toast'); t.textContent = text; t.classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => t.classList.remove('visible'), 4200); }
function openModal(title, body) { modal.innerHTML = `<div class="modal-head"><h2 id="dialog-title">${title}</h2><button class="icon-button" data-action="close" aria-label="Close dialog">${icon('close')}</button></div>${body}`; modal.setAttribute('aria-labelledby', 'dialog-title'); modal.showModal(); }
const totalSets = plan => plan.exercises.reduce((n, e) => n + e.sets, 0);
const trainingDays = () => schedule(state.profile.days);
const thisWeek = () => state.history.filter(s => weekDates().includes(s.date));
const dayLabel = date => new Date(date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

function render() {
  const nav = [['home', 'Overview'], ['plan', 'My plan'], ['skills', 'Skill paths'], ['library', 'Exercise library'], ['progress', 'My progress']];
  app.innerHTML = `<aside class="sidebar"><a class="brand" href="#home" aria-label="Kalistenix home"><img src="./icon.svg" alt="">kalistenix<span>®</span></a><div class="sidebar-label">YOUR TRAINING SPACE</div><nav aria-label="Main navigation">${nav.map(([id, label]) => `<button aria-label="${label}" data-page="${id}" class="nav-item ${page === id ? 'active' : ''}" ${page === id ? 'aria-current="page"' : ''}>${icon(id)}<span>${label}</span>${page === id ? '<i></i>' : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="small-manifesto">No shortcuts.<br>Just <em>you</em>, getting stronger.</div><div class="local-note"><span class="status-dot"></span> ${accountUser ? 'Account progress · see cloud status above' : 'Guest progress on this device'}</div><button class="profile" data-action="profile"><span class="avatar">${escape(state.profile.name ? state.profile.name.slice(0, 2).toUpperCase() : 'KX')}</span><span><strong>${escape(state.profile.name || 'Your training profile')}</strong><small>${state.profile.level} athlete</small></span>${icon('settings')}</button></div></aside><div class="workspace"><header class="topbar"><span class="breadcrumb">YOUR JOURNEY <span>/</span> ${escape(page === 'workout' ? 'WORKOUT' : nav.find(n => n[0] === page)?.[1].toUpperCase() || 'OVERVIEW')}</span><div class="topbar-right"><span class="today-date">${new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span><button class="level-pill" data-action="profile"><span class="status-dot"></span>${state.profile.level}${icon('settings')}</button></div></header><main id="main" tabindex="-1">${storageWarning ? '<div class="notice">Browser storage is unavailable or could not be read. Export new progress before closing.</div>' : ''}${page === 'home' ? home() : page === 'plan' ? planPage() : page === 'skills' ? skillsPage() : page === 'library' ? libraryPage() : page === 'progress' ? progressPage() : workoutPage()}</main><footer>BUILT BY YOU. ONE REP AT A TIME.<button data-action="about">Training guidance & privacy ↗</button></footer></div>`;
  tick();
}
function heading(eyebrow, title, subtitle, action = '') { return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="muted">${subtitle}</p></div>${action}</div>`; }
function startButton(label = 'Start workout') { return `<button class="button primary" data-action="start">${icon('play')}${state.active ? 'Resume workout' : label}${icon('arrow')}</button>`; }
function home() {
  const plan = makePlan(state.profile, state.history);
  const week = thisWeek();
  const done = new Set(week.map(s => s.date)).size;
  const minutes = state.history.reduce((n, s) => n + s.minutes, 0);
  return `${heading('SHOW UP. LEVEL UP.', `Your next level starts here<span class="lime">.</span>`, state.profile.name ? `Good to see you, ${escape(state.profile.name)}. Make a little progress today.` : 'A stronger body. A new skill. A little better than yesterday.', `<button class="button secondary" data-action="profile">${icon('settings')}Personalize my plan</button>`)}
  <section class="hero"><div class="hero-copy"><div class="tag"><span class="status-dot"></span> ${state.profile.level.toUpperCase()} · YOUR NEXT SESSION</div><h2>${plan.title.replace(' ', '<br>')}</h2><p>Build strength you can feel.<br>Follow your plan, one good rep at a time.</p><div class="hero-meta"><span>${icon('clock')}${plan.minutes} min</span><span>${icon('bolt')}${plan.exercises.length} exercises</span><span>${plan.focus}</span></div>${startButton()}<span class="hero-footnote">${state.configured ? `Made for your goal: ${escape(state.profile.goal.toLowerCase())}` : 'A beginner plan to get you started. Personalize it anytime.'}</span></div><div class="hero-art"><div class="orbit-label">STRENGTH / CONTROL / PROGRESS</div>${exerciseIllustration('push', { phase: 0, decorative: true })}<span class="art-caption"><i></i> YOUR BODY. YOUR POTENTIAL.</span><span class="giant-number">01</span></div></section>
  <section class="stat-grid" aria-label="Training statistics"><div class="stat-card"><span>This week ${icon('plan')}</span><strong>${done}<small> / ${state.profile.days}</small></strong><p>training days logged</p><div class="mini-bars">${Array.from({ length: state.profile.days }, (_, i) => `<i class="${i < done ? 'filled' : ''}"></i>`).join('')}</div></div><div class="stat-card"><span>Time invested ${icon('clock')}</span><strong>${minutes}<small> min</small></strong><p>every minute moves you forward</p></div><div class="stat-card"><span>Sessions completed ${icon('bolt')}</span><strong>${state.history.length.toString().padStart(2, '0')}</strong><p>${state.history.length ? 'Keep building your momentum' : 'Your first session is waiting'}</p></div><div class="stat-card"><span>Milestones owned ${icon('skills')}</span><strong>${state.mastered.length.toString().padStart(2, '0')}</strong><p>self-assessed skill milestones</p></div></section>
  <div class="dashboard-bottom"><section class="panel"><div class="section-heading"><h2>Your week, in motion</h2><button class="text-button" data-page="plan">View plan ${icon('arrow')}</button></div>${weekStrip()}<div class="coach-note">${icon('bolt')}<div><strong>Consistency beats intensity.</strong><p>Leave room to recover. Aim for controlled reps and finish with a little left in the tank.</p></div></div></section><section class="panel skill-teaser"><div class="section-heading"><h2>A skill worth building</h2><span class="tiny-label">SKILL PATH</span></div><div class="teaser-body"><div class="mini-art">${exerciseIllustration('pull', { decorative: true })}</div><div><span class="eyebrow">FROM THE GROUND UP</span><h3>Your first<br>strict pull-up</h3><p>Small steps. A stronger you.</p><button class="text-button lime" data-page="skills">Explore your path ${icon('arrow')}</button></div></div></section></div>`;
}
function weekStrip() { return `<div class="week-strip">${weekDates().map((d, i) => { const done = state.history.some(s => s.date === d); const train = trainingDays().includes(i); return `<div class="day ${d === localDate() ? 'today' : ''} ${done ? 'done' : ''}"><span>${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}</span><strong>${new Date(d + 'T12:00:00').getDate()}</strong><div>${done ? icon('check') : train ? icon('bolt') : '<span class="rest-dash">—</span>'}</div><small>${done ? 'Logged' : train ? 'Train' : 'Recover'}</small></div>`; }).join('')}</div>`; }
function exerciseRows(plan) { return plan.exercises.map((e, i) => `<button class="exercise-row" data-exercise="${e.id}"><span class="row-number">${String(i + 1).padStart(2, '0')}</span><span class="exercise-thumbnail">${exerciseIllustration(e.id, { decorative: true })}</span><span class="exercise-name"><strong>${e.name}</strong><small>${e.pattern} · ${e.equipment.join(', ') || 'Bodyweight'}</small></span><span class="exercise-prescription">${e.sets} sets <span>× ${e.min}–${e.max} ${e.unit}</span></span>${icon('arrow')}</button>`).join(''); }
function planPage() {
  const plan = makePlan(state.profile, state.history);
  return `${heading('YOUR BLUEPRINT', 'A plan that meets you here.', `${state.profile.level} · ${state.profile.days} days a week · ${escape(state.profile.goal)}`, `<button class="button secondary" data-action="profile">${icon('settings')}Edit my plan</button>`)}<section class="panel">${weekStrip()}</section><div class="plan-layout"><section class="panel"><div class="section-heading"><div><p class="eyebrow">NEXT SESSION</p><h2>${plan.title}</h2></div><span class="pill">${plan.minutes} MIN</span></div><p class="muted">${plan.focus} · ${totalSets(plan)} working sets · ${plan.rest}s rest between sets</p><div class="exercise-list">${exerciseRows(plan)}</div>${startButton()}</section><aside class="stack"><section class="panel accent-panel"><p class="eyebrow">THE PROGRESSION RULE</p><h2>Earn the next step.</h2><p>Start at the low end of the range. When every set feels controlled, gradually add reps or hold time.</p><p>Two complete sessions at the top of the range with good form and manageable effort earn a prompt to try a harder variation.</p><button class="text-button" data-page="skills">See skill paths ${icon('arrow')}</button></section><section class="panel"><h3>Before you start</h3><p>Warm up for about 5 minutes with easy movement and gentle practice reps. Stop if you feel pain.</p><p>${state.profile.days === 4 ? 'Your four-day plan alternates upper and lower sessions. Take Wednesday and the weekend to recover.' : 'Space sessions across the week, with a recovery day between full-body workouts.'}</p>${plan.pullLimited ? '<div class="notice">No pulling equipment selected. Floor drills prepare your shoulders, but do not replace loaded pulling. A rated pull-up bar or resistance band opens up your pull training.</div>' : ''}</section></aside></div>`;
}
function skillsPage() { return `${heading('FROM FIRST REP TO NEXT LEVEL', 'Strength is a series of small wins.', 'Explore the steps. Practice with control. Mark a milestone when you can repeat it comfortably.')}<div class="path-grid">${PATHS.map((path, i) => { const count = path.steps.filter(s => state.mastered.includes(s)).length; return `<section class="panel path-card"><div class="path-top"><span class="eyebrow">PATH 0${i + 1} / ${path.pattern.toUpperCase()}</span><span class="pill">${count} / ${path.steps.length}</span></div><h2>${path.title}</h2><p>${path.subtitle}</p><div class="path-track">${path.steps.map((id, j) => { const e = getExercise(id), done = state.mastered.includes(id); return `<div class="path-step ${done ? 'mastered' : ''}"><span class="step-node">${done ? icon('check') : j + 1}</span><button class="step-info" data-exercise="${id}"><strong>${e.name}</strong><small>${e.min}–${e.max} ${e.unit} · ${e.level}</small></button><button class="milestone-button" data-milestone="${id}" aria-label="${done ? 'Unmark' : 'Assess'} ${e.name}" aria-pressed="${done}">${done ? icon('check') : '+'}</button></div>`; }).join('')}</div></section>`; }).join('')}</div><p class="fine-print">Milestones are your own form assessments, not coach-verified certifications. Each path progresses independently of your selected training level.</p>`; }
function libraryPage() { return `${heading('MOVE WITH INTENTION', 'Know the movement.', 'Technique cues, easier options, and the building blocks of your training.')}<div class="library-toolbar"><label class="search-box"><span>Search</span><input id="exercise-search" type="search" placeholder="Find an exercise…" value="${escape(query)}"></label><div class="filters" aria-label="Filter by level">${['All', ...LEVELS].map(l => `<button data-filter="${l}" aria-pressed="${l === filter}" class="${l === filter ? 'selected' : ''}">${l}</button>`).join('')}</div></div><div id="exercise-results">${libraryResults()}</div>`; }
function libraryResults() { const list = EXERCISES.filter(e => (filter === 'All' || e.level === filter) && `${e.name} ${e.pattern} ${e.equipment.join(' ')}`.toLowerCase().includes(query.toLowerCase())); return `<p class="result-count">${list.length} MOVEMENTS</p><div class="library-grid">${list.length ? list.map(e => `<button class="library-card" aria-label="View ${e.name} movement guide" data-exercise="${e.id}"><div class="exercise-visual">${exerciseIllustration(e.id, { decorative: true })}<span class="visual-label">${e.pattern.toUpperCase()}</span><span class="visual-angle">${ILLUSTRATIONS[e.id].view}</span></div><div class="library-card-copy"><span class="eyebrow">${e.level}</span><h3>${e.name}</h3><p>${e.equipment.join(' · ') || 'No equipment'}</p><span class="text-button">Movement guide <span class="view-count">2 VIEWS</span>${icon('arrow')}</span></div></button>`).join('') : '<div class="empty-state"><h3>No movements found</h3><p>Try another name or choose a different level.</p></div>'}</div>`; }
function progressPage() {
  const dates = weekDates(); const counts = dates.map(d => state.history.filter(s => s.date === d).reduce((n, s) => n + s.sets.length, 0)); const max = Math.max(10, ...counts);
  return `${heading('THE WORK ADDS UP', 'See how far you’ve come.', 'Your real sessions. Your earned progress. No comparison needed.', `<button class="button secondary" data-action="export">${icon('download')}Export progress</button>`)}<div class="progress-grid"><section class="panel"><div class="section-heading"><h2>This week’s training</h2><span class="pill">SETS LOGGED</span></div><div class="chart" role="img" aria-label="${dates.map((d, i) => `${dayLabel(d)}: ${counts[i]} sets`).join('; ')}">${counts.map((n, i) => `<div class="chart-column"><strong>${n}</strong><div class="chart-bar" style="height:${Math.max(2, n / max * 140)}px"></div><span>${['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span></div>`).join('')}</div></section><section class="panel progress-summary"><span class="eyebrow">YOUR LIFETIME TOTAL</span><strong>${state.history.reduce((n, s) => n + s.sets.length, 0)}<span>working sets</span></strong><p>Progress starts with showing up.<br>Every logged set belongs here.</p><button class="text-button" data-action="import">Restore a saved backup ${icon('arrow')}</button><input id="import-file" type="file" accept="application/json,.json" hidden></section></div><section class="panel history-panel"><div class="section-heading"><h2>Session journal</h2><span class="pill">${state.history.length} SESSIONS</span></div>${state.history.length ? [...state.history].reverse().map(s => `<button class="history-row" data-session="${escape(s.id)}"><span class="history-icon">${icon('check')}</span><span><strong>${escape(s.title)}</strong><small>${dayLabel(s.date)} · ${s.sets.length} sets logged${s.completed ? '' : ' · Partial session'}</small></span><span class="pill">${s.effort}</span><span>${s.minutes} min</span>${icon('arrow')}</button>`).join('') : `<div class="empty-state">${icon('progress')}<h3>Your story starts with one session.</h3><p>Finish a workout and it will appear here, with every set you logged.</p>${startButton('Log my first workout')}</div>`}</section>`;
}
function workoutPage() {
  const s = state.active; if (!s) { page = 'home'; return home(); }
  const done = completedSets(s).length; const total = totalSets(s.plan);
  return `${heading('ONE REP AT A TIME', s.plan.title, `${done} of ${total} sets logged · Your session saves as you go.`, '<button class="button secondary" data-action="leave">Pause & leave</button>')}<div class="session-toolbar"><div><span class="eyebrow">SESSION PROGRESS</span><progress value="${done}" max="${total}" aria-label="Workout sets completed"></progress></div><div class="rest-timer" role="timer"><span>REST TIMER</span><strong id="rest-clock">Ready</strong><button class="text-button" data-action="skip-rest">Skip rest</button></div></div><div class="notice">Use a comfortable range. Keep 1–3 good reps in reserve. Stop for pain, dizziness, or unusual symptoms.</div><div class="workout-list">${s.plan.exercises.map(e => `<section class="panel workout-exercise"><div class="section-heading"><div><span class="eyebrow">${e.pattern} · ${e.min}–${e.max} ${e.unit}</span><h2>${e.name}</h2></div><button class="text-button" data-exercise="${e.id}">Form guide ↗</button></div>${e.ready ? '<p class="progression-note">Top of the range, twice. Consider a harder variation in Skill paths when your form is consistent.</p>' : ''}<p>${e.cue}</p><details class="workout-guide"><summary>See illustrated movement</summary>${exerciseGuide(e.id)}</details><div class="set-rows">${Array.from({ length: e.sets }, (_, i) => { const set = s.sets.find(t => t.exerciseId === e.id && t.index === i); return `<form class="set-row ${set ? 'logged' : ''}" data-set-form="${e.id}" data-index="${i}"><span>SET ${i + 1}</span><label><input aria-label="${e.name} set ${i + 1} ${e.unit}" name="value" type="number" min="1" max="999" step="1" required value="${set?.value || e.min}" ${set ? 'disabled' : ''}><span>${e.unit}</span></label><button class="button ${set ? 'secondary' : 'primary'}" ${set ? `type="button" data-undo="${e.id}" data-index="${i}"` : 'type="submit"'}>${set ? `${icon('check')}Logged · undo` : 'Log set'}</button></form>`; }).join('')}</div></section>`).join('')}</div><div class="finish-bar"><button class="text-button danger" data-action="discard">Discard session</button><button class="button primary" data-action="finish" ${done ? '' : 'disabled'}>${done === total ? 'Finish workout' : 'Finish partial workout'}${icon('check')}</button></div>`;
}
function profileModal() { openModal('Make it your plan.', `<p class="muted">Choose your starting point. You can adjust this as you grow.</p><form id="profile-form"><label class="field">Your name <span class="optional">optional</span><input name="name" maxlength="40" autocomplete="given-name" value="${escape(state.profile.name)}" placeholder="What should we call you?"></label><fieldset><legend>Your experience</legend><div class="choice-grid">${LEVELS.map((l, i) => `<label class="choice"><input type="radio" name="level" value="${l}" ${state.profile.level === l ? 'checked' : ''}><strong>${l}</strong><small>${['Learning the foundations', 'Comfortable with basic reps', 'Ready for harder variations'][i]}</small></label>`).join('')}</div></fieldset><label class="field">Your focus<select name="goal">${GOALS.map(g => `<option ${g === state.profile.goal ? 'selected' : ''}>${g}</option>`).join('')}</select></label><label class="field">Training days per week<select name="days">${[2, 3, 4].map(d => `<option value="${d}" ${d === state.profile.days ? 'selected' : ''}>${d} days${d === 4 ? ' · upper / lower split' : ' · full body'}</option>`).join('')}</select></label><fieldset><legend>Your equipment</legend><p class="muted">No equipment? Leave these unchecked.</p><div class="equipment-options">${EQUIPMENT.map(e => `<label><input name="equipment" type="checkbox" value="${e}" ${state.profile.equipment.includes(e) ? 'checked' : ''}>${e}</label>`).join('')}</div></fieldset>${state.active ? '<p class="notice">Your current workout keeps its original plan. Changes apply to your next session.</p>' : ''}<button class="button primary full" type="submit">Build my plan ${icon('arrow')}</button></form>`); }
function start() { if (state.active) { page = 'workout'; render(); window.scrollTo(0, 0); return; } openModal('Set yourself up for a good session.', `<div class="warmup-list"><p><b>01 / Get moving.</b> Take about 5 minutes for an easy walk, joint movements, and gentle practice reps.</p><p><b>02 / Check your space.</b> Use a clear floor and stable, rated equipment.</p><p><b>03 / Work at your pace.</b> Choose easier variations if needed. Stop if a movement hurts.</p></div><button class="button primary full" data-action="begin">I’m warmed up. Let’s go ${icon('arrow')}</button>`); }
function finish() { const s = state.active; if (!s || !s.sets.length) return; openModal('You showed up. That counts.', `<p class="muted">${s.sets.length} of ${totalSets(s.plan)} sets logged. Take a moment to reflect.</p><form id="finish-form"><label class="field">How did this session feel?<select name="effort"><option>Right on</option><option>Easy</option><option>Hard</option></select></label><label class="check-label"><input type="checkbox" name="form">My logged sets used controlled, pain-free form.</label><p class="fine-print">Your feedback helps determine when to suggest a harder variation. No need to rush.</p><button class="button primary full" type="submit">Save workout ${icon('check')}</button></form>`); }
function exerciseModal(id) { const e = getExercise(id); if (!e) return; openModal(e.name, `<div class="guide-meta"><span class="pill">${e.level}</span><span>${e.pattern} · ${e.equipment.join(', ') || 'No equipment'}</span></div>${exerciseGuide(e.id)}<h3>The movement</h3><p>${e.cue}</p><h3>Make it easier</h3><p>${e.easier}</p><h3>Practice target</h3><p>${e.min}–${e.max} ${e.unit}. Start at the low end; form comes first.</p><p class="fine-print">Illustrations show key positions; use the technique cues for the full movement. Advanced skills benefit from qualified coaching.</p>`); }
function exportData() { const blob = new Blob([JSON.stringify({ version: 1, profile: state.profile, history: state.history, mastered: state.mastered }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `kalistenix-${localDate()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Progress exported. Keep your backup somewhere safe.'); }
function about() { openModal('Built for your next level.', `<h3>Training guidance</h3><p>Kalistenix offers general adult fitness templates. The exercise selection, rep ranges, and skill milestones are product starting points, not individually validated prescriptions. Choose a level you can perform with control; seek qualified guidance for injuries or advanced skills.</p><p>Our approach draws on gradual progression and regular resistance training: <a href="https://www.nhs.uk/live-well/exercise/strength-exercises/" target="_blank" rel="noopener">NHS strength exercises</a> and the <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/" target="_blank" rel="noopener">2026 ACSM position stand</a>.</p><h3>Your training data</h3><p>Guest progress stays in this browser. Signing in with an email link enables Supabase storage for your profile, completed or partial saved sessions, and skill milestones. Your email is used for account access. Each account can access only its own cloud progress.</p><p>Account data is also cached on this device. Active workouts stay on the device where you started them; save a session to sync it. Cloud saving can fail when offline: check the account status and retry when connected. Export a backup before clearing browser data.</p><p>Guest progress is never uploaded automatically. To move it into an account, export your guest progress, sign in, then restore that backup from My progress. Restoring replaces the account’s saved progress. Signing out returns to this device’s separate guest profile.</p>`); }

document.addEventListener('click', event => {
  const el = event.target.closest('button, a.brand'); if (!el) return;
  if (el.matches('a.brand')) { event.preventDefault(); page = 'home'; render(); }
  if (el.dataset.page) { page = el.dataset.page; render(); window.scrollTo(0, 0); }
  if (el.dataset.exercise) exerciseModal(el.dataset.exercise);
  if (el.dataset.filter) { filter = el.dataset.filter; render(); }
  if (el.dataset.milestone) { const id = el.dataset.milestone; if (state.mastered.includes(id)) { state.mastered = state.mastered.filter(s => s !== id); save(); render(); } else { const e = getExercise(id); openModal('Own the movement.', `<h3>${e.name}</h3><p>Can you repeat ${e.max} ${e.unit} with controlled, pain-free form across at least two sessions?</p><p class="muted">This is your own assessment. Take your time before advancing.</p><button class="button primary full" data-confirm-milestone="${id}">Yes, mark this milestone ${icon('check')}</button>`); } }
  if (el.dataset.confirmMilestone) { if (!state.mastered.includes(el.dataset.confirmMilestone)) state.mastered.push(el.dataset.confirmMilestone); save(); modal.close(); render(); toast('Milestone recorded. Keep building.'); }
  if (el.dataset.undo && state.active) { state.active.sets = state.active.sets.filter(s => !(s.exerciseId === el.dataset.undo && s.index === Number(el.dataset.index))); save(); render(); }
  if (el.dataset.session) { const s = state.history.find(s => s.id === el.dataset.session); if (s) openModal(escape(s.title), `<p>${dayLabel(s.date)} · ${s.minutes} min · ${s.effort} · ${s.form ? 'Controlled form reported' : 'Form not confirmed'}</p><div class="session-detail">${s.sets.map(t => `<p><strong>${getExercise(t.exerciseId).name}</strong><span>Set ${t.index + 1}: ${t.value} ${getExercise(t.exerciseId).unit}</span></p>`).join('')}</div>`); }
  const action = el.dataset.action;
  if (action === 'close') modal.close();
  if (action === 'profile') profileModal();
  if (action === 'start') start();
  if (action === 'begin') { if (!state.active) state.active = { id: crypto.randomUUID(), plan: makePlan(state.profile, state.history), startedAt: Date.now(), elapsedMs: 0, resumedAt: Date.now(), restUntil: 0, sets: [] }; save(); modal.close(); page = 'workout'; render(); window.scrollTo(0, 0); }
  if (action === 'skip-rest' && state.active) { state.active.restUntil = 0; save(); tick(); }
  if (action === 'leave') { page = 'home'; pauseActive(); render(); }
  if (action === 'finish') finish();
  if (action === 'discard') openModal('Discard this session?', '<p>Your uncompleted session and its logged sets will be removed. Past workouts stay in your journal.</p><button class="button danger-button full" data-action="confirm-discard">Discard session</button>');
  if (action === 'confirm-discard') { state.active = null; save(); modal.close(); page = 'home'; render(); }
  if (action === 'export') exportData();
  if (action === 'import') document.querySelector('#import-file').click();
  if (action === 'about') about();
  if (page === 'workout' && state.active && !state.active.resumedAt) { state.active.resumedAt = Date.now(); save(); }
  if (page !== 'workout') pauseActive();
});
function pauseActive() { const s = state.active; if (s?.resumedAt) { s.elapsedMs = (s.elapsedMs || 0) + Date.now() - s.resumedAt; s.resumedAt = null; save(); } }
document.addEventListener('submit', event => {
  if (event.target.id === 'signin-form') return;
  event.preventDefault(); const form = event.target; const data = new FormData(form);
  if (form.id === 'profile-form') { const profile = { name: String(data.get('name')).trim(), level: data.get('level'), goal: data.get('goal'), days: Number(data.get('days')), equipment: data.getAll('equipment') }; if (!validateProfile(profile)) return; state.profile = profile; state.configured = true; save(); modal.close(); render(); toast('Your plan is ready. Let’s build.'); }
  if (form.dataset.setForm && state.active) { const value = Number(data.get('value')); if (!Number.isInteger(value) || value < 1 || value > 999) return; const id = form.dataset.setForm; const index = Number(form.dataset.index); if (state.active.sets.some(s => s.exerciseId === id && s.index === index)) return; state.active.sets.push({ exerciseId: id, index, value }); state.active.restUntil = Date.now() + state.active.plan.rest * 1000; save(); render(); toast('Set logged. Take your rest.'); }
  if (form.id === 'finish-form' && state.active) { const s = state.active; pauseActive(); state.history.push({ id: s.id, date: localDate(), title: s.plan.title, minutes: Math.max(1, Math.round((s.elapsedMs || 0) / 60000)), sets: completedSets(s), effort: data.get('effort'), form: data.has('form'), completed: s.sets.length === totalSets(s.plan) }); state.active = null; save(); modal.close(); page = 'progress'; render(); window.scrollTo(0, 0); toast('Workout saved. One session stronger.'); }
});
document.addEventListener('input', event => { if (event.target.id === 'exercise-search') { query = event.target.value; document.querySelector('#exercise-results').innerHTML = libraryResults(); } });
let pendingImport;
document.addEventListener('change', async event => {
  if (event.target.id !== 'import-file') return;
  const file = event.target.files[0]; if (!file) return;
  try { if (file.size > 5000000) throw Error(); const value = JSON.parse(await file.text()); if (value.version !== 1 || !validateProfile(value.profile) || !validHistory(value.history) || !Array.isArray(value.mastered) || !value.mastered.every(id => getExercise(id))) throw Error(); pendingImport = value; openModal('Restore this backup?', `<p>This backup contains ${value.history.length} sessions. Restoring replaces this device’s current profile, history, milestones, and active workout.</p><button class="button secondary full" data-action="export">Export current progress first</button><button class="button primary full spaced" id="restore-backup">Replace with this backup</button>`); } catch { toast('This file is not a valid Kalistenix backup. Your data was not changed.'); } event.target.value = '';
});
document.addEventListener('click', event => { if (event.target.closest('#restore-backup') && pendingImport) { state = { profile: pendingImport.profile, history: pendingImport.history, mastered: [...new Set(pendingImport.mastered)], active: null, configured: true }; pendingImport = null; save(); modal.close(); render(); toast('Your progress has been restored.'); } });
function tick() { const clock = document.querySelector('#rest-clock'); if (!clock || !state.active) return; const seconds = Math.max(0, Math.ceil((state.active.restUntil - Date.now()) / 1000)); clock.textContent = seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'Ready'; }
setInterval(tick, 500);
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseActive(); else if (page === 'workout' && state.active) { state.active.resumedAt = Date.now(); save(); } });
window.addEventListener('pagehide', pauseActive);
// A restored session starts paused; time spent away never counts as training time.
if (state.active) { state.active.resumedAt = null; save(); }
render();

const syncLabels = {
  guest: 'Guest · saved on this device',
  loading: 'Checking cloud progress…',
  pending: 'Changes waiting to save',
  saving: 'Saving to your account…',
  synced: 'Saved to your account',
  conflict: 'Another device has different progress',
  error: 'Cloud unavailable · retry to sync',
  'storage-error': 'Cloud saved · device storage unavailable',
};
function renderAccount() {
  const status = cloud?.status || 'guest';
  document.querySelector('#account-bar').innerHTML = `<div class="account-copy"><strong>${accountUser ? escape(accountUser.email || 'Your account') : 'Take your progress with you.'}</strong><span role="status">${accountUser ? syncLabels[status] : authFailed ? 'Sign-in unavailable. Guest training still works.' : syncLabels.guest}</span></div><div class="account-actions">${accountUser ? `${['error', 'storage-error'].includes(status) ? '<button class="button secondary" data-account="retry">Retry cloud save</button>' : ''}${status === 'conflict' ? '<button class="button secondary" data-account="conflict">Review differences</button>' : ''}<button class="button secondary" data-account="manage">Account</button>` : `<button class="button secondary" data-account="signin" ${authReady ? '' : 'disabled'}>${authFailed ? 'Sign-in unavailable' : authReady ? 'Sign in / Create account' : 'Connecting…'}</button>`}</div>`;
  app.inert = accountLoading;
  app.setAttribute('aria-busy', String(accountLoading));
}
function accountModal() {
  if (!accountUser) {
    openModal('Keep building. On any device.', `<p>Sign in or create an account with an email link. Your saved workouts, profile, and milestones will sync to your account.</p><form id="signin-form"><label class="field">Email address<input name="email" type="email" autocomplete="email" maxlength="254" placeholder="you@example.com" required></label><button class="button primary full" type="submit">Send sign-in link</button><p id="signin-status" role="status" class="fine-print"></p></form><p class="fine-print">Open the link in this same browser. Your existing guest progress stays separate. To move it later, export it first and restore the backup after signing in.</p>`);
    return;
  }
  openModal('Your training account', `<p>Signed in as <strong>${escape(accountUser.email || 'your account')}</strong>.</p><p>${syncLabels[cloud.status]}</p><p>Your saved sessions, profile, and milestones sync across devices. An in-progress workout stays on this device until you save it.</p><p>To bring in guest progress, sign out, export it from My progress, then sign in and restore the backup. Restore replaces this account’s progress.</p><button class="button secondary full" data-action="export">Export current progress</button><button class="button secondary full spaced" data-account="refresh">Check for cloud updates</button><button class="button secondary full spaced" data-account="signout">Sign out</button><p class="fine-print">${cloud.cache?.dirty ? 'Some changes have not reached the cloud. They stay cached for this account on this device. Export a backup before signing out.' : 'Signing out returns to your separate guest profile. Account progress remains cached on this device for your next sign-in.'}</p>`);
}
function conflictModal() {
  openModal('Choose which progress to keep.', `<p>This device and your account have different progress. Cloud saving is paused so neither copy is overwritten automatically.</p><p>Export this device’s progress before choosing. “Use cloud progress” replaces the profile, journal, and milestones shown here. “Keep this device’s progress” replaces the account’s cloud copy.</p><button class="button secondary full" data-action="export">Export this device’s progress first</button><button class="button primary full spaced" data-account="use-cloud">Use cloud progress</button><button class="button secondary full spaced" data-account="use-local">Keep this device’s progress</button>`);
}
function loadLocal(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (value && validateProfile(value.profile) && validHistory(value.history)) return {
      ...emptyData(), ...cloudData({ ...value, mastered: Array.isArray(value.mastered) ? value.mastered.filter(id => getExercise(id)) : [] }),
      active: validActive(value.active) ? { ...value.active, resumedAt: null } : null,
    };
  } catch { storageWarning = true; }
  return { ...emptyData(), active: null };
}
async function switchAccount(user) {
  if ((user?.id || null) === (accountUser?.id || null)) return;
  pauseActive();
  accountUser = user || null;
  storageKey = user ? `${KEY}.user.${user.id}` : KEY;
  pendingImport = null;
  modal.close();
  page = 'home';
  accountLoading = !!user;
  state = loadLocal(storageKey);
  render();
  renderAccount();
  await cloud.connect(user?.id || null);
}
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-account]');
  if (!button || !authReady) return;
  const action = button.dataset.account;
  if (action === 'signin' || action === 'manage') accountModal();
  if (action === 'conflict') conflictModal();
  if (action === 'retry' || action === 'refresh') { modal.close(); await cloud.sync(); }
  if (action === 'use-cloud' || action === 'use-local') {
    button.disabled = true;
    await cloud.resolve(action === 'use-cloud' ? 'cloud' : 'local');
    modal.close();
    if (cloud.status === 'conflict') toast('Could not resolve this yet. Check your connection and try again.');
  }
  if (action === 'signout') {
    button.disabled = true;
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) { button.disabled = false; toast('Could not sign out. Please try again.'); }
    else await switchAccount(null);
  }
});
document.addEventListener('submit', async event => {
  if (event.target.id !== 'signin-form') return;
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('button');
  const status = form.querySelector('#signin-status');
  button.disabled = true;
  status.textContent = 'Sending your link…';
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: String(new FormData(form).get('email')).trim(),
      options: { emailRedirectTo: new URL('./', location.href).href },
    });
    if (error) throw error;
    status.textContent = 'Check your email, including spam. Open the sign-in link in this same browser. You can close this dialog and keep training.';
    button.textContent = 'Send another link';
  } catch (error) {
    status.textContent = error.status === 429 ? 'Too many requests. Please wait a few minutes before trying again.' : 'Could not send the link. Check your connection and email address, then try again.';
  } finally { button.disabled = false; }
});
async function initializeAccount() {
  renderAccount();
  try {
    const { createClient } = await import('./vendor/supabase.js');
    supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { flowType: 'pkce', storageKey: 'kalistenix.auth.v1', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      global: { fetch: (url, options) => fetch(url, { ...options, signal: options?.signal || AbortSignal.timeout(15000) }) },
    });
    cloud = new CloudStore({
      remote: trainingApi(supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY),
      storage: localStorage,
      onData(data) {
        const changed = JSON.stringify(cloudData(state)) !== JSON.stringify(data);
        state = { ...data, active: state.active };
        try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { storageWarning = true; }
        if (changed) render();
      },
      onStatus(status) {
        if (!['loading', 'saving'].includes(status)) accountLoading = false;
        renderAccount();
      },
    });
    const { data, error } = await supabase.auth.getSession();
    if (error) toast('This sign-in link could not be used. Request a new link in this browser.');
    authReady = true;
    await switchAccount(data.session?.user || null);
    supabase.auth.onAuthStateChange((_event, session) => {
      // Supabase holds its auth lock inside this callback. Start I/O after it returns.
      setTimeout(() => { void switchAccount(session?.user || null); }, 0);
    });
    renderAccount();
    window.addEventListener('online', () => { void cloud.sync(); });
    window.addEventListener('focus', () => { if (accountUser && page !== 'workout' && !modal.open) void cloud.sync(); });
  } catch {
    authFailed = true;
    accountLoading = false;
    renderAccount();
  }
}
void initializeAccount();
