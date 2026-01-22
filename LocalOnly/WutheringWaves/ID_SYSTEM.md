# Wuthering Waves Game ID 체계

Wuthering Waves 게임의 캐릭터, 무기, 재료 ID 할당 규칙을 정의합니다.

**최종 업데이트:** 2026-01-23
**상태:** 새 ID 시스템 (기존 시스템에서 전면 개편)

---

## ID 구조 개요

모든 ID는 **10자리 숫자**로 구성됩니다.

### 형식: `XX R0 EE 000N`

- **XX** (2자리): 메인 카테고리
  - `42`: 캐릭터
  - `43`: 무기
  - `41`: 재료
- **R0** (2자리): 등급 × 10 (Rarity)
- **EE** (2자리): 추가 분류 (속성, 무기 타입, 재료 그룹 등)
- **000N** (4자리): 순번 (0001~9999)

---

## 1. 캐릭터 ID: `42 R0 EE NNNN`

### 구조 설명:
- **42**: 캐릭터 카테고리 (고정)
- **R0**: 등급 × 10 (Rarity)
  - `40`: 4성 ⭐⭐⭐⭐
  - `50`: 5성 ⭐⭐⭐⭐⭐
- **EE**: 속성 (Element)
  - `10`: Glacio (얼음)
  - `20`: Fusion (용융)
  - `30`: Aero (기류)
  - `40`: Electro (전도)
  - `50`: Havoc (인멸)
  - `60`: Spectro (회절)
- **NNNN**: 캐릭터 순번 (0001~9999)

### 수식:
```
game_id = 4200000000 + (Rarity × 10000000) + (ElementCode × 100000) + Seq
```

- ElementCode: glacio=1, fusion=2, aero=3, electro=4, havoc=5, spectro=6

### ID 범위:

| 등급 | 속성 | 시작 ID | 종료 ID | 최대 개수 |
|------|------|---------|---------|-----------|
| 4성 | Glacio | 4240100001 | 4240109999 | 9,999개 |
| 4성 | Fusion | 4240200001 | 4240209999 | 9,999개 |
| 4성 | Aero | 4240300001 | 4240309999 | 9,999개 |
| 4성 | Electro | 4240400001 | 4240409999 | 9,999개 |
| 4성 | Havoc | 4240500001 | 4240509999 | 9,999개 |
| 4성 | Spectro | 4240600001 | 4240609999 | 9,999개 |
| 5성 | Glacio | 4250100001 | 4250109999 | 9,999개 |
| 5성 | Fusion | 4250200001 | 4250209999 | 9,999개 |
| 5성 | Aero | 4250300001 | 4250309999 | 9,999개 |
| 5성 | Electro | 4250400001 | 4250409999 | 9,999개 |
| 5성 | Havoc | 4250500001 | 4250509999 | 9,999개 |
| 5성 | Spectro | 4250600001 | 4250609999 | 9,999개 |

### 캐릭터 예시:
```
4240100001 - 첫 번째 4성 Glacio 캐릭터 (예: Sanhua)
4240100002 - 두 번째 4성 Glacio 캐릭터 (예: Baizhi)
4250300018 - 18번째 5성 Aero 캐릭터 (예: Jiyan)
4250600014 - 14번째 5성 Spectro 캐릭터 (예: Jinhsi)
```

### 특별 케이스 - Rover (방랑자):

Rover는 **같은 캐릭터**이지만 **속성이 다른 버전**이 존재합니다.
각 속성별로 **별도의 순번**을 사용합니다.

```
4250600020 - Rover (Spectro) - 20번째 5성 Spectro
4250500021 - Rover (Havoc) - 21번째 5성 Havoc
4250300022 - Rover (Aero) - 22번째 5성 Aero
```

**중요:** 모든 캐릭터는 실제 속성을 EE에 인코딩합니다. JSON의 `element` 필드에도 속성 정보를 저장합니다.

---

## 2. 무기 ID: `43 R0 TT NNNN`

### 구조 설명:
- **43**: 무기 카테고리 (고정)
- **R0**: 등급 × 10 (Rarity)
  - `10`: 1성 ⭐
  - `20`: 2성 ⭐⭐
  - `30`: 3성 ⭐⭐⭐
  - `40`: 4성 ⭐⭐⭐⭐
  - `50`: 5성 ⭐⭐⭐⭐⭐
- **TT**: 무기 타입 (Type)
  - `10`: Sword (검)
  - `20`: Broadblade (대검)
  - `30`: Gauntlets (권갑)
  - `40`: Pistols (권총)
  - `50`: Rectifier (공명기)
- **NNNN**: 무기 순번 (0001~9999)

### 수식:
```
game_id = 4300000000 + (Rarity × 10000000) + (TypeCode × 100000) + Seq
```

- TypeCode: sword=1, broadblade=2, gauntlets=3, pistols=4, rectifier=5

### ID 범위 (예시):

| 등급 + 타입 | 시작 ID | 종료 ID | 최대 개수 |
|-------------|---------|---------|-----------|
| 3성 Sword | 4330100001 | 4330109999 | 9,999개 |
| 3성 Broadblade | 4330200001 | 4330209999 | 9,999개 |
| 4성 Sword | 4340100001 | 4340109999 | 9,999개 |
| 5성 Broadblade | 4350200001 | 4350209999 | 9,999개 |

### 예시:
```
4330200001 - 첫 번째 3성 Broadblade (예: Broadblade of Night)
4330200002 - 두 번째 3성 Broadblade (예: Broadblade of Voyager)
4330100001 - 첫 번째 3성 Sword (예: Sword of Night)
4340100001 - 첫 번째 4성 Sword
4350200001 - 첫 번째 5성 Broadblade
```

---

## 3. 재료 ID: `41 CC SS NNNN`

### 구조 설명:
- **41**: 재료 카테고리 (고정)
- **CC**: 재료 종류 (Category)
- **SS**: 하위 분류 (SubCategory) - 같은 카테고리 내 재료 그룹
- **NNNN**: 재료 순번 또는 티어 (0001~9999)

### CC - 재료 종류 (Category):

| 코드 | 카테고리 | 설명 |
|------|----------|------|
| `00` | Credit | 게임 화폐 (Shell Credit) |
| `10` | Common | 필드 재료 (몬스터 드랍, 채집) |
| `20` | Forgery | 던전 재료 (스킬 레벨업용) |
| `30` | Ascension | 캐릭터 돌파 전용 재료 |
| `40` | Boss | 보스 재료 |
| `50` | Weekly Boss | 주간 보스 재료 |
| `60` | Player EXP | 캐릭터 경험치 아이템 |
| `70` | Weapon EXP | 무기 경험치 아이템 |

### SS - 하위 분류 (SubCategory):

각 재료 그룹별로 **고정된 코드**를 할당합니다.

#### Common (CC=10):
```
01: whisperin_core
02: howler_core
03: ring
04: mask
05: polyphonic
06: residuum
07~99: 추가 재료 그룹 (구글 시트에서 관리)
```

#### Forgery (CC=20):
```
01: metallic_drip
02: phlogiston
03: helix
04: waveworn_residue
05: cadence
06~99: 추가 재료 그룹 (구글 시트에서 관리)
```

#### Ascension (CC=30):
```
01: 통일 사용
```

#### Boss (CC=40) / Weekly Boss (CC=50):
```
01: 금주 (Dreamless)
02: 리나시타 (Crownless)
03~99: 추가 보스 (구글 시트에서 관리)
```

#### Credit / Player EXP / Weapon EXP:
```
00: 고정값 (서브카테고리 불필요)
```

### NNNN - 순번 또는 티어:

**티어가 있는 재료 (Common, Forgery):**
- `0001`: LF (Low Frequency) - Tier 1
- `0002`: MF (Medium Frequency) - Tier 2
- `0003`: HF (High Frequency) - Tier 3
- `0004`: FF (Full Frequency) - Tier 4

**티어가 없는 재료:**
- `0001`, `0002`, `0003`... 순차 할당

### ID 범위 (예시):

| 카테고리 | 서브 | 시작 ID | 종료 ID | 최대 개수 |
|----------|------|---------|---------|-----------|
| Credit | - | 4100000001 | 4100009999 | 9,999개 |
| Common | whisperin_core (01) | 4110010001 | 4110019999 | 9,999개 |
| Common | howler_core (02) | 4110020001 | 4110029999 | 9,999개 |
| Forgery | metallic_drip (01) | 4120010001 | 4120019999 | 9,999개 |
| Boss | 금주 (01) | 4140010001 | 4140019999 | 9,999개 |
| Player EXP | - | 4160000001 | 4160009999 | 9,999개 |

### 예시:

```
// Credit
4100000001 - Shell Credit

// Common (필드 재료 - 티어 있음)
4110010001 - LF Whisperin Core (Tier 1)
4110010002 - MF Whisperin Core (Tier 2)
4110010003 - HF Whisperin Core (Tier 3)
4110010004 - FF Whisperin Core (Tier 4)

4110020001 - LF Howler Core (Tier 1)
4110020002 - MF Howler Core (Tier 2)
4110020003 - HF Howler Core (Tier 3)
4110020004 - FF Howler Core (Tier 4)

4110030001 - Crude Ring (Tier 1)
4110030002 - Basic Ring (Tier 2)
4110030003 - Improved Ring (Tier 3)
4110030004 - Tailored Ring (Tier 4)

// Forgery (던전 재료 - 티어 있음)
4120010001 - LF Metallic Drip (Tier 1)
4120010002 - MF Metallic Drip (Tier 2)
4120010003 - HF Metallic Drip (Tier 3)
4120010004 - FF Metallic Drip (Tier 4)

4120020001 - Impure Phlogiston (Tier 1)
4120020002 - Extracted Phlogiston (Tier 2)
4120020003 - Refined Phlogiston (Tier 3)
4120020004 - Flawless Phlogiston (Tier 4)

// Ascension (캐릭터 돌파 전용)
4130010001 - Strife Tacet Core
4130010002 - Rage Tacet Core
4130010003 - Roar Tacet Core
// ... 각 캐릭터별 고유 재료

// Boss Materials
4140010001 - Dreamless Feather (금주)
4140020001 - Crownless Shell (리나시타)

// Weekly Boss Materials
4150010001 - Unending Destruction
4150010002 - Roaring Rock Fist

// Player EXP
4160000001 - Player EXP (Small) - 1000 EXP
4160000002 - Player EXP (Medium) - 3000 EXP
4160000003 - Player EXP (Large) - 8000 EXP
4160000004 - Player EXP (Extra Large) - 20000 EXP

// Weapon EXP
4170000001 - Weapon EXP (Small) - 1000 EXP
4170000002 - Weapon EXP (Medium) - 3000 EXP
4170000003 - Weapon EXP (Large) - 8000 EXP
4170000004 - Weapon EXP (Extra Large) - 20000 EXP
```

---

## ID 할당 규칙

### 1. 순번 할당 원칙
- 순번은 **0001부터 시작**
- 출시 순서대로 할당 (게임 업데이트 순서)
- 중간 번호 건너뛰기 가능 (추후 확장 고려)

### 2. 예약된 범위
- 각 카테고리의 첫 100개 (0001~0100)는 초기 출시 콘텐츠용
- 이벤트/콜라보 콘텐츠는 각 카테고리 끝부분 (9000~9999) 사용 권장

### 3. ID 변경 금지
- 한번 할당된 ID는 변경 불가
- 삭제된 아이템도 ID 재사용 금지

### 4. Placeholder ID (미확정 재료)

미출시/미확정 재료는 다음 placeholder ID를 사용합니다:

| 카테고리 | Placeholder ID | 이름 | 설명 |
|----------|----------------|------|------|
| Ascension | `4130019999` | Unknown Ascension | 미확정 돌파 재료 |
| Boss | `4140019999` | Unknown Boss | 미확정 보스 재료 |
| Weekly Boss | `4150019999` | Unknown Weekly Boss | 미확정 주간보스 재료 |

**사용법:**
- 캐릭터/무기의 재료가 아직 확정되지 않은 경우 해당 placeholder ID 사용
- UI에서는 "?" 아이콘으로 표시
- 나중에 실제 재료가 확정되면 해당 ID로 교체

---

## 기존 ID 시스템과의 차이점

### 기존 ID 시스템 (Legacy):
```
캐릭터: 42 EE WW RR SS (10자리)
  - EE: 속성 (10=Glacio, 20=Fusion, 30=Aero, 40=Electro, 50=Havoc, 60=Spectro)
  - WW: 무기 (10=Sword, 20=Broadblade, 30=Gauntlets, 40=Pistols, 50=Rectifier)
  - RR: 희귀도 (10=4성, 20=5성)
  - SS: 성별/순번 (10~남, 20~여)

무기: 43 TT RR NN (8자리)
  - TT: 타입
  - RR: 희귀도 (10=1성, 20=2성, 30=3성, 40=4성, 50=5성)
  - NN: 순번 (2자리)

재료: 41 CC SS TT (8자리)
  - CC: 카테고리
  - SS: 서브카테고리
  - TT: 티어/순번 (2자리)
```

### 새 ID 시스템 (New):
```
캐릭터: 42 R0 EE NNNN (10자리)
무기:   43 R0 TT NNNN (10자리)
재료:   41 CC SS NNNN (10자리)
```

### 주요 개선점:
1. **모든 ID 10자리 통일** - 일관성 향상
2. **순번 4자리 (9999개)** - 확장성 대폭 향상 (기존 2자리 99개)
3. **구글 시트 수식으로 자동 생성** - 수동 입력 오류 방지
4. **예측 가능** - 규칙이 명확하고 이해하기 쉬움
5. **속성/타입별 분류** - 캐릭터는 속성별, 무기는 타입별로 ID 범위 구분

---

## 마이그레이션 참고

기존 ID → 새 ID 매핑은 `ID_MIGRATION_MAP.json` 파일에서 관리합니다.

마이그레이션 스크립트는 추후 제공 예정입니다.

---

## 문의사항

ID 체계 관련 문의는 이 문서를 업데이트하여 기록합니다.
