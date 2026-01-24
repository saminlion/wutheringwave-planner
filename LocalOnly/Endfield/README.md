# Endfield 플래너 구현 가이드

이 문서는 Endfield 게임의 플래너 기능을 구현하기 위한 정보를 정리합니다.

---

## 1. 기존 WW 구조와의 비교

### ID 체계 비교

| 항목 | Wuthering Waves | Endfield |
|------|-----------------|----------|
| 캐릭터 | 42XXXXXXXX (10자리) | 52RRZZNNNN (10자리) |
| 무기 | 43XXXXXX (8자리) | 53RRTTNNNN (10자리) |
| 재료 | 41XXXXXX (8자리) | 51CCSSNNNN (10자리) |

**Endfield ID 상세** (ID_SYSTEM.md 참조):
- 캐릭터: `52` + `RR`(등급) + `00`(고정) + `NNNN`(순번)
- 무기: `53` + `RR`(등급) + `TT`(무기타입) + `NNNN`(순번)
- 재료: `51` + `CC`(카테고리) + `SS`(서브카테고리) + `NNNN`(순번)

### 등급 체계

| 항목 | Wuthering Waves | Endfield |
|------|-----------------|----------|
| 캐릭터 | 4성, 5성 | 4성, 5성, 6성 |
| 무기 | 3성, 4성, 5성 | 3성, 4성, 5성, 6성 |

### 무기 타입

| Wuthering Waves | Endfield |
|-----------------|----------|
| Broadblade, Sword, Pistols, Gauntlets, Rectifier | 한손검, 양손검, 장병기, 아츠, 권총 (5종류) |

무기 타입 코드 (TT):
- `01`: 한손검
- `02`: 양손검
- `03`: 장병기
- `04`: 아츠
- `05`: 권총

---

## 2. 캐릭터 레벨 시스템

### 레벨 범위
- 최소: 1
- 최대: 90

### 정예화 (Ascension) - 7단계

WW와 다른 핵심 차이점: **2, 4, 6단계는 크레딧(화폐)만 사용**

| 단계 | 조건 | 해금 레벨 | 필요 재료 |
|------|------|----------|----------|
| 1 | 정예화 시작 | 1→40 | 특수 재료 + 크레딧 |
| 2 | Lv.40 도달 | - | **크레딧만** |
| 3 | - | 40→60 | 특수 재료 + 크레딧 |
| 4 | Lv.60 도달 | - | **크레딧만** |
| 5 | - | 60→80 | 특수 재료 + 크레딧 |
| 6 | Lv.80 도달 | - | **크레딧만** |
| 7 | - | 80→90 | 특수 재료 + 크레딧 |

**costs.json 설계 방향**:
```json
{
  "character": {
    "level": {
      "40": { "player_exp": 12500 },
      "40A1": { "credit": 10000, "common": [4, 2], "ascension": 3 },
      "40A2": { "credit": 5000 },
      "60": { "player_exp": 52500 },
      "60A3": { "credit": 20000, "common": [4, 3], "ascension": 6, "boss": 4 },
      "60A4": { "credit": 10000 },
      ...
    }
  }
}
```

---

## 3. 스킬 시스템

### WW vs Endfield 스킬 구조

| WW | Endfield | 매핑 제안 |
|----|----------|----------|
| activeSkills (5개) | 기초 재능 (4개) | activeSkills |
| passiveSkills.skill (2개) | 특수 단계 (2개) | passiveSkills.special |
| passiveSkills.bonusStat (8개) | 인프라 스킬 (2개) | passiveSkills.infra |

### 스킬 레벨
- 기초 재능: 1~10 (마스터리 포함하면 8단계 확인 필요)
- 특수 단계: 해금/미해금
- 인프라 스킬: 해금/미해금

### characterSettings 구조 제안
```javascript
{
  characterId: {
    currentLevel: "1",
    targetLevel: "90",
    activeSkills: {
      basic_talent_1: { current: 1, target: 10 },
      basic_talent_2: { current: 1, target: 10 },
      basic_talent_3: { current: 1, target: 10 },
      basic_talent_4: { current: 1, target: 10 }
    },
    passiveSkills: {
      special_1: false,
      special_2: false,
      infra_1: false,
      infra_2: false
    }
  }
}
```

---

## 4. 재료 시스템

### 카테고리 비교

| 코드 | WW 카테고리 | Endfield 카테고리 |
|------|-------------|-------------------|
| `00` | credit | Credit (화폐) |
| `10` | common | Common - 캐릭터용 (필드 적 처치) |
| `11` | - | Common - 무기용 |
| `20` | forgery | Forgery - 캐릭터 스킬용 (던전) |
| `21` | - | Forgery - 무기 돌파용 (던전) |
| `30` | ascension | Ascension - 캐릭터용 (필드 식물류) |
| `31` | - | Ascension - 무기용 |
| `40` | boss | Boss (보스) |
| `50` | weeklyBoss | Weekly Boss (존재 여부 미확인) |
| `60` | player_exp | Player EXP |
| `70` | weapon_exp | Weapon EXP |

### 핵심 차이점
- Endfield는 캐릭터용/무기용 재료가 분리됨
- Forgery 재료가 용도별로 세분화됨:
  - 스킬 레벨 재료
  - 캐릭터 돌파 재료
  - 무기 돌파 재료

### 합성 시스템 (확인 필요)

| WW | Endfield |
|----|----------|
| 3:1 티어 업그레이드 | **미확정** - 티어 기반 또는 레시피 기반 |

**⚠️ 게임 내에서 확인 필요:**
- 티어 업그레이드 존재 여부 (저급 재료 → 고급 재료)
- 레시피 합성만 존재할 가능성
- 합성 자체가 없을 가능성

---

## 5. 던전 시스템 (이성 소모)

### 경험치 던전 (캐릭터)
| 레벨 | 이성 | 드랍 (4티어, 3티어, 2티어) |
|------|------|---------------------------|
| 1 | 40 | 4, 2, 3 |
| 2 | ? | 6, 9, 4 |
| 3 | ? | 9, 9, 4 |
| 4 | ? | 13, 7, 2 |
| 5 | ? | 17, -, - |

### 무기 경험치 던전
| 레벨 | 이성 | 드랍 (4티어, 3티어, 2티어) |
|------|------|---------------------------|
| 1 | ? | 4, 6, 7 |
| 2 | ? | 6, 9, 4 |
| 3 | ? | 9, 9, 1 |
| 4 | ? | 12, 16, 7 |
| 5 | ? | 16, 10, - |

### 화폐 던전
| 레벨 | 이성 | 드랍 (K) |
|------|------|----------|
| 1 | ? | 8.5K |
| 2 | ? | 13.5K |
| 3 | ? | 19.5K |
| 4 | ? | 27.5K |
| 5 | ? | 34K |

### Forgery 던전 (스킬 재료)
| 레벨 | 이성 | 드랍 (3티어 or 4티어) |
|------|------|----------------------|
| 1 | 40 | 21 (3티어) |
| 2 | 50 | 35 (3티어) |
| 3 | 60 | 50 (3티어) or 10 (4티어) |
| 4 | 70 | 69 (3티어) or 14 (4티어) |
| 5 | 80 | 85 (3티어) or 17 (4티어) |

---

## 6. 구현 계획

### Phase 의존성 관계

```
┌─────────────────────────────────────────────────────────────┐
│                    코드 작성 (데이터 없이 가능)                │
│                                                             │
│  Phase 4 ──► Phase 5 ──► Phase 6 ──► Phase 7 ──► Phase 8/9  │
│  (플러그인)   (서비스)    (스토어)    (UI)       (i18n/라우팅) │
│                 │                                           │
│                 ▼                                           │
│         [구조 확인 필요]                                      │
│         - 합성 시스템 방식?                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    테스트 (데이터 필요)                       │
│                                                             │
│  Phase 1~3 (데이터 입력) ──────────────► Phase 10 (테스트)   │
└─────────────────────────────────────────────────────────────┘

※ Phase 1~3 데이터는 병렬로 천천히 준비
※ 코드 작성 완료 후 데이터 넣고 테스트
※ 스킬 비용: 등급 무관 확정 (WW 방식 동일)
```

**확정된 사항:**
- ✅ 스킬 비용: 등급(6성/5성/4성) 무관, 모든 캐릭터 동일

**병렬 진행 가능:**
| Phase | 데이터 없이 가능? | 설명 |
|-------|------------------|------|
| 1~3 | - | 데이터 입력 (시간 소요) |
| 4 | ✅ 가능 | 플러그인 구조/인터페이스만 정의 |
| 5 | ⚠️ 부분 가능 | 기본 로직 작성 가능, **합성 시스템 확인 필요** |
| 6 | ✅ 가능 | 스토어 구조, gameStore, userProfileStore |
| 7 | ✅ 가능 | UI 구조/분기 로직 작성 가능, 테스트만 데이터 필요 |
| 8 | ⚠️ 부분 가능 | UI 키만 추가, 게임 데이터 번역은 나중에 |
| 9 | ✅ 가능 | 라우팅 구조는 데이터 무관 |
| 10 | ❌ 불가 | 테스트는 데이터 필수 |

**⚠️ 구조 확인 시점 (게임에서 확인 후 결정):**
| 항목 | 영향 범위 | 확인 내용 |
|------|----------|----------|
| 합성 시스템 방식 | Phase 1-2, 5 | 티어 기반 / 레시피 기반 / 없음 |

**권장 진행 순서:**
1. **즉시 진행**: Phase 4 → 5 → 6 → 7 → 8 → 9 (합성 로직만 후순위)
2. **합성 확인 후**: Phase 5 합성 로직 완성
3. **데이터 준비되면**: Phase 1~3 → 10 (데이터 입력 + 테스트)

---

### Phase 1: 기반 데이터 구조 (src/games/endfield/data/)

#### 1-1. 재료 데이터 구축
- [ ] `materials.json` - 전체 재료 카탈로그
  - [ ] Credit (화폐) - 5100000001
  - [ ] Common 재료 (캐릭터용) - 5110XXXXXX
  - [ ] Common 재료 (무기용) - 5111XXXXXX
  - [ ] Forgery 재료 (스킬용) - 5120XXXXXX
  - [ ] Forgery 재료 (무기돌파용) - 5121XXXXXX
  - [ ] Ascension 재료 (캐릭터용) - 5130XXXXXX
  - [ ] Ascension 재료 (무기용) - 5131XXXXXX
  - [ ] Boss 재료 - 5140XXXXXX
  - [ ] Weekly Boss 재료 - 5150XXXXXX (존재시)
  - [ ] Player EXP - 5160XXXXXX
  - [ ] Weapon EXP - 5170XXXXXX

**WW 참조**: `src/data/inventoryItem.json` 구조 복사

#### 1-2. 합성 시스템 (후순위 - 확인 필요)

**⚠️ Endfield 합성 시스템은 WW와 다를 수 있음:**
- WW: 3:1 티어 업그레이드 (예: 저티어 3개 → 고티어 1개)
- Endfield: 레시피 기반 합성 가능성 (전부 레시피로 처리될 수 있음)

**옵션 A: 티어 기반 (WW 방식)**
- [ ] `tieredMaterials.js` - 합성 가능한 티어 재료 그룹

**옵션 B: 레시피 기반 (Endfield 가능성)**
- [ ] `synthesisRecipes.js` - 레시피 기반 합성 규칙
  ```javascript
  // 예시 구조
  {
    "output_material_id": {
      "inputs": [
        { "material_id": "5110010001", "quantity": 3 },
        { "material_id": "5110020001", "quantity": 1 }
      ],
      "output_quantity": 1
    }
  }
  ```

**결정 시점**: 게임 내 합성 시스템 확인 후 결정

---

### Phase 2: 캐릭터/무기 데이터 (src/games/endfield/data/)

#### 2-1. 캐릭터 데이터
- [ ] `characters.json` - 캐릭터 메타데이터
  ```json
  {
    "game_id": "5206000001",
    "name": "캐릭터명",
    "display_name": "표시명",
    "rarity": 6,
    "element": "...",
    "weapon_type": "한손검",
    "icon": "URL",
    "common": "서브카테고리명",
    "ascension": "서브카테고리명",
    "boss": "서브카테고리명",
    "weeklyBoss": "서브카테고리명",
    "forgery": "서브카테고리명"
  }
  ```

**WW 참조**: `src/data/character.json`

#### 2-2. 무기 데이터
- [ ] `weapons.json` - 무기 메타데이터
  ```json
  {
    "game_id": "5306010001",
    "name": "무기명",
    "display_name": "표시명",
    "rarity": 6,
    "type": "한손검",
    "icon": "URL",
    "common": "서브카테고리명",
    "forgery": "서브카테고리명"
  }
  ```

**WW 참조**: `src/data/weapon.json`

---

### Phase 3: 비용 데이터 (src/games/endfield/data/)

#### 3-1. costs.json 7단계 정예화 구조
- [ ] 캐릭터 레벨 비용
  - [ ] 레벨업 경험치 (1→40, 40→60, 60→80, 80→90)
  - [ ] 정예화 1단계 (1→40 해금): 특수재료 + 크레딧
  - [ ] 정예화 2단계 (Lv.40 도달): 크레딧만
  - [ ] 정예화 3단계 (40→60 해금): 특수재료 + 크레딧
  - [ ] 정예화 4단계 (Lv.60 도달): 크레딧만
  - [ ] 정예화 5단계 (60→80 해금): 특수재료 + 크레딧
  - [ ] 정예화 6단계 (Lv.80 도달): 크레딧만
  - [ ] 정예화 7단계 (80→90 해금): 특수재료 + 크레딧

**costs.json 키 설계**:
```json
{
  "character": {
    "level": {
      "40": { "player_exp": 12500 },
      "40A1": { "credit": 10000, "common": [4, 2], "ascension": 3 },
      "40A2": { "credit": 5000 },
      "60": { "player_exp": 52500 },
      "60A3": { "credit": 20000, "common": [4, 3], "ascension": 6, "boss": 4 },
      "60A4": { "credit": 10000 },
      "80": { "player_exp": 172500 },
      "80A5": { "credit": 60000, "common": [4, 4], "ascension": 9, "boss": 8 },
      "80A6": { "credit": 30000 },
      "90": { "player_exp": 420000 },
      "90A7": { "credit": 100000, "common": [8, 4], "ascension": 12, "boss": 12 }
    }
  }
}
```

#### 3-2. 스킬 비용 (✅ 등급 무관 확정)

**확정:** 스킬 비용은 캐릭터 등급(6성/5성/4성)에 관계없이 동일
- WW와 동일한 방식으로 구현 가능

**costs.json 스킬 구조:**
```json
{
  "character": {
    "skill": {
      "2": { "credit": 10000, "forgery": [3, 1] },
      "3": { "credit": 15000, "forgery": [3, 2] },
      "4": { "credit": 20000, "forgery": [3, 2], "weeklyBoss": 1 },
      "5": { "credit": 40000, "forgery": [3, 3] },
      "6": { "credit": 80000, "forgery": [3, 3], "weeklyBoss": 1 },
      "7": { "credit": 120000, "forgery": [3, 4] },
      "8": { "credit": 160000, "forgery": [3, 4], "weeklyBoss": 2 },
      "9": { "credit": 200000, "forgery": [5, 4], "weeklyBoss": 2 },
      "10": { "credit": 240000, "forgery": [5, 4], "weeklyBoss": 2 }
    }
  }
}
```

- [ ] 기초 재능 1~10 레벨 비용
- [ ] 특수 단계 해금 비용
- [ ] 인프라 스킬 해금 비용

#### 3-3. 무기 비용
- [ ] 무기 레벨업 비용 (경험치)
- [ ] 무기 돌파 비용

**WW 참조**: `src/data/costs.json`

---

### Phase 4: 게임 플러그인 구조 (src/games/)

#### 4-1. 플러그인 인터페이스 정의
- [ ] `src/games/interface.js` - 공통 인터페이스 정의
  ```javascript
  // 모든 게임 플러그인이 구현해야 할 인터페이스
  {
    id: string,
    name: string,
    config: GameConfig,
    materials: MaterialDatabase,
    costs: CostTable,
    data: { characters, weapons }
  }
  ```

#### 4-2. WW 플러그인 리팩토링
- [ ] `src/games/wutheringwave/index.js` - 플러그인 형태로 재구성
- [ ] 기존 `src/data/` 파일들을 `src/games/wutheringwave/data/`로 이동 고려

#### 4-3. Endfield 플러그인 완성
- [x] `src/games/endfield/config.js` - 게임 설정
- [x] `src/games/endfield/index.js` - 플러그인 엔트리
- [ ] `src/games/endfield/data/index.js` - 데이터 export

#### 4-4. 게임 레지스트리
- [ ] `src/games/index.js` - 게임 플러그인 등록/조회
  ```javascript
  import wutheringwave from './wutheringwave';
  import endfield from './endfield';

  export const games = { wutheringwave, endfield };
  export const getGame = (gameId) => games[gameId];
  ```

---

### Phase 5: 서비스 레이어 수정 (src/services/)

#### 5-1. materialHelper 게임별 분기
- [ ] `src/services/materialHelper/index.js`
  - [ ] 현재 게임 ID 기반으로 적절한 데이터 로드
  - [ ] `getGameMaterials(gameId)` 함수 추가
  - [ ] `getGameCosts(gameId)` 함수 추가

#### 5-2. 정예화 계산 로직 분기
- [ ] `src/services/materialHelper/character.js`
  - [ ] WW: 기존 20A, 40A, ... 방식
  - [ ] Endfield: 40A1, 40A2, 60A3, 60A4, ... 방식
  - [ ] `calculateAscensionMaterials(gameId, fromLevel, toLevel)` 수정

#### 5-3. 합성 로직 분기 (후순위 - 1-2 확정 후)
- [ ] `src/services/materialHelper/synthesis.js`
  - [ ] WW: 3:1 티어 업그레이드 (기존 유지)
  - [ ] Endfield: 합성 시스템 확인 후 구현
    - 옵션 A: 티어 기반이면 WW 로직 재사용
    - 옵션 B: 레시피 기반이면 신규 로직 필요
  - [ ] `performSynthesis(gameId, materials, inventory)` 수정

#### 5-4. 레벨 포맷 유틸리티
- [ ] `src/services/levelUtils.js` (신규)
  - [ ] `parseLevel(levelStr, gameId)` - "40A2" → { level: 40, ascension: 2 }
  - [ ] `formatLevel(level, ascension, gameId)` - 레벨 문자열 생성
  - [ ] `getLevelRange(gameId)` - 사용 가능한 레벨 목록

---

### Phase 6: 스토어 수정 (src/store/)

#### 6-1. planner.js 멀티게임 지원
- [ ] `currentGameId` 동적 변경 지원
- [ ] 게임별 localStorage 키 분리 (이미 구현됨)
- [ ] `switchGame(gameId)` 액션 추가

#### 6-2. inventory.js 멀티게임 지원
- [ ] `hydrate(gameId)` 이미 구현됨 - 확인
- [ ] 게임 전환 시 데이터 로드 확인

#### 6-3. 신규: gameStore.js
- [ ] 현재 선택된 게임 상태 관리
- [ ] 게임 목록 조회
- [ ] 게임 전환 이벤트

#### 6-4. 신규: userProfileStore.js (사용자 진행도 설정)

**⭐ 공통 기능**: WW + Endfield 모두 적용

사용자가 자신의 던전 해금 상태에 맞춰 설정하는 기능

- [ ] 던전 레벨 설정 (게임별 구조)
게임별로 던전 카테고리가 다르므로 각 게임 config에 던전 목록을 정의하고, 공통 UI/로직에서 사용하는 방식으로 구현

  ```javascript
  // Endfield 예시
  {
    gameId: 'endfield',
    dungeonLevels: {
      player_exp: 3,        // 경험치 던전 3레벨까지 해금
      weapon_exp: 2,        // 무기 경험치 던전 2레벨까지 해금
      credit: 5,            // 화폐 던전 5레벨까지 해금
      forgery_skill: 4,     // 스킬 재료 던전 4레벨까지 해금
      forgery_ascension: 3, // 돌파 재료 던전 3레벨까지 해금
    }
  }

  // WW 예시
  {
    gameId: 'wutheringwave',
    dungeonLevels: {
      player_exp: 6,        // 경험치 던전 (각성 시뮬레이션)
      weapon_exp: 6,        // 무기 경험치 던전
      credit: 6,            // 화폐 던전 (은파 저장고)
      forgery: 6,           // 단조 던전 (포지리 챌린지)
      boss: 5,              // 에코 보스 (선택 가능 시)
    }
  }
  ```

- [ ] 스테미너 계산 연동
  - 설정된 던전 레벨에 따른 드랍량/이성 효율 계산
  - 예: 경험치 던전 3레벨 = 이성 60당 (9, 9, 4) 드랍

- [ ] 파밍 일정 계산
  - 일일 스테미너 한도 (기본 240)
  - 필요 재료 ÷ 던전 효율 = 필요 일수
  - 카테고리별 파밍 일정 표시

- [ ] localStorage 저장
  - 키: `wwplanner_profile_${gameId}`

**UI 연동 (Phase 7)**:
- [ ] Settings 또는 별도 "내 진행도" 페이지
- [ ] 던전 레벨 선택 드롭다운/슬라이더
- [ ] 파밍 일정 표시 컴포넌트

---

### Phase 7: UI 컴포넌트 수정

#### 7-1. HomeView 게임 선택
- [ ] `src/views/HomeView.vue`
  - [ ] 게임 선택 UI 추가 (카드 또는 드롭다운)
  - [ ] 선택한 게임으로 스토어 초기화
  - [ ] 게임별 로고/테마 적용

#### 7-2. CharacterDialog 게임별 분기
- [ ] `src/components/character/CharacterDialog.vue`
  - [ ] WW: activeSkills 5개 + passiveSkills (skill 2개, bonusStat 8개)
  - [ ] Endfield: 기초재능 4개 + 특수단계 2개 + 인프라 2개
  - [ ] 게임별 스킬 폼 필드 동적 생성

#### 7-3. WeaponDialog 게임별 분기
- [ ] `src/components/weapon/WeaponDialog.vue`
  - [ ] 무기 타입 표시 (게임별 상이)
  - [ ] 무기 돌파 단계 (WW vs Endfield 차이)

#### 7-4. PlannerView 게임별 분기
- [ ] `src/views/PlannerView.vue`
  - [ ] goal.id prefix로 게임 판별 (42=WW캐릭, 52=EF캐릭 등)
  - [ ] 또는 goal에 gameId 필드 추가
  - [ ] 재료 카테고리 표시 (게임별 상이)

#### 7-5. InventoryView 게임별 분기
- [ ] `src/views/InventoryView.vue`
  - [ ] 현재 게임의 재료만 표시
  - [ ] 재료 카테고리 정렬 (게임별)

#### 7-6. 게임 전환 컴포넌트
- [ ] `src/components/common/GameSelector.vue` (신규)
  - [ ] 헤더 또는 사이드바에 배치
  - [ ] 게임 아이콘/이름 표시
  - [ ] 전환 시 스토어 재초기화

#### 7-7. 사용자 진행도 설정 UI

**⭐ 공통 기능**: WW + Endfield 모두 적용

- [ ] `src/views/ProfileView.vue` 또는 Settings 내 섹션
  - [ ] 던전 레벨 설정 UI
    - [ ] 각 던전 카테고리별 드롭다운 (1~5레벨)
    - [ ] 해금되지 않은 레벨은 선택 불가 표시
  - [ ] 현재 설정 요약 표시
    ```
    경험치 던전: Lv.3 (이성 60당 9/9/4)
    화폐 던전: Lv.5 (이성 80당 34K)
    ```

- [ ] `src/components/planner/FarmingSchedule.vue` (신규)
  - [ ] 필요 재료 기반 파밍 일정 계산
  - [ ] 카테고리별 필요 일수 표시
    ```
    경험치: 3일 (이성 180 필요)
    화폐: 2일 (이성 160 필요)
    스킬 재료: 5일 (이성 400 필요)
    총 예상: 10일
    ```
  - [ ] 우선순위 추천 (효율 기반)

---

### Phase 8: i18n 확장 (src/locales/)

#### 8-1. 게임별 번역 파일
- [ ] `src/locales/en.json` - Endfield 캐릭터/무기/재료 영문명
- [ ] `src/locales/ko.json` - Endfield 캐릭터/무기/재료 한글명
- [ ] `src/locales/ja.json` - Endfield 캐릭터/무기/재료 일본어명 (선택)

#### 8-2. 카테고리 번역 추가
- [ ] Endfield 전용 카테고리명 (WW와 다를 경우)
- [ ] 게임 이름 번역

---

### Phase 9: 라우팅 수정 (src/router/)

#### 9-1. 라우트 구조 검토
- [ ] 현재: `/character`, `/weapon`, `/planner`, `/inventory`
- [ ] 옵션 A: 그대로 유지 (스토어로 게임 구분)
- [ ] 옵션 B: `/:gameId/character` 형태로 변경

#### 9-2. 라우트 가드
- [ ] 게임 미선택 시 HomeView로 리다이렉트
- [ ] URL 직접 접근 시 스토어 초기화

---

### Phase 10: 테스트 및 마무리

#### 10-1. 데이터 검증
- [ ] Endfield 캐릭터/무기/재료 데이터 정확성
- [ ] costs.json 비용 정확성
- [ ] 합성 레시피 정확성

#### 10-2. 기능 테스트
- [ ] WW 기존 기능 정상 동작 확인 (회귀 테스트)
- [ ] Endfield 재료 계산 정확성
- [ ] 게임 전환 시 데이터 격리 확인
- [ ] localStorage 저장/로드 정상 동작

#### 10-3. UI/UX 검토
- [ ] 게임 전환 UX 자연스러움
- [ ] 반응형 디자인 확인
- [ ] 로딩 상태 표시

---

## 7. 참고 파일

- [ID_SYSTEM.md](./ID_SYSTEM.md) - ID 체계 상세
- [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) - 데이터 파일 구조

---

## 8. 확인 필요 사항

### 우선순위 높음 (구현 전 필수)
- [ ] **합성 시스템 방식** - 티어 기반 / 레시피 기반 / 합성 없음
- [ ] 캐릭터/무기별 필요 재료 SubCategory 매핑
- [ ] 정예화 7단계 실제 비용 데이터
- [x] ~~스킬 비용 등급별 차이~~ → **확정: 등급 무관 (모든 캐릭터 동일)**

### 우선순위 중간
- [ ] 스킬 마스터리 존재 여부 및 단계 수
- [ ] 주간 보스 존재 여부
- [ ] 던전별 이성 소모량 정확한 값

### 우선순위 낮음 (후순위)
- [ ] 합성 레시피 실제 비율 (합성 있을 경우)
- [ ] 추가 재료 카테고리 존재 여부
