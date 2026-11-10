# /newgame-fix - ID 확정 및 Google Sheets 구조 생성

`/newgame-review` 후 추가 질문에 답변한 다음 이 커맨드를 실행하세요.
추가 질문이 없었다면 `/newgame-review` 직후 바로 실행해도 됩니다.

## What this does
1. README.md 최종 내용 기반으로 ID_SYSTEM.md 확정
2. 게임에 맞춤화된 GOOGLE_SHEETS_GUIDE.md 생성

다음 단계: `/newgame-build`

---

## Workflow

### Step 1: Read final README

Read `LocalOnly/{gameid}/README.md` (추가 질문 답변이 반영된 최신본).

### Step 2: Assign IDs and update ID_SYSTEM.md

`LocalOnly/{gameid}/ID_SYSTEM.md` 업데이트:

- 속성 코드 표 채우기 (01, 02, 03... 순서로 할당)
- 무기 타입 코드 표 채우기
- 재료 SubCategory 이름 확정 (영문 snake_case)
- ID 매핑 테이블 예시 행 추가 (캐릭터, 무기, 재료 각 1~2개)

### Step 3: Generate GOOGLE_SHEETS_GUIDE.md

`LocalOnly/{gameid}/GOOGLE_SHEETS_GUIDE.md` 를 README 실제 데이터 기반으로 재생성:

**포함 규칙:**
- 실제 체크된 재료 카테고리만 시트로 포함
- 무기 시스템 없으면 weapon 시트 제외
- EXP 카테고리 있으면 해당 시트에 `value` 컬럼 추가
- 실제 속성/무기타입 목록으로 예시 행 생성
- 실제 레벨 구간으로 비용 시트 예시 행 생성
- 각 시트 상단에 한 줄 작성 요령 추가

**⭐ 함수 최대 활용 원칙 (필수):**

모든 자동 계산 열은 반드시 ARRAYFORMULA 수식으로 구현. 사용자가 직접 입력하는 열은 최소화.

각 시트별 반드시 수식으로 처리해야 하는 열:

| 시트 | 자동 수식 열 | 설명 |
|------|-------------|------|
| Characters | Seq, ElementCode, (TypeCode), game_id, ascension, boss, weeklyBoss 등 | ARRAYFORMULA + IF 중첩으로 속성/타입 → 코드 변환 |
| Weapons | Seq, TypeCode, game_id, ascension | 동일 방식 |
| Materials | CategoryCode, game_id | 카테고리명 → 코드 변환, ID 자동 생성 |
| FarmingRates | sample_count, avg | COUNTA, AVERAGE로 run_n 열 집계 |
| *_i18n | game_id(A열), en(B열) | 원본 탭 ARRAYFORMULA 참조, ko만 직접 입력 |

수식 작성 기준:
- `ARRAYFORMULA(IF(...))` 패턴: 헤더 행 아닌 2행에만 입력, 전체 열 자동 처리
- game_id: `{game_code}×10^9 + (Rarity 또는 CategoryCode) × ... + Seq` 계산식을 ARRAYFORMULA로
- 재료 lookup (ascension/boss): `IFERROR(INDEX(Materials!$F:$F, MATCH(name_col, Materials!$G:$G, 0)), "")` 패턴
- FarmingRates: E열 `=COUNTA(G{row}:{row})`, F열 `=IFERROR(ROUND(AVERAGE(G{row}:{row}),2),0)`
- i18n: 원본 탭 game_id/display_name을 ARRAYFORMULA로 참조, C열(ko)만 직접 입력

실제 속성/타입 값으로 IF 분기를 구체적으로 작성 (예시 코드 아닌 실제 사용 가능한 수식 제공).

**⭐ game_id 안정성 원칙 (필수) — 가이드 Materials 탭 섹션에 그대로 넣을 것:**

game_id는 유저의 인벤토리·플래너 목표·tiers.js가 모두 기준으로 쓰는 키다. 시트는 이것을
Category·SubCatCode·Seq 수식으로 만들기 때문에, **이미 동기화된 행의 이 세 칸을 고치면 재료 번호가 바뀌고**
유저 보유량이 옛 번호에 묶여 사라진다 (실제 사고: Endfield Mark of Perseverance `…039 → …040`).

- 한 번 동기화된 행의 Category / SubCatCode / Seq 는 **수정 금지**. 이름·아이콘·tier·value 는 자유
- 새 재료는 **새 행 + 새 Seq**. 행 사이 끼워 넣기, Seq 재정렬, 번호 재사용 금지
- 재료 삭제 = 그 재료를 쓰던 보유량/목표가 사라짐 → 삭제 대신 남겨 두기
- **중복 검사 칸**을 Materials 탭 맨 오른쪽에 추가 (동기화는 이 칸을 읽지 않음):
  `=ARRAYFORMULA(IF(F2:F="","",IF(COUNTIF(F2:F,F2:F)>1,"⚠ 중복 game_id","")))`
  (실제 사고: WW Moss Amber / Edelschnee 가 같은 `4130010026` — 두 캐릭터 재료가 섞임)
- 모든 캐릭터가 같이 쓰는 고정 재료(예: 공용 마스터리 재료)는 **고유한 SubCategory**를 줘서
  코드가 숫자 없이 찾을 수 있게 한다
- 번호가 바뀌거나 재료가 사라지면 동기화 로그에 `material id changed` / `material removed` 경고가 뜨고,
  동기화 뒤 테스트가 실패해 Actions 실행이 빨갛게 표시된다 — 그때 시트를 원래 번호로 되돌린다

### Step 4: Update README.md checklist

`LocalOnly/{gameid}/README.md` 상단의 "진행 상황" 체크리스트를 업데이트:
- `- [ ] \`/newgame-fix\`` → `- [x] \`/newgame-fix\``

### Step 5: Display summary

```
✅ /newgame-fix 완료

📋 확정된 정보:
  Game ID   : {gameid}
  Game Code : {game_code}
  속성      : (목록 또는 "없음")
  무기 타입 : (목록 또는 "없음")
  재료      : (카테고리 목록)
  레벨 구간 : (목록)

📄 업데이트된 파일:
  - LocalOnly/{gameid}/ID_SYSTEM.md
  - LocalOnly/{gameid}/GOOGLE_SHEETS_GUIDE.md

다음 단계:
  1. GOOGLE_SHEETS_GUIDE.md 참고해서 스프레드시트에 데이터 입력
  2. character.json, weapon.json, materials.json, costs.json 준비되면
     /newgame-build 실행
```
