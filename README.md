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

Open **http://localhost:4173**. No package installation or build step is required to preview the app: the pinned Supabase browser SDK bundle is committed in `vendor/`. For development checks, run `npm ci`. Set the `PORT` environment variable to change the port. The development server listens on loopback only.

## Included

- Responsive dashboard and navigation for phones, tablets, and desktops.
- Guided three-step setup on first visit (level, goal and days, equipment, and an optional gender that picks which athlete appears in exercise images), skippable and editable later.
- Profile setup with three experience levels, three goals, two to four training days, and available equipment.
- Full-body plans for two or three days; alternating upper/lower sessions for four days.
- 22 exercise entries with technique cues, rep or hold ranges, and easier options.
- Focused workout mode: one exercise at a time with its movement guide, large -/+ steppers that carry forward your last value, auto-advance to the next exercise, +15s rest, an end-of-rest chime and vibration (with a sound toggle), and a screen wake lock where supported.
- Workout logging by set, timed rests, undo, pause/resume, and partial-session saving.
- Rest timers use an absolute deadline, so background-tab throttling does not extend the countdown.
- Active workout persistence; training time pauses when the page is hidden or the session is left.
- Four skill paths with independently self-assessed milestones.
- Progress prompts after two complete workouts at an exercise's upper target, with controlled form and manageable effort reported. These prompts do not automatically advance the user's level.
- Session journal, weekly set chart, and JSON backup export/import with validation and a replacement confirmation.
- Accessible names, native modal dialogs, keyboard controls, reduced-motion support, and no synthetic training history.

## Data and scope

The app supports **local guest training and optional Supabase accounts**. Email magic links enable cloud saving of profiles, saved workouts, and milestones. Apply the [Supabase setup](supabase/README.md) before using cloud saving. Active workouts remain device-local until saved. Guest data stays under `kalistenix.v1`; signed-in accounts have separate caches and never automatically inherit guest data. Sign-out restores the guest profile.

Cloud saves use per-user access rules and revision checks. Offline edits remain pending and conflicting devices require an explicit choice. Export a backup before clearing browser data. Restore replaces the current guest/account dataset, including any active workout. There are no payments, subscriptions, coach messaging, or videos.

The app has no analytics. Signed-in cloud saving sends training data to the configured Supabase project; sign-in sends the email address to Supabase Auth. Google Fonts is used for typography; system fonts provide a fallback. Font loading sends a normal request to Google's font service. It does not send workout data. Hosting providers may retain ordinary request logs.

Every exercise has two illustrated positions (44 images in `assets/exercises/`, about 2.4 MB in total, roughly 50 KB each). They were generated with Higgsfield (GPT Image 2.6) from a single character and style reference, so the same athlete, outfit, palette, and equipment appear throughout, and each pose was checked against the technique description. Library cards, plan thumbnails, the hero, and workout guides use the same images, which are served from the app itself with no runtime image service. There are two matching sets: the default athlete in `assets/exercises/` and a female athlete in `assets/exercises/female/` (44 more images, about 2.3 MB), made from their own style reference. A profile with gender set to Female sees the female set; Male or Prefer not to say sees the default set. Each image carries alt text built from the exercise name, position label, and description. They are position illustrations to be read alongside the technique cues, not a substitute for coaching.

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
| `illustrations.js` | Exercise names, view, position labels, descriptions and cues; renders the artwork and movement guides |
| `assets/exercises/` | Two JPEG illustrations per exercise: `<exercise-id>-0.jpg` (first position) and `<exercise-id>-1.jpg` (second); `female/` holds the matching female-athlete set |
| `styles.css` | Responsive design system |
| `cloud-store.js` | Account-scoped cache, retry, and conflict handling |
| `cloud-api.js` | Authenticated cloud reads and revision-checked writes |
| `supabase-config.js` | Public project URL and publishable key |
| `supabase/` | Database migration and activation instructions |
| `vendor/` | Pinned Supabase browser SDK and dependency licenses |
| `server.js` | Minimal, allowlisted local preview server |
| `tests/training.test.js` | Node test suite for training logic and data boundaries |
| `.github/workflows/checks.yml` | Syntax and logic checks; GitHub Pages deployment from main |

## Checks

```sh
npm ci
npm run check
npm test
npx playwright install chromium
npm run test:browser
```

The plan test covers every level, goal, training frequency, and equipment
combination. Other tests cover progression, invalid backups, cloud retries,
account isolation, conflicts, and PostgreSQL access policies. Browser tests mock
Supabase; live email delivery and deployed database policies need a post-setup
check. To rebuild the committed browser SDK after a dependency change, run
`npm run build:vendor`.

## Deploy

The app is static. Publish `index.html`, `app.js`, `training.js`, `illustrations.js`, `styles.css`, `icon.svg`, `cloud-store.js`, `cloud-api.js`, `supabase-config.js`, the `vendor/` directory, and the `assets/exercises/` directory together on an HTTPS static host. Guest mode needs no backend. Accounts use the configured Supabase project after its SQL and Auth setup. No server-side secrets belong in the static app. Relative asset paths support a repository subpath such as `/Kalistenix/`. `server.js` is a local development utility and is not needed on a static host.

GitHub Pages is configured with GitHub Actions as its publishing source. The `App checks and Pages` workflow tests every push and pull request, then publishes the static app files and vendor bundle after successful checks on `main`. Pull requests never deploy. The workflow can also be run manually from the Actions tab.

The production URL is **https://weswuy.github.io/Kalistenix/**. HTTPS or localhost is required for `crypto.randomUUID()` when starting workouts. The app is not yet an installable or offline-cached PWA.

Browser storage is separate for localhost and the hosted app. To move existing local progress, export it from the local app and restore the backup on the live site.

## Next product milestones

1. Coach review of exercise technique, progression gates, and a more complete advanced skill catalog.
2. Per-exercise substitutions and baseline assessment rather than level-wide defaults.
3. Activate and validate Supabase in production; extend account management and backup migration tooling.
4. Licensed technique videos, accessible captions, and an installable offline experience.
5. Broader device, accessibility, and user testing of the hosted release.
