# HADALBORE_LAB (Beta)

An offline-first engineering reference library for completions, tubulars, metallurgy, elastomers, connections, and failures in oil & gas field environments.

> **Status: Beta** — This project is currently in the active development and testing phase.

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

3. Build build bundle (this automatically runs packaging scripts):
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

---

## 💛 Support the Project

If you find this application useful, you can support its development with a donation. Any contribution motivates further project development and the addition of new features.

**Crypto wallet address:**
`0x9c0E67b2792aCf0c73CfB5891d58861167aD9918`

**Supported networks:** Polygon · BNB Chain

Any amount is welcome and highly appreciated 🙏

---
---

# HADALBORE_LAB (Beta)

Автономная инженерная справочная библиотека по заканчиванию скважин, трубным элементам, металлургии, эластомерам, резьбовым соединениям и видам разрушений в нефтегазовой отрасли.

> **Статус: Бета-версия** — Данный проект в настоящее время находится на этапе активной разработки и тестирования.

---

## ⚠️ Официальный источник и предупреждение об аутентичности

Только официальная версия **HADALBORE_LAB**, распространяемая через официальный репозиторий GitHub и официальные ссылки проекта, должна считаться подлинной. Любые скопированные, измененные, перераспределенные или неофициальные версии:
- Могут содержать неверные инженерные или металлургические расчеты/информацию.
- Не будут получать официальные технические обновления, поддержку или обработку обратной связи.
- Используются пользователем исключительно на собственный страх и риск.

---

## Характеристики проекта

* **Официальное название продукта**: `HADALBORE_LAB`
* **Официальный создатель и разработчик**: `Niko Y`
* **Платформа выпуска**: Статическое прогрессивное веб-приложение (PWA) с приоритетом автономной работы (Offline-First)

---

## Возможности

- **Автономное хранилище IndexedDB**: Работает в удаленных условиях без сотовой связи и интернета.
- **Кэширование с помощью Service Worker**: Мгновенное время загрузки и сохранение ресурсов.
- **Поисковая система с защитой от опечаток**: Поиск записей с сопоставлением по расстоянию Левенштейна и поддержкой синонимов.
- **Подсистема параллельного сравнения**: Сравнение до 4 трубных элементов, материалов или соединений одновременно.
- **Инструменты диагностики и качества**: Валидация схем в реальном времени, проверка связности графов и контроль именования.

---

## Начало работы

### Требования

- Node.js (версии 18 и выше)
- npm

### Установка

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Запустите локальный сервер разработки:
   ```bash
   npm run dev
   ```

3. Соберите сборку (это автоматически запустит скрипты упаковки):
   ```bash
   npm run build
   ```

4. Предварительный просмотр сборки:
   ```bash
   npm run preview
   ```

---

## Автоматическая QA-валидация

Платформа включает в себя автоматизированный пакет валидации (`src/core/LibraryValidation.js`), который проверяет:
- Полноту схем и целостность метаданных.
- Покрытие двусторонним переводом (английский и русский).
- Связность графа данных и отсутствие битых ссылок.
- Стандарты именования и идентификации создателя. Проверка работоспособности завершится ошибкой `FAIL — Identity Rule Violation`, если в записи базы данных или файлы перевода будут внесены устаревшие названия продуктов или вариации имени создателя (например, `Hadalbore`, `Nikolai` или `Nick`).

Чтобы запустить тесты формул и валидации локально:
```bash
npx vite-node scratch/run_formula_tests.js
```

---

## 💛 Поддержать проект

Если приложение оказалось полезным, вы можете поддержать разработку донатом. Любой вклад мотивирует развитие проекта и добавление новых функций.

**Адрес криптокошелька:**
`0x9c0E67b2792aCf0c73CfB5891d58861167aD9918`

**Поддерживаемые сети:** Polygon · BNB Chain

Любая сумма приветствуется и очень ценится 🙏
