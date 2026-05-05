# Neverness To Everness (NTE) Data Management - Google Sheets Guide

NTE 게임 데이터를 구글 시트에서 관리하고 GitHub Actions로 자동 JSON 변환하는 가이드입니다.

---

## 구글 시트 설정

### 1. 구글 시트 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성 → 이름: **NTE Data Manager**
3. **공유 설정**: 링크가 있는 모든 사용자 → **뷰어** (publish-to-web 불필요)

### 2. 시트(탭) 구성

다음 6개 탭을 생성하세요:

| 탭 이름 | 용도 |
|---------|------|
| **Characters** | 캐릭터 데이터 |
| **Weapons** | 무기 데이터 |
| **Materials** | 재료 데이터 |
| **Characters_i18n** | 캐릭터 한국어/영어 번역 |
| **Weapons_i18n** | 무기 한국어/영어 번역 |
| **Materials_i18n** | 재료 한국어/영어 번역 |

---

## 시트 구조

### Characters 탭

**열 구성:**

| Column | Name | 입력방식 | Description |
|--------|------|---------|-------------|
| A | Seq | **자동** | ARRAYFORMULA (B열 데이터 기준 1,2,3...) |
| B | Rarity | 직접 입력 | 등급 (4=A급, 6=S급) |
| C | Element | 직접 입력 | 속성 ID |
| D | ElementCode | **자동** | ARRAYFORMULA |
| E | weapon_type | 직접 입력 | `synthesis` / `gas` / `liquid` / `solid` / `plasma` |
| F | TypeCode | **자동** | ARRAYFORMULA |
| G | game_id | **자동** | ARRAYFORMULA |
| H | display_name | 직접 입력 | 영어 표시 이름 |
| I | common | 직접 입력 | Common 재료 SubCategory 이름 |
| J | forgery | 직접 입력 | Forgery 재료 SubCategory 이름 |
| K | boss_name | 직접 입력 | Boss 재료 이름 (Materials의 label과 동일하게) |
| L | boss | **자동** | ARRAYFORMULA → game_id |
| M | weeklyboss_name | 직접 입력 | Weekly Boss 재료 이름 (Materials의 label과 동일하게) |
| N | weeklyboss | **자동** | ARRAYFORMULA → game_id |
| O | icon | 직접 입력 | 아이콘 URL |

**ARRAYFORMULA (A2, D2, F2, G2, L2, N2에 입력):**

```
A2: =ARRAYFORMULA(IF(B2:B="","",ROW(A2:A)-ROW(A2)+1))

D2: =ARRAYFORMULA(IF(C2:C="","",IF(C2:C="incantation",1,IF(C2:C="anima",2,IF(C2:C="cosmos",3,IF(C2:C="psyche",4,IF(C2:C="lakshana",5,IF(C2:C="chaos",6,0))))))))

F2: =ARRAYFORMULA(IF(E2:E="","",IF(E2:E="synthesis",10,IF(E2:E="gas",20,IF(E2:E="liquid",30,IF(E2:E="solid",40,IF(E2:E="plasma",50,0)))))))

G2: =ARRAYFORMULA(IF(A2:A="","",7000000000+((B2:B+2)*100000000)+(F2:F*1000000)+(D2:D*100000)+A2:A))

L2: =ARRAYFORMULA(IF(K2:K="","",IFERROR(INDEX(Materials!$F$2:$F,MATCH(K2:K,Materials!$G$2:$G,0)),"")))

N2: =ARRAYFORMULA(IF(M2:M="","",IFERROR(INDEX(Materials!$F$2:$F,MATCH(M2:M,Materials!$G$2:$G,0)),"")))
```

**game_id 계산식:** `7,000,000,000 + (Rarity+2) × 100,000,000 + TypeCode × 1,000,000 + ElementCode × 100,000 + Seq`

| Element 값 | ElementCode |
|------------|-------------|
| incantation | 1 |
| anima | 2 |
| cosmos | 3 |
| psyche | 4 |
| lakshana | 5 |
| chaos | 6 |

| weapon_type | TypeCode |
|-------------|----------|
| synthesis | 10 |
| gas | 20 |
| liquid | 30 |
| solid | 40 |
| plasma | 50 |

**예시:**
```
Rarity 6(→8), gas(20), incantation(1), Seq 1 → 7820100001
Rarity 4(→6), liquid(30), anima(2),    Seq 1 → 7630200001
```

---

### Weapons 탭

| Column | Name | 입력방식 | Description |
|--------|------|---------|-------------|
| A | Seq | **자동** | ARRAYFORMULA (B열 데이터 기준 1,2,3...) |
| B | Rarity | 직접 입력 | 등급 (3=B급, 4=A급, 6=S급) |
| C | Type | 직접 입력 | `synthesis` / `gas` / `liquid` / `solid` / `plasma` |
| D | TypeCode | **자동** | ARRAYFORMULA |
| E | game_id | **자동** | ARRAYFORMULA |
| F | display_name | 직접 입력 | 영어 표시 이름 |
| G | common | 직접 입력 | Common 재료 SubCategory 이름 |
| H | forgery | 직접 입력 | Forgery 재료 SubCategory 이름 |
| I | icon | 직접 입력 | 아이콘 URL |

**ARRAYFORMULA (A2, D2, E2에 입력):**
```
A2: =ARRAYFORMULA(IF(B2:B="","",ROW(A2:A)-ROW(A2)+1))

D2: =ARRAYFORMULA(IF(C2:C="","",IF(C2:C="synthesis",10,IF(C2:C="gas",20,IF(C2:C="liquid",30,IF(C2:C="solid",40,IF(C2:C="plasma",50,0)))))))

E2: =ARRAYFORMULA(IF(A2:A="","",7300000000+(B2:B*10000000)+(D2:D*100000)+A2:A))
```

---

### Materials 탭

| Column | Name | 입력방식 | Description |
|--------|------|---------|-------------|
| A | Category | 직접 입력 | 재료 카테고리 |
| B | CategoryCode | **자동** | ARRAYFORMULA |
| C | SubCategory | 직접 입력 | 서브카테고리 (그룹명) |
| D | SubCatCode | 직접 입력 | 그룹 번호 (01~99) |
| E | Seq | 직접 입력 | 순번 또는 티어 번호 |
| F | game_id | **자동** | ARRAYFORMULA |
| G | label | 직접 입력 | 영어 표시 이름 |
| H | tier | 직접 입력 | 티어 (1~3, 없으면 공백) |
| I | value | 직접 입력 | EXP 값 (EXP 아이템만) |
| J | icon | 직접 입력 | 아이콘 URL |

**ARRAYFORMULA:**
```
B2: =ARRAYFORMULA(IF(A2:A="","",IF(A2:A="credit",0,IF(A2:A="common",10,IF(A2:A="forgery",20,IF(A2:A="ascension",30,IF(A2:A="boss",40,IF(A2:A="weeklyBoss",50,IF(A2:A="player_exp",60,IF(A2:A="weapon_exp",70,0))))))))))

F2: =ARRAYFORMULA(IF(E2:E="","",7100000000+(B2:B*1000000)+(D2:D*10000)+E2:E))
```

**game_id 계산식:** `7100000000 + (CategoryCode × 1,000,000) + (SubCatCode × 10,000) + Seq`

**카테고리 코드 참조:**

| Category | Code | 티어 | SubCatCode 규칙 |
|----------|------|------|----------------|
| credit | 00 | 없음 | 00 고정 |
| common | 10 | 3티어 | 그룹별 01, 02... |
| forgery | 20 | 3티어 | 그룹별 01, 02... |
| ascension | 30 | 없음 | 재료별 01, 02... |
| boss | 40 | 없음 | 보스별 01, 02... |
| weeklyBoss | 50 | 없음 | 보스별 01, 02... |
| player_exp | 60 | 없음 | 00 고정 |
| weapon_exp | 70 | 없음 | 00 고정 |

**예시:**
```
common(10), SubCat 01, Seq 1 → 7110010001 (T1)
common(10), SubCat 01, Seq 2 → 7110010002 (T2)
common(10), SubCat 01, Seq 3 → 7110010003 (T3)
player_exp(60), SubCat 00, Seq 1 → 7160000001
```

---

### Characters_i18n / Weapons_i18n / Materials_i18n 탭

| Column | Name | 입력방식 | Description |
|--------|------|---------|-------------|
| A | game_id | **자동** | ARRAYFORMULA (원본 탭의 game_id 참조) |
| B | en | **자동** | ARRAYFORMULA (원본 탭의 display_name/label 참조) |
| C | ko | 직접 입력 | 한국어 이름 |

**ARRAYFORMULA (A2, B2에 입력):**

```
Characters_i18n
  A2: =ARRAYFORMULA(IF(Characters!G2:G="","",Characters!G2:G))
  B2: =ARRAYFORMULA(IF(Characters!G2:G="","",Characters!H2:H))

Weapons_i18n
  A2: =ARRAYFORMULA(IF(Weapons!E2:E="","",Weapons!E2:E))
  B2: =ARRAYFORMULA(IF(Weapons!E2:E="","",Weapons!F2:F))

Materials_i18n
  A2: =ARRAYFORMULA(IF(Materials!F2:F="","",Materials!F2:F))
  B2: =ARRAYFORMULA(IF(Materials!F2:F="","",Materials!G2:G))
```

새 캐릭터/무기/재료를 추가하면 A열(game_id)과 B열(en)이 자동으로 채워집니다. **C열(ko)만 직접 입력**하세요.

**예시 (Characters_i18n):**

| game_id | en | ko |
|---------|----|----|
| 7206010001 *(자동)* | Character A *(자동)* | 캐릭터A |
| 7204020001 *(자동)* | Character B *(자동)* | 캐릭터B |

---

---

## GitHub Actions 연동

이 프로젝트는 구글 시트 데이터를 **GitHub Actions**로 자동 동기화합니다.
Apps Script 불필요 — 시트를 "링크 있는 모든 사람 뷰어" 공유만 하면 됩니다.

### 1. GitHub Secret 추가

GitHub 저장소 → Settings → Secrets and variables → Actions → **New repository secret**

```
Name:  SHEET_ID_NTE
Value: (구글 시트 URL에서 /d/ 다음 ID 부분)
       예: https://docs.google.com/spreadsheets/d/[여기가_SHEET_ID]/edit
```

### 2. sync-sheets.js에 NTE 추가

`scripts/sync-sheets.js`의 `GAMES` 객체에 추가:

```javascript
nte: {
  sheetId: extractSheetId(process.env.SHEET_ID_NTE),
  dataPath: 'src/games/nte/data',
  localePath: 'src/games/nte/locales',
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

### 3. sync-data.yml에 NTE 추가

`.github/workflows/sync-data.yml`의 `options` 목록에 추가:

```yaml
options:
  - ''
  - wutheringwave
  - endfield
  - gfl2
  - nte          # ← 추가
```

그리고 `Sync from Google Sheets` step의 env에 추가:

```yaml
env:
  SHEET_ID_WUTHERINGWAVE: ${{ secrets.SHEET_ID_WUTHERINGWAVE }}
  SHEET_ID_ENDFIELD: ${{ secrets.SHEET_ID_ENDFIELD }}
  SHEET_ID_GIRLSFRONTIER: ${{ secrets.SHEET_ID_GIRLSFRONTIER }}
  SHEET_ID_NTE: ${{ secrets.SHEET_ID_NTE }}  # ← 추가
```

### 4. 동기화 실행

**자동:** 매일 자정 UTC 자동 실행

**수동:** GitHub → Actions → Sync Game Data → Run workflow → game: `nte` 선택

---

## 데이터 입력 순서

1. **Materials 탭** 먼저 입력
2. **Materials_i18n 탭** 번역 추가
3. **Characters / Weapons 탭** 입력 (game_id 자동 생성, ascension/boss game_id는 Materials!G열에서 자동 조회)
4. **Characters_i18n / Weapons_i18n 탭** 번역 추가
5. GitHub Actions 실행 → JSON 자동 생성 및 커밋

---

## 팁

### 중복 ID 체크
Materials 탭에 열 추가: `=COUNTIF(F:F, F2)` → 1보다 크면 중복

### 데이터 검증 (드롭다운)
- **Rarity**: `4, 6` (캐릭터) / `3, 4, 6` (무기)
- **Element**: `incantation, anima, cosmos, psyche, lakshana, chaos`
- **weapon_type / Type**: `ark`
- **Category**: `credit, common, forgery, ascension, boss, weeklyBoss, player_exp, weapon_exp`

---

## 문제 해결

**Q: game_id가 생성되지 않아요**
A: ARRAYFORMULA가 D2, E2에 제대로 입력되었는지, Seq 값이 있는지 확인

**Q: ascension/boss ID가 비어있어요**
A: Characters/Weapons 탭의 ascension_name/boss_name이 Materials의 `label`(G열)과 정확히 일치하는지 확인

**Q: GitHub Actions에서 시트를 못 읽어요**
A: 시트 공유 설정이 "링크가 있는 모든 사용자 - 뷰어"인지 확인, Secret 값이 올바른지 확인

---

## 참고 문서

- [ID_SYSTEM.md](./ID_SYSTEM.md) - ID 체계 상세
- [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) - JSON 포맷
- [COSTS_DATA.md](./COSTS_DATA.md) - 비용 데이터 수집
- `scripts/sync-sheets.js` - 동기화 스크립트
- `.github/workflows/sync-data.yml` - GitHub Actions 워크플로우
