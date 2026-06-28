import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';
import { UsageStats } from '../core/usageStats.js';
import { DiagnosticExport } from '../core/diagnosticExport.js';
import { FeedbackEngine } from '../core/feedbackEngine.js';
import { IntegritySnapshot } from '../core/IntegritySnapshot.js';
import { PROJECT_IDENTITY } from '../core/projectIdentity.js';
import versionJson from '../data/version.json';
import releaseManifest from '../data/release_manifest.json';
import { mockDb } from '../database/mockDb.js';

export class SettingsPanel {
  constructor(dialogId) {
    this.dialog = document.getElementById(dialogId);
    this.feedbackStatus = '';
    if (this.dialog) {
      let lastLang = store.getState().lang;
      let lastTheme = store.getState().theme;
      let lastUnit = store.getState().unitSystem;
      let lastView = store.getState().viewMode;
      let lastField = store.getState().fieldMode;
      let lastCorrupt = store.getState().schemaCorrupted;
      let lastBoot = store.getState().bootStatus;
      let lastScale = store.getState().fontScale;
      let lastLocDebug = store.getState().localizationDebugMode;
      
      store.subscribe((state) => {
        if (
          state.lang !== lastLang ||
          state.theme !== lastTheme ||
          state.unitSystem !== lastUnit ||
          state.viewMode !== lastView ||
          state.fieldMode !== lastField ||
          state.schemaCorrupted !== lastCorrupt ||
          state.bootStatus !== lastBoot ||
          state.fontScale !== lastScale ||
          state.localizationDebugMode !== lastLocDebug
        ) {
          lastLang = state.lang;
          lastTheme = state.theme;
          lastUnit = state.unitSystem;
          lastView = state.viewMode;
          lastField = state.fieldMode;
          lastCorrupt = state.schemaCorrupted;
          lastBoot = state.bootStatus;
          lastScale = state.fontScale;
          lastLocDebug = state.localizationDebugMode;
          this.render();
        }
      });
    }
  }

  render() {
    if (!this.dialog) return;
    const { lang, theme, unitSystem, viewMode, fieldMode, fontScale, localizationDebugMode } = store.getState();
    const t = (key) => i18n.t(key);
    const isRu = lang === 'ru';

    // PWA & Environment status detections
    const isSWActive = typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller !== null;
    const isIDBAvailable = typeof window !== 'undefined' && !!window.indexedDB;
    const isPwaInstalled = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);

    const statusPwa = isPwaInstalled ? (isRu ? 'ДА' : 'YES') : (isRu ? 'НЕТ' : 'NO');
    const statusOffline = (isSWActive && isIDBAvailable) ? (isRu ? 'ДА' : 'YES') : (isRu ? 'НЕТ' : 'NO');
    const statusIdb = isIDBAvailable ? (isRu ? 'ОК' : 'ACTIVE') : (isRu ? 'СБОЙ' : 'FAIL');
    const statusSw = isSWActive ? (isRu ? 'ОК' : 'ACTIVE') : (isRu ? 'СБОЙ' : 'FAIL');
    const lastSync = localStorage.getItem('hadalbore_last_sync') || new Date().toLocaleDateString();

    // Compute live Integrity Seal
    const runtimeSeal = IntegritySnapshot.computeIntegritySealHash(mockDb);
    const expectedSeal = releaseManifest.integritySealHash;
    const isSealValid = runtimeSeal === expectedSeal;

    // Local usage statistics
    const stats = UsageStats.getStats();

    const sourceWarningText = isRu
      ? `${PROJECT_IDENTITY.PRODUCT_NAME} поддерживается исключительно ${PROJECT_IDENTITY.CREATOR}. Официальным и доверенным источником проекта является публичный репозиторий GitHub и официальные ссылки. Неофициальные копии, форки или измененные версии не гарантируют точность, безопасность или актуальность данных.`
      : `${PROJECT_IDENTITY.PRODUCT_NAME} is officially maintained only by ${PROJECT_IDENTITY.CREATOR}. The official and trusted source of the project is the public GitHub repository and official project links. Unofficial copies, forks, or redistributed versions are not guaranteed to be accurate, supported, updated, or safe for engineering use.`;

    // Compute field mode status indicator
    let fieldModeBannerHtml = '';
    if (fieldMode) {
      const isDbHealthy = !store.getState().schemaCorrupted;
      let statusColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400';
      let statusText = isRu ? '🟢 АКТИВЕН' : '🟢 ACTIVE';
      let statusDesc = isRu ? 'РЕЖИМ ЧТЕНИЯ • ОФФЛАЙН ЗАЩИТА' : 'READ ONLY • OFFLINE SAFE';
      
      if (store.getState().bootStatus === 'BOOT_RECOVERY_LOADED') {
        statusColor = 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400';
        statusText = isRu ? '🟡 РЕЗЕРВНЫЙ РЕЖИМ' : '🟡 RECOVERY ACTIVE';
        statusDesc = isRu ? 'ОБНАРУЖЕНО РАССОГЛАСОВАНИЕ БД' : 'DATABASE INCONSISTENCY DETECTED';
      } else if (!isDbHealthy) {
        statusColor = 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400';
        statusText = isRu ? '🔴 СБОЙ ЗАЩИТЫ' : '🔴 PROTECTION FAIL';
        statusDesc = isRu ? 'КРИТИЧЕСКАЯ ОШИБКА ХЭША СХЕМЫ' : 'CRITICAL SCHEMA INTEGRITY FAILURE';
      }
      
      fieldModeBannerHtml = `
        <div class="p-2.5 border rounded-lg flex flex-col gap-1 ${statusColor} select-none">
          <div class="flex justify-between items-center font-bold uppercase tracking-wider text-[9.5px]">
            <span>${isRu ? 'Полевой режим' : 'Field Mode'}</span>
            <span>${statusText}</span>
          </div>
          <div class="text-[8.5px] font-mono leading-none font-semibold uppercase tracking-wider mt-0.5">${statusDesc}</div>
        </div>
      `;
    }

    this.dialog.innerHTML = `
      <div class="flex flex-col bg-white dark:bg-zinc-900 overflow-hidden w-full max-w-sm rounded-xl">
        <!-- Dialog Header -->
        <div class="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-sans">
            ${isRu ? 'Настройки Справочника' : 'Platform Settings'}
          </h3>
          <button id="settings-close-btn" class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Dialog Body (Scrollable) -->
        <div class="p-5 space-y-5 font-sans text-xs overflow-y-auto max-h-[70vh] scrollbar-none">
          <!-- Official Source Warning -->
          <div class="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-[9.5px] leading-relaxed font-medium">
            <span class="font-bold block mb-0.5 uppercase tracking-wider">${isRu ? 'Официальный источник' : 'Official Source Warning'}</span>
            ${sourceWarningText}
          </div>
          ${fieldModeBannerHtml}
          <!-- 1. Language Toggle -->
          <div class="space-y-1.5">
            <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
              ${isRu ? 'Язык интерфейса' : 'Language'}
            </label>
            <div class="grid grid-cols-2 gap-1.5 bg-zinc-50 dark:bg-zinc-850 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
              <button id="settings-lang-en" class="py-1.5 rounded-md text-center transition-all cursor-pointer ${lang === 'en' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}">
                ${t('lang_en')}
              </button>
              <button id="settings-lang-ru" class="py-1.5 rounded-md text-center transition-all cursor-pointer ${lang === 'ru' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}">
                ${t('lang_ru')}
              </button>
            </div>
          </div>

          <!-- 2. Theme Selector -->
          <div class="space-y-1.5">
            <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
              ${isRu ? 'Цветовая схема' : 'Color Scheme'}
            </label>
            <div class="grid grid-cols-3 gap-1.5 bg-zinc-50 dark:bg-zinc-850 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
              <button id="settings-theme-light" class="py-1.5 rounded-md text-center transition-all cursor-pointer ${theme === 'light' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}">
                ${t('theme_light')}
              </button>
              <button id="settings-theme-dark" class="py-1.5 rounded-md text-center transition-all cursor-pointer ${theme === 'dark' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}">
                ${t('theme_dark')}
              </button>
              <button id="settings-theme-system" class="py-1.5 rounded-md text-center transition-all cursor-pointer ${theme === 'system' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}">
                ${t('theme_system')}
              </button>
            </div>
          </div>

          <!-- 3. Unit System Selector -->
          <div class="space-y-1.5">
            <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
              ${t('units_label')}
            </label>
            <select id="settings-unit-select" class="block w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700/60 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 px-2.5 py-2.5 outline-none transition-all shadow-sm">
              <option value="imperial" ${unitSystem === 'imperial' ? 'selected' : ''}>${t('units_imperial')}</option>
              <option value="metric" ${unitSystem === 'metric' ? 'selected' : ''}>${t('units_metric')}</option>
              <option value="hybrid" ${unitSystem === 'hybrid' ? 'selected' : ''}>${t('units_hybrid')}</option>
            </select>
          </div>

          <!-- 4. View Mode Selector -->
          <div class="space-y-1.5 border-t border-zinc-100 dark:border-zinc-850/50 pt-3.5">
            <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
              ${isRu ? 'Режим отображения' : 'View Mode'}
            </label>
            <div class="grid grid-cols-2 gap-1.5 bg-zinc-50 dark:bg-zinc-850 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
              <button id="settings-mode-field" class="py-1.5 rounded-md text-center transition-all cursor-pointer text-[10px] ${viewMode === 'field' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}">
                ${isRu ? 'Полевой вид' : 'Field View'}
              </button>
              <button id="settings-mode-eng" class="py-1.5 rounded-md text-center transition-all cursor-pointer text-[10px] ${viewMode === 'engineering' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-semibold shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}">
                ${isRu ? 'Технический вид' : 'Technical View'}
              </button>
            </div>
          </div>

          <!-- 4a. Font Scale Selector -->
          <div class="space-y-1.5 border-t border-zinc-100 dark:border-zinc-850/50 pt-3.5">
            <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
              ${isRu ? 'Масштаб текста' : 'Text Scale'}
            </label>
            <p class="text-[8.5px] text-zinc-500 dark:text-zinc-500 -mt-0.5 leading-tight">
              ${isRu ? 'Увеличьте шрифт для лучшей читаемости на полевых условиях' : 'Increase font size for better readability in field conditions'}
            </p>
            <div class="grid grid-cols-4 gap-1.5 bg-zinc-50 dark:bg-zinc-850 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
              ${[{v: 0.9, label: '90%'}, {v: 1.0, label: '100%'}, {v: 1.1, label: '110%'}, {v: 1.25, label: '125%'}].map(opt => `
                <button id="settings-scale-${opt.label.replace('%','')}" data-scale="${opt.v}" class="py-1.5 rounded-md text-center transition-all cursor-pointer text-[10px] font-mono ${fontScale === opt.v ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}">
                  ${opt.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 4b. Field Distribution Mode Switch -->
          <div class="space-y-1.5 border-t border-zinc-100 dark:border-zinc-850/50 pt-3.5 flex items-center justify-between">
            <div class="pr-2">
              <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
                ${isRu ? 'Блокировка изменений (Read-Only)' : 'Field Write Lock (Read-Only)'}
              </label>
              <p class="text-[8.5px] text-zinc-500 dark:text-zinc-500 mt-0.5 leading-tight">
                ${isRu ? 'Защита от записи в IndexedDB и отключение синхронизации' : 'Locks IndexedDB writes & blocks sync mutations'}
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer select-none shrink-0">
              <input type="checkbox" id="settings-field-mode-toggle" class="sr-only peer" ${fieldMode ? 'checked' : ''}>
              <div class="w-8 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-zinc-950 dark:peer-checked:bg-white"></div>
            </label>
          </div>

          <!-- 4c. Localization Debug Mode Toggle -->
          <div class="space-y-1.5 border-t border-zinc-100 dark:border-zinc-850/50 pt-3.5 flex items-center justify-between">
            <div class="pr-2">
              <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider select-none">
                ${isRu ? 'Отладка локализации' : 'Localization Debug'}
              </label>
              <p class="text-[8.5px] text-zinc-500 dark:text-zinc-500 mt-0.5 leading-tight">
                ${isRu ? 'Подсвечивать локализованные ключи и тексты в интерфейсе' : 'Highlight translated keys & texts in user interface'}
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer select-none shrink-0">
              <input type="checkbox" id="settings-loc-debug-toggle" class="sr-only peer" ${localizationDebugMode ? 'checked' : ''}>
              <div class="w-8 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-zinc-950 dark:peer-checked:bg-white"></div>
            </label>
          </div>

          <!-- 5. FIELD DEPLOYMENT STATUS -->
          <div class="space-y-1.5 border-t border-zinc-100 dark:border-zinc-850/50 pt-3.5">
            <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
              ${isRu ? 'Статус развертывания' : 'Field Deployment Status'}
            </label>
            <div class="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-lg border border-zinc-200/40 dark:border-zinc-800 space-y-2 font-mono text-[10px]">
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'PWA установлен' : 'PWA Installed'}:</span>
                <span class="font-bold ${statusPwa === 'YES' || statusPwa === 'ДА' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-455'}">${statusPwa}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Автономная работа' : 'Offline Ready'}:</span>
                <span class="font-bold ${statusOffline === 'YES' || statusOffline === 'ДА' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}">${statusOffline}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">IndexedDB Status:</span>
                <span class="font-bold ${statusIdb === 'ACTIVE' || statusIdb === 'ОК' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}">${statusIdb}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">Service Worker:</span>
                <span class="font-bold ${statusSw === 'ACTIVE' || statusSw === 'ОК' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}">${statusSw}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Синхронизация' : 'Last Sync'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-bold">${lastSync}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Версия приложения' : 'App Version'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-bold">${versionJson.buildVersion}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Версия набора' : 'Dataset Version'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-bold">${versionJson.datasetVersion}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">Dataset Hash:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-bold select-all">${releaseManifest.buildHash}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-455">${isRu ? 'Печать целостности' : 'Integrity Seal'}:</span>
                <span class="font-bold ${isSealValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'} select-all" title="${runtimeSeal}">
                  ${isSealValid ? 'OK' : 'MISMATCH'} (${runtimeSeal})
                </span>
              </div>
            </div>
          </div>

          <!-- 6. LOCAL USAGE STATS -->
          <div class="space-y-1.5 border-t border-zinc-100 dark:border-zinc-850/50 pt-3.5">
            <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              ${isRu ? 'Локальная активность' : 'Local Usage'}
            </label>
            <div class="grid grid-cols-2 gap-2 text-[10px]">
              <div class="p-2 bg-zinc-50 dark:bg-zinc-850 rounded border border-zinc-200/40 dark:border-zinc-800">
                <span class="block text-[8px] uppercase font-bold text-zinc-400 dark:text-zinc-500">${isRu ? 'Всего запусков' : 'Total Launches'}</span>
                <span class="font-mono font-bold text-zinc-900 dark:text-white text-xs">${stats.launches}</span>
              </div>
              <div class="p-2 bg-zinc-50 dark:bg-zinc-850 rounded border border-zinc-200/40 dark:border-zinc-800">
                <span class="block text-[8px] uppercase font-bold text-zinc-400 dark:text-zinc-500">${isRu ? 'Активных дней' : 'Days Active'}</span>
                <span class="font-mono font-bold text-zinc-900 dark:text-white text-xs">${stats.daysActive}</span>
              </div>
              <div class="p-2 bg-zinc-50 dark:bg-zinc-850 rounded border border-zinc-200/40 dark:border-zinc-800">
                <span class="block text-[8px] uppercase font-bold text-zinc-400 dark:text-zinc-500">${isRu ? 'Установлено' : 'Installed Since'}</span>
                <span class="font-mono font-bold text-zinc-700 dark:text-zinc-300">${stats.installedSince}</span>
              </div>
              <div class="p-2 bg-zinc-50 dark:bg-zinc-850 rounded border border-zinc-200/40 dark:border-zinc-800">
                <span class="block text-[8px] uppercase font-bold text-zinc-400 dark:text-zinc-500">Device ID</span>
                <span class="font-mono font-bold text-zinc-700 dark:text-zinc-300 text-[9px] truncate block" title="${stats.deviceId}">${stats.deviceId}</span>
              </div>
            </div>
          </div>

          <!-- 7. FIELD FEEDBACK -->
          <div class="space-y-1.5 border-t border-zinc-100 dark:border-zinc-850/50 pt-3.5">
            <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              ${isRu ? 'Обратная связь' : 'Field Feedback'}
            </label>
            <textarea id="settings-feedback-input" class="w-full h-16 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 rounded-lg p-2 text-[10px] outline-none text-zinc-850 dark:text-zinc-100 font-sans resize-none placeholder-zinc-400" placeholder="${isRu ? 'Опишите проблему или ошибку...' : 'Describe any issues or corrections needed...'}" max-length="1000"></textarea>
            <button id="settings-feedback-submit" class="w-full py-2 bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold rounded-lg transition-colors cursor-pointer text-center">
              ${isRu ? 'Отправить обратную связь' : 'Send Feedback'}
            </button>
            ${this.feedbackStatus ? `
              <div class="text-[9.5px] font-bold text-center ${this.feedbackStatus.includes('error') || this.feedbackStatus.includes('ошибк') ? 'text-rose-500' : 'text-emerald-500'} mt-1">
                ${this.feedbackStatus}
              </div>
            ` : ''}
          </div>

          <!-- 8. DIAGNOSTIC EXPORT -->
          <div class="space-y-1.5 border-t border-zinc-100 dark:border-zinc-850/50 pt-3.5">
            <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
              ${isRu ? 'Экспорт данных' : 'Export & Diagnostics'}
            </label>
            <button id="settings-export-package" class="w-full py-2 mb-1 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>
              ${isRu ? 'Экспорт полевого пакета' : 'Export Field Package'}
            </button>
            <div class="grid grid-cols-2 gap-2">
              <button id="settings-export-json" class="py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/60 font-bold rounded-lg transition-colors cursor-pointer text-center">
                JSON SNAPSHOT
              </button>
              <button id="settings-export-txt" class="py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/60 font-bold rounded-lg transition-colors cursor-pointer text-center">
                TXT REPORT
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Close modal trigger
    const closeBtn = document.getElementById('settings-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        this.feedbackStatus = '';
        this.dialog.close();
      };
    }

    // Language switch handlers
    const langEn = document.getElementById('settings-lang-en');
    const langRu = document.getElementById('settings-lang-ru');
    if (langEn) langEn.onclick = () => store.setState({ lang: 'en' });
    if (langRu) langRu.onclick = () => store.setState({ lang: 'ru' });

    // Theme override triggers
    const themeLight = document.getElementById('settings-theme-light');
    const themeDark = document.getElementById('settings-theme-dark');
    const themeSystem = document.getElementById('settings-theme-system');
    if (themeLight) themeLight.onclick = () => store.setState({ theme: 'light' });
    if (themeDark) themeDark.onclick = () => store.setState({ theme: 'dark' });
    if (themeSystem) themeSystem.onclick = () => store.setState({ theme: 'system' });

    // Unit System dropdown changed
    const unitSelect = document.getElementById('settings-unit-select');
    if (unitSelect) {
      unitSelect.onchange = (e) => store.setState({ unitSystem: e.target.value });
    }

    // View mode handlers
    const modeEng = document.getElementById('settings-mode-eng');
    const modeField = document.getElementById('settings-mode-field');
    if (modeEng) modeEng.onclick = () => store.setState({ viewMode: 'engineering' });
    if (modeField) modeField.onclick = () => store.setState({ viewMode: 'field' });

    // Font scale handlers
    const scaleBtns = this.dialog.querySelectorAll('[data-scale]');
    scaleBtns.forEach(btn => {
      btn.onclick = () => {
        const scale = parseFloat(btn.getAttribute('data-scale'));
        if (!isNaN(scale)) store.setState({ fontScale: scale });
      };
    });

    // Field Distribution Mode Toggle
    const fieldModeToggle = document.getElementById('settings-field-mode-toggle');
    if (fieldModeToggle) {
      fieldModeToggle.onchange = (e) => {
        const entering = e.target.checked;
        store.setState({
          fieldMode: entering,
          viewMode: entering ? 'field' : 'engineering'
        });
      };
    }

    // Localization Debug Mode Toggle
    const locDebugToggle = document.getElementById('settings-loc-debug-toggle');
    if (locDebugToggle) {
      locDebugToggle.onchange = (e) => {
        store.setState({ localizationDebugMode: e.target.checked });
      };
    }

    // Feedback Submit handler
    const feedbackSubmit = document.getElementById('settings-feedback-submit');
    const feedbackInput = document.getElementById('settings-feedback-input');
    const isRu = store.getState().lang === 'ru';
    
    if (feedbackSubmit && feedbackInput) {
      feedbackSubmit.onclick = async () => {
        const text = feedbackInput.value;
        if (!text || !text.trim()) {
          this.feedbackStatus = isRu ? 'Сообщение пустое' : 'Feedback details are empty';
          this.render();
          return;
        }
        
        feedbackSubmit.disabled = true;
        this.feedbackStatus = isRu ? 'Отправка...' : 'Sending...';
        this.render();
        
        try {
          const result = await FeedbackEngine.sendFeedback(text);
          if (result.success) {
            if (result.mode === 'online') {
              this.feedbackStatus = isRu ? 'Отзыв отправлен!' : 'Feedback sent successfully!';
              feedbackInput.value = '';
            } else {
              this.feedbackStatus = isRu ? 'Сохранено! Отчет скачан.' : 'Offline mode. Report downloaded.';
              feedbackInput.value = '';
            }
          } else {
            this.feedbackStatus = isRu ? 'Ошибка отправки' : 'Delivery failure';
          }
        } catch (e) {
          this.feedbackStatus = isRu ? 'Сбой отправки' : 'Error submitting feedback';
        }
        
        feedbackSubmit.disabled = false;
        this.render();
      };
    }

    // Diagnostic Export handlers
    const expJson = document.getElementById('settings-export-json');
    const expTxt = document.getElementById('settings-export-txt');
    const exportPkg = document.getElementById('settings-export-package');
    if (expJson) {
      expJson.onclick = () => DiagnosticExport.exportJson();
    }
    if (expTxt) {
      expTxt.onclick = () => DiagnosticExport.exportTxt();
    }
    if (exportPkg) {
      exportPkg.onclick = () => DiagnosticExport.exportFieldPackage();
    }

    // Click outside boundary fallback to close dialog
    this.dialog.onclick = (e) => {
      const rect = this.dialog.getBoundingClientRect();
      const clickedInside = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!clickedInside) {
        this.feedbackStatus = '';
        this.dialog.close();
      }
    };
  }
}
export default SettingsPanel;
