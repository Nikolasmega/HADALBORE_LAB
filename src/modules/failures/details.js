/**
 * HADALBORE_LAB — Failures Details Panel
 * Renders comprehensive failure mode analysis for the Failures Encyclopedia.
 */

export class FailuresDetails {
  render(rec, lang) {
    if (!rec) return '';
    const isRu = lang === 'ru';

    const t = (en, ru) => isRu ? ru : en;
    const val = (v) => (v && v !== '—' && v !== 'undefined') ? v : null;

    // Helper: render a list of strings as bullet items
    const bulletList = (items) => {
      if (!items) return `<li class="text-zinc-400 italic">${t('No data', 'Нет данных')}</li>`;
      const arr = Array.isArray(items)
        ? items
        : (typeof items === 'string' ? items.split(',').map(i => i.trim()).filter(Boolean) : []);
      if (!arr.length) return `<li class="text-zinc-400 italic">${t('No data', 'Нет данных')}</li>`;
      return arr.map(item => `
        <li class="flex items-start gap-2">
          <span class="text-amber-500 mt-0.5 shrink-0">▸</span>
          <span>${item}</span>
        </li>`).join('');
    };

    // Helper: section block
    const section = (icon, titleEn, titleRu, content) => `
      <div class="space-y-2">
        <h4 class="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
          <span>${icon}</span>
          <span>${isRu ? titleRu : titleEn}</span>
        </h4>
        ${content}
      </div>`;

    // Severity badge
    const severityColors = {
      'Critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'High': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Moderate': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Low': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    };
    const severityKey = rec.severity || 'High';
    const severityClass = severityColors[severityKey] || severityColors['High'];
    const severityLabel = isRu
      ? ({ Critical: 'Критический', High: 'Высокий', Moderate: 'Средний', Low: 'Низкий' }[severityKey] || severityKey)
      : severityKey;

    // Standards
    const standards = rec.standards && rec.standards.length
      ? rec.standards.map(s => `<span class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-[8px] font-mono font-semibold">${s}</span>`).join(' ')
      : `<span class="text-zinc-400 italic text-[10px]">${t('No standards listed', 'Стандарты не указаны')}</span>`;

    // Typical metallurgy chips
    const metallurgy = rec.typical_metallurgy
      ? rec.typical_metallurgy.split(',').map(m => m.trim()).filter(Boolean).map(m =>
          `<span class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[9px] font-mono text-zinc-700 dark:text-zinc-300">${m}</span>`
        ).join(' ')
      : `<span class="text-zinc-400 italic text-[10px]">${t('Not specified', 'Не указано')}</span>`;

    return `
      <div class="space-y-5 text-xs font-sans">

        <!-- Header: name + severity -->
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-sm font-extrabold text-zinc-900 dark:text-white leading-tight">${rec.name || '—'}</h3>
            ${rec.description ? `<p class="mt-1.5 text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">${rec.description}</p>` : ''}
          </div>
          <div class="flex flex-col items-end gap-1.5 shrink-0">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${severityClass}">
              ${severityLabel}
            </span>
            <span class="text-[8px] font-mono text-zinc-400 dark:text-zinc-500">${rec.id || ''}</span>
          </div>
        </div>

        <!-- Standards -->
        <div class="flex flex-wrap gap-1.5 pt-0.5">
          ${standards}
        </div>

        <!-- Trigger Environments -->
        ${section('⚠️', 'Trigger Environments', 'Провоцирующие условия',
          rec.trigger_environments
            ? `<p class="text-zinc-700 dark:text-zinc-300 leading-relaxed">${rec.trigger_environments}</p>`
            : `<p class="text-zinc-400 italic">${t('No data', 'Нет данных')}</p>`
        )}

        <!-- Symptoms -->
        ${section('🔍', 'Field Symptoms', 'Признаки и симптомы',
          `<ul class="space-y-1.5 text-zinc-700 dark:text-zinc-300 leading-relaxed">${bulletList(rec.symptoms)}</ul>`
        )}

        <!-- Root Causes -->
        ${section('🔬', 'Root Causes', 'Корневые причины',
          `<ul class="space-y-1.5 text-zinc-700 dark:text-zinc-300 leading-relaxed">${bulletList(rec.root_causes)}</ul>`
        )}

        <!-- Vulnerable Metallurgy -->
        ${section('⚙️', 'Susceptible Metallurgy', 'Уязвимые материалы',
          `<div class="flex flex-wrap gap-1.5">${metallurgy}</div>`
        )}

        <!-- Prevention -->
        ${section('🛡️', 'Prevention Methods', 'Методы предотвращения',
          `<ul class="space-y-1.5 text-zinc-700 dark:text-zinc-300 leading-relaxed">${bulletList(rec.prevention_methods)}</ul>`
        )}

        <!-- Field Troubleshooting -->
        ${rec.field_troubleshooting ? section('🔧', 'Field Troubleshooting', 'Полевое устранение',
          `<div class="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/40 rounded-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">${rec.field_troubleshooting}</div>`
        ) : ''}

        <!-- Additional Engineering Data -->
        <div class="grid grid-cols-2 gap-3 pt-1">
          ${rec.chemicalCompatibility && rec.chemicalCompatibility.length ? `
            <div class="bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800 rounded-lg p-3 col-span-2">
              <span class="block text-[8px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">${t('Associated Environments', 'Связанные среды')}</span>
              <div class="flex flex-wrap gap-1.5">
                ${rec.chemicalCompatibility.map(c => `<span class="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/40 rounded text-[9px] text-red-700 dark:text-red-400">${c}</span>`).join('')}
              </div>
            </div>` : ''}

          ${rec.typical_applications && rec.typical_applications.length ? `
            <div class="bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/60 dark:border-zinc-800 rounded-lg p-3 col-span-2">
              <span class="block text-[8px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">${t('Affected Equipment', 'Типичное оборудование')}</span>
              <div class="flex flex-wrap gap-1.5">
                ${rec.typical_applications.map(a => `<span class="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[9px] text-zinc-600 dark:text-zinc-400">${a}</span>`).join('')}
              </div>
            </div>` : ''}
        </div>

        <!-- Source -->
        <div class="pt-1 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-600 font-mono">
          <span>${t('Source', 'Источник')}: ${rec.sources ? rec.sources.join(', ') : '—'}</span>
          <span>${t('Updated', 'Обновлено')}: ${rec.lastUpdated || rec.revisionDate || 'N/A'}</span>
        </div>
      </div>
    `;
  }
}

export const details = new FailuresDetails();
export default details;
