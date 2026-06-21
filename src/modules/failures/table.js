import { BaseTable } from '../ModuleFactory.js';

const headersEn = ['Failure Mode', 'Trigger Environment', 'Affected Metallurgy', 'Source Standard'];
const headersRu = ['Вид отказа', 'Факторы среды', 'Уязвимые материалы', 'Первоисточник'];

const rowRenderer = (rec, isSelected, lang) => {
  const selectedClass = isSelected 
    ? 'bg-zinc-150 dark:bg-zinc-800/80 font-semibold' 
    : 'hover:bg-zinc-100/30 dark:hover:bg-zinc-850/10';

  const nameLabel = rec.name;
  const triggerLabel = rec.trigger_environments || '—';
  const metallurgyLabel = rec.typical_metallurgy || '—';
  const sourceLabel = `${rec.sources ? rec.sources.join(', ') : '—'} (${rec.revisionDate || 'N/A'})`;

  return `
    <tr class="border-b border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[11px] cursor-pointer transition-colors ${selectedClass}" data-record-id="${rec.id}">
      <td class="px-4 py-3 font-sans text-zinc-950 dark:text-zinc-50 font-bold">${nameLabel}</td>
      <td class="px-4 py-3 text-zinc-650 dark:text-zinc-350 font-sans">${triggerLabel}</td>
      <td class="px-4 py-3 text-zinc-550 dark:text-zinc-400 font-sans">${metallurgyLabel}</td>
      <td class="px-4 py-3 text-zinc-400 text-[10px] text-right font-sans">${sourceLabel}</td>
    </tr>
  `;
};

export const table = new BaseTable(headersEn, headersRu, rowRenderer);
export default table;
