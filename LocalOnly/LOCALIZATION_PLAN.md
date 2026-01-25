# Localization (i18n) Plan

## Overview

현재 모든 캐릭터, 무기, 재료 이름이 영문으로 되어있음. 다국어 지원을 위해 Google Sheets에서 번역 데이터를 관리하고 JSON으로 변환하는 시스템 구축 계획.

**지원 언어 (Phase 1):** English, 한국어

---

## Current State (Updated: 2026-01-26)

### 구현 완료된 파일 구조

```
src/locales/
├── en.json          # UI 공통 번역만
└── ko.json          # UI 공통 번역만

src/games/wutheringwave/locales/
├── en.json          # WW 캐릭터/무기/재료 (47캐릭터, 99무기, 138재료)
└── ko.json          # WW 한국어 번역

src/games/endfield/locales/
├── en.json          # Endfield 캐릭터/무기/재료 (23캐릭터, 62무기, 36재료)
└── ko.json          # Endfield 한국어 번역
```

### 파일 내용 구조

**공통 UI (src/locales/en.json, ko.json):**
```json
{
  "ui": {
    "nav.home": "Home",
    "nav.planner": "Planner",
    "category.credit": "Credit",
    "category.special": "Special Materials",
    ...
  }
}
```

**게임별 데이터 (src/games/{game}/locales/en.json, ko.json):**
```json
{
  "characters": {
    "5240200001": "Akekuri",
    ...
  },
  "weapons": {
    "5330100001": "Tarr 11",
    ...
  },
  "materials": {
    "5100010001": "T-Creds",
    ...
  }
}
```

**Key 형식:** `game_id` (숫자) - 게임에서 할당된 고유 ID로 변경되지 않음

---

## Google Sheets 연동 방법

### WW (Wuthering Waves)

**참고 문서:** [LocalOnly/WutheringWaves/GOOGLE_SHEETS_GUIDE.md](./WutheringWaves/GOOGLE_SHEETS_GUIDE.md)

#### 번역 시트 구조

WW Google Sheets에 **별도 번역 시트**를 추가하여 수식으로 game_id/영문명을 참조.

**Characters_i18n 시트:**
| Column | Name | 수식/값 |
|--------|------|--------|
| A | game_id | `=Characters!E2` |
| B | en | `=Characters!G2` (display_name) |
| C | ko | (직접 입력) |

**Weapons_i18n 시트:**
| Column | Name | 수식/값 |
|--------|------|--------|
| A | game_id | `=Weapons!E2` |
| B | en | `=Weapons!G2` |
| C | ko | (직접 입력) |

**Materials_i18n 시트:**
| Column | Name | 수식/값 |
|--------|------|--------|
| A | game_id | `=Materials!F2` |
| B | en | `=Materials!H2` |
| C | ko | (직접 입력) |

#### WW Apps Script - 번역 JSON 생성

기존 `exportAllJSON()` 함수와 별도로 번역용 함수 추가:

```javascript
/**
 * WW 번역 JSON 생성
 * 출력: en.json, ko.json (characters, weapons, materials)
 */
function generateWWTranslations() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const en = { characters: {}, weapons: {}, materials: {} };
  const ko = { characters: {}, weapons: {}, materials: {} };

  // Characters_i18n
  const charSheet = ss.getSheetByName('Characters_i18n');
  if (charSheet) {
    const data = charSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const [gameId, enName, koName] = data[i];
      if (gameId) {
        en.characters[gameId] = enName || '';
        ko.characters[gameId] = koName || enName || '';
      }
    }
  }

  // Weapons_i18n
  const weaponSheet = ss.getSheetByName('Weapons_i18n');
  if (weaponSheet) {
    const data = weaponSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const [gameId, enName, koName] = data[i];
      if (gameId) {
        en.weapons[gameId] = enName || '';
        ko.weapons[gameId] = koName || enName || '';
      }
    }
  }

  // Materials_i18n
  const matSheet = ss.getSheetByName('Materials_i18n');
  if (matSheet) {
    const data = matSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      const [gameId, enName, koName] = data[i];
      if (gameId) {
        en.materials[gameId] = enName || '';
        ko.materials[gameId] = koName || enName || '';
      }
    }
  }

  // JSON 출력
  outputJSON('ww_locales_en.json', en);
  outputJSON('ww_locales_ko.json', ko);

  SpreadsheetApp.getUi().alert('WW 번역 JSON 생성 완료!\nen.json, ko.json');
}

// 기존 outputJSON 함수 사용
function outputJSON(filename, data) {
  const json = JSON.stringify(data, null, 2);
  const html = HtmlService.createHtmlOutput(
    `<pre style="white-space:pre-wrap;word-wrap:break-word;font-size:12px;">${json}</pre>`
  ).setWidth(800).setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, filename);
}
```

**사용법:**
1. Google Sheets > Extensions > Apps Script
2. `generateWWTranslations` 함수 추가
3. 실행하면 en.json, ko.json 팝업 출력
4. 복사해서 `src/games/wutheringwave/locales/` 에 저장

---

### Endfield

**참고 문서:** [LocalOnly/Endfield/GOOGLE_SHEETS_GUIDE.md](./Endfield/GOOGLE_SHEETS_GUIDE.md)

#### 현재 시트 구조

Endfield 시트는 이미 `display_name` 컬럼이 있음. 별도 i18n 시트 없이 기존 시트에 `ko_name` 컬럼 추가 가능.

**Characters 시트 현재 구조:**
| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| key | display_name | element | weapon | icon | rarity | bolete_name | bolete_id | odendra_name | odendra_id | special_name | special_id |

**수정 방안 (Option 1): 기존 시트에 ko_name 컬럼 추가**

Characters 시트에 M열 추가:
| Column | Name | 값 |
|--------|------|---|
| M | ko_name | (직접 입력) |

**수정 방안 (Option 2): 별도 i18n 시트 생성** (WW와 동일 패턴)

**Characters_i18n 시트:**
| A | B | C |
|---|---|---|
| game_id | en | ko |
| `=VLOOKUP(Characters!A2, Characters!A:E, 5, FALSE)` | `=Characters!B2` | (직접 입력) |

#### Endfield Apps Script - 번역 JSON 생성

**Option 1: 기존 시트에 ko_name 컬럼 추가한 경우**

```javascript
/**
 * Endfield 번역 JSON 생성 (기존 시트 + ko_name 컬럼)
 * Characters: M열 = ko_name
 * Weapons: J열 = ko_name
 * Materials: ko_name 컬럼 추가 필요
 */
function generateEndfieldTranslations() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const en = { characters: {}, weapons: {}, materials: {} };
  const ko = { characters: {}, weapons: {}, materials: {} };

  // Characters (E열: game_id 수식, B열: display_name, M열: ko_name)
  const charSheet = ss.getSheetByName('Characters');
  if (charSheet) {
    const data = charSheet.getDataRange().getValues();
    const headers = data[0];
    const gameIdCol = headers.indexOf('game_id');  // 수식 결과 열
    const enNameCol = 1;  // B열: display_name
    const koNameCol = headers.indexOf('ko_name');  // M열 (추가 필요)

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const gameId = row[gameIdCol] || row[4];  // E열 fallback
      const enName = row[enNameCol];
      const koName = koNameCol >= 0 ? row[koNameCol] : '';

      if (gameId) {
        en.characters[gameId] = enName || '';
        ko.characters[gameId] = koName || enName || '';
      }
    }
  }

  // Weapons (E열: game_id 수식, B열: display_name, J열: ko_name)
  const weaponSheet = ss.getSheetByName('Weapons');
  if (weaponSheet) {
    const data = weaponSheet.getDataRange().getValues();
    const headers = data[0];
    const gameIdCol = headers.indexOf('game_id');
    const enNameCol = 1;  // B열
    const koNameCol = headers.indexOf('ko_name');

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const gameId = row[gameIdCol] || row[4];
      const enName = row[enNameCol];
      const koName = koNameCol >= 0 ? row[koNameCol] : '';

      if (gameId) {
        en.weapons[gameId] = enName || '';
        ko.weapons[gameId] = koName || enName || '';
      }
    }
  }

  // Materials (game_id, label, ko_name)
  const matSheet = ss.getSheetByName('Materials');
  if (matSheet) {
    const data = matSheet.getDataRange().getValues();
    const headers = data[0];
    const gameIdCol = headers.indexOf('game_id');
    const enNameCol = headers.indexOf('label');
    const koNameCol = headers.indexOf('ko_name');

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const gameId = row[gameIdCol];
      const enName = row[enNameCol];
      const koName = koNameCol >= 0 ? row[koNameCol] : '';

      if (gameId) {
        en.materials[gameId] = enName || '';
        ko.materials[gameId] = koName || enName || '';
      }
    }
  }

  // JSON 출력
  outputJSON('endfield_locales_en.json', en);
  outputJSON('endfield_locales_ko.json', ko);

  SpreadsheetApp.getUi().alert('Endfield 번역 JSON 생성 완료!\nen.json, ko.json');
}
```

**Option 2: 별도 i18n 시트 사용하는 경우**

WW와 동일한 패턴의 `generateEndfieldTranslations()` 함수 사용.

---

## 워크플로우 요약

### 새 캐릭터/무기/재료 추가 시

**WW:**
1. 기존 시트 (Characters, Weapons, Materials)에 데이터 추가
2. i18n 시트 (Characters_i18n 등)에 행 추가, 수식 복사
3. ko 열에 한글 번역 입력
4. `generateWWTranslations()` 실행
5. JSON 복사 → `src/games/wutheringwave/locales/` 에 저장

**Endfield:**
1. 기존 시트에 데이터 추가
2. ko_name 열에 한글 번역 입력 (또는 i18n 시트에)
3. `generateEndfieldTranslations()` 실행
4. JSON 복사 → `src/games/endfield/locales/` 에 저장

### UI 문자열 수정 시

UI 문자열은 Google Sheets 없이 직접 수정:
- `src/locales/en.json` - 영문
- `src/locales/ko.json` - 한글

---

## Vue 통합

### useLocale composable (예정)

```javascript
// src/composables/useLocale.js
import { ref, computed } from 'vue';

const currentLocale = ref(localStorage.getItem('locale') || 'en');

// 공통 UI 번역
import enUI from '@/locales/en.json';
import koUI from '@/locales/ko.json';

const uiTranslations = { en: enUI, ko: koUI };

// 게임별 번역 (동적 로드)
let gameTranslations = { en: {}, ko: {} };

export function useLocale() {
  const locale = computed(() => currentLocale.value);

  // 게임 데이터 로드
  const loadGameLocale = async (gameId) => {
    const enModule = await import(`@/games/${gameId}/locales/en.json`);
    const koModule = await import(`@/games/${gameId}/locales/ko.json`);
    gameTranslations.en = enModule.default;
    gameTranslations.ko = koModule.default;
  };

  // UI 번역
  const tUI = (key) => {
    return uiTranslations[currentLocale.value]?.ui?.[key] || key;
  };

  // 게임 데이터 번역 (game_id 기반)
  const t = (gameId, category = 'characters') => {
    return gameTranslations[currentLocale.value]?.[category]?.[gameId] || gameId;
  };

  const setLocale = (lang) => {
    currentLocale.value = lang;
    localStorage.setItem('locale', lang);
  };

  return { locale, t, tUI, setLocale, loadGameLocale };
}
```

### 컴포넌트 사용 예시

```vue
<script setup>
import { useLocale } from '@/composables/useLocale';
const { t, tUI } = useLocale();
</script>

<template>
  <!-- UI 텍스트 -->
  <h1>{{ tUI('nav.planner') }}</h1>

  <!-- 캐릭터 이름 (game_id로 조회) -->
  <span>{{ t(character.game_id, 'characters') }}</span>

  <!-- 재료 이름 -->
  <span>{{ t(material.game_id, 'materials') }}</span>
</template>
```

---

## Implementation Checklist

### Phase 1: 기본 인프라 ✅ 완료
- [x] 파일 구조 설계
- [x] 게임별 locale 폴더 생성
- [x] WW en.json, ko.json 생성
- [x] Endfield en.json, ko.json 생성
- [x] 공통 UI en.json, ko.json 분리

### Phase 2: Google Sheets 연동 🔄 진행 중
- [ ] WW: i18n 시트 생성 (Characters_i18n, Weapons_i18n, Materials_i18n)
- [ ] WW: Apps Script에 `generateWWTranslations()` 추가
- [ ] Endfield: ko_name 컬럼 추가 또는 i18n 시트 생성
- [ ] Endfield: Apps Script에 `generateEndfieldTranslations()` 추가

### Phase 3: Vue 통합 ⏳ 대기
- [ ] useLocale composable 작성
- [ ] Settings에 언어 선택 UI 추가
- [ ] 캐릭터/무기/재료 표시 컴포넌트에 t() 적용
- [ ] 네비게이션/헤더에 tUI() 적용

### Phase 4: 검증 ⏳ 대기
- [ ] 누락된 번역 key 검출 스크립트
- [ ] 테스트

---

## UI 문자열 목록 (참고용)

<details>
<summary>클릭하여 펼치기</summary>

### Navigation (nav.*)
| key | en | ko |
|-----|----|----|
| nav.home | Home | 홈 |
| nav.planner | Planner | 플래너 |
| nav.character | Character | 캐릭터 |
| nav.weapon | Weapon | 무기 |
| nav.inventory | Inventory | 인벤토리 |
| nav.settings | Settings | 설정 |

### Common (common.*)
| key | en | ko |
|-----|----|----|
| common.save | Save | 저장 |
| common.cancel | Cancel | 취소 |
| common.confirm | Confirm | 확인 |
| common.delete | Delete | 삭제 |
| common.edit | Edit | 수정 |
| common.add | Add | 추가 |
| common.close | Close | 닫기 |
| common.loading | Loading... | 로딩 중... |
| common.selected | Selected | 선택됨 |

### Category (category.*)
| key | en | ko |
|-----|----|----|
| category.credit | Credit | 크레딧 |
| category.common | Common Materials | 공용 재료 |
| category.forgery | Forgery Materials | 단조 재료 |
| category.ascension | Ascension Materials | 돌파 재료 |
| category.boss | Boss Materials | 보스 재료 |
| category.weeklyBoss | Weekly Boss Materials | 주간 보스 재료 |
| category.player_exp | Character EXP | 캐릭터 경험치 |
| category.weapon_exp | Weapon EXP | 무기 경험치 |
| category.special | Special Materials | 특수 재료 |

### Home (home.*)
| key | en | ko |
|-----|----|----|
| home.welcome | Welcome to the Planner | 플래너에 오신 것을 환영합니다 |
| home.selectGame | Select Game | 게임 선택 |
| home.currentGame | Current Game | 현재 게임 |

### Planner (planner.*)
| key | en | ko |
|-----|----|----|
| planner.add_goal | Add Goal | 목표 추가 |
| planner.final_materials | Final Materials | 최종 재료 |
| planner.no_goals | No goals added | 추가된 목표 없음 |

### Inventory (inventory.*)
| key | en | ko |
|-----|----|----|
| inventory.quantity | Quantity | 수량 |

### Settings (settings.*)
| key | en | ko |
|-----|----|----|
| settings.cloud_sync | Cloud Sync | 클라우드 동기화 |
| settings.backup | Backup | 백업 |
| settings.language | Language | 언어 |

</details>

---

*Created: 2026-01-23*
*Updated: 2026-01-26 - 게임별 locale 파일 구조 구현 완료*
