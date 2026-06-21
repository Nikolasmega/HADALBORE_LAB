import { getPlaceholder } from '../utils/placeholder.js';
import { i18n } from '../utils/i18n.js';

export class FailureCard {
  static getKeyLimit(rec, lang) {
    const label = lang === 'ru' ? 'Спецификация' : 'Limit/Specs';
    const value = lang === 'ru'
      ? (rec.notes_ru || rec.notes || rec.scope_ru || rec.scope || getPlaceholder('no_data', lang))
      : (rec.notes || rec.scope || getPlaceholder('no_data', lang));
    return `
      <div class="flex flex-col border border-zinc-200/50 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-850/30">
        <span class="text-[8px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">${label}</span>
        <span class="text-xs font-mono font-bold text-zinc-900 dark:text-white mt-1">${value}</span>
      </div>
    `;
  }

  static renderFailureVisualization(rec, lang) {
    const isRu = lang === 'ru';
    const id = rec.id;

    let visualHtml = '';
    let triggerConditions = '';

    if (id === 'failure_ssc' || id === 'failure_hic' || id === 'failure_sohic') {
      triggerConditions = isRu
        ? '<li>Присутствие сероводорода H₂S (влажная кислая среда)</li><li>Твердость стали превышает 22 HRC</li><li>Высокое растягивающее напряжение в стенке (для SSC)</li><li>Отсутствие термической обработки сварного шва</li>'
        : '<li>Presence of wet H₂S environment</li><li>High strength steel (> 22 HRC hardness)</li><li>Tensile stress exceeding design limits</li><li>Lack of post-weld heat treatment</li>';
      
      visualHtml = `
        <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-950 font-mono text-[9px] text-zinc-700 dark:text-zinc-400 space-y-2 select-none">
          <div class="font-bold border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-1 uppercase tracking-wider text-rose-500">${isRu ? 'СХЕМА SSC / HIC РАСТРЕСКИВАНИЯ' : 'SSC / HIC CRACKING SCHEMATIC'}</div>
          <pre class="leading-none text-zinc-500 dark:text-zinc-400">
[Трубная стенка (Pipe Wall)]
  |                              |
  |===&gt;&gt; H+ (атомарный водород)  |
  |  (H₂S реакция на пов-ти)      |
  |  * (питтинг коррозия)        |
  |   \\                          |
  |    \\ (микротрещины SSC)      |
  |     *=======*======&gt; [КРАХ]  |
  |    /                         |
  |   / (расслоение HIC)         |
  |                              |
  +------------------------------+</pre>
          <p class="text-[9.5px] leading-relaxed mt-1">${isRu ? 'Атомарный водород проникает в кристаллическую решетку стали, вызывая охрупчивание и лавинообразное растрескивание под действием растягивающих напряжений.' : 'Atomic hydrogen diffuses into the steel lattice, recombining into molecular hydrogen. Under tensile stress, this leads to hydrogen embrittlement and catastrophic cracking.'}</p>
        </div>
      `;
    } else if (id === 'failure_galling') {
      triggerConditions = isRu
        ? '<li>Сухое свинчивание резьбы (недостаток смазки)</li><li>Высокая скорость вращения ротора при стабилизации</li><li>Несовместимые сплавы металлов (нержавеющая сталь без покрытия)</li><li>Загрязнение резьбы песком или стружкой</li>'
        : '<li>Dry connection make-up (lack of thread compound)</li><li>Excessive rotation speed during stabbing</li><li>Incompatible metals (stainless steel without coating)</li><li>Contamination of threads by sand or metal debris</li>';
      
      visualHtml = `
        <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-950 font-mono text-[9px] text-zinc-700 dark:text-zinc-400 space-y-2 select-none">
          <div class="font-bold border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-1 uppercase tracking-wider text-rose-500">${isRu ? 'МЕХАНИЗМ ЗАДИРА РЕЗЬБЫ (GALLING)' : 'THREAD GALLING MECHANISM'}</div>
          <pre class="leading-none text-zinc-500 dark:text-zinc-400">
[Витковая зона контакта]
  Резьба Муфты (Box)  ===#===#===#===&gt;
                       \\  /  \\  /
      [ЗОНА ЗАДИРА] ==&gt; *--*--* (Металлическая сварка)
                       /  \\  /  \\
  Резьба Ниппеля (Pin) ===#===#===#===&gt;</pre>
          <p class="text-[9.5px] leading-relaxed mt-1">${isRu ? 'Трение металла о металл без смазки вызывает локальный нагрев, микросварку и разрушение структуры витков резьбы, делая невозможным герметичное соединение.' : 'Severe metal-to-metal friction causes localized heating, microscopic cold welding, and tearing of the thread profile, destroying the connection.'}</p>
        </div>
      `;
    } else if (id === 'failure_washout') {
      triggerConditions = isRu
        ? '<li>Негерметичность металлического уплотнения резьбы</li><li>Высокий перепад давления</li><li>Абразивные твердые частицы (песок/проппант) в рабочей жидкости</li><li>Сильные вибрации колонны</li>'
        : '<li>Loss of metal-to-metal seal integrity</li><li>High differential pressure across connection</li><li>Presence of abrasive solids (sand/proppant) in fluid</li><li>Severe drillstring/tubing vibrations</li>';
      
      visualHtml = `
        <div class="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-950 font-mono text-[9px] text-zinc-700 dark:text-zinc-400 space-y-2 select-none">
          <div class="font-bold border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-1 uppercase tracking-wider text-rose-500">${isRu ? 'ПРОМЫВ СОЕДИНЕНИЯ (WASHOUT)' : 'FLUID WASHOUT MECHANISM'}</div>
          <pre class="leading-none text-zinc-500 dark:text-zinc-400">
 Inside Tubing Press.
  =======[FLUID]==========&gt;  \\  (Leak through seal)
                             \\
  [PIPE WALL]                *====&gt;&gt;&gt; [Erosive Washout]
                             /
  ========================&gt;  /</pre>
          <p class="text-[9.5px] leading-relaxed mt-1">${isRu ? 'Высокоскоростная струя жидкости с абразивом пробивает негерметичный упор, вымывая сталь и приводя к полному срезу или разрыву соединения.' : 'A high-velocity jet of fluid escaping through a micro-gap quickly erodes the steel, leading to localized washout and structural joint parting.'}</p>
        </div>
      `;
    } else {
      triggerConditions = isRu
        ? '<li>Превышение предельных механических нагрузок (смятие/разрыв)</li><li>Усталость металла при циклическом изгибе скважины</li><li>Недопустимая концентрация агрессивных газов и температур</li>'
        : '<li>Mechanical loading exceeding structural capacity (collapse/burst)</li><li>Metal fatigue under cyclic bending in high-dogleg holes</li><li>Corrosive gases and extreme temperature combinations</li>';
      
      visualHtml = `
        <div class="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50 dark:bg-zinc-950/40 text-center select-none text-zinc-500 dark:text-zinc-500 text-[10px]">
          <span class="font-bold uppercase block">${isRu ? 'Схема механизма на верификации' : 'Mechanism diagram under validation'}</span>
          <span class="text-[9px] block mt-1">${isRu ? 'Детализированная схема механизма доступна в отчетах расследования аварий.' : 'Detailed schematic is available in the operational investigation library.'}</span>
        </div>
      `;
    }

    return `
      <div class="space-y-4 font-sans text-xs">
        <div class="space-y-1.5">
          <span class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest">${isRu ? 'Провоцирующие условия (Triggering Conditions)' : 'Triggering Conditions & Thresholds'}</span>
          <ul class="text-[10px] text-zinc-700 dark:text-zinc-350 list-disc pl-4 space-y-1 leading-relaxed">
            ${triggerConditions}
          </ul>
        </div>
        <div class="space-y-1.5">
          <span class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest">${isRu ? 'Схема разрушения' : 'Failure Mechanism Visualization'}</span>
          ${visualHtml}
        </div>
      </div>
    `;
  }

  static getSections(rec, lang, viewMode, formatList) {
    const isRu = lang === 'ru';
    
    const sec2Html = `<p class="text-zinc-700 dark:text-zinc-350 leading-relaxed text-[11px]">${rec.symptoms || getPlaceholder('no_data', lang)}</p>`;
    const sec3Html = `<p class="text-zinc-700 dark:text-zinc-350 leading-relaxed text-[11px]">${rec.root_causes || rec.root_cause || getPlaceholder('no_data', lang)}</p>`;
    const sec4Html = FailureCard.renderFailureVisualization(rec, lang);
    const sec5Html = `<ul class="text-[11px] text-zinc-700 dark:text-zinc-350 space-y-0.5">${formatList(rec.usedInEquipment || rec.used_in_equipment)}</ul>`;
    const sec6Html = `<p class="text-zinc-700 dark:text-zinc-350 leading-relaxed text-[11px]">${rec.prevention_methods || rec.prevention || getPlaceholder('no_data', lang)}</p>`;
    const sec7Html = `<p class="text-zinc-700 dark:text-zinc-350 leading-relaxed text-[11px]">${rec.typical_metallurgy || rec.typical_metallurgy_at_risk || getPlaceholder('no_data', lang)}</p>`;
    const sec8Html = `<p class="text-zinc-700 dark:text-zinc-350 leading-relaxed text-[11px]">${rec.field_troubleshooting || getPlaceholder('no_data', lang)}</p>`;
    const sec9Html = `<div class="text-[10px] font-mono text-zinc-800 dark:text-zinc-300">${rec.standards && rec.standards.length > 0 ? rec.standards.join(', ') : (rec.oem_api_references || getPlaceholder('no_data', lang))}</div>`;

    return { sec2Html, sec3Html, sec4Html, sec5Html, sec6Html, sec7Html, sec8Html, sec9Html };
  }
}
