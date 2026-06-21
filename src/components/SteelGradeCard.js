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

    const sec4Html = CompatibilitySection.renderSteelCompatibility(rec, lang);

    return { sec2Html, sec3Html, sec4Html };
  }
}
