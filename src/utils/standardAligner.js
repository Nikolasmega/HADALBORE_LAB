/**
 * standardAligner.js
 * Normalizes raw engineering records into canonical standards classifications (API, ISO, NACE).
 * Computes profiles dynamically at runtime to prevent data mutation.
 */

/**
 * StandardCanonicalSchema representation:
 * {
 *   apiReference: string,
 *   isoReference: string,
 *   materialClass: string,
 *   serviceEnvironment: string,
 *   envelopeLimits: string
 * }
 */

export function alignRecordToStandard(rec) {
  if (!rec) return null;

  // Determine material class from record keys or properties
  const recId = String(rec.id || '').toLowerCase();
  const recType = String(rec.type || '').toLowerCase();
  const moduleType = String(rec.module || '').toLowerCase();
  
  let materialClassType = '';
  if (moduleType === 'tubulars' || recType === 'tubular') {
    materialClassType = 'tubular';
  } else if (moduleType === 'steel-grades' || recType === 'steel grade' || recId.startsWith('steel_grade')) {
    materialClassType = 'steel';
  } else if (moduleType === 'elastomers' || recType === 'elastomer') {
    materialClassType = 'elastomer';
  } else if (moduleType === 'threads' || recType === 'connection' || recType === 'thread') {
    materialClassType = 'thread';
  }

  const name = String(rec.name || '');
  const aliases = (rec.aliases || []).map(a => String(a).toLowerCase());
  const matchTerm = (term) => name.toLowerCase().includes(term) || aliases.some(a => a.includes(term));

  // 1. STEEL GRADES & TUBULARS
  if (materialClassType === 'steel' || materialClassType === 'tubular') {
    if (matchTerm('p110')) {
      return {
        apiReference: 'API Spec 5CT (High Strength)',
        isoReference: 'ISO 11960 Group 3',
        materialClass: 'High Strength Carbon Steel',
        serviceEnvironment: 'Sweet Service Only (No H₂S)',
        envelopeLimits: 'Yield: 110-140 ksi, Temp: Stable'
      };
    }
    if (matchTerm('l80')) {
      const is13Cr = matchTerm('13cr') || matchTerm('chrome');
      if (is13Cr) {
        return {
          apiReference: 'API Spec 5CT / NACE MR0175',
          isoReference: 'ISO 13680 / ISO 15156 (CRA)',
          materialClass: 'Corrosion Resistant Alloy (13Cr CRA)',
          serviceEnvironment: 'Sour Service Capable (H₂S + CO₂)',
          envelopeLimits: 'Yield: Min 80 ksi, NACE MR0175 Limits Apply'
        };
      }
      return {
        apiReference: 'API Spec 5CT (Group 2, L80)',
        isoReference: 'ISO 11960 Group 2',
        materialClass: 'Controlled Hardness Carbon Steel',
        serviceEnvironment: 'Sour Service Capable (H₂S Suitable)',
        envelopeLimits: 'Yield: 80-95 ksi, Max Hardness 23 HRC'
      };
    }
    if (matchTerm('q125')) {
      return {
        apiReference: 'API Spec 5CT (Group 4, Q125)',
        isoReference: 'ISO 11960 Group 4',
        materialClass: 'Ultra High Strength Carbon Steel',
        serviceEnvironment: 'Sweet Service (Special H₂S limits)',
        envelopeLimits: 'Yield: 125-150 ksi, Critical Design Only'
      };
    }
    if (matchTerm('13cr') || matchTerm('super 13cr')) {
      return {
        apiReference: 'API Spec 5CT / NACE MR0175',
        isoReference: 'ISO 13680 / ISO 15156',
        materialClass: 'Corrosion Resistant Alloy (CRA)',
        serviceEnvironment: 'Sour Service Capable (High CO₂ / Mild H₂S)',
        envelopeLimits: 'Yield: Min 95-110 ksi, Max Temp 180°C'
      };
    }
    if (matchTerm('25cr') || matchTerm('28cr') || matchTerm('duplex') || matchTerm('inconel')) {
      return {
        apiReference: 'NACE MR0175 / ISO 15156 (CRA)',
        isoReference: 'ISO 13680 (High CRA)',
        materialClass: 'Super Corrosion Resistant Alloy (High Al)',
        serviceEnvironment: 'Severe HPHT Sour & High Chloride',
        envelopeLimits: 'Extreme Resistance to Pit & SSC Corrosion'
      };
    }
    return {
      apiReference: 'API Spec 5CT',
      isoReference: 'ISO 11960',
      materialClass: 'Oilfield Steel Grade',
      serviceEnvironment: 'Standard Casing & Tubing Service',
      envelopeLimits: 'Grade Dependent Limits'
    };
  }

  // 2. ELASTOMERS
  if (materialClassType === 'elastomer') {
    if (matchTerm('hnbr')) {
      return {
        apiReference: 'ASTM D1418 HNBR',
        isoReference: 'ISO 1629 HNBR',
        materialClass: 'Hydrogenated Nitrile Elastomer',
        serviceEnvironment: 'High Temperature & H₂S Fluid Service',
        envelopeLimits: 'Temp: -30°C to 150°C, Good H₂S/Amine'
      };
    }
    if (matchTerm('nbr') || matchTerm('nitrile') || matchTerm('нитрил')) {
      return {
        apiReference: 'ASTM D1418 NBR',
        isoReference: 'ISO 1629 NBR',
        materialClass: 'Nitrile Rubber (NBR)',
        serviceEnvironment: 'General Oilfield Fluid Service (Sweet)',
        envelopeLimits: 'Temp: -30°C to 120°C, Low H₂S/Amine'
      };
    }
    if (matchTerm('viton') || matchTerm('fkm') || matchTerm('витон')) {
      return {
        apiReference: 'ASTM D1418 FKM',
        isoReference: 'ISO 1629 FKM',
        materialClass: 'Fluorocarbon Elastomer (FKM)',
        serviceEnvironment: 'Sour Service & High Temperature',
        envelopeLimits: 'Temp: -20°C to 204°C, Exceptional Acid Resist.'
      };
    }
    if (matchTerm('kalrez') || matchTerm('chemraz') || matchTerm('ffkm') || matchTerm('aflas') || matchTerm('fepm')) {
      return {
        apiReference: 'ASTM D1418 FFKM/FEPM',
        isoReference: 'ISO 1629 FFKM/FEPM',
        materialClass: 'Perfluoroelastomer (FFKM/Aflas Class)',
        serviceEnvironment: 'Extreme HPHT Chemical & Steam Service',
        envelopeLimits: 'Temp: -20°C to 260°C+, Universal Seal'
      };
    }
    return {
      apiReference: 'ASTM D1418 / ISO 1629',
      isoReference: 'ISO 1629 Polymer Class',
      materialClass: 'Polymer / Elastomer',
      serviceEnvironment: 'Oilfield Fluid Seal Service',
      envelopeLimits: 'Material Specific Limits'
    };
  }

  // 3. THREADS / CONNECTIONS
  if (materialClassType === 'thread') {
    if (matchTerm('vam top') || matchTerm('vam 21') || matchTerm('blue') || matchTerm('tenaris')) {
      return {
        apiReference: 'API Spec 5B / ISO 13679',
        isoReference: 'ISO 13679 CAL IV (Gas Tight)',
        materialClass: 'Premium Metal-to-Metal Seal Connection',
        serviceEnvironment: 'High Pressure Gas Wells / HPHT / Critical',
        envelopeLimits: '100% Tension/Compression Load Gas Tight'
      };
    }
    if (matchTerm('btc') || matchTerm('ltc') || matchTerm('stc') || matchTerm('eue')) {
      return {
        apiReference: 'API Spec 5B (Standard Thread)',
        isoReference: 'ISO 11960 (API Threads)',
        materialClass: 'Standard API Thread Connection',
        serviceEnvironment: 'Moderate Tension & Low Pressure Service',
        envelopeLimits: 'Grease Dependent Helical Thread Seal'
      };
    }
    return {
      apiReference: 'API Spec 5B / ISO 13679',
      isoReference: 'ISO 13679 Connection Class',
      materialClass: 'Tubular Connection',
      serviceEnvironment: 'Standard Casing/Tubing Service',
      envelopeLimits: 'Standard Torque & Tension Envelopes'
    };
  }

  return null;
}
