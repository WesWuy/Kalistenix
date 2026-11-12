import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { emptyData } from '../cloud-store.js';

test('database migration enforces ownership, authenticated writes and revision checks', async () => {
  const db = new PGlite();
  try {
    // Reproduce the Supabase roles and auth.uid() contract in isolated PostgreSQL.
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
      grant usage on schema auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');
    `);
    const sql = await readFile(new URL('../supabase/001_training_data.sql', import.meta.url), 'utf8');
    await db.exec(sql);
    await db.exec(sql); // Installation is safe to repeat.
    const save = revision => db.query('select public.save_training_data($1, $2::jsonb) as revision', [revision, JSON.stringify(emptyData())]);
    await db.exec('set role anon');
    await assert.rejects(db.query('select * from public.training_data'), e => e.code === '42501');
    await assert.rejects(save(0), e => e.code === '42501');
    await db.exec("set role authenticated; select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', false)");
    assert.equal((await save(0)).rows[0].revision, 1);
    assert.equal((await db.query('select * from public.training_data')).rows.length, 1);
    await assert.rejects(save(0), e => e.code === '40001');
    assert.equal((await save(1)).rows[0].revision, 2);
    await assert.rejects(save(1), e => e.code === '40001');
    await assert.rejects(db.query('update public.training_data set revision = 99'), e => e.code === '42501');
    await assert.rejects(db.query('select public.save_training_data(2, $1::jsonb)', ['{}']), e => e.code === '23514');
    await db.exec("select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', false)");
    assert.equal((await db.query('select * from public.training_data')).rows.length, 0);
    await assert.rejects(save(2), e => e.code === '40001');
    assert.equal((await save(0)).rows[0].revision, 1);
    const ownRows = (await db.query('select user_id from public.training_data')).rows;
    assert.deepEqual(ownRows, [{ user_id: '22222222-2222-4222-8222-222222222222' }]);
    await db.exec("select set_config('request.jwt.claim.sub', '', false)");
    await assert.rejects(save(0), e => e.code === '28000');
  } finally { await db.close(); }
});
