#!/usr/bin/env node
// Writes every test vault into vaults/ and the import files into imports/. With --check, writes them into a temporary
// folder instead and fails if anything differs from what is committed — the generator is deterministic.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { empty } from './empty.mjs';
import { writeImports } from './imports.mjs';
import { international } from './international.mjs';
import { scale } from './scale.mjs';
import { scenarios } from './scenarios.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const out = check ? fs.mkdtempSync(path.join(os.tmpdir(), 'lineage-test-vaults-')) : root;
const assets = path.join(root, 'assets', 'attachments');

const vaults = [scenarios(), international(), scale(500), scale(1000), empty()];
for (const vault of vaults) {
  vault.write(path.join(out, 'vaults', vault.name), assets);
  const expected = vault.expected();
  console.log(`${vault.name}: ${expected.people.count} people, ${expected.edges.count} links, ${expected.issues.length} problems`);
}
await writeImports(path.join(out, 'imports'));

if (check) {
  const files = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir, { recursive: true }).filter((file) => fs.statSync(path.join(dir, file)).isFile()).sort() : [];
  const differences = [];
  for (const part of ['vaults', 'imports']) {
    const fresh = files(path.join(out, part)); const committed = files(path.join(root, part));
    for (const file of new Set([...fresh, ...committed])) {
      const a = path.join(out, part, file); const b = path.join(root, part, file);
      if (!fs.existsSync(a) || !fs.existsSync(b) || !fs.readFileSync(a).equals(fs.readFileSync(b))) differences.push(`${part}/${file}`);
    }
  }
  fs.rmSync(out, { recursive: true, force: true });
  if (differences.length) {
    console.error(`Generated files differ from the committed ones (run npm run generate):\n${differences.slice(0, 50).map((file) => `  ${file}`).join('\n')}`);
    process.exit(1);
  }
  console.log('The committed vaults match the generator.');
}
