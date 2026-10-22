# Graph Report - gsrc  (2026-10-22)

## Corpus Check
- 3 files · ~42,774 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 288 nodes · 842 edges · 16 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- isAdmin
- app.js
- r2
- fmtDate
- renderServerGrid
- saveModal
- esc
- confirmImport
- e2e.spec.js
- renderSanityAdmin
- renderLaunchTable
- renderUsers
- msfGetSelected
- msfSetOptions
- saveLaunchTask
- batchAssignRelease

## God Nodes (most connected - your core abstractions)
1. `esc()` - 38 edges
2. `r2()` - 34 edges
3. `r1()` - 32 edges
4. `isAdmin()` - 25 edges
5. `switchTab()` - 20 edges
6. `renderServerGrid()` - 19 edges
7. `saveModal()` - 18 edges
8. `renderDevTable()` - 17 edges
9. `fmtDate()` - 16 edges
10. `getCurrentRelease()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `showApp()` --indirect_call--> `updateFyiBadge()`  [INFERRED]
  app.js → app.js  _Bridges community 0 → community 7_
- `saveModal()` --calls--> `sendEmailNotification()`  [EXTRACTED]
  app.js → app.js  _Bridges community 3 → community 5_
- `buildStats()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 0 → community 2_
- `openEdit()` --calls--> `isAdmin()`  [EXTRACTED]
  app.js → app.js  _Bridges community 0 → community 3_
- `showApp()` --calls--> `initFilters()`  [EXTRACTED]
  app.js → app.js  _Bridges community 0 → community 5_

## Import Cycles
- None detected.

## Communities (16 total, 0 thin omitted)

### Community 0 - "isAdmin"
Cohesion: 0.09
Nodes (51): ackProdExport(), addDevListOption(), buildDevStats(), checkImportLink(), closeCurrentRelease(), closeDevEditModal(), closeNewDevModal(), closeReleaseTransition() (+43 more)

### Community 1 - "app.js"
Cohesion: 0.06
Nodes (16): askDateDone(), closeSanityNotesModal(), confirmCloseSanity(), DB, openNewSanity(), parseDate(), pendingFiles, populateSanityAssignee() (+8 more)

### Community 2 - "r2"
Cohesion: 0.09
Nodes (35): buildStats(), canEditRow(), chatPreviewHtml(), checkSanityOnLogin(), clearSel(), closeLinkedSourceTask(), closeProdCloseOffer(), confirmProdClose() (+27 more)

### Community 3 - "fmtDate"
Cohesion: 0.09
Nodes (33): askDate(), attachLink(), buildUserSelectOptionsHtml(), editableSubset(), fileExt(), findUserMatches(), fmtDate(), fmtNow() (+25 more)

### Community 4 - "renderServerGrid"
Cohesion: 0.12
Nodes (26): applyParsedServerImport(), chainedWrite(), deleteComponent(), deleteServer(), deriveComponentCodeFromFile(), formatServerValueCompact(), importServerFile(), importServerFilesBatch() (+18 more)

### Community 5 - "saveModal"
Cohesion: 0.17
Nodes (20): closeModal(), closeRivkaToMalmModal(), createLinkedDevTaskForRequest(), deepEqual(), _deepEqualRaw(), g(), gdate(), genId() (+12 more)

### Community 6 - "esc"
Cohesion: 0.18
Nodes (18): envSummaryHtml(), esc(), jsq(), linkedDevBadgeHtml(), openBatchReleaseAssign(), openEditDevTask(), populateDevEditSelect(), populateDevTesterSelect() (+10 more)

### Community 7 - "confirmImport"
Cohesion: 0.21
Nodes (14): buildImportUpdates(), closeImportPreview(), confirmImport(), fyiItems(), fyiUnread(), markAllFyiRead(), markFyi(), patchRoot() (+6 more)

### Community 8 - "e2e.spec.js"
Cohesion: 0.22
Nodes (8): { mockFirebase, seedUsers, login, msfSelectOnly, msfSelectAll }, { test, expect }, firebasePrune(), login(), mockFirebase(), msfSelectAll(), msfSelectOnly(), seedUsers()

### Community 9 - "renderSanityAdmin"
Cohesion: 0.25
Nodes (9): closeSanityModal(), deleteSanityTask(), renderSanityAdmin(), resetSanityTasks(), saveSanityDeletedFlag(), saveSanityTask(), sendSanityEmail(), sortSanityTable() (+1 more)

### Community 10 - "renderLaunchTable"
Cohesion: 0.25
Nodes (9): deleteLaunchTask(), envReleaseName(), launchTimingBadge(), releaseBadgeHtml(), renderLaunchTable(), saveLaunchDeletedFlag(), showUndoToast(), sortLaunchTable() (+1 more)

### Community 11 - "renderUsers"
Cohesion: 0.47
Nodes (6): addUser(), delUser(), renderUsers(), saveDB(), saveUserDeletedFlag(), undoDeleteUser()

### Community 12 - "msfGetSelected"
Cohesion: 0.40
Nodes (5): clearDevFilters(), clearSanityFilters(), filterSanityAdminTable(), msfCheckAll(), msfGetSelected()

### Community 13 - "msfSetOptions"
Cohesion: 0.40
Nodes (5): msfChange(), msfSetOptions(), msfToggleAll(), msfUpdateBtn(), populateSanityFilters()

### Community 14 - "saveLaunchTask"
Cohesion: 0.50
Nodes (4): closeLaunchModal(), editableLaunchSubset(), openEditLaunch(), saveLaunchTask()

### Community 15 - "batchAssignRelease"
Cohesion: 0.67
Nodes (3): batchAssignRelease(), closeBatchReleaseModal(), confirmBatchReleaseAssign()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `esc` to `isAdmin`, `app.js`, `r2`, `fmtDate`, `renderServerGrid`, `confirmImport`, `renderSanityAdmin`, `renderLaunchTable`, `renderUsers`, `msfSetOptions`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Should `isAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.08784313725490196 - nodes in this community are weakly interconnected._
- **Why does `isoToIsraeliDateTime()` connect `fmtDate` to `app.js`, `r2`, `renderServerGrid`, `saveModal`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06386554621848739 - nodes in this community are weakly interconnected._
- **Why does `renderReleaseTransition()` connect `esc` to `isAdmin`, `app.js`, `fmtDate`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `r2` be split into smaller, more focused modules?**
  _Cohesion score 0.09411764705882353 - nodes in this community are weakly interconnected._
- **Should `fmtDate` be split into smaller, more focused modules?**
  _Cohesion score 0.08912655971479501 - nodes in this community are weakly interconnected._