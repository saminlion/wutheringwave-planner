// ========== COMMON MATERIALS ==========
// 4 SubCategories × 3 tiers, synthesizable 3:1

export const tieredMaterials = {
  whispers: {
    1: { name: 'lost_whispers', game_id: 7110010001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'obscure_whispers', game_id: 7110010002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'paradoxical_whispers', game_id: 7110010003 },
  },
  silhouette: {
    1: { name: 'fading_silhouette', game_id: 7110020001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'blurred_silhouette', game_id: 7110020002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'chaos_silhouette', game_id: 7110020003 },
  },
  numeral: {
    1: { name: 'blurred_numeral', game_id: 7110030001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'unsolved_numeral', game_id: 7110030002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'distorted_numeral', game_id: 7110030003 },
  },
  delusions: {
    1: { name: 'suspended_delusions', game_id: 7110040001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'yearning_delusions', game_id: 7110040002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'transcendent_delusion', game_id: 7110040003 },
  },

  // ========== FORGERY MATERIALS ==========
  // Character skill materials (bird/flower/magic/heart/hang)
  // Weapon ascension materials (appleseed/can/dream/dessert/core)

  bird: {
    1: { name: "nestling's_longing", game_id: 7120010001, synthesizable: { to: 2, count: 3 } },
    2: { name: "dove's_flutter", game_id: 7120010002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'the_olive_branch', game_id: 7120010003 },
  },
  flower: {
    1: { name: 'fng', game_id: 7120020001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'co', game_id: 7120020002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'white_rose', game_id: 7120020003 },
  },
  magic: {
    1: { name: 'first_expectations', game_id: 7120030001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'known_weariness', game_id: 7120030002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'black_hat', game_id: 7120030003 },
  },
  heart: {
    1: { name: 'synchronicity_of_thought', game_id: 7120040001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'resonance_of_faith', game_id: 7120040002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'heart-racing_night', game_id: 7120040003 },
  },
  hang: {
    1: { name: 'hesitation_of_the_waves', game_id: 7120050001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'suspend_whispers', game_id: 7120050002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'the_second_self', game_id: 7120050003 },
  },
  appleseed: {
    1: { name: 'iron_appleseed', game_id: 7120060001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'silver_appleseed', game_id: 7120060002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'golden_appleseed', game_id: 7120060003 },
  },
  can: {
    1: { name: 'beaty', game_id: 7120070001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'versey', game_id: 7120070002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'harmony', game_id: 7120070003 },
  },
  dream: {
    1: { name: 'liquid_dream_trial_kit', game_id: 7120080001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'liquid_dream_travel_kit', game_id: 7120080002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'liquid_dream_can', game_id: 7120080003 },
  },
  dessert: {
    1: { name: 'flavorless_cold_dessert', game_id: 7120090001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'plain_cold_dessert', game_id: 7120090002, synthesizable: { to: 3, count: 3 } },
    3: { name: 'special_cold_dessert', game_id: 7120090003 },
  },
  core: {
    1: { name: 'beginner_drama_core', game_id: 7120100001, synthesizable: { to: 2, count: 3 } },
    2: { name: 'master_drama_core', game_id: 7120100002, synthesizable: { to: 3, count: 3 } },
    3: { name: "collector's_drama_core", game_id: 7120100003 },
  },
};

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
