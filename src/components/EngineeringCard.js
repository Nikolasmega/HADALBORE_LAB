import { store } from '../core/State.js';
import { i18n } from '../utils/i18n.js';
import { convertTemperature, convertPressure, convertDimension, convertWeight, convertTensile, convertTorqueText, convertLengthText, convertStandoffText } from '../utils/units.js';
import { EngineeringEvidence } from '../core/EngineeringEvidence.js';
import { graph, EngineeringGraph } from '../core/EngineeringGraph.js';
import { EngineeringRules } from '../core/EngineeringRules.js';
import { EngineeringRecommendationEngine } from '../core/EngineeringRecommendationEngine.js';
import { alignRecordToStandard } from '../utils/standardAligner.js';
import { getPlaceholder } from '../utils/placeholder.js';
import { mockDb } from '../database/mockDb.js';
import { CompatibilitySection } from './CompatibilitySection.js';
import { TubularCard } from './TubularCard.js';
import { ThreadCard } from './ThreadCard.js';
import { ElastomerCard } from './ElastomerCard.js';
import { SteelGradeCard } from './SteelGradeCard.js';
import { StandardCard } from './StandardCard.js';
import { FailureCard } from './FailureCard.js';
import { translateDbText } from '../utils/databaseTranslator.js';


export class EngineeringCard {
  /**
   * Renders the unified engineering card HTML.
   * 
   * @param {Object} rec - The reference database record
   * @param {string} lang - Active language ('en' | 'ru')
   * @param {string} moduleType - Module identifier
   * @returns {string} HTML string
   */
  static render(rec, lang, moduleType) {
    if (!rec) return '';

    const isFailure = rec.type === 'Failure Mode' || rec.type === 'failure' || moduleType === 'failures';
    const displayName = isFailure
      ? (lang === 'ru' ? (rec.name_ru || i18n.t(`failures_library.${rec.id}`) || rec.name) : (i18n.t(`failures_library.${rec.id}`) || rec.name))
      : rec.name;

    const displayDescription = lang === 'ru'
      ? translateDbText(rec.description_ru || rec.description, lang)
      : rec.description;

    const { favorites, viewMode, compareQueue, schemaCorrupted } = store.getState();

    // Audit Safety: Block rendering if database schema is corrupted
    if (schemaCorrupted && viewMode === 'engineering') {
      return `
        <div class="w-full bg-red-500/10 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-5 shadow-sm font-sans text-xs text-red-800 dark:text-red-400 select-none">
          <h3 class="text-sm font-extrabold mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚠️ [SECURITY BLOCK]</span>
            <span>${lang === 'ru' ? 'Несовпадение схемы' : 'Schema Mismatch'}</span>
          </h3>
          <p class="leading-relaxed">
            ${lang === 'ru' 
              ? 'Критическое несовпадение схемы базы данных обнаружено на этапе загрузки. Отображение карточки заблокировано в Инженерном Режиме в целях аудита.' 
              : 'A critical database schema mismatch was detected during startup. Rendering is blocked in Engineering Mode for audit safety.'}
          </p>
        </div>
      `;
    }

    const t = (key) => i18n.t(key);
    const isFavorite = favorites.some(f => f.id === rec.id && f.module === moduleType);

    const isCompareEnabled = ['tubulars', 'steel-grades', 'elastomers', 'threads'].includes(moduleType);
    const inCompare = (compareQueue || []).some(item => item.id === rec.id);

    const compareBtnHtml = isCompareEnabled ? `
      <button id="compare-toggle-btn" data-record-id="${rec.id}" data-module-type="${moduleType}" class="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-sans font-bold uppercase rounded-lg border transition-all cursor-pointer ${
        inCompare 
          ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950 dark:border-white' 
          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
      }" title="${inCompare ? (lang === 'ru' ? 'Убрать из сравнения' : 'Remove from comparison') : (lang === 'ru' ? 'Сравнить' : 'Compare')}">
        <span class="text-xs">⇄</span>
        <span>${lang === 'ru' ? 'Сравнить' : 'Compare'}</span>
      </button>
    ` : '';

    if (viewMode === 'field') {
      const primaryName = lang === 'ru'
        ? (rec.name_ru || (isFailure ? i18n.t(`failures_library.${rec.id}`) : null) || rec.name || rec.type_ru || rec.type || rec.connection_type_ru || rec.connection_type || rec.material_ru || rec.material || rec.brine_ru || rec.brine || rec.fluid_ru || rec.fluid || rec.equipment_ru || rec.equipment)
        : ((isFailure ? i18n.t(`failures_library.${rec.id}`) : null) || rec.name || rec.type || rec.connection_type || rec.material || rec.brine || rec.fluid || rec.equipment);
      const compatBadge = CompatibilitySection.getCompatibilityBadge(rec, moduleType, lang);
      
      const getKeyLimitHtml = () => {
        if (moduleType === 'tubulars') {
          return TubularCard.getKeyLimit(rec, lang);
        } else if (moduleType === 'threads') {
          return ThreadCard.getKeyLimit(rec, lang);
        } else if (moduleType === 'elastomers') {
          return ElastomerCard.getKeyLimit(rec, lang);
        } else if (moduleType === 'steel-grades') {
          return SteelGradeCard.getKeyLimit(rec, lang);
        } else if (isFailure) {
          return FailureCard.getKeyLimit(rec, lang);
        } else {
          return StandardCard.getKeyLimit(rec, lang);
        }
      };

      const keyLimitHtml = getKeyLimitHtml();
      const openBtnText = lang === 'ru' ? 'Открыть технические подробности' : 'Open Technical Details';

      return `
        <div class="glassmorphic p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm space-y-4 font-sans text-xs">
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <span class="text-[9px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-widest">${t(`nav.${moduleType}`)}</span>
              <h3 class="text-sm font-extrabold text-zinc-950 dark:text-white leading-tight">${primaryName}</h3>
              ${displayDescription ? `<p class="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">${displayDescription}</p>` : ''}
            </div>
            <div class="flex items-center gap-2 shrink-0">
              ${compareBtnHtml}
            </div>
          </div>

          <!-- Compatibility & Key limit -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Badges -->
            ${compatBadge ? `
              <div class="flex flex-col gap-1.5">
                <span class="text-[8px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-wider">${lang === 'ru' ? 'Совместимость' : 'Compatibility Envelopes'}</span>
                ${compatBadge}
              </div>
            ` : ''}
            
            <!-- Key Limit -->
            ${keyLimitHtml}
          </div>

          <!-- Action Button -->
          <div class="pt-2 border-t border-zinc-100 dark:border-zinc-850/60 flex justify-end">
            <button id="card-open-technical-btn" class="px-4 py-2 text-[10px] font-bold uppercase rounded-lg bg-zinc-950 hover:bg-zinc-850 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 transition-colors cursor-pointer shadow-sm">
              ${openBtnText}
            </button>
          </div>
        </div>
      `;
    }

    // Normalize evidence layer
    const evidence = EngineeringEvidence.fromObject(rec);

    // Run rules engine checks
    const warnings = EngineeringRules.evaluateRecord(rec, lang);

    // Run recommendations engine checks
    const recommendations = EngineeringRecommendationEngine.getRecommendationsForRecord(rec, lang);

    // Helper to format array lists as CAD bullet points
    const formatList = (arr, colorClass = 'bg-zinc-400') => {
      const naText = getPlaceholder('no_data', lang);
      if (!arr || arr.length === 0) return `<span class="text-zinc-455 dark:text-zinc-550 font-semibold">${naText}</span>`;
      const items = Array.isArray(arr) ? arr : [arr];
      
      const cleanedItems = items.map(item => {
        if (item === undefined || item === null) return '';
        if (typeof item === 'string') {
          const s = item.trim().toLowerCase();
          if (s === '' || s === 'n/a' || s === 'unknown' || s === 'none' || s === '—' || s === '-') return '';
          return translateDbText(item, lang);
        }
        return item;
      }).filter(Boolean);

      if (cleanedItems.length === 0) {
        return `<span class="text-zinc-455 dark:text-zinc-550 font-semibold">${naText}</span>`;
      }

      const translationMap = {
        'tubulars': 'НКТ/Колонны',
        'wellheads': 'Устья скважин',
        'packers': 'Пакеры',
        'casing': 'Обсадные трубы',
        'tubing': 'НКТ (Трубы)',
        'mandrels': 'Оправки',
        'pipes': 'Трубопроводы',
        'elastomers': 'Эластомеры',
        'seals': 'Уплотнения',
        'drill pipes': 'Бурильные трубы',
        'valves': 'Клапаны',
        'connections': 'Соединения',
        'threads': 'Резьбы',
        'hangers': 'Подвески',
        'flanges': 'Фланцы',
        'tool joints': 'Замковые соединения'
      };

      return cleanedItems.map(item => {
        let displayVal = item;
        if (typeof item === 'string') {
          const s = item.trim();
          if (lang === 'ru') {
            const lowerS = s.toLowerCase();
            if (translationMap[lowerS] !== undefined) {
              displayVal = translationMap[lowerS];
            } else {
              const i18nKey = `equipment.${lowerS.replace(/\s+/g, '_')}`;
              const trans = i18n.t(i18nKey);
              if (trans !== i18nKey && trans) {
                displayVal = trans;
              }
            }
          }
        }
        return `
          <li class="flex items-start gap-1.5 py-0.5">
            <span class="w-1 h-1 rounded-full ${colorClass} mt-1.5 shrink-0"></span>
            <span>${displayVal}</span>
          </li>
        `;
      }).join('');
    };

    let sec1Html = `<p class="text-zinc-700 dark:text-zinc-350 leading-relaxed text-[11px]">${displayDescription || getPlaceholder('no_data', lang)}</p>`;

    const sections = {
      overview: lang === 'ru' ? 'Обзор / Описание' : 'Overview',
      techData: isFailure 
        ? (lang === 'ru' ? 'Проявления и симптомы' : 'Symptoms & Indicators')
        : (lang === 'ru' ? 'Технические характеристики' : 'Technical Data'),
      opRange: isFailure
        ? (lang === 'ru' ? 'Анализ причин (Root Cause)' : 'Root Cause Analysis')
        : (lang === 'ru' ? 'Рабочий диапазон' : 'Operating Range'),
      chemComp: isFailure
        ? (lang === 'ru' ? 'Провоцирующие условия' : 'Trigger Environments')
        : (lang === 'ru' ? 'Химическая совместимость' : 'Chemical Compatibility'),
      equipment: isFailure
        ? (lang === 'ru' ? 'Оборудование в зоне риска' : 'Equipment at Risk')
        : (lang === 'ru' ? 'Применяемое оборудование' : 'Used In Equipment'),
      advantages: isFailure
        ? (lang === 'ru' ? 'Предотвращение и защита' : 'Prevention & Mitigation')
        : (lang === 'ru' ? 'Преимущества / Причины выбора' : 'Advantages / Selection Basis'),
      limitations: isFailure
        ? (lang === 'ru' ? 'Материалы под угрозой' : 'Metallurgy / Materials at Risk')
        : (lang === 'ru' ? 'Ограничения / Риски' : 'Limitations / Risks'),
      applications: isFailure
        ? (lang === 'ru' ? 'Устранение на промысле' : 'Field Troubleshooting')
        : (lang === 'ru' ? 'Области применения' : 'Applications'),
      standards: lang === 'ru' ? 'Стандарты спецификаций' : 'Standards',
      diagrams: lang === 'ru' ? 'Чертежи / Диаграммы CAD' : 'CAD / Engineering Diagrams',
      references: lang === 'ru' ? 'Первоисточники' : 'References',
      lastUpdated: lang === 'ru' ? 'Дата верификации' : 'Last Updated'
    };
    
    let cardSections = {};
    if (isFailure) {
      cardSections = FailureCard.getSections(rec, lang, viewMode, formatList);
    } else {
      if (moduleType === 'tubulars') {
        cardSections = TubularCard.getSections(rec, lang, viewMode);
      } else if (moduleType === 'threads') {
        cardSections = ThreadCard.getSections(rec, lang, viewMode);
      } else if (moduleType === 'elastomers') {
        cardSections = ElastomerCard.getSections(rec, lang, viewMode);
      } else if (moduleType === 'steel-grades') {
        cardSections = SteelGradeCard.getSections(rec, lang, viewMode);
      } else {
        cardSections = StandardCard.getSections(rec, lang, viewMode, formatList);
      }

      // Populate common non-failure fields
      const isRu = lang === 'ru';
      const locArr = (enKey, ruKey) => isRu ? (rec[ruKey] || rec[enKey]) : rec[enKey];
      cardSections.sec5Html = `<ul class="text-[11px] text-zinc-700 dark:text-zinc-350 space-y-0.5">${formatList(locArr('usedInEquipment', 'usedInEquipment_ru') || locArr('used_in_equipment', 'used_in_equipment_ru'))}</ul>`;
      cardSections.sec6Html = `<ul class="text-[11px] text-zinc-700 dark:text-zinc-350 space-y-0.5">${formatList(locArr('advantages', 'advantages_ru') || locArr('why_selected', 'why_selected_ru'), 'bg-emerald-500')}</ul>`;
      cardSections.sec7Html = `<ul class="text-[11px] text-zinc-700 dark:text-zinc-350 space-y-0.5">${formatList(locArr('limitations', 'limitations_ru') || locArr('why_avoided', 'why_avoided_ru'), 'bg-red-500')}</ul>`;
      cardSections.sec8Html = `<ul class="text-[11px] text-zinc-700 dark:text-zinc-350 space-y-0.5">${formatList(locArr('applications', 'applications_ru') || locArr('typical_applications', 'typical_applications_ru') || locArr('running_notes', 'running_notes_ru') || locArr('engineering_notes', 'engineering_notes_ru'), 'bg-blue-500')}</ul>`;
      cardSections.sec9Html = `<div class="text-[10px] font-mono text-zinc-800 dark:text-zinc-300">${rec.standards && rec.standards.length > 0 ? rec.standards.join(', ') : getPlaceholder('no_data', lang)}</div>`;
    }

    let { sec2Html, sec3Html, sec4Html, sec5Html, sec6Html, sec7Html, sec8Html, sec9Html } = cardSections;

    if (viewMode === 'engineering') {
      const profile = alignRecordToStandard(rec);
      if (profile) {
        sec9Html += `
          <div class="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2 select-none">
            <span class="block text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-1.5">${lang === 'ru' ? 'Классификация стандартов' : 'Standard Classification'}</span>
            <div class="grid grid-cols-1 gap-1.5 text-[10px] font-sans">
              <div class="flex justify-between border-b border-zinc-50 dark:border-zinc-850/30 pb-1">
                <span class="text-zinc-400 dark:text-zinc-555 font-medium">${lang === 'ru' ? 'Класс API' : 'API Class'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-semibold text-right">${translateDbText(profile.apiReference, lang) || getPlaceholder('na', lang)}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-50 dark:border-zinc-850/30 pb-1">
                <span class="text-zinc-400 dark:text-zinc-555 font-medium">${lang === 'ru' ? 'Спецификация ISO' : 'ISO Reference'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-semibold text-right">${translateDbText(profile.isoReference, lang) || getPlaceholder('na', lang)}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-50 dark:border-zinc-850/30 pb-1">
                <span class="text-zinc-400 dark:text-zinc-555 font-medium">${lang === 'ru' ? 'Класс материала' : 'Material Class'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-semibold text-right">${translateDbText(profile.materialClass, lang) || getPlaceholder('na', lang)}</span>
              </div>
              <div class="flex justify-between border-b border-zinc-50 dark:border-zinc-850/30 pb-1">
                <span class="text-zinc-400 dark:text-zinc-555 font-medium">${lang === 'ru' ? 'Условия эксплуатации' : 'Service Env'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-semibold text-right">${translateDbText(profile.serviceEnvironment, lang) || getPlaceholder('no_data', lang)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-zinc-400 dark:text-zinc-555 font-medium">${lang === 'ru' ? 'Предельные параметры' : 'Envelope Limits'}:</span>
                <span class="text-zinc-700 dark:text-zinc-300 font-semibold text-right">${translateDbText(profile.envelopeLimits, lang) || getPlaceholder('no_data', lang)}</span>
              </div>
            </div>
          </div>
        `;
      }
    }

    // 1. Rules Engine warnings HTML (hidden in field mode)
    let warningsHtml = '';
    if (warnings.length > 0 && viewMode !== 'field') {
      warningsHtml = `
        <div class="space-y-1.5 mb-4 shrink-0 font-sans">
          ${warnings.map(w => {
            let colors = 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400';
            let label = 'INFO';
            if (w.type === 'warning') {
              colors = 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400';
              label = 'WARNING';
            } else if (w.type === 'caution') {
              colors = 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400';
              label = 'CRITICAL';
            }
            return `
              <div class="p-3 border rounded-xl flex items-start gap-3 text-[10.5px] leading-relaxed ${colors}">
                <span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono tracking-wider shrink-0 bg-white/70 dark:bg-zinc-800 border border-current/20">${label}</span>
                <span>${w.text}</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // 2. Related Items HTML (hidden in field mode)
    const relatedMap = graph.getRelated(rec.id);
    let relatedHtml = '';
    if (relatedMap.size > 0 && viewMode !== 'field') {
      const links = [];
      relatedMap.forEach((targetIds, relation) => {
        const relationLabel = EngineeringGraph.getRelationLabel(relation, lang);
        targetIds.forEach(targetId => {
          let targetRec = null;
          for (const key of Object.keys(mockDb)) {
            if (Array.isArray(mockDb[key])) {
              const found = mockDb[key].find(item => item.id === targetId);
              if (found) {
                targetRec = { ...found, module: key === 'acid_environments' ? 'steel-grades' : key };
                break;
              }
            }
          }
          if (targetRec) {
            links.push(`
              <button data-related-id="${targetRec.id}" data-related-module="${targetRec.module}" class="px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-355 border border-zinc-200/50 dark:border-zinc-700 rounded text-[9px] font-semibold cursor-pointer transition-colors">
                ${relationLabel}: ${translateDbText(targetRec.name, lang)}
              </button>
            `);
          }
        });
      });
      if (links.length > 0) {
        relatedHtml = `
          <div class="space-y-2 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
            <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
              ${lang === 'ru' ? 'Взаимосвязанное оборудование' : 'Linked Equipment & Context'}
            </h4>
            <div class="flex flex-wrap gap-2 pl-2">
              ${links.join('')}
            </div>
          </div>
        `;
      }
    }

    const renderEvidenceBlock = () => {
      const innerHtml = `
        <div class="space-y-3 font-sans text-xs">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-zinc-655 dark:text-zinc-350 text-[10.5px]">
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Ревизия источника' : 'Source Revision'}</span>
              <span class="font-mono">${evidence.revision || getPlaceholder('validation', lang)}</span>
            </div>
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Документ-источник' : 'Source Document'}</span>
              <span class="font-medium truncate block max-w-[120px]" title="${evidence.sourceDocument || ''}">${evidence.sourceDocument || getPlaceholder('no_data', lang)}</span>
            </div>
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Уровень доверия' : 'Confidence Level'}</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-450 uppercase">${translateDbText(evidence.confidence || 'REFERENCE', lang)}</span>
            </div>
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Дата проверки' : 'Verified At'}</span>
              <span class="font-mono">${evidence.lastUpdated || getPlaceholder('validation', lang)}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 text-zinc-655 dark:text-zinc-350 text-[10.5px]">
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Область применения (Scope)' : 'Applicability Scope'}</span>
              <span class="font-medium">${translateDbText(evidence.applicabilityScope || '', lang) || getPlaceholder('no_data', lang)}</span>
            </div>
            <div>
              <span class="block text-[8.5px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-0.5">${lang === 'ru' ? 'Ограничения и риски' : 'Limitation Notes'}</span>
              <span class="font-medium text-amber-600 dark:text-amber-450">${translateDbText(evidence.limitationNotes || '', lang) || getPlaceholder('na', lang)}</span>
            </div>
          </div>
        </div>
      `;

      if (viewMode === 'engineering') {
        return innerHtml;
      }

      // Reference Mode: render inside details block
      return `
        <details class="group mt-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/10">
          <summary class="flex justify-between items-center p-3 text-[10px] font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-500 cursor-pointer select-none outline-none">
            <span>${lang === 'ru' ? 'Показать технические доказательства (Evidence)' : 'Show Technical Evidence'}</span>
            <span class="transition-transform duration-200 group-open:rotate-180">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path></svg>
            </span>
          </summary>
          <div class="p-4 border-t border-zinc-150 dark:border-zinc-800/85">
            ${innerHtml}
          </div>
        </details>
      `;
    };

    // 4. Build Recommendations block HTML
    let recommendationsHtml = '';
    if (recommendations.length > 0) {
      if (viewMode === 'engineering') {
        recommendationsHtml = `
          <div class="space-y-3 mb-4 shrink-0 font-sans">
            <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-555 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">
              ${lang === 'ru' ? 'Рекомендуемые инженерные действия (Recommendations)' : 'Recommended Engineering Actions'}
            </h4>
            <div class="space-y-2 pl-2">
              ${recommendations.map(r => {
                const badgeClass = r.confidence.toLowerCase() === 'high'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30';
                
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
                      <button data-related-id="${targetRec.id}" data-related-module="${targetRec.module}" class="px-2 py-0.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700 rounded text-[9px] font-semibold cursor-pointer transition-colors">
                        ${lang === 'ru' ? 'Открыть' : 'Open'} ${translateDbText(targetRec.name, lang)}
                      </button>
                    `;
                  }
                  return '';
                }).join(' ');

                return `
                  <div class="p-3 border border-emerald-200/40 dark:border-emerald-900/30 bg-emerald-50/10 dark:bg-emerald-950/5 rounded-xl flex flex-col gap-2 text-[10.5px] leading-relaxed text-zinc-700 dark:text-zinc-350">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-start gap-2">
                        <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                        <span class="font-bold text-zinc-900 dark:text-white">${r.recommendation}</span>
                      </div>
                      <span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono tracking-wider shrink-0 ${badgeClass}">${lang === 'ru' ? 'Уверенность: ' : 'Confidence: '}${r.confidence}</span>
                    </div>
                    <div class="text-[10px] pl-4 text-zinc-500 dark:text-zinc-400 border-l border-zinc-100 dark:border-zinc-850">
                      ${r.reason}
                    </div>
                    ${buttons ? `<div class="pl-4 mt-1 flex flex-wrap gap-1.5">${buttons}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      } else if (viewMode === 'reference' || !viewMode) {
        recommendationsHtml = `
          <div class="space-y-3 mb-4 shrink-0 font-sans">
            <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">
              ${lang === 'ru' ? 'Рекомендации (Recommendations)' : 'Engineering Recommendations'}
            </h4>
            <div class="space-y-1.5 pl-2">
              ${recommendations.map(r => {
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
                      <button data-related-id="${targetRec.id}" data-related-module="${targetRec.module}" class="px-1.5 py-0.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700 rounded text-[8.5px] font-semibold cursor-pointer">
                        ${lang === 'ru' ? 'Открыть' : 'Open'} ${translateDbText(targetRec.name, lang)}
                      </button>
                    `;
                  }
                  return '';
                }).join(' ');

                return `
                  <div class="p-2 border border-zinc-200/40 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-lg flex flex-col gap-1.5 text-[10px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <div class="flex items-center gap-2">
                      <span class="text-emerald-500 font-extrabold shrink-0">✓</span>
                      <span class="font-semibold text-zinc-900 dark:text-zinc-100">${r.recommendation}</span>
                    </div>
                    ${buttons ? `<div class="pl-3.5 flex flex-wrap gap-1">${buttons}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      } else if (viewMode === 'field') {
        recommendationsHtml = `
          <div class="space-y-1.5 mb-2 shrink-0 font-sans border-t border-zinc-100 dark:border-zinc-850 pt-2.5">
            <span class="text-[8px] font-bold text-zinc-400 dark:text-zinc-555 uppercase tracking-widest block">${lang === 'ru' ? 'Рекомендация' : 'Recommendation'}</span>
            <div class="text-[10px] text-zinc-800 dark:text-zinc-200 space-y-1">
              ${recommendations.map(r => `
                <div class="flex items-center gap-1.5">
                  <span class="text-emerald-500 font-extrabold">✓</span>
                  <span>${r.recommendation}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    // 5. Split rendering logic for Field Mode
    if (viewMode === 'field') {
      return `
        <div class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm font-sans text-xs flex flex-col gap-5">
          <!-- Title Header -->
          <div class="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-start gap-4">
            <div>
              <h3 class="text-sm font-extrabold text-zinc-955 dark:text-white">${displayName}</h3>
              <p class="text-[9px] text-zinc-400 dark:text-zinc-555 font-mono uppercase tracking-wider mt-0.5">${rec.type} • ID: ${rec.id}</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              ${compareBtnHtml}
              <button id="favorite-toggle-btn" data-record-id="${rec.id}" data-module-type="${moduleType}" class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-all cursor-pointer ${isFavorite ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-650'}" title="${isFavorite ? (lang === 'ru' ? 'Удалить из избранного' : 'Remove from favorites') : (lang === 'ru' ? 'Добавить в избранное' : 'Add to favorites')}">
                <svg class="w-4 h-4 ${isFavorite ? 'fill-current' : 'fill-none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c.196-.393.682-.393.878 0l2.082 4.185 4.517.657c.438.064.613.61.296.932l-3.269 3.187.772 4.498c.075.438-.378.767-.77.56l-4.043-2.126-4.042 2.126c-.392.207-.845-.122-.77-.56l.773-4.498-3.27-3.187c-.316-.322-.142-.868.297-.932l4.516-.657 2.082-4.185z"></path></svg>
              </button>
            </div>
          </div>
          <div class="space-y-5">
            <div class="space-y-1.5">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.overview}
              </h4>
              ${sec1Html}
            </div>
            <div class="space-y-2">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.techData}
              </h4>
              ${sec2Html}
            </div>
            <div class="space-y-1.5">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.opRange}
              </h4>
              ${sec3Html}
            </div>
            ${recommendationsHtml}
          </div>
        </div>
      `;
    }

    const physicalModules = ['tubulars', 'threads', 'elastomers'];
    const isPhysical = physicalModules.includes(moduleType);
    let diagramsSectionHtml = '';
    if (isPhysical) {
      const hasDiagram = rec.diagrams && rec.diagrams.length > 0;
      diagramsSectionHtml = `
        <div class="space-y-2 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
          <h4 class="text-[9px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
            ${sections.diagrams}
          </h4>
          ${hasDiagram 
            ? `<div id="diagram-renderer-container" class="w-full h-80 min-h-[320px]"></div>`
            : `
              <div class="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 p-4 flex flex-col gap-3 font-sans text-xs select-none">
                <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                  <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"></path></svg>
                  <span>${lang === 'ru' ? 'Данный чертеж находится на инженерной верификации.' : 'This engineering diagram is under validation.'}</span>
                </div>
                <div class="text-[10px] text-zinc-500 dark:text-zinc-400 pl-6.5 border-l border-zinc-200 dark:border-zinc-800">
                  <p class="font-bold mb-1">${lang === 'ru' ? 'Этот раздел обычно содержит:' : 'This section normally contains:'}</p>
                  <ul class="list-disc pl-4 space-y-1 mt-1 font-mono text-[9px]">
                    <li>${lang === 'ru' ? 'габаритный чертеж' : 'dimensional drawing'}</li>
                    <li>${lang === 'ru' ? 'поперечное сечение' : 'cross-section'}</li>
                    <li>${lang === 'ru' ? 'профиль уплотнения' : 'sealing profile'}</li>
                    <li>${lang === 'ru' ? 'геометрия' : 'geometry'}</li>
                    <li>${lang === 'ru' ? 'рабочие зоны' : 'operational zones'}</li>
                  </ul>
                </div>
              </div>
            `
          }
        </div>
      `;
    }
    return `
      <div class="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm font-sans text-xs flex flex-col gap-6">
        
        <!-- Rules Warnings Block -->
        ${warningsHtml}

        <!-- Recommendations Block -->
        ${recommendationsHtml}

        <!-- Title Header -->
        <div class="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-start gap-4">
          <div>
            <h3 class="text-sm font-extrabold text-zinc-955 dark:text-white">${displayName}</h3>
            <p class="text-[9px] text-zinc-400 dark:text-zinc-555 font-mono uppercase tracking-wider mt-0.5">${rec.type} • ID: ${rec.id}</p>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            ${compareBtnHtml}
            <button id="favorite-toggle-btn" data-record-id="${rec.id}" data-module-type="${moduleType}" class="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-all cursor-pointer ${isFavorite ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-650'}" title="${isFavorite ? (lang === 'ru' ? 'Удалить из избранного' : 'Remove from favorites') : (lang === 'ru' ? 'Добавить в избранное' : 'Add to favorites')}">
              <svg class="w-4 h-4 ${isFavorite ? 'fill-current' : 'fill-none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499c.196-.393.682-.393.878 0l2.082 4.185 4.517.657c.438.064.613.61.296.932l-3.269 3.187.772 4.498c.075.438-.378.767-.77.56l-4.043-2.126-4.042 2.126c-.392.207-.845-.122-.77-.56l.773-4.498-3.27-3.187c-.316-.322-.142-.868.297-.932l4.516-.657 2.082-4.185z"></path></svg>
            </button>
          </div>
        </div>

        <!-- 12-Section Dense Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Column Left -->
          <div class="space-y-5">
            <!-- Section 1 -->
            <div class="space-y-1.5">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-550 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.overview}
              </h4>
              ${sec1Html}
            </div>

            <!-- Section 2 -->
            <div class="space-y-2">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.techData}
              </h4>
              ${sec2Html}
            </div>

            <!-- Section 3 -->
            <div class="space-y-1.5">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.opRange}
              </h4>
              ${sec3Html}
            </div>

            <!-- Section 4 -->
            ${moduleType !== 'threads' ? `
            <div class="space-y-1.5">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.chemComp}
              </h4>
              ${sec4Html}
            </div>
            ` : ''}

            <!-- Section 5 -->
            <div class="space-y-1.5">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.equipment}
              </h4>
              ${sec5Html}
            </div>
          </div>

          <!-- Column Right -->
          <div class="space-y-5">
            <!-- Section 6 -->
            <div class="space-y-1.5">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.advantages}
              </h4>
              ${sec6Html}
            </div>

            <!-- Section 7 -->
            <div class="space-y-1.5">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.limitations}
              </h4>
              ${sec7Html}
            </div>

            <!-- Section 8 -->
            <div class="space-y-1.5">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.applications}
              </h4>
              ${sec8Html}
            </div>

            <!-- Section 9 -->
            <div class="space-y-1.5">
              <h4 class="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 uppercase tracking-widest border-l-2 border-zinc-400 dark:border-zinc-655 pl-2">
                ${sections.standards}
              </h4>
              ${sec9Html}
            </div>
          </div>
        </div>

        <!-- Section 10: Diagrams (Full width) -->
        ${diagramsSectionHtml}

        <!-- Relationship Graph items -->
        ${relatedHtml}

        <!-- Evidence traceability component (Sections 11 & 12) -->
        ${renderEvidenceBlock()}
      </div>
    `;
  }
}
