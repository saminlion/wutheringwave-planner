/**
 * Substitute items.
 *
 * A substitute (boxes.json, `type: 'substitute'`) is an owned item the game spends on an
 * upgrade in place of a material the player is short of. The upgrade uses the owned
 * materials first and the substitute only fills what is still missing; nothing is opened
 * or converted beforehand.
 *
 *   { game_id, type: 'substitute', contents: [{ game_id, qty }] }
 *   `contents` — every material it can stand in for; one substitute = `qty` of that material
 *
 * So, unlike a box, an owned substitute DOES count towards goal completion: a goal whose
 * shortage the substitutes cover is satisfied, and Complete deducts them. The shortage
 * number on the material card stays as it is; a badge says how much substitutes cover.
 */

const ownedOf = (inventory, id) => inventory?.[id] ?? inventory?.[String(id)] ?? 0;

/** The substitute entries of a boxes.json. */
export const getSubstitutes = (boxes) => Object.values(boxes || {}).filter(
  (box) => box?.type === 'substitute' && Array.isArray(box.contents) && box.contents.length > 0,
);

/** True when the inventory holds at least one substitute. */
export const ownsSubstitute = (substitutes, inventory) =>
  (substitutes || []).some((sub) => ownedOf(inventory, sub.game_id) > 0);

/**
 * Cover shortages with owned substitutes.
 *
 * Narrow substitutes go first (one that stands in for 3 materials is spent before one that
 * stands in for 40), so the broad ones stay free for whatever only they can cover. The
 * shortages with the fewest substitute options, then the smallest, are served first — when
 * there are not enough substitutes, that completes the most materials.
 *
 * @param {Object} shortages  `{ materialId: qty }` still missing after owned + synthesis
 * @param {Array}  substitutes  getSubstitutes() result
 * @param {Object} inventory  `{ game_id: qty }` — substitutes are read from here
 * @returns {{
 *   uses: Array<{ substituteId: string, materialId: string, count: number, covers: number }>,
 *   used: Object, covered: Object, remaining: Object, resolved: string[]
 * }}
 *   `used[substituteId]` — substitutes spent · `covered[materialId]` — shortage covered
 *   `remaining` — shortage left over (positive only) · `resolved` — fully covered ids
 */
export function allocateSubstitutes(shortages, substitutes, inventory) {
  const remaining = {};
  for (const [key, qty] of Object.entries(shortages || {})) {
    if (qty > 0) remaining[String(key)] = qty;
  }
  const result = { uses: [], used: {}, covered: {}, remaining, resolved: [] };

  const pool = {};
  const optionsFor = new Map();
  for (const sub of substitutes || []) {
    const subId = String(sub.game_id);
    pool[subId] = ownedOf(inventory, sub.game_id);
    if (pool[subId] <= 0) continue;
    for (const { game_id: gid, qty } of sub.contents) {
      if (!(qty > 0)) continue;
      const key = String(gid);
      if (!optionsFor.has(key)) optionsFor.set(key, []);
      optionsFor.get(key).push({ subId, qty, breadth: sub.contents.length });
    }
  }
  if (optionsFor.size === 0) return result;

  for (const options of optionsFor.values()) {
    options.sort((a, b) => a.breadth - b.breadth || b.qty - a.qty);
  }

  const keys = Object.keys(remaining)
    .filter((key) => optionsFor.has(key))
    .sort((a, b) => optionsFor.get(a).length - optionsFor.get(b).length || remaining[a] - remaining[b]);

  for (const key of keys) {
    const before = remaining[key];
    let left = before;
    for (const { subId, qty } of optionsFor.get(key)) {
      if (left <= 0) break;
      const count = Math.min(pool[subId], Math.ceil(left / qty));
      if (count <= 0) continue;
      pool[subId] -= count;
      const covers = Math.min(left, count * qty);
      left -= covers;
      result.uses.push({ substituteId: subId, materialId: key, count, covers });
      result.used[subId] = (result.used[subId] || 0) + count;
    }

    if (left < before) result.covered[key] = before - left;
    if (left <= 0) {
      delete remaining[key];
      result.resolved.push(key);
    } else {
      remaining[key] = left;
    }
  }

  return result;
}

export default allocateSubstitutes;
