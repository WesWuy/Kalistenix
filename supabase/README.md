# Supabase setup

Project: `https://fpgjdzdrtypuqihqunpo.supabase.co`

The public browser configuration is in `supabase-config.js`. A publishable key
identifies the project; it does not grant database administration access. Never
replace it with a service-role or secret key.

## Activate cloud saving

1. Open this project's **SQL Editor** in Supabase and run
   [`001_training_data.sql`](001_training_data.sql). This creates the table,
   row-level read policy, and authenticated revision-checked write function.
2. Under **Authentication → URL Configuration**, set the Site URL to
   `https://weswuy.github.io/Kalistenix/` and add these redirect URLs:
   - `https://weswuy.github.io/Kalistenix/`
   - `http://localhost:4173/`
   - `http://127.0.0.1:4173/`
   Add any other development origin/port only when you use it.
3. Keep the Email provider and new user sign-ups enabled. Keep the default
   magic-link template with `{{ .ConfirmationURL }}`. Configure production SMTP
   for email delivery to your users; Supabase's built-in email service restricts
   recipients and sending rates.
4. Deploy the updated app through the repository's existing Pages workflow.
5. Sign in with your email, opening the link in the same browser that requested
   it. Save a profile and workout; wait for **Saved to your account**. Sign in on
   a second device with a new link requested on that device and verify the data.

The SQL and URL settings must be applied before claiming cloud saving is live.
At implementation time, the project's auth settings accepted the public key and
reported Email enabled, but `public.training_data` was absent. No live user
accounts, email messages, or training records were created during development.

## Storage behavior

- Guests continue using `kalistenix.v1` in localStorage. No guest data is uploaded.
- Signed-in users have separate local state under `kalistenix.v1.user.<user-id>`
  and a pending-sync cache under `kalistenix.cloud.v1.<user-id>`.
- The Supabase SDK manages the session under `kalistenix.auth.v1` using PKCE
  magic links and automatic token refresh. Auth tokens are never included in
  exported training backups.
- One `training_data` row per authenticated user stores the profile, saved
  sessions, milestones, and setup status. Active workouts are device-local.
- Edits save locally first, then upload after a short debounce. Offline changes
  retry on reconnection, window focus outside a workout/dialog, or the Retry
  button. Reopening the app resumes pending changes for the same account.
- Cloud reads happen on sign-in, before saves, on eligible window focus, and
  through **Account → Check for cloud updates**. This is not realtime sync.
- Every write compares the expected revision atomically. Conflicting devices
  show explicit choices and a backup export; neither copy silently wins.
- Signing out returns to the separate guest dataset. Account caches remain on
  the device for the next login, including unsynced changes. Browser storage is
  not an encrypted vault; clear site data when leaving a shared device.
- Moving guest data into an account is explicit: export as guest, sign in,
  then restore the backup from My progress. Restore replaces account progress.

The database only grants `SELECT` to authenticated users with an owner policy.
Writes go through `save_training_data`, which derives the user ID from
`auth.uid()`, never from a caller-supplied ID. Anonymous reads/writes and direct
authenticated table writes are denied. Deleting a user in Supabase cascades to
their training row; this does not erase local browser caches.

## Validation

`npm test` covers sync failures, stale revisions, account switches, and executes
the actual migration against isolated PostgreSQL through PGlite, checking both
users and the anonymous role. `npm run test:browser` checks the app using mocked
Supabase responses, including email-link requests, PKCE exchange, saved workouts,
sign-out, failure recovery, conflict choices, and mobile guest training.

These checks do not certify this project's live policies or email delivery.
After setup, verify with two real test accounts that each sees only its own
records and that logged-out REST requests cannot read training data.
