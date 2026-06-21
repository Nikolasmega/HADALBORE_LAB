import { store } from '../core/State.js';
import { PROJECT_IDENTITY } from '../core/projectIdentity.js';

export class LoginNoticeModal {
  constructor(dialogId) {
    this.dialog = document.getElementById(dialogId);
  }

  showNoticeIfRequired() {
    if (!this.dialog) return;
    const accepted = localStorage.getItem('hadalbore_lab_accepted_notice');
    if (accepted === 'true') {
      return;
    }

    const { lang } = store.getState();
    const isRu = lang === 'ru';

    const title = isRu ? `Добро пожаловать в ${PROJECT_IDENTITY.PRODUCT_NAME}` : `Welcome to ${PROJECT_IDENTITY.PRODUCT_NAME}`;
    
    const bodyText = isRu
      ? `${PROJECT_IDENTITY.PRODUCT_NAME} — это бесплатный справочник инженерных данных, созданный для специалистов нефтегазовой отрасли, работающих как онлайн, так и в отдаленных полевых условиях без доступа к интернету.`
      : `${PROJECT_IDENTITY.PRODUCT_NAME} is a free engineering reference library created for oil & gas professionals working both online and in remote field environments without internet access.`;

    const creatorLabel = isRu
      ? `Официальный разработчик и куратор проекта:`
      : `Official creator and maintainer of this project:`;

    const freeNotice = isRu
      ? `Этот проект предоставляется абсолютно бесплатно для инженеров по всему миру.`
      : `This project is provided completely free of charge for engineers worldwide.`;

    const legalLabel = isRu ? `Дополнительное юридическое уведомление:` : `Additional legal notice:`;
    
    const legalNotice = isRu
      ? `Только официальная версия ${PROJECT_IDENTITY.PRODUCT_NAME}, распространяемая через официальный исходный код на GitHub и официальные ссылки проекта, должна считаться подлинной. Любые скопированные, измененные, перераспространенные или неофициальные версии могут содержать неверную техническую информацию, не получать обновлений, техподдержки или обработки отзывов, и используются пользователями исключительно на собственный страх и риск.`
      : `Only the official version of ${PROJECT_IDENTITY.PRODUCT_NAME} distributed through the official GitHub source and official project links should be considered authentic. Any copied, modified, redistributed, or unofficial versions may contain incorrect engineering information, may not receive updates, technical support, or feedback handling, and are used entirely at the user’s own risk.`;

    const checkboxLabel = isRu ? 'Я понимаю и согласен продолжить' : 'I understand and continue';
    const continueBtnLabel = isRu ? 'Продолжить' : 'Continue';

    this.dialog.innerHTML = `
      <div class="flex flex-col bg-white dark:bg-zinc-900 overflow-hidden w-full max-w-md rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 font-sans text-xs">
        <h3 class="text-sm font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider mb-3 select-none">
          ${title}
        </h3>
        <div class="space-y-3 leading-relaxed text-zinc-750 dark:text-zinc-300">
          <p>${bodyText}</p>
          
          <div class="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-lg border border-zinc-200/40 dark:border-zinc-800">
            <span class="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest">${creatorLabel}</span>
            <span class="text-xs font-extrabold text-zinc-950 dark:text-white block mt-0.5">${PROJECT_IDENTITY.CREATOR}</span>
            <p class="text-[9.5px] text-zinc-500 mt-1">${freeNotice}</p>
          </div>

          <div class="space-y-1">
            <span class="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest">${legalLabel}</span>
            <p class="text-[9.5px] text-zinc-500">${legalNotice}</p>
          </div>

          <div class="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
            <input type="checkbox" id="login-consent-checkbox" class="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer">
            <label for="login-consent-checkbox" class="font-semibold text-zinc-900 dark:text-zinc-100 select-none cursor-pointer">
              ${checkboxLabel}
            </label>
          </div>

          <button id="login-consent-continue-btn" disabled class="w-full py-2.5 mt-2 bg-zinc-300 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-650 font-bold rounded-lg transition-all text-center select-none cursor-not-allowed uppercase tracking-wider text-[10px]">
            ${continueBtnLabel}
          </button>
        </div>
      </div>
    `;

    this.bindEvents();
    this.dialog.showModal();
  }

  bindEvents() {
    const checkbox = document.getElementById('login-consent-checkbox');
    const continueBtn = document.getElementById('login-consent-continue-btn');

    if (checkbox && continueBtn) {
      checkbox.onchange = (e) => {
        const checked = e.target.checked;
        continueBtn.disabled = !checked;
        if (checked) {
          continueBtn.classList.remove('bg-zinc-300', 'text-zinc-500', 'cursor-not-allowed', 'dark:bg-zinc-800', 'dark:text-zinc-650');
          continueBtn.classList.add('bg-zinc-950', 'text-white', 'cursor-pointer', 'hover:bg-zinc-850', 'dark:bg-white', 'dark:text-zinc-950', 'dark:hover:bg-zinc-100');
        } else {
          continueBtn.classList.add('bg-zinc-300', 'text-zinc-500', 'cursor-not-allowed', 'dark:bg-zinc-800', 'dark:text-zinc-650');
          continueBtn.classList.remove('bg-zinc-950', 'text-white', 'cursor-pointer', 'hover:bg-zinc-850', 'dark:bg-white', 'dark:text-zinc-950', 'dark:hover:bg-zinc-100');
        }
      };

      continueBtn.onclick = () => {
        if (checkbox.checked) {
          localStorage.setItem('hadalbore_lab_accepted_notice', 'true');
          this.dialog.close();
        }
      };
    }

    // Block escape closing
    this.dialog.oncancel = (e) => {
      e.preventDefault();
    };
  }
}

export default LoginNoticeModal;
