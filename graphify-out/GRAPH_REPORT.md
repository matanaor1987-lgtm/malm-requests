# Graph Report - gsrc  (2026-10-20)

## Corpus Check
- 3 files · ~34,914 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 235 nodes · 651 edges · 9 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- r2
- switchTab
- renderServerGrid
- esc
- saveModal
- renderLaunchTable
- e2e.spec.js
- renderUsers

## God Nodes (most connected - your core abstractions)
1. `r2()` - 33 edges
2. `r1()` - 31 edges
3. `esc()` - 26 edges
4. `isAdmin()` - 18 edges
5. `switchTab()` - 18 edges
6. `renderServerGrid()` - 18 edges
7. `saveModal()` - 16 edges
8. `renderSanityAdmin()` - 14 edges
9. `saveServerData()` - 14 edges
10. `genId()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `showApp()` --indirect_call--> `refreshLiveReleaseViews()`  [INFERRED]
  app.js → app.js  _Bridges community 1 → community 6_
- `addDevListOption()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 2_
- `openEdit()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 4_
- `sendMsg()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 5_
- `addUser()` --calls--> `genId()`  [EXTRACTED]
  app.js → app.js  _Bridges community 5 → community 8_

## Import Cycles
- None detected.

## Communities (9 total, 0 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (35): batchAssignRelease(), clearDevFilters(), clearSanityFilters(), closeBatchReleaseModal(), closeSanityModal(), confirmBatchReleaseAssign(), DB, deleteSanityTask() (+27 more)

### Community 1 - "r2"
Cohesion: 0.10
Nodes (37): buildStats(), canEditRow(), chatPreviewHtml(), checkSanityOnLogin(), clearSel(), deleteRec(), ensureIds(), goToPage1() (+29 more)

### Community 2 - "switchTab"
Cohesion: 0.11
Nodes (26): addDevListOption(), closeDevEditModal(), closeLinkedSourceTask(), filterDevTable(), jumpToDevTask(), jumpToLaunchTask(), loadDevLists(), loadDevTasks() (+18 more)

### Community 3 - "renderServerGrid"
Cohesion: 0.12
Nodes (26): applyParsedServerImport(), chainedWrite(), deleteComponent(), deleteServer(), deriveComponentCodeFromFile(), formatServerValueCompact(), importServerFile(), importServerFilesBatch() (+18 more)

### Community 4 - "esc"
Cohesion: 0.12
Nodes (26): attachLink(), buildUserSelectOptionsHtml(), editableSubset(), esc(), fileExt(), findUserMatches(), formatSize(), getFormSnapshot() (+18 more)

### Community 5 - "saveModal"
Cohesion: 0.14
Nodes (24): closeModal(), closeNewDevModal(), closeRivkaToMalmModal(), createLinkedDevTaskForRequest(), deepEqual(), _deepEqualRaw(), g(), genId() (+16 more)

### Community 6 - "renderLaunchTable"
Cohesion: 0.14
Nodes (22): buildDevStats(), closeCurrentRelease(), closeLaunchModal(), closeSanityNotesModal(), confirmCloseSanity(), getCurrentRelease(), isInCurrentRelease(), jsq() (+14 more)

### Community 7 - "e2e.spec.js"
Cohesion: 0.31
Nodes (8): { mockFirebase, seedUsers, login, msfSelectOnly, msfSelectAll }, { test, expect }, firebasePrune(), login(), mockFirebase(), msfSelectAll(), msfSelectOnly(), seedUsers()

### Community 8 - "renderUsers"
Cohesion: 0.24
Nodes (10): addUser(), deleteLaunchTask(), delUser(), renderUsers(), saveDB(), saveLaunchDeletedFlag(), saveUserDeletedFlag(), showUndoToast() (+2 more)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `renderReleaseArchiveBody()` connect `switchTab` to `app.js`, `esc`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Why does `isoToIsraeliDateTime()` connect `renderServerGrid` to `app.js`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `r2` be split into smaller, more focused modules?**
  _Cohesion score 0.0990990990990991 - nodes in this community are weakly interconnected._
- **Why does `r2()` connect `r2` to `app.js`, `switchTab`, `esc`, `saveModal`, `renderLaunchTable`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `switchTab` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `renderServerGrid` be split into smaller, more focused modules?**
  _Cohesion score 0.1168091168091168 - nodes in this community are weakly interconnected._