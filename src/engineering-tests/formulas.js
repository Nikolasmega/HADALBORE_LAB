/**
 * Well completions formula implementations for HADALBORE_LAB
 */
export const formulas = {
  // Hydrostatic pressure in kPa: P = 0.00981 * rho * TVD
  calculateHydrostatic(rho, tvd) {
    return 0.00981 * rho * tvd;
  },

  // Buoyancy factor: BF = 1 - (rho_fluid / 7850)
  calculateBuoyancy(rho) {
    return 1.0 - (rho / 7850.0);
  },

  // Thermal expansion elongation: dV = V0 * beta * dT
  calculateThermalExpansion(v0, beta, dt) {
    return v0 * beta * dt;
  },

  // Internal volume: volume = (pi * ID^2 / 4) * Length
  calculateVolume(id, length) {
    return (Math.PI * Math.pow(id, 2) / 4) * length;
  }
};
