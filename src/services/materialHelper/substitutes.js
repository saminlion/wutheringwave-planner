/**
 * Substitute items.
 *
 * A substitute (boxes.json, `type: 'substitute'`) is an owned item the game spends on an
 * upgrade in place of a material the player is short of. The upgrade uses the owned
 * materials first and the substitute only fills what is still missing; nothing is opened
 * or converted beforehand. (NTE's Expansion Core: Esper Ability / Arc upgrades only, more
 * cores the rarer the missing material.)
 *
 *   { game_id, type: 'substitute', contents: [{ game_id, cost, scope? }] }
 *   `cost`  — substitutes spent per 1 missing material (may be fractional)
 *   `scope` — upgrade parts it may be spent on (`['skill', 'weapon']`); absent = any
 *
 * Parts are `<goal type>.<part>`: `character.level`, `character.skill`,
 * `character.passive`, `weapon.level`. A scope token matches a part when it equals the
 * whole key, the goal type or the part name — so `skill` matches `character.skill`,
 * `weapon` matches `weapon.level`, `level` matches both level parts.
 *
 * Unlike a box, an owned substitute DOES count towards goal completion: a goal whose
 * shortage the substitutes cover is satisfied, and Complete deducts them. The shortage
 * number on the material card stays as it is; a badge says how much substitutes cover.
 */

const EPSILON = 1e-9;
const UNKNOWN_PART = '';

const ownedOf = (inventory, id) => inventory?.[id] ?? inventory?.[String(id)] ?? 0;

/** The substitute entries of a boxes.json. */
export const getSubstitutes = (boxes) => Object.values(boxes || {}).filter(
  (box) => box?.type === 'substitute' && Array.isArray(box.contents) && box.contents.length > 0,
);

/** True when the inventory holds at least one substitute. */
export const ownsSubstitute = (substitutes, inventory) =>
  (substitutes || []).some((sub) => ownedOf(inventory, sub.game_id) > 0);

/** Does a scope (list of tokens, or nothing = everything) allow this part? */
export const scopeAllows = (scope, part) => {
  if (!Array.isArray(scope) || scope.length === 0) return true;
  if (part === UNKNOWN_PART) return false; // a scoped substitute needs to know where the need came from
  const [type, name] = part.split('.');
  return scope.some((token) => {
    const t = String(token).trim().toLowerCase();
    return t === part || t === type || t === name;
  });
};

/**
 * `{ part: { materialId: qty } }` (one or many goals) → `{ materialId: { part: qty } }`.
 */
export const partNeedsOf = (...partsList) => {
  const out = {};
  for (const parts of partsList) {
    for (const [part, materials] of Object.entries(parts || {})) {
      for (const [id, qty] of Object.entries(materials || {})) {
        if (id === 'processed' || !(qty > 0)) continue;
        const key = String(id);
        out[key] ??= {};
        out[key][part] = (out[key][part] || 0) + qty;
      }
    }
  }
  return out;
};

/**
 * Split one material's shortage over the parts that need it. Owned stock goes to the
 * parts the fewest substitutes may serve, so what is left short sits where substitutes
 * can be spent — the order the player would upgrade in to save them.
 */
const splitShortage = (shortage, needs, coverage) => {
  const parts = Object.entries(needs || {}).filter(([, qty]) => qty > 0);
  const total = parts.reduce((sum, [, qty]) => sum + qty, 0);
  const short = {};
  // Short by more than the parts account for: the excess has no known origin.
  if (shortage > total) short[UNKNOWN_PART] = shortage - total;

  let owned = Math.max(0, total - shortage);
  parts.sort((a, b) => coverage(a[0]) - coverage(b[0]));
  for (const [part, qty] of parts) {
    const used = Math.min(owned, qty);
    owned -= used;
    if (qty - used > 0) short[part] = qty - used;
  }
  return short;
};

/**
 * Cover shortages with owned substitutes.
 *
 * Narrow substitutes go first (one that stands in for 3 materials is spent before one that
 * stands in for 40), then the cheaper ones, so the broad ones stay free for whatever only
 * they can cover. The shortages with the fewest substitute options, then the smallest,
 * are served first — when there are not enough substitutes, that completes the most.
 *
 * @param {Object} shortages  `{ materialId: qty }` still missing after owned + synthesis
 * @param {Array}  substitutes  getSubstitutes() result
 * @param {Object} inventory  `{ game_id: qty }` — substitutes are read from here
 * @param {Object} [partNeeds]  partNeedsOf() of the goals behind `shortages`. Without it
 *        every shortage has an unknown part, which only unscoped substitutes may cover.
 * @returns {{
 *   uses: Array<{ substituteId: string, materialId: string, count: number, covers: number }>,
 *   used: Object, covered: Object, remaining: Object, resolved: string[]
 * }}
 *   `used[substituteId]` — substitutes spent · `covered[materialId]` — shortage covered
 *   `remaining` — shortage left over (positive only) · `resolved` — fully covered ids
 */
export function allocateSubstitutes(shortages, substitutes, inventory, partNeeds = {}) {
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
    for (const { game_id: gid, cost, scope } of sub.contents) {
      if (!(cost > 0)) continue;
      const key = String(gid);
      if (!optionsFor.has(key)) optionsFor.set(key, []);
      optionsFor.get(key).push({ subId, cost, scope, breadth: sub.contents.length });
    }
  }
  if (optionsFor.size === 0) return result;

  for (const options of optionsFor.values()) {
    options.sort((a, b) => a.breadth - b.breadth || a.cost - b.cost);
  }

  const keys = Object.keys(remaining)
    .filter((key) => optionsFor.has(key))
    .sort((a, b) => optionsFor.get(a).length - optionsFor.get(b).length || remaining[a] - remaining[b]);

  for (const key of keys) {
    const options = optionsFor.get(key);
    const coverage = (part) => options.filter((o) => scopeAllows(o.scope, part)).length;
    const short = splitShortage(remaining[key], partNeeds?.[key], coverage);
    const before = remaining[key];
    let left = before;

    for (const { subId, cost, scope } of options) {
      if (left <= 0) break;
      const parts = Object.keys(short).filter((part) => short[part] > 0 && scopeAllows(scope, part));
      const reachable = parts.reduce((sum, part) => sum + short[part], 0);
      const affordable = Math.floor(pool[subId] / cost + EPSILON);
      const covers = Math.min(left, reachable, affordable);
      if (covers <= 0) continue;

      const count = Math.ceil(covers * cost - EPSILON);
      pool[subId] -= count;
      left -= covers;
      let toTake = covers;
      for (const part of parts) {
        const take = Math.min(toTake, short[part]);
        short[part] -= take;
        toTake -= take;
        if (toTake <= 0) break;
      }
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
