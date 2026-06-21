import { store } from '../../../core/State.js';
import { i18n } from '../../../utils/i18n.js';
import { FormulaTransparency } from '../../../components/FormulaTransparency.js';
import { PDFExporter } from '../../../utils/pdfExport.js';
import { EngineeringRules } from '../../../core/EngineeringRules.js';
import { EngineeringRecommendationEngine } from '../../../core/EngineeringRecommendationEngine.js';
import { EngineeringValidator } from '../../../core/EngineeringValidator.js';
import { EngineeringSafeExecution } from '../../../core/EngineeringSafeExecution.js';
import { EngineeringCalculations, UnitConversions, PhysicalConstants } from '../../../core/EngineeringCalculations.js';
import { mockDb } from '../../../database/mockDb.js';

/**
 * StandardCalcs.js
 * Extracted component containing layout and events for standard calculators:
 * - hydrostatic, capacity, annular, density, pressure, temperature, mud_increase
 */

export class StandardCalcs {
  static renderCalculatorCard(id, lang, unitSystem) {
    const t = (key) => i18n.t(key);
    const displayResultLabel = t('calcs.result');

    let title = '';
    let description = '';
    let formHtml = '';

    const isRu = lang === 'ru';

    if (id === 'hydrostatic') {
      title = t('calcs.hydrostatic_title');
      description = isRu 
        ? "Рассчитывает гидростатическое давление на основе плотности жидкости и измеренной глубины."
        : "Calculates hydrostatic pressure based on fluid density and measured depth.";
      const depthUnit = unitSystem === 'imperial' ? 'ft' : 'м';
      const densityUnit = unitSystem === 'imperial' ? 'ppg' : 'кг/м³';
      const pressUnit = unitSystem === 'imperial' ? 'psi' : 'бар';
      
      const defaultDepth = unitSystem === 'imperial' ? 10000 : 3000;
      const defaultDensity = unitSystem === 'imperial' ? 10.0 : 1200;

      formHtml = `
        <div class="space-y-2.5">
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${t('calcs.depth')} (${depthUnit})</label>
              <input type="number" id="hydrostatic-depth" value="${defaultDepth}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${t('calcs.density')} (${densityUnit})</label>
              <input type="number" id="hydrostatic-density" value="${defaultDensity}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/80 flex justify-between items-center h-10">
            <span class="text-zinc-400 text-[8px] uppercase font-bold">${displayResultLabel}</span>
            <span class="font-mono text-xs font-extrabold text-zinc-950 dark:text-white" id="hydrostatic-result">— ${pressUnit}</span>
          </div>
          
          <!-- Rules Warnings -->
          <div id="hydrostatic-rules-warnings" class="space-y-1.5"></div>
          <!-- Engineering Recommendations -->
          <div id="hydrostatic-recommendations" class="space-y-1.5"></div>
          
          <!-- Formula Transparency -->
          ${FormulaTransparency.render('hydrostatic', lang)}
        </div>
      `;
    } 
    else if (id === 'capacity') {
      title = t('calcs.capacity_title');
      description = isRu
        ? "Рассчитывает внутренний объем трубы на основе ее внутреннего диаметра и длины."
        : "Calculates internal volume capacity of a pipe based on its inner diameter and length.";
      const idUnit = unitSystem === 'imperial' ? 'in' : 'мм';
      const lenUnit = unitSystem === 'imperial' ? 'ft' : 'м';
      const volUnit = unitSystem === 'imperial' ? 'bbl' : (unitSystem === 'metric' ? 'литров' : 'м³');

      const defaultId = unitSystem === 'imperial' ? 4.0 : 100.0;
      const defaultLen = unitSystem === 'imperial' ? 1000 : 300;

      formHtml = `
        <div class="space-y-2.5">
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${t('calcs.inner_dia')} (${idUnit})</label>
              <input type="number" id="capacity-id" value="${defaultId}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${t('calcs.length')} (${lenUnit})</label>
              <input type="number" id="capacity-len" value="${defaultLen}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/80 flex justify-between items-center h-10">
            <span class="text-zinc-400 text-[8px] uppercase font-bold">${displayResultLabel}</span>
            <span class="font-mono text-xs font-extrabold text-zinc-900 dark:text-white" id="capacity-result">— ${volUnit}</span>
          </div>

          <!-- Formula Transparency -->
          ${FormulaTransparency.render('capacity', lang)}
        </div>
      `;
    } 
    else if (id === 'annular') {
      title = t('calcs.annular_title');
      description = isRu
        ? "Рассчитывает объем кольцевого пространства между обсадной колонной/стволом и внутренней трубой."
        : "Calculates annular volume between outer casing/hole and inner pipe based on dimensions and length.";
      const idUnit = unitSystem === 'imperial' ? 'in' : 'мм';
      const lenUnit = unitSystem === 'imperial' ? 'ft' : 'м';
      const volUnit = unitSystem === 'imperial' ? 'bbl' : (unitSystem === 'metric' ? 'литров' : 'м³');

      formHtml = `
        <div class="space-y-2.5">
          <div class="grid grid-cols-3 gap-2">
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${t('calcs.outer_dia')} (${idUnit})</label>
              <input type="number" id="annular-outer" value="${unitSystem === 'imperial' ? 8.5 : 215.9}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${t('calcs.inner_pipe_od')} (${idUnit})</label>
              <input type="number" id="annular-inner" value="${unitSystem === 'imperial' ? 5.0 : 127.0}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${t('calcs.length')} (${lenUnit})</label>
              <input type="number" id="annular-len" value="${unitSystem === 'imperial' ? 1000 : 300}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/80 flex justify-between items-center h-10">
            <span class="text-zinc-400 text-[8px] uppercase font-bold">${displayResultLabel}</span>
            <span class="font-mono text-xs font-extrabold text-zinc-900 dark:text-white" id="annular-result">— ${volUnit}</span>
          </div>

          <!-- Formula Transparency -->
          ${FormulaTransparency.render('annular', lang)}
        </div>
      `;
    } 
    else if (id === 'density') {
      title = t('calcs.density_title');
      description = isRu
        ? "Конвертирует плотность жидкости между PPG (US), удельным весом (SG) и кг/м³."
        : "Converts fluid density between PPG (US), Specific Gravity (SG), and kg/m³.";
      formHtml = `
        <div class="space-y-2.5">
          <div class="grid grid-cols-3 gap-2 font-mono">
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-sans mb-1 truncate">PPG (US)</label>
              <input type="number" id="density-ppg" value="10.0" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-sans mb-1 truncate">SG (г/см³)</label>
              <input type="number" id="density-sg" value="1.20" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-sans mb-1 truncate">кг/м³</label>
              <input type="number" id="density-kgm3" value="1200" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-bold" />
            </div>
          </div>
        </div>
      `;
    } 
    else if (id === 'pressure') {
      title = t('calcs.pressure_title');
      description = isRu
        ? "Конвертирует единицы давления между psi, бар, МПа и атмосферами."
        : "Converts pressure units between psi, bar, MPa, and atmospheres.";
      formHtml = `
        <div class="space-y-2.5">
          <div class="grid grid-cols-2 gap-2 font-mono">
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-sans mb-1 truncate">psi</label>
              <input type="number" id="press-psi" value="3000" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-sans mb-1 truncate">${lang === 'ru' ? 'бар' : 'bar'}</label>
              <input type="number" id="press-bar" value="206.8" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-sans mb-1 truncate">МПа (MPa)</label>
              <input type="number" id="press-mpa" value="20.68" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-sans mb-1 truncate">${lang === 'ru' ? 'атм (atm)' : 'atm'}</label>
              <input type="number" id="press-atm" value="204.1" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-bold" />
            </div>
          </div>
        </div>
      `;
    } 
    else if (id === 'temperature') {
      title = t('calcs.temperature_title');
      description = isRu
        ? "Конвертирует значения температуры между градусами Цельсия (°C) и Фаренгейта (°F)."
        : "Converts temperature values between Celsius (°C) and Fahrenheit (°F).";
      formHtml = `
        <div class="space-y-2.5">
          <div class="grid grid-cols-2 gap-2 font-mono">
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-sans mb-1 truncate">Цельсий (°C)</label>
              <input type="number" id="temp-celsius" value="100" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-855 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase font-sans mb-1 truncate">Фаренгейт (°F)</label>
              <input type="number" id="temp-fahrenheit" value="212" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-855 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-bold" />
            </div>
          </div>
        </div>
      `;
    } 
    else if (id === 'mud_increase') {
      title = t('calcs.mud_increase_title');
      description = isRu
        ? "Рассчитывает требуемый вес барита и увеличение объема для достижения целевой плотности раствора."
        : "Calculates required barite weight and volume increase to reach target mud density.";
      
      const volUnit = unitSystem === 'imperial' ? 'bbl' : 'м³';
      const densityUnit = unitSystem === 'imperial' ? 'ppg' : 'кг/м³';
      
      const defaultVol = unitSystem === 'imperial' ? 1000 : 150;
      const defaultDensInit = unitSystem === 'imperial' ? 10.0 : 1200;
      const defaultDensTarget = unitSystem === 'imperial' ? 12.0 : 1440;
      const defaultBariteDens = unitSystem === 'imperial' ? 35.0 : 4200; // barite density (4.2 sg)

      formHtml = `
        <div class="space-y-2.5">
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${t('calcs.mud_volume')} (${volUnit})</label>
              <input type="number" id="mud-vol" value="${defaultVol}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${t('calcs.mud_dens_initial')} (${densityUnit})</label>
              <input type="number" id="mud-dens-init" value="${defaultDensInit}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${t('calcs.mud_dens_target')} (${densityUnit})</label>
              <input type="number" id="mud-dens-target" value="${defaultDensTarget}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
            <div class="space-y-1">
              <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider mb-1 truncate">${lang === 'ru' ? 'Плотн. утяжелителя' : 'Barite Density'} (${densityUnit})</label>
              <input type="number" id="mud-barite-dens" value="${defaultBariteDens}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-bold" />
            </div>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded-lg border border-zinc-200/40 dark:border-zinc-800/80 space-y-1 text-[10px] h-12 flex flex-col justify-center">
            <div class="flex justify-between items-center">
              <span class="text-zinc-455 dark:text-zinc-500 text-[8px] uppercase font-bold">${t('calcs.barite_needed')}</span>
              <span class="font-mono font-extrabold text-zinc-950 dark:text-white text-right" id="mud-needed-result">—</span>
            </div>
            <div class="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800/60 pt-0.5 mt-0.5">
              <span class="text-zinc-455 dark:text-zinc-500 text-[8px] uppercase font-bold">${t('calcs.added_volume')}</span>
              <span class="font-mono font-semibold text-zinc-650 dark:text-zinc-350 text-right" id="mud-added-result">—</span>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div id="calc-card-${id}" class="calc-card bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors">
        <div class="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-850 pb-2">
          <div class="flex items-center justify-between">
            <h4 class="text-[10px] font-extrabold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider select-none">${title}</h4>
            <div class="flex items-center gap-2">
              ${id === 'hydrostatic' ? `
                <button id="export-${id}-pdf-btn" class="px-1.5 py-0.5 bg-zinc-150 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-750 rounded text-[8.5px] font-semibold flex items-center gap-1 cursor-pointer">
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>
                  <span>PDF</span>
                </button>
              ` : ''}
              <span class="text-zinc-400 dark:text-zinc-660 shrink-0 cursor-grab active:cursor-grabbing">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5"></path></svg>
              </span>
            </div>
          </div>
          <p class="text-[9.5px] text-zinc-500 dark:text-zinc-500 leading-normal">${description}</p>
        </div>
        ${formHtml}
      </div>
    `;
  }

  static bindCalculatorsLogic() {
    const { unitSystem, lang } = store.getState();

    const debounce = (fn, delay = 50) => {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    };

    // --- Calculator 1: Hydrostatic Pressure ---
    const hydroDepth = document.getElementById('hydrostatic-depth');
    const hydroDensity = document.getElementById('hydrostatic-density');
    const hydroResult = document.getElementById('hydrostatic-result');

    if (hydroDepth && hydroDensity && hydroResult) {
      const calcHydro = () => {
        const depthVal = hydroDepth.value;
        const densityVal = hydroDensity.value;
        
        const validation = EngineeringValidator.validateInputs('hydrostatic', { depth: depthVal, density: densityVal }, lang);
        
        const warningsContainer = document.getElementById('hydrostatic-rules-warnings');
        const recsContainer = document.getElementById('hydrostatic-recommendations');
        const { viewMode } = store.getState();

        if (!validation.valid) {
          hydroResult.innerHTML = `<span class="text-rose-500 font-semibold text-[10px]">${validation.error}</span>`;
          if (warningsContainer) warningsContainer.innerHTML = '';
          if (recsContainer) recsContainer.innerHTML = '';
          return;
        }

        const runCalculation = () => {
          const depthRaw = parseFloat(depthVal) || 0;
          const densityRaw = parseFloat(densityVal) || 0;
          
          let depthSI = depthRaw;
          let densitySI = densityRaw;
          
          if (unitSystem === 'imperial') {
            depthSI = depthRaw * UnitConversions.FEET_TO_METERS;
            densitySI = densityRaw * UnitConversions.PPG_TO_KG_M3;
          }
          
          const pressurePa = EngineeringCalculations.calculateHydrostatic(densitySI, depthSI);
          
          let pressure = 0;
          let unit = 'бар';

          if (unitSystem === 'imperial') {
            pressure = pressurePa * UnitConversions.PA_TO_PSI;
            unit = 'psi';
          } else {
            pressure = pressurePa * UnitConversions.PA_TO_BAR;
            unit = lang === 'ru' ? 'бар' : 'bar';
          }
          
          return `${pressure.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 1 })} ${unit}`;
        };

        const execution = EngineeringSafeExecution.execute(runCalculation, '—', {
          calculatorName: 'hydrostatic',
          inputs: { depth: depthVal, density: densityVal }
        });

        if (!execution.success) {
          hydroResult.innerHTML = `<span class="text-rose-500 font-semibold text-[10px]">${lang === 'ru' ? 'Ошибка расчета' : 'Calculation Error'} (ID: ${execution.correlationId})</span>`;
          if (warningsContainer) warningsContainer.innerHTML = '';
          if (recsContainer) recsContainer.innerHTML = '';
          return;
        }

        hydroResult.innerText = execution.value;

        if (warningsContainer) {
          const depth = parseFloat(depthVal) || 0;
          const density = parseFloat(densityVal) || 0;
          const ruleFindings = viewMode !== 'field' ? EngineeringRules.evaluateCalculation('hydrostatic', { density, depth }, { 'Hydrostatic Pressure': execution.value }, lang) : [];
          
          const combinedWarnings = [
            ...validation.warnings.map(text => ({ text, severity: 'warn' })),
            ...ruleFindings
          ];

          if (combinedWarnings.length > 0) {
            warningsContainer.innerHTML = combinedWarnings.map(w => `
              <div class="p-2.5 border border-amber-500/20 dark:border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400 rounded-lg text-[9.5px] leading-relaxed">
                ⚠️ ${w.text}
              </div>
            `).join('');
          } else {
            warningsContainer.innerHTML = '';
          }
        }

        if (recsContainer) {
          const depth = parseFloat(depthVal) || 0;
          const density = parseFloat(densityVal) || 0;
          const recs = EngineeringRecommendationEngine.getRecommendationsForCalculation('hydrostatic', { density, depth }, { 'Hydrostatic Pressure': execution.value }, lang);
          if (recs.length > 0) {
            if (viewMode === 'engineering') {
              recsContainer.innerHTML = recs.map(r => {
                const buttons = r.linkedEntities.map(id => {
                  let targetRec = null;
                  for (const key of Object.keys(mockDb)) {
                    const found = mockDb[key].find(item => item.id === id);
                    if (found) {
                      targetRec = { ...found, module: key === 'acid_environments' ? 'steel-grades' : key };
                      break;
                    }
                  }
                  if (targetRec) {
                    return `
                       <button data-related-id="${targetRec.id}" data-related-module="${targetRec.module}" class="px-1.5 py-0.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700 rounded text-[8.5px] font-semibold cursor-pointer transition-colors">
                        ${lang === 'ru' ? 'Открыть' : 'Open'} ${targetRec.name}
                      </button>
                    `;
                  }
                  return '';
                }).join(' ');

                return `
                  <div class="p-2.5 border border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5 text-zinc-700 dark:text-zinc-300 rounded-lg text-[9.5px] leading-relaxed flex flex-col gap-1.5">
                    <div class="flex items-start gap-1.5">
                      <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span class="font-bold text-zinc-950 dark:text-white">${r.recommendation}</span>
                    </div>
                    <div class="text-[9px] text-zinc-500 dark:text-zinc-400 pl-3.5 border-l border-zinc-100 dark:border-zinc-855">${r.reason}</div>
                    ${buttons ? `<div class="pl-3.5 flex flex-wrap gap-1">${buttons}</div>` : ''}
                  </div>
                `;
              }).join('');
            } else if (viewMode === 'reference' || !viewMode) {
              recsContainer.innerHTML = recs.map(r => `
                <div class="p-2 border border-zinc-200/40 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-zinc-700 dark:text-zinc-300 rounded-lg text-[9.5px] leading-relaxed flex items-start gap-1.5">
                  <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                  <span>${r.recommendation}</span>
                </div>
              `).join('');
            } else if (viewMode === 'field') {
              recsContainer.innerHTML = recs.map(r => `
                <div class="text-[9.5px] text-zinc-800 dark:text-zinc-200 flex items-start gap-1.5 border-t border-zinc-100 dark:border-zinc-855 pt-2">
                  <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                  <span>${r.recommendation}</span>
                </div>
              `).join('');
            }
          } else {
            recsContainer.innerHTML = '';
          }
        }
      };

      const debouncedCalcHydro = debounce(calcHydro, 50);
      hydroDepth.oninput = debouncedCalcHydro;
      hydroDensity.oninput = debouncedCalcHydro;
      calcHydro();

      // Bind PDF Export
      const exportBtn = document.getElementById('export-hydrostatic-pdf-btn');
      if (exportBtn) {
        exportBtn.onclick = (e) => {
          e.stopPropagation();
          const depth = parseFloat(hydroDepth.value) || 0;
          const density = parseFloat(hydroDensity.value) || 0;
          const depthUnit = unitSystem === 'imperial' ? 'ft' : 'м';
          const densityUnit = unitSystem === 'imperial' ? 'ppg' : 'кг/м³';
          
          const inputs = {
            [lang === 'ru' ? 'Вертикальная глубина (TVD)' : 'True Vertical Depth (TVD)']: `${depth} ${depthUnit}`,
            [lang === 'ru' ? 'Плотность жидкости' : 'Fluid Density']: `${density} ${densityUnit}`
          };
          const outputs = {
            [lang === 'ru' ? 'Гидростатическое давление' : 'Hydrostatic Pressure']: hydroResult.innerText
          };
          PDFExporter.exportToPDF('hydrostatic', inputs, outputs, lang, unitSystem);
        };
      }
    }

    // --- Calculator 2: Internal Pipe Capacity ---
    const capId = document.getElementById('capacity-id');
    const capLen = document.getElementById('capacity-len');
    const capResult = document.getElementById('capacity-result');

    if (capId && capLen && capResult) {
      const calcCap = () => {
        const innerDiaVal = capId.value;
        const lengthVal = capLen.value;
        
        const validation = EngineeringValidator.validateInputs('capacity', { length: lengthVal }, lang);
        
        if (!validation.valid) {
          capResult.innerHTML = `<span class="text-rose-500 font-semibold text-[10px]">${validation.error}</span>`;
          return;
        }

        const runCalculation = () => {
          const innerDiaRaw = parseFloat(innerDiaVal) || 0;
          const lengthRaw = parseFloat(lengthVal) || 0;
          
          let innerDiaSI = 0;
          let lengthSI = lengthRaw;
          
          if (unitSystem === 'imperial') {
            innerDiaSI = innerDiaRaw * UnitConversions.INCHES_TO_METERS;
            lengthSI = lengthRaw * UnitConversions.FEET_TO_METERS;
          } else if (unitSystem === 'metric') {
            innerDiaSI = innerDiaRaw * 0.001;
          } else {
            innerDiaSI = innerDiaRaw * UnitConversions.INCHES_TO_METERS;
          }
          
          const volumeM3 = EngineeringCalculations.calculateCapacity(innerDiaSI, lengthSI);
          
          let volume = 0;
          let unit = 'м³';

          if (unitSystem === 'imperial') {
            volume = volumeM3 * UnitConversions.M3_TO_BBL;
            unit = 'bbl';
          } else if (unitSystem === 'metric') {
            volume = volumeM3 * UnitConversions.M3_TO_LITERS;
            unit = lang === 'ru' ? 'литров' : 'liters';
          } else {
            volume = volumeM3;
            unit = 'м³';
          }

          return `${volume.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 2 })} ${unit}`;
        };

        const execution = EngineeringSafeExecution.execute(runCalculation, '—', {
          calculatorName: 'capacity',
          inputs: { innerDia: innerDiaVal, length: lengthVal }
        });

        if (!execution.success) {
          capResult.innerHTML = `<span class="text-rose-500 font-semibold text-[10px]">${lang === 'ru' ? 'Ошибка расчета' : 'Calculation Error'}</span>`;
          return;
        }

        capResult.innerText = execution.value;
      };

      const debouncedCalcCap = debounce(calcCap, 50);
      capId.oninput = debouncedCalcCap;
      capLen.oninput = debouncedCalcCap;
      calcCap();
    }

    // --- Calculator 3: Annular Volume ---
    const annOuter = document.getElementById('annular-outer');
    const annInner = document.getElementById('annular-inner');
    const annLen = document.getElementById('annular-len');
    const annResult = document.getElementById('annular-result');

    if (annOuter && annInner && annLen && annResult) {
      const calcAnn = () => {
        const outerIdVal = annOuter.value;
        const innerOdVal = annInner.value;
        const lengthVal = annLen.value;
        
        const validation = EngineeringValidator.validateInputs('annular', { length: lengthVal }, lang);
        
        if (!validation.valid) {
          annResult.innerHTML = `<span class="text-rose-500 font-semibold text-[10px]">${validation.error}</span>`;
          return;
        }

        const runCalculation = () => {
          const outerIdRaw = parseFloat(outerIdVal) || 0;
          const innerOdRaw = parseFloat(innerOdVal) || 0;
          const lengthRaw = parseFloat(lengthVal) || 0;
          
          let outerIdSI = 0;
          let innerOdSI = 0;
          let lengthSI = lengthRaw;

          if (outerIdRaw <= innerOdRaw) {
            return `0 ${unitSystem === 'imperial' ? 'bbl' : (unitSystem === 'metric' ? (lang === 'ru' ? 'литров' : 'liters') : 'м³')}`;
          }

          if (unitSystem === 'imperial') {
            outerIdSI = outerIdRaw * UnitConversions.INCHES_TO_METERS;
            innerOdSI = innerOdRaw * UnitConversions.INCHES_TO_METERS;
            lengthSI = lengthRaw * UnitConversions.FEET_TO_METERS;
          } else if (unitSystem === 'metric') {
            outerIdSI = outerIdRaw * 0.001;
            innerOdSI = innerOdRaw * 0.001;
          } else {
            outerIdSI = outerIdRaw * UnitConversions.INCHES_TO_METERS;
            innerOdSI = innerOdRaw * UnitConversions.INCHES_TO_METERS;
          }
          
          const volumeM3 = EngineeringCalculations.calculateAnnular(outerIdSI, innerOdSI, lengthSI);
          
          let volume = 0;
          let unit = 'м³';

          if (unitSystem === 'imperial') {
            volume = volumeM3 * UnitConversions.M3_TO_BBL;
            unit = 'bbl';
          } else if (unitSystem === 'metric') {
            volume = volumeM3 * UnitConversions.M3_TO_LITERS;
            unit = lang === 'ru' ? 'литров' : 'liters';
          } else {
            volume = volumeM3;
            unit = 'м³';
          }

          return `${volume.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: 2 })} ${unit}`;
        };

        const execution = EngineeringSafeExecution.execute(runCalculation, '—', {
          calculatorName: 'annular',
          inputs: { outerId: outerIdVal, innerOd: innerOdVal, length: lengthVal }
        });

        if (!execution.success) {
          annResult.innerHTML = `<span class="text-rose-500 font-semibold text-[10px]">${lang === 'ru' ? 'Ошибка расчета' : 'Calculation Error'}</span>`;
          return;
        }

        annResult.innerText = execution.value;
      };

      const debouncedCalcAnn = debounce(calcAnn, 50);
      annOuter.oninput = debouncedCalcAnn;
      annInner.oninput = debouncedCalcAnn;
      annLen.oninput = debouncedCalcAnn;
      calcAnn();
    }

    // --- Calculator 4: Density Converter ---
    const densPpg = document.getElementById('density-ppg');
    const densSg = document.getElementById('density-sg');
    const densKgm3 = document.getElementById('density-kgm3');

    if (densPpg && densSg && densKgm3) {
      densPpg.oninput = () => {
        const val = parseFloat(densPpg.value) || 0;
        densSg.value = (val / 8.3454).toFixed(3);
        densKgm3.value = Math.round(val * 119.826427);
      };
      densSg.oninput = () => {
        const val = parseFloat(densSg.value) || 0;
        densPpg.value = (val * 8.3454).toFixed(2);
        densKgm3.value = Math.round(val * 1000);
      };
      densKgm3.oninput = () => {
        const val = parseFloat(densKgm3.value) || 0;
        densSg.value = (val / 1000.0).toFixed(3);
        densPpg.value = (val / 119.826427).toFixed(2);
      };
    }

    // --- Calculator 5: Pressure Converter ---
    const prPsi = document.getElementById('press-psi');
    const prBar = document.getElementById('press-bar');
    const prMpa = document.getElementById('press-mpa');
    const prAtm = document.getElementById('press-atm');

    if (prPsi && prBar && prMpa && prAtm) {
      prPsi.oninput = () => {
        const val = parseFloat(prPsi.value) || 0;
        prBar.value = (val / 14.5038).toFixed(1);
        prMpa.value = (val / 145.038).toFixed(3);
        prAtm.value = (val / 14.6959).toFixed(1);
      };
      prBar.oninput = () => {
        const val = parseFloat(prBar.value) || 0;
        prPsi.value = Math.round(val * 14.5038);
        prMpa.value = (val / 10.0).toFixed(3);
        prAtm.value = (val * 0.986923).toFixed(1);
      };
      prMpa.oninput = () => {
        const val = parseFloat(prMpa.value) || 0;
        prPsi.value = Math.round(val * 145.038);
        prBar.value = (val * 10.0).toFixed(1);
        prAtm.value = (val * 9.86923).toFixed(1);
      };
      prAtm.oninput = () => {
        const val = parseFloat(prAtm.value) || 0;
        prPsi.value = Math.round(val * 14.6959);
        prBar.value = (val / 0.986923).toFixed(1);
        prMpa.value = (val / 9.86923).toFixed(3);
      };
    }

    // --- Calculator 6: Temperature Converter ---
    const tempC = document.getElementById('temp-celsius');
    const tempF = document.getElementById('temp-fahrenheit');

    if (tempC && tempF) {
      tempC.oninput = () => {
        const val = parseFloat(tempC.value) || 0;
        tempF.value = Math.round(val * 1.8 + 32);
      };
      tempF.oninput = () => {
        const val = parseFloat(tempF.value) || 0;
        tempC.value = Math.round((val - 32) / 1.8);
      };
    }

    // --- Calculator 7: Mud Weight Increase (Barite Needed) ---
    const mudVol = document.getElementById('mud-vol');
    const mudDensInit = document.getElementById('mud-dens-init');
    const mudDensTarget = document.getElementById('mud-dens-target');
    const mudBariteDens = document.getElementById('mud-barite-dens');
    const mudNeededResult = document.getElementById('mud-needed-result');
    const mudAddedResult = document.getElementById('mud-added-result');

    if (mudVol && mudDensInit && mudDensTarget && mudBariteDens && mudNeededResult && mudAddedResult) {
      const calcMud = () => {
        const volRaw = parseFloat(mudVol.value) || 0;
        const densInitRaw = parseFloat(mudDensInit.value) || 0;
        const densTargetRaw = parseFloat(mudDensTarget.value) || 0;
        const bariteDensRaw = parseFloat(mudBariteDens.value) || 0;

        if (densTargetRaw <= densInitRaw || bariteDensRaw <= densTargetRaw) {
          mudNeededResult.innerText = `—`;
          mudAddedResult.innerText = `—`;
          return;
        }

        let volSI = volRaw;
        let densInitSI = densInitRaw;
        let densTargetSI = densTargetRaw;
        let bariteDensSI = bariteDensRaw;

        if (unitSystem === 'imperial') {
          volSI = volRaw * UnitConversions.BBL_TO_M3;
          densInitSI = densInitRaw * UnitConversions.PPG_TO_KG_M3;
          densTargetSI = densTargetRaw * UnitConversions.PPG_TO_KG_M3;
          bariteDensSI = bariteDensRaw * UnitConversions.PPG_TO_KG_M3;
        }

        const calcs = EngineeringCalculations.calculateMudWeighting(volSI, densInitSI, densTargetSI, bariteDensSI);

        let massNeeded = calcs.massNeededKg;
        let volAdded = calcs.volAddedM3;

        if (unitSystem === 'imperial') {
          massNeeded = calcs.massNeededKg * UnitConversions.KG_TO_LBS;
          volAdded = calcs.volAddedM3 * UnitConversions.M3_TO_BBL;
          const sacks = massNeeded / 100.0;
          mudNeededResult.innerText = `${Math.round(massNeeded).toLocaleString()} lbs (${Math.round(sacks)} sacks)`;
          mudAddedResult.innerText = `+${volAdded.toFixed(1)} bbl`;
        } else {
          if (massNeeded >= 1000) {
            const tonnes = massNeeded / 1000.0;
            mudNeededResult.innerText = `${tonnes.toFixed(2)} тонн (${Math.round(massNeeded).toLocaleString()} кг)`;
          } else {
            mudNeededResult.innerText = `${Math.round(massNeeded).toLocaleString()} кг`;
          }
          mudAddedResult.innerText = `+${volAdded.toFixed(2)} м³`;
        }
      };

      mudVol.oninput = calcMud;
      mudDensInit.oninput = calcMud;
      mudDensTarget.oninput = calcMud;
      mudBariteDens.oninput = calcMud;
      calcMud();
    }
  }
}
