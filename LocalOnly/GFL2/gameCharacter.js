export const charLevellingMaterialsCount = [
	{ level: '1', materials: {} },
	{ level: '20', materials: { char_exp: 5224 } },
	{
		level: '20A',
		materials: {
			tiered_enemy_drop_weapon_skill_material: {
				1: 4,
			},
			sardis_gold: 1000,
		},
	},
	{ level: '30', materials: { char_exp: 21084 } },
	{
		level: '30A',
		materials: {
			tiered_enemy_drop_weapon_skill_material: {
				1: 6,
				2: 8
			},
			sardis_gold: 2000,
		},
	},
	{ level: '40', materials: { char_exp: 82549 } },
	{
		level: '40A',
		materials: {
			tiered_enemy_drop_weapon_skill_material: {
				2: 16,
				3: 8
			},
			sardis_gold: 4000,
		},
	},
	{ level: '50', materials: { char_exp: 285599 } },
	{
		level: '50A',
		materials: {
			tiered_enemy_drop_weapon_skill_material: {
				3: 12,
				4: 5
			},
			sardis_gold: 12000,
		},
	},
	{ level: '60', materials: { char_exp: 575689 } }
];

export const passiveSkillLevellingMaterialsCount = {
	4: [
		{
			name: 'passive_skill_1',
			materials: {
				sardis_gold: 3000,
				weekly_boss_skill_upgrade_material: 1,
			},
		},
		{
			name: 'passive_skill_2',
			materials: {
				sardis_gold: 3000,
				weekly_boss_skill_upgrade_material: 1,
			},
		},
		{
			name: 'passive_skill_3',
			materials: {
				sardis_gold: 8000,
				weekly_boss_skill_upgrade_material: 1,
			},
		},
		{
			name: 'passive_skill_4',
			materials: {
				sardis_gold: 8000,
				weekly_boss_skill_upgrade_material: 1,
			},
		},
		{
			name: 'passive_skill_5',
			materials: {
				sardis_gold: 12000,
				weekly_boss_skill_upgrade_material: 2,
			},
		},
		{
			name: 'passive_skill_6',
			materials: {
				sardis_gold: 12000,
				weekly_boss_skill_upgrade_material: 2,
			},
		}
		
	],
	5: [
		{
			name: 'passive_skill_1',
			materials: {
				sardis_gold: 3000,
				weekly_boss_skill_upgrade_material: 3,
			},
		},
		{
			name: 'passive_skill_2',
			materials: {
				sardis_gold: 3000,
				weekly_boss_skill_upgrade_material: 3,
			},
		},
		{
			name: 'passive_skill_3',
			materials: {
				sardis_gold: 8000,
				weekly_boss_skill_upgrade_material: 3,
			},
		},
		{
			name: 'passive_skill_4',
			materials: {
				sardis_gold: 8000,
				weekly_boss_skill_upgrade_material: 3,
			},
		},
		{
			name: 'passive_skill_5',
			materials: {
				sardis_gold: 12000,
				weekly_boss_skill_upgrade_material: 3,
			},
		},
		{
			name: 'passive_skill_6',
			materials: {
				sardis_gold: 12000,
				weekly_boss_skill_upgrade_material: 3,
			},
		}
	]
};

// export const passiveSkillLevellingMaterialsCount = {
// 	passive_skill_1: {
			
// 			materials: {
// 				sardis_gold: 3000,
// 				weekly_boss_skill_upgrade_material: 3,
// 			},
// 		},
		
// 		passive_skill_2: {
			
// 			materials: {
// 				sardis_gold: 3000,
// 				weekly_boss_skill_upgrade_material: 3,
// 			},
// 		},
// 		passive_skill_3: {
			
// 			materials: {
// 				sardis_gold: 3000,
// 				weekly_boss_skill_upgrade_material: 3,
// 			},
// 		},
// 		passive_skill_4: {
			
// 			materials: {
// 				sardis_gold: 3000,
// 				weekly_boss_skill_upgrade_material: 3,
// 			},
// 		},
// 		passive_skill_5: {
			
// 			materials: {
// 				sardis_gold: 3000,
// 				weekly_boss_skill_upgrade_material: 3,
// 			},
// 		},
// 		passive_skill_6: {
			
// 			materials: {
// 				sardis_gold: 3000,
// 				weekly_boss_skill_upgrade_material: 3,
// 			},
// 		}
// };

export const bonusLevellingMaterialsCount = {

	bonus_stat_1: {
		materials: {
			sardis_gold: 1000,
			tiered_forgery_weapon_skill_material: {
				1: 20,
			},
		},
	},
	bonus_stat_2: {
		materials: {
			sardis_gold: 2000,
			tiered_forgery_weapon_skill_material: {
				2: 20,
			},
		},
	},
	bonus_stat_3: {
		materials: {
			sardis_gold: 4000,
			tiered_forgery_weapon_skill_material: {
				3: 40,
			},
		},
	},
	bonus_stat_4: {
		materials: {
			sardis_gold: 8000,
			tiered_forgery_weapon_skill_material: {
				4: 80,
			},
		},
	},
	bonus_stat_5: {
		materials: {
			sardis_gold: 10000,
			tiered_forgery_weapon_skill_material: {
				5: 120,
			},
		},
	},
	bonus_stat_6: {
		materials: {
			sardis_gold: 12000,
			tiered_forgery_weapon_skill_material: {
				6: 160,
			},
		},
	}
};

export const bounsStats = [
	'bonus_stat_1',
	'bonus_stat_2',
	'bonus_stat_3',
	'bonus_stat_4',
	'bonus_stat_5',
	'bonus_stat_6'
];

export const passiveSkills = [
	'passive_skill_1',
	'passive_skill_2',
	'passive_skill_3',
	'passive_skill_4',
	'passive_skill_5',
	'passive_skill_6'
];

export const tieredBounsStats = {
	tier_1:[
		'bonus_stat_1',
		'bonus_stat_2',
		'bonus_stat_3',
		'bonus_stat_4',
		'bonus_stat_5',
		'bonus_stat_6'
	]
};

export const tieredPassiveSkills = {
	tier_1: [
		'passive_skill_1',
		'passive_skill_2',
		'passive_skill_3',
		'passive_skill_4',
		'passive_skill_5',
		'passive_skill_6'
	]
};


import gameCharacterRawData from "@/data/game/raw/character.json";

export const characters = gameCharacterRawData;
