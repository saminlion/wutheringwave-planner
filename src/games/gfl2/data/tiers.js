/**
 * GFL2 Tiered Materials for Synthesis
 *
 * stock_boost_bar: T1-T7, synthesizable T1→T4 only (3:1)
 * transcription_conductor: T1-T6, synthesizable T1→T6 (3:1)
 * game_id values mirror materials.json (source of truth from Google Sheets).
 */
export const tieredMaterials = {
  stock_boost_bar: {
    1: {
      name: 'boost_stock_bar_t1',
      game_id: '6120010005',
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'boost_stock_bar_t2',
      game_id: '6120010006',
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'boost_stock_bar_t3',
      game_id: '6120010007',
      synthesizable: { to: 4, count: 3 },
    },
    4: {
      name: 'boost_stock_bar_t4',
      game_id: '6120010008',
    },
    5: {
      name: 'boost_stock_bar_t5',
      game_id: '6120010009',
    },
    6: {
      name: 'boost_stock_bar_t6',
      game_id: '6120010010',
    },
    7: {
      name: 'boost_stock_bar_t7',
      game_id: '6120010011',
    },
  },

  transcription_conductor: {
    1: {
      name: 'transcription_conductor_i',
      game_id: '6120020012',
      synthesizable: { to: 2, count: 3 },
    },
    2: {
      name: 'transcription_conductor_ii',
      game_id: '6120020013',
      synthesizable: { to: 3, count: 3 },
    },
    3: {
      name: 'transcription_conductor_iii',
      game_id: '6120020014',
      synthesizable: { to: 4, count: 3 },
    },
    4: {
      name: 'transcription_conductor_iv',
      game_id: '6120020015',
      synthesizable: { to: 5, count: 3 },
    },
    5: {
      name: 'transcription_conductor_v',
      game_id: '6120020016',
      synthesizable: { to: 6, count: 3 },
    },
    6: {
      name: 'transcription_conductor_vi',
      game_id: '6120020017',
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
