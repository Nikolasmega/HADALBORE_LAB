import { store } from '../../core/State.js';
import { i18n } from '../../utils/i18n.js';

export class WellboreFluidsDetails {
  render(rec, lang) {
    if (!rec) return '';

    const { viewMode } = store.getState();
    const isRu = lang === 'ru';

    if (viewMode === 'field') {
      return this.renderFieldCard(rec, isRu);
    } else {
      return this.renderEngineeringCard(rec, isRu);
    }
  }

  renderFieldCard(rec, isRu) {
    const categoryLabels = {
      drilling_mud: isRu ? 'Буровой раствор' : 'Drilling Mud',
      cement_slurry: isRu ? 'Цементный раствор' : 'Cement Slurry',
      spacer: isRu ? 'Буферная жидкость' : 'Spacer',
      additive: isRu ? 'Добавка/Реагент' : 'Additive'
    };

    const densityMin = rec.density?.min_sg || '—';
    const densityMax = rec.density?.max_sg || '—';
    const densityVal = densityMin !== '—' && densityMax !== '—'
      ? `${densityMin} - ${densityMax} SG`
      : (densityMin !== '—' ? `${densityMin} SG` : (densityMax !== '—' ? `${densityMax} SG` : '—'));

    const tempMax = rec.temperature_limit?.max_c !== undefined ? `${rec.temperature_limit.max_c}°C` : '—';
    const advantagesHtml = (rec.advantages || []).map(adv => `<li>✔ ${adv}</li>`).join('');
    const limitationsHtml = (rec.limitations || []).map(lim => `<li>⚠️ ${lim}</li>`).join('');

    return `
      <div class="glassmorphic p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-5 font-sans">
        <!-- Title and Category -->
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white">${rec.name}</h2>
            <span class="inline-block bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide text-zinc-550 dark:text-zinc-400 mt-1">
              ${categoryLabels[rec.category] || rec.category}
            </span>
          </div>
        </div>

        <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">${rec.description}</p>

        <!-- Quick Limits Box -->
        <div class="grid grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-850/30 border border-zinc-150 dark:border-zinc-800 rounded-xl text-center">
          <div>
            <span class="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">${isRu ? 'Плотность' : 'Operating Density'}</span>
            <p class="text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 mt-0.5">${densityVal}</p>
          </div>
          <div>
            <span class="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">${isRu ? 'Т макс.' : 'Temperature Limit'}</span>
            <p class="text-xs font-mono font-bold text-zinc-950 dark:text-zinc-100 mt-0.5">${tempMax}</p>
          </div>
        </div>

        <!-- Warning / Cautions -->
        <div class="space-y-2">
          <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">${isRu ? 'Совместимость на скважине' : 'Wellbore Compatibility'}</h4>
          <div class="p-3 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs text-zinc-700 dark:text-zinc-350 space-y-1.5">
            <p><strong>${isRu ? 'Эластомеры:' : 'Elastomers:'}</strong> ${rec.compatibility?.elastomers || '—'}</p>
            <p><strong>${isRu ? 'Металл:' : 'Steels:'}</strong> ${rec.compatibility?.steels || '—'}</p>
          </div>
        </div>

        <!-- Advantages & Disadvantages -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-150 dark:border-zinc-850">
          <div>
            <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest mb-1.5">${isRu ? 'Преимущества' : 'Key Advantages'}</h4>
            <ul class="text-[10px] text-zinc-550 leading-relaxed space-y-1">${advantagesHtml}</ul>
          </div>
          <div>
            <h4 class="text-[9px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-widest mb-1.5">${isRu ? 'Ограничения' : 'Limitations'}</h4>
            <ul class="text-[10px] text-zinc-550 leading-relaxed space-y-1">${limitationsHtml}</ul>
          </div>
        </div>
      </div>
    `;
  }

  renderEngineeringCard(rec, isRu) {
    const categoryLabels = {
      drilling_mud: isRu ? 'Буровой раствор' : 'Drilling Mud',
      cement_slurry: isRu ? 'Цементный раствор' : 'Cement Slurry',
      spacer: isRu ? 'Буферная жидкость' : 'Spacer',
      additive: isRu ? 'Добавка/Реагент' : 'Additive'
    };

    const densityMin = rec.density?.min_sg || '—';
    const densityMax = rec.density?.max_sg || '—';
    const densityVal = densityMin !== '—' && densityMax !== '—'
      ? `${densityMin} - ${densityMax} SG`
      : (densityMin !== '—' ? `${densityMin} SG` : (densityMax !== '—' ? `${densityMax} SG` : '—'));

    const tempMax = rec.temperature_limit?.max_c !== undefined ? `${rec.temperature_limit.max_c}°C` : '—';
    const standardsHtml = (rec.standards || []).map(std => `<span class="px-2 py-0.5 border border-zinc-200 dark:border-zinc-750/80 rounded bg-zinc-50 dark:bg-zinc-850 font-mono text-[9px]">${std}</span>`).join(' ');
    const sourcesHtml = (rec.sources || []).join(', ') || '—';
    const applicationsHtml = (rec.applications || []).map(app => `<li>• ${app}</li>`).join('');

    return `
      <div class="glassmorphic p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-6 font-sans">
        <!-- Header -->
        <div class="flex justify-between items-start border-b border-zinc-150 dark:border-zinc-850 pb-4">
          <div>
            <h2 class="text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white">${rec.name}</h2>
            <div class="flex gap-2 items-center mt-1.5 flex-wrap">
              <span class="bg-zinc-900 text-white dark:bg-white dark:text-black px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">
                ${categoryLabels[rec.category] || rec.category}
              </span>
              ${standardsHtml}
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1.5">
          <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">${isRu ? 'Обзор' : 'Overview'}</h4>
          <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">${rec.description}</p>
        </div>

        <!-- Technical Parameters Grid -->
        <div class="space-y-2">
          <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">${isRu ? 'Технические характеристики' : 'Technical Data'}</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-850/10 border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl font-mono text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-350">
            <div>
              <span class="text-zinc-400 dark:text-zinc-550 block mb-0.5">${isRu ? 'ПЛОТНОСТЬ:' : 'DENSITY:'}</span>
              <span class="font-bold text-zinc-950 dark:text-zinc-100 text-xs">${densityVal}</span>
            </div>
            <div>
              <span class="text-zinc-400 dark:text-zinc-550 block mb-0.5">${isRu ? 'ТЕМПЕРАТУРА МАКС:' : 'MAX TEMP:'}</span>
              <span class="font-bold text-zinc-950 dark:text-zinc-100 text-xs">${tempMax}</span>
            </div>
            <div>
              <span class="text-zinc-400 dark:text-zinc-550 block mb-0.5">${isRu ? 'РЕОЛОГИЯ (PV / YP):' : 'RHEOLOGY (PV / YP):'}</span>
              <span class="font-bold text-zinc-950 dark:text-zinc-100 text-[11px]">
                ${rec.rheology?.pv_cp !== 'N/A' && rec.rheology?.yp_lb100ft2 !== 'N/A'
                  ? `${rec.rheology.pv_cp} cP / ${rec.rheology.yp_lb100ft2} lb/100ft²`
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        <!-- Chemical Compatibility -->
        <div class="space-y-2">
          <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">${isRu ? 'Химическая совместимость' : 'Chemical Compatibility'}</h4>
          <div class="overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800/60 text-xs">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-zinc-50 dark:bg-zinc-850/40 text-[9px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <th class="px-4 py-2 w-1/3">${isRu ? 'Элемент скважины' : 'Wellbore Component'}</th>
                  <th class="px-4 py-2">${isRu ? 'Совместимость / Риски' : 'Compatibility / Operational Risks'}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 dark:divide-zinc-850/50 text-[11px] leading-relaxed">
                <tr>
                  <td class="px-4 py-2.5 font-semibold text-zinc-850 dark:text-zinc-200">${isRu ? 'Обсадные/Бурильные стали' : 'Casing & Drill Steels'}</td>
                  <td class="px-4 py-2.5 text-zinc-650 dark:text-zinc-350">${rec.compatibility?.steels || '—'}</td>
                </tr>
                <tr>
                  <td class="px-4 py-2.5 font-semibold text-zinc-850 dark:text-zinc-200">${isRu ? 'Эластомеры и Пакеры' : 'Elastomers & Packers'}</td>
                  <td class="px-4 py-2.5 text-zinc-650 dark:text-zinc-350">${rec.compatibility?.elastomers || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Applications -->
        <div class="space-y-2">
          <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">${isRu ? 'Области применения' : 'Applications'}</h4>
          <ul class="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed space-y-1 list-none pl-1">${applicationsHtml}</ul>
        </div>

        <!-- Sources -->
        <div class="pt-4 border-t border-zinc-150 dark:border-zinc-850 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex gap-2">
          <span>${isRu ? 'ИСТОЧНИКИ:' : 'SOURCES:'}</span>
          <span class="text-zinc-600 dark:text-zinc-400">${sourcesHtml}</span>
        </div>
      </div>
    `;
  }
}

export const details = new WellboreFluidsDetails();
export default details;
