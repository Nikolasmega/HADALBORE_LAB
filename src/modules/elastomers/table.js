import { BaseTable } from '../ModuleFactory.js';

const headersEn = ['Material', 'Temperature Max', 'Limitations', 'Source Document'];
const headersRu = ['Материал', 'Макс. температура', 'Ограничения', 'Первоисточник'];

const rowRenderer = (rec, isSelected, lang) => {
  const selectedClass = isSelected 
    ? 'bg-zinc-150 dark:bg-zinc-800/80 font-semibold' 
    : 'hover:bg-zinc-100/30 dark:hover:bg-zinc-850/10';

  const typeLabel = rec.name || rec.material;
  const tempLabel = rec.temperature && rec.temperature.max ? `${rec.temperature.max} °${rec.temperature.unit}` : '—';
  // Limitations is an array of strings in our aligned mock-db.json, take the first one or join them
  const limitationsLabel = rec.limitations && rec.limitations.length > 0 ? rec.limitations[0] : '—';
  const sourceLabel = `${rec.sources ? rec.sources.join(', ') : rec.source} (${rec.revisionDate || rec.revision || 'N/A'})`;

  return `
    <tr class="border-b border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[11px] cursor-pointer transition-colors ${selectedClass}" data-record-id="${rec.id}">
      <td class="px-4 py-3 font-sans text-zinc-950 dark:text-zinc-50">${typeLabel}</td>
      <td class="px-4 py-3 text-zinc-650 dark:text-zinc-350">${tempLabel}</td>
      <td class="px-4 py-3 text-zinc-550">${limitationsLabel}</td>
      <td class="px-4 py-3 text-zinc-400 text-[10px] text-right font-sans">${sourceLabel}</td>
    </tr>
  `;
};

export const table = new BaseTable(headersEn, headersRu, rowRenderer);
export default table;
