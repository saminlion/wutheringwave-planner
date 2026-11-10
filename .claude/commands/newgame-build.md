# /newgame-build - 플러그인 코드 생성

`/newgame-fix` 후 스프레드시트 데이터를 JSON으로 준비한 다음 이 커맨드를 실행하세요.

## What this does
LocalOnly/{gameid}/ 의 데이터 파일을 기반으로 실제 플러그인 코드를 생성합니다.

---

## Workflow

### Step 1: Find game folder and validate data files

`LocalOnly/{gameid}/` 에서 아래 파일들이 모두 존재하는지 확인:
- `character.json`
- `weapon.json` (무기 시스템 있는 경우)
- `materials.json`
- `costs.json`
- `README.md` (ID_SYSTEM.md에서 game_code 확인)

파일이 없으면 어떤 파일이 없는지 알려주고 중단.

### Step 2: Read all data files

Read:
- `LocalOnly/{gameid}/README.md` — 게임 설정 정보
- `LocalOnly/{gameid}/ID_SYSTEM.md` — game_code, 카테고리 확인
- `LocalOnly/{gameid}/character.json`
- `LocalOnly/{gameid}/weapon.json`
- `LocalOnly/{gameid}/materials.json`
- `LocalOnly/{gameid}/costs.json`

### Step 3: Create plugin structure

```
src/games/{gameid}/
├── index.js
├── config.js
├── materialProcessor.js
├── components/
│   └── CharacterDialog.vue
└── data/
    ├── index.js
    ├── character.json   (copy from LocalOnly/{gameid}/)
    ├── weapon.json      (copy from LocalOnly/{gameid}/)
    ├── materials.json   (copy from LocalOnly/{gameid}/)
    ├── costs.json       (copy from LocalOnly/{gameid}/)
    ├── events.json      ([] — Events 탭이 채움)
    └── tiers.js         (합성 없으면 {})
```

**CharacterDialog.vue 선택:**
- Pattern 1 (Simple) → `src/games/wutheringwave/components/CharacterDialog.vue` 기반
- Pattern 2 (Complex) → `src/games/endfield/components/CharacterDialog.vue` 기반

**config.js 생성 기준:**
- README Section 1~8 데이터 사용
- themeColors: 속성/등급 색상
- formFields.characterLevelItems: Section 5 레벨 구간
- stamina: Section 8 스태미나 정보

**materialProcessor.js 생성 기준:**
- README Section 7 체크된 카테고리 → SUPPORTED_KEYS
- 티어 있는 카테고리 → findMaterial(category, subCategory, tier) 방식
- 직접 game_id 카테고리 → findMaterial(category, gameId, null, true) 방식
- EXP 카테고리 → materials.json value 필드로 자동 처리 (별도 코드 불필요)

> ⛔ **재료 game_id 숫자를 코드에 절대 적지 말 것.** game_id는 시트 수식(Category·SubCatCode·Seq)이
> 만드는 값이라 시트에서 바뀔 수 있다. 코드는 항상 데이터에서 찾는다.
> - 캐릭터마다 다른 재료 → character.json의 칸(시트 `_name` 칸에서 조회된 값)을 읽는다
> - **모든 캐릭터가 같이 쓰는 고정 재료도 마찬가지** → materials.json에서 고유한 SubCategory로 조회
>   (`findMaterial('mastery', 'perseverance')`). 캐릭터 칸이 없다고 숫자를 적으면 안 된다.
> - 실제 사고: Endfield Mark of Perseverance를 `5140010039`로 적어 뒀는데 시트가 `…040`으로 바뀌어,
>   필요 재료에는 안 보이고 완료는 "insufficient"로 막혔다 (2026-11).
> - 조회 결과가 없으면 `logger.warn` 후 그 비용만 건너뛴다. 이름이나 키 문자열을 재료로 넣지 말 것
>   (`core.js`의 fallback은 알 수 없는 키를 그대로 재료 id로 넣는다 → 같은 증상).

**tiers.js 생성 기준:**
- materials.json에서 tier 필드가 있는 항목들을 SubCategory별로 그룹화
- **키는 materials.json의 `SubCategory` 문자열과 정확히 같게**, 티어 번호도 `tier` 값과 같게
- game_id는 materials.json에서 복사 — **코드에 game_id가 들어가는 유일한 예외**이며,
  `tests/games/data-integrity.test.js`가 데이터와 어긋나면 실패시킨다
- 합성이 없거나 비율을 모르면 `export const tieredMaterials = {};` — **예시/가짜 id 금지**
  (Endfield에 `example_common: { 1: 51101001 }` 같은 존재하지 않는 id가 남아 있었다)

### Step 4: Register plugin in src/games/index.js AND src/main.js

**src/games/index.js** — 이 파일이 실제로 게임 목록을 표시하는 곳. 반드시 여기에 추가해야 게임 선택 화면에 보임.

1. import 추가:
```javascript
import {gameid}Plugin from './{gameid}';
```

2. `games` 객체에 추가:
```javascript
const games = {
  ...
  {gameid}: {gameid}Plugin,
};
```

3. `supportedGames` 배열에 추가:
```javascript
{
  id: '{gameid}',
  name: '{GameName}',
  shortName: '{SHORT}',
  icon: '⭐',  // 게임에 맞는 이모지
  enabled: true,
},
```

**src/main.js** — gameRegistry 등록도 함께:
```javascript
import {gameid}Plugin from './games/{gameid}';
gameRegistry.registerGame({gameid}Plugin);
```

**scripts/sync-sheets.js + .github/workflows/sync-data.yml** — 시트 동기화 등록.
`GOOGLE_SHEETS_GUIDE.md`의 "GitHub Actions 연동" 1~3을 그대로 적용 (`GAMES`에 항목 추가,
워크플로우 `options`와 `env`에 `SHEET_ID_{GAMEID_UPPER}` 추가). `events: 'Events'` 탭도 포함하고
`data/events.json`은 `[]`로 만든다.

### Step 5: Create test file and run the whole suite

`tests/games/{gameid}-materialProcessor.test.js` 생성 (processor 단위 테스트, dbUtils mock).

데이터 정합성은 **따로 만들 필요 없다** — `tests/games/data-integrity.test.js`가
`src/games/index.js`에 등록된 모든 게임을 자동으로 검사한다:
- materials.json의 game_id 중복 없음
- tiers.js의 모든 id가 materials.json에 같은 SubCategory/tier로 존재, 빠진 티어 재료 없음
- costs.json의 모든 비용 행을 모든 캐릭터/무기에 실제 processor로 돌렸을 때 나온 id가 전부 materials.json에 존재

`npm run test:run` 을 실행해서 **전부 통과해야 완료**. 실패하면 요약에 실패 내용을 그대로 적는다.
데이터 쪽 문제(중복 id 등)면 코드로 우회하지 말고 시트에서 고칠 항목으로 보고한다.

### Step 6: Update README.md checklist

`LocalOnly/{gameid}/README.md` 상단의 "진행 상황" 체크리스트를 업데이트:
- `- [ ] 구글 시트 데이터 입력` → `- [x] 구글 시트 데이터 입력` (JSON 파일이 존재하므로 완료로 간주)
- `- [ ] \`/newgame-build\`` → `- [x] \`/newgame-build\``

### Step 7: Display summary

```
✅ /newgame-build 완료

📁 생성된 파일:
  src/games/{gameid}/index.js
  src/games/{gameid}/config.js
  src/games/{gameid}/materialProcessor.js
  src/games/{gameid}/components/CharacterDialog.vue
  src/games/{gameid}/data/*.json
  src/games/{gameid}/data/tiers.js
  tests/games/{gameid}-materialProcessor.test.js

🔌 src/games/index.js + src/main.js 에 플러그인 등록 완료
🔄 scripts/sync-sheets.js + sync-data.yml 등록 완료 (GitHub Secret SHEET_ID_{GAMEID_UPPER} 는 사용자가 추가)
🧪 npm run test:run — {통과 수} passed (data-integrity 포함)

브라우저에서 확인해주세요:
  npm run dev
```
