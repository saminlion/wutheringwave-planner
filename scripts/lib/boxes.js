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
 * - `box` / `item` are Materials labels; `box_id` / `item_id` are optional fallbacks.
 *   The box itself must be a Materials row too — that is how it gets an inventory slot.
 *
 * Output, keyed by the box's game_id:
 *   { "4190010001": { game_id, type: 'fixed'|'select', contents: [{ game_id, qty }] } }
 *
 * Nothing is guessed: a row whose box or item does not resolve, or whose qty is not a
 * positive number, is logged and left out, so the sheet can be fixed.
 */

const TYPES = new Set(['fixed', 'select']);

/**
 * @param {Array<Object>} rows Boxes tab rows
 * @param {(row: Object, nameColumn: string, idColumn: string, who: string, field: string) => (number|string|null)} resolveId
 *        Material reference resolver (sync-sheets' `pickMaterialId` bound to the Materials index)
 * @param {(message: string) => void} [log]
 */
export function transformBoxes(rows, resolveId, log = console.log) {
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

    const itemId = resolveId(row, 'item', 'item_id', line, 'item');
    if (itemId == null) {
      log(`    ${line}: item "${row.item ?? row.item_id ?? ''}" does not resolve to a material — row skipped`);
      return;
    }

    const qty = Number(row.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      log(`    ${line}: qty "${row.qty ?? ''}" is not a positive number — row skipped`);
      return;
    }

    const rawType = String(row.type ?? '').trim().toLowerCase() || 'fixed';
    if (!TYPES.has(rawType)) {
      log(`    ${line}: type "${row.type}" is not fixed/select — row skipped`);
      return;
    }

    const key = String(boxId);
    if (!result[key]) {
      result[key] = { game_id: boxId, type: rawType, contents: [] };
    } else if (result[key].type !== rawType) {
      log(`    ${line}: box "${boxName}" is already "${result[key].type}", this row says "${rawType}" — row skipped`);
      return;
    }

    if (String(itemId) === key) {
      log(`    ${line}: box "${boxName}" contains itself — row skipped`);
      return;
    }

    result[key].contents.push({ game_id: itemId, qty });
  });

  return result;
}

export default transformBoxes;
