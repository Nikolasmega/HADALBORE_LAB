import { store } from '../core/State.js';

export class UpdateBanner {
  constructor(containerId) {
    this.containerId = containerId;
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

  async render() {
    const { updateAvailable, lang } = store.getState();
    const bannerId = 'platform-update-banner';
    let bannerElement = document.getElementById(bannerId);

    if (!updateAvailable) {
      if (bannerElement) {
        bannerElement.remove();
      }
      return;
    }

    // 1. Fetch the changelog from release_manifest
    let changelogHtml = '';
    try {
      const res = await fetch('./release_manifest.json');
      if (res.ok) {
        const manifest = await res.json();
        if (manifest.changelog && Array.isArray(manifest.changelog)) {
          changelogHtml = manifest.changelog
            .map(item => `<li class="list-disc ml-3.5 mt-0.5 text-[9.5px] text-zinc-500 dark:text-zinc-400 font-mono">${item}</li>`)
            .join('');
        }
      }
    } catch (e) {
      // ignore
    }

    const targetElement = document.getElementById(this.containerId) || document.body;
    
    if (!bannerElement) {
      bannerElement = document.createElement('div');
      bannerElement.id = bannerId;
      bannerElement.className = 'w-full glassmorphic p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col gap-2.5 font-sans text-xs my-2';
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
        ? 'Новая версия Справочника готова к работе. Нажмите «Применить» для установки.' 
        : 'A newer version of the reference platform is ready. Click "Apply" to install.');
    const reloadBtn = isFieldMode
      ? (lang === 'ru' ? 'Применить' : 'Apply Update')
      : (lang === 'ru' ? 'Применить' : 'Apply');
    const dismissBtn = lang === 'ru' ? 'Позже' : 'Later';

    let changelogDetailsHtml = '';
    if (changelogHtml) {
      changelogDetailsHtml = `
        <details class="group mt-1 border border-zinc-200/50 dark:border-zinc-800/80 rounded-lg bg-zinc-100/30 dark:bg-zinc-950/10 p-2 text-[10px]">
          <summary class="flex justify-between items-center cursor-pointer select-none font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 outline-none">
            <span>${lang === 'ru' ? 'Что нового в обновлении?' : 'What\'s new in this release?'}</span>
            <span class="transition-transform duration-200 group-open:rotate-180">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path></svg>
            </span>
          </summary>
          <div class="mt-2 pt-1.5 border-t border-zinc-200/40 dark:border-zinc-800/40">
            <ul class="space-y-1">
              ${changelogHtml}
            </ul>
          </div>
        </details>
      `;
    }

    bannerElement.innerHTML = `
      <div class="space-y-1">
        <h4 class="font-bold text-zinc-900 dark:text-zinc-550">${title}</h4>
        <p class="text-[10px] text-zinc-400 dark:text-zinc-555 leading-normal">${text}</p>
        ${changelogDetailsHtml}
      </div>
      <div class="flex items-center gap-2 pt-1">
        <button id="update-banner-reload" class="px-3 py-1.5 bg-zinc-950 text-white dark:bg-white dark:text-black rounded-lg font-semibold hover:bg-zinc-850 dark:hover:bg-zinc-150 transition-colors text-[10px] shadow-sm cursor-pointer">${reloadBtn}</button>
        <button id="update-banner-dismiss" class="px-3 py-1.5 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-355 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-700 transition-colors text-[10px] cursor-pointer">${dismissBtn}</button>
      </div>
    `;

    this.bindEvents(lang);
  }

  bindEvents(lang) {
    const reloadBtn = document.getElementById('update-banner-reload');
    if (reloadBtn) {
      reloadBtn.onclick = () => {
        const confirmMsg = lang === 'ru'
          ? 'Вы действительно хотите применить это обновление и перезагрузить Справочник?'
          : 'Are you sure you want to apply this update and reload the application?';
          
        if (!window.confirm(confirmMsg)) {
          return;
        }

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
