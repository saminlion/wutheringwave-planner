import weaponRaw from '../data/weapon.json';


/**
 * Extracts specific data (e.g., icon, label, id) from character.
 *
 * @param {Object} id - The character ID.
 * @param {string} field - The field to extract (e.g., "icon", "label", "game_id").
 * @returns {string|Object|null} - The value of the specified field, the entire character object if no field is provided, or null if not found.
 */
export const getWeaponField = (id, field = null) => {
    const weaponData = Object.values(weaponRaw).find(
      (item) => String(item.game_id) === String(id) // Match by game_id
    );
  
    if (!weaponData) {
      console.warn(`[Warning] Weapon with ID "${id}" not found in weaponRaw.`);
      return null;
    }
  
    if (field) {
      if (weaponData[field] == null) {
        console.warn(`[Warning] Field "${field}" not found in weaponData for ID "${id}".`);
        return null;
      }
      console.log(`[Debug] Retrieved field "${field}": ${weaponData[field]}`);
      return weaponData[field];
    }
  
    // Return entire character object if no field is specified
    console.log(`[Debug] Retrieved entire weapon data for ID "${id}":`, weaponData);
    return weaponData;
  };