import { BaseTable } from '../ModuleFactory.js';
import { convertTemperature } from '../../utils/units.js';

const headersEn = ['Parameter / Medium', 'Category', 'Temperature limits', 'Source Document'];
const headersRu = ['Параметр / Среда', 'Категория', 'Лимит температуры', 'Первоисточник'];

const rowRenderer = (rec, isSelected, lang) => {
  const selectedClass = isSelected 
    ? 'bg-zinc-150 dark:bg-zinc-800/80 font-semibold' 
    : 'hover:bg-zinc-100/30 dark:hover:bg-zinc-850/10';

  const typeLabel = rec.name;
  
  // Localize Category
  let categoryLabel = rec.type || '—';
  if (rec.type === 'PT_Reference') {
    categoryLabel = lang === 'ru' ? 'Давление / Градиент' : 'P/T Reference';
  } else if (rec.type === 'Fluid') {
    categoryLabel = lang === 'ru' ? 'Рассол / Среда' : 'Brine / Fluid';
  }

  // Convert Temperature dynamically
  const tempLabel = rec.temperature && rec.temperature.max !== null 
    ? convertTemperature(rec.temperature.max, rec.temperature.unit) 
    : '—';
    
  const sourceLabel = `${rec.sources ? rec.sources.join(', ') : rec.source} (${rec.revisionDate || rec.revision || 'N/A'})`;

  return `
    <tr class="border-b border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[11px] cursor-pointer transition-colors ${selectedClass}" data-record-id="${rec.id}">
      <td class="px-4 py-3 font-sans text-zinc-950 dark:text-zinc-50">${typeLabel}</td>
      <td class="px-4 py-3 text-zinc-650 dark:text-zinc-350">${categoryLabel}</td>
      <td class="px-4 py-3 text-zinc-550">${tempLabel}</td>
      <td class="px-4 py-3 text-zinc-400 text-[10px] text-right font-sans">${sourceLabel}</td>
    </tr>
  `;
};

export const table = new BaseTable(headersEn, headersRu, rowRenderer);
export default table;
