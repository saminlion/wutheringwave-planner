# Neverness To Everness (NTE) Data Structure

**Game Code**: `7`

---

## 1. character.json

```json
{
  "7205010001": {
    "game_id": "7205010001",
    "display_name": "캐릭터 이름",
    "rarity": 5,
    "element": "fire",
    "weapon_type": "sword",
    "icon": "https://...",
    "common": "subcategory_name",
    "forgery": "subcategory_name",
    "ascension": "7130010001",
    "boss": "7140010001"
  }
}
```

## 2. weapon.json

```json
{
  "7305010001": {
    "game_id": "7305010001",
    "name": "무기 이름",
    "type": "sword",
    "rarity": 5,
    "icon": "https://...",
    "common": "subcategory_name",
    "ascension": "7130020001"
  }
}
```

## 3. materials.json

```json
{
  "credit": {
    "7100000001": {
      "game_id": "7100000001",
      "label": "재화 이름",
      "icon": "https://...",
      "Category": "credit",
      "SubCategory": "credit"
    }
  },
  "common": {
    "7110010001": {
      "game_id": "7110010001",
      "label": "재료 이름 T1",
      "icon": "https://...",
      "Category": "common",
      "SubCategory": "group_name",
      "tier": 1
    },
    "7110010002": {
      "game_id": "7110010002",
      "label": "재료 이름 T2",
      "icon": "https://...",
      "Category": "common",
      "SubCategory": "group_name",
      "tier": 2
    }
  },
  "player_exp": {
    "7160010001": {
      "game_id": "7160010001",
      "label": "경험치 포션 S",
      "icon": "https://...",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "tier": 2,
      "value": 200
    },
    "7160010002": {
      "game_id": "7160010002",
      "label": "경험치 포션 M",
      "icon": "https://...",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "tier": 3,
      "value": 1000
    }
  }
}
```

### EXP 카테고리 규칙
- `value` 필드가 있는 카테고리는 자동으로 EXP 타입으로 인식
- 새로운 EXP 카테고리 추가 시 코드 수정 불필요

### UI 자동 기능 필드
| 필드 | 타입 | 설명 | UI 동작 |
|------|------|------|---------|
| `tier` | number | 재료 티어 (1-4) | 티어별 그룹 다이얼로그, 오름차순 정렬 |
| `value` | number | EXP 값 | EXP 다이얼로그 표시, 오름차순 정렬 |

## 4. costs.json

```json
{
  "character": {
    "level": {
      "20": { "common": [5, 1], "credit": 5000 },
      "20A": { "common": [10, 2], "ascension": 1, "credit": 10000 }
    },
    "skill": {
      "2": { "forgery": [3, 1], "credit": 2000 }
    }
  },
  "weapon": {
    "level": {
      "20": { "common": [5, 1], "credit": 3000 }
    }
  }
}
```

### 포맷 규칙
- **티어 재료**: `[수량, 티어]` (예: `[5, 2]` = 5개의 T2)
- **일반 재료**: `수량` (예: `3` = 3개)
