import { store } from '../../core/State.js';
import { i18n } from '../../utils/i18n.js';
import { saveDirectoryHandle, clearDirectoryHandle, verifyPermission, scanDirectory } from '../../core/ObsidianSync.js';
import { renderMarkdown } from '../../utils/markdownParser.js';
import { mockDb, injectObsidianRecords } from '../../database/mockDb.js';

class NotesView {
  constructor() {
    this.selectedNoteId = localStorage.getItem('hadalbore_selected_note_id') || '';
    this.notesSearchQuery = '';
  }

  async render(containerId, searchQuery = '') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { lang, obsidianNotes, obsidianConnected, obsidianPermissionRequired } = store.getState();
    const isRu = lang === 'ru';
    const t = (key) => i18n.t(key);

    // Render logic states
    if (!obsidianConnected) {
      this.renderConnectScreen(container, isRu);
    } else if (obsidianPermissionRequired) {
      this.renderPermissionScreen(container, isRu);
    } else {
      await this.renderWorkspace(container, obsidianNotes, isRu);
    }

    // Add diagonal watermark overlay
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      pointer-events: none;
      user-select: none;
      z-index: 9999;
      opacity: 0.15;
    `;
    watermark.innerHTML = `
      <div style="
        font-size: 6rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.5rem;
        transform: rotate(-30deg);
        white-space: nowrap;
        color: #ef4444;
      ">
        ${isRu ? 'В разработке' : 'Under Development'}
      </div>
    `;
    container.style.position = 'relative';
    container.appendChild(watermark);
  }

  renderConnectScreen(container, isRu) {
    container.innerHTML = `
      <div class="max-w-5xl mx-auto py-10 px-6 font-sans space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <!-- Левая колонка: Подключение -->
          <div class="lg:col-span-5 glassmorphic rounded-2xl p-8 border border-zinc-200/50 dark:border-zinc-800/80 shadow-lg text-center flex flex-col justify-between space-y-6">
            <div class="space-y-6">
              <div class="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-850 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"></path>
                </svg>
              </div>
              
              <div class="space-y-2">
                <h2 class="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  ${isRu ? 'База знаний Obsidian' : 'Obsidian Knowledge Base'}
                </h2>
                <p class="text-xs text-zinc-550 leading-relaxed">
                  ${isRu 
                    ? 'Подключите вашу локальную папку с заметками. Все файлы будут читаться напрямую в оффлайн-режиме.' 
                    : 'Connect your local notes folder. Files are read locally from your device, preserving privacy and full offline capability.'}
                </p>
              </div>

              <div class="border-t border-zinc-200/50 dark:border-zinc-800/80 pt-5 text-left text-[11px] text-zinc-500 space-y-2 font-sans leading-relaxed">
                <div class="flex gap-2">
                  <span class="text-emerald-500 font-bold">✔</span>
                  <span>${isRu ? 'Конфиденциальность: файлы не отправляются в облако.' : 'Privacy: notes never leave your device.'}</span>
                </div>
                <div class="flex gap-2">
                  <span class="text-emerald-500 font-bold">✔</span>
                  <span>${isRu ? 'Умный импорт данных через YAML frontmatter.' : 'Smart data import via YAML frontmatter.'}</span>
                </div>
                <div class="flex gap-2">
                  <span class="text-emerald-500 font-bold">✔</span>
                  <span>${isRu ? 'Мгновенный поиск по заголовкам и содержимому.' : 'Instant search by titles and content.'}</span>
                </div>
              </div>
            </div>

            <button id="connect-obsidian-btn" class="w-full mt-4 px-6 py-3 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-zinc-950 text-xs font-bold uppercase rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 font-sans">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"></path></svg>
              <span>${isRu ? 'Подключить папку' : 'Connect Folder'}</span>
            </button>
          </div>

          <!-- Правая колонка: Инструкция -->
          <div class="lg:col-span-7 glassmorphic rounded-2xl p-8 border border-zinc-200/50 dark:border-zinc-800/80 shadow-lg text-left space-y-6 flex flex-col justify-between">
            <div class="space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                ${isRu ? '📖 Как это устроено и зачем нужно?' : '📖 How it works & why use it?'}
              </h3>
              
              <div class="space-y-4 text-xs text-zinc-550 leading-relaxed font-sans">
                <div>
                  <h4 class="font-bold text-zinc-800 dark:text-zinc-300 mb-1">
                    ${isRu ? 'Что такое Obsidian?' : 'What is Obsidian?'}
                  </h4>
                  <p>
                    ${isRu 
                      ? 'Obsidian — это бесплатное приложение для ведения заметок в формате Markdown. Все ваши файлы хранятся локально на вашем компьютере, что гарантирует полную безопасность и контроль над данными.' 
                      : 'Obsidian is a free, local-first note-taking app that uses Markdown. Your files remain on your drive, ensuring maximum privacy.'}
                  </p>
                </div>

                <div>
                  <h4 class="font-bold text-zinc-800 dark:text-zinc-300 mb-1">
                    ${isRu ? 'Для чего нужна интеграция?' : 'Why integrate it?'}
                  </h4>
                  <ul class="list-disc pl-4 space-y-1">
                    <li>
                      ${isRu 
                        ? '<strong>Вторая память ИИ:</strong> Ассистент считывает ваши заметки с методиками и формулами при расчетах.' 
                        : '<strong>AI Second Memory:</strong> The assistant reads your notes with formulas and guidelines to help build apps.'}
                    </li>
                    <li>
                      ${isRu 
                        ? '<strong>Расширение базы данных:</strong> Вы можете добавлять новые трубы, стандарты и буровые растворы в OmniLab прямо через Markdown файлы с блоком метаданных (YAML).' 
                        : '<strong>Database Expansion:</strong> Create new brines, standards, or tubulars in OmniLab via Markdown files with YAML.'}
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 class="font-bold text-zinc-800 dark:text-zinc-300 mb-1">
                    ${isRu ? 'Настройка папки в Obsidian:' : 'How to set up your Obsidian folder:'}
                  </h4>
                  <ol class="list-decimal pl-4 space-y-1.5">
                    <li>
                      ${isRu 
                        ? 'Создайте папку (например, <code>knowledge_vault</code>) и откройте её как хранилище (Vault) в Obsidian.' 
                        : 'Create a directory (e.g. <code>knowledge_vault</code>) and open it as a Vault in Obsidian.'}
                    </li>
                    <li>
                      ${isRu 
                        ? 'Внутри создайте поддиректорию <code>База_данных</code> для записей, которые хотите импортировать в OmniLab.' 
                        : 'Create a <code>База_данных</code> subdirectory inside to hold data files you want to import into OmniLab.'}
                    </li>
                    <li>
                      ${isRu 
                        ? 'Для импорта добавьте в начало файла блок YAML, например:<pre class="bg-zinc-100 dark:bg-zinc-900 p-2 rounded text-[10px] text-zinc-600 dark:text-zinc-450 mt-1 font-mono">---\ntype: wellbore_fluids\nid: my_fluid\nname: Мой раствор\ndensity: 1.25\n---</pre>' 
                        : 'Add YAML block at the beginning of files to import them, e.g.:<pre class="bg-zinc-100 dark:bg-zinc-900 p-2 rounded text-[10px] text-zinc-600 dark:text-zinc-450 mt-1 font-mono">---\ntype: wellbore_fluids\nid: my_fluid\nname: My Fluid\ndensity: 1.25\n---</pre>'}
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const btn = document.getElementById('connect-obsidian-btn');
    if (btn) {
      btn.onclick = async () => {
        try {
          if (!window.showDirectoryPicker) {
            alert(isRu 
              ? 'Ваш браузер не поддерживает File System Access API. Пожалуйста, используйте Chrome, Edge или Opera на ПК.' 
              : 'Your browser does not support the File System Access API. Please use Chrome, Edge, or Opera on desktop.');
            return;
          }
          const handle = await window.showDirectoryPicker({ mode: 'read' });
          await saveDirectoryHandle(handle);
          window.activeObsidianFolderHandle = handle;
          
          const notes = await scanDirectory(handle);
          injectObsidianRecords(notes);
          store.setState({ 
            obsidianNotes: notes, 
            obsidianConnected: true,
            obsidianPermissionRequired: false
          });
          store.triggerToast({
            ru: 'Папка Obsidian успешно подключена!',
            en: 'Obsidian folder connected successfully!'
          });
          this.render(container.id);
        } catch (err) {
          console.error('Folder selection canceled or failed:', err);
        }
      };
    }
  }

  renderPermissionScreen(container, isRu) {
    container.innerHTML = `
      <div class="max-w-md mx-auto py-12 px-6 font-sans">
        <div class="glassmorphic rounded-2xl p-7 border border-zinc-200/50 dark:border-zinc-800/80 shadow-lg text-center space-y-5">
          <div class="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 text-amber-500 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl flex items-center justify-center mx-auto shadow-sm animate-pulse">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"></path></svg>
          </div>
          
          <div class="space-y-1.5">
            <h2 class="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              ${isRu ? 'Требуется разрешение' : 'Permission Required'}
            </h2>
            <p class="text-xs text-zinc-550 leading-relaxed px-4">
              ${isRu 
                ? 'Браузер требует подтвердить разрешение на чтение папки при каждом перезапуске приложения.' 
                : 'The browser requires folder read permission confirmation on every application reload.'}
            </p>
          </div>

          <div class="flex flex-col gap-2 pt-2">
            <button id="grant-permission-btn" class="w-full px-5 py-3 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-zinc-950 text-xs font-bold uppercase rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 font-sans">
              <span>${isRu ? 'Разрешить доступ к папке' : 'Grant Folder Access'}</span>
            </button>
            <button id="disconnect-vault-fallback-btn" class="w-full px-5 py-2.5 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer font-sans">
              ${isRu ? 'Отключить папку' : 'Disconnect Folder'}
            </button>
          </div>
        </div>
      </div>
    `;

    const grantBtn = document.getElementById('grant-permission-btn');
    if (grantBtn) {
      grantBtn.onclick = async () => {
        const handle = window.activeObsidianFolderHandle;
        if (handle) {
          const granted = await verifyPermission(handle);
          if (granted) {
            const notes = await scanDirectory(handle);
            injectObsidianRecords(notes);
            store.setState({ 
              obsidianNotes: notes, 
              obsidianPermissionRequired: false 
            });
            this.render(container.id);
          }
        }
      };
    }

    const disconnectBtn = document.getElementById('disconnect-vault-fallback-btn');
    if (disconnectBtn) {
      disconnectBtn.onclick = async () => {
        await clearDirectoryHandle();
        window.activeObsidianFolderHandle = null;
        store.setState({ 
          obsidianNotes: [], 
          obsidianConnected: false, 
          obsidianPermissionRequired: false 
        });
        this.render(container.id);
      };
    }
  }

  async renderWorkspace(container, notes, isRu) {
    // Filter notes by search query if any
    let filteredNotes = notes;
    if (this.notesSearchQuery.trim()) {
      const q = this.notesSearchQuery.toLowerCase();
      filteredNotes = notes.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.name.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q)
      );
    }

    // Identify active note
    if (!this.selectedNoteId && filteredNotes.length > 0) {
      this.selectedNoteId = filteredNotes[0].id;
    }
    const activeNote = notes.find(n => n.id === this.selectedNoteId);

    // Left pane notes list items HTML
    const noteItemsHtml = filteredNotes.map(n => {
      const isActive = n.id === this.selectedNoteId;
      const activeClass = isActive 
        ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-950 dark:text-white font-semibold' 
        : 'text-zinc-650 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-850/20';

      return `
        <button data-note-id="${n.id}" class="w-full text-left px-3 py-2 text-xs rounded-lg transition-all truncate font-sans cursor-pointer ${activeClass}">
          ${n.title}
        </button>
      `;
    }).join('');

    // Right pane markdown content HTML
    let noteHeaderHtml = '';
    let noteContentHtml = '';

    if (activeNote) {
      noteHeaderHtml = `
        <div class="border-b border-zinc-150 dark:border-zinc-800/60 pb-3 mb-4 flex justify-between items-center">
          <div>
            <h3 class="text-sm font-extrabold text-zinc-950 dark:text-white font-sans">${activeNote.title}</h3>
            <p class="text-[9px] text-zinc-400 font-mono uppercase mt-0.5">${activeNote.path}</p>
          </div>
        </div>
      `;
      noteContentHtml = await renderMarkdown(activeNote.content);
    } else {
      noteContentHtml = `
        <div class="flex flex-col items-center justify-center p-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/10">
          <p class="text-xs text-zinc-400 dark:text-zinc-500 font-sans">${isRu ? 'Выберите или создайте заметку.' : 'Select or create a note.'}</p>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="flex flex-col md:flex-row gap-5 h-full font-sans">
        <!-- Explorer Sidebar (Left Pane) -->
        <div class="w-full md:w-56 shrink-0 flex flex-col gap-4">
          <div class="glassmorphic p-4 rounded-xl flex flex-col gap-3 shadow-sm">
            <span class="text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest block">${isRu ? 'Проводник заметок' : 'Notes Explorer'}</span>
            
            <!-- Search bar -->
            <input 
              type="text" 
              id="notes-local-search" 
              value="${this.notesSearchQuery}" 
              placeholder="${isRu ? 'Поиск в заметках...' : 'Filter notes...'}" 
              class="w-full px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs rounded-lg text-zinc-850 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-550 focus:outline-none focus:ring-1 focus:ring-zinc-650 transition-all font-sans"
            />

            <!-- Note selector list -->
            <div class="space-y-1 overflow-y-auto max-h-56 md:max-h-[300px] pr-1">
              ${noteItemsHtml || `<p class="text-[10px] text-zinc-400 text-center py-4 font-sans">${isRu ? 'Нет заметок' : 'No notes found'}</p>`}
            </div>
            
            <!-- Tool buttons -->
            <div class="border-t border-zinc-150 dark:border-zinc-800/80 pt-3 flex gap-2">
              <button id="rescan-notes-btn" class="flex-1 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-750 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer font-sans text-center">
                ${isRu ? 'Обновить' : 'Refresh'}
              </button>
              <button id="disconnect-notes-btn" class="flex-1 py-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-rose-600 dark:text-rose-450 border border-zinc-200 dark:border-zinc-750 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer font-sans text-center">
                ${isRu ? 'Отключить' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>

        <!-- Document Viewer (Right Pane) -->
        <div class="flex-grow">
          <div class="glassmorphic p-5 md:p-7 rounded-xl shadow-sm min-h-[350px] flex flex-col font-sans">
            ${noteHeaderHtml}
            <div class="prose dark:prose-invert prose-zinc max-w-none text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 font-sans space-y-4 select-text">
              ${noteContentHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind note clicks
    const noteButtons = container.querySelectorAll('button[data-note-id]');
    noteButtons.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-note-id');
        this.selectedNoteId = id;
        localStorage.setItem('hadalbore_selected_note_id', id);
        this.render(container.id);
      };
    });

    // Bind local note search input
    const searchInput = document.getElementById('notes-local-search');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.notesSearchQuery = e.target.value;
        // debounce slightly or just render immediately
        this.render(container.id);
        // keep focus and cursor position
        const updatedInput = document.getElementById('notes-local-search');
        if (updatedInput) {
          updatedInput.focus();
          updatedInput.selectionStart = updatedInput.selectionEnd = updatedInput.value.length;
        }
      };
    }

    // Bind rescan notes button
    const rescanBtn = document.getElementById('rescan-notes-btn');
    if (rescanBtn) {
      rescanBtn.onclick = async () => {
        const handle = window.activeObsidianFolderHandle;
        if (handle) {
          rescanBtn.disabled = true;
          rescanBtn.innerHTML = '...';
          const notes = await scanDirectory(handle);
          injectObsidianRecords(notes);
          store.setState({ obsidianNotes: notes });
          store.triggerToast({
            ru: 'Папка заметок успешно обновлена!',
            en: 'Notes folder successfully updated!'
          });
          this.render(container.id);
        }
      };
    }

    // Bind disconnect notes button
    const disconnectBtn = document.getElementById('disconnect-notes-btn');
    if (disconnectBtn) {
      disconnectBtn.onclick = async () => {
        await clearDirectoryHandle();
        window.activeObsidianFolderHandle = null;
        store.setState({ 
          obsidianNotes: [], 
          obsidianConnected: false,
          obsidianPermissionRequired: false
        });
        store.triggerToast({
          ru: 'Папка Obsidian отключена.',
          en: 'Obsidian folder disconnected.'
        });
        this.render(container.id);
      };
    }

    // Bind smart link clicks (intercept clicks on WikiLink button references)
    const wikiButtons = container.querySelectorAll('button[data-wiki-target]');
    wikiButtons.forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute('data-wiki-target');
        if (!target) return;

        // 1. Try to match an Obsidian note title or path
        const targetLower = target.toLowerCase();
        const matchedNote = notes.find(n => 
          n.name.toLowerCase() === targetLower || 
          n.title.toLowerCase() === targetLower
        );
        if (matchedNote) {
          this.selectedNoteId = matchedNote.id;
          localStorage.setItem('hadalbore_selected_note_id', matchedNote.id);
          this.render(container.id);
          return;
        }

        // 2. Try to match a database record ID in mockDb
        let dbModule = null;
        let dbRecordId = null;

        for (const key of Object.keys(mockDb)) {
          if (Array.isArray(mockDb[key])) {
            const found = mockDb[key].find(item => 
              item.id === target || 
              (item.name && item.name.toLowerCase() === targetLower)
            );
            if (found) {
              dbModule = key === 'acid_environments' ? 'steel-grades' : key;
              dbRecordId = found.id;
              break;
            }
          }
        }

        if (dbModule && dbRecordId) {
          // Route user to that record card inside the application modules!
          window.selectedRecordForced = { module: dbModule, id: dbRecordId };
          store.trackModuleOpen(dbModule);
          store.setState({ activeModule: dbModule, searchQuery: '' });
          store.triggerToast({
            en: `Opening database record: ${target}`,
            ru: `Открытие записи базы данных: ${target}`
          });
        } else {
          store.triggerToast({
            en: `Target link "${target}" not found in notes or database`,
            ru: `Ссылка "${target}" не найдена в заметках или базе данных`
          });
        }
      };
    });
  }
}

export const view = new NotesView();
export default view;
