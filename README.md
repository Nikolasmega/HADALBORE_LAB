# HADALBORE_LAB (Beta)

An offline-first engineering reference library for completions, tubulars, metallurgy, elastomers, connections, and failures in oil & gas field environments.

> **Status: Beta** — This project is currently in the active development and testing phase.

---

## 🚀 User Instructions (How to Use & Install)

### 1. Accessing the Application
You can run and use the application in two ways:
* **Method A: Online Web Version (PWA)**: Simply open the official link directly in your browser: **[https://nikolasmega.github.io/HADALBORE_LAB/](https://nikolasmega.github.io/HADALBORE_LAB/)** and start using it. *(The application will automatically cache all database records for subsequent offline use).*
* **Method B: Offline Local Run (ZIP Archive)**: Download the ready-to-run ZIP archive from the **[Releases](https://github.com/Nikolasmega/HADALBORE_LAB/releases)** section, unpack it to any folder on your PC/USB, and double-click **`index.html`** to launch the app instantly without an internet connection.

### 2. Unlocking the Database
To protect intellectual property, the database is encrypted:
1. When you launch the application, you will be prompted with the **Unlock Screen**.
2. The default access key **`HADALBORE2026`** is pre-filled automatically for your convenience.
3. Click the **"Unlock"** button to decrypt the database and enter the platform.
4. Your decrypted state will be cached in the browser session. You will not need to re-enter the password when refreshing the page.

### 3. Installing the App on Devices (PWA)
You can install **HADALBORE_LAB** directly onto your phone, tablet, or PC desktop to launch it like a native application with an offline app icon:
* **iPhone & iPad (Safari)**:
  1. Open the website link in Safari.
  2. Tap the **Share** button (box with an arrow pointing up) at the bottom.
  3. Scroll down and tap **Add to Home Screen**.
* **Android Phones & Tablets (Chrome)**:
  1. Open the website link in Chrome.
  2. Tap the pop-up notification: *“Add HADALBORE_LAB to Home screen”* or tap the three dots in the top right and select **Install app**.
* **Desktop computers (PC / Mac)**:
  1. Open the website link in Chrome or Edge.
  2. Click the **Install App** icon (looks like a monitor with an arrow) on the right side of the address bar.

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

## Getting Started (For Developers)

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

## 🚀 Инструкция для пользователей (Как запустить и установить)

### 1. Запуск приложения
Вы можете запускать и использовать приложение двумя способами:
* **Способ А: Онлайн веб-версия (PWA)**: Просто перейдите по официальной ссылке в браузере: **[https://nikolasmega.github.io/HADALBORE_LAB/](https://nikolasmega.github.io/HADALBORE_LAB/)** и пользуйтесь. *(Сайт загрузится и автоматически сохранит базу данных в память вашего устройства для последующей оффлайн-работы).*
* **Способ Б: Локальный оффлайн-запуск (ZIP-архив)**: Скачайте готовый ZIP-архив из раздела **[Релизы (Releases)](https://github.com/Nikolasmega/HADALBORE_LAB/releases)**, распакуйте его в любую папку на компьютере или флешке и дважды кликните по файлу **`index.html`** — справочник запустится мгновенно без интернета.

### 2. Разблокировка базы данных
Для защиты интеллектуальной собственности база данных зашифрована:
1. При запуске приложения появится **Экран разблокировки**.
2. Ключ доступа по умолчанию **`HADALBORE2026`** уже автоматически предзаполнен для вашего удобства.
3. Нажмите кнопку **«Разблокировать»** для дешифрования базы и входа на платформу.
4. Успешный вход сохраняется в сессии браузера. При обновлении страницы повторно вводить пароль не потребуется.

### 3. Установка приложения на устройства (PWA)
Вы можете установить **HADALBORE_LAB** на экран телефона, планшета или рабочий стол компьютера, чтобы запускать его как обычную программу с оффлайн-иконкой:
* **iPhone и iPad (Safari)**:
  1. Откройте сайт в браузере Safari.
  2. Нажмите кнопку **«Поделиться»** (квадрат со стрелкой вверх) на панели снизу.
  3. Прокрутите список меню вниз и выберите **«На экран "Домой"»**.
* **Смартфоны и планшеты Android (Chrome)**:
  1. Откройте сайт в браузере Chrome.
  2. Нажмите на всплывающее уведомление *«Добавить HADALBORE_LAB на главный экран»* или откройте меню (три точки сверху справа) и выберите **«Установить приложение»**.
* **Компьютеры и ноутбуки (ПК / Mac)**:
  1. Откройте сайт в браузере Chrome или Edge.
  2. В правой части адресной строки нажмите на иконку **«Установить приложение»** (монитор со стрелочкой).

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

## Начало работы (Для разработчиков)

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
