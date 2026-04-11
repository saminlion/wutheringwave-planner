import gameInventoryItemRawData from "@/data/game/raw/inventoryItem.json";

export const weekly_boss_skill_upgrade_material =
	gameInventoryItemRawData.weekly_boss_skill_upgrade_material;
export const doll_exp_material =
	gameInventoryItemRawData.doll_exp_material;
export const weapon_exp_material = gameInventoryItemRawData.weapon_exp_material;
export const enemy_drop_weapon_skill_material =
	gameInventoryItemRawData.enemy_drop_weapon_skill_material;
export const forgery_weapon_skill_material =
	gameInventoryItemRawData.forgery_weapon_skill_material;
export const credit = gameInventoryItemRawData.credit;

export const categorizedInventoryItems = {
	credit: credit,
	weekly_boss_skill_upgrade_material: weekly_boss_skill_upgrade_material,
	doll_exp_material: doll_exp_material,
	weapon_exp_material: weapon_exp_material,
	enemy_drop_weapon_skill_material: enemy_drop_weapon_skill_material,
	forgery_weapon_skill_material: forgery_weapon_skill_material,
};

export const allInventoryItems = {
	...credit,
	...weekly_boss_skill_upgrade_material,
	...doll_exp_material,
	...weapon_exp_material,
	...enemy_drop_weapon_skill_material,
	...forgery_weapon_skill_material,
};

import * as gameInventoryItemsConfig from "~/data/game/inventoryItem/gameInventoryItemConfig.js";
export const tiered_materials = {
	...gameInventoryItemsConfig.tiered_materials,
};

export const synthesizable_materials = {
	...gameInventoryItemsConfig.tiered_materials_2,
};

export const exp_data = {
	...gameInventoryItemsConfig.exp_data,
};
