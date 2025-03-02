import characterRaw from '../data/character.json';

/**
 * Extracts specific data (e.g., icon, label, id) from character.
 *
 * @param {Object} id - The character ID.
 * @param {string} field - The field to extract (e.g., "icon", "label", "game_id").
 * @returns {string|Object|null} - The value of the specified field, the entire character object if no field is provided, or null if not found.
 */
export const getCharacterField = (id, field = null) => {
    const characterData = Object.values(characterRaw).find(
      (item) => String(item.game_id) === String(id) // Match by game_id
    );
  
    if (!characterData) {
      console.warn(`[Warning] Character with ID "${id}" not found in characterRaw.`);
      return null;
    }
  
    if (field) {
      if (characterData[field] == null) {
        console.warn(`[Warning] Field "${field}" not found in characterData for ID "${id}".`);
        return null;
      }
      console.log(`[Debug] Retrieved field "${field}": ${characterData[field]}`);
      return characterData[field];
    }
  
    // Return entire character object if no field is specified
    console.log(`[Debug] Retrieved entire character data for ID "${id}":`, characterData);
    return characterData;
  };