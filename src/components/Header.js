import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';
import { Search } from './Search.js';
import { PROJECT_IDENTITY } from '../core/projectIdentity.js';

export class Header {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.searchComponent = null;
    
    let lastLang = store.getState().lang;
    let lastTheme = store.getState().theme;
    let lastSearchQuery = store.getState().searchQuery;
    
    store.subscribe((state) => {
      const { lang, theme, searchQuery } = state;
      if (lang !== lastLang || theme !== lastTheme) {
        lastLang = lang;
        lastTheme = theme;
        lastSearchQuery = searchQuery;
        this.render();
      } else if (searchQuery !== lastSearchQuery) {
        lastSearchQuery = searchQuery;
        const input = document.getElementById('global-search-input');
        if (input && input.value !== searchQuery) {
          input.value = searchQuery;
        }
      }
    });
  }

  render() {
    if (!this.container) return;
    const t = (key) => i18n.t(key);
    const { lang } = store.getState();

    this.container.innerHTML = `
      <header class="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80 md:px-6 md:py-4">
        <!-- Mobile Logo & Menu Toggle -->
        <div class="flex items-center gap-2.5 md:hidden">
          <button id="mobile-menu-toggle" class="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/80">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path></svg>
          </button>
          <div id="logo-mobile" class="flex items-center gap-2.5 cursor-pointer">
            <div class="p-1.5 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"></path></svg>
            </div>
            <span class="text-xs font-bold tracking-tight text-zinc-900 dark:text-white">${PROJECT_IDENTITY.PRODUCT_NAME}</span>
          </div>
        </div>

        <!-- Search Bar Skeleton container (Desk only) -->
        <div class="hidden md:block w-full max-w-xl" id="search-bar-container"></div>

        <!-- Actions panel -->
        <div class="flex items-center gap-2.5 ml-auto md:ml-0">
          <!-- Language Toggle -->
          <div class="flex items-center bg-zinc-100/90 dark:bg-zinc-850 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/80 text-[10px] font-bold shadow-sm">
            <button id="header-lang-ru" class="px-2.5 py-1 rounded-md transition-all cursor-pointer ${lang === 'ru' ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'}">RU</button>
            <button id="header-lang-en" class="px-2.5 py-1 rounded-md transition-all cursor-pointer ${lang === 'en' ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300'}">EN</button>
          </div>

          <button id="settings-trigger-btn" class="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/80 transition-colors border border-zinc-200/50 dark:border-zinc-800 shadow-sm" title="Settings">
            <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.645-.869L9.594 3.94z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
        </div>
      </header>
    `;

    // Initialize/render child search component
    this.searchComponent = new Search('search-bar-container');
    this.searchComponent.render();

    this.bindEvents();
  }

  bindEvents() {
    // Mobile Drawer Open
    const toggle = document.getElementById('mobile-menu-toggle');
    if (toggle) {
      toggle.onclick = () => {
        const sidebar = document.getElementById('app-sidebar-container');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && overlay) {
          sidebar.classList.remove('-translate-x-full');
          overlay.classList.remove('hidden');
        }
      };
    }

    // Logo Click Home Redirect
    const logoMobile = document.getElementById('logo-mobile');
    if (logoMobile) {
      logoMobile.onclick = () => {
        store.setState({ activeModule: 'home', searchQuery: '' });
      };
    }

    // Settings Modal Trigger
    const settingsBtn = document.getElementById('settings-trigger-btn');
    if (settingsBtn) {
      settingsBtn.onclick = () => {
        const dialog = document.getElementById('settings-dialog');
        if (dialog) dialog.showModal();
      };
    }

    // Language Toggle Click Handlers
    const headerLangRu = document.getElementById('header-lang-ru');
    const headerLangEn = document.getElementById('header-lang-en');
    if (headerLangRu) {
      headerLangRu.onclick = () => store.setState({ lang: 'ru' });
    }
    if (headerLangEn) {
      headerLangEn.onclick = () => store.setState({ lang: 'en' });
    }
  }
}
