/**
 * EngineeringLimits.js
 * Centralized database of physical and engineering limits for HADALBORE LAB.
 * Prevents hard-coded values in components.
 */
export const EngineeringLimits = {
  PHYSICAL: {
    MIN_TEMP_C: -273.15,
    MIN_TEMP_F: -459.67,
    MIN_DENSITY: 0.001,
    MIN_DEPTH: 0,
    MIN_PRESSURE: 0,
    MIN_HOOK_LOAD: 0
  },
  MUD: {
    MAX_DENSITY_PPG: 25.0,
    MAX_DENSITY_KGM3: 3000.0,
    MAX_DENSITY_SG: 3.0
  },
  PRESSURE: {
    HIGH_THRESHOLD_PSI: 10000,
    HIGH_THRESHOLD_BAR: 690,
    CRITICAL_CORROSION_TEMP_C: 120
  },
  METALLURGY: {
    P110: { maxTensilePsi: 110000, sourCompatible: false },
    L80: { maxTensilePsi: 80000, sourCompatible: true },
    Q125: { maxTensilePsi: 125000, sourCompatible: false },
    '13cr': { maxTensilePsi: 95000, sourCompatible: true },
    'super_13cr': { maxTensilePsi: 105000, sourCompatible: true },
    'inconel_718': { maxTensilePsi: 150000, sourCompatible: true }
  },
  ELASTOMERS: {
    nbr: { maxTempC: 100, chemicalRes: 'Moderate' },
    hnbr: { maxTempC: 150, chemicalRes: 'Good' },
    viton_fkm: { maxTempC: 180, chemicalRes: 'Excellent' },
    kalrez_ffkm: { maxTempC: 300, chemicalRes: 'Complete' },
    teflon_ptfe: { maxTempC: 260, chemicalRes: 'Complete' }
  }
};

export default EngineeringLimits;
