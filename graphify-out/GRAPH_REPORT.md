# Graph Report - gsrc  (2026-10-20)

## Corpus Check
- 3 files · ~38,978 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 261 nodes · 740 edges · 10 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- r2
- saveModal
- esc
- renderServerGrid
- renderDevTable
- openEdit
- switchTab
- e2e.spec.js
- renderUsers

## God Nodes (most connected - your core abstractions)
1. `esc()` - 34 edges
2. `r2()` - 33 edges
3. `r1()` - 31 edges
4. `isAdmin()` - 22 edges
5. `switchTab()` - 19 edges
6. `renderServerGrid()` - 19 edges
7. `saveModal()` - 16 edges
8. `renderDevTable()` - 15 edges
9. `renderSanityAdmin()` - 14 edges
10. `saveServerData()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `showApp()` --indirect_call--> `loadDevTasks()`  [INFERRED]
  app.js → app.js  _Bridges community 1 → community 7_
- `showApp()` --indirect_call--> `refreshLiveReleaseViews()`  [INFERRED]
  app.js → app.js  _Bridges community 1 → community 3_
- `showApp()` --indirect_call--> `updateFyiBadge()`  [INFERRED]
  app.js → app.js  _Bridges community 1 → community 5_
- `addDevListOption()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 0_
- `openEdit()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 6_

## Import Cycles
- None detected.

## Communities (10 total, 0 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (38): addDevListOption(), batchAssignRelease(), clearDevFilters(), clearSanityFilters(), closeBatchReleaseModal(), closeDevEditModal(), closeLinkedSourceTask(), closeProdCloseOffer() (+30 more)

### Community 1 - "r2"
Cohesion: 0.11
Nodes (35): buildStats(), canEditRow(), chatPreviewHtml(), checkSanityOnLogin(), clearSel(), deleteRec(), ensureIds(), goToPage1() (+27 more)

### Community 2 - "saveModal"
Cohesion: 0.12
Nodes (29): closeLaunchModal(), closeModal(), closeNewDevModal(), closeRivkaToMalmModal(), closeSanityModal(), createLinkedDevTaskForRequest(), deepEqual(), _deepEqualRaw() (+21 more)

### Community 3 - "esc"
Cohesion: 0.11
Nodes (28): ackProdExport(), closeCurrentRelease(), closeReleaseTransition(), closeSanityNotesModal(), confirmCloseSanity(), confirmReleaseTransition(), envSummaryHtml(), esc() (+20 more)

### Community 4 - "renderServerGrid"
Cohesion: 0.11
Nodes (27): applyParsedServerImport(), chainedWrite(), deleteComponent(), deleteServer(), deriveComponentCodeFromFile(), formatServerValueCompact(), importServerFile(), importServerFilesBatch() (+19 more)

### Community 5 - "renderDevTable"
Cohesion: 0.11
Nodes (27): buildDevStats(), deleteLaunchTask(), deleteSanityTask(), fyiItems(), fyiUnread(), isInCurrentRelease(), launchTimingBadge(), markAllFyiRead() (+19 more)

### Community 6 - "openEdit"
Cohesion: 0.12
Nodes (24): attachLink(), buildUserSelectOptionsHtml(), editableSubset(), fileExt(), findUserMatches(), formatSize(), getEditRec(), getFormSnapshot() (+16 more)

### Community 7 - "switchTab"
Cohesion: 0.20
Nodes (17): jumpToDevTask(), jumpToLaunchTask(), jumpToSanityTask(), loadDevLists(), loadDevTasks(), loadLaunchTab(), loadSanityTab(), loadServerData() (+9 more)

### Community 8 - "e2e.spec.js"
Cohesion: 0.24
Nodes (8): { mockFirebase, seedUsers, login, msfSelectOnly, msfSelectAll }, { test, expect }, firebasePrune(), login(), mockFirebase(), msfSelectAll(), msfSelectOnly(), seedUsers()

### Community 9 - "renderUsers"
Cohesion: 0.47
Nodes (6): addUser(), delUser(), renderUsers(), saveDB(), saveUserDeletedFlag(), undoDeleteUser()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `esc` to `app.js`, `r2`, `renderServerGrid`, `renderDevTable`, `openEdit`, `switchTab`, `renderUsers`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06009783368273934 - nodes in this community are weakly interconnected._
- **Why does `isoToIsraeliDateTime()` connect `renderServerGrid` to `app.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `r2` be split into smaller, more focused modules?**
  _Cohesion score 0.10588235294117647 - nodes in this community are weakly interconnected._
- **Why does `renderReleaseTransition()` connect `esc` to `app.js`, `switchTab`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `saveModal` be split into smaller, more focused modules?**
  _Cohesion score 0.11576354679802955 - nodes in this community are weakly interconnected._
- **Should `esc` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._