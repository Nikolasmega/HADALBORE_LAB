import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';

/**
 * Reusable Collapsible Formula Transparency Component.
 * Provides clear engineering formulas, variable definitions, assumptions, and notes.
 */
export class FormulaTransparency {
  /**
   * Renders a collapsible details block for a given calculator.
   * 
   * @param {string} calcId - Calculator identifier
   * @param {string} lang - Language ('en' | 'ru')
   * @returns {string} HTML string
   */
  static render(calcId, lang) {
    const formulas = {
      hydrostatic: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: lang === 'ru' 
          ? 'P = H × ρ × 0.0000981 (Метр.)<br>P = H × ρ × 0.052 (Имп.)' 
          : 'P = H × ρ × 0.0000981 (Metric)<br>P = H × ρ × 0.052 (Imperial)',
        variables: lang === 'ru' ? [
          'P = гидростатическое давление (бар / psi)',
          'H = глубина по вертикали (м / ft)',
          'ρ = плотность жидкости (кг/м³ / ppg)'
        ] : [
          'P = hydrostatic pressure (bar / psi)',
          'H = true vertical depth (m / ft)',
          'ρ = fluid density (kg/m³ / ppg)'
        ],
        assumptions: lang === 'ru' 
          ? 'Вертикальный ствол скважины, статический столб жидкости, неизменная по всей глубине плотность, отсутствие газосодержания.'
          : 'Vertical wellbore, static fluid column, uniform fluid density, no gas entrainment.',
        notes: lang === 'ru'
          ? 'Для наклонно-направленных скважин используйте глубину по вертикали (TVD), а не по стволу (MD).'
          : 'For directional wells, always use True Vertical Depth (TVD) rather than Measured Depth (MD).'
      },
      capacity: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: lang === 'ru'
          ? 'V = (π × ID² / 4) × L (Метр.)<br>V = (ID² / 1029.4) × L (Имп.)'
          : 'V = (π × ID² / 4) × L (Metric)<br>V = (ID² / 1029.4) × L (Imperial)',
        variables: lang === 'ru' ? [
          'V = внутренний объем трубы (литров / м³ / bbl)',
          'ID = внутренний диаметр трубы (мм / дюймы)',
          'L = длина колонны (м / ft)'
        ] : [
          'V = internal capacity volume (liters / m³ / bbl)',
          'ID = pipe inner diameter (mm / inches)',
          'L = pipe length (m / ft)'
        ],
        assumptions: lang === 'ru'
          ? 'Идеально цилиндрическое сечение трубы, отсутствие деформаций, высадки концов и муфты не учитываются.'
          : 'Perfect cylinder, uniform nominal inner diameter, joint upsets and connections are excluded from volume.',
        notes: lang === 'ru'
          ? 'Используется для расчетов глушения и промывки скважины.'
          : 'Standard volumetric calculation for well displacement and spot pills.'
      },
      displacement: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: lang === 'ru'
          ? 'V_disp = [π × (OD² - ID²) / 4] × L'
          : 'V_disp = [π × (OD² - ID²) / 4] × L',
        variables: lang === 'ru' ? [
          'V_disp = объем вытеснения металла (литров / м³ / bbl)',
          'OD = наружный диаметр трубы (мм / дюймы)',
          'ID = внутренний диаметр трубы (мм / дюймы)',
          'L = длина труб в скважине (м / ft)'
        ] : [
          'V_disp = steel displacement volume (liters / m³ / bbl)',
          'OD = pipe outer diameter (mm / inches)',
          'ID = pipe inner diameter (mm / inches)',
          'L = length of pipe in wellbore (m / ft)'
        ],
        assumptions: lang === 'ru'
          ? 'Полнотелая стальная стенка, концентричные цилиндры, отсутствие наружных протекторов или центраторов.'
          : 'Solid steel wall, concentric cylinders, excluding casing accessories like centralizers.',
        notes: lang === 'ru'
          ? 'Критично для контроля уровня раствора на притоке/поглощении при спускоподъемных операциях.'
          : 'Crucial for monitoring trip tank levels during tripping operations.'
      },
      annular: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: lang === 'ru'
          ? 'V_ann = [π × (D_hole² - d_pipe²) / 4] × L'
          : 'V_ann = [π × (D_hole² - d_pipe²) / 4] × L',
        variables: lang === 'ru' ? [
          'V_ann = объем затрубного пространства (литров / м³ / bbl)',
          'D_hole = диаметр ствола или ID обсадной колонны (мм / дюймы)',
          'd_pipe = наружный диаметр внутренней трубы (мм / дюймы)',
          'L = длина интервала (м / ft)'
        ] : [
          'V_ann = annular volume capacity (liters / m³ / bbl)',
          'D_hole = open hole size or casing ID (mm / inches)',
          'd_pipe = inner pipe outer diameter (mm / inches)',
          'L = interval length (m / ft)'
        ],
        assumptions: lang === 'ru'
          ? 'Номинальный диаметр ствола (без каверн и сужений), идеальная соосность колонн.'
          : 'Nominal gauge hole diameter (no washouts), perfectly concentric pipe placement.',
        notes: lang === 'ru'
          ? 'Для точного цементирования затрубного пространства необходимо закладывать коэффициент кавернозности.'
          : 'In actual open hole operations, a washout factor (excess volume) should be applied.'
      },
      thermal: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: 'ΔL = L × α × ΔT',
        variables: lang === 'ru' ? [
          'ΔL = температурное удлинение стали (мм / дюймы)',
          'L = первоначальная длина колонны (м / ft)',
          'α = коэффициент теплового расширения стали (12×10⁻⁶ /°C или 6.7×10⁻⁶ /°F)',
          'ΔT = перепад средней температуры по сравнению с начальной (°C / °F)'
        ] : [
          'ΔL = thermal elongation (mm / inches)',
          'L = initial pipe length (m / ft)',
          'α = thermal expansion coefficient (12×10⁻⁶ /°C or 6.7×10⁻⁶ /°F for carbon steel)',
          'ΔT = average temperature delta from initial state (°C / °F)'
        ],
        assumptions: lang === 'ru'
          ? 'Колонна не закреплена (свободно расширяется), температура распределена равномерно по всей длине.'
          : 'String is unconstrained (free to move), temperature change is linear and uniform along the string.',
        notes: lang === 'ru'
          ? 'Используется для оценки нагрузок на пакер или компенсаторы теплового расширения.'
          : 'Used to size expansion joints and calculate packer forces in high-temperature wells.'
      },
      buoyancy: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: 'BF = 1 - (ρ_mud / ρ_steel)',
        variables: lang === 'ru' ? [
          'BF = коэффициент плавучести (безразмерный)',
          'ρ_mud = плотность бурового раствора',
          'ρ_steel = плотность стали (7850 кг/м³ / 7.85 sg / 65.5 ppg)'
        ] : [
          'BF = buoyancy factor (dimensionless)',
          'ρ_mud = density of the drilling fluid',
          'ρ_steel = steel density (7850 kg/m³ / 7.85 sg / 65.5 ppg)'
        ],
        assumptions: lang === 'ru'
          ? 'Колонна полностью погружена в буровой раствор, внутреннее и внешнее давление сбалансировано.'
          : 'Pipe is fully submerged in a homogeneous fluid, internal and external fluid densities are equal.',
        notes: lang === 'ru'
          ? 'Коэффициент плавучести уменьшает вес колонны на крюке при ее спуске в скважину.'
          : 'Buoyancy reduces the effective hook load of the casing or tubing string.'
      },
      hook_load: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: lang === 'ru'
          ? 'W_buoy = W_air × BF<br>W_pick = W_buoy × (1 + Drag)<br>W_slack = W_buoy × (1 - Drag)'
          : 'W_buoy = W_air × BF<br>W_pick = W_buoy × (1 + Drag)<br>W_slack = W_buoy × (1 - Drag)',
        variables: lang === 'ru' ? [
          'W_buoy = расчетный вес колонны в растворе (кг / lbs)',
          'W_air = номинальный вес колонны в воздухе (кг / lbs)',
          'W_pick = нагрузка при подъеме с учетом трения',
          'W_slack = нагрузка при спуске с учетом трения',
          'Drag = коэффициент сил сопротивления/трения (в долях единицы)'
        ] : [
          'W_buoy = buoyant weight of the string in fluid (kg / lbs)',
          'W_air = total nominal weight in air (kg / lbs)',
          'W_pick = hook load during upward movement (pickup)',
          'W_slack = hook load during downward movement (slackoff)',
          'Drag = friction drag factor (expressed as a decimal fraction)'
        ],
        assumptions: lang === 'ru'
          ? 'Равномерное сопротивление по всей длине, отсутствие локальных прихватов или сужений ствола скважины.'
          : 'Uniform friction coefficient, no mechanical keyseats or local washouts/tight spots.',
        notes: lang === 'ru'
          ? 'Показания индикатора веса на буровой при сдвиге колонны вверх/вниз всегда отличаются из-за сил трения.'
          : 'Hook load values will differ during movement due to drag forces in the casing/hole.'
      },
      barite: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: lang === 'ru'
          ? 'M_bar = [V_init × (ρ_targ - ρ_init)] / [1 - (ρ_targ / ρ_bar)]'
          : 'M_bar = [V_init × (ρ_targ - ρ_init)] / [1 - (ρ_targ / ρ_bar)]',
        variables: lang === 'ru' ? [
          'M_bar = необходимая масса барита для замешивания (кг / lbs)',
          'V_init = исходный объем бурового раствора (м³ / bbl)',
          'ρ_init = начальная плотность раствора',
          'ρ_targ = целевая (конечная) плотность раствора',
          'ρ_bar = плотность баритового утяжелителя (4200 кг/м³ / 4.2 sg / 35.0 ppg)'
        ] : [
          'M_bar = required mass of barite to add (kg / lbs)',
          'V_init = initial mud volume (m³ / bbl)',
          'ρ_init = initial mud density',
          'ρ_targ = target (final) mud density',
          'ρ_bar = barite density (4200 kg/m³ / 4.2 sg / 35.0 ppg)'
        ],
        assumptions: lang === 'ru'
          ? 'Плотность барита постоянна, потери объема при перекачке и замешивании отсутствуют, 100% растворимость.'
          : 'Pure barite source, no solid losses during mixing, immediate homogeneous blending.',
        notes: lang === 'ru'
          ? 'Утяжеление раствора увеличивает его объем. Объем прибавки рассчитывается как: V_added = M_barite / ρ_barite.'
          : 'Weighting up a fluid increases total system volume. Volume increase is: V_added = M_barite / ρ_barite.'
      },
      corrosion: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: lang === 'ru'
          ? 'Rate = Rate_base × 2^[(T - 20) / 20] × (1 + P / 5000)'
          : 'Rate = Rate_base × 2^[(T - 20) / 20] × (1 + P / 5000)',
        variables: lang === 'ru' ? [
          'Rate = расчетная скорость питтинговой коррозии (мм/год / in/yr)',
          'Rate_base = базовая скорость при 20°C (зависит от pH и среды)',
          'T = текущая температура среды (°C)',
          'P = давление в системе (psi)',
          'Depth = глубина износа металла (Rate × Время контакта в годах)'
        ] : [
          'Rate = calculated pitting corrosion rate (mm/yr / in/yr)',
          'Rate_base = baseline rate at 20C (modeled based on pH and medium)',
          'T = operating temperature (C)',
          'P = system pressure (psi)',
          'Depth = total metal loss depth (Rate × duration in years)'
        ],
        assumptions: lang === 'ru'
          ? 'Удвоение скорости химической реакции на каждые 20°C (правило Вант-Гоффа / модель Аррениуса), линейная интенсификация от давления.'
          : 'Arrhenius-style temperature acceleration (corrosion doubles every 20C), linear pressure factor.',
        notes: lang === 'ru'
          ? 'Инженерная оценка. Действительные показатели сильно зависят от концентрации ингибиторов коррозии.'
          : 'Reference estimate. Real downhole rates are highly dependent on scale and corrosion inhibitor efficiency.'
      },
      cement_volume: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: lang === 'ru'
          ? 'V_ann = [π × (D_hole² - OD_csg²) / 4] × (TD - TOC)<br>V_cem = V_ann × (1 + E_x / 100)'
          : 'V_ann = [π × (D_hole² - OD_csg²) / 4] × (TD - TOC)<br>V_cem = V_ann × (1 + E_x / 100)',
        variables: lang === 'ru' ? [
          'V_ann = объем кольцевого зазора (литров / bbl / м³)',
          'V_cem = полный требуемый объем цемента с учетом запаса',
          'D_hole = диаметр ствола скважины (из кавернограммы или номинал долота)',
          'OD_csg = наружный диаметр обсадной трубы',
          'TD = забой скважины (глубина низа интервала)',
          'TOC = глубина подъема цемента (верх интервала)',
          'E_x = коэффициент избытка цемента (%)'
        ] : [
          'V_ann = annular volume capacity (liters / bbl / m³)',
          'V_cem = total cement slurry volume needed with excess',
          'D_hole = hole diameter (from caliper log or nominal bit size)',
          'OD_csg = casing outer diameter',
          'TD = total depth (bottom of interval)',
          'TOC = top of cement (top of interval)',
          'E_x = excess slurry factor (%)'
        ],
        assumptions: lang === 'ru'
          ? 'Равномерный кольцевой зазор, концентрическое центрирование труб. При загрузке кавернограммы объем рассчитывается как сумма элементарных кольцевых цилиндров методом численного интегрирования.'
          : 'Uniform annular geometry, concentric pipe placement. When a caliper log is loaded, volume is calculated by numerical integration of sliced annular cylinders.',
        notes: lang === 'ru'
          ? 'Цемент класса G замешивается из расчета ~1.15 кг сухого порошка на 1 литр готового раствора, с расходом воды 44% от массы цемента.'
          : 'Standard Class G cement slurry yields approx. 1.15 kg dry cement powder per liter of slurry, with a water ratio of 44% by weight.'
      }
    };

    const data = formulas[calcId];
    if (!data) return '';

    const { viewMode } = store.getState();
    if (viewMode === 'field') return '';
    const isOpen = viewMode === 'engineering' ? 'open' : '';

    return `
      <details ${isOpen} class="mt-3 text-[10px] text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/10 transition-all font-sans select-none">
        <summary class="px-3 py-2 font-bold cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-250 flex items-center justify-between outline-none">
          <span>${data.title}</span>
          <svg class="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0 transform transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path></svg>
        </summary>
        <div class="px-3 pb-3 pt-1 border-t border-zinc-150 dark:border-zinc-800/60 space-y-2.5 mt-0.5 leading-relaxed">
          <!-- Equation -->
          <div class="bg-white dark:bg-zinc-950 p-2 rounded border border-zinc-200/40 dark:border-zinc-800/80 font-mono text-zinc-900 dark:text-zinc-200 font-semibold break-all text-[10px] my-1">
            ${data.eq}
          </div>
          
          <!-- Variables -->
          <div class="space-y-0.5">
            <span class="block font-bold text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">${lang === 'ru' ? 'Переменные' : 'Where'}:</span>
            <ul class="list-none space-y-0.5 pl-0.5">
              ${data.variables.map(v => `<li class="flex items-start gap-1"><span class="text-zinc-350 shrink-0">•</span><span>${v}</span></li>`).join('')}
            </ul>
          </div>

          <!-- Assumptions -->
          <div class="space-y-0.5">
            <span class="block font-bold text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">${lang === 'ru' ? 'Допущения' : 'Assumptions'}:</span>
            <p class="pl-1.5 border-l border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-400">${data.assumptions}</p>
          </div>

          <!-- Notes -->
          <div class="space-y-0.5">
            <span class="block font-bold text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-550">${lang === 'ru' ? 'Инженерное примечание' : 'Engineering Note'}:</span>
            <p class="text-[9.5px] italic text-zinc-500 dark:text-zinc-400 font-medium">${data.notes}</p>
          </div>
        </div>
      </details>
    `;
  }
}

export default FormulaTransparency;
