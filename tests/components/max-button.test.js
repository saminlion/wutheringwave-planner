import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';

vi.mock('@/composables/useLocale', () => ({
  useLocale: () => ({ tUI: (k) => k, tCharacter: (_i, n) => n, tWeapon: (_i, n) => n, tMaterial: (_i, n) => n }),
}));
vi.mock('@/store/game', () => ({ useGameStore: () => ({ currentGame: { config: {} } }) }));
vi.mock('@/services/materialHelper/character', () => ({
  calculateLevelMaterials: () => ({}), calculateSkillMaterials: () => ({}), calculatePassiveMaterials: () => ({}),
}));
vi.mock('@/services/materialHelper/weapon', () => ({ calculateWeaponMaterials: () => ({}) }));
vi.mock('@/services/materialHelper/dbUtils', () => ({ getMaterialFieldById: () => null }));

import WWCharacterDialog from '@/games/wutheringwave/components/CharacterDialog.vue';
import WeaponDialog from '@/components/weapon/WeaponDialog.vue';

const levelItems = [{ value: '1', label: '1' }, { value: '20', label: '20' }, { value: '90', label: '90' }];

describe('MAX button', () => {
  it('WW character: every target → highest option, currents untouched, one update', async () => {
    const settings = reactive({ currentLevel: '20', targetLevel: '20', activeSkills: {}, passiveSkills: {} });
    const w = mount(WWCharacterDialog, {
      props: {
        visible: true, character: { game_id: 'c', display_name: 'C' }, settings, levelItems,
        activeSkills: [{ model_value: 'normal', label: 'N' }, { model_value: 'skill', label: 'S' }],
        passiveSkills: [{ model_value: 'inherent', label: 'P', min: 0, max: 2 }, { model_value: 'stat', label: 'S', min: 0, max: 1 }],
      },
    });
    await w.find('.max-btn').trigger('click');

    expect(settings.currentLevel).toBe('20');
    expect(settings.targetLevel).toBe('90');
    expect(settings.activeSkills).toMatchObject({
      normal_current_level: 1, normal_target_level: 10, skill_current_level: 1, skill_target_level: 10,
    });
    expect(settings.passiveSkills).toMatchObject({
      inherent_current_level: 0, inherent_target_level: 2, stat_current_level: 0, stat_target_level: 1,
    });
    expect(w.emitted('updateCharacter')).toHaveLength(1);
  });

  it('weapon: target → highest level, current untouched', async () => {
    const settings = reactive({ currentLevel: '1', targetLevel: '1' });
    const w = mount(WeaponDialog, {
      props: { visible: true, weapon: { game_id: 'w', display_name: 'W', rarity: 5 }, settings, levelItems },
    });
    await w.find('.max-btn').trigger('click');
    expect(settings).toEqual({ currentLevel: '1', targetLevel: '90' });
    expect(w.emitted('updateweapon')).toHaveLength(1);
  });
});
