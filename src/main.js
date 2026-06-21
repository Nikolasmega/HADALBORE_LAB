// Entry point for HADALBORE LAB Static Reference Platform (Sprint 1.2)
import './styles/globals.css';

// Import core store & routing
import { store } from './core/State.js';
import { router } from './core/Router.js';
import { i18n } from './utils/i18n.js';

// Import layout components
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { SettingsPanel } from './components/SettingsPanel.js';
import { FieldQuickAccessBar } from './components/FieldQuickAccessBar.js';
import { Homepage } from './components/Homepage.js';
import { AboutModal } from './components/AboutModal.js';
import { CompareBar } from './components/CompareBar.js';
import { CompareView } from './components/CompareView.js';
import { LoginNoticeModal } from './components/LoginNoticeModal.js';
import { VisualAuditorOverlay } from './components/VisualAuditorOverlay.js';
import { UnlockScreen } from './components/UnlockScreen.js';

// Import modular view components
import tubularsView from './modules/tubulars/view.js';
import threadsView from './modules/threads/view.js';
import elastomersView from './modules/elastomers/view.js';
import steelGradesView from './modules/steel-grades/view.js';
import standardsView from './modules/standards/view.js';
import runningDataView from './modules/running-data/view.js';
import systemHealthView from './modules/system-health/view.js';
import failuresView from './modules/failures/view.js';

// Import search utility and database
import { searchMockDb } from './utils/search.js';
import { mockDb, populateMockDb } from './database/mockDb.js';
import { EngineeringEvidence } from './core/EngineeringEvidence.js';
import { OfflineStorage } from './core/OfflineStorage.js';
import { freezeLibrary } from './core/LibraryFreezeGuard.js';
import { UsageStats } from './core/usageStats.js';


function getCompatibilityBadge(rec, moduleType, lang) {
  const isRu = lang === 'ru';
  let h2sText = rec.h2s_compatibility || rec.sour_service_suitability || rec.h2s_resistance || '';
  let co2Text = rec.co2_compatibility || rec.co2_resistance || '';
  let rgdText = rec.rgd_resistance || '';

  // If we don't have direct fields, check if description or other text has clues
  if (moduleType === 'tubulars') {
    const grade = (rec.grade || '').toUpperCase();
    if (grade === 'L80' || grade === 'C90' || grade === 'T95' || grade === 'C110') {
      h2sText = 'Suitable';
    } else if (grade === 'J55' || grade === 'K55') {
      h2sText = 'Limited';
    } else {
      h2sText = 'Not suitable';
    }
    co2Text = 'Limited';
  }

  // Parse status
  const parseStatus = (text) => {
    if (!text) return null;
    const t = text.toLowerCase();
    if (t.includes('immune') || t.includes('outstanding') || t.includes('exceptional') || t.includes('excellent') || t.includes('suitable') || t.includes('yes') || t.includes('resistant') || t.includes('high') || t.includes('подходит') || t.includes('отличн') || t.includes('высок')) {
      if (t.includes('not suitable') || t.includes('poor') || t.includes('not resistant') || t.includes('не подходит')) {
        return 'red';
      }
      if (t.includes('limited') || t.includes('mild') || t.includes('ограничен')) {
        return 'yellow';
      }
      return 'green';
    }
    if (t.includes('poor') || t.includes('not suitable') || t.includes('no resistance') || t.includes('forbidden') || t.includes('susceptible') || t.includes('hazard') || t.includes('not resistant') || t.includes('не подходит') || t.includes('плох') || t.includes('запрещ')) {
      return 'red';
    }
    if (t.includes('moderate') || t.includes('intermediate') || t.includes('limited') || t.includes('mild') || t.includes('marginal') || t.includes('trace') || t.includes('up to') || t.includes('ограничен') || t.includes('умерен')) {
      return 'yellow';
    }
    return null;
  };

  const h2sStatus = parseStatus(h2sText);
  const co2Status = parseStatus(co2Text);
  const rgdStatus = parseStatus(rgdText);

  let badges = '';

  const getBadgeHtml = (label, status, fullText) => {
    let colorClass = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-750';
    if (status === 'green') colorClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/30';
    if (status === 'yellow') colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/30';
    if (status === 'red') colorClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/40 dark:border-rose-900/30';
    
    return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${colorClass}" title="${fullText}">${label}</span>`;
  };

  if (h2sStatus) badges += getBadgeHtml('H₂S', h2sStatus, h2sText);
  if (co2Status) badges += getBadgeHtml('CO₂', co2Status, co2Text);
  if (rgdStatus) badges += getBadgeHtml('RGD', rgdStatus, rgdText);

  return badges ? `<div class="flex flex-wrap gap-1 mt-1">${badges}</div>` : '';
}

// Initialize Layout Components
let sidebarComponent;
let headerComponent;
let settingsPanelComponent;
let homepageComponent;
let aboutModalComponent;
let quickAccessBarComponent;

// Module orchestrator mapping
const MODULE_VIEWS = {
  tubulars: tubularsView,
  threads: threadsView,
  elastomers: elastomersView,
  'steel-grades': steelGradesView,
  standards: standardsView,
  'running-data': runningDataView,
  'system-health': systemHealthView,
  failures: failuresView
};

// App Renderer Orchestration
function renderApp(state) {
  const { activeModule, searchQuery, viewMode } = state;

  // Guard: if system-health is active but viewMode is not engineering, reset to home
  if (activeModule === 'system-health' && viewMode !== 'engineering') {
    setTimeout(() => {
      store.setState({ activeModule: 'home' });
    }, 0);
    return;
  }

  // 1. If global search query is active on home, render global search results
  if (activeModule === 'home' && searchQuery.trim().length > 0) {
    renderGlobalSearch(searchQuery);
  }
  // 2. If home module is active without query, render standard Homepage
  else if (activeModule === 'home') {
    homepageComponent.render();
  }
  // 3. Otherwise, delegate to modular views
  else {
    renderModuleView(activeModule, searchQuery);
  }
}

// Render Specific Database Module via Modular System
function renderModuleView(moduleType, searchQuery) {
  const view = MODULE_VIEWS[moduleType];
  if (view) {
    view.render('app-content', searchQuery);
  } else {
    const contentContainer = document.getElementById('app-content');
    if (contentContainer) {
      contentContainer.innerHTML = `
        <div class="w-full border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 rounded-xl p-6 text-center text-xs text-red-500 font-mono select-none">
          Modular component "${moduleType}" not registered in the kernel.
        </div>
      `;
    }
  }
}

// Render Global Search Results
function renderGlobalSearch(searchQuery) {
  const contentContainer = document.getElementById('app-content');
  if (!contentContainer) return;

  const { lang } = store.getState();
  const t = (key) => i18n.t(key);

  const modules = ['tubulars', 'threads', 'elastomers', 'steel-grades', 'standards', 'running-data'];
  let resultsHtml = '';
  let totalMatches = 0;

  // Track search query analytics (moved to user-input action handler in Search.js)

  modules.forEach(modId => {
    // Map module ID to mockDb key
    let dbKey = modId;
    if (modId === 'steel-grades') dbKey = 'acid_environments';
    
    // For running-data, search both pt_reference and brines
    let matches = [];
    if (modId === 'running-data') {
      matches = [
        ...searchMockDb(mockDb, 'pt_reference', searchQuery),
        ...searchMockDb(mockDb, 'brines', searchQuery)
      ];
    } else {
      matches = searchMockDb(mockDb, dbKey, searchQuery);
    }

    if (matches.length > 0) {
      totalMatches += matches.length;
      const moduleTitle = t(`nav.${modId}`);
      
      const { viewMode } = store.getState();
      const rows = matches.map(rec => {
        // Fallback properties for search preview card
        const primary = lang === 'ru'
          ? (rec.name_ru || rec.name || rec.type_ru || rec.type || rec.connection_type_ru || rec.connection_type || rec.material_ru || rec.material || rec.brine_ru || rec.brine || rec.fluid_ru || rec.fluid || rec.equipment_ru || rec.equipment)
          : (rec.name || rec.type || rec.connection_type || rec.material || rec.brine || rec.fluid || rec.equipment);
        const details = lang === 'ru'
          ? (rec.grade || rec.seal_type_ru || rec.seal_type || rec.notes_ru || rec.notes || rec.equivalent_sg || rec.scope_ru || rec.scope)
          : (rec.grade || rec.seal_type || rec.notes || rec.equivalent_sg || rec.scope);
        const value = rec.od !== undefined ? `${rec.od} in` : (rec.torque_range || rec.temp_range_metric || rec.api);

        if (viewMode === 'field') {
          const compatBadge = getCompatibilityBadge(rec, modId, lang);
          const desc = rec.description || '';
          
          const isCompareEnabled = ['tubulars', 'steel-grades', 'elastomers', 'threads'].includes(modId);
          const { compareQueue } = store.getState();
          const inCompare = (compareQueue || []).some(item => item.id === rec.id);
          
          const isRu = lang === 'ru';
          const compareBtnText = inCompare 
            ? (isRu ? 'В сравнении' : 'In Compare') 
            : (isRu ? '+ Сравнить' : '+ Compare');
          const compareBtnClass = inCompare
            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white shadow-sm font-sans'
            : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-750/80 shadow-sm font-sans';

          const openBtnText = isRu ? 'Открыть' : 'Open';
          const openBtnClass = 'bg-zinc-950 hover:bg-zinc-850 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 font-bold px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-colors cursor-pointer shadow-sm font-sans';

          return `
            <div data-search-rec-id="${rec.id}" data-search-module="${modId}" class="p-3 border-b border-zinc-200/40 dark:border-zinc-800/40 last:border-0 flex items-center justify-between text-xs font-sans hover:bg-zinc-100/30 dark:hover:bg-zinc-850/10 cursor-pointer transition-colors">
              <div class="flex-grow pr-4">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-bold text-zinc-950 dark:text-zinc-50">${primary}</span>
                  ${compatBadge}
                </div>
                ${desc ? `<p class="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 leading-relaxed">${desc}</p>` : ''}
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button id="search-open-btn" class="${openBtnClass}">
                  ${openBtnText}
                </button>
                ${isCompareEnabled ? `
                  <button id="compare-toggle-btn" data-record-id="${rec.id}" data-module-type="${modId}" class="px-2.5 py-1 text-[9px] font-bold uppercase rounded-lg transition-colors cursor-pointer shrink-0 ${compareBtnClass}">
                    ${compareBtnText}
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }

        if (viewMode === 'engineering') {
          const evidence = EngineeringEvidence.fromObject(rec);
          const confidence = evidence.confidenceLevel || 'Reference Only';
          const sourceStr = evidence.sources.join(', ') || '—';
          return `
            <div data-search-rec-id="${rec.id}" data-search-module="${modId}" class="p-3.5 border-b border-zinc-200/40 dark:border-zinc-800/40 last:border-0 flex flex-col gap-1.5 text-xs font-sans hover:bg-zinc-100/30 dark:hover:bg-zinc-850/10 cursor-pointer transition-colors">
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-bold text-zinc-950 dark:text-zinc-50">${primary}</span>
                  <span class="text-[10px] text-zinc-400 dark:text-zinc-550 ml-2">(${details})</span>
                </div>
                <span class="text-[10px] font-mono font-semibold text-zinc-500 shrink-0">${value}</span>
              </div>
              <div class="flex items-center gap-2 text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                <span>${lang === 'ru' ? 'Достоверность' : 'Confidence'}: <span class="font-mono text-zinc-600 dark:text-zinc-400">${confidence}</span></span>
                <span>•</span>
                <span>${lang === 'ru' ? 'Источник' : 'Source'}: <span class="font-mono text-zinc-600 dark:text-zinc-400">${sourceStr}</span></span>
              </div>
            </div>
          `;
        }

        // Default 'reference' mode
        return `
          <div data-search-rec-id="${rec.id}" data-search-module="${modId}" class="p-3.5 border-b border-zinc-200/40 dark:border-zinc-800/40 last:border-0 flex items-center justify-between text-xs font-sans hover:bg-zinc-100/30 dark:hover:bg-zinc-850/10 cursor-pointer transition-colors">
            <div>
              <span class="font-bold text-zinc-950 dark:text-zinc-550">${primary}</span>
              <span class="text-[10px] text-zinc-400 dark:text-zinc-550 ml-2">(${details})</span>
            </div>
            <span class="text-[10px] font-mono font-semibold text-zinc-500 shrink-0">${value}</span>
          </div>
        `;
      }).join('');

      resultsHtml += `
        <div class="glassmorphic p-4 rounded-xl space-y-3 shadow-sm">
          <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">${moduleTitle} (${matches.length})</h4>
          <div class="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            ${rows}
          </div>
        </div>
      `;
    }
  });

  if (totalMatches === 0) {
    resultsHtml = `
      <div class="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/10">
        <p class="text-xs text-zinc-400 dark:text-zinc-500 font-sans">${t('no_results') || 'No engineering records match your search.'}</p>
      </div>
    `;
  }

  contentContainer.innerHTML = `
    <div class="space-y-6 py-4">
      <!-- Back button and title -->
      <div class="flex items-center gap-3">
        <button id="search-back-btn" class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors border border-zinc-200/30 dark:border-zinc-800 shadow-sm text-zinc-500 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path></svg>
        </button>
        <div>
          <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-sans">
            ${lang === 'ru' ? 'Результаты поиска' : 'Search Results'}
          </h2>
          <p class="text-[10px] text-zinc-400 dark:text-zinc-550 font-sans font-medium uppercase mt-0.5">
            ${lang === 'ru' ? 'Запрос' : 'Query'}: <span class="font-mono text-zinc-950 dark:text-zinc-100 normal-case font-bold">"${searchQuery}"</span>
          </p>
        </div>
      </div>
      
      <!-- List of matches -->
      <div class="space-y-4">
        ${resultsHtml}
      </div>
    </div>
  `;

  // Bind back button
  const backBtn = document.getElementById('search-back-btn');
  if (backBtn) {
    backBtn.onclick = () => {
      store.setState({ searchQuery: '' });
    };
  }

  // Bind click on search results to open the card
  const resultDivs = contentContainer.querySelectorAll('div[data-search-rec-id]');
  resultDivs.forEach(div => {
    div.onclick = (e) => {
      // If clicked the compare button, do NOT handle row click (handled by document-level listener)
      if (e.target.closest('#compare-toggle-btn')) {
        return;
      }
      
      const recId = div.getAttribute('data-search-rec-id');
      const modId = div.getAttribute('data-search-module');
      
      // If clicked the open button, switch view mode to engineering (Technical View) for detail inspection
      if (e.target.closest('#search-open-btn')) {
        store.setState({ viewMode: 'engineering' });
      }
      
      // Set selection for the modular view
      window.selectedRecordForced = { module: modId, id: recId };
      store.trackModuleOpen(modId);
      store.setState({ activeModule: modId, searchQuery: '' });
    };
  });
}

// PWA Offline Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        // Detect updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              store.setState({ updateAvailable: true });
            }
          });
        });

        // Check if update is waiting on load
        if (registration.waiting) {
          store.setState({ updateAvailable: true });
        }
      }).catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    });

    // Reload clients on active controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
}

// Register beforeinstallprompt event for PWA installability tracking
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  store.setState({ installable: true });
});

// Bootstrap Platform when DOM loads
window.addEventListener('DOMContentLoaded', () => {
  // Initialize local usage stats
  UsageStats.init();

  const detectCircular = (obj, name) => {
    const seen = new Set();
    const walk = (val, path = '') => {
      if (val && typeof val === 'object') {
        if (seen.has(val)) {
          console.error(`CIRCULAR REFERENCE DETECTED in ${name} at path: ${path}`);
          return true;
        }
        seen.add(val);
        for (const k of Object.keys(val)) {
          if (walk(val[k], path ? `${path}.${k}` : k)) return true;
        }
        seen.delete(val);
      }
      return false;
    };
    walk(obj);
  };

  const startPlatform = (decryptedDb) => {
    populateMockDb(decryptedDb);
    detectCircular(mockDb, 'mockDb (before activeDb)');

    OfflineStorage.init(mockDb).then((activeDb) => {
      // Freeze raw database structures and validate integrity snapshot
      const { frozenDb, snapshotResult } = freezeLibrary(activeDb);

      // Update global state with integrity check outputs
      store.setState({
        schemaCorrupted: !snapshotResult.success,
        dbHash: snapshotResult.hash
      });

      if (!snapshotResult.success) {
        console.error('INTEGRITY FAILURE: Database schema mismatch detected. Locked in Engineering Mode.', snapshotResult.errors);
      }

      // Override mockDb in-memory references dynamically to point to local IndexedDB data
      Object.keys(frozenDb).forEach(key => {
        mockDb[key] = frozenDb[key];
      });

      detectCircular(mockDb, 'mockDb (after activeDb override)');

      // 1. Initialize Global UI Component Singletons
      sidebarComponent = new Sidebar('app-sidebar-container');
      headerComponent = new Header('app-header-container');
      settingsPanelComponent = new SettingsPanel('settings-dialog');
      aboutModalComponent = new AboutModal('about-dialog');
      homepageComponent = new Homepage('app-content');
      quickAccessBarComponent = new FieldQuickAccessBar();
      new VisualAuditorOverlay();

      // Initialize Compare subsystems
      const compareBar = new CompareBar();
      const compareView = new CompareView();

      // 2. Perform initial paint
      sidebarComponent.render();
      headerComponent.render();
      settingsPanelComponent.render();
      aboutModalComponent.render();
      homepageComponent.render();
      quickAccessBarComponent.render();

      // 3. Subscribe render loop to store mutations
      store.subscribe((state) => {
        // Toggle body class for Field View optimizations (gloves, sunlight, layout, sidebar)
        document.body.classList.toggle('field-view-active', state.viewMode === 'field');

        // Check for compare intent in search query
        if (state.searchQuery && /^(?:compare|сравнить)\s+/i.test(state.searchQuery)) {
          const query = state.searchQuery;
          // Reset query immediately to prevent loop
          setTimeout(() => {
            store.setState({ searchQuery: '' });
            const input = document.getElementById('global-search-input');
            if (input) input.value = '';
            
            launchCompareFromQuery(query);
          }, 0);
          return;
        }
        renderApp(state);
      });

      // 4. Fire router to sync state with hash
      router.init();

      // 5. Register PWA lifecycle controller
      registerServiceWorker();

      // Show login notice if required
      new LoginNoticeModal('login-notice-dialog').showNoticeIfRequired();
    });
  };

  // Check if already unlocked in this session
  const isUnlocked = sessionStorage.getItem('hadalbore_db_unlocked') === 'true';
  const cachedPwd = sessionStorage.getItem('hadalbore_access_pwd');

  if (isUnlocked && cachedPwd) {
    const unlockHelper = new UnlockScreen();
    unlockHelper.decryptDatabase(cachedPwd)
      .then((decryptedDb) => {
        startPlatform(decryptedDb);
      })
      .catch((err) => {
        console.error("Cached session decryption failed, showing lock screen", err);
        sessionStorage.removeItem('hadalbore_db_unlocked');
        sessionStorage.removeItem('hadalbore_access_pwd');
        const unlock = new UnlockScreen(startPlatform);
        unlock.render();
      });
  } else {
    const unlock = new UnlockScreen(startPlatform);
    unlock.render();
  }

  // 6. Bind global favorite and related items click event delegation
  document.addEventListener('click', (e) => {
    const cardOpenBtn = e.target.closest('#card-open-technical-btn');
    if (cardOpenBtn) {
      e.stopPropagation();
      store.setState({ viewMode: 'engineering' });
      return;
    }

    const compareBtn = e.target.closest('#compare-toggle-btn');
    if (compareBtn) {
      e.stopPropagation();
      const recId = compareBtn.getAttribute('data-record-id');
      const moduleType = compareBtn.getAttribute('data-module-type');
      
      if (recId && moduleType) {
        const { compareQueue } = store.getState();
        const inCompare = (compareQueue || []).some(item => item.id === recId);
        
        if (inCompare) {
          store.removeFromCompare(recId);
        } else {
          let dbKey = moduleType;
          if (moduleType === 'steel-grades') dbKey = 'acid_environments';
          const records = mockDb[dbKey] || [];
          const record = records.find(r => r.id === recId);
          if (record) {
            store.addToCompare(record, moduleType);
          }
        }
      }
      return;
    }

    const btn = e.target.closest('#favorite-toggle-btn');
    if (btn) {
      e.stopPropagation();
      const recId = btn.getAttribute('data-record-id');
      const moduleType = btn.getAttribute('data-module-type');
      
      if (recId && moduleType) {
        const { favorites } = store.getState();
        const alreadyFav = favorites.some(f => f.id === recId && f.module === moduleType);
        
        let newFavs;
        if (alreadyFav) {
          newFavs = favorites.filter(f => !(f.id === recId && f.module === moduleType));
        } else {
          newFavs = [...favorites, { id: recId, module: moduleType, timestamp: new Date().toISOString() }];
        }
        
        store.setState({ favorites: newFavs });
      }
      return;
    }

    const relatedBtn = e.target.closest('button[data-related-id]');
    if (relatedBtn) {
      e.stopPropagation();
      const recId = relatedBtn.getAttribute('data-related-id');
      const moduleType = relatedBtn.getAttribute('data-related-module');
      if (recId && moduleType) {
        window.selectedRecordForced = { module: moduleType, id: recId };
        store.trackModuleOpen(moduleType);
        store.setState({ activeModule: moduleType, searchQuery: '' });
      }
    }
  });

  // 7. Global keyboard shortcuts and focus management (Escape to close dialogs / blur search / Cmd+K / /)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dialogs = document.querySelectorAll('dialog[open]');
      dialogs.forEach(dialog => dialog.close());
      
      const searchInput = document.getElementById('global-search-input');
      if (searchInput && document.activeElement === searchInput) {
        searchInput.blur();
      }
    }

    // Cmd+K / Ctrl+K focus search
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    }
    
    // '/' key focus search (when not inside an input/textarea)
    if (e.key === '/' && document.activeElement && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // 8. Enter key on search input to blur it
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const target = e.target;
      if (target && target.id === 'global-search-input') {
        target.blur();
      }
    }
  });

  // Handle global toast notifications (Apple-style lightweight notification)
  window.addEventListener('hadalbore-toast', (e) => {
    const messages = e.detail;
    const { lang } = store.getState();
    const msg = lang === 'ru' ? messages.ru : messages.en;

    const toast = document.createElement('div');
    toast.className = 'fixed top-5 left-1/2 -translate-x-1/2 bg-zinc-950/90 dark:bg-zinc-50/90 text-white dark:text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-sans font-bold shadow-lg z-50 transition-all duration-300 transform translate-y-2 opacity-0 select-none';
    toast.textContent = msg;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2500);
  });
});

function launchCompareFromQuery(query) {
  const termsString = query.replace(/^(?:compare|сравнить)\s+/i, '').trim();
  if (!termsString) return;

  const terms = termsString.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return;

  const modulesToCheck = ['tubulars', 'acid_environments', 'elastomers', 'threads'];
  let bestModule = null;
  let bestRecords = [];

  for (const dbKey of modulesToCheck) {
    const matchedForMod = [];
    for (const term of terms) {
      const matches = searchMockDb(mockDb, dbKey, term);
      if (matches && matches.length > 0) {
        const match = matches.find(m => !matchedForMod.some(r => r.id === m.id));
        if (match) {
          matchedForMod.push(match);
        }
      }
    }
    if (matchedForMod.length > bestRecords.length) {
      bestRecords = matchedForMod;
      bestModule = dbKey;
    }
  }

  if (bestModule && bestRecords.length > 0) {
    const storeModule = bestModule === 'acid_environments' ? 'steel-grades' : bestModule;
    store.clearCompare();
    
    if (bestRecords.length > 4) {
      store.triggerToast({
        en: "Maximum 4 items can be compared. Displaying first 4.",
        ru: "Можно сравнивать максимум 4 элемента. Показаны первые 4."
      });
    }

    const recordsToCompare = bestRecords.slice(0, 4);
    recordsToCompare.forEach(rec => {
      store.addToCompare(rec, storeModule);
    });

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hadalbore-open-compare'));
    }, 100);
  } else {
    store.triggerToast({
      en: "No matching records found for comparison",
      ru: "Не найдено подходящих записей для сравнения"
    });
  }
}
