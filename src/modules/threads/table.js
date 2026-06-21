import { BaseTable } from '../ModuleFactory.js';
import { convertTorqueText } from '../../utils/units.js';

const headersEn = ['Commercial Name', 'Connection Type', 'Torque Range', 'Seal Type', 'Source'];
const headersRu = ['Название соединения', 'Тип резьбы', 'Диапазон моментов', 'Тип уплотнения', 'Первоисточник'];

const rowRenderer = (rec, isSelected, lang) => {
  const selectedClass = isSelected
    ? 'bg-zinc-150 dark:bg-zinc-800/80 font-semibold'
    : 'hover:bg-zinc-100/30 dark:hover:bg-zinc-850/10';

  // Commercial/trade name — always the primary identifier
  const nameLabel = rec.name || '—';

  // Connection type classification (separate from commercial name)
  const typeLabel = lang === 'ru'
    ? (rec.connection_type_ru || rec.connection_type || '—')
    : (rec.connection_type || '—');

  const torqueLabel = rec.torque_range ? convertTorqueText(rec.torque_range) : '—';

  const sealLabel = lang === 'ru'
    ? (rec.seal_type_ru || rec.seal_type || '—')
    : (rec.seal_type || '—');

  const sourceLabel = `${rec.sources ? rec.sources.join(', ') : rec.source || '—'} (${rec.revisionDate || rec.revision || 'N/A'})`;

  return `
    <tr class="border-b border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[11px] cursor-pointer transition-colors ${selectedClass}" data-record-id="${rec.id}">
      <td class="px-4 py-3 font-sans font-semibold text-zinc-950 dark:text-zinc-50">${nameLabel}</td>
      <td class="px-4 py-3 text-zinc-650 dark:text-zinc-350">${typeLabel}</td>
      <td class="px-4 py-3 text-zinc-550">${torqueLabel}</td>
      <td class="px-4 py-3 text-zinc-550">${sealLabel}</td>
      <td class="px-4 py-3 text-zinc-400 text-[10px] text-right font-sans">${sourceLabel}</td>
    </tr>
  `;
};

export const table = new BaseTable(headersEn, headersRu, rowRenderer);
export default table;
