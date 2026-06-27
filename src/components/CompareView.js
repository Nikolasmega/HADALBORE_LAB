import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';
import { CompareTable } from './CompareTable.js';

export class CompareView {
  constructor() {
    this.dialog = document.getElementById('compare-dialog');
    if (!this.dialog) {
      this.dialog = document.createElement('dialog');
      this.dialog.id = 'compare-dialog';
      this.dialog.className = 'rounded-xl p-0 shadow-xl overflow-hidden max-w-5xl w-11/12 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80';
      document.body.appendChild(this.dialog);
    }
    
    // Default local state for CompareView
    this.localViewMode = null; // Inherited from store initially
    this.highlightDiffs = true;

    // Listen for custom events
    window.addEventListener('hadalbore-open-compare', () => this.open());
    store.subscribe(() => {
      if (this.dialog.open) {
        this.render();
      }
    });
  }

  open() {
    const { viewMode } = store.getState();
    // Initialize view mode with global setting if not set locally
    if (!this.localViewMode) {
      this.localViewMode = viewMode;
    }
    if (this.localViewMode === 'reference') {
      this.localViewMode = 'engineering';
    }
    this.dialog.showModal();
    this.render();
  }

  close() {
    this.dialog.close();
  }

  render() {
    const { compareQueue, lang } = store.getState();
    const t = (key) => i18n.t(key);

    if (!compareQueue || compareQueue.length === 0) {
      this.dialog.innerHTML = `
        <div class="p-8 text-center font-sans text-xs space-y-4">
          <p class="text-zinc-500">${lang === 'ru' ? 'Очередь сравнения пуста' : 'Compare queue is empty'}</p>
          <button id="compare-modal-close" class="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-4 py-2 rounded-xl font-bold cursor-pointer">
            ${lang === 'ru' ? 'Закрыть' : 'Close'}
          </button>
        </div>
      `;
      const closeBtn = this.dialog.querySelector('#compare-modal-close');
      if (closeBtn) closeBtn.onclick = () => this.close();
      return;
    }

    const moduleName = compareQueue[0]?.module || 'tubulars';
    const localizedModuleName = t(`nav.${moduleName}`);

    // Tab buttons for Field and Technical view modes
    const modes = [
      { id: 'field', label: lang === 'ru' ? 'Полевой вид' : 'Field View' },
      { id: 'engineering', label: lang === 'ru' ? 'Технический вид' : 'Technical View' }
    ];

    const tabButtons = modes.map(m => {
      const isActive = this.localViewMode === m.id;
      return `
        <button id="compare-mode-tab-${m.id}" class="px-3 py-1.5 text-[10px] font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
          isActive 
            ? 'bg-zinc-150 text-zinc-900 dark:bg-zinc-800 dark:text-white' 
            : 'text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300'
        }">
          ${m.label}
        </button>
      `;
    }).join('');

    // Generate comparison table HTML
    const tableHtml = CompareTable.render(compareQueue, this.localViewMode, lang);

    this.dialog.innerHTML = `
      <div class="flex flex-col h-[85vh] max-h-[720px] overflow-hidden">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 border-b border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div class="flex flex-col">
            <h3 class="text-xs font-extrabold uppercase tracking-widest text-zinc-900 dark:text-white font-sans flex items-center gap-1.5">
              <span>⇄</span>
              <span>${lang === 'ru' ? 'Сравнение характеристик' : 'Technical Comparison'}</span>
            </h3>
            <span class="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">${localizedModuleName}</span>
          </div>
          <button id="compare-view-close-btn" class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Controls Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-zinc-100 dark:border-zinc-850/80 bg-white dark:bg-zinc-900 z-10">
          
          <!-- Mode Tabs -->
          <div class="flex items-center gap-1.5 bg-zinc-100/60 dark:bg-zinc-950/40 p-1 rounded-xl">
            ${tabButtons}
          </div>

          <!-- Diff Highlight Toggle & Export -->
          <div class="flex items-center gap-4">
            
            <!-- Highlight Switch -->
            <label class="flex items-center gap-2 cursor-pointer select-none text-[10px] font-sans font-bold uppercase text-zinc-450 dark:text-zinc-500">
              <input type="checkbox" id="compare-highlight-toggle" ${this.highlightDiffs ? 'checked' : ''} class="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0 cursor-pointer" />
              <span>${lang === 'ru' ? 'Различия' : 'Highlight Diffs'}</span>
            </label>

            <!-- PDF Export Button -->
            <button id="compare-pdf-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>
              <span>PDF</span>
            </button>

            <!-- Obsidian Export Button -->
            <button id="compare-obsidian-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850 text-[10px] font-sans font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer shadow-sm" title="${lang === 'ru' ? 'Экспорт в Obsidian' : 'Export to Obsidian'}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18c0 .621-.504 1.125-1.125 1.125H5.625M9 12h1.5"></path></svg>
              <span>Obsidian</span>
            </button>

          </div>

        </div>

        <!-- Modal Scroll Body -->
        <div id="compare-modal-body" class="flex-grow overflow-y-auto p-5 dark:bg-zinc-950/20">
          ${tableHtml}
        </div>

        <!-- Modal Footer Disclaimer -->
        <div class="p-3 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/50 text-[8px] text-zinc-400 dark:text-zinc-550 leading-relaxed font-sans text-center">
          ${lang === 'ru' 
            ? 'Только для инженерной оценки. Не для принятия окончательных проектных решений. Всегда проверяйте данные по спецификациям OEM.' 
            : 'For engineering assessment only. Not for final operational design. Always verify data against official OEM specification sheets.'}
        </div>

      </div>
    `;

    // Apply difference highlighting visual toggle
    this.applyHighlightSettings();
    this.bindEvents();
  }

  applyHighlightSettings() {
    const tableContainer = this.dialog.querySelector('#compare-modal-body');
    if (!tableContainer) return;

    if (this.highlightDiffs) {
      tableContainer.classList.remove('no-highlight');
    } else {
      tableContainer.classList.add('no-highlight');
    }
  }

  bindEvents() {
    // 1. Close button
    const closeBtn = this.dialog.querySelector('#compare-view-close-btn');
    if (closeBtn) closeBtn.onclick = () => this.close();

    // Backdrop click to close
    this.dialog.onclick = (e) => {
      const rect = this.dialog.getBoundingClientRect();
      const clickedInside = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!clickedInside) {
        this.close();
      }
    };

    // 2. View Mode Tabs selection
    const modeIds = ['field', 'engineering'];
    modeIds.forEach(mId => {
      const btn = this.dialog.querySelector(`#compare-mode-tab-${mId}`);
      if (btn) {
        btn.onclick = () => {
          this.localViewMode = mId;
          this.render();
        };
      }
    });

    // 3. Highlight differences toggle
    const toggle = this.dialog.querySelector('#compare-highlight-toggle');
    if (toggle) {
      toggle.onchange = (e) => {
        this.highlightDiffs = e.target.checked;
        this.applyHighlightSettings();
      };
    }

    // 4. PDF Export
    const pdfBtn = this.dialog.querySelector('#compare-pdf-btn');
    if (pdfBtn) {
      pdfBtn.onclick = () => this.exportComparisonToPDF();
    }

    // 5. Obsidian Export
    const obsidianBtn = this.dialog.querySelector('#compare-obsidian-btn');
    if (obsidianBtn) {
      obsidianBtn.onclick = () => this.exportComparisonToObsidian();
    }
  }

  async exportComparisonToObsidian() {
    const { compareQueue, lang } = store.getState();
    const isRu = lang === 'ru';
    
    const folderHandle = window.activeObsidianFolderHandle;
    if (!folderHandle) {
      store.triggerToast({
        ru: 'Пожалуйста, сначала подключите папку Obsidian во вкладке Заметки!',
        en: 'Please connect your Obsidian folder in the Notes tab first!'
      });
      return;
    }

    try {
      const moduleName = compareQueue[0]?.module || 'equipment';
      const localizedModuleName = i18n.t(`nav.${moduleName}`);
      
      let md = `---\ntype: comparison_report\ncreated: ${new Date().toISOString()}\nmodule: ${moduleName}\n---\n\n`;
      md += `# ${isRu ? 'Инженерный отчет сравнения' : 'Engineering Comparison Report'} - ${localizedModuleName}\n\n`;
      md += `*${isRu ? 'Дата создания' : 'Generated on'}: ${new Date().toLocaleString(isRu ? 'ru-RU' : 'en-US')}*\n\n`;
      
      md += `| ${isRu ? 'Характеристика / Параметр' : 'Parameter / Property'} | `;
      compareQueue.forEach(item => {
        md += `${item.name} | `;
      });
      md += '\n';
      
      md += `| --- | `;
      compareQueue.forEach(() => {
        md += `--- | `;
      });
      md += '\n';

      const properties = [];
      if (moduleName === 'tubulars') {
        properties.push(
          { key: 'od', label: isRu ? 'Наружный диаметр (OD)' : 'Outer Diameter (OD)' },
          { key: 'wall_thickness', label: isRu ? 'Толщина стенки' : 'Wall Thickness' },
          { key: 'inner_dia', label: isRu ? 'Внутренний диаметр (ID)' : 'Inner Diameter (ID)' },
          { key: 'drift_id', label: isRu ? 'Диаметр шаблона (Drift ID)' : 'Drift ID' },
          { key: 'weight', label: isRu ? 'Номинальный вес' : 'Nominal Weight' },
          { key: 'grade', label: isRu ? 'Группа прочности (Grade)' : 'Steel Grade' },
          { key: 'collapse', label: isRu ? 'Давление смятия (Collapse)' : 'Collapse Resistance' },
          { key: 'burst', label: isRu ? 'Давление разрыва (Burst)' : 'Burst Resistance' }
        );
      } else if (moduleName === 'threads') {
        properties.push(
          { key: 'connection_type', label: isRu ? 'Тип резьбы' : 'Thread Type' },
          { key: 'torque_range', label: isRu ? 'Диапазон крутящего момента' : 'Torque Range' },
          { key: 'turns', label: isRu ? 'Обороты свинчивания' : 'Make-up Turns' }
        );
      } else if (moduleName === 'elastomers') {
        properties.push(
          { key: 'material', label: isRu ? 'Материал' : 'Material' },
          { key: 'hardness', label: isRu ? 'Твердость' : 'Hardness' },
          { key: 'temperature_range', label: isRu ? 'Рабочие температуры' : 'Temperature Range' }
        );
      } else {
        Object.keys(compareQueue[0]).forEach(k => {
          if (!['id', 'name', 'name_ru', 'description', 'description_ru', 'type', 'module', 'diagrams'].includes(k)) {
            properties.push({ key: k, label: k });
          }
        });
      }

      properties.forEach(prop => {
        md += `| **${prop.label}** | `;
        compareQueue.forEach(item => {
          let val = item[prop.key];
          if (val === undefined || val === null) val = '—';
          md += `${val} | `;
        });
        md += '\n';
      });

      md += `\n\n---\n*${isRu ? 'Сгенерировано оффлайн в приложении HADALBORE_LAB' : 'Generated offline in HADALBORE_LAB'}*`;

      const filename = `Comparison_${moduleName}_${Date.now()}.md`;
      const { writeVaultFile } = await import('../core/ObsidianSync.js');
      const success = await writeVaultFile(folderHandle, filename, md, 'Отчеты');
      
      if (success) {
        store.setState({ obsidianNotes: [ ...store.getState().obsidianNotes ] });
        store.triggerToast({
          ru: `Отчет сохранен в Obsidian: Отчеты/${filename}`,
          en: `Report saved to Obsidian: Отчеты/${filename}`
        });
      } else {
        store.triggerToast({
          ru: 'Ошибка при сохранении файла в Obsidian.',
          en: 'Failed to write file to Obsidian.'
        });
      }
    } catch (err) {
      console.error('Obsidian comparison export failed:', err);
    }
  }

  exportComparisonToPDF() {
    const { compareQueue, lang } = store.getState();
    const isRu = lang === 'ru';

    // Reuse the exact same CompareTable renderer but outputting plain print-friendly landscape layout
    const originalHighlightState = this.highlightDiffs;
    
    // We override class bindings specifically for printing
    const printTableHtml = CompareTable.render(compareQueue, this.localViewMode, lang);

    const titleText = isRu ? 'ОТЧЕТ ИНЖЕНЕРНОГО СРАВНЕНИЯ' : 'ENGINEERING COMPARISON REPORT';
    const subtitleText = isRu 
      ? `Модуль: ${i18n.t(`nav.${compareQueue[0].module}`)} • Режим: ${this.localViewMode.toUpperCase()}` 
      : `Module: ${i18n.t(`nav.${compareQueue[0].module}`)} • Mode: ${this.localViewMode.toUpperCase()}`;

    const dateStr = new Date().toLocaleDateString(isRu ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${titleText}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
          @media print {
            @page { size: A4 landscape; margin: 10mm; }
          }
          body {
            font-family: 'Inter', sans-serif;
            color: #18181b;
            background: #ffffff;
            margin: 0;
            padding: 10px;
            font-size: 10px;
            line-height: 1.4;
          }
          .header {
            border-bottom: 2px solid #18181b;
            padding-bottom: 8px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .title {
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 0.5px;
            margin: 0;
            text-transform: uppercase;
          }
          .subtitle {
            font-size: 9px;
            color: #71717a;
            margin-top: 3px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .date {
            font-size: 8px;
            font-family: 'JetBrains Mono', monospace;
            color: #71717a;
          }
          
          /* Table Styles */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            table-layout: fixed;
          }
          th, td {
            border: 1px solid #e4e4e7;
            padding: 6px 8px;
            font-size: 9px;
            vertical-align: top;
            word-wrap: break-word;
          }
          th {
            background-color: #f4f4f5 !important;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 8px;
            color: #3f3f46;
          }
          tr:nth-child(even) {
            background-color: #fafafa;
          }
          
          /* Highlight Styles for Print */
          ${this.highlightDiffs ? `
            .bg-emerald-500\\/10 {
              background-color: #d1fae5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .bg-red-500\\/5 {
              background-color: #fee2e2 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .bg-zinc-50\\/30 {
              background-color: #f4f4f5 !important;
              color: #a1a1aa !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          ` : ''}

          ul {
            margin: 0;
            padding-left: 10px;
          }
          li {
            margin-bottom: 2px;
          }

          /* Disclaimer */
          .disclaimer {
            border-top: 1px solid #e4e4e7;
            padding-top: 8px;
            margin-top: 20px;
            font-size: 7.5px;
            color: #71717a;
            text-align: center;
            line-height: 1.3;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${titleText}</div>
            <div class="subtitle">${subtitleText}</div>
          </div>
          <div class="date">${dateStr}</div>
        </div>

        <div class="content">
          ${printTableHtml}
        </div>

        <div class="disclaimer">
          <strong>${isRu ? 'ПРЕДУПРЕЖДЕНИЕ:' : 'DISCLAIMER:'}</strong>
          ${isRu 
            ? 'Предоставленный технический отчет сгенерирован автоматически на основе локальной базы данных HADALBORE LAB. Данные носят исключительно рекомендательный характер и требуют верификации квалифицированными инженерами перед использованием на практике.' 
            : 'This engineering comparison report is auto-generated from the local HADALBORE LAB offline database. All values are for reference only and must be validated by qualified specialists against official OEM specification sheets.'}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 200);
          }
        </script>
      </body>
      </html>
    `;

    // Trigger Hidden iframe printing
    let iframe = document.getElementById('hadalbore-compare-print-iframe');
    if (iframe) {
      iframe.parentNode.removeChild(iframe);
    }
    
    iframe = document.createElement('iframe');
    iframe.id = 'hadalbore-compare-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
    iframe.style.visibility = 'hidden';
    
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();
  }
}
export default CompareView;
