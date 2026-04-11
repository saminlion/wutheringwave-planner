# Girls' Frontline 2: Exilium - Google Sheets Guide

GFL2 게임 데이터를 구글 시트에서 관리하고 JSON으로 자동 변환하는 가이드입니다.

**최종 업데이트:** 2026-02-27

---

## 📋 목차

1. [구글 시트 설정](#구글-시트-설정)
2. [시트 구조](#시트-구조)
3. [Apps Script 설치](#apps-script-설치)
4. [사용 방법](#사용-방법)
5. [JSON 파일 적용](#json-파일-적용)

---

## 구글 시트 설정

### 1. 구글 시트 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 이름: **GFL2 Data Manager**

### 2. 시트 만들기

다음 8개 시트를 생성하세요:

1. **Characters** - 캐릭터 데이터
2. **Weapons** - 무기 데이터
3. **Materials** - 재료 데이터
4. **Locales_EN** - 영어 번역 (i18n)
5. **Locales_KO** - 한국어 번역 (i18n)
6. **MaterialMapping** - 재료 SubCategory 매핑 (참고용)
7. **ID_Reference** - ID 체계 참고용 (읽기 전용)
8. **JSON Output** - JSON 생성 결과 (자동 생성됨)

---

## 시트 구조

### 1. Characters 시트

**열 구성:**

| Column | Name | Type | Formula | Description |
|--------|------|------|---------|-------------|
| A | Seq | Number | - | 순번 (1, 2, 3...) |
| B | Rarity | Number | - | 성급 (4, 5) |
| C | Element | Text | - | 속성 (burn, corrosion, electric, freeze, hydro, physical) |
| D | ElementCode | Number | `=IF(C2="burn",1,IF(C2="corrosion",2,IF(C2="electric",3,IF(C2="freeze",4,IF(C2="hydro",5,IF(C2="physical",6,0))))))` | 속성 코드 자동 변환 |
| E | game_id | Number | `=IF(A2="","",6200000000+(B2*1000000)+(D2*10000)+A2)` | 자동 생성 ID |
| F | display_name | Text | - | 표시 이름 (예: Suomi) |
| G | weapon_type | Text | - | 무기 타입 (hg, ar, rf, sg, smg, bld) |
| H | icon | Text | - | 아이콘 URL |

**game_id 수식 설명:**
- `6200000000 + (Rarity × 1000000) + (ElementCode × 10000) + Seq`
- Rarity 5, Element burn(1), Seq 1 → 6205010001
- Rarity 4, Element electric(3), Seq 1 → 6204030001

**예시 데이터:**

| Seq | Rarity | Element | ElementCode | game_id | display_name | weapon_type | icon |
|-----|--------|---------|-------------|---------|--------------|-------------|------|
| 1 | 5 | burn | 1 | 6205010001 | Suomi | smg | https://... |
| 2 | 5 | freeze | 4 | 6205040002 | Vepley | sg | https://... |
| 3 | 5 | electric | 3 | 6205030003 | Mosin-Nagant | rf | https://... |
| 1 | 4 | electric | 3 | 6204030001 | Groza | ar | https://... |

**중요:**
- **Seq**: 순번 (1, 2, 3...) - 같은 등급 내에서 순차적으로 매김
- **Element**: 현재 character.json에 없으므로 수동으로 채워야 함
- **forgery**: 모든 캐릭터 동일 (stock_boost_bar / transcription_conductor) → 열 불필요, 코드에서 처리

---

### 2. Weapons 시트

**열 구성:**

| Column | Name | Type | Formula | Description |
|--------|------|------|---------|-------------|
| A | Seq | Number | - | 순번 (1, 2, 3...) |
| B | Rarity | Number | - | 성급 (3, 4, 5) |
| C | Type | Text | - | 무기 타입 (hg, ar, rf, sg, smg, bld) |
| D | TypeCode | Number | `=IF(C2="hg",1,IF(C2="ar",2,IF(C2="rf",3,IF(C2="sg",4,IF(C2="smg",5,IF(C2="bld",6,0))))))` | 타입 코드 자동 변환 |
| E | game_id | Number | `=IF(A2="","",6300000000+(B2*1000000)+(D2*10000)+A2)` | 자동 생성 ID |
| F | display_name | Text | - | 표시 이름 |
| G | icon | Text | - | 아이콘 URL |

**game_id 수식 설명:**
- `6300000000 + (Rarity × 1000000) + (TypeCode × 10000) + Seq`
- Rarity 4, HG(1), Seq 1 → 6304010001
- Rarity 5, AR(2), Seq 1 → 6305020001

**예시 데이터:**

| Seq | Rarity | Type | TypeCode | game_id | display_name | icon |
|-----|--------|------|----------|---------|--------------|------|
| 1 | 4 | hg | 1 | 6304010001 | .380 Curva | https://... |
| 2 | 4 | hg | 1 | 6304010002 | CZ75 | https://... |
| 3 | 4 | hg | 1 | 6304010003 | Nagant M1895 | https://... |
| 1 | 5 | hg | 1 | 6305010001 | Hestia | https://... |
| 1 | 4 | ar | 2 | 6304020001 | Caseless Rifle 11 | https://... |

---

### 3. Materials 시트

**열 구성:**

| Column | Name | Type | Formula | Description |
|--------|------|------|---------|-------------|
| A | Seq | Number | - | 순번 (같은 SubCategory 내에서 1, 2, 3...) |
| B | Category | Text | - | 카테고리 (credit, forgery, rare_material, doll_exp, weapon_exp) |
| C | CategoryCode | Number | `=IF(B2="credit",0,IF(B2="forgery",20,IF(B2="rare_material",30,IF(B2="doll_exp",60,IF(B2="weapon_exp",70,0)))))` | 카테고리 코드 자동 변환 |
| D | SubCategory | Text | - | 서브카테고리 (stock_boost_bar, transcription_conductor, rare_material, doll_exp, weapon_exp, credit) |
| E | SubCatCode | Number | - | 서브카테고리 코드 (MaterialMapping 시트 참고) |
| F | game_id | Number | `=IF(A2="","",6100000000+(C2*1000000)+(E2*10000)+A2)` | 자동 생성 ID |
| G | label | Text | - | 표시 이름 |
| H | tier | Number | - | 티어 (1~7, 티어 없으면 공백) |
| I | value | Number | - | EXP 값 (doll_exp/weapon_exp만, 값: 1) |
| J | icon | Text | - | 아이콘 URL |

**game_id 수식 설명:**
- `6100000000 + (CategoryCode × 1000000) + (SubCatCode × 10000) + Seq`
- Seq 1, forgery(20), stock_boost_bar(01) → 6120010001
- Seq 1, forgery(20), transcription_conductor(02) → 6120020001
- Seq 1, doll_exp(60), SubCat 00 → 6160000001

**예시 데이터:**

| Seq | Category | CategoryCode | SubCategory | SubCatCode | game_id | label | tier | value | icon |
|-----|----------|--------------|-------------|------------|---------|-------|------|-------|------|
| 1 | credit | 0 | credit | 0 | 6100000001 | Sardis Gold | | | https://... |
| 1 | forgery | 20 | stock_boost_bar | 1 | 6120010001 | Stock Boost Bar T1 | 1 | | https://... |
| 2 | forgery | 20 | stock_boost_bar | 1 | 6120010002 | Stock Boost Bar T2 | 2 | | https://... |
| 3 | forgery | 20 | stock_boost_bar | 1 | 6120010003 | Stock Boost Bar T3 | 3 | | https://... |
| 4 | forgery | 20 | stock_boost_bar | 1 | 6120010004 | Stock Boost Bar T4 | 4 | | https://... |
| 5 | forgery | 20 | stock_boost_bar | 1 | 6120010005 | Stock Boost Bar T5 | 5 | | https://... |
| 6 | forgery | 20 | stock_boost_bar | 1 | 6120010006 | Stock Boost Bar T6 | 6 | | https://... |
| 7 | forgery | 20 | stock_boost_bar | 1 | 6120010007 | Stock Boost Bar T7 | 7 | | https://... |
| 1 | forgery | 20 | transcription_conductor | 2 | 6120020001 | Inert Metallic Drip | 1 | | https://... |
| 2 | forgery | 20 | transcription_conductor | 2 | 6120020002 | Reactive Metallic Drip | 2 | | https://... |
| 3 | forgery | 20 | transcription_conductor | 2 | 6120020003 | Polarized Metallic Drip | 3 | | https://... |
| 4 | forgery | 20 | transcription_conductor | 2 | 6120020004 | Heterized Metallic Drip | 4 | | https://... |
| 5 | forgery | 20 | transcription_conductor | 2 | 6120020005 | (Tier 5 name) | 5 | | https://... |
| 6 | forgery | 20 | transcription_conductor | 2 | 6120020006 | (Tier 6 name) | 6 | | https://... |
| 1 | rare_material | 30 | rare_material | 1 | 6130010001 | Basic Info Core | | | https://... |
| 1 | doll_exp | 60 | doll_exp | 0 | 6160000001 | Combat Report | | 1 | https://... |
| 1 | weapon_exp | 70 | weapon_exp | 0 | 6170000001 | Analysis Blueprint | | 1 | https://... |

---

### 4. Locales_EN 시트 (영어 번역)

게임 내 이름의 영어 번역을 관리합니다. 플러그인의 `locales/en.json` 파일로 변환됩니다.

**열 구성:**

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | type | Text | 타입 (characters, weapons, materials) |
| B | game_id | Number | 자동 생성된 game_id (Characters/Weapons/Materials 시트의 game_id 참조) |
| C | name_en | Text | 영어 이름 |

**예시 데이터:**

| type | game_id | name_en |
|------|---------|---------|
| characters | 6205010001 | Suomi |
| characters | 6205040002 | Vepley |
| characters | 6204030001 | Groza |
| weapons | 6304010001 | .380 Curva |
| weapons | 6305010001 | Hestia |
| materials | 6100000001 | Sardis Gold |
| materials | 6120010001 | Stock Boost Bar T1 |
| materials | 6120020001 | Inert Metallic Drip |
| materials | 6130010001 | Basic Info Core |
| materials | 6160000001 | Combat Report |
| materials | 6170000001 | Analysis Blueprint |

**팁:** Characters/Weapons/Materials 시트의 `game_id`와 `display_name`/`label` 열을 복사해서 빠르게 채울 수 있습니다.

---

### 5. Locales_KO 시트 (한국어 번역)

게임 내 이름의 한국어 번역을 관리합니다. 플러그인의 `locales/ko.json` 파일로 변환됩니다.

**열 구성:**

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | type | Text | 타입 (characters, weapons, materials) |
| B | game_id | Number | game_id |
| C | name_ko | Text | 한국어 이름 |

**예시 데이터:**

| type | game_id | name_ko |
|------|---------|---------|
| characters | 6205010001 | 수오미 |
| characters | 6205040002 | 벱리 |
| characters | 6204030001 | 그로자 |
| weapons | 6304010001 | .380 쿠르바 |
| weapons | 6305010001 | 헤스티아 |
| materials | 6100000001 | 사르디스 골드 |
| materials | 6120010001 | 스톡 부스트 바 T1 |
| materials | 6120020001 | 비활성 금속 물방울 |
| materials | 6130010001 | 기본 정보 코어 |
| materials | 6160000001 | 전투 보고서 |
| materials | 6170000001 | 분석 설계도 |

---

### 6. MaterialMapping 시트 (참고용)

재료 SubCategory와 코드 매핑을 관리하는 시트입니다.

| Category | SubCategory | Code | Items | Notes |
|----------|-------------|------|-------|-------|
| credit | credit | 00 | Sardis Gold | 재화 |
| forgery | stock_boost_bar | 01 | Stock Boost Bar T1-T7 | 합성: T1→T4만 (3:1) |
| forgery | transcription_conductor | 02 | Metallic Drip T1-T6 | 합성: 전체 (3:1) |
| rare_material | rare_material | 01 | Basic Info Core | 비파밍 (상점/보상) |
| doll_exp | doll_exp | 00 | Combat Report | EXP value: 1 |
| weapon_exp | weapon_exp | 00 | Analysis Blueprint | EXP value: 1 |

**사용법:**
1. 새 재료가 추가되면 이 시트에 먼저 기록
2. SubCatCode를 확인한 후 Materials 시트에 입력

---

### 7. ID_Reference 시트 (읽기 전용)

ID 체계를 빠르게 참고할 수 있는 시트입니다.

| Category | Format | Example | Description |
|----------|--------|---------|-------------|
| Character | 62 RR EE NNNN | 6205010001 | 5성 Burn 캐릭터 Seq 1 |
| Character | 62 RR EE NNNN | 6204030001 | 4성 Electric 캐릭터 Seq 1 |
| Weapon | 63 RR TT NNNN | 6305010001 | 5성 HG 무기 첫 번째 |
| Weapon | 63 RR TT NNNN | 6304020001 | 4성 AR 무기 첫 번째 |
| Material | 61 CC SS NNNN | 6100000001 | Sardis Gold |
| Material | 61 CC SS NNNN | 6120010001 | Stock Boost Bar T1 |
| Material | 61 CC SS NNNN | 6120020001 | Inert Metallic Drip T1 |
| Material | 61 CC SS NNNN | 6130010001 | Basic Info Core |
| Material | 61 CC SS NNNN | 6160000001 | Combat Report |
| Material | 61 CC SS NNNN | 6170000001 | Analysis Blueprint |

---

## Apps Script 설치

### 1. Apps Script 에디터 열기

1. 구글 시트에서 **확장 프로그램 (Extensions)** → **Apps Script** 클릭
2. 새 프로젝트 생성됨

### 2. 스크립트 복사 & 붙여넣기

아래 스크립트를 복사해서 `Code.gs` 파일에 붙여넣으세요:

```javascript
/**
 * Girls' Frontline 2: Exilium Data Manager - Apps Script
 * JSON 파일 자동 생성 스크립트
 */

// 메뉴 추가
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('GFL2 Data')
    .addItem('Generate All JSON Files', 'generateAllJSON')
    .addSeparator()
    .addItem('Generate character.json', 'generateCharacterJSON')
    .addItem('Generate weapon.json', 'generateWeaponJSON')
    .addItem('Generate materials.json', 'generateMaterialsJSON')
    .addSeparator()
    .addItem('Generate locales/en.json', 'generateLocaleEN')
    .addItem('Generate locales/ko.json', 'generateLocaleKO')
    .addToUi();
}

// 모든 JSON 생성
function generateAllJSON() {
  // Clear output sheet first
  clearOutputSheet();

  generateCharacterJSON();
  generateWeaponJSON();
  generateMaterialsJSON();
  generateLocaleEN();
  generateLocaleKO();

  SpreadsheetApp.getUi().alert('All JSON files generated successfully!\n\nCheck the "JSON Output" sheet for results.');
}

// Output 시트 초기화
function clearOutputSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let outputSheet = ss.getSheetByName('JSON Output');
  if (outputSheet) {
    outputSheet.clear();
    outputSheet.getRange('A1').setValue('Filename');
    outputSheet.getRange('B1').setValue('JSON Content');
    outputSheet.getRange('C1').setValue('Notes');
  }
}

// Characters JSON 생성
function generateCharacterJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Characters');
  const data = sheet.getDataRange().getValues();

  const json = {};

  // Header: Seq, Rarity, Element, ElementCode, game_id, display_name, weapon_type, icon

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows

    const gameId = String(row[4]); // Column E: game_id

    json[gameId] = {
      game_id: gameId,
      display_name: row[5], // Column F
      rarity: row[1], // Column B
      element: row[2], // Column C
      weapon_type: row[6], // Column G
      icon: row[7] || '', // Column H
    };
  }

  outputJSON('character.json', json);
}

// Weapons JSON 생성
function generateWeaponJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Weapons');
  const data = sheet.getDataRange().getValues();

  const json = {};

  // Header: Seq, Rarity, Type, TypeCode, game_id, display_name, original_id, icon

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    const gameId = String(row[4]); // Column E: game_id

    json[gameId] = {
      game_id: gameId,
      display_name: row[5], // Column F
      rarity: row[1], // Column B
      type: row[2], // Column C
      icon: row[7] || '', // Column H
    };
  }

  outputJSON('weapon.json', json);
}

// Materials JSON 생성
function generateMaterialsJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Materials');
  const data = sheet.getDataRange().getValues();

  const json = {};

  // Header: Seq, Category, CategoryCode, SubCategory, SubCatCode, game_id,
  //         label, tier, value, icon

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip if no Seq

    const category = row[1]; // Column B
    const gameId = String(row[5]); // Column F: game_id

    if (!json[category]) {
      json[category] = {};
    }

    const material = {
      game_id: gameId,
      label: row[6], // Column G
      icon: row[9] || '', // Column J
      Category: category,
      SubCategory: row[3], // Column D
    };

    // Add tier if exists
    if (row[7]) {
      material.tier = row[7]; // Column H
    }

    // Add value if exists (for EXP items)
    if (row[8]) {
      material.value = row[8]; // Column I
    }

    json[category][gameId] = material;
  }

  outputJSON('materials.json', json);
}

// Locale EN JSON 생성
function generateLocaleEN() {
  generateLocaleJSON('Locales_EN', 'en.json');
}

// Locale KO JSON 생성
function generateLocaleKO() {
  generateLocaleJSON('Locales_KO', 'ko.json');
}

// Locale JSON 생성 (공통)
function generateLocaleJSON(sheetName, filename) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    Logger.log(sheetName + ' sheet not found');
    return;
  }

  const data = sheet.getDataRange().getValues();

  // Header: type, game_id, name
  const json = {
    characters: {},
    weapons: {},
    materials: {}
  };

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0] || !row[1]) continue; // Skip empty rows

    const type = row[0]; // Column A: type (characters, weapons, materials)
    const gameId = String(row[1]); // Column B: game_id
    const name = row[2]; // Column C: name

    if (json[type] !== undefined && name) {
      json[type][gameId] = name;
    }
  }

  outputJSON(filename, json);
}

// JSON 출력 헬퍼
function outputJSON(filename, jsonData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let outputSheet = ss.getSheetByName('JSON Output');

  if (!outputSheet) {
    outputSheet = ss.insertSheet('JSON Output');
    outputSheet.getRange('A1').setValue('Filename');
    outputSheet.getRange('B1').setValue('JSON Content');
    outputSheet.getRange('C1').setValue('Notes');
  }

  const jsonString = JSON.stringify(jsonData, null, 2);

  const lastRow = outputSheet.getLastRow();
  const nextRow = lastRow + 1;

  outputSheet.getRange(nextRow, 1).setValue(filename);
  outputSheet.getRange(nextRow, 2).setValue(jsonString);
  outputSheet.getRange(nextRow, 3).setValue('Copy JSON from column B →');

  Logger.log('Generated ' + filename);
}
```

### 3. 스크립트 저장

1. **파일** → **저장** (또는 Ctrl+S)
2. 프로젝트 이름: **GFL2 Data Manager**

### 4. 권한 승인

1. 스크립트를 처음 실행하면 권한 요청이 나옵니다
2. **검토** → 본인 구글 계정 선택 → **고급** → **GFL2 Data Manager(안전하지 않음)으로 이동** → **허용**

---

## 사용 방법

### 1. 데이터 입력

각 시트에 데이터를 입력합니다:
- **Seq**: 순번 입력
- **Rarity, Element, Type, Category**: 텍스트/숫자 입력
- **game_id**: 자동 생성됨 (수식)
- 나머지 필드: 직접 입력

**중요 - Materials 시트:**
1. 새 재료 추가 전에 **MaterialMapping 시트** 확인
2. SubCategory 이름과 Code를 확인
3. Materials 시트에 입력

### 2. JSON 생성

1. 구글 시트 상단 메뉴에서 **GFL2 Data** 클릭
2. 옵션 선택:
   - **Generate All JSON Files** - 모든 JSON 한번에 생성
   - 또는 개별 파일 생성 선택

### 3. JSON 파일 다운로드

1. 생성 완료 후 **JSON Output** 시트 확인
2. 각 JSON 파일의 내용이 B열에 표시됨
3. JSON 내용 복사:
   - B열 셀 클릭
   - 전체 내용 복사 (Ctrl+C)

### 4. 로컬 프로젝트에 적용

**데이터 파일:**
1. 프로젝트 폴더 열기: `src/games/gfl2/data/`
2. 해당 JSON 파일 열기 (예: `character.json`)
3. 전체 내용을 구글 시트에서 복사한 JSON으로 교체
4. 저장

**번역 파일:**
1. 프로젝트 폴더 열기: `src/games/gfl2/locales/`
2. `en.json` 또는 `ko.json` 열기
3. 전체 내용을 구글 시트에서 복사한 JSON으로 교체
4. 저장

---

## 팁 & 트릭

### 1. 중복 ID 체크

Materials 시트에 새 열 추가:
- 열 이름: `Duplicate Check`
- 수식: `=COUNTIF(F:F, F2)`
- 결과가 1보다 크면 중복 ID 존재

### 2. 색상 코딩

- 5성: 금색 배경
- 4성: 보라색 배경
- 3성: 파란색 배경

**조건부 서식** 사용:
1. Rarity 열 선택
2. **서식** → **조건부 서식**
3. 조건: `셀 값이 5와 같음` → 배경색: 금색

### 3. 데이터 검증

드롭다운 목록으로 입력 실수 방지:

**Element 검증:**
- **데이터** → **데이터 검증**
- 목록: burn, corrosion, electric, freeze, hydro, physical

**Weapon Type 검증:**
- 목록: hg, ar, rf, sg, smg, bld

**Category 검증:**
- 목록: credit, forgery, rare_material, doll_exp, weapon_exp

### 4. MaterialMapping 활용

새 재료 추가 시:
1. MaterialMapping 시트에서 다음 사용 가능한 Code 확인
2. 재료 이름과 Code 기록
3. Materials 시트에서 해당 Code 사용

---

## 문제 해결

### Q: game_id가 생성되지 않아요
A: 수식이 제대로 입력되었는지 확인하세요. Seq 값이 비어있으면 game_id도 생성되지 않습니다.

### Q: JSON이 제대로 생성되지 않아요
A:
1. 시트 이름이 정확한지 확인 (대소문자 구분: Characters, Weapons, Materials)
2. 헤더 행이 첫 번째 행에 있는지 확인
3. Apps Script 로그 확인: **보기** → **로그**

### Q: 한글이 깨져요
A: JSON을 복사할 때 UTF-8 인코딩을 사용하는 텍스트 에디터(VSCode 등)에 붙여넣으세요.

---

## 참고 문서

- [ID_SYSTEM.md](./ID_SYSTEM.md) - ID 체계 상세 가이드
- [README.md](./README.md) - 게임 데이터 상세 정보
- [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) - 플러그인 데이터 포맷
