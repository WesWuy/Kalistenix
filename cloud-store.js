import { DEFAULT_PROFILE, validateProfile, validHistory, getExercise } from './training.js';

export const emptyData = () => ({ profile: { ...DEFAULT_PROFILE, equipment: [] }, history: [], mastered: [], configured: false });
export function validData(data) {
  return !!data && validateProfile(data.profile) && validHistory(data.history)
    && Array.isArray(data.mastered) && data.mastered.every(id => !!getExercise(id))
    && typeof data.configured === 'boolean';
}
export function cloudData(state) {
  return structuredClone({ profile: state.profile, history: state.history, mastered: state.mastered, configured: !!state.configured });
}

// Cache and revision travel together. A stale device must never overwrite newer data.
export class CloudStore {
  constructor({ remote, storage, onData, onStatus, delay = 600 }) {
    Object.assign(this, { remote, storage, onData, onStatus, delay });
    this.generation = 0;
    this.userId = null;
    this.status = 'guest';
  }
  report(status) { this.status = status; this.onStatus(status); }
  persist() {
    try { this.storage.setItem(this.key, JSON.stringify(this.cache)); this.storageFailed = false; }
    catch { this.storageFailed = true; }
  }
  async connect(userId) {
    clearTimeout(this.timer);
    const generation = ++this.generation;
    this.userId = userId;
    this.flight = null;
    this.remoteRow = null;
    if (!userId) { this.report('guest'); return; }
    this.key = `kalistenix.cloud.v1.${userId}`;
    this.cache = { data: emptyData(), revision: 0, dirty: false };
    this.storageFailed = false;
    try {
      const cached = JSON.parse(this.storage.getItem(this.key) || 'null');
      if (cached && validData(cached.data) && Number.isSafeInteger(cached.revision) && cached.revision >= 0 && typeof cached.dirty === 'boolean') this.cache = cached;
    } catch { this.storageFailed = true; }
    this.change = 0;
    this.onData(structuredClone(this.cache.data));
    this.report('loading');
    await this.sync(generation);
  }
  save(state) {
    if (!this.userId) return;
    const data = cloudData(state);
    if (!validData(data)) throw new Error('Invalid training data');
    // Timer/active-workout changes stay local and must not create cloud revisions.
    if (JSON.stringify(data) === JSON.stringify(this.cache.data)) return;
    this.cache.data = data;
    this.cache.dirty = true;
    this.change++;
    this.persist();
    if (this.status === 'conflict') return;
    this.report('pending');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.sync(), this.delay);
  }
  async sync(generation = this.generation) {
    if (!this.userId || generation !== this.generation || this.status === 'conflict') return;
    if (this.flight) return this.flight;
    this.flight = this.run(generation).finally(() => {
      if (generation === this.generation) this.flight = null;
    });
    return this.flight;
  }
  async run(generation) {
    const userId = this.userId;
    try {
      this.report(this.cache.dirty ? 'saving' : 'loading');
      const row = await this.remote.read(userId);
      if (generation !== this.generation) return;
      if (row && (!validData(row.data) || !Number.isSafeInteger(row.revision) || row.revision < 1)) throw new Error('Invalid cloud data');
      const revision = row?.revision || 0;
      if (this.cache.dirty && revision !== this.cache.revision) {
        this.remoteRow = row;
        this.report('conflict');
        return;
      }
      if (!this.cache.dirty) {
        this.cache = { data: row?.data || emptyData(), revision, dirty: false };
        this.persist();
        this.onData(structuredClone(this.cache.data));
      }
      while (this.cache.dirty) {
        const change = this.change;
        const data = structuredClone(this.cache.data);
        const nextRevision = await this.remote.write(userId, this.cache.revision, data);
        if (generation !== this.generation) return;
        this.cache.revision = nextRevision;
        this.cache.dirty = change !== this.change;
        this.persist();
      }
      this.report(this.storageFailed ? 'storage-error' : 'synced');
    } catch (error) {
      if (generation !== this.generation) return;
      if (error.code === '40001') {
        this.remoteRow = undefined;
        this.report('conflict');
      } else this.report('error');
    }
  }
  // Both choices are explicit in the UI. Export is offered before replacement.
  async resolve(choice) {
    if (this.status !== 'conflict') return;
    const generation = this.generation;
    try {
      const row = await this.remote.read(this.userId);
      if (generation !== this.generation) return;
      if (row && (!validData(row.data) || !Number.isSafeInteger(row.revision) || row.revision < 1)) throw new Error('Invalid cloud data');
      this.cache.revision = row?.revision || 0;
      if (choice === 'cloud') {
        this.cache.data = row?.data || emptyData();
        this.cache.dirty = false;
        this.onData(structuredClone(this.cache.data));
      } else if (choice === 'local') this.cache.dirty = true;
      else return;
      this.persist();
      this.report('pending');
      await this.sync();
    } catch { if (generation === this.generation) this.report('conflict'); }
  }
}
