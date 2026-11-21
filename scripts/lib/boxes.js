/**
 * Boxes tab → boxes.json
 *
 * Two kinds of item live here, one sheet row per thing they can give or stand in for.
 *
 * Boxes — opened into other materials:
 *
 *   box                     | type   | item              | qty   | picks
 *   Traveler's EXP Aid      | fixed  | Advanced Potion   | 8     |
 *   Traveler's EXP Aid      | fixed  | Shell Credit      | 24000 |
 *   Forgery Premium Supply  | select | Cadence Blossom   | 1     | 1
 *   Forgery Premium Supply  | select | Presto Helix      | 1     |
 *
 * - `fixed`  (or blank): opening one box gives every row's item × qty.
 * - `select`: opening one box lets the player pick `picks` times (default 1) from the
 *   rows, each pick giving that row's item × qty. `picks` may sit on any one row.
 *
 * Substitutes — never opened; the game spends them on an upgrade in place of a
 * material the player is short of (src/services/materialHelper/substitutes.js):
 *
 *   box            | type       | item        | cost | scope
 *   Expansion Core | substitute | @forgery:T1 | 1    | skill, weapon
 *   Expansion Core | substitute | @forgery:T2 | 3    | skill, weapon
 *
 * - `cost`: substitutes spent per 1 missing material (fractions allowed).
 * - `scope`: upgrade parts it may be spent on, comma-separated — `level`, `skill`,
 *   `passive`, `character`, `weapon`, or a full `character.skill`. Blank = any part.
 *
 * Shared:
 * - `box` / `item` are Materials labels; `box_id` / `item_id` are optional fallbacks.
 *   The box itself must be a Materials row too — that is how it gets an inventory slot.
 * - `item` may also name a group: `@forgery` = every material whose Category or SubCategory
 *   is `forgery`, `@forgery:T2` = only its tier 2 ones. One row then stands for each of them.
 *   A material already listed for the same box keeps its first row.
 *
 * Output, keyed by the box's game_id:
 *   { "<id>": { game_id, type: 'fixed', contents: [{ game_id, qty }] } }
 *   { "<id>": { game_id, type: 'select', picks, contents: [{ game_id, qty }] } }
 *   { "<id>": { game_id, type: 'substitute', contents: [{ game_id, cost, scope? }] } }
 *
 * Nothing is guessed: a row whose box or item does not resolve, or whose number is not
 * positive, is logged and left out, so the sheet can be fixed.
 */

const TYPES = new Set(['fixed', 'select', 'substitute']);
const GROUP = /^@\s*([^:]+?)\s*(?::\s*T?(\d+))?\s*$/i;

const blank = (v) => v == null || String(v).trim() === '';

/** `skill, weapon` → `['skill', 'weapon']`; blank → null (any part). */
const parseScope = (value) => {
  if (blank(value)) return null;
  const tokens = String(value).split(/[,\s/]+/).map((t) => t.trim().toLowerCase()).filter(Boolean);
  return tokens.length ? tokens : null;
};

/**
 * @param {Array<Object>} rows Boxes tab rows
 * @param {(row: Object, nameColumn: string, idColumn: string, who: string, field: string) => (number|string|null)} resolveId
 *        Material reference resolver (sync-sheets' `pickMaterialId` bound to the Materials index)
 * @param {(message: string) => void} [log]
 * @param {(group: string, tier: number|null) => Array<number|string>} [expandGroup]
 *        `@group` → material ids (see `materialGroupExpander`)
 */
export function transformBoxes(rows, resolveId, log = console.log, expandGroup = () => []) {
  const result = {};

  rows.forEach((row, index) => {
    const line = `Boxes row ${index + 2}`;
    const boxName = row.box ?? row.box_id;
    if (boxName == null && row.item == null && row.item_id == null) return; // blank row

    const boxId = resolveId(row, 'box', 'box_id', line, 'box');
    if (boxId == null) {
      log(`    ${line}: box "${boxName ?? ''}" does not resolve to a material — row skipped`);
      return;
    }

    const rawType = String(row.type ?? '').trim().toLowerCase() || 'fixed';
    if (!TYPES.has(rawType)) {
      log(`    ${line}: type "${row.type}" is not fixed/select/substitute — row skipped`);
      return;
    }

    // The number a row carries: qty for boxes, cost for substitutes.
    const numberColumn = rawType === 'substitute' ? 'cost' : 'qty';
    const amount = Number(row[numberColumn]);
    if (!Number.isFinite(amount) || amount <= 0) {
      log(`    ${line}: ${numberColumn} "${row[numberColumn] ?? ''}" is not a positive number — row skipped`);
      return;
    }

    let picks = null;
    if (rawType === 'select' && !blank(row.picks)) {
      picks = Number(row.picks);
      if (!Number.isInteger(picks) || picks <= 0) {
        log(`    ${line}: picks "${row.picks}" is not a positive whole number — row skipped`);
        return;
      }
    }

    const group = typeof row.item === 'string' ? row.item.match(GROUP) : null;
    let itemIds;
    if (group) {
      itemIds = expandGroup(group[1], group[2] != null ? Number(group[2]) : null);
      if (!itemIds.length) {
        log(`    ${line}: item "${row.item}" matches no material — row skipped`);
        return;
      }
    } else {
      const itemId = resolveId(row, 'item', 'item_id', line, 'item');
      if (itemId == null) {
        log(`    ${line}: item "${row.item ?? row.item_id ?? ''}" does not resolve to a material — row skipped`);
        return;
      }
      itemIds = [itemId];
    }

    const key = String(boxId);
    if (!result[key]) {
      result[key] = { game_id: boxId, type: rawType, contents: [] };
      if (rawType === 'select') result[key].picks = 1;
    } else if (result[key].type !== rawType) {
      log(`    ${line}: box "${boxName}" is already "${result[key].type}", this row says "${rawType}" — row skipped`);
      return;
    }

    if (picks != null) {
      if (result[key].pickSet && result[key].picks !== picks) {
        log(`    ${line}: box "${boxName}" already has picks ${result[key].picks}, this row says ${picks} — kept the first`);
      } else {
        result[key].picks = picks;
        result[key].pickSet = true;
      }
    }

    const scope = rawType === 'substitute' ? parseScope(row.scope) : null;
    for (const itemId of itemIds) {
      if (String(itemId) === key) {
        if (!group) log(`    ${line}: box "${boxName}" contains itself — row skipped`);
        continue;
      }
      if (result[key].contents.some((entry) => String(entry.game_id) === String(itemId))) {
        log(`    ${line}: box "${boxName}" already lists ${itemId} — kept the first row`);
        continue;
      }
      if (rawType === 'substitute') {
        result[key].contents.push(scope ? { game_id: itemId, cost: amount, scope } : { game_id: itemId, cost: amount });
      } else {
        result[key].contents.push({ game_id: itemId, qty: amount });
      }
    }
  });

  // A box whose every row was skipped has nothing in it.
  for (const [key, box] of Object.entries(result)) {
    delete box.pickSet;
    if (box.contents.length === 0) delete result[key];
  }

  return result;
}

/**
 * `@group[:Tn]` resolver for transformBoxes, over transformMaterials() output: every
 * material whose Category or SubCategory equals the group (case-insensitive), optionally
 * only those of tier n.
 *
 * @param {Object} materials `{ category: { key: { game_id, Category, SubCategory, tier } } }`
 */
export function materialGroupExpander(materials) {
  const items = Object.values(materials || {}).flatMap((category) => Object.values(category || {}));
  return (group, tier) => {
    const name = String(group).trim().toLowerCase();
    return items
      .filter((item) => [item.Category, item.SubCategory].some((v) => String(v ?? '').toLowerCase() === name))
      .filter((item) => tier == null || item.tier === tier)
      .map((item) => item.game_id);
  };
}

export default transformBoxes;
