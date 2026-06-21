import { EngineeringLimits } from './EngineeringLimits.js';
import { mockDb } from '../database/mockDb.js';
import { store } from './State.js';

/**
 * EngineeringRecommendationEngine.js
 * Strictly rule-based recommendation engine for HADALBORE LAB.
 * Generates deterministic engineering actions based on metallurgy, environment, limits, and compatibility.
 */
export class EngineeringRecommendationEngine {
  /**
   * Generate recommendations for a specific DB record.
   * 
   * @param {Object} rec - Database record
   * @param {string} lang - Active language ('ru' | 'en')
   * @returns {Array<{recommendation: string, reason: string, confidence: string, linkedEntities: Array<string>}>}
   */
  static getRecommendationsForRecord(rec, lang) {
    const recommendations = [];
    if (!rec) return recommendations;

    const lowerId = (rec.id || '').toLowerCase();
    const lowerName = (rec.name || '').toLowerCase();
    const isRu = lang === 'ru';

    // 1. Recommended Alternative: P110 Steel Grade in Sour Service
    if (rec.grade === 'P110' || lowerId.includes('p110')) {
      const p110Limit = EngineeringLimits.METALLURGY.P110;
      recommendations.push({
        recommendation: isRu
          ? 'Рекомендуемая альтернатива: Сталь L80 Type 1 или 13Cr'
          : 'Recommended alternative: L80 Type 1 or 13Cr Steel',
        reason: isRu
          ? `Углеродистая сталь P110 (предел прочности ${p110Limit.maxTensilePsi} psi) подвержена сульфидному коррозионному растрескиванию под напряжением (SSC) в присутствии H₂S. Сталь L80 обладает более высокой стойкостью к кислым средам, а 13Cr обеспечивает отличную защиту от общей коррозии.`
          : `High-strength P110 carbon steel (tensile limit ${p110Limit.maxTensilePsi} psi) is susceptible to Sulfide Stress Cracking (SSC) in H2S service. L80 offers better resistance to sour cracking, while 13Cr provides superior general corrosion resistance.`,
        confidence: 'High',
        linkedEntities: ['steel_grade_l80', 'steel_grade_13cr']
      });
    }

    // 2. Compatibility Recommendation: Premium threads compatibility
    if (rec.type === 'Thread') {
      const isPremium = lowerName.includes('premium') || lowerName.includes('vam') || lowerName.includes('tenaris') || lowerName.includes('tmk') || lowerName.includes('tp-cq');
      const isMetalSeal = rec.seal_type && rec.seal_type.toLowerCase().includes('metal');

      if (isPremium || isMetalSeal) {
        recommendations.push({
          recommendation: isRu
            ? 'Рекомендация: Совместимые трубы классов L80/13Cr, бессвинцовая резьбовая смазка API 5A3 и уплотнения Teflon/Kalrez.'
            : 'Recommendation: Use compatible L80/13Cr tubing, lead-free thread compound compliant with API 5A3, and Teflon/Kalrez elastomers.',
          reason: isRu
            ? 'Премиальные герметичные соединения требуют коррозионностойких сплавов для снижения риска задиров (galling) при свинчивании, а также надежных эластомеров для сохранения герметичности уплотнения металл-металл.'
            : 'Premium gas-tight connections benefit from corrosion-resistant alloys to prevent thread galling during makeup, along with high-performance elastomers to protect metal-to-metal sealing.',
          confidence: 'High',
          linkedEntities: ['steel_grade_l80', 'steel_grade_13cr', 'elastomer_teflon_ptfe', 'elastomer_kalrez_ffkm']
        });
      }
    }

    // 3. Environmental Recommendation: Elastomers in high temp/H2S
    if (rec.type === 'Elastomer') {
      if (lowerId.includes('hnbr') || lowerId.includes('nbr') || lowerId.includes('nitrile')) {
        const elastomerKey = lowerId.includes('hnbr') ? 'hnbr' : 'nbr';
        const limit = EngineeringLimits.ELASTOMERS[elastomerKey];
        recommendations.push({
          recommendation: isRu
            ? 'Рекомендуемая альтернатива: Kalrez (FFKM) или Viton (FKM)'
            : 'Recommended alternative: Kalrez (FFKM) or Viton (FKM)',
          reason: isRu
            ? `Уплотнения из NBR/HNBR склонны к ускоренной деградации и потере эластичности при воздействии температур выше лимита (${limit.maxTempC}°C), H₂S или кислотных сред (HCl). Рекомендуется использовать FFKM или FKM.`
            : `NBR/HNBR seals undergo accelerated chemical degradation and lose elasticity at temperatures exceeding their limit (${limit.maxTempC}C) in H2S or acid (HCl) environments. Kalrez (FFKM) or Viton (FKM) should be used instead.`,
          confidence: 'High',
          linkedEntities: ['elastomer_kalrez_ffkm', 'elastomer_viton_fkm']
        });
      }
    }

    // 4. Environmental Recommendation: Acid environments
    if (rec.type === 'Acid Environment' || lowerId.includes('acid') || lowerId.includes('sour') || lowerId.includes('13cr')) {
      recommendations.push({
        recommendation: isRu
          ? 'Рекомендация: Использовать уплотнения Kalrez (FFKM) или Teflon (PTFE), избегать NBR/HNBR.'
          : 'Recommendation: Recommend Kalrez (FFKM) or Teflon (PTFE) seals. Avoid NBR/HNBR.',
        reason: isRu
          ? 'Агрессивные кислоты и кислые газы вызывают быструю деструкцию бутадиен-нитрильных каучуков. Применение фторопласта (PTFE) и перфторкаучука (FFKM) гарантирует долговечность пакерных узлов.'
          : 'Aggressive acids and sour gases cause rapid destruction of standard nitrile rubbers. Employing Teflon (PTFE) and perfluoroelastomer (FFKM) ensures the longevity of packer elements.',
        confidence: 'High',
        linkedEntities: ['elastomer_kalrez_ffkm', 'elastomer_teflon_ptfe']
      });
    }

    // 5. Pressure Recommendation: Low-strength steel tubulars (J55/K55)
    if (rec.grade === 'J55' || rec.grade === 'K55' || lowerId.includes('j55') || lowerId.includes('k55')) {
      recommendations.push({
        recommendation: isRu
          ? 'Рекомендуемая альтернатива: Сталь L80 Carbon Steel или Q125'
          : 'Recommended alternative: L80 Carbon Steel or Q125 High-Strength Steel',
        reason: isRu
          ? 'Трубы классов J55/K55 имеют низкие пределы прочности на разрыв и смятие. Для глубоких интервалов или высоких устьевых давлений рекомендуется использовать более прочные группы стали.'
          : 'Tubulars of J55/K55 grades have limited tensile and collapse strengths. For deeper intervals or elevated wellhead pressures, stronger steel grades are recommended.',
        confidence: 'Medium',
        linkedEntities: ['steel_grade_l80', 'steel_grade_q125']
      });
    }

    return recommendations;
  }

  /**
   * Generate recommendations based on calculation results.
   * 
   * @param {string} calcType - Calculator type ('hydrostatic' | 'tally' | 'displacement' | 'corrosion' | 'thermal' | 'hook_load')
   * @param {Object} inputs - Inputs used for calculation
   * @param {Object} outputs - Calculation outputs
   * @param {string} lang - Active language ('ru' | 'en')
   * @returns {Array<{recommendation: string, reason: string, confidence: string, linkedEntities: Array<string>}>}
   */
  static getRecommendationsForCalculation(calcType, inputs, outputs, lang) {
    const recommendations = [];
    const isRu = lang === 'ru';

    if (calcType === 'hydrostatic') {
      const density = parseFloat(inputs.density) || 0;
      const depth = parseFloat(inputs.depth) || 0;
      
      let pressPsi = 0;
      const unitSystem = store.getState().unitSystem;
      
      if (unitSystem === 'imperial') {
        pressPsi = depth * density * 0.052;
      } else {
        const pressBar = depth * density * 9.80665 / 100000;
        pressPsi = pressBar * 14.5038;
      }

      if (pressPsi > EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI) {
        recommendations.push({
          recommendation: isRu
            ? `Рекомендация: Обсадная колонна высокой прочности (Q125), увеличенная толщина стенок и премиальные герметичные соединения.`
            : `Recommendation: High-strength casing (Q125), increased wall thickness, and gas-tight premium connections.`,
          reason: isRu
            ? `Расчетное давление превышает критический порог ${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI.toLocaleString()} psi (${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_BAR} бар). Стандартная сталь L80 или J55 имеет высокий риск пластической деформации или смятия под действием таких нагрузок.`
            : `Calculated hydrostatic pressure exceeds critical safety threshold of ${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI.toLocaleString()} psi (${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_BAR} bar). Standard L80 or J55 steel runs a high risk of plastic deformation or collapse under such loads.`,
          confidence: 'High',
          linkedEntities: ['steel_grade_q125', 'thread_vam_top', 'thread_tenaris_blue']
        });
      } else if (pressPsi > (EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI / 2)) {
        recommendations.push({
          recommendation: isRu
            ? 'Рекомендация: Использовать трубы класса L80/P110 и соединения ОТТГ/ОТТМ.'
            : 'Recommendation: Use L80/P110 pipe grades and gas-tight OTTG/OTTM connections.',
          reason: isRu
            ? `При давлениях от ${Math.round(EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI / 2).toLocaleString()} до ${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI.toLocaleString()} psi рекомендуется использовать стали средней и высокой прочности для обеспечения достаточного запаса прочности.`
            : `For pressures between ${Math.round(EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI / 2).toLocaleString()} and ${EngineeringLimits.PRESSURE.HIGH_THRESHOLD_PSI.toLocaleString()} psi, medium to high-strength steels are recommended to ensure a sufficient safety margin.`,
          confidence: 'Medium',
          linkedEntities: ['steel_grade_l80', 'steel_grade_p110', 'thread_ottg_gost']
        });
      }
    }

    if (calcType === 'hook_load') {
      const airWt = parseFloat(inputs.airWeight) || 0;
      const mudDens = parseFloat(inputs.mudDensity) || 0;
      const dragPct = parseFloat(inputs.drag) || 0;

      let bf = 1.0;
      const unitSystem = store.getState().unitSystem;
      if (unitSystem === 'imperial') {
        bf = 1.0 - (mudDens / 65.5);
      } else if (unitSystem === 'metric') {
        bf = 1.0 - (mudDens / 7850.0);
      } else {
        bf = 1.0 - (mudDens / 7.85);
      }
      bf = Math.max(0, Math.min(1, bf));
      const wetWt = airWt * bf;
      const pickupWt = wetWt * (1.0 + dragPct / 100.0);

      // If pickup load is high (> 180,000 lbs or > 80,000 kg)
      const isHighLoad = unitSystem === 'imperial' ? pickupWt > 180000 : pickupWt > 80000;

      if (isHighLoad) {
        recommendations.push({
          recommendation: isRu
            ? 'Рекомендация: Улучшение плавучести (повышение плотности бурового раствора), использование более легкой колонны (сталь S135 с меньшей толщиной стенки).'
            : 'Recommendation: Improve buoyancy (increase mud density) or use a lighter string (high-strength S135 steel with thinner walls).',
          reason: isRu
            ? 'Натяжение при подъеме колонны приближается к лимитам грузоподъемности. Увеличение плотности раствора снижает вес в жидкости, а сталь S135 оптимизирует соотношение прочности и веса.'
            : 'Expected pickup load is high, approaching derrick tensile limits. A denser mud increases buoyancy, while S135 grade steel optimizes strength-to-weight ratio.',
          confidence: 'High',
          linkedEntities: ['drillpipe_5000_s135', 'standard_drill_pipe']
        });
      }
    }

    if (calcType === 'corrosion') {
      const temp = parseFloat(inputs.temperature) || 0;
      const env = inputs.environment;

      if (env === 'sour' || temp > EngineeringLimits.PRESSURE.CRITICAL_CORROSION_TEMP_C) {
        recommendations.push({
          recommendation: isRu
            ? `Рекомендация: Использовать высоколегированный сплав Inconel 718 или сталь Super 13Cr вместо стандартной 13Cr, а также уплотнения Kalrez (FFKM).`
            : `Recommendation: Use Inconel 718 high-nickel alloy or Super 13Cr steel instead of standard 13Cr, and select Kalrez (FFKM) seals.`,
          reason: isRu
            ? `Высокая температура (выше лимита ${EngineeringLimits.PRESSURE.CRITICAL_CORROSION_TEMP_C}°C) и кислотная/H₂S среда вызывают водородное охрупчивание и щелевую коррозию на стандартных хромистых сталях. Сплав Inconel 718 и уплотнения FFKM обеспечивают максимальный срок службы.`
            : `Elevated temperatures (exceeding limit ${EngineeringLimits.PRESSURE.CRITICAL_CORROSION_TEMP_C}C) combined with acid/H2S environments lead to hydrogen embrittlement and crevice corrosion in standard chrome steels. Inconel 718 and FFKM seals ensure maximum lifetime.`,
          confidence: 'High',
          linkedEntities: ['steel_grade_inconel_718', 'steel_grade_super_13cr', 'elastomer_kalrez_ffkm']
        });
      }
    }

    return recommendations;
  }
}

export default EngineeringRecommendationEngine;
