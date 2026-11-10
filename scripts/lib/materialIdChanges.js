/**
 * Compare the materials.json already in the repo with the one a sync is about to write.
 *
 * A material's game_id is what inventories, planner goals and tiers.js are keyed by. The sheet
 * computes it from Category / SubCatCode / Seq, so editing any of those cells on an existing row
 * quietly renumbers the material: every user's stock of it becomes orphaned under the old id,
 * and any code still holding the old id points at nothing (Endfield's Mark of Perseverance,
 * 5140010039 → 5140010040, 2026-10-15).
 *
 * The sheet stays the source of truth — this only reports, it never blocks or rewrites.
 *
 * @returns {{ renumbered: string[], removed: string[] }} human-readable lines
 */
export function diffMaterialIds(previous, next) {
  const index = (materials) => {
    const byId = new Map();
    const byLabel = new Map();
    for (const category of Object.values(materials ?? {})) {
      for (const item of Object.values(category ?? {})) {
        if (item?.game_id == null) continue;
        const id = String(item.game_id);
        byId.set(id, item);
        if (item.label) byLabel.set(item.label, id);
      }
    }
    return { byId, byLabel };
  };

  const before = index(previous);
  const after = index(next);
  const renumbered = [];
  const removed = [];

  for (const [id, item] of before.byId) {
    if (after.byId.has(id)) continue;
    const newId = item.label ? after.byLabel.get(item.label) : undefined;
    if (newId) renumbered.push(`"${item.label}": ${id} → ${newId}`);
    else removed.push(`"${item.label ?? '?'}": ${id}`);
  }
  return { renumbered, removed };
}

/** Log the diff; `::warning::` lines show up as annotations on the GitHub Actions run. */
export function reportMaterialIdChanges(gameId, previous, next, log = console.log) {
  const { renumbered, removed } = diffMaterialIds(previous, next);
  const prefix = process.env.GITHUB_ACTIONS ? '::warning::' : '    ⚠ ';
  for (const line of renumbered) {
    log(`${prefix}${gameId} material id changed ${line} — users' inventory and goals under the old id are orphaned; restore the old Seq/SubCatCode in the sheet unless this was intended`);
  }
  for (const line of removed) {
    log(`${prefix}${gameId} material removed ${line} — inventory and goals that used it now point at nothing`);
  }
  return renumbered.length + removed.length;
}
