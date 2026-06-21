import { convertTemperature, convertPressure } from '../utils/units.js';
import { getPlaceholder } from '../utils/placeholder.js';

export class StandardCard {
  static getKeyLimit(rec, lang) {
    const label = lang === 'ru' ? 'Спецификация' : 'Limit/Specs';
    const value = lang === 'ru'
      ? (rec.notes_ru || rec.notes || rec.scope_ru || rec.scope || getPlaceholder('no_data', lang))
      : (rec.notes || rec.scope || getPlaceholder('no_data', lang));
    return `
      <div class="flex flex-col border border-zinc-200/50 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-850/30">
        <span class="text-[8px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">${label}</span>
        <span class="text-xs font-mono font-bold text-zinc-900 dark:text-white mt-1">${value}</span>
      </div>
    `;
  }

  static getSections(rec, lang, viewMode, formatList) {
    const isRu = lang === 'ru';
    
    // Tech params specific to standards / fallbacks
    const params = [];
    if (rec.connection_type) params.push({ label: isRu ? 'Тип соединения' : 'Connection Type', value: isRu ? (rec.connection_type_ru || rec.connection_type) : rec.connection_type });
    if (rec.seal_type) params.push({ label: isRu ? 'Тип уплотнения' : 'Seal Type', value: isRu ? (rec.seal_type_ru || rec.seal_type) : rec.seal_type });
    if (rec.material) params.push({ label: isRu ? 'Материал' : 'Material', value: rec.material });
    if (rec.brine) params.push({ label: isRu ? 'Тип рассола' : 'Brine Type', value: rec.brine });
    if (rec.fluid) params.push({ label: isRu ? 'Среда' : 'Fluid/Medium', value: rec.fluid });
    if (rec.equipment) params.push({ label: isRu ? 'Оборудование' : 'Equipment', value: rec.equipment });
    if (rec.compatibility) params.push({ label: isRu ? 'Совместимость' : 'Compatibility', value: isRu ? (rec.compatibility_ru || rec.compatibility) : rec.compatibility });
    if (rec.running_notes) params.push({ label: isRu ? 'Рекомендации по спуску' : 'Running Notes', value: isRu ? (rec.running_notes_ru || rec.running_notes) : rec.running_notes });

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

    const compatList = formatList ? formatList(rec.chemicalCompatibility || rec.corrosion_resistance) : '';
    const sec4Html = `<ul class="text-[11px] text-zinc-700 dark:text-zinc-350 space-y-0.5">${compatList || `<span class="text-zinc-455 dark:text-zinc-550 font-semibold">${getPlaceholder('no_data', lang)}</span>`}</ul>`;

    return { sec2Html, sec3Html, sec4Html };
  }
}
