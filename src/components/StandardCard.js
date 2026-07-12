import { convertTemperature, convertPressure } from '../utils/units.js';
import { getPlaceholder } from '../utils/placeholder.js';
import { i18n } from '../utils/i18n.js';

export class StandardCard {
  static getKeyLimit(rec, lang) {
    const label = i18n.t('columns.scope');
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
    
    const fieldsMapping = {
      connection_type: 'columns.connection_type',
      seal_type: 'columns.seal_type',
      material: 'columns.material',
      brine: 'columns.brine',
      fluid: 'columns.fluid',
      equipment: 'columns.equipment',
      compatibility: 'columns.compatibility',
      running_notes: 'columns.running_notes'
    };

    Object.entries(fieldsMapping).forEach(([key, i18nKey]) => {
      if (rec[key]) {
        const val = isRu ? (rec[`${key}_ru`] || rec[key]) : rec[key];
        params.push({
          label: i18n.t(i18nKey),
          value: val
        });
      }
    });

    const techParamsHtml = params.map(p => {
      const truthLabel = i18n.t('columns.standard');
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
          <span class="block text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider text-[8px] font-sans mb-1">${i18n.t('columns.temp_range')}</span>
          <span class="text-zinc-900 dark:text-zinc-200">
            ${rec.temperature && (rec.temperature.min !== null || rec.temperature.max !== null)
              ? `${rec.temperature.min !== null ? convertTemperature(rec.temperature.min, rec.temperature.unit) : getPlaceholder('incomplete', lang)} / ${rec.temperature.max !== null ? convertTemperature(rec.temperature.max, rec.temperature.unit) : getPlaceholder('incomplete', lang)}`
              : (rec.temperature_suitability || getPlaceholder('no_data', lang))}
          </span>
        </div>
        <div class="bg-zinc-50 dark:bg-zinc-850 p-2 rounded border border-zinc-200/50 dark:border-zinc-800">
          <span class="block text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider text-[8px] font-sans mb-1">${i18n.t('columns.pressure_rating_psi')}</span>
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

export default StandardCard;
