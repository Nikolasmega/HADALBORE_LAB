import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';
import { convertTemperature, convertPressure, convertDimension, convertWeight, convertTensile, convertTorqueText } from '../utils/units.js';
import { getPlaceholder } from '../utils/placeholder.js';
import { mockDb } from '../database/mockDb.js';

export class CompatibilitySection {
  static getCompatibilityBadge(rec, moduleType, lang) {
    const isRu = lang === 'ru';
    let h2sText = rec.h2s_compatibility || rec.sour_service_suitability || rec.h2s_resistance || '';
    let co2Text = rec.co2_compatibility || rec.co2_resistance || '';
    let rgdText = rec.rgd_resistance || '';

    // If we don't have direct fields, check if description or other text has clues
    if (moduleType === 'tubulars') {
      const grade = (rec.grade || '').toUpperCase();
      if (grade === 'L80' || grade === 'C90' || grade === 'T95' || grade === 'C110') {
        h2sText = isRu ? 'Подходит' : 'Suitable';
      } else if (grade === 'J55' || grade === 'K55') {
        h2sText = isRu ? 'Ограничено' : 'Limited';
      } else {
        h2sText = isRu ? 'Не подходит' : 'Not suitable';
      }
      co2Text = isRu ? 'Ограничено' : 'Limited';
    }

    // Parse status
    const parseStatus = (text) => {
      if (!text) return null;
      const t = text.toLowerCase();
      if (t.includes('immune') || t.includes('outstanding') || t.includes('exceptional') || t.includes('excellent') || t.includes('suitable') || t.includes('yes') || t.includes('resistant') || t.includes('high') || t.includes('подходит') || t.includes('отличн') || t.includes('высок')) {
        if (t.includes('not suitable') || t.includes('poor') || t.includes('not resistant') || t.includes('не подходит')) {
          return 'red';
        }
        if (t.includes('limited') || t.includes('mild') || t.includes('ограничен')) {
          return 'yellow';
        }
        return 'green';
      }
      if (t.includes('poor') || t.includes('not suitable') || t.includes('no resistance') || t.includes('forbidden') || t.includes('susceptible') || t.includes('hazard') || t.includes('not resistant') || t.includes('не подходит') || t.includes('плох') || t.includes('запрещ')) {
        return 'red';
      }
      if (t.includes('moderate') || t.includes('intermediate') || t.includes('limited') || t.includes('mild') || t.includes('marginal') || t.includes('trace') || t.includes('up to') || t.includes('ограничен') || t.includes('умерен')) {
        return 'yellow';
      }
      return null;
    };

    const h2sStatus = parseStatus(h2sText);
    const co2Status = parseStatus(co2Text);
    const rgdStatus = parseStatus(rgdText);

    let badges = '';

    const getBadgeHtml = (label, status, fullText) => {
      let colorClass = 'bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-750';
      if (status === 'green') colorClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/45 dark:border-emerald-900/30';
      if (status === 'yellow') colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/45 dark:border-amber-900/30';
      if (status === 'red') colorClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455 border border-rose-200/45 dark:border-rose-900/30';
      
      return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${colorClass}" title="${fullText}">${label}</span>`;
    };

    if (h2sStatus) badges += getBadgeHtml('H₂S', h2sStatus, h2sText);
    if (co2Status) badges += getBadgeHtml('CO₂', co2Status, co2Text);
    if (rgdStatus) badges += getBadgeHtml('RGD', rgdStatus, rgdText);

    return badges ? `<div class="flex flex-wrap gap-1 mt-1">${badges}</div>` : '';
  }

  static renderTubularCompatibility(rec, lang) {
    const isRu = lang === 'ru';
    const grade = (rec.grade || '').toUpperCase();
    const isSourGrade = ['L80', 'C90', 'T95', 'C110'].includes(grade);
    const isJ55 = ['J55', 'K55'].includes(grade);

    const h2sStatus = isSourGrade ? 'green' : (isJ55 ? 'yellow' : 'red');
    const h2sComp = isSourGrade ? (isRu ? 'Подходит' : 'Suitable') : (isJ55 ? (isRu ? 'Ограничено' : 'Limited') : (isRu ? 'Не подходит' : 'Not suitable'));
    const h2sRisk = isSourGrade ? (isRu ? 'Низкий' : 'Low') : (isRu ? 'Высокий (РКН)' : 'High (SSC)');
    const h2sNotes = isSourGrade ? (isRu ? 'Соответствует NACE MR0175' : 'NACE MR0175 compliant') : (isRu ? 'Риск растрескивания мокрого H₂S' : 'High susceptibility to sulfide stress cracking');

    const co2Status = 'yellow';
    const co2Comp = isRu ? 'Ограничено' : 'Limited';
    const co2Risk = isRu ? 'Умеренный (Питтинг)' : 'Moderate (Pitting)';
    const co2Notes = isRu ? 'Требуется ингибитор коррозии' : 'Requires corrosion inhibitors';

    const clStatus = 'green';
    const clComp = isRu ? 'Подходит' : 'Suitable';
    const clRisk = isRu ? 'Низкий' : 'Low';
    const clNotes = isRu ? 'Глубина язв под нагрузкой >60°C' : 'Chloride cracking risk increases above 60°C';

    const acidStatus = 'yellow';
    const acidComp = isRu ? 'Ограничено' : 'Limited';
    const acidRisk = isRu ? 'Высокий (Коррозия)' : 'High (Uniform corrosion)';
    const acidNotes = isRu ? 'Только кратковременный контакт при обработках' : 'Short exposure only during acidizing jobs';

    const brinesStatus = 'green';
    const brinesComp = isRu ? 'Подходит' : 'Suitable';
    const brinesRisk = isRu ? 'Низкий' : 'Low';
    const brinesNotes = isRu ? 'Контроль кислорода для предупреждения питтинга' : 'Monitor oxygen content to prevent pitting';

    const complStatus = 'green';
    const complComp = isRu ? 'Подходит' : 'Suitable';
    const complRisk = isRu ? 'Низкий' : 'Low';
    const complNotes = isRu ? 'Совместим со всеми жидкостями заканчивания' : 'Compatible with standard packer fluids';

    const getBadge = (status, text) => {
      let cls = 'text-zinc-500 dark:text-zinc-400';
      if (status === 'green') cls = 'text-emerald-600 dark:text-emerald-450 font-bold';
      if (status === 'yellow') cls = 'text-amber-600 dark:text-amber-450 font-bold';
      if (status === 'red') cls = 'text-rose-600 dark:text-rose-450 font-bold';
      return `<span class="${cls}">${text}</span>`;
    };

    return `
      <div class="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 select-none">
        <table class="w-full text-[10px] text-left border-collapse font-sans min-w-[500px]">
          <thead>
            <tr class="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-[8.5px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">
              <th class="px-3 py-2">${isRu ? 'Среда' : 'Fluid'}</th>
              <th class="px-3 py-2">${isRu ? 'Совместимость' : 'Compatibility'}</th>
              <th class="px-3 py-2">${isRu ? 'Риск' : 'Risk'}</th>
              <th class="px-3 py-2">${isRu ? 'Примечание' : 'Notes'}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-800 dark:text-zinc-200">
            <tr>
              <td class="px-3 py-1.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">${isRu ? 'H₂S (Кислый)' : 'H₂S (Sour)'}</td>
              <td class="px-3 py-1.5">${getBadge(h2sStatus, h2sComp)}</td>
              <td class="px-3 py-1.5 text-zinc-700 dark:text-zinc-350">${h2sRisk}</td>
              <td class="px-3 py-1.5 text-zinc-500 dark:text-zinc-400">${h2sNotes}</td>
            </tr>
            <tr>
              <td class="px-3 py-1.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">${isRu ? 'CO₂ (Слабокислый)' : 'CO₂ (Sweet)'}</td>
              <td class="px-3 py-1.5">${getBadge(co2Status, co2Comp)}</td>
              <td class="px-3 py-1.5 text-zinc-700 dark:text-zinc-350">${co2Risk}</td>
              <td class="px-3 py-1.5 text-zinc-500 dark:text-zinc-400">${co2Notes}</td>
            </tr>
            <tr>
              <td class="px-3 py-1.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">${isRu ? 'Хлориды' : 'Chlorides'}</td>
              <td class="px-3 py-1.5">${getBadge(clStatus, clComp)}</td>
              <td class="px-3 py-1.5 text-zinc-700 dark:text-zinc-350">${clRisk}</td>
              <td class="px-3 py-1.5 text-zinc-500 dark:text-zinc-400">${clNotes}</td>
            </tr>
            <tr>
              <td class="px-3 py-1.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">${isRu ? 'Кислоты HCl/HF' : 'HCl/HF Acids'}</td>
              <td class="px-3 py-1.5">${getBadge(acidStatus, acidComp)}</td>
              <td class="px-3 py-1.5 text-zinc-700 dark:text-zinc-350">${acidRisk}</td>
              <td class="px-3 py-1.5 text-zinc-500 dark:text-zinc-400">${acidNotes}</td>
            </tr>
            <tr>
              <td class="px-3 py-1.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">${isRu ? 'Солевые растворы' : 'Brines'}</td>
              <td class="px-3 py-1.5">${getBadge(brinesStatus, brinesComp)}</td>
              <td class="px-3 py-1.5 text-zinc-700 dark:text-zinc-350">${brinesRisk}</td>
              <td class="px-3 py-1.5 text-zinc-500 dark:text-zinc-400">${brinesNotes}</td>
            </tr>
            <tr>
              <td class="px-3 py-1.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">${isRu ? 'Жидкости заканчивания' : 'Completion Fluids'}</td>
              <td class="px-3 py-1.5">${getBadge(complStatus, complComp)}</td>
              <td class="px-3 py-1.5 text-zinc-700 dark:text-zinc-350">${complRisk}</td>
              <td class="px-3 py-1.5 text-zinc-500 dark:text-zinc-400">${complNotes}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  static renderElastomerCompatibility(rec, lang) {
    const isRu = lang === 'ru';
    
    const elastomersList = [
      { name: 'NBR (Nitrile)', temp: '-30°C / 100°C', chem: isRu ? 'Умеренная' : 'Moderate', h2s: isRu ? 'Не рекомендуется' : 'Poor (H2S degradation)' },
      { name: 'HNBR', temp: '-30°C / 150°C', chem: isRu ? 'Высокая' : 'High', h2s: isRu ? 'Подходит' : 'Suitable (NACE compliant)' },
      { name: 'FKM / Viton', temp: '-20°C / 200°C', chem: isRu ? 'Очень высокая' : 'Very High', h2s: isRu ? 'Ограничено' : 'Limited (Amine attack risk)' },
      { name: 'FFKM / Kalrez', temp: '-15°C / 310°C', chem: isRu ? 'Максимальная' : 'Outstanding', h2s: isRu ? 'Отличная' : 'Excellent (Universal)' },
      { name: 'AFLAS', temp: '0°C / 200°C', chem: isRu ? 'Очень высокая' : 'Very High', h2s: isRu ? 'Отличная' : 'Excellent (Amine/Base resistant)' },
      { name: 'EPDM', temp: '-45°C / 150°C', chem: isRu ? 'Умеренная (Не для нефти)' : 'Moderate (Non-oil only)', h2s: isRu ? 'Подходит (Для воды/пара)' : 'Suitable (Water/steam only)' },
      { name: 'PTFE (Teflon)', temp: '-200°C / 260°C', chem: isRu ? 'Максимальная' : 'Universal', h2s: isRu ? 'Отличная' : 'Excellent (Universal)' },
      { name: 'PEEK', temp: '-70°C / 260°C', chem: isRu ? 'Максимальная' : 'Universal', h2s: isRu ? 'Отличная' : 'Excellent (Universal)' },
      { name: 'XNBR', temp: '-30°C / 110°C', chem: isRu ? 'Умеренная' : 'Moderate', h2s: isRu ? 'Не рекомендуется' : 'Poor' },
      { name: 'PU (Polyurethane)', temp: '-40°C / 80°C', chem: isRu ? 'Низкая (Гидролиз)' : 'Low (Hydrolysis risk)', h2s: isRu ? 'Не рекомендуется' : 'Poor' }
    ];

    const rows = elastomersList.map(e => {
      const isCurrent = (rec.name || '').toLowerCase().includes(e.name.split(' ')[0].toLowerCase());
      const rowClass = isCurrent ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-955 dark:text-white' : '';
      return `
        <tr class="${rowClass} border-b border-zinc-100 dark:border-zinc-850 hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10">
          <td class="px-3 py-1.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">${e.name}</td>
          <td class="px-3 py-1.5 font-mono text-[9px] text-zinc-700 dark:text-zinc-300">${e.temp}</td>
          <td class="px-3 py-1.5 text-zinc-700 dark:text-zinc-300">${e.chem}</td>
          <td class="px-3 py-1.5 text-zinc-600 dark:text-zinc-400">${e.h2s}</td>
        </tr>
      `;
    }).join('');

    const explanation = isRu
      ? 'Данная матрица отражает температурные лимиты в зависимости от химической стойкости уплотнений НКТ. FFKM и PTFE имеют универсальную стойкость; EPDM строго ограничен не-углеводородными средами.'
      : 'This matrix represents the temperature operating envelope mapped against chemical compatibility for common oilfield completion elastomers. FFKM and PTFE offer universal resistance, while EPDM is strictly restricted to non-hydrocarbon fluids.';

    return `
      <div class="space-y-2 select-none">
        <div class="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <table class="w-full text-[10px] text-left border-collapse font-sans min-w-[500px]">
            <thead>
              <tr class="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-[8.5px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">
                <th class="px-3 py-2">${isRu ? 'Материал' : 'Elastomer'}</th>
                <th class="px-3 py-2">${isRu ? 'Темп. лимит' : 'Temp Range'}</th>
                <th class="px-3 py-2">${isRu ? 'Хим. стойкость' : 'Chemical Resistance'}</th>
                <th class="px-3 py-2">${isRu ? 'Стойкость к H₂S' : 'NACE/H2S Suitability'}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-350">
              ${rows}
            </tbody>
          </table>
        </div>
        <p class="text-[9px] text-zinc-400 dark:text-zinc-500 leading-normal pl-1">${explanation}</p>
      </div>
    `;
  }

  static renderSteelCompatibility(rec, lang) {
    const isRu = lang === 'ru';
    const name = (rec.name || '').toUpperCase();
    const isSour = (rec.sour_service_suitability || '').toLowerCase().includes('suitable') || ['L80', 'C90', 'T95', 'C110', '13CR', 'SUPER 13CR', 'DUPLEX', 'INCONEL'].some(g => name.includes(g));

    const h2sStatus = isSour ? 'green' : 'red';
    const h2sComp = isSour ? (isRu ? 'Стойкая' : 'Resistant') : (isRu ? 'Неустойчивая' : 'Susceptible');
    const h2sNotes = isSour ? (isRu ? 'Применима в кислых средах по NACE MR0175' : 'Sour service compatible per NACE MR0175') : (isRu ? 'Риск сульфидного растрескивания (SSC)' : 'High risk of Sulfide Stress Cracking (SSC)');

    const co2Status = (name.includes('13CR') || name.includes('DUPLEX') || name.includes('INCONEL') || name.includes('CHROME')) ? 'green' : 'yellow';
    const co2Comp = co2Status === 'green' ? (isRu ? 'Отличная' : 'Excellent') : (isRu ? 'Ограниченная' : 'Limited');
    const co2Notes = co2Status === 'green' ? (isRu ? 'Хромистая сталь устойчива к углекислоте' : 'Cr-alloys form protective passivation layer') : (isRu ? 'Требуется постоянный ингибитор коррозии' : 'Severe sweet corrosion; requires inhibitor injection');

    const clStatus = (name.includes('DUPLEX') || name.includes('INCONEL') || name.includes('25CR') || name.includes('28CR')) ? 'green' : 'yellow';
    const clComp = clStatus === 'green' ? (isRu ? 'Стойкая' : 'Resistant') : (isRu ? 'Ограниченная' : 'Limited');
    const clNotes = clStatus === 'green' ? (isRu ? 'Высокая стойкость к хлоридам' : 'High resistance to chloride stress cracking') : (isRu ? 'Риск питтинга и коррозионного растрескивания >60°C' : 'Risk of pitting and Stress Corrosion Cracking (SCC) above 60°C');

    const getBadge = (status, text) => {
      let cls = 'text-zinc-500 dark:text-zinc-400';
      if (status === 'green') cls = 'text-emerald-600 dark:text-emerald-455 font-bold';
      if (status === 'yellow') cls = 'text-amber-600 dark:text-amber-450 font-bold';
      if (status === 'red') cls = 'text-rose-600 dark:text-rose-455 font-bold';
      return `<span class="${cls}">${text}</span>`;
    };

    return `
      <div class="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 select-none">
        <table class="w-full text-[10px] text-left border-collapse font-sans min-w-[500px]">
          <thead>
            <tr class="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-[8.5px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">
              <th class="px-3 py-2">${isRu ? 'Коррозионный агент' : 'Corrosive Agent'}</th>
              <th class="px-3 py-2">${isRu ? 'Совместимость' : 'Compatibility'}</th>
              <th class="px-3 py-2">${isRu ? 'Оценка риска' : 'Risk Assessment'}</th>
              <th class="px-3 py-2">${isRu ? 'Инженерное примечание' : 'Engineering Guidance'}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            <tr>
              <td class="px-3 py-1.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">H₂S (Sour Gas)</td>
              <td class="px-3 py-1.5">${getBadge(h2sStatus, h2sComp)}</td>
              <td class="px-3 py-1.5 font-bold ${isSour ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">${isSour ? (isRu ? 'NACE Сертифицировано' : 'NACE Qualified') : (isRu ? 'SSC/HIC Опасность' : 'SSC/HIC Hazard')}</td>
              <td class="px-3 py-1.5 text-zinc-600 dark:text-zinc-400">${h2sNotes}</td>
            </tr>
            <tr>
              <td class="px-3 py-1.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">CO₂ (Sweet Gas)</td>
              <td class="px-3 py-1.5">${getBadge(co2Status, co2Comp)}</td>
              <td class="px-3 py-1.5 font-bold ${co2Status === 'green' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}">${co2Status === 'green' ? (isRu ? 'Низкий риск' : 'Low Risk') : (isRu ? 'Риск CO₂ коррозии' : 'Sweet Corrosion Risk')}</td>
              <td class="px-3 py-1.5 text-zinc-600 dark:text-zinc-400">${co2Notes}</td>
            </tr>
            <tr>
              <td class="px-3 py-1.5 font-bold font-mono text-zinc-900 dark:text-zinc-100">${isRu ? 'Хлориды / Соленость' : 'Chlorides / Salinity'}</td>
              <td class="px-3 py-1.5">${getBadge(clStatus, clComp)}</td>
              <td class="px-3 py-1.5 font-bold ${clStatus === 'green' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}">${clStatus === 'green' ? (isRu ? 'SCC Стойкость' : 'SCC Resistant') : (isRu ? 'Опасность SCC хлоридов' : 'Chloride SCC Hazard')}</td>
              <td class="px-3 py-1.5 text-zinc-600 dark:text-zinc-400">${clNotes}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  static renderThreadCompatibilityTester(rec, lang) {
    const isRu = lang === 'ru';
    const threads = mockDb.threads || [];
    
    // Sort threads so that threads of matching OD are shown first, then name
    const sortedThreads = [...threads].sort((a, b) => {
      const aOdMatch = a.od === rec.od;
      const bOdMatch = b.od === rec.od;
      if (aOdMatch && !bOdMatch) return -1;
      if (!aOdMatch && bOdMatch) return 1;
      return a.name.localeCompare(b.name);
    });

    const optionsHtml = sortedThreads.map(t => {
      const isSelected = t.id === rec.id ? 'selected' : '';
      const sizeStr = t.od ? `${t.od}"` : '';
      const name = isRu ? (t.name_ru || t.name) : t.name;
      return `<option value="${t.id}" ${isSelected}>${name} (${sizeStr})</option>`;
    }).join('');

    return `
      <div class="space-y-4 border-t border-zinc-150 dark:border-zinc-800/80 pt-4 font-sans select-none">
        <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-blue-500 pl-2">
          ${isRu ? 'ИНТЕРАКТИВНЫЙ СИМУЛЯТОР СВИНЧИВАНИЯ' : 'INTERACTIVE MAKE-UP SIMULATOR'}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800 rounded-xl p-4">
          <!-- PIN column -->
          <div class="flex flex-col gap-1">
            <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">${isRu ? 'Концевой элемент 1 (PIN / Ниппель)' : 'End Element 1 (PIN / Nipple)'}</span>
            <div class="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[11px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              <span>${isRu ? (rec.name_ru || rec.name) : rec.name}</span>
              <span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30">${isRu ? 'НИППЕЛЬ' : 'PIN'}</span>
            </div>
          </div>
          
          <!-- Connect Icon -->
          <div class="flex items-center justify-center py-2 md:py-0">
            <div class="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-250/45 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 font-bold text-sm">
              ⇄
            </div>
          </div>
          
          <!-- BOX column -->
          <div class="flex flex-col gap-1">
            <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">${isRu ? 'Концевой элемент 2 (BOX / Муфта)' : 'End Element 2 (BOX / Coupling)'}</span>
            <div class="relative">
              <select id="thread-compatibility-box-select" class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 outline-none text-[11px] text-zinc-700 dark:text-zinc-300 font-bold focus:border-blue-500 dark:focus:border-blue-400 transition-colors appearance-none cursor-pointer">
                ${optionsHtml}
              </select>
              <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-zinc-400">
                ▼
              </div>
            </div>
          </div>
        </div>

        <!-- Result Container -->
        <div id="thread-compatibility-result-box" class="transition-all duration-200">
          <!-- Loaded dynamically -->
        </div>
      </div>
    `;
  }

  static getCompatibilityResultHtml(pin, box, compatibility, lang) {
    const isRu = lang === 'ru';
    const status = compatibility.status;
    const desc = compatibility.text;

    let badgeText = isRu ? 'СОВМЕСТИМО' : 'COMPATIBLE';
    let cardClass = 'bg-emerald-50/10 border-emerald-200/50 dark:bg-emerald-950/5 dark:border-emerald-900/30 text-zinc-700 dark:text-zinc-300';
    let badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450 border border-emerald-200/50 dark:border-emerald-900/30';
    let icon = '🟢';

    if (status === 'yellow') {
      badgeText = isRu ? 'ОГРАНИЧЕННО СОВМЕСТИМО' : 'SEMI-COMPATIBLE';
      cardClass = 'bg-amber-50/10 border-amber-250/50 dark:bg-amber-950/5 dark:border-amber-900/30 text-zinc-700 dark:text-zinc-300';
      badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-450 border border-amber-200/50 dark:border-amber-900/30';
      icon = '🟡';
    } else if (status === 'red') {
      badgeText = isRu ? 'НЕСОВМЕСТИМО' : 'INCOMPATIBLE';
      cardClass = 'bg-rose-50/10 border-rose-200/50 dark:bg-rose-950/5 dark:border-rose-900/30 text-zinc-700 dark:text-zinc-350';
      badgeClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455 border border-rose-200/50 dark:border-rose-900/30';
      icon = '🔴';
    }

    // Determine specifications if compatible
    let specHtml = '';
    if (status === 'green' || status === 'yellow') {
      const minTorque = pin.torque_range || box.torque_range || 'N/A';
      const loss = pin.makeup_loss || box.makeup_loss || 'N/A';
      const type = pin.connection_type || box.connection_type || 'N/A';
      
      specHtml = `
        <div class="mt-3 pt-3 border-t border-zinc-150 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] font-sans">
          <div>
            <span class="block text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider text-[8px] mb-0.5">${isRu ? 'Рекомендуемый крутящий момент' : 'Makeup Torque Limit'}</span>
            <span class="font-mono font-bold text-zinc-900 dark:text-zinc-100">${minTorque}</span>
          </div>
          <div>
            <span class="block text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider text-[8px] mb-0.5">${isRu ? 'Величина свинчивания (Loss)' : 'Makeup Loss'}</span>
            <span class="font-mono font-bold text-zinc-900 dark:text-zinc-100">${loss}</span>
          </div>
          <div>
            <span class="block text-zinc-400 dark:text-zinc-555 font-bold uppercase tracking-wider text-[8px] mb-0.5">${isRu ? 'Тип уплотнения резьбы' : 'Thread Seal Type'}</span>
            <span class="font-bold text-zinc-900 dark:text-zinc-100">${type}</span>
          </div>
        </div>
      `;
    } else {
      // Incompatible: show crossover sub recommendation
      specHtml = `
        <div class="mt-3 pt-3 border-t border-zinc-150 dark:border-zinc-800/80 text-[10px] font-sans text-amber-750 dark:text-amber-450 flex items-start gap-2">
          <span class="font-bold">⚠️</span>
          <div>
            <p class="font-bold uppercase tracking-wider text-[8px] text-zinc-400 dark:text-zinc-555 mb-0.5">${isRu ? 'Решение для заканчивания' : 'Completion Engineering Solution'}</p>
            <p class="leading-relaxed">
              ${isRu
                ? `Для соединения этих элементов требуется изготовить переводник: <strong>Переводник (Crossover sub) ${pin.od}" ${translateDbText(pin.name, lang)} Pin × ${box.od}" ${translateDbText(box.name, lang)} Box</strong>.`
                : `A crossover sub is required: <strong>Crossover sub ${pin.od}" ${translateDbText(pin.name, lang)} Pin × ${box.od}" ${translateDbText(box.name, lang)} Box</strong>.`}
            </p>
          </div>
        </div>
      `;
    }

    return `
      <div class="p-4 border rounded-xl flex flex-col gap-2 text-[11px] leading-relaxed ${cardClass}">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-sm shrink-0">${icon}</span>
            <span class="font-bold text-zinc-900 dark:text-white">${isRu ? 'Результат проверки совместимости:' : 'Compatibility Evaluation:'}</span>
          </div>
          <span class="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono tracking-wider shrink-0 ${badgeClass}">${badgeText}</span>
        </div>
        <div class="text-[10.5px] pl-6 text-zinc-600 dark:text-zinc-355">
          ${desc}
        </div>
        ${specHtml}
      </div>
    `;
  }
}
