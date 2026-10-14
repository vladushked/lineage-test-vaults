// A test vault described in code: people with their fields and relationships, other notes, attachments and
// settings. `write` puts the cards on disk in the plugin's standard schema and an `expected.json` with what the plugin
// should find there, computed from this description, never from the plugin.
import fs from 'node:fs';
import path from 'node:path';

/** Card properties in the order the plugin's schema lists them (src/schema.ts FIELDS). */
const FIELD_ORDER = [
  'id', 'name', 'surname', 'given_name', 'patronymic', 'birth_surname', 'name_variants', 'sex',
  'birth_date', 'birth_place', 'baptism_date', 'baptism_place', 'death_date', 'death_place', 'cause_of_death', 'burial_date', 'burial_place',
  'life_status', 'occupation', 'education', 'military', 'residences', 'religion', 'nationality', 'social_status', 'photo',
  'parents', 'adoptive_parents', 'children', 'spouses', 'marriages', 'godparents', 'identity', 'sources', 'questions', 'source_record',
];
const ENUMS = { sex: ['male', 'female', 'unknown'], life_status: ['living', 'deceased', 'unknown'], identity: ['confirmed', 'probable', 'hypothesis'] };
const RELATIONS = ['parents', 'adoptive_parents', 'children', 'spouses'];

const yaml = (value) => {
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.length ? `\n${value.map((item) => `  - ${yaml(item)}`).join('\n')}` : '[]';
  return JSON.stringify(value);
};

/** Year of a date for a file name, as the plugin's default template takes it: the first four-digit year. */
const yearOf = (date) => typeof date === 'string' ? date.match(/(\d{4})/)?.[1] ?? null : typeof date === 'number' ? String(date) : null;

/** The full name in a scheme's order, a different birth surname in parentheses (as names.ts personTitle). */
export function fullName(f, scheme) {
  const parts = scheme === 'russian' || scheme === 'eastern' ? [f.surname, f.given_name, f.patronymic] : [f.given_name, f.patronymic, f.surname];
  const main = parts.filter(Boolean).join(' ') || '?';
  return f.birth_surname && f.birth_surname !== f.surname ? `${main} (${f.birth_surname})` : main;
}

export class Vault {
  /** `scheme` is the vault's name scheme; `settings` go into the plugin's data.json. */
  constructor(name, { scheme = 'russian', settings = {} } = {}) {
    this.name = name; this.scheme = scheme; this.settings = settings;
    this.people = new Map(); this.rels = []; this.extras = []; this.notes = []; this.attachments = [];
    this.expect = { generationIssues: [], clarify: {}, labels: {}, routes: [], roots: [], fileNames: true, extra: {} };
  }

  /**
   * A person card. `f` holds schema fields; besides them: `file` (base name), `dir`, `name: false` (no name property),
   * `body`, `raw` (property → YAML text written verbatim), `named: false` when the file name does not follow the template.
   */
  person(key, dir, f = {}) {
    const person = { key, dir, ...f };
    if (person.name === undefined) person.name = fullName(person, this.scheme);
    if (!person.file) person.file = this.fileName(person);
    else if (person.named === undefined) person.named = false;
    this.people.set(key, person);
    return person;
  }

  /** The default file name template `{name} {born}-{died}`. */
  fileName(f) {
    // A life status outside the schema counts as none: the death date decides (schema.lifeStatusOf).
    const stated = ENUMS.life_status.includes(f.life_status) ? f.life_status : undefined;
    const status = stated ?? (f.death_date ? 'deceased' : 'unknown');
    const died = status === 'living' ? '' : status === 'deceased' ? yearOf(f.death_date) ?? '?' : '?';
    const hasParts = f.surname || f.given_name || f.patronymic;
    const title = hasParts ? fullName(f, this.scheme) : (typeof f.name === 'string' && f.name) || '?';
    return `${title} ${yearOf(f.birth_date) ?? '?'}-${died}`.replace(/[\\/:*"<>|#^[\]]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  path(key) { const p = this.get(key); return `${p.dir ? `${p.dir}/` : ''}${p.file}.md`; }
  get(key) { const p = this.people.get(key); if (!p) throw new Error(`${this.name}: unknown person ${key}`); return p; }
  link(key) { const p = this.get(key); return `[[${p.linkAs ?? p.file}]]`; }

  /** Parent → child. `only: 'parent'` — only the parent's card says so; `'child'` — only the child's. */
  parent(parents, children, opts = {}) {
    for (const c of [].concat(children)) for (const p of [].concat(parents)) this.rels.push({ kind: 'parent', p, c, ...opts });
  }
  marry(a, b, opts = {}) { this.rels.push({ kind: 'spouse', a, b, ...opts }); }

  /**
   * An entry written as is into a relationship property. `means` says what the plugin should make of it:
   * `{ to: key }` a link to that person, `'missing'`, `'self'`, `{ oneOf: [keys] }` an ambiguous link, `'ignored'`.
   */
  entry(key, field, value, means) { this.extras.push({ key, field, value, means }); }

  /** A link that contradicts the generations around it: reported in Проблемы on the child's card. */
  generationIssue(childKey, parentKey) { this.expect.generationIssues.push([childKey, parentKey]); }

  note(file, frontmatter, body) { this.notes.push({ file, frontmatter, body }); }
  attach(...names) { this.attachments.push(...names); }

  write(outDir, assetsDir) {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
    const lists = new Map([...this.people.keys()].map((key) => [key, Object.fromEntries(RELATIONS.map((field) => [field, []]))]));
    const add = (key, field, value) => lists.get(key)[field].push(value);
    for (const r of this.rels) {
      if (r.kind === 'parent') {
        const parentField = r.adoptive ? 'adoptive_parents' : 'parents';
        if (r.only !== 'parent') add(r.c, parentField, this.link(r.p));
        // An adoption is declared from the child's card only, as the plugin writes it.
        if (r.only !== 'child' && !r.adoptive) add(r.p, 'children', this.link(r.c));
      } else {
        if (r.only !== 'b') add(r.a, 'spouses', this.link(r.b));
        if (r.only !== 'a') add(r.b, 'spouses', this.link(r.a));
      }
    }
    for (const e of this.extras) add(e.key, e.field, e.value);

    const seen = new Set();
    for (const p of this.people.values()) {
      const file = path.join(outDir, this.path(p.key));
      if (seen.has(file)) throw new Error(`${this.name}: two cards at ${file}`);
      seen.add(file);
      const raw = p.raw ?? {};
      const props = { type: 'person' };
      for (const field of FIELD_ORDER) {
        if (field === 'name' && p.name === false) continue;
        if (RELATIONS.includes(field)) { props[field] = lists.get(p.key)[field]; continue; }
        if (p[field] !== undefined) props[field] = p[field];
      }
      for (const field of Object.keys(raw)) if (!(field in props)) props[field] = undefined;
      // Adoptive parents are written only when there are any; the other relationship lists always.
      if (!props.adoptive_parents.length && !('adoptive_parents' in raw)) delete props.adoptive_parents;
      const line = (field, text) => `${field}:${text.startsWith('\n') ? '' : ' '}${text}`;
      const lines = Object.entries(props).map(([field, value]) => field === 'type' ? 'type: person' : line(field, field in raw ? raw[field] : yaml(value)));
      const body = p.body ?? 'Синтетическая карточка тестового vault.';
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, `---\n${lines.join('\n')}\n---\n\n${body}\n`);
    }
    for (const n of this.notes) {
      const file = path.join(outDir, n.file);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, `${n.frontmatter !== null ? `---\n${n.frontmatter}\n---\n\n` : ''}${n.body}\n`);
    }
    if (this.attachments.length) fs.mkdirSync(path.join(outDir, 'attachments'), { recursive: true });
    for (const name of this.attachments) fs.copyFileSync(path.join(assetsDir, name), path.join(outDir, 'attachments', name));

    const obsidian = path.join(outDir, '.obsidian');
    fs.mkdirSync(path.join(obsidian, 'plugins', 'genealogy-graph'), { recursive: true });
    fs.writeFileSync(path.join(obsidian, 'app.json'), `${JSON.stringify({ alwaysUpdateLinks: true, attachmentFolderPath: 'attachments' }, null, 2)}\n`);
    fs.writeFileSync(path.join(obsidian, 'community-plugins.json'), '[\n  "genealogy-graph"\n]\n');
    const settings = { ...this.settings };
    if (settings.self) { settings.selfPersonId = this.path(settings.self); delete settings.self; }
    fs.writeFileSync(path.join(obsidian, 'plugins', 'genealogy-graph', 'data.json'), `${JSON.stringify(settings, null, 2)}\n`);
    fs.writeFileSync(path.join(outDir, 'expected.json'), `${JSON.stringify(this.expected(), null, 2)}\n`);
  }

  /** What the plugin should see, from the description above. */
  expected() {
    const edges = new Set(); const issues = [];
    const parentEdge = (from, to, adoptive) => edges.add(`parent:${this.path(from)}:${this.path(to)}${adoptive ? ':adoptive' : ''}`);
    for (const r of this.rels) {
      if (r.kind === 'parent') parentEdge(r.p, r.c, r.adoptive);
      else edges.add(`spouse:${[this.path(r.a), this.path(r.b)].sort().join(':')}`);
    }
    const ambiguous = [];
    for (const e of this.extras) {
      const source = this.path(e.key);
      const target = typeof e.value === 'string' ? e.value.replace(/^\[\[|\]\]$/g, '').split('|')[0].split('#')[0] : String(e.value);
      if (e.means === 'missing') issues.push({ source, field: e.field, reason: 'missing', target });
      else if (e.means === 'self') issues.push({ source, field: e.field, reason: 'self', target });
      else if (e.means?.oneOf) ambiguous.push({ source, field: e.field, oneOf: e.means.oneOf.map((key) => this.path(key)) });
      else if (e.means?.to) for (const other of [].concat(e.means.to)) {
        if (e.field === 'spouses') edges.add(`spouse:${[source, this.path(other)].sort().join(':')}`);
        else if (e.field === 'children') parentEdge(e.key, other, false);
        else parentEdge(other, e.key, e.field === 'adoptive_parents');
      }
    }
    // A birth link declared anywhere wins over the same link declared as an adoption (model.buildGraph).
    for (const edge of [...edges]) if (edge.endsWith(':adoptive') && edges.has(edge.slice(0, -':adoptive'.length))) edges.delete(edge);
    for (const p of this.people.values()) {
      for (const [field, allowed] of Object.entries(ENUMS)) {
        const value = p[field];
        if (typeof value === 'string' && value.trim() && !allowed.includes(value)) issues.push({ source: this.path(p.key), field, reason: 'value', target: value });
      }
    }
    for (const [child, parent] of this.expect.generationIssues) issues.push({ source: this.path(child), reason: 'generation', targetId: this.path(parent) });
    const people = [...this.people.values()].map((p) => this.path(p.key)).sort();
    const byPath = (keyed) => Object.fromEntries(Object.entries(keyed).map(([key, value]) => [this.path(key), value]));
    return {
      vault: this.name,
      scheme: this.scheme,
      self: this.settings.self ? this.path(this.settings.self) : null,
      people: { count: people.length, paths: people },
      edges: { count: edges.size + ambiguous.length, list: [...edges].sort(), ambiguous },
      issues: issues.sort((a, b) => `${a.source}${a.reason}`.localeCompare(`${b.source}${b.reason}`)),
      // Cards whose file name follows the default template, so «Переименовывать по шаблону» may rename them.
      namedByTemplate: [...this.people.values()].filter((p) => p.named !== false).map((p) => this.path(p.key)).sort(),
      labels: byPath(this.expect.labels),
      clarify: byPath(this.expect.clarify),
      routes: this.expect.routes.map((r) => ({ ...r, from: this.path(r.from), to: this.path(r.to) })),
      roots: this.expect.roots.map((r) => ({ ...r, from: r.from.map((key) => this.path(key)), oldest: r.oldest?.map((key) => this.path(key)) })),
      ...this.expect.extra,
    };
  }
}
