import { store } from '../../../core/State.js';
import { FormulaTransparency } from '../../../components/FormulaTransparency.js';
import { EngineeringDisclaimer } from '../../../components/EngineeringDisclaimer.js';
import { PDFExporter } from '../../../utils/pdfExport.js';
import { EngineeringCalculations, UnitConversions, PhysicalConstants } from '../../../core/EngineeringCalculations.js';
import { EngineeringValidator } from '../../../core/EngineeringValidator.js';
import { EngineeringRecommendationEngine } from '../../../core/EngineeringRecommendationEngine.js';
import { EngineeringSafeExecution } from '../../../core/EngineeringSafeExecution.js';
import { mockDb } from '../../../database/mockDb.js';

/**
 * AdvancedCalcs.js
 * Extracted component containing layout and events for advanced calculations:
 * - Displacement Volume, Annular Capacity Reference Table, Hydrostatic Gradient Reference Table, Thermal Expansion, Hook Load & Buoyancy
 */

export class AdvancedCalcs {
  static renderAdvancedCalculators(lang, unitSystem, advInputs) {
    const isRu = lang === 'ru';

    // 1. Cementing & Caliper default fallbacks
    advInputs.cemBitSize = advInputs.cemBitSize !== undefined ? advInputs.cemBitSize : (unitSystem === 'imperial' ? 8.5 : 215.9);
    advInputs.cemCsgOd = advInputs.cemCsgOd !== undefined ? advInputs.cemCsgOd : (unitSystem === 'imperial' ? 7.0 : 177.8);
    advInputs.cemTd = advInputs.cemTd !== undefined ? advInputs.cemTd : (unitSystem === 'imperial' ? 5000 : 1500);
    advInputs.cemToc = advInputs.cemToc !== undefined ? advInputs.cemToc : (unitSystem === 'imperial' ? 3500 : 1000);
    advInputs.cemExcess = advInputs.cemExcess !== undefined ? advInputs.cemExcess : 15;
    advInputs.caliperLoaded = advInputs.caliperLoaded !== undefined ? advInputs.caliperLoaded : false;
    advInputs.caliperAvg = advInputs.caliperAvg !== undefined ? advInputs.caliperAvg : 0;
    advInputs.caliperPoints = advInputs.caliperPoints !== undefined ? advInputs.caliperPoints : 0;
    advInputs.caliperFile = advInputs.caliperFile !== undefined ? advInputs.caliperFile : '';

    let bitSI = advInputs.cemBitSize;
    let csgSI = advInputs.cemCsgOd;
    let tdSI = advInputs.cemTd;
    let tocSI = advInputs.cemToc;
    
    if (unitSystem === 'imperial') {
      bitSI = bitSI * UnitConversions.INCHES_TO_METERS;
      csgSI = csgSI * UnitConversions.INCHES_TO_METERS;
      tdSI = tdSI * UnitConversions.FEET_TO_METERS;
      tocSI = tocSI * UnitConversions.FEET_TO_METERS;
    } else {
      bitSI = bitSI * 0.001;
      csgSI = csgSI * 0.001;
    }

    const intervalLen = Math.max(0, tdSI - tocSI);
    let annVolM3 = 0;

    if (advInputs.caliperLoaded && advInputs.caliperAvg > 0) {
      let avgBitSI = advInputs.caliperAvg;
      if (unitSystem === 'imperial') {
        avgBitSI = avgBitSI * UnitConversions.INCHES_TO_METERS;
      } else {
        avgBitSI = avgBitSI * 0.001;
      }
      annVolM3 = EngineeringCalculations.calculateAnnular(avgBitSI, csgSI, intervalLen);
    } else {
      annVolM3 = EngineeringCalculations.calculateAnnular(bitSI, csgSI, intervalLen);
    }

    const totalVolM3 = annVolM3 * (1.0 + advInputs.cemExcess / 100.0);
    
    let slurryVol = 0;
    let slurryUnit = 'м³';
    if (unitSystem === 'imperial') {
      slurryVol = totalVolM3 * UnitConversions.M3_TO_BBL;
      slurryUnit = 'bbl';
    } else if (unitSystem === 'metric') {
      slurryVol = totalVolM3 * UnitConversions.M3_TO_LITERS;
      slurryUnit = isRu ? 'литров' : 'liters';
    } else {
      slurryVol = totalVolM3;
      slurryUnit = 'м³';
    }

    const slurryLiters = totalVolM3 * 1000.0;
    const dryCementKg = slurryLiters * 1.15;
    
    let cementVal = 0;
    let cementUnit = 'кг';
    if (unitSystem === 'imperial') {
      cementVal = dryCementKg * 2.20462;
      cementUnit = 'lbs';
    } else {
      if (dryCementKg >= 1000.0) {
        cementVal = dryCementKg / 1000.0;
        cementUnit = isRu ? 'тонн' : 'mt';
      } else {
        cementVal = dryCementKg;
        cementUnit = 'кг';
      }
    }

    const waterLiters = dryCementKg * 0.44;
    let waterVal = 0;
    let waterUnit = 'л';
    if (unitSystem === 'imperial') {
      waterVal = waterLiters * 0.264172;
      waterUnit = 'gal';
    } else {
      if (waterLiters >= 1000.0) {
        waterVal = waterLiters / 1000.0;
        waterUnit = 'м³';
      } else {
        waterVal = waterLiters;
        waterUnit = 'л';
      }
    }

    // 2. Displacement Volume
    const dOd = advInputs.dispOd;
    const dId = advInputs.dispId;
    const dLen = advInputs.dispLen;
    let dispVol = 0;
    let dispUnit = 'м³';
    
    if (unitSystem === 'imperial') {
      dispVol = (Math.pow(dOd, 2) - Math.pow(dId, 2)) / 1029.4 * dLen;
      dispUnit = 'bbl';
    } else if (unitSystem === 'metric') {
      dispVol = (Math.PI * (Math.pow(dOd, 2) - Math.pow(dId, 2)) / 4000000) * dLen * 1000; // liters
      dispUnit = isRu ? 'литров' : 'liters';
    } else {
      const od_m = dOd * 0.0254;
      const id_m = dId * 0.0254;
      dispVol = (Math.PI * (Math.pow(od_m, 2) - Math.pow(id_m, 2)) / 4) * dLen;
      dispUnit = 'м³';
    }

    // 5. Thermal Expansion
    const tLen = advInputs.thermalLen;
    const tDt = advInputs.thermalDt;
    let elongation = 0;
    let elongUnit = 'мм';
    
    if (unitSystem === 'imperial') {
      elongation = tLen * 6.7e-6 * tDt * 12; // inches
      elongUnit = 'in';
    } else {
      elongation = tLen * 12e-6 * tDt * 1000; // mm
      elongUnit = 'мм';
    }

    // 6. Hook Load & Buoyancy
    const airWt = advInputs.hookAirWeight;
    const mudDens = advInputs.hookMudDensity;
    const dragPct = advInputs.hookDrag;
    
    let bf = 1.0;
    let wtUnit = 'кг';
    if (unitSystem === 'imperial') {
      bf = 1.0 - (mudDens / 65.5);
      wtUnit = 'lbs';
    } else if (unitSystem === 'metric') {
      bf = 1.0 - (mudDens / 7850.0);
      wtUnit = 'кг';
    } else {
      bf = 1.0 - (mudDens / 7.85);
      wtUnit = isRu ? 'тонн' : 'mt';
    }
    
    bf = Math.max(0, Math.min(1, bf));
    const wetWt = airWt * bf;
    const pickupWt = wetWt * (1.0 + dragPct / 100.0);
    const slackoffWt = wetWt * (1.0 - dragPct / 100.0);

    const fNum = (val, maxDec = 2) => val.toLocaleString(isRu ? 'ru-RU' : 'en-US', { maximumFractionDigits: maxDec });

    return `
      <div class="space-y-4">
        <!-- Disclaimer -->
        ${EngineeringDisclaimer.render(lang)}
        
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          <!-- 1. Справочный расчет цементирования -->
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h4 class="text-[10px] font-extrabold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-855 pb-2 flex justify-between items-center">
                <span>${isRu ? '1. Справочный расчет цементирования (Cementing & Caliper)' : '1. Cementing Volume & Caliper Calculator'}</span>
                <button id="export-cement-pdf-btn" class="px-2 py-0.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-250 text-white dark:text-zinc-900 rounded text-[9px] font-semibold flex items-center gap-1 cursor-pointer shadow-sm shrink-0">
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>
                  <span>PDF</span>
                </button>
              </h4>
              <div class="mt-3 space-y-3.5">
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">${isRu ? 'Диаметр долота (D_bit)' : 'Bit Diameter (D_bit)'} (${unitSystem === 'imperial' ? 'in' : 'мм'})</label>
                    <input type="number" step="0.1" id="adv-cem-bit" value="${advInputs.cemBitSize}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">${isRu ? 'Диаметр колонны (OD_csg)' : 'Casing OD (OD_csg)'} (${unitSystem === 'imperial' ? 'in' : 'мм'})</label>
                    <input type="number" step="0.1" id="adv-cem-csg" value="${advInputs.cemCsgOd}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-2">
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">${isRu ? 'Забой (TD)' : 'Total Depth (TD)'} (${unitSystem === 'imperial' ? 'ft' : 'м'})</label>
                    <input type="number" id="adv-cem-td" value="${advInputs.cemTd}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">${isRu ? 'Подъем (TOC)' : 'Top of Cement (TOC)'} (${unitSystem === 'imperial' ? 'ft' : 'м'})</label>
                    <input type="number" id="adv-cem-toc" value="${advInputs.cemToc}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">${isRu ? 'Избыток (Ex)' : 'Excess (Ex)'} (%)</label>
                    <input type="number" id="adv-cem-excess" value="${advInputs.cemExcess}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                </div>

                <div class="flex items-center gap-2 pt-1.5 flex-wrap">
                  <span class="text-[8px] font-bold text-zinc-455 dark:text-zinc-500 uppercase">${isRu ? 'Пресеты Ex:' : 'Ex Presets:'}</span>
                  <button id="adv-cem-preset-nom" class="px-2 py-0.5 text-[8.5px] border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-850 text-zinc-650 dark:text-zinc-400 cursor-pointer font-semibold">0%</button>
                  <button id="adv-cem-preset-cav" class="px-2 py-0.5 text-[8.5px] border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-850 text-zinc-650 dark:text-zinc-400 cursor-pointer font-semibold">15%</button>
                  <button id="adv-cem-preset-wash" class="px-2 py-0.5 text-[8.5px] border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-850 text-zinc-650 dark:text-zinc-400 cursor-pointer font-semibold">30%</button>
                  
                  <div class="ml-auto">
                    <input type="file" id="adv-cem-file-input" class="hidden" accept=".csv,.txt,.las" />
                    <button id="adv-cem-upload-btn" class="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-750 dark:text-zinc-300 border border-zinc-300/40 dark:border-zinc-700/60 rounded text-[9px] font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0017.25 4.5H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z"></path></svg>
                      <span>${isRu ? 'Загрузить Caliper' : 'Upload Caliper'}</span>
                    </button>
                  </div>
                </div>

                <div id="adv-cem-caliper-status" class="${advInputs.caliperLoaded ? '' : 'hidden'} text-[9px] font-semibold text-emerald-600 dark:text-emerald-455 bg-emerald-50/20 dark:bg-emerald-950/10 p-1.5 rounded border border-emerald-500/10 flex items-center justify-between">
                  <span id="adv-cem-caliper-status-text">${advInputs.caliperLoaded ? (isRu ? `Кавернограмма ${advInputs.caliperFile} (D_avg: ${fNum(advInputs.caliperAvg, 1)} ${unitSystem === 'imperial' ? 'in' : 'мм'}, точек: ${advInputs.caliperPoints})` : `Caliper Log ${advInputs.caliperFile} (D_avg: ${fNum(advInputs.caliperAvg, 1)} ${unitSystem === 'imperial' ? 'in' : 'mm'}, points: ${advInputs.caliperPoints})`) : ''}</span>
                  <button id="adv-cem-clear-caliper" class="text-[8px] uppercase tracking-wider text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 cursor-pointer font-extrabold ml-2">${isRu ? 'Очистить' : 'Clear'}</button>
                </div>

                <div class="bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded border border-zinc-200/40 dark:border-zinc-800/80 space-y-1.5 text-[10px]">
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-500 dark:text-zinc-500 text-[8px] uppercase font-bold">${isRu ? 'Объем раствора (V_cem)' : 'Slurry Volume (V_cem)'}</span>
                    <span class="font-mono font-extrabold text-emerald-600 dark:text-emerald-455" id="adv-cem-result-vol">${fNum(slurryVol)} ${slurryUnit}</span>
                  </div>
                  <div class="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
                    <span class="text-zinc-500 dark:text-zinc-550 text-[8px] uppercase font-bold">${isRu ? 'Сухой цемент G' : 'Dry Cement G'}</span>
                    <span class="font-mono font-extrabold text-zinc-950 dark:text-white" id="adv-cem-result-cem">${fNum(cementVal)} ${cementUnit}</span>
                  </div>
                  <div class="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
                    <span class="text-zinc-500 dark:text-zinc-550 text-[8px] uppercase font-bold">${isRu ? 'Вода затворения' : 'Mixing Water'}</span>
                    <span class="font-mono font-extrabold text-zinc-950 dark:text-white" id="adv-cem-result-wat">${fNum(waterVal)} ${waterUnit}</span>
                  </div>
                </div>

                <!-- Formula Transparency -->
                ${FormulaTransparency.render('cement_volume', lang)}
              </div>
            </div>
          </div>
          
          <!-- 2. Displacement Volume -->
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h4 class="text-[10px] font-extrabold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-855 pb-2 flex justify-between items-center">
                <span>${isRu ? '2. Объем вытеснения раствора (Displacement)' : '2. Tubular Displacement Volume'}</span>
                <button id="export-disp-pdf-btn" class="px-2 py-0.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-250 text-white dark:text-zinc-900 rounded text-[9px] font-semibold flex items-center gap-1 cursor-pointer shadow-sm shrink-0">
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>
                  <span>PDF</span>
                </button>
              </h4>
              <div class="mt-3 space-y-3.5">
                <div class="grid grid-cols-3 gap-2">
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">${isRu ? 'Наружный (OD)' : 'Pipe OD'} (${unitSystem === 'imperial' ? 'in' : 'мм'})</label>
                    <input type="number" id="adv-disp-od" value="${dOd}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">${isRu ? 'Внутренний (ID)' : 'Pipe ID'} (${unitSystem === 'imperial' ? 'in' : 'мм'})</label>
                    <input type="number" id="adv-disp-id" value="${dId}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-wider">${isRu ? 'Длина' : 'Length'} (${unitSystem === 'imperial' ? 'ft' : 'м'})</label>
                    <input type="number" id="adv-disp-len" value="${dLen}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                </div>
 
                <div class="bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded border border-zinc-200/40 dark:border-zinc-800/80 flex justify-between items-center">
                  <span class="text-zinc-500 dark:text-zinc-500 text-[8px] uppercase font-bold">${isRu ? 'Объем вытеснения' : 'Displacement Volume'}</span>
                  <span class="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-455" id="adv-disp-result">${fNum(dispVol)} ${dispUnit}</span>
                </div>
 
                <!-- Formula Transparency -->
                ${FormulaTransparency.render('displacement', lang)}
              </div>
            </div>
          </div>
 
          <!-- 2. Annular Capacity Reference Table -->
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h4 class="text-[10px] font-extrabold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-2">
              ${isRu ? '2. Емкость затрубного пространства (Annular Capacity)' : '2. Annular Capacity Reference Table'}
            </h4>
            <div class="overflow-x-auto">
              <table class="w-full text-[10px] text-left font-mono">
                <thead>
                  <tr class="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-[8px] uppercase font-sans">
                    <th class="py-2">${isRu ? 'Диаметр ствола (Hole/Casing)' : 'Hole/Casing Size'}</th>
                    <th class="py-2">${isRu ? 'Внутренняя труба' : 'Inner Pipe'}</th>
                    <th class="py-2 text-right">${isRu ? 'Емкость' : 'Annular Capacity'}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100 dark:divide-zinc-850 text-zinc-700 dark:text-zinc-300">
                  ${unitSystem === 'imperial' ? `
                    <tr><td class="py-2">8.50" Hole</td><td class="py-2">5.00" Drill Pipe</td><td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">0.0459 bbl/ft</td></tr>
                    <tr><td class="py-2">12.25" Hole</td><td class="py-2">9.625" Casing</td><td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">0.0558 bbl/ft</td></tr>
                    <tr><td class="py-2">7.00" Casing (6.185" ID)</td><td class="py-2">3.50" Tubing</td><td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">0.0250 bbl/ft</td></tr>
                    <tr><td class="py-2">9.625" Casing (8.835" ID)</td><td class="py-2">4.50" Tubing</td><td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">0.0573 bbl/ft</td></tr>
                    <tr><td class="py-2">8.50" Hole</td><td class="py-2">2.875" Tubing</td><td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">0.0620 bbl/ft</td></tr>
                  ` : `
                    <tr><td class="py-2">215.9 мм Hole</td><td class="py-2">127.0 мм DP</td><td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">23.90 л/м</td></tr>
                    <tr><td class="py-2">311.2 мм Hole</td><td class="py-2">244.5 мм Casing</td><td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">29.07 л/м</td></tr>
                    <tr><td class="py-2">177.8 мм Casing</td><td class="py-2">88.9 мм Tubing</td><td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">13.00 л/м</td></tr>
                    <tr><td class="py-2">244.5 мм Casing</td><td class="py-2">114.3 мм Tubing</td><td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">29.85 л/м</td></tr>
                    <tr><td class="py-2">215.9 мм Hole</td><td class="py-2">73.0 мм Tubing</td><td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">32.30 л/м</td></tr>
                  `}
                </tbody>
              </table>
            </div>
          </div>
 
          <!-- 3. Hydrostatic Gradient Reference Table -->
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h4 class="text-[10px] font-extrabold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-2">
              ${isRu ? '3. Справочник градиентов давления' : '3. Hydrostatic Pressure Gradients'}
            </h4>
            <div class="overflow-x-auto">
              <table class="w-full text-[10px] text-left font-mono">
                <thead>
                  <tr class="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-[8px] uppercase font-sans">
                    <th class="py-2">SG (г/см³)</th>
                    <th class="py-2">PPG (US)</th>
                    <th class="py-2">кг/м³</th>
                    <th class="py-2 text-right">${isRu ? 'Градиент (psi/ft)' : 'Gradient (psi/ft)'}</th>
                    <th class="py-2 text-right">${isRu ? 'Градиент (бар/м)' : 'Gradient (bar/m)'}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100 dark:divide-zinc-855 text-zinc-700 dark:text-zinc-350">
                  <tr><td class="py-1.5">1.00</td><td class="py-1.5">8.33</td><td class="py-1.5">1000</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.433</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.098</td></tr>
                  <tr><td class="py-1.5">1.20</td><td class="py-1.5">10.00</td><td class="py-1.5">1200</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.520</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.118</td></tr>
                  <tr><td class="py-1.5">1.40</td><td class="py-1.5">11.66</td><td class="py-1.5">1400</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.606</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.137</td></tr>
                  <tr><td class="py-1.5">1.60</td><td class="py-1.5">13.33</td><td class="py-1.5">1600</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.693</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.157</td></tr>
                  <tr><td class="py-1.5">1.80</td><td class="py-1.5">15.00</td><td class="py-1.5">1800</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.779</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.177</td></tr>
                  <tr><td class="py-1.5">2.00</td><td class="py-1.5">16.66</td><td class="py-1.5">2000</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.866</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.196</td></tr>
                  <tr><td class="py-1.5">2.20</td><td class="py-1.5">18.33</td><td class="py-1.5">2200</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.953</td><td class="py-1.5 text-right font-semibold text-zinc-900 dark:text-white">0.216</td></tr>
                </tbody>
              </table>
            </div>
          </div>
 
          <!-- 4. Thermal Expansion -->
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h4 class="text-[10px] font-extrabold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-855 pb-2 flex justify-between items-center">
                <span>${isRu ? '4. Температурное расширение колонны' : '4. Thermal Elongation Calculator'}</span>
                <button id="export-thermal-pdf-btn" class="px-2 py-0.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-250 text-white dark:text-zinc-900 rounded text-[9px] font-semibold flex items-center gap-1 cursor-pointer shadow-sm shrink-0">
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>
                  <span>PDF</span>
                </button>
              </h4>
              <div class="mt-3 space-y-3.5">
                <div class="grid grid-cols-2 gap-2">
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${isRu ? 'Начальная длина' : 'String Length'} (${unitSystem === 'imperial' ? 'ft' : 'м'})</label>
                    <input type="number" id="adv-thermal-len" value="${tLen}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${isRu ? 'Разница темп. (ΔT)' : 'Temp Change (ΔT)'} (${unitSystem === 'imperial' ? '°F' : '°C'})</label>
                    <input type="number" id="adv-thermal-dt" value="${tDt}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                </div>
 
                <div class="bg-zinc-50 dark:bg-zinc-855 p-2.5 rounded border border-zinc-200/40 dark:border-zinc-800/80 flex justify-between items-center">
                  <span class="text-zinc-455 dark:text-zinc-550 text-[8px] uppercase font-bold">${isRu ? 'Удлинение колонны (ΔL)' : 'Total Elongation (ΔL)'}</span>
                  <span class="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-450" id="adv-thermal-result">${fNum(elongation, 1)} ${elongUnit}</span>
                </div>
 
                <!-- Formula Transparency -->
                ${FormulaTransparency.render('thermal', lang)}
              </div>
            </div>
          </div>
 
          <!-- 5. Hook Load & Buoyancy -->
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h4 class="text-[10px] font-extrabold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-855 pb-2 flex justify-between items-center">
                <span>${isRu ? '5. Вес колонны в растворе и нагрузки' : '5. Hook Load & Buoyancy Calculator'}</span>
                <button id="export-hook-pdf-btn" class="px-2 py-0.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-250 text-white dark:text-zinc-900 rounded text-[9px] font-semibold flex items-center gap-1 cursor-pointer shadow-sm shrink-0">
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>
                  <span>PDF</span>
                </button>
              </h4>
              <div class="mt-3 space-y-3">
                <div class="grid grid-cols-3 gap-2">
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${isRu ? 'Вес в воздухе' : 'Air Weight'} (${wtUnit})</label>
                    <input type="number" id="adv-hook-air" value="${airWt}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      ${isRu ? 'Плотн. раствора' : 'Mud Density'} (${unitSystem === 'imperial' ? 'ppg' : (unitSystem === 'metric' ? 'кг/м³' : 'sg')})
                    </label>
                    <input type="number" id="adv-hook-mud" value="${mudDens}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${isRu ? 'Трение / Люфт' : 'Friction / Drag'} (%)</label>
                    <input type="number" id="adv-hook-drag" value="${dragPct}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2 outline-none font-mono font-semibold" />
                  </div>
                </div>
 
                <div class="bg-zinc-50 dark:bg-zinc-850 p-2.5 rounded border border-zinc-200/40 dark:border-zinc-800/80 space-y-1.5 text-[10px]">
                  <div class="flex justify-between items-center">
                    <span class="text-zinc-455 dark:text-zinc-500 text-[8px] uppercase font-bold">${isRu ? 'Коэф. плавучести (BF)' : 'Buoyancy Factor (BF)'}</span>
                    <span class="font-mono font-bold text-zinc-900 dark:text-zinc-200" id="adv-hook-bf">${fNum(bf, 4)}</span>
                  </div>
                  <div class="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
                    <span class="text-zinc-500 dark:text-zinc-550 text-[8px] uppercase font-bold">${isRu ? 'Вес в растворе' : 'Buoyancy Weight'}</span>
                    <span class="font-mono font-extrabold text-zinc-950 dark:text-white" id="adv-hook-wet">${fNum(wetWt, 0)} ${wtUnit}</span>
                  </div>
                  <div class="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
                    <span class="text-zinc-500 dark:text-zinc-555 text-[8px] uppercase font-bold text-emerald-600 dark:text-emerald-450">${isRu ? 'Нагрузка подъема (Pickup)' : 'Pickup Hook Load'}</span>
                    <span class="font-mono font-extrabold text-emerald-600 dark:text-emerald-450" id="adv-hook-pickup">${fNum(pickupWt, 0)} ${wtUnit}</span>
                  </div>
                  <div class="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
                    <span class="text-zinc-455 dark:text-zinc-550 text-[8px] uppercase font-bold text-blue-600 dark:text-blue-450">${isRu ? 'Нагрузка спуска (Slackoff)' : 'Slackoff Hook Load'}</span>
                    <span class="font-mono font-extrabold text-blue-600 dark:text-blue-455" id="adv-hook-slackoff">${fNum(slackoffWt, 0)} ${wtUnit}</span>
                  </div>
                </div>
 
                <!-- Hook Load Recommendations -->
                <div id="hook-load-warnings-recs" class="space-y-1.5 mt-2"></div>
 
                <!-- Formulas -->
                ${FormulaTransparency.render('buoyancy', lang)}
                ${FormulaTransparency.render('hook_load', lang)}
              </div>
            </div>
          </div>
 
        </div>
      </div>
    `;
  }

  static bindAdvancedCalculatorsLogic(advInputs) {
    const { unitSystem, lang } = store.getState();
    const fNum = (val, maxDec = 2) => val.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US', { maximumFractionDigits: maxDec });

    const debounce = (fn, delay = 50) => {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    };

    // 1. Displacement Volume
    const dOd = document.getElementById('adv-disp-od');
    const dId = document.getElementById('adv-disp-id');
    const dLen = document.getElementById('adv-disp-len');
    const dResult = document.getElementById('adv-disp-result');
    let dispUnit = 'м³';
    if (unitSystem === 'imperial') dispUnit = 'bbl';
    else if (unitSystem === 'metric') dispUnit = lang === 'ru' ? 'литров' : 'liters';

    if (dOd && dId && dLen && dResult) {
      const calcDisp = () => {
        advInputs.dispOd = parseFloat(dOd.value) || 0;
        advInputs.dispId = parseFloat(dId.value) || 0;
        advInputs.dispLen = parseFloat(dLen.value) || 0;
        
        const od = advInputs.dispOd;
        const id = advInputs.dispId;
        const len = advInputs.dispLen;
        let odSI = od;
        let idSI = id;
        let lenSI = len;

        if (unitSystem === 'imperial') {
          odSI = od * UnitConversions.INCHES_TO_METERS;
          idSI = id * UnitConversions.INCHES_TO_METERS;
          lenSI = len * UnitConversions.FEET_TO_METERS;
        } else if (unitSystem === 'metric') {
          odSI = od * 0.001;
          idSI = id * 0.001;
        } else {
          odSI = od * UnitConversions.INCHES_TO_METERS;
          idSI = id * UnitConversions.INCHES_TO_METERS;
        }

        const volM3 = EngineeringCalculations.calculateAnnular(odSI, idSI, lenSI);
        let vol = 0;

        if (unitSystem === 'imperial') {
          vol = volM3 * UnitConversions.M3_TO_BBL;
        } else if (unitSystem === 'metric') {
          vol = volM3 * UnitConversions.M3_TO_LITERS;
        } else {
          vol = volM3;
        }
        
        dResult.innerText = `${fNum(vol)} ${dispUnit}`;
      };
      
      dOd.oninput = calcDisp;
      dId.oninput = calcDisp;
      dLen.oninput = calcDisp;

      // Bind Displacement PDF Export
      const exportBtn = document.getElementById('export-disp-pdf-btn');
      if (exportBtn) {
        exportBtn.onclick = () => {
          const od = parseFloat(dOd.value) || 0;
          const id = parseFloat(dId.value) || 0;
          const len = parseFloat(dLen.value) || 0;
          const inputs = {
            [lang === 'ru' ? 'Наружный диаметр (OD)' : 'Pipe Outer Diameter (OD)']: `${od} ${unitSystem === 'imperial' ? 'in' : 'мм'}`,
            [lang === 'ru' ? 'Внутренний диаметр (ID)' : 'Pipe Inner Diameter (ID)']: `${id} ${unitSystem === 'imperial' ? 'in' : 'мм'}`,
            [lang === 'ru' ? 'Длина спускаемой колонны' : 'Length of Pipe String']: `${len} ${unitSystem === 'imperial' ? 'ft' : 'м'}`
          };
          const outputs = {
            [lang === 'ru' ? 'Объем вытеснения металла' : 'Steel Displacement Volume']: dResult.innerText
          };
          PDFExporter.exportToPDF('displacement', inputs, outputs, lang, unitSystem);
        };
      }
    }

    // 3. Thermal Expansion
    const thLen = document.getElementById('adv-thermal-len');
    const thDt = document.getElementById('adv-thermal-dt');
    const thResult = document.getElementById('adv-thermal-result');
    let elongUnit = unitSystem === 'imperial' ? 'in' : 'мм';

    if (thLen && thDt && thResult) {
      const calcThermal = () => {
        advInputs.thermalLen = parseFloat(thLen.value) || 0;
        advInputs.thermalDt = parseFloat(thDt.value) || 0;
        
        const len = advInputs.thermalLen;
        const dt = advInputs.thermalDt;
        let lenSI = len;
        let dtSI = dt;
        
        if (unitSystem === 'imperial') {
          lenSI = len * UnitConversions.FEET_TO_METERS;
          dtSI = dt * (5.0 / 9.0);
        }

        const elongM = EngineeringCalculations.calculateThermalExpansion(lenSI, dtSI, 12e-6);
        let elong = 0;

        if (unitSystem === 'imperial') {
          elong = elongM * UnitConversions.METERS_TO_INCHES;
        } else {
          elong = elongM * 1000.0;
        }
        
        thResult.innerText = `${fNum(elong, 1)} ${elongUnit}`;
      };
      
      thLen.oninput = calcThermal;
      thDt.oninput = calcThermal;

      // Bind Thermal PDF Export
      const exportBtn = document.getElementById('export-thermal-pdf-btn');
      if (exportBtn) {
        exportBtn.onclick = () => {
          const len = parseFloat(thLen.value) || 0;
          const dt = parseFloat(thDt.value) || 0;
          const inputs = {
            [lang === 'ru' ? 'Первоначальная длина колонны' : 'Initial String Length']: `${len} ${unitSystem === 'imperial' ? 'ft' : 'м'}`,
            [lang === 'ru' ? 'Перепад температур (ΔT)' : 'Temperature Delta (ΔT)']: `${dt} ${unitSystem === 'imperial' ? '°F' : '°C'}`
          };
          const outputs = {
            [lang === 'ru' ? 'Температурное удлинение (ΔL)' : 'Thermal Elongation (ΔL)']: thResult.innerText
          };
          PDFExporter.exportToPDF('thermal', inputs, outputs, lang, unitSystem);
        };
      }
    }

    // 4. Hook Load & Buoyancy
    const hAir = document.getElementById('adv-hook-air');
    const hMud = document.getElementById('adv-hook-mud');
    const hDrag = document.getElementById('adv-hook-drag');
    
    const hBf = document.getElementById('adv-hook-bf');
    const hWet = document.getElementById('adv-hook-wet');
    const hPickup = document.getElementById('adv-hook-pickup');
    const hSlackoff = document.getElementById('adv-hook-slackoff');
    
    let wtUnit = 'кг';
    if (unitSystem === 'imperial') wtUnit = 'lbs';
    else if (unitSystem === 'hybrid') wtUnit = lang === 'ru' ? 'тонн' : 'mt';

    if (hAir && hMud && hDrag && hBf && hWet && hPickup && hSlackoff) {
      const calcHook = () => {
        const airWtVal = hAir.value;
        const mudDensVal = hMud.value;
        const dragPctVal = hDrag.value;

        const validation = EngineeringValidator.validateInputs('hook_load', { airWeight: airWtVal, mudDensity: mudDensVal, drag: dragPctVal }, lang);
        
        const hookRecsContainer = document.getElementById('hook-load-warnings-recs');
        
        if (!validation.valid) {
          hBf.innerText = '—';
          hWet.innerHTML = `<span class="text-rose-500 font-semibold text-[10px]">${validation.error}</span>`;
          hPickup.innerText = '—';
          hSlackoff.innerText = '—';
          if (hookRecsContainer) hookRecsContainer.innerHTML = '';
          return;
        }

        const runCalculation = () => {
          advInputs.hookAirWeight = parseFloat(airWtVal) || 0;
          advInputs.hookMudDensity = parseFloat(mudDensVal) || 0;
          advInputs.hookDrag = parseFloat(dragPctVal) || 0;
          
          const airWt = advInputs.hookAirWeight;
          const mudDens = advInputs.hookMudDensity;
          const dragPct = advInputs.hookDrag;
          
          let airWtSI = airWt;
          let mudDensSI = mudDens;
          const dragFraction = dragPct / 100.0;
          let steelDensSI = PhysicalConstants.STEEL_DENSITY_KG_M3;

          if (unitSystem === 'imperial') {
            airWtSI = airWt * UnitConversions.LBS_TO_KG;
            mudDensSI = mudDens * UnitConversions.PPG_TO_KG_M3;
            steelDensSI = 65.5 * UnitConversions.PPG_TO_KG_M3;
          } else if (unitSystem === 'metric') {
            // airWt in kg, mudDens in kg/m3. Already SI!
          } else {
            // Hybrid: airWt in tonnes, mudDens in SG
            airWtSI = airWt * 1000.0;
            mudDensSI = mudDens * UnitConversions.SG_TO_KG_M3;
            steelDensSI = 7.85 * UnitConversions.SG_TO_KG_M3;
          }

          const calcs = EngineeringCalculations.calculateHookLoad(airWtSI, mudDensSI, steelDensSI, dragFraction);
          
          const bf = calcs.buoyancyFactor;
          let wetWt = calcs.wetWeightKg;
          let pickupWt = calcs.pickupWeightKg;
          let slackoffWt = calcs.slackoffWeightKg;

          if (unitSystem === 'imperial') {
            wetWt = calcs.wetWeightKg * UnitConversions.KG_TO_LBS;
            pickupWt = calcs.pickupWeightKg * UnitConversions.KG_TO_LBS;
            slackoffWt = calcs.slackoffWeightKg * UnitConversions.KG_TO_LBS;
          } else if (unitSystem === 'hybrid') {
            wetWt = calcs.wetWeightKg / 1000.0;
            pickupWt = calcs.pickupWeightKg / 1000.0;
            slackoffWt = calcs.slackoffWeightKg / 1000.0;
          }
          
          return { bf, wetWt, pickupWt, slackoffWt };
        };

        const execution = EngineeringSafeExecution.execute(runCalculation, null, {
          calculatorName: 'hook_load',
          inputs: { airWeight: airWtVal, mudDensity: mudDensVal, drag: dragPctVal }
        });

        if (!execution.success || !execution.value) {
          hBf.innerText = '—';
          hWet.innerHTML = `<span class="text-rose-500 font-semibold text-[10px]">${lang === 'ru' ? 'Ошибка расчета' : 'Calculation Error'}</span>`;
          hPickup.innerText = '—';
          hSlackoff.innerText = '—';
          if (hookRecsContainer) hookRecsContainer.innerHTML = '';
          return;
        }

        const { bf, wetWt, pickupWt, slackoffWt } = execution.value;
        hBf.innerText = fNum(bf, 4);
        hWet.innerText = `${fNum(wetWt, 0)} ${wtUnit}`;
        hPickup.innerText = `${fNum(pickupWt, 0)} ${wtUnit}`;
        hSlackoff.innerText = `${fNum(slackoffWt, 0)} ${wtUnit}`;

        if (hookRecsContainer) {
          const { viewMode } = store.getState();
          const recs = EngineeringRecommendationEngine.getRecommendationsForCalculation('hook_load', { airWeight: advInputs.hookAirWeight, mudDensity: advInputs.hookMudDensity, drag: advInputs.hookDrag }, {}, lang);
          
          let warningsHtml = '';
          if (validation.warnings.length > 0) {
            warningsHtml = validation.warnings.map(text => `
              <div class="p-2.5 border border-amber-500/20 dark:border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400 rounded-lg text-[9.5px] leading-relaxed mb-3.5">
                ⚠️ ${text}
              </div>
            `).join('');
          }

          let recsHtml = '';
          if (recs.length > 0) {
            if (viewMode === 'engineering') {
              recsHtml = recs.map(r => {
                const buttons = r.linkedEntities.map(id => {
                  let targetRec = null;
                  for (const key of Object.keys(mockDb)) {
                    if (Array.isArray(mockDb[key])) {
                      const found = mockDb[key].find(item => item.id === id);
                      if (found) {
                        targetRec = { ...found, module: key === 'acid_environments' ? 'steel-grades' : key };
                        break;
                      }
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
                  <div class="p-2.5 border border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5 text-zinc-700 dark:text-zinc-300 rounded-lg text-[9.5px] leading-relaxed flex flex-col gap-1.5 mb-2 last:mb-0">
                    <div class="flex items-start gap-1.5">
                      <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span class="font-bold text-zinc-950 dark:text-white">${r.recommendation}</span>
                    </div>
                    <div class="text-[9px] text-zinc-500 dark:text-zinc-400 pl-3.5 border-l border-zinc-100 dark:border-zinc-850">${r.reason}</div>
                    ${buttons ? `<div class="pl-3.5 flex flex-wrap gap-1">${buttons}</div>` : ''}
                  </div>
                `;
              }).join('');
            } else if (viewMode === 'reference' || !viewMode) {
              recsHtml = recs.map(r => `
                <div class="p-2 border border-zinc-200/40 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-zinc-700 dark:text-zinc-300 rounded-lg text-[9.5px] leading-relaxed flex items-start gap-1.5 mb-2 last:mb-0">
                  <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                  <span>${r.recommendation}</span>
                </div>
              `).join('');
            } else if (viewMode === 'field') {
              hookRecsContainer.innerHTML = recs.map(r => `
                <div class="text-[9.5px] text-zinc-800 dark:text-zinc-200 flex items-start gap-1.5 border-t border-zinc-100 dark:border-zinc-855 pt-2">
                  <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                  <span>${r.recommendation}</span>
                </div>
              `).join('');
            }
          } else {
            hookRecsContainer.innerHTML = '';
          }
        }
      };
      
      hAir.oninput = calcHook;
      hMud.oninput = calcHook;
      hDrag.oninput = calcHook;

      // Bind Hook Load PDF Export
      const exportBtn = document.getElementById('export-hook-pdf-btn');
      if (exportBtn) {
        exportBtn.onclick = () => {
          const airWt = parseFloat(hAir.value) || 0;
          const mudDens = parseFloat(hMud.value) || 0;
          const dragPct = parseFloat(hDrag.value) || 0;
          
          let bf = 1.0;
          if (unitSystem === 'imperial') bf = 1.0 - (mudDens / 65.5);
          else if (unitSystem === 'metric') bf = 1.0 - (mudDens / 7850.0);
          else bf = 1.0 - (mudDens / 7.85);
          bf = Math.max(0, Math.min(1, bf));

          const inputs = {
            [lang === 'ru' ? 'Номинальный вес в воздухе' : 'String Weight in Air']: `${airWt} ${wtUnit}`,
            [lang === 'ru' ? 'Плотность бурового раствора' : 'Drilling Fluid Density']: `${mudDens} ${unitSystem === 'imperial' ? 'ppg' : (unitSystem === 'metric' ? 'кг/м³' : 'sg')}`,
            [lang === 'ru' ? 'Силы сопротивления (Drag)' : 'Friction Drag Coefficient']: `${dragPct} %`
          };
          const outputs = {
            [lang === 'ru' ? 'Коэффициент плавучести (BF)' : 'Buoyancy Factor (BF)']: fNum(bf, 4),
            [lang === 'ru' ? 'Расчетный вес в растворе' : 'Buoyancy Weight in Fluid']: hWet.innerText,
            [lang === 'ru' ? 'Нагрузка при подъеме (Pickup)' : 'Expected Pickup Load']: hPickup.innerText,
            [lang === 'ru' ? 'Нагрузка при спуске (Slackoff)' : 'Expected Slackoff Load']: hSlackoff.innerText
          };
          PDFExporter.exportToPDF('hook_load', inputs, outputs, lang, unitSystem);
        };
      }
    }
  }
}
