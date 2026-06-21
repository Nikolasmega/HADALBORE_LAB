import { EngineeringLimits } from './EngineeringLimits.js';
import { store } from './State.js';

/**
 * EngineeringValidator.js
 * Strictly validates physical, engineering, and context constraints for calculations and records.
 */
export class EngineeringValidator {
  /**
   * Validate dynamic inputs for calculators.
   * 
   * @param {string} calcType - Calculator type
   * @param {Object} inputs - Inputs key-value pairs
   * @param {string} lang - Active language ('ru' | 'en')
   * @returns {{ valid: boolean, error: string|null, warnings: Array<string> }}
   */
  static validateInputs(calcType, inputs, lang) {
    const isRu = lang === 'ru';
    const result = {
      valid: true,
      error: null,
      warnings: []
    };

    if (!inputs) return result;

    // --- Helper to reject invalid fields ---
    const reject = (msgRu, msgEn) => {
      result.valid = false;
      result.error = isRu ? msgRu : msgEn;
    };

    // --- Helper to push warnings ---
    const warn = (msgRu, msgEn) => {
      result.warnings.push(isRu ? msgRu : msgEn);
    };

    // 1. Hydrostatic pressure validator
    if (calcType === 'hydrostatic') {
      const depth = parseFloat(inputs.depth);
      const density = parseFloat(inputs.density);

      if (isNaN(depth) || isNaN(density)) {
        reject('Значения глубины и плотности должны быть числами.', 'Depth and density values must be numbers.');
        return result;
      }

      // Physical validation
      if (depth < EngineeringLimits.PHYSICAL.MIN_DEPTH) {
        reject('Глубина не может быть отрицательной.', 'Depth cannot be negative.');
        return result;
      }
      if (density <= 0) {
        reject('Плотность жидкости должна быть больше нуля.', 'Fluid density must be greater than zero.');
        return result;
      }

      // Sanity checks
      const unitSystem = store.getState().unitSystem;
      let densityPpg = density;
      if (unitSystem === 'metric') {
        densityPpg = density * 0.0083454; // kg/m3 to ppg
      } else if (unitSystem === 'hybrid') {
        densityPpg = density * 8.3454; // sg to ppg
      }

      if (densityPpg > EngineeringLimits.MUD.MAX_DENSITY_PPG) {
        warn('Значение плотности раствора выходит за рамки ожидаемого диапазона (макс 25 ppg / 3.0 sg).', 'Input density is outside expected engineering range (max 25 ppg / 3.0 sg).');
      }
    }

    // 2. Hook load validator
    if (calcType === 'hook_load') {
      const airWeight = parseFloat(inputs.airWeight);
      const mudDensity = parseFloat(inputs.mudDensity);
      const drag = parseFloat(inputs.drag);

      if (isNaN(airWeight) || isNaN(mudDensity) || isNaN(drag)) {
        reject('Вес, плотность и силы сопротивления должны быть числами.', 'Air weight, mud density, and drag must be numbers.');
        return result;
      }

      // Physical validation
      if (airWeight < EngineeringLimits.PHYSICAL.MIN_HOOK_LOAD) {
        reject('Вес в воздухе не может быть отрицательным.', 'Weight in air cannot be negative.');
        return result;
      }
      if (mudDensity < 0) {
        reject('Плотность раствора не может быть отрицательной.', 'Mud density cannot be negative.');
        return result;
      }
      if (drag < 0 || drag > 100) {
        reject('Сила сопротивления (drag) должна быть в диапазоне от 0% до 100%.', 'Drag percentage must be between 0% and 100%.');
        return result;
      }

      // Sanity check
      const unitSystem = store.getState().unitSystem;
      let densityPpg = mudDensity;
      if (unitSystem === 'metric') {
        densityPpg = mudDensity * 0.0083454;
      } else if (unitSystem === 'hybrid') {
        densityPpg = mudDensity * 8.3454;
      }

      if (densityPpg > EngineeringLimits.MUD.MAX_DENSITY_PPG) {
        warn('Плотность раствора превышает ожидаемый предел.', 'Input mud density is outside expected engineering range.');
      }
    }

    // 3. Corrosion / Chemical compatibility validator
    if (calcType === 'corrosion') {
      const temp = parseFloat(inputs.temperature);
      const press = parseFloat(inputs.pressure);

      if (isNaN(temp) || isNaN(press)) {
        reject('Значения температуры и давления должны быть числами.', 'Temperature and pressure values must be numbers.');
        return result;
      }

      // Physical validation
      const unitSystem = store.getState().unitSystem;
      const minTemp = unitSystem === 'imperial' ? EngineeringLimits.PHYSICAL.MIN_TEMP_F : EngineeringLimits.PHYSICAL.MIN_TEMP_C;
      
      if (temp < minTemp) {
        reject('Температура ниже абсолютного нуля.', 'Temperature is below absolute zero.');
        return result;
      }
      if (press < EngineeringLimits.PHYSICAL.MIN_PRESSURE) {
        reject('Давление не может быть отрицательным.', 'Pressure cannot be negative.');
        return result;
      }

      // Sanity checks
      const maxTemp = unitSystem === 'imperial' ? 482 : 250; // 250C / 482F
      const maxPress = unitSystem === 'imperial' ? 15000 : 1034; // 15,000 psi / 1034 bar

      if (temp > maxTemp || press > maxPress) {
        warn('Значения температуры или давления выходят за рамки стандартных условий скважины.', 'Input parameters are outside expected engineering range.');
      }
    }

    // 4. Capacity and Annular Volume validator
    if (calcType === 'capacity' || calcType === 'annular') {
      const len = parseFloat(inputs.length);
      if (isNaN(len)) {
        reject('Длина должна быть числом.', 'Length must be a number.');
        return result;
      }

      if (len < 0) {
        reject('Длина не может быть отрицательной.', 'Length cannot be negative.');
        return result;
      }
    }

    return result;
  }

  /**
   * Validate DB record context compatibility.
   * 
   * @param {Object} rec - Database record
   * @param {string} lang - Active language ('ru' | 'en')
   * @returns {Array<string>} Array of warnings
   */
  static validateRecordContext(rec, lang) {
    const warnings = [];
    if (!rec) return warnings;

    const lowerId = (rec.id || '').toLowerCase();
    const isRu = lang === 'ru';

    // Context check: Q125 or P110 steel in sour environments
    if (rec.grade === 'Q125' || rec.grade === 'P110' || lowerId.includes('q125') || lowerId.includes('p110')) {
      const sourService = rec.sour_service_suitability || rec.sour_service || '';
      const isSourCompatible = sourService.toLowerCase().includes('yes') || sourService.toLowerCase().includes('да');
      
      if (!isSourCompatible) {
        warnings.push(isRu 
          ? 'Требуется проверка совместимости: высокопрочные стали склонны к водородному охрупчиванию в средах с H₂S.' 
          : 'Compatibility review required: high-strength steel grade is subject to hydrogen embrittlement in sour environments.'
        );
      }
    }

    return warnings;
  }
}

export default EngineeringValidator;
