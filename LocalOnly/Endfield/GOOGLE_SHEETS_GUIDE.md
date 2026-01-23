# Endfield Data Management - Google Sheets Guide

Endfield 게임 데이터를 구글 시트에서 관리하고 JSON으로 자동 변환하는 가이드입니다.

**최종 업데이트:** 2026-01-24

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
3. 이름: **Endfield Data Manager**

### 2. 시트 만들기

다음 6개 시트를 생성하세요:

1. **Characters** - 캐릭터 데이터
2. **Weapons** - 무기 데이터
3. **Materials** - 재료 데이터
4. **Costs** - 레벨/스킬 비용 데이터
5. **SynthesisRecipes** - 합성 레시피
6. **ID_Reference** - ID 체계 참고용 (읽기 전용)

---

## 시트 구조

### 1. Characters 시트

**열 구성:**

| Column | Name | Type | Formula | Description |
|--------|------|------|---------|-------------|
| A | Seq | Number | - | 순번 (1, 2, 3...) |
| B | Rarity | Number | - | 성급 (4, 5, 6) |
| C | Element | Text | - | 속성 (physical, heat, nature, cryo, electric) |
| D | ElementCode | Number | `=IF(C2="physical",1,IF(C2="heat",2,IF(C2="nature",3,IF(C2="cryo",4,IF(C2="electric",5,0)))))` | 속성 코드 자동 변환 |
| E | game_id | Number | `=IF(A2="","",5200000000+(B2*10000000)+(D2*100000)+A2)` | 자동 생성 ID |
| F | key | Text | - | 내부 키 (예: clemence) |
| G | display_name | Text | - | 표시 이름 (예: Clemence) |
| H | weapon | Text | - | 무기 타입 (예: pistol, sword) |
| I | common | Text | - | Common 재료 SubCategory |
| J | forgery | Text | - | Forgery 재료 SubCategory |
| K | ascension | Number | - | Ascension 재료 game_id |
| L | boss | Number | - | Boss 재료 game_id |
| M | weeklyBoss | Number | - | Weekly Boss 재료 game_id |
| N | icon | Text | - | 아이콘 URL |

**game_id 수식 설명:**
- `5200000000 + (Rarity × 10000000) + (ElementCode × 100000) + Seq`
- Rarity 6, Physical (01), Seq 1 → 5206010001
- Rarity 6, Heat (02), Seq 1 → 5206020001
- Rarity 5, Cryo (04), Seq 1 → 5205040001

**예시 데이터:**

| Seq | Rarity | Element | ElementCode | game_id | key | display_name | weapon | common | forgery | ascension | boss | weeklyBoss | icon |
|-----|--------|---------|-------------|---------|-----|--------------|--------|---------|---------|-----------|------|------------|------|
| 1 | 6 | cryo | 4 | 5206040001 | clemence | Clemence | pistol | circuit_core | combat_data | 5130010001 | 5140010001 | 5150010001 | https://... |
| 2 | 6 | heat | 2 | 5206020001 | alice | Alice | sword | crystal_shard | tactical_manual | 5130010002 | 5140010002 | 5150010002 | https://... |

---

### 2. Weapons 시트

**열 구성:**

| Column | Name | Type | Formula | Description |
|--------|------|------|---------|-------------|
| A | Seq | Number | - | 순번 (1, 2, 3...) |
| B | Rarity | Number | - | 성급 (3, 4, 5, 6) |
| C | Type | Text | - | 무기 타입 (sword, greatsword, polearm, arts, pistol) |
| D | TypeCode | Number | `=IF(C2="sword",1,IF(C2="greatsword",2,IF(C2="polearm",3,IF(C2="arts",4,IF(C2="pistol",5,0)))))` | 타입 코드 자동 변환 |
| E | game_id | Number | `=IF(A2="","",5300000000+(B2*10000000)+(D2*100000)+A2)` | 자동 생성 ID |
| F | key | Text | - | 내부 키 |
| G | display_name | Text | - | 표시 이름 |
| H | common | Text | - | Common 재료 SubCategory |
| I | forgery | Text | - | Forgery 재료 SubCategory |
| J | icon | Text | - | 아이콘 URL |

**game_id 수식 설명:**
- `5300000000 + (Rarity × 10000000) + (TypeCode × 100000) + Seq`
- Rarity 6, 한손검 (01), Seq 1 → 5306010001
- Rarity 5, 양손검 (02), Seq 1 → 5305020001
- Rarity 3, 장병기 (03), Seq 1 → 5303030001

**예시 데이터:**

| Seq | Rarity | Type | TypeCode | game_id | key | display_name | common | forgery | icon |
|-----|--------|------|----------|---------|-----|--------------|---------|---------|------|
| 1 | 6 | sword | 1 | 5306010001 | blade_of_dawn | Blade of Dawn | metal_plate | weapon_blueprint | https://... |
| 2 | 6 | greatsword | 2 | 5306020001 | great_blade | Great Blade | alloy_plate | tech_schematic | https://... |
| 3 | 5 | polearm | 3 | 5305030001 | hunters_lance | Hunter's Lance | metal_plate | weapon_blueprint | https://... |

---

### 3. Materials 시트

**열 구성:**

| Column | Name | Type | Formula | Description |
|--------|------|------|---------|-------------|
| A | Category | Text | - | 재료 카테고리 (예: common-character, player-exp) |
| B | CategoryCode | Number | `=IF(A2="credit",0,IF(A2="common-character",10,IF(A2="common-weapon",11,IF(A2="forgery-character",20,IF(A2="forgery-weapon",21,IF(A2="ascension-character",30,IF(A2="ascension-weapon",31,IF(A2="boss",40,IF(A2="weekly-boss",50,IF(A2="player-exp",60,IF(A2="weapon-exp",70,0)))))))))))` | 카테고리 코드 자동 변환 |
| C | SubCatCode | Number | - | 서브카테고리 코드 (01~99, credit/exp는 00) |
| D | Seq | Number | - | 순번 (1, 2, 3...) |
| E | game_id | Number | `=IF(D2="","",5100000000+(B2*1000000)+(C2*10000)+D2)` | 자동 생성 ID |
| F | key | Text | - | 내부 키 |
| G | label | Text | - | 표시 이름 |
| H | tier | Number | - | 티어 (1~4, 티어 없으면 공백) |
| I | value | Number | - | EXP 값 (player_exp/weapon_exp만 사용) |
| J | icon | Text | - | 아이콘 URL |

**game_id 수식 설명:**
- `5100000000 + (CategoryCode × 1000000) + (SubCatCode × 10000) + Seq`
- common-character (10), SubCat 01, Seq 1 → 5110010001
- forgery-character (20), SubCat 01, Seq 1 → 5120010001
- player-exp (60), SubCat 00, Seq 1 → 5160000001

**예시 데이터:**

| Category | CategoryCode | SubCatCode | Seq | game_id | key | label | tier | value | icon |
|----------|--------------|------------|-----|---------|-----|-------|------|-------|------|
| credit | 0 | 0 | 1 | 5100000001 | credit | Credit | | | https://... |
| common-character | 10 | 1 | 1 | 5110010001 | circuit_core_lf | Circuit Core LF | 1 | | https://... |
| common-character | 10 | 1 | 2 | 5110010002 | circuit_core_mf | Circuit Core MF | 2 | | https://... |
| common-character | 10 | 1 | 3 | 5110010003 | circuit_core_hf | Circuit Core HF | 3 | | https://... |
| common-character | 10 | 1 | 4 | 5110010004 | circuit_core_ff | Circuit Core FF | 4 | | https://... |
| player-exp | 60 | 0 | 1 | 5160000001 | player_exp_small | Player EXP (Small) | | 1000 | https://... |
| player-exp | 60 | 0 | 2 | 5160000002 | player_exp_medium | Player EXP (Medium) | | 3000 | https://... |

---

### 4. Costs 시트

**참고:** Costs는 구조가 복잡하므로 JSON 파일을 직접 수정하는 것을 권장합니다.

Apps Script에서는 Costs 변환을 제외하고, Character/Weapon/Materials/SynthesisRecipes만 변환합니다.

---

### 5. SynthesisRecipes 시트

**열 구성:**

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | recipe_name | Text | 레시피 이름 (예: ascension_crystal_alpha_recipe) |
| B | result_game_id | Number | 결과물 game_id |
| C | result_quantity | Number | 결과물 수량 (보통 1) |
| D | ingredient1_id | Number | 재료 1 game_id |
| E | ingredient1_qty | Number | 재료 1 수량 |
| F | ingredient2_id | Number | 재료 2 game_id (없으면 공백) |
| G | ingredient2_qty | Number | 재료 2 수량 |
| H | ingredient3_id | Number | 재료 3 game_id (없으면 공백) |
| I | ingredient3_qty | Number | 재료 3 수량 |
| J | ingredient4_id | Number | 재료 4 game_id (없으면 공백) |
| K | ingredient4_qty | Number | 재료 4 수량 |

**예시 데이터:**

| recipe_name | result_game_id | result_quantity | ingredient1_id | ingredient1_qty | ingredient2_id | ingredient2_qty | ingredient3_id | ingredient3_qty |
|-------------|----------------|-----------------|----------------|-----------------|----------------|-----------------|----------------|-----------------|
| ascension_crystal_alpha | 5130010001 | 1 | 5110010001 | 1 | 5120010001 | 3 | 5110010002 | 1 |
| boss_core_a_recipe | 5140010001 | 1 | 5110010003 | 2 | 5120010002 | 2 | | |

---

### 6. ID_Reference 시트 (읽기 전용)

ID 체계를 빠르게 참고할 수 있는 시트입니다. `ID_SYSTEM.md` 내용을 요약해서 넣으세요.

**예시:**

| Category | Format | Example | Description |
|----------|--------|---------|-------------|
| Character | 52 RR 00 NNNN | 5206000001 | 6성 캐릭터 첫 번째 |
| Weapon | 53 RR TT NNNN | 5306010001 | 6성 Sword 첫 번째 |
| Material | 51 CC SS NNNN | 5110010001 | Common-Character, SubCat 01, 첫 번째 |

---

## Apps Script 설치

### 1. Apps Script 에디터 열기

1. 구글 시트에서 **확장 프로그램 (Extensions)** → **Apps Script** 클릭
2. 새 프로젝트 생성됨

### 2. 스크립트 복사 & 붙여넣기

아래 스크립트를 복사해서 `Code.gs` 파일에 붙여넣으세요:

```javascript
/**
 * Endfield Data Manager - Apps Script
 * JSON 파일 자동 생성 스크립트
 */

// 메뉴 추가
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Endfield Data')
    .addItem('Generate All JSON Files', 'generateAllJSON')
    .addSeparator()
    .addItem('Generate character.json', 'generateCharacterJSON')
    .addItem('Generate weapon.json', 'generateWeaponJSON')
    .addItem('Generate materials.json', 'generateMaterialsJSON')
    .addItem('Generate synthesisRecipes.json', 'generateSynthesisJSON')
    .addToUi();
}

// 모든 JSON 생성
function generateAllJSON() {
  generateCharacterJSON();
  generateWeaponJSON();
  generateMaterialsJSON();
  generateSynthesisJSON();

  SpreadsheetApp.getUi().alert('All JSON files generated successfully!\n\nCheck the "JSON Output" sheet for results.');
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

    json[key] = {
      game_id: row[4], // Column E: game_id
      display_name: row[6], // Column G: display_name
      element: row[2], // Column C: element
      weapon: row[7], // Column H: weapon
      icon: row[13] || '', // Column N: icon
      rarity: row[1], // Column B: rarity
      common: row[8], // Column I: common
      forgery: row[9], // Column J: forgery
      ascension: row[10], // Column K: ascension
      boss: row[11], // Column L: boss
      weeklyBoss: row[12], // Column M: weeklyBoss
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

// Materials JSON 생성
function generateMaterialsJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Materials');
  const data = sheet.getDataRange().getValues();

  const json = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[3]) continue; // Skip if no Seq

    const category = row[0]; // Column A: Category
    const key = row[5]; // Column F: key

    // Initialize category if needed
    if (!json[category]) {
      json[category] = {};
    }

    const material = {
      game_id: row[4], // Column E: game_id
      icon: row[9] || '', // Column J: icon
      label: row[6], // Column G: label
      Category: category,
      SubCategory: key,
      rarity: 2 // Default rarity
    };

    // Add tier if exists
    if (row[7]) {
      material.tier = row[7]; // Column H: tier
    }

    // Add value if exists (for EXP items)
    if (row[8]) {
      material.value = row[8]; // Column I: value
    }

    json[category][key] = material;
  }

  outputJSON('materials.json', json);
}

// SynthesisRecipes JSON 생성
function generateSynthesisJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SynthesisRecipes');
  const data = sheet.getDataRange().getValues();

  const json = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    const recipeName = row[0]; // Column A: recipe_name

    const recipe = {
      result: {
        game_id: row[1], // Column B: result_game_id
        quantity: row[2] // Column C: result_quantity
      },
      ingredients: []
    };

    // Add up to 4 ingredients
    for (let j = 0; j < 4; j++) {
      const idCol = 3 + (j * 2); // Columns D, F, H, J
      const qtyCol = 4 + (j * 2); // Columns E, G, I, K

      if (row[idCol] && row[qtyCol]) {
        recipe.ingredients.push({
          game_id: row[idCol],
          quantity: row[qtyCol]
        });
      }
    }

    json[recipeName] = recipe;
  }

  outputJSON('synthesisRecipes.json', json);
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
2. 프로젝트 이름: **Endfield Data Manager**

### 4. 권한 승인

1. 스크립트를 처음 실행하면 권한 요청이 나옵니다
2. **검토** → 본인 구글 계정 선택 → **고급** → **Endfield Data Manager(안전하지 않음)으로 이동** → **허용**

---

## 사용 방법

### 1. 데이터 입력

각 시트에 데이터를 입력합니다:
- **Seq**: 순번만 입력 (1, 2, 3...)
- **Rarity, Type, Category**: 텍스트/숫자 입력
- **game_id**: 자동 생성됨 (수식)
- 나머지 필드: 직접 입력

### 2. JSON 생성

1. 구글 시트 상단 메뉴에서 **Endfield Data** 클릭
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

1. 프로젝트 폴더 열기: `d:\Develop\wutheringwave-planner\src\games\endfield\data\`
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
- 수식: `=COUNTIF(E:E, E2)`
- 결과가 1보다 크면 중복 ID 존재

### 2. 색상 코딩

- 6성: 금색 배경
- 5성: 보라색 배경
- 4성: 파란색 배경
- 3성: 초록색 배경

**조건부 서식** 사용:
1. Rarity 열 선택
2. **서식** → **조건부 서식**
3. 조건: `셀 값이 6과 같음` → 배경색: 금색

### 3. 데이터 검증

Rarity, Type, Category 같은 열에 **데이터 검증** 추가:
- **데이터** → **데이터 검증**
- 조건: 목록 (예: 3, 4, 5, 6)

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

---

## 다음 단계

1. 구글 시트 템플릿 생성
2. Apps Script 설치
3. 샘플 데이터 입력 테스트
4. JSON 생성 및 프로젝트 적용
5. 실제 Endfield 데이터 입력 시작!

---

## 참고 문서

- [ID_SYSTEM.md](./ID_SYSTEM.md) - ID 체계 상세 가이드
- [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) - JSON 데이터 구조 가이드
