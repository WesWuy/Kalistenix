import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
await build({
  stdin: { contents: "export { createClient } from '@supabase/supabase-js';", resolveDir: process.cwd() },
  outfile: 'vendor/supabase.js', bundle: true, format: 'esm', platform: 'browser',
  target: 'es2022', minify: true, legalComments: 'eof',
});
const packages = ['@supabase/supabase-js', '@supabase/auth-js', '@supabase/functions-js', '@supabase/postgrest-js', '@supabase/realtime-js', '@supabase/storage-js', 'iceberg-js', 'tslib'];
const notices = await Promise.all(packages.map(async name => {
  const directory = `node_modules/${name}`;
  const meta = JSON.parse(await readFile(`${directory}/package.json`, 'utf8'));
  let license;
  for (const file of ['LICENSE', 'LICENSE.md', 'LICENSE.txt']) {
    try { license = await readFile(`${directory}/${file}`, 'utf8'); break; } catch {}
  }
  if (!license) throw new Error(`Missing license for ${name}`);
  return `${name} ${meta.version}\n${license}`;
}));
await writeFile('vendor/LICENSES.txt', notices.join('\n\n---\n\n'));
