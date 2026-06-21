import { BaseTable } from '../ModuleFactory.js';
import { convertDimension, convertWeight } from '../../utils/units.js';

const headersEn = ['Type / Name', 'OD', 'ID (Drift)', 'Weight (ppf)', 'Weight in Fluid', 'Grade', 'Source'];
const headersRu = ['Тип / Название', 'НД (OD)', 'ВД / Шаблон', 'Вес погонного метра', 'Вес в жидкости', 'Группа прочности', 'Первоисточник'];

const rowRenderer = (rec, isSelected, lang, extraParams) => {
  const selectedClass = isSelected
    ? 'bg-zinc-150 dark:bg-zinc-800/80 font-semibold'
    : 'hover:bg-zinc-100/30 dark:hover:bg-zinc-850/10';

  const typeLabel = rec.name;
  const odLabel = rec.od !== undefined ? convertDimension(rec.od, 'od') : '—';

  // Inner diameter + drift
  const idVal = rec.inner_dia !== undefined ? convertDimension(rec.inner_dia, 'od') : '—';
  const driftVal = rec.drift_id !== undefined ? convertDimension(rec.drift_id, 'od') : null;
  const idLabel = driftVal ? `${idVal} <span class="text-[9px] text-zinc-400 dark:text-zinc-500">(${driftVal})</span>` : idVal;

  const paramLabel = rec.weight !== undefined ? convertWeight(rec.weight) : '—';

  // Calculate buoyed weight
  const bf = extraParams && extraParams.bf !== undefined ? extraParams.bf : 1.0;
  const buoyedWeightVal = rec.weight !== undefined ? rec.weight * bf : null;
  const buoyedWeightLabel = buoyedWeightVal !== null
    ? `<span class="buoyed-weight-cell" data-air-weight="${rec.weight}">${convertWeight(buoyedWeightVal)}</span>`
    : '—';

  const gradeLabel = rec.grade || '—';
  const sourceLabel = `${rec.sources ? rec.sources.join(', ') : rec.source || '—'} (${rec.revisionDate || rec.revision || 'N/A'})`;

  return `
    <tr class="border-b border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[11px] cursor-pointer transition-colors ${selectedClass}" data-record-id="${rec.id}">
      <td class="px-4 py-3 font-sans text-zinc-950 dark:text-zinc-50">${typeLabel}</td>
      <td class="px-4 py-3 text-zinc-650 dark:text-zinc-350">${odLabel}</td>
      <td class="px-4 py-3 text-zinc-650 dark:text-zinc-350">${idLabel}</td>
      <td class="px-4 py-3 text-zinc-550">${paramLabel}</td>
      <td class="px-4 py-3 text-zinc-550">${buoyedWeightLabel}</td>
      <td class="px-4 py-3 text-zinc-550">${gradeLabel}</td>
      <td class="px-4 py-3 text-zinc-400 text-[10px] text-right font-sans">${sourceLabel}</td>
    </tr>
  `;
};

export const table = new BaseTable(
  headersEn,
  headersRu,
  rowRenderer,
  ['name', 'od', 'inner_dia', 'weight', null, 'grade', 'source']
);
export default table;
