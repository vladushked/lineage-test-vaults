// «empty»: no people yet — the graph shows «add the first person».
import { Vault } from './vault.mjs';

export function empty() {
  const v = new Vault('empty', { scheme: 'russian', settings: { language: 'ru', nameScheme: 'russian', freeLayout: false } });
  v.note('Начало.md', null, 'Пустой vault: родословная начинается с первой карточки.');
  return v;
}
