import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';

export class Search {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.debounceTimeout = null;
    this._keydownRef = null;
  }

  render() {
    const targetElement = this.container || document.getElementById('search-bar-container');
    if (!targetElement) return;

    const { searchQuery } = store.getState();
    const placeholderText = i18n.t('search_placeholder');

    targetElement.innerHTML = `
      <div class="relative w-full group">
        <!-- Search Icon -->
        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-400 dark:text-zinc-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
          </svg>
        </span>
        
        <!-- Search Input -->
        <input 
          type="search" 
          id="global-search-input" 
          value="${searchQuery}" 
          placeholder="${placeholderText}" 
          class="block w-full pl-10 pr-12 py-2.5 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all font-sans"
        />

        <!-- Kbd Shortcut indicator -->
        <span class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400 bg-white border border-zinc-200 dark:bg-zinc-850 dark:border-zinc-750 rounded-md font-mono shadow-sm transition-all duration-200 group-focus-within:opacity-0 group-focus-within:scale-75 group-focus-within:translate-x-1">⌘K</kbd>
        </span>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const input = document.getElementById('global-search-input');
    if (!input) return;

    // Debounced dispatch to state manager
    // Note: Compare intents (prefixes like 'compare ' or 'сравнить ') are intercepted
    // globally by store subscribers in main.js to prevent routing regressions.
    input.oninput = (e) => {
      const val = e.target.value;
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        store.setState({ searchQuery: val });
        store.trackSearch(val);
      }, 150);
    };
  }
}
export default Search;
