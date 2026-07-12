import { BaseView } from '../ModuleFactory.js';
import { store } from '../../core/State.js';
import { i18n } from '../../utils/i18n.js';
import { searchMockDb } from '../../utils/search.js';
import { mockDb } from '../../database/mockDb.js';
import table from './table.js';
import details from './details.js';
import { EngineeringDisclaimer } from '../../components/EngineeringDisclaimer.js';
import { FormulaTransparency } from '../../components/FormulaTransparency.js';
import { PDFExporter } from '../../utils/pdfExport.js';
import { SkillsOrchestrator } from '../../core/SkillsOrchestrator.js';
import { EngineeringRecommendationEngine } from '../../core/EngineeringRecommendationEngine.js';
import { EngineeringValidator } from '../../core/EngineeringValidator.js';
import { EngineeringSafeExecution } from '../../core/EngineeringSafeExecution.js';
import AppLogger from '../../core/AppLogger.js';
import { DiagramRenderer } from '../../components/DiagramRenderer.js';

// Cache for selected record in Elastomers
const selectedRecordIds = {};

class ElastomersView extends BaseView {
  constructor() {
    super('elastomers', 'elastomers', table, details);
    this.activeTab = 'materials'; // 'materials' | 'acid'
    
    // Acid Calculator default inputs
    this.calcInputs = {
      environment: 'hcl', // 'hcl' | 'sour' | 'co2' | 'hf'
      ph: 2.0,
      h2sPressure: 50, // psi
      co2Pressure: 100, // psi
      temperature: 80, // C
      pressure: 3000, // psi
      exposure: 24, // duration value
      exposureUnit: 'hours' // 'hours' | 'days' | 'months' | 'years'
    };
  }

  render(containerId, searchQuery) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { lang, unitSystem } = store.getState();
    const t = (key) => i18n.t(key);

    // Filter records by search query
    const records = searchMockDb(mockDb, this.dbKey, searchQuery);

    // Set default selected record
    if (records.length > 0 && !selectedRecordIds[this.moduleType]) {
      selectedRecordIds[this.moduleType] = records[0].id;
    }
    if (records.length > 0 && !records.some(r => r.id === selectedRecordIds[this.moduleType])) {
      selectedRecordIds[this.moduleType] = records[0].id;
    }

    const selectedId = selectedRecordIds[this.moduleType];
    const selectedRec = records.find(r => r.id === selectedId);

    // Track analytics view
    if (selectedRec && this.activeTab === 'materials') {
      setTimeout(() => {
        store.trackRecordView(selectedRec.id, this.moduleType);
      }, 0);
    }

    // Dynamic rendering based on active tab
    const tabNavHtml = `
      <div class="flex border-b border-zinc-200 dark:border-zinc-800 mb-4 text-xs font-sans shrink-0">
        <button id="tab-btn-materials" class="px-4 py-2.5 font-semibold transition-all border-b-2 cursor-pointer ${this.activeTab === 'materials' ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white' : 'border-transparent text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200'}">
          ${lang === 'ru' ? 'Справочник эластомеров' : 'Elastomers Directory'}
        </button>
        <button id="tab-btn-acid" class="px-4 py-2.5 font-semibold transition-all border-b-2 cursor-pointer ${this.activeTab === 'acid' ? 'border-zinc-950 text-zinc-950 dark:border-white dark:text-white' : 'border-transparent text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200'}">
          ${t('acid.ref_title')}
        </button>
      </div>
    `;

    let contentHtml = '';
    if (this.activeTab === 'materials') {
      const tableHtml = this.tableComponent.render(records, selectedId, lang);
      const detailsHtml = selectedRec ? this.detailsComponent.render(selectedRec, lang, this.moduleType) : '';
      
      contentHtml = `
        ${tableHtml}
        <div class="mt-4">
          ${detailsHtml}
        </div>
      `;
    } else {
      contentHtml = this.renderAcidCalculator(lang, unitSystem);
    }

    container.innerHTML = `
      <div class="space-y-4 py-2 flex flex-col h-full">
        <!-- Back and title -->
        <div class="flex items-center gap-3 shrink-0">
          <button id="module-back-btn" class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors border border-zinc-200/30 dark:border-zinc-800 shadow-sm text-zinc-500 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path></svg>
          </button>
          <div>
            <h2 class="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white font-sans">${t(`nav.${this.moduleType}`)}</h2>
            <p class="text-[9px] text-zinc-400 dark:text-zinc-555 font-sans font-medium uppercase mt-0.5">
              ${this.activeTab === 'materials' ? (lang === 'ru' ? 'Характеристики полимеров' : 'Polymer properties') : (lang === 'ru' ? 'Химстойкость и коррозия' : 'Chemical resistance & corrosion')}
            </p>
          </div>
        </div>

        <!-- Tabs Navigation -->
        ${tabNavHtml}

        <!-- Active View Content -->
        <div id="elastomers-tab-content">
          ${contentHtml}
        </div>
      </div>
    `;

    this.bindEvents(containerId, searchQuery);
  }

  renderAcidCalculator(lang, unitSystem) {
    const t = (key) => i18n.t(key);
    
    let csLoss = 0, csLife = '—';
    let crLoss = 0, crLife = '—';
    let dpLoss = 0, dpLife = '—';

    // Units adaptation labels
    const tempUnit = unitSystem === 'imperial' ? '°F' : '°C';
    const pressUnit = unitSystem === 'imperial' ? 'psi' : (unitSystem === 'metric' ? 'бар' : 'бар');
    const corrosionRateUnit = unitSystem === 'imperial' ? 'in/yr' : 'мм/год';
    const depthUnit = unitSystem === 'imperial' ? 'in' : 'мм';

    // Temp value translation based on units
    let displayTemp = this.calcInputs.temperature;
    if (unitSystem === 'imperial') {
      displayTemp = Math.round(this.calcInputs.temperature * 1.8 + 32);
    }

    let displayPress = this.calcInputs.pressure;
    let displayH2s = this.calcInputs.h2sPressure;
    let displayCo2 = this.calcInputs.co2Pressure;

    if (unitSystem === 'metric' || unitSystem === 'hybrid') {
      displayPress = Math.round(this.calcInputs.pressure / 14.5038);
      displayH2s = Math.round(this.calcInputs.h2sPressure / 14.5038);
      displayCo2 = Math.round(this.calcInputs.co2Pressure / 14.5038);
    }

    // Run Calculations based on Inputs
    const validation = EngineeringValidator.validateInputs('corrosion', { temperature: this.calcInputs.temperature, pressure: this.calcInputs.pressure }, lang);
    
    let results = {
      corrosion: {
        carbonSteel: { rate: 0, depth: 0, rating: 'INVALID' },
        cr13: { rate: 0, depth: 0, rating: 'INVALID' },
        superCr13: { rate: 0, depth: 0, rating: 'INVALID' }
      },
      elastomers: {
        nbr: { rating: 'INVALID', ratingRu: 'НЕВАЛИДНО' },
        hnbr: { rating: 'INVALID', ratingRu: 'НЕВАЛИДНО' },
        viton: { rating: 'INVALID', ratingRu: 'НЕВАЛИДНО' },
        kalrez: { rating: 'INVALID', ratingRu: 'НЕВАЛИДНО' }
      }
    };

    let rulesWarningsHtml = '';
    let recsHtml = '';

    if (!validation.valid) {
      rulesWarningsHtml = `
        <div class="p-2.5 border border-rose-500/20 bg-rose-50/10 dark:bg-rose-950/5 text-rose-600 dark:text-rose-450 rounded-lg text-[9.5px] leading-relaxed mb-3.5">
          ⚠️ ${validation.error}
        </div>
      `;
    } else {
      const runCalc = () => this.calculateCorrosionAndCompatibility(unitSystem);
      const execution = EngineeringSafeExecution.execute(runCalc, results, {
        calculatorName: 'corrosion',
        inputs: this.calcInputs
      });

      if (execution.success && execution.value) {
        results = execution.value;
      }

      const wallThickness = unitSystem === 'imperial' ? 0.394 : 10.0;
      const getLifetimeText = (rate) => {
        if (!rate || rate <= 0) return lang === 'ru' ? '> 10 лет' : '> 10 years';
        const years = wallThickness / rate;
        if (years < 1/12) {
          const days = Math.round(years * 365);
          return lang === 'ru' ? `${days} дн.` : `${days} days`;
        }
        if (years < 1) {
          const months = Math.round(years * 12);
          return lang === 'ru' ? `${months} мес.` : `${months} months`;
        }
        if (years >= 10) return lang === 'ru' ? '> 10 лет' : '> 10 years';
        return lang === 'ru' ? `${years.toFixed(1)} лет` : `${years.toFixed(1)} years`;
      };

      const getBadgeClass = (rating) => {
        if (rating.includes('Критический') || rating.includes('Critical') || rating.includes('Разрушение') || rating.includes('Extreme') || rating.includes('опасность') || rating.includes('Severe')) {
          if (rating.includes('Критический') || rating.includes('Critical') || rating.includes('Разрушение') || rating.includes('Extreme')) {
            return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';
          }
          return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
        }
        if (rating.includes('Умеренный') || rating.includes('Moderate')) {
          return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
        }
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      };

      this.getBadgeClass = getBadgeClass;

      const cs = results.corrosion.carbonSteel;
      csLoss = Math.min(100, (cs.depth / wallThickness) * 100);
      csLife = getLifetimeText(cs.rate);

      const cr_steel = results.corrosion.cr13;
      crLoss = Math.min(100, (cr_steel.depth / wallThickness) * 100);
      crLife = getLifetimeText(cr_steel.rate);

      const dp = results.corrosion.duplex;
      dpLoss = Math.min(100, (dp.depth / wallThickness) * 100);
      dpLife = getLifetimeText(dp.rate);

      const { viewMode } = store.getState();
      const rulesWarnings = viewMode !== 'field' ? SkillsOrchestrator.evaluateCalculation('corrosion', this.calcInputs, results, lang) : [];
      
      const combinedWarnings = [
        ...validation.warnings.map(text => ({ text })),
        ...rulesWarnings
      ];

      if (combinedWarnings.length > 0) {
        rulesWarningsHtml = `
          <div class="space-y-1.5 mb-3.5">
            ${combinedWarnings.map(w => `
              <div class="p-2.5 border border-amber-500/20 dark:border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 text-amber-600 dark:text-amber-400 rounded-lg text-[9.5px] leading-relaxed">
                ⚠️ ${w.text}
              </div>
            `).join('')}
          </div>
        `;
      }

      const recs = EngineeringRecommendationEngine.getRecommendationsForCalculation('corrosion', this.calcInputs, results, lang);
      if (recs.length > 0) {
        if (viewMode === 'engineering') {
        recsHtml = `
          <div class="space-y-2 mb-3.5">
            <span class="text-[8.5px] font-bold text-emerald-500 uppercase tracking-widest block">${lang === 'ru' ? 'Рекомендуемые действия' : 'Recommended Actions'}</span>
            ${recs.map(r => {
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
                <div class="p-2.5 border border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/5 text-zinc-700 dark:text-zinc-300 rounded-lg text-[9.5px] leading-relaxed flex flex-col gap-1.5">
                  <div class="flex items-start gap-1.5">
                    <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                    <span class="font-bold text-zinc-950 dark:text-white">${r.recommendation}</span>
                  </div>
                  <div class="text-[9px] text-zinc-500 dark:text-zinc-400 pl-3.5 border-l border-zinc-100 dark:border-zinc-855">${r.reason}</div>
                  ${buttons ? `<div class="pl-3.5 flex flex-wrap gap-1">${buttons}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else if (viewMode === 'reference' || !viewMode) {
        recsHtml = `
          <div class="space-y-1.5 mb-3.5">
            <span class="text-[8px] font-bold text-emerald-500 uppercase tracking-widest block">${lang === 'ru' ? 'Рекомендации' : 'Recommendations'}</span>
            ${recs.map(r => `
              <div class="p-2 border border-zinc-200/40 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-zinc-700 dark:text-zinc-300 rounded-lg text-[9.5px] leading-relaxed flex items-start gap-1.5">
                <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                <span>${r.recommendation}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else if (viewMode === 'field') {
        recsHtml = `
          <div class="space-y-1 mb-3.5 border-t border-zinc-100 dark:border-zinc-850 pt-2">
            ${recs.map(r => `
              <div class="text-[9.5px] text-zinc-800 dark:text-zinc-200 flex items-start gap-1.5">
                <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                <span>${r.recommendation}</span>
              </div>
            `).join('')}
          </div>
        `;
      }
    }
  }

    return `
      <div class="space-y-4 font-sans text-xs">
        ${EngineeringDisclaimer.render(lang)}
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Input Form Card -->
        <div class="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 class="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-150 dark:border-zinc-800 pb-2">
            ${lang === 'ru' ? 'Входные параметры среды' : 'Environmental Inputs'}
          </h3>
          
          <div class="space-y-3.5">
            <!-- Environment type -->
            <div class="space-y-1">
              <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${lang === 'ru' ? 'Тип агрессивной среды' : 'Corrosive Medium'}</label>
              <select id="calc-environment" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none">
                <option value="hcl" ${this.calcInputs.environment === 'hcl' ? 'selected' : ''}>${lang === 'ru' ? 'Соляная кислота (HCl)' : 'Hydrochloric Acid (HCl)'}</option>
                <option value="hf" ${this.calcInputs.environment === 'hf' ? 'selected' : ''}>${lang === 'ru' ? 'Плавиковая кислота (HF)' : 'Hydrofluoric Acid (HF)'}</option>
                <option value="sour" ${this.calcInputs.environment === 'sour' ? 'selected' : ''}>${lang === 'ru' ? 'Кислый газ / Сероводород (H₂S)' : 'Sour Gas (H₂S)'}</option>
                <option value="co2" ${this.calcInputs.environment === 'co2' ? 'selected' : ''}>${lang === 'ru' ? 'Углекислый газ (CO₂)' : 'Carbon Dioxide (CO₂)'}</option>
              </select>
            </div>

            <!-- pH level (Visible only for HCl/HF) -->
            <div id="ph-container" class="space-y-1.5 ${['hcl', 'hf'].includes(this.calcInputs.environment) ? '' : 'hidden'}">
              <div class="flex justify-between">
                <label class="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${t('acid.ph')}</label>
                <span class="font-mono text-zinc-950 dark:text-white font-bold" id="ph-val-display">${this.calcInputs.ph.toFixed(1)}</span>
              </div>
              <input type="range" id="calc-ph" min="0" max="7" step="0.1" value="${this.calcInputs.ph}" class="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
            </div>

            <!-- H2S pressure (Visible only for H2S) -->
            <div id="h2s-container" class="space-y-1.5 ${this.calcInputs.environment === 'sour' ? '' : 'hidden'}">
              <div class="flex justify-between">
                <label class="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${t('acid.h2s')} (${pressUnit})</label>
                <span class="font-mono text-zinc-950 dark:text-white font-bold" id="h2s-val-display">${displayH2s}</span>
              </div>
              <input type="range" id="calc-h2s" min="1" max="500" step="1" value="${this.calcInputs.h2sPressure}" class="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
            </div>

            <!-- CO2 pressure (Visible only for CO2) -->
            <div id="co2-container" class="space-y-1.5 ${this.calcInputs.environment === 'co2' ? '' : 'hidden'}">
              <div class="flex justify-between">
                <label class="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${t('acid.co2')} (${pressUnit})</label>
                <span class="font-mono text-zinc-950 dark:text-white font-bold" id="co2-val-display">${displayCo2}</span>
              </div>
              <input type="range" id="calc-co2" min="1" max="500" step="1" value="${this.calcInputs.co2Pressure}" class="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
            </div>

            <!-- Temperature -->
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <label class="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${lang === 'ru' ? 'Температура' : 'Temperature'} (${tempUnit})</label>
                <span class="font-mono text-zinc-950 dark:text-white font-bold" id="temp-val-display">${displayTemp}</span>
              </div>
              <input type="range" id="calc-temp" min="0" max="250" step="5" value="${this.calcInputs.temperature}" class="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
            </div>

            <!-- Pressure -->
            <div class="space-y-1.5">
              <div class="flex justify-between">
                <label class="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${lang === 'ru' ? 'Давление' : 'Pressure'} (${pressUnit})</label>
                <span class="font-mono text-zinc-950 dark:text-white font-bold" id="press-val-display">${displayPress}</span>
              </div>
              <input type="range" id="calc-press" min="0" max="15000" step="100" value="${this.calcInputs.pressure}" class="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-950 dark:accent-white" />
            </div>

            <!-- Exposure Time -->
            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1">
                <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${t('acid.exposure')}</label>
                <input type="number" id="calc-exposure" min="1" max="10000" value="${this.calcInputs.exposure}" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none font-mono font-semibold" />
              </div>
              <div class="space-y-1">
                <label class="block text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">${lang === 'ru' ? 'Ед. времени' : 'Time unit'}</label>
                <select id="calc-exposure-unit" class="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 p-2.5 outline-none">
                  <option value="hours" ${this.calcInputs.exposureUnit === 'hours' ? 'selected' : ''}>${t('acid.units.hours')}</option>
                  <option value="days" ${this.calcInputs.exposureUnit === 'days' ? 'selected' : ''}>${t('acid.units.days')}</option>
                  <option value="months" ${this.calcInputs.exposureUnit === 'months' ? 'selected' : ''}>${t('acid.units.months')}</option>
                  <option value="years" ${this.calcInputs.exposureUnit === 'years' ? 'selected' : ''}>${t('acid.units.years')}</option>
                </select>
              </div>
            </div>
            
            <!-- Rules Warnings -->
            ${rulesWarningsHtml}
            
            <!-- Recommendations -->
            ${recsHtml}
            
            <!-- Formula Transparency -->
            ${FormulaTransparency.render('corrosion', lang)}
          </div>
        </div>

        <!-- Output Cards -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Metal corrosion panel -->
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-2">
              <h3 class="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-widest">
                ${t('acid.output_metal')}
              </h3>
              <button id="export-corrosion-pdf-btn" class="px-2 py-1 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-200 rounded text-[9px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path></svg>
                <span>PDF</span>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Carbon steel -->
              <div class="p-3 bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-start justify-between gap-1">
                    <span class="font-bold text-zinc-900 dark:text-white text-[10px] leading-tight shrink-0">${lang === 'ru' ? 'Углеродистая сталь' : 'Carbon Steel (C-Mn)'}</span>
                    <span class="inline-block px-1 py-0.2 rounded text-[7.5px] font-bold uppercase tracking-wider ${getBadgeClass(results.corrosion.carbonSteel.rating)}">
                      ${results.corrosion.carbonSteel.rating}
                    </span>
                  </div>
                  <div class="font-mono text-xs space-y-1 bg-white dark:bg-zinc-900/60 p-2 rounded border border-zinc-150/40 dark:border-zinc-800/40">
                    <div class="flex justify-between items-center"><span class="text-zinc-400 text-[8px] uppercase font-sans">${t('acid.pitting_rate')}</span> <span class="font-bold text-red-500">${results.corrosion.carbonSteel.rate.toFixed(2)} <span class="text-[8px] font-normal text-zinc-400 font-sans">${corrosionRateUnit}</span></span></div>
                    <div class="flex justify-between items-center"><span class="text-zinc-400 text-[8px] uppercase font-sans">${t('acid.pitting_depth')}</span> <span class="font-bold text-red-650">${results.corrosion.carbonSteel.depth.toFixed(3)} <span class="text-[8px] font-normal text-zinc-400 font-sans">${depthUnit}</span></span></div>
                  </div>
                </div>
                <div class="space-y-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60">
                  <div class="space-y-0.5">
                    <div class="flex justify-between text-[7.5px] text-zinc-400 uppercase font-sans">
                      <span>${lang === 'ru' ? 'Износ стенки' : 'Wall Loss (10mm)'}</span>
                      <span class="font-bold font-mono">${csLoss.toFixed(1)}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-zinc-250 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500 ${csLoss > 50 ? 'bg-red-500' : (csLoss > 10 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${csLoss}%"></div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-zinc-400 text-[8px] uppercase font-sans">${lang === 'ru' ? 'Срок службы' : 'Estimated Life'}</span>
                    <span class="font-bold text-zinc-850 dark:text-zinc-200 font-mono ${csLife.includes('дн') || csLife.includes('days') ? 'text-red-500 dark:text-red-400' : ''}">${csLife}</span>
                  </div>
                </div>
              </div>

              <!-- 13Cr -->
              <div class="p-3 bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-start justify-between gap-1">
                    <span class="font-bold text-zinc-900 dark:text-white text-[10px] leading-tight shrink-0">${lang === 'ru' ? '13Cr Сталь' : '13Cr Stainless'}</span>
                    <span class="inline-block px-1 py-0.2 rounded text-[7.5px] font-bold uppercase tracking-wider ${getBadgeClass(results.corrosion.cr13.rating)}">
                      ${results.corrosion.cr13.rating}
                    </span>
                  </div>
                  <div class="font-mono text-xs space-y-1 bg-white dark:bg-zinc-900/60 p-2 rounded border border-zinc-150/40 dark:border-zinc-800/40">
                    <div class="flex justify-between items-center"><span class="text-zinc-400 text-[8px] uppercase font-sans">${t('acid.pitting_rate')}</span> <span class="font-bold text-amber-500">${results.corrosion.cr13.rate.toFixed(2)} <span class="text-[8px] font-normal text-zinc-400 font-sans">${corrosionRateUnit}</span></span></div>
                    <div class="flex justify-between items-center"><span class="text-zinc-400 text-[8px] uppercase font-sans">${t('acid.pitting_depth')}</span> <span class="font-bold text-amber-600">${results.corrosion.cr13.depth.toFixed(3)} <span class="text-[8px] font-normal text-zinc-400 font-sans">${depthUnit}</span></span></div>
                  </div>
                </div>
                <div class="space-y-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60">
                  <div class="space-y-0.5">
                    <div class="flex justify-between text-[7.5px] text-zinc-400 uppercase font-sans">
                      <span>${lang === 'ru' ? 'Износ стенки' : 'Wall Loss (10mm)'}</span>
                      <span class="font-bold font-mono">${crLoss.toFixed(1)}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-zinc-250 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500 ${crLoss > 50 ? 'bg-red-500' : (crLoss > 10 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${crLoss}%"></div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-zinc-400 text-[8px] uppercase font-sans">${lang === 'ru' ? 'Срок службы' : 'Estimated Life'}</span>
                    <span class="font-bold text-zinc-850 dark:text-zinc-200 font-mono ${crLife.includes('дн') || crLife.includes('days') ? 'text-red-500 dark:text-red-400' : ''}">${crLife}</span>
                  </div>
                </div>
              </div>

              <!-- Duplex -->
              <div class="p-3 bg-zinc-50 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-start justify-between gap-1">
                    <span class="font-bold text-zinc-900 dark:text-white text-[10px] leading-tight shrink-0">${lang === 'ru' ? 'Супердуплекс' : 'Duplex Steel (25Cr)'}</span>
                    <span class="inline-block px-1 py-0.2 rounded text-[7.5px] font-bold uppercase tracking-wider ${getBadgeClass(results.corrosion.duplex.rating)}">
                      ${results.corrosion.duplex.rating}
                    </span>
                  </div>
                  <div class="font-mono text-xs space-y-1 bg-white dark:bg-zinc-900/60 p-2 rounded border border-zinc-150/40 dark:border-zinc-800/40">
                    <div class="flex justify-between items-center"><span class="text-zinc-400 text-[8px] uppercase font-sans">${t('acid.pitting_rate')}</span> <span class="font-bold text-emerald-500">${results.corrosion.duplex.rate.toFixed(3)} <span class="text-[8px] font-normal text-zinc-400 font-sans">${corrosionRateUnit}</span></span></div>
                    <div class="flex justify-between items-center"><span class="text-zinc-400 text-[8px] uppercase font-sans">${t('acid.pitting_depth')}</span> <span class="font-bold text-emerald-600">${results.corrosion.duplex.depth.toFixed(3)} <span class="text-[8px] font-normal text-zinc-400 font-sans">${depthUnit}</span></span></div>
                  </div>
                </div>
                <div class="space-y-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/60">
                  <div class="space-y-0.5">
                    <div class="flex justify-between text-[7.5px] text-zinc-400 uppercase font-sans">
                      <span>${lang === 'ru' ? 'Износ стенки' : 'Wall Loss (10mm)'}</span>
                      <span class="font-bold font-mono">${dpLoss.toFixed(1)}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-zinc-250 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500 ${dpLoss > 50 ? 'bg-red-500' : (dpLoss > 10 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${dpLoss}%"></div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-zinc-400 text-[8px] uppercase font-sans">${lang === 'ru' ? 'Срок службы' : 'Estimated Life'}</span>
                    <span class="font-bold text-zinc-850 dark:text-zinc-200 font-mono">${dpLife}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Elastomer Compatibility panel -->
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 class="text-[10px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-widest border-b border-zinc-150 dark:border-zinc-800 pb-2">
              ${t('acid.output_elastomer')}
            </h3>

            <div class="divide-y divide-zinc-100 dark:divide-zinc-800/80 font-sans text-xs">
              ${results.elastomers.map(el => {
                let badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
                if (el.grade.startsWith('B')) badgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
                if (el.grade.startsWith('C')) badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
                if (el.grade.startsWith('D')) badgeClass = 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';

                let confClass = '';
                let confLabel = '';
                const conf = (el.confidence || 'Reference Only').toLowerCase();
                if (conf === 'high') {
                  confClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20';
                  confLabel = t('confidence_high');
                } else if (conf === 'medium') {
                  confClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20';
                  confLabel = t('confidence_medium');
                } else {
                  confClass = 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-150 dark:border-zinc-750';
                  confLabel = t('confidence_reference');
                }

                return `
                  <div class="py-3.5 flex items-start justify-between gap-4">
                    <div class="space-y-1.5">
                      <div>
                        <span class="font-bold text-zinc-900 dark:text-white block text-[11px]">${el.name}</span>
                        <span class="text-[10px] text-zinc-500 dark:text-zinc-400 block">${el.notes}</span>
                      </div>
                      <div class="flex flex-wrap items-center gap-2 text-[9px]">
                        <span class="px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider font-mono ${confClass}">${confLabel}</span>
                        <span class="text-zinc-400 dark:text-zinc-500"><span class="font-bold uppercase tracking-wider text-[8px]">${lang === 'ru' ? 'Обоснование' : 'Basis'}:</span> ${el.basis}</span>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono tracking-wider shrink-0 ${badgeClass}">${el.grade}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
      </div>
    `;
  }

  calculateCorrosionAndCompatibility(unitSystem) {
    const { environment, ph, h2sPressure, co2Pressure, temperature, pressure, exposure, exposureUnit } = this.calcInputs;
    const lang = store.getState().lang;

    // Time conversion factor in years
    let factorInYears = 1.0;
    if (exposureUnit === 'hours') factorInYears = exposure / 8760.0;
    if (exposureUnit === 'days') factorInYears = exposure / 365.0;
    if (exposureUnit === 'months') factorInYears = exposure / 12.0;
    if (exposureUnit === 'years') factorInYears = exposure;

    // 1. Corrosion Rates (Default baseline in mm/yr)
    let crBase = 0.05; // sweet neutral base
    
    // Acid pH factor
    if (['hcl', 'hf'].includes(environment)) {
      const acidity = Math.max(0, 7.0 - ph);
      crBase += 0.2 * Math.pow(acidity, 2.2);
    }
    
    // Sour H2S factor
    if (environment === 'sour') {
      crBase += 0.015 * Math.sqrt(h2sPressure);
    }

    // CO2 factor
    if (environment === 'co2') {
      crBase += 0.01 * Math.sqrt(co2Pressure);
    }

    // Temperature acceleration: Arrhenius exponential model
    // doubles every 15 degrees C starting from 20C
    const tempFactor = Math.pow(2.0, (temperature - 20) / 20.0);
    const pressureFactor = 1.0 + (pressure / 5000.0);

    const crCarbonSteel = crBase * tempFactor * pressureFactor;
    const crCr13 = crCarbonSteel * 0.04 * (environment === 'sour' ? 1.5 : 1.0); // 13Cr has some vulnerability to H2S
    const crDuplex = crCarbonSteel * 0.001 * (environment === 'hf' ? 5.0 : 1.0); // Duplex is vulnerable to HF acid

    // Final Rates adapted to unit system
    // Metric/Hybrid -> mm/year. Imperial -> inches/year
    const scale = unitSystem === 'imperial' ? 0.0393701 : 1.0; // mm to inches

    // Total Depth calculation: Rate * Duration in years
    const carbonSteelDepth = crCarbonSteel * factorInYears * scale;
    const cr13Depth = crCr13 * factorInYears * scale;
    const duplexDepth = crDuplex * factorInYears * scale;

    const carbonSteelRate = crCarbonSteel * scale;
    const cr13Rate = crCr13 * scale;
    const duplexRate = crDuplex * scale;

    // Ratings based on annual corrosion rate (mm/yr)
    const getRating = (rate) => {
      const mmRate = rate / (unitSystem === 'imperial' ? 0.0393701 : 1.0);
      if (mmRate < 0.1) return lang === 'ru' ? 'Пренебрежимый износ' : 'Negligible';
      if (mmRate < 1.0) return lang === 'ru' ? 'Умеренный износ' : 'Moderate';
      if (mmRate < 10.0) return lang === 'ru' ? 'Высокая опасность' : 'Severe Corrosion';
      return lang === 'ru' ? 'Критический износ' : 'Critical Failure';
    };

    // 2. Elastomer Compatibility Logic
    const elastomersResult = [
      {
        name: 'Viton (FKM)',
        grade: 'A',
        notes: lang === 'ru' ? 'Отличная стойкость к HCl/HF. Разрушается при H₂S > 120°C.' : 'Excellent HCl/HF resistance. Attacked by H2S at high temps.',
        confidence: 'High',
        basis: lang === 'ru' ? 'OEM руководство по совместимости DuPont Viton и пределы NACE MR0175' : 'OEM DuPont Viton compatibility handbook & NACE MR0175 limits'
      },
      {
        name: 'HNBR',
        grade: 'B',
        notes: lang === 'ru' ? 'Хорошая стойкость к H₂S. Деградирует в горячих кислотах HCl/HF.' : 'Good H2S durability. Degradation in hot HCl/HF acids.',
        confidence: 'High',
        basis: lang === 'ru' ? 'Техническая спецификация Therban/HNBR и данные испытаний ISO 23936-2' : 'Therban/HNBR engineering specification & ISO 23936-2 testing data'
      },
      {
        name: 'NBR (Nitrile)',
        grade: 'B',
        notes: lang === 'ru' ? 'Хорошо переносит углеводороды. Нестоек при температуре > 100°C и кислотности.' : 'Standard oil resistance. Poor under high temp & acidity.',
        confidence: 'High',
        basis: lang === 'ru' ? 'Базовые данные эластомеров ASTM D1418 и стандартные нефтепромысловые таблицы' : 'ASTM D1418 baseline elastomer data & standard oilfield tables'
      },
      {
        name: 'Kalrez (FFKM)',
        grade: 'A',
        notes: lang === 'ru' ? 'Максимальная химическая стойкость во всех средах до 300°C.' : 'Complete chemical inertness up to 300C.',
        confidence: 'High',
        basis: lang === 'ru' ? 'Руководство DuPont по химической стойкости Kalrez (тяжелый кислый газ)' : 'DuPont Kalrez Chemical Resistance Guide (extreme sour service)'
      },
      {
        name: 'Teflon (PTFE)',
        grade: 'A',
        notes: lang === 'ru' ? 'Абсолютно инертен. Ограничен текучестью при сверхвысоких давлениях.' : 'Chemically inert. Subject to cold flow under high load.',
        confidence: 'High',
        basis: lang === 'ru' ? 'Инженерный справочник по фторопластам и лимиты NACE MR0175 для термопластов' : 'PTFE Engineering Handbook & NACE MR0175 limits for thermoplastics'
      }
    ];

    // Modify grades based on input parameters
    elastomersResult.forEach(el => {
      if (el.name === 'NBR (Nitrile)') {
        if (temperature > 100 || pressure > 5000 || ['hcl', 'hf'].includes(environment)) {
          el.grade = 'D';
          el.confidence = 'High';
        }
        else if (temperature > 80 || environment === 'sour') {
          el.grade = 'C';
          el.confidence = 'Medium';
        }
      }
      else if (el.name === 'HNBR') {
        if (temperature > 150 || (['hcl', 'hf'].includes(environment) && temperature > 90)) {
          el.grade = 'D';
          el.confidence = 'High';
        }
        else if (temperature > 120 || ['hcl', 'hf'].includes(environment)) {
          el.grade = 'C';
          el.confidence = 'Medium';
        }
        else if (environment === 'sour' && temperature > 120) {
          el.grade = 'B';
          el.confidence = 'Medium';
        }
      }
      else if (el.name === 'Viton (FKM)') {
        if (environment === 'sour' && temperature > 120) {
          el.grade = 'D';
          el.confidence = 'High';
        }
        else if (environment === 'sour' && temperature > 90) {
          el.grade = 'C';
          el.confidence = 'Medium';
        }
        else if (temperature > 180) {
          el.grade = 'D';
          el.confidence = 'High';
        }
        else if (temperature > 150) {
          el.grade = 'B';
          el.confidence = 'Medium';
        }
      }
      else if (el.name === 'Teflon (PTFE)') {
        if (pressure > 12000 && temperature > 150) {
          el.grade = 'B';
          el.confidence = 'Medium';
        }
      }
      else if (el.name === 'Kalrez (FFKM)') {
        if (temperature > 280) {
          el.grade = 'B';
          el.confidence = 'Medium';
        }
      }
      
      // Localize grades description if Russian
      if (lang === 'ru') {
        const gradeMap = {
          'A': 'A — Идеально',
          'B': 'B — Хорошо',
          'C': 'C — Удовлетворительно',
          'D': 'D — Разрушение / Несовместим'
        };
        el.grade = gradeMap[el.grade.charAt(0)];
      }
    });

    return {
      corrosion: {
        carbonSteel: { rate: carbonSteelRate, depth: carbonSteelDepth, rating: getRating(carbonSteelRate) },
        cr13: { rate: cr13Rate, depth: cr13Depth, rating: getRating(cr13Rate) },
        duplex: { rate: duplexRate, depth: duplexDepth, rating: getRating(duplexRate) }
      },
      elastomers: elastomersResult
    };
  }

  bindEvents(containerId, searchQuery) {
    // 1. Core navigation and tabs click handlers
    const backBtn = document.getElementById('module-back-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        store.setState({ activeModule: 'home' });
      };
    }

    const tabMaterials = document.getElementById('tab-btn-materials');
    const tabAcid = document.getElementById('tab-btn-acid');

    if (tabMaterials) {
      tabMaterials.onclick = () => {
        this.activeTab = 'materials';
        this.render(containerId, searchQuery);
      };
    }

    if (tabAcid) {
      tabAcid.onclick = () => {
        this.activeTab = 'acid';
        this.render(containerId, searchQuery);
      };
    }

    // 2. Materials-specific row click bindings
    const container = document.getElementById(containerId);
    if (this.activeTab === 'materials' && container) {
      const rows = container.querySelectorAll('tbody tr[data-record-id]');
      rows.forEach(row => {
        row.onclick = () => {
          const recId = row.getAttribute('data-record-id');
          selectedRecordIds[this.moduleType] = recId;
          this.render(containerId, searchQuery);
        };
      });
      
      // Render CAD Diagram if present in selected
      const records = searchMockDb(mockDb, this.dbKey, searchQuery);
      const selectedId = selectedRecordIds[this.moduleType];
      const selectedRec = records.find(r => r.id === selectedId);
      if (selectedRec && selectedRec.diagrams && selectedRec.diagrams.length > 0) {
        const diagId = selectedRec.diagrams[0];
        const renderer = new DiagramRenderer('diagram-renderer-container');
        renderer.render(diagId, store.getState().lang, selectedRec);
      }
    } 
    // 3. Acid Calculator input listeners
    else {
      EngineeringDisclaimer.bind();
      const environmentSel = document.getElementById('calc-environment');
      const phInput = document.getElementById('calc-ph');
      const h2sInput = document.getElementById('calc-h2s');
      const co2Input = document.getElementById('calc-co2');
      const tempInput = document.getElementById('calc-temp');
      const pressInput = document.getElementById('calc-press');
      const exposureInput = document.getElementById('calc-exposure');
      const unitSelect = document.getElementById('calc-exposure-unit');

      const debounce = (fn, delay = 50) => {
        let timeout;
        return function(...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn.apply(this, args), delay);
        };
      };

      const triggerRecalc = () => {
        this.calcInputs.environment = environmentSel.value;
        this.calcInputs.ph = parseFloat(phInput.value);
        this.calcInputs.h2sPressure = parseFloat(h2sInput.value);
        this.calcInputs.co2Pressure = parseFloat(co2Input.value);
        this.calcInputs.temperature = parseFloat(tempInput.value);
        this.calcInputs.pressure = parseFloat(pressInput.value);
        this.calcInputs.exposure = parseFloat(exposureInput.value) || 1;
        this.calcInputs.exposureUnit = unitSelect.value;
        
        // Re-render only tab contents without full page redraw
        const tabContent = document.getElementById('elastomers-tab-content');
        if (tabContent) {
          const { lang, unitSystem } = store.getState();
          tabContent.innerHTML = this.renderAcidCalculator(lang, unitSystem);
          // Re-bind input events to the new inputs
          this.bindEvents(containerId, searchQuery);
        }
      };

      const debouncedRecalc = debounce(triggerRecalc, 50);

      if (environmentSel) environmentSel.onchange = () => {
        this.calcInputs.environment = environmentSel.value;
        // Full render to toggle visibility of pH/H2S/CO2 inputs
        this.render(containerId, searchQuery);
      };

      if (phInput) phInput.oninput = debouncedRecalc;
      if (h2sInput) h2sInput.oninput = debouncedRecalc;
      if (co2Input) co2Input.oninput = debouncedRecalc;
      if (tempInput) tempInput.oninput = debouncedRecalc;
      if (pressInput) pressInput.oninput = debouncedRecalc;
      if (exposureInput) exposureInput.oninput = debouncedRecalc;
      if (unitSelect) unitSelect.onchange = debouncedRecalc;

      const exportPdfBtn = document.getElementById('export-corrosion-pdf-btn');
      if (exportPdfBtn) {
        exportPdfBtn.onclick = () => {
          const { unitSystem, lang } = store.getState();
          const results = this.calculateCorrosionAndCompatibility(unitSystem);
          
          const tempUnit = unitSystem === 'imperial' ? '°F' : '°C';
          const pressUnit = unitSystem === 'imperial' ? 'psi' : 'bar';
          
          const rawTemp = this.calcInputs.temperature;
          const displayTemp = unitSystem === 'imperial' ? Math.round(rawTemp * 1.8 + 32) : rawTemp;
          
          const rawPress = this.calcInputs.pressure;
          const displayPress = unitSystem === 'imperial' ? rawPress : Math.round(rawPress / 14.5038);
          
          const envs = {
            hcl: lang === 'ru' ? 'Соляная кислота (HCl)' : 'Hydrochloric Acid (HCl)',
            hf: lang === 'ru' ? 'Плавиковая кислота (HF)' : 'Hydrofluoric Acid (HF)',
            sour: lang === 'ru' ? 'Кислый газ / Сероводород (H₂S)' : 'Sour Gas (H₂S)',
            co2: lang === 'ru' ? 'Углекислый газ (CO₂)' : 'Carbon Dioxide (CO₂)'
          };

          const inputs = {
            [lang === 'ru' ? 'Тип среды' : 'Medium Type']: envs[this.calcInputs.environment],
            [lang === 'ru' ? 'Температура' : 'Temperature']: `${displayTemp} ${tempUnit}`,
            [lang === 'ru' ? 'Давление' : 'Pressure']: `${displayPress} ${pressUnit}`,
            [lang === 'ru' ? 'Время контакта' : 'Exposure Time']: `${this.calcInputs.exposure} ${this.calcInputs.exposureUnit}`
          };
          
          if (['hcl', 'hf'].includes(this.calcInputs.environment)) {
            inputs[lang === 'ru' ? 'Уровень pH' : 'pH Level'] = this.calcInputs.ph.toFixed(1);
          } else if (this.calcInputs.environment === 'sour') {
            const rawH2S = this.calcInputs.h2sPressure;
            const displayH2S = unitSystem === 'imperial' ? rawH2S : Math.round(rawH2S / 14.5038);
            inputs[lang === 'ru' ? 'Давление H₂S' : 'H₂S Pressure'] = `${displayH2S} ${pressUnit}`;
          } else if (this.calcInputs.environment === 'co2') {
            const rawCO2 = this.calcInputs.co2Pressure;
            const displayCO2 = unitSystem === 'imperial' ? rawCO2 : Math.round(rawCO2 / 14.5038);
            inputs[lang === 'ru' ? 'Давление CO₂' : 'CO₂ Pressure'] = `${displayCO2} ${pressUnit}`;
          }

          const corrosionRateUnit = unitSystem === 'imperial' ? 'in/yr' : 'мм/год';
          const depthUnit = unitSystem === 'imperial' ? 'in' : 'мм';
          
          const outputs = {
            [lang === 'ru' ? 'Углеродистая сталь - Скорость' : 'Carbon Steel - Corrosion Rate']: `${results.corrosion.carbonSteel.rate.toFixed(3)} ${corrosionRateUnit}`,
            [lang === 'ru' ? 'Углеродистая сталь - Глубина' : 'Carbon Steel - Pitting Depth']: `${results.corrosion.carbonSteel.depth.toFixed(4)} ${depthUnit}`,
            [lang === 'ru' ? 'Углеродистая сталь - Оценка' : 'Carbon Steel - Assessment']: results.corrosion.carbonSteel.rating,
            
            [lang === 'ru' ? '13Cr Сталь - Скорость' : '13Cr Stainless - Corrosion Rate']: `${results.corrosion.cr13.rate.toFixed(4)} ${corrosionRateUnit}`,
            [lang === 'ru' ? '13Cr Сталь - Глубина' : '13Cr Stainless - Pitting Depth']: `${results.corrosion.cr13.depth.toFixed(5)} ${depthUnit}`,
            [lang === 'ru' ? '13Cr Сталь - Оценка' : '13Cr Stainless - Assessment']: results.corrosion.cr13.rating,
            
            [lang === 'ru' ? 'Супердуплекс - Скорость' : 'Duplex Steel - Corrosion Rate']: `${results.corrosion.duplex.rate.toFixed(6)} ${corrosionRateUnit}`,
            [lang === 'ru' ? 'Супердуплекс - Глубина' : 'Duplex Steel - Pitting Depth']: `${results.corrosion.duplex.depth.toFixed(6)} ${depthUnit}`,
            [lang === 'ru' ? 'Супердуплекс - Оценка' : 'Duplex Steel - Assessment']: results.corrosion.duplex.rating
          };
          
          results.elastomers.forEach(el => {
            outputs[el.name] = `${el.grade} (${lang === 'ru' ? 'Обоснование' : 'Basis'}: ${el.basis})`;
          });

          PDFExporter.exportToPDF('corrosion', inputs, outputs, lang, unitSystem);
        };
      }
    }
  }
}

export const view = new ElastomersView();
export default view;
