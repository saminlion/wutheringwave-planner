# PRIORITY TODO

## High

- [ ] Backup & restore UX  
  - src/components/common/DataBackup.vue:1 already wraps storage helpers but is never rendered. Add a dedicated settings route/page and insert this component, mirroring ../ww-nuxtPlanner/pages/settings.vue:1 behaviour.  
  - Wire up router navigation (for example a new /settings route) and add entry points in the header or planner navigation.

- [ ] Goal completion automation  
  - Implement 'Done' and 'Deactivate' flows so finishing a character or weapon updates inventory automatically, matching ../ww-nuxtPlanner/services/plannerService.js:1 as invoked from ../ww-nuxtPlanner/pages/characters/index.vue:84.  
  - Extend src/store/planner.js:64 and the character and weapon dialogs to push current levels to the selected targets and persist inventory changes instead of manual edits.

## Medium

- [ ] Planner landing parity  
  - Old planner surfaces notes, stamina, planned items, and aggregate materials together via the accordion in ../ww-nuxtPlanner/pages/index.vue:1. Consider adding equivalent sections or navigation affordances so the home page is functional rather than acting solely as a link hub.
