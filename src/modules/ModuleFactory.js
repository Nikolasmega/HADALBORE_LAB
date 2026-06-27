import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';
import { searchMockDb } from '../utils/search.js';
import { DiagramRenderer } from '../components/DiagramRenderer.js';
import { EngineeringCard } from '../components/EngineeringCard.js';
import { mockDb } from '../database/mockDb.js';
import { convertWeight } from '../utils/units.js';

// In-memory cache for currently selected record ID in each module
const selectedRecordIds = {};

// In-memory filter/sorting states for Tubulars
const tubularsFilters = {
  odSize: 'all',
  sortBy: 'od',
  sortOrder: 'asc'
};

/**
 * Reusable table renderer component.
 */
export class BaseTable {
  constructor(headersEn, headersRu, rowRenderer, sortKeys = null) {
    this.headersEn = headersEn;
    this.headersRu = headersRu;
    this.rowRenderer = rowRenderer;
    this.sortKeys = sortKeys;
  }

  render(records, selectedId, lang, sortBy = null, sortOrder = null, extraParams = null) {
    const { viewMode } = store.getState();
    const isField = viewMode === 'field';
    const tableClass = isField ? 'table-field-mode' : '';

    const headers = lang === 'ru' ? this.headersRu : this.headersEn;
    const headerCols = headers.map((h, idx) => {
      const key = this.sortKeys ? this.sortKeys[idx] : null;
      if (key) {
        const isActive = sortBy === key;
        const arrow = isActive ? (sortOrder === 'asc' ? '▲' : '▼') : '▲';
        const arrowColor = isActive
          ? 'text-blue-600 dark:text-blue-400 font-bold'
          : 'text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-450 dark:group-hover:text-zinc-500 transition-colors';
        
        return `
          <th class="px-4 py-3 cursor-pointer select-none group hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors" data-sort-key="${key}">
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] w-3 flex items-center justify-center ${arrowColor}">${arrow}</span>
              <span>${h}</span>
            </div>
          </th>
        `;
      } else {
        return `<th class="px-4 py-3">${h}</th>`;
      }
    }).join('');

    let rowsHtml = '';
    if (records.length === 0) {
      rowsHtml = `
        <tr>
          <td colspan="${headers.length}" class="px-4 py-12 text-center text-zinc-400 dark:text-zinc-500 font-sans text-xs select-none">
            <div class="flex flex-col items-center justify-center gap-2">
              <svg class="w-6 h-6 text-zinc-300 dark:text-zinc-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span class="font-medium uppercase tracking-wider text-[10px] text-zinc-455 dark:text-zinc-555">
                ${lang === 'ru' ? 'Записей не найдено' : 'No records found'}
              </span>
              <p class="text-[9.5px] text-zinc-400 dark:text-zinc-600 normal-case mt-0.5 max-w-xs mx-auto leading-relaxed">
                ${lang === 'ru' ? 'Попробуйте изменить поисковый запрос или использовать другие термины.' : 'Try adjusting your search query or clear keywords.'}
              </p>
            </div>
          </td>
        </tr>
      `;
    } else {
      rowsHtml = records.map(rec => this.rowRenderer(rec, selectedId === rec.id, lang, extraParams)).join('');
    }

    return `
      <div class="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm shrink-0 ${tableClass}">
        <style>
          .table-field-mode th:nth-child(n+4), 
          .table-field-mode td:nth-child(n+4) { 
            display: none !important; 
          }
        </style>
        <table class="w-full text-left border-collapse min-w-[650px] lg:min-w-0">
          <thead>
            <tr class="bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-200 dark:border-zinc-800 text-[9px] font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider font-sans">
              ${headerCols}
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  }
}

/**
 * Reusable details renderer component.
 */
export class BaseDetails {
  render(rec, lang, moduleType) {
    return EngineeringCard.render(rec, lang, moduleType);
  }
}

/**
 * Reusable module orchestrator view.
 */
export class BaseView {
  constructor(moduleType, dbKey, tableComponent, detailsComponent) {
    this.moduleType = moduleType;
    this.dbKey = dbKey;
    this.tableComponent = tableComponent;
    this.detailsComponent = detailsComponent;
  }

  render(containerId, searchQuery) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { lang } = store.getState();
    const isRu = lang === 'ru';
    
    let records = searchMockDb(mockDb, this.dbKey, searchQuery);
    
    // Extract unique ODs for Tubulars size filter
    let uniqueODs = [];
    if (this.moduleType === 'tubulars') {
      const ods = (mockDb.tubulars || []).map(r => r.od).filter(od => od !== undefined);
      uniqueODs = [...new Set(ods)].sort((a, b) => a - b);
      
      // Filter by selected OD
      if (tubularsFilters.odSize !== 'all') {
        const targetOD = parseFloat(tubularsFilters.odSize);
        records = records.filter(r => r.od !== undefined && Math.abs(r.od - targetOD) < 0.001);
      }
      
      // Dynamic sorting
      records = [...records];
      const sortBy = tubularsFilters.sortBy || 'od';
      const isAsc = tubularsFilters.sortOrder === 'asc';
      
      records.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        
        // Custom normalization for specific fields
        if (sortBy === 'inner_dia') {
          valA = a.inner_dia !== undefined ? a.inner_dia : 0;
          valB = b.inner_dia !== undefined ? b.inner_dia : 0;
        } else if (sortBy === 'weight') {
          // If Russian, we sort by wall_thickness if available, otherwise weight
          if (lang === 'ru') {
            valA = a.wall_thickness !== undefined ? a.wall_thickness : (a.weight !== undefined ? a.weight : 0);
            valB = b.wall_thickness !== undefined ? b.wall_thickness : (b.weight !== undefined ? b.weight : 0);
          } else {
            valA = a.weight !== undefined ? a.weight : 0;
            valB = b.weight !== undefined ? b.weight : 0;
          }
        } else if (sortBy === 'name' || sortBy === 'grade') {
          valA = (valA || '').toString().toLowerCase();
          valB = (valB || '').toString().toLowerCase();
          return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else if (sortBy === 'source') {
          valA = (a.sources ? a.sources.join(', ') : a.source || '').toLowerCase();
          valB = (b.sources ? b.sources.join(', ') : b.source || '').toLowerCase();
          return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        
        // Default numeric comparison
        valA = typeof valA === 'number' ? valA : 0;
        valB = typeof valB === 'number' ? valB : 0;
        
        return isAsc ? valA - valB : valB - valA;
      });
    }

    // Check if we have a forced selection from Homepage (Recently Opened)
    if (window.selectedRecordForced && window.selectedRecordForced.module === this.moduleType) {
      selectedRecordIds[this.moduleType] = window.selectedRecordForced.id;
      window.selectedRecordForced = null; // consume it
    }

    // Set default selected record (ensure it is in the filtered list)
    if (records.length > 0) {
      if (!selectedRecordIds[this.moduleType] || !records.some(r => r.id === selectedRecordIds[this.moduleType])) {
        selectedRecordIds[this.moduleType] = records[0].id;
      }
    }

    const selectedId = selectedRecordIds[this.moduleType];
    const selectedRec = records.find(r => r.id === selectedId);

    // Track analytics record view (asynchronously to avoid loops during render phase)
    if (selectedRec) {
      setTimeout(() => {
        store.trackRecordView(selectedRec.id, this.moduleType);
      }, 0);
    }

    let extraParams = null;
    if (this.moduleType === 'tubulars') {
      if (tubularsFilters.fluidDensitySg === undefined) {
        tubularsFilters.fluidDensitySg = 1.000;
      }
      const bf = Math.max(0, Math.min(1, 1.0 - (tubularsFilters.fluidDensitySg / 7.85)));
      extraParams = { bf };
    }

    const tableHtml = this.tableComponent.render(
      records, 
      selectedId, 
      lang, 
      this.moduleType === 'tubulars' ? (tubularsFilters.sortBy || 'od') : null, 
      this.moduleType === 'tubulars' ? (tubularsFilters.sortOrder || 'asc') : null,
      extraParams
    );
    const detailsHtml = selectedRec ? this.detailsComponent.render(selectedRec, lang, this.moduleType) : '';

    // Render filter controls block if tubulars
    let filterBarHtml = '';
    const { unitSystem } = store.getState();
    if (this.moduleType === 'tubulars') {
      if (tubularsFilters.fluidDensitySg === undefined) {
        tubularsFilters.fluidDensitySg = 1.000;
      }
      const densityValStr = (unitSystem === 'imperial' 
        ? (tubularsFilters.fluidDensitySg * 8.3454) 
        : tubularsFilters.fluidDensitySg).toFixed(3);
      const densityUnitStr = unitSystem === 'imperial' 
        ? 'ppg' 
        : (isRu ? 'г/см³' : 'sg');

      filterBarHtml = `
        <div class="flex flex-wrap items-center justify-between gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-200/60 dark:border-zinc-800 rounded-xl font-sans text-xs">
          <div class="flex items-center gap-6 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-zinc-500 font-semibold">${isRu ? 'Размер трубы (OD):' : 'Pipe Size (OD):'}</span>
              <select id="tubular-od-filter" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 outline-none text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer">
                <option value="all">${isRu ? 'Все размеры' : 'All Sizes'}</option>
                ${uniqueODs.map(od => {
                  const valIn = `${od.toFixed(3)}"`;
                  const valMm = `${(od * 25.4).toFixed(1)} ${isRu ? 'мм' : 'mm'}`;
                  const isSelected = tubularsFilters.odSize === String(od) ? 'selected' : '';
                  return `<option value="${od}" ${isSelected}>${valIn} (${valMm})</option>`;
                }).join('')}
              </select>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-zinc-500 font-semibold">${isRu ? 'Плотность жидкости:' : 'Fluid Density:'}</span>
              <div class="relative flex items-center">
                <input 
                  type="number" 
                  id="tubular-fluid-density-input" 
                  value="${densityValStr}" 
                  step="0.001" 
                  min="0.001" 
                  max="${unitSystem === 'imperial' ? '25.000' : '3.000'}" 
                  class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-2 pr-10 py-1 outline-none text-zinc-700 dark:text-zinc-300 font-mono font-bold w-32 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
                <span class="absolute right-2 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 font-sans pointer-events-none select-none">${densityUnitStr}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="space-y-5 py-2">
        <!-- Back and title -->
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button id="module-back-btn" class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors border border-zinc-200/30 dark:border-zinc-800 shadow-sm text-zinc-500 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path></svg>
            </button>
            <div>
              <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-sans">${i18n.t(`nav.${this.moduleType}`)}</h2>
              <p class="text-[9px] text-zinc-400 dark:text-zinc-555 font-sans font-medium uppercase mt-0.5">
                ${isRu ? 'Справочные данные' : 'Reference Directory'}
              </p>
            </div>
          </div>
        </div>

        <!-- Filter bar -->
        ${filterBarHtml}

        <!-- Table Grid -->
        ${tableHtml}

        <!-- Details Engineering Card -->
        <div class="mt-4">
          ${detailsHtml}
        </div>
      </div>
    `;

    // Bind back button
    const backBtn = document.getElementById('module-back-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        store.setState({ activeModule: 'home' });
      };
    }

    // Bind Tubular filter and sorting events
    if (this.moduleType === 'tubulars') {
      const odFilter = document.getElementById('tubular-od-filter');
      if (odFilter) {
        odFilter.onchange = (e) => {
          tubularsFilters.odSize = e.target.value;
          this.render(containerId, searchQuery);
        };
      }

      const densityInput = document.getElementById('tubular-fluid-density-input');
      if (densityInput) {
        densityInput.oninput = (e) => {
          let val = parseFloat(e.target.value);
          if (!isNaN(val) && val > 0) {
            const { unitSystem } = store.getState();
            if (unitSystem === 'imperial') {
              tubularsFilters.fluidDensitySg = val / 8.3454;
            } else {
              tubularsFilters.fluidDensitySg = val;
            }
            
            const bf = Math.max(0, Math.min(1, 1.0 - (tubularsFilters.fluidDensitySg / 7.85)));
            const cells = container.querySelectorAll('.buoyed-weight-cell');
            cells.forEach(cell => {
              const airWt = parseFloat(cell.getAttribute('data-air-weight'));
              if (!isNaN(airWt)) {
                cell.innerHTML = convertWeight(airWt * bf);
              }
            });
          }
        };

        densityInput.onchange = (e) => {
          let val = parseFloat(e.target.value);
          if (isNaN(val) || val <= 0) {
            const { unitSystem } = store.getState();
            val = unitSystem === 'imperial' ? 8.330 : 1.000;
          }
          const { unitSystem } = store.getState();
          if (unitSystem === 'imperial') {
            tubularsFilters.fluidDensitySg = val / 8.3454;
          } else {
            tubularsFilters.fluidDensitySg = val;
          }
          this.render(containerId, searchQuery);
        };
      }
      
      const headers = container.querySelectorAll('thead th[data-sort-key]');
      headers.forEach(th => {
        th.onclick = () => {
          const key = th.getAttribute('data-sort-key');
          if (tubularsFilters.sortBy === key) {
            tubularsFilters.sortOrder = tubularsFilters.sortOrder === 'asc' ? 'desc' : 'asc';
          } else {
            tubularsFilters.sortBy = key;
            tubularsFilters.sortOrder = 'asc';
          }
          this.render(containerId, searchQuery);
        };
      });
    }

    // Bind row clicks
    const rows = container.querySelectorAll('tbody tr[data-record-id]');
    rows.forEach(row => {
      row.onclick = () => {
        const recId = row.getAttribute('data-record-id');
        selectedRecordIds[this.moduleType] = recId;
        this.render(containerId, searchQuery);
      };
    });

    // Render CAD Diagram if present (pass the selected record!)
    if (selectedRec && selectedRec.diagrams && selectedRec.diagrams.length > 0) {
      const diagId = selectedRec.diagrams[0];
      const renderer = new DiagramRenderer('diagram-renderer-container');
      renderer.render(diagId, lang, selectedRec);
    }

    // Render Calculations Charts
    if (selectedRec) {
      if (this.moduleType === 'tubulars') {
        import('../components/StrengthEnvelopeChart.js').then(({ StrengthEnvelopeChart }) => {
          const chart = new StrengthEnvelopeChart('strength-envelope-canvas');
          const od = (selectedRec.od || 7.0) * 0.0254;
          const id = (selectedRec.inner_dia || 6.18) * 0.0254;
          const yieldStrength = (selectedRec.yield_strength || 80000) * 6894.75729;
          chart.render(yieldStrength, 500000, 20000000, 5000000, od, id, lang);
        }).catch(err => console.error('Failed to load StrengthEnvelopeChart:', err));
      } else if (this.moduleType === 'threads') {
        import('../components/TorqueTurnChart.js').then(({ TorqueTurnChart }) => {
          const chart = new TorqueTurnChart('torque-turn-canvas');
          const turns = selectedRec.turns || 3.5;
          let opt = 5000;
          let min = 4000;
          let max = 6000;
          if (selectedRec.torque_range) {
            const match = /([\d,]+)\s*-\s*([\d,]+)/.exec(selectedRec.torque_range.replace(/\s+/g, ''));
            if (match) {
              min = parseFloat(match[1].replace(/,/g, '')) * 1.35582;
              max = parseFloat(match[2].replace(/,/g, '')) * 1.35582;
              opt = (min + max) / 2;
            }
          }
          const { unitSystem } = store.getState();
          chart.render(opt, max, min, turns, lang, unitSystem);
        }).catch(err => console.error('Failed to load TorqueTurnChart:', err));
      }
    }
  }
}
