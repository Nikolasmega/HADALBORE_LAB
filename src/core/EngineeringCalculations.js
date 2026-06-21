/**
 * EngineeringCalculations.js
 * Centralized, pure SI calculations engine for HADALBORE_LAB.
 * Performs all physical calculations in SI base units.
 */

// Centralized physical constants
export const PhysicalConstants = {
  STEEL_DENSITY_KG_M3: 7850.0,
  GRAVITY_M_S2: 9.80665,
  BARITE_DENSITY_SG: 4.2
};

// Centralized conversion factors to/from SI
export const UnitConversions = {
  // Length
  FEET_TO_METERS: 0.3048,
  METERS_TO_FEET: 1 / 0.3048,
  INCHES_TO_METERS: 0.0254,
  METERS_TO_INCHES: 1 / 0.0254,

  // Volume
  BBL_TO_M3: 0.158987295,
  M3_TO_BBL: 1 / 0.158987295,
  LITERS_TO_M3: 0.001,
  M3_TO_LITERS: 1000.0,

  // Density
  PPG_TO_KG_M3: 119.826427,
  KG_M3_TO_PPG: 1 / 119.826427,
  SG_TO_KG_M3: 1000.0,
  KG_M3_TO_SG: 0.001,
  PPG_TO_SG: 1 / 8.3454,
  SG_TO_PPG: 8.3454,

  // Pressure
  PSI_TO_PA: 6894.75729,
  PA_TO_PSI: 1 / 6894.75729,
  BAR_TO_PA: 100000.0,
  PA_TO_BAR: 0.00001,

  // Mass
  LBS_TO_KG: 0.45359237,
  KG_TO_LBS: 1 / 0.45359237
};

export const EngineeringCalculations = {
  /**
   * Calculates hydrostatic pressure in Pascals (Pa).
   * P = rho * g * TVD
   * 
   * @param {number} densityKgm3 - Fluid density in kg/m3
   * @param {number} depthM - True Vertical Depth in meters
   * @returns {number} Pressure in Pa
   */
  calculateHydrostatic(densityKgm3, depthM) {
    return densityKgm3 * PhysicalConstants.GRAVITY_M_S2 * depthM;
  },

  /**
   * Calculates internal capacity volume of a cylinder in m3.
   * V = (pi * ID^2 / 4) * Length
   * 
   * @param {number} innerDiaM - Inner diameter in meters
   * @param {number} lengthM - Length in meters
   * @returns {number} Volume in m3
   */
  calculateCapacity(innerDiaM, lengthM) {
    return (Math.PI * Math.pow(innerDiaM, 2) / 4) * lengthM;
  },

  /**
   * Calculates annular volume between outer and inner cylinders in m3.
   * V = (pi * (outerID^2 - innerOD^2) / 4) * Length
   * 
   * @param {number} outerIdM - Outer ID in meters
   * @param {number} innerOdM - Inner OD in meters
   * @param {number} lengthM - Length in meters
   * @returns {number} Volume in m3
   */
  calculateAnnular(outerIdM, innerOdM, lengthM) {
    if (outerIdM <= innerOdM) return 0;
    return (Math.PI * (Math.pow(outerIdM, 2) - Math.pow(innerOdM, 2)) / 4) * lengthM;
  },

  /**
   * Calculates thermal expansion elongation in meters.
   * dL = L * alpha * dT
   * 
   * @param {number} lengthM - Length in meters
   * @param {number} tempDiffC - Temperature difference in °C
   * @param {number} expansionCoeff - Linear expansion coefficient in 1/°C
   * @returns {number} Elongation in meters
   */
  calculateThermalExpansion(lengthM, tempDiffC, expansionCoeff = 12e-6) {
    return lengthM * expansionCoeff * tempDiffC;
  },

  /**
   * Calculates hook load metrics (buoyed weight, pickup, slackoff).
   * 
   * @param {number} airWeightKg - Weight of string in air in kg
   * @param {number} mudDensityKgm3 - Mud density in kg/m3
   * @param {number} steelDensityKgm3 - Steel density in kg/m3 (default 7850)
   * @param {number} dragFraction - Drag coefficient (0.0 to 1.0)
   * @returns {{ buoyancyFactor: number, wetWeightKg: number, pickupWeightKg: number, slackoffWeightKg: number }}
   */
  calculateHookLoad(airWeightKg, mudDensityKgm3, steelDensityKgm3 = PhysicalConstants.STEEL_DENSITY_KG_M3, dragFraction = 0.15) {
    let bf = 1.0 - (mudDensityKgm3 / steelDensityKgm3);
    bf = Math.max(0, Math.min(1, bf));
    const wetWeightKg = airWeightKg * bf;
    const pickupWeightKg = wetWeightKg * (1.0 + dragFraction);
    const slackoffWeightKg = wetWeightKg * (1.0 - dragFraction);
    return {
      buoyancyFactor: bf,
      wetWeightKg,
      pickupWeightKg,
      slackoffWeightKg
    };
  },

  /**
   * Calculates barite required (kg) and mud volume increase (m3) to increase density.
   * 
   * @param {number} initialVolM3 - Initial mud volume in m3
   * @param {number} densInitKgm3 - Initial mud density in kg/m3
   * @param {number} densTargetKgm3 - Target mud density in kg/m3
   * @param {number} bariteDensKgm3 - Weighting material density in kg/m3 (default 4200)
   * @returns {{ massNeededKg: number, volAddedM3: number }}
   */
  calculateMudWeighting(initialVolM3, densInitKgm3, densTargetKgm3, bariteDensKgm3 = PhysicalConstants.BARITE_DENSITY_SG * 1000) {
    if (densTargetKgm3 <= densInitKgm3 || bariteDensKgm3 <= densTargetKgm3) {
      return { massNeededKg: 0, volAddedM3: 0 };
    }
    const massNeededKg = (initialVolM3 * (densTargetKgm3 - densInitKgm3)) / (1.0 - (densTargetKgm3 / bariteDensKgm3));
    const volAddedM3 = massNeededKg / bariteDensKgm3;
    return {
      massNeededKg,
      volAddedM3
    };
  }
};
