import { BaseTable } from '../ModuleFactory.js';

const HEADERS_EN = ['Name', 'Category', 'Density SG', 'Max Temp'];
const HEADERS_RU = ['Наименование', 'Категория', 'Плотность (г/см³)', 'T макс. (°C)'];

const CATEGORY_NAMES = {
  en: {
    drilling_mud: 'Drilling Mud',
    cement_slurry: 'Cement Slurry',
    spacer: 'Spacer',
    additive: 'Additive'
  },
  ru: {
    drilling_mud: 'Буровой раствор',
    cement_slurry: 'Цементный раствор',
    spacer: 'Буферная жидкость',
    additive: 'Добавка/Реагент'
  }
};

const rowRenderer = (rec, isActive, lang) => {
  const activeClass = isActive
    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold'
    : 'hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300';
  
  const categoryLabel = CATEGORY_NAMES[lang][rec.category] || rec.category;
  
  const densityMin = rec.density?.min_sg || '—';
  const densityMax = rec.density?.max_sg || '—';
  const densityVal = densityMin !== '—' && densityMax !== '—' 
    ? `${densityMin} - ${densityMax}` 
    : (densityMin !== '—' ? densityMin : (densityMax !== '—' ? densityMax : '—'));
    
  const tempMax = rec.temperature_limit?.max_c !== undefined ? `${rec.temperature_limit.max_c}°C` : '—';

  return `
    <tr class="h-9 cursor-pointer transition-all border-b border-zinc-100 dark:border-zinc-800/50 text-xs font-sans ${activeClass}" data-record-id="${rec.id}">
      <td class="px-4 py-2 font-medium truncate max-w-[220px]">${rec.name}</td>
      <td class="px-4 py-2 opacity-85 select-none">${categoryLabel}</td>
      <td class="px-4 py-2 font-mono font-medium">${densityVal}</td>
      <td class="px-4 py-2 font-mono">${tempMax}</td>
    </tr>
  `;
};

export const table = new BaseTable(HEADERS_EN, HEADERS_RU, rowRenderer);
export default table;
