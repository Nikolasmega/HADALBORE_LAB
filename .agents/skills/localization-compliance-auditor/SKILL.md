---
name: localization-compliance-auditor
description: Ensures 100% localization compliance across the HADALBORE_LAB codebase by auditing hardcoded strings, missing keys, orphans, and duplicates.
---
# Localization Compliance Auditor Skill

This skill ensures 100% language consistency across the `HADALBORE_LAB` codebase by detecting:
* Hardcoded English/Russian user-facing strings.
* Untranslated labels, menus, tabs, tooltips, dialogs, headers, and messages.
* Missing, orphaned, or duplicated translation keys.
* Compliance scoring and build failure triggers on violation.

## How to run the audit
To execute the compliance check:
```bash
node .agents/skills/localization-compliance-auditor/scripts/audit.js
```
