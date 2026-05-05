# NTE Plugin Progress

**최종 업데이트:** 2026-05-05

---

## 현재 상태: 🟡 플러그인 구조 완성, 데이터 대기 중

---

## 완료된 작업

### 플러그인 코드 (src/games/nte/)
- [x] `index.js` — 플러그인 엔트리 포인트
- [x] `config.js` — 게임 설정 (속성, 등급, 레벨, 스킬 정의)
- [x] `materialProcessor.js` — 재료 처리 로직
- [x] `components/CharacterDialog.vue` — 캐릭터 다이얼로그 UI
- [x] `data/costs.json` — 현재까지 확인된 비용 데이터 입력
- [x] `data/character.json` — 빈 placeholder (Google Sheets 동기화 대기)
- [x] `data/weapon.json` — 빈 placeholder (Google Sheets 동기화 대기)
- [x] `data/materials.json` — 빈 skeleton (Google Sheets 동기화 대기)
- [x] `data/tiers.js` — 빈 placeholder (materials.json 동기화 후 수동 업데이트 필요)

### 등록 및 연동
- [x] `src/main.js` — ntePlugin 등록 완료
- [x] `scripts/sync-sheets.js` — NTE 시트 설정 추가
- [x] `.github/workflows/sync-data.yml` — NTE 옵션 추가

### 문서
- [x] `LocalOnly/NTE/ID_SYSTEM.md` — ID 체계 확정
- [x] `LocalOnly/NTE/GOOGLE_SHEETS_GUIDE.md` — 스프레드시트 작성 가이드 (ARRAYFORMULAs 포함)
- [x] `LocalOnly/NTE/COSTS_DATA.md` — 비용 데이터 수집 문서

### 테스트
- [x] `tests/games/nte-materialProcessor.test.js`

---

## costs.json 현재 반영 내용

| 구간 | 상태 | 내용 |
|------|------|------|
| 캐릭터 1→20 | ✅ | player_exp 13650, credit 30000 |
| 캐릭터 20→20A | ✅ | ascension x5, credit 25000 |
| 캐릭터 20A→30 | ✅ | player_exp 213000, credit 53750 |
| 캐릭터 30→30A | ✅ | ascension x12, boss x2, credit 50000 |
| 캐릭터 30A 이후 | ⬜ | 미확인 |
| 스킬 Lv1→2 | ✅ | forgery T1 x2, ascension x2, credit 2000 |
| 스킬 Lv2 이후 | ⬜ | 미확인 |
| 무기 1→20 | ✅ | weapon_exp 39000, credit 12000 |
| 무기 20→20A | ✅ | ascension x4, forgery T1 x4 |
| 무기 20A 이후 | ⬜ | 미확인 |

> 새로운 비용 데이터 확인되면 `COSTS_DATA.md` 업데이트 후 `/newgame-costs-update` 또는 직접 `costs.json` 수정

---

## 다음 단계 (순서대로)

### Step 1: GitHub Secret 추가 (1회성)

GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret

```
Name:  SHEET_ID_NTE
Value: 1Vs7Yi07PY2NLe9zetLzk0cEOX4OG2tR2sZSZaIy4h5Y
```

### Step 2: Google Sheets 데이터 입력

스프레드시트: https://docs.google.com/spreadsheets/d/1Vs7Yi07PY2NLe9zetLzk0cEOX4OG2tR2sZSZaIy4h5Y

입력 순서 (`GOOGLE_SHEETS_GUIDE.md` 참고):
1. **Materials 탭** — 재료 데이터 (credit, common, forgery, ascension, boss, weeklyBoss, player_exp, weapon_exp)
2. **Materials_i18n 탭** — 재료 한/영 번역
3. **MaterialLookup 탭** — ascension/boss/weeklyBoss 재료만 복사
4. **Characters 탭** — 캐릭터 데이터 (ARRAYFORMULAs 먼저 A2, D2, E2, K2, M2에 입력)
5. **Characters_i18n 탭** — 캐릭터 한/영 번역
6. **Weapons 탭** — 무기 데이터 (ARRAYFORMULAs: A2, D2, E2, I2)
7. **Weapons_i18n 탭** — 무기 한/영 번역

### Step 3: GitHub Actions 실행

GitHub → Actions → Sync Game Data → Run workflow → game: `nte`

실행 후 자동으로 아래 파일들이 업데이트됨:
- `src/games/nte/data/character.json`
- `src/games/nte/data/weapon.json`
- `src/games/nte/data/materials.json`
- `src/games/nte/locales/ko.json`
- `src/games/nte/locales/en.json`

### Step 4: tiers.js 업데이트 (Claude에게 요청)

materials.json 동기화 완료 후 Claude에게:

> "NTE tiers.js 업데이트 해줘"

Claude가 materials.json에서 common/forgery SubCategory 데이터를 읽어서 tiers.js를 자동으로 채워줌.

### Step 5: config.js 레벨 범위 확장

비용 데이터가 더 확인되면 COSTS_DATA.md를 업데이트하고 Claude에게:

> "NTE costs.json 업데이트 해줘"

그러면 costs.json과 config.js의 레벨 아이템도 같이 확장됨.

---

## 알려진 제한사항

- **캐릭터 레벨 선택기**: 현재 1~30A까지만 (데이터 있는 범위)
- **무기 레벨 선택기**: 현재 1~20A까지만
- **스킬 비용**: Lv1→2만 계산됨 (Lv2 이상은 비용 표시 안됨)
- **패시브 언락 비용**: costs.json에 미입력 (게임 내 확인 필요)
- **스태미나 파밍률**: 미확인 (Estimated Days 계산 불가)
- **tiers.js**: 비어있어서 합성 기능 미작동

---

## 파일 구조 참조

```
src/games/nte/
├── index.js
├── config.js                  ← 레벨/스킬/속성 설정
├── materialProcessor.js       ← 재료 처리 로직
├── components/
│   └── CharacterDialog.vue
└── data/
    ├── index.js
    ├── character.json          ← Google Sheets 동기화 후 채워짐
    ├── weapon.json             ← Google Sheets 동기화 후 채워짐
    ├── materials.json          ← Google Sheets 동기화 후 채워짐
    ├── costs.json              ← 수동 업데이트 (게임 진행하면서)
    └── tiers.js                ← materials.json 동기화 후 수동 업데이트

LocalOnly/NTE/
├── README.md                  ← 게임 기본 정보
├── ID_SYSTEM.md               ← ID 체계
├── GOOGLE_SHEETS_GUIDE.md     ← 스프레드시트 작성 가이드
├── COSTS_DATA.md              ← 비용 데이터 수집
└── PROGRESS.md                ← 이 파일 (현재 진행 상황)
```
