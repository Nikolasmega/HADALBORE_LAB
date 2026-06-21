/**
 * compareRules.js
 * Definitions and helper functions for parsing and comparing engineering properties.
 */

// Helper to extract the first numeric value from a string
export function parseNumeric(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return val;
  const s = String(val).replace(/,/g, '').trim();
  // Match number like 125000, 125.5, -40
  const match = s.match(/-?\d+(?:\.\d+)?/);
  if (match) {
    return parseFloat(match[0]);
  }
  return null;
}

// Helper to convert standard rating terms into numerical scale values
export function parseRating(val) {
  if (val === undefined || val === null) return 0;
  const s = String(val).toLowerCase();
  
  if (s.includes('exceptional') || s.includes('very high') || s.includes('excellent') || s.includes('high') || s.includes('высокая') || s.includes('высокий') || s.includes('отлично')) {
    return 4;
  }
  if (s.includes('good') || s.includes('moderate') || s.includes('medium') || s.includes('средняя') || s.includes('средний') || s.includes('хорошо')) {
    return 3;
  }
  if (s.includes('fair') || s.includes('low') || s.includes('reference only') || s.includes('низкая') || s.includes('низкий') || s.includes('удовлетворительно')) {
    return 2;
  }
  if (s.includes('poor') || s.includes('avoid') || s.includes('not recommended') || s.includes('плохо') || s.includes('не рекомендуется')) {
    return 1;
  }
  return 0; // Unknown / N/A
}

// Helper to parse confidence levels
export function parseConfidence(val) {
  if (!val) return 0;
  const s = String(val).toLowerCase();
  if (s.includes('high') || s.includes('высокий')) return 3;
  if (s.includes('medium') || s.includes('средний')) return 2;
  return 1; // Reference / low
}

// Helper to parse running complexity (lower is better)
export function parseComplexity(val) {
  if (!val) return 0;
  const s = String(val).toLowerCase();
  if (s.includes('high') || s.includes('высокая')) return 3; // worst
  if (s.includes('medium') || s.includes('средняя')) return 2;
  if (s.includes('low') || s.includes('низкая')) return 1; // best
  return 0;
}

// Module properties definitions
export const MODULE_PROPERTIES = {
  tubulars: [
    { key: 'od', label: { en: 'Outer Diameter (OD)', ru: 'Наружный диаметр (OD)' }, type: 'numeric', direction: 'neutral' },
    { key: 'inner_dia', label: { en: 'Inner Diameter (ID)', ru: 'Внутренний диаметр (ID)' }, type: 'numeric', direction: 'neutral' },
    { key: 'weight', label: { en: 'Linear Weight', ru: 'Линейный вес' }, type: 'numeric', direction: 'neutral' },
    { key: 'grade', label: { en: 'Grade', ru: 'Группа прочности' }, type: 'text' },
    { key: 'yield_strength', label: { en: 'Yield Strength', ru: 'Предел текучести' }, type: 'numeric', direction: 'higher' },
    { key: 'collapse', label: { en: 'Collapse Resistance', ru: 'Давление смятия' }, type: 'numeric', direction: 'higher' },
    { key: 'burst', label: { en: 'Burst Resistance', ru: 'Давление разрыва' }, type: 'numeric', direction: 'higher' },
    { key: 'tensile', label: { en: 'Tensile Strength', ru: 'Предел прочности (Растяжение)' }, type: 'numeric', direction: 'higher' },
    { key: 'connection_type', label: { en: 'Connection Type', ru: 'Тип соединения' }, type: 'text' },
    { key: 'sour_service_suitability', label: { en: 'Sour Service (H₂S)', ru: 'Кислые среды (H₂S)' }, type: 'rating', direction: 'higher' },
    { key: 'applications', label: { en: 'Applications', ru: 'Области применения' }, type: 'list' },
    { key: 'standards', label: { en: 'Standards', ru: 'Стандарты' }, type: 'list' },
    { key: 'temperature_suitability', label: { en: 'Temperature Envelope', ru: 'Температурный диапазон' }, type: 'text' },
    { key: 'material_family', label: { en: 'Material Family', ru: 'Класс материала' }, type: 'text' },
    { key: 'api_class', label: { en: 'Standard API Class', ru: 'Класс API стандарта' }, type: 'text' },
    { key: 'iso_ref', label: { en: 'Standard ISO Reference', ru: 'Спецификация ISO' }, type: 'text' },
    { key: 'service_env', label: { en: 'Service Environment', ru: 'Условия эксплуатации' }, type: 'text' },
    { key: 'env_limits', label: { en: 'Standard Envelope Limits', ru: 'Предельные параметры' }, type: 'text' },
    { key: 'confidenceLevel', label: { en: 'Evidence Confidence', ru: 'Достоверность данных' }, type: 'confidence', direction: 'higher' }
  ],
  'steel-grades': [
    { key: 'yield_strength', label: { en: 'Yield Strength', ru: 'Предел текучести' }, type: 'numeric', direction: 'higher' },
    { key: 'tensile_strength', label: { en: 'Tensile Strength', ru: 'Предел прочности' }, type: 'numeric', direction: 'higher' },
    { key: 'hardness', label: { en: 'Hardness Limit', ru: 'Предел твердости' }, type: 'text' },
    { key: 'h2s_resistance', label: { en: 'H₂S Resistance', ru: 'Стойкость к H₂S' }, type: 'rating', direction: 'higher' },
    { key: 'co2_resistance', label: { en: 'CO₂ Resistance', ru: 'Стойкость к CO₂' }, type: 'rating', direction: 'higher' },
    { key: 'chloride_resistance', label: { en: 'Chloride Resistance', ru: 'Стойкость к хлоридам' }, type: 'rating', direction: 'higher' },
    { key: 'temperature_suitability', label: { en: 'Temperature Envelope', ru: 'Температурный диапазон' }, type: 'text' },
    { key: 'typical_applications', label: { en: 'Typical Applications', ru: 'Типичные применения' }, type: 'list' },
    { key: 'advantages', label: { en: 'Advantages / Strengths', ru: 'Преимущества' }, type: 'list' },
    { key: 'limitations', label: { en: 'Limitations / Risks', ru: 'Ограничения и риски' }, type: 'list' },
    { key: 'why_selected', label: { en: 'Why Selected', ru: 'Причины выбора' }, type: 'text' },
    { key: 'why_avoided', label: { en: 'Why Avoided', ru: 'Причины избегания' }, type: 'text' },
    { key: 'standards', label: { en: 'Standards', ru: 'Стандарты' }, type: 'list' },
    { key: 'material_family', label: { en: 'Material Family', ru: 'Класс материала' }, type: 'text' },
    { key: 'api_class', label: { en: 'Standard API Class', ru: 'Класс API стандарта' }, type: 'text' },
    { key: 'iso_ref', label: { en: 'Standard ISO Reference', ru: 'Спецификация ISO' }, type: 'text' },
    { key: 'service_env', label: { en: 'Service Environment', ru: 'Условия эксплуатации' }, type: 'text' },
    { key: 'env_limits', label: { en: 'Standard Envelope Limits', ru: 'Предельные параметры' }, type: 'text' },
    { key: 'confidenceLevel', label: { en: 'Evidence Confidence', ru: 'Достоверность данных' }, type: 'confidence', direction: 'higher' }
  ],
  elastomers: [
    { key: 'max_temp', label: { en: 'Max Temperature', ru: 'Макс. температура' }, type: 'numeric', direction: 'higher' },
    { key: 'acid_compatibility', label: { en: 'Acid Compatibility', ru: 'Стойкость к кислотам' }, type: 'rating', direction: 'higher' },
    { key: 'h2s_compatibility', label: { en: 'H₂S Compatibility', ru: 'Стойкость к H₂S' }, type: 'rating', direction: 'higher' },
    { key: 'co2_compatibility', label: { en: 'CO₂ Compatibility', ru: 'Стойкость к CO₂' }, type: 'rating', direction: 'higher' },
    { key: 'rgd_resistance', label: { en: 'RGD Resistance', ru: 'Сопротивление RGD (Взрыв. декомпрессия)' }, type: 'rating', direction: 'higher' },
    { key: 'pressure_limits', label: { en: 'Pressure Limits', ru: 'Пределы давления' }, type: 'numeric', direction: 'higher' },
    { key: 'failure_modes', label: { en: 'Failure Modes', ru: 'Типичные отказы' }, type: 'list' },
    { key: 'applications', label: { en: 'Typical Applications', ru: 'Типичные применения' }, type: 'list' },
    { key: 'chemical_resistance', label: { en: 'Chemical Resistance', ru: 'Химическая стойкость' }, type: 'text' },
    { key: 'oem_references', label: { en: 'OEM References', ru: 'OEM Рекомендации' }, type: 'list' },
    { key: 'material_family', label: { en: 'Material Family', ru: 'Класс материала' }, type: 'text' },
    { key: 'api_class', label: { en: 'Standard API Class', ru: 'Класс API стандарта' }, type: 'text' },
    { key: 'iso_ref', label: { en: 'Standard ISO Reference', ru: 'Спецификация ISO' }, type: 'text' },
    { key: 'service_env', label: { en: 'Service Environment', ru: 'Условия эксплуатации' }, type: 'text' },
    { key: 'env_limits', label: { en: 'Standard Envelope Limits', ru: 'Предельные параметры' }, type: 'text' }
  ],
  threads: [
    { key: 'connection_family', label: { en: 'Connection Family', ru: 'Семейство резьбы' }, type: 'text' },
    { key: 'gas_tightness', label: { en: 'Gas Tightness', ru: 'Герметичность газа' }, type: 'rating', direction: 'higher' },
    { key: 'torque_performance', label: { en: 'Torque Performance', ru: 'Предел момента свинчивания' }, type: 'rating', direction: 'higher' },
    { key: 'galling_resistance', label: { en: 'Galling Resistance', ru: 'Стойкость к задирам' }, type: 'rating', direction: 'higher' },
    { key: 'running_complexity', label: { en: 'Running Complexity', ru: 'Сложность сборки' }, type: 'complexity', direction: 'lower' },
    { key: 'repairability', label: { en: 'Repairability', ru: 'Ремонтопригодность' }, type: 'rating', direction: 'higher' },
    { key: 'seal_mechanism', label: { en: 'Seal Mechanism', ru: 'Тип уплотнения' }, type: 'text' },
    { key: 'recommended_grease', label: { en: 'Recommended Grease', ru: 'Рекомендуемая смазка' }, type: 'text' },
    { key: 'applications', label: { en: 'Applications', ru: 'Области применения' }, type: 'list' },
    { key: 'oem_notes', label: { en: 'OEM Notes', ru: 'OEM Заметки' }, type: 'text' },
    { key: 'material_family', label: { en: 'Material Family', ru: 'Класс материала' }, type: 'text' },
    { key: 'api_class', label: { en: 'Standard API Class', ru: 'Класс API стандарта' }, type: 'text' },
    { key: 'iso_ref', label: { en: 'Standard ISO Reference', ru: 'Спецификация ISO' }, type: 'text' },
    { key: 'service_env', label: { en: 'Service Environment', ru: 'Условия эксплуатации' }, type: 'text' },
    { key: 'env_limits', label: { en: 'Standard Envelope Limits', ru: 'Предельные параметры' }, type: 'text' }
  ]
};
