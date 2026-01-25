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