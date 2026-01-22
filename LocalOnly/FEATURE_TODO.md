# FEATURE TODO

## Stamina tracker parity

- Port the auto-regen stamina store and UI from ../ww-nuxtPlanner/stores/staminaStore.js and ../ww-nuxtPlanner/components/Stamina.vue:1.  
- Current app has no stamina module (local search 'rg -i stamina' returns nothing); add a Pinia store plus widgets on planner dashboard and inventory page to surface regen timers.

## Notes module

- Recreate the note store and modal component from ../ww-nuxtPlanner/stores/noteStore.js:1 and ../ww-nuxtPlanner/components/Notes.vue:1.  
- Integrate into planner landing page so users can track ad-hoc todos; the Vue app currently has no notes-related files or UI.
