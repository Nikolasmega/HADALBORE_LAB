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
  },

  // Triaxial stress: Von Mises equivalent stress
  calculateVonMisesStress(axialForceN, internalPressurePa, externalPressurePa, outerDiaM, innerDiaM) {
    const ro = outerDiaM / 2;
    const ri = innerDiaM / 2;
    const area = Math.PI * (Math.pow(ro, 2) - Math.pow(ri, 2));
    if (area <= 0) return 0;
    const sigmaAxial = axialForceN / area;
    const sigmaRadial = -internalPressurePa;
    const sigmaTangential = (internalPressurePa * (Math.pow(ro, 2) + Math.pow(ri, 2)) - 2 * externalPressurePa * Math.pow(ro, 2)) / (Math.pow(ro, 2) - Math.pow(ri, 2));
    return Math.sqrt(0.5 * (
      Math.pow(sigmaAxial - sigmaRadial, 2) +
      Math.pow(sigmaRadial - sigmaTangential, 2) +
      Math.pow(sigmaTangential - sigmaAxial, 2)
    ));
  },

  // Herschel-Bulkley rheology parameters
  calculateHerschelBulkley(theta600, theta300, theta200, theta100, theta6, theta3) {
    let tau0 = 0.511 * (2 * theta3 - theta6);
    if (tau0 < 0) tau0 = 0;
    let n = 1.0;
    if (theta300 > theta3 && theta100 > theta3) {
      const logRatio = Math.log((theta300 - theta3) / (theta100 - theta3));
      n = logRatio / Math.log(300 / 100);
    }
    if (n <= 0 || isNaN(n)) n = 0.5;
    const K = (0.511 * theta300 - tau0) / Math.pow(511, n);
    return { tau0, n, K };
  },

  // Critical mud pressure to prevent borehole breakout
  calculateBreakoutPressure(sigmaHMax, sigmaHMin, pp, ucs, frictionAngle) {
    const phiRad = frictionAngle * Math.PI / 180;
    const q = (1 + Math.sin(phiRad)) / (1 - Math.sin(phiRad));
    return (3 * sigmaHMax - sigmaHMin - ucs + (q - 1) * pp) / (1 + q);
  }
};
