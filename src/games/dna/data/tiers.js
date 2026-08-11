/**
 * Duet Night Abyss Tiered Materials for Synthesis
 *
 * DNA synthesis differs from the other games in two ways:
 *   1. The ratio is NOT a uniform 3:1 — it varies per category. The engine reads
 *      `synthesizable.count` per entry and only falls back to 3 when absent.
 *   2. Some recipes also consume a material from a DIFFERENT subcategory, listed
 *      as `synthesizable.extra = { game_id: qtyPerOneCraft }`. Such a craft is
 *      treated as IRREVERSIBLE — backward conversion will not decompose surplus
 *      of that tier, because the extra ingredient cannot be recovered.
 *
 * Keys MUST equal the `SubCategory` string in materials.json; that is how the
 * engine matches a shortage to its recipe.
 *
 * Confirmed ratios (2026-08-11):
 *   ascension         5:1
 *   weapon_component  3:1
 *   talent            3:1
 *
 * NOT declared here, and therefore not synthesized — see the notes at the bottom:
 *   forgery           5:1 + 1 unrecorded extra material
 *   common            ratio unknown
 */
export const tieredMaterials = {
  // ========== ASCENSION — 5:1 ==========
  pearl: {
    1: {
      name: 'azure_pearl',
      game_id: 9130010001,
      synthesizable: { to: 2, count: 5 },
    },
    2: {
      name: 'humectant',
      game_id: 9130010002,
      synthesizable: { to: 3, count: 5 },
    },
    3: {
      name: 'water_purifier',
      game_id: 9130010003,
    },
  },

  flame: {
    1: {
      name: 'flame_lizard_scale',
      game_id: 9130020001,
      synthesizable: { to: 2, count: 5 },
    },
    2: {
      name: 'everbright_flame',
      game_id: 9130020002,
      synthesizable: { to: 3, count: 5 },
    },
    3: {
      name: 'fire_tempered_shackles',
      game_id: 9130020003,
    },
  },

  bough: {
    1: {
      name: 'withered_bough',
      game_id: 9130030001,
      synthesizable: { to: 2, count: 5 },
    },
    2: {
      name: 'galeweaver',
      game_id: 9130030002,
      synthesizable: { to: 3, count: 5 },
    },
    3: {
      name: 'oceanifly',
      game_id: 9130030003,
    },
  },

  rod: {
    1: {
      name: 'lightning_rod',
      game_id: 9130040001,
      synthesizable: { to: 2, count: 5 },
    },
    2: {
      name: 'stormfall_jade',
      game_id: 9130040002,
      synthesizable: { to: 3, count: 5 },
    },
    3: {
      name: 'golden_wool',
      game_id: 9130040003,
    },
  },

  lense: {
    1: {
      name: 'lense_of_enlightenment',
      game_id: 9130050001,
      synthesizable: { to: 2, count: 5 },
    },
    2: {
      name: 'golden_floriated_diadem',
      game_id: 9130050002,
      synthesizable: { to: 3, count: 5 },
    },
    3: {
      name: 'copy_of_elysian_hymnal',
      game_id: 9130050003,
    },
  },

  dagger: {
    1: {
      name: 'rust_etched_dagger',
      game_id: 9130060001,
      synthesizable: { to: 2, count: 5 },
    },
    2: {
      name: 'obsidian_key',
      game_id: 9130060002,
      synthesizable: { to: 3, count: 5 },
    },
    3: {
      name: 'tome_of_the_noclunism_ritual',
      game_id: 9130060003,
    },
  },

  // ========== WEAPON COMPONENT — 3:1 ==========
  blade: {
    1: {
      name: 'basic_weapon_component_blade',
      game_id: 9180010001,
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'intermediate_weapon_component_blade',
      game_id: 9180010002,
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'advanced_weapon_component_blade',
      game_id: 9180010003,
    },
  },

  decoration: {
    1: {
      name: 'basic_weapon_component_decoration',
      game_id: 9180020001,
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'intermediate_weapon_component_decoration',
      game_id: 9180020002,
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'advanced_weapon_component_decoration',
      game_id: 9180020003,
    },
  },

  grip: {
    1: {
      name: 'basic_weapon_component_grip',
      game_id: 9180030001,
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'intermediate_weapon_component_grip',
      game_id: 9180030002,
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'advanced_weapon_component_grip',
      game_id: 9180030003,
    },
  },

  bolt: {
    1: {
      name: 'basic_weapon_component_bolt',
      game_id: 9180040001,
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'intermediate_weapon_component_bolt',
      game_id: 9180040002,
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'advanced_weapon_component_bolt',
      game_id: 9180040003,
    },
  },

  frame: {
    1: {
      name: 'basic_weapon_component_frame',
      game_id: 9180050001,
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'intermediate_weapon_component_frame',
      game_id: 9180050002,
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'advanced_weapon_component_frame',
      game_id: 9180050003,
    },
  },

  barrel: {
    1: {
      name: 'basic_weapon_component_barrel',
      game_id: 9180060001,
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'intermediate_weapon_component_barrel',
      game_id: 9180060002,
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'advanced_weapon_component_barrel',
      game_id: 9180060003,
    },
  },

  // ========== TALENT — 3:1 ==========
  herbal: {
    1: {
      name: 'herbal_sprig',
      game_id: 9190010001,
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'processed_herb',
      game_id: 9190010002,
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'compound_potion',
      game_id: 9190010003,
    },
  },

  emblem: {
    1: {
      name: 'iron_emblem',
      game_id: 9190020001,
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'silver_emblem',
      game_id: 9190020002,
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'gilded_emblem',
      game_id: 9190020003,
    },
  },

  veil: {
    1: {
      name: 'veil_of_silence',
      game_id: 9190030001,
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'eye_of_infinity',
      game_id: 9190030002,
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'crown_of_enlightenment',
      game_id: 9190030003,
    },
  },

  gleaming: {
    1: {
      name: 'gleaming_arrow',
      game_id: 9190040001,
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'gleaming_precision_scope',
      game_id: 9190040002,
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'gleaming_quiver',
      game_id: 9190040003,
    },
  },

  // ========== NOT YET DECLARED ==========
  //
  // forgery (tentacle: 9120010001/2, sacred: 9120020001/2)
  //   T1 is farm-only; T2 is crafted from 5x T1 PLUS 1x of an extra material that
  //   does not exist in materials.json yet. Declaring the 5:1 chain without that
  //   ingredient would let the planner craft T2 for free and understate needs, so
  //   forgery stays out of the table until the material is added. Once it has a
  //   game_id, the T1 entries become:
  //     synthesizable: { to: 2, count: 5, extra: { <new_game_id>: 1 } }
  //   (Luno Memento 9120030001 is NOT that ingredient — it is a skill cost, kept
  //   in costs.json as `forgery_luno` 150 / 300.)
  //
  // common (stone, volatile, teardrop, chain, filthoid — all T1→T2)
  //   Ratio not recorded yet.
  //
  // While a subcategory is absent here, its tiers are tracked independently and
  // no synthesis runs for it. Tiered lineup dialogs still work — those key off
  // the `tier` field in materials.json, not this table.
};

// Reverse lookup: gameId -> tier info
export const tieredMaterialsByGameId = Object.entries(tieredMaterials).reduce(
  (acc, [categoryName, tiers]) => {
    for (const [, tierInfo] of Object.entries(tiers)) {
      if (tierInfo?.game_id) {
        acc[tierInfo.game_id] = {
          category: categoryName,
          ...tierInfo,
        };
      }
    }
    return acc;
  },
  {},
);
