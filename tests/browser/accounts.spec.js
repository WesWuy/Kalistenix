import { test, expect } from '@playwright/test';
import { emptyData } from '../../cloud-store.js';

const id = '11111111-1111-4111-8111-111111111111';
const account = name => ({ ...emptyData(), profile: { ...emptyData().profile, name } });
async function signedIn(page, row = { data: account('Alice'), revision: 1 }) {
  const session = { access_token: 'test-access-token', refresh_token: 'test-refresh-token', token_type: 'bearer', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id, email: 'alice@example.com', aud: 'authenticated' } };
  await page.addInitScript(({ session }) => {
    localStorage.setItem('kalistenix.auth.v1', JSON.stringify(session));
    localStorage.setItem('kalistenix.v1', JSON.stringify({ profile: { name: 'Guest', level: 'Beginner', goal: 'Build strength', days: 3, equipment: [] }, history: [], mastered: [], configured: true, active: null }));
  }, { session });
  await page.route('https://fpgjdzdrtypuqihqunpo.supabase.co/**', async route => {
    if (route.request().url().includes('/training_data?')) return route.fulfill({ json: row ? [row] : [] });
    return route.fulfill({ json: {} });
  });
}

test('guest sign-in sends a magic-link request with the local callback URL', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let body, redirect;
  await page.route('**/auth/v1/otp**', async route => {
    body = route.request().postDataJSON();
    redirect = new URL(route.request().url()).searchParams.get('redirect_to');
    await route.fulfill({ json: {} });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in / Create account' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('athlete@example.com');
  await page.getByRole('button', { name: 'Send sign-in link', exact: true }).click();
  await expect(page.locator('#signin-status')).toContainText('Check your email');
  expect(body.email).toBe('athlete@example.com');
  expect(body.code_challenge).toBeTruthy();
  expect(redirect).toBe('http://127.0.0.1:4174/');
  expect(errors).toEqual([]);
});

test('account load and profile edits sync, then sign-out restores the guest profile', async ({ page }) => {
  await signedIn(page);
  const writes = [];
  await page.route('**/rest/v1/rpc/save_training_data', async route => {
    const body = route.request().postDataJSON();
    writes.push(body);
    await route.fulfill({ json: body.expected_revision + 1 });
  });
  await page.goto('/');
  await expect(page.getByText('Good to see you, Alice.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Personalize my plan' }).click();
  await page.getByRole('textbox', { name: 'Your name' }).fill('Alice Updated');
  await page.getByRole('button', { name: 'Build my plan', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].payload.profile.name).toBe('Alice Updated');
  expect(writes[0].payload).not.toHaveProperty('active');
  await expect(page.locator('#account-bar')).toContainText('Saved to your account');
  await page.getByRole('button', { name: 'Account', exact: true }).click();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByText('Good to see you, Guest.', { exact: false })).toBeVisible();
  await expect(page.locator('#account-bar')).toContainText('Guest · saved on this device');
});

test('cloud failures keep training usable and persist unsynced profile changes', async ({ page }) => {
  await signedIn(page);
  await page.route('**/rest/v1/rpc/save_training_data', route => route.fulfill({ status: 503, json: { message: 'Unavailable' } }));
  await page.goto('/');
  await expect(page.locator('#account-bar')).toContainText('Saved to your account');
  await page.getByRole('button', { name: 'Personalize my plan' }).click();
  await page.getByRole('textbox', { name: 'Your name' }).fill('Offline edit');
  await page.getByRole('button', { name: 'Build my plan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Retry cloud save' })).toBeVisible();
  const cache = await page.evaluate(id => JSON.parse(localStorage.getItem(`kalistenix.cloud.v1.${id}`)), id);
  expect(cache.dirty).toBe(true);
  expect(cache.data.profile.name).toBe('Offline edit');
  await page.getByRole('button', { name: 'Exercise library', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Know the movement.' })).toBeVisible();
});

test('account controls fit on mobile and guest workouts remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Sign in / Create account' })).toBeEnabled();
  await page.getByRole('button', { name: 'Start workout', exact: true }).click();
  await page.getByRole('button', { name: 'I’m warmed up. Let’s go' }).click();
  await page.getByRole('button', { name: 'Log set', exact: true }).first().click();
  await page.getByRole('button', { name: 'Finish partial workout' }).click();
  await page.getByRole('button', { name: 'Save workout', exact: true }).click();
  await expect(page.locator('.history-row')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('PKCE callback exchanges its code and opens the correct cloud account', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('kalistenix.auth.v1-code-verifier', JSON.stringify('test-verifier')));
  let exchange;
  await page.route('https://fpgjdzdrtypuqihqunpo.supabase.co/**', async route => {
    const url = route.request().url();
    if (url.includes('/auth/v1/token')) {
      exchange = route.request().postDataJSON();
      return route.fulfill({ json: { access_token: 'test-token', refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, user: { id, email: 'alice@example.com', aud: 'authenticated' } } });
    }
    if (url.includes('/training_data?')) return route.fulfill({ json: [{ data: account('Alice'), revision: 1 }] });
    return route.fulfill({ json: {} });
  });
  await page.goto('/?code=test-auth-code');
  await expect(page.locator('#account-bar')).toContainText('alice@example.com');
  await expect(page.locator('#account-bar')).toContainText('Saved to your account');
  expect(exchange).toMatchObject({ auth_code: 'test-auth-code', code_verifier: 'test-verifier' });
  expect(page.url()).not.toContain('code=');
});

test('saved workouts reach the cloud but active workout sets remain local', async ({ page }) => {
  await signedIn(page);
  const writes = [];
  await page.route('**/rest/v1/rpc/save_training_data', async route => {
    const body = route.request().postDataJSON();
    writes.push(body.payload);
    await route.fulfill({ json: body.expected_revision + 1 });
  });
  await page.goto('/');
  await expect(page.locator('#account-bar')).toContainText('Saved to your account');
  await page.getByRole('button', { name: 'Start workout', exact: true }).click();
  await page.getByRole('button', { name: 'I’m warmed up. Let’s go' }).click();
  await page.getByRole('button', { name: 'Log set', exact: true }).first().click();
  expect(writes).toHaveLength(0);
  await page.getByRole('button', { name: 'Finish partial workout' }).click();
  await page.getByRole('button', { name: 'Save workout', exact: true }).click();
  await expect.poll(() => writes.length).toBe(1);
  expect(writes[0].history[0].sets).toHaveLength(1);
  expect(writes[0]).not.toHaveProperty('active');
});

test('conflict resolution presents both choices and replaces only on selection', async ({ page }) => {
  await signedIn(page, { data: account('Cloud copy'), revision: 2 });
  await page.addInitScript(({ id, data }) => localStorage.setItem(`kalistenix.cloud.v1.${id}`, JSON.stringify({ data, revision: 1, dirty: true })), { id, data: account('Local copy') });
  await page.goto('/');
  await expect(page.getByText('Good to see you, Local copy.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Review differences' }).click();
  await expect(page.getByRole('button', { name: 'Keep this device’s progress', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Use cloud progress', exact: true }).click();
  await expect(page.getByText('Good to see you, Cloud copy.', { exact: false })).toBeVisible();
  await expect(page.locator('#account-bar')).toContainText('Saved to your account');
});
