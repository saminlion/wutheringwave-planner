import { describe, it, expect } from 'vitest';
import { games, supportedGames, getEnabledGames, getGame, DEFAULT_GAME_ID } from '@/games';

/**
 * The game selector renders `supportedGames`, while everything else resolves
 * plugins out of `games`. A plugin present in one but not the other loads fine
 * and builds fine — it just never appears in the UI, which is how the DNA
 * plugin shipped invisible. These tests make that mismatch fail loudly.
 */
describe('game registry', () => {
  it('lists every registered plugin in supportedGames', () => {
    const listed = supportedGames.map(g => g.id).sort();
    const registered = Object.keys(games).sort();
    expect(listed).toEqual(registered);
  });

  it('resolves every supportedGames entry to a real plugin', () => {
    for (const entry of supportedGames) {
      const plugin = getGame(entry.id);
      expect(plugin, `plugin for ${entry.id}`).toBeTruthy();
      expect(plugin.id, `${entry.id} plugin id`).toBe(entry.id);
    }
  });

  it('gives every entry the fields the selector renders', () => {
    for (const entry of supportedGames) {
      expect(entry.name, `${entry.id}.name`).toBeTruthy();
      expect(entry.shortName, `${entry.id}.shortName`).toBeTruthy();
      expect(entry.icon, `${entry.id}.icon`).toBeTruthy();
      expect(typeof entry.enabled, `${entry.id}.enabled`).toBe('boolean');
    }
  });

  it('gives every plugin the interface the stores call', () => {
    for (const [id, plugin] of Object.entries(games)) {
      expect(plugin.config, `${id}.config`).toBeTruthy();
      expect(typeof plugin.getData, `${id}.getData`).toBe('function');
      expect(plugin.getData('characters'), `${id} characters`).toBeTruthy();
      expect(plugin.getData('materials'), `${id} materials`).toBeTruthy();
      expect(plugin.getData('costs'), `${id} costs`).toBeTruthy();
      expect(plugin.materialProcessor?.processMaterial, `${id}.processMaterial`).toBeTypeOf('function');
      expect(plugin.config.formFields, `${id}.formFields`).toBeTruthy();
      expect(typeof plugin.config.createCharacterInitialSettings, `${id}.createCharacterInitialSettings`)
        .toBe('function');
    }
  });

  it('keeps at least one game enabled and the default among them', () => {
    const enabled = getEnabledGames();
    expect(enabled.length).toBeGreaterThan(0);
    expect(enabled.map(g => g.id)).toContain(DEFAULT_GAME_ID);
  });

  it('uses unique ids, shortNames and icons', () => {
    for (const field of ['id', 'shortName', 'icon']) {
      const values = supportedGames.map(g => g[field]);
      expect(new Set(values).size, `duplicate ${field}`).toBe(values.length);
    }
  });
});
