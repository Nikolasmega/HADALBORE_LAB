import { convertTemperature, convertPressure } from '../utils/units.js';
import { getPlaceholder } from '../utils/placeholder.js';
import { CompatibilitySection } from './CompatibilitySection.js';
import { translateDbText } from '../utils/databaseTranslator.js';

export class ElastomerCard {
  static getKeyLimit(rec, lang) {
    const label = lang === 'ru' ? 'Макс. температура' : 'Max Temperature';
    const maxT = rec.max_temp !== undefined ? rec.max_temp : (rec.temperature?.max !== undefined ? rec.temperature.max : undefined);
    const value = maxT !== undefined ? convertTemperature(maxT, 'C') : getPlaceholder('incomplete', lang);
    return `
      <div class="flex flex-col border border-zinc-200/50 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-850/30">
        <span class="text-[8px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">${label}</span>
        <span class="text-xs font-mono font-bold text-zinc-900 dark:text-white mt-1">${value}</span>
      </div>
    `;
  }

  static getSections(rec, lang, viewMode) {
    const isRu = lang === 'ru';
    
    // Tech params specific to Elastomers
    const params = [];
    if (rec.seal_type) params.push({ label: isRu ? 'Тип уплотнения' : 'Seal Type', value: isRu ? (rec.seal_type_ru || rec.seal_type) : rec.seal_type });
    if (rec.material) params.push({ label: isRu ? 'Материал' : 'Material', value: rec.material });
    if (rec.max_temp !== undefined) params.push({ label: isRu ? 'Макс. температура' : 'Max Temperature', value: convertTemperature(rec.max_temp, 'C'), mono: true });
    if (rec.rgd_resistance !== undefined) params.push({ label: isRu ? 'Стойкость к декомпрессии (RGD)' : 'RGD Resistance', value: rec.rgd_resistance });
    if (rec.steam_resistance !== undefined) params.push({ label: isRu ? 'Стойкость к пару' : 'Steam Resistance', value: rec.steam_resistance });
    if (rec.acid_compatibility !== undefined) params.push({ label: isRu ? 'Стойкость к кислотам' : 'Acid Compatibility', value: rec.acid_compatibility });
    if (rec.aromatics_resistance !== undefined) params.push({ label: isRu ? 'Стойкость к ароматике' : 'Aromatics Resistance', value: rec.aromatics_resistance });
    if (rec.failure_mechanisms !== undefined) params.push({ label: isRu ? 'Механизмы отказа' : 'Failure Mechanisms', value: rec.failure_mechanisms });
    if (rec.storage_recommendations !== undefined) params.push({ label: isRu ? 'Рекомендации по хранению' : 'Storage Recs', value: rec.storage_recommendations });
    if (rec.compatibility) params.push({ label: isRu ? 'Совместимость' : 'Compatibility', value: isRu ? (rec.compatibility_ru || rec.compatibility) : rec.compatibility });

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
          <span class="text-zinc-900 dark:text-zinc-200 text-right ${p.mono ? 'font-mono font-semibold' : 'font-medium'}">${translateDbText(p.value, lang)}</span>
        </div>
      `;
    }).join('');

    const sec2Html = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[10px]">${techParamsHtml || `<div><span class="text-zinc-550 dark:text-zinc-500 font-semibold">${getPlaceholder('no_data', lang)}</span></div>`}</div>`;

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

      <!-- Interactive Elastomer Envelope -->
      ${ElastomerCard.renderElastomerLimitsChart(rec, lang)}
    `;

    const sec4Html = CompatibilitySection.renderElastomerCompatibility(rec, lang);

    return { sec2Html, sec3Html, sec4Html };
  }

  static renderElastomerLimitsChart(rec, lang) {
    const isRu = lang === 'ru';
    return `
      <div class="mt-4 space-y-4 border border-zinc-250/60 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50/10 dark:bg-zinc-900/10 font-sans select-none">
        <h3 class="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          📈 ${isRu ? 'Диаграмма применимости T-P эластомера' : 'Elastomer T-P Operating Envelope'}
        </h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-555 font-mono mb-1">
              ${isRu ? 'Рабочая температура (T, °C)' : 'Operating Temp (T, °C)'}
            </label>
            <input type="number" id="elastomer-t" value="80" step="1" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-555 font-mono mb-1">
              ${isRu ? 'Рабочее давление (P, psi)' : 'Operating Press (P, psi)'}
            </label>
            <input type="number" id="elastomer-p" value="5000" step="250" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white outline-none focus:border-blue-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch pt-2">
          <!-- Decision / Output -->
          <div class="bg-zinc-50 dark:bg-zinc-850/40 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[10px] space-y-3 flex flex-col justify-between">
            <div>
              <span class="text-zinc-400 block">${isRu ? 'Статус работоспособности:' : 'Envelope Status:'}</span>
              <span id="elastomer-envelope-status" class="text-xs font-bold text-emerald-500">${'SAFE OPERATION'}</span>
            </div>
            <div class="border-t border-zinc-200 dark:border-zinc-800 pt-2 space-y-1">
              <span class="text-zinc-455 block font-bold text-[8.5px] uppercase tracking-wider">${isRu ? 'Карта рисков:' : 'Risk Mapping:'}</span>
              <div id="elastomer-risk-links" class="flex flex-wrap gap-1 mt-1">
                <!-- Dynamic links will render here -->
              </div>
            </div>
          </div>

          <!-- SVG Plot -->
          <div class="bg-zinc-50 dark:bg-zinc-850/40 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800/60 flex flex-col justify-between items-center min-h-[160px]">
            <svg id="elastomer-svg" class="w-full h-32" viewBox="0 0 200 120">
              <!-- Envelope polygon and marker will be drawn dynamically -->
            </svg>
            <div class="flex gap-4 text-[7px] text-zinc-455 font-mono mt-1">
              <span class="flex items-center gap-1"><span class="w-2.5 h-0.5 bg-blue-500 inline-block"></span>${isRu ? 'Граница T-P' : 'T-P Limit'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static bindEvents(rec, lang) {
    const isRu = lang === 'ru';
    const tInput = document.getElementById('elastomer-t');
    const pInput = document.getElementById('elastomer-p');

    if (!tInput || !pInput) return;

    const minT = rec.temperature?.min !== undefined ? rec.temperature.min : -40;
    const maxT = rec.temperature?.max !== undefined ? rec.temperature.max : 150;
    const maxP = rec.pressure?.max !== undefined ? rec.pressure.max : 10000;

    const updateEnvelope = () => {
      const t = parseFloat(tInput.value || 0);
      const p = parseFloat(pInput.value || 0);

      const isTempSafe = t >= minT && t <= maxT;
      const isPressSafe = p >= 0 && p <= maxP;
      
      const derateThreshold = minT + (maxT - minT) * 0.8;
      let activeMaxP = maxP;
      if (t > derateThreshold) {
        const factor = 1.0 - 0.2 * ((t - derateThreshold) / (maxT - derateThreshold));
        activeMaxP = maxP * factor;
      }
      const isDynamicPressSafe = p <= activeMaxP;
      const isSafe = isTempSafe && isPressSafe && isDynamicPressSafe;

      const statusEl = document.getElementById('elastomer-envelope-status');
      const riskContainer = document.getElementById('elastomer-risk-links');

      if (isSafe) {
        statusEl.className = 'text-xs font-bold text-emerald-500';
        statusEl.innerText = isRu ? 'БЕЗОПАСНАЯ РАБОТА' : 'SAFE OPERATION';
        if (riskContainer) riskContainer.innerHTML = `<span class="text-zinc-400 dark:text-zinc-555">—</span>`;
      } else {
        statusEl.className = 'text-xs font-bold text-rose-500';
        let failReason = isRu ? 'ПРЕВЫШЕНЫ ЛИМИТЫ T-P' : 'EXCEEDED T-P LIMITS';
        if (!isTempSafe) {
          failReason = t > maxT ? (isRu ? 'ТЕМПЕРАТУРНАЯ ДЕСТРУКЦИЯ' : 'THERMAL DEGRADATION') : (isRu ? 'ОХРУПЧИВАНИЕ (ЗАМЕРЗАНИЕ)' : 'EMBRITTLEMENT (COLD)');
        } else if (!isDynamicPressSafe) {
          failReason = isRu ? 'ТЕРМОБАР. РАЗРУШЕНИЕ / ВЫДАВЛИВАНИЕ' : 'THERMOBARIC EXTRUSION';
        }
        statusEl.innerText = failReason;

        if (riskContainer) {
          riskContainer.innerHTML = `
            <button data-related-id="failure_seal_leak" data-related-module="failures" class="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-455 border border-rose-200/50 dark:border-rose-900/30 rounded text-[8px] font-bold cursor-pointer transition-colors">
              ${isRu ? 'Открыть карту: Утечка уплотнения' : 'View Seal Leak Failure Card'}
            </button>
          `;
        }
      }

      const getX = (val) => 15 + ((val - (-50)) / 300) * 170;
      const getY = (val) => 110 - (val / 20000) * 100;

      const elastomerSvg = document.getElementById('elastomer-svg');
      if (elastomerSvg) {
        const pt1 = `${getX(minT)},${getY(0)}`;
        const pt2 = `${getX(minT)},${getY(maxP)}`;
        const pt3 = `${getX(derateThreshold)},${getY(maxP)}`;
        const pt4 = `${getX(maxT)},${getY(maxP * 0.8)}`;
        const pt5 = `${getX(maxT)},${getY(0)}`;

        let svgContent = `
          <rect x="15" y="10" width="170" height="100" fill="#f8fafc" class="dark:fill-zinc-900/60" />

          <polygon points="${pt1} ${pt2} ${pt3} ${pt4} ${pt5}" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="1" />

          <line x1="15" y1="110" x2="185" y2="110" stroke="#888888" stroke-width="0.5" />
          <line x1="15" y1="10" x2="15" y2="110" stroke="#888888" stroke-width="0.5" />

          ${[-50, 0, 50, 100, 150, 200, 250].map(val => `
            <line x1="${getX(val)}" y1="10" x2="${getX(val)}" y2="110" stroke="#cccccc" stroke-width="0.3" stroke-dasharray="1,1" class="dark:stroke-zinc-800" />
            <text x="${getX(val)}" y="116" font-size="4.5" fill="#888888" text-anchor="middle" class="select-none">${val}</text>
          `).join('')}

          ${[0, 5000, 10000, 15000, 20000].map(val => `
            <line x1="15" y1="${getY(val)}" x2="185" y2="${getY(val)}" stroke="#cccccc" stroke-width="0.3" stroke-dasharray="1,1" class="dark:stroke-zinc-800" />
            <text x="10" y="${getY(val) + 1.5}" font-size="4" fill="#888888" text-anchor="end" class="select-none">${val}</text>
          `).join('')}

          <text x="185" y="117" font-size="5" text-anchor="end" fill="#666666" font-weight="bold" class="select-none">${'T (°C)'}</text>
          <text x="12" y="7" font-size="5" fill="#666666" font-weight="bold" class="select-none">${'P (psi)'}</text>

          <circle cx="${getX(t)}" cy="${getY(p)}" r="2.5" fill="${isSafe ? '#10b981' : '#ef4444'}" stroke="#ffffff" stroke-width="0.8" />
        `;
        elastomerSvg.innerHTML = svgContent;
      }
    };

    tInput.addEventListener('input', updateEnvelope);
    pInput.addEventListener('input', updateEnvelope);
    updateEnvelope();
  }
}


