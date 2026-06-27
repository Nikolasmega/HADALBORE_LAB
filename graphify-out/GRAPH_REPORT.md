# Graph Report - .  (2026-06-27)

## Corpus Check
- 173 files · ~180,244 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 982 nodes · 1717 edges · 80 communities (46 shown, 34 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Running Calculations & Guide|Running Calculations & Guide]]
- [[_COMMUNITY_Comparison & Compatibility UI|Comparison & Compatibility UI]]
- [[_COMMUNITY_Tubulars Schema|Tubulars Schema]]
- [[_COMMUNITY_Comparison & Compatibility UI|Comparison & Compatibility UI]]
- [[_COMMUNITY_Elastomers & Failures Modules|Elastomers & Failures Modules]]
- [[_COMMUNITY_Acid Environments Schema|Acid Environments Schema]]
- [[_COMMUNITY_Fluids & Brines Schema|Fluids & Brines Schema]]
- [[_COMMUNITY_Elastomers Schema|Elastomers Schema]]
- [[_COMMUNITY_Threads Schema|Threads Schema]]
- [[_COMMUNITY_Pressure-Temperature Reference Schema|Pressure-Temperature Reference Schema]]
- [[_COMMUNITY_Standards Schema|Standards Schema]]
- [[_COMMUNITY_Package Configuration & Deps|Package Configuration & Deps]]
- [[_COMMUNITY_Encryption & Unlock UI|Encryption & Unlock UI]]
- [[_COMMUNITY_Obsidian Sync|Obsidian Sync]]
- [[_COMMUNITY_Release Generation Scripts|Release Generation Scripts]]
- [[_COMMUNITY_Comparison & Compatibility UI|Comparison & Compatibility UI]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Comparison & Compatibility UI|Comparison & Compatibility UI]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Running Calculations & Guide|Running Calculations & Guide]]
- [[_COMMUNITY_System Subsystem|System Subsystem]]
- [[_COMMUNITY_Core Subsystem|Core Subsystem]]
- [[_COMMUNITY_Wellbore Subsystem|Wellbore Subsystem]]
- [[_COMMUNITY_Running Calculations & Guide|Running Calculations & Guide]]
- [[_COMMUNITY_Core Subsystem|Core Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Scripts Subsystem|Scripts Subsystem]]
- [[_COMMUNITY_Threads Subsystem|Threads Subsystem]]
- [[_COMMUNITY_Comparison & Compatibility UI|Comparison & Compatibility UI]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Engineering Graph & Coherence|Engineering Graph & Coherence]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Package Configuration & Deps|Package Configuration & Deps]]
- [[_COMMUNITY_Elastomers Subsystem|Elastomers Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Standards Subsystem|Standards Subsystem]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Comparison & Compatibility UI|Comparison & Compatibility UI]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Core Subsystem|Core Subsystem]]
- [[_COMMUNITY_Public Subsystem|Public Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Scripts Subsystem|Scripts Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Elastomers Subsystem|Elastomers Subsystem]]
- [[_COMMUNITY_Failures Subsystem|Failures Subsystem]]
- [[_COMMUNITY_Running Subsystem|Running Subsystem]]
- [[_COMMUNITY_Standards Subsystem|Standards Subsystem]]
- [[_COMMUNITY_Steel Subsystem|Steel Subsystem]]
- [[_COMMUNITY_Threads Subsystem|Threads Subsystem]]
- [[_COMMUNITY_Tubulars Subsystem|Tubulars Subsystem]]

## God Nodes (most connected - your core abstractions)
1. `store` - 43 edges
2. `getPlaceholder()` - 31 edges
3. `i18n` - 25 edges
4. `searchMockDb()` - 17 edges
5. `convertTemperature()` - 17 edges
6. `mockDb` - 16 edges
7. `convertPressure()` - 16 edges
8. `State` - 15 edges
9. `VisualAuditorOverlay` - 14 edges
10. `IntegritySnapshot` - 13 edges

## Surprising Connections (you probably didn't know these)
- `runTestExecutionPlan()` --calls--> `populateMockDb()`  [INFERRED]
  scratch/run_formula_tests.js → src/database/mockDb.js
- `rowRenderer()` --calls--> `convertTorqueText()`  [EXTRACTED]
  src/modules/threads/table.js → src/utils/units.js
- `renderGlobalSearch()` --calls--> `searchMockDb()`  [EXTRACTED]
  src/main.js → src/utils/search.js
- `launchCompareFromQuery()` --calls--> `searchMockDb()`  [EXTRACTED]
  src/main.js → src/utils/search.js
- `rowRenderer()` --calls--> `convertTemperature()`  [EXTRACTED]
  src/modules/running-data/table.js → src/utils/units.js

## Import Cycles
- None detected.

## Communities (80 total, 34 thin omitted)

### Community 0 - "Running Calculations & Guide"
Cohesion: 0.06
Nodes (42): AdvancedCalcs, RunningGuide, EngineeringDisclaimer, FormulaTransparency, MODULE_ICONS, LoginNoticeModal, ICONS, loggerInstance (+34 more)

### Community 1 - "Comparison & Compatibility UI"
Cohesion: 0.07
Nodes (39): CompareTable, CompatibilitySection, ElastomerCard, EngineeringCard, FailureCard, StandardCard, SteelGradeCard, parseAndConvertTorque() (+31 more)

### Community 2 - "Tubulars Schema"
Cohesion: 0.04
Nodes (46): minimum, type, minimum, type, description, minimum, type, minLength (+38 more)

### Community 3 - "Comparison & Compatibility UI"
Cohesion: 0.07
Nodes (23): graph, IntegrityLock, IntegritySnapshot, deepFreeze(), freezeCompareInput(), freezeLibrary(), LibraryValidator, SyncEngine (+15 more)

### Community 4 - "Elastomers & Failures Modules"
Cohesion: 0.05
Nodes (24): headersEn, headersRu, table, details, FailuresDetails, headersEn, headersRu, table (+16 more)

### Community 5 - "Acid Environments Schema"
Cohesion: 0.05
Nodes (39): type, type, type, type, type, type, description, items (+31 more)

### Community 6 - "Fluids & Brines Schema"
Cohesion: 0.05
Nodes (39): type, type, type, type, maximum, minimum, type, maximum (+31 more)

### Community 7 - "Elastomers Schema"
Cohesion: 0.05
Nodes (38): type, type, type, type, description, items, properties, required (+30 more)

### Community 8 - "Threads Schema"
Cohesion: 0.05
Nodes (37): type, type, description, type, items, properties, required, type (+29 more)

### Community 9 - "Pressure-Temperature Reference Schema"
Cohesion: 0.06
Nodes (33): description, type, type, type, type, type, items, properties (+25 more)

### Community 10 - "Standards Schema"
Cohesion: 0.06
Nodes (31): type, description, type, type, type, type, type, items (+23 more)

### Community 11 - "Package Configuration & Deps"
Cohesion: 0.09
Nodes (22): dependencies, fuse.js, marked, devDependencies, autoprefixer, core-js, esbuild, postcss (+14 more)

### Community 12 - "Encryption & Unlock UI"
Cohesion: 0.12
Nodes (9): UnlockScreen, dbEncrypted, populateMockDb(), formulas, deepFreeze(), mockLocalStorage, runTestExecutionPlan(), base64ToUint8Array() (+1 more)

### Community 13 - "Obsidian Sync"
Cohesion: 0.16
Nodes (12): clearDirectoryHandle(), loadDirectoryHandle(), openVaultDB(), saveDirectoryHandle(), scanDirectory(), verifyPermission(), injectObsidianRecords(), NotesView (+4 more)

### Community 14 - "Release Generation Scripts"
Cohesion: 0.10
Nodes (18): buildHash, commonKeys, dataDir, db, dbPath, integritySealHash, manifestPath, mockDbContent (+10 more)

### Community 16 - "Schemas Subsystem"
Cohesion: 0.15
Nodes (15): type, type, properties, required, type, max, min, pressure (+7 more)

### Community 17 - "Comparison & Compatibility UI"
Cohesion: 0.16
Nodes (7): launchCompareFromQuery(), expandPhraseSynonyms(), parseFractions(), PHRASE_SYNONYMS, searchMockDb(), TOKEN_SYNONYMS, WellboreFluidsView

### Community 19 - "Schemas Subsystem"
Cohesion: 0.15
Nodes (13): description, type, description, type, description, type, properties, description (+5 more)

### Community 20 - "Running Calculations & Guide"
Cohesion: 0.18
Nodes (6): StandardCalcs, EngineeringMetaCard, renderApp(), renderGlobalSearch(), renderModuleView(), I18nManager

### Community 26 - "Schemas Subsystem"
Cohesion: 0.22
Nodes (9): description, items, type, description, items, type, type, advantages (+1 more)

### Community 27 - "Scripts Subsystem"
Cohesion: 0.22
Nodes (8): cipher, dbPath, encrypted, iv, jsonStr, key, outputPath, salt

### Community 28 - "Threads Subsystem"
Cohesion: 0.28
Nodes (6): details, headersEn, headersRu, rowRenderer(), table, view

### Community 35 - "Schemas Subsystem"
Cohesion: 0.33
Nodes (5): description, required, $schema, title, type

### Community 36 - "Scratch Subsystem"
Cohesion: 0.33
Nodes (5): encoder, keyNode, keyWebBuffer, passwordBytes, salt

### Community 38 - "Scratch Subsystem"
Cohesion: 0.40
Nodes (4): content, fs, lines, stack

### Community 39 - "Scratch Subsystem"
Cohesion: 0.40
Nodes (3): dbPath, enI18nPath, ruI18nPath

### Community 51 - "Schemas Subsystem"
Cohesion: 0.50
Nodes (4): description, items, type, aliases

### Community 52 - "Schemas Subsystem"
Cohesion: 0.50
Nodes (4): description, items, type, applications

### Community 53 - "Schemas Subsystem"
Cohesion: 0.50
Nodes (4): description, items, type, chemicalCompatibility

### Community 54 - "Schemas Subsystem"
Cohesion: 0.50
Nodes (4): description, items, type, diagrams

### Community 55 - "Schemas Subsystem"
Cohesion: 0.50
Nodes (4): description, items, type, graphs

### Community 56 - "Schemas Subsystem"
Cohesion: 0.50
Nodes (4): description, items, type, limitations

### Community 57 - "Schemas Subsystem"
Cohesion: 0.50
Nodes (4): sources, description, items, type

### Community 58 - "Schemas Subsystem"
Cohesion: 0.50
Nodes (4): standards, description, items, type

### Community 59 - "Schemas Subsystem"
Cohesion: 0.50
Nodes (4): usedInEquipment, description, items, type

### Community 61 - "Scripts Subsystem"
Cohesion: 0.50
Nodes (3): distDir, versionPath, zipPath

### Community 62 - "Schemas Subsystem"
Cohesion: 0.67
Nodes (3): description, type, name

### Community 63 - "Schemas Subsystem"
Cohesion: 0.67
Nodes (3): type, description, type

## Knowledge Gaps
- **323 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+318 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `store` connect `Running Calculations & Guide` to `Comparison & Compatibility UI`, `Comparison & Compatibility UI`, `Obsidian Sync`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `State` connect `Comparison & Compatibility UI` to `Running Calculations & Guide`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `VisualAuditorOverlay` connect `Components Subsystem` to `Running Calculations & Guide`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _323 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Running Calculations & Guide` be split into smaller, more focused modules?**
  _Cohesion score 0.061551292743953295 - nodes in this community are weakly interconnected._
- **Should `Comparison & Compatibility UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07098765432098765 - nodes in this community are weakly interconnected._
- **Should `Tubulars Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._