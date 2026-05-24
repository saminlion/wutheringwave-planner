# /newgame-review - README 검토 및 추가 질문

`/newgame` 으로 폴더를 만들고 README.md를 작성한 후 이 커맨드를 실행하세요.

## What this does
README.md를 읽고 불명확하거나 누락된 항목을 찾아 추가 질문합니다.
모든 항목이 명확하면 질문 없이 바로 완료 메시지를 출력합니다.

다음 단계: `/newgame-fix`

---

## Workflow

### Step 1: Find the game folder

`LocalOnly/` 에서 README.md를 찾는다. 여러 게임이 있으면 사용자에게 어느 게임인지 확인.

Read `LocalOnly/{gameid}/README.md`.

### Step 2: Check each section for completeness

아래 항목을 하나씩 확인하고 문제 있는 항목을 목록으로 정리:

- **Section 1**: 최대 레벨, 스킬 레벨, 합성 비율 모두 작성됨
- **Section 2**: 속성이 있으면 속성 ID/이름/색상(hex) 모두 작성됨
- **Section 3**: 무기가 있으면 타입 ID/이름 모두 작성됨
- **Section 4**: 사용하는 등급의 색상이 작성됨
- **Section 5**: 레벨 구간이 명확히 나열됨 (예: 1, 20, 20A, 40, 40A...)
- **Section 6**: Pattern 1 또는 2 선택됨, 스킬 이름 작성됨
- **Section 7**: 재료 카테고리 최소 1개 이상 체크됨, 티어 있는 재료 명시됨
- **Section 8**: 스태미나 이름/일일 최대치 작성됨
- **Section 10**: 캐릭터 레벨업 비용 작성됨, 스킬 레벨업 비용 작성됨

### Step 3: Update README.md checklist

모든 항목이 명확한 경우, `LocalOnly/{gameid}/README.md` 상단의 "진행 상황" 체크리스트를 업데이트:
- `- [ ] **README.md 작성**` → `- [x] **README.md 작성**`
- `  - [ ] Section 1~8` → `  - [x] Section 1~8`
- `  - [ ] Section 10` → Section 10이 채워진 경우에만 `[x]`로 변경
- `- [ ] \`/newgame-review\`` → `- [x] \`/newgame-review\``

### Step 4: Output result

**문제가 있는 경우** — 체크리스트 업데이트 없이 항목별로 질문:
```
📋 /newgame-review 검토 완료 — 확인이 필요한 항목이 있습니다.

[Section X] 질문 내용
[Section Y] 질문 내용
...

답변 후 /newgame-fix 를 실행해주세요.
```

**모든 항목이 명확한 경우** — 체크리스트 업데이트 후:
```
✅ /newgame-review 완료 — 모든 항목이 명확합니다.

/newgame-fix 를 실행해주세요.
```
