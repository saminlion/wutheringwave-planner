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
    └── tiers.js
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

**tiers.js 생성 기준:**
- materials.json에서 tier 필드가 있는 항목들을 SubCategory별로 그룹화

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

### Step 5: Create test file

`tests/games/{gameid}-materialProcessor.test.js` 생성

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

브라우저에서 확인해주세요:
  npm run dev
```
