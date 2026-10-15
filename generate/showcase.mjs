// «showcase»: one English-speaking family over six generations for the plugin's README, GIF and directory
// screenshots — stories, places, occupations, a second marriage, an adoption and a hypothesis. Portraits are drawn
// silhouettes, so nobody could take them for real people. All people are fictional.
import { Vault } from './vault.mjs';

/** A drawn head-and-shoulders silhouette: sepia for the old generations, quiet colours for the later ones. */
function portrait(seed, sex, born) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const old = born < 1925;
  const hue = old ? 30 + (h % 14) : [205, 160, 260, 15, 120, 340][h % 6];
  const sat = old ? 32 : 28;
  const bg1 = `hsl(${hue} ${sat}% ${old ? 78 : 80}%)`; const bg2 = `hsl(${hue} ${sat}% ${old ? 58 : 62}%)`;
  const ink = `hsl(${hue} ${old ? 30 : 22}% ${old ? 24 : 26}%)`;
  const hair = sex === 'female'
    ? `<path d="M58 92c0-34 18-54 42-54s42 20 42 54c0 22-6 38-12 48H70c-6-10-12-26-12-48z" fill="${ink}" opacity=".55"/>`
    : `<path d="M66 80c0-24 14-40 34-40s34 16 34 40c-8-12-20-16-34-16s-26 4-34 16z" fill="${ink}" opacity=".55"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 200 200">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs>
<rect width="200" height="200" fill="url(#g)"/>
${hair}
<circle cx="100" cy="86" r="30" fill="${ink}"/>
<path d="M40 200c4-40 30-62 60-62s56 22 60 62z" fill="${ink}"/>
</svg>`;
}

export function showcase() {
  const v = new Vault('showcase', { scheme: 'western', settings: { self: 'emily', language: 'en', nameScheme: 'western', freeLayout: false } });
  const P = (key, dir, f) => {
    const born = Number(String(f.birth_date ?? '1950').match(/\d{4}/)?.[0] ?? 1950);
    if (f.photo !== false) {
      v.note(`attachments/${key}.svg`, null, portrait(key, f.sex, born));
      f = { ...f, photo: `[[attachments/${key}.svg]]` };
    } else {
      f = { ...f }; delete f.photo;
    }
    return v.person(key, dir, { body: '', ...f });
  };
  const living = { life_status: 'living' };

  // ── Generation −5 and −4: four lines that meet in Emily.
  P('thomas', 'Carter', { sex: 'male', given_name: 'Thomas', surname: 'Carter', birth_date: '1846', death_date: '1921', birth_place: 'Bristol, England', occupation: 'Shipwright',
    body: 'Built river barges in Bristol and taught all four sons the trade. Two of them stayed with it.' });
  P('margaret', 'Carter', { sex: 'female', given_name: 'Margaret', surname: 'Carter', birth_surname: 'Hughes', birth_date: '1850', death_date: '1930', birth_place: 'Cardiff, Wales' });
  P('henry', 'Walsh', { sex: 'male', given_name: 'Henry', surname: 'Walsh', birth_date: 'abt 1848', death_date: '1909', birth_place: 'Cork, Ireland', occupation: 'Farmer',
    body: 'Left Cork with his brother in 1871; only Henry stayed in England.' });
  P('eliza', 'Walsh', { sex: 'female', given_name: 'Eliza', surname: 'Walsh', birth_surname: 'Bennett', birth_date: '1852', death_date: '1924' });
  P('george', 'Price', { sex: 'male', given_name: 'George', surname: 'Price', birth_date: '1855', death_date: '1932', birth_place: 'Leeds, England', occupation: 'Printer' });
  P('alice', 'Price', { sex: 'female', given_name: 'Alice', surname: 'Price', birth_surname: 'Morgan', birth_date: '1858', death_date: '1940' });
  P('william_h', 'Hale', { sex: 'male', given_name: 'William', surname: 'Hale', birth_date: '1851', death_date: '1915', occupation: 'Schoolmaster' });
  P('sarah', 'Hale', { sex: 'female', given_name: 'Sarah', surname: 'Hale', birth_surname: 'Lloyd', birth_date: '1854', death_date: '1919' });
  v.marry('thomas', 'margaret'); v.marry('henry', 'eliza'); v.marry('george', 'alice'); v.marry('william_h', 'sarah');

  // ── Generation −3.
  P('arthur', 'Carter', { sex: 'male', given_name: 'Arthur', surname: 'Carter', birth_date: '1876', death_date: '1944', occupation: 'Shipwright' });
  P('edward', 'Carter', { sex: 'male', given_name: 'Edward', surname: 'Carter', birth_date: '1879', death_date: '1916', military: ['1914–1916, Gloucestershire Regiment'],
    body: 'Fell at the Somme in July 1916. His letters home are kept by the Hale side of the family.' });
  P('florence', 'Carter', { sex: 'female', given_name: 'Florence', surname: 'Carter', birth_date: '1882', death_date: '1961' });
  P('rose', 'Carter', { sex: 'female', given_name: 'Rose', surname: 'Carter', birth_surname: 'Walsh', birth_date: '1880', death_date: '1958' });
  P('patrick', 'Walsh', { sex: 'male', given_name: 'Patrick', surname: 'Walsh', birth_date: '1883', death_date: '1950', occupation: 'Railway clerk' });
  P('albert', 'Price', { sex: 'male', given_name: 'Albert', surname: 'Price', birth_date: '1882', death_date: '1955', occupation: 'Printer' });
  P('mabel', 'Price', { sex: 'female', given_name: 'Mabel', surname: 'Price', birth_surname: 'Hale', birth_date: '1885', death_date: '1971' });
  P('frederick', 'Hale', { sex: 'male', given_name: 'Frederick', surname: 'Hale', birth_date: '1888', death_date: '1940' });
  v.parent(['thomas', 'margaret'], ['arthur', 'edward', 'florence']);
  v.parent(['henry', 'eliza'], ['rose', 'patrick']);
  v.parent(['george', 'alice'], 'albert');
  v.parent(['william_h', 'sarah'], ['mabel', 'frederick']);
  v.marry('arthur', 'rose'); v.marry('albert', 'mabel');

  // ── Generation −2.
  P('james', 'Carter', { sex: 'male', given_name: 'James', surname: 'Carter', birth_date: '1905', death_date: '1978', birth_place: 'Bristol, England', occupation: 'Engineer',
    residences: ['1911, Bristol', '1939, Coventry'], body: 'Moved to Coventry for the aircraft works in 1936 and never went back to the docks.' });
  P('dorothy', 'Carter', { sex: 'female', given_name: 'Dorothy', surname: 'Carter', birth_surname: 'Price', birth_date: '1908', death_date: '1990', occupation: 'Seamstress' });
  P('walter', 'Carter', { sex: 'male', given_name: 'Walter', surname: 'Carter', birth_date: '1909', death_date: '1943', military: ['1940–1943, Royal Navy'] });
  P('irene', 'Price', { sex: 'female', given_name: 'Irene', surname: 'Price', birth_date: '1912', death_date: '2001' });
  P('agnes', 'Walsh', { sex: 'female', given_name: 'Agnes', surname: 'Walsh', birth_date: '1910', death_date: '?', identity: 'hypothesis',
    body: 'A daughter of Patrick, if the 1911 census entry is the same family. Not confirmed.' });
  v.parent(['arthur', 'rose'], ['james', 'walter']);
  v.parent(['albert', 'mabel'], ['dorothy', 'irene']);
  v.parent('patrick', 'agnes');
  v.marry('james', 'dorothy');

  // ── Generation −1: a second marriage and an adoption.
  P('robert', 'Carter', { sex: 'male', given_name: 'Robert', surname: 'Carter', birth_date: '1934', death_date: '2012', birth_place: 'Coventry, England', occupation: 'Teacher',
    body: 'Taught history for forty years and started writing down the family tree in 1975.' });
  P('joan', 'Carter', { sex: 'female', given_name: 'Joan', surname: 'Carter', birth_surname: 'Miller', birth_date: '1936', death_date: '1971' });
  P('helen', 'Carter', { sex: 'female', given_name: 'Helen', surname: 'Carter', birth_surname: 'Ward', birth_date: '1941', death_date: '2019' });
  P('peter', 'Carter', { sex: 'male', given_name: 'Peter', surname: 'Carter', birth_date: '1938', death_date: '2005' });
  P('margaret_c', 'Carter', { sex: 'female', given_name: 'Margaret', surname: 'Evans', birth_surname: 'Carter', birth_date: '1940', death_date: '2016' });
  P('john_e', 'Evans', { sex: 'male', given_name: 'John', surname: 'Evans', birth_date: '1937', death_date: '2010' });
  v.parent(['james', 'dorothy'], ['robert', 'peter', 'margaret_c']);
  v.marry('robert', 'joan'); v.marry('robert', 'helen'); v.marry('margaret_c', 'john_e');

  // ── Generation 0's parents.
  P('michael', 'Carter', { sex: 'male', given_name: 'Michael', surname: 'Carter', birth_date: '1962', ...living, occupation: 'Architect' });
  P('susan', 'Carter', { sex: 'female', given_name: 'Susan', surname: 'Carter', birth_surname: 'Walsh', birth_date: '1964', ...living,
    body: 'A great-granddaughter of Henry Walsh: the Carters and the Walshes met twice.' });
  P('david', 'Carter', { sex: 'male', given_name: 'David', surname: 'Carter', birth_date: '1966', ...living });
  P('anna', 'Carter', { sex: 'female', given_name: 'Anna', surname: 'Carter', birth_date: '1974', ...living, body: 'Adopted by Robert and Helen in 1976.' });
  P('claire', 'Evans', { sex: 'female', given_name: 'Claire', surname: 'Evans', birth_date: '1965', ...living });
  P('brian', 'Walsh', { sex: 'male', given_name: 'Brian', surname: 'Walsh', birth_date: '1936', death_date: '2008' });
  P('kathleen', 'Walsh', { sex: 'female', given_name: 'Kathleen', surname: 'Walsh', birth_surname: 'Doyle', birth_date: '1939', death_date: '2020' });
  P('thomas_w', 'Walsh', { sex: 'male', given_name: 'Thomas', surname: 'Walsh', birth_date: '1912', death_date: '1985' });
  v.parent(['robert', 'joan'], ['michael', 'david']);
  v.parent(['robert', 'helen'], 'anna', { adoptive: true });
  v.parent(['margaret_c', 'john_e'], 'claire');
  v.parent('patrick', 'thomas_w'); v.parent('thomas_w', 'brian');
  v.parent(['brian', 'kathleen'], 'susan');
  v.marry('michael', 'susan'); v.marry('brian', 'kathleen');

  // ── Generation 0 and +1.
  P('emily', 'Carter', { sex: 'female', given_name: 'Emily', surname: 'Carter', birth_date: '1994', ...living, birth_place: 'Coventry, England', occupation: 'Archivist',
    body: 'Keeps the family archive: letters, photographs and grandfather Robert\'s notebooks.' });
  P('daniel', 'Carter', { sex: 'male', given_name: 'Daniel', surname: 'Carter', birth_date: '1991', ...living });
  P('lucy', 'Carter', { sex: 'female', given_name: 'Lucy', surname: 'Carter', birth_date: '1998', ...living });
  P('oliver', 'Carter', { sex: 'male', given_name: 'Oliver', surname: 'Carter', birth_date: '1995', ...living, photo: false });
  P('sophie', 'Evans', { sex: 'female', given_name: 'Sophie', surname: 'Evans', birth_date: '1993', ...living, photo: false });
  P('mark', 'Bennett', { sex: 'male', given_name: 'Mark', surname: 'Bennett', birth_date: '1992', ...living });
  P('noah', 'Bennett', { sex: 'male', given_name: 'Noah', surname: 'Bennett', birth_date: '2021', ...living, photo: false });
  P('grace', 'Bennett', { sex: 'female', given_name: 'Grace', surname: 'Bennett', birth_date: '2024', ...living, photo: false });
  v.parent(['michael', 'susan'], ['daniel', 'emily', 'lucy']);
  v.parent('david', 'oliver');
  v.parent('claire', 'sophie');
  v.parent(['emily', 'mark'], ['noah', 'grace']);
  v.marry('emily', 'mark');

  v.note('About this vault.md', null, '# Carter family\n\nA fictional family for the Genealogy Graph plugin\'s screenshots. Every person and portrait here is made up.');
  return v;
}
