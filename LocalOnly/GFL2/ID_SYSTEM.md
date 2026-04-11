# Girls' Frontline 2: Exilium ID System

**Game Code**: `6`

---

## ID 구조 (10자리)

모든 ID는 **10자리 숫자**로 통일됩니다.

### 형식: `GC TT YY NNNN`

| 위치 | 설명 | 예시 |
|------|------|------|
| GC (2자리) | 게임코드 + 카테고리 | 62 = 캐릭터 |
| TT (2자리) | 타입/등급 | 05 = 5성 |
| YY (2자리) | 서브분류 | 01 = 첫번째 속성/타입 |
| NNNN (4자리) | 순번 | 0001~9999 |

---

## 1. 캐릭터 ID: `62 RR EE NNNN`

- **62**: 캐릭터 카테고리
- **RR**: 등급 (04=4성, 05=5성)
- **EE**: 속성 코드
- **NNNN**: 순번

### 속성 코드

| 코드 | 속성 ID | 표시 이름 |
|------|---------|-----------|
| 01 | burn | Burn |
| 02 | corrosion | Corrosion |
| 03 | electric | Electric |
| 04 | freeze | Freeze |
| 05 | hydro | Hydro |
| 06 | physical | Physical |

### Google Sheets 수식

**ElementCode (D열):**
```
=IF(C2="burn",1,IF(C2="corrosion",2,IF(C2="electric",3,IF(C2="freeze",4,IF(C2="hydro",5,IF(C2="physical",6,0))))))
```

**game_id (E열):**
```
=IF(A2="","",6200000000+(B2*1000000)+(D2*10000)+A2)
```

### 예시
```
6205010001 - 첫번째 5성 Burn 캐릭터
6204030001 - 첫번째 4성 Electric 캐릭터
```

---

## 2. 무기 ID: `63 RR TT NNNN`

- **63**: 무기 카테고리
- **RR**: 등급 (03=3성, 04=4성, 05=5성)
- **TT**: 무기 타입 코드
- **NNNN**: 순번

### 무기 타입 코드

| 코드 | 타입 ID | 표시 이름 |
|------|---------|-----------|
| 01 | hg | HG (Hand Gun) |
| 02 | ar | AR (Assault Rifle) |
| 03 | rf | RF (Rifle) |
| 04 | sg | SG (Shot Gun) |
| 05 | smg | SMG (Submachine Gun) |
| 06 | bld | Bl (Blade) |

### Google Sheets 수식

**TypeCode (D열):**
```
=IF(C2="hg",1,IF(C2="ar",2,IF(C2="rf",3,IF(C2="sg",4,IF(C2="smg",5,IF(C2="bld",6,0))))))
```

**game_id (E열):**
```
=IF(A2="","",6300000000+(B2*1000000)+(D2*10000)+A2)
```

### 예시
```
6305020001 - 첫번째 5성 AR 무기
6304050001 - 첫번째 4성 SMG 무기
6303010001 - 첫번째 3성 HG 무기
```

---

## 3. 재료 ID: `61 CC SS NNNN`

- **61**: 재료 카테고리
- **CC**: 재료 종류 코드
- **SS**: 서브카테고리 코드
- **NNNN**: 순번 또는 티어

### 재료 종류 코드 (CC)

| 코드 | Category | 설명 |
|------|----------|------|
| 00 | credit | Sardis Gold |
| 20 | forgery | 던전 드랍 재료 (stock_boost_bar + transcription_conductor) |
| 30 | rare_material | 비파밍 재료 (Basic Info Core) |
| 60 | doll_exp | 캐릭터 경험치 ⭐ |
| 70 | weapon_exp | 무기 경험치 ⭐ |

⭐ = EXP 카테고리 (value 필드 필수, 자동 인식)

### 서브카테고리 코드 (SS)

| CC | SS | SubCategory | 설명 |
|----|----|-------------|------|
| 20 | 01 | stock_boost_bar | Stock Boost Bar T1-T7 |
| 20 | 02 | transcription_conductor | Metallic Drip T1-T6 |
| 30 | 01 | rare_material | Basic Info Core |

### Google Sheets 수식

**CategoryCode (B열):**
```
=IF(A2="credit",0,IF(A2="forgery",20,IF(A2="rare_material",30,IF(A2="doll_exp",60,IF(A2="weapon_exp",70,0)))))
```

**game_id (F열):**
```
=IF(E2="","",6100000000+(B2*1000000)+(D2*10000)+E2)
```

### 티어 규칙 (NNNN)

**티어 있는 재료**: 0001=T1, 0002=T2, ... 0007=T7
**티어 없는 재료**: 0001, 0002, 0003... 순차

### 예시
```
6100000001 - Sardis Gold
6120010001 - Stock Boost Bar T1
6120010007 - Stock Boost Bar T7
6120020001 - Metallic Drip T1 (Inert)
6120020006 - Metallic Drip T6
6130010001 - Basic Info Core
6160000001 - Combat Report
6170000001 - Analysis Blueprint
```
