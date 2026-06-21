import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';
import mockDb from '../data/mock-db.json';
import versionJson from '../data/version.json';
import { PROJECT_IDENTITY } from '../core/projectIdentity.js';
import runningDataView from '../modules/running-data/view.js';

const MODULE_ICONS = {
  tubulars: `<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"></path></svg>`,
  threads: `<svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path></svg>`,
  elastomers: `<svg class="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"></path></svg>`,
  'steel-grades': `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v1.244m0 0a3.75 3.75 0 01-3 3.75v3.896a6 6 0 00-3 5.197h16.5a6 6 0 00-3-5.197V8.098a3.75 3.75 0 01-3-3.75M9.75 4.348h4.5M9.75 3.104h4.5M9 17h6"></path></svg>`,
  standards: `<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"></path></svg>`,
  failures: `<svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path></svg>`,
  calculators: `<svg class="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 7h6m0 10v-3m-3 3h.008v.008H12V17zm-3 0h.008v.008H9V17zm0-3h.008v.008H9v-.008zm3 0h.008v.008H12v-.008zm3 0h.008v.008H15v-.008zm0-3h.008v.008H15V11zm-3 0h.008v.008H12V11zm-3 0h.008v.008H9V11zm-6 8.25h15a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0017.25 3H3.75A2.25 2.25 0 001.5 5.25v11.25A2.25 2.25 0 003.75 19.25z"></path></svg>`,
  'running-data': `<svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H3.75m6.25 12h-6.25m6.25 3h-6.25m9.75-10.5c.375.375.375.992 0 1.367l-5.625 5.625a1.875 1.875 0 01-1.328.55h-1.875V11.25a1.875 1.875 0 01.55-1.328l5.625-5.625a.97.97 0 011.367 0z"></path></svg>`
};

export class Homepage {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.showFeedbackSuccess = false;
  }

  render() {
    if (!this.container) return;
    const { lang, feedbacks, mostOpened, recentlyViewed, fieldMode, schemaCorrupted } = store.getState();
    const t = (key) => i18n.t(key);
    const isRu = lang === 'ru';

    // 8 distinct quick access modules
    const modules = [
      { id: 'tubulars', path: 'tubulars', tab: null },
      { id: 'threads', path: 'threads', tab: null },
      { id: 'elastomers', path: 'elastomers', tab: null },
      { id: 'steel-grades', path: 'steel-grades', tab: null },
      { id: 'standards', path: 'standards', tab: null },
      { id: 'failures', path: 'failures', tab: null },
      { id: 'calculators', path: 'running-data', tab: 'calcs' },
      { id: 'running-data', path: 'running-data', tab: 'guide' }
    ];

    const titles = {
      tubulars: isRu ? 'Трубы и бурильный инструмент' : 'Tubulars',
      threads: isRu ? 'Резьбовые соединения' : 'Thread Connections',
      elastomers: isRu ? 'Эластомеры и уплотнения' : 'Elastomers & Seals',
      'steel-grades': isRu ? 'Марки сталей и коррозия' : 'Steel Grades & Corrosion',
      standards: isRu ? 'Сопоставление стандартов' : 'Standards Cross-Match',
      failures: isRu ? 'Энциклопедия отказов' : 'Failure Encyclopedia',
      calculators: isRu ? 'Инженерные калькуляторы' : 'Engineering Calculators',
      'running-data': isRu ? 'Руководство по спуску' : 'Running Recommendations'
    };

    const descriptions = {
      tubulars: isRu ? 'Справочник размеров, групп прочности, давлений на смятие и разрыв.' : 'Reference directory for OD, ID, drift, burst, and collapse limits.',
      threads: isRu ? 'Крутящие моменты, потеря длины и параметры свинчивания премиум-соединений.' : 'Torque ranges, makeup turns, loss, and running guidelines.',
      elastomers: isRu ? 'Температурные диапазоны, стойкость и подбор уплотнительных элементов.' : 'Temperature limits, chemical compatibility, and NBR/FKM selection.',
      'steel-grades': isRu ? 'Коррозионная стойкость сплавов в средах H₂S/CO₂ и NACE-классификация.' : 'Sulfide stress cracking (SSC) and corrosion resistance envelopes.',
      standards: isRu ? 'Таблицы сопоставления спецификаций API, ISO, ГОСТ и GB/T.' : 'Equivalency matrix charts comparing API, ISO, GOST, and GB/T.',
      failures: isRu ? 'База данных разрушений с триггерными условиями и механизмами отказов.' : 'Encyclopedia of casing leaks, galling, washouts, and tensile failures.',
      calculators: isRu ? 'Расчеты гидростатики, объемов скважины, температурного расширения и утяжеления.' : 'Volumetric capacity, hydrostatic gradients, and density conversions.',
      'running-data': isRu ? 'Рекомендации по скоростям спуска, вращению, нагрузкам и Do/Don\'t.' : 'Running speeds, torque limits, hook load drag, and circulation recommendations.'
    };

    const gridCards = modules.map(mod => {
      const label = titles[mod.id];
      const desc = descriptions[mod.id];
      const icon = MODULE_ICONS[mod.id] || MODULE_ICONS['running-data'];

      return `
        <div id="home-card-${mod.id}" data-target-path="${mod.path}" data-target-tab="${mod.tab || ''}" class="glassmorphic-card p-4 rounded-xl cursor-pointer flex flex-col justify-between h-32 hover:border-zinc-350 dark:hover:border-zinc-700 transition-all shadow-sm">
          <div class="flex items-start justify-between">
            <div class="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200/40 dark:border-zinc-700/60 shadow-sm shrink-0">
              ${icon}
            </div>
          </div>
          <div class="mt-2">
            <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-50">${label}</h4>
            <p class="text-[9.5px] text-zinc-400 dark:text-zinc-500 mt-1 leading-normal">${desc}</p>
          </div>
        </div>
      `;
    }).join('');

    // Offline & Database Status computation
    const isSWActive = typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller !== null;
    const isIDBAvailable = typeof window !== 'undefined' && !!window.indexedDB;
    const offlineReady = isSWActive && isIDBAvailable;

    const offlineStatusLabel = offlineReady ? (isRu ? 'Готов к работе' : 'Ready') : (isRu ? 'Только в сети' : 'Network Only');
    const offlineStatusColor = offlineReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500';

    const dbStatusLabel = schemaCorrupted ? (isRu ? 'На восстановлении' : 'Recovery') : (isRu ? 'Норма' : 'Healthy');
    const dbStatusColor = schemaCorrupted ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400';

    const fieldModeLabel = fieldMode ? (isRu ? 'Полевой режим' : 'Field Mode') : (isRu ? 'Стандартный' : 'Standard');
    const fieldModeColor = fieldMode ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-500';

    // Local Usage Shortcut Lists
    const resolvedRecentItems = recentlyViewed.map(item => {
      let foundRec = null;
      const mappedModule = item.module === 'acid_environments' ? 'steel-grades' : item.module;
      const dbKey = mappedModule === 'steel-grades' ? 'acid_environments' : mappedModule;
      
      const array = mockDb[dbKey];
      if (array) {
        const rec = array.find(r => r.id === item.id);
        if (rec) foundRec = { ...rec, module: mappedModule };
      }
      return foundRec;
    }).filter(Boolean);

    const resolvedFavoriteItems = (store.getState().favorites || []).map(item => {
      let foundRec = null;
      const mappedModule = item.module === 'acid_environments' ? 'steel-grades' : item.module;
      const dbKey = mappedModule === 'steel-grades' ? 'acid_environments' : mappedModule;
      
      const array = mockDb[dbKey];
      if (array) {
        const rec = array.find(r => r.id === item.id);
        if (rec) foundRec = { ...rec, module: mappedModule };
      }
      return foundRec;
    }).filter(Boolean);

    let favoritesHtml = '';
    if (resolvedFavoriteItems.length === 0) {
      favoritesHtml = `<p class="text-[9.5px] text-zinc-400 dark:text-zinc-555 italic leading-relaxed py-2 font-sans">${isRu ? 'Нет избранных записей.' : 'No favorite items yet.'}</p>`;
    } else {
      favoritesHtml = `
        <div class="space-y-1.5 py-1">
          ${resolvedFavoriteItems.map(item => `
            <div data-favorite-id="${item.id}" data-favorite-module="${item.module}" class="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-lg text-[9.5px] font-sans flex items-center justify-between cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors">
              <div class="truncate pr-4">
                <span class="font-bold text-zinc-950 dark:text-white block truncate">${item.name}</span>
                <span class="text-[7.5px] text-zinc-450 dark:text-zinc-550 uppercase tracking-wider">${t(`nav.${item.module}`)}</span>
              </div>
              <svg class="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
            </div>
          `).join('')}
        </div>
      `;
    }

    let recentHtml = '';
    if (resolvedRecentItems.length === 0) {
      recentHtml = `<p class="text-[9.5px] text-zinc-400 dark:text-zinc-555 italic leading-relaxed py-2 font-sans">${isRu ? 'Нет недавно просмотренных.' : 'No recently viewed items.'}</p>`;
    } else {
      recentHtml = `
        <div class="space-y-1.5 py-1">
          ${resolvedRecentItems.map(item => `
            <div data-recent-id="${item.id}" data-recent-module="${item.module}" class="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-lg text-[9.5px] font-sans flex items-center justify-between cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors">
              <div class="truncate pr-4">
                <span class="font-bold text-zinc-950 dark:text-white block truncate">${item.name}</span>
                <span class="text-[7.5px] text-zinc-450 dark:text-zinc-550 uppercase tracking-wider">${t(`nav.${item.module}`)}</span>
              </div>
              <svg class="w-3.5 h-3.5 text-zinc-455 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"></path></svg>
            </div>
          `).join('')}
        </div>
      `;
    }

    this.container.innerHTML = `
      <div class="space-y-6 py-2">
        

        <!-- 8 Quick Access Cards Grid -->
        <div class="space-y-2.5">
          <h3 class="text-[9.5px] font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-widest pl-2 border-l-2 border-zinc-400 dark:border-zinc-650">
            ${isRu ? 'Разделы инженерного справочника' : 'Quick Reference Modules'}
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${gridCards}
          </div>
        </div>

        <!-- Two Column Status, Recent Items, & Widget Panel -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Column Left: Field Status and Feedback -->
          <div class="md:col-span-2 space-y-4">
            <!-- Field Status Summary -->
            <div class="glassmorphic p-4.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/65 shadow-sm space-y-3">
              <h4 class="text-[9.5px] font-bold text-zinc-950 dark:text-white uppercase tracking-wider">${isRu ? 'Операционный статус системы' : 'Field System Status'}</h4>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] font-mono">
                <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded-lg border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between">
                  <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Сеть / Оффлайн' : 'Offline Ready'}</span>
                  <span class="font-bold mt-1.5 ${offlineReady ? 'text-emerald-600 dark:text-emerald-450' : 'text-zinc-500'}">${offlineStatusLabel}</span>
                </div>
                <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded-lg border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between">
                  <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Целостность БД' : 'Database Status'}</span>
                  <span class="font-bold mt-1.5 ${dbStatusColor}">${dbStatusLabel}</span>
                </div>
                <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded-lg border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between">
                  <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Режим работы' : 'Field Mode Status'}</span>
                  <span class="font-bold mt-1.5 ${fieldModeColor}">${fieldModeLabel}</span>
                </div>
                <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded-lg border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between">
                  <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Версия ПО' : 'Software Version'}</span>
                  <span class="font-bold mt-1.5 text-zinc-700 dark:text-zinc-300">v${versionJson.buildVersion}</span>
                </div>
                <div class="p-2.5 bg-zinc-50 dark:bg-zinc-850/50 rounded-lg border border-zinc-200/30 dark:border-zinc-800/80 flex flex-col justify-between sm:col-span-2">
                  <span class="text-zinc-455 text-[8.5px] uppercase font-bold tracking-wider">${isRu ? 'Версия датасета' : 'Dataset Version'}</span>
                  <span class="font-bold mt-1.5 text-zinc-700 dark:text-zinc-300">Dataset v${versionJson.datasetVersion}</span>
                </div>
              </div>
            </div>

            <!-- Small Feedback Area Widget -->
            <div class="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-zinc-100/35 dark:bg-zinc-900/10 flex items-center justify-between gap-4">
              <div class="space-y-0.5">
                <span class="text-[10px] font-bold text-zinc-900 dark:text-white font-sans">${isRu ? 'Не нашли нужные справочные данные?' : 'Missing engineering reference data?'}</span>
                <p class="text-[8.5px] text-zinc-455 dark:text-zinc-500 font-sans">${isRu ? 'Отправьте локальный запрос, и мы добавим параметры в следующем обновлении.' : 'Submit a request locally to have the data validated and integrated.'}</p>
              </div>
              <button 
                id="request-data-btn" 
                class="px-3 py-1.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-850 dark:hover:bg-zinc-100 rounded-lg text-[9.5px] font-bold uppercase tracking-wider shrink-0 transition-colors shadow-sm cursor-pointer font-sans"
              >
                ${isRu ? 'Запросить данные' : 'Request Data'}
              </button>
            </div>
          </div>

          <!-- Column Right: Shortcuts & Logs -->
          <div class="p-4.5 glassmorphic rounded-xl flex flex-col gap-4.5 shadow-sm">
            <!-- Favorites -->
            <div class="space-y-2">
              <h4 class="text-[9.5px] font-bold text-zinc-950 dark:text-zinc-100 uppercase tracking-widest">${isRu ? 'Избранные элементы' : 'Favorite Items'}</h4>
              ${favoritesHtml}
            </div>

            <!-- Recently Opened -->
            <div class="space-y-2">
              <h4 class="text-[9.5px] font-bold text-zinc-950 dark:text-zinc-100 uppercase tracking-widest">${t('recently_opened')}</h4>
              ${recentHtml}
            </div>
          </div>
        </div>

        <!-- Creator attribution footer -->
        <div class="pt-4 text-center text-[8.5px] text-zinc-400 dark:text-zinc-550 border-t border-zinc-100 dark:border-zinc-855 select-none font-mono">
          <p>© ${PROJECT_IDENTITY.PRODUCT_NAME} — Created by ${PROJECT_IDENTITY.CREATOR} • v${versionJson.buildVersion}</p>
        </div>
      </div>

      <!-- Compact Dialog Modal for Feedback requests -->
      <dialog id="home-feedback-dialog" class="rounded-xl p-0 shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 w-full max-w-sm">
        <div class="p-5 space-y-4 font-sans text-xs">
          <div class="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h4 class="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">${isRu ? 'Запрос справочных данных' : 'Request Reference Data'}</h4>
            <button id="close-feedback-dialog-btn" class="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 cursor-pointer">
              <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <form id="home-feedback-form" class="space-y-3">
            <p class="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">${isRu ? 'Опишите, какие технические характеристики, марки сталей или типоразмеры оборудования вам необходимы.' : 'Describe what technical specs, steel grades, or equipment dimensions you were looking for.'}</p>
            <textarea 
              id="home-feedback-input" 
              rows="3" 
              required 
              placeholder="${isRu ? 'Каких данных вам не хватает?' : 'What technical data are you looking for?'}" 
              class="block w-full px-3 py-2.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-650 transition-all font-sans resize-none"
            ></textarea>
            <div class="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
              <button type="submit" class="px-4 py-2 bg-zinc-950 text-white dark:bg-white dark:text-black hover:bg-zinc-850 dark:hover:bg-zinc-150 rounded-xl text-[10px] font-semibold transition-all shadow-sm cursor-pointer">${isRu ? 'Отправить' : 'Submit Request'}</button>
            </div>
          </form>
        </div>
      </dialog>
    `;

    this.bindEvents(modules);
  }

  bindEvents(modules) {
    // Search input redirect to search results
    const searchInput = document.getElementById('home-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        const val = e.target.value;
        // Sync with header global search input directly
        const globalInput = document.getElementById('global-search-input');
        if (globalInput) {
          globalInput.value = val;
        }
        store.setState({ searchQuery: val });
        store.trackSearch(val);
      };
    }

    // Card navigation clicks
    modules.forEach(mod => {
      const card = document.getElementById(`home-card-${mod.id}`);
      if (card) {
        card.onclick = () => {
          if (mod.id !== 'home') {
            store.trackModuleOpen(mod.id);
          }
          if (mod.tab) {
            runningDataView.activeTab = mod.tab;
          }
          store.setState({ activeModule: mod.path, searchQuery: '' });
        };
      }
    });

    // Recently opened record shortcut clicks
    const recentDivs = this.container.querySelectorAll('div[data-recent-id]');
    recentDivs.forEach(div => {
      div.onclick = () => {
        const recId = div.getAttribute('data-recent-id');
        const modId = div.getAttribute('data-recent-module');
        store.trackModuleOpen(modId);
        window.selectedRecordForced = { module: modId, id: recId };
        store.setState({ activeModule: modId, searchQuery: '' });
      };
    });

    // Favorite record shortcut clicks
    const favoriteDivs = this.container.querySelectorAll('div[data-favorite-id]');
    favoriteDivs.forEach(div => {
      div.onclick = () => {
        const recId = div.getAttribute('data-favorite-id');
        const modId = div.getAttribute('data-favorite-module');
        store.trackModuleOpen(modId);
        window.selectedRecordForced = { module: modId, id: recId };
        store.setState({ activeModule: modId, searchQuery: '' });
      };
    });

    // Feedback Dialog modal handlers
    const feedbackDialog = document.getElementById('home-feedback-dialog');
    const requestDataBtn = document.getElementById('request-data-btn');
    const closeDialogBtn = document.getElementById('close-feedback-dialog-btn');

    if (requestDataBtn && feedbackDialog) {
      requestDataBtn.onclick = () => {
        feedbackDialog.showModal();
      };
    }

    if (closeDialogBtn && feedbackDialog) {
      closeDialogBtn.onclick = () => {
        feedbackDialog.close();
      };
    }

    // Feedback Submission handler
    const form = document.getElementById('home-feedback-form');
    if (form && feedbackDialog) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const input = document.getElementById('home-feedback-input');
        const queryVal = input.value.trim();
        if (!queryVal) return;

        const currentFeedbacks = store.getState().feedbacks;
        const newFeedback = {
          query: queryVal,
          timestamp: new Date().toISOString(),
          language: store.getState().lang
        };

        store.setState({ feedbacks: [...currentFeedbacks, newFeedback] });
        input.value = '';
        
        feedbackDialog.close();

        // Get user registration details for attribution
        const userEmail = localStorage.getItem('hadalbore_user_email') || 'no-email-saved@hadalbore.lab';
        const userName = localStorage.getItem('hadalbore_user_name') || 'Anonymous User';
        const userCompany = localStorage.getItem('hadalbore_user_company') || 'None';

        // Notify sending status
        store.triggerToast({
          en: "Sending request to yulenkov.n@gmail.com...",
          ru: "Отправка запроса на yulenkov.n@gmail.com..."
        });

        // Submit via Formsubmit AJAX endpoint
        fetch("https://formsubmit.co/ajax/yulenkov.n@gmail.com", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            "Пользователь": userName,
            "Email пользователя": userEmail,
            "Компания": userCompany,
            "Запрос": queryVal
          })
        })
        .then(response => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then(() => {
          store.triggerToast({
            en: "Request sent successfully! Thank you.",
            ru: "Запрос успешно отправлен! Спасибо."
          });
        })
        .catch(err => {
          console.error("Failed to send form via API, falling back to mailto link", err);
          // Fallback to pre-filled mailto redirect
          const subject = encodeURIComponent("HADALBORE_LAB: Запрос дополнительных данных");
          const body = encodeURIComponent(`Пользователь: ${userName}\nEmail: ${userEmail}\nКомпания: ${userCompany}\n\nЗапрос:\n${queryVal}`);
          window.location.href = `mailto:yulenkov.n@gmail.com?subject=${subject}&body=${body}`;
          store.triggerToast({
            en: "Could not send automatically. Opening email client...",
            ru: "Не удалось отправить автоматически. Открываем почту..."
          });
        });

        // Force repaint homepage to update feedbacks list if needed
        this.render();
      };
    }
  }
}
export default Homepage;
