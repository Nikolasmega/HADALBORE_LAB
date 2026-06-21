import { BaseTable } from '../ModuleFactory.js';

const headersEn = ['Standard / Equipment', 'API Specification', 'GOST Equivalent', 'Source Document'];
const headersRu = ['Стандарт / Оборудование', 'Спецификация API', 'Эквивалент ГОСТ', 'Первоисточник'];

const rowRenderer = (rec, isSelected, lang) => {
  const selectedClass = isSelected 
    ? 'bg-zinc-150 dark:bg-zinc-800/80 font-semibold' 
    : 'hover:bg-zinc-100/30 dark:hover:bg-zinc-850/10';

  let typeLabel = rec.name || rec.equipment;
  if (lang === 'ru') {
    if (typeLabel.includes('Casing & Tubing')) {
      typeLabel = 'Стандарты обсадных и НКТ труб';
    } else if (typeLabel.includes('Drill Pipe')) {
      typeLabel = 'Стандарты бурильных труб';
    } else if (typeLabel.includes('Thread')) {
      typeLabel = 'Стандарты калибров резьб';
    }
  }
  
  // Fallbacks for standard API spec
  const apiLabel = rec.api || (rec.standards && rec.standards.length > 0 ? rec.standards[0] : '—');
  const gostLabel = rec.gost || (rec.standards && rec.standards.length > 2 ? rec.standards[2] : '—');
  const sourceLabel = `${rec.sources ? rec.sources.join(', ') : rec.source} (${rec.revisionDate || rec.revision || 'N/A'})`;

  return `
    <tr class="border-b border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[11px] cursor-pointer transition-colors ${selectedClass}" data-record-id="${rec.id}">
      <td class="px-4 py-3 font-sans text-zinc-950 dark:text-zinc-50">${typeLabel}</td>
      <td class="px-4 py-3 text-zinc-650 dark:text-zinc-350">${apiLabel}</td>
      <td class="px-4 py-3 text-zinc-550">${gostLabel}</td>
      <td class="px-4 py-3 text-zinc-400 text-[10px] text-right font-sans">${sourceLabel}</td>
    </tr>
  `;
};

export const table = new BaseTable(headersEn, headersRu, rowRenderer);
export default table;
