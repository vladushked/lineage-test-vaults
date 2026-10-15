# Genealogy Graph test vaults

Generated Obsidian vaults for testing the [Genealogy Graph](https://github.com/vladushked/genealogy-graph) plugin. **All people are fictional**; any resemblance is accidental.

The plugin checks this repository out as the submodule `test/fixtures` and runs its vault and UI tests on it (see the plugin's `TESTING.md`). Every vault can also be opened by hand in Obsidian («Open folder as vault»): the plugin settings are prepared in `.obsidian/plugins/genealogy-graph/data.json`; copy or link a build of the plugin into that folder.

```sh
npm ci
npm run generate   # rewrite vaults/ and imports/
npm run check      # fail if the committed files differ from what the generator writes
```

The generator is deterministic (fixed seeds); CI runs `npm run check`. Do not edit the vaults by hand — change `generate/` and regenerate.

## Vaults

Each vault has `expected.json`: what the plugin should find there, written by the generator from its own description of the people — people, links, problems, life-year labels, «Уточнить», kinship routes with their terms in Russian and English, «Корни», portraits.

| Vault | Inside |
|---|---|
| `scenarios` | One folder per kind of case (in Russian, the plugin's first language). **Озеровы** — a clean line over six generations, «me» is Денис. **Неполные данные** — only a given name, `death_date: ?`, a hypothesis, values outside the schema (`sex: мужчина`). **Ковалёвы** — two marriages, half siblings, a single known parent, unmarried parents. **Громовы** — namesakes, equal file names in two folders, an ambiguous short link. **Даты** — every way to write a date, Russian, English and GEDCOM words. **Сломанные связи** — links to missing cards, to oneself, as plain text; a link skipping a generation; mutual parent links; link forms (alias, anchor, two links in one string, a number, a bare name). **Заметки** and `templates` — notes that are not people. **Сложные семьи** — nine children, three marriages, adoption, a same-sex couple, married cousins. **Острова** — a separate family and people without links. **Имена** — HTML characters, long names, Polish, Vietnamese, Arabic, Hebrew, Chinese, emoji. **Фото** — 22 ways to point at a portrait. **Конфликты источников** — two versions of a date. |
| `international` | Western (English dates), Spanish (two surnames), Korean and Chinese (surname first), Hungarian, Icelandic (patronymics), Hebrew and Arabic names, a person without a surname. Opens in English with the Western name scheme. |
| `scale-500`, `scale-1000` | Large generated families for speed checks. |
| `empty` | No people yet. |
| `showcase` | The Carter family over six generations, in English: stories, places, occupations, a second marriage, an adoption, a hypothesis, drawn silhouette portraits. The plugin records its README GIF and directory screenshots here. |

## Import files

`imports/` holds family tree files for the plugin's import with `expected.json` of what reading them gives: `family-5.5.1.ged` (English, adoption, godparent, married name), `family-7.0.ged` (GEDCOM 7, Julian date, shared note), `ansi-1251.ged` and `ansi-1252.ged` (single-byte code pages without a declared one), `family.at5` («Древо Жизни» 5), `broken.ged`, `empty.ged`.

Portraits in `assets/attachments` are drawn shapes, not photos of people.
