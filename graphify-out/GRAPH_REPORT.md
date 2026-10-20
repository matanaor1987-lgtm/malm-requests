# Graph Report - gsrc  (2026-10-20)

## Corpus Check
- 3 files · ~37,824 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 251 nodes · 708 edges · 8 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- r2
- isAdmin
- esc
- renderServerGrid
- openEdit
- saveModal
- e2e.spec.js

## God Nodes (most connected - your core abstractions)
1. `r2()` - 33 edges
2. `esc()` - 33 edges
3. `r1()` - 31 edges
4. `isAdmin()` - 22 edges
5. `renderServerGrid()` - 19 edges
6. `switchTab()` - 18 edges
7. `saveModal()` - 16 edges
8. `renderSanityAdmin()` - 14 edges
9. `saveServerData()` - 14 edges
10. `genId()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `showApp()` --indirect_call--> `refreshLiveReleaseViews()`  [INFERRED]
  app.js → app.js  _Bridges community 1 → community 3_
- `buildStats()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 2 → community 1_
- `openEdit()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 2 → community 5_
- `openNewReleaseForm()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 2 → community 3_
- `sendMsg()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 2 → community 6_

## Import Cycles
- None detected.

## Communities (8 total, 0 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.06
Nodes (42): addUser(), clearDevFilters(), clearSanityFilters(), closeBatchReleaseModal(), closeProdCloseOffer(), closeSanityModal(), confirmBatchReleaseAssign(), confirmProdClose() (+34 more)

### Community 1 - "r2"
Cohesion: 0.09
Nodes (40): batchAssignRelease(), buildStats(), chatPreviewHtml(), checkSanityOnLogin(), clearSel(), closeLinkedSourceTask(), closeRivkaToMalmModal(), deleteRec() (+32 more)

### Community 2 - "isAdmin"
Cohesion: 0.10
Nodes (36): ackProdExport(), addDevListOption(), canEditRow(), closeDevEditModal(), filterDevTable(), isAdmin(), jumpToDevTask(), jumpToLaunchTask() (+28 more)

### Community 3 - "esc"
Cohesion: 0.10
Nodes (35): buildDevStats(), closeCurrentRelease(), closeLaunchModal(), closeReleaseTransition(), closeSanityNotesModal(), confirmCloseSanity(), confirmReleaseTransition(), envSummaryHtml() (+27 more)

### Community 4 - "renderServerGrid"
Cohesion: 0.12
Nodes (26): applyParsedServerImport(), chainedWrite(), deleteComponent(), deleteServer(), deriveComponentCodeFromFile(), formatServerValueCompact(), importServerFile(), importServerFilesBatch() (+18 more)

### Community 5 - "openEdit"
Cohesion: 0.13
Nodes (22): attachLink(), buildUserSelectOptionsHtml(), editableSubset(), fileExt(), findUserMatches(), formatSize(), getFormSnapshot(), handleFiles() (+14 more)

### Community 6 - "saveModal"
Cohesion: 0.17
Nodes (20): closeModal(), closeNewDevModal(), createLinkedDevTaskForRequest(), deepEqual(), _deepEqualRaw(), g(), genId(), getEditRec() (+12 more)

### Community 7 - "e2e.spec.js"
Cohesion: 0.24
Nodes (8): { mockFirebase, seedUsers, login, msfSelectOnly, msfSelectAll }, { test, expect }, firebasePrune(), login(), mockFirebase(), msfSelectAll(), msfSelectOnly(), seedUsers()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `esc` to `app.js`, `r2`, `isAdmin`, `renderServerGrid`, `openEdit`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.055051421657592255 - nodes in this community are weakly interconnected._
- **Why does `isoToIsraeliDateTime()` connect `renderServerGrid` to `app.js`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `r2` be split into smaller, more focused modules?**
  _Cohesion score 0.09487179487179487 - nodes in this community are weakly interconnected._
- **Why does `renderReleaseTransition()` connect `esc` to `app.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `isAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `esc` be split into smaller, more focused modules?**
  _Cohesion score 0.09915966386554621 - nodes in this community are weakly interconnected._