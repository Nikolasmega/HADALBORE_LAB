# HADALBORE_LAB

An offline-first engineering reference library for completions, tubulars, metallurgy, elastomers, connections, and failures in oil & gas field environments.

---

## ⚠️ Official Source & Authenticity Warning

Only the official version of **HADALBORE_LAB** distributed through the official GitHub source and official project links should be considered authentic. Any copied, modified, redistributed, or unofficial versions:
- May contain incorrect engineering or metallurgical calculations/information.
- Will not receive official technical updates, support, or feedback processing.
- Are used entirely at the user's own risk.

---

## Project Specifications

* **Official Product Name**: `HADALBORE_LAB`
* **Official Creator & Maintainer**: `Niko Y`
* **Release Platform**: Static Offline-First Progressive Web Application (PWA)

---

## Features

- **Offline IndexedDB Store**: Operates in remote, offline environments with no cellular/internet connection.
- **Service Worker Caching**: Immediate boot times and asset persistence.
- **Typo-Tolerant Search Engine**: Searches records with Levenshtein-distance matching and alias support.
- **Side-by-Side Compare Subsystem**: Compare up to 4 tubulars, materials, or connections side-by-side.
- **Diagnostics & Quality Suite**: Real-time schema validation, graph connectivity check, and naming consistency verification.

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local development server:
   ```bash
   npm run dev
   ```

3. Build production bundle (this automatically runs release packaging scripts):
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

---

## Automated QA Validation

The platform includes an automated validation suite (`src/core/LibraryValidation.js`) that enforces:
- Schema completeness and metadata integrity.
- Bi-directional translation coverage (English and Russian).
- Graph connectivity and dead reference checks.
- Naming & Creator Identity standards. The health check will fail with `FAIL — Identity Rule Violation` if any legacy product names or creator name variations (e.g. `Hadalbore`, `Nikolai`, or `Nick`) are introduced into database records or translation files.

To run the formula and validation test suites locally:
```bash
npx vite-node scratch/run_formula_tests.js
```
