import { store } from '../core/State.js';
import { PROJECT_IDENTITY } from '../core/projectIdentity.js';
import { LoginNoticeModal } from './LoginNoticeModal.js';

export class RegistrationModal {
  constructor(dialogId) {
    this.dialog = document.getElementById(dialogId);
    this.stage = 'input'; // 'input' or 'verify'
    this.generatedCode = '';
    this.userData = {
      email: '',
      name: '',
      company: ''
    };
  }

  showRegistrationIfRequired() {
    if (!this.dialog) return;
    const registered = localStorage.getItem('hadalbore_user_registered');
    if (registered === 'true') {
      // If already registered, show the login notice if needed
      new LoginNoticeModal('login-notice-dialog').showNoticeIfRequired();
      return;
    }

    this.render();
    this.dialog.showModal();
  }

  render() {
    const { lang } = store.getState();
    const isRu = lang === 'ru';

    if (this.stage === 'input') {
      const title = isRu ? 'Регистрация пользователя' : 'User Registration';
      const subtitle = isRu 
        ? 'Пожалуйста, зарегистрируйтесь, чтобы получить полный доступ к инженерным справочникам.' 
        : 'Please register to gain full access to the engineering reference library.';
      const emailLabel = isRu ? 'Электронная почта' : 'Email Address';
      const nameLabel = isRu ? 'Имя и Фамилия' : 'Full Name';
      const companyLabel = isRu ? 'Компания' : 'Company / Organization';
      const btnLabel = isRu ? 'Получить код подтверждения' : 'Get Verification Code';
      
      this.dialog.innerHTML = `
        <div class="flex flex-col bg-white dark:bg-zinc-900 overflow-hidden w-full max-w-md rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 font-sans text-xs animate-fade-in">
          <h3 class="text-xs font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider mb-1 select-none">
            ${title}
          </h3>
          <p class="text-[9.5px] text-zinc-500 dark:text-zinc-400 mb-4">${subtitle}</p>
          
          <form id="registration-input-form" class="space-y-3">
            <div>
              <label class="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1 select-none">${nameLabel}</label>
              <input 
                type="text" 
                id="reg-name" 
                required 
                placeholder="${isRu ? 'Иван Иванов' : 'John Doe'}"
                class="block w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-450 dark:focus:ring-zinc-650 transition-all font-sans"
              />
            </div>

            <div>
              <label class="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1 select-none">${companyLabel}</label>
              <input 
                type="text" 
                id="reg-company" 
                required 
                placeholder="${isRu ? 'Нефтегаз Сервис' : 'Oilfield Solutions'}"
                class="block w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-450 dark:focus:ring-zinc-650 transition-all font-sans"
              />
            </div>

            <div>
              <label class="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1 select-none">${emailLabel}</label>
              <input 
                type="email" 
                id="reg-email" 
                required 
                placeholder="name@company.com"
                class="block w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-450 dark:focus:ring-zinc-650 transition-all font-sans"
              />
            </div>

            <button type="submit" class="w-full py-2.5 mt-2 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-850 dark:hover:bg-zinc-100 font-bold rounded-lg transition-all text-center select-none cursor-pointer uppercase tracking-wider text-[10px]">
              ${btnLabel}
            </button>
          </form>
        </div>
      `;

      this.bindInputEvents();
    } else if (this.stage === 'verify') {
      const title = isRu ? 'Подтверждение регистрации' : 'Verify Registration';
      const promptText = isRu 
        ? `Код подтверждения был отправлен на адрес <strong>${this.userData.email}</strong>. Пожалуйста, введите его ниже для завершения регистрации.` 
        : `A verification code was sent to <strong>${this.userData.email}</strong>. Please enter it below to complete registration.`;
      const codeLabel = isRu ? 'Код подтверждения' : 'Verification Code';
      const confirmBtnLabel = isRu ? 'Подтвердить регистрацию' : 'Confirm Registration';
      const backBtnLabel = isRu ? 'Назад' : 'Back';
      
      this.dialog.innerHTML = `
        <div class="flex flex-col bg-white dark:bg-zinc-900 overflow-hidden w-full max-w-md rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 font-sans text-xs animate-fade-in">
          <h3 class="text-xs font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider mb-2 select-none">
            ${title}
          </h3>
          <p class="text-[9.5px] text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">${promptText}</p>
          
          <!-- Sandbox Code Alert Banner -->
          <div class="mb-4 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 flex items-center justify-between gap-3 select-none">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0 opacity-80" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="text-[9px] font-bold uppercase tracking-wider">${isRu ? 'Режим эмуляции' : 'Sandbox Mode'}</p>
                <p class="text-[8.5px] font-medium leading-tight mt-0.5">
                  ${isRu ? 'Код подтверждения для демонстрации:' : 'Demonstration verification code:'}
                </p>
              </div>
            </div>
            <span class="px-2 py-1 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-900/60 font-mono text-[10px] font-bold rounded tracking-wider shadow-sm select-all">
              ${this.generatedCode}
            </span>
          </div>
          
          <form id="registration-verify-form" class="space-y-4">
            <div>
              <label class="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1 select-none">${codeLabel}</label>
              <input 
                type="text" 
                id="reg-code" 
                required 
                maxlength="6"
                pattern="\\d{6}"
                placeholder="XXXXXX"
                class="block w-full px-3 py-2 text-center text-sm font-mono tracking-widest border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-450 dark:focus:ring-zinc-650 transition-all"
              />
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" id="reg-verify-back-btn" class="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-lg transition-all text-center hover:bg-zinc-50 dark:hover:bg-zinc-850 uppercase tracking-wider text-[10px]">
                ${backBtnLabel}
              </button>
              <button type="submit" class="flex-[2] py-2.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-850 dark:hover:bg-zinc-100 font-bold rounded-lg transition-all text-center select-none cursor-pointer uppercase tracking-wider text-[10px]">
                ${confirmBtnLabel}
              </button>
            </div>
          </form>
        </div>
      `;

      this.bindVerifyEvents();
    }
  }

  bindInputEvents() {
    const form = document.getElementById('registration-input-form');
    if (!form) return;

    form.onsubmit = (e) => {
      e.preventDefault();
      
      this.userData.name = document.getElementById('reg-name').value.trim();
      this.userData.company = document.getElementById('reg-company').value.trim();
      this.userData.email = document.getElementById('reg-email').value.trim();

      // Generate random 6-digit code
      this.generatedCode = String(Math.floor(100000 + Math.random() * 900000));

      // Transition to verification stage
      this.stage = 'verify';
      this.render();
    };
  }

  bindVerifyEvents() {
    const form = document.getElementById('registration-verify-form');
    const backBtn = document.getElementById('reg-verify-back-btn');
    
    if (backBtn) {
      backBtn.onclick = () => {
        this.stage = 'input';
        this.render();
      };
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const codeInput = document.getElementById('reg-code');
        const codeVal = codeInput.value.trim();

        if (codeVal === this.generatedCode) {
          // Success! Register user
          localStorage.setItem('hadalbore_user_registered', 'true');
          localStorage.setItem('hadalbore_user_name', this.userData.name);
          localStorage.setItem('hadalbore_user_company', this.userData.company);
          localStorage.setItem('hadalbore_user_email', this.userData.email);

          store.triggerToast({
            en: "Registration confirmed! Welcome.",
            ru: "Регистрация подтверждена! Добро пожаловать."
          });

          this.dialog.close();

          // Show notice modal now if required
          setTimeout(() => {
            new LoginNoticeModal('login-notice-dialog').showNoticeIfRequired();
          }, 100);
        } else {
          // Error
          codeInput.classList.add('border-rose-500', 'focus:ring-rose-500');
          store.triggerToast({
            en: "Invalid verification code. Please try again.",
            ru: "Неверный код подтверждения. Пожалуйста, попробуйте еще раз."
          });
        }
      };
    }
  }
}
