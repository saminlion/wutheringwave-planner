# Endfield Data Management - Google Sheets Guide

Endfield 게임 데이터를 구글 시트에서 관리하고 JSON으로 자동 변환하는 가이드입니다.

**최종 업데이트:** 2026-01-25

---

## 목차

1. [구글 시트 설정](#구글-시트-설정)
2. [시트 구조](#시트-구조)
3. [Apps Script 설치](#apps-script-설치)
4. [사용 방법](#사용-방법)

---

## 구글 시트 설정

### 1. 구글 시트 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 이름: **Endfield Data Manager**

### 2. 시트 만들기

다음 4개 시트를 생성하세요:

1. **Characters** - 캐릭터 데이터
2. **Weapons** - 무기 데이터
3. **Materials** - 재료 데이터
4. **ID_Reference** - ID 체계 참고용 (읽기 전용)

---

## 시트 구조

### 1. Characters 시트

**열 구성:**

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | Seq | Number | 순번 (1, 2, 3...) - 직접 입력 |
| B | Rarity | Number | 성급 (4, 5, 6) - 직접 입력 |
| C | Element | Text | 속성 (physical, heat, nature, cryo, electric) - 직접 입력 |
| D | ElementCode | Number | 속성 코드 (ARRAYFORMULA로 자동 계산) |
| E | game_id | Number | 자동 생성 ID (ARRAYFORMULA로 자동 계산) |
| F | key | Text | 내부 키 (예: clemence) - 직접 입력 |
| G | display_name | Text | 표시 이름 - 직접 입력 |
| H | weapon | Text | 무기 타입 - 직접 입력 |
| I | bolete_name | Text | 티어5 bolete 이름 - **직접 입력 (Cosmagaric 또는 Bloodcap)** |
| J | bolete_id | Number | 티어5 bolete game_id - **ARRAYFORMULA 자동 조회** |
| K | odendra_name | Text | 티어5 odendra 이름 - **직접 입력 (False Aggela 또는 Blighted Jadeleaf)** (Mastery용) |
| L | odendra_id | Number | 티어5 odendra game_id - **ARRAYFORMULA 자동 조회** |
| M | special_name | Text | 캐릭터 고유 재료 이름 - **직접 입력 (Materials의 label)** |
| N | special_id | Number | 고유 재료 game_id - **ARRAYFORMULA 자동 조회** |
| O | icon | Text | 아이콘 URL - 직접 입력 |

**ARRAYFORMULA 설정 (D2, E2, J2, L2, N2에 입력):**

```
D1: ElementCode
D2: =ARRAYFORMULA(IF(C2:C="","",IF(C2:C="physical",1,IF(C2:C="heat",2,IF(C2:C="nature",3,IF(C2:C="cryo",4,IF(C2:C="electric",5,0)))))))

E1: game_id
E2: =ARRAYFORMULA(IF(A2:A="","",5200000000+(B2:B*10000000)+(D2:D*100000)+A2:A))

J1: bolete_id
J2: =ARRAYFORMULA(IF(I2:I="","",IFERROR(INDEX(Materials!$F$2:$F,MATCH(I2:I,Materials!$H$2:$H,0)),"")))

L1: odendra_id
L2: =ARRAYFORMULA(IF(K2:K="","",IFERROR(INDEX(Materials!$F$2:$F,MATCH(K2:K,Materials!$H$2:$H,0)),"")))

N1: special_id
N2: =ARRAYFORMULA(IF(M2:M="","",IFERROR(INDEX(Materials!$F$2:$F,MATCH(M2:M,Materials!$H$2:$H,0)),"")))
```

**bolete_id / odendra_id / special_id INDEX/MATCH 설명:**
- `INDEX(Materials!$F$2:$F, ...)` - Materials의 game_id 열(F)에서 값 반환
- `MATCH(I2:I, K2:K, 또는 M2:M, Materials!$H$2:$H, 0)` - label 열(H)에서 검색하여 행 번호 반환

**game_id 수식 설명:**
- `5200000000 + (Rarity × 10000000) + (ElementCode × 100000) + Seq`
- Rarity 6, Cryo (04), Seq 1 → 5206040001
- Rarity 5, Heat (02), Seq 1 → 5205020001

**예시 데이터:**

| Seq | Rarity | Element | ElementCode | game_id | key | display_name | weapon | bolete_name | bolete_id | odendra_name | odendra_id | special_name | special_id | icon |
|-----|--------|---------|-------------|---------|-----|--------------|--------|-------------|-----------|--------------|------------|--------------|------------|------|
| 1 | 6 | cryo | 4 | 5206040001 | clemence | Clemence | pistol | Cosmagaric | 5110010005 | False Aggela | 5110020010 | Triphasic Nanoflake | 5130010034 | https://... |
| 2 | 6 | heat | 2 | 5206020001 | alice | Alice | sword | Bloodcap | 5110010006 | False Aggela | 5110020010 | D96 Steel Sample 4 | 5130010031 | https://... |

---

### 2. Weapons 시트

**열 구성:**

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | Seq | Number | 순번 (1, 2, 3...) - 직접 입력 |
| B | Rarity | Number | 성급 (3, 4, 5, 6) - 직접 입력 |
| C | Type | Text | 무기 타입 - 직접 입력 |
| D | TypeCode | Number | 타입 코드 (ARRAYFORMULA로 자동 계산) |
| E | game_id | Number | 자동 생성 ID (ARRAYFORMULA로 자동 계산) |
| F | key | Text | 내부 키 - 직접 입력 |
| G | display_name | Text | 표시 이름 - 직접 입력 |
| H | onyx_name | Text | 티어5 onyx 이름 - **직접 입력 (Wulingstone 또는 ???)** |
| I | onyx_id | Number | 티어5 onyx game_id - **ARRAYFORMULA 자동 조회** |
| J | special_name | Text | 무기 고유 재료 이름 - **직접 입력 (Materials의 label)** |
| K | special_id | Number | 고유 재료 game_id - **ARRAYFORMULA 자동 조회** |
| L | icon | Text | 아이콘 URL - 직접 입력 |

**ARRAYFORMULA 설정 (D2, E2, I2, K2에 입력):**

```
D1: TypeCode
D2: =ARRAYFORMULA(IF(C2:C="","",IF(C2:C="sword",1,IF(C2:C="greatsword",2,IF(C2:C="polearm",3,IF(C2:C="arts",4,IF(C2:C="pistol",5,0)))))))

E1: game_id
E2: =ARRAYFORMULA(IF(A2:A="","",5300000000+(B2:B*10000000)+(D2:D*100000)+A2:A))

I1: onyx_id
I2: =ARRAYFORMULA(IF(H2:H="","",IFERROR(INDEX(Materials!$F$2:$F,MATCH(H2:H,Materials!$H$2:$H,0)),"")))

K1: special_id
K2: =ARRAYFORMULA(IF(J2:J="","",IFERROR(INDEX(Materials!$F$2:$F,MATCH(J2:J,Materials!$H$2:$H,0)),"")))
```

**onyx_id / special_id INDEX/MATCH 설명:**
- `INDEX(Materials!$F$2:$F, ...)` - Materials의 game_id 열(F)에서 값 반환
- `MATCH(H2:H 또는 J2:J, Materials!$H$2:$H, 0)` - label 열(H)에서 검색하여 행 번호 반환

**game_id 수식 설명:**
- `5300000000 + (Rarity × 10000000) + (TypeCode × 100000) + Seq`
- Rarity 6, Sword (01), Seq 1 → 5306010001
- Rarity 5, Polearm (03), Seq 1 → 5305030001

**예시 데이터:**

| Seq | Rarity | Type | TypeCode | game_id | key | display_name | onyx_name | onyx_id | special_name | special_id | icon |
|-----|--------|------|----------|---------|-----|--------------|-----------|---------|--------------|------------|------|
| 1 | 6 | sword | 1 | 5306010001 | blade_of_dawn | Blade of Dawn | Wulingstone | 5110030004 | Triphasic Nanoflake | 5130010001 | https://... |
| 2 | 6 | greatsword | 2 | 5306020001 | great_blade | Great Blade | Onyx T5 B | 5110030005 | Alice Special Mat | 5130010002 | https://... |

---

### 3. Materials 시트

**열 구성:**

| Column | Name | Type | Description |
|--------|------|------|-------------|
| A | Category | Text | 재료 카테고리 - 직접 입력 |
| B | CategoryCode | Number | 카테고리 코드 (ARRAYFORMULA로 자동 계산) |
| C | SubCategory | Text | 서브카테고리 - 직접 입력 |
| D | SubCatCode | Number | 서브카테고리 코드 - 직접 입력 |
| E | Seq | Number | 순번 (1, 2, 3...) - 직접 입력 |
| F | game_id | Number | 자동 생성 ID (ARRAYFORMULA로 자동 계산) |
| G | key | Text | 내부 키 - 직접 입력 |
| H | label | Text | 표시 이름 - 직접 입력 |
| I | tier | Number | 티어 (2~5, 없으면 공백) - 직접 입력 |
| J | value | Number | EXP 값 (경험치 아이템만) - 직접 입력 |
| K | icon | Text | 아이콘 URL - 직접 입력 |

**ARRAYFORMULA 설정 (B1, F1에 입력):**

```
B1: CategoryCode
B2: =ARRAYFORMULA(IF(A2:A="","",IF(A2:A="credit",0,IF(A2:A="ascension",10,IF(A2:A="forgery",20,IF(A2:A="special",30,IF(A2:A="mastery",40,IF(A2:A="player_exp",60,IF(A2:A="weapon_exp",70,0)))))))))

F1: game_id
F2: =ARRAYFORMULA(IF(E2:E="","",5100000000+(B2:B*1000000)+(D2:D*10000)+E2:E))
```

**game_id 수식 설명:**
- `5100000000 + (CategoryCode × 1000000) + (SubCatCode × 10000) + Seq`
- ascension (10), SubCat 01, Seq 1 → 5110010001
- forgery (20), SubCat 02, Seq 1 → 5120020001

**카테고리 코드 참조:**

| Category | Code | SubCategory 예시 |
|----------|------|------------------|
| credit | 00 | credit |
| ascension | 10 | bolete (01), odendra (02) |
| forgery | 20 | proto_asc (01), proto_skill (02) |
| special | 30 | 캐릭터별 |
| mastery | 40 | mastery |
| player_exp | 60 | player_exp (00) |
| weapon_exp | 70 | weapon_exp (00) |

**예시 데이터:**

| Category | CategoryCode | SubCategory | SubCatCode | Seq | game_id | key | label | tier | value | icon |
|----------|--------------|-------------|------------|-----|---------|-----|-------|------|-------|------|
| credit | 0 | credit | 0 | 1 | 5100000001 | t_creds | T-Creds | | | https://... |
| ascension | 10 | bolete | 1 | 1 | 5110010001 | pink_bolete | Pink Bolete | 2 | | https://... |
| ascension | 10 | bolete | 1 | 2 | 5110010002 | red_bolete | Red Bolete | 3 | | https://... |
| ascension | 10 | bolete | 1 | 3 | 5110010003 | ruby_bolete | Ruby Bolete | 4 | | https://... |
| ascension | 10 | bolete | 1 | 4 | 5110010004 | cosmagaric | Cosmagaric | 5 | | https://... |
| ascension | 10 | odendra | 2 | 1 | 5110020001 | kalkodenra | Kalkodenra | 2 | | https://... |
| forgery | 20 | proto_asc | 1 | 1 | 5120010001 | protodisk | Protodisk | 2 | | https://... |
| forgery | 20 | proto_skill | 2 | 1 | 5120020001 | protprism | Protprism | 2 | | https://... |
| player_exp | 60 | player_exp | 0 | 1 | 5160000001 | exp_small | EXP (Small) | 2 | 1000 | https://... |

---

### 4. ID_Reference 시트 (읽기 전용)

ID 체계를 빠르게 참고할 수 있는 시트입니다.

**예시:**

| Category | Format | Example | Description |
|----------|--------|---------|-------------|
| Character | 52 RR EE NNNN | 5206040001 | 6성 냉기 첫 번째 |
| Weapon | 53 RR TT NNNN | 5306010001 | 6성 한손검 첫 번째 |
| Material | 51 CC SS NNNN | 5110010001 | ascension, bolete, 첫 번째 |

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

// メニュー追加
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Endfield Data')
    .addItem('Generate All JSON Files', 'generateAllJSON')
    .addSeparator()
    .addItem('Generate character.json', 'generateCharacterJSON')
    .addItem('Generate weapon.json', 'generateWeaponJSON')
    .addItem('Generate materials.json', 'generateMaterialsJSON')
    .addToUi();
}

// 全JSON生成
function generateAllJSON() {
  generateCharacterJSON();
  generateWeaponJSON();
  generateMaterialsJSON();

  SpreadsheetApp.getUi().alert('All JSON files generated successfully!\n\nCheck the "JSON Output" sheet for results.');
}

// Characters JSON生成
function generateCharacterJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Characters');
  const data = sheet.getDataRange().getValues();

  const json = {};

  // ヘッダー行をスキップ (index 0)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // 空行をスキップ
    if (!row[0]) continue;

    const key = row[5]; // Column F: key

    json[key] = {
      game_id: row[4],        // Column E: game_id
      display_name: row[6],   // Column G: display_name
      element: row[2],        // Column C: element
      weapon: row[7],         // Column H: weapon
      icon: row[14] || '',    // Column O: icon
      rarity: row[1],         // Column B: rarity
      bolete: row[9] || null, // Column J: bolete_id (tier5 bolete, Ascension用)
      odendra: row[11] || null, // Column L: odendra_id (tier5 odendra, Mastery用)
      special: row[13] || null // Column N: special_id (Mastery用)
    };
  }

  outputJSON('character.json', json);
}

// Weapons JSON生成
function generateWeaponJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Weapons');
  const data = sheet.getDataRange().getValues();

  const json = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    const key = row[5]; // Column F: key

    json[key] = {
      game_id: row[4],        // Column E: game_id
      display_name: row[6],   // Column G: display_name
      rarity: row[1],         // Column B: rarity
      type: row[2],           // Column C: type
      icon: row[11] || '',    // Column L: icon
      onyx: row[8] || null,   // Column I: onyx_id (tier5 onyx, auto-lookup)
      special: row[10] || null // Column K: special_id (auto-lookup from Materials)
    };
  }

  outputJSON('weapon.json', json);
}

// Materials JSON生成
function generateMaterialsJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Materials');
  const data = sheet.getDataRange().getValues();

  const json = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[4]) continue; // Seqが空ならスキップ

    const category = row[0];    // Column A: Category
    const subCategory = row[2]; // Column C: SubCategory
    const key = row[6];         // Column G: key

    // カテゴリ初期化
    if (!json[category]) {
      json[category] = {};
    }

    const material = {
      game_id: row[5],          // Column F: game_id
      icon: row[10] || '',      // Column K: icon
      label: row[7],            // Column H: label
      Category: category,
      SubCategory: subCategory
    };

    // tierがあれば追加
    if (row[8]) {
      material.tier = row[8];   // Column I: tier
    }

    // valueがあれば追加 (EXPアイテム用)
    if (row[9]) {
      material.value = row[9];  // Column J: value
    }

    json[category][key] = material;
  }

  outputJSON('materials.json', json);
}

// JSON出力ヘルパー
function outputJSON(filename, jsonData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let outputSheet = ss.getSheetByName('JSON Output');

  // 出力シートがなければ作成
  if (!outputSheet) {
    outputSheet = ss.insertSheet('JSON Output');
    outputSheet.getRange('A1').setValue('Filename');
    outputSheet.getRange('B1').setValue('JSON Content');
    outputSheet.getRange('C1').setValue('Generated At');
  }

  const jsonString = JSON.stringify(jsonData, null, 2);

  // 次の空行を探す
  const lastRow = outputSheet.getLastRow();
  const nextRow = lastRow + 1;

  outputSheet.getRange(nextRow, 1).setValue(filename);
  outputSheet.getRange(nextRow, 2).setValue(jsonString);
  outputSheet.getRange(nextRow, 3).setValue(new Date().toISOString());

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
- **Seq, Rarity, Element/Type, key 등**: 직접 입력
- **ElementCode, TypeCode, CategoryCode, game_id**: ARRAYFORMULA로 자동 계산

### 2. JSON 생성

1. 구글 시트 상단 메뉴에서 **Endfield Data** 클릭
2. 옵션 선택:
   - **Generate All JSON Files** - 모든 JSON 한번에 생성
   - 또는 개별 파일 생성 선택

### 3. JSON 파일 다운로드

1. 생성 완료 후 **JSON Output** 시트 확인
2. B열의 JSON 내용 복사 (Ctrl+C)

### 4. 로컬 프로젝트에 적용

1. 프로젝트 폴더: `src/games/endfield/data/`
2. 해당 JSON 파일 열기 (예: `character.json`)
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

**조건부 서식** 사용:
1. Rarity 열 선택
2. **서식** → **조건부 서식**
3. 조건 설정:
   - 6: 금색 배경
   - 5: 보라색 배경
   - 4: 파란색 배경
   - 3: 초록색 배경

### 3. 데이터 검증

Rarity, Type, Category 같은 열에 **데이터 검증** 추가:
- **데이터** → **데이터 검증**
- 조건: 목록

---

## 문제 해결

### Q: game_id가 생성되지 않아요
A:
- ARRAYFORMULA가 D2, E2 (또는 B2, F2)에 제대로 입력되었는지 확인
- Seq 값이 비어있으면 game_id도 생성되지 않음

### Q: JSON이 제대로 생성되지 않아요
A:
1. 시트 이름이 정확한지 확인 (대소문자 구분)
2. 헤더 행이 첫 번째 행에 있는지 확인
3. Apps Script 로그 확인: **보기** → **로그**

### Q: 한글이 깨져요
A: JSON을 복사할 때 UTF-8 인코딩을 사용하는 텍스트 에디터(VSCode 등)에 붙여넣으세요.

---

## 참고 문서

- [ID_SYSTEM.md](./ID_SYSTEM.md) - ID 체계 상세 가이드
- [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) - JSON 데이터 구조 가이드
