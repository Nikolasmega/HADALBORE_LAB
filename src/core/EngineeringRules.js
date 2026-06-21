import { EngineeringLimits } from './EngineeringLimits.js';
import { store } from './State.js';

/**
 * Lightweight rule-based reasoning engine for engineering decisions.
 * Implements strict validations for material compatibility, pressure thresholds, and connections.
 */
export class EngineeringRules {
  /**
   * Evaluate safety/design rules against a database record.
   * 
   * @param {Object} rec - Database record 
   * @param {string} lang - Active language ('ru' | 'en')
   * @returns {Array<{type: string, text: string}>} Array of warnings/cautions/infos
   */
  static evaluateRecord(rec, lang) {
    const findings = [];
    if (!rec) return findings;

    const lowerId = (rec.id || '').toLowerCase();
    const lowerName = (rec.name || '').toLowerCase();
    const lowerDesc = (rec.description || '').toLowerCase();
    const isRu = lang === 'ru';

    // Rule 1: HNBR/NBR in H2S / Sour environments
    if (rec.type === 'Elastomer') {
      if (lowerId.includes('hnbr') || lowerId.includes('nitrile') || lowerId.includes('nbr')) {
        const elastomerKey = lowerId.includes('hnbr') ? 'hnbr' : 'nbr';
        const limit = EngineeringLimits.ELASTOMERS[elastomerKey];
        if (limit) {
          findings.push({
            type: 'warning',
            text: isRu
              ? `ОГРАНИЧЕНИЕ: Эластомеры HNBR/NBR подвержены термической деградации (лимит ${limit.maxTempC}°C) при высоких концентрациях H₂S. Проверьте соответствие NACE MR0175 / ISO 23936-2.`
              : `LIMITATION: HNBR/NBR elastomers are susceptible to thermal degradation (limit ${limit.maxTempC}C) in high H2S concentrations. Verify NACE MR0175 / ISO 23936-2 compliance.`
          });
        }
      }
    }

    // Rule 2: P110 Steel Grade in Sour Service
    if (rec.grade === 'P110' || lowerId.includes('p110')) {
      const limit = EngineeringLimits.METALLURGY.P110;
      findings.push({
        type: 'caution',
        text: isRu
          ? `ВНИМАНИЕ: Высокопрочная углеродистая сталь класса P110 (предел ${limit.maxTensilePsi} psi) склонна к сульфидному растрескиванию (SSC) в присутствии влажного H₂S. Не рекомендуется для сред Sour Service без ингибиторов.`
          : `CAUTION: High-strength P110 carbon steel (limit ${limit.maxTensilePsi} psi) is highly susceptible to Sulfide Stress Cracking (SSC) in wet H2S environments. Not recommended for Sour Service.`
      });
    }

    // Rule 3: Premium Connection metallurgy compatibility
    if (rec.type === 'Thread') {
      const isPremium = lowerName.includes('premium') || lowerName.includes('vam') || lowerName.includes('tenaris') || lowerName.includes('tmk');
      const isMetalSeal = rec.seal_type && rec.seal_type.toLowerCase().includes('metal');
      
      if (isPremium || isMetalSeal) {
        findings.push({
          type: 'info',
          text: isRu
            ? 'РЕКОМЕНДАЦИЯ: Премиальные резьбы с уплотнением металл-металл требуют использования коррозионностойких сталей (L80, 13Cr, Super 13Cr) для предотвращения задиров резьбы при свинчивании.'
            : 'METALLURGY: Premium threads with metal-to-metal seals should be run with corrosion-resistant alloys (L80, 13Cr, Super 13Cr) to prevent thread galling.'
        });
      }
    }

    return findings;
  }

  /**
   * Evaluate safety/design rules against dynamic calculator outputs.
   * 
   * @param {string} calcType - Calculator identifier (e.g. 'hydrostatic', 'corrosion')
   * @param {Object} inputs - Key-value pair of inputs
   * @param {Object} outputs - Key-value pair of calculated outputs
   * @param {string} lang - Active language ('ru' | 'en')
   * @returns {Array<{type: string, text: string}>} Array of warnings/cautions/infos
   */
  static evaluateCalculation(calcType, inputs, outputs, lang) {
    const findings = [];
    const isRu = lang === 'ru';

    // Rule A: Hydrostatic pressure threshold validation
    if (calcType === 'hydrostatic') {
      const density = parseFloat(inputs.density) || 0;
      const depth = parseFloat(inputs.depth) || 0;
      
      // Calculate pressure in psi
      let pressPsi = 0;
      const unitSystem = store.getState().unitSystem;
      
      if (unitSystem === 'imperial') {
        pressPsi = depth * density * 0.052;
      } else {
        // depth in m, density in kg/m3
        const pressBar = depth * density * 9.80665 / 100000;
        pressPsi = pressBar * 14.5038;
      }

      if (pressPsi > EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI) {
        findings.push({
          type: 'warning',
          text: isRu
            ? `КРИТИЧЕСКОЕ ДАВЛЕНИЕ: Расчетное гидростатическое давление превышает ${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI.toLocaleString()} psi (${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_BAR} бар). Рекомендуется использовать тяжелые обсадные колонны (класс Q125) и премиальные соединения.`
            : `HIGH PRESSURE ALERT: Calculated hydrostatic pressure exceeds ${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI.toLocaleString()} psi (${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_BAR} bar). Heavy-wall Q125 casings and gas-tight premium joints are highly recommended.`
        });
      }
    }

    // Rule B: Corrosion and elastomers temperature limits
    if (calcType === 'corrosion') {
      const temp = parseFloat(inputs.temperature) || 0;
      const env = inputs.environment;
      
      if (env === 'sour' && temp > EngineeringLimits.PRESSURE.CRITICAL_CORROSION_TEMP_C) {
        findings.push({
          type: 'caution',
          text: isRu
            ? `ТЕМПЕРАТУРНЫЙ ЛИМИТ: Температура выше ${EngineeringLimits.PRESSURE.CRITICAL_CORROSION_TEMP_C}°C в среде H₂S экспоненциально ускоряет точечную коррозию (pitting). Не используйте стандартную сталь 13Cr без коррозионных ингибиторов.`
            : `TEMPERATURE CRITICAL: Temp above ${EngineeringLimits.PRESSURE.CRITICAL_CORROSION_TEMP_C}C in H2S service exponentially accelerates pitting corrosion. Avoid standard 13Cr without chemical inhibition.`
        });
      }
    }

    return findings;
  }
}

export default EngineeringRules;
