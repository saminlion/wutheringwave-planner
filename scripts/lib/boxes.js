/**
 * Boxes tab → boxes.json
 *
 * A box is an inventory item that turns into other materials when opened. One sheet
 * row is one thing that can come out of a box:
 *
 *   box            | type   | item                 | qty
 *   Advanced Chest | fixed  | Material A (T1)      | 5
 *   Advanced Chest | fixed  | Material B (T1)      | 5
 *   Boss Selector  | select | Boss Material X      | 1
 *   Boss Selector  | select | Boss Material Y      | 1
 *
 * - `fixed`  (or blank): opening one box gives every row's item × qty.
 * - `select`: opening one box gives ONE row's item × qty, chosen by the player.
 * - `substitute`: never opened — the game spends it on an upgrade in place of a row's item
 *   the player is short of; one substitute = qty of that item.
 * - `box` / `item` are Materials labels; `box_id` / `item_id` are optional fallbacks.
 *   The box itself must be a Materials row too — that is how it gets an inventory slot.
 * - `item` may also name a group: `@forgery` = every material whose Category or SubCategory
 *   is `forgery`, `@forgery:T2` = only its tier 2 ones. One row then stands for each of them.
 *
 * Output, keyed by the box's game_id:
 *   { "4190010001": { game_id, type: 'fixed'|'select', contents: [{ game_id, qty }] } }
 *
 * Nothing is guessed: a row whose box or item does not resolve, or whose qty is not a
 * positive number, is logged and left out, so the sheet can be fixed.
 */

const TYPES = new Set(['fixed', 'select', 'substitute']);
const GROUP = /^@\s*([^:]+?)\s*(?::\s*T?(\d+))?\s*$/i;

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

    const qty = Number(row.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      log(`    ${line}: qty "${row.qty ?? ''}" is not a positive number — row skipped`);
      return;
    }

    const rawType = String(row.type ?? '').trim().toLowerCase() || 'fixed';
    if (!TYPES.has(rawType)) {
      log(`    ${line}: type "${row.type}" is not fixed/select/substitute — row skipped`);
      return;
    }

    const key = String(boxId);
    if (!result[key]) {
      result[key] = { game_id: boxId, type: rawType, contents: [] };
    } else if (result[key].type !== rawType) {
      log(`    ${line}: box "${boxName}" is already "${result[key].type}", this row says "${rawType}" — row skipped`);
      return;
    }

    for (const itemId of itemIds) {
      if (String(itemId) === key) {
        if (!group) log(`    ${line}: box "${boxName}" contains itself — row skipped`);
        continue;
      }
      if (result[key].contents.some((entry) => String(entry.game_id) === String(itemId))) {
        log(`    ${line}: box "${boxName}" already lists ${itemId} — kept the first row`);
        continue;
      }
      result[key].contents.push({ game_id: itemId, qty });
    }
  });

  // A box whose every row was skipped has nothing in it.
  for (const [key, box] of Object.entries(result)) {
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
