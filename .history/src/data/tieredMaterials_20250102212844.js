export const tieredMaterials = {
    cadence: {
		1: {
			name: 'cadence_seed',
			game_id: 43020051,
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'cadence_bud',
			game_id: 43020052,
			synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'cadence_leaf',
			game_id: 43020053,
			synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'cadence_blossom',
			game_id: 43020054,
		},
	},

	phlogiston: {
		1: {
			name: 'impure_phlogiston',
			game_id: 43020021,
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'extracted_phlogiston',
			game_id: 43020022,
			synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'refined_phlohiston',
			game_id: 43020023,
			synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'flawless_phlohiston',
			game_id: 43020024,
		},
	},

	metallic_drip: {
		1: {
			name: 'inert_metallic_drip',
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'reactive_metallic_drip',
			synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'polarized_metallic_drip',
			synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'heterized_metallic_drip',
		},
	},

	helix: {
		1: {
			name: 'lento_helix',
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'adagio_helix',
			synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'andante_helix',
			synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'presto_helix',
		},
	},

	waveworn_residue: {
		1: {
			name: 'waveworn_residue_210',
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'waveworn_residue_226',
			synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'waveworn_residue_235',
			synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'waveworn_residue_239',
		},
	},

    howler_core: {
		1: {
			name: 'lf_howler_core',
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'mf_howler_core',
            synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'hf_howler_core',
            synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'ff_howler_core',
		},
	},

	whisperin_core: {
		1: {
			name: 'lf_whisperin_core',
            game_id: 41100011,
            synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'mf_whisperin_core',
            game_id: 41100012,
            synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'hf_whisperin_core',
            game_id: 41100013,
            synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'ff_whisperin_core',
		},
	},

	mask: {
		1: {
			name: 'mask_of_constraint',
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'mask_of_erosion',
			synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'mask_of_distortion',
			synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'mask_of_insanity',
		},
	},
	ring: {
		1: {
			name: 'crude_ring',
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'basic_ring',
			synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'improved_ring',
			synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'tailored_ring',
		},
	},
	polyphonic: {
		1: {
			name: 'low_frequency_polyphonic_core',
			synthesizable: {
				to: 2,
				count: 3,
			},
		},
		2: {
			name: 'mid_frequency_polyphonic_core',
			synthesizable: {
				to: 3,
				count: 3,
			},
		},
		3: {
			name: 'high_frequency_polyphonic_core',
			synthesizable: {
				to: 4,
				count: 3,
			},
		},
		4: {
			name: 'full_frequency_polyphonic_core',
		},
	}
};

export const resonator_exp_material = {
	// resonance_potion
	basic_resonance_potion: {
		exp_value: 1000,
	},
	medium_resonance_potion: {
		exp_value: 3000,
	},
	advanced_resonance_potion: {
		exp_value: 8000,
	},
	premium_resonance_potion: {
		exp_value: 20000,
	},
};

export const weapon_exp_material = {
	// energy_core
	basic_energy_core: {
		exp_value: 1000,
	},
	medium_energy_core: {
		exp_value: 3000,
	},
	advanced_energy_core: {
		exp_value: 8000,
	},
	premium_energy_core: {
		exp_value: 20000,
	},
};