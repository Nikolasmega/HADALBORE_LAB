import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';

/**
 * Collapsible Engineering Disclaimer Component.
 */
export class EngineeringDisclaimer {
  static render(lang) {
    const { viewMode } = store.getState();
    if (viewMode === 'field') return '';

    const t = (key) => i18n.t(key);
    const isCollapsed = localStorage.getItem('hadalbore_disclaimer_collapsed') === 'true';

    return `
      <div class="border border-amber-500/20 dark:border-amber-500/30 rounded-xl bg-amber-50/20 dark:bg-amber-950/10 p-3.5 text-xs font-sans shadow-sm select-none transition-all duration-200">
        <div class="flex items-center justify-between cursor-pointer" id="disclaimer-header">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-amber-550 dark:text-amber-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path>
            </svg>
            <span class="text-[9.5px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest">${t('disclaimer_title')}</span>
          </div>
          <span class="text-amber-600 dark:text-amber-500 transition-transform duration-200 shrink-0" id="disclaimer-chevron" style="transform: ${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
            </svg>
          </span>
        </div>
        <p class="text-zinc-650 dark:text-zinc-400 text-[10px] leading-relaxed mt-2.5 pl-6 border-l border-amber-500/10 ${isCollapsed ? 'hidden' : ''}" id="disclaimer-content">
          ${t('disclaimer_text')}
        </p>
      </div>
    `;
  }

  static bind() {
    const header = document.getElementById('disclaimer-header');
    if (!header) return;

    header.onclick = () => {
      const content = document.getElementById('disclaimer-content');
      const chevron = document.getElementById('disclaimer-chevron');
      if (!content || !chevron) return;

      const currentlyCollapsed = content.classList.contains('hidden');
      if (currentlyCollapsed) {
        content.classList.remove('hidden');
        chevron.style.transform = 'rotate(0deg)';
        localStorage.setItem('hadalbore_disclaimer_collapsed', 'false');
      } else {
        content.classList.add('hidden');
        chevron.style.transform = 'rotate(-90deg)';
        localStorage.setItem('hadalbore_disclaimer_collapsed', 'true');
      }
    };
  }
}

export default EngineeringDisclaimer;
