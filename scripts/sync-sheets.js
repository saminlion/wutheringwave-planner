#!/usr/bin/env node
/**
 * Google Sheets Sync Script
 *
 * Fetches game data from Google Sheets and writes to JSON files.
 *
 * Usage:
 *   npm run sync                    # Sync all games
 *   npm run sync -- --game=endfield # Sync specific game
 *
 * Environment variables (in .env):
 *   SHEET_ID_WUTHERINGWAVE=your_sheet_id_here
 *   SHEET_ID_ENDFIELD=your_sheet_id_here
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Load .env file if it exists (for local development)
const envPath = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

/**
 * Extract Sheet ID from URL or return as-is if already an ID
 */
function extractSheetId(input) {
  if (!input) return null;

  let value = input.trim();

  // Strip URL fragments and query params (e.g., #gid=123, ?gid=123)
  value = value.split('#')[0].split('?')[0];

  // Handle partial paste like "ID/edit"
  if (value.includes('/edit')) {
    value = value.split('/edit')[0];
  }

  // If it's already just an ID (no slashes, no special chars except - and _), return it
  if (/^[a-zA-Z0-9_-]+$/.test(value)) {
    return value;
  }

  // Extract from regular URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
  const regularMatch = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (regularMatch) {
    return regularMatch[1];
  }

  // If someone pasted a publish URL, warn them
  if (value.includes('/e/') || value.includes('pubhtml') || value.includes('2PACX')) {
    console.warn('Warning: You pasted a publish URL or publish ID.');
    console.warn('Please use the Sheet ID from the regular edit URL:');
    console.warn('https://docs.google.com/spreadsheets/d/SHEET_ID/edit');
    return null;
  }

  return value;
}

// Configuration for each game
const GAMES = {
  wutheringwave: {
    sheetId: extractSheetId(process.env.SHEET_ID_WUTHERINGWAVE),
    dataPath: 'src/games/wutheringwave/data',
    localePath: 'src/games/wutheringwave/locales',
    // Tab names in your Google Sheet
    tabs: {
      characters: 'Characters',
      materials: 'Materials',
      weapons: 'Weapons',
    },
    // i18n tabs - each data type has its own i18n tab
    i18nTabs: {
      characters: 'Characters_i18n',
      materials: 'Materials_i18n',
      weapons: 'Weapons_i18n',
    },
  },
  endfield: {
    sheetId: extractSheetId(process.env.SHEET_ID_ENDFIELD),
    dataPath: 'src/games/endfield/data',
    localePath: 'src/games/endfield/locales',
    tabs: {
      characters: 'Characters',
      materials: 'Materials',
      weapons: 'Weapons',
    },
    i18nTabs: {
      characters: 'Characters_i18n',
      materials: 'Materials_i18n',
      weapons: 'Weapons_i18n',
    },
  },
};

/**
 * Fetch data from a published Google Sheet tab
 * Sheet must be published: File -> Share -> Publish to web
 *
 * @param {string} sheetId - The Google Sheet ID
 * @param {string} tabName - The tab/sheet name
 * @returns {Promise<Array<Object>>} Array of row objects
 */
async function fetchSheetData(sheetId, tabName) {
  const encodedTab = encodeURIComponent(tabName);
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodedTab}`;

  console.log(`  Fetching: ${tabName}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${tabName}: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  // Google returns JSONP-like response, extract the JSON
  const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?$/);
  if (!jsonMatch) {
    throw new Error(`Invalid response format for ${tabName}`);
  }

  const data = JSON.parse(jsonMatch[1]);

  if (data.status === 'error') {
    throw new Error(`Sheet error: ${data.errors?.[0]?.message || 'Unknown error'}`);
  }

  const table = data.table;
  if (!table || !table.rows) {
    return [];
  }

  // Extract headers from first row
  const headers = table.cols.map(col => col.label || col.id);

  // Convert rows to objects
  const rows = table.rows.map(row => {
    const obj = {};
    row.c.forEach((cell, index) => {
      const header = headers[index];
      if (header) {
        obj[header] = cell?.v ?? cell?.f ?? null;
      }
    });
    return obj;
  });

  console.log(`    Found ${rows.length} rows`);
  return rows;
}

/**
 * Transform character rows to the expected JSON structure
 *
 * Sheet columns: Seq, Rariy, Element, ElementCode, game_id, key, display_name,
 *                weapon, bolete_name, bolete_id, odendra_name, odendra_id,
 *                special_name, special_id, icon
 */
function transformCharacters(rows) {
  const result = {};

  for (const row of rows) {
    if (!row.game_id) continue;

    const key = row.key || String(row.display_name || row.game_id).toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');

    const character = {
      game_id: parseNumberOrString(row.game_id),
      display_name: row.display_name || '',
    };

    // Map sheet columns to JSON fields
    // Rariy (typo in sheet) -> rarity
    if (row.Rariy != null && row.Rariy !== '') {
      character.rarity = parseInt(row.Rariy, 10);
    } else if (row.Rarity != null && row.Rarity !== '') {
      character.rarity = parseInt(row.Rarity, 10);
    }

    // ElementCode -> element
    if (row.ElementCode) {
      character.element = row.ElementCode;
    } else if (row.Element) {
      character.element = row.Element;
    }

    // weapon
    if (row.weapon) {
      character.weapon = row.weapon;
    }

    // icon
    if (row.icon) {
      character.icon = row.icon;
    }

    // Material IDs (use the _id columns)
    if (row.bolete_id != null && row.bolete_id !== '') {
      character.bolete = parseNumberOrString(row.bolete_id);
    }
    if (row.odendra_id != null && row.odendra_id !== '') {
      character.odendra = parseNumberOrString(row.odendra_id);
    }
    if (row.special_id != null && row.special_id !== '') {
      character.special = parseNumberOrString(row.special_id);
    }

    // WutheringWaves specific fields
    if (row.common) character.common = row.common;
    if (row.forgery) character.forgery = row.forgery;
    if (row.ascension != null && row.ascension !== '') {
      character.ascension = parseNumberOrString(row.ascension);
    }
    if (row.boss != null && row.boss !== '') {
      character.boss = parseNumberOrString(row.boss);
    }
    if (row.weeklyBoss != null && row.weeklyBoss !== '') {
      character.weeklyBoss = parseNumberOrString(row.weeklyBoss);
    }

    result[key] = character;
  }

  return result;
}

/**
 * Transform material rows to the expected nested JSON structure
 *
 * Sheet columns: Category, CategoryCode, SubCategory, SubCatCode, Seq,
 *                game_id, key, label, tier, value, icon
 */
function transformMaterials(rows) {
  const result = {};

  for (const row of rows) {
    if (!row.game_id) continue;

    // Use CategoryCode for internal category key, fallback to Category
    const category = row.CategoryCode || row.Category;
    if (!category) continue;

    const key = row.key || String(row.label || row.game_id).toLowerCase().replace(/\s+/g, '_');

    if (!result[category]) {
      result[category] = {};
    }

    const material = {
      game_id: parseNumberOrString(row.game_id),
      label: row.label || '',
      Category: category,
    };

    // SubCatCode -> SubCategory
    if (row.SubCatCode) {
      material.SubCategory = row.SubCatCode;
    } else if (row.SubCategory) {
      material.SubCategory = row.SubCategory;
    }

    // icon
    if (row.icon) {
      material.icon = row.icon;
    }

    // tier
    if (row.tier != null && row.tier !== '') {
      material.tier = parseInt(row.tier, 10);
    }

    // value (for EXP items)
    if (row.value != null && row.value !== '') {
      material.value = parseInt(row.value, 10);
    }

    // rarity (if present)
    if (row.rarity != null && row.rarity !== '') {
      material.rarity = parseInt(row.rarity, 10);
    }

    result[category][key] = material;
  }

  return result;
}

/**
 * Transform weapon rows to the expected JSON structure
 *
 * Sheet columns: Seq, Rarity, Type, TypeCode, game_id, key, display_name,
 *                onyx_name, onyx_id, special_name, special_id, icon
 */
function transformWeapons(rows) {
  const result = {};

  for (const row of rows) {
    if (!row.game_id) continue;

    const key = row.key || String(row.display_name || row.game_id).toLowerCase().replace(/\s+/g, '_');

    const weapon = {
      game_id: parseNumberOrString(row.game_id),
      display_name: row.display_name || '',
    };

    // Rarity
    if (row.Rarity != null && row.Rarity !== '') {
      weapon.rarity = parseInt(row.Rarity, 10);
    }

    // TypeCode -> weapon_type
    if (row.TypeCode) {
      weapon.weapon_type = row.TypeCode;
    } else if (row.Type) {
      weapon.weapon_type = row.Type;
    }

    // icon
    if (row.icon) {
      weapon.icon = row.icon;
    }

    // Material IDs
    if (row.onyx_id != null && row.onyx_id !== '') {
      weapon.onyx = parseNumberOrString(row.onyx_id);
    }
    if (row.special_id != null && row.special_id !== '') {
      weapon.special = parseNumberOrString(row.special_id);
    }

    // WutheringWaves specific
    if (row.common) weapon.common = row.common;
    if (row.forgery) weapon.forgery = row.forgery;

    result[key] = weapon;
  }

  return result;
}

/**
 * Transform i18n rows to locale object
 *
 * Sheet columns: game_id, en, ko
 * Returns: { "game_id": "translated_name", ... }
 */
function transformI18n(rows, lang) {
  const result = {};

  for (const row of rows) {
    if (!row.game_id) continue;

    const value = row[lang];
    if (value != null && value !== '') {
      result[String(row.game_id)] = value;
    }
  }

  return result;
}

/**
 * Parse a value as number if it looks like one, otherwise keep as string
 */
function parseNumberOrString(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'number') return value;

  const str = String(value).trim();
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10);
    if (num <= Number.MAX_SAFE_INTEGER) {
      return num;
    }
  }
  return str;
}

/**
 * Write JSON data to file
 */
function writeJsonFile(filePath, data) {
  const fullPath = path.join(ROOT_DIR, filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`  Written: ${filePath}`);
}

/**
 * Sync a single game's data
 */
async function syncGame(gameId, config) {
  console.log(`\nSyncing ${gameId}...`);

  if (!config.sheetId) {
    console.log(`  Skipped: No SHEET_ID_${gameId.toUpperCase()} environment variable set`);
    return;
  }

  try {
    // Sync data files
    for (const [dataType, tabName] of Object.entries(config.tabs)) {
      try {
        const rows = await fetchSheetData(config.sheetId, tabName);

        let transformed;
        switch (dataType) {
          case 'characters':
            transformed = transformCharacters(rows);
            break;
          case 'materials':
            transformed = transformMaterials(rows);
            break;
          case 'weapons':
            transformed = transformWeapons(rows);
            break;
          default:
            console.log(`    Unknown data type: ${dataType}`);
            continue;
        }

        const fileName = dataType === 'characters' ? 'character' : dataType;
        writeJsonFile(`${config.dataPath}/${fileName}.json`, transformed);
      } catch (error) {
        console.error(`  Error syncing ${tabName}: ${error.message}`);
      }
    }

    // Sync locale files
    // Collect i18n data from all tabs and merge into per-language files
    const locales = { en: {}, ko: {} };

    for (const [dataType, tabName] of Object.entries(config.i18nTabs)) {
      try {
        const rows = await fetchSheetData(config.sheetId, tabName);

        // Map data type to locale key
        const localeKey = dataType; // 'characters', 'materials', 'weapons'

        for (const lang of ['en', 'ko']) {
          const translations = transformI18n(rows, lang);
          locales[lang][localeKey] = translations;
        }
      } catch (error) {
        console.error(`  Error syncing ${tabName}: ${error.message}`);
      }
    }

    // Write locale files
    for (const [lang, data] of Object.entries(locales)) {
      if (Object.keys(data).length > 0) {
        writeJsonFile(`${config.localePath}/${lang}.json`, data);
      }
    }

    console.log(`  Done!`);
  } catch (error) {
    console.error(`  Error: ${error.message}`);
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log('Google Sheets Sync');
  console.log('==================');

  const args = process.argv.slice(2);
  const gameArg = args.find(arg => arg.startsWith('--game='));
  const targetGame = gameArg?.split('=')[1];

  if (targetGame) {
    if (!GAMES[targetGame]) {
      console.error(`Unknown game: ${targetGame}`);
      console.error(`Available games: ${Object.keys(GAMES).join(', ')}`);
      process.exit(1);
    }
    await syncGame(targetGame, GAMES[targetGame]);
  } else {
    for (const [gameId, config] of Object.entries(GAMES)) {
      await syncGame(gameId, config);
    }
  }

  console.log('\nSync complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
