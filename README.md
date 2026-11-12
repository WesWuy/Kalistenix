# Kalistenix

**Built by you. One rep at a time.**

A responsive calisthenics web app for beginner, intermediate, and advanced athletes. This first release focuses on a useful individual training loop: personalize a plan, practice with guidance, log the work, and review progress.

**Live app: [weswuy.github.io/Kalistenix](https://weswuy.github.io/Kalistenix/)**

## Run locally

Install Node.js 22 or later, then:

```sh
git clone https://github.com/WesWuy/Kalistenix.git
cd Kalistenix
node server.js
```

Open **http://localhost:4173**. No package installation or build step is required. Set the `PORT` environment variable to change the port. The development server listens on loopback only.

## Included

- Responsive dashboard and navigation for phones, tablets, and desktops.
- Profile setup with three experience levels, three goals, two to four training days, and available equipment.
- Full-body plans for two or three days; alternating upper/lower sessions for four days.
- 22 exercise entries with technique cues, rep or hold ranges, and easier options.
- Workout logging by set, timed rests, undo, pause/resume, and partial-session saving.
- Rest timers use an absolute deadline, so background-tab throttling does not extend the countdown.
- Active workout persistence; training time pauses when the page is hidden or the session is left.
- Four skill paths with independently self-assessed milestones.
- Progress prompts after two complete workouts at an exercise's upper target, with controlled form and manageable effort reported. These prompts do not automatically advance the user's level.
- Session journal, weekly set chart, and JSON backup export/import with validation and a replacement confirmation.
- Accessible names, native modal dialogs, keyboard controls, reduced-motion support, and no synthetic training history.

## Data and scope

This is a **browser-local MVP**. It has no authentication, cloud database, payments, subscriptions, coach messaging, video library, or cross-device synchronization. Profile and workout data are stored under `kalistenix.v1` in localStorage. Export a backup before clearing browser data or changing devices. Restore replaces the local dataset, including any active workout.

The app has no analytics or application API calls. Google Fonts is used for typography; system fonts provide a fallback. Font loading sends a normal request to Google's font service. It does not send workout data. Hosting providers may retain ordinary request logs.

Every exercise has original, exercise-specific SVG artwork, with two labeled positions in its movement guide. Equipment, support points, view direction, and movement arrows help distinguish the variations. Library cards, plan thumbnails, and workout guides use the same illustrations. Graphics remain sharp at any screen size and require no external image service. These are simplified position illustrations, to be read alongside technique cues, not anatomical models or a substitute for coaching.

## Training content

Programs are general adult fitness templates, not medical advice or validated individualized prescriptions. Advanced skill work merits qualified coaching. Start with comfortable variations, use stable equipment, allow recovery, and stop for pain or unusual symptoms.

No-equipment pulling drills are explicitly labeled as shoulder preparation rather than substitutes for loaded pulls. Select a rated pull-up bar or resistance band for loaded pulling options.

Background references:

- [Calisthenics overview supplied in the brief](https://en.wikipedia.org/wiki/Calisthenics)
- [NHS strength exercises](https://www.nhs.uk/live-well/exercise/strength-exercises/) — gradual progression and accessible starting movements.
- [ACSM 2026 resistance training position stand](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/) — general resistance training principles. The app's specific routines and progression thresholds are product heuristics, not claims of direct clinical validation.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Application shell and metadata |
| `app.js` | UI, navigation, session state, storage, backup flow |
| `training.js` | Exercise catalog, plan generation, progression, date helpers, validation |
| `illustrations.js` | Original exercise artwork and paired movement guides for all 22 exercises |
| `styles.css` | Responsive design system |
| `server.js` | Minimal, allowlisted local preview server |
| `tests/training.test.js` | Node test suite for training logic and data boundaries |
| `.github/workflows/checks.yml` | Syntax and logic checks; GitHub Pages deployment from main |

## Checks

```sh
node --check app.js
node --check training.js
node --check server.js
node --test
```

The plan test covers every combination of level, goal, training frequency, and equipment selection, including both split-session variants. Other tests cover week boundaries, progression gates, and invalid backup data.

## Deploy

The app is static. Publish `index.html`, `app.js`, `training.js`, `illustrations.js`, `styles.css`, and `icon.svg` together on an HTTPS static host. No runtime secrets, backend service, or build output are required. Relative asset paths support a repository subpath such as `/Kalistenix/`. `server.js` is a local development utility and is not needed on a static host.

GitHub Pages is configured with GitHub Actions as its publishing source. The `App checks and Pages` workflow tests every push and pull request, then publishes only the six static app files after successful checks on `main`. Pull requests never deploy. The workflow can also be run manually from the Actions tab.

The production URL is **https://weswuy.github.io/Kalistenix/**. HTTPS or localhost is required for `crypto.randomUUID()` when starting workouts. The app is not yet an installable or offline-cached PWA.

Browser storage is separate for localhost and the hosted app. To move existing local progress, export it from the local app and restore the backup on the live site.

## Next product milestones

1. Coach review of exercise technique, progression gates, and a more complete advanced skill catalog.
2. Per-exercise substitutions and baseline assessment rather than level-wide defaults.
3. Authenticated, per-user storage and tested backup migration for cross-device use.
4. Licensed technique videos, accessible captions, and an installable offline experience.
5. Broader device, accessibility, and user testing of the hosted release.
