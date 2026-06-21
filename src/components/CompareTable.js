import { alignAndCompare } from '../utils/compareEngine.js';
import { convertTemperature, convertPressure, convertDimension, convertWeight, convertTensile, convertTorqueText, convertLengthText, convertStandoffText } from '../utils/units.js';
import { store } from '../core/State.js';

export class CompareTable {
  static formatValue(key, value, lang) {
    let isMissing = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
    if (!isMissing && typeof value === 'string') {
      const lowerVal = value.trim().toLowerCase();
      if (lowerVal === 'n/a' || lowerVal === 'unknown' || lowerVal === 'none' || lowerVal === '—' || lowerVal === '-') {
        isMissing = true;
      }
    }
    if (isMissing) {
      return `<span class="text-zinc-350 dark:text-zinc-650 font-mono italic">—</span>`;
    }

    if (key === 'od') return convertDimension(value, 'od');
    if (key === 'inner_dia') return convertDimension(value, 'id');
    if (key === 'wall_thickness') return convertDimension(value, 'wall_thickness');
    if (key === 'weight') return convertWeight(value);
    if (key === 'burst') return convertPressure(value, 'psi');
    if (key === 'collapse') return convertPressure(value, 'psi');
    if (key === 'tensile') return convertTensile(value);
    if (key === 'torque_range') return convertTorqueText(value);
    if (key === 'makeup_loss') return convertLengthText(value);
    if (key === 'standoff') return convertStandoffText(value, lang);
    
    // Formatting conversions for unit display safety
    if (key === 'max_temp') return convertTemperature(value, 'C');
    if (key === 'pressure_limits') return convertPressure(value, 'psi');

    if (key === 'yield_strength' || key === 'tensile_strength') {
      const num = parseFloat(String(value).replace(/,/g, ''));
      if (!isNaN(num) && /^\d+$/.test(String(value).trim())) {
        const unitSystem = store.getState().unitSystem;
        if (unitSystem === 'imperial') {
          return `${num.toLocaleString()} psi`;
        } else {
          const mpa = Math.round(num * 0.00689476);
          return `${mpa.toLocaleString()} MPa`;
        }
      }
    }

    if (Array.isArray(value)) {
      return `<ul class="list-none p-0 m-0 space-y-1">
        ${value.map(val => `
          <li class="flex items-start gap-1">
            <span class="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1.5 shrink-0"></span>
            <span>${val}</span>
          </li>
        `).join('')}
      </ul>`;
    }

    return String(value);
  }

  static render(records, viewMode, lang) {
    // Audit Safety: Block rendering if database schema is corrupted
    const { schemaCorrupted } = store.getState();
    if (schemaCorrupted && viewMode === 'engineering') {
      return `
        <div class="p-6 border border-red-200 dark:border-red-900/40 bg-red-500/10 dark:bg-red-950/20 text-red-800 dark:text-red-400 rounded-xl text-center font-sans text-[11px] leading-relaxed select-none">
          <strong class="block text-xs uppercase tracking-wider mb-1">⚠️ [SECURITY BLOCK]</strong>
          ${lang === 'ru' 
            ? 'Схема базы данных нарушена. Отображение сравнения заблокировано в Инженерном Режиме в целях аудита.' 
            : 'Database schema mismatch detected. Rendering blocked in Engineering Mode for audit safety.'}
        </div>
      `;
    }

    if (!records || records.length === 0 || !records[0]) {
      return `
        <div class="text-center p-8 text-zinc-400 dark:text-zinc-600 font-sans text-xs">
          ${lang === 'ru' ? 'Выберите элементы для сравнения' : 'Select items to compare'}
        </div>
      `;
    }

    const displayRecords = viewMode === 'field' ? records.slice(0, 3) : records;
    const moduleType = displayRecords[0].module;
    const alignedRows = alignAndCompare(displayRecords, moduleType);

    // Filter properties based on the viewMode
    // Field Mode: compact compare only (strength, corrosion, temperature)
    // Reference/Technical Mode: full compare
    let filteredRows = alignedRows;
    if (viewMode === 'field') {
      const fieldKeys = {
        tubulars: ['collapse', 'burst', 'tensile', 'sour_service_suitability', 'temperature_suitability'],
        'steel-grades': ['yield_strength', 'tensile_strength', 'h2s_resistance', 'co2_resistance', 'chloride_resistance', 'temperature_suitability'],
        elastomers: ['pressure_limits', 'h2s_compatibility', 'co2_compatibility', 'rgd_resistance', 'max_temp'],
        threads: ['torque_performance', 'galling_resistance', 'gas_tightness']
      }[moduleType] || [];
      filteredRows = alignedRows.filter(row => fieldKeys.includes(row.key));
    } else {
      // Show full parameters except raw audit metadata unless requested
      const excludedKeys = ['confidenceLevel', 'sources', 'revisionDate', 'lastUpdated'];
      filteredRows = alignedRows.filter(row => !excludedKeys.includes(row.key));
    }

    // Table Header
    const colCount = displayRecords.length;
    const colWidthClass = {
      1: 'w-full',
      2: 'w-1/2',
      3: 'w-1/3',
      4: 'w-1/4'
    }[colCount] || 'w-1/4';

    const headerCols = displayRecords.map(rec => `
      <th class="${colWidthClass} px-4 py-3 bg-zinc-50 dark:bg-zinc-850/50 text-left align-top border-b border-zinc-200 dark:border-zinc-800">
        <div class="flex flex-col gap-0.5">
          <span class="text-[11px] font-extrabold text-zinc-900 dark:text-white">${rec.name}</span>
          <span class="text-[9px] text-zinc-400 dark:text-zinc-550 font-mono uppercase tracking-wider">ID: ${rec.id}</span>
        </div>
      </th>
    `).join('');

    // Table Body Rows
    const bodyRows = filteredRows.map(row => {
      const cells = row.values.map((val, idx) => {
        let cellClass = 'px-4 py-2.5 text-[11px] font-sans border-b border-zinc-100 dark:border-zinc-850 ';
        let badgeHtml = '';

        if (val.status === 'best') {
          cellClass += 'bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-semibold';
          badgeHtml = `
            <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mt-1 self-start">
              ✓ ${lang === 'ru' ? 'Лучший' : 'Best'}
            </span>
          `;
        } else if (val.status === 'worst') {
          cellClass += 'bg-red-500/5 dark:bg-red-950/10 text-red-800 dark:text-red-400';
        } else if (val.status === 'missing') {
          cellClass += 'bg-zinc-50/30 dark:bg-zinc-900/5 text-zinc-400 dark:text-zinc-600 font-mono italic';
        } else {
          cellClass += 'text-zinc-700 dark:text-zinc-300';
        }

        const formatted = this.formatValue(row.key, val.rawValue, lang);

        let truthBadgeHtml = '';
        if (viewMode === 'engineering' && val.truthMeta) {
          const isDerived = val.truthMeta.source === 'derived';
          const label = isDerived ? (lang === 'ru' ? 'Выведено' : 'Derived') : (lang === 'ru' ? 'Стандарт' : 'Standard');
          const colorClass = isDerived 
            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40' 
            : 'bg-zinc-50 dark:bg-zinc-850/50 text-zinc-550 dark:text-zinc-400 border-zinc-200/40 dark:border-zinc-800/80';
          truthBadgeHtml = `
            <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[7px] font-extrabold uppercase border tracking-wider mt-1 self-start select-none ${colorClass}" title="${isDerived ? `Rule: ${val.truthMeta.ruleId || 'Dynamic'}` : 'Direct database property'}">
              ${label}
            </span>
          `;
        }

        return `
          <td class="${cellClass}">
            <div class="flex flex-col gap-1">
              <span>${formatted}</span>
              <div class="flex flex-wrap gap-1 items-center">
                ${badgeHtml}
                ${truthBadgeHtml}
              </div>
            </div>
          </td>
        `;
      }).join('');

      return `
        <tr class="hover:bg-zinc-50/20 dark:hover:bg-zinc-850/5 transition-colors">
          <!-- Property label cell (Sticky left) -->
          <td class="sticky left-0 bg-white dark:bg-zinc-900 z-10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 border-r border-b border-zinc-200/50 dark:border-zinc-800/80 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] w-48 shrink-0">
            ${row.label[lang] || row.label.en}
          </td>
          ${cells}
        </tr>
      `;
    }).join('');

    return `
      <div class="w-full overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm bg-white dark:bg-zinc-900 scrollbar-none">
        <table class="w-full border-collapse text-left table-fixed min-w-[640px]">
          <thead>
            <tr>
              <!-- Sticky corner header -->
              <th class="sticky left-0 bg-zinc-50 dark:bg-zinc-850/50 z-20 px-4 py-3 border-r border-b border-zinc-200 dark:border-zinc-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] w-48 text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                ${lang === 'ru' ? 'Параметр' : 'Parameter'}
              </th>
              ${headerCols}
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-850">
            ${bodyRows}
          </tbody>
        </table>
      </div>
    `;
  }
}
export default CompareTable;
