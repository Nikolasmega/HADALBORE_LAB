import { store } from '../../core/State.js';
import { i18n } from '../../utils/i18n.js';

/**
 * Custom rich details panel for the Standards module.
 * Renders a comprehensive standards information card with:
 * - Full standard scope description
 * - API / ISO / GOST / GB-T cross-reference matrix
 * - Equipment applicability tags
 * - Revision history
 * - Field certification status
 */
class StandardsDetails {
  render(rec, lang, moduleType) {
    if (!rec) return '';
    const isRu = lang === 'ru';
    const { viewMode } = store.getState();

    const name = isRu
      ? (rec.name_ru || this._translateName(rec.name, true))
      : rec.name;

    const scope = isRu
      ? (rec.scope_ru || rec.scope || '—')
      : (rec.scope || '—');

    const description = isRu
      ? (rec.description_ru || rec.description || scope)
      : (rec.description || scope);

    // Standards cross-reference
    const apiRef = rec.api || (rec.standards && rec.standards.find(s => s.startsWith('API'))) || '—';
    const isoRef = rec.iso || (rec.standards && rec.standards.find(s => s.startsWith('ISO'))) || '—';
    const gostRef = rec.gost || (rec.standards && rec.standards.find(s => s.startsWith('GOST') || s.startsWith('ГОСТ'))) || '—';
    const gbtRef = rec.gbt || (rec.standards && rec.standards.find(s => s.startsWith('GB/T') || s.startsWith('GBT'))) || '—';
    const naceRef = rec.nace || (rec.standards && rec.standards.find(s => s.startsWith('NACE'))) || '—';

    // All standards list for display
    const allStandards = rec.standards && rec.standards.length > 0 ? rec.standards : [];

    // Equipment applicability
    const equipment = rec.used_in_equipment || rec.usedInEquipment || rec.equipment_list || [];
    const equipArr = Array.isArray(equipment) ? equipment : (equipment ? [equipment] : []);

    // Revision info
    const revDate = rec.revisionDate || rec.revision_date || rec.revision || '—';
    const source = rec.sources
      ? (Array.isArray(rec.sources) ? rec.sources.join(', ') : rec.sources)
      : (rec.source || '—');

    // Certification / applicability badges
    const certBadges = this._buildCertBadges(rec, isRu);

    // Equipment tags
    const equipTags = equipArr.length > 0
      ? equipArr.map(e => `
          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700">
            ${e}
          </span>
        `).join('')
      : `<span class="text-zinc-500 dark:text-zinc-500 text-[9px]">${isRu ? 'Данные не указаны' : 'Not specified'}</span>`;

    // Standards cross-ref rows
    const crossRefRows = [
      { label: 'API', value: apiRef, color: apiRef !== '—' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 dark:text-zinc-600' },
      { label: 'ISO', value: isoRef, color: isoRef !== '—' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-600' },
      { label: 'GOST / ГОСТ', value: gostRef, color: gostRef !== '—' ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-600' },
      { label: 'GB/T (China)', value: gbtRef, color: gbtRef !== '—' ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-400 dark:text-zinc-600' },
      { label: 'NACE / MR', value: naceRef, color: naceRef !== '—' ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-400 dark:text-zinc-600' },
    ].map(row => `
      <div class="flex justify-between items-center border-b border-zinc-50 dark:border-zinc-850/40 py-1.5 gap-3 last:border-0">
        <span class="text-[8px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 whitespace-nowrap">${row.label}</span>
        <span class="font-mono text-[10px] font-semibold text-right ${row.color}">${row.value}</span>
      </div>
    `).join('');

    // All standards list
    const stdsList = allStandards.length > 0
      ? allStandards.map(s => `
          <div class="flex items-center gap-2">
            <span class="w-1 h-1 rounded-full bg-zinc-400 shrink-0"></span>
            <span class="font-mono text-[10px] text-zinc-800 dark:text-zinc-200">${s}</span>
          </div>
        `).join('')
      : `<span class="text-zinc-400 text-[10px]">—</span>`;

    // Scope detail box
    const scopeText = isRu
      ? this._buildScopeText(rec, true)
      : this._buildScopeText(rec, false);

    return `
      <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden font-sans text-xs">
        
        <!-- Header -->
        <div class="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">
                ${isRu ? 'Промышленный стандарт' : 'Industry Standard Reference'}
              </span>
              <h3 class="text-sm font-extrabold text-zinc-900 dark:text-white leading-tight">${name}</h3>
            </div>
            <div class="flex flex-wrap gap-1 shrink-0">${certBadges}</div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800">

          <!-- Left: Cross-Reference Matrix -->
          <div class="p-4 space-y-3">
            <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
              ${isRu ? 'Матрица эквивалентов' : 'Cross-Reference Matrix'}
            </span>
            <div class="space-y-0">${crossRefRows}</div>
          </div>

          <!-- Middle: Scope & Description -->
          <div class="p-4 space-y-3 lg:col-span-1">
            <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
              ${isRu ? 'Область применения' : 'Standard Scope'}
            </span>
            <p class="text-[10.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed">${scopeText}</p>
            
            ${allStandards.length > 0 ? `
              <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
                <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">
                  ${isRu ? 'Все документы стандарта' : 'All Referenced Documents'}
                </span>
                <div class="space-y-1">${stdsList}</div>
              </div>
            ` : ''}
          </div>

          <!-- Right: Equipment & Meta -->
          <div class="p-4 space-y-3">
            <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
              ${isRu ? 'Применяемое оборудование' : 'Equipment Applicability'}
            </span>
            <div class="flex flex-wrap gap-1.5">${equipTags}</div>

            <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2 text-[10px]">
              <div class="flex justify-between gap-2">
                <span class="text-zinc-400 dark:text-zinc-550 font-medium">${isRu ? 'Ревизия:' : 'Revision:'}</span>
                <span class="font-mono font-semibold text-zinc-800 dark:text-zinc-200 text-right">${revDate}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-zinc-400 dark:text-zinc-550 font-medium">${isRu ? 'Первоисточник:' : 'Source:'}</span>
                <span class="font-semibold text-zinc-700 dark:text-zinc-300 text-right text-[9px]">${source}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Engineering Note Footer -->
        <div class="px-4 py-3 bg-amber-50/50 dark:bg-amber-950/10 border-t border-amber-200/30 dark:border-amber-900/20">
          <p class="text-[9px] text-amber-700 dark:text-amber-400 leading-relaxed">
            <span class="font-bold uppercase tracking-wider">${isRu ? 'Инженерное примечание: ' : 'Engineering Note: '}</span>
            ${isRu
              ? 'Всегда проверяйте актуальную редакцию стандарта у органа сертификации. Данные приведены в справочных целях и не заменяют официальные документы API / ISO / ГОСТ.'
              : 'Always verify the latest active edition with the issuing body. This reference data does not replace official API/ISO/GOST documentation for engineering decisions.'}
          </p>
        </div>
      </div>
    `;
  }

  _translateName(name, isRu) {
    if (!name || !isRu) return name;
    const map = {
      'Casing & Tubing Standards': 'Стандарты обсадных и НКТ труб',
      'Drill Pipe Standards': 'Стандарты бурильных труб',
      'Thread Gauge Standards': 'Стандарты калибров резьб',
      'Elastomer Standards': 'Стандарты эластомеров',
      'Steel Grade Standards': 'Стандарты марок сталей',
      'Corrosion Standards': 'Стандарты коррозии',
    };
    for (const [en, ru] of Object.entries(map)) {
      if (name.includes(en.split(' ')[0])) return map[en] || name;
    }
    return name;
  }

  _buildScopeText(rec, isRu) {
    if (isRu && rec.scope_ru) return rec.scope_ru;
    if (!isRu && rec.scope) return rec.scope;
    const name = (rec.name || '').toLowerCase();
    if (name.includes('casing') || name.includes('tubing')) {
      return isRu
        ? 'Регламентирует размерный ряд, требования к прочности, методы испытаний и маркировки обсадных и НКТ труб. Включает группы прочности J55, K55, N80, L80, C90, T95, P110. Обязателен для производства и применения в нефтегазовой отрасли.'
        : 'Covers dimensional tolerances, strength requirements, testing methods and marking of casing and tubing products. Includes steel grades J55 through P110. Mandatory for oil and gas well construction and completion globally.';
    }
    if (name.includes('drill pipe')) {
      return isRu
        ? 'Определяет конструктивные требования, методы контроля качества и допуски для бурильных труб и замковых соединений. Охватывает группы прочности E, X, G, S и типы замков NC, FH, IF.'
        : 'Defines design requirements, quality inspection criteria and dimensional tolerances for drill pipe and tool joints. Covers grades E, X, G, S and NC, FH, IF connection types.';
    }
    if (name.includes('thread') || name.includes('gauge')) {
      return isRu
        ? 'Устанавливает параметры, допуски и методы измерения резьбовых соединений нефтяного сортамента. Охватывает API-резьбы: NUE, EUE, LTC, BTC, а также методику калибровки.'
        : 'Specifies thread form, tolerances and gauging practice for API pipe thread connections. Covers NUE, EUE, LTC, BTC thread forms and includes calibration methodology.';
    }
    return isRu
      ? (rec.description || rec.scope || 'Международный промышленный стандарт нефтегазовой отрасли.')
      : (rec.description || rec.scope || 'International oilfield industry standard.');
  }

  _buildCertBadges(rec, isRu) {
    const badges = [];
    const name = (rec.name || '').toLowerCase();
    const stds = (rec.standards || []).join(' ').toUpperCase();

    if (stds.includes('API') || rec.api) {
      badges.push(`<span class="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/40 dark:border-blue-900/30">API</span>`);
    }
    if (stds.includes('ISO')) {
      badges.push(`<span class="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-900/30">ISO</span>`);
    }
    if (stds.includes('GOST') || stds.includes('ГОСТ') || rec.gost) {
      badges.push(`<span class="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/40 dark:border-amber-900/30">ГОСТ</span>`);
    }
    if (stds.includes('NACE')) {
      badges.push(`<span class="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/40 dark:border-purple-900/30">NACE</span>`);
    }
    if (name.includes('sour') || stds.includes('MR0175')) {
      badges.push(`<span class="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/40 dark:border-rose-900/30">${isRu ? 'КИСЛЫЕ СРЕДЫ' : 'SOUR SVC'}</span>`);
    }
    return badges.join('');
  }
}

export const details = new StandardsDetails();
export default details;
