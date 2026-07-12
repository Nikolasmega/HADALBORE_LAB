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
        eq: lang === 'ru'
          ? 'ΔL = L × α × ΔT (Свободное расширение)<br>F_temp = -E × A × α × ΔT (Защемленная колонна)'
          : 'ΔL = L × α × ΔT (Free expansion)<br>F_temp = -E × A × α × ΔT (Fixed string)',
        variables: lang === 'ru' ? [
          'ΔL = температурное удлинение свободно подвешенной стали (мм / дюймы)',
          'F_temp = возникающая температурная осевая нагрузка в зажатой колонне (Н / lbs)',
          'L = первоначальная длина колонны (м / ft)',
          'α = коэффициент теплового расширения стали (12×10⁻⁶ /°C или 6.7×10⁻⁶ /°F)',
          'ΔT = перепад средней температуры по сравнению с начальной (°C / °F)',
          'E = модуль упругости Юнга (2.06×10¹¹ Па / 30×10⁶ psi)',
          'A = площадь поперечного сечения металла трубы (мм² / sq.in)'
        ] : [
          'ΔL = thermal elongation of unconstrained steel (mm / inches)',
          'F_temp = induced thermal axial force in constrained string (N / lbs)',
          'L = initial pipe length (m / ft)',
          'α = thermal expansion coefficient (12×10⁻⁶ /°C or 6.7×10⁻⁶ /°F for carbon steel)',
          'ΔT = average temperature delta from initial state (°C / °F)',
          'E = Young\'s Modulus of elasticity (2.06×10¹¹ Pa / 30×10⁶ psi)',
          'A = pipe steel cross-sectional area (mm² / sq.in)'
        ],
        assumptions: lang === 'ru'
          ? 'Колонна свободно перемещается (без пакера) для ΔL, либо полностью жестко защемлена на обоих концах для F_temp (модель Любинского).'
          : 'String is completely free to move for ΔL, or fully constrained at both ends for F_temp (Lubinski mechanical model).',
        notes: lang === 'ru'
          ? 'Осевое сжимающее температурное усилие F_temp в зажатой колонне критично для расчета пакера и риска спирального изгиба (helical buckling).'
          : 'Induced compressive axial force F_temp in fixed string is critical for packer load assessment and helical buckling risk.'
      },
      buoyancy: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: lang === 'ru'
          ? 'BF = 1 - (ρ_mud / ρ_steel) (Равные плотности)<br>F_buoy = P_out × A_out - P_in × A_in (Разные плотности)'
          : 'BF = 1 - (ρ_mud / ρ_steel) (Equal densities)<br>F_buoy = P_out × A_out - P_in × A_in (Different densities)',
        variables: lang === 'ru' ? [
          'BF = коэффициент плавучести (безразмерный)',
          'ρ_mud = плотность бурового раствора',
          'ρ_steel = плотность стали (7850 кг/м³ / 7.85 sg / 65.5 ppg)',
          'F_buoy = результирующая выталкивающая сила (Н / lbs)',
          'P_out, P_in = гидростатическое давление снаружи и внутри трубы на торце (бар / psi)',
          'A_out, A_in = наружная и внутренняя площадь сечения трубы на торце (мм² / sq.in)'
        ] : [
          'BF = buoyancy factor (dimensionless)',
          'ρ_mud = density of the drilling fluid',
          'ρ_steel = steel density (7850 kg/m³ / 7.85 sg / 65.5 ppg)',
          'F_buoy = resultant buoyancy force (N / lbs)',
          'P_out, P_in = external/internal hydrostatic pressure at pipe end (bar / psi)',
          'A_out, A_in = external/internal cross-sectional area at pipe end (mm² / sq.in)'
        ],
        assumptions: lang === 'ru'
          ? 'Равномерное погружение. При разных плотностях внутри и снаружи (цементирование) применяется метод баланса площадей давлений (Pressure-Area Method).'
          : 'Uniform submersion. For different internal/external densities (cementing ops), Pressure-Area Method is required.',
        notes: lang === 'ru'
          ? 'Коэффициент плавучести уменьшает вес колонны на крюке, но разница плотностей при цементировании может вытолкнуть трубу вверх.'
          : 'Buoyancy reduces effective hook load, but density differentials during cementing can induce upward force (wet casing float).'
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
          ? 'M_bar = [V_init × (ρ_targ - ρ_init)] / [1 - (ρ_targ / ρ_bar_eff)]'
          : 'M_bar = [V_init × (ρ_targ - ρ_init)] / [1 - (ρ_targ / ρ_bar_eff)]',
        variables: lang === 'ru' ? [
          'M_bar = необходимая масса барита для замешивания (кг / lbs)',
          'V_init = исходный объем бурового раствора (м³ / bbl)',
          'ρ_init = начальная плотность раствора',
          'ρ_targ = целевая (конечная) плотность раствора',
          'ρ_bar_eff = эффективная плотность утяжелителя с учетом примесей (4.0 - 4.1 sg вместо идеальных 4.2 sg / 35.0 ppg)'
        ] : [
          'M_bar = required mass of barite to add (kg / lbs)',
          'V_init = initial mud volume (m³ / bbl)',
          'ρ_init = initial mud density',
          'ρ_targ = target (final) mud density',
          'ρ_bar_eff = effective barite density accounting for impurities (4.0 - 4.1 sg instead of ideal 4.2 sg / 35.0 ppg)'
        ],
        assumptions: lang === 'ru'
          ? 'Потери объема при перекачке и замешивании отсутствуют. Учитывается коэффициент чистоты/эффективности утяжелителя.'
          : 'Zero solid losses during mixing. Accounted for barite purity and effective specific gravity.',
        notes: lang === 'ru'
          ? 'Добавление барита увеличивает объем (V_added = M_barite / ρ_barite) и повышает вязкость (PV), что на практике требует добавления воды/разбавителей для реологии Хершеля-Балкли.'
          : 'Weighting up increases total volume (V_added = M_barite / ρ_barite) and plastic viscosity (PV), requiring dilution/chemicals to maintain Herschel-Bulkley flow parameters.'
      },
      corrosion: {
        title: lang === 'ru' ? 'Используемая формула' : 'Formula Used',
        eq: lang === 'ru'
          ? 'Rate = Rate_base × 2^[(T - 20) / 20] × (1 + P / 5000) (Базовая)<br>log(Rate_CO2) = 5.8 - 1710 / T_K + 0.67 × log(p_CO2) (de Waard)'
          : 'Rate = Rate_base × 2^[(T - 20) / 20] × (1 + P / 5000) (Base)<br>log(Rate_CO2) = 5.8 - 1710 / T_K + 0.67 × log(p_CO2) (de Waard)',
        variables: lang === 'ru' ? [
          'Rate = расчетная скорость питтинговой коррозии (мм/год / in/yr)',
          'Rate_CO2 = скорость углекислой коррозии по de Waard & Milliams',
          'T_K = температура среды в Кельвинах (°C + 273.15)',
          'p_CO2 = парциальное давление углекислого газа (бар)',
          'T = текущая температура среды (°C)',
          'P = давление в системе (psi)',
          'Depth = глубина износа металла (Rate × Время контакта в годах)'
        ] : [
          'Rate = calculated pitting corrosion rate (mm/yr / in/yr)',
          'Rate_CO2 = CO2 corrosion rate via de Waard & Milliams',
          'T_K = temperature in Kelvin (C + 273.15)',
          'p_CO2 = partial pressure of CO2 (bar)',
          'T = operating temperature (C)',
          'P = system pressure (psi)',
          'Depth = total metal loss depth (Rate × duration in years)'
        ],
        assumptions: lang === 'ru'
          ? 'Равномерный износ. Для кислых сред (H2S Sour Service) при p_H2S >= 0.05 psi коррозия лимитируется риском растрескивания (SSC) с ограничением твердости стали <= 22 HRC по NACE MR0175.'
          : 'Uniform/pitting wear. For H2S Sour Service (p_H2S >= 0.05 psi), failure is limited by Sulfide Stress Cracking (SSC), enforcing hardness limit <= 22 HRC per NACE MR0175.',
        notes: lang === 'ru'
          ? 'Эмпирическая оценка. de Waard & Milliams является отраслевым стандартом углекислой коррозии. Наличие H2S форсирует строгую проверку марок стали (запрет P110/Q125).'
          : 'Reference estimate. de Waard & Milliams model is the industry standard for sweet CO2 corrosion. Presence of H2S enforces strict casing grade compliance (limits P110/Q125).'
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
