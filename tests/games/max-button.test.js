import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { supportedGames } from '@/games';

/**
 * Every growth dialog needs the MAX button (CLAUDE.md "Step 7"). This guards new game plugins:
 * a CharacterDialog copied from an old template, or written from scratch, without it fails here.
 */
const read = (rel) => readFileSync(resolve(__dirname, '../..', rel), 'utf8');

const expectMaxButton = (source) => {
  expect(source).toMatch(/import MaxButton from '@\/components\/common\/MaxButton\.vue'/);
  expect(source).toMatch(/<MaxButton\s+@click="setAllMax"\s*\/>/);
  expect(source).toMatch(/const setAllMax = \(\) =>/);
};

describe('MAX button in every growth dialog', () => {
  it.each(supportedGames.map((g) => g.id))('%s CharacterDialog', (gameId) => {
    const path = `src/games/${gameId}/components/CharacterDialog.vue`;
    expect(existsSync(resolve(__dirname, '../..', path)), `${path} missing`).toBe(true);
    expectMaxButton(read(path));
  });

  it('shared WeaponDialog', () => {
    expectMaxButton(read('src/components/weapon/WeaponDialog.vue'));
  });
});
