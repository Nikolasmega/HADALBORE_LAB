import { convertTorqueText, convertLengthText, convertStandoffText } from '../utils/units.js';
import { getPlaceholder } from '../utils/placeholder.js';
import { store } from '../core/State.js';
import { translateDbText } from '../utils/databaseTranslator.js';


function parseAndConvertTorque(str, lang, unitSystem) {
  if (!str) return null;
  const isMetric = unitSystem === 'metric' || unitSystem === 'hybrid';
  const isRu = lang === 'ru';
  
  // Find all numbers in the string
  const numRegex = /([\d,]+)\s*(?:-\s*([\d,]+))?/g;
  const cleaned = str.replace(/\s+/g, '');
  const match = numRegex.exec(cleaned);
  if (!match) return null;

  const parseVal = (valStr) => parseFloat(valStr.replace(/,/g, ''));
  const val1 = parseVal(match[1]);
  const val2 = match[2] ? parseVal(match[2]) : null;

  if (isNaN(val1)) return null;

  const hasFtLbs = str.toLowerCase().includes('ft-lbs') || str.toLowerCase().includes('ft-lb');
  const hasNm = str.toLowerCase().includes('н·м') || str.toLowerCase().includes('n·m') || str.toLowerCase().includes('нм');

  // Establish base values in ft-lbs
  let minFtLbs = val1;
  let maxFtLbs = val2 !== null ? val2 : val1;
  
  if (hasNm) {
    // If database value is in N-m, convert to ft-lbs as base
    minFtLbs = val1 * 0.737562;
    maxFtLbs = val2 !== null ? val2 * 0.737562 : val1 * 0.737562;
  }

  // Calculate optimum
  const optFtLbs = (minFtLbs + maxFtLbs) / 2;

  // Format helper
  const formatVal = (ftLbsVal) => {
    if (isMetric) {
      const nmVal = ftLbsVal * 1.35582;
      return `${Math.round(nmVal).toLocaleString(isRu ? 'ru-RU' : 'en-US')} ${isRu ? 'Н·м' : 'N·m'}`;
    } else {
      return `${Math.round(ftLbsVal).toLocaleString(isRu ? 'ru-RU' : 'en-US')} ft-lbs`;
    }
  };

  return {
    min: formatVal(minFtLbs),
    opt: formatVal(optFtLbs),
    max: formatVal(maxFtLbs)
  };
}

export class ThreadCard {

  static getKeyLimit(rec, lang) {
    const label = lang === 'ru' ? 'Момент свинчивания' : 'Makeup Torque';
    const value = rec.torque_range ? convertTorqueText(rec.torque_range) : getPlaceholder('incomplete', lang);
    return `
      <div class="flex flex-col border border-zinc-200/50 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-850/30">
        <span class="text-[8px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">${label}</span>
        <span class="text-xs font-mono font-bold text-zinc-900 dark:text-white mt-1">${value}</span>
      </div>
    `;
  }

  static getSections(rec, lang, viewMode) {
    const isRu = lang === 'ru';
    const rloc = (en, ruKey) => {
      const val = isRu ? (rec[ruKey] || rec[en]) : rec[en];
      return translateDbText(val, lang);
    };
    
    // Tech params specific to Threads
    const params = [];
    if (rec.connection_type) params.push({ label: isRu ? 'Тип соединения' : 'Connection Type', value: rloc('connection_type', 'connection_type_ru') });
    
    // Add minimum, optimum, maximum torques as separate specs
    if (rec.torque_range) {
      const torqueVals = parseAndConvertTorque(rec.torque_range, lang, store.getState().unitSystem);
      if (torqueVals) {
        params.push({ label: isRu ? 'Минимальный момент' : 'Minimum Torque', value: torqueVals.min, mono: true });
        params.push({ label: isRu ? 'Оптимальный момент свинчивания' : 'Optimum Makeup Torque', value: torqueVals.opt, mono: true });
        params.push({ label: isRu ? 'Максимальный момент' : 'Maximum Torque', value: torqueVals.max, mono: true });
      } else {
        params.push({ label: isRu ? 'Крутящий момент' : 'Torque Range', value: convertTorqueText(rec.torque_range), mono: true });
      }
    }

    if (rec.torque_envelope !== undefined) params.push({ label: isRu ? 'Предельный момент' : 'Torque Envelope', value: rloc('torque_envelope','torque_envelope_ru') });
    if (rec.gas_tight_suitability !== undefined) params.push({ label: isRu ? 'Герметичность по газу' : 'Gas-Tight Suitability', value: rloc('gas_tight_suitability','gas_tight_suitability_ru') });
    if (rec.compression_tension_behavior !== undefined) params.push({ label: isRu ? 'Сжатие/Растяжение' : 'Compression/Tension', value: rloc('compression_tension_behavior','compression_tension_behavior_ru') });
    if (rec.galling_risks !== undefined) params.push({ label: isRu ? 'Риск задиров резьбы' : 'Galling Risks', value: rloc('galling_risks','galling_risks_ru') });
    if (rec.running_recommendations !== undefined) params.push({ label: isRu ? 'Рекомендации по спуску' : 'Running Recommendations', value: rloc('running_recommendations','running_recommendations_ru') });
    if (rec.compatible_lubricants !== undefined) params.push({ label: isRu ? 'Совместимые смазки' : 'Compatible Lubricants', value: rloc('compatible_lubricants','compatible_lubricants_ru') });
    if (rec.field_assembly_notes !== undefined) params.push({ label: isRu ? 'Сборка на буровой' : 'Field Assembly Notes', value: rloc('field_assembly_notes','field_assembly_notes_ru') });

    if (rec.turns) params.push({ label: isRu ? 'Обороты свинчивания' : 'Makeup Turns', value: rec.turns, mono: true });
    if (rec.makeup_loss) params.push({ label: isRu ? 'Смыкание' : 'Makeup Loss', value: convertLengthText(rec.makeup_loss), mono: true });
    if (rec.standoff) params.push({ label: isRu ? 'Натяг резьбы' : 'Standoff', value: convertStandoffText(rec.standoff, lang), mono: true });

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
          <span class="block text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider text-[8px] font-sans mb-1">${isRu ? 'Ограничение момента' : 'Torque Limits'}</span>
          <span class="text-zinc-900 dark:text-zinc-200">
            ${rec.torque_range ? convertTorqueText(rec.torque_range) : getPlaceholder('no_data', lang)}
          </span>
        </div>
        <div class="bg-zinc-50 dark:bg-zinc-850 p-2 rounded border border-zinc-200/50 dark:border-zinc-800">
          <span class="block text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider text-[8px] font-sans mb-1">${isRu ? 'Смыкание' : 'Makeup Loss'}</span>
          <span class="text-zinc-900 dark:text-zinc-200">
            ${rec.makeup_loss ? convertLengthText(rec.makeup_loss) : getPlaceholder('no_data', lang)}
          </span>
        </div>
      </div>
    `;

    const sec4Html = '';

    return { sec2Html, sec3Html, sec4Html };
  }
}
