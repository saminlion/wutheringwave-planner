# /newgame - New Game Plugin Setup

This command helps set up a new game plugin for the Multi-Game Planner.

## Workflow

### Phase 1: Information Gathering

1. **Ask for game title** using AskUserQuestion:
   - Question: "What is the game title? (e.g., 'Zenless Zone Zero')"
   - **Auto-generate**:
     - `game_id`: lowercase, no spaces (e.g., "Zenless Zone Zero" → "zenlesszonezero")
     - `game_code`: next available number (WW=4, Endfield=5, next=6, 7, 8...)
   - Display name keeps original casing

2. **Create LocalOnly/{gameid}/ folder** with the following template files (README.md, ID_SYSTEM.md, DATA_STRUCTURE.md, GOOGLE_SHEETS_GUIDE.md, COSTS_DATA.md):

---

#### README.md
```markdown
# {GameName} Plugin Development

> **Game ID:** `{gameid}` | **Game Code:** `{game_code}` | **Display Name:** {GameName}

완료 후 Claude에게 **"데이터 작성 완료"** 라고 말씀해주세요.

---

## 1. 기본 정보

> 캐릭터 최대 레벨 (예: 90)

**답변:**

> 스킬 최대 레벨 (예: 10)

**답변:**

> 재료 합성 비율 (예: 3:1 / 없음)

**답변:**

---

## 2. 속성 시스템

> 캐릭터에 속성(Element)이 있나요?

- [ ] 있음
- [ ] 없음

속성이 있다면 아래 표에 작성해주세요. (없으면 삭제해도 됩니다)

| 속성 ID | 한국어 이름 | 영어 이름 | 색상 (hex) |
|---------|------------|----------|------------|
|         |            |          |            |
|         |            |          |            |
|         |            |          |            |

---

## 3. 무기 시스템

> 무기가 있나요?

- [ ] 있음
- [ ] 없음 (캐릭터가 무기를 사용하지 않음)

무기가 있다면 타입을 작성해주세요. (없으면 삭제해도 됩니다)

| 타입 ID | 한국어 이름 | 영어 이름 |
|---------|------------|----------|
|         |            |          |
|         |            |          |

---

## 4. 등급 시스템

> 캐릭터/무기 등급을 작성해주세요. 있는 등급만 남기고 나머지는 삭제하세요.

| 등급 숫자 | 표시 이름 | 색상 (hex) |
|----------|-----------|------------|
| 3        | 3성       | #3b82f680  |
| 4        | 4성       | #6B60B5    |
| 5        | 5성       | #C88844    |
| 6        | 6성       | #FFD700    |

---

## 5. 레벨 구간

> 캐릭터가 거치는 레벨 구간을 적어주세요. A = 돌파(어센션) 후

**예시:** `1, 20, 20A, 40, 40A, 60, 60A, 70, 70A, 80, 80A, 90`

**답변:**

---

## 6. 스킬 구조

> 스킬 패턴을 선택해주세요.

- [ ] **Pattern 1 - Simple** (WutheringWaves 방식)
  - 스킬 5개 이하
  - 단순한 패시브 (0→1→2 레벨)
  - 특성/체크박스 없음

- [ ] **Pattern 2 - Complex** (Endfield 방식)
  - 스킬 5개 이상
  - 마스터리, 특성, 던전 등 복잡한 시스템
  - 속성/특성 체크박스 있음

---

> 액티브 스킬 개수와 이름을 적어주세요. (예: 5개 / 기본공격, 스킬, 궁극기, 패시브1, 패시브2)

**답변:**

> 패시브 스킬이 있나요? 있다면 구조를 설명해주세요. (예: 2단계, 각 5개 노드)

**답변:**

> (Complex only) 마스터리 시스템이 있나요?

- [ ] 있음
- [ ] 없음

> (Complex only) 특성/속성 체크박스가 있나요?

- [ ] 있음
- [ ] 없음

---

## 7. 재료 카테고리

> 게임에서 사용하는 재료 종류를 체크해주세요.

- [ ] **credit** — 게임 기본 재화 (골드, 크레딧 등)
- [ ] **common** — 공통 승급 재료 (필드 드랍)
- [ ] **forgery** — 스킬 재료 (던전 드랍)
- [ ] **ascension** — 캐릭터별 고유 승급 재료
- [ ] **boss** — 보스 드랍 재료
- [ ] **weeklyBoss** — 주간 보스 재료
- [ ] **player_exp** — 캐릭터 경험치 아이템
- [ ] **weapon_exp** — 무기 경험치 아이템
- [ ] **기타:**

> 티어(등급)가 있는 재료를 적어주세요. (예: common 4티어, forgery 4티어)

**답변:**

---

## 8. 스태미나 시스템

> 스태미나 이름은? (예: Waveplates, Resin, Sanity)

**답변:**

> 일일 최대 스태미나는?

**답변:**

> 회복 속도는? (예: 6분당 1)

**답변:**

---

## 9. 데이터 파일 준비 체크리스트

위 정보를 다 채웠으면 아래 데이터도 준비해주세요.

- [ ] 캐릭터 목록 (이름, 등급, 속성, 무기타입, 아이콘 URL)
- [ ] 무기 목록 (이름, 등급, 타입, 아이콘 URL)
- [ ] 재료 목록 (이름, 카테고리, 서브카테고리, 티어, 아이콘 URL)
- [ ] 레벨별 필요 재료표 (Section 10 참고)
- [ ] 스킬별 필요 재료표 (Section 10 참고)

---

## 10. 비용표 (Costs)

> 캐릭터 레벨업에 필요한 재료를 구간별로 적어주세요.
> 재료 이름은 Section 7에서 체크한 카테고리 이름 그대로 쓰면 됩니다.

### 캐릭터 레벨업 비용

**작성 형식:** `레벨구간: 재료명 Tx N개, credit N`

**예시 (일반 재료):**
```
1→20:   common T1 x4,  credit 5,000
20→20A: common T2 x4,  ascension x1,  credit 10,000
20A→40: common T1 x8,  credit 15,000
40→40A: common T2 x8,  ascension x2,  credit 20,000
```

**예시 (EXP 재료 포함):**
```
1→20:   player_exp 10,000,  credit 5,000
20→20A: player_exp 20,000,  ascension x1,  credit 10,000
20A→40: player_exp 40,000,  credit 15,000
```

> EXP는 총량만 적으면 됩니다. 어떤 포션을 몇 개 쓸지는 플래너가 자동 계산합니다.
> (단, materials.json에 각 포션의 `value` 값이 정의되어 있어야 합니다)

**답변:**
```
1→  :
  →  A:
 A→  :
  →  A:
 A→  :
  →  A:
 A→  :
```

---

> 캐릭터 스킬 레벨업에 필요한 재료를 레벨별로 적어주세요.
> 스킬마다 비용이 다른 경우, 스킬 이름도 같이 적어주세요.

### 스킬 레벨업 비용

**예시:**
```
Lv1→2: forgery T1 x3,  credit 2,500
Lv2→3: forgery T1 x3,  credit 5,000
Lv3→4: forgery T2 x4,  credit 15,000
Lv4→5: forgery T2 x6,  credit 25,000
Lv5→6: forgery T3 x6,  boss x1,  credit 40,000
```

**답변:**
```
Lv1→2:
Lv2→3:
Lv3→4:
Lv4→5:
Lv5→6:
Lv6→7:
Lv7→8:
Lv8→9:
Lv9→10:
```

---

> 무기가 있다면 무기 레벨업 비용도 적어주세요. (없으면 삭제)

### 무기 레벨업 비용

**답변:**
```
1→  :
  →  A:
 A→  :
```

---

## Reference
- `LocalOnly/{gameid}/ID_SYSTEM.md` — ID 체계 및 번호 할당 방법
- `LocalOnly/{gameid}/DATA_STRUCTURE.md` — JSON 파일 포맷
- `LocalOnly/{gameid}/GOOGLE_SHEETS_GUIDE.md` — 스프레드시트 템플릿
- `LocalOnly/GFL2/` — 가장 최근 추가된 게임 예시
```

---

#### ID_SYSTEM.md
```markdown
# {GameName} ID System

**Game Code**: `{game_code}` (자동 할당)

---

## ID 구조 (10자리)

모든 ID는 **10자리 숫자**로 통일됩니다.

### 형식: `GC TT YY NNNN`

| 위치 | 설명 | 예시 |
|------|------|------|
| GC (2자리) | 게임코드 + 카테고리 | {game_code}2 = 캐릭터 |
| TT (2자리) | 타입/등급 | 05 = 5성 |
| YY (2자리) | 서브분류 | 01 = 첫번째 속성 |
| NNNN (4자리) | 순번 | 0001~9999 |

---

## 1. 캐릭터 ID: `{game_code}2 RR EE NNNN`

- **{game_code}2**: 캐릭터 카테고리
- **RR**: 등급 (04=4성, 05=5성, 06=6성)
- **EE**: 속성 코드 (README.md 참고)
- **NNNN**: 순번

### 속성 코드 (README.md에서 작성 후 여기에 복사)

| 코드 | 속성 |
|------|------|
| 01   | (첫번째 속성) |
| 02   | (두번째 속성) |
| ...  | ... |

### 예시
```
{game_code}205010001 - 첫번째 5성 첫번째속성 캐릭터
{game_code}206020001 - 첫번째 6성 두번째속성 캐릭터
```

---

## 2. 무기 ID: `{game_code}3 RR TT NNNN`

- **{game_code}3**: 무기 카테고리
- **RR**: 등급
- **TT**: 무기 타입 코드
- **NNNN**: 순번

### 무기 타입 코드 (README.md에서 작성 후 여기에 복사)

| 코드 | 타입 |
|------|------|
| 01   | (첫번째 타입) |
| 02   | (두번째 타입) |
| ...  | ... |

### 예시
```
{game_code}305010001 - 첫번째 5성 첫번째타입 무기
{game_code}303020001 - 첫번째 3성 두번째타입 무기
```

---

## 3. 재료 ID: `{game_code}1 CC SS NNNN`

- **{game_code}1**: 재료 카테고리
- **CC**: 재료 종류
- **SS**: 서브 카테고리
- **NNNN**: 순번 또는 티어

### 재료 종류 코드 (CC)

| 코드 | 카테고리 | 설명 |
|------|----------|------|
| 00   | credit | 게임 재화 |
| 10   | common | 공통 승급 재료 |
| 20   | forgery | 스킬 재료 |
| 30   | ascension | 캐릭터별 승급 재료 |
| 40   | boss | 보스 재료 |
| 50   | weeklyBoss | 주간 보스 재료 |
| 60   | player_exp | 캐릭터 경험치 ⭐ |
| 70   | weapon_exp | 무기 경험치 ⭐ |
| 80   | skill_exp | 스킬 경험치 ⭐ |

⭐ = EXP 카테고리 (value 필드 필수, 자동 인식)

### 티어 규칙 (NNNN)

**티어 있는 재료**: 0001=T1, 0002=T2, 0003=T3, 0004=T4
**티어 없는 재료**: 0001, 0002, 0003... 순차

### 예시
```
{game_code}100000001 - 게임 재화
{game_code}110010001 - Common 첫번째그룹 T1
{game_code}110010002 - Common 첫번째그룹 T2
{game_code}120010001 - Forgery 첫번째그룹 T1
{game_code}140010001 - 첫번째 보스 재료
```

---

## 4. ID 매핑 테이블

(데이터 작성하면서 채워주세요)

### 캐릭터
| Game ID | 이름 | 등급 | 속성 |
|---------|------|------|------|
| {game_code}205010001 | ... | 5 | ... |

### 무기
| Game ID | 이름 | 등급 | 타입 |
|---------|------|------|------|
| {game_code}305010001 | ... | 5 | ... |

### 재료
| Game ID | 이름 | Category | SubCategory | Tier |
|---------|------|----------|-------------|------|
| {game_code}100000001 | ... | credit | credit | - |
```

---

#### DATA_STRUCTURE.md
```markdown
# {GameName} Data Structure

## 1. character.json

```json
{
  "{game_code}205010001": {
    "game_id": "{game_code}205010001",
    "display_name": "캐릭터 이름",
    "rarity": 5,
    "element": "fire",
    "weapon_type": "sword",
    "icon": "https://...",
    "common": "subcategory_name",
    "forgery": "subcategory_name",
    "ascension": "{game_code}130010001",
    "boss": "{game_code}140010001"
  }
}
```

## 2. weapon.json

```json
{
  "{game_code}305010001": {
    "game_id": "{game_code}305010001",
    "name": "무기 이름",
    "type": "sword",
    "rarity": 5,
    "icon": "https://...",
    "common": "subcategory_name",
    "ascension": "{game_code}130020001"
  }
}
```

## 3. materials.json

```json
{
  "credit": {
    "{game_code}100000001": {
      "game_id": "{game_code}100000001",
      "label": "재화 이름",
      "icon": "https://...",
      "Category": "credit",
      "SubCategory": "credit"
    }
  },
  "common": {
    "{game_code}110010001": {
      "game_id": "{game_code}110010001",
      "label": "재료 이름 T1",
      "icon": "https://...",
      "Category": "common",
      "SubCategory": "group_name",
      "tier": 1
    }
  },
  "player_exp": {
    "{game_code}160010001": {
      "game_id": "{game_code}160010001",
      "label": "경험치 포션 S",
      "icon": "https://...",
      "Category": "player_exp",
      "SubCategory": "player_exp",
      "tier": 2,
      "value": 200
    },
    "{game_code}160010002": {
      "game_id": "{game_code}160010002",
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
- 예: `player_exp`, `weapon_exp`, `skill_exp` 등

### UI 자동 기능 필드
| 필드 | 타입 | 설명 | UI 동작 |
|------|------|------|---------|
| `tier` | number | 재료 티어 (1-4) | 티어별 그룹 다이얼로그, 오름차순 정렬 |
| `value` | number | EXP 값 | EXP 다이얼로그 표시, 오름차순 정렬 |

**티어 그룹 조건**: 같은 SubCategory에 여러 고유 tier 값이 있어야 그룹화됨

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
```

---

#### GOOGLE_SHEETS_GUIDE.md

> ⚠️ **Phase 3 (`/newgame-fix`) 에서 실제 게임 데이터 기반으로 재생성됩니다.**
> 아래는 참고용 구조입니다. ARRAYFORMULA 수식은 `/newgame-fix` 이후 확정된 버전을 사용하세요.

```markdown
# {GameName} Data Management - Google Sheets Guide

{GameName} 게임 데이터를 구글 시트에서 관리하고 GitHub Actions로 자동 JSON 변환하는 가이드입니다.

---

## 구글 시트 설정

1. [Google Sheets](https://sheets.google.com) 접속 → 새 스프레드시트 생성
2. **공유 설정**: 링크가 있는 모든 사용자 → **뷰어** (publish-to-web 불필요)

다음 6개 탭을 생성하세요 (무기 없으면 5개):

| 탭 이름 | 용도 |
|---------|------|
| **Characters** | 캐릭터 데이터 |
| **Weapons** | 무기 데이터 (무기 없으면 생략) |
| **Materials** | 재료 데이터 |
| **Characters_i18n** | 캐릭터 한국어/영어 번역 |
| **Weapons_i18n** | 무기 한국어/영어 번역 (무기 없으면 생략) |
| **Materials_i18n** | 재료 한국어/영어 번역 |

---

## 시트 구조

### Characters 탭

| Column | Name | 입력방식 | Description |
|--------|------|---------|-------------|
| A | Seq | **자동** | ARRAYFORMULA (B열 데이터 기준 1,2,3...) |
| B | Rarity | 직접 입력 | 등급 숫자 |
| C | Element | 직접 입력 | 속성 ID |
| D | ElementCode | **자동** | ARRAYFORMULA |
| E | game_id | **자동** | ARRAYFORMULA |
| F | display_name | 직접 입력 | 영어 표시 이름 |
| G | weapon_type | 직접 입력 | 무기 타입 ID |
| H | common | 직접 입력 | SubCategory 이름 |
| I | forgery | 직접 입력 | SubCategory 이름 |
| J | ascension_name | 직접 입력 | Materials의 label과 동일하게 입력 |
| K | ascension | **자동** | ARRAYFORMULA → game_id |
| L | boss_name | 직접 입력 | Materials의 label과 동일하게 입력 |
| M | boss | **자동** | ARRAYFORMULA → game_id |
| N | icon | 직접 입력 | URL |

**ARRAYFORMULA (A2, D2, E2, K2, M2에 입력 — 게임별 속성/등급 코드에 맞게 조정):**
```
A2: =ARRAYFORMULA(IF(B2:B="","",ROW(A2:A)-ROW(A2)+1))
D2: =ARRAYFORMULA(IF(C2:C="","",IF(C2:C="element1",1,IF(C2:C="element2",2,...,0))))
E2: =ARRAYFORMULA(IF(A2:A="","",{game_code}200000000+(B2:B*10000000)+(D2:D*100000)+A2:A))
K2: =ARRAYFORMULA(IF(J2:J="","",IFERROR(INDEX(Materials!$F$2:$F,MATCH(J2:J,Materials!$G$2:$G,0)),""))
M2: =ARRAYFORMULA(IF(L2:L="","",IFERROR(INDEX(Materials!$F$2:$F,MATCH(L2:L,Materials!$G$2:$G,0)),""))
```

### Weapons 탭

| Column | Name | 입력방식 |
|--------|------|---------|
| A | Seq | **자동** |
| B | Rarity | 직접 입력 |
| C | Type | 직접 입력 |
| D | TypeCode | **자동** |
| E | game_id | **자동** |
| F | display_name | 직접 입력 |
| G | common | 직접 입력 |
| H | ascension_name | 직접 입력 |
| I | ascension | **자동** |
| J | icon | 직접 입력 |

**ARRAYFORMULA (A2, D2, E2, I2에 입력):**
```
A2: =ARRAYFORMULA(IF(B2:B="","",ROW(A2:A)-ROW(A2)+1))
D2: =ARRAYFORMULA(IF(C2:C="","",IF(C2:C="type1",1,0)))
E2: =ARRAYFORMULA(IF(A2:A="","",{game_code}300000000+(B2:B*10000000)+(D2:D*100000)+A2:A))
I2: =ARRAYFORMULA(IF(H2:H="","",IFERROR(INDEX(Materials!$F$2:$F,MATCH(H2:H,Materials!$G$2:$G,0)),""))
```

### Materials 탭

| Column | Name | 입력방식 |
|--------|------|---------|
| A | Category | 직접 입력 |
| B | CategoryCode | **자동** |
| C | SubCategory | 직접 입력 |
| D | SubCatCode | 직접 입력 (01~99) |
| E | Seq | 직접 입력 |
| F | game_id | **자동** |
| G | label | 직접 입력 (영어) |
| H | tier | 직접 입력 (없으면 공백) |
| I | value | 직접 입력 (EXP 아이템만) |
| J | icon | 직접 입력 |

**ARRAYFORMULA:**
```
B2: =ARRAYFORMULA(IF(A2:A="","",IF(A2:A="credit",0,IF(A2:A="common",10,IF(A2:A="forgery",20,IF(A2:A="ascension",30,IF(A2:A="boss",40,IF(A2:A="weeklyBoss",50,IF(A2:A="player_exp",60,IF(A2:A="weapon_exp",70,0))))))))))
F2: =ARRAYFORMULA(IF(E2:E="","",{game_code}100000000+(B2:B*1000000)+(D2:D*10000)+E2:E))
```

### Characters_i18n / Weapons_i18n / Materials_i18n 탭

> 3개 탭 모두 동일한 구조

| Column | Name | 입력방식 |
|--------|------|---------|
| A | game_id | **자동** (ARRAYFORMULA) |
| B | en | **자동** (ARRAYFORMULA — display_name/label 참조) |
| C | ko | 직접 입력 (한국어) |

**ARRAYFORMULA (A2, B2에 입력):**
```
Characters_i18n
  A2: =ARRAYFORMULA(IF(Characters!E2:E="","",Characters!E2:E))
  B2: =ARRAYFORMULA(IF(Characters!E2:E="","",Characters!F2:F))

Weapons_i18n
  A2: =ARRAYFORMULA(IF(Weapons!E2:E="","",Weapons!E2:E))
  B2: =ARRAYFORMULA(IF(Weapons!E2:E="","",Weapons!F2:F))

Materials_i18n
  A2: =ARRAYFORMULA(IF(Materials!F2:F="","",Materials!F2:F))
  B2: =ARRAYFORMULA(IF(Materials!F2:F="","",Materials!G2:G))
```

원본 탭에 데이터가 추가되면 A열(game_id), B열(en)이 자동으로 생성됩니다. **C열(ko)만 직접 입력**하세요.

---

## GitHub Actions 연동

### 1. GitHub Secret 추가

GitHub 저장소 → Settings → Secrets → **New repository secret**
```
Name:  SHEET_ID_{GAMEID_UPPER}
Value: (구글 시트 URL의 /d/ 다음 ID)
```

### 2. scripts/sync-sheets.js 에 추가

`GAMES` 객체에 아래 항목 추가:
```javascript
{gameid}: {
  sheetId: extractSheetId(process.env.SHEET_ID_{GAMEID_UPPER}),
  dataPath: 'src/games/{gameid}/data',
  localePath: 'src/games/{gameid}/locales',
  tabs: {
    characters: 'Characters',
    materials: 'Materials',
    weapons: 'Weapons',
  },
  i18nTabs: {
    characters: 'Characters_i18n',
    materials: 'Materials_i18n',
    weapons: 'Weapons_i18n',
  },
},
```

### 3. .github/workflows/sync-data.yml 에 추가

`options` 목록에 `{gameid}` 추가, `env`에 Secret 추가:
```yaml
options:
  - ''
  - wutheringwave
  - endfield
  - gfl2
  - {gameid}    # ← 추가

env:
  ...
  SHEET_ID_{GAMEID_UPPER}: ${{ secrets.SHEET_ID_{GAMEID_UPPER} }}  # ← 추가
```

---

## 데이터 입력 순서

1. **Materials 탭** 먼저 입력 → **Materials_i18n** 번역 추가
2. **Characters / Weapons 탭** 입력 (ascension/boss game_id는 Materials 탭에서 자동 조회) → **_i18n 탭** 번역 추가
3. GitHub Actions 실행 → JSON 자동 생성 및 커밋

---

## 참고 문서
- `ID_SYSTEM.md` - ID 체계 상세
- `DATA_STRUCTURE.md` - JSON 포맷
- `COSTS_DATA.md` - 비용 데이터 수집
- `scripts/sync-sheets.js` - 동기화 스크립트
- `.github/workflows/sync-data.yml` - GitHub Actions 워크플로우
```

---

#### COSTS_DATA.md
```markdown
# {GameName} 비용 데이터 수집

게임 진행하면서 확인되는 대로 채워주세요.
완성된 항목부터 `/newgame-build` 때 반영합니다.

**작성 형식:**
- 일반 재료: `common T1 x4` / `ascension x2` / `boss x1`
- EXP 재료: `player_exp 13650` (총량만)
- 재화: `credit 30000`

---

## 스태미나 소비율 (Farming Rates)

> 각 재료를 파밍할 때 스태미나 소비량과 드랍량을 적어주세요.
> 이 데이터로 플래너의 "Estimated Days" 계산이 됩니다.
>
> 작성 형식: `스태미나 N 소비 시 → 재료 N개 (또는 N EXP) 드랍`

| 카테고리 | 던전/활동 이름 | 스태미나 소비 | 드랍량 | 상태 |
|---------|--------------|------------|-------|------|
| credit | | | | ⬜ |
| common | | | 1개 | ⬜ |
| forgery | | | 1개 | ⬜ |
| boss | | | 1개 | ⬜ |
| weeklyBoss | | | 1개 | ⬜ |
| player_exp | | | (총 EXP) | ⬜ |
| weapon_exp | | | (총 EXP) | ⬜ |

---

## 캐릭터 레벨업 비용

| 구간 | 재료 | 상태 |
|------|------|------|
| 1→20 | | ⬜ |
| 20→20A | | ⬜ |
| 20A→30 | | ⬜ |
| 30→30A | | ⬜ |
| 30A→40 | | ⬜ |
| 40→40A | | ⬜ |
| 40A→50 | | ⬜ |
| 50→50A | | ⬜ |
| 50A→60 | | ⬜ |
| 60→60A | | ⬜ |
| 60A→70 | | ⬜ |
| 70→70A | | ⬜ |
| 70A→80 | | ⬜ |

---

## 스킬 레벨업 비용

> 스킬마다 비용이 다른 경우 스킬별로 섹션 분리

| 구간 | 재료 | 상태 |
|------|------|------|
| Lv1→2 | | ⬜ |
| Lv2→3 | | ⬜ |
| Lv3→4 | | ⬜ |
| Lv4→5 | | ⬜ |
| Lv5→6 | | ⬜ |
| Lv6→7 | | ⬜ |
| Lv7→8 | | ⬜ |
| Lv8→9 | | ⬜ |
| Lv9→10 | | ⬜ |

---

## 패시브 잠금해제 비용

> 캐릭터당 패시브가 있는 경우 작성 (1회 잠금해제 비용)

| 항목 | 재료 | 상태 |
|------|------|------|
| passive_1 | | ⬜ |
| passive_2 | | ⬜ |

---

## 주간 보스 재료 사용 비용

> 스킬 레벨업 등에 weeklyBoss 재료가 사용되는 구간

| 구간 | 재료 | 상태 |
|------|------|------|
| | weeklyBoss x1 | ⬜ |

---

## 무기 레벨업 비용

| 구간 | 재료 | 상태 |
|------|------|------|
| 1→20 | | ⬜ |
| 20→20A | | ⬜ |
| 20A→30 | | ⬜ |
| 30→30A | | ⬜ |
| 30A→40 | | ⬜ |
| 40→40A | | ⬜ |
| 40A→50 | | ⬜ |
| 50→50A | | ⬜ |
| 50A→60 | | ⬜ |
| 60→60A | | ⬜ |
| 60A→70 | | ⬜ |
| 70→70A | | ⬜ |
| 70A→80 | | ⬜ |
```

---

### Phase 2: Wait for User

3. **Display message**:
   ```
   ✅ LocalOnly/{gameid}/ 폴더 생성 완료

   다음 파일들이 생성되었습니다:
   - README.md (필수 정보 질문지)
   - ID_SYSTEM.md (ID 체계 - Game Code: {game_code})
   - DATA_STRUCTURE.md (데이터 포맷)
   - GOOGLE_SHEETS_GUIDE.md (스프레드시트 템플릿)
   - COSTS_DATA.md (비용 데이터 수집표)

   📝 작업 순서:
   1. README.md의 모든 섹션을 채워주세요 (Section 1~10)
   2. COSTS_DATA.md에 비용 데이터를 게임 진행하면서 채워주세요
   3. 완료되면 /newgame-review 실행

   그동안 데이터 작성 관련 질문이 있으면 언제든 물어보세요!
   ```

### Phase 3a: README 검토 (/newgame-review)

4. **Read LocalOnly/{gameid}/README.md** to get filled information

5. **Review and ask follow-up questions** for anything unclear or missing:
   - 속성/무기타입 이름이나 색상이 빠진 경우
   - 레벨 구간이 불명확한 경우
   - 비용표에서 재료명이 Section 7 카테고리와 맞지 않는 경우
   - 스킬 구조 패턴 선택이 안 된 경우
   - 기타 모호한 항목
   - **모든 항목이 명확하면 질문 없이 다음 단계로 진행**

6. **Assign IDs and update ID_SYSTEM.md**:
   - 속성 코드 (01, 02, 03...) 확정 및 표 채우기
   - 무기 타입 코드 확정 및 표 채우기
   - 재료 SubCategory 이름 확정
   - ID 매핑 테이블 예시 채우기

7. **Generate game-specific Google Sheets structure** and save to `LocalOnly/{gameid}/GOOGLE_SHEETS_GUIDE.md`:
   - README에서 확인된 실제 재료 카테고리만 포함 (없는 카테고리 제외)
   - 실제 속성/무기타입 목록으로 예시 행 생성
   - 실제 레벨 구간으로 비용 시트 예시 생성
   - EXP 카테고리가 있으면 `value` 컬럼 포함
   - 각 시트마다 작성 요령 주석 추가

8. **Display summary**:
   ```
   ✅ ID 체계 확정 완료

   📋 확정된 정보:
   - 속성 코드: (목록)
   - 무기 타입 코드: (목록)
   - 재료 카테고리: (목록)

   📊 Google Sheets 구조가 GOOGLE_SHEETS_GUIDE.md에 업데이트되었습니다.

   다음 단계:
   1. GOOGLE_SHEETS_GUIDE.md를 참고해서 스프레드시트에 데이터를 입력해주세요
   2. 데이터 파일 (character.json, weapon.json 등)이 준비되면
      "플러그인 만들어줘" 라고 말씀해주세요
   ```

### Phase 4: Plugin Creation (after user says "플러그인 만들어줘")

9. **Validate data files exist** in LocalOnly/{gameid}/:
   - character.json, weapon.json, materials.json, costs.json 확인

10. **Create plugin structure**:
   ```
   src/games/{gameid}/
   ├── index.js
   ├── config.js
   ├── materialProcessor.js
   ├── components/CharacterDialog.vue  (copy from template based on chosen pattern)
   └── data/
       ├── index.js
       ├── character.json
       ├── weapon.json
       ├── materials.json
       ├── costs.json
       └── tiers.js
   ```

   **CharacterDialog.vue template selection**:
   - Pattern 1 (Simple) → Copy from `src/games/wutheringwave/components/CharacterDialog.vue`
   - Pattern 2 (Complex) → Copy from `src/games/endfield/components/CharacterDialog.vue`

   **✅ Complete button compatibility**:
   Both patterns are automatically supported by the `completeGoal` function in PlannerView.vue.
   No additional code changes needed when using these patterns.

11. **Register plugin** in `src/main.js`

12. **Create test file**: `tests/games/{gameid}-materialProcessor.test.js`

13. **Run tests**: `npm run test:run`

14. **Build check**: `npm run build`

### Phase 5: Verification

15. Report results and ask user to test in browser
