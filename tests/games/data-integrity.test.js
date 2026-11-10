import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '@/store/game';
import { getEnabledGames, getGame } from '@/games';
import { processMaterials } from '@/services/materialHelper/core';

/**
 * Every registered game, current data, no mocks — a new game is covered the moment it is
 * added to src/games/index.js.
 *
 * Why this exists: a goal entry whose id is not in materials.json is invisible in Final
 * Material Needs (no category to draw it under) yet still counted as missing by Complete,
 * so the planner says "insufficient" with nothing to farm. That happened when a processor
 * hardcoded a game_id the sheet later renumbered. Any code path that produces an id the
 * data does not contain fails here.
 */

// Feed every cost row of costs.json through the real processor for one character/weapon.
function collectCostRows(node, rows = []) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return rows;
  const row = {};
  for (const [key, value] of Object.entries(node)) {
    const isQty = typeof value === 'number';
    const isTiered = Array.isArray(value) && value.every((v) => typeof v === 'number');
    if (isQty || isTiered) row[key] = value;
    else collectCostRows(value, rows);
  }
  if (Object.keys(row).length) rows.push(row);
  return rows;
}

function resolve(rows, info) {
  const out = {};
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) processMaterials(out, key, value, info);
  }
  delete out.processed;
  return out;
}

const games = getEnabledGames().map(({ id }) => [id, getGame(id)]);

describe.each(games)('%s data integrity', (gameId, game) => {
  const materials = game.getData('materials') || {};
  // EXP costs are totals keyed by their category name; everything else by game_id
  const known = new Set(Object.keys(materials));
  for (const category of Object.values(materials)) {
    for (const item of Object.values(category)) known.add(String(item.game_id));
  }
  const costs = game.getData('costs') || {};

  beforeEach(() => {
    setActivePinia(createPinia());
    useGameStore().switchGame(gameId);
  });

  it('material game_ids are unique', () => {
    const seen = new Map();
    const dupes = [];
    for (const [category, items] of Object.entries(materials)) {
      for (const [key, item] of Object.entries(items)) {
        const id = String(item.game_id);
        if (seen.has(id)) dupes.push(`${id}: ${seen.get(id)} and ${category}.${key}`);
        else seen.set(id, `${category}.${key}`);
      }
    }
    expect(dupes).toEqual([]);
  });

  // tiers.js is the one place game_ids are typed into code instead of coming from the sheet
  const tiers = game.config?.materials?.tiers || game.getData('tiers') || {};
  const byId = new Map();
  for (const category of Object.values(materials)) {
    for (const item of Object.values(category)) byId.set(String(item.game_id), item);
  }

  it('every tiers.js entry is in materials.json under the same SubCategory and tier', () => {
    const wrong = [];
    for (const [subCategory, tierMap] of Object.entries(tiers)) {
      for (const [tier, entry] of Object.entries(tierMap)) {
        const ids = [entry?.game_id, ...Object.keys(entry?.synthesizable?.extra ?? {})];
        ids.forEach((id, i) => {
          if (!byId.has(String(id))) wrong.push(`${subCategory} T${tier}: ${id} not in materials.json`);
          else if (i === 0) {
            const m = byId.get(String(id));
            if (m.SubCategory !== subCategory || Number(m.tier) !== Number(tier)) {
              wrong.push(`${subCategory} T${tier}: ${id} is ${m.SubCategory} T${m.tier} in the data`);
            }
          }
        });
      }
    }
    expect(wrong).toEqual([]);
  });

  it('no material of a synthesized SubCategory is missing from tiers.js', () => {
    const listed = new Set(Object.values(tiers).flatMap((t) => Object.values(t).map((e) => String(e?.game_id))));
    const unlisted = [...byId.values()]
      .filter((m) => Object.hasOwn(tiers, m.SubCategory) && !listed.has(String(m.game_id)))
      .map((m) => `${m.SubCategory} T${m.tier}: ${m.game_id} ${m.label}`);
    expect(unlisted).toEqual([]);
  });

  for (const [type, dataType] of [['character', 'characters'], ['weapon', 'weapons']]) {
    it(`every material a ${type} can need exists in materials.json`, () => {
      const rows = collectCostRows(costs[type]);
      const unknown = new Set();
      for (const info of Object.values(game.getData(dataType) || {})) {
        for (const id of Object.keys(resolve(rows, info))) {
          if (!known.has(id)) unknown.add(`${info.display_name ?? info.game_id}: ${id}`);
        }
      }
      expect([...unknown]).toEqual([]);
    });
  }
});
