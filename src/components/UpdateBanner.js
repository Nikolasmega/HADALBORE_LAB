import { store } from '../core/State.js';

export class UpdateBanner {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    let lastUpdate = store.getState().updateAvailable;
    let lastLang = store.getState().lang;
    let lastField = store.getState().fieldMode;
    
    store.subscribe((state) => {
      if (
        state.updateAvailable !== lastUpdate ||
        state.lang !== lastLang ||
        state.fieldMode !== lastField
      ) {
        lastUpdate = state.updateAvailable;
        lastLang = state.lang;
        lastField = state.fieldMode;
        this.render();
      }
    });
  }

  render() {
    const { updateAvailable, lang } = store.getState();
    const bannerId = 'platform-update-banner';
    let bannerElement = document.getElementById(bannerId);

    if (!updateAvailable) {
      if (bannerElement) {
        bannerElement.remove();
      }
      return;
    }

    const targetElement = this.container || document.body;
    
    if (!bannerElement) {
      bannerElement = document.createElement('div');
      bannerElement.id = bannerId;
      bannerElement.className = 'fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 glassmorphic p-4 rounded-xl shadow-lg border border-zinc-200/80 dark:border-zinc-800 flex flex-col gap-3 font-sans text-xs';
      targetElement.appendChild(bannerElement);
    }

    const isFieldMode = store.getState().fieldMode;
    const title = isFieldMode
      ? (lang === 'ru' ? 'Доступно проверенное обновление' : 'Verified update available')
      : (lang === 'ru' ? 'Доступно обновление' : 'Update Available');
    const text = isFieldMode
      ? (lang === 'ru' 
        ? 'Доступен проверенный пакет обновлений. Применить пакет обновления?' 
        : 'Verified update available. Apply update package?')
      : (lang === 'ru' 
        ? 'Новая версия Справочника готова к работе. Обновить сейчас?' 
        : 'A newer version of the reference platform is ready. Reload now?');
    const reloadBtn = isFieldMode
      ? (lang === 'ru' ? 'Применить' : 'Apply Update')
      : (lang === 'ru' ? 'Обновить' : 'Reload');
    const dismissBtn = lang === 'ru' ? 'Позже' : 'Later';

    bannerElement.innerHTML = `
      <div class="space-y-1">
        <h4 class="font-bold text-zinc-900 dark:text-zinc-550">${title}</h4>
        <p class="text-[10px] text-zinc-400 dark:text-zinc-555 leading-normal">${text}</p>
      </div>
      <div class="flex items-center gap-2">
        <button id="update-banner-reload" class="px-3 py-1.5 bg-zinc-950 text-white dark:bg-white dark:text-black rounded-lg font-semibold hover:bg-zinc-850 dark:hover:bg-zinc-150 transition-colors text-[10px] shadow-sm cursor-pointer">${reloadBtn}</button>
        <button id="update-banner-dismiss" class="px-3 py-1.5 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-355 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-700 transition-colors text-[10px] cursor-pointer">${dismissBtn}</button>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const reloadBtn = document.getElementById('update-banner-reload');
    if (reloadBtn) {
      reloadBtn.onclick = () => {
        if (navigator.serviceWorker) {
          navigator.serviceWorker.getRegistration().then(registration => {
            if (registration && registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            } else {
              window.location.reload();
            }
          }).catch(() => {
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      };
    }

    const dismissBtn = document.getElementById('update-banner-dismiss');
    if (dismissBtn) {
      dismissBtn.onclick = () => {
        store.setState({ updateAvailable: false });
      };
    }
  }
}
export default UpdateBanner;
