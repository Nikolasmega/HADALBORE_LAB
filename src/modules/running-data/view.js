import { BaseView } from '../ModuleFactory.js';
import { store } from '../../core/State.js';
import { i18n } from '../../utils/i18n.js';
import { searchMockDb } from '../../utils/search.js';
import { mockDb } from '../../database/mockDb.js';
import table from './table.js';
import details from './details.js';
import { EngineeringDisclaimer } from '../../components/EngineeringDisclaimer.js';
import { FormulaTransparency } from '../../components/FormulaTransparency.js';
import { PDFExporter } from '../../utils/pdfExport.js';
import { EngineeringRules } from '../../core/EngineeringRules.js';
import { EngineeringRecommendationEngine } from '../../core/EngineeringRecommendationEngine.js';
import { EngineeringValidator } from '../../core/EngineeringValidator.js';
import { EngineeringSafeExecution } from '../../core/EngineeringSafeExecution.js';
import AppLogger from '../../core/AppLogger.js';
import { DiagramRenderer } from '../../components/DiagramRenderer.js';
import { EngineeringCalculations, UnitConversions, PhysicalConstants } from '../../core/EngineeringCalculations.js';
import { StandardCalcs } from './calcs/StandardCalcs.js';
import { AdvancedCalcs } from './calcs/AdvancedCalcs.js';
import { RunningGuide } from './calcs/RunningGuide.js';

// Cache for selected record in running-data
const selectedRecordIds = {};

const DEFAULT_CALCS_ORDER = ['hydrostatic', 'capacity', 'annular', 'density', 'pressure', 'temperature', 'mud_increase'];

class RunningDataView extends BaseView {
  constructor() {
    super('running-data', 'pt_reference', table, details);
    this.activeTab = 'calcs'; // 'calcs' | 'advanced'
    this.advInputs = {
      dispOd: 4.5,
      dispId: 3.826,
      dispLen: 3280, // ft or m
      thermalLen: 10000,
      thermalDt: 50,
      hookAirWeight: 150000, // lbs or kg
      hookMudDensity: 10.0, // ppg or kg/m3 or sg
      hookDrag: 15 // %
    };
  }

  render(containerId, searchQuery) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { lang, unitSystem } = store.getState();
    const t = (key) => i18n.t(key);

    // Filter records by search query
    const ptRecords = searchMockDb(mockDb, 'pt_reference', searchQuery);
    const brineRecords = searchMockDb(mockDb, 'brines', searchQuery);
    const records = [...ptRecords, ...brineRecords];

    // Check if we have a forced selection from Homepage (Recently Opened)
    if (window.selectedRecordForced && window.selectedRecordForced.module === this.moduleType) {
      selectedRecordIds[this.moduleType] = window.selectedRecordForced.id;
      window.selectedRecordForced = null; // consume it
    }

    // Set default selected record
    if (records.length > 0 && !selectedRecordIds[this.moduleType]) {
      selectedRecordIds[this.moduleType] = records[0].id;
    }
    if (records.length > 0 && !records.some(r => r.id === selectedRecordIds[this.moduleType])) {
      selectedRecordIds[this.moduleType] = records[0].id;
    }

    const selectedId = selectedRecordIds[this.moduleType];
    const selectedRec = records.find(r => r.id === selectedId);

    // Track analytics view
    if (selectedRec) {
      setTimeout(() => {
        store.trackRecordView(selectedRec.id, this.moduleType);
      }, 0);
    }

    const tableHtml = this.tableComponent.render(records, selectedId, lang);
    const detailsHtml = selectedRec ? this.detailsComponent.render(selectedRec, lang, this.moduleType) : '';
    const calcsHtml = this.renderCalculatorsGrid(lang, unitSystem);

    const tabNavHtml = `
      <div class="flex border-b border-zinc-200 dark:border-zinc-800 mb-4 text-xs font-sans shrink-0">
        <button id="run-tab-btn-calcs" class="px-4 py-2.5 font-semibold transition-all border-b-2 cursor-pointer ${this.activeTab === 'calcs' ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white bg-zinc-100/60 dark:bg-zinc-800/40 rounded-t-lg' : 'border-transparent text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200'}">
          ${lang === 'ru' ? 'Инженерные калькуляторы' : 'Standard Calculators'}
        </button>
        <button id="run-tab-btn-advanced" class="px-4 py-2.5 font-semibold transition-all border-b-2 cursor-pointer ${this.activeTab === 'advanced' ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white bg-zinc-100/60 dark:bg-zinc-800/40 rounded-t-lg' : 'border-transparent text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200'}">
          ${lang === 'ru' ? 'Расширенные расчеты' : 'Advanced Estimates'}
        </button>
        <button id="run-tab-btn-guide" class="px-4 py-2.5 font-semibold transition-all border-b-2 cursor-pointer ${this.activeTab === 'guide' ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white bg-zinc-100/60 dark:bg-zinc-800/40 rounded-t-lg' : 'border-transparent text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200'}">
          ${lang === 'ru' ? 'Инструкция по спуску' : 'Running Guide'}
        </button>
      </div>
    `;

    let calculatorsSectionHtml = '';
    if (this.activeTab === 'calcs') {
      calculatorsSectionHtml = `
        <div class="space-y-4">
          <!-- Disclaimer -->
          ${EngineeringDisclaimer.render(lang)}
          
          <div>
            <h3 class="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white font-sans">${t('calcs.title')}</h3>
            <p class="text-[9.5px] text-zinc-400 dark:text-zinc-550 mt-1">${t('calcs.drag_drop_hint')}</p>
          </div>

          <!-- Drag and Drop Grid -->
          <div id="calculators-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            ${calcsHtml}
          </div>
        </div>
      `;
    } else if (this.activeTab === 'guide') {
      calculatorsSectionHtml = this.renderRunningGuide(lang, unitSystem);
    } else {
      calculatorsSectionHtml = this.renderAdvancedCalculators(lang, unitSystem);
    }

    container.innerHTML = `
      <div class="space-y-5 py-2">
        <!-- Back and title -->
        <div class="flex items-center gap-3">
          <button id="module-back-btn" class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors border border-zinc-200/30 dark:border-zinc-800 shadow-sm text-zinc-500 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path></svg>
          </button>
          <div>
            <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-sans">${t(`nav.${this.moduleType}`)}</h2>
            <p class="text-[9px] text-zinc-400 dark:text-zinc-555 font-sans font-medium uppercase mt-0.5">
              ${lang === 'ru' ? 'Режимы, растворы и калькуляторы' : 'Operations, fluids and calculators'}
            </p>
          </div>
        </div>

        <!-- Table Grid -->
        ${tableHtml}

        <!-- Details Engineering Card -->
        <div class="mt-4">
          ${detailsHtml}
        </div>

        <!-- Tabs Navigation -->
        ${tabNavHtml}

        <!-- Engineering Calculators Section -->
        <div class="pt-2">
          ${calculatorsSectionHtml}
        </div>
      </div>
    `;

    this.bindEvents(containerId, searchQuery);
  }

  renderCalculatorsGrid(lang, unitSystem) {
    // Get ordered calculator list
    const orderStr = localStorage.getItem('hadalbore_calcs_order');
    const order = orderStr ? orderStr.split(',') : DEFAULT_CALCS_ORDER;
    
    // Ensure all default calcs are present in order
    const filteredOrder = order.filter(id => DEFAULT_CALCS_ORDER.includes(id));
    DEFAULT_CALCS_ORDER.forEach(id => {
      if (!filteredOrder.includes(id)) filteredOrder.push(id);
    });

    return filteredOrder.map(calcId => this.renderCalculatorCard(calcId, lang, unitSystem)).join('');
  }

  renderCalculatorCard(id, lang, unitSystem) {
    return StandardCalcs.renderCalculatorCard(id, lang, unitSystem);
  }

  renderRunningGuide(lang, unitSystem) {
    return RunningGuide.renderRunningGuide(lang, unitSystem);
  }

  renderAdvancedCalculators(lang, unitSystem) {
    return AdvancedCalcs.renderAdvancedCalculators(lang, unitSystem, this.advInputs);
  }

  bindEvents(containerId, searchQuery) {
    // 1. Module core navigation
    const backBtn = document.getElementById('module-back-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        store.setState({ activeModule: 'home' });
      };
    }

    // 2. Tab Navigation clicks
    const tabCalcs = document.getElementById('run-tab-btn-calcs');
    const tabAdvanced = document.getElementById('run-tab-btn-advanced');
    const tabGuide = document.getElementById('run-tab-btn-guide');

    if (tabCalcs) {
      tabCalcs.onclick = () => {
        this.activeTab = 'calcs';
        this.render(containerId, searchQuery);
      };
    }

    if (tabAdvanced) {
      tabAdvanced.onclick = () => {
        this.activeTab = 'advanced';
        this.render(containerId, searchQuery);
      };
    }

    if (tabGuide) {
      tabGuide.onclick = () => {
        this.activeTab = 'guide';
        this.render(containerId, searchQuery);
      };
    }

    // 3. Table row clicks
    const container = document.getElementById(containerId);
    if (container) {
      const rows = container.querySelectorAll('tbody tr[data-record-id]');
      rows.forEach(row => {
        row.onclick = () => {
          const recId = row.getAttribute('data-record-id');
          selectedRecordIds[this.moduleType] = recId;
          this.render(containerId, searchQuery);
        };
      });
    }

    // 4. Render CAD schematic if present
    const records = [...searchMockDb(mockDb, 'pt_reference', searchQuery), ...searchMockDb(mockDb, 'brines', searchQuery)];
    const selectedId = selectedRecordIds[this.moduleType];
    const selectedRec = records.find(r => r.id === selectedId);
    if (selectedRec && selectedRec.diagrams && selectedRec.diagrams.length > 0) {
      const diagId = selectedRec.diagrams[0];
      const renderer = new DiagramRenderer('diagram-renderer-container');
      renderer.render(diagId, store.getState().lang, selectedRec);
    }

    // 5. Handle Tab-specific bindings
    if (this.activeTab === 'calcs') {
      // Bind Pointer Events on calculators grid for Drag and Drop (Mobile Friendly)
      const calcsGrid = document.getElementById('calculators-grid');
      if (calcsGrid) {
        const cards = calcsGrid.querySelectorAll('.calc-card');
        let draggedCard = null;
        let startX = 0;
        let startY = 0;
        let isDragging = false;

        cards.forEach(card => {
          const handle = card.querySelector('div.flex.items-center.justify-between.border-b') || card;
          handle.style.touchAction = 'none';

          handle.addEventListener('pointerdown', (e) => {
            draggedCard = card;
            startX = e.clientX;
            startY = e.clientY;
            isDragging = false;
            handle.setPointerCapture(e.pointerId);
          });

          handle.addEventListener('pointermove', (e) => {
            if (!draggedCard) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
              if (!isDragging) {
                isDragging = true;
                draggedCard.classList.add('opacity-40', 'scale-[1.01]', 'shadow-md');
              }
            }

            if (isDragging) {
              draggedCard.style.visibility = 'hidden';
              const overEl = document.elementFromPoint(e.clientX, e.clientY);
              draggedCard.style.visibility = 'visible';

              if (overEl) {
                const overCard = overEl.closest('.calc-card');
                if (overCard && overCard !== draggedCard && overCard.parentNode === calcsGrid) {
                  const children = Array.from(calcsGrid.children);
                  if (children.indexOf(draggedCard) < children.indexOf(overCard)) {
                    calcsGrid.insertBefore(draggedCard, overCard.nextSibling);
                  } else {
                    calcsGrid.insertBefore(draggedCard, overCard);
                  }
                }
              }
            }
          });

          const endDrag = (e) => {
            if (draggedCard) {
              if (isDragging) {
                draggedCard.classList.remove('opacity-40', 'scale-[1.01]', 'shadow-md');
                const order = Array.from(calcsGrid.children).map(card => card.id.replace('calc-card-', ''));
                localStorage.setItem('hadalbore_calcs_order', order.join(','));
              }
              try {
                handle.releasePointerCapture(e.pointerId);
              } catch (err) {}
              draggedCard = null;
              isDragging = false;
            }
          };

          handle.addEventListener('pointerup', endDrag);
          handle.addEventListener('pointercancel', endDrag);
        });
      }
      this.bindCalculatorsLogic();
    } else if (this.activeTab === 'advanced') {
      this.bindAdvancedCalculatorsLogic();
    }
  }

  bindCalculatorsLogic() {
    StandardCalcs.bindCalculatorsLogic();
  }

  bindAdvancedCalculatorsLogic() {
    AdvancedCalcs.bindAdvancedCalculatorsLogic(this.advInputs);
  }
}

export const view = new RunningDataView();
export default view;
