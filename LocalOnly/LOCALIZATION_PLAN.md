# Localization (i18n) Plan

## Overview

현재 모든 캐릭터, 무기, 재료 이름이 영문으로 되어있음. 다국어 지원을 위해 Google Sheets에서 번역 데이터를 관리하고 JSON으로 변환하는 시스템 구축 계획.

**지원 언어 (Phase 1):** English, 한국어

---

## Current State

### 데이터 파일 구조
```
src/games/wutheringwave/data/
├── character.json    # name: "Jiyan"
├── weapon.json       # name: "Verdant Summit"
└── materials.json    # label: "LF Whisperin Core"
```

### 현재 표시 방식
- 모든 UI에서 JSON의 `name` 또는 `label` 필드를 직접 사용
- 하드코딩된 영문

---

## Proposed Solution

### 1. Google Sheets 구조

**Sheet 1: Characters**
| key | en | ko | notes |
|-----|----|----|-------|
| jiyan | Jiyan | 지얀 | |
| rover_female | Rover (Female) | 로버 (여) | |
| rover_male | Rover (Male) | 로버 (남) | |

**Sheet 2: Weapons**
| key | en | ko | notes |
|-----|----|----|-------|
| verdant_summit | Verdant Summit | 푸른 정상 | 5★ Sword |
| emerald_of_genesis | Emerald of Genesis | 창세의 에메랄드 | |

**Sheet 3: Materials**
| key | en | ko | notes |
|-----|----|----|-------|
| lf_whisperin_core | LF Whisperin Core | LF 위스퍼링 코어 | Common T2 |
| mf_whisperin_core | MF Whisperin Core | MF 위스퍼링 코어 | Common T3 |
| shell_credit | Shell Credit | 쉘 크레딧 | Currency |

**Sheet 4: UI Strings**
| key | en | ko |
|-----|----|----|
| planner.title | Planner | 플래너 |
| inventory.title | Inventory | 인벤토리 |
| settings.title | Settings | 설정 |

### 2. JSON Output 구조

**Option A: 언어별 파일 분리**
```
src/locales/
├── en/
│   ├── characters.json
│   ├── weapons.json
│   ├── materials.json
│   └── ui.json
└── ko/
    ├── characters.json
    ├── weapons.json
    ├── materials.json
    └── ui.json
```

**Option B: 단일 파일에 언어 포함**
```
src/locales/
├── characters.json  # { "jiyan": { "en": "Jiyan", "ko": "지얀" } }
├── weapons.json
├── materials.json
└── ui.json
```

**권장: Option A** - 번들 사이즈 최적화 (사용 언어만 로드)

### 3. 변환 스크립트 워크플로우

```
[Google Sheets]
    ↓ (Google Sheets API or CSV Export)
[scripts/fetch-translations.js]
    ↓ (Parse & Transform)
[src/locales/{lang}/*.json]
```

**스크립트 기능:**
1. Google Sheets에서 데이터 fetch (API key 또는 공개 CSV)
2. 각 시트를 언어별 JSON으로 변환
3. `src/locales/` 디렉토리에 저장
4. 선택: 타입 검증 (모든 key가 번역되었는지)

### 4. Vue 통합 방안

**Option A: vue-i18n 라이브러리 사용**
```javascript
// main.js
import { createI18n } from 'vue-i18n';
import en from '@/locales/en';
import ko from '@/locales/ko';

const i18n = createI18n({
  locale: 'ko',
  messages: { en, ko }
});
```

**Option B: 커스텀 composable**
```javascript
// composables/useLocale.js
export function useLocale() {
  const locale = ref(localStorage.getItem('locale') || 'en');

  const t = (key, category = 'ui') => {
    return translations[locale.value][category][key] || key;
  };

  return { locale, t, setLocale };
}
```

**권장: Option B** - 라이브러리 의존성 최소화, 현재 구조에 맞춤

### 5. 컴포넌트 사용 예시

**Before:**
```vue
<span>{{ character.name }}</span>
```

**After:**
```vue
<script setup>
import { useLocale } from '@/composables/useLocale';
const { t } = useLocale();
</script>

<span>{{ t(character.key, 'characters') }}</span>
```

---

## Implementation Steps

### Phase 1: 기본 인프라
- [ ] Google Sheets 생성 및 구조 설정
- [ ] 변환 스크립트 작성 (`scripts/fetch-translations.js`)
- [ ] `src/locales/` 디렉토리 구조 생성
- [ ] `useLocale` composable 작성

### Phase 2: 데이터 마이그레이션
- [ ] 기존 character.json에서 key 필드 추가/확인
- [ ] 기존 weapon.json에서 key 필드 추가/확인
- [ ] 기존 materials.json에서 key 필드 추가/확인
- [ ] Google Sheets에 영문 데이터 입력
- [ ] Google Sheets에 한글 번역 입력

### Phase 3: UI 통합
- [ ] Settings에 언어 선택 UI 추가
- [ ] 캐릭터 표시 컴포넌트에 t() 적용
- [ ] 무기 표시 컴포넌트에 t() 적용
- [ ] 재료 표시 컴포넌트에 t() 적용
- [ ] 네비게이션/헤더에 t() 적용

### Phase 4: 검증 및 최적화
- [ ] 누락된 번역 key 검출 스크립트
- [ ] Lazy loading 적용 (필요시)
- [ ] 테스트

---

## 기존 Google Sheets 연동 (수식 기반)

**참고 문서:** [LocalOnly/WutheringWaves/GOOGLE_SHEETS_GUIDE.md](./WutheringWaves/GOOGLE_SHEETS_GUIDE.md)

기존 데이터 시트(Characters, Weapons, Materials)는 수정하지 않고, **별도 번역 시트**를 만들어 수식으로 key/영문명을 참조하는 방식.

**장점:**
- 기존 시트 구조 유지
- 아이템 추가 시 번역 시트에 자동 반영 (수식)
- 번역만 수동 입력하면 됨

---

### 번역 시트 구조

#### Characters_i18n 시트 (신규)

| Column | Name | 수식/값 | 설명 |
|--------|------|--------|------|
| A | game_id | `=Characters!E2` | 자동: Characters 시트의 game_id (고유 식별자) |
| B | en | `=Characters!G2` | 자동: Characters 시트의 display_name |
| C | ko | (직접 입력) | 수동: 한글 번역 |

**game_id를 key로 사용하는 이유:**
- `key` (문자열): 신규 캐릭터의 경우 나중에 변경될 수 있음
- `display_name` (영문): 공식 번역 변경 가능
- **`game_id` (숫자)**: 한번 할당되면 절대 변경되지 않음 → **가장 안정적**

**헤더 행 (Row 1):**
| game_id | en | ko |
|---------|----|----|

**데이터 행 예시 (Row 2~):**
| =Characters!E2 | =Characters!G2 | 지얀 |
| =Characters!E3 | =Characters!G3 | 산화 |
| =Characters!E4 | =Characters!G4 | 방랑자 (파멸) |

**결과:**
| game_id | en | ko |
|---------|----|----|
| 4205010001 | Jiyan | 지얀 |
| 4204000001 | Sanhua | 산화 |
| 4205050001 | Rover (Havoc) | 방랑자 (파멸) |

---

#### Weapons_i18n 시트 (신규)

| Column | Name | 수식/값 |
|--------|------|--------|
| A | game_id | `=Weapons!E2` |
| B | en | `=Weapons!G2` |
| C | ko | (직접 입력) |

---

#### Materials_i18n 시트 (신규)

| Column | Name | 수식/값 |
|--------|------|--------|
| A | game_id | `=Materials!F2` |
| B | en | `=Materials!H2` |
| C | ko | (직접 입력) |

---

#### UI_Strings 시트 (신규, 수동 입력)

UI 문자열은 데이터 시트가 없으므로 전부 수동 입력:

##### Navigation (nav.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| nav.planner | Planner | 플래너 | HomeView, GameSelector |
| nav.character | Character | 캐릭터 | HomeView, GameSelector |
| nav.weapon | Weapon | 무기 | HomeView, GameSelector |
| nav.inventory | Inventory | 인벤토리 | HomeView, GameSelector |
| nav.settings | Settings | 설정 | HomeView, GameSelector |

##### Common (common.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| common.close | Close | 닫기 | CharacterDialog, ErrorBoundary |
| common.save | Save | 저장 | 여러 곳 |
| common.cancel | Cancel | 취소 | 여러 곳 |
| common.all | All | 전체 | CharacterView, WeaponView 필터 |
| common.level | Level | 레벨 | CharacterDialog, WeaponDialog |
| common.currentLevel | Current Level: | 현재 레벨: | CharacterDialog, WeaponDialog |
| common.targetLevel | Target Level: | 목표 레벨: | CharacterDialog, WeaponDialog |
| common.skills | Skills | 스킬 | CharacterDialog |
| common.activate | Activate | 활성화 | CharacterDialog |
| common.processing | Processing... | 처리 중... | DataBackup |
| common.selected | Selected | 선택됨 | GameSelector |

##### Character (character.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| character.selection | Character Selection | 캐릭터 선택 | CharacterView |
| character.filterElement | Element: | 속성: | CharacterView |
| character.filterWeapon | Weapon: | 무기: | CharacterView |
| character.filterRarity | Rarity: | 등급: | CharacterView |

##### Weapon (weapon.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| weapon.selection | Weapon Selection | 무기 선택 | WeaponView |
| weapon.filterType | Type: | 종류: | WeaponView |
| weapon.filterRarity | Rarity: | 등급: | WeaponView |

##### Inventory (inventory.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| inventory.quantity | Quantity: | 수량: | InventoryView |
| inventory.updateSuccess | Item updated successfully | 아이템 업데이트 완료 | InventoryView |
| inventory.invalidInput | Invalid input | 잘못된 입력 | InventoryView |

##### Planner (planner.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| planner.goals | Goals | 목표 | PlannerView |
| planner.finalMaterialNeeds | Final Material Needs | 최종 필요 재료 | FinalMaterialNeeds |
| planner.totalRequired | Total Required Materials | 총 필요 재료 | FinalMaterialNeeds |
| planner.estimatedDays | Estimated Days Required | 예상 소요 일수 | FinalMaterialNeeds |
| planner.estimatedRuns | Estimated Runs: | 예상 런 횟수: | FinalMaterialNeeds |
| planner.estimatedResin | Estimated Resin: | 예상 레진: | FinalMaterialNeeds |
| planner.estimatedTime | Estimated Time: | 예상 시간: | FinalMaterialNeeds |
| planner.estimatedDate | Estimated Date: | 예상 날짜: | FinalMaterialNeeds |
| planner.need | Need: | 필요: | FinalMaterialNeeds |
| planner.owned | Owned: | 보유: | FinalMaterialNeeds |
| planner.synthesize | Synthesize: | 합성: | FinalMaterialNeeds |
| planner.complete | ✓ Complete | ✓ 완료 | FinalMaterialNeeds |

##### Settings (settings.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| settings.description | Manage your planner data - sync to cloud or backup locally. | 플래너 데이터 관리 - 클라우드 동기화 또는 로컬 백업 | SettingsView |
| settings.cloudSync | Cloud Sync | 클라우드 동기화 | CloudSync |

##### Backup (backup.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| backup.storageUsed | Storage Used: | 저장 공간 사용: | DataBackup |
| backup.downloadBackup | 📥 Download Backup | 📥 백업 다운로드 | DataBackup |
| backup.downloadDesc | Save current data as a JSON file | 현재 데이터를 JSON 파일로 저장 | DataBackup |
| backup.restoreBackup | 📤 Restore Backup | 📤 백업 복원 | DataBackup |
| backup.restoreDesc | Restore data from a backup file | 백업 파일에서 데이터 복원 | DataBackup |
| backup.clearAll | 🗑️ Clear All | 🗑️ 전체 삭제 | DataBackup |
| backup.clearDesc | Delete all stored data (cannot be undone) | 저장된 모든 데이터 삭제 (복구 불가) | DataBackup |
| backup.successDownload | Backup file downloaded successfully | 백업 파일 다운로드 완료 | DataBackup |
| backup.failedDownload | Failed to create backup | 백업 생성 실패 | DataBackup |
| backup.confirmRestore | ⚠️ This will overwrite current data with the backup file. Continue? | ⚠️ 현재 데이터가 백업 파일로 덮어씌워집니다. 계속할까요? | DataBackup |
| backup.successRestore | Data restored successfully. Refreshing page... | 데이터 복원 완료. 페이지 새로고침 중... | DataBackup |
| backup.failedRestore | Failed to restore data | 데이터 복원 실패 | DataBackup |
| backup.confirmDelete1 | ⚠️ Delete all data? This action cannot be undone. | ⚠️ 모든 데이터를 삭제할까요? 이 작업은 복구할 수 없습니다. | DataBackup |
| backup.confirmDelete2 | ⚠️⚠️ Are you sure? Have you backed up your data first? | ⚠️⚠️ 정말 삭제할까요? 먼저 백업하셨나요? | DataBackup |
| backup.successDelete | All data deleted. Refreshing page... | 모든 데이터 삭제 완료. 페이지 새로고침 중... | DataBackup |
| backup.failedDelete | Failed to delete data | 데이터 삭제 실패 | DataBackup |

##### Cloud Sync (cloudSync.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| cloudSync.notConfigured | Cloud sync is not configured. | 클라우드 동기화가 설정되지 않았습니다. | CloudSync |
| cloudSync.setupHint | Set Firebase environment variables to enable. | Firebase 환경 변수를 설정하세요. | CloudSync |
| cloudSync.signInPrompt | Sign in to sync your data across devices. | 기기 간 데이터 동기화를 위해 로그인하세요. | CloudSync |
| cloudSync.signInGoogle | Sign in with Google | Google로 로그인 | CloudSync |
| cloudSync.signOut | Sign Out | 로그아웃 | CloudSync |
| cloudSync.lastSynced | Last synced: | 마지막 동기화: | CloudSync |
| cloudSync.itemCount | Items in cloud: | 클라우드 아이템 수: | CloudSync |
| cloudSync.saving | Saving... | 저장 중... | CloudSync |
| cloudSync.saveButton | Save to Cloud | 클라우드에 저장 | CloudSync |
| cloudSync.loading | Loading... | 로딩 중... | CloudSync |
| cloudSync.loadButton | Load from Cloud | 클라우드에서 불러오기 | CloudSync |
| cloudSync.signInFailed | Sign in failed | 로그인 실패 | CloudSync |
| cloudSync.signOutFailed | Sign out failed | 로그아웃 실패 | CloudSync |
| cloudSync.saveSucceeded | Data saved to cloud successfully! | 클라우드에 저장 완료! | CloudSync |
| cloudSync.saveFailed | Save failed | 저장 실패 | CloudSync |
| cloudSync.confirmLoad | This will overwrite your local data. Continue? | 로컬 데이터가 덮어씌워집니다. 계속할까요? | CloudSync |
| cloudSync.loadSuccess | Loaded {count} items. Refresh to apply. | {count}개 아이템 로드 완료. 새로고침하세요. | CloudSync |
| cloudSync.noData | No cloud data found. | 클라우드 데이터 없음 | CloudSync |
| cloudSync.loadFailed | Load failed | 로드 실패 | CloudSync |
| cloudSync.never | Never | 없음 | CloudSync |

##### Error (error.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| error.title | 오류가 발생했습니다 | 오류가 발생했습니다 | ErrorBoundary |
| error.defaultMessage | 일시적인 문제가 발생했습니다. 다시 시도해주세요. | 일시적인 문제가 발생했습니다. 다시 시도해주세요. | ErrorBoundary |
| error.showDetails | 상세 정보 보기 | 상세 정보 보기 | ErrorBoundary |
| error.hideDetails | 상세 정보 숨기기 | 상세 정보 숨기기 | ErrorBoundary |
| error.retry | 다시 시도 | 다시 시도 | ErrorBoundary |
| error.reset | 초기화 | 초기화 | ErrorBoundary |
| error.goBack | 뒤로 가기 | 뒤로 가기 | ErrorBoundary |

##### Home (home.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| home.selectGame | Select a game to start planning | 게임을 선택하여 플래너 시작 | HomeView |
| home.welcome | Welcome to the Planner | 플래너에 오신 것을 환영합니다 | HomeView |
| home.currentGame | Current Game | 현재 게임 | HomeView |

##### Endfield (endfield.*) - 임시 데이터 입력용
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| endfield.title | Endfield Raw Data Input | Endfield 원본 데이터 입력 | EndfieldDataView |
| endfield.description | Endfield's progression system is still unknown... | Endfield 진행 시스템은 아직 미확인... | EndfieldDataView |
| endfield.characterData | Character Data | 캐릭터 데이터 | EndfieldDataView |
| endfield.characterPlaceholder | Paste character JSON data here... | 캐릭터 JSON 데이터 붙여넣기... | EndfieldDataView |
| endfield.saveCharacter | Save Character Data | 캐릭터 데이터 저장 | EndfieldDataView |
| endfield.weaponData | Weapon Data | 무기 데이터 | EndfieldDataView |
| endfield.weaponPlaceholder | Paste weapon JSON data here... | 무기 JSON 데이터 붙여넣기... | EndfieldDataView |
| endfield.saveWeapon | Save Weapon Data | 무기 데이터 저장 | EndfieldDataView |
| endfield.materialData | Material Data | 재료 데이터 | EndfieldDataView |
| endfield.materialPlaceholder | Paste material JSON data here... | 재료 JSON 데이터 붙여넣기... | EndfieldDataView |
| endfield.saveMaterial | Save Material Data | 재료 데이터 저장 | EndfieldDataView |
| endfield.storedData | Current Stored Data | 현재 저장된 데이터 | EndfieldDataView |
| endfield.characters | Characters: | 캐릭터: | EndfieldDataView |
| endfield.weapons | Weapons: | 무기: | EndfieldDataView |
| endfield.materials | Materials: | 재료: | EndfieldDataView |
| endfield.savedCharacters | Saved {count} characters | {count}개 캐릭터 저장됨 | EndfieldDataView |
| endfield.savedWeapons | Saved {count} weapons | {count}개 무기 저장됨 | EndfieldDataView |
| endfield.savedMaterials | Saved {count} materials | {count}개 재료 저장됨 | EndfieldDataView |
| endfield.invalidJSON | Invalid JSON format | 잘못된 JSON 형식 | EndfieldDataView |

##### Category Names (category.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| category.credit | Credit | 크레딧 | FinalMaterialNeeds |
| category.common | Common Materials | 일반 재료 | FinalMaterialNeeds |
| category.forgery | Skill Materials | 스킬 재료 | FinalMaterialNeeds |
| category.ascension | Ascension Materials | 돌파 재료 | FinalMaterialNeeds |
| category.boss | Boss Materials | 보스 재료 | FinalMaterialNeeds |
| category.weeklyBoss | Weekly Boss Materials | 주간 보스 재료 | FinalMaterialNeeds |
| category.weeklyboss | Weekly Boss Materials | 주간 보스 재료 | FinalMaterialNeeds (소문자 버전) |
| category.player_exp | Character EXP | 캐릭터 경험치 | FinalMaterialNeeds |
| category.weapon_exp | Weapon EXP | 무기 경험치 | FinalMaterialNeeds |

##### SubCategory Names - Common Materials (subcategory.common.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| subcategory.common.whisperin_core | Whisperin Core | 위스퍼링 코어 | FinalMaterialNeeds |
| subcategory.common.howler_core | Howler Core | 하울러 코어 | FinalMaterialNeeds |
| subcategory.common.ring | Ring | 링 | FinalMaterialNeeds |
| subcategory.common.mask | Mask | 마스크 | FinalMaterialNeeds |
| subcategory.common.polygon | Polygon | 폴리곤 | FinalMaterialNeeds |
| subcategory.common.residuum | Residuum | 레지듐 | FinalMaterialNeeds |
| subcategory.common.exoswarm | Exoswarm | 엑소스웜 | FinalMaterialNeeds |
| subcategory.common.mech | Mech | 메크 | FinalMaterialNeeds |
| subcategory.common.pendant | Pendant | 펜던트 | FinalMaterialNeeds |

##### SubCategory Names - Forgery Materials (subcategory.forgery.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| subcategory.forgery.metallic_drip | Metallic Drip | 메탈릭 드립 | FinalMaterialNeeds |
| subcategory.forgery.phlogiston | Phlogiston | 플로지스톤 | FinalMaterialNeeds |
| subcategory.forgery.helix | Helix | 헬릭스 | FinalMaterialNeeds |
| subcategory.forgery.residue | Waveworn Residue | 웨이브원 레지듀 | FinalMaterialNeeds |
| subcategory.forgery.cadence | Cadence | 케이던스 | FinalMaterialNeeds |
| subcategory.forgery.polarizer | Polarizer | 폴라라이저 | FinalMaterialNeeds |
| subcategory.forgery.combustor | Combustor | 컴버스터 | FinalMaterialNeeds |
| subcategory.forgery.string | String | 스트링 | FinalMaterialNeeds |
| subcategory.forgery.crystal | Crystal | 크리스탈 | FinalMaterialNeeds |
| subcategory.forgery.shard | Shard | 샤드 | FinalMaterialNeeds |

##### SubCategory Names - Other (subcategory.*)
| key | en | ko | 사용 위치 |
|-----|----|----|----------|
| subcategory.credit | Shell Credit | 쉘 크레딧 | FinalMaterialNeeds |
| subcategory.boss | Boss Material | 보스 재료 | FinalMaterialNeeds |
| subcategory.weeklyboss | Weekly Boss Material | 주간 보스 재료 | FinalMaterialNeeds |
| subcategory.ascension | Ascension Material | 돌파 재료 | FinalMaterialNeeds |
| subcategory.player_exp | Character EXP | 캐릭터 경험치 | FinalMaterialNeeds |
| subcategory.weapon_exp | Weapon EXP | 무기 경험치 | FinalMaterialNeeds |

---

### 새 아이템 추가 시 워크플로우

1. **기존 시트에 아이템 추가** (Characters, Weapons, Materials)
2. **번역 시트에 행 추가:**
   - A열, B열: 수식 복사 (자동으로 key, en 채워짐)
   - C열: 한글 번역 입력
3. **JSON 생성** (Apps Script)

---

### Apps Script - 번역 JSON 생성

```javascript
// 번역 JSON 생성 (별도 함수)
function generateTranslationsJSON() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const translations = {
    en: { characters: {}, weapons: {}, materials: {}, ui: {} },
    ko: { characters: {}, weapons: {}, materials: {}, ui: {} }
  };

  // Characters_i18n (game_id 기반)
  const charSheet = ss.getSheetByName('Characters_i18n');
  if (charSheet) {
    const charData = charSheet.getDataRange().getValues();
    for (let i = 1; i < charData.length; i++) {
      const [gameId, en, ko] = charData[i];
      if (gameId) {
        translations.en.characters[gameId] = en || '';
        translations.ko.characters[gameId] = ko || en || '';
      }
    }
  }

  // Weapons_i18n (game_id 기반)
  const weaponSheet = ss.getSheetByName('Weapons_i18n');
  if (weaponSheet) {
    const weaponData = weaponSheet.getDataRange().getValues();
    for (let i = 1; i < weaponData.length; i++) {
      const [gameId, en, ko] = weaponData[i];
      if (gameId) {
        translations.en.weapons[gameId] = en || '';
        translations.ko.weapons[gameId] = ko || en || '';
      }
    }
  }

  // Materials_i18n (game_id 기반)
  const matSheet = ss.getSheetByName('Materials_i18n');
  if (matSheet) {
    const matData = matSheet.getDataRange().getValues();
    for (let i = 1; i < matData.length; i++) {
      const [gameId, en, ko] = matData[i];
      if (gameId) {
        translations.en.materials[gameId] = en || '';
        translations.ko.materials[gameId] = ko || en || '';
      }
    }
  }

  // UI_Strings (문자열 key 유지 - UI는 game_id 없음)
  const uiSheet = ss.getSheetByName('UI_Strings');
  if (uiSheet) {
    const uiData = uiSheet.getDataRange().getValues();
    for (let i = 1; i < uiData.length; i++) {
      const [key, en, ko] = uiData[i];
      if (key) {
        translations.en.ui[key] = en || key;
        translations.ko.ui[key] = ko || en || key;
      }
    }
  }

  // 언어별 JSON 출력
  outputJSON('translations_en.json', translations.en);
  outputJSON('translations_ko.json', translations.ko);
}
```

---

### JSON Output 예시

**translations_ko.json:**
```json
{
  "characters": {
    "4205010001": "지얀",
    "4204000001": "산화",
    "4205050001": "방랑자 (파멸)"
  },
  "weapons": {
    "4305010001": "푸른 정상"
  },
  "materials": {
    "4110010001": "LF 위스퍼링 코어",
    "4100000001": "쉘 크레딧"
  },
  "ui": {
    "nav.planner": "플래너",
    "common.save": "저장"
  }
}
```

### Vue에서 사용 예시

```javascript
// composables/useLocale.js
const t = (gameId, category = 'characters') => {
  return translations[locale.value][category][gameId] || gameId;
};

// 컴포넌트에서
<span>{{ t(character.game_id, 'characters') }}</span>
<span>{{ t(material.game_id, 'materials') }}</span>
<span>{{ t('nav.planner', 'ui') }}</span>  // UI는 문자열 key
```

---

## File Changes Required

### 신규 파일
- `src/locales/en/*.json`
- `src/locales/ko/*.json`
- `src/composables/useLocale.js`
- `scripts/fetch-translations.js`

### 수정 파일
- `src/components/**/*.vue` - t() 함수 적용
- `src/views/**/*.vue` - t() 함수 적용
- Settings 페이지 - 언어 선택 추가

---

## Notes

<!-- 추가 메모 -->


---

*Created: 2026-01-23*
