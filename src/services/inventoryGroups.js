/**
 * Lays out the inventory page: Category → (version fold) → SubCategory → materials.
 *
 * The Materials sheet's `Version` column (→ materials.json `version`) only matters inside the
 * categories that use it. A category with no versioned material renders exactly as before; one
 * that has versions gets a fold per version, newest first. Versionless rows of such a category
 * (blank, or 통합 / 공통 / all / common) sit above its folds, once. Every material appears exactly
 * once on the page — a category without versions (credit, boss, ascension…) is never repeated.
 *
 * Versions compare numerically per dot segment, so "2.10" sorts after "2.9". Categories,
 * subcategories and materials keep their materials.json order.
 */

/** Version cells that mean "not tied to a version" (compared lowercased). */
const UNVERSIONED = new Set(['', '통합', '공통', 'all', 'common']);

export const isUnversioned = (version) =>
  UNVERSIONED.has(String(version ?? '').trim().toLowerCase());

const compareVersionsDesc = (a, b) =>
  b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });

const pushTo = (subCategories, material) => {
  (subCategories[material.SubCategory] ??= []).push(material);
};

/**
 * @param {Array<{Category: string, SubCategory?: string, version?: string}>} materials
 * @returns {Array<{
 *   category: string,
 *   base: Object<string, Array>,                       // versionless rows, by SubCategory
 *   versions: Array<{version: string, count: number, subCategories: Object<string, Array>}>,
 * }>} `versions` is empty for a category that has no versioned material
 */
export function groupInventory(materials) {
  const byCategory = new Map();

  for (const material of materials) {
    if (!byCategory.has(material.Category)) {
      byCategory.set(material.Category, { category: material.Category, base: {}, byVersion: new Map() });
    }
    const group = byCategory.get(material.Category);

    if (isUnversioned(material.version)) {
      pushTo(group.base, material);
      continue;
    }
    const version = String(material.version).trim();
    if (!group.byVersion.has(version)) group.byVersion.set(version, { version, count: 0, subCategories: {} });
    const fold = group.byVersion.get(version);
    pushTo(fold.subCategories, material);
    fold.count += 1;
  }

  return [...byCategory.values()].map(({ category, base, byVersion }) => ({
    category,
    base,
    versions: [...byVersion.values()].sort((a, b) => compareVersionsDesc(a.version, b.version)),
  }));
}

/** Fold-state key: versions are per category, so "1" in common and "1" in forgery are separate. */
export const foldKey = (category, version) => `${category}::${version}`;

/** A fold the user never toggled starts open only if it is its category's newest version. */
export const isOpenByDefault = (categoryGroup, version) => categoryGroup.versions[0]?.version === version;
