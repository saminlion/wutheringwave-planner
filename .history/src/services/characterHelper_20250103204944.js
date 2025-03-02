import characterRaw from '../data/character.json';

/**
 * Extracts specific data (e.g., icon, label, id) from character.
 *
 * @param {Object} id - The character id.
 * @param {string} field - The field to extract (e.g., "icon", "label", "game_id").
 * @returns {string|null} - The value of the specified field or null if not found.
 */
export const getMaterialField = (id, field) => {
    let character = null;

    if (!id || !field) {

        const characterData = Object.values(characterRaw).find(
            (item) => String(item.game_id) === String(id) // 문자열 비교
        );

        if (characterData == null)
        {
            console.warn(`ID "${id}" not found in charater.`);

            return null;
        }


    }
    return material[field];
};