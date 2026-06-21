import { convertTemperature, convertPressure, convertDimension, convertWeight, convertTensile } from '../utils/units.js';
import { getPlaceholder } from '../utils/placeholder.js';
import { CompatibilitySection } from './CompatibilitySection.js';
import { store } from '../core/State.js';

function getMetalYieldStrength(grade, lang, unitSystem) {
  if (!grade) return '';
  const g = grade.trim().toUpperCase();
  const isRu = lang === 'ru';
  const mpaUnit = isRu ? 'МПа' : 'MPa';
  
  const mapping = {
    'J55': { psi: '55,000 - 80,000', mpa: '379 - 552' },
    'K55': { psi: '55,000 - 80,000', mpa: '379 - 552' },
    'L80': { psi: '80,000 - 95,000', mpa: '552 - 655' },
    'N80': { psi: '80,000 - 110,000', mpa: '552 - 758' },
    'T95': { psi: '95,000 - 110,000', mpa: '655 - 758' },
    'P110': { psi: '110,000 - 140,000', mpa: '758 - 965' },
    'Q125': { psi: '125,000 - 150,000', mpa: '862 - 1034' },
    'E75': { psi: '75,000 - 105,000', mpa: '517 - 724' },
    'X95': { psi: '95,000 - 125,000', mpa: '655 - 862' },
    'G105': { psi: '105,000 - 125,000', mpa: '724 - 862' },
    'S135': { psi: '135,000 - 165,000', mpa: '931 - 1138' }
  };
  
  const match = mapping[g];
  if (!match) return '';
  
  if (unitSystem === 'metric') {
    return `${match.mpa} ${mpaUnit}`;
  } else {
    return `${match.psi} psi`;
  }
}


export class TubularCard {
  static getKeyLimit(rec, lang) {
    const label = lang === 'ru' ? 'Смятие (Collapse)' : 'Collapse Pressure';
    const value = rec.collapse !== undefined ? convertPressure(rec.collapse, 'psi') : getPlaceholder('incomplete', lang);
    return `
      <div class="flex flex-col border border-zinc-200/50 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-850/30">
        <span class="text-[8px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">${label}</span>
        <span class="text-xs font-mono font-bold text-zinc-900 dark:text-white mt-1">${value}</span>
      </div>
    `;
  }

  static getSections(rec, lang, viewMode) {
    const isRu = lang === 'ru';
    
    // Tech params specific to Tubulars
    const params = [];
    if (rec.od !== undefined) params.push({ label: isRu ? 'Наружный диаметр (OD)' : 'Outer Dia (OD)', value: convertDimension(rec.od, 'od'), mono: true });
    if (rec.inner_dia !== undefined) params.push({ label: isRu ? 'Внутренний диаметр (ID)' : 'Inner Dia (ID)', value: convertDimension(rec.inner_dia, 'id'), mono: true });
    if (rec.wall_thickness !== undefined) params.push({ label: isRu ? 'Толщина стенки' : 'Wall Thickness', value: convertDimension(rec.wall_thickness, 'wall_thickness'), mono: true });
    if (rec.weight !== undefined) params.push({ label: isRu ? 'Вес погонного метра' : 'Weight (ppf)', value: convertWeight(rec.weight), mono: true });
    if (rec.grade !== undefined) params.push({ label: isRu ? 'Группа прочности' : 'Grade', value: rec.grade, mono: true });
    const { unitSystem } = store.getState();
    const metalYield = getMetalYieldStrength(rec.grade, lang, unitSystem);
    if (metalYield) params.push({ label: isRu ? 'Предел текучести металла' : 'Metal Yield Strength', value: metalYield, mono: true });
    if (rec.drift_id !== undefined) params.push({ label: isRu ? 'Диаметр шаблона (Drift)' : 'Drift ID', value: convertDimension(rec.drift_id, 'drift_id'), mono: true });
    if (rec.burst !== undefined) params.push({ label: isRu ? 'Давление на разрыв (Burst)' : 'Burst Pressure', value: convertPressure(rec.burst, 'psi'), mono: true });
    if (rec.collapse !== undefined) params.push({ label: isRu ? 'Давление на смятие (Collapse)' : 'Collapse Pressure', value: convertPressure(rec.collapse, 'psi'), mono: true });
    if (rec.tensile !== undefined) params.push({ label: isRu ? 'Предел прочности (Tensile)' : 'Tensile strength', value: convertTensile(rec.tensile), mono: true });

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

    const sec4Html = CompatibilitySection.renderTubularCompatibility(rec, lang);

    return { sec2Html, sec3Html, sec4Html };
  }
}
