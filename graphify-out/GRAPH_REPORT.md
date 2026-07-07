# Graph Report - OmniLab  (2026-07-07)

## Corpus Check
- 142 files · ~201,002 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1035 nodes · 1816 edges · 71 communities (47 shown, 24 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `15ee40f6`
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
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Package Configuration & Deps|Package Configuration & Deps]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Scratch Subsystem|Scratch Subsystem]]
- [[_COMMUNITY_Standards Subsystem|Standards Subsystem]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Components Subsystem|Components Subsystem]]
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
- [[_COMMUNITY_Scripts Subsystem|Scripts Subsystem]]
- [[_COMMUNITY_Schemas Subsystem|Schemas Subsystem]]
- [[_COMMUNITY_Elastomers Subsystem|Elastomers Subsystem]]
- [[_COMMUNITY_Failures Subsystem|Failures Subsystem]]
- [[_COMMUNITY_Running Subsystem|Running Subsystem]]
- [[_COMMUNITY_Standards Subsystem|Standards Subsystem]]
- [[_COMMUNITY_Steel Subsystem|Steel Subsystem]]
- [[_COMMUNITY_Threads Subsystem|Threads Subsystem]]
- [[_COMMUNITY_Tubulars Subsystem|Tubulars Subsystem]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 93|Community 93]]

## God Nodes (most connected - your core abstractions)
1. `store` - 43 edges
2. `getPlaceholder()` - 32 edges
3. `i18n` - 27 edges
4. `translateDbText()` - 18 edges
5. `mockDb` - 17 edges
6. `searchMockDb()` - 17 edges
7. `convertTemperature()` - 17 edges
8. `convertPressure()` - 16 edges
9. `State` - 15 edges
10. `VisualAuditorOverlay` - 14 edges

## Surprising Connections (you probably didn't know these)
- `rowRenderer()` --calls--> `translateDbText()`  [EXTRACTED]
  src/modules/elastomers/table.js → src/utils/databaseTranslator.js
- `rowRenderer()` --calls--> `translateDbText()`  [EXTRACTED]
  src/modules/failures/table.js → src/utils/databaseTranslator.js
- `rowRenderer()` --calls--> `convertTemperature()`  [EXTRACTED]
  src/modules/running-data/table.js → src/utils/units.js
- `rowRenderer()` --calls--> `translateDbText()`  [EXTRACTED]
  src/modules/steel-grades/table.js → src/utils/databaseTranslator.js
- `rowRenderer()` --calls--> `convertTorqueText()`  [EXTRACTED]
  src/modules/threads/table.js → src/utils/units.js

## Import Cycles
- None detected.

## Communities (71 total, 24 thin omitted)

### Community 0 - "Running Calculations & Guide"
Cohesion: 0.20
Nodes (7): details, BaseDetails, chartZooms, selectedRecordIds, threadsFilters, tubularsFilters, details

### Community 1 - "Comparison & Compatibility UI"
Cohesion: 0.22
Nodes (7): details, FailuresDetails, headersEn, headersRu, rowRenderer(), table, view

### Community 2 - "Tubulars Schema"
Cohesion: 0.04
Nodes (46): minimum, type, minimum, type, description, minimum, type, minLength (+38 more)

### Community 3 - "Comparison & Compatibility UI"
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

### Community 13 - "Obsidian Sync"
Cohesion: 0.08
Nodes (32): CompareTable, CompatibilitySection, ElastomerCard, EngineeringCard, FailureCard, StandardCard, SteelGradeCard, parseAndConvertTorque() (+24 more)

### Community 14 - "Release Generation Scripts"
Cohesion: 0.05
Nodes (36): ID_PREFIXES, isValueEmpty(), normalizeEngineeringEntity(), normalizeObjectValues(), cipher, db, dbHash, dbPath (+28 more)

### Community 16 - "Schemas Subsystem"
Cohesion: 0.15
Nodes (15): type, type, properties, required, type, max, min, pressure (+7 more)

### Community 19 - "Schemas Subsystem"
Cohesion: 0.15
Nodes (13): description, type, description, type, description, type, properties, description (+5 more)

### Community 20 - "Running Calculations & Guide"
Cohesion: 0.09
Nodes (7): AboutModal, CompareView, EngineeringMetaCard, Homepage, SettingsPanel, Sidebar, I18nManager

### Community 24 - "Running Calculations & Guide"
Cohesion: 0.28
Nodes (6): details, headersEn, headersRu, rowRenderer(), table, view

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (5): BaseTable, headersEn, headersRu, rowRenderer(), table

### Community 26 - "Schemas Subsystem"
Cohesion: 0.22
Nodes (9): description, items, type, description, items, type, type, advantages (+1 more)

### Community 27 - "Scripts Subsystem"
Cohesion: 0.28
Nodes (8): addToken(), db, dbPath, index, outputPath, parseFractions(), sortedIndex, tokenize()

### Community 28 - "Threads Subsystem"
Cohesion: 0.11
Nodes (19): AdvancedCalcs, RunningGuide, StandardCalcs, EngineeringDisclaimer, FormulaTransparency, EngineeringCalculations, PhysicalConstants, UnitConversions (+11 more)

### Community 30 - "Components Subsystem"
Cohesion: 0.07
Nodes (26): 1. Accessing the Application, 1. Запуск приложения, 2. Unlocking the Database, 2. Разблокировка базы данных, 3. Installing the App on Devices (PWA), 3. Установка приложения на устройства (PWA), Automated QA Validation, Features (+18 more)

### Community 31 - "Engineering Graph & Coherence"
Cohesion: 0.08
Nodes (23): 1. Accessing the Application, 1. Запуск приложения, 2. Unlocking the Database, 2. Разблокировка базы данных, 3. Installing the App on Devices (PWA), 3. Установка приложения на устройства (PWA), 4. Key Features & How to Use Them, 4. Ключевые функции и использование (+15 more)

### Community 32 - "Community 32"
Cohesion: 0.29
Nodes (5): details, headersEn, headersRu, table, view

### Community 33 - "Package Configuration & Deps"
Cohesion: 0.32
Nodes (5): details, headersEn, headersRu, table, view

### Community 35 - "Schemas Subsystem"
Cohesion: 0.33
Nodes (5): description, required, $schema, title, type

### Community 37 - "Community 37"
Cohesion: 0.15
Nodes (13): clearDirectoryHandle(), loadDirectoryHandle(), openVaultDB(), saveDirectoryHandle(), scanDirectory(), verifyPermission(), writeVaultFile(), injectObsidianRecords() (+5 more)

### Community 39 - "Scratch Subsystem"
Cohesion: 0.33
Nodes (4): CATEGORY_NAMES, HEADERS_EN, HEADERS_RU, table

### Community 41 - "Community 41"
Cohesion: 0.07
Nodes (11): StrengthEnvelopeChart, TorqueTurnChart, ElastomersView, RunningDataView, launchCompareFromQuery(), expandPhraseSynonyms(), parseFractions(), PHRASE_SYNONYMS (+3 more)

### Community 42 - "Community 42"
Cohesion: 0.40
Nodes (4): headersEn, headersRu, rowRenderer(), table

### Community 48 - "Components Subsystem"
Cohesion: 0.06
Nodes (35): FieldQuickAccessBar, Header, MODULE_ICONS, LoginNoticeModal, Search, ICONS, loggerInstance, graph (+27 more)

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
Cohesion: 0.28
Nodes (6): details, headersEn, headersRu, rowRenderer(), table, view

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (3): description, type, name

## Knowledge Gaps
- **356 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+351 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `store` connect `Components Subsystem` to `Running Calculations & Guide`, `Community 37`, `Threads Subsystem`, `Obsidian Sync`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `normalizeEngineeringEntity()` connect `Release Generation Scripts` to `Components Subsystem`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `State` connect `Comparison & Compatibility UI` to `Components Subsystem`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _356 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Tubulars Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `Acid Environments Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Fluids & Brines Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._