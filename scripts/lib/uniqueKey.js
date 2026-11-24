/**
 * JSON keys for characters / weapons / materials come from the display name (`"Weapon"` →
 * `weapon`). Two rows with the same name — placeholder rows for unreleased items, typically —
 * used to land on the same key, and the later row silently replaced the earlier one: five
 * WW weapons named "Weapon" synced as one (2026-11-24).
 *
 * The app keys everything by game_id, so the JSON key only has to be unique. A clash keeps the
 * first row's key and gives the later row `<key>_<game_id>`; the sync logs it (a GitHub
 * `::warning::` in Actions) and drops nothing — the sheet stays the source of truth.
 *
 * @param {object} target  the object the row is about to be written into
 * @param {string} key     the name-derived key
 * @param {string|number} gameId
 * @param {string} what    label for the log line, e.g. "weapon"
 * @returns {string} a key not yet used in `target`
 */
export function uniqueKey(target, key, gameId, what = 'row') {
  // Same game_id twice is the same item listed again, not a clash — overwrite as before.
  if (!(key in target) || String(target[key]?.game_id) === String(gameId)) return key;

  let candidate = `${key}_${gameId}`;
  for (let n = 2; candidate in target; n += 1) candidate = `${key}_${gameId}_${n}`;

  const prefix = process.env.GITHUB_ACTIONS ? '::warning::' : '    ⚠ ';
  console.warn(
    `${prefix}${what} key "${key}" is used by more than one row (game_id ${target[key]?.game_id} and ${gameId}); `
      + `the later row is kept as "${candidate}". Give the rows distinct names or a key column.`,
  );
  return candidate;
}
