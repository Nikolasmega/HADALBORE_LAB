# HADALBORE_LAB - Walkthrough

## Phase 3: Database Expansion
* **Steel Grades Added (`src/data/mock-db.json`):**
  * `Super 13Cr Steel (HP2-13Cr / HP13Cr)` — High-strength martensitic stainless steel for wet CO₂ completions.
  * `C110 Sour Service Steel` — High-strength carbon steel with controlled hardness (max 26 HRC) for H₂S service.
  * `Alloy 28 / Sanicro 28` — High-alloy austenitic stainless steel for high-chloride/high-H₂S reservoirs.
  * `Titanium Grade 5 (Ti-6Al-4V)` — High-strength, lightweight titanium alloy for geothermal and deepwater marine completions.
* **Elastomers Added (`src/data/mock-db.json`):**
  * `Fluorosilicone (FVMQ / Фторсиликон)` — Specialized sub-zero arctic seal elastomer (operational down to -60°C).
  * `Chemraz (FFKM / Перфторкаучук)` — Perfluoroelastomer with near-universal chemical inertia and high-temperature rating (up to 325°C).
  * `HNBR High-ACN` — High-acrylonitrile nitrile elastomer designed to resist gas explosive decompression (RGD).
* **Localization & Translations:**
  * Added Russian translations for all new material names, descriptions, typical applications, and technical limits.

---

## Phase 4: Localization Compliance Auditor Skill

I have created a new system-level custom agent skill called **`localization-compliance-auditor`** to guarantee 100% language consistency.

### 1. Skill Structure
* **Config File ([SKILL.md](file:///.agents/skills/localization-compliance-auditor/SKILL.md)):** Defines the metadata, purpose, and usage instructions for the AI agent.
* **Audit Runner ([audit.js](file:///.agents/skills/localization-compliance-auditor/scripts/audit.js)):** A Node.js scanner that recursively checks `src/` files and performs the following checks:
  * **Hardcoded property checks:** Detects hardcoded English or Russian strings in fields like `title`, `label`, `button`, etc. (excluding dynamic code parameters, units, and brand terms).
  * **Hardcoded HTML tags:** Detects untranslated UI text between `>` and `<` brackets.
  * **Mismatched keys:** Detects keys defined in `en.json` but missing in `ru.json` and vice-versa.
  * **Duplicate keys:** Detects true duplicate keys within JSON objects using a custom brace-matching token parser.
  * **Orphan keys:** Detects unused translation keys, ignoring known dynamic namespaces (e.g. `failures_library`, `calculations.`, `tally_`).
  * **Undefined keys:** Identifies where `t()` calls in the codebase point to missing keys.

### 2. Strict Build Integration
* Modified [package.json](file:///package.json) to execute the audit as a blocking **`prebuild`** hook:
  ```json
  "prebuild": "node .agents/skills/localization-compliance-auditor/scripts/audit.js && node scripts/generate-release.js && node scripts/encrypt-db.js"
  ```
* If any critical localization violation is detected, the script terminates with exit code `1`, causing the build to fail immediately.

### 3. Current Auditing Status
* Successfully refactored [FailureCard.js](file:///src/components/FailureCard.js) to route all hardcoded visual text and schematics descriptions through `i18n.t()`.
* Added corresponding translations to [en.json](file:///src/i18n/en.json) and [ru.json](file:///src/i18n/ru.json).
* Output of the latest audit run:
  * **Localization Compliance Score:** `100.0%`
  * **Total Critical Violations:** `0`
  * **Build Check:** `Passed`
