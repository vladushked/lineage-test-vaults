// «scale-N»: a large synthetic family for speed checks. Generations from the top down: everyone gets a spouse from
// outside, each couple 1–4 children; ten family folders; a portrait for every 8th, a hypothesis for every 25th.
import { random } from './random.mjs';
import { Vault } from './vault.mjs';

const SURNAMES = ['Алексеев', 'Борисов', 'Воронин', 'Гусев', 'Дорофеев', 'Ермаков', 'Жуков', 'Зайцев', 'Игнатов', 'Кузнецов'];
const MALE = ['Алексей', 'Борис', 'Виктор', 'Георгий', 'Дмитрий', 'Егор', 'Фёдор', 'Иван'];
const FEMALE = ['Анна', 'Вера', 'Галина', 'Дарья', 'Елена', 'Зоя', 'Ирина', 'Мария'];
const PORTRAITS = ['portrait-square.jpg', 'portrait-tall.png', 'portrait-wide.png'];

export function scale(total) {
  const rnd = random(20261008 + total);
  const people = [];
  const make = (gen, male, family = SURNAMES[Math.floor(rnd() * SURNAMES.length)]) => {
    const p = { i: people.length, gen, male, family, spouse: null };
    p.year = 1800 + (gen + 10) * 28 + Math.floor(rnd() * 8);
    people.push(p);
    return p;
  };
  const couples = [];
  let level = [make(-10, true, SURNAMES[0])];
  while (people.length < total) {
    const next = [];
    for (const person of level) {
      if (people.length >= total) break;
      if (person.spouse === null) { const partner = make(person.gen, !person.male); person.spouse = partner; partner.spouse = person; couples.push([person, partner]); }
      const n = 1 + Math.floor(rnd() * 4);
      for (let c = 0; c < n && people.length < total; c++) {
        const father = person.male ? person : person.spouse;
        const child = make(person.gen + 1, rnd() < 0.5, father.family);
        child.parents = [person, person.spouse];
        next.push(child);
      }
    }
    level = next.length ? next : [make(level[0].gen + 1, true)];
  }

  const v = new Vault(`scale-${total}`, { scheme: 'russian', settings: { language: 'ru', nameScheme: 'russian', freeLayout: false } });
  v.attach(...PORTRAITS);
  for (const p of people) {
    const deceased = p.year + 80 < 2026 || p.gen < -3;
    const given = (p.male ? MALE : FEMALE)[p.i % 8];
    v.person(`p${p.i}`, `${p.family}ы`, {
      sex: p.male ? 'male' : 'female', surname: p.family + (p.male ? '' : 'а'), given_name: given, patronymic: `Тестович${p.i}`,
      birth_date: String(p.year), ...(deceased ? { death_date: String(p.year + 50 + Math.floor(rnd() * 35)), life_status: 'deceased' } : { life_status: 'living' }),
      ...(p.i % 8 === 0 ? { photo: `[[attachments/${PORTRAITS[p.i % PORTRAITS.length]}]]` } : {}),
      identity: p.i % 25 === 0 ? 'hypothesis' : 'confirmed',
      body: `Синтетическая карточка №${p.i}.`,
    });
  }
  for (const p of people) if (p.parents) v.parent(p.parents.map((parent) => `p${parent.i}`), `p${p.i}`);
  for (const [a, b] of couples) v.marry(`p${a.i}`, `p${b.i}`);
  v.settings.self = `p${people[people.length - 1].i}`;
  v.expect.extra.generations = new Set(people.map((p) => p.gen)).size;
  return v;
}
