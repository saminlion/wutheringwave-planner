/*
  This is for configured data, such as tiered materials
*/

export const tiered_enemy_drop_weapon_skill_material = {
	stock_boost_bar: {
		1: {
			name: 'stock_boost_bar_t1',
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'stock_boost_bar_t2',
			synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'stock_boost_bar_t3',
			synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'stock_boost_bar_t4',
		},
	}
};

export const tiered_forgery_weapon_skill_material = {
	transcription_conductor: {
		1: {
			name: 'transcription_conductor_1',
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'transcription_conductor_2',
			synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'transcription_conductor_3',
			synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'transcription_conductor_4',
			synthesizable: {
				to: 5,
				count: 3,
			},
		},
		5: {
			name: 'transcription_conductor_5',
			synthesizable: {
				to: 6,
				count: 3,
			},
		},
		6: {
			name: 'transcription_conductor_6',
		}
	}
};

export const doll_exp_material = {
	// resonance_potion
	combat_report: {
		exp_value: 1,
	}
};

export const weapon_exp_material = {
	// energy_core
	analysis_blueprint: {
		exp_value: 1,
	}
};

export const tiered_forgery_weapon_skill_material_2 = {
	transcription_conductor_1: {
		to: 'transcription_conductor_2',
		cost: 3,
	},
	transcription_conductor_2: {
		from: 'transcription_conductor_1',
		to: 'transcription_conductor_3',
		cost: 3,
	},
	transcription_conductor_3: {
		from: 'transcription_conductor_2',
		to: 'transcription_conductor_4',
		cost: 3,
	},
	transcription_conductor_4: {
		from: 'transcription_conductor_3',
		to: 'transcription_conductor_5',
		cost: 3,
	},
	transcription_conductor_5: {
		from: 'transcription_conductor_4',
		to: 'transcription_conductor_6',
		cost: 3,
	},
	transcription_conductor_6: {
		from: 'transcription_conductor_5',
	}
};

export const tiered_enemy_drop_weapon_skill_material_2 = {
	stock_boost_bar_t1: {
		to: 'stock_boost_bar_t2',
		cost: 3,
	},
	stock_boost_bar_t2: {
		from: 'stock_boost_bar_t1',
		to: 'stock_boost_bar_t3',
		cost: 3,
	},
	stock_boost_bar_t3: {
		from: 'stock_boost_bar_t2',
		to: 'stock_boost_bar_t4',
		cost: 3,
	},
	stock_boost_bar_t4: {
		from: 'stock_boost_bar_t3',
	}
};

export const tiered_materials_2 = {
	...tiered_enemy_drop_weapon_skill_material_2,
	...tiered_forgery_weapon_skill_material_2,
};

export const tiered_materials = {
	tiered_enemy_drop_weapon_skill_material:
		tiered_enemy_drop_weapon_skill_material,
	tiered_forgery_weapon_skill_material: tiered_forgery_weapon_skill_material,
};

export const exp_data = {
	weap_exp: weapon_exp_material,
	char_exp: doll_exp_material,
};
