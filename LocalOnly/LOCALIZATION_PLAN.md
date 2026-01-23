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

## Google Sheets Setup Notes

### 공개 CSV 방식 (간단)
1. Google Sheets 생성
2. File > Share > Publish to web > CSV
3. 각 시트별 CSV URL 획득
4. 스크립트에서 fetch로 가져오기

### API 방식 (권장, 비공개 가능)
1. Google Cloud Console에서 프로젝트 생성
2. Google Sheets API 활성화
3. Service Account 생성 및 JSON key 다운로드
4. 시트에 Service Account 이메일 공유
5. 스크립트에서 googleapis 패키지 사용

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
