// «scenarios»: hand-made families, each folder one kind of case — from a clean six-generation line to broken links,
// strange names, photos in every format and notes that are not people. All people are fictional.
import { Vault } from './vault.mjs';

export function scenarios() {
  const v = new Vault('scenarios', { scheme: 'russian', settings: { self: 'oz_denis', language: 'ru', nameScheme: 'russian', freeLayout: false } });
  v.attach('portrait-square.jpg', 'portrait-tall.png', 'portrait-wide.png', 'portrait-huge.png', 'portrait-tiny.png', 'corrupt.png',
    'portrait.svg', 'portrait.gif', 'portrait.webp', 'portrait.bmp', 'Портрет с пробелами и кириллицей.png', 'scan.pdf', 'not-an-image.txt');
  /** A person; without a death date and born after 1925 they are living. */
  const P = (key, dir, f) => {
    const born = Number(String(f.birth_date ?? '').match(/\d{4}/)?.[0]);
    if (f.life_status === undefined && f.death_date === undefined && born >= 1925) f = { ...f, life_status: 'living' };
    return v.person(key, dir, f);
  };
  const male = (surname, given, patronymic, extra = {}) => ({ sex: 'male', surname, given_name: given, patronymic, ...extra });
  const female = (surname, given, patronymic, extra = {}) => ({ sex: 'female', surname, given_name: given, patronymic, ...extra });

  // ── Озеровы: a clean line over six generations, marriages and portraits; «me» is Денис.
  const D = 'Озеровы';
  P('oz_pyotr', D, male('Озеров', 'Пётр', 'Иванович', { birth_date: '1862-04-12', death_date: '1931-11-02', birth_place: 'д. Озерки', body: 'Старейший предок основной линии. Родители — карточки с неполными данными.' }));
  P('oz_maria', D, female('Озерова', 'Мария', 'Андреевна', { birth_surname: 'Соколова', birth_date: '1866', death_date: '1940' }));
  P('oz_nikolai', D, male('Озеров', 'Николай', 'Петрович', { birth_date: '1890-02-01', death_date: '1944-08-15', photo: '[[attachments/portrait-square.jpg]]', occupation: 'учитель', body: 'Умерший с явным фото: портрет затемнён.' }));
  P('oz_anna', D, female('Лебедева', 'Анна', 'Фёдоровна', { birth_date: '1894', death_date: '1971', body: 'Портрет — первое встроенное изображение.\n\n![[attachments/portrait-tall.png]]' }));
  P('oz_vera', D, female('Озерова', 'Вера', 'Петровна', { birth_date: '1893', death_date: '1980', body: 'Без супруга и детей.' }));
  P('oz_alexei', D, male('Озеров', 'Алексей', 'Николаевич', { birth_date: '1920-05-20', death_date: '1999-01-09', military: ['1941–1945, 3-й Белорусский фронт'] }));
  P('oz_nina', D, female('Крылова', 'Нина', 'Ивановна', { birth_date: '1924', death_date: '2010' }));
  P('oz_galina', D, female('Озерова', 'Галина', 'Николаевна', { birth_date: '1925', death_date: '2003' }));
  P('oz_sergei', D, male('Озеров', 'Сергей', 'Алексеевич', { birth_date: '1950-07-07', residences: ['1950, Тверь', '1975, Москва'] }));
  P('oz_olga', D, female('Озерова', 'Ольга', 'Петровна', { birth_surname: 'Миронова', birth_date: '1955' }));
  P('oz_denis', D, male('Озеров', 'Денис', 'Сергеевич', { birth_date: '1990-03-14', photo: '[[attachments/portrait-wide.png]]', body: 'Карточка «меня» (настройка «Найти себя»). Широкий портрет.' }));
  P('oz_anastasia', D, female('Ковалёва', 'Анастасия', 'Сергеевна', { birth_surname: 'Озерова', birth_date: '1993', body: 'Замужем за Ковалёвым — связывает две семьи.' }));
  P('oz_elena', D, female('Озерова', 'Елена', 'Викторовна', { birth_surname: 'Орлова', birth_date: '1992' }));
  P('oz_lev', D, male('Озеров', 'Лев', 'Денисович', { birth_date: '2020-09-01' }));
  v.parent(['oz_pyotr', 'oz_maria'], ['oz_nikolai', 'oz_vera']);
  v.parent(['oz_nikolai', 'oz_anna'], ['oz_alexei', 'oz_galina']);
  v.parent(['oz_alexei', 'oz_nina'], 'oz_sergei');
  v.parent(['oz_sergei', 'oz_olga'], ['oz_denis', 'oz_anastasia']);
  v.parent(['oz_denis', 'oz_elena'], 'oz_lev');
  for (const [a, b] of [['oz_pyotr', 'oz_maria'], ['oz_nikolai', 'oz_anna'], ['oz_alexei', 'oz_nina'], ['oz_sergei', 'oz_olga'], ['oz_denis', 'oz_elena']]) v.marry(a, b);
  v.get('oz_denis').marriages = [`${v.link('oz_elena')}: брак 2018-06-16, Москва`];
  v.get('oz_elena').marriages = [`${v.link('oz_denis')}: брак 2018-06-16, Москва`];

  // ── Неполные данные: only a name, an unknown death date, a hypothesis, values outside the schema.
  const U = 'Неполные данные';
  P('un_agafya', U, { sex: 'female', given_name: 'Агафья', identity: 'probable', body: 'Известно только имя; статус жизни неизвестен.' });
  P('un_ivan', U, { sex: 'male', given_name: 'Иван', birth_date: '1830?', death_date: '?', identity: 'probable', body: 'Умер, дата неизвестна: `death_date: ?`.' });
  P('un_hyp', U, { sex: 'male', surname: 'Озеров', given_name: '?', birth_date: '1800?', death_date: '1860?', identity: 'hypothesis', questions: ['Отец ли он Ивана?'], body: 'Гипотеза: пунктирный контур.' });
  P('un_photo', U, { file: 'Неопознанный человек на фото', name: 'Неопознанный человек на фото', identity: 'hypothesis', photo: '[[attachments/portrait-tall.png]]', body: 'Без связей, с портретом и гипотезой.' });
  P('un_badvalues', U, { surname: 'Статусов', given_name: 'Неизвестный', birth_date: '1900', death_date: '1960', sex: 'мужчина', life_status: 'жив', identity: 'не знаю', body: 'Значения вне схемы: три «некорректных значения» в Проблемах.' });
  P('un_empty', U, { surname: 'Безстатусов', given_name: 'Пустой', birth_date: '1902', death_date: '1962', identity: '', body: 'Пустые значения — не проблема.' });
  v.parent(['un_agafya', 'un_ivan'], 'oz_pyotr');
  v.parent('un_hyp', 'un_ivan');
  v.marry('un_agafya', 'un_ivan');
  v.marry('un_badvalues', 'un_empty');

  // ── Ковалёвы: two marriages, half siblings, a single known parent, parents who are not married.
  const K = 'Ковалёвы';
  P('kv_ivan', K, male('Ковалёв', 'Иван', 'Павлович', { birth_date: '1930', death_date: '2001', body: 'Два брака; дети обоих браков висят на разных парах.' }));
  P('kv_tamara', K, female('Ковалёва', 'Тамара', 'Ильинична', { birth_date: '1932', death_date: '1965' }));
  P('kv_zoya', K, female('Ковалёва', 'Зоя', 'Сергеевна', { birth_date: '1940', death_date: '2015', body: 'Вторая жена; есть ребёнок от неизвестного отца.' }));
  P('kv_boris', K, male('Ковалёв', 'Борис', 'Иванович', { birth_date: '1955', body: 'Четверо детей без известной матери.' }));
  P('kv_lidia', K, female('Ткачёва', 'Лидия', 'Ивановна', { birth_surname: 'Ковалёва', birth_date: '1958' }));
  P('kv_andrey', K, male('Ткачёв', 'Андрей', 'Викторович', { birth_date: '1957' }));
  P('kv_igor', K, male('Ковалёв', 'Игорь', 'Иванович', { birth_date: '1968' }));
  P('kv_oleg', K, male('Белов', 'Олег', 'Семёнович', { birth_date: '1962', body: 'Сын Зои от неизвестного отца: единоутробный брат Игоря.' }));
  P('kv_ksenia', K, female('Смирнова', 'Ксения', 'Олеговна', { birth_date: '1971', body: 'Мать Артёма, не жена Игорю: родители соединены пунктиром.' }));
  P('kv_artem', K, male('Ковалёв', 'Артём', 'Игоревич', { birth_date: '1995' }));
  P('kv_polina', K, female('Ткачёва', 'Полина', 'Андреевна', { birth_date: '1985', body: 'Единственный ребёнок пары.' }));
  for (const [key, given, year, sex] of [['kv_maxim', 'Максим', 1980, 'male'], ['kv_daria', 'Дарья', 1983, 'female'], ['kv_kirill', 'Кирилл', 1986, 'male'], ['kv_egor', 'Егор', 1990, 'male']]) {
    P(key, K, { sex, surname: sex === 'male' ? 'Ковалёв' : 'Ковалёва', given_name: given, patronymic: sex === 'male' ? 'Борисович' : 'Борисовна', birth_date: String(year) });
  }
  P('kv_timofei', K, male('Ковалёв', 'Тимофей', 'Максимович', { birth_date: '2010' }));
  v.parent(['kv_ivan', 'kv_tamara'], ['kv_boris', 'kv_lidia']);
  v.parent(['kv_ivan', 'kv_zoya'], 'kv_igor');
  v.parent('kv_zoya', 'kv_oleg');
  v.parent(['kv_igor', 'kv_ksenia'], 'kv_artem');
  v.parent(['kv_lidia', 'kv_andrey'], 'kv_polina');
  v.parent('kv_boris', ['kv_maxim', 'kv_daria', 'kv_kirill', 'kv_egor']);
  v.parent('kv_maxim', 'kv_timofei');
  v.marry('kv_ivan', 'kv_tamara'); v.marry('kv_ivan', 'kv_zoya'); v.marry('kv_lidia', 'kv_andrey'); v.marry('kv_artem', 'oz_anastasia');

  // ── Громовы: namesakes, equal file names in two folders, an ambiguous short link.
  const G = 'Громовы';
  P('gr_a1', G, male('Громов', 'Александр', 'Михайлович', { birth_date: '1925', death_date: '2001', body: 'Тёзка №1.' }));
  P('gr_v', G, female('Громова', 'Валентина', 'Ивановна', { birth_date: '1928', death_date: '2010' }));
  P('gr_mikhail', G, male('Громов', 'Михаил', 'Александрович', { birth_date: '1950' }));
  P('gr_p', G, male('Громов', 'Михаил', 'Петрович', { birth_date: '1940', death_date: '1999' }));
  P('gr_a2', G, male('Громов', 'Александр', 'Михайлович', { birth_date: '1966', body: 'Тёзка №2 из другой ветки: в поиске различаются годами.' }));
  v.parent(['gr_a1', 'gr_v'], 'gr_mikhail'); v.parent('gr_p', 'gr_a2'); v.marry('gr_a1', 'gr_v');
  P('dup_a', 'Громовы/Дубликаты/А', male('Смирнов', 'Иван', '', { birth_date: '1990', body: 'Такое же имя файла лежит в папке Б.' }));
  P('dup_b', 'Громовы/Дубликаты/Б', male('Смирнов', 'Иван', '', { birth_date: '1990', body: 'Двойник из папки А — другой человек.' }));
  v.get('dup_a').linkAs = `Громовы/Дубликаты/А/${v.get('dup_a').file}`;
  v.get('dup_b').linkAs = `Громовы/Дубликаты/Б/${v.get('dup_b').file}`;
  P('dup_pa', 'Громовы/Дубликаты/А', male('Смирнов', 'Пётр', '', { birth_date: '1960' }));
  P('dup_pb', 'Громовы/Дубликаты/Б', male('Смирнов', 'Павел', '', { birth_date: '1962' }));
  v.parent('dup_pa', 'dup_a'); v.parent('dup_pb', 'dup_b');
  P('dup_amb', 'Громовы/Дубликаты', male('Смирнов', 'Сын-неоднозначник', '', { birth_date: '2015', body: 'Ссылается на двойника без пути: Obsidian выберет одного.' }));
  v.entry('dup_amb', 'parents', `[[${v.get('dup_a').file}]]`, { oneOf: ['dup_a', 'dup_b'] });

  // ── Даты: every way to write a date the plugin reads, and some it does not.
  const T = 'Даты';
  P('dt_root', T, male('Датов', 'Корень', 'Иванович', { birth_date: '1960', death_date: '2020', body: 'Родитель карточек с разными датами (звезда).' }));
  const dates = [
    ['01', '1915?', undefined, '1915?–'], ['02', '~1915', '?', '1915?–?'], ['03', 'около 1915', '1980', '1915?–1980'],
    ['04', '1910-е', '1990-е', '1910-е–1990-е'], ['05', '1915-03', '1980-12', '1915–1980'], ['06', '1915-03-07', '1980-12-31', '1915–1980'],
    ['07', '15 марта 1915', 'умер в войну', '?–?'], ['08', 'неизвестно', 'неизвестно', '?–?'], ['09', 1915, 1980, '1915–1980'],
    ['10', 'ок. 1915', '≈1980', '1915?–1980?'], ['11', 'circa 1915', 'ca. 1980', '1915?–1980?'], ['12', '1915–1920', '   ', '1915?–'],
    ['13', 'до 1920', 'после 1980', '<1920–>1980'], ['14', { raw: '1915-03-07' }, { raw: 'null' }, '1915–'], ['15', undefined, undefined, ''],
    ['16', '1915/03/07', '07.03.1915', '?–1915'], ['17', 'abt 1890', 'bef 1950', '1890?–<1950'], ['18', '7 Mar 1915', 'March 7, 1980', '1915–1980'],
    ['19', '1910s', 'aft 1980', '1910-е–>1980'], ['20', 'between 1910 and 1920', 'est 1990', '1910?–1990?'], ['21', 'bet 1890 and 1895', 'from 1950 to 1955', '1890?–1950?'],
  ];
  for (const [n, birth, death, label] of dates) {
    const f = { sex: 'male', surname: 'Датов', given_name: `Вариант ${n}`, file: `Датов Вариант ${n}`, raw: {} };
    for (const [field, value] of [['birth_date', birth], ['death_date', death]]) {
      if (value && typeof value === 'object') f.raw[field] = value.raw; else if (value !== undefined) f[field] = value;
    }
    f.body = `Рождение: ${JSON.stringify(birth ?? null)}; смерть: ${JSON.stringify(death ?? null)}. Подпись: «${label}».`;
    P(`dt_${n}`, T, f);
    v.parent('dt_root', `dt_${n}`);
    v.expect.labels[`dt_${n}`] = label;
  }
  P('dt_living', T, { ...male('Датов', 'Живой', 'Корневич'), birth_date: '1997', life_status: 'living' });
  v.parent('dt_root', 'dt_living');
  v.expect.labels.dt_living = 'р. 1997';
  v.expect.labels.oz_pyotr = '1862–1931';

  // ── Сломанные связи: everything that goes to Проблемы; the graph must not break.
  const B = 'Сломанные связи';
  P('bk_gp', B, male('Сломанов', 'Дед', 'Петрович', { birth_date: '1930', death_date: '2000', body: 'Называет внука ребёнком напрямую: пропуск поколения.' }));
  P('bk_root', B, male('Сломанов', 'Корень', 'Иванович', { birth_date: '1960', body: 'Ссылки на несуществующую карточку, на себя, простым текстом.' }));
  P('bk_ok', B, male('Сломанов', 'Нормальный', 'Корневич', { birth_date: '1990' }));
  v.parent('bk_gp', 'bk_root'); v.parent('bk_root', 'bk_ok');
  v.parent('bk_gp', 'bk_ok', { only: 'parent' });
  v.generationIssue('bk_ok', 'bk_gp');
  v.entry('bk_root', 'parents', '[[Сломанные связи/Нет такой карточки]]', 'missing');
  v.entry('bk_root', 'parents', v.link('bk_root'), 'self');
  v.entry('bk_root', 'children', v.link('bk_root'), 'self');
  v.entry('bk_root', 'spouses', v.link('bk_root'), 'self');
  v.entry('bk_root', 'spouses', 'Бывшая жена (просто текст)', 'missing');
  P('bk_parent_only', B, male('Односторонов', 'Родитель', '', { birth_date: '1940', body: 'Объявил ребёнка, ребёнок о нём не знает — связь есть.' }));
  P('bk_child_a', B, male('Односторонов', 'Ребёнок-А', '', { birth_date: '1965' }));
  P('bk_parent_b', B, male('Односторонов', 'Родитель-Б', '', { birth_date: '1941' }));
  P('bk_child_only', B, male('Односторонов', 'Ребёнок', '', { birth_date: '1966', body: 'Объявил родителя, родитель о нём не знает.' }));
  v.parent('bk_parent_only', 'bk_child_a', { only: 'parent' });
  v.parent('bk_parent_b', 'bk_child_only', { only: 'child' });
  P('bk_x', B, male('Взаимов', 'Икс', '', { birth_date: '1970', body: 'Икс и Игрек называют друг друга детьми: одна из связей противоречит поколениям.' }));
  P('bk_y', B, male('Взаимов', 'Игрек', '', { birth_date: '1995' }));
  v.parent('bk_x', 'bk_y', { only: 'parent' }); v.parent('bk_y', 'bk_x', { only: 'parent' });
  v.expect.extra.generationIssueOneOf = [[v.path('bk_y'), v.path('bk_x')], [v.path('bk_x'), v.path('bk_y')]];
  P('bk_forms', B, male('Формов', 'Странные-Поля', '', { birth_date: '1980', body: 'Поля родства в разных формах: алиас, якорь, строка с двумя ссылками, число.' }));
  P('bk_forms_a', B, male('Формов', 'Ребёнок-А', '', { birth_date: '2005', raw: { children: 'null', spouses: '""' } }));
  P('bk_forms_b', B, male('Формов', 'Ребёнок-Б', '', { birth_date: '2007' }));
  v.entry('bk_forms', 'parents', `[[${v.get('bk_parent_only').file}|Алиас родителя]]`, { to: 'bk_parent_only' });
  v.entry('bk_forms', 'parents', `[[${v.get('bk_gp').file}#Кратко]]`, { to: 'bk_gp' });
  v.entry('bk_forms', 'children', `${v.link('bk_forms_a')}, ${v.link('bk_forms_b')}`, { to: ['bk_forms_a', 'bk_forms_b'] });
  v.entry('bk_forms', 'spouses', 5, 'ignored');
  v.entry('bk_forms_b', 'parents', v.get('bk_forms').file, { to: 'bk_forms' });

  // ── Notes that are not people, the templates folder, a card in the vault root.
  v.note('Заметки/Обычная заметка.md', null, `Без frontmatter. Ссылки в теле не создают родство: ${v.link('oz_pyotr')}, ${v.link('oz_denis')}.`);
  v.note('Заметки/Тип — список.md', 'type:\n  - person\nname: "Не человек (тип — список)"', 'Тип не строка: в граф не попадает.');
  v.note('Заметки/Тип — источник.md', 'type: source\nname: "Метрическая книга 1890"', 'Источник, а не человек.');
  v.note('Заметки/Тип — пустой.md', 'type:\nname: "Не человек (пустой тип)"', 'Не человек.');
  v.note('Заметки/Тип — Person.md', 'type: Person\nname: "Не человек (регистр)"', 'Тип сравнивается точно: `Person` — не человек.');
  v.note('templates/Карточка из шаблона.md', `type: person\nname: "Шаблонная карточка"\nspouses:\n  - "${v.link('oz_denis')}"`, 'Папка templates не попадает в граф.');
  P('root_card', '', { name: 'Карточка в корне vault', file: 'Вне папок', body: 'Карточка в корне vault, без связей.' });

  // ── Сложные семьи: many children, three marriages, adoption, a same-sex couple, cousins married.
  const F = 'Сложные семьи';
  P('mc_f', F, male('Многодетов', 'Отец', 'Иванович', { birth_date: '1950' }));
  P('mc_m', F, female('Многодетова', 'Мать', 'Петровна', { birth_date: '1953' }));
  v.marry('mc_f', 'mc_m');
  for (let i = 1; i <= 9; i++) { P(`mc_c${i}`, F, male('Многодетов', `Ребёнок${i}`, 'Отцович', { birth_date: String(1974 + i * 2) })); v.parent(['mc_f', 'mc_m'], `mc_c${i}`); }
  P('tm_h', F, male('Трибрачнов', 'Герой', 'Иванович', { birth_date: '1960', body: 'Три последовательных брака, у каждой пары дети.' }));
  for (const [n, given, year] of [['1', 'Первая', 1962], ['2', 'Вторая', 1966], ['3', 'Третья', 1970]]) {
    P(`tm_w${n}`, F, female('Трибрачнова', given, 'Сергеевна', { birth_date: String(year) }));
    P(`tm_k${n}`, F, male('Трибрачнов', `Дитя-${n}`, 'Геройевич', { birth_date: String(1985 + Number(n) * 3) }));
    v.marry('tm_h', `tm_w${n}`); v.parent(['tm_h', `tm_w${n}`], `tm_k${n}`);
  }
  P('tm_k3b', F, male('Трибрачнов', 'Дитя-3б', 'Геройевич', { birth_date: '1997' })); v.parent(['tm_h', 'tm_w3'], 'tm_k3b');
  P('ad_f', F, male('Приёмов', 'Биоотец', 'Иванович', { birth_date: '1980' }));
  P('ad_m', F, female('Приёмова', 'Биомать', 'Петровна', { birth_date: '1982' }));
  P('ad_sf', F, male('Приёмов', 'Отчим', 'Олегович', { birth_date: '1979', body: 'Усыновил ребёнка: связь пунктиром.' }));
  P('ad_sm', F, female('Приёмова', 'Приёмная-Мать', 'Олеговна', { birth_date: '1984' }));
  P('ad_c', F, male('Приёмов', 'Ребёнок', 'Биоотцович', { birth_date: '2008', body: 'Родные родители и приёмные.' }));
  v.parent(['ad_f', 'ad_m'], 'ad_c'); v.parent(['ad_sf', 'ad_sm'], 'ad_c', { adoptive: true });
  v.marry('ad_f', 'ad_m'); v.marry('ad_sf', 'ad_sm');
  P('ss_a', F, female('Однополова', 'Анна', 'Игоревна', { birth_date: '1985' }));
  P('ss_b', F, female('Однополова', 'Белла', 'Сергеевна', { birth_date: '1987' }));
  P('ss_c', F, { sex: 'unknown', surname: 'Однополов', given_name: 'Ребёнок', birth_date: '2015', body: 'Ребёнок пары двух женщин.' });
  v.marry('ss_a', 'ss_b'); v.parent(['ss_a', 'ss_b'], 'ss_c');
  P('gap_a', F, male('Разновозрастов', 'Старший', 'Фёдорович', { birth_date: '1920', death_date: '1995' }));
  P('gap_b', F, female('Разновозрастова', 'Младшая', 'Игоревна', { birth_date: '1960' }));
  v.marry('gap_a', 'gap_b');
  P('gc_p', F, male('Грачёв', 'Общий-Предок', 'Иванович', { birth_date: '1900', death_date: '1970' }));
  P('gc_a', F, male('Грачёв', 'Сын-А', 'Иванович', { birth_date: '1925', death_date: '1990' }));
  P('gc_b', F, male('Грачёв', 'Сын-Б', 'Иванович', { birth_date: '1928', death_date: '1995' }));
  P('gc_c', F, female('Грачёва', 'Дочь-А', 'Алексеевна', { birth_date: '1950' }));
  P('gc_d', F, male('Грачёв', 'Сын-Б', 'Борисович', { birth_date: '1952', body: 'Женат на двоюродной сестре: ветку нельзя скрыть «глазом».' }));
  P('gc_e', F, male('Грачёв', 'Общий-Правнук', 'Борисович', { birth_date: '1980' }));
  v.parent('gc_p', ['gc_a', 'gc_b']); v.parent('gc_a', 'gc_c'); v.parent('gc_b', 'gc_d'); v.parent(['gc_c', 'gc_d'], 'gc_e'); v.marry('gc_c', 'gc_d');

  // ── Острова: a separate family and people without links.
  const I = 'Острова';
  P('is_p', I, male('Одинцов', 'Отец', 'Николаевич', { birth_date: '1970' }));
  P('is_m', I, female('Одинцова', 'Мать', 'Олеговна', { birth_date: '1972' }));
  P('is_c', I, male('Одинцов', 'Сын', 'Отцович', { birth_date: '2000' }));
  v.marry('is_p', 'is_m'); v.parent(['is_p', 'is_m'], 'is_c');
  P('is_s1', I, male('Одиноков', 'Первый', '', { birth_date: '1900', death_date: '1970' }));
  P('is_s2', I, male('Одиноков', 'Второй', '', { birth_date: '1999' }));
  P('is_s3', I, { surname: 'Одиноков', given_name: 'Третий' });

  // ── Имена: escaping, length, scripts.
  const E = 'Имена';
  P('nm_root', E, male('Именов', 'Корень', 'Иванович', { birth_date: '1960' }));
  const names = [
    ['01', 'Тестов <b>Жирный</b> & "Кавычки" \'апостроф\'', 'Спецсимволы XML/HTML.'],
    ['02', 'Тестов &amp; Ампер &lt;', 'Уже экранированные сущности остаются текстом.'],
    ['03', 'Фамилия-Очень-Длинная-Двойная-Через-Дефис Имя-Тоже-Через-Дефис Отчество-Тоже-Длинное-Пребольшое-Преогромное Иванович-Петрович-Сидорович', 'Очень длинное имя.'],
    ['04', "O'Brien Seán-Michael Ó Súilleabháin", 'Латиница с диакритикой.'],
    ['05', 'Łukasz Żółkiewski · Nguyễn Văn Đức', 'Польский и вьетнамский: встроенный шрифт PDF.'],
    ['06', 'Тестов 🙂 Эмодзи', 'Эмодзи: в PDF нет глифа — экспорт называет букву.'],
    ['07', 'Я', 'Однобуквенное имя.'],
    ['08', false, 'Нет `name` — берётся имя файла.'],
    ['09', '', 'Пустое `name` — берётся имя файла.'],
    ['10', '  Пробелов  Вокруг  ', 'Пробелы по краям.'],
    ['11', 'محمد علي', 'Арабское имя: справа налево.'],
    ['12', 'דוד בן גוריון', 'Иврит.'],
    ['13', '王小明', 'Китайское имя: в PDF нужен свой шрифт.'],
    ['14', '1234567', 'Имя из цифр.'],
  ];
  for (const [n, name, body] of names) {
    P(`nm_${n}`, E, { file: `Именов Случай${n} 2000-`, name, birth_date: '2000', life_status: 'living', body });
    v.parent('nm_root', `nm_${n}`);
  }
  P('nm_multiline', E, { file: 'Именов Случай15 2000-', name: false, birth_date: '2000', life_status: 'living', raw: { name: '|-\n  Многострочное\n  имя' }, body: 'Блок-строка YAML с переносом.' });
  v.parent('nm_root', 'nm_multiline');

  // ── Фото: every way to point at a portrait.
  const PH = 'Фото';
  P('ph_root', PH, male('Фотов', 'Родитель', 'Портретович', { birth_date: '1960' }));
  const photos = [
    ['01', { photo: '[[attachments/portrait-tall.png]]' }, 'Явный `photo` викиссылкой.', true],
    ['02', { photo: 'attachments/portrait-wide.png' }, 'Явный путь без скобок.', true],
    ['03', { photo: '[[attachments/не-существует.png]]', body: '![[attachments/portrait-square.jpg]]' }, 'Битый путь → первое встроенное.', true],
    ['04', { body: '![[attachments/portrait-square.jpg]]' }, 'Только встроенное изображение.', true],
    ['05', { body: '![[attachments/portrait-tall.png]]\n\n![[attachments/portrait-wide.png]]' }, 'Два встроенных: первое.', true],
    ['06', { body: '![[attachments/scan.pdf]]' }, 'Только PDF: портрета нет.', false],
    ['07', { body: '![[attachments/scan.pdf]]\n\n![[attachments/portrait-square.jpg]]' }, 'PDF пропускается.', true],
    ['08', { photo: '[[attachments/scan.pdf]]' }, '`photo` на PDF.', false],
    ['09', { photo: '[[attachments/not-an-image.txt]]' }, '`photo` на текст.', false],
    ['10', { photo: '[[attachments/portrait-huge.png]]' }, '4000×3000.', true],
    ['11', { photo: '[[attachments/portrait-tiny.png]]' }, '8×8.', true],
    ['12', { photo: '[[attachments/corrupt.png]]' }, 'Повреждённый PNG: граф жив.', true],
    ['13', { photo: '[[attachments/portrait.svg]]' }, 'SVG.', true],
    ['14', { photo: '[[attachments/portrait.gif]]' }, 'GIF.', true],
    ['15', { photo: '[[attachments/portrait.webp]]' }, 'WebP.', true],
    ['16', { photo: '[[attachments/portrait.bmp]]' }, 'BMP.', true],
    ['17', { photo: '[[attachments/Портрет с пробелами и кириллицей.png]]' }, 'Кириллица и пробелы в имени файла.', true],
    ['18', { photo: '[[attachments/portrait-tall.png]]' }, 'Тот же файл у двух людей.', true],
    ['19', { photo: '![[attachments/portrait-tall.png|100]]' }, 'Встраивание с размером в `photo`.', true],
    ['20', { raw: { photo: '\n  - "[[attachments/portrait-tall.png]]"\n  - "[[attachments/portrait-wide.png]]"' } }, '`photo` — список: игнорируется.', false],
    ['21', { photo: '[[attachments/portrait-square.jpg]]', death_date: '2015' }, 'Умерший с портретом — затемнение.', true],
    ['22', { photo: '[[attachments/portrait-square.jpg]]', identity: 'hypothesis' }, 'Гипотеза с портретом — пунктир.', true],
  ];
  v.expect.extra.portraits = {};
  for (const [n, extra, body, has] of photos) {
    const key = `ph_${n}`;
    P(key, PH, { sex: 'male', surname: 'Фотов', given_name: `Случай${n}`, file: `Фотов Случай${n} 1990-`, birth_date: '1990', ...(extra.death_date ? {} : { life_status: 'living' }), ...extra, body: [body, extra.body].filter(Boolean).join('\n\n') });
    v.parent('ph_root', key);
    v.expect.extra.portraits[v.path(key)] = has;
  }

  // ── Конфликты источников: two versions of one date, kinship only in the text.
  const S = 'Конфликты источников';
  P('sc_a', S, male('Сорокин', 'Спорный', 'Данилович', { birth_date: '1901', death_date: '1969', identity: 'probable', sources: ['Метрическая книга 1901', 'Паспорт 1932: 1902'], questions: ['Год рождения: 1901 или 1902?'] }));
  P('sc_b', S, male('Сорокин', 'Потомок', 'Спорныч', { birth_date: '1935', death_date: '2000', body: 'Родство подтверждено только устно.' }));
  v.parent('sc_a', 'sc_b');

  // ── What the plugin should say about some of them.
  v.expect.clarify = {
    oz_denis: [],
    oz_lev: ['дети', 'фото'],
    un_agafya: ['фамилия', 'отчество', 'родители', 'дата рождения', 'статус жизни', 'фото', 'подтверждено частично'],
    sc_a: ['родители', 'фото', 'подтверждено частично', 'вопрос: Год рождения: 1901 или 1902?'],
  };
  v.expect.routes = [
    { from: 'oz_denis', to: 'oz_lev', ru: 'сын', en: 'son', steps: 1 },
    { from: 'oz_denis', to: 'oz_nikolai', ru: 'прадедушка', en: 'great-grandfather', steps: 3 },
    { from: 'oz_denis', to: 'oz_galina', ru: 'двоюродная бабушка', en: 'great-aunt', steps: 4 },
    { from: 'oz_denis', to: 'kv_artem', ru: 'зять', en: 'brother-in-law', steps: 3 },
    // Олег's father is unknown, so he may be a full brother: no «единоутробный».
    { from: 'kv_igor', to: 'kv_oleg', ru: 'брат', en: 'brother', steps: 2 },
    { from: 'kv_boris', to: 'kv_igor', ru: 'единокровный брат', en: 'half-brother', steps: 2 },
    { from: 'oz_denis', to: 'is_c', ru: null, en: null, steps: null },
  ];
  v.expect.roots = [{ from: ['oz_denis'], ancestors: 11, oldest: ['un_hyp'] }];
  return v;
}
