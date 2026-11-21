/**
 * Groups inventory materials by the game version they arrived in (Materials sheet
 * `Version` column → materials.json `version`), so the inventory page can fold each
 * version on its own.
 *
 * Returned order: materials without a version first (the base set — currency, EXP,
 * launch materials are usually left blank), then versions newest first, compared
 * numerically per dot segment so "2.10" sorts after "2.9".
 */

/** Group key for materials whose `version` cell is blank. */
export const NO_VERSION = '';

const compareVersionsDesc = (a, b) =>
  b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });

/**
 * @param {Array<{Category: string, SubCategory?: string, version?: string}>} materials
 * @returns {Array<{version: string, count: number, categories: Object<string, Object<string, Array>>}>}
 */
export function groupMaterialsByVersion(materials) {
  const byVersion = new Map();

  for (const material of materials) {
    const version = material.version ? String(material.version).trim() : NO_VERSION;
    if (!byVersion.has(version)) byVersion.set(version, { version, count: 0, categories: {} });

    const group = byVersion.get(version);
    const category = (group.categories[material.Category] ??= {});
    (category[material.SubCategory] ??= []).push(material);
    group.count += 1;
  }

  return [...byVersion.values()].sort((a, b) => {
    if (a.version === NO_VERSION) return -1;
    if (b.version === NO_VERSION) return 1;
    return compareVersionsDesc(a.version, b.version);
  });
}

/**
 * Whether a group starts open when the user has never toggled it: the base set and
 * the newest version are open, older versions start folded.
 */
export function isOpenByDefault(groups, version) {
  if (version === NO_VERSION) return true;
  const newest = groups.find((g) => g.version !== NO_VERSION);
  return newest?.version === version;
}
