# Graph Report - gsrc  (2026-10-22)

## Corpus Check
- 3 files · ~42,168 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 283 nodes · 825 edges · 10 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- app.js
- esc
- r2
- sendMsg
- switchTab
- renderServerGrid
- saveModal
- renderUsers
- e2e.spec.js
- renderFyiTable

## God Nodes (most connected - your core abstractions)
1. `esc()` - 36 edges
2. `r2()` - 34 edges
3. `r1()` - 32 edges
4. `isAdmin()` - 24 edges
5. `switchTab()` - 20 edges
6. `renderServerGrid()` - 19 edges
7. `saveModal()` - 18 edges
8. `renderDevTable()` - 17 edges
9. `fmtDate()` - 15 edges
10. `renderSanityAdmin()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `showApp()` --indirect_call--> `refreshLiveReleaseViews()`  [INFERRED]
  app.js → app.js  _Bridges community 4 → community 1_
- `showApp()` --indirect_call--> `updateFyiBadge()`  [INFERRED]
  app.js → app.js  _Bridges community 4 → community 9_
- `saveModal()` --calls--> `sendEmailNotification()`  [EXTRACTED]
  app.js → app.js  _Bridges community 3 → community 6_
- `saveModal()` --calls--> `rivkaEmailTitle()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 6_
- `sendMsg()` --calls--> `rivkaEmailTitle()`  [EXTRACTED]
  app.js → app.js  _Bridges community 1 → community 3_

## Import Cycles
- None detected.

## Communities (10 total, 0 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.05
Nodes (43): addDevListOption(), askDateDone(), batchAssignRelease(), clearDevFilters(), clearSanityFilters(), closeBatchReleaseModal(), closeDevEditModal(), closeLaunchModal() (+35 more)

### Community 1 - "esc"
Cohesion: 0.08
Nodes (45): ackProdExport(), askDate(), buildDevStats(), closeCurrentRelease(), closeSanityNotesModal(), confirmCloseSanity(), envReleaseName(), envSummaryHtml() (+37 more)

### Community 2 - "r2"
Cohesion: 0.11
Nodes (32): buildStats(), canEditRow(), chatPreviewHtml(), clearSel(), closeLinkedSourceTask(), closeProdCloseOffer(), confirmProdClose(), deleteRec() (+24 more)

### Community 3 - "sendMsg"
Cohesion: 0.10
Nodes (28): attachLink(), buildUserSelectOptionsHtml(), editableSubset(), fileExt(), findUserMatches(), fmtNow(), formatSize(), getEditRec() (+20 more)

### Community 4 - "switchTab"
Cohesion: 0.12
Nodes (29): buildImportUpdates(), checkImportLink(), closeImportPreview(), closeReleaseTransition(), confirmImport(), confirmReleaseTransition(), jumpToDevTask(), jumpToLaunchTask() (+21 more)

### Community 5 - "renderServerGrid"
Cohesion: 0.13
Nodes (24): applyParsedServerImport(), deleteComponent(), deleteServer(), deriveComponentCodeFromFile(), formatServerValueCompact(), importServerFile(), importServerFilesBatch(), isRootEcfPath() (+16 more)

### Community 6 - "saveModal"
Cohesion: 0.14
Nodes (24): checkSanityOnLogin(), closeModal(), closeNewDevModal(), closeRivkaToMalmModal(), createLinkedDevTaskForRequest(), deepEqual(), _deepEqualRaw(), ensureIds() (+16 more)

### Community 7 - "renderUsers"
Cohesion: 0.16
Nodes (16): addUser(), chainedWrite(), deleteLaunchTask(), deleteSanityTask(), delUser(), openEditServerValue(), renderUsers(), saveDB() (+8 more)

### Community 8 - "e2e.spec.js"
Cohesion: 0.22
Nodes (8): { mockFirebase, seedUsers, login, msfSelectOnly, msfSelectAll }, { test, expect }, firebasePrune(), login(), mockFirebase(), msfSelectAll(), msfSelectOnly(), seedUsers()

### Community 9 - "renderFyiTable"
Cohesion: 0.31
Nodes (10): fyiItems(), fyiUnread(), markAllFyiRead(), markFyi(), patchRoot(), renderFyiTable(), setFyiFlag(), setFyiRead() (+2 more)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `esc` to `app.js`, `r2`, `sendMsg`, `switchTab`, `renderServerGrid`, `renderUsers`, `renderFyiTable`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05367231638418079 - nodes in this community are weakly interconnected._
- **Why does `isoToIsraeliDateTime()` connect `sendMsg` to `app.js`, `r2`, `renderServerGrid`, `saveModal`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `esc` be split into smaller, more focused modules?**
  _Cohesion score 0.08383838383838384 - nodes in this community are weakly interconnected._
- **Why does `renderReleaseTransition()` connect `esc` to `app.js`, `switchTab`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `r2` be split into smaller, more focused modules?**
  _Cohesion score 0.11088709677419355 - nodes in this community are weakly interconnected._
- **Should `sendMsg` be split into smaller, more focused modules?**
  _Cohesion score 0.09852216748768473 - nodes in this community are weakly interconnected._