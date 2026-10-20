# Graph Report - gsrc  (2026-10-20)

## Corpus Check
- 3 files · ~35,800 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 240 nodes · 673 edges · 9 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- r2
- esc
- renderServerGrid
- openEdit
- saveModal
- switchTab
- renderUsers
- e2e.spec.js

## God Nodes (most connected - your core abstractions)
1. `r2()` - 33 edges
2. `r1()` - 31 edges
3. `esc()` - 30 edges
4. `isAdmin()` - 21 edges
5. `renderServerGrid()` - 19 edges
6. `switchTab()` - 18 edges
7. `saveModal()` - 16 edges
8. `renderSanityAdmin()` - 14 edges
9. `saveServerData()` - 14 edges
10. `genId()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `showApp()` --indirect_call--> `refreshLiveReleaseViews()`  [INFERRED]
  app.js → app.js  _Bridges community 1 → community 2_
- `addDevListOption()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 0_
- `jumpToSanityTask()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 6_
- `openEdit()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 4_
- `sendMsg()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 5_

## Import Cycles
- None detected.

## Communities (9 total, 0 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (41): addDevListOption(), batchAssignRelease(), clearDevFilters(), clearSanityFilters(), closeBatchReleaseModal(), closeDevEditModal(), closeLaunchModal(), closeLinkedSourceTask() (+33 more)

### Community 1 - "r2"
Cohesion: 0.10
Nodes (37): buildStats(), canEditRow(), chatPreviewHtml(), checkSanityOnLogin(), clearSel(), deleteRec(), ensureIds(), goToPage1() (+29 more)

### Community 2 - "esc"
Cohesion: 0.14
Nodes (28): ackProdExport(), buildDevStats(), closeCurrentRelease(), closeSanityNotesModal(), confirmCloseSanity(), envSummaryHtml(), esc(), getCurrentRelease() (+20 more)

### Community 3 - "renderServerGrid"
Cohesion: 0.11
Nodes (27): applyParsedServerImport(), deleteComponent(), deleteServer(), deriveComponentCodeFromFile(), formatServerValueCompact(), importServerFile(), importServerFilesBatch(), isoToIsraeliDateTime() (+19 more)

### Community 4 - "openEdit"
Cohesion: 0.12
Nodes (23): attachLink(), buildUserSelectOptionsHtml(), editableSubset(), fileExt(), findUserMatches(), formatSize(), getEditRec(), getFormSnapshot() (+15 more)

### Community 5 - "saveModal"
Cohesion: 0.15
Nodes (23): closeModal(), closeNewDevModal(), closeRivkaToMalmModal(), createLinkedDevTaskForRequest(), deepEqual(), _deepEqualRaw(), g(), genId() (+15 more)

### Community 6 - "switchTab"
Cohesion: 0.18
Nodes (16): jumpToDevTask(), jumpToLaunchTask(), jumpToSanityTask(), loadDevLists(), loadDevTasks(), loadLaunchTab(), loadSanityTab(), openEditDevTask() (+8 more)

### Community 7 - "renderUsers"
Cohesion: 0.16
Nodes (16): addUser(), chainedWrite(), deleteLaunchTask(), deleteSanityTask(), delUser(), openEditServerValue(), renderUsers(), saveDB() (+8 more)

### Community 8 - "e2e.spec.js"
Cohesion: 0.31
Nodes (8): { mockFirebase, seedUsers, login, msfSelectOnly, msfSelectAll }, { test, expect }, firebasePrune(), login(), mockFirebase(), msfSelectAll(), msfSelectOnly(), seedUsers()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderReleaseArchiveBody()` connect `switchTab` to `app.js`, `esc`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05701754385964912 - nodes in this community are weakly interconnected._
- **Why does `isoToIsraeliDateTime()` connect `renderServerGrid` to `app.js`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `r2` be split into smaller, more focused modules?**
  _Cohesion score 0.09759759759759759 - nodes in this community are weakly interconnected._
- **Why does `esc()` connect `esc` to `app.js`, `r2`, `renderServerGrid`, `openEdit`, `switchTab`, `renderUsers`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `esc` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `renderServerGrid` be split into smaller, more focused modules?**
  _Cohesion score 0.10846560846560846 - nodes in this community are weakly interconnected._