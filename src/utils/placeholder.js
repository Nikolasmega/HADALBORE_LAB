/**
 * Centralized utility to get localized and color-coded HTML placeholders.
 * Returns HTML strings designed for inclusion in dynamic markup templates.
 * 
 * @param {string} category - Placeholder type ('na' | 'validation' | 'incomplete' | 'no_data' | 'verification' | 'error' | 'loading')
 * @param {string} [lang] - Active language ('en' | 'ru')
 * @returns {string} - Styled HTML template string
 */
export function getPlaceholder(category, lang = 'en') {
  const isRu = lang === 'ru';
  switch (category) {
    case 'na':
      return `<span class="text-zinc-400 dark:text-zinc-500 font-medium select-none">${isRu ? 'Не применимо' : 'Not applicable'}</span>`;
    
    case 'validation':
      return `<span class="text-amber-600 dark:text-amber-400 font-semibold select-none">${isRu ? 'На инженерной верификации' : 'Under engineering validation'}</span>`;
    
    case 'incomplete':
      return `<span class="text-zinc-455 dark:text-zinc-500 select-none">${isRu ? 'Неполные данные' : 'Incomplete data'}</span>`;
    
    case 'no_data':
    case 'unavailable':
      return `<span class="text-zinc-400 dark:text-zinc-500 select-none">${isRu ? 'Данные отсутствуют' : 'Data currently unavailable'}</span>`;
    
    case 'verification':
      return `<span class="text-amber-600 dark:text-amber-400 font-semibold select-none">${isRu ? 'Требуется проверка' : 'Requires engineering verification'}</span>`;
    
    case 'loading':
    case 'error':
      return `<span class="text-rose-600 dark:text-rose-400 font-bold select-none">${isRu ? 'Ошибка данных' : 'Data error'}</span>`;
    
    default:
      return `<span class="text-zinc-400 dark:text-zinc-500 select-none">${isRu ? 'Не применимо' : 'Not applicable'}</span>`;
  }
}

export default getPlaceholder;
