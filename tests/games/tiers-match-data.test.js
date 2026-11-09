import { describe, it, expect } from 'vitest';
import wutheringwave from '@/games/wutheringwave';
import gfl2 from '@/games/gfl2';
import nte from '@/games/nte';
import mongilstardive from '@/games/mongilstardive';
import dna from '@/games/dna';

// tiers.js is the one place game_ids are typed into code instead of coming from the sheet.
// If the sheet renumbers a material, the synthesis table silently points at nothing — this
// catches that on the next test run instead of in the planner.
// (Endfield is left out: its tiers are an unused placeholder; it has no 3:1 synthesis.)
const GAMES = [wutheringwave, gfl2, nte, mongilstardive, dna];

describe.each(GAMES.map((g) => [g.id, g]))('%s tiers.js matches materials.json', (_, game) => {
  const byId = new Map();
  for (const category of Object.values(game.getData('materials'))) {
    for (const item of Object.values(category)) byId.set(String(item.game_id), item);
  }
  const tiers = game.config?.materials?.tiers || game.getData('tiers') || {};

  it('every tier entry is a material in the data, under the same SubCategory and tier', () => {
    const wrong = [];
    for (const [subCategory, tierMap] of Object.entries(tiers)) {
      for (const [tier, entry] of Object.entries(tierMap)) {
        const material = byId.get(String(entry.game_id));
        if (!material) wrong.push(`${subCategory} T${tier}: ${entry.game_id} not in materials.json`);
        else if (material.SubCategory !== subCategory || Number(material.tier) !== Number(tier)) {
          wrong.push(`${subCategory} T${tier}: ${entry.game_id} is ${material.SubCategory} T${material.tier} in the data`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it('no material of a synthesized SubCategory is missing from the table', () => {
    const listed = new Set(Object.values(tiers).flatMap((t) => Object.values(t).map((e) => String(e.game_id))));
    const unlisted = [...byId.values()]
      .filter((m) => m.SubCategory in tiers && !listed.has(String(m.game_id)))
      .map((m) => `${m.SubCategory} T${m.tier}: ${m.game_id} ${m.label}`);
    expect(unlisted).toEqual([]);
  });
});
