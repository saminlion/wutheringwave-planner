# Girls' Frontline 2: Exilium Plugin Development

## Status: 🟢 Ready for Plugin Build

| 항목 | 값 |
|------|-----|
| **Game ID** | `gfl2` |
| **Display Name** | Girls' Frontline 2: Exilium |
| **Game Code** | `6` |

---

## 1. 기본 정보

| 항목 | 값 |
|------|------|
| 캐릭터 최대 레벨 | 60 |
| 스킬 최대 레벨 | 없음 (패시브 + 보너스 스탯은 체크박스) |
| 재료 합성 비율 | 3:1 (일부만) |
| 스태미나 이름 | Intelligence Puzzle |
| 일일 스태미나 | 유저 설정 (custom daily stamina) |

---

## 2. 속성 시스템

| 속성 ID | 표시 이름 | 색상 (hex) |
|---------|-----------|------------|
| burn | Burn | #FF7043 |
| corrosion | Corrosion | #CE93D8 |
| electric | Electric | #FFD54F |
| freeze | Freeze | #80DEEA |
| hydro | Hydro | #4FC3F7 |
| physical | Physical | #BDBDBD |

<!-- ⚠️ character.json에 각 캐릭터별 element 필드 추가 필요 -->

---

## 3. 무기 시스템

| 타입 ID | 표시 이름 (게임 내) | 코드 |
|---------|-------------------|------|
| hg | HG (Hand Gun) | 01 |
| ar | AR (Assault Rifle) | 02 |
| rf | RF (Rifle) | 03 |
| sg | SG (Shot Gun) | 04 |
| smg | SMG (Submachine Gun) | 05 |
| bld | Bl (Blade) | 06 |

> 게임 내에서 MG, SR은 없음. RF = Rifle (Sniper Rifle 포함)

---

## 4. 등급 시스템

| 등급 | 색상 (hex) |
|------|------------|
| 3 | #3b82f680 |
| 4 | #6B60B5 |
| 5 | #C88844 |

---

## 5. 레벨 구간

**캐릭터**: 1, 20, 20A, 30, 30A, 40, 40A, 50, 50A, 60
**무기**: 1, 10, 20, 30, 40, 50, 60 (돌파 없음)

---

## 6. 스킬 구조

패시브 6개 체크박스 + 보너스 스탯 6개 체크박스. 모두 재료 필요.

---

## 7. 재료 카테고리

| Category | 이름 | 용도 | 티어 | 합성 | SubCategory |
|----------|------|------|------|------|-------------|
| credit | Sardis Gold | 재화 | - | - | credit |
| forgery | Stock Boost Bar | 던전 드랍 | T1-T7 | T1→T4만 (3:1) | stock_boost_bar |
| forgery | Metallic Drip | 던전 드랍 | T1-T6 | 전체 (3:1) | transcription_conductor |
| rare_material | Basic Info Core | 비파밍 (상점/보상) | - | 불가 | rare_material |
| doll_exp | Combat Report | 캐릭터 EXP | - | value: 1 | doll_exp |
| weapon_exp | Analysis Blueprint | 무기 EXP | - | value: 1 | weapon_exp |

> forgery 카테고리에 2개 SubCategory 그룹 존재 (stock_boost_bar, transcription_conductor)

---

## 8. 비용 데이터

### 캐릭터 레벨

| Level | char_exp | forgery/stock_boost_bar (tier:qty) | sardis_gold |
|-------|----------|------------------------------------|-------------|
| 20 | 5,224 | - | - |
| 20A | - | T1:4 | 1,000 |
| 30 | 21,084 | - | - |
| 30A | - | T1:6, T2:8 | 2,000 |
| 40 | 82,549 | - | - |
| 40A | - | T2:16, T3:8 | 4,000 |
| 50 | 285,599 | - | - |
| 50A | - | T3:12, T4:5 | 12,000 |
| 60 | 575,689 | - | - |

### 패시브 스킬 (등급별)

| Passive | sardis_gold | rare_material (4성) | rare_material (5성) |
|---------|-------------|---------------------|---------------------|
| passive_skill_1 | 3,000 | 1 | 3 |
| passive_skill_2 | 3,000 | 1 | 3 |
| passive_skill_3 | 8,000 | 1 | 3 |
| passive_skill_4 | 8,000 | 1 | 3 |
| passive_skill_5 | 12,000 | 2 | 3 |
| passive_skill_6 | 12,000 | 2 | 3 |

### 보너스 스탯 (등급 무관)

| Bonus | sardis_gold | forgery/transcription_conductor (tier:qty) |
|-------|-------------|---------------------------------------------|
| bonus_stat_1 | 1,000 | T1:20 |
| bonus_stat_2 | 2,000 | T2:20 |
| bonus_stat_3 | 4,000 | T3:40 |
| bonus_stat_4 | 8,000 | T4:80 |
| bonus_stat_5 | 10,000 | T5:120 |
| bonus_stat_6 | 12,000 | T6:160 |

### 무기 레벨 (등급 무관, EXP만)

| Level | weap_exp |
|-------|----------|
| 10 | 620 |
| 20 | 4,945 |
| 30 | 22,390 |
| 40 | 91,000 |
| 50 | 323,690 |
| 60 | 667,935 |

---

## 9. 데이터 상태

- [X] 캐릭터 목록 (40명)
- [X] 무기 목록 (67개)
- [X] 재료 목록
- [X] 모든 비용 데이터
- [X] 합성 설정
- [X] 드랍률 데이터
- [△] character.json에 element 필드 추가 필요
- [△] character.json/weapon.json에서 mg→제거, sr→rf로 변경 필요

---

## Reference
- `LocalOnly/WutheringWaves/` - WW 데이터 예시
- `LocalOnly/Endfield/` - Endfield 데이터 예시
- `CLAUDE.md` - 플러그인 개발 가이드
