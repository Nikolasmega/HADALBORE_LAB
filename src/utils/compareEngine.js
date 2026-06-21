import { MODULE_PROPERTIES, parseNumeric, parseRating, parseConfidence, parseComplexity } from './compareRules.js';
import { alignRecordToStandard } from './standardAligner.js';

/**
 * Aligns and compares multiple records of the same module type.
 * Implements strict data truth separation, returning metadata detailing
 * the source ("raw" | "derived"), confidence level, and rule ID.
 * 
 * PURITY ASSERTION: This function is pure, deterministic, and side-effect free.
 * It does not mutate the input records or modify global states.
 * 
 * @param {Array<Object>} records - The records to compare (1 to 4 records)
 * @param {string} moduleType - The module type (e.g. 'tubulars')
 * @returns {Array<Object>} Aligned rows ready for rendering
 */
export function alignAndCompare(records, moduleType) {
  const properties = MODULE_PROPERTIES[moduleType] || [];
  if (!records || records.length === 0) return [];

  // Filter out any potential null/undefined records defensively
  const validRecords = records.filter(Boolean);
  if (validRecords.length === 0) return [];

  return properties.map(prop => {
    const rowValues = validRecords.map(rec => {
      // Fetch raw value or perform dynamic engineering derivation
      let rawVal = rec[prop.key];
      let source = "raw";
      let confidence = "high";
      let ruleId = null;
      
      // Standard Profile Alignments
      if (['api_class', 'iso_ref', 'material_family', 'service_env', 'env_limits'].includes(prop.key) && rawVal === undefined) {
        const profile = alignRecordToStandard(rec);
        if (profile) {
          if (prop.key === 'api_class') rawVal = profile.apiReference;
          else if (prop.key === 'iso_ref') rawVal = profile.isoReference;
          else if (prop.key === 'material_family') rawVal = profile.materialClass;
          else if (prop.key === 'service_env') rawVal = profile.serviceEnvironment;
          else if (prop.key === 'env_limits') rawVal = profile.envelopeLimits;
          
          source = "derived";
          confidence = "medium";
          ruleId = "STANDARD_ALIGNMENT_V1";
        }
      }

      // Special case: confidenceLevel might be inside evidence block
      if (prop.key === 'confidenceLevel' && rawVal === undefined) {
        rawVal = rec.evidence?.confidenceLevel;
        source = "raw";
        confidence = "high";
      }
      
      // Dynamic Derivations for Tubulars
      if (moduleType === 'tubulars') {
        if (prop.key === 'yield_strength' && rawVal === undefined) {
          const grade = rec.grade;
          if (grade) {
            const match = grade.match(/\d+/);
            if (match) {
              const gradeNum = parseInt(match[0], 10);
              rawVal = gradeNum < 1000 ? gradeNum * 1000 : gradeNum;
              source = "derived";
              confidence = "medium";
              ruleId = "API_GRADE_MAPPING_V1";
            }
          }
        } else if (prop.key === 'temperature_suitability' && rawVal === undefined) {
          if (rec.temperature) {
            const minT = rec.temperature.min !== null ? `${rec.temperature.min}°${rec.temperature.unit || 'C'}` : '—';
            const maxT = rec.temperature.max !== null ? `${rec.temperature.max}°${rec.temperature.unit || 'C'}` : '—';
            rawVal = `${minT} to ${maxT}`;
            source = "derived";
            confidence = "medium";
            ruleId = "TUBULAR_TEMP_RANGE_DERIVATION_V1";
          }
        } else if (prop.key === 'sour_service_suitability' && rawVal === undefined) {
          const grade = rec.grade;
          if (grade) {
            const g = String(grade).toUpperCase();
            if (g.includes('L80') || g.includes('C90') || g.includes('T95') || g.includes('C110')) {
              rawVal = 'High (NACE MR0175)';
            } else {
              rawVal = 'Low / Not Recommended';
            }
            source = "derived";
            confidence = "medium";
            ruleId = "API_GRADE_SOUR_SERVICE_MAP_V1";
          }
        } else if (prop.key === 'connection_type' && rawVal === undefined) {
          rawVal = 'API Thread (EUE / BTC / LTC)';
          source = "derived";
          confidence = "low";
          ruleId = "API_CONNECTION_DEFAULT_V1";
        }
      }

      // Dynamic Derivations for Elastomers
      if (moduleType === 'elastomers') {
        if (prop.key === 'max_temp' && rawVal === undefined) {
          rawVal = rec.temperature?.max;
          source = "derived";
          confidence = "high";
          ruleId = "ELASTOMER_NESTED_TEMP_MAX_V1";
        } else if (prop.key === 'pressure_limits' && rawVal === undefined) {
          rawVal = rec.pressure?.max;
          source = "derived";
          confidence = "high";
          ruleId = "ELASTOMER_NESTED_PRESS_MAX_V1";
        } else if (prop.key === 'h2s_compatibility' && rawVal === undefined) {
          rawVal = rec.sour_service_suitability || rec.h2s_compatibility || rec.h2s_resistance;
          if (rawVal) {
            source = "derived";
            confidence = "medium";
            ruleId = "ELASTOMER_H2S_COMPATIBILITY_DERIVATION_V1";
          }
        } else if (prop.key === 'co2_compatibility' && rawVal === undefined) {
          rawVal = rec.co2_compatibility || rec.chemical_compatibility || rec.co2_resistance;
          if (rawVal) {
            source = "derived";
            confidence = "medium";
            ruleId = "ELASTOMER_CO2_COMPATIBILITY_DERIVATION_V1";
          }
        }
      }

      // Dynamic Derivations for Steel Grades
      if (moduleType === 'steel-grades') {
        if (prop.key === 'h2s_resistance' && rawVal === undefined) {
          rawVal = rec.sour_service_suitability || rec.h2s_compatibility || rec.h2s_resistance;
          if (rawVal) {
            source = "derived";
            confidence = "medium";
            ruleId = "STEEL_H2S_RESISTANCE_DERIVATION_V1";
          }
        } else if (prop.key === 'co2_resistance' && rawVal === undefined) {
          rawVal = rec.co2_compatibility || rec.co2_resistance || rec.corrosion_resistance;
          if (rawVal) {
            source = "derived";
            confidence = "medium";
            ruleId = "STEEL_CO2_RESISTANCE_DERIVATION_V1";
          }
        }
      }

      let isMissing = rawVal === undefined || rawVal === null || rawVal === '' || (Array.isArray(rawVal) && rawVal.length === 0);
      if (!isMissing && typeof rawVal === 'string') {
        const lowerVal = rawVal.trim().toLowerCase();
        if (lowerVal === 'n/a' || lowerVal === 'unknown' || lowerVal === 'none' || lowerVal === '—' || lowerVal === '-') {
          isMissing = true;
        }
      }

      if (isMissing) {
        confidence = "low";
      }
      
      let parsed = null;
      if (!isMissing) {
        if (prop.type === 'numeric') {
          parsed = parseNumeric(rawVal);
        } else if (prop.type === 'rating') {
          parsed = parseRating(rawVal);
        } else if (prop.type === 'confidence') {
          parsed = parseConfidence(rawVal);
        } else if (prop.type === 'complexity') {
          parsed = parseComplexity(rawVal);
        }
      }

      return {
        rawValue: rawVal,
        parsedValue: parsed,
        isMissing,
        truthMeta: {
          source,
          confidence,
          ruleId
        }
      };
    });

    // 2. Determine status (best / worst / neutral / missing) for comparable properties
    const comparable = prop.type !== 'text' && prop.type !== 'list' && prop.direction !== 'neutral';
    
    if (comparable) {
      const validItems = rowValues.filter(v => !v.isMissing && v.parsedValue !== null);
      
      if (validItems.length > 0) {
        const parsedVals = validItems.map(v => v.parsedValue);
        const uniqueVals = [...new Set(parsedVals)];

        if (uniqueVals.length > 1) {
          let bestVal, worstVal;
          if (prop.direction === 'higher') {
            bestVal = Math.max(...parsedVals);
            worstVal = Math.min(...parsedVals);
          } else { // direction === 'lower' (complexity)
            bestVal = Math.min(...parsedVals);
            worstVal = Math.max(...parsedVals);
          }

          rowValues.forEach(val => {
            if (val.isMissing || val.parsedValue === null) {
              val.status = 'missing';
              val.isBest = false;
            } else if (val.parsedValue === bestVal) {
              val.status = 'best';
              val.isBest = true;
            } else if (val.parsedValue === worstVal) {
              val.status = 'worst';
              val.isBest = false;
            } else {
              val.status = 'neutral';
              val.isBest = false;
            }
          });
        } else {
          // All valid values are equal
          rowValues.forEach(val => {
            if (val.isMissing || val.parsedValue === null) {
              val.status = 'missing';
            } else {
              val.status = 'neutral';
            }
            val.isBest = false;
          });
        }
      } else {
        rowValues.forEach(val => {
          val.status = 'missing';
          val.isBest = false;
        });
      }
    } else {
      rowValues.forEach(val => {
        val.status = val.isMissing ? 'missing' : 'neutral';
        val.isBest = false;
      });
    }

    return {
      key: prop.key,
      label: prop.label,
      type: prop.type,
      values: rowValues
    };
  });
}
