// Family tree files for the import: GEDCOM 5.5.1 and 7.0, single-byte code pages, a «Древо Жизни» archive and broken
// files. `imports/expected.json` says what reading each should give. All people are fictional.
import fs from 'node:fs';
import path from 'node:path';
import initSqlJs from 'sql.js';

/** Windows-1251 bytes of a text (Cyrillic and ASCII only). */
function cp1251(text) {
  return Uint8Array.from([...text].map((char) => {
    const code = char.charCodeAt(0);
    if (code < 0x80) return code;
    if (code >= 0x410 && code <= 0x44f) return code - 0x410 + 0xc0;
    if (char === 'Ё') return 0xa8;
    if (char === 'ё') return 0xb8;
    if (char === '№') return 0xb9;
    throw new Error(`no Windows-1251 byte for ${char}`);
  }));
}

const lines = (...rows) => `${rows.join('\r\n')}\r\n`;

const GEDCOM_551 = lines(
  '0 HEAD', '1 SOUR TestTree', '1 GEDC', '2 VERS 5.5.1', '2 FORM LINEAGE-LINKED', '1 CHAR UTF-8',
  '0 @I1@ INDI', '1 NAME John /Smith/', '2 GIVN John', '2 SURN Smith', '1 SEX M',
  '1 BIRT', '2 DATE ABT 1890', '2 PLAC Leeds, England', '1 DEAT', '2 DATE 1 FEB 1960', '1 OCCU Miner', '1 FAMS @F1@',
  '0 @I2@ INDI', '1 NAME Mary Ann /Jones/', '1 NAME Mary Ann /Smith/', '2 TYPE married', '1 SEX F', '1 BIRT', '2 DATE BEF 1895', '1 FAMS @F1@',
  '1 NOTE Kept a diary from 1912.', '2 CONT It is lost.',
  '0 @I3@ INDI', '1 NAME Robert /Smith/', '1 SEX M', '1 BIRT', '2 DATE 7 MAR 1915', '1 EMIG', '2 DATE 1948', '2 PLAC Canada', '1 FAMC @F1@',
  '1 SOUR @S1@', '2 PAGE p. 12',
  '0 @I4@ INDI', '1 NAME Ann /Smith/', '1 SEX F', '1 BIRT', '2 DATE BET 1917 AND 1919', '1 FAMC @F1@', '2 PEDI adopted',
  '1 ASSO @I5@', '2 RELA Godparent',
  '0 @I5@ INDI', '1 NAME William /Brown/', '1 SEX M', '1 BIRT', '2 DATE CAL 1915', '1 DEAT Y',
  '0 @F1@ FAM', '1 HUSB @I1@', '1 WIFE @I2@', '1 CHIL @I3@', '1 CHIL @I4@', '1 MARR', '2 DATE 12 JUN 1913', '2 PLAC York',
  '0 @S1@ SOUR', '1 TITL Parish register of York',
  '0 TRLR',
);

const GEDCOM_70 = lines(
  '0 HEAD', '1 GEDC', '2 VERS 7.0', '1 SOUR TestTree7',
  '0 @I1@ INDI', '1 NAME Иван Петрович /Озеров/', '1 SEX M', '1 BIRT', '2 DATE JULIAN 12 APR 1862', '1 DEAT', '2 DATE 1931', '1 FAMS @F1@',
  '1 RELI православный', '1 CAST крестьянин',
  '0 @I2@ INDI', '1 NAME Мария Андреевна /Соколова/', '1 SEX F', '1 BIRT', '2 DATE 1866', '1 FAMS @F1@',
  '0 @I3@ INDI', '1 NAME Николай Иванович /Озеров/', '1 SEX M', '1 BIRT', '2 DATE 1890', '1 FAMC @F1@', '1 SNOTE @N1@',
  '1 _MILT', '2 DATE 1914', '2 PLAC Западный фронт',
  '0 @I4@ INDI', '1 NAME Вера Ивановна /Озерова/', '1 SEX F', '1 BIRT', '2 DATE 1893', '1 FAMC @F1@',
  '0 @F1@ FAM', '1 HUSB @I1@', '1 WIFE @I2@', '1 CHIL @I3@', '1 CHIL @I4@', '1 MARR', '2 DATE 1888',
  '0 @N1@ SNOTE Учитель сельской школы.',
  '0 TRLR',
);

const ANSI_1251 = lines(
  '0 HEAD', '1 GEDC', '2 VERS 5.5', '1 CHAR ANSI',
  '0 @I1@ INDI', '1 NAME Пётр Сергеевич /Кузнецов/', '1 SEX M', '1 BIRT', '2 DATE 1901', '1 FAMS @F1@',
  '0 @I2@ INDI', '1 NAME Анна Ивановна /Кузнецова/', '1 SEX F', '1 FAMS @F1@',
  '0 @I3@ INDI', '1 NAME Ёлка Петровна /Кузнецова/', '1 SEX F', '1 FAMC @F1@',
  '0 @F1@ FAM', '1 HUSB @I1@', '1 WIFE @I2@', '1 CHIL @I3@',
  '0 TRLR',
);

const ANSI_1252 = lines(
  '0 HEAD', '1 GEDC', '2 VERS 5.5', '1 CHAR ANSI',
  '0 @I1@ INDI', '1 NAME René /Müller/', '1 SEX M', '1 BIRT', '2 DATE 1920', '2 PLAC Zürich', '1 FAMS @F1@',
  '0 @I2@ INDI', '1 NAME Françoise /Lefèvre/', '1 SEX F', '1 FAMS @F1@',
  '0 @I3@ INDI', '1 NAME Zoë /Müller/', '1 SEX F', '1 FAMC @F1@',
  '0 @F1@ FAM', '1 HUSB @I1@', '1 WIFE @I2@', '1 CHIL @I3@',
  '0 TRLR',
);

/** A «Древо Жизни 5» database with the tables, field ids and role ids the plugin's reader relies on. */
async function at5() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  const run = (sql) => db.run(sql);
  run(`CREATE TABLE Global (id, guid); CREATE TABLE Persons (id, db_id, sex, lifespan, birth_id, birth_db_id, death_id, death_db_id, isfav);
    CREATE TABLE Events (id, db_id, et_id, et_db_id, isfav, alive); CREATE TABLE EventTypes (id, db_id, namelocale, gedname);
    CREATE TABLE EventRoles (id, db_id, et_id, et_db_id, ord, roletype, ismain); CREATE TABLE EventDetails (id, db_id, p_id, p_db_id, e_id, e_db_id, er_id, er_db_id);
    CREATE TABLE ValuesStr (f_id, f_db_id, rec_id, rec_db_id, rec_table, lang_id, vstr, vblob); CREATE TABLE ValuesDates (f_id, f_db_id, rec_id, rec_db_id, rec_table, d, m, y, d2, m2, y2, type);
    CREATE TABLE ValuesLinks (f_id, f_db_id, rec_id, rec_db_id, rec_table, vlink_id, vlink_db_id, vlink_table); CREATE TABLE Documents (id, db_id, path);
    CREATE TABLE DocumentDetails (id, db_id, d_id, d_db_id, rec_id, rec_db_id, rec_table, d_ord, r_ord); CREATE TABLE __Recs (rec_guid, rec_id, rec_db_id, rec_table);
    INSERT INTO Global VALUES (0, 9223372036854775807);
    INSERT INTO EventTypes VALUES (1,0,41,'BIRT'), (2,0,42,'DEAT'), (3,0,43,'MARR'), (4,0,44,'DIV'), (8,0,48,'ADOP');
    INSERT INTO EventRoles VALUES (1,0,1,0,1,1,1), (2,0,1,0,2,2,0), (3,0,1,0,3,2,0), (4,0,2,0,1,0,1), (5,0,3,0,1,2,1), (6,0,3,0,2,2,1),
      (7,0,4,0,1,3,1), (8,0,4,0,2,3,1), (9,0,8,0,1,1,1), (10,0,8,0,2,2,0), (11,0,8,0,3,2,0);`);
  const person = (id, sex, surname, given, patronymic, other) => {
    run(`INSERT INTO Persons (id, db_id, sex) VALUES (${id}, 0, ${sex}); INSERT INTO __Recs VALUES (10000000000000000${String(id).padStart(2, '0')}, ${id}, 0, 13);
      INSERT INTO ValuesStr VALUES (64,0,${id},0,13,2,'${surname}',NULL), (66,0,${id},0,13,2,'${given}',NULL), (67,0,${id},0,13,2,'${patronymic}',NULL)`);
    if (other) run(`INSERT INTO ValuesStr VALUES (65,0,${id},0,13,2,'${other}',NULL)`);
  };
  const event = (id, type, alive, people, date) => {
    run(`INSERT INTO Events VALUES (${id}, 0, ${type}, 0, 0, ${alive ?? 'NULL'})`);
    people.forEach(([p, role], index) => run(`INSERT INTO EventDetails VALUES (${id * 10 + index}, 0, ${p}, 0, ${id}, 0, ${role}, 0)`));
    if (date) run(`INSERT INTO ValuesDates VALUES (29, 0, ${id}, 0, 7, ${date[0] ?? 'NULL'}, ${date[1] ?? 'NULL'}, ${date[2]}, NULL, NULL, NULL, 0)`);
    if (type === 1) for (const [p, role] of people) if (role === 1) run(`UPDATE Persons SET birth_id = ${id} WHERE id = ${p}`);
    if (type === 2) for (const [p] of people) run(`UPDATE Persons SET death_id = ${id} WHERE id = ${p}`);
  };
  // Иван + Мария (later divorced) → Пётр; Пётр adopted by Олег; Иван died, date unknown.
  person(1, 1, 'Иванов', 'Иван', 'Петрович');
  person(2, 2, 'Иванова', 'Мария', 'Сергеевна', 'Смирнова');
  person(3, 1, 'Иванов', 'Пётр', 'Иванович');
  person(4, 1, 'Орлов', 'Олег', 'Олегович');
  event(10, 1, 0, [[1, 1]], [null, null, 1950]);
  event(11, 1, 1, [[2, 1]], [null, 3, 1952]);
  event(12, 1, 1, [[3, 1], [1, 2], [2, 3]], [7, 5, 1975]);
  event(13, 2, null, [[1, 4]]);
  event(14, 3, null, [[1, 5], [2, 6]]);
  event(15, 4, null, [[1, 7], [2, 8]]);
  event(16, 8, 1, [[3, 9], [4, 10]]);
  return db.export();
}

export async function writeImports(outDir) {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const write = (name, data) => fs.writeFileSync(path.join(outDir, name), data);
  write('family-5.5.1.ged', GEDCOM_551);
  write('family-7.0.ged', `﻿${GEDCOM_70}`);
  write('ansi-1251.ged', cp1251(ANSI_1251));
  write('ansi-1252.ged', Buffer.from(ANSI_1252, 'latin1'));
  write('family.at5', await at5());
  write('broken.ged', 'Это не GEDCOM, а просто текст.\n');
  write('empty.ged', '');
  const expected = {
    'family-5.5.1.ged': {
      // PEDI adopted on Ann's FAMC makes both parents of the family adoptive.
      format: 'gedcom', people: 5, parents: 4, adoptive: 2, couples: 1, godparents: 1,
      names: ['John Smith', 'Mary Ann Smith (Jones)', 'Robert Smith', 'Ann Smith', 'William Brown'],
      dates: { 'John Smith': ['1890?', '1960-02-01'], 'Robert Smith': ['1915-03-07', null], 'Ann Smith': ['1917..1919', null], 'William Brown': ['1915?', '?'] },
    },
    'family-7.0.ged': {
      format: 'gedcom', people: 4, parents: 4, adoptive: 0, couples: 1, godparents: 0,
      names: ['Озеров Иван Петрович', 'Соколова Мария Андреевна', 'Озеров Николай Иванович', 'Озерова Вера Ивановна'],
      dates: { 'Озеров Иван Петрович': ['1862-04-12', '1931'] },
    },
    'ansi-1251.ged': { format: 'gedcom', people: 3, parents: 2, couples: 1, names: ['Кузнецов Пётр Сергеевич', 'Кузнецова Анна Ивановна', 'Кузнецова Ёлка Петровна'] },
    'ansi-1252.ged': { format: 'gedcom', people: 3, parents: 2, couples: 1, names: ['René Müller', 'Françoise Lefèvre', 'Zoë Müller'] },
    'family.at5': { format: 'drevo-zhizni', people: 4, parents: 3, adoptive: 1, couples: 1, names: ['Иванов Иван Петрович', 'Иванова Мария Сергеевна (Смирнова)', 'Иванов Пётр Иванович', 'Орлов Олег Олегович'] },
    'broken.ged': { error: true },
    'empty.ged': { error: true },
  };
  write('expected.json', `${JSON.stringify(expected, null, 2)}\n`);
}
