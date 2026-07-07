# Graph Report - OmniLab  (2026-07-05)

## Corpus Check
- 169 files · ~250,799 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1154 nodes · 1918 edges · 90 communities (58 shown, 32 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4aa0d325`
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
- [[_COMMUNITY_Community 47|Community 47]]
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
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Elastomers Subsystem|Elastomers Subsystem]]
- [[_COMMUNITY_Failures Subsystem|Failures Subsystem]]
- [[_COMMUNITY_Running Subsystem|Running Subsystem]]
- [[_COMMUNITY_Standards Subsystem|Standards Subsystem]]
- [[_COMMUNITY_Steel Subsystem|Steel Subsystem]]
- [[_COMMUNITY_Threads Subsystem|Threads Subsystem]]
- [[_COMMUNITY_Tubulars Subsystem|Tubulars Subsystem]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 93|Community 93]]

## God Nodes (most connected - your core abstractions)
1. `store` - 43 edges
2. `getPlaceholder()` - 32 edges
3. `i18n` - 25 edges
4. `translateDbText()` - 19 edges
5. `mockDb` - 17 edges
6. `searchMockDb()` - 17 edges
7. `convertTemperature()` - 17 edges
8. `convertPressure()` - 16 edges
9. `State` - 15 edges
10. `VisualAuditorOverlay` - 14 edges

## Surprising Connections (you probably didn't know these)
- `runTestExecutionPlan()` --calls--> `populateMockDb()`  [INFERRED]
  scratch/run_formula_tests.js → src/database/mockDb.js
- `check()` --calls--> `translateDbText()`  [EXTRACTED]
  scratch/check_all_dictionary_coverage.js → src/utils/databaseTranslator.js
- `check()` --calls--> `translateDbText()`  [EXTRACTED]
  scratch/check_steel_translations.js → src/utils/databaseTranslator.js
- `rowRenderer()` --calls--> `convertTemperature()`  [EXTRACTED]
  src/modules/running-data/table.js → src/utils/units.js
- `rowRenderer()` --calls--> `translateDbText()`  [EXTRACTED]
  src/modules/steel-grades/table.js → src/utils/databaseTranslator.js

## Import Cycles
- None detected.

## Communities (90 total, 32 thin omitted)

### Community 1 - "Comparison & Compatibility UI"
Cohesion: 0.18
Nodes (9): en, enFlat, enKeys, missingInEn, missingInRu, ru, ruFlat, ruKeys (+1 more)

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
Cohesion: 0.20
Nodes (4): UnlockScreen, dbEncrypted, base64ToUint8Array(), testDecryption()

### Community 13 - "Obsidian Sync"
Cohesion: 0.06
Nodes (43): CompareTable, CompatibilitySection, ElastomerCard, EngineeringCard, FailureCard, StandardCard, SteelGradeCard, parseAndConvertTorque() (+35 more)

### Community 14 - "Release Generation Scripts"
Cohesion: 0.05
Nodes (36): ID_PREFIXES, isValueEmpty(), normalizeEngineeringEntity(), normalizeObjectValues(), cipher, db, dbHash, dbPath (+28 more)

### Community 16 - "Schemas Subsystem"
Cohesion: 0.15
Nodes (15): type, type, properties, required, type, max, min, pressure (+7 more)

### Community 17 - "Comparison & Compatibility UI"
Cohesion: 0.20
Nodes (9): MODULE_ICONS, ICONS, PROJECT_IDENTITY, store, dictionaries, i18n, details, selectedRecordIds (+1 more)

### Community 19 - "Schemas Subsystem"
Cohesion: 0.15
Nodes (13): description, type, description, type, description, type, properties, description (+5 more)

### Community 20 - "Running Calculations & Guide"
Cohesion: 0.08
Nodes (8): StandardCalcs, AboutModal, EngineeringMetaCard, Homepage, SettingsPanel, Sidebar, ElastomersView, I18nManager

### Community 26 - "Schemas Subsystem"
Cohesion: 0.22
Nodes (9): description, items, type, description, items, type, type, advantages (+1 more)

### Community 27 - "Scripts Subsystem"
Cohesion: 0.28
Nodes (8): addToken(), db, dbPath, index, outputPath, parseFractions(), sortedIndex, tokenize()

### Community 28 - "Threads Subsystem"
Cohesion: 0.13
Nodes (16): AdvancedCalcs, RunningGuide, EngineeringDisclaimer, FormulaTransparency, EngineeringCalculations, PhysicalConstants, UnitConversions, EngineeringLimits (+8 more)

### Community 29 - "Community 29"
Cohesion: 0.40
Nodes (4): formulas, deepFreeze(), mockLocalStorage, runTestExecutionPlan()

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
Cohesion: 0.18
Nodes (10): details, BaseDetails, BaseView, chartZooms, selectedRecordIds, tubularsFilters, details, details (+2 more)

### Community 35 - "Schemas Subsystem"
Cohesion: 0.33
Nodes (5): description, required, $schema, title, type

### Community 36 - "Scratch Subsystem"
Cohesion: 0.33
Nodes (5): encoder, keyNode, keyWebBuffer, passwordBytes, salt

### Community 37 - "Community 37"
Cohesion: 0.11
Nodes (14): CompareView, clearDirectoryHandle(), loadDirectoryHandle(), openVaultDB(), saveDirectoryHandle(), scanDirectory(), verifyPermission(), writeVaultFile() (+6 more)

### Community 38 - "Scratch Subsystem"
Cohesion: 0.40
Nodes (4): content, fs, lines, stack

### Community 39 - "Scratch Subsystem"
Cohesion: 0.40
Nodes (3): dbPath, enI18nPath, ruI18nPath

### Community 41 - "Community 41"
Cohesion: 0.06
Nodes (20): StrengthEnvelopeChart, TorqueTurnChart, RunningDataView, l80Rec, launchCompareFromQuery(), renderApp(), renderGlobalSearch(), renderModuleView() (+12 more)

### Community 43 - "Components Subsystem"
Cohesion: 0.20
Nodes (9): 1. New Standards Mapped (`src/data/mock-db.json`), 1. Root Causes Resolved, 2. Localization & Rendering Enhancements, 2. Verification, HADALBORE_LAB - Walkthrough, Phase 3: Database Expansion, Phase 4: Localization Compliance Auditor Skill, Phase 5: Standards Mapping Database Expansion (+1 more)

### Community 44 - "Components Subsystem"
Cohesion: 0.40
Nodes (4): db, limitations, threadHydril, threadVam

### Community 48 - "Components Subsystem"
Cohesion: 0.16
Nodes (12): loggerInstance, graph, FeedbackEngine, IntegrityLock, IntegritySnapshot, deepFreeze(), freezeCompareInput(), freezeLibrary() (+4 more)

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

### Community 80 - "Community 80"
Cohesion: 0.06
Nodes (24): details, FailuresDetails, headersEn, headersRu, table, view, BaseTable, headersEn (+16 more)

### Community 85 - "Community 85"
Cohesion: 0.14
Nodes (9): UsageStats, populateMockDb(), view, view, MODULE_VIEWS, details, view, view (+1 more)

### Community 86 - "Community 86"
Cohesion: 0.50
Nodes (3): content, newTranslations, parts

### Community 90 - "Community 90"
Cohesion: 0.50
Nodes (3): categoryTranslations, db, dbPath

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (3): description, type, name

## Knowledge Gaps
- **420 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+415 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `store` connect `Comparison & Compatibility UI` to `Community 34`, `Community 37`, `Obsidian Sync`, `Components Subsystem`, `Community 85`, `Threads Subsystem`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `normalizeEngineeringEntity()` connect `Release Generation Scripts` to `Components Subsystem`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `State` connect `Comparison & Compatibility UI` to `Comparison & Compatibility UI`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _420 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tubulars Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Acid Environments Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Fluids & Brines Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._