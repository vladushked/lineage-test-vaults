// «international»: families outside Russia — Western, Spanish, Korean, Chinese, Hungarian, Icelandic, Hebrew and Arabic
// names; dates in English and GEDCOM words; people without a surname. The vault opens in English with the Western
// name scheme. All people are fictional.
import { Vault } from './vault.mjs';

export function international() {
  const v = new Vault('international', { scheme: 'western', settings: { self: 'sm_emma', language: 'en', nameScheme: 'western', freeLayout: false } });
  v.attach('portrait-square.jpg', 'portrait-wide.png');
  const P = (key, dir, f) => v.person(key, dir, f);

  // ── Smith (Western): English dates.
  const W = 'Smith';
  P('sm_john', W, { sex: 'male', given_name: 'John', surname: 'Smith', birth_date: 'abt 1890', death_date: '1960-02-01', birth_place: 'Leeds, England' });
  P('sm_mary', W, { sex: 'female', given_name: 'Mary Ann', surname: 'Smith', birth_surname: 'Jones', birth_date: 'bef 1895', death_date: 'aft 1970' });
  P('sm_robert', W, { sex: 'male', given_name: 'Robert', surname: 'Smith', birth_date: '7 Mar 1915', death_date: '1990s' });
  P('sm_ann', W, { sex: 'female', given_name: 'Ann', surname: 'Brown', birth_surname: 'Smith', birth_date: 'between 1917 and 1919', death_date: '?' });
  P('sm_william', W, { sex: 'male', given_name: 'William', surname: 'Brown', birth_date: 'c. 1915', death_date: '1980' });
  P('sm_james', W, { sex: 'male', given_name: 'James', surname: 'Smith', birth_date: '1950', life_status: 'living' });
  P('sm_emma', W, { sex: 'female', given_name: 'Emma', surname: 'Smith', birth_date: 'March 7, 1985', life_status: 'living', photo: '[[attachments/portrait-wide.png]]', body: 'The «me» card of this vault.' });
  P('sm_aristotle', W, { sex: 'male', given_name: 'Aristotle', birth_date: '1920', death_date: '1999', body: 'No surname at all.' });
  v.parent(['sm_john', 'sm_mary'], ['sm_robert', 'sm_ann']);
  v.parent('sm_robert', 'sm_james'); v.parent('sm_james', 'sm_emma');
  v.marry('sm_john', 'sm_mary'); v.marry('sm_ann', 'sm_william');

  // ── García (Spanish): two surnames.
  const S = 'García';
  P('es_gabriel', S, { sex: 'male', given_name: 'Gabriel José', surname: 'García Márquez', birth_date: '1927', death_date: '2014' });
  P('es_mercedes', S, { sex: 'female', given_name: 'Mercedes', surname: 'Barcha Pardo', birth_date: '1932', death_date: '2020' });
  P('es_rodrigo', S, { sex: 'male', given_name: 'Rodrigo', surname: 'García Barcha', birth_date: '1959', life_status: 'living' });
  v.parent(['es_gabriel', 'es_mercedes'], 'es_rodrigo'); v.marry('es_gabriel', 'es_mercedes');

  // ── Kim (Korean) and Wang (Chinese): surname first; the file name keeps the scheme's order.
  const east = (key, dir, f) => P(key, dir, { ...f, name: `${f.surname} ${f.given_name}`, file: `${f.surname} ${f.given_name} ${f.birth_date}-` });
  east('kr_minjun', 'Kim', { sex: 'male', surname: 'Kim', given_name: 'Min-jun', birth_date: '1960', life_status: 'living' });
  east('kr_jiwoo', 'Kim', { sex: 'female', surname: 'Park', given_name: 'Ji-woo', birth_date: '1962', life_status: 'living', body: 'Keeps her own surname.' });
  east('kr_hangul', 'Kim', { sex: 'female', surname: '김', given_name: '서연', birth_date: '1990', life_status: 'living', body: 'Hangul: the PDF needs a font of the settings.' });
  east('cn_wang', 'Wang', { sex: 'male', surname: '王', given_name: '小明', birth_date: '1955', life_status: 'living' });
  v.parent(['kr_minjun', 'kr_jiwoo'], 'kr_hangul'); v.marry('kr_minjun', 'kr_jiwoo');

  // ── Kovács (Hungarian): surname first.
  east('hu_janos', 'Kovács', { sex: 'male', surname: 'Kovács', given_name: 'János', birth_date: '1940', life_status: 'living' });

  // ── Icelandic: patronymics, no surnames.
  const IS = 'Iceland';
  P('is_sigurdur', IS, { sex: 'male', given_name: 'Sigurður', patronymic: 'Jónsson', birth_date: '1900', death_date: '1970' });
  P('is_jon', IS, { sex: 'male', given_name: 'Jón', patronymic: 'Sigurðsson', birth_date: '1930', death_date: '2000' });
  P('is_gudrun', IS, { sex: 'female', given_name: 'Guðrún', patronymic: 'Jónsdóttir', birth_date: '1960', life_status: 'living' });
  v.parent('is_sigurdur', 'is_jon'); v.parent('is_jon', 'is_gudrun');

  // ── Right-to-left names.
  P('he_david', 'Hebrew', { sex: 'male', name: 'דוד בן גוריון', file: 'David Ben-Gurion 1886-1973', birth_date: '1886', death_date: '1973' });
  P('ar_mohammed', 'Arabic', { sex: 'male', name: 'محمد علي', file: 'Mohammed Ali 1950-', birth_date: '1950', life_status: 'living' });
  P('ar_abdullah', 'Arabic', { sex: 'male', name: 'عبد الله محمد', file: 'Abdullah Mohammed 1980-', birth_date: '1980', life_status: 'living' });
  v.parent('ar_mohammed', 'ar_abdullah');

  v.expect.labels = {
    sm_john: '1890?–1960', sm_mary: '<1895–>1970', sm_robert: '1915–1990s', sm_ann: '1917?–?', sm_emma: 'b. 1985', sm_aristotle: '1920–1999',
  };
  v.expect.clarify = {
    sm_emma: ['second parent', 'children'],
    // The vault's scheme is Western, so it asks Guðrún for a surname too.
    is_gudrun: ['surname', 'second parent', 'children', 'photo'],
    sm_aristotle: ['surname', 'parents', 'children', 'photo'],
  };
  v.expect.routes = [
    { from: 'sm_emma', to: 'sm_robert', ru: 'дедушка', en: 'grandfather', steps: 2 },
    { from: 'sm_emma', to: 'sm_ann', ru: 'двоюродная бабушка', en: 'great-aunt', steps: 4 },
    { from: 'sm_emma', to: 'sm_william', ru: 'муж двоюродной бабушки', en: "great-aunt's husband", steps: 5 },
    { from: 'es_rodrigo', to: 'es_mercedes', ru: 'мать', en: 'mother', steps: 1 },
  ];
  v.expect.roots = [{ from: ['sm_emma'], ancestors: 4, oldest: ['sm_john', 'sm_mary'] }];
  // A new person of each scheme added in the form: what it suggests from the father, the mother and the husband.
  v.expect.extra.hints = [
    { scheme: 'russian', sex: 'female', father: { surname: 'Озеров', given_name: 'Сергей' }, hints: { surname: 'Озерова', given_name: '', patronymic: 'Сергеевна' } },
    { scheme: 'western', sex: 'female', father: { surname: 'Smith', given_name: 'John' }, husband: { surname: 'Brown' }, hints: { surname: 'Smith', given_name: '', patronymic: '' } },
    { scheme: 'spanish', sex: 'male', father: { surname: 'García Márquez', given_name: 'Gabriel' }, mother: { surname: 'Barcha Pardo' }, hints: { surname: 'García Barcha', given_name: '', patronymic: '' } },
    { scheme: 'eastern', sex: 'female', father: { surname: 'Kim', given_name: 'Min-jun' }, hints: { surname: 'Kim', given_name: '', patronymic: '' } },
    { scheme: 'icelandic', sex: 'female', father: { given_name: 'Jón', patronymic: 'Sigurðsson' }, hints: { surname: '', given_name: '', patronymic: 'Jónsdóttir' } },
  ];
  return v;
}
