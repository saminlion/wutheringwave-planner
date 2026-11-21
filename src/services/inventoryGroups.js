/**
 * Groups inventory materials by the game version they arrived in (Materials sheet
 * `Version` column → materials.json `version`), so the inventory page can fold each
 * version on its own.
 *
 * Shared materials — a blank Version cell, or one marked 통합 / all — belong to every
 * version (credits, EXP, …), so they are repeated inside each version group rather than
 * parked in a group of their own. Each copy edits the same stock.
 *
 * Versions are ordered newest first, compared numerically per dot segment so "2.10"
 * sorts after "2.9". Within a group materials keep their materials.json order.
 * When no material has a version, there is one group holding everything (`version: ''`),
 * which the page renders as the plain, header-less layout.
 */

/** Version of the single group returned when the data has no versions at all. */
export const NO_VERSION = '';

/** Version cells that mean "every version" (compared lowercased). */
const SHARED_VERSIONS = new Set(['', '통합', '공통', 'all', 'common']);

export const isSharedVersion = (version) =>
  SHARED_VERSIONS.has(String(version ?? '').trim().toLowerCase());

const compareVersionsDesc = (a, b) =>
  b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });

const nest = (materials) =>
  materials.reduce((categories, material) => {
    const category = (categories[material.Category] ??= {});
    (category[material.SubCategory] ??= []).push(material);
    return categories;
  }, {});

/**
 * @param {Array<{Category: string, SubCategory?: string, version?: string}>} materials
 * @returns {Array<{version: string, count: number, categories: Object<string, Object<string, Array>>}>}
 */
export function groupMaterialsByVersion(materials) {
  const versions = [
    ...new Set(
      materials
        .filter((m) => !isSharedVersion(m.version))
        .map((m) => String(m.version).trim()),
    ),
  ].sort(compareVersionsDesc);

  if (!versions.length) {
    return [{ version: NO_VERSION, count: materials.length, categories: nest(materials) }];
  }

  return versions.map((version) => {
    const members = materials.filter(
      (m) => isSharedVersion(m.version) || String(m.version).trim() === version,
    );
    return { version, count: members.length, categories: nest(members) };
  });
}

/** Whether a group starts open when the user has never toggled it: only the newest version. */
export function isOpenByDefault(groups, version) {
  return groups[0]?.version === version;
}
