import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';
import versionJson from '../data/version.json';
import { PROJECT_IDENTITY } from '../core/projectIdentity.js';
import { UpdateBanner } from './UpdateBanner.js';
import runningDataView from '../modules/running-data/view.js';

const ICONS = {
  home: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"></path></svg>`,
  tubulars: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"></path></svg>`,
  threads: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path></svg>`,
  elastomers: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"></path></svg>`,
  'steel-grades': `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"></path></svg>`,
  'standards': `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"></path></svg>`,
  calculators: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5H3.75A2.25 2.25 0 011.5 17.25V5.25A2.25 2.25 0 013.75 3h12a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25zM9 10.5h.008v.008H9V10.5zm0 3h.008v.008H9v-.008zm0 3h.008v.008H9V16.5zm3-6h.008v.008H12V10.5zm0 3h.008v.008H12v-.008zm0 3h.008v.008H12V16.5zm3-6h.008v.008H15V10.5zm0 3h.008v.008H15v-.008zm0 3h.008v.008H15V16.5zM6.75 6.75h10.5"></path></svg>`,
  'running-data': `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H3.75m6.25 12h-6.25m6.25 3h-6.25m9.75-10.5c.375.375.375.992 0 1.367l-5.625 5.625a1.875 1.875 0 01-1.328.55h-1.875V11.25a1.875 1.875 0 01.55-1.328l5.625-5.625a.97.97 0 011.367 0z"></path></svg>`,
  'system-health': `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
  failures: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path></svg>`,
  'wellbore-fluids': `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path></svg>`,
  notes: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg>`
};

export class Sidebar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    let lastActiveModule = store.getState().activeModule;
    let lastLang = store.getState().lang;
    let lastViewMode = store.getState().viewMode;
    let lastCompareQueueLength = store.getState().compareQueue ? store.getState().compareQueue.length : 0;
    
    store.subscribe((state) => {
      const compareQueueLen = state.compareQueue ? state.compareQueue.length : 0;
      if (
        state.activeModule !== lastActiveModule ||
        state.lang !== lastLang ||
        state.viewMode !== lastViewMode ||
        compareQueueLen !== lastCompareQueueLength
      ) {
        lastActiveModule = state.activeModule;
        lastLang = state.lang;
        lastViewMode = state.viewMode;
        lastCompareQueueLength = compareQueueLen;
        this.render();
      }
    });
    this.updateBanner = new UpdateBanner('sidebar-update-banner-container');
  }

  render() {
    if (!this.container) return;
    const { activeModule, lang, viewMode, compareQueue } = store.getState();
    const t = (key) => i18n.t(key);

    const modules = ['home', 'tubulars', 'threads', 'elastomers', 'steel-grades', 'wellbore-fluids', 'failures', 'calculators', 'running-data', 'standards', 'notes'];
    if (viewMode === 'engineering') {
      modules.push('system-health');
    }

    const MODULE_NUMBERS = {
      'home': 1,
      'tubulars': 2,
      'threads': 3,
      'elastomers': 4,
      'steel-grades': 5,
      'wellbore-fluids': 6,
      'failures': 7,
      'calculators': 8,
      'running-data': 9,
      'standards': 10,
      'notes': 11,
      'system-health': 12
    };

    const navItems = modules.map(modId => {
      let isActive = activeModule === modId;
      if (activeModule === 'running-data') {
        if (runningDataView.activeTab === 'calcs') {
          isActive = modId === 'calculators';
        } else {
          isActive = modId === 'running-data';
        }
      }
      const num = MODULE_NUMBERS[modId] || 0;
      const label = `[${num}] ` + (modId === 'home' ? (lang === 'ru' ? 'Главная' : 'Home') : t(`nav.${modId}`));
      const icon = ICONS[modId] || '';
      
      const activeClass = isActive 
         ? 'bg-zinc-100/80 text-zinc-950 border-l-2 border-zinc-900 dark:bg-zinc-800/70 dark:text-white dark:border-zinc-100 font-semibold pl-2.5 rounded-r-lg shadow-sm' 
         : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/30 pl-3 rounded-lg';

      return `
        <button id="sidebar-nav-${modId}" class="w-full h-9 flex items-center gap-3 pr-3 text-xs transition-all font-sans font-medium cursor-pointer ${activeClass}">
          <span class="w-5 h-5 flex items-center justify-center shrink-0 opacity-80">${icon}</span>
          <span class="truncate">${label}</span>
        </button>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800/80 p-4">
        <!-- Sidebar Brand Logo -->
        <div id="logo-desktop" class="flex items-center gap-3 px-2 py-4 mb-4 cursor-pointer">
          <div class="p-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-xl shadow-sm">
            <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"></path></svg>
          </div>
          <div>
            <h1 class="text-xs font-extrabold tracking-tight text-zinc-950 dark:text-white">${PROJECT_IDENTITY.PRODUCT_NAME}</h1>
            <p class="text-[9px] text-zinc-400 dark:text-zinc-550 font-sans">${t('app_subtitle')}</p>
          </div>
        </div>
        
        <!-- Navigation Links -->
        <nav class="flex-grow space-y-1.5 overflow-y-auto">
          ${navItems}

          <!-- Utility shortcuts: always visible -->
          <div class="border-t border-zinc-150 dark:border-zinc-800/85 mt-2 pt-2 space-y-1 shrink-0">
            <p class="text-[8px] font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 px-3 pb-1">${lang === 'ru' ? 'Инструменты' : 'Tools'}</p>

            <button id="sidebar-nav-offline" class="w-full h-9 flex items-center gap-3 px-3 text-xs rounded-lg transition-all font-sans font-medium cursor-pointer text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60">
              <span class="w-5 h-5 flex items-center justify-center shrink-0 opacity-80">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg>
              </span>
              <span class="truncate">${lang === 'ru' ? 'Локальная база' : 'Offline Database'}</span>
            </button>

            ${compareQueue && compareQueue.length > 0 ? `
              <button id="sidebar-nav-compare" class="w-full h-9 flex items-center gap-3 px-3 text-xs rounded-lg transition-all font-sans font-medium cursor-pointer text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60">
                <span class="w-5 h-5 flex items-center justify-center shrink-0 opacity-80">⇄</span>
                <span class="flex-grow text-left truncate">${lang === 'ru' ? 'Сравнение' : 'Compare'}</span>
                <span class="bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border border-zinc-200/50 dark:border-zinc-750">${compareQueue.length}</span>
              </button>
            ` : ''}
          </div>
        </nav>

        <!-- Sidebar Update Banner Container -->
        <div id="sidebar-update-banner-container" class="w-full shrink-0 px-1"></div>

        <!-- Sidebar Footer Info -->
        <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 dark:text-zinc-555 font-mono text-center flex flex-col gap-1.5 items-center shrink-0">
          <button id="sidebar-about-btn" class="text-zinc-500 hover:text-zinc-850 dark:hover:text-white transition-colors cursor-pointer text-[10px] font-sans font-semibold flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.086.797l-.14.286-.041.02a.75.75 0 01-1.086-.796l.14-.287zm1.5-3.375a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM22.5 12c0 5.799-4.701 10.5-10.5 10.5S1.5 17.799 1.5 12 6.201 1.5 12 1.5 22.5 6.201 22.5 12z"></path></svg>
            ${t('about_btn')}
          </button>
          <div class="text-[8px] font-sans text-zinc-400 dark:text-zinc-550 select-none">
            © ${PROJECT_IDENTITY.PRODUCT_NAME} — Created by ${PROJECT_IDENTITY.CREATOR}
          </div>
          <div class="text-[8px] opacity-70 select-none">
            v${versionJson.buildVersion} (Dataset ${versionJson.datasetVersion})
          </div>
        </div>
      </div>
    `;

    this.bindEvents(modules);
    this.updateBanner.render();
  }

  bindEvents(modules) {
    // Logo Click Home Redirect
    const logoDesktop = document.getElementById('logo-desktop');
    if (logoDesktop) {
      logoDesktop.onclick = () => {
        store.setState({ activeModule: 'home', searchQuery: '' });
        this.closeMobileDrawer();
      };
    }

    // Attach navigation link clicks
    modules.forEach(modId => {
      const btn = document.getElementById(`sidebar-nav-${modId}`);
      if (btn) {
        btn.onclick = () => {
          if (modId === 'calculators') {
            runningDataView.activeTab = 'calcs';
            store.trackModuleOpen('running-data');
            store.setState({ activeModule: 'running-data', searchQuery: '' });
          } else if (modId === 'running-data') {
            runningDataView.activeTab = 'advanced';
            store.trackModuleOpen('running-data');
            store.setState({ activeModule: 'running-data', searchQuery: '' });
          } else {
            if (modId !== 'home') {
              store.trackModuleOpen(modId);
            }
            store.setState({ activeModule: modId, searchQuery: '' });
          }
          this.closeMobileDrawer();
        };
      }
    });

    // Compare Dialog trigger
    const compareBtn = document.getElementById('sidebar-nav-compare');
    if (compareBtn) {
      compareBtn.onclick = () => {
        window.dispatchEvent(new CustomEvent('hadalbore-open-compare'));
        this.closeMobileDrawer();
      };
    }


    // Offline DB direct nav
    const offlineBtn = document.getElementById('sidebar-nav-offline');
    if (offlineBtn) {
      offlineBtn.onclick = () => {
        store.setState({ activeModule: 'system-health', viewMode: 'engineering' });
        window.dispatchEvent(new CustomEvent('hadalbore-open-tab', { detail: { tab: 'offline' } }));
        this.closeMobileDrawer();
      };
    }

    // About Dialog trigger
    const aboutBtn = document.getElementById('sidebar-about-btn');
    if (aboutBtn) {
      aboutBtn.onclick = () => {
        const dialog = document.getElementById('about-dialog');
        if (dialog) dialog.showModal();
        this.closeMobileDrawer();
      };
    }

    // Close mobile side drawer on overlay click
    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.onclick = () => this.closeMobileDrawer();
    }
  }

  closeMobileDrawer() {
    const sidebar = document.getElementById('app-sidebar-container');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }
  }
}
export default Sidebar;
