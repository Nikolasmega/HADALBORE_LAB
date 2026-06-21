import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';
import { PROJECT_IDENTITY } from '../core/projectIdentity.js';
import versionJson from '../data/version.json';

export class AboutModal {
  constructor(dialogId) {
    this.dialog = document.getElementById(dialogId);
    if (this.dialog) {
      let lastLang = store.getState().lang;
      store.subscribe((state) => {
        if (state.lang !== lastLang) {
          lastLang = state.lang;
          this.render();
        }
      });
    }
  }

  render() {
    if (!this.dialog) return;
    const { lang } = store.getState();
    const t = (key) => i18n.t(key);
    const isRu = lang === 'ru';

    const principles = t('about_principles_list') || [];
    const principlesHtml = Array.isArray(principles) 
      ? principles.map(p => `<li class="flex items-center gap-2 text-zinc-650 dark:text-zinc-450"><span class="w-1 h-1 rounded-full bg-zinc-400 shrink-0"></span>${p}</li>`).join('')
      : '';

    const sourceWarningText = isRu
      ? `${PROJECT_IDENTITY.PRODUCT_NAME} поддерживается исключительно ${PROJECT_IDENTITY.CREATOR}. Официальным и доверенным источником проекта является публичный репозиторий GitHub и официальные ссылки. Неофициальные копии, форки или измененные версии не гарантируют точность, безопасность или актуальность данных.`
      : `${PROJECT_IDENTITY.PRODUCT_NAME} is officially maintained only by ${PROJECT_IDENTITY.CREATOR}. The official and trusted source of the project is the public GitHub repository and official project links. Unofficial copies, forks, or redistributed versions are not guaranteed to be accurate, supported, updated, or safe for engineering use.`;

    this.dialog.innerHTML = `
      <div class="flex flex-col bg-white dark:bg-zinc-900 overflow-hidden w-full max-w-sm rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
        <!-- Dialog Header -->
        <div class="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-850">
          <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-sans">
            ${t('about_title')}
          </h3>
          <button id="about-close-btn" class="p-1.5 rounded-lg text-zinc-450 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Dialog Body -->
        <div class="p-5 space-y-4 font-sans text-xs">
          <!-- Mission -->
          <div class="space-y-1.5">
            <h4 class="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              ${t('about_mission_label')}
            </h4>
            <p class="text-zinc-700 dark:text-zinc-350 leading-relaxed font-medium">
              ${t('about_mission_text')}
            </p>
          </div>

          <!-- Principles -->
          <div class="space-y-1.5">
            <h4 class="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              ${t('about_principles_label')}
            </h4>
            <ul class="space-y-1">
              ${principlesHtml}
            </ul>
          </div>

          <!-- Official Source Warning -->
          <div class="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-[9.5px] leading-relaxed font-medium">
            <span class="font-bold block mb-0.5 uppercase tracking-wider">${isRu ? 'Официальный источник' : 'Official Source Warning'}</span>
            ${sourceWarningText}
          </div>

          <!-- Divider -->
          <div class="border-t border-zinc-100 dark:border-zinc-850 pt-4 flex flex-col gap-1 text-[10px] font-mono text-zinc-450 dark:text-zinc-500">
            <div>Product: <span class="text-zinc-750 dark:text-zinc-350 font-semibold">${PROJECT_IDENTITY.PRODUCT_NAME}</span></div>
            <div>Creator: <span class="text-zinc-750 dark:text-zinc-350 font-semibold">${PROJECT_IDENTITY.CREATOR}</span></div>
            <div>Official Build: <span class="text-zinc-750 dark:text-zinc-350 font-semibold">${PROJECT_IDENTITY.OFFICIAL_BUILD ? 'TRUE' : 'FALSE'}</span></div>
            <div class="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-850/50">
              ${t('about_version')}: <span class="text-zinc-750 dark:text-zinc-350 font-semibold">${versionJson.buildVersion}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Close button trigger
    const closeBtn = document.getElementById('about-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.dialog.close();
    }

    // Click outside boundary fallback to close dialog
    this.dialog.onclick = (e) => {
      const rect = this.dialog.getBoundingClientRect();
      const clickedInside = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!clickedInside) {
        this.dialog.close();
      }
    };
  }
}

export default AboutModal;
