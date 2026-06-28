import { BaseTable } from '../ModuleFactory.js';
import { translateDbText } from '../../utils/databaseTranslator.js';

const headersEn = ['Steel Grade', 'Yield Strength', 'Sour Service (H₂S)', 'Typical Applications', 'Source'];
const headersRu = ['Марка стали', 'Предел текучести', 'Кислые среды (H₂S)', 'Область применения', 'Первоисточник'];

const rowRenderer = (rec, isSelected, lang) => {
  const selectedClass = isSelected 
    ? 'bg-zinc-150 dark:bg-zinc-800/80 font-semibold' 
    : 'hover:bg-zinc-100/30 dark:hover:bg-zinc-850/10';

  const typeLabel = translateDbText(rec.name, lang);
  const yieldLabel = translateDbText(rec.yield_strength || '—', lang);
  const sourLabel = translateDbText(rec.sour_service_suitability || '—', lang);
  const appLabel = rec.typical_applications && rec.typical_applications.length > 0 
    ? translateDbText(rec.typical_applications[0], lang) 
    : '—';
  const sourceLabel = `${rec.sources ? rec.sources.join(', ') : rec.source || '—'}`;

  return `
    <tr class="border-b border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[11px] cursor-pointer transition-colors ${selectedClass}" data-record-id="${rec.id}">
      <td class="px-4 py-3 font-sans text-zinc-950 dark:text-zinc-50">${typeLabel}</td>
      <td class="px-4 py-3 text-zinc-650 dark:text-zinc-350">${yieldLabel}</td>
      <td class="px-4 py-3 text-zinc-550">${sourLabel}</td>
      <td class="px-4 py-3 text-zinc-550">${appLabel}</td>
      <td class="px-4 py-3 text-zinc-400 text-[10px] text-right font-sans">${sourceLabel}</td>
    </tr>
  `;
};

export const table = new BaseTable(headersEn, headersRu, rowRenderer);
export default table;
