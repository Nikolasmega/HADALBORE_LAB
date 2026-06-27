# Graph Report - OmniLab  (2026-06-28)

## Corpus Check
- 162 files · ~223,281 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1132 nodes · 1867 edges · 84 communities (56 shown, 28 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1ca0f685`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Scripts Subsystem|Scripts Subsystem]]
- [[_COMMUNITY_Threads Subsystem|Threads Subsystem]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Engineering Graph & Coherence|Engineering Graph & Coherence]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Package Configuration & Deps|Package Configuration & Deps]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Standards Subsystem|Standards Subsystem]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Comparison & Compatibility UI|Comparison & Compatibility UI]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Community 45|Community 45]]
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
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Elastomers Subsystem|Elastomers Subsystem]]
- [[_COMMUNITY_Failures Subsystem|Failures Subsystem]]
- [[_COMMUNITY_Running Subsystem|Running Subsystem]]
- [[_COMMUNITY_Standards Subsystem|Standards Subsystem]]
- [[_COMMUNITY_Steel Subsystem|Steel Subsystem]]
- [[_COMMUNITY_Threads Subsystem|Threads Subsystem]]
- [[_COMMUNITY_Tubulars Subsystem|Tubulars Subsystem]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 93|Community 93]]

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
- `renderGlobalSearch()` --calls--> `searchMockDb()`  [EXTRACTED]
  src/main.js → src/utils/search.js
- `launchCompareFromQuery()` --calls--> `searchMockDb()`  [EXTRACTED]
  src/main.js → src/utils/search.js
- `rowRenderer()` --calls--> `translateDbText()`  [EXTRACTED]
  src/modules/elastomers/table.js → src/utils/databaseTranslator.js
- `rowRenderer()` --calls--> `convertTemperature()`  [EXTRACTED]
  src/modules/running-data/table.js → src/utils/units.js

## Import Cycles
- None detected.

## Communities (84 total, 28 thin omitted)

### Community 0 - "Running Calculations & Guide"
Cohesion: 0.08
Nodes (21): AdvancedCalcs, RunningGuide, StandardCalcs, DiagramRenderer, EngineeringDisclaimer, FormulaTransparency, EngineeringCalculations, PhysicalConstants (+13 more)

### Community 1 - "Comparison & Compatibility UI"
Cohesion: 0.52
Nodes (5): MODULE_PROPERTIES, parseComplexity(), parseConfidence(), parseNumeric(), parseRating()

### Community 2 - "Tubulars Schema"
Cohesion: 0.04
Nodes (46): minimum, type, minimum, type, description, minimum, type, minLength (+38 more)

### Community 4 - "Elastomers & Failures Modules"
Cohesion: 0.18
Nodes (10): background_color, description, display, display_override, icons, name, orientation, short_name (+2 more)

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
Cohesion: 0.05
Nodes (53): CompareTable, CompatibilitySection, ElastomerCard, EngineeringCard, FailureCard, StandardCard, SteelGradeCard, parseAndConvertTorque() (+45 more)

### Community 14 - "Release Generation Scripts"
Cohesion: 0.10
Nodes (18): buildHash, commonKeys, dataDir, db, dbPath, integritySealHash, manifestPath, mockDbContent (+10 more)

### Community 16 - "Schemas Subsystem"
Cohesion: 0.15
Nodes (15): type, type, properties, required, type, max, min, pressure (+7 more)

### Community 17 - "Comparison & Compatibility UI"
Cohesion: 0.07
Nodes (11): StrengthEnvelopeChart, TorqueTurnChart, ElastomersView, RunningDataView, launchCompareFromQuery(), expandPhraseSynonyms(), parseFractions(), PHRASE_SYNONYMS (+3 more)

### Community 19 - "Schemas Subsystem"
Cohesion: 0.15
Nodes (13): description, type, description, type, description, type, properties, description (+5 more)

### Community 20 - "Running Calculations & Guide"
Cohesion: 0.06
Nodes (13): AboutModal, CompareView, EngineeringMetaCard, Homepage, SettingsPanel, Sidebar, details, FailuresDetails (+5 more)

### Community 24 - "Running Calculations & Guide"
Cohesion: 0.27
Nodes (4): NotesView, markedInstance, renderMarkdown(), wikiLinkExtension

### Community 25 - "Community 25"
Cohesion: 0.27
Nodes (9): EN_JSON_PATH, findDuplicateKeys(), flattenObject(), IGNORED_ORPHAN_PREFIXES, IGNORED_STRINGS, RU_JSON_PATH, runAudit(), SRC_DIR (+1 more)

### Community 26 - "Schemas Subsystem"
Cohesion: 0.22
Nodes (9): description, items, type, description, items, type, type, advantages (+1 more)

### Community 27 - "Scripts Subsystem"
Cohesion: 0.22
Nodes (8): cipher, dbPath, encrypted, iv, jsonStr, key, outputPath, salt

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (4): CATEGORY_NAMES, HEADERS_EN, HEADERS_RU, table

### Community 30 - "Components Subsystem"
Cohesion: 0.07
Nodes (26): 1. Accessing the Application, 1. Запуск приложения, 2. Unlocking the Database, 2. Разблокировка базы данных, 3. Installing the App on Devices (PWA), 3. Установка приложения на устройства (PWA), Automated QA Validation, Features (+18 more)

### Community 31 - "Engineering Graph & Coherence"
Cohesion: 0.08
Nodes (23): 1. Accessing the Application, 1. Запуск приложения, 2. Unlocking the Database, 2. Разблокировка базы данных, 3. Installing the App on Devices (PWA), 3. Установка приложения на устройства (PWA), 4. Key Features & How to Use Them, 4. Ключевые функции и использование (+15 more)

### Community 33 - "Package Configuration & Deps"
Cohesion: 0.11
Nodes (17): 10. Замена графа связей (`src/modules/system-health/view.js`), 11. Замена прочерков интерактивными плейсхолдерами, 12. Видимость в светлой теме, 1. Редизайн главной страницы (`src/components/Homepage.js`), 2. Выравнивание боковой панели (`src/components/Sidebar.js`), 3. Удаление нумерации разделов (`src/components/EngineeringCard.js`), 4. Доработка CAD-рендерера и заглушек (`src/components/DiagramRenderer.js` & `EngineeringCard.js`), 5. Реконструкция химической совместимости (`src/components/EngineeringCard.js`) (+9 more)

### Community 34 - "Community 34"
Cohesion: 0.70
Nodes (4): ID_PREFIXES, isValueEmpty(), normalizeEngineeringEntity(), normalizeObjectValues()

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

### Community 42 - "Comparison & Compatibility UI"
Cohesion: 0.14
Nodes (13): Common Skill Categories, Find Skills, How to Help Users Find Skills, Step 1: Understand What They Need, Step 2: Check the Leaderboard First, Step 3: Search for Skills, Step 4: Verify Quality Before Recommending, Step 5: Present Options to the User (+5 more)

### Community 43 - "Components Subsystem"
Cohesion: 0.15
Nodes (12): Architecture Stability, Database Integrity, Executive Summary, Field Mode Certification, Final Recommendation, HADALBORE_LAB SUPREME GUARDIAN REPORT, Offline Certification, Regression Risk (+4 more)

### Community 44 - "Components Subsystem"
Cohesion: 0.17
Nodes (11): AI Agent Behavior, Allowed Relationships, Default Classification, Examples, Independent Products, Obsidian Vault Integration Rules, Parent Product + Module, Product Boundary Standard V1 (+3 more)

### Community 48 - "Components Subsystem"
Cohesion: 0.05
Nodes (44): Header, MODULE_ICONS, LoginNoticeModal, ICONS, loggerInstance, graph, FeedbackEngine, IntegrityLock (+36 more)

### Community 49 - "Core Subsystem"
Cohesion: 0.28
Nodes (5): details, headersEn, headersRu, table, view

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

### Community 63 - "Schemas Subsystem"
Cohesion: 0.67
Nodes (3): type, description, type

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (3): description, type, name

## Knowledge Gaps
- **413 isolated node(s):** `SRC_DIR`, `EN_JSON_PATH`, `RU_JSON_PATH`, `IGNORED_STRINGS`, `IGNORED_ORPHAN_PREFIXES` (+408 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `store` connect `Components Subsystem` to `Running Calculations & Guide`, `Obsidian Sync`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `VisualAuditorOverlay` connect `Components Subsystem` to `Components Subsystem`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `WellboreFluidsDetails` connect `Wellbore Subsystem` to `Components Subsystem`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `SRC_DIR`, `EN_JSON_PATH`, `RU_JSON_PATH` to the rest of the system?**
  _413 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Running Calculations & Guide` be split into smaller, more focused modules?**
  _Cohesion score 0.08395989974937343 - nodes in this community are weakly interconnected._
- **Should `Tubulars Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Acid Environments Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._