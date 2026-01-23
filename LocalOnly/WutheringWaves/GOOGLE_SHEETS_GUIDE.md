# Wuthering Waves Data Management - Google Sheets Guide

Wuthering Waves 게임 데이터를 구글 시트에서 관리하고 JSON으로 자동 변환하는 가이드입니다.

**최종 업데이트:** 2026-01-22

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
3. 이름: **Wuthering Waves Data Manager**

### 2. 시트 만들기

다음 7개 시트를 생성하세요:

1. **Characters** - 캐릭터 데이터
2. **Weapons** - 무기 데이터
3. **Materials** - 재료 데이터
4. **MaterialLookup** - 재료 ID 조회용 (VLOOKUP용)
5. **MaterialMapping** - 재료 SubCategory 매핑 (참고용)
6. **ID_Reference** - ID 체계 참고용 (읽기 전용)
7. **JSON Output** - JSON 생성 결과 (자동 생성됨)

---

## 시트 구조

### 1. Characters 시트

**열 구성:**

| Column | Name | Type | Formula | Description |
|--------|------|------|---------|-------------|
| A | Seq | Number | - | 순번 (1, 2, 3...) |
| B | Rarity | Number | - | 성급 (4, 5) |
| C | Element | Text | - | 속성 (glacio, fusion, aero, electro, havoc, spectro, 또는 "normal") |
| D | ElementCode | Number | `=IF(C2="normal",0,IF(C2="glacio",1,IF(C2="fusion",2,IF(C2="aero",3,IF(C2="electro",4,IF(C2="havoc",5,IF(C2="spectro",6,0)))))))` | 속성 코드 자동 변환 |
| E | game_id | Number | `=IF(A2="","",4200000000+(B2*10000000)+(D2*100000)+A2)` | 자동 생성 ID |
| F | key | Text | - | 내부 키 (예: sanhua) |
| G | display_name | Text | - | 표시 이름 (예: Sanhua) |
| H | weapon | Text | - | 무기 타입 (sword, broadblade, gauntlets, pistols, rectifier) |
| I | common | Text | - | Common 재료 SubCategory |
| J | forgery | Text | - | Forgery 재료 SubCategory |
| K | ascension_name | Text | - | Ascension 재료 이름 (드롭다운 선택) |
| L | ascension | Number | `=IFERROR(VLOOKUP(K2,MaterialLookup!$A$2:$B$999,2,FALSE),"")` | Ascension 재료 game_id (자동) |
| M | boss_name | Text | - | Boss 재료 이름 (드롭다운 선택) |
| N | boss | Number | `=IFERROR(VLOOKUP(M2,MaterialLookup!$A$2:$B$999,2,FALSE),"")` | Boss 재료 game_id (자동) |
| O | weeklyBoss_name | Text | - | Weekly Boss 재료 이름 (드롭다운 선택) |
| P | weeklyBoss | Number | `=IFERROR(VLOOKUP(O2,MaterialLookup!$A$2:$B$999,2,FALSE),"")` | Weekly Boss 재료 game_id (자동) |
| Q | icon | Text | - | 아이콘 URL |

**game_id 수식 설명:**
- `4200000000 + (Rarity × 10000000) + (ElementCode × 100000) + Seq`
- Rarity 4, Element normal(0), Seq 1 → 4204000001
- Rarity 5, Element havoc(5), Seq 1 → 4205050001 (Rover Havoc)
- Rarity 5, Element spectro(6), Seq 1 → 4205060001 (Rover Spectro)

**예시 데이터:**

| Seq | Rarity | Element | ElementCode | game_id | key | display_name | weapon | common | forgery | ascension_name | ascension | boss_name | boss | weeklyBoss_name | weeklyBoss | icon |
|-----|--------|---------|-------------|---------|-----|--------------|--------|---------|---------|----------------|-----------|-----------|------|-----------------|------------|------|
| 1 | 4 | normal | 0 | 4204000001 | sanhua | Sanhua | sword | whisperin_core | metallic_drip | Belle Poppy | 4130010001 | Lampylumen Myriad | 4140010001 | Dreamless | 4150010001 | https://... |
| 2 | 4 | normal | 0 | 4204000002 | baizhi | Baizhi | rectifier | howler_core | phlogiston | Coriolus | 4130010002 | Crownless | 4140020001 | Bell-Borne Geochelone | 4150020001 | https://... |

**중요:**
- **일반 캐릭터**: Element = "normal", ElementCode = 0
- **Rover**: 같은 Seq (1)이지만 Element가 다름 (havoc, spectro, aero)
- **ascension, boss, weeklyBoss**: 이름 열(K, M, O)에 재료명 입력 → ID 열(L, N, P)은 자동으로 채워짐

---

### 2. Weapons 시트

**열 구성:**

| Column | Name | Type | Formula | Description |
|--------|------|------|---------|-------------|
| A | Seq | Number | - | 순번 (1, 2, 3...) |
| B | Rarity | Number | - | 성급 (1, 2, 3, 4, 5) |
| C | Type | Text | - | 무기 타입 (sword, broadblade, gauntlets, pistols, rectifier) |
| D | TypeCode | Number | `=IF(C2="sword",1,IF(C2="broadblade",2,IF(C2="gauntlets",3,IF(C2="pistols",4,IF(C2="rectifier",5,0)))))` | 타입 코드 자동 변환 |
| E | game_id | Number | `=IF(A2="","",4300000000+(B2*10000000)+(D2*100000)+A2)` | 자동 생성 ID |
| F | key | Text | - | 내부 키 |
| G | display_name | Text | - | 표시 이름 |
| H | common | Text | - | Common 재료 SubCategory |
| I | forgery | Text | - | Forgery 재료 SubCategory |
| J | icon | Text | - | 아이콘 URL |

**game_id 수식 설명:**
- `4300000000 + (Rarity × 10000000) + (TypeCode × 100000) + Seq`
- Rarity 3, Broadblade (2), Seq 1 → 4303020001
- Rarity 5, Sword (1), Seq 1 → 4305010001

**예시 데이터:**

| Seq | Rarity | Type | TypeCode | game_id | key | display_name | common | forgery | icon |
|-----|--------|------|----------|---------|-----|--------------|---------|---------|------|
| 1 | 3 | broadblade | 2 | 4303020001 | broadblade_of_night | Broadblade of Night | whisperin_core | waveworn_residue | https://... |
| 2 | 3 | broadblade | 2 | 4303020002 | broadblade_of_voyager | Broadblade of Voyager | whisperin_core | waveworn_residue | https://... |
| 1 | 3 | sword | 1 | 4303010001 | sword_of_night | Sword of Night | whisperin_core | waveworn_residue | https://... |
| 1 | 5 | broadblade | 2 | 4305020001 | verdant_summit | Verdant Summit | mask | helix | https://... |

---

### 3. Materials 시트

**열 구성:**

| Column | Name | Type | Formula | Description |
|--------|------|------|---------|-------------|
| A | Category | Text | - | 재료 카테고리 (credit, common, forgery, ascension, boss, weekly, player_exp, weapon_exp) |
| B | CategoryCode | Number | `=IF(A2="credit",0,IF(A2="common",10,IF(A2="forgery",20,IF(A2="ascension",30,IF(A2="boss",40,IF(A2="weekly",50,IF(A2="player_exp",60,IF(A2="weapon_exp",70,0))))))))` | 카테고리 코드 자동 변환 |
| C | SubCategory | Text | - | 서브카테고리 이름 (예: whisperin_core, metallic_drip) |
| D | SubCatCode | Number | - | 서브카테고리 코드 (01~99, MaterialMapping 시트 참고) |
| E | Seq | Number | - | 순번 (티어 재료: 1~4, 기타: 1, 2, 3...) |
| F | game_id | Number | `=IF(E2="","",4100000000+(B2*1000000)+(D2*10000)+E2)` | 자동 생성 ID |
| G | key | Text | - | 내부 키 |
| H | label | Text | - | 표시 이름 |
| I | tier | Number | - | 티어 (1~4, 티어 없으면 공백) |
| J | value | Number | - | EXP 값 (player_exp/weapon_exp만 사용) |
| K | icon | Text | - | 아이콘 URL |

**game_id 수식 설명:**
- `4100000000 + (CategoryCode × 1000000) + (SubCatCode × 10000) + Seq`
- common (10), whisperin_core (01), Seq 1 → 4110010001
- forgery (20), metallic_drip (01), Seq 1 → 4120010001
- player_exp (60), SubCat 00, Seq 1 → 4160000001

**예시 데이터:**

| Category | CategoryCode | SubCategory | SubCatCode | Seq | game_id | key | label | tier | value | icon |
|----------|--------------|-------------|------------|-----|---------|-----|-------|------|-------|------|
| credit | 0 | credit | 0 | 1 | 4100000001 | credit | Shell Credit | | | https://... |
| common | 10 | whisperin_core | 1 | 1 | 4110010001 | lf_whisperin_core | LF Whisperin Core | 1 | | https://... |
| common | 10 | whisperin_core | 1 | 2 | 4110010002 | mf_whisperin_core | MF Whisperin Core | 2 | | https://... |
| common | 10 | whisperin_core | 1 | 3 | 4110010003 | hf_whisperin_core | HF Whisperin Core | 3 | | https://... |
| common | 10 | whisperin_core | 1 | 4 | 4110010004 | ff_whisperin_core | FF Whisperin Core | 4 | | https://... |
| forgery | 20 | metallic_drip | 1 | 1 | 4120010001 | lf_metallic_drip | LF Metallic Drip | 1 | | https://... |
| player_exp | 60 | player_exp | 0 | 1 | 4160000001 | player_exp_small | Player EXP (Small) | | 1000 | https://... |
| weapon_exp | 70 | weapon_exp | 0 | 1 | 4170000001 | weapon_exp_small | Weapon EXP (Small) | | 1000 | https://... |

---

### 4. MaterialLookup 시트 (VLOOKUP용)

Characters/Weapons 시트에서 재료 ID를 자동으로 가져오기 위한 조회용 시트입니다.

**열 구성:**

| Column | Name | Description |
|--------|------|-------------|
| A | name | 재료 이름 (검색 키) |
| B | game_id | 재료 game_id |
| C | category | 카테고리 (ascension, boss, weekly) |

**데이터 작성 방법:**

Materials 시트에서 `ascension`, `boss`, `weekly` 카테고리 재료만 추출해서 입력합니다.

**예시 데이터:**

| name | game_id | category |
|------|---------|----------|
| Belle Poppy | 4130010001 | ascension |
| Coriolus | 4130010002 | ascension |
| Wintry Bell | 4130010003 | ascension |
| Pecok Flower | 4130010004 | ascension |
| Lanternberry | 4130010005 | ascension |
| Violet Coral | 4130010006 | ascension |
| Terraspawn Fungus | 4130010007 | ascension |
| Iris | 4130010008 | ascension |
| Loong's Pearl | 4130010009 | ascension |
| Lampylumen Myriad | 4140010001 | boss |
| Crownless | 4140020001 | boss |
| Mech Abomination | 4140030001 | boss |
| Thundering Mephis | 4140040001 | boss |
| Impermanence Heron | 4140050001 | boss |
| Feilian Beringal | 4140060001 | boss |
| Mourning Aix | 4140070001 | boss |
| Inferno Rider | 4140080001 | boss |
| Dreamless | 4150010001 | weekly |
| Bell-Borne Geochelone | 4150020001 | weekly |
| Jué | 4150030001 | weekly |
| **Unknown Ascension** | **4130019999** | **placeholder** |
| **Unknown Boss** | **4140019999** | **placeholder** |
| **Unknown Weekly Boss** | **4150019999** | **placeholder** |

**Placeholder 사용법:**
- 미출시/미확정 재료는 "Unknown Ascension", "Unknown Boss", "Unknown Weekly Boss" 선택
- UI에서 "?" 아이콘으로 표시됨
- 실제 재료 확정 후 해당 이름으로 변경

**자동 생성 팁:**

Materials 시트를 완성한 후, 다음 필터로 MaterialLookup 데이터를 쉽게 생성할 수 있습니다:
1. Materials 시트에서 Category가 `ascension`, `boss`, `weekly`인 행만 필터
2. `label`과 `game_id` 열 복사
3. MaterialLookup 시트에 붙여넣기

---

### 5. MaterialMapping 시트 (참고용)

재료 SubCategory와 코드 매핑을 관리하는 시트입니다.

**열 구성:**

| Category | SubCategory | Code | Notes |
|----------|-------------|------|-------|
| common | whisperin_core | 01 | 초기 지역 |
| common | howler_core | 02 | 초기 지역 |
| common | ring | 03 | 초기 지역 |
| common | mask | 04 | 1.0 업데이트 |
| common | polyphonic | 05 | 1.1 업데이트 |
| common | residuum | 06 | 1.2 업데이트 |
| common | (새 재료 이름) | 07 | (추가 시 기입) |
| forgery | metallic_drip | 01 | 초기 지역 |
| forgery | phlogiston | 02 | 초기 지역 |
| forgery | helix | 03 | 1.0 업데이트 |
| forgery | waveworn_residue | 04 | 1.1 업데이트 |
| forgery | cadence | 05 | 1.2 업데이트 |
| forgery | (새 재료 이름) | 06 | (추가 시 기입) |
| ascension | ascension | 01 | 통일 |
| boss | dreamless | 01 | 금주 |
| boss | crownless | 02 | 리나시타 |
| boss | (새 보스 이름) | 03 | (추가 시 기입) |
| weekly | dreamless_weekly | 01 | 금주 |
| weekly | crownless_weekly | 02 | 리나시타 |
| weekly | (새 보스 이름) | 03 | (추가 시 기입) |

**사용법:**
1. 새 재료가 추가되면 이 시트에 먼저 기록
2. SubCatCode를 확인한 후 Materials 시트에 입력

---

### 6. ID_Reference 시트 (읽기 전용)

ID 체계를 빠르게 참고할 수 있는 시트입니다. `ID_SYSTEM.md` 내용을 요약해서 넣으세요.

**예시:**

| Category | Format | Example | Description |
|----------|--------|---------|-------------|
| Character | 42 RR EE NNNN | 4204000001 | 4성 일반 캐릭터 첫 번째 |
| Character (Rover) | 42 RR EE NNNN | 4205050001 | 5성 Rover (Havoc) |
| Weapon | 43 RR TT NNNN | 4303020001 | 3성 Broadblade 첫 번째 |
| Material | 41 CC SS NNNN | 4110010001 | Common, whisperin_core, LF |

---

## Apps Script 설치

### 1. Apps Script 에디터 열기

1. 구글 시트에서 **확장 프로그램 (Extensions)** → **Apps Script** 클릭
2. 새 프로젝트 생성됨

### 2. 스크립트 복사 & 붙여넣기

아래 스크립트를 복사해서 `Code.gs` 파일에 붙여넣으세요:

```javascript
/**
 * Wuthering Waves Data Manager - Apps Script
 * JSON 파일 자동 생성 스크립트
 */

// 메뉴 추가
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('WW Data')
    .addItem('Generate All JSON Files', 'generateAllJSON')
    .addSeparator()
    .addItem('Generate character.json', 'generateCharacterJSON')
    .addItem('Generate weapon.json', 'generateWeaponJSON')
    .addItem('Generate inventoryItem.json', 'generateMaterialsJSON')
    .addToUi();
}

// 모든 JSON 생성
function generateAllJSON() {
  generateCharacterJSON();
  generateWeaponJSON();
  generateMaterialsJSON();

  SpreadsheetApp.getUi().alert('All JSON files generated successfully!\\n\\nCheck the "JSON Output" sheet for results.');
}

// Characters JSON 생성
function generateCharacterJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Characters');
  const data = sheet.getDataRange().getValues();

  const json = {};

  // Skip header row (index 0)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows
    if (!row[0]) continue;

    const key = row[5]; // Column F: key
    const element = row[2]; // Column C: element

    json[key] = {
      game_id: row[4], // Column E: game_id
      display_name: row[6], // Column G: display_name
      element: element === 'normal' ? '' : element, // 빈 문자열 또는 실제 속성
      weapon: row[7], // Column H: weapon
      icon: row[16] || '', // Column Q: icon
      rarity: row[1], // Column B: rarity
      common: row[8], // Column I: common
      forgery: row[9], // Column J: forgery
      ascension: row[11], // Column L: ascension (game_id, VLOOKUP 결과)
      boss: row[13], // Column N: boss (game_id, VLOOKUP 결과)
      weeklyBoss: row[15], // Column P: weeklyBoss (game_id, VLOOKUP 결과)
      bonus_stats: []
    };
  }

  outputJSON('character.json', json);
}

// Weapons JSON 생성
function generateWeaponJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Weapons');
  const data = sheet.getDataRange().getValues();

  const json = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    const key = row[5]; // Column F: key

    json[key] = {
      game_id: row[4], // Column E: game_id
      display_name: row[6], // Column G: display_name
      rarity: row[1], // Column B: rarity
      type: row[2], // Column C: type
      icon: row[9] || '', // Column J: icon
      common: row[7], // Column H: common
      forgery: row[8] // Column I: forgery
    };
  }

  outputJSON('weapon.json', json);
}

// Materials JSON 생성 (inventoryItem.json 형식)
function generateMaterialsJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Materials');
  const data = sheet.getDataRange().getValues();

  const json = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[4]) continue; // Skip if no Seq

    const category = row[0]; // Column A: Category
    const key = row[6]; // Column G: key

    // Initialize category if needed
    if (!json[category]) {
      json[category] = {};
    }

    const material = {
      game_id: row[5], // Column F: game_id
      icon: row[10] || '', // Column K: icon
      label: row[7], // Column H: label
      Category: category,
      SubCategory: row[2], // Column C: SubCategory
      rarity: 2 // Default rarity
    };

    // Add tier if exists
    if (row[8]) {
      material.tier = row[8]; // Column I: tier
    }

    // Add value if exists (for EXP items)
    if (row[9]) {
      material.value = row[9]; // Column J: value
    }

    json[category][key] = material;
  }

  outputJSON('inventoryItem.json', json);
}

// JSON 출력 헬퍼
function outputJSON(filename, jsonData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let outputSheet = ss.getSheetByName('JSON Output');

  // Create output sheet if it doesn't exist
  if (!outputSheet) {
    outputSheet = ss.insertSheet('JSON Output');
    outputSheet.getRange('A1').setValue('Filename');
    outputSheet.getRange('B1').setValue('JSON Content');
    outputSheet.getRange('C1').setValue('Download Link');
  }

  const jsonString = JSON.stringify(jsonData, null, 2);

  // Find next empty row
  const lastRow = outputSheet.getLastRow();
  const nextRow = lastRow + 1;

  outputSheet.getRange(nextRow, 1).setValue(filename);
  outputSheet.getRange(nextRow, 2).setValue(jsonString);

  // Create download link (user needs to copy-paste JSON manually)
  const downloadMsg = 'Copy JSON from column B →';
  outputSheet.getRange(nextRow, 3).setValue(downloadMsg);

  Logger.log(`Generated ${filename}`);
}
```

### 3. 스크립트 저장

1. **파일** → **저장** (또는 Ctrl+S)
2. 프로젝트 이름: **WW Data Manager**

### 4. 권한 승인

1. 스크립트를 처음 실행하면 권한 요청이 나옵니다
2. **검토** → 본인 구글 계정 선택 → **고급** → **WW Data Manager(안전하지 않음)으로 이동** → **허용**

---

## 사용 방법

### 1. 데이터 입력

각 시트에 데이터를 입력합니다:
- **Seq**: 순번만 입력 (1, 2, 3...)
- **Rarity, Element, Type, Category**: 텍스트/숫자 입력
- **game_id**: 자동 생성됨 (수식)
- 나머지 필드: 직접 입력

**중요 - Materials 시트:**
1. 새 재료 추가 전에 **MaterialMapping 시트** 확인
2. SubCategory 이름과 Code를 확인
3. Materials 시트에 입력

### 2. JSON 생성

1. 구글 시트 상단 메뉴에서 **WW Data** 클릭
2. 옵션 선택:
   - **Generate All JSON Files** - 모든 JSON 한번에 생성
   - 또는 개별 파일 생성 선택

### 3. JSON 파일 다운로드

1. 생성 완료 후 **JSON Output** 시트로 자동 이동
2. 각 JSON 파일의 내용이 B열에 표시됨
3. JSON 내용 복사:
   - B열 셀 클릭
   - 전체 내용 복사 (Ctrl+C)

### 4. 로컬 프로젝트에 적용

1. 프로젝트 폴더 열기: `d:\Develop\wutheringwave-planner\src\data\`
2. 해당 JSON 파일 열기 (예: `character.json`)
3. 전체 내용을 구글 시트에서 복사한 JSON으로 교체
4. 저장

---

## JSON 파일 적용

### 자동 적용 (선택사항 - Node.js 스크립트)

JSON 파일을 자동으로 다운로드하고 적용하는 스크립트를 만들 수도 있습니다.

하지만 수동 복사-붙여넣기도 충분히 간단하므로, 일단은 수동 방식을 사용하고 나중에 필요하면 자동화를 추가하는 것을 권장합니다.

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

Rarity, Element, Type, Category 같은 열에 **데이터 검증** 추가:
- **데이터** → **데이터 검증**
- 조건: 목록 (예: 4, 5)

**Element 검증 예시:**
- 목록: normal, glacio, fusion, aero, electro, havoc, spectro

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
1. 시트 이름이 정확한지 확인 (대소문자 구분)
2. 헤더 행이 첫 번째 행에 있는지 확인
3. Apps Script 로그 확인: **보기** → **로그**

### Q: 한글이 깨져요
A: JSON을 복사할 때 UTF-8 인코딩을 사용하는 텍스트 에디터(VSCode 등)에 붙여넣으세요.

### Q: Rover의 ID가 중복돼요
A: Rover는 속성별로 다른 ID를 가져야 합니다. Element와 ElementCode가 제대로 입력되었는지 확인하세요.

---

## 다음 단계

1. 구글 시트 템플릿 생성
2. Apps Script 설치
3. 샘플 데이터 입력 테스트
4. JSON 생성 및 프로젝트 적용
5. 실제 WW 데이터 입력 시작!

---

## 참고 문서

- [ID_SYSTEM.md](./ID_SYSTEM.md) - ID 체계 상세 가이드
- [ID_MIGRATION_MAP.json](./ID_MIGRATION_MAP.json) - 기존 ID → 새 ID 매핑
