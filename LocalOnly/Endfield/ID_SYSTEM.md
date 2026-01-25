# Endfield Game ID 체계

Endfield 게임의 캐릭터, 무기, 재료 ID 할당 규칙을 정의합니다.

**최종 업데이트:** 2026-01-25

---

## ID 구조 개요

모든 ID는 **10자리 숫자**로 구성됩니다.

### 형식: `XX YY ZZ NNNN`

- **XX** (2자리): 메인 카테고리
  - `52`: 캐릭터
  - `53`: 무기
  - `51`: 재료
- **YY** (2자리): 서브 카테고리 (등급, 재료 종류 등)
- **ZZ** (2자리): 추가 분류 (속성, 무기 타입, 재료 그룹 등)
- **NNNN** (4자리): 순번 (0001~9999)

---

## 1. 캐릭터 ID: `52 RR EE NNNN`

### 구조 설명:
- **52**: 캐릭터 카테고리 (고정)
- **RR**: 등급 (Rarity)
  - `06`: 6성
  - `05`: 5성
  - `04`: 4성
- **EE**: 속성 (Element)
  - `01`: Physical (물리)
  - `02`: Heat (열기)
  - `03`: Nature (자연)
  - `04`: Cryo (냉기)
  - `05`: Electric (전기)
- **NNNN**: 캐릭터 순번 (0001~9999)

### 예시:
```
5206040001 - 첫 번째 6성 냉기 캐릭터
5206020001 - 첫 번째 6성 열기 캐릭터
5205040001 - 첫 번째 5성 냉기 캐릭터
5204050001 - 첫 번째 4성 전기 캐릭터
```

### ID 범위:

| 등급 + 속성 | 시작 ID | 종료 ID |
|-------------|---------|---------|
| 6성 물리 | 5206010001 | 5206019999 |
| 6성 열기 | 5206020001 | 5206029999 |
| 6성 냉기 | 5206040001 | 5206049999 |
| 5성 냉기 | 5205040001 | 5205049999 |

---

## 2. 무기 ID: `53 RR TT NNNN`

### 구조 설명:
- **53**: 무기 카테고리 (고정)
- **RR**: 등급 (Rarity)
  - `06`: 6성
  - `05`: 5성
  - `04`: 4성
  - `03`: 3성
- **TT**: 무기 타입
  - `01`: Sword (한손검)
  - `02`: Greatsword (양손검)
  - `03`: Polearm (장병기)
  - `04`: Arts (아츠)
  - `05`: Pistol (권총)
- **NNNN**: 무기 순번 (0001~9999)

### 예시:
```
5306010001 - 첫 번째 6성 한손검
5306020001 - 첫 번째 6성 양손검
5305030001 - 첫 번째 5성 장병기
5303050001 - 첫 번째 3성 권총
```

### ID 범위:

| 등급 + 타입 | 시작 ID | 종료 ID |
|-------------|---------|---------|
| 6성 한손검 | 5306010001 | 5306019999 |
| 6성 양손검 | 5306020001 | 5306029999 |
| 5성 한손검 | 5305010001 | 5305019999 |
| 3성 장병기 | 5303030001 | 5303039999 |

---

## 3. 재료 ID: `51 CC SS NNNN`

### 구조 설명:
- **51**: 재료 카테고리 (고정)
- **CC**: 재료 종류 (Category)
- **SS**: 하위 분류 (SubCategory)
- **NNNN**: 재료 순번 (0001~9999)

### CC - 재료 종류 (Category):

| 코드 | 카테고리 | 설명 |
|------|----------|------|
| `00` | credit | T-Creds (화폐) |
| `10` | ascension | 채집 재료 (bolete, odendra) |
| `20` | forgery | 던전 재료 (proto_asc, proto_skill) |
| `30` | special | 캐릭터 고유 재료 (7단계 돌파, 마스터리) |
| `40` | mastery | 마스터리 재료 (Mark of Perverance) |
| `60` | player_exp | 캐릭터 경험치 아이템 |
| `70` | weapon_exp | 무기 경험치 아이템 |

### SS - 하위 분류 (SubCategory):

| Category | SubCat | 코드 | 설명 |
|----------|--------|------|------|
| credit | credit | 00 | T-Creds |
| ascension | bolete | 01 | Ascension용 채집 (Pink/Red/Ruby/Cosmagaric) |
| ascension | odendra | 02 | Skill용 채집 (Kalkodenra/Chryodendra/...) |
| forgery | proto_asc | 01 | Ascension용 던전 (Protodisk/Prototest) |
| forgery | proto_skill | 02 | Skill용 던전 (Protprism/Protohedron) |
| special | 캐릭터별 | 01~ | 캐릭터 고유 재료 |
| mastery | mastery | 01 | Mark of Perverance |
| player_exp | player_exp | 00 | 캐릭터 경험치 |
| weapon_exp | weapon_exp | 00 | 무기 경험치 |

### 예시:
```
5100000001 - T-Creds (화폐)

// Ascension - 채집 재료
5110010001 - Pink Bolete (tier 2)
5110010002 - Red Bolete (tier 3)
5110010003 - Ruby Bolete (tier 4)
5110010004 - Cosmagaric (tier 5)
5110020001 - Kalkodenra (tier 2)
5110020002 - Chryodendra (tier 3)

// Forgery - 던전 재료
5120010001 - Protodisk (tier 2)
5120010002 - Prototest (tier 3)
5120020001 - Protprism (tier 2)
5120020002 - Protohedron (tier 3)

// Special - 캐릭터 고유 재료
5130010001 - Triphasic Nanoflake (캐릭터 A)
5130010002 - 캐릭터 B 고유 재료

// Mastery
5140010001 - Mark of Perverance

// Player EXP
5160000001 - Player EXP (Small)
5160000002 - Player EXP (Medium)
5160000003 - Player EXP (Large)
5160000004 - Player EXP (Extra Large)

// Weapon EXP
5170000001 - Weapon EXP (Small)
5170000002 - Weapon EXP (Medium)
5170000003 - Weapon EXP (Large)
5170000004 - Weapon EXP (Extra Large)
```

### ID 범위:

| 카테고리 | 서브 | 시작 ID | 종료 ID |
|----------|------|---------|---------|
| Credit | - | 5100000001 | 5100009999 |
| Ascension | bolete | 5110010001 | 5110019999 |
| Ascension | odendra | 5110020001 | 5110029999 |
| Forgery | proto_asc | 5120010001 | 5120019999 |
| Forgery | proto_skill | 5120020001 | 5120029999 |
| Special | - | 5130010001 | 5130999999 |
| Mastery | - | 5140010001 | 5140019999 |
| Player EXP | - | 5160000001 | 5160009999 |
| Weapon EXP | - | 5170000001 | 5170009999 |

---

## ID 할당 규칙

### 1. 순번 할당 원칙
- 순번은 **0001부터 시작**
- 출시 순서대로 할당
- 중간 번호 건너뛰기 가능 (추후 확장 고려)

### 2. 예약된 범위
- 각 카테고리의 첫 100개 (0001~0100)는 초기 출시 콘텐츠용
- 이벤트/콜라보 콘텐츠는 각 카테고리 끝부분 (9000~9999) 사용 권장

### 3. ID 변경 금지
- 한번 할당된 ID는 변경 불가
- 삭제된 아이템도 ID 재사용 금지

---

## WW와의 차이점

| 항목 | WW | Endfield |
|------|-----|----------|
| 캐릭터 ID | 42XXXXXXXXXX (10자리) | 52RREENNNN (10자리) |
| 무기 ID | 43XXXXXX (8자리) | 53RRTTNNNN (10자리) |
| 재료 ID | 41XXXXXX (8자리) | 51CCSSNNNN (10자리) |
| 캐릭터별 재료 | 각각 다른 SubCategory | **모든 캐릭터 동일** (special만 다름) |
| 합성 | 3:1 티어 업그레이드 | **합성 없음** |

---

## 참고 문서

- [DATA_STRUCTURE.md](./DATA_STRUCTURE.md) - 데이터 파일 구조
- [GOOGLE_SHEETS_GUIDE.md](./GOOGLE_SHEETS_GUIDE.md) - 구글 시트 관리 가이드
