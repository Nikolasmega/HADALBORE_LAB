import { store } from '../core/State.js';

export class FieldQuickAccessBar {
  constructor() {
    this.container = document.getElementById('field-quick-access-bar');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'field-quick-access-bar';
      document.body.appendChild(this.container);
    }

    let lastViewMode = store.getState().viewMode;
    let lastFieldMode = store.getState().fieldMode;
    let lastActiveModule = store.getState().activeModule;
    let lastLang = store.getState().lang;
    let lastCompareQueueLength = store.getState().compareQueue
      ? store.getState().compareQueue.length
      : 0;

    store.subscribe((state) => {
      const compareQueueLen = state.compareQueue ? state.compareQueue.length : 0;
      if (
        state.viewMode !== lastViewMode ||
        state.fieldMode !== lastFieldMode ||
        state.activeModule !== lastActiveModule ||
        state.lang !== lastLang ||
        compareQueueLen !== lastCompareQueueLength
      ) {
        lastViewMode = state.viewMode;
        lastFieldMode = state.fieldMode;
        lastActiveModule = state.activeModule;
        lastLang = state.lang;
        lastCompareQueueLength = compareQueueLen;
        this.render();
      }
    });
  }

  render() {
    const { viewMode, activeModule, lang, compareQueue } = store.getState();
    const isRu = lang === 'ru';

    if (viewMode !== 'field') {
      this.container.innerHTML = '';
      this.container.className = 'hidden';
      return;
    }

    // Floating sticky bottom dock
    this.container.className =
      'fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 py-1.5 shadow-lg md:px-6';

    const navItems = [
      {
        id: 'tubulars',
        label: isRu ? 'Трубы' : 'Tubulars',
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3"></path></svg>`,
      },
      {
        id: 'steel-grades',
        label: isRu ? 'Стали' : 'Grades',
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v1.244m0 0a3.75 3.75 0 01-3 3.75v3.896a6 6 0 00-3 5.197h16.5a6 6 0 00-3-5.197V8.098a3.75 3.75 0 01-3-3.75M9.75 4.348h4.5M9.75 3.104h4.5M9 17h6"></path></svg>`,
      },
      {
        id: 'elastomers',
        label: isRu ? 'Уплотнения' : 'Seals',
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"></path></svg>`,
      },
      {
        id: 'threads',
        label: isRu ? 'Резьбы' : 'Threads',
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"></path></svg>`,
      },
      {
        id: 'failures',
        label: isRu ? 'Отказы' : 'Failures',
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path></svg>`,
      },
      {
        id: 'search-trigger',
        label: isRu ? 'Поиск' : 'Search',
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>`,
      },
      {
        id: 'compare-trigger',
        label: isRu ? 'Сравнить' : 'Compare',
        icon: `<span class="relative flex items-center justify-center w-5 h-5"><span class="text-base font-bold">⇄</span>${
          compareQueue && compareQueue.length > 0
            ? `<span class="absolute -top-1 -right-1 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-full text-[8px] font-mono font-extrabold w-3.5 h-3.5 flex items-center justify-center">${compareQueue.length}</span>`
            : ''
        }</span>`,
      },
    ];

    const navButtonsHtml = navItems.map((item) => {
      const isActive = activeModule === item.id;
      let btnClass =
        'flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none text-[9.5px] font-sans font-medium flex-1 max-w-[64px] ';
      if (isActive) {
        btnClass += 'text-zinc-950 dark:text-white font-bold bg-zinc-100/80 dark:bg-zinc-800 border-t-2 border-zinc-900 dark:border-zinc-200 rounded-t-none';
      } else {
        btnClass += 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300';
      }
      return `
        <button id="quick-nav-${item.id}" class="${btnClass}">
          <span class="shrink-0 opacity-90">${item.icon}</span>
          <span class="text-[9px] uppercase tracking-wider scale-95">${item.label}</span>
        </button>
      `;
    }).join('');

    // Exit field mode button — always visible, right side
    const exitBtnHtml = `
      <button id="quick-nav-exit-field"
        class="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none text-[9.5px] font-sans font-medium flex-1 max-w-[64px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 border border-amber-300/50 dark:border-amber-700/50 bg-amber-50/60 dark:bg-amber-900/20">
        <span class="shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/>
          </svg>
        </span>
        <span class="text-[9px] uppercase tracking-wider scale-95">${isRu ? 'Выход' : 'Exit'}</span>
      </button>
    `;

    this.container.innerHTML = `
      <div class="max-w-xl mx-auto flex items-center justify-around gap-1">
        ${navButtonsHtml}
        ${exitBtnHtml}
      </div>
    `;

    this.bindEvents(navItems);
  }

  bindEvents(items) {
    items.forEach((item) => {
      const btn = document.getElementById(`quick-nav-${item.id}`);
      if (!btn) return;

      btn.onclick = () => {
        if (item.id === 'compare-trigger') {
          window.dispatchEvent(new CustomEvent('hadalbore-open-compare'));
        } else if (item.id === 'search-trigger') {
          const searchInput = document.getElementById('global-search-input');
          if (searchInput) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            searchInput.focus();
            searchInput.select();
          }
        } else {
          store.trackModuleOpen(item.id);
          store.setState({ activeModule: item.id, searchQuery: '' });
        }
      };
    });

    // Exit field mode
    const exitBtn = document.getElementById('quick-nav-exit-field');
    if (exitBtn) {
      exitBtn.onclick = () => {
        store.setState({ fieldMode: false, viewMode: 'engineering' });
        document.body.classList.remove('field-view-active');
      };
    }
  }
}

export default FieldQuickAccessBar;
