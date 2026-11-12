import test from 'node:test';
import assert from 'node:assert/strict';
import { CloudStore, emptyData } from '../cloud-store.js';
import { trainingApi } from '../cloud-api.js';

const named = name => ({ ...emptyData(), profile: { ...emptyData().profile, name } });
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
function setup(remote, entries = new Map()) {
  const statuses = [], snapshots = [];
  const storage = { getItem: key => entries.get(key) || null, setItem: (key, value) => entries.set(key, value) };
  const store = new CloudStore({ remote, storage, delay: 0, onData: data => snapshots.push(data), onStatus: status => statuses.push(status) });
  return { store, entries, statuses, snapshots };
}

test('new accounts start empty and never read or upload guest data', async () => {
  let writes = 0;
  const { store, snapshots } = setup({ read: async () => null, write: async () => { writes++; } }, new Map([['kalistenix.v1', JSON.stringify(named('Guest'))]]));
  await store.connect('alice');
  assert.equal(snapshots.at(-1).profile.name, '');
  assert.equal(writes, 0);
  assert.equal(store.status, 'synced');
});

test('offline edits survive reload and retry with their original revision', async () => {
  const remote = { read: async () => ({ data: named('Before'), revision: 3 }), write: async () => { throw new Error('Offline'); } };
  const { store, entries } = setup(remote);
  await store.connect('alice');
  store.save(named('After'));
  await store.sync();
  assert.equal(store.status, 'error');
  assert.equal(JSON.parse(entries.get('kalistenix.cloud.v1.alice')).dirty, true);
  remote.write = async (id, revision, data) => { assert.equal(id, 'alice'); assert.equal(revision, 3); assert.equal(data.profile.name, 'After'); return 4; };
  const resumed = setup(remote, entries).store;
  await resumed.connect('alice');
  assert.equal(resumed.status, 'synced');
  assert.equal(resumed.cache.revision, 4);
  assert.equal(resumed.cache.dirty, false);
  await store.connect(null);
});

test('a stale device stops instead of overwriting another device', async () => {
  let row = { data: named('Original'), revision: 1 }, writes = 0;
  const { store } = setup({ read: async () => row, write: async () => { writes++; return 3; } });
  await store.connect('alice');
  store.save(named('Local edit'));
  row = { data: named('Other device'), revision: 2 };
  await store.sync();
  assert.equal(store.status, 'conflict');
  assert.equal(store.cache.data.profile.name, 'Local edit');
  assert.equal(writes, 0);
  await store.resolve('cloud');
  assert.equal(store.cache.data.profile.name, 'Other device');
  assert.equal(store.cache.dirty, false);
  assert.equal(writes, 0);
});

test('edits made during an upload are saved in a second revision', async () => {
  const gate = deferred(), started = deferred(), payloads = [];
  const { store } = setup({ read: async () => null, write: async (_id, revision, data) => {
    payloads.push(data.profile.name);
    if (payloads.length === 1) { started.resolve(); await gate.promise; }
    return revision + 1;
  } });
  await store.connect('alice');
  store.save(named('First'));
  const saving = store.sync();
  await started.promise;
  store.save(named('Second'));
  gate.resolve();
  await saving;
  assert.deepEqual(payloads, ['First', 'Second']);
  assert.equal(store.cache.revision, 2);
  assert.equal(store.cache.dirty, false);
  await store.connect(null);
});

test('late responses from a previous account cannot replace the current account', async () => {
  const gate = deferred();
  const { store, snapshots } = setup({ read: id => id === 'alice' ? gate.promise : Promise.resolve({ data: named('Bob'), revision: 2 }) });
  const oldConnection = store.connect('alice');
  await store.connect('bob');
  gate.resolve({ data: named('Alice'), revision: 1 });
  await oldConnection;
  assert.equal(snapshots.at(-1).profile.name, 'Bob');
  assert.equal(store.cache.data.profile.name, 'Bob');
  assert.equal(store.userId, 'bob');
});

test('malformed cloud data does not replace the local cache', async () => {
  const { store } = setup({ read: async () => ({ data: { profile: {} }, revision: 1 }) });
  await store.connect('alice');
  assert.equal(store.status, 'error');
  assert.deepEqual(store.cache.data, emptyData());
});

test('workout timer changes do not upload active sessions or create revisions', async () => {
  let writes = 0;
  const { store } = setup({ read: async () => null, write: async () => { writes++; return 1; } });
  await store.connect('alice');
  store.save({ ...emptyData(), active: { elapsedMs: 1000, sets: [] } });
  await store.sync();
  assert.equal(writes, 0);
  assert.equal('active' in store.cache.data, false);
});

test('REST adapter refuses a request for a different signed-in user', async () => {
  let requests = 0;
  const client = { auth: { getSession: async () => ({ data: { session: { user: { id: 'bob' }, access_token: 'test-token' } } }) } };
  const api = trainingApi(client, 'https://example.com', 'public-key', async () => { requests++; });
  await assert.rejects(api.write('alice', 0, named('Alice')), /sign in again/);
  assert.equal(requests, 0);
});
