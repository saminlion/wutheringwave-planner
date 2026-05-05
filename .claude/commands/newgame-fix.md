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

### Step 4: Display summary

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
