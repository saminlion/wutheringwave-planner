/**
 * Box opening plan.
 *
 * A box (boxes.json) is an owned item that turns into other materials when opened:
 *   - `fixed`  — one box gives every `contents` entry × qty
 *   - `select` — one box gives ONE `contents` entry × qty, the player's pick
 *
 * Unopened boxes are NOT counted as owned materials: the planner keeps showing the real
 * shortage, and this plan says how many boxes to open (and what to pick) to cover it.
 * Opening boxes is preferred over farming, so the plan uses every box that still helps.
 *
 * The plan is greedy, and every step is judged by the real calculator (synthesis
 * included), so a box of T1 materials counts towards a T3 shortage when crafting can
 * carry it there:
 *   1. For every owned box (and every pick of a `select` box) find the fewest boxes that
 *      achieve the most it can reduce the remaining shortage.
 *   2. Commit the candidate with the best reduction per box opened.
 *   3. Repeat on the updated inventory until nothing reduces the shortage any further.
 */

const EPSILON = 1e-9;

/**
 * Unit-free shortage score: every material short at the start weighs 1, so a T1
 * material and a 100,000-point EXP pool count the same. Lower is better; 0 = complete.
 */
const scoreOf = (shortages, baseline) => {
  let score = 0;
  for (const [key, base] of Object.entries(baseline)) {
    if (base > 0) score += Math.min(shortages[key] || 0, base) / base;
  }
  return score;
};

const openInto = (inventory, boxId, entries, count) => {
  const next = { ...inventory };
  next[boxId] = Math.max(0, (next[boxId] || 0) - count);
  for (const { game_id: gid, qty } of entries) {
    const key = String(gid);
    next[key] = (next[key] || 0) + qty * count;
  }
  return next;
};

const positiveOnly = (shortages) => {
  const out = {};
  for (const [key, qty] of Object.entries(shortages || {})) {
    if (qty > 0) out[key] = qty;
  }
  return out;
};

/**
 * Read an owned count whichever way the inventory keys it (numbers vs strings).
 */
const ownedOf = (inventory, id) => inventory[id] ?? inventory[String(id)] ?? 0;

/**
 * Normalise an inventory to string keys, so opening a box adds to the same slot the
 * calculator reads.
 */
const normalise = (inventory) => {
  const out = {};
  for (const [key, qty] of Object.entries(inventory || {})) {
    out[String(key)] = (out[String(key)] || 0) + qty;
  }
  return out;
};

/**
 * @param {Object} args
 * @param {Object} args.inventory  `{ game_id: qty }`, boxes included
 * @param {Object} args.boxes      boxes.json
 * @param {(inventory: Object) => Object} args.evaluate
 *        inventory → `{ key: shortage }` for the current goals (see `createShortageEvaluator`)
 * @param {number} [args.maxRounds]
 * @returns {{
 *   steps: Array<{ boxId: string, type: string, count: number, choice: string|null, gains: Object }>,
 *   before: Object, after: Object, covered: Object, resolved: string[]
 * }}
 *   `covered[key]`  — how much of that shortage the steps cover
 *   `resolved`      — keys whose shortage the steps cover completely
 */
export function planBoxOpening({ inventory, boxes, evaluate, maxRounds = 100 }) {
  let current = normalise(inventory);
  const before = positiveOnly(evaluate(current));
  const empty = { steps: [], before, after: before, covered: {}, resolved: [] };

  // Substitutes (substitutes.js) are spent by the game itself, never opened.
  const owned = Object.values(boxes || {}).filter(
    (box) => box && box.type !== 'substitute' && Array.isArray(box.contents) && box.contents.length > 0
      && ownedOf(current, box.game_id) > 0,
  );
  if (owned.length === 0 || Object.keys(before).length === 0) return empty;

  const stepsByKey = new Map();
  let shortages = before;
  let score = scoreOf(shortages, before);

  for (let round = 0; round < maxRounds && score > EPSILON; round += 1) {
    let best = null;

    for (const box of owned) {
      const boxId = String(box.game_id);
      const remaining = ownedOf(current, boxId);
      if (remaining <= 0) continue;

      const picks = box.type === 'select'
        ? box.contents.map((entry) => ({ choice: String(entry.game_id), entries: [entry] }))
        : [{ choice: null, entries: box.contents }];

      for (const { choice, entries } of picks) {
        const scoreAt = (count) => scoreOf(evaluate(openInto(current, boxId, entries, count)), before);

        const floor = scoreAt(remaining);
        if (floor >= score - EPSILON) continue; // this box/pick does not help at all

        // Fewest boxes that still reach `floor` (the score never rises as more open).
        let lo = 1;
        let hi = remaining;
        while (lo < hi) {
          const mid = Math.floor((lo + hi) / 2);
          if (scoreAt(mid) <= floor + EPSILON) hi = mid;
          else lo = mid + 1;
        }

        const gain = score - floor;
        const candidate = { box, boxId, choice, entries, count: lo, gain, perBox: gain / lo };
        if (!best
          || candidate.perBox > best.perBox + EPSILON
          || (Math.abs(candidate.perBox - best.perBox) <= EPSILON && candidate.gain > best.gain + EPSILON)) {
          best = candidate;
        }
      }
    }

    if (!best) break;

    current = openInto(current, best.boxId, best.entries, best.count);
    shortages = positiveOnly(evaluate(current));
    score = scoreOf(shortages, before);

    const key = `${best.boxId}:${best.choice ?? ''}`;
    const step = stepsByKey.get(key) ?? {
      boxId: best.boxId,
      type: best.box.type === 'select' ? 'select' : 'fixed',
      count: 0,
      choice: best.choice,
      gains: {},
    };
    step.count += best.count;
    for (const { game_id: gid, qty } of best.entries) {
      step.gains[String(gid)] = (step.gains[String(gid)] || 0) + qty * best.count;
    }
    stepsByKey.set(key, step);
  }

  const covered = {};
  const resolved = [];
  for (const [key, base] of Object.entries(before)) {
    const left = shortages[key] || 0;
    if (left < base) covered[key] = base - left;
    if (left <= 0) resolved.push(key);
  }

  return { steps: [...stepsByKey.values()], before, after: shortages, covered, resolved };
}

/**
 * Build the `evaluate` function the planner uses: the same shortage numbers Final
 * Material Needs shows, for any hypothetical inventory.
 *
 * @param {Object} args
 * @param {Object} args.totalNeeds      `{ game_id | expCategory: qty }` summed over visible goals
 * @param {Object} args.tieredMaterials tiers.js
 * @param {Object} args.expCategories   `{ category: [{ id, value }] }`
 * @param {(inventory, tiers, needs) => { final_needs: Object }} args.calculate  calculateMaterials
 * @param {(id) => string|null} args.subCategoryOf
 */
export function createShortageEvaluator({ totalNeeds, tieredMaterials, expCategories, calculate, subCategoryOf }) {
  const tiered = [];
  const flat = [];
  const exp = [];
  for (const [key, need] of Object.entries(totalNeeds || {})) {
    if (key === 'processed' || !(need > 0)) continue;
    if (expCategories?.[key]) exp.push([key, need]);
    else if ((subCategoryOf(key) ?? '') in (tieredMaterials || {})) tiered.push(key);
    else flat.push([key, need]);
  }

  // final_needs only settles tiered ids; every other key comes back untouched.
  const tieredIds = new Set();
  for (const tiers of Object.values(tieredMaterials || {})) {
    for (const entry of Object.values(tiers || {})) {
      if (entry?.game_id != null) tieredIds.add(String(entry.game_id));
    }
  }

  return (inventory) => {
    const shortages = {};

    if (tiered.length > 0) {
      const { final_needs: finalNeeds = {} } = calculate({ ...inventory }, tieredMaterials, totalNeeds);
      for (const [key, qty] of Object.entries(finalNeeds)) {
        if (qty > 0 && tieredIds.has(String(key))) shortages[String(key)] = qty;
      }
    }

    for (const [key, need] of flat) {
      const left = need - ownedOf(inventory, key);
      if (left > 0) shortages[String(key)] = left;
    }

    for (const [category, need] of exp) {
      const ownedExp = expCategories[category]
        .reduce((sum, { id, value }) => sum + ownedOf(inventory, id) * value, 0);
      if (need - ownedExp > 0) shortages[category] = need - ownedExp;
    }

    return shortages;
  };
}

export default planBoxOpening;
