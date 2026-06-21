import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';

export class CompareBar {
  constructor() {
    this.container = document.getElementById('compare-bar-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'compare-bar-container';
      document.body.appendChild(this.container);
    }
    
    store.subscribe(() => this.render());
  }

  render() {
    const { compareQueue, lang } = store.getState();
    const t = (key) => i18n.t(key);

    if (!compareQueue || compareQueue.length === 0) {
      this.container.innerHTML = '';
      return;
    }

    // Generate chips
    const chipsHtml = compareQueue.map(item => `
      <div class="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded-xl text-[10px] font-sans font-bold flex items-center gap-2 border border-zinc-200/60 dark:border-zinc-700/60 shadow-sm shrink-0">
        <span>${item.name}</span>
        <button data-remove-id="${item.id}" class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer text-xs font-bold leading-none select-none">×</button>
      </div>
    `).join('');

    // Responsive class logic: sticky bottom on desktop, floating compact bar on mobile
    this.container.innerHTML = `
      <div class="fixed bottom-0 left-0 right-0 md:left-60 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border-t border-zinc-200 dark:border-zinc-800/80 px-4 py-3 z-45 transition-transform duration-300 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <!-- Selected Items List -->
          <div class="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <span class="text-[9px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest mr-2 shrink-0">
              ${lang === 'ru' ? 'Сравнение' : 'Compare'} (${compareQueue.length}/4):
            </span>
            <div class="flex items-center gap-2">
              ${chipsHtml}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4 shrink-0 justify-end w-full sm:w-auto">
            <button id="compare-clear-btn" class="text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 transition-colors text-[11px] font-sans font-bold uppercase tracking-wider cursor-pointer">
              ${lang === 'ru' ? 'Очистить' : 'Clear All'}
            </button>
            <button id="compare-launch-btn" class="bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 px-4 py-2 rounded-xl text-[11px] font-sans font-extrabold uppercase tracking-wider shadow transition-all cursor-pointer flex items-center gap-1.5">
              <span>⇄</span>
              <span>${lang === 'ru' ? 'Сравнить' : 'Compare'}</span>
            </button>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // 1. Remove individual item
    const removeBtns = this.container.querySelectorAll('button[data-remove-id]');
    removeBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const recId = btn.getAttribute('data-remove-id');
        if (recId) {
          store.removeFromCompare(recId);
        }
      };
    });

    // 2. Clear all
    const clearBtn = document.getElementById('compare-clear-btn');
    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.stopPropagation();
        store.clearCompare();
      };
    }

    // 3. Launch Compare
    const launchBtn = document.getElementById('compare-launch-btn');
    if (launchBtn) {
      launchBtn.onclick = (e) => {
        e.stopPropagation();
        // Dispatch custom event to trigger compare modal opening
        window.dispatchEvent(new CustomEvent('hadalbore-open-compare'));
      };
    }
  }
}
