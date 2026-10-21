# Graph Report - gsrc  (2026-10-21)

## Corpus Check
- 3 files · ~41,396 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 274 nodes · 784 edges · 11 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- switchTab
- r2
- renderServerGrid
- esc
- saveModal
- openEdit
- e2e.spec.js
- isAdmin
- renderUsers
- renderFyiTable

## God Nodes (most connected - your core abstractions)
1. `esc()` - 36 edges
2. `r2()` - 33 edges
3. `r1()` - 31 edges
4. `isAdmin()` - 23 edges
5. `switchTab()` - 20 edges
6. `renderServerGrid()` - 19 edges
7. `renderDevTable()` - 17 edges
8. `saveModal()` - 16 edges
9. `getCurrentRelease()` - 14 edges
10. `deepEqual()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `showApp()` --indirect_call--> `loadDevTasks()`  [INFERRED]
  app.js → app.js  _Bridges community 8 → community 1_
- `showApp()` --indirect_call--> `updateFyiBadge()`  [INFERRED]
  app.js → app.js  _Bridges community 8 → community 10_
- `buildStats()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 8 → community 2_
- `openEdit()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 8 → community 6_
- `sendMsg()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 8 → community 5_

## Import Cycles
- None detected.

## Communities (11 total, 0 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.05
Nodes (39): clearDevFilters(), clearSanityFilters(), closeNewDevModal(), closeSanityModal(), closeSanityNotesModal(), confirmCloseSanity(), DB, deleteSanityTask() (+31 more)

### Community 1 - "switchTab"
Cohesion: 0.09
Nodes (46): addDevListOption(), buildDevStats(), buildImportUpdates(), closeCurrentRelease(), closeDevEditModal(), closeImportPreview(), closeLaunchModal(), closeReleaseTransition() (+38 more)

### Community 2 - "r2"
Cohesion: 0.10
Nodes (33): batchAssignRelease(), buildStats(), canEditRow(), chatPreviewHtml(), clearSel(), closeBatchReleaseModal(), closeLinkedSourceTask(), closeProdCloseOffer() (+25 more)

### Community 3 - "renderServerGrid"
Cohesion: 0.12
Nodes (26): applyParsedServerImport(), chainedWrite(), deleteComponent(), deleteServer(), deriveComponentCodeFromFile(), formatServerValueCompact(), importServerFile(), importServerFilesBatch() (+18 more)

### Community 4 - "esc"
Cohesion: 0.12
Nodes (26): attachLink(), envSummaryHtml(), esc(), fileExt(), jsq(), linkedDevBadgeHtml(), linkify(), openBatchReleaseAssign() (+18 more)

### Community 5 - "saveModal"
Cohesion: 0.13
Nodes (26): checkSanityOnLogin(), closeModal(), closeRivkaToMalmModal(), createLinkedDevTaskForRequest(), deepEqual(), _deepEqualRaw(), ensureIds(), g() (+18 more)

### Community 6 - "openEdit"
Cohesion: 0.17
Nodes (16): buildUserSelectOptionsHtml(), editableSubset(), findUserMatches(), formatSize(), getFormSnapshot(), handleFiles(), initDropZone(), jumpToMalmTask() (+8 more)

### Community 7 - "e2e.spec.js"
Cohesion: 0.22
Nodes (8): { mockFirebase, seedUsers, login, msfSelectOnly, msfSelectAll }, { test, expect }, firebasePrune(), login(), mockFirebase(), msfSelectAll(), msfSelectOnly(), seedUsers()

### Community 8 - "isAdmin"
Cohesion: 0.25
Nodes (11): ackProdExport(), checkImportLink(), isAdmin(), lgLogin(), loadReleases(), openDevListsModal(), openReleaseManager(), renderServerProdBanner() (+3 more)

### Community 9 - "renderUsers"
Cohesion: 0.24
Nodes (10): addUser(), deleteLaunchTask(), delUser(), renderUsers(), saveDB(), saveLaunchDeletedFlag(), saveUserDeletedFlag(), showUndoToast() (+2 more)

### Community 10 - "renderFyiTable"
Cohesion: 0.31
Nodes (10): fyiItems(), fyiUnread(), markAllFyiRead(), markFyi(), patchRoot(), renderFyiTable(), setFyiFlag(), setFyiRead() (+2 more)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `esc` to `app.js`, `switchTab`, `r2`, `renderServerGrid`, `openEdit`, `isAdmin`, `renderUsers`, `renderFyiTable`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0531986531986532 - nodes in this community are weakly interconnected._
- **Why does `isoToIsraeliDateTime()` connect `renderServerGrid` to `app.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `switchTab` be split into smaller, more focused modules?**
  _Cohesion score 0.09082125603864734 - nodes in this community are weakly interconnected._
- **Why does `renderReleaseTransition()` connect `esc` to `app.js`, `switchTab`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `r2` be split into smaller, more focused modules?**
  _Cohesion score 0.09848484848484848 - nodes in this community are weakly interconnected._
- **Should `renderServerGrid` be split into smaller, more focused modules?**
  _Cohesion score 0.1168091168091168 - nodes in this community are weakly interconnected._