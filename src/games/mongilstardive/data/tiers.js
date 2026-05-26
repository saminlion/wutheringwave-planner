// ========== FORGERY — SKILL (T1~T5) ==========
// 캐릭터 스킬 레벨업 재료. SubCategory별 5티어.

export const tieredMaterials = {
  sinew: {
    1: { name: 'sinew_t1', game_id: 8130010001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'sinew_t2', game_id: 8130010002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'sinew_t3', game_id: 8130010003, synthesizable: { to: 4, count: 3 } },
    4: { name: 'sinew_t4', game_id: 8130010004, synthesizable: { to: 5, count: 3 } },
    5: { name: 'sinew_t5', game_id: 8130010005 },
  },
  cartilage: {
    1: { name: 'cartilage_t1', game_id: 8130020001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'cartilage_t2', game_id: 8130020002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'cartilage_t3', game_id: 8130020003, synthesizable: { to: 4, count: 3 } },
    4: { name: 'cartilage_t4', game_id: 8130020004, synthesizable: { to: 5, count: 3 } },
    5: { name: 'cartilage_t5', game_id: 8130020005 },
  },
  fur: {
    1: { name: 'fur_t1', game_id: 8130030001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'fur_t2', game_id: 8130030002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'fur_t3', game_id: 8130030003, synthesizable: { to: 4, count: 3 } },
    4: { name: 'fur_t4', game_id: 8130030004, synthesizable: { to: 5, count: 3 } },
    5: { name: 'fur_t5', game_id: 8130030005 },
  },
  powder: {
    1: { name: 'powder_t1', game_id: 8130040001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'powder_t2', game_id: 8130040002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'powder_t3', game_id: 8130040003, synthesizable: { to: 4, count: 3 } },
    4: { name: 'powder_t4', game_id: 8130040004, synthesizable: { to: 5, count: 3 } },
    5: { name: 'powder_t5', game_id: 8130040005 },
  },
  carapace: {
    1: { name: 'carapace_t1', game_id: 8130050001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'carapace_t2', game_id: 8130050002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'carapace_t3', game_id: 8130050003, synthesizable: { to: 4, count: 3 } },
    4: { name: 'carapace_t4', game_id: 8130050004, synthesizable: { to: 5, count: 3 } },
    5: { name: 'carapace_t5', game_id: 8130050005 },
  },

  // ========== FORGERY — ASCENSION (T2~T5) ==========
  // 캐릭터 레벨 돌파 재료. T1 없음 (게임 내 T2부터 시작).
  fighter: {
    2: { name: 'fighter_t2', game_id: 8120060001, synthesizable: { to: 3, count: 3 } },
    3: { name: 'fighter_t3', game_id: 8120060002, synthesizable: { to: 4, count: 3 } },
    4: { name: 'fighter_t4', game_id: 8120060003, synthesizable: { to: 5, count: 3 } },
    5: { name: 'fighter_t5', game_id: 8120060004 },
  },
  destroyer: {
    2: { name: 'destroyer_t2', game_id: 8120070001, synthesizable: { to: 3, count: 3 } },
    3: { name: 'destroyer_t3', game_id: 8120070002, synthesizable: { to: 4, count: 3 } },
    4: { name: 'destroyer_t4', game_id: 8120070003, synthesizable: { to: 5, count: 3 } },
    5: { name: 'destroyer_t5', game_id: 8120070004 },
  },
  support: {
    2: { name: 'support_t2', game_id: 8120080001, synthesizable: { to: 3, count: 3 } },
    3: { name: 'support_t3', game_id: 8120080002, synthesizable: { to: 4, count: 3 } },
    4: { name: 'support_t4', game_id: 8120080003, synthesizable: { to: 5, count: 3 } },
    5: { name: 'support_t5', game_id: 8120080004 },
  },
  assassin: {
    2: { name: 'assassin_t2', game_id: 8120090001, synthesizable: { to: 3, count: 3 } },
    3: { name: 'assassin_t3', game_id: 8120090002, synthesizable: { to: 4, count: 3 } },
    4: { name: 'assassin_t4', game_id: 8120090003, synthesizable: { to: 5, count: 3 } },
    5: { name: 'assassin_t5', game_id: 8120090004 },
  },
  chain: {
    2: { name: 'chain_t2', game_id: 8120100001, synthesizable: { to: 3, count: 3 } },
    3: { name: 'chain_t3', game_id: 8120100002, synthesizable: { to: 4, count: 3 } },
    4: { name: 'chain_t4', game_id: 8120100003, synthesizable: { to: 5, count: 3 } },
    5: { name: 'chain_t5', game_id: 8120100004 },
  },
};

export const tieredMaterialsByGameId = Object.entries(tieredMaterials).reduce(
  (acc, [categoryName, tiers]) => {
    for (const [, tierInfo] of Object.entries(tiers)) {
      if (tierInfo?.game_id) {
        acc[tierInfo.game_id] = { category: categoryName, ...tierInfo };
      }
    }
    return acc;
  },
  {},
);
