/**
 * Endfield: verified per-skill mastery materials (and four promotion materials).
 *
 * The Characters sheet is wrong here in two independent ways:
 *   1. the `mastery_*_id` formula columns reference the wrong name cell (off by one,
 *      and by two for combo), so battle and combo always resolved to the same item;
 *   2. the hand-entered `mastery_*_special_name` columns are simply unfilled for most
 *      operators — they repeat `special_name`, which is the promotion material.
 *
 * Values below were cross-checked against two sites: perlica.moe supplies the skill
 * name -> skill type mapping (Normal Attack / Battle Skill / Combo Skill / Ultimate),
 * endfieldbuilds.com supplies each skill's rank 10-12 material table. The extraction
 * lines up with our own costs.json exactly — 6/16/36 specialize material, 1/2/3 Mark of
 * Perseverance, 3/6/12 odendra T5, 24000/30000/65000 credits per mastery rank.
 *
 * Every verified operator follows the same rule: basic == combo, battle == ultimate,
 * two materials total, and neither is the promotion material (Akekuri is the lone
 * exception, using one material for all four skills).
 *
 * Applied by scripts/sync-sheets.js AFTER the sheet row is read; each application is
 * logged with the sheet's value, so once the sheet is corrected the log goes quiet and
 * this file can be deleted. Materials are named, not ID'd, so they resolve through the
 * same Materials-tab label index as everything else.
 *
 * Not covered (no material data published yet): Liino, Camille, Arcane, Mi Fu, Si,
 * Hongshan, Sarkaz. Their sheet values already follow the basic==combo/battle==ultimate
 * shape, so they are left alone.
 */
export default {
  // Rossi
  5260100025: {
    special: 'Quadrant Fitting Fluid',
    mastery_basic_attack: 'Tachyon Screening Lattice',
    mastery_battle_skill: 'Metadiastima Photoemission Tube',
    mastery_combo_skill: 'Tachyon Screening Lattice',
    mastery_ultimate: 'Metadiastima Photoemission Tube',
  },
  // Zhuang Fangyi
  5260500026: {
    mastery_basic_attack: 'D96 Steel Sample 4',
    mastery_battle_skill: 'Tachyon Screening Lattice',
    mastery_combo_skill: 'D96 Steel Sample 4',
    mastery_ultimate: 'Tachyon Screening Lattice',
  },
  // Yvonne
  5260400016: {
    mastery_basic_attack: 'Metadiastima Photoemission Tube',
    mastery_battle_skill: 'D96 Steel Sample 4',
    mastery_combo_skill: 'Metadiastima Photoemission Tube',
    mastery_ultimate: 'D96 Steel Sample 4',
  },
  // Last Rite
  5260400015: {
    mastery_basic_attack: 'Tachyon Screening Lattice',
    mastery_battle_skill: 'Quadrant Fitting Fluid',
    mastery_combo_skill: 'Tachyon Screening Lattice',
    mastery_ultimate: 'Quadrant Fitting Fluid',
  },
  // Tangtang
  5260400024: {
    mastery_basic_attack: 'D96 Steel Sample 4',
    mastery_battle_skill: 'Quadrant Fitting Fluid',
    mastery_combo_skill: 'D96 Steel Sample 4',
    mastery_ultimate: 'Quadrant Fitting Fluid',
  },
  // Laevatain
  5260200017: {
    special: 'D96 Steel Sample 4',
    mastery_basic_attack: 'Triphasic Nanoflake',
    mastery_battle_skill: 'Metadiastima Photoemission Tube',
    mastery_combo_skill: 'Triphasic Nanoflake',
    mastery_ultimate: 'Metadiastima Photoemission Tube',
  },
  // Ardelia
  5260300019: {
    mastery_basic_attack: 'D96 Steel Sample 4',
    mastery_battle_skill: 'Tachyon Screening Lattice',
    mastery_combo_skill: 'D96 Steel Sample 4',
    mastery_ultimate: 'Tachyon Screening Lattice',
  },
  // Pogranichnik
  5260100018: {
    mastery_basic_attack: 'Quadrant Fitting Fluid',
    mastery_battle_skill: 'Triphasic Nanoflake',
    mastery_combo_skill: 'Quadrant Fitting Fluid',
    mastery_ultimate: 'Triphasic Nanoflake',
  },
  // Alesh
  5250400008: {
    mastery_basic_attack: 'Quadrant Fitting Fluid',
    mastery_battle_skill: 'Triphasic Nanoflake',
    mastery_combo_skill: 'Quadrant Fitting Fluid',
    mastery_ultimate: 'Triphasic Nanoflake',
  },
  // Chen Qianyu
  5250100014: {
    mastery_basic_attack: 'D96 Steel Sample 4',
    mastery_battle_skill: 'Tachyon Screening Lattice',
    mastery_combo_skill: 'D96 Steel Sample 4',
    mastery_ultimate: 'Tachyon Screening Lattice',
  },
  // Endministrator
  5260100023: {
    mastery_basic_attack: 'D96 Steel Sample 4',
    mastery_battle_skill: 'Tachyon Screening Lattice',
    mastery_combo_skill: 'D96 Steel Sample 4',
    mastery_ultimate: 'Tachyon Screening Lattice',
  },
  // Xaihi
  5250400012: {
    special: 'D96 Steel Sample 4',
    mastery_basic_attack: 'Tachyon Screening Lattice',
    mastery_battle_skill: 'Quadrant Fitting Fluid',
    mastery_combo_skill: 'Tachyon Screening Lattice',
    mastery_ultimate: 'Quadrant Fitting Fluid',
  },
  // Avywenna
  5250500007: {
    mastery_basic_attack: 'Quadrant Fitting Fluid',
    mastery_battle_skill: 'Triphasic Nanoflake',
    mastery_combo_skill: 'Quadrant Fitting Fluid',
    mastery_ultimate: 'Triphasic Nanoflake',
  },
  // Gilberta
  5260300020: {
    mastery_basic_attack: 'Quadrant Fitting Fluid',
    mastery_battle_skill: 'Triphasic Nanoflake',
    mastery_combo_skill: 'Quadrant Fitting Fluid',
    mastery_ultimate: 'Triphasic Nanoflake',
  },
  // Lifeng
  5260100022: {
    mastery_basic_attack: 'Quadrant Fitting Fluid',
    mastery_battle_skill: 'Triphasic Nanoflake',
    mastery_combo_skill: 'Quadrant Fitting Fluid',
    mastery_ultimate: 'Triphasic Nanoflake',
  },
  // Ember
  5260200021: {
    special: 'D96 Steel Sample 4',
    mastery_basic_attack: 'Tachyon Screening Lattice',
    mastery_battle_skill: 'Quadrant Fitting Fluid',
    mastery_combo_skill: 'Tachyon Screening Lattice',
    mastery_ultimate: 'Quadrant Fitting Fluid',
  },
  // Wulfgard
  5250200011: {
    mastery_basic_attack: 'Tachyon Screening Lattice',
    mastery_battle_skill: 'Quadrant Fitting Fluid',
    mastery_combo_skill: 'Tachyon Screening Lattice',
    mastery_ultimate: 'Quadrant Fitting Fluid',
  },
  // Da Pan
  5250100006: {
    mastery_basic_attack: 'Metadiastima Photoemission Tube',
    mastery_battle_skill: 'D96 Steel Sample 4',
    mastery_combo_skill: 'Metadiastima Photoemission Tube',
    mastery_ultimate: 'D96 Steel Sample 4',
  },
  // Antal
  5240500003: {
    mastery_basic_attack: 'D96 Steel Sample 4',
    mastery_battle_skill: 'Tachyon Screening Lattice',
    mastery_combo_skill: 'D96 Steel Sample 4',
    mastery_ultimate: 'Tachyon Screening Lattice',
  },
  // Estella
  5240400005: {
    mastery_basic_attack: 'D96 Steel Sample 4',
    mastery_battle_skill: 'Tachyon Screening Lattice',
    mastery_combo_skill: 'D96 Steel Sample 4',
    mastery_ultimate: 'Tachyon Screening Lattice',
  },
  // Snowshine
  5250400013: {
    mastery_basic_attack: 'Triphasic Nanoflake',
    mastery_battle_skill: 'Metadiastima Photoemission Tube',
    mastery_combo_skill: 'Triphasic Nanoflake',
    mastery_ultimate: 'Metadiastima Photoemission Tube',
  },
  // Perlica
  5250500010: {
    mastery_basic_attack: 'Metadiastima Photoemission Tube',
    mastery_battle_skill: 'D96 Steel Sample 4',
    mastery_combo_skill: 'Metadiastima Photoemission Tube',
    mastery_ultimate: 'D96 Steel Sample 4',
  },
  // Akekuri
  5240200001: {
    mastery_basic_attack: 'D96 Steel Sample 4',
    mastery_battle_skill: 'D96 Steel Sample 4',
    mastery_combo_skill: 'D96 Steel Sample 4',
    mastery_ultimate: 'D96 Steel Sample 4',
  },
  // Arclight
  5250500009: {
    mastery_basic_attack: 'D96 Steel Sample 4',
    mastery_battle_skill: 'Tachyon Screening Lattice',
    mastery_combo_skill: 'D96 Steel Sample 4',
    mastery_ultimate: 'Tachyon Screening Lattice',
  },
  // Fluorite
  5240300002: {
    mastery_basic_attack: 'Tachyon Screening Lattice',
    mastery_battle_skill: 'Quadrant Fitting Fluid',
    mastery_combo_skill: 'Tachyon Screening Lattice',
    mastery_ultimate: 'Quadrant Fitting Fluid',
  },
  // Catcher
  5240100004: {
    mastery_basic_attack: 'Metadiastima Photoemission Tube',
    mastery_battle_skill: 'D96 Steel Sample 4',
    mastery_combo_skill: 'Metadiastima Photoemission Tube',
    mastery_ultimate: 'D96 Steel Sample 4',
  },};
