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

2. **Create LocalOnly/{gameid}/ folder** with the following template files:

---

#### README.md
```markdown
# {GameName} Plugin Development

## Status: 🔴 Data Collection Phase

| 항목 | 값 |
|------|-----|
| **Game ID** | `{gameid}` (자동 생성) |
| **Display Name** | {GameName} |
| **Game Code** | `{game_code}` (ID 접두사, 자동 할당) |

---

## Required Information

아래 섹션을 채워주세요. 완료 후 **"데이터 작성 완료"** 라고 말씀해주세요.

---

## 1. 기본 정보

| 질문 | 답변 |
|------|------|
| 캐릭터 최대 레벨 | (예: 90) |
| 스킬 최대 레벨 | (예: 10) |
| 재료 합성 비율 | (예: 3:1 또는 "없음") |

---

## 2. 속성 시스템

**Q: 캐릭터에 속성(Element)이 있나요?**
- [ ] 있음 → 아래 표 작성
- [ ] 없음

| 속성 ID | 표시 이름 | 색상 (hex) |
|---------|-----------|------------|
| fire    | 화염      | #FF6347    |
| ...     | ...       | ...        |

---

## 3. 무기 시스템

**Q: 무기 타입이 있나요?**
- [ ] 있음 → 아래 표 작성
- [ ] 없음 (캐릭터가 무기 사용 안 함)

| 타입 ID | 표시 이름 |
|---------|-----------|
| sword   | 한손검    |
| ...     | ...       |

---

## 4. 등급 시스템

**Q: 캐릭터/무기 등급은 어떻게 되나요?**

| 등급 | 표시 이름 | 색상 (hex) |
|------|-----------|------------|
| 3    | 3성       | #3b82f680  |
| 4    | 4성       | #6B60B5    |
| 5    | 5성       | #C88844    |
| 6    | 6성       | #FFD700    |

---

## 5. 레벨 구간

캐릭터 레벨 구간을 나열해주세요 (A = 돌파 후):
```
예: 1, 20, 20A, 40, 40A, 50, 50A, 60, 60A, 70, 70A, 80, 80A, 90
```

작성:


---

## 6. 스킬 구조

| 질문 | 답변 |
|------|------|
| 액티브 스킬 개수 | (예: 5) |
| 스킬 이름들 | (예: 기본공격, 스킬, 궁극기, ...) |
| 패시브 스킬 존재 여부 | 있음 / 없음 |
| 패시브 구조 | (예: 2단계, 각 5개 노드) |

---

## 7. 재료 카테고리

**Q: 게임에서 사용하는 재료 종류는?** (체크)

- [ ] credit - 게임 재화
- [ ] common - 공통 승급 재료 (필드 드랍)
- [ ] forgery - 스킬 재료 (던전 드랍)
- [ ] ascension - 캐릭터별 승급 재료
- [ ] boss - 보스 드랍 재료
- [ ] weeklyBoss - 주간 보스 재료
- [ ] player_exp - 캐릭터 경험치
- [ ] weapon_exp - 무기 경험치
- [ ] 기타: ________________

**티어가 있는 재료는?** (예: common T1→T2→T3→T4)
```
예: common (4티어), forgery (4티어)
```

작성:


---

## 8. 스태미나 시스템

| 질문 | 답변 |
|------|------|
| 스태미나 이름 | (예: Waveplates, Resin, Sanity) |
| 일일 최대치 | (예: 240) |
| 회복 속도 | (예: 6분당 1) |

---

## 9. 데이터 파일 준비

위 정보 작성 후, 아래 데이터를 준비해주세요:

- [ ] 캐릭터 목록 (이름, 등급, 속성, 무기타입, 아이콘 URL)
- [ ] 무기 목록 (이름, 등급, 타입, 아이콘 URL)
- [ ] 재료 목록 (이름, 카테고리, 서브카테고리, 티어, 아이콘 URL)
- [ ] 레벨별 필요 재료표
- [ ] 스킬별 필요 재료표

---

## Reference
- `LocalOnly/WutheringWaves/` - WW 데이터 예시
- `LocalOnly/Endfield/` - Endfield 데이터 예시
- `CLAUDE.md` - 플러그인 개발 가이드
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
| 60   | player_exp | 캐릭터 경험치 |
| 70   | weapon_exp | 무기 경험치 |

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
  }
}
```

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
```markdown
# {GameName} Google Sheets Guide

## 권장 시트 구조

### Sheet 1: Characters
| game_id | display_name | rarity | element | weapon_type | icon | common | forgery | ascension | boss |
|---------|--------------|--------|---------|-------------|------|--------|---------|-----------|------|
| {game_code}205010001 | 캐릭터A | 5 | fire | sword | URL | group1 | group1 | {game_code}130010001 | {game_code}140010001 |

### Sheet 2: Weapons
| game_id | name | type | rarity | icon | common | ascension |
|---------|------|------|--------|------|--------|-----------|
| {game_code}305010001 | 무기A | sword | 5 | URL | group1 | {game_code}130020001 |

### Sheet 3: Materials
| game_id | label | icon | Category | SubCategory | tier |
|---------|-------|------|----------|-------------|------|
| {game_code}100000001 | 재화 | URL | credit | credit | |
| {game_code}110010001 | 재료T1 | URL | common | group1 | 1 |

### Sheet 4: Character Level Costs
| level | common_qty | common_tier | ascension_qty | credit |
|-------|------------|-------------|---------------|--------|
| 20 | 5 | 1 | | 5000 |
| 20A | 10 | 2 | 1 | 10000 |

### Sheet 5: Skill Costs
| level | forgery_qty | forgery_tier | boss_qty | credit |
|-------|-------------|--------------|----------|--------|
| 2 | 3 | 1 | | 2000 |

## JSON 변환 방법
1. 파일 → 다운로드 → CSV
2. 온라인 CSV to JSON 변환기 사용
3. DATA_STRUCTURE.md 형식에 맞게 정리
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

   📝 작업 순서:
   1. README.md의 질문들을 채워주세요
   2. ID_SYSTEM.md의 속성/무기타입 코드 작성
   3. 스프레드시트로 캐릭터/무기/재료 데이터 작성
   4. 완료되면 "데이터 작성 완료" 라고 말씀해주세요

   그동안 데이터 작성 관련 질문이 있으면 언제든 물어보세요!
   ```

### Phase 3: Plugin Creation (after user says "데이터 작성 완료")

4. **Read LocalOnly/{gameid}/README.md** to get filled information

5. **Validate data**:
   - 필수 항목 누락 확인
   - 데이터 파일 존재 확인

6. **Create plugin structure**:
   ```
   src/games/{gameid}/
   ├── index.js
   ├── config.js
   ├── materialProcessor.js
   ├── components/CharacterDialog.vue
   └── data/
       ├── index.js
       ├── character.json
       ├── weapon.json
       ├── materials.json
       ├── costs.json
       └── tiers.js
   ```

7. **Register plugin** in `src/main.js`

8. **Create test file**: `tests/games/{gameid}-materialProcessor.test.js`

9. **Run tests**: `npm run test:run`

10. **Build check**: `npm run build`

### Phase 4: Verification

11. Report results and ask user to test in browser
