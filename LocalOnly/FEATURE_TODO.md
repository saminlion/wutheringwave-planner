# FEATURE TODO

## Stamina tracker parity

- Port the auto-regen stamina store and UI from ../ww-nuxtPlanner/stores/staminaStore.js and ../ww-nuxtPlanner/components/Stamina.vue:1.  
- Current app has no stamina module (local search 'rg -i stamina' returns nothing); add a Pinia store plus widgets on planner dashboard and inventory page to surface regen timers.

## Notes module

- Recreate the note store and modal component from ../ww-nuxtPlanner/stores/noteStore.js:1 and ../ww-nuxtPlanner/components/Notes.vue:1.  
- Integrate into planner landing page so users can track ad-hoc todos; the Vue app currently has no notes-related files or UI.


## 눈 가리는 거 (Deactivate) 버그
1. 눈 가리고 다른 페이지 갔다 오면 활성화 상태로 보여짐
실제로는 비활성화
2. Estimated Planner 부분이 눈 가릴 때 갱신이 안되고 다른 페이지 갔다 와야 갱신됨

## Endfield 던전 레벨 선택기 버그
1. 새로고침이나 페이지 왔다갔다 할 시 Dungeon Level 무조건 5로 리셋됨
   - localStorage에 저장 후 복원 필요

## 재료 완료 표시 버그
1. 돌파재료 odendra의 경우 Need가 owned보다 작은데 Complete 표시 안됨
   - 완료 조건 로직 점검 필요

## Planner 페이지 재료 업데이트 렉 문제
1. 재료 입력 시 옆에 클릭해야 진행됨 (포커스 아웃 시에만 업데이트)
2. 해결 방안:
   - 즉시 업데이트: 입력 즉시 반영
   - 배치 업데이트: 5초 후 전체 업데이트
   - 현재 debounce 로직 점검 필요