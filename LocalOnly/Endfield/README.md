# Endfield 플래너 구현 가이드

이 문서는 Endfield 게임의 플래너 기능을 구현하기 위한 정보를 정리합니다.

**최종 업데이트:** 2026-01-25

---

## 목차

1. [WW vs Endfield 핵심 차이점](#ww-vs-endfield-핵심-차이점)
2. [재료 시스템](#재료-시스템)
3. [캐릭터 성장 시스템](#캐릭터-성장-시스템)
4. [비용 데이터 (costs.json)](#비용-데이터-costsjson)
5. [ID 체계](#id-체계)

---

## WW vs Endfield 핵심 차이점

| 항목 | Wuthering Waves | Endfield |
|------|-----------------|----------|
| 합성 | 3:1 티어 업그레이드 | **합성 없음** (각각 직접 획득) |
| 캐릭터별 재료 | SubCategory가 캐릭터마다 다름 | **모든 캐릭터 동일** (티어5 bolete + special만 다름) |
| 등급 체계 | 캐릭터 4/5성, 무기 3/4/5성 | 캐릭터 4/5/6성, 무기 3/4/5/6성 |
| Ascension 단계 | 6단계 (20A~80A) | 7단계 (20A, 40, 40A, 60, 60A, 70, 90) |
| 최대 레벨 | 90 | 90 |

---

## 재료 시스템

### 재료 카테고리 (확정)

| 용도 | Category | SubCategory | 아이템 (tier 순) |
|------|----------|-------------|------------------|
| **캐릭터 돌파** | ascension | bolete | Pink Bolete(2) → Red Bolete(3) → Ruby Bolete(4) → **Cosmagaric/Bloodcap**(5) |
| **캐릭터 돌파** | forgery | proto_asc | Protodisk(2) → Protoset(3) |
| **스킬** | ascension | odendra | Kalkodendra(2) → Chrysodendra(3) → Vitrodendra(4) → **False Aggela/Blighted Jadeleaf**(5) |
| **스킬** | forgery | proto_skill | Protoprism(2) → Protohedron(3) |
| **무기 돌파** | ascension | onyx | Kalkonyx(2) → Auronyx(3) → Umbronyx(4) → **Wulingstone/Igneosite**(5) |
| **무기 돌파** | forgery | cast_die | Cast Die(2) → Heavy Cast Die(3) |
| **특수 재료** | special | special | 5종 (캐릭터/무기별 지정) |
| **마스터리** | special | perseverance | Mark of Perseverance |
| **화폐** | credit | credit | T-Creds |
| **캐릭터 EXP** | player_exp | player_exp | Elementary → Intermediate → Advanced Combat Record → Cognitive Carrier |
| **무기 EXP** | weapon_exp | weapon_exp | Arms Inspector → Arms INSP Kit → Arms INSP Set |

### 티어5 재료 분기

**캐릭터 bolete (티어5)**:
- Cosmagaric (game_id: 5110010005)
- Bloodcap (game_id: 5110010006)

**무기 onyx (티어5)**:
- Wulingstone (game_id: 5110030014)
- Igneosite (game_id: 5110030015)

**Special 재료 (5종)**:
- Metadiastima Photoemission Tube (5130010030)
- D96 Steel Sample 4 (5130010031)
- Tachyon Screening Lattice (5130010032)
- Quadrant Fitting Fluid (5130010033)
- Triphasic Nanoflake (5130010034)

**Mastery 재료**:
- Mark of Perseverance (game_id: 5130010035)

---

## 데이터 포맷 설명

### `[수량, 티어]` 형식

재료 비용은 `[수량, 티어]` 배열로 표기:

```
[5, 3] → 해당 재료의 티어3 아이템 5개 필요
```

**예시:**
- `bolete: [8, 2]` → Pink Bolete (티어2) 8개
- `bolete: [5, 3]` → Red Bolete (티어3) 5개
- `onyx: [3, 4]` → Umbronyx (티어4) 3개

**티어별 아이템 매핑:**

| SubCategory | 티어2 | 티어3 | 티어4 | 티어5 |
|-------------|-------|-------|-------|-------|
| bolete | Pink Bolete | Red Bolete | Ruby Bolete | Cosmagaric/Bloodcap |
| odendra | Kalkodendra | Chrysodendra | Vitrodendra | False Aggela/Blighted Jadeleaf |
| onyx | Kalkonyx | Auronyx | Umbronyx | Wulingstone/Igneosite |
| proto_asc | Protodisk | Protoset | - | - |
| proto_skill | Protoprism | Protohedron | - | - |
| cast_die | Cast Die | Heavy Cast Die | - | - |

---

## 캐릭터 성장 시스템

### 캐릭터 레벨업 구조

**⚠️ 확인 필요:**
player_exp에 대해 특이점이 있음.
1-60과 61-99의 경험치 재료가 다름:
- Combat Record (tier 2-4): 1-60 레벨 구간
- Cognitive Carrier (tier 5-6): 61-99 레벨 구간

**미확정:** 각 재료가 해당 구간에서만 사용 가능한지, 혼용 가능한지 확인 필요.
→ 확인 후 costs.json에서 player_exp를 구간별로 분리할지 결정

**materials.json 구조 검토 결과:**
현재 materials.json은 tier로 구분되어 있어 분리 구현 가능:
- Combat Record: tier 2-4 (value: 200, 1000, 10000)
- Cognitive Carrier: tier 5-6 (value: 1000, 10000) ✅ 확정

확정 시 필요 작업:
1. ~~Cognitive Carrier의 value 값 확인 및 materials.json 업데이트~~ ✅ 완료
2. costs.json levelup 구조를 레벨 구간별로 분리 (예: "20", "40", "60" vs "80", "90") - 혼용 가능 여부 확인 후

| 구간 | player_exp | credit | 비고 |
|------|------------|--------|------|
| 1→20 | 22860 | 820 | |
| 20→40 | 271400 | 13360 | 20A 돌파 후 |
| 40→60 | 747110 | 37260 | 40A 돌파 후 |
| 60→80 | 1212340 | 146440 | 60A 돌파 후 |
| 80→90 | 1792290 | 385420 | 80 돌파 후 |

### 캐릭터 Ascension 구조 (7단계)

| 단계 | 레벨 | proto_asc | bolete | credit | special | 비고 |
|------|------|-----------|--------|--------|---------|------|
| 1 | 20A | [8, 2] | [3, 2] | 1.6K | - | |
| 2 | 40 | - | - | 1.6K | - | credit만 |
| 3 | 40A | [25, 2] | [5, 3] | 6.5K | - | |
| 4 | 60 | - | - | 6.5K | - | credit만 |
| 5 | 60A | [24, 3] | [5, 4] | 18K | - | |
| 6 | 70 | - | - | 18K | - | credit만 |
| 7 | 90 | [36, 3] | [8, 5] | 100K | 20 | 최종 돌파 |

### Skill 구조 (1→9, 4개)

| 레벨 | proto_skill | odendra | credit | 비고 |
|------|-------------|---------|--------|------|
| 2 | [6, 2] | [1, 2] | 1K | |
| 3 | [12, 2] | [2, 2] | 2.7K | |
| 4 | [16, 2] | [1, 3] | 3.2K | odendra 티어업 |
| 5 | [21, 2] | [1, 3] | 4.2k | |
| 6 | [27, 2] | [2, 3] | 5.4k | |
| 7 | [6, 3] | [1, 4] | 8.2k | proto_skill 티어업 |
| 8 | [8, 3] | [1, 4] | 10.5k | |
| 9 | [15, 3] | [2, 4] | 18k | |

### Mastery 구조 (1→3, 스킬당)

**odendra tier 5 분기 확정:**
- False Aggela (5110020010)
- Blighted Jadeleaf (5110020011)
캐릭터마다 둘 중 하나 사용 (bolete/onyx와 동일 패턴)

| 레벨 | proto_skill | odendra | credit | special | perseverance | 비고 |
|------|-------------|---------|--------|---------|--------------|------|
| 1 | [15, 3] | [?, 5] | 24K | ? | 1 | |
| 2 | [24, 3] | [?, 5] | 30K | ? | 2 | |
| 3 | [50, 3] | [?, 5] | 65K | ? | 3 | |

### Talent 구조 (1→2, 2개)

| 레벨 | proto_skill | credit | 비고 |
|------|-------------|--------|------|
| talent1_1 | [12, 2] | 2.4K | |
| talent1_2 | [18, 3] | 16K | |
| talent2_1 | [48, 2] | 10.8K | |
| talent2_2 | [18, 3] | 16K | |

### BaseSkill 구조 (1→2, 2개)

| 레벨 | proto_skill | credit | 비고 |
|------|-------------|--------|------|
| base1_1 | [6, 2] | 1.6K | |
| base1_2 | [12, 3] | 8K | |
| base2_1 | [12, 2] | 3K | |
| base2_2 | [20, 3] | 20K | |

### Attribute 구조 (1→4)

| 레벨 | proto_skill | credit | 비고 |
|------|-------------|--------|------|
| 1 | [5, 2] | 1K | |
| 2 | [8, 2] | 1.8K | |
| 3 | [10, 3] | 6K | proto_skill 티어업 |
| 4 | [20, 3] | 12K | |

---

## 무기 성장 시스템

### 무기 레벨업 구조

| 구간 | weapon_exp | credit | 비고 |
|------|------------|--------|------|
| 1→20 | 8890 | 640 | |
| 20→40 | 105540 | 10400 | 20A 돌파 후 |
| 40→60 | 290540 | 29010 | 40A 돌파 후 |
| 60→80 | 1203710 | 123850 | 60A 돌파 후 |
| 80→90 | 2524080 | 341390 | 80A 돌파 후 |

### 무기 Ascension 구조

| 단계 | 레벨 | cast_die | onyx | credit | special |
|------|------|----------|------|--------|---------|
| 1 | 20A | [5, 2] | [3, 2] | 2200 | - |
| 2 | 40A | [18, 2] | [5, 3] | 8500 | - |
| 3 | 60A | [20, 3] | [5, 4] | 25000 | - |
| 4 | 80A | [30, 3] | [8, 5] | 90000 | 16 |

---

## 비용 데이터 (costs.json)

### 목표 구조

```json
{
  "character": {
    "levelup": {
      "20":  { "player_exp": 22860, "credit": 820 },
      "40":  { "player_exp": 271400, "credit": 13360 },
      "60":  { "player_exp": 747110, "credit": 37260 },
      "80":  { "player_exp": 1212340, "credit": 146440 },
      "90":  { "player_exp": 1792290, "credit": 385420 }
    },
    "ascension": {
      "20A": { "credit": 1600, "proto_asc": [8, 2], "bolete": [3, 2] },
      "40":  { "credit": 1600 },
      "40A": { "credit": 6500, "proto_asc": [25, 2], "bolete": [5, 3] },
      "60":  { "credit": 6500 },
      "60A": { "credit": 18000, "proto_asc": [24, 3], "bolete": [5, 4] },
      "70":  { "credit": 18000 },
      "90":  { "credit": 100000, "proto_asc": [36, 3], "bolete": [8, 5], "special": 20 }
    },
    "skill": {
      "2": { "credit": 1000, "proto_skill": [6, 2], "odendra": [1, 2] },
      "3": { "credit": 2700, "proto_skill": [12, 2], "odendra": [2, 2] },
      "4": { "credit": 3200, "proto_skill": [16, 2], "odendra": [1, 3] },
      "5": { "credit": 4200, "proto_skill": [21, 2], "odendra": [1, 3] },
      "6": { "credit": 5400, "proto_skill": [27, 2], "odendra": [2, 3] },
      "7": { "credit": 8200, "proto_skill": [6, 3], "odendra": [1, 4] },
      "8": { "credit": 10500, "proto_skill": [8, 3], "odendra": [1, 4] },
      "9": { "credit": 18000, "proto_skill": [15, 3], "odendra": [2, 4] }
    },
    "mastery": {
      "1": { "credit": 24000, "proto_skill": [15, 3], "odendra": [qty, 5], "special": qty, "perseverance": 1 },
      "2": { "credit": 30000, "proto_skill": [24, 3], "odendra": [qty, 5], "special": qty, "perseverance": 2 },
      "3": { "credit": 65000, "proto_skill": [50, 3], "odendra": [qty, 5], "special": qty, "perseverance": 3 }
    },
    "talent": {
      "talent1": { "1": { "credit": 2400, "proto_skill": [12, 2] }, "2": { "credit": 16000, "proto_skill": [18, 3] } },
      "talent2": { "1": { "credit": 10800, "proto_skill": [48, 2] }, "2": { "credit": 16000, "proto_skill": [18, 3] } }
    },
    "baseskill": {
      "base1": { "1": { "credit": 1600, "proto_skill": [6, 2] }, "2": { "credit": 8000, "proto_skill": [12, 3] } },
      "base2": { "1": { "credit": 3000, "proto_skill": [12, 2] }, "2": { "credit": 20000, "proto_skill": [20, 3] } }
    },
    "attribute": {
      "1": { "credit": 1000, "proto_skill": [5, 2] },
      "2": { "credit": 1800, "proto_skill": [8, 2] },
      "3": { "credit": 6000, "proto_skill": [10, 3] },
      "4": { "credit": 12000, "proto_skill": [20, 3] }
    }
  },
  "weapon": {
    "levelup": {
      "20":  { "weapon_exp": 8890, "credit": 640 },
      "40":  { "weapon_exp": 105540, "credit": 10400 },
      "60":  { "weapon_exp": 290540, "credit": 29010 },
      "80":  { "weapon_exp": 1203710, "credit": 123850 },
      "90":  { "weapon_exp": 2524080, "credit": 341390 }
    },
    "ascension": {
      "20A": { "credit": 2200, "cast_die": [5, 2], "onyx": [3, 2] },
      "40A": { "credit": 8500, "cast_die": [18, 2], "onyx": [5, 3] },
      "60A": { "credit": 25000, "cast_die": [20, 3], "onyx": [5, 4] },
      "80A": { "credit": 90000, "cast_die": [30, 3], "onyx": [8, 5], "special": 16 }
    }
  }
}
```

---

## ID 체계

### 개요

| 항목 | 형식 | 예시 |
|------|------|------|
| 캐릭터 | 52RREENNNN | 5260040015 (6성 냉기 15번) |
| 무기 | 53RRTTNNNN | 5360100010 (6성 한손검 10번) |
| 재료 | 51CCSSNNNN | 5110010002 (ascension-bolete 2번) |

### 재료 카테고리 코드 (CC)

| 코드 | 카테고리 | 설명 |
|------|----------|------|
| 00 | credit | T-Creds |
| 10 | ascension | 채집 재료 (bolete, odendra, onyx) |
| 20 | forgery | 던전 재료 (proto_asc, proto_skill, cast_die) |
| 30 | special | 캐릭터/무기 고유 재료 |
| 60 | player_exp | 캐릭터 경험치 |
| 70 | weapon_exp | 무기 경험치 |

---

## 실제 데이터 파일 위치

```
src/games/endfield/data/
├── character.json    # 캐릭터 데이터 (23명)
├── weapon.json       # 무기 데이터 (62개)
├── materials.json    # 재료 데이터 (29종)
├── costs.json        # 비용 데이터 (수정 필요)
└── synthesisRecipes.json  # 합성 레시피 (미사용)
```

---

## 검증 필요 사항

- [ ] Mastery odendra 수량 (현재 `[?, 5]`)
- [ ] Mastery special 수량 (현재 `?`)
- [x] ~~Cognitive Carrier EXP value (tier 5-6)~~ → 1000, 10000 확정
- [ ] player_exp 재료 구간 제한 여부 (Combat Record 1-60 전용 / Cognitive Carrier 61-99 전용?)
- [x] ~~odendra tier 5 variants~~ → False Aggela (5110020010), Blighted Jadeleaf (5110020011) 확정

---

## 던전 스태미나 및 보상

### 던전 시스템 개요

- **던전 레벨**: 1~5단계
- **티어 선택**: 레벨 3부터 유저가 **티어2 또는 티어3** 중 선택 가능
- **드랍**: 고정 수량 (확률 아님)

---

### Forgery 던전 (스킬/돌파 재료)

**Proto 던전 (캐릭터 돌파용 proto_asc)**

| 던전 레벨 | 스태미나 | 보상 (택1) |
|-----------|----------|------------|
| Lv.1 | 40 | 티어2 x8 |
| Lv.2 | 50 | 티어2 x14 |
| Lv.3 | 60 | 티어2 ×20 **또는** 티어3 ×8 |
| Lv.4 | 70 | 티어2 ×27 **또는** 티어3 ×11 |
| Lv.5 | 80 | 티어2 x34 **또는** 티어3 ×14 |

**Proto 던전 (스킬용 proto_skill)**

| 던전 레벨 | 스태미나 | 보상 (택1) |
|-----------|----------|------------|
| Lv.1 | 40 | 티어2 x21 |
| Lv.2 | 50 | 티어2 x35 |
| Lv.3 | 60 | 티어2 ×50 **또는** 티어3 ×10 |
| Lv.4 | 70 | 티어2 ×69 **또는** 티어3 ×14 |
| Lv.5 | 80 | 티어2 x85 **또는** 티어3 ×17 |

> **예시 (가상 데이터):**
> | Lv.5 | 30 | 티어2 ×15 **또는** 티어3 ×5 |
> → 스태미나 30 소모, Protodisk 15개 또는 Protoset 5개 중 선택

**Cast Die 던전 (무기 돌파용)**

| 던전 레벨 | 스태미나 | 보상 (택1) |
|-----------|----------|------------|
| Lv.1 | 40 | 티어2 ×8 |
| Lv.2 | 50 | 티어2 ×14 |
| Lv.3 | 60 | 티어2 ×20 **또는** 티어3 ×8 |
| Lv.4 | 70 | 티어2 ×27 **또는** 티어3 ×11 |
| Lv.5 | 80 | 티어2 ×34 **또는** 티어3 ×14 |

---

### EXP 던전 (캐릭터/무기 경험치)

**캐릭터 EXP 던전 (Combat Record / Cognitive Carrier)**

| 던전 레벨 | 스태미나 | 드랍 (상위 티어부터 순서대로 다만 여기도 선택지가 나뉨 **또는** 이후는 61-90 경험치 재료임) | 비고 |
|-----------|----------|------|------|
| Lv.1 | 40 | 4,2,3 | |
| Lv.2 | 50 | 6,9,4 | |
| Lv.3 | 60 |9,9,4 **또는** 4,-| |
| Lv.4 | 70 | 13,7,2 **또는** 5,5 | |
| Lv.5 | 80 | 17,-,- **또는** 6,8 | |

**무기 EXP 던전 (Arms Inspector)**

| 던전 레벨 | 스태미나 | 드랍 (상위 티어부터 순서대로) | 비고 |
|-----------|----------|------|------|
| Lv.1 | 40 | 4,6,7 | |
| Lv.2 | 50 | 6,9,4 | |
| Lv.3 | 60 | 9,9,1 | |
| Lv.4 | 70 | 12,16,7 | |
| Lv.5 | 80 | 16,10,- | |

---

### Credit 던전 (T-Creds)

| 던전 레벨 | 스태미나 | 드랍 (단위는 K) | 비고 |
|-----------|----------|------|------|
| Lv.1 | 40 | 8.5 | |
| Lv.2 | 50 | 13.5 | |
| Lv.3 | 60 | 19.5 | |
| Lv.4 | 70 | 27.5 | |
| Lv.5 | 80 | 34 | |

### 필드 채집 재료

Ascension 재료 (bolete, odendra, onyx)는 필드 채집이므로 던전 없음.
각 재료마다 채집 위치가 다르며, 플래너에서 위치 정보는 제공하지 않음.

### Special 재료 획득처 (던전인 것 같은데 주간 인지 확인이 안됨)

| 재료명 | 획득처 | 비고 |
|--------|--------|------|
| Metadiastima Photoemission Tube | ??? | 확인 필요 |
| D96 Steel Sample 4 | ??? | 확인 필요 |
| Tachyon Screening Lattice | ??? | 확인 필요 |
| Quadrant Fitting Fluid | ??? | 확인 필요 |
| Triphasic Nanoflake | ??? | 확인 필요 |
| Mark of Perseverance | 패스나 이벤트로 얻음 | 마스터리용 |

---

## 참고 파일

- [ID_SYSTEM.md](./ID_SYSTEM.md) - ID 체계 상세
- [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) - 데이터 파일 구조
- [GOOGLE_SHEETS_GUIDE.md](./GOOGLE_SHEETS_GUIDE.md) - 구글 시트 관리 가이드
