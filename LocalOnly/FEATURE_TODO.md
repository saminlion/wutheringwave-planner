# FEATURE TODO

## Stamina tracker parity

- Port the auto-regen stamina store and UI from ../ww-nuxtPlanner/stores/staminaStore.js and ../ww-nuxtPlanner/components/Stamina.vue:1.  
- Current app has no stamina module (local search 'rg -i stamina' returns nothing); add a Pinia store plus widgets on planner dashboard and inventory page to surface regen timers.

## Notes module

- Recreate the note store and modal component from ../ww-nuxtPlanner/stores/noteStore.js:1 and ../ww-nuxtPlanner/components/Notes.vue:1.  
- Integrate into planner landing page so users can track ad-hoc todos; the Vue app currently has no notes-related files or UI.


## [FIXED] 눈 가리는 거 (Deactivate) 버그
~~1. 눈 가리고 다른 페이지 갔다 오면 활성화 상태로 보여짐~~
~~실제로는 비활성화~~
~~2. Estimated Planner 부분이 눈 가릴 때 갱신이 안되고 다른 페이지 갔다 와야 갱신됨~~
   - goal.isHidden을 직접 사용하도록 변경
   - hideGoal()에서 refreshFinalMaterialNeeds() 호출 추가

## [FIXED] Endfield 던전 레벨 선택기 버그
~~1. 새로고침이나 페이지 왔다갔다 할 시 Dungeon Level 무조건 5로 리셋됨~~
   - userProfileStore를 통해 localStorage에 저장/복원 구현

## [FIXED] 재료 완료 표시 버그
~~1. 돌파재료 odendra의 경우 Need가 owned보다 작은데 Complete 표시 안됨~~
   - synthesize 값을 모든 카테고리에서 고려하도록 수정

## [FIXED] Planner 페이지 재료 업데이트 렉 문제
~~1. 재료 입력 시 옆에 클릭해야 진행됨 (포커스 아웃 시에만 업데이트)~~
   - @blur → @input으로 변경하여 즉시 반영 (1초 debounce 적용)

## [FUTURE] Firebase 동적 데이터 관리
**Priority:** Low
**Status:** 계획됨

**Description:**
빌드/배포 없이 게임 데이터(캐릭터, 무기, 재료)를 실시간 업데이트할 수 있는 시스템

**현재 방식:**
- Static JSON 파일 (`src/games/[game]/data/*.json`)
- 데이터 변경 시 빌드 → 배포 필요

**Firebase 방식:**
- Firestore/Realtime Database에 게임 데이터 저장
- 앱 실행 시 Firebase에서 fetch
- Admin Console에서 즉시 데이터 수정 가능

**장점:**
1. 빌드 없이 데이터 업데이트
2. 여러 관리자가 데이터 관리 가능
3. 실시간 동기화
4. 버전 관리/롤백 가능

**단점:**
1. Firebase 비용 (무료 tier 있음)
2. 오프라인 첫 로드 불가 (캐싱으로 해결)
3. 초기 설정 작업 필요

**작업 체크리스트:**
- [ ] Firebase 프로젝트 생성
- [ ] Firestore 구조 설계 (games/{gameId}/characters, weapons, materials)
- [ ] Firebase SDK 설치 및 초기화
- [ ] 데이터 fetch 서비스 구현
- [ ] 로컬 캐싱 (localStorage fallback)
- [ ] Admin 데이터 입력 UI (optional)

**Note:** EndfieldDataView 페이지는 삭제됨 (localStorage 기반으로 실제 사용 안함)