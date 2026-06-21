import { convertTemperature, convertPressure } from '../utils/units.js';
import { getPlaceholder } from '../utils/placeholder.js';
import { CompatibilitySection } from './CompatibilitySection.js';

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
          <span class="text-zinc-900 dark:text-zinc-200 text-right ${p.mono ? 'font-mono font-semibold' : 'font-medium'}">${p.value}</span>
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
    `;

    const sec4Html = CompatibilitySection.renderElastomerCompatibility(rec, lang);

    return { sec2Html, sec3Html, sec4Html };
  }
}
