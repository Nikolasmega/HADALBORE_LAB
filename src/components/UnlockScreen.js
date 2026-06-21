import { dbEncrypted } from '../data/mock-db-encrypted.js';
import { populateMockDb } from '../database/mockDb.js';

export class UnlockScreen {
  constructor(onUnlockedCallback) {
    this.onUnlocked = onUnlockedCallback;
    this.container = null;
    this.lang = localStorage.getItem('hadalbore_lang') || 'ru';
  }

  render() {
    this.container = document.createElement('div');
    this.container.id = 'unlock-screen-overlay';
    this.container.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl transition-all duration-500 font-sans';

    const isRu = this.lang === 'ru';
    const title = 'HADALBORE_LAB';
    const subtitle = isRu 
      ? 'База данных зашифрована' 
      : 'Database is Encrypted';
    const desc = isRu 
      ? 'Введите ключ доступа для дешифрования и запуска справочника.' 
      : 'Enter the access key to decrypt and launch the reference library.';
    const placeholder = isRu ? 'Ключ доступа...' : 'Access Key...';
    const buttonText = isRu ? 'Разблокировать' : 'Unlock';
    const errorEmpty = isRu ? 'Введите ключ доступа' : 'Enter access key';
    const errorIncorrect = isRu ? 'Неверный ключ доступа!' : 'Incorrect access key!';

    this.container.innerHTML = `
      <div id="unlock-card" class="bg-zinc-900/60 border border-zinc-800/80 p-7 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4 flex flex-col gap-4 transition-all duration-300 transform scale-95 opacity-0">
        <!-- Shield Lock Icon -->
        <div class="w-14 h-14 bg-zinc-800/40 text-white rounded-2xl flex items-center justify-center mx-auto border border-zinc-700/30">
          <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"></path>
          </svg>
        </div>

        <!-- Typography -->
        <div class="space-y-1.5">
          <h1 class="text-lg font-black tracking-tight text-white uppercase">${title} <span class="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-normal tracking-normal lowercase border border-zinc-750">beta</span></h1>
          <h2 class="text-xs font-bold text-zinc-350">${subtitle}</h2>
          <p class="text-[10px] text-zinc-500 leading-normal px-2">${desc}</p>
        </div>

        <!-- Form -->
        <form id="unlock-form" class="space-y-3">
          <div class="relative">
            <input 
              type="password" 
              id="unlock-password-input" 
              required 
              value="HADALBORE2026"
              placeholder="${placeholder}" 
              class="w-full px-3.5 py-2.5 bg-zinc-950/70 border border-zinc-800 text-xs rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-650 transition-all font-mono text-center"
            />
            <div id="unlock-error" class="hidden text-[10px] text-red-500 font-semibold mt-1"></div>
          </div>
          <button 
            type="submit" 
            id="unlock-submit-btn" 
            class="w-full py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>${buttonText}</span>
          </button>
        </form>

        <!-- Language toggle -->
        <div class="pt-2 border-t border-zinc-800/40 flex justify-center gap-4 text-[9px] font-sans text-zinc-500">
          <button id="unlock-lang-ru" class="hover:text-zinc-300 cursor-pointer ${isRu ? 'text-zinc-300 font-bold' : ''}">RU</button>
          <button id="unlock-lang-en" class="hover:text-zinc-300 cursor-pointer ${!isRu ? 'text-zinc-300 font-bold' : ''}">EN</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Anim-in
    setTimeout(() => {
      const card = document.getElementById('unlock-card');
      if (card) {
        card.classList.remove('scale-95', 'opacity-0');
        card.classList.add('scale-100', 'opacity-100');
      }
      const input = document.getElementById('unlock-password-input');
      if (input) input.focus();
    }, 50);

    this.bindEvents(errorEmpty, errorIncorrect);
  }

  bindEvents(errorEmpty, errorIncorrect) {
    const form = document.getElementById('unlock-form');
    const input = document.getElementById('unlock-password-input');
    const errorDiv = document.getElementById('unlock-error');
    const card = document.getElementById('unlock-card');
    const submitBtn = document.getElementById('unlock-submit-btn');

    // Language switchers
    const ruBtn = document.getElementById('unlock-lang-ru');
    const enBtn = document.getElementById('unlock-lang-en');

    if (ruBtn) {
      ruBtn.onclick = () => {
        if (this.lang !== 'ru') {
          this.lang = 'ru';
          localStorage.setItem('hadalbore_lang', 'ru');
          this.destroy();
          this.render();
        }
      };
    }

    if (enBtn) {
      enBtn.onclick = () => {
        if (this.lang !== 'en') {
          this.lang = 'en';
          localStorage.setItem('hadalbore_lang', 'en');
          this.destroy();
          this.render();
        }
      };
    }


    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const pwd = input.value.trim();
        if (!pwd) {
          this.showError(errorEmpty, errorDiv, card);
          return;
        }

        // Disable input during decryption
        input.disabled = true;
        submitBtn.disabled = true;
        const origBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-zinc-600 border-t-black rounded-full animate-spin"></span>`;

        try {
          const decryptedData = await this.decryptDatabase(pwd);
          
          // Decryption success!
          sessionStorage.setItem('hadalbore_db_unlocked', 'true');
          sessionStorage.setItem('hadalbore_access_pwd', pwd); // cache key for session

          populateMockDb(decryptedData);

          // Animate out
          card.classList.remove('scale-100', 'opacity-100');
          card.classList.add('scale-95', 'opacity-0');
          this.container.classList.add('opacity-0');
          
          setTimeout(() => {
            this.destroy();
            this.onUnlocked(decryptedData);
          }, 400);

        } catch (err) {
          console.error("Decryption failed:", err);
          input.disabled = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnHtml;
          this.showError(errorIncorrect, errorDiv, card);
          input.value = '';
          input.focus();
        }
      };
    }
  }

  showError(message, errorDiv, card) {
    if (errorDiv) {
      errorDiv.innerText = message;
      errorDiv.classList.remove('hidden');
    }
    if (card) {
      // Simple shake effect using tailwind transition classes and timeout
      card.classList.add('translate-x-1');
      setTimeout(() => card.classList.replace('translate-x-1', '-translate-x-1'), 70);
      setTimeout(() => card.classList.replace('-translate-x-1', 'translate-x-1'), 140);
      setTimeout(() => card.classList.replace('translate-x-1', '-translate-x-1'), 210);
      setTimeout(() => card.classList.remove('-translate-x-1'), 280);
    }
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  // Base64 helper
  base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Web Crypto API Decryption
  async decryptDatabase(password) {
    const saltBytes = this.base64ToUint8Array(dbEncrypted.salt);
    const ivBytes = this.base64ToUint8Array(dbEncrypted.iv);
    const ciphertextBytes = this.base64ToUint8Array(dbEncrypted.ciphertext);

    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);

    // 1. Import raw password bytes as a key
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      passwordBytes,
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    // 2. Derive GCM key from PBKDF2 using SHA-256
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    // 3. Decrypt ciphertext (which includes auth tag at the end)
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes
      },
      key,
      ciphertextBytes
    );

    // 4. Decode JSON string
    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(decrypted);
    return JSON.parse(jsonStr);
  }
}
