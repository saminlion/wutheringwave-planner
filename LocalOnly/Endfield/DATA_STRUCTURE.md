# Endfield 데이터 구조 설명

Endfield 게임 데이터를 입력하는 방법을 설명합니다.

**최종 업데이트:** 2026-01-25

**참고:** ID 체계에 대한 자세한 설명은 [ID_SYSTEM.md](ID_SYSTEM.md)를 참조하세요.

---

## 목차

1. [character.json](#1-characterjson)
2. [weapon.json](#2-weaponjson)
3. [materials.json](#3-materialsjson)
4. [costs.json](#4-costsjson)

---

## 1. character.json

캐릭터 정보를 저장하는 파일입니다.

### 구조:

```json
{
  "캐릭터_영문명": {
    "game_id": 5206040001,
    "display_name": "캐릭터 표시 이름",
    "element": "element_type",
    "weapon": "weapon_type",
    "icon": "아이콘 이미지 URL",
    "rarity": 6,
    "special": 5130010001
  }
}
```

### 필드 설명:

| 필드 | 타입 | 설명 |
|------|------|------|
| game_id | Number | 캐릭터 ID (52RREENNNN) |
| display_name | String | 표시 이름 |
| element | String | 속성 (physical, heat, nature, cryo, electric) |
| weapon | String | 무기 타입 (sword, greatsword, polearm, arts, pistol) |
| icon | String | 아이콘 URL |
| rarity | Number | 등급 (4, 5, 6) |
| special | Number | 캐릭터 고유 재료 game_id (7단계 돌파용) |

### 핵심 차이점 (vs WW):

- **common, forgery, ascension, boss, weeklyBoss 필드 없음**
- Endfield는 모든 캐릭터가 **동일한 재료** 사용
- 캐릭터별로 다른 것은 **special 재료**뿐 (7단계 돌파용)

### 예시:

```json
{
  "clemence": {
    "game_id": 5206040001,
    "display_name": "Clemence",
    "element": "cryo",
    "weapon": "pistol",
    "icon": "https://example.com/clemence.png",
    "rarity": 6,
    "special": 5130010001
  },
  "operator_b": {
    "game_id": 5205020001,
    "display_name": "Operator B",
    "element": "heat",
    "weapon": "sword",
    "icon": "https://example.com/operator_b.png",
    "rarity": 5,
    "special": 5130010002
  }
}
```

---

## 2. weapon.json

무기 정보를 저장하는 파일입니다.

### 구조:

```json
{
  "무기_영문명": {
    "game_id": 5306010001,
    "display_name": "무기 표시 이름",
    "rarity": 6,
    "type": "weapon_type",
    "icon": "아이콘 이미지 URL"
  }
}
```

### 필드 설명:

| 필드 | 타입 | 설명 |
|------|------|------|
| game_id | Number | 무기 ID (53RRTTNNNN) |
| display_name | String | 표시 이름 |
| rarity | Number | 등급 (3, 4, 5, 6) |
| type | String | 무기 타입 (sword, greatsword, polearm, arts, pistol) |
| icon | String | 아이콘 URL |

### 핵심 차이점 (vs WW):

- **common, forgery 필드 없음**
- 모든 무기가 동일한 재료 사용 (캐릭터와 마찬가지)

### 예시:

```json
{
  "blade_of_dawn": {
    "game_id": 5306010001,
    "display_name": "Blade of Dawn",
    "rarity": 6,
    "type": "sword",
    "icon": "https://example.com/blade_of_dawn.png"
  },
  "hunters_lance": {
    "game_id": 5305030001,
    "display_name": "Hunter's Lance",
    "rarity": 5,
    "type": "polearm",
    "icon": "https://example.com/hunters_lance.png"
  }
}
```

---

## 3. materials.json

모든 재료 정보를 저장하는 파일입니다.

### 구조:

```json
{
  "카테고리": {
    "재료_영문명": {
      "game_id": 5110010001,
      "icon": "아이콘 URL",
      "label": "표시 이름",
      "Category": "카테고리",
      "SubCategory": "서브카테고리",
      "tier": 2
    }
  }
}
```

### 재료 카테고리 (Endfield 전용)

| 카테고리 | CC 코드 | SubCategory | 설명 |
|----------|---------|-------------|------|
| credit | 00 | credit | T-Creds (화폐) |
| ascension | 10 | bolete | Ascension용 채집 재료 (Pink/Red/Ruby/Cosmagaric) |
| ascension | 10 | odendra | Skill용 채집 재료 (Kalkodenra/Chryodendra/...) |
| forgery | 20 | proto_asc | Ascension용 던전 재료 (Protodisk/Prototest) |
| forgery | 20 | proto_skill | Skill용 던전 재료 (Protprism/Protohedron) |
| special | 30 | 캐릭터별 | 캐릭터 고유 재료 (7단계 돌파, 마스터리용) |
| mastery | 40 | mastery | 마스터리 재료 (Mark of Perverance) |
| player_exp | 60 | player_exp | 캐릭터 경험치 아이템 |
| weapon_exp | 70 | weapon_exp | 무기 경험치 아이템 |

### 3.1 credit (화폐)

```json
{
  "credit": {
    "t_creds": {
      "game_id": 5100000001,
      "icon": "https://example.com/t_creds.png",
      "label": "T-Creds",
      "Category": "credit",
      "SubCategory": "credit"
    }
  }
}
```

### 3.2 ascension (채집 재료)

Ascension용 bolete와 Skill용 odendra가 같은 카테고리에 속함.

```json
{
  "ascension": {
    "pink_bolete": {
      "game_id": 5110010001,
      "icon": "https://example.com/pink_bolete.png",
      "label": "Pink Bolete",
      "Category": "ascension",
      "SubCategory": "bolete",
      "tier": 2
    },
    "red_bolete": {
      "game_id": 5110010002,
      "icon": "https://example.com/red_bolete.png",
      "label": "Red Bolete",
      "Category": "ascension",
      "SubCategory": "bolete",
      "tier": 3
    },
    "ruby_bolete": {
      "game_id": 5110010003,
      "icon": "https://example.com/ruby_bolete.png",
      "label": "Ruby Bolete",
      "Category": "ascension",
      "SubCategory": "bolete",
      "tier": 4
    },
    "cosmagaric": {
      "game_id": 5110010004,
      "icon": "https://example.com/cosmagaric.png",
      "label": "Cosmagaric",
      "Category": "ascension",
      "SubCategory": "bolete",
      "tier": 5
    },
    "kalkodenra": {
      "game_id": 5110020001,
      "icon": "https://example.com/kalkodenra.png",
      "label": "Kalkodenra",
      "Category": "ascension",
      "SubCategory": "odendra",
      "tier": 2
    },
    "chryodendra": {
      "game_id": 5110020002,
      "icon": "https://example.com/chryodendra.png",
      "label": "Chryodendra",
      "Category": "ascension",
      "SubCategory": "odendra",
      "tier": 3
    }
  }
}
```

### 3.3 forgery (던전 재료)

Ascension용 proto_asc와 Skill용 proto_skill이 같은 카테고리에 속함.

```json
{
  "forgery": {
    "protodisk": {
      "game_id": 5120010001,
      "icon": "https://example.com/protodisk.png",
      "label": "Protodisk",
      "Category": "forgery",
      "SubCategory": "proto_asc",
      "tier": 2
    },
    "prototest": {
      "game_id": 5120010002,
      "icon": "https://example.com/prototest.png",
      "label": "Prototest",
      "Category": "forgery",
      "SubCategory": "proto_asc",
      "tier": 3
    },
    "protprism": {
      "game_id": 5120020001,
      "icon": "https://example.com/protprism.png",
      "label": "Protprism",
      "Category": "forgery",
      "SubCategory": "proto_skill",
      "tier": 2
    },
    "protohedron": {
      "game_id": 5120020002,
      "icon": "https://example.com/protohedron.png",
      "label": "Protohedron",
      "Category": "forgery",
      "SubCategory": "proto_skill",
      "tier": 3
    }
  }
}
```

### 3.4 special (캐릭터 고유 재료)

7단계 돌파와 마스터리에 사용됨.

```json
{
  "special": {
    "triphasic_nanoflake": {
      "game_id": 5130010001,
      "icon": "https://example.com/triphasic_nanoflake.png",
      "label": "Triphasic Nanoflake",
      "Category": "special",
      "SubCategory": "triphasic_nanoflake"
    }
  }
}
```

### 3.5 mastery (마스터리 재료)

```json
{
  "mastery": {
    "mark_of_perverance": {
      "game_id": 5140010001,
      "icon": "https://example.com/mark_of_perverance.png",
      "label": "Mark of Perverance",
      "Category": "mastery",
      "SubCategory": "mastery"
    }
  }
}
```

### 3.6 player_exp (캐릭터 경험치)

```json
{
  "player_exp": {
    "player_exp_small": {
      "game_id": 5160000001,
      "icon": "https://example.com/exp_s.png",
      "label": "Player EXP (Small)",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "tier": 2,
      "value": 1000
    },
    "player_exp_medium": {
      "game_id": 5160000002,
      "icon": "https://example.com/exp_m.png",
      "label": "Player EXP (Medium)",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "tier": 3,
      "value": 3000
    },
    "player_exp_large": {
      "game_id": 5160000003,
      "icon": "https://example.com/exp_l.png",
      "label": "Player EXP (Large)",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "tier": 4,
      "value": 8000
    },
    "player_exp_extra_large": {
      "game_id": 5160000004,
      "icon": "https://example.com/exp_xl.png",
      "label": "Player EXP (Extra Large)",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "tier": 5,
      "value": 20000
    }
  }
}
```

### 3.7 weapon_exp (무기 경험치)

player_exp와 동일한 구조.

---

## 4. costs.json

레벨업과 스킬업에 필요한 재료 비용을 정의합니다.

### 핵심 차이점 (vs WW):

- **합성 시스템 없음**: 각 tier 재료를 직접 획득해야 함
- **모든 캐릭터 동일 비용**: character.json에서 재료 SubCategory를 참조하지 않음
- **[수량, tier] 형식**: 티어가 명시된 재료는 `[수량, tier]` 배열로 표현

### 4.1 캐릭터 레벨 (Ascension)

```json
{
  "character": {
    "level": {
      "20A": { "proto_asc": [8, 2], "bolete": [3, 2], "credit": 1600 },
      "40":  { "credit": 1600 },
      "40A": { "proto_asc": [25, 2], "bolete": [5, 3], "credit": 6500 },
      "60":  { "credit": 6500 },
      "60A": { "proto_asc": [24, 3], "bolete": [5, 4], "credit": 18000 },
      "70":  { "credit": 18000 },
      "90":  { "proto_asc": [36, 3], "bolete": [8, 5], "credit": 100000, "special": 20 }
    }
  }
}
```

### 4.2 스킬 레벨 (1→9)

```json
{
  "character": {
    "skill": {
      "2": { "proto_skill": [6, 2], "odendra": [1, 2], "credit": 1000 },
      "3": { "proto_skill": [12, 2], "odendra": [2, 2], "credit": 2700 },
      "4": { "proto_skill": [16, 2], "odendra": [1, 3], "credit": 3200 },
      "5": { "proto_skill": [21, 2], "odendra": [1, 3], "credit": 4200 },
      "6": { "proto_skill": [27, 2], "odendra": [2, 3], "credit": 5400 },
      "7": { "proto_skill": [7, 3], "odendra": [1, 3], "credit": 8200 },
      "8": { "proto_skill": [9, 3], "odendra": [1, 3], "credit": 10500 },
      "9": { "proto_skill": [18, 3], "odendra": [2, 3], "credit": 18000 }
    }
  }
}
```

### 4.3 마스터리 (1→3)

```json
{
  "character": {
    "mastery": {
      "1": { "proto_skill": [18, 3], "odendra": [3, 4], "mastery": 1, "credit": 24000, "special": 8 },
      "2": { "proto_skill": [24, 3], "odendra": [6, 4], "mastery": 2, "credit": 30000, "special": 15 },
      "3": { "/* 미확인 */" }
    }
  }
}
```

### 4.4 Talent (1→2, 개별)

```json
{
  "character": {
    "talent": {
      "talent1": {
        "1": { "proto_skill": [12, 2], "credit": 2400 },
        "2": { "proto_skill": [18, 3], "credit": 16000 }
      },
      "talent2": {
        "1": { "proto_skill": [48, 2], "credit": 10800 },
        "2": { "proto_skill": [18, 3], "credit": 16000 }
      }
    }
  }
}
```

### 4.5 BaseSkill (1→2, 개별)

```json
{
  "character": {
    "baseskill": {
      "base1": {
        "1": { "proto_skill": [6, 2], "credit": 1600 },
        "2": { "proto_skill": [12, 3], "credit": 8000 }
      },
      "base2": {
        "1": { "proto_skill": [12, 2], "credit": 3000 },
        "2": { "proto_skill": [20, 3], "credit": 20000 }
      }
    }
  }
}
```

### 4.6 Attribute (1→4)

```json
{
  "character": {
    "attribute": {
      "1": { "proto_skill": [5, 2], "credit": 1000 },
      "2": { "proto_skill": [10, 2], "credit": 1800 },
      "3": { "proto_skill": [10, 3], "credit": 6000 },
      "4": { "proto_skill": [20, 3], "credit": 12000 }
    }
  }
}
```

---

## 참고 사항

### game_id 범위

| 범위 | 카테고리 |
|------|----------|
| 51xxxxxxxx | 재료 |
| 52xxxxxxxx | 캐릭터 |
| 53xxxxxxxx | 무기 |

### 티어 시스템

Endfield는 인게임에서 티어를 표시하지 않지만, 내부적으로 tier 2~5를 사용함.

| 내부 Tier | 설명 |
|-----------|------|
| 2 | 최하위 (시작 재료) |
| 3 | 중급 |
| 4 | 상급 |
| 5 | 최상급 |

### WW vs Endfield 합성 차이

| 항목 | WW | Endfield |
|------|-----|----------|
| 합성 | 3:1 업그레이드 | **없음** |
| 재료 획득 | 합성으로 상위 티어 획득 가능 | 각 티어 직접 획득 필요 |

---

## 참고 문서

- [ID_SYSTEM.md](./ID_SYSTEM.md) - ID 체계 상세 가이드
- [GOOGLE_SHEETS_GUIDE.md](./GOOGLE_SHEETS_GUIDE.md) - 구글 시트 관리 가이드
