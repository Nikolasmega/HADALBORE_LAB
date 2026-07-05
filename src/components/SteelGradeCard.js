import { convertTemperature, convertPressure } from '../utils/units.js';
import { getPlaceholder } from '../utils/placeholder.js';
import { CompatibilitySection } from './CompatibilitySection.js';

export class SteelGradeCard {
  static getKeyLimit(rec, lang) {
    const label = lang === 'ru' ? 'Предел текучести (Yield)' : 'Yield Strength';
    const value = rec.yield_strength || getPlaceholder('incomplete', lang);
    return `
      <div class="flex flex-col border border-zinc-200/50 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-850/30">
        <span class="text-[8px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">${label}</span>
        <span class="text-xs font-mono font-bold text-zinc-900 dark:text-white mt-1">${value}</span>
      </div>
    `;
  }

  static getSections(rec, lang, viewMode) {
    const isRu = lang === 'ru';
    
    // Tech params specific to Steel Grades
    const params = [];
    if (rec.yield_strength !== undefined) params.push({ label: isRu ? 'Предел текучести (Yield)' : 'Yield Strength', value: rec.yield_strength, mono: true });
    if (rec.tensile_strength !== undefined) params.push({ label: isRu ? 'Предел прочности (Tensile)' : 'Tensile Strength', value: rec.tensile_strength, mono: true });
    if (rec.chemical_composition !== undefined) params.push({ label: isRu ? 'Химический состав' : 'Chemical Comp.', value: rec.chemical_composition });
    if (rec.sour_service_suitability !== undefined) params.push({ label: isRu ? 'Кислые среды (H₂S)' : 'Sour Service', value: rec.sour_service_suitability });
    if (rec.temperature_suitability !== undefined) params.push({ label: isRu ? 'Температурный лимит' : 'Temperature Limit', value: rec.temperature_suitability });
    if (rec.corrosion_resistance !== undefined) params.push({ label: isRu ? 'Коррозионная стойкость' : 'Corrosion Resist.', value: rec.corrosion_resistance });

    // Expanded Steel Grades Properties
    if (rec.mechanical_properties !== undefined) params.push({ label: isRu ? 'Механические свойства' : 'Mechanical Properties', value: rec.mechanical_properties });
    if (rec.h2s_compatibility !== undefined) params.push({ label: isRu ? 'Совместимость с H₂S' : 'H₂S Compatibility', value: rec.h2s_compatibility });
    if (rec.co2_compatibility !== undefined) params.push({ label: isRu ? 'Совместимость с CO₂' : 'CO₂ Compatibility', value: rec.co2_compatibility });
    if (rec.chloride_resistance !== undefined) params.push({ label: isRu ? 'Стойкость к хлоридам' : 'Chloride Resistance', value: rec.chloride_resistance });
    if (rec.temperature_envelope !== undefined) params.push({ label: isRu ? 'Температурный диапазон' : 'Temperature Envelope', value: rec.temperature_envelope });
    if (rec.collapse_yield_considerations !== undefined) params.push({ label: isRu ? 'Смятие/Текучесть' : 'Collapse/Yield', value: rec.collapse_yield_considerations });
    if (rec.galling_tendency !== undefined) params.push({ label: isRu ? 'Склонность к задирам' : 'Galling Tendency', value: rec.galling_tendency });
    if (rec.corrosion_mechanisms !== undefined) params.push({ label: isRu ? 'Механизмы коррозии' : 'Corrosion Mechanisms', value: rec.corrosion_mechanisms });
    if (rec.field_limitations !== undefined) params.push({ label: isRu ? 'Ограничения применения' : 'Field Limitations', value: rec.field_limitations });
    if (rec.common_failure_modes !== undefined) params.push({ label: isRu ? 'Типичные отказы' : 'Common Failures', value: rec.common_failure_modes });
    if (rec.applicable_standards !== undefined) params.push({ label: isRu ? 'Применимые стандарты' : 'Applicable Standards', value: rec.applicable_standards });
    if (rec.oem_references !== undefined) params.push({ label: isRu ? 'OEM ссылки' : 'OEM References', value: rec.oem_references });

    const techParamsHtml = params.map(p => {
      const truthLabel = isRu ? 'Стандарт' : 'Standard';
      return `
        <div class="border-b border-zinc-100 dark:border-zinc-850 pb-1.5 flex justify-between gap-4">
          <div class="flex flex-col">
            <span class="text-zinc-455 dark:text-zinc-550 font-bold uppercase tracking-wider text-[8px]">${p.label}</span>
            ${viewMode === 'engineering' ? `
              <span class="text-[7px] font-bold uppercase text-zinc-400 dark:text-zinc-555 mt-0.5 select-none">${truthLabel}</span>
            ` : ''}
          </div>
          <span class="text-zinc-900 dark:text-zinc-200 text-right ${p.mono ? 'font-mono font-semibold' : 'font-medium'}">${p.value}</span>
        </div>
      `;
    }).join('');

    const sec2Html = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[10px]">${techParamsHtml || `<div><span class="text-zinc-555 dark:text-zinc-500 font-semibold">${getPlaceholder('no_data', lang)}</span></div>`}</div>`;

    const sec3Html = `
      <div class="grid grid-cols-2 gap-4 text-[10px] font-mono">
        <div class="bg-zinc-50 dark:bg-zinc-850 p-2 rounded border border-zinc-200/50 dark:border-zinc-800">
          <span class="block text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider text-[8px] font-sans mb-1">${isRu ? 'Температура' : 'Temp limits'}</span>
          <span class="text-zinc-900 dark:text-zinc-200">
            ${rec.temperature && (rec.temperature.min !== null || rec.temperature.max !== null)
              ? `${rec.temperature.min !== null ? convertTemperature(rec.temperature.min, rec.temperature.unit) : getPlaceholder('incomplete', lang)} / ${rec.temperature.max !== null ? convertTemperature(rec.temperature.max, rec.temperature.unit) : getPlaceholder('incomplete', lang)}`
              : (rec.temperature_suitability || getPlaceholder('no_data', lang))}
          </span>
        </div>
        <div class="bg-zinc-50 dark:bg-zinc-850 p-2 rounded border border-zinc-200/50 dark:border-zinc-800">
          <span class="block text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider text-[8px] font-sans mb-1">${isRu ? 'Предельное давление' : 'Pressure limit'}</span>
          <span class="text-zinc-900 dark:text-zinc-200">
            ${rec.pressure && (rec.pressure.min !== null || rec.pressure.max !== null)
              ? `${rec.pressure.min !== null ? convertPressure(rec.pressure.min, rec.pressure.unit) : getPlaceholder('incomplete', lang)} / ${rec.pressure.max !== null ? convertPressure(rec.pressure.max, rec.pressure.unit) : getPlaceholder('incomplete', lang)}`
              : getPlaceholder('no_data', lang)}
          </span>
        </div>
      </div>
      
      <!-- Interactive NACE MR0175 Envelope -->
      ${SteelGradeCard.renderNaceCalculator(rec, lang)}
    `;

    const sec4Html = CompatibilitySection.renderSteelCompatibility(rec, lang);

    return { sec2Html, sec3Html, sec4Html };
  }

  static renderNaceCalculator(rec, lang) {
    const isRu = lang === 'ru';
    return `
      <div class="mt-4 space-y-4 border border-zinc-250/60 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50/10 dark:bg-zinc-900/10 font-sans select-none">
        <h3 class="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          🍀 ${isRu ? 'Диаграмма NACE MR0175 / SSC Ограничения' : 'NACE MR0175 / SSC Operating Envelope'}
        </h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-550 font-mono mb-1">
              ${isRu ? 'Парц. давление H₂S (P_H2S, psi)' : 'H₂S Partial Press (P_H2S, psi)'}
            </label>
            <input type="number" id="nace-h2s" value="0.1" step="0.01" min="0.001" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-550 font-mono mb-1">
              ${isRu ? 'Водородный показатель (pH)' : 'pH of Fluid'}
            </label>
            <input type="number" id="nace-ph" value="6.0" step="0.1" min="3.0" max="7.0" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white outline-none focus:border-blue-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch pt-2">
          <!-- Calculations / Decision -->
          <div class="bg-zinc-50 dark:bg-zinc-850/40 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[10px] space-y-2 flex flex-col justify-between">
            <div>
              <span class="text-zinc-400 block">${isRu ? 'Регион по NACE MR0175:' : 'NACE MR0175 Region:'}</span>
              <span id="nace-region-val" class="text-xs font-bold text-zinc-900 dark:text-white">Region 1</span>
            </div>
            <div>
              <span class="text-zinc-400 block">${isRu ? 'Оценка совместимости:' : 'Compatibility Rating:'}</span>
              <span id="nace-compat-status" class="text-xs font-bold text-emerald-500">${'SAFE'}</span>
            </div>
            <div class="border-t border-zinc-200 dark:border-zinc-800 pt-2 mt-2 space-y-1">
              <span class="text-zinc-400 block text-[8px] uppercase tracking-wider font-bold">${isRu ? 'Рекомендации по отказам:' : 'Failure Mitigation:'}</span>
              <div id="nace-failure-links" class="flex flex-wrap gap-1 mt-1">
                <!-- Links will be added dynamically here -->
              </div>
            </div>
          </div>

          <!-- Dynamic SVG Plot -->
          <div class="bg-zinc-50 dark:bg-zinc-850/40 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800/60 flex flex-col justify-between items-center min-h-[160px]">
            <svg id="nace-svg" class="w-full h-32" viewBox="0 0 200 120">
              <!-- Graph and marker will be drawn dynamically -->
            </svg>
            <div class="flex gap-4 text-[7px] text-zinc-450 font-mono mt-1 select-none">
              <span class="flex items-center gap-1"><span class="w-2 h-2 bg-emerald-500/20 border border-emerald-500 inline-block"></span>Reg 1</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 bg-amber-500/20 border border-amber-500 inline-block"></span>Reg 2</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 bg-rose-500/20 border border-rose-500 inline-block"></span>Reg 3</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static bindEvents(rec, lang) {
    const isRu = lang === 'ru';
    const h2sInput = document.getElementById('nace-h2s');
    const phInput = document.getElementById('nace-ph');

    if (!h2sInput || !phInput) return;

    const updateNace = () => {
      const p_h2s = Math.max(0.001, parseFloat(h2sInput.value || 0.001));
      const ph = Math.max(3.0, Math.min(7.0, parseFloat(phInput.value || 6.0)));

      // 1. Calculate NACE Region
      let region = 0;
      let regionText = isRu ? 'Регион 0 (Некислая среда)' : 'Region 0 (Non-sour)';
      
      if (p_h2s >= 0.05) {
        if (ph >= 5.5 && p_h2s < 1.0) {
          region = 1;
          regionText = isRu ? 'Регион 1 (Низкий риск SSC)' : 'Region 1 (Mild sour)';
        } else if (ph >= 5.0 && p_h2s < 10.0) {
          region = 2;
          regionText = isRu ? 'Регион 2 (Средний риск SSC)' : 'Region 2 (Moderate sour)';
        } else {
          region = 3;
          regionText = isRu ? 'Регион 3 (Высокий риск / SSC)' : 'Region 3 (Severe sour)';
        }
      }

      document.getElementById('nace-region-val').innerText = regionText;

      // 2. Assess Compatibility
      const grade = rec.id.toLowerCase();
      let isSafe = false;

      if (grade.includes('c90') || grade.includes('t95') || grade.includes('c110') || grade.includes('s13cr') || grade.includes('25cr')) {
        isSafe = true; // Fully sour service qualified
      } else if (grade.includes('l80') || grade.includes('13cr')) {
        isSafe = region <= 2;
      } else {
        isSafe = region === 0;
      }

      const statusEl = document.getElementById('nace-compat-status');
      if (isSafe) {
        statusEl.className = 'text-xs font-bold text-emerald-500';
        statusEl.innerText = isRu ? 'БЕЗОПАСНО' : 'SAFE / COMPATIBLE';
      } else {
        statusEl.className = 'text-xs font-bold text-rose-500';
        statusEl.innerText = isRu ? 'ВЫСОКИЙ РИСК SSC / ОТКАЗ' : 'HIGH RISK OF CRACKING';
      }

      // 3. Render failure link buttons dynamically
      const linksContainer = document.getElementById('nace-failure-links');
      if (linksContainer) {
        let buttonsHtml = '';
        if (!isSafe) {
          buttonsHtml += `
            <button data-related-id="failure_ssc" data-related-module="failures" class="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-450 border border-rose-200/50 dark:border-rose-900/30 rounded text-[8px] font-bold cursor-pointer transition-colors">
              ${isRu ? 'Открыть карту SSC' : 'View SSC Failure Card'}
            </button>
          `;
        }
        if (ph < 5.0) {
          buttonsHtml += `
            <button data-related-id="failure_co2_corrosion" data-related-module="failures" class="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-450 border border-amber-200/50 dark:border-amber-900/30 rounded text-[8px] font-bold cursor-pointer transition-colors">
              ${isRu ? 'Коррозия CO₂' : 'CO₂ Corrosion'}
            </button>
          `;
        }
        linksContainer.innerHTML = buttonsHtml || `<span class="text-zinc-400 dark:text-zinc-555">—</span>`;
      }

      // 4. Draw SVG plot
      const getX = (val) => 15 + ((val - 3.0) / 4.0) * 170;
      const getY = (val) => {
        const logVal = Math.log10(val); // -2 to 2
        return 110 - ((logVal + 2) / 4) * 100;
      };

      const naceSvg = document.getElementById('nace-svg');
      if (naceSvg) {
        let svgContent = `
          <!-- Background grids and labels -->
          <rect x="15" y="10" width="170" height="100" fill="#f8fafc" class="dark:fill-zinc-900/60" />
          
          <!-- Region 1 area (Mild Sour): light green -->
          <polygon points="${getX(5.5)},${getY(0.05)} ${getX(7.0)},${getY(0.05)} ${getX(7.0)},${getY(1.0)} ${getX(5.5)},${getY(1.0)}" fill="#10b981" fill-opacity="0.12" />
          
          <!-- Region 2 area (Moderate Sour): light orange -->
          <polygon points="${getX(5.0)},${getY(0.05)} ${getX(5.5)},${getY(0.05)} ${getX(5.5)},${getY(1.0)} ${getX(7.0)},${getY(1.0)} ${getX(7.0)},${getY(10.0)} ${getX(5.0)},${getY(10.0)}" fill="#f59e0b" fill-opacity="0.12" />
          
          <!-- Region 3 area (Severe Sour): light red -->
          <polygon points="${getX(3.0)},${getY(0.05)} ${getX(5.0)},${getY(0.05)} ${getX(5.0)},${getY(10.0)} ${getX(7.0)},${getY(10.0)} ${getX(7.0)},${getY(100.0)} ${getX(3.0)},${getY(100.0)}" fill="#ef4444" fill-opacity="0.12" />

          <!-- Region labels -->
          <text x="${getX(6.25)}" y="${getY(0.2)}" font-size="5" font-weight="bold" fill="#047857" text-anchor="middle" class="select-none">Reg 1</text>
          <text x="${getX(6.0)}" y="${getY(3.0)}" font-size="5" font-weight="bold" fill="#b45309" text-anchor="middle" class="select-none">Reg 2</text>
          <text x="${getX(4.0)}" y="${getY(20.0)}" font-size="5" font-weight="bold" fill="#b91c1c" text-anchor="middle" class="select-none">Reg 3</text>

          <!-- Axes -->
          <line x1="15" y1="110" x2="185" y2="110" stroke="#888888" stroke-width="0.5" />
          <line x1="15" y1="10" x2="15" y2="110" stroke="#888888" stroke-width="0.5" />
          
          <!-- Grid lines for pH -->
          ${[3.0, 4.0, 5.0, 6.0, 7.0].map(val => `
            <line x1="${getX(val)}" y1="10" x2="${getX(val)}" y2="110" stroke="#cccccc" stroke-width="0.3" stroke-dasharray="1,1" class="dark:stroke-zinc-800" />
            <text x="${getX(val)}" y="116" font-size="4.5" fill="#888888" text-anchor="middle" class="select-none">${val}</text>
          `).join('')}
          
          <!-- Grid lines for P_H2S (0.01, 0.1, 1.0, 10.0, 100.0) -->
          ${[0.01, 0.1, 1.0, 10.0, 100.0].map(val => `
            <line x1="15" y1="${getY(val)}" x2="185" y2="${getY(val)}" stroke="#cccccc" stroke-width="0.3" stroke-dasharray="1,1" class="dark:stroke-zinc-800" />
            <text x="10" y="${getY(val) + 1.5}" font-size="4" fill="#888888" text-anchor="end" class="select-none">${val}</text>
          `).join('')}

          <text x="185" y="117" font-size="5" text-anchor="end" fill="#666666" font-weight="bold" class="select-none">${'pH'}</text>
          <text x="12" y="7" font-size="5" fill="#666666" font-weight="bold" class="select-none">${'H₂S (psi)'}</text>

          <!-- User input target point marker -->
          <circle cx="${getX(ph)}" cy="${getY(p_h2s)}" r="2.5" fill="#3b82f6" stroke="#ffffff" stroke-width="0.8" />
        `;
        naceSvg.innerHTML = svgContent;
      }
    };

    h2sInput.addEventListener('input', updateNace);
    phInput.addEventListener('input', updateNace);
    updateNace();
  }
}


