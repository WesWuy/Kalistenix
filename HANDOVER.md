# Handover

Last updated: 2026-11-12 (artwork + female athlete set added)
Branch: `ux/readability-onboarding-workout` (from `main` at `c37015a`)
Status: **changes are uncommitted and not pushed.** The automated test suites have not been run on this branch.

## Why this branch exists

A UX review of the live app (https://weswuy.github.io/Kalistenix/) found three problems with the biggest impact on how appealing the app is:

1. **Text was too small and low-contrast.** About 110 font-size declarations were between 6px and 11px, the mobile navigation labels were 8px, and much of the muted grey text was hard to read on the dark green panels.
2. **There was no first-run experience.** New visitors landed on a default beginner plan with "00" stats, and the profile form was hidden behind a settings button.
3. **The workout screen wasn't built for use mid-set.** It was one long scrolling page with every exercise, small number inputs, a small rest timer, no alert when rest ended, and nothing to keep the screen on.

This branch fixes all three.

## What changed

### 1. Readability (`styles.css`)
- Small font sizes were remapped across the file: 5–7px → 9–10px, 8 → 11, 9–10 → 12, 11 → 13, 12 → 14, 13–14 → 15. Sizes of 15px and up are unchanged.
- `--muted` changed from `#a0a897` to `#bcc4b2`.
- Every hard-coded grey text colour (`color:` only, not backgrounds or borders) with a brightest channel between `0x50` and `0xC8` was blended 35% toward `#e6ebdf`. Very dark colours, such as button text on lime, were left alone.
- This was a mechanical find-and-replace, so diffs on the minified CSS lines are large but uniform.

### 2. Guided first-run setup (`app.js`, `styles.css`)
- `setupCard()` renders a three-step card on Overview, between the page heading and the hero:
  1. Level
  2. Goal, then days per week (2, 3 or 4)
  3. Equipment, plus an optional name
- It is shown only when `!state.configured && !setupDismissed && state.history.length === 0`.
- The draft lives in module variables `setupDraft` and `setupStep` and is only saved on **Build my plan**. That validates the profile with `validateProfile`, sets `configured = true`, saves (which also syncs to the cloud when signed in), and shows a toast.
- **Skip for now** hides the card for the current page session only. It is not persisted, so the card returns on reload until the user sets up a plan or logs a workout.
- The setup state is reset in `switchAccount()`.
- The hero and its **Start workout** button stay below the card on purpose: the browser tests and existing users rely on them.
- The **Personalize my plan** form (`profileModal`) is unchanged.

### 3. Focused workout mode (`app.js`, `styles.css`)
- `workoutPage()` shows **one exercise at a time**. `focusExercise()` chooses the exercise from the module variable `focusId`, falling back to the first exercise with sets left.
- **Exercise strip:** a row of cards (`.exercise-steps`, `data-focus`) showing sets done per exercise. Tapping one jumps to it.
- **Focus card:** shows the movement guide (`exerciseGuide`), the cue, the target, an "Easier option & tips" link to the existing modal, and the set rows:
  - **Logged sets** show their value and a `data-undo` button. The undo handler is unchanged.
  - **The next unlogged set** is the only `<form data-set-form>`. It has −/+ `data-step` buttons and a numeric input whose default is the last value logged for that exercise in this session, otherwise the exercise minimum.
  - **Later sets** show as "Up next".
- **Auto-advance:** after logging the last set of an exercise, focus moves to the next unfinished exercise (wrapping to earlier ones) and the page scrolls to the card.
- **Rest timer:**
  - `+15s` adds 15 seconds of rest (`data-action="add-rest"`).
  - The countdown gets larger while resting (`.resting` class, toggled in `tick()`).
  - When rest ends, `tick()` plays a two-note Web Audio chime, vibrates, and shows a toast, once per rest (`restAlerted`). Skipping rest does not trigger the alert. The alert is re-armed after a reload if a rest is still running.
  - The audio context is unlocked when a set is logged, which counts as a user gesture.
- **Sound toggle:** saved per device in `localStorage['kalistenix.sound']`.
- **Screen wake lock:** `syncWakeLock()` runs after every `render()` and on `visibilitychange`. It holds a screen wake lock only while on the workout page with an active session and a visible tab. It does nothing on browsers without `navigator.wakeLock`.
- No changes to stored data: `focusId`, `restAlerted` and the audio and wake-lock handles are in memory only. `state.active`'s shape and `validActive()` are untouched, and cloud payloads are unchanged.
- Visible labels the Playwright tests use were kept: `Start workout`, `I’m warmed up. Let’s go`, `Log set`, `Finish partial workout`, `Save workout`, `Personalize my plan`, `Build my plan`.

### 4. New exercise artwork (`illustrations.js`, `assets/exercises/`, `styles.css`, `server.js`, workflow)
The hand-drawn SVG figures were replaced with generated illustrations.

**The images**
- 44 JPEGs, two per exercise, named `assets/exercises/<id>-0.jpg` and `<id>-1.jpg`.
- Each is 1024×688 and about 50 KB, 2.4 MB in total.
- Made with Higgsfield using GPT Image 2.6, high quality, 3:2 aspect ratio.

**How consistency was kept**
- One approved style frame (the push-up high position, Higgsfield job `c8d1812e-476a-4dc8-9c62-a1dc19ad9067`) was the image reference for every other generation.
- That keeps the same athlete, outfit, lime/dark-green palette, mat, glow background and equipment style throughout.
- Each prompt spelled out the correct form for that position and the camera view (side, front or top).

**Review**
- Every image was checked against the exercise description.
- Three were regenerated: `pistol-0` (the foot ran into the post), `hollow-0` (showed a seated V-up instead of lying back) and `lsit-1` (looked like straddling the bar).
- One job (`hollow-1`) failed on Higgsfield's side and was resubmitted.
- About 70 credits were used.

**Code**
- `illustrations.js` now holds only exercise metadata: name, view, equipment, labels, descriptions and cue. The SVG pose data and drawing helpers were removed.
- `exerciseIllustration()` returns an `<img>` with width and height set (prevents layout shift) and `loading="lazy"`. The hero passes `eager: true` so it isn't delayed.
- Alt text is built from the name, position label and description. Decorative uses keep `alt=""` and `aria-hidden`.
- `exerciseGuide()` is unchanged.

**Styles**
- `img.exercise-art` uses `object-fit: cover` with the old SVG padding and drop-shadow removed.
- The hero image fades into the panel with a radial mask. On phones it becomes a banner above the hero text so it no longer covers the headline.
- Plan-list thumbnails are now 3:2 and zoomed in on the athlete.
- Library cards zoom slightly on hover, which is turned off with reduced motion.

**Serving and deploy**
- `server.js` now serves files matching `^assets/exercises/[a-z-]+-[01]\.jpg$` as `image/jpeg`, and only text types get `charset=utf-8`.
- The Pages step in `.github/workflows/checks.yml` copies `assets/exercises` into `_site/assets/`. **Without this the deployed site would show broken images.**

**To regenerate an image**
- Call `generate_image` with model `gpt_image_2_6`, `aspect_ratio` 3:2, `quality` high, `output_format` jpeg, and `medias: [{role: "image_references", value: "c8d1812e-476a-4dc8-9c62-a1dc19ad9067"}]`.
- Start the prompt with "Use the reference image for the exact same athlete…".
- Save the result over `assets/exercises/<id>-<phase>.jpg`.

### 5. Female athlete images and gender choice
**The images**
- A second, matching set of 44 images in `assets/exercises/female/`, about 2.3 MB, same names and 1024×688 size.
- They share the art style, palette and equipment of the default set.
- The athlete: dark brown ponytail, lime sleeveless top, charcoal 7/8 leggings, grey sneakers.
- Built from their own style reference (Higgsfield job `14f6d78e-6b03-41d3-adb4-aee235064ec4`), which was itself made using the male reference for style.
- The same per-pose prompts were reused, including the corrected pistol, hollow and L-sit wording.

**Review**
- All 44 were checked.
- Both archer push-ups were regenerated from a raised front three-quarter angle, because the straight-on front view read as squatting. So the female archer images are three-quarter views while the default set is straight-on.
- About 70 more credits were used (about 140 in total for both sets).

**Profile field**
- `training.js` adds `GENDERS = ['', 'female', 'male']`.
- `validateProfile` accepts a missing `gender` (old profiles and backups) or one of those values, and rejects anything else. Tests for this are in `tests/training.test.js`.
- `DEFAULT_PROFILE` is unchanged.
- No database migration is needed, because the SQL check only requires `profile` to be an object.

**Where the choice appears**
- Step 3 of first-run setup has Female / Male / Prefer not to say tiles.
- The "Personalize my plan" form has the same choice as radio buttons.
- Both say it is only used to choose which athlete appears in exercise images.
- It saves with the profile, so for signed-in users it syncs to their account.

**Rendering**
- `illustrations.js` exports `setAthlete(gender)`, which `render()` calls first. `exerciseImage()` then points at `female/` for `'female'` and at the default set otherwise.
- **"Prefer not to say" and unset both show the default (male) set.** If you'd rather show a neutral mix, change `setAthlete`.

**Serving and deploy**
- `server.js` allows `assets/exercises/female/…`.
- The Pages workflow's `cp -R assets/exercises` already includes the subfolder.

**To regenerate a female image**
- Use the same settings as the default set but with reference `14f6d78e-6b03-41d3-adb4-aee235064ec4`.
- Start the prompt with "Use the reference image for the exact same woman athlete…".
- Save to `assets/exercises/female/<id>-<phase>.jpg`.

### 6. Docs
- `README.md`:
  - The "Included" list has two new bullets (guided setup and focused workout mode).
  - The artwork paragraph, project-structure table and deploy file list now describe the image assets.
- This file.

## How it was verified

Artwork: all 44 images were opened and checked one by one. The app was checked in the browser on desktop and at phone size: hero, library cards, plan thumbnails, the movement-guide dialog and the workout screen. Every image loads with no console errors and nothing scrolls sideways at 375px.

Earlier UX changes:

Manual testing in a Chromium browser pane against a local static server, at desktop and 375×812 phone sizes:
- Setup: choosing a level, goal, days and equipment, typing a name, and **Build my plan**. The saved profile was correct in `localStorage`.
- Workout:
  - The −/+ steppers.
  - Logging a set: the rest countdown and "RESTING" state appear, and the next set carries the value forward.
  - Finishing an exercise moves to the next one.
  - Undo works.
  - The rest-end toast appears (tested by fast-forwarding `Date.now`).
  - A partial finish saves and the journal shows one entry.
- No horizontal overflow at phone width on Overview, My plan, Skill paths, Exercise library, My progress or the workout screen.
- No console errors from app code.

**Not verified:**
- `npm run check`, `npm test` and `npm run test:browser` have **not** been run, because Node.js wasn't available on the machine used.
- The chime and vibration haven't been tried on a real phone.
- The wake lock hasn't been checked on iOS Safari.
- Signed-in account flows weren't exercised beyond confirming the code paths are unchanged.

## Before merging

```sh
npm ci
npm run check
npm test
npx playwright install chromium
npm run test:browser
```

Then try a workout on a real phone: the chime after rest (with sound on), vibration on Android, and the screen staying awake.

After deploying, open the Exercise library on the live site and confirm the images load. This checks the new `cp -R assets/exercises` step in the workflow.

**Artwork review:** have someone who coaches calisthenics look over all 88 images (both sets) before release, especially:
- `lsit-1` in both sets, because a side view of a tuck L-sit can look like sitting on the bar;
- `scap-pull-0` and `scap-pull-1`, which differ only slightly, as the real movement does;
- `lean-1`, where the forward shoulder lean is modest.

Also on a real device: choose Female in setup or in "Personalize my plan" and confirm the library, plan, hero and workout guides all switch to the female athlete.

## Known gaps and suggested next steps

- **Picking specific training days.** Users choose how many days, but `schedule(days)` in `training.js` decides which ones. Letting them pick needs a profile schema change (`validateProfile`, the cloud data, and the backup import validation).
- **Make it installable and work offline.** Add a manifest, PNG icons and a service worker. The README already lists this as a milestone.
- **Turn empty screens into goals.** Hide zero stats on first visit and replace them with first-week goals.
- **Rewards.** Streaks, personal-best badges and a richer finish screen that compares with the last session.
- **Trim decorative text.** Cut the extra slogan labels and the giant "01". Drop the "®" after the logo unless the mark is actually registered.
- **Show the sign-in banner later.** Offer it after the first saved workout rather than above everything on first load.
- **Animate the illustrations.** Loop between each exercise's two positions, respecting `prefers-reduced-motion`.
- **Browser tests for the new flows.** Cover the setup steps, the −/+ steppers, auto-advance and `+15s` in `tests/browser/`.
