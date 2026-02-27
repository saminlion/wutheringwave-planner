/**
 * GFL2 Tiered Materials for Synthesis
 *
 * stock_boost_bar: T1-T7, synthesizable T1→T4 only (3:1)
 * transcription_conductor: T1-T6, all synthesizable (3:1)
 */
export const tieredMaterials = {
  stock_boost_bar: {
    1: {
      name: 'stock_boost_bar_t1',
      game_id: '6120010001',
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'stock_boost_bar_t2',
      game_id: '6120010002',
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'stock_boost_bar_t3',
      game_id: '6120010003',
      synthesizable: { to: 4, count: 3 },
    },
    4: {
      name: 'stock_boost_bar_t4',
      game_id: '6120010004',
    },
    5: {
      name: 'stock_boost_bar_t5',
      game_id: '6120010005',
    },
    6: {
      name: 'stock_boost_bar_t6',
      game_id: '6120010006',
    },
    7: {
      name: 'stock_boost_bar_t7',
      game_id: '6120010007',
    },
  },

  transcription_conductor: {
    1: {
      name: 'inert_metallic_drip',
      game_id: '6120020001',
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'reactive_metallic_drip',
      game_id: '6120020002',
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'polarized_metallic_drip',
      game_id: '6120020003',
      synthesizable: { to: 4, count: 3 },
    },
    4: {
      name: 'heterized_metallic_drip',
      game_id: '6120020004',
      synthesizable: { to: 5, count: 3 },
    },
    5: {
      name: 'metallic_drip_t5',
      game_id: '6120020005',
      synthesizable: { to: 6, count: 3 },
    },
    6: {
      name: 'metallic_drip_t6',
      game_id: '6120020006',
    },
  },
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
