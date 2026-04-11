# Girls' Frontline 2: Exilium Data Structure

## 1. character.json

```json
{
  "6205011000": {
    "game_id": "6205011000",
    "display_name": "Suomi",
    "rarity": 5,
    "element": "burn",
    "weapon_type": "smg",
    "icon": "https://...",
    "forgery_stock_boost_bar": "stock_boost_bar",
    "forgery_transcription_conductor": "transcription_conductor"
  },
  "6204032100": {
    "game_id": "6204032100",
    "display_name": "Groza",
    "rarity": 4,
    "element": "electric",
    "weapon_type": "ar",
    "icon": "https://...",
    "forgery_stock_boost_bar": "stock_boost_bar",
    "forgery_transcription_conductor": "transcription_conductor",
    "bonus_stats": [
      { "stat": "glacio_dmg_bonus", "value": 0.018 },
      { "stat": "atk", "value": 0.018 },
      { "stat": "glacio_dmg_bonus", "value": 0.042 },
      { "stat": "atk", "value": 0.042 }
    ]
  }
}
```

**Notes:**
- GFL2는 `common`, `ascension`, `boss`, `weeklyBoss` 없음
- forgery 카테고리에 2개 SubCategory: `stock_boost_bar`, `transcription_conductor`
- `bonus_stats`: 4성 캐릭터만 보유 (5성은 없음)

## 2. weapon.json

```json
{
  "6305010001": {
    "game_id": "6305010001",
    "display_name": "Hestia",
    "type": "hg",
    "rarity": 5,
    "icon": "https://..."
  },
  "6304020001": {
    "game_id": "6304020001",
    "display_name": "Caseless Rifle 11",
    "type": "ar",
    "rarity": 4,
    "icon": "https://..."
  }
}
```

**Notes:**
- 무기는 레벨업에 EXP만 사용 (weapon_exp)
- 무기 돌파(ascension) 없음
- 무기에 재료 SubCategory 연결 없음

## 3. materials.json

```json
{
  "credit": {
    "6100000001": {
      "game_id": "6100000001",
      "label": "Sardis Gold",
      "icon": "https://...",
      "Category": "credit",
      "SubCategory": "credit"
    }
  },
  "forgery": {
    "6120010001": {
      "game_id": "6120010001",
      "label": "Stock Boost Bar T1",
      "icon": "https://...",
      "Category": "forgery",
      "SubCategory": "stock_boost_bar",
      "tier": 1
    },
    "6120010007": {
      "game_id": "6120010007",
      "label": "Stock Boost Bar T7",
      "icon": "https://...",
      "Category": "forgery",
      "SubCategory": "stock_boost_bar",
      "tier": 7
    },
    "6120020001": {
      "game_id": "6120020001",
      "label": "Inert Metallic Drip",
      "icon": "https://...",
      "Category": "forgery",
      "SubCategory": "transcription_conductor",
      "tier": 1
    },
    "6120020006": {
      "game_id": "6120020006",
      "label": "(Tier 6 name)",
      "icon": "https://...",
      "Category": "forgery",
      "SubCategory": "transcription_conductor",
      "tier": 6
    }
  },
  "rare_material": {
    "6130010001": {
      "game_id": "6130010001",
      "label": "Basic Info Core",
      "icon": "https://...",
      "Category": "rare_material",
      "SubCategory": "rare_material"
    }
  },
  "doll_exp": {
    "6160000001": {
      "game_id": "6160000001",
      "label": "Combat Report",
      "icon": "https://...",
      "Category": "doll_exp",
      "SubCategory": "doll_exp",
      "value": 1
    }
  },
  "weapon_exp": {
    "6170000001": {
      "game_id": "6170000001",
      "label": "Analysis Blueprint",
      "icon": "https://...",
      "Category": "weapon_exp",
      "SubCategory": "weapon_exp",
      "value": 1
    }
  }
}
```

### EXP 카테고리 규칙
- `value` 필드가 있는 카테고리는 자동으로 EXP 타입으로 인식
- GFL2의 EXP 카테고리: `doll_exp` (value: 1), `weapon_exp` (value: 1)

### UI 자동 기능 필드
| 필드 | 타입 | 설명 | UI 동작 |
|------|------|------|---------|
| `tier` | number | 재료 티어 (1-7) | 티어별 그룹 다이얼로그, 오름차순 정렬 |
| `value` | number | EXP 값 | EXP 다이얼로그 표시, 오름차순 정렬 |

**티어 그룹 조건**: 같은 SubCategory에 여러 고유 tier 값이 있어야 그룹화됨

## 4. costs.json

```json
{
  "character": {
    "level": {
      "20": { "doll_exp": 5224 },
      "20A": { "forgery_stock_boost_bar": [4, 1], "credit": 1000 },
      "30": { "doll_exp": 21084 },
      "30A": { "forgery_stock_boost_bar": [6, 1], "credit": 2000 },
      "40": { "doll_exp": 82549 },
      "40A": { "forgery_stock_boost_bar": [16, 2], "credit": 4000 },
      "50": { "doll_exp": 285599 },
      "50A": { "forgery_stock_boost_bar": [12, 3], "credit": 12000 },
      "60": { "doll_exp": 575689 }
    },
    "passive": {
      "5": {
        "passive_skill_1": { "rare_material": 3, "credit": 3000 },
        "passive_skill_2": { "rare_material": 3, "credit": 3000 },
        "passive_skill_3": { "rare_material": 3, "credit": 8000 },
        "passive_skill_4": { "rare_material": 3, "credit": 8000 },
        "passive_skill_5": { "rare_material": 3, "credit": 12000 },
        "passive_skill_6": { "rare_material": 3, "credit": 12000 }
      },
      "4": {
        "passive_skill_1": { "rare_material": 1, "credit": 3000 },
        "passive_skill_2": { "rare_material": 1, "credit": 3000 },
        "passive_skill_3": { "rare_material": 1, "credit": 8000 },
        "passive_skill_4": { "rare_material": 1, "credit": 8000 },
        "passive_skill_5": { "rare_material": 2, "credit": 12000 },
        "passive_skill_6": { "rare_material": 2, "credit": 12000 }
      }
    },
    "bonus_stat": {
      "bonus_stat_1": { "forgery_transcription_conductor": [20, 1], "credit": 1000 },
      "bonus_stat_2": { "forgery_transcription_conductor": [20, 2], "credit": 2000 },
      "bonus_stat_3": { "forgery_transcription_conductor": [40, 3], "credit": 4000 },
      "bonus_stat_4": { "forgery_transcription_conductor": [80, 4], "credit": 8000 },
      "bonus_stat_5": { "forgery_transcription_conductor": [120, 5], "credit": 10000 },
      "bonus_stat_6": { "forgery_transcription_conductor": [160, 6], "credit": 12000 }
    }
  },
  "weapon": {
    "level": {
      "10": { "weapon_exp": 620 },
      "20": { "weapon_exp": 4945 },
      "30": { "weapon_exp": 22390 },
      "40": { "weapon_exp": 91000 },
      "50": { "weapon_exp": 323690 },
      "60": { "weapon_exp": 667935 }
    }
  }
}
```

### 포맷 규칙
- **티어 재료**: `[수량, 티어]` (예: `[4, 1]` = 4개의 T1)
- **일반 재료**: `수량` (예: `3` = 3개)
- **EXP**: `수량` (예: `5224` = 5224 EXP)

### GFL2 특이사항
- `20A` 레벨의 `forgery_stock_boost_bar`에는 1개 티어만 사용
- `30A`에는 2개 티어: `[6, 1]` + `[8, 2]` → costs.json에서는 배열로 표현 불가, 별도 키 필요
- 패시브 비용은 등급(4성/5성)에 따라 다름
- 무기는 EXP만 사용, 돌파 없음

### 30A 레벨 다중 티어 처리

30A 레벨에서 T1:6개 + T2:8개처럼 여러 티어가 동시에 필요한 경우, costs.json 구조에서 처리 방법:

**방법 1: 배열 of 배열**
```json
"30A": { "forgery_stock_boost_bar": [[6, 1], [8, 2]], "credit": 2000 }
```

**방법 2: 가장 높은 티어만 기록 (합성으로 해결)**
```json
"30A": { "forgery_stock_boost_bar": [14, 2], "credit": 2000 }
```

> 실제 구현 시 기존 WW/Endfield의 costs.json 패턴을 따라 결정
