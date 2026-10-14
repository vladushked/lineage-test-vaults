/** A deterministic random number generator (linear congruential), so every run writes the same vaults. */
export function random(seed) {
  let state = seed >>> 0;
  return () => ((state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}
