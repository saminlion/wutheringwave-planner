# Endfield 데이터 구조 설명

Endfield 게임 데이터를 입력하는 방법을 설명합니다.

**참고:** ID 체계에 대한 자세한 설명은 [ID_SYSTEM.md](ID_SYSTEM.md)를 참조하세요.

---

## 1. character.json

캐릭터 정보를 저장하는 파일입니다.

### 구조:
```json
{
  "캐릭터_영문명": {
    "game_id": 5206000001,           // 게임 내부 ID (10자리: 52 RR 00 NNNN)
    "display_name": "캐릭터 표시 이름",
    "element": "element_type",       // 속성 (예: fire, ice, electric 등)
    "weapon": "weapon_type",         // 무기 타입 (예: sword, gun 등)
    "icon": "아이콘 이미지 URL",
    "rarity": 6,                     // 등급 (4, 5, 6)
    "common": "common_material_name", // materials.json의 SubCategory 이름
    "forgery": "forgery_material_name", // materials.json의 SubCategory 이름
    "ascension": 5130010001,         // 돌파 재료 game_id
    "boss": 5140010001,              // 보스 재료 game_id
    "weeklyBoss": 5150010001,        // 주간 보스 재료 game_id (존재시)
    "bonus_stats": []                // 패시브 스킬 보너스 스탯 (있다면)
  }
}
```

### game_id 형식:
- **형식**: `52 RR 00 NNNN` (10자리)
- **52**: 캐릭터 카테고리
- **RR**: 등급 (`06`=6성, `05`=5성, `04`=4성)
- **00**: 고정값
- **NNNN**: 순번 (0001~9999)

**예시:**
```json
{
  "clemence": {
    "game_id": 5206000001,          // 첫 번째 6성 캐릭터
    "display_name": "Clemence",
    "element": "physical",
    "weapon": "sword",
    "icon": "https://example.com/clemence.png",
    "rarity": 6,
    "common": "circuit_core",
    "forgery": "combat_data",
    "ascension": 5130010001,
    "boss": 5140010001,
    "weeklyBoss": 5150010001,
    "bonus_stats": []
  },
  "alice": {
    "game_id": 5205000001,          // 첫 번째 5성 캐릭터
    "display_name": "Alice",
    "element": "fire",
    "weapon": "gun",
    "icon": "https://example.com/alice.png",
    "rarity": 5,
    "common": "circuit_core",
    "forgery": "combat_data",
    "ascension": 5130010002,
    "boss": 5140010002,
    "bonus_stats": []
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
    "game_id": 5306010001,           // 게임 내부 ID (10자리: 53 RR TT NNNN)
    "display_name": "무기 표시 이름",
    "rarity": 6,                     // 등급 (3, 4, 5, 6)
    "type": "weapon_type",           // 무기 타입 (sword, gun, bow, staff 등)
    "icon": "아이콘 이미지 URL",
    "common": "common_material_name",   // materials.json의 SubCategory 이름
    "forgery": "forgery_material_name"  // materials.json의 SubCategory 이름
  }
}
```

### game_id 형식:
- **형식**: `53 RR TT NNNN` (10자리)
- **53**: 무기 카테고리
- **RR**: 등급 (`06`=6성, `05`=5성, `04`=4성, `03`=3성)
- **TT**: 무기 타입 (`01`=Sword, `02`=Gun, `03`=Bow, `04`=Staff 등)
- **NNNN**: 순번 (0001~9999)

**예시:**
```json
{
  "brilliant_sword": {
    "game_id": 5306010001,          // 첫 번째 6성 Sword
    "display_name": "Brilliant Sword",
    "rarity": 6,
    "type": "sword",
    "icon": "https://example.com/sword.png",
    "common": "circuit_core",
    "forgery": "combat_data"
  },
  "fire_gun": {
    "game_id": 5305020001,          // 첫 번째 5성 Gun
    "display_name": "Fire Gun",
    "rarity": 5,
    "type": "gun",
    "icon": "https://example.com/gun.png",
    "common": "metal_plate",
    "forgery": "weapon_blueprint"
  },
  "basic_bow": {
    "game_id": 5303030001,          // 첫 번째 3성 Bow
    "display_name": "Basic Bow",
    "rarity": 3,
    "type": "bow",
    "icon": "https://example.com/bow.png",
    "common": "circuit_core",
    "forgery": "combat_data"
  }
}
```

---

## 3. materials.json

모든 재료 정보를 저장하는 파일입니다. **카테고리별로 구분**됩니다.

**⚠️ 주의:** 재료 카테고리 코드(CC)는 게임 출시 후 실제 시스템에 맞춰 조정될 수 있습니다.

### 구조:
```json
{
  "카테고리": {
    "재료_영문명": {
      "game_id": 5110010001,      // 게임 내부 ID (10자리: 51 CC SS NNNN)
      "icon": "아이콘 이미지 URL",
      "label": "재료 표시 이름",
      "Category": "카테고리",      // credit, common, forgery, ascension, boss, weeklyBoss, player_exp, weapon_exp
      "SubCategory": "하위카테고리명", // character.json과 weapon.json에서 참조하는 이름
      "rarity": 2                  // 등급 (2~5)
    }
  }
}
```

### game_id 형식:
- **형식**: `51 CC SS NNNN` (10자리)
- **51**: 재료 카테고리
- **CC**: 재료 종류 (`00`=Credit, `10`=Common-Character, `11`=Common-Weapon, `20`=Forgery-Character, `21`=Forgery-Weapon, `30`=Ascension-Character, `31`=Ascension-Weapon, `40`=Boss, `50`=Weekly Boss, `60`=Player EXP, `70`=Weapon EXP)
- **SS**: 하위 분류 (재료 그룹, `01`~`99`)
- **NNNN**: 순번 (0001~9999)

### 카테고리 설명:

#### 3.1 credit (게임 화폐)
```json
{
  "credit": {
    "credit": {
      "game_id": 5100000001,      // 51 00 00 0001
      "icon": "https://example.com/credit.png",
      "label": "Credit",
      "Category": "credit",
      "SubCategory": "credit",
      "rarity": 2
    }
  }
}
```

#### 3.2 common (일반 재료 - 캐릭터용)
**참고:** Endfield는 레시피 기반 합성이므로 WW처럼 티어 구분이 없습니다. 각 재료는 독립적입니다.

```json
{
  "common": {
    "circuit_core_a": {
      "game_id": 5110010001,      // 51 10 01 0001 (Common-Character, 그룹01)
      "icon": "https://example.com/circuit_a.png",
      "label": "Circuit Core Type A",
      "Category": "common",
      "SubCategory": "circuit_core",  // ← character.json의 "common" 필드와 매칭
      "rarity": 2
    },
    "circuit_core_b": {
      "game_id": 5110010002,      // 51 10 01 0002
      "icon": "https://example.com/circuit_b.png",
      "label": "Circuit Core Type B",
      "Category": "common",
      "SubCategory": "circuit_core",
      "rarity": 3
    },
    "advanced_circuit_core": {
      "game_id": 5110010003,      // 51 10 01 0003
      "icon": "https://example.com/circuit_adv.png",
      "label": "Advanced Circuit Core",
      "Category": "common",
      "SubCategory": "circuit_core",
      "rarity": 4
    },
    "crystal_shard": {
      "game_id": 5110020001,      // 51 10 02 0001 (Common-Character, 그룹02)
      "icon": "https://example.com/crystal.png",
      "label": "Crystal Shard",
      "Category": "common",
      "SubCategory": "crystal_shard",
      "rarity": 2
    }
  }
}
```

#### 3.3 forgery (스킬 재료 - 4단계 티어)
```json
{
  "forgery": {
    "lf_combat_data": {
      "game_id": 5120010001,
      "icon": "https://example.com/lf_combat.png",
      "label": "LF Combat Data",
      "Category": "forgery",
      "SubCategory": "combat_data",  // ← character.json의 "forgery" 필드와 매칭
      "rarity": 2
    },
    "mf_combat_data": {
      "game_id": 5120010002,
      "icon": "https://example.com/mf_combat.png",
      "label": "MF Combat Data",
      "Category": "forgery",
      "SubCategory": "combat_data",
      "rarity": 3
    },
    "hf_combat_data": {
      "game_id": 5120010003,
      "icon": "https://example.com/hf_combat.png",
      "label": "HF Combat Data",
      "Category": "forgery",
      "SubCategory": "combat_data",
      "rarity": 4
    },
    "ff_combat_data": {
      "game_id": 5120010004,
      "icon": "https://example.com/ff_combat.png",
      "label": "FF Combat Data",
      "Category": "forgery",
      "SubCategory": "combat_data",
      "rarity": 5
    }
  }
}
```

#### 3.4 ascension (돌파 전용 재료)
```json
{
  "ascension": {
    "crystal_fragment": {
      "game_id": 5130010001,
      "icon": "https://example.com/crystal.png",
      "label": "Crystal Fragment",
      "Category": "ascension",
      "SubCategory": "crystal_fragment",
      "rarity": 4
    }
  }
}
```

#### 3.5 boss (보스 재료)
```json
{
  "boss": {
    "boss_core": {
      "game_id": 5140010001,
      "icon": "https://example.com/boss_core.png",
      "label": "Boss Core",
      "Category": "boss",
      "SubCategory": "boss_core",
      "rarity": 4
    }
  }
}
```

#### 3.6 weeklyBoss (주간 보스 재료)
```json
{
  "weeklyBoss": {
    "ancient_relic": {
      "game_id": 5150010001,
      "icon": "https://example.com/relic.png",
      "label": "Ancient Relic",
      "Category": "weeklyBoss",
      "SubCategory": "ancient_relic",
      "rarity": 4
    }
  }
}
```

#### 3.7 player_exp (캐릭터 경험치 아이템)
```json
{
  "player_exp": {
    "player_exp_small": {
      "game_id": 5160000001,
      "icon": "https://example.com/exp_s.png",
      "label": "Player EXP (Small)",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "rarity": 2,
      "value": 1000  // ← 경험치 값
    },
    "player_exp_medium": {
      "game_id": 5160000002,
      "icon": "https://example.com/exp_m.png",
      "label": "Player EXP (Medium)",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "rarity": 3,
      "value": 3000
    },
    "player_exp_large": {
      "game_id": 5160000003,
      "icon": "https://example.com/exp_l.png",
      "label": "Player EXP (Large)",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "rarity": 4,
      "value": 8000
    },
    "player_exp_extra_large": {
      "game_id": 5160000004,
      "icon": "https://example.com/exp_xl.png",
      "label": "Player EXP (Extra Large)",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "rarity": 5,
      "value": 20000
    }
  }
}
```

#### 3.8 weapon_exp (무기 경험치 아이템)
```json
{
  "weapon_exp": {
    "weapon_exp_small": {
      "game_id": 5170000001,
      "icon": "https://example.com/weapon_exp_s.png",
      "label": "Weapon EXP (Small)",
      "Category": "weapon_exp",
      "SubCategory": "weapon_exp",
      "rarity": 2,
      "value": 1000
    }
    // ... 나머지도 player_exp와 동일한 구조
  }
}
```

---

## 4. costs.json

레벨업과 스킬업에 필요한 재료 비용을 정의합니다.

### 4.1 캐릭터 레벨업 비용

```json
{
  "character": {
    "level": {
      "20": {                      // 1 → 20 레벨까지 필요한 총량
        "credit": 5000,            // 크레딧
        "common": [4, 1],          // [개수, 티어] → 1티어 재료 4개
        "player_exp": 12500        // 경험치
      },
      "20A": {                     // 20레벨 돌파에 필요한 재료
        "credit": 10000,
        "common": [4, 2],          // 2티어 재료 4개
        "ascension": 3             // 돌파 전용 재료 3개
      },
      "40": {
        "credit": 15000,
        "common": [4, 2],
        "player_exp": 52500
      },
      "40A": {
        "credit": 20000,
        "common": [4, 3],
        "ascension": 6,
        "boss": 4                  // 보스 재료 4개
      },
      "60": {
        "credit": 40000,
        "common": [4, 3],
        "player_exp": 172500
      },
      "60A": {
        "credit": 60000,
        "common": [4, 4],
        "ascension": 9,
        "boss": 8
      },
      "80": {
        "credit": 80000,
        "common": [4, 4],
        "player_exp": 420000
      },
      "80A": {
        "credit": 100000,
        "common": [8, 4],
        "ascension": 12,
        "boss": 12
      },
      "90": {
        "credit": 120000,
        "common": [8, 4],
        "player_exp": 690000
      }
    }
  }
}
```

### 4.2 캐릭터 스킬 레벨업 비용

```json
{
  "character": {
    "skill": {
      "2": {                       // 스킬 1 → 2 레벨업 비용
        "credit": 10000,
        "forgery": [3, 1]          // 1티어 스킬 재료 3개
      },
      "3": {
        "credit": 15000,
        "forgery": [3, 2]
      },
      "4": {
        "credit": 20000,
        "forgery": [3, 2],
        "weeklyBoss": 1            // 주간 보스 재료 1개
      },
      "5": {
        "credit": 40000,
        "forgery": [3, 3]
      },
      "6": {
        "credit": 80000,
        "forgery": [3, 3],
        "weeklyBoss": 1
      },
      "7": {
        "credit": 120000,
        "forgery": [3, 4]
      },
      "8": {
        "credit": 160000,
        "forgery": [3, 4],
        "weeklyBoss": 2
      },
      "9": {
        "credit": 200000,
        "forgery": [5, 4],
        "weeklyBoss": 2
      },
      "10": {
        "credit": 240000,
        "forgery": [5, 4],
        "weeklyBoss": 2
      }
    }
  }
}
```

### 4.3 패시브 스킬 비용 (있다면)

```json
{
  "character": {
    "passive": {
      "skill": {
        "1": {
          "credit": 10000,
          "forgery": [3, 1],
          "weeklyBoss": 1
        },
        "2": {
          "credit": 20000,
          "forgery": [3, 2],
          "weeklyBoss": 1
        }
      },
      "bonusStat": {
        "1": {
          "credit": 20000,
          "forgery": [3, 2]
        },
        "2": {
          "credit": 40000,
          "forgery": [3, 3]
        }
      }
    }
  }
}
```

### 4.4 무기 레벨업 비용

```json
{
  "weapon": {
    "level": {
      "20": {
        "credit": 2000,
        "common": [2, 1],
        "weapon_exp": 6250
      },
      "20A": {
        "credit": 4000,
        "common": [3, 2],
        "forgery": [2, 1]          // 무기는 forgery 재료도 사용
      },
      "40": {
        "credit": 8000,
        "common": [2, 2],
        "weapon_exp": 26250
      },
      "40A": {
        "credit": 10000,
        "common": [3, 3],
        "forgery": [2, 2]
      },
      "60": {
        "credit": 20000,
        "common": [2, 3],
        "weapon_exp": 86250
      },
      "60A": {
        "credit": 30000,
        "common": [3, 4],
        "forgery": [2, 3]
      },
      "80": {
        "credit": 40000,
        "common": [2, 4],
        "weapon_exp": 210000
      },
      "80A": {
        "credit": 50000,
        "common": [5, 4],
        "forgery": [2, 4]
      },
      "90": {
        "credit": 60000,
        "common": [4, 4],
        "weapon_exp": 345000
      }
    }
  }
}
```

---

## 5. synthesisRecipes.json

**Endfield의 특별한 합성 시스템** - WW와 다르게 레시피 방식입니다.

### 구조:
```json
{
  "레시피_이름": {
    "result": {                    // 합성 결과물
      "game_id": 5130010001,         // 결과 재료의 game_id
      "quantity": 1                // 생성 개수
    },
    "ingredients": [               // 필요한 재료들
      {
        "game_id": 51101001,       // 재료 1의 game_id
        "quantity": 1              // 개수
      },
      {
        "game_id": 5120010001,       // 재료 2의 game_id
        "quantity": 3
      },
      {
        "game_id": 51101002,       // 재료 3의 game_id
        "quantity": 1
      }
    ]
  }
}
```

### 레시피_이름 작성 규칙:
- **용도**: 합성 레시피를 구분하기 위한 고유 식별자 (내부 키 값)
- **표시**: 게임 내에서 사용자에게 보이지 않음, 프로그램 내부 관리용
- **작성 규칙**:
  - 소문자 영문자와 언더스코어(_)만 사용
  - 공백 사용 금지
  - 합성 결과물을 설명하는 이름 권장
  - 명확하고 구별 가능한 이름 사용
- **예시**:
  - `crystal_fragment_craft` - 크리스탈 파편 제작
  - `advanced_core_synthesis` - 고급 코어 합성
  - `weekly_boss_material_mix` - 주간 보스 재료 조합
  - `tier2_common_upgrade` - 2티어 일반 재료 업그레이드

### 예시:
```json
{
  "crystal_synthesis": {
    "result": {
      "game_id": 5130010001,         // Crystal Fragment 1개 생성
      "quantity": 1
    },
    "ingredients": [
      {
        "game_id": 51101001,       // LF Circuit Core 1개
        "quantity": 1
      },
      {
        "game_id": 5120010001,       // LF Combat Data 3개
        "quantity": 3
      },
      {
        "game_id": 51101002,       // MF Circuit Core 1개
        "quantity": 1
      }
    ]
  },
  "advanced_synthesis": {
    "result": {
      "game_id": 5140010001,         // Boss Core 1개 생성
      "quantity": 1
    },
    "ingredients": [
      {
        "game_id": 5130010001,       // Crystal Fragment 2개
        "quantity": 2
      },
      {
        "game_id": 5120010004,       // FF Combat Data 5개
        "quantity": 5
      }
    ]
  }
}
```

---

## 참고 사항

### game_id 범위:
- **51xxxxxx**: 재료 (materials)
  - 510xxxxx: 크레딧
  - 511xxxxx: common 재료
  - 512xxxxx: forgery 재료
  - 513xxxxx: ascension 재료
  - 514xxxxx: boss 재료
  - 515xxxxx: weeklyBoss 재료
  - 516xxxxx: player_exp
  - 517xxxxx: weapon_exp
- **52xxxxxx**: 캐릭터 (character)
- **53xxxxxx**: 무기 (weapon)

### 티어 시스템:
- **Tier 1 (LF)**: Low Frequency - 낮은 등급
- **Tier 2 (MF)**: Medium Frequency - 중간 등급
- **Tier 3 (HF)**: High Frequency - 높은 등급
- **Tier 4 (FF)**: Full Frequency - 최고 등급

### WW vs Endfield 합성 차이:
- **WW**: 같은 재료 3개 → 상위 티어 1개 (예: LF 3개 → MF 1개)
- **Endfield**: 레시피 기반 (예: LF 1개 + MF 3개 + HF 1개 → 특수 재료 1개)
