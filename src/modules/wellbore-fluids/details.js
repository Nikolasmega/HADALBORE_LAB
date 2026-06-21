import { store } from '../../core/State.js';
import { i18n } from '../../utils/i18n.js';

export class WellboreFluidsDetails {
  render(rec, lang) {
    if (!rec) return '';

    const { viewMode } = store.getState();
    const isRu = lang === 'ru';

    // Same content structure for both modes but styled for premium feel
    return this.renderCard(rec, isRu, viewMode === 'engineering');
  }

  renderCard(rec, isRu, isEngineering) {
    const categoryLabels = {
      drilling_mud: isRu ? 'Буровой раствор' : 'Drilling Mud',
      cement_slurry: isRu ? 'Цементный раствор' : 'Cement Slurry',
      spacer: isRu ? 'Буферная жидкость' : 'Spacer',
      additive: isRu ? 'Добавка/Реагент' : 'Additive',
      acid: isRu ? 'Кислоты и ОПЗ' : 'Acid System',
      corrosion_control: isRu ? 'Антикоррозийная защита' : 'Corrosion Control'
    };

    const densityMin = rec.density?.min_sg || '—';
    const densityMax = rec.density?.max_sg || '—';
    const densityVal = densityMin !== '—' && densityMax !== '—'
      ? `${densityMin} - ${densityMax} SG`
      : (densityMin !== '—' ? `${densityMin} SG` : (densityMax !== '—' ? `${densityMax} SG` : '—'));

    const tempMax = rec.temperature_limit?.max_c !== undefined ? `${rec.temperature_limit.max_c}°C` : '—';
    
    // Localization fallbacks
    const desc = isRu && rec.description_ru ? rec.description_ru : rec.description;
    const advantagesList = isRu && rec.advantages_ru ? rec.advantages_ru : (rec.advantages || []);
    const limitationsList = isRu && rec.limitations_ru ? rec.limitations_ru : (rec.limitations || []);
    
    const advantagesHtml = advantagesList.map(adv => `<li>✔ ${adv}</li>`).join('');
    const limitationsHtml = limitationsList.map(lim => `<li>⚠️ ${lim}</li>`).join('');
    
    const steelsComp = isRu && rec.compatibility_ru?.steels ? rec.compatibility_ru.steels : (rec.compatibility?.steels || '—');
    const elastomersComp = isRu && rec.compatibility_ru?.elastomers ? rec.compatibility_ru.elastomers : (rec.compatibility?.elastomers || '—');

    const standardsHtml = (rec.standards || []).map(std => `<span class="px-2 py-0.5 border border-zinc-200 dark:border-zinc-750/80 rounded bg-zinc-50 dark:bg-zinc-850 font-mono text-[9px]">${std}</span>`).join(' ');

    // Determine category-specific calculations
    let calculationsPanel = '';
    if (rec.category === 'drilling_mud' && rec.fann_readings) {
      calculationsPanel = this.getRheologyCalculatorsHtml(rec, isRu);
    } else if (rec.category === 'acid') {
      calculationsPanel = this.getAcidCalculatorsHtml(rec, isRu);
    } else if (rec.category === 'corrosion_control') {
      calculationsPanel = this.getCorrosionCalculatorsHtml(rec, isRu);
    }

    return `
      <div class="glassmorphic p-6 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-6 font-sans">
        <!-- Title and Category -->
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

        <div class="space-y-1.5">
          <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">${isRu ? 'Описание' : 'Overview'}</h4>
          <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">${desc}</p>
        </div>

        <!-- Quick Specs Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-850/10 border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl font-mono text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-350">
          <div>
            <span class="text-zinc-400 dark:text-zinc-550 block mb-0.5">${isRu ? 'ПЛОТНОСТЬ:' : 'DENSITY:'}</span>
            <span class="font-bold text-zinc-950 dark:text-zinc-100 text-xs">${densityVal}</span>
          </div>
          <div>
            <span class="text-zinc-400 dark:text-zinc-550 block mb-0.5">${isRu ? 'ТЕМПЕРАТУРА МАКС:' : 'MAX TEMP:'}</span>
            <span class="font-bold text-zinc-950 dark:text-zinc-100 text-xs">${tempMax}</span>
          </div>
        </div>

        <!-- Calculations & Interactive Panel -->
        ${calculationsPanel}

        <!-- Chemical Compatibility -->
        <div class="space-y-2">
          <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">${isRu ? 'Совместимость' : 'Compatibility'}</h4>
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
                  <td class="px-4 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200">${isRu ? 'Обсадные/Бурильные стали' : 'Casing & Drill Steels'}</td>
                  <td class="px-4 py-2.5 text-zinc-700 dark:text-zinc-350">${steelsComp}</td>
                </tr>
                <tr>
                  <td class="px-4 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200">${isRu ? 'Эластомеры и Пакеры' : 'Elastomers & Packers'}</td>
                  <td class="px-4 py-2.5 text-zinc-700 dark:text-zinc-350">${elastomersComp}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Advantages & Limitations -->
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

  getRheologyCalculatorsHtml(rec, isRu) {
    const readings = rec.fann_readings;
    return `
      <div class="space-y-4 border border-zinc-250/60 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50/10 dark:bg-zinc-900/10">
        <h3 class="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          ${isRu ? '📊 Вискозиметр Fann 35 & Моделирование реологии' : '📊 Fann 35 Viscometer & Rheology Modeling'}
        </h3>
        
        <div class="grid grid-cols-2 md:grid-cols-6 gap-2">
          ${Object.keys(readings).map(key => {
            const label = key.replace('theta_', '') + ' rpm';
            return `
              <div>
                <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-550 font-mono mb-1">${label}</label>
                <input type="number" id="fann-${key}" value="${readings[key]}" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white" />
              </div>
            `;
          }).join('')}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch pt-2">
          <!-- Rheological Parameters Output -->
          <div class="bg-zinc-50 dark:bg-zinc-850/40 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[10px] space-y-2">
            <div>
              <span class="text-zinc-400 block">${isRu ? 'Пластическая вязкость (PV):' : 'Plastic Viscosity (PV):'}</span>
              <span id="calc-pv" class="text-xs font-bold text-zinc-900 dark:text-white">-- cP</span>
              <span class="text-zinc-400 block text-[8px] mt-0.5">PV = θ₆₀₀ - θ₃₀₀</span>
            </div>
            <div>
              <span class="text-zinc-400 block">${isRu ? 'Предел текучести (YP):' : 'Yield Point (YP):'}</span>
              <span id="calc-yp" class="text-xs font-bold text-zinc-900 dark:text-white">-- lb/100ft²</span>
              <span class="text-zinc-400 block text-[8px] mt-0.5">YP = θ₃₀₀ - PV</span>
            </div>
            <div class="border-t border-zinc-200 dark:border-zinc-800 pt-2 mt-2">
              <span class="text-zinc-450 block font-bold">${isRu ? 'Модель Herschel-Bulkley (YPL):' : 'Herschel-Bulkley (YPL) Model:'}</span>
              <div class="mt-1 space-y-1 text-[9px]">
                <p>Flow index (n): <span id="calc-hb-n" class="font-bold text-zinc-900 dark:text-white">--</span></p>
                <p>Consistency (K): <span id="calc-hb-k" class="font-bold text-zinc-900 dark:text-white">-- eq. cP</span></p>
                <p>Yield Stress (τ₀): <span id="calc-hb-tau" class="font-bold text-zinc-900 dark:text-white">-- lb/100ft²</span></p>
              </div>
              <span class="text-zinc-400 block text-[8px] mt-1">τ = τ₀ + K · γⁿ</span>
            </div>
          </div>

          <!-- Dynamic SVG Plot -->
          <div class="bg-zinc-50 dark:bg-zinc-850/40 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800/60 flex flex-col justify-between items-center min-h-[160px]">
            <svg id="rheology-svg" class="w-full h-32" viewBox="0 0 200 120">
              <!-- Grid and curve will be dynamically rendered here -->
            </svg>
            <div class="flex gap-4 text-[8px] text-zinc-450 font-mono mt-1 select-none">
              <span class="flex items-center gap-1"><span class="w-2 h-0.5 bg-red-500 inline-block"></span>Fann</span>
              <span class="flex items-center gap-1"><span class="w-2 h-0.5 bg-blue-500 inline-block"></span>Bingham</span>
              <span class="flex items-center gap-1"><span class="w-2 h-0.5 bg-emerald-500 inline-block"></span>H-B</span>
            </div>
          </div>
        </div>

        <!-- HPHT density correction block -->
        <div class="border-t border-zinc-200/60 dark:border-zinc-800/80 pt-3 space-y-3">
          <h4 class="text-[10px] font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
            🔥 ${isRu ? 'Термобарическая поправка плотности (HPHT)' : 'HPHT Density Correction'}
          </h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-550 font-mono mb-1">
                ${isRu ? 'Давление (P, бар)' : 'Pressure (P, bar)'}
              </label>
              <input type="number" id="hpht-p" value="0" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white" />
            </div>
            <div>
              <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-550 font-mono mb-1">
                ${isRu ? 'Температура (T, °C)' : 'Temperature (T, °C)'}
              </label>
              <input type="number" id="hpht-t" value="20" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white" />
            </div>
          </div>
          <div class="bg-zinc-950 text-white dark:bg-zinc-850/60 p-3 rounded-lg border border-zinc-800 dark:border-zinc-750/50 flex justify-between items-center font-mono text-xs">
            <span>${isRu ? 'ПЛОТНОСТЬ НА ЗАБОЕ (HPHT):' : 'DOWNHOLE DENSITY (HPHT):'}</span>
            <span id="hpht-density" class="font-bold text-emerald-400">-- SG</span>
          </div>
          <p class="text-[8px] text-zinc-400 font-mono leading-normal font-normal">
            ρ(P, T) = ρ₀ + β · (P - P₀) - α · (T - T₀) <br/>
            ${isRu 
              ? 'Где β — коэффициент сжимаемости, а α — коэффициент термического расширения.' 
              : 'Where β is compressibility and α is thermal expansion.'}
          </p>
        </div>
      </div>
    `;
  }

  getAcidCalculatorsHtml(rec, isRu) {
    const standardReactions = {
      fluid_acid_hcl_15: {
        title: isRu ? 'Растворение Кальцита (Кальциевые коллекторы):' : 'Calcite Dissolution (Limestone):',
        eq: '2HCl + CaCO₃ ➔ CaCl₂ + CO₂↑ + H₂O',
        ratio: 1.07 * 0.15 * (100.08 / 72.92) * 1000 // kg CaCO3 per m3 of 15% HCl
      },
      fluid_acid_mud_acid: {
        title: isRu ? 'Растворение Кварца/Кремнезема (Терригенные коллекторы):' : 'Quartz/Silicate Dissolution (Sandstone):',
        eq: '4HF + SiO₂ ➔ SiF₄↑ + 2H₂O',
        ratio: 1.10 * 0.03 * (60.08 / 80.0) * 1000 // kg SiO2 per m3 of Mud Acid
      }
    };
    const reactionInfo = standardReactions[rec.id] || {
      title: isRu ? 'Типовая кислотная реакция:' : 'Typical Acid Reaction:',
      eq: '2HCl + CaCO₃ ➔ CaCl₂ + CO₂↑ + H₂O',
      ratio: 220
    };

    return `
      <div class="space-y-4 border border-zinc-250/60 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50/10 dark:bg-zinc-900/10">
        <h3 class="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          🧪 ${isRu ? 'Химизм кислотного воздействия' : 'Acid Stimulation Chemistry'}
        </h3>

        <div class="bg-zinc-50 dark:bg-zinc-850/40 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800/60 space-y-2">
          <span class="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 font-mono">${reactionInfo.title}</span>
          <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono font-bold text-center text-sm text-zinc-950 dark:text-zinc-100 overflow-x-auto">
            ${reactionInfo.eq}
          </div>
        </div>

        <!-- Dissolving Capacity Calculator -->
        <div class="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <h4 class="text-[10px] font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
            ⛰ ${isRu ? 'Калькулятор растворяющей способности' : 'Dissolving Capacity Calculator'}
          </h4>
          
          <div>
            <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-550 font-mono mb-1">
              ${isRu ? 'Объем кислотного раствора (V, м³)' : 'Acid Solution Volume (V, m³)'}
            </label>
            <input type="number" id="acid-vol" value="1.0" step="0.1" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white" />
          </div>

          <div class="bg-zinc-950 text-white dark:bg-zinc-850/60 p-3 rounded-lg border border-zinc-800 dark:border-zinc-750/50 flex justify-between items-center font-mono text-xs">
            <span>${isRu ? 'МАССА РАСТВОРЕННОЙ ПОРОДЫ:' : 'DISSOLVED ROCK MASS:'}</span>
            <span id="acid-dissolved-mass" class="font-bold text-emerald-400">-- kg</span>
          </div>
          
          <input type="hidden" id="acid-ratio" value="${reactionInfo.ratio}" />
        </div>
      </div>
    `;
  }

  getCorrosionCalculatorsHtml(rec, isRu) {
    const isH2S = rec.id === 'fluid_inhibitor_h2s';
    
    return `
      <div class="space-y-4 border border-zinc-250/60 dark:border-zinc-800/80 rounded-xl p-4 bg-zinc-50/10 dark:bg-zinc-900/10">
        <h3 class="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          🛡 ${isRu ? 'Антикоррозийная химия и расчет дозировки' : 'Corrosion Chemistry & Dosage'}
        </h3>

        ${isH2S ? `
          <div class="bg-zinc-50 dark:bg-zinc-850/40 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800/60 space-y-2">
            <span class="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 font-mono">${isRu ? 'Уравнение связывания H₂S триазином:' : 'H₂S Triazine Scavenging Equation:'}</span>
            <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono font-bold text-center text-sm text-zinc-950 dark:text-zinc-100 overflow-x-auto">
              3H₂S + Triazine ➔ Dithiazine + byproducts
            </div>
          </div>
          
          <div class="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <h4 class="text-[10px] font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
              🎚 ${isRu ? 'Дозирование нейтрализатора H₂S' : 'H₂S Scavenger Dosage Calculator'}
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono mb-1">
                  ${isRu ? 'Объем обрабатываемой среды (V, м³)' : 'Fluid Volume to Treat (V, m³)'}
                </label>
                <input type="number" id="h2s-vol" value="10" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white" />
              </div>
              <div>
                <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono mb-1">
                  ${isRu ? 'Концентрация H₂S (ppm)' : 'H₂S Concentration (ppm)'}
                </label>
                <input type="number" id="h2s-ppm" value="100" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white" />
              </div>
            </div>
            <div class="bg-zinc-950 text-white dark:bg-zinc-850/60 p-3 rounded-lg border border-zinc-800 dark:border-zinc-750/50 flex justify-between items-center font-mono text-xs">
              <span>${isRu ? 'НЕОБХОДИМЫЙ ОБЪЕМ НЕЙТРАЛИЗАТОРА:' : 'REQUIRED SCAVENGER VOLUME:'}</span>
              <span id="h2s-scav-need" class="font-bold text-emerald-400">-- L</span>
            </div>
          </div>
        ` : `
          <div class="bg-zinc-50 dark:bg-zinc-850/40 rounded-xl p-3 border border-zinc-200/50 dark:border-zinc-800/60 space-y-2">
            <span class="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 font-mono">${isRu ? 'Эффективность защитной пленки ингибитора:' : 'Inhibitor Film Protection Efficiency:'}</span>
            <div class="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono font-bold text-center text-sm text-zinc-950 dark:text-zinc-100 overflow-x-auto">
              η = ((CR₀ - CR_inh) / CR₀) × 100%
              <p class="text-[8px] text-zinc-400 dark:text-zinc-550 mt-1 font-normal">${isRu ? 'Защита стали обычно превышает 95% при дозировке 50-100 ppm' : 'Steel protection efficiency typically exceeds 95% at 50-100 ppm concentration'}</p>
            </div>
          </div>

          <div class="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <h4 class="text-[10px] font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
              🎚 ${isRu ? 'Расчет дозировки ингибитора для труб' : 'Tubular Inhibitor Dosage Calculator'}
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-mono mb-1">
                  ${isRu ? 'Объем среды (V, м³)' : 'Fluid Volume (V, m³)'}
                </label>
                <input type="number" id="inh-vol" value="10" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white" />
              </div>
              <div>
                <label class="block text-[8px] uppercase tracking-wider text-zinc-400 dark:text-zinc-550 font-mono mb-1">
                  ${isRu ? 'Целевая концентрация (ppm)' : 'Target Concentration (ppm)'}
                </label>
                <input type="number" id="inh-ppm" value="50" class="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 px-2 py-1 rounded font-mono text-xs text-zinc-950 dark:text-white" />
              </div>
            </div>
            <div class="bg-zinc-950 text-white dark:bg-zinc-850/60 p-3 rounded-lg border border-zinc-800 dark:border-zinc-750/50 flex justify-between items-center font-mono text-xs">
              <span>${isRu ? 'НЕОБХОДИМАЯ МАССА ИНГИБИТОРА:' : 'REQUIRED INHIBITOR MASS:'}</span>
              <span id="inh-need" class="font-bold text-emerald-400">-- kg</span>
            </div>
          </div>
        `}
      </div>
    `;
  }

  bindEvents(rec, isRu) {
    if (rec.category === 'drilling_mud' && rec.fann_readings) {
      this.bindRheologyEvents(rec, isRu);
    } else if (rec.category === 'acid') {
      this.bindAcidEvents();
    } else if (rec.category === 'corrosion_control') {
      this.bindCorrosionEvents(rec);
    }

    // Trigger MathJax / KaTeX rendering if loaded on window
    if (window.MathJax && window.MathJax.typeset) {
      window.MathJax.typeset();
    }
  }

  bindRheologyEvents(rec, isRu) {
    const inputs = ['600', '300', '200', '100', '6', '3'].map(rpm => document.getElementById(`fann-theta_${rpm}`));
    const pressureInput = document.getElementById('hpht-p');
    const tempInput = document.getElementById('hpht-t');

    const updateCalculations = () => {
      const getVal = (id) => parseFloat(document.getElementById(id)?.value || 0);

      const theta_600 = getVal('fann-theta_600');
      const theta_300 = getVal('fann-theta_300');
      const theta_200 = getVal('fann-theta_200');
      const theta_100 = getVal('fann-theta_100');
      const theta_6 = getVal('fann-theta_6');
      const theta_3 = getVal('fann-theta_3');

      // 1. Bingham Calculations
      const pv = Math.max(0, theta_600 - theta_300);
      const yp = Math.max(0, theta_300 - pv);

      document.getElementById('calc-pv').innerText = `${pv.toFixed(1)} cP`;
      document.getElementById('calc-yp').innerText = `${yp.toFixed(1)} lb/100ft²`;

      // 2. Herschel-Bulkley Calculations (tau = tau0 + K * gamma^n)
      // Estimate tau0 = 2 * theta_3 - theta_6
      let tau0 = 2 * theta_3 - theta_6;
      if (tau0 < 0) tau0 = 0;
      if (tau0 >= theta_300) tau0 = theta_300 - 0.1; // bound constraint

      let n = 1.0;
      let k = 0.0;
      if (theta_600 - tau0 > 0 && theta_300 - tau0 > 0) {
        n = 3.32 * Math.log10((theta_600 - tau0) / (theta_300 - tau0));
        k = (theta_300 - tau0) / Math.pow(511, n);
      }

      document.getElementById('calc-hb-n').innerText = n.toFixed(3);
      document.getElementById('calc-hb-k').innerText = `${k.toFixed(1)} eq. cP`;
      document.getElementById('calc-hb-tau').innerText = `${tau0.toFixed(1)} lb/100ft²`;

      // 3. HPHT Density Correction
      const p = getVal('hpht-p');
      const t = getVal('hpht-t');
      
      const isOBM = rec.id.includes('obm');
      const beta = isOBM ? 0.0005 : 0.0003; // SG per bar
      const alpha = isOBM ? 0.00075 : 0.00045; // SG per C
      
      const baseDensity = rec.density?.min_sg || 1.15;
      const hphtDensity = baseDensity + beta * p - alpha * (t - 20);
      document.getElementById('hpht-density').innerText = `${Math.max(1.0, hphtDensity).toFixed(3)} SG`;

      // 4. Update SVG Plot
      this.drawRheologyPlot(theta_600, theta_300, theta_200, theta_100, theta_6, theta_3, pv, yp, tau0, n, k);
    };

    inputs.concat([pressureInput, tempInput]).forEach(input => {
      if (input) input.addEventListener('input', updateCalculations);
    });

    updateCalculations();
  }

  drawRheologyPlot(t600, t300, t200, t100, t6, t3, pv, yp, tau0, n, k) {
    const svg = document.getElementById('rheology-svg');
    if (!svg) return;

    // Experimental points (shear rate vs shear stress)
    const points = [
      { x: 10.22, y: t3 },
      { x: 20.44, y: t6 },
      { x: 340.6, y: t100 },
      { x: 681.2, y: t200 },
      { x: 1022.0, y: t300 },
      { x: 2044.0, y: t600 }
    ];

    // Define scaling
    const maxVal = Math.max(t600 * 1.1, 40);
    const scaleX = (x) => 15 + (x / 2044) * 170;
    const scaleY = (y) => 110 - (y / maxVal) * 100;

    // Build grid and axes HTML
    let svgContent = `
      <!-- Grid -->
      <line x1="15" y1="110" x2="185" y2="110" stroke="#cccccc" stroke-width="0.5" />
      <line x1="15" y1="10" x2="15" y2="110" stroke="#cccccc" stroke-width="0.5" />
      <text x="185" y="116" font-size="5" text-anchor="end" fill="#888888">γ (1/s)</text>
      <text x="10" y="10" font-size="5" fill="#888888">τ (lb/100ft²)</text>
    `;

    // 1. Plot Fann Experimental points
    points.forEach(pt => {
      svgContent += `<circle cx="${scaleX(pt.x)}" cy="${scaleY(pt.y)}" r="2.5" fill="#ef4444" />`;
    });

    // 2. Plot Bingham Line (tau = YP + PV * (gamma / 511.8))
    const binghamPoints = [];
    for (let x = 0; x <= 2044; x += 100) {
      const y = yp + pv * (x / 511.8);
      binghamPoints.push(`${scaleX(x)},${scaleY(y)}`);
    }
    svgContent += `<polyline points="${binghamPoints.join(' ')}" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="2,2" />`;

    // 3. Plot Herschel-Bulkley Curve (tau = tau0 + K * gamma^n)
    const hbPoints = [];
    for (let x = 0; x <= 2044; x += 50) {
      const y = tau0 + k * Math.pow(x, n);
      hbPoints.push(`${scaleX(x)},${scaleY(y)}`);
    }
    svgContent += `<polyline points="${hbPoints.join(' ')}" fill="none" stroke="#10b981" stroke-width="1.5" />`;

    svg.innerHTML = svgContent;
  }

  bindAcidEvents() {
    const volInput = document.getElementById('acid-vol');
    const updateAcid = () => {
      const v = parseFloat(volInput.value || 0);
      const ratio = parseFloat(document.getElementById('acid-ratio')?.value || 220);
      const dissolved = v * ratio;
      document.getElementById('acid-dissolved-mass').innerText = `${dissolved.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
    };
    if (volInput) {
      volInput.addEventListener('input', updateAcid);
      updateAcid();
    }
  }

  bindCorrosionEvents(rec) {
    const isH2S = rec.id === 'fluid_inhibitor_h2s';
    if (isH2S) {
      const volInput = document.getElementById('h2s-vol');
      const ppmInput = document.getElementById('h2s-ppm');
      const updateH2S = () => {
        const v = parseFloat(volInput.value || 0);
        const ppm = parseFloat(ppmInput.value || 0);
        // Empirical triazine dosing formula: approx 0.005 L of triazine scavenger per m3 per ppm H2S
        const need = v * ppm * 0.005;
        document.getElementById('h2s-scav-need').innerText = `${need.toLocaleString(undefined, { maximumFractionDigits: 1 })} L`;
      };
      if (volInput && ppmInput) {
        volInput.addEventListener('input', updateH2S);
        ppmInput.addEventListener('input', updateH2S);
        updateH2S();
      }
    } else {
      const volInput = document.getElementById('inh-vol');
      const ppmInput = document.getElementById('inh-ppm');
      const updateInh = () => {
        const v = parseFloat(volInput.value || 0);
        const ppm = parseFloat(ppmInput.value || 0);
        // mass (kg) = vol (m3) * density of water (1000 kg/m3) * ppm / 1,000,000
        const need = v * 1000 * ppm / 1000000;
        document.getElementById('inh-need').innerText = `${need.toFixed(3)} kg`;
      };
      if (volInput && ppmInput) {
        volInput.addEventListener('input', updateInh);
        ppmInput.addEventListener('input', updateInh);
        updateInh();
      }
    }
  }
}

export const details = new WellboreFluidsDetails();
export default details;
