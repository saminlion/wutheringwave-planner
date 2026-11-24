/**
 * JSON keys for characters / weapons / materials come from the display name (`"Weapon"` →
 * `weapon`). Two rows with the same name — placeholder rows for unreleased items, typically —
 * used to land on the same key, and the later row silently replaced the earlier one: five
 * WW weapons named "Weapon" synced as one (2026-11-24).
 *
 * The app keys everything by game_id, so the JSON key only has to be unique. A clash keeps the
 * first row's key and gives the later row `<key>_<game_id>`; nothing is dropped — the sheet stays
 * the source of truth. The clash is logged (a GitHub `::warning::` in Actions) unless **both**
 * rows are unreleased placeholders: those share a stand-in name on purpose until the game
 * announces the real one. A released row clashing with anything still warns.
 */

/** Unreleased rows carry `unknown` in their type/element/weapon cells until the sheet is filled in. */
export const isUnreleased = (item) =>
  [item?.type, item?.element, item?.weapon, item?.weapon_type].some(
    (v) => String(v ?? '').trim().toLowerCase() === 'unknown',
  );

/**
 * @param {object} target  the object the row is about to be written into
 * @param {string} key     the name-derived key
 * @param {{game_id: string|number}} item  the row about to be written
 * @param {string} what    label for the log line, e.g. "weapon"
 * @returns {string} a key not yet used in `target`
 */
export function uniqueKey(target, key, item, what = 'row') {
  const existing = target[key];
  // Same game_id twice is the same item listed again, not a clash — overwrite as before.
  if (!(key in target) || String(existing?.game_id) === String(item.game_id)) return key;

  let candidate = `${key}_${item.game_id}`;
  for (let n = 2; candidate in target; n += 1) candidate = `${key}_${item.game_id}_${n}`;

  if (!(isUnreleased(existing) && isUnreleased(item))) {
    const prefix = process.env.GITHUB_ACTIONS ? '::warning::' : '    ⚠ ';
    console.warn(
      `${prefix}${what} key "${key}" is used by more than one row (game_id ${existing?.game_id} and ${item.game_id}); `
        + `the later row is kept as "${candidate}". Give the rows distinct names or a key column.`,
    );
  }
  return candidate;
}
