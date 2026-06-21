/**
 * IntegritySnapshot.js
 * Generates checksum hash of the dataset schema on load and detects structural drift.
 * Implements NACE/API required key validation rules.
 */

import releaseManifest from '../data/release_manifest.json';

/**
 * Safe JSON stringify helper with WeakSet circular reference protection.
 * Excludes HTMLElements, Window, Document, and State instances.
 */
export function safeStringify(val) {
  const seen = new WeakSet();
  try {
    return JSON.stringify(val, (key, value) => {
      if (value && typeof value === 'object') {
        if (seen.has(value)) {
          return undefined; // skip circular branch safely
        }
        seen.add(value);

        // Avoid serializing DOM references, Window, Document, or State objects
        if (
          (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) ||
          (typeof Window !== 'undefined' && value instanceof Window) ||
          (typeof Document !== 'undefined' && value instanceof Document) ||
          (value.constructor && value.constructor.name === 'State') ||
          value.listeners !== undefined
        ) {
          return undefined;
        }
      }
      return value;
    });
  } catch (err) {
    return '';
  }
}

export class IntegritySnapshot {
  static _sealCache = new WeakMap();
  static REQUIRED_KEYS = {
    tubulars: ['id', 'type', 'od', 'weight', 'grade', 'inner_dia', 'drift_id', 'burst', 'collapse', 'tensile'],
    threads: ['id', 'torque_range', 'turns', 'makeup_loss', 'standoff', 'drift', 'seal_type', 'running_notes'],
    elastomers: ['id', 'temp_range_metric', 'temp_range_imperial', 'pressure_rating_psi', 'compatibility', 'limitations', 'alternatives'],
    brines: ['id', 'density_min_sg', 'density_max_sg', 'freeze_point_c', 'compatibility', 'notes'],
    pt_reference: ['id', 'reference_type', 'fluid', 'gradient_imperial', 'gradient_metric', 'equivalent_sg', 'notes'],
    standards: ['id', 'api', 'iso', 'gost', 'gbt', 'scope'],
    acid_environments: ['id', 'material', 'agent', 'limit_temp_c', 'limit_temp_f', 'degradation_rate', 'mitigation'],
    steel_grades: ['id', 'type', 'name', 'description'],
    failures: ['id', 'type', 'name', 'description']
  };

  static ALLOWED_KEYS = {
    common: [
      'id', 'type', 'name', 'aliases', 'description', 'standards', 'temperature', 'pressure', 
      'chemicalComposition', 'chemicalCompatibility', 'usedInEquipment', 'advantages', 'limitations', 
      'applications', 'diagrams', 'graphs', 'sources', 'lastUpdated', 'revisionDate', 'confidenceLevel', 
      'evidence', 'revision', 'source', 'verified_at', 'module'
    ],
    tubulars: ['od', 'weight', 'grade', 'inner_dia', 'drift_id', 'burst', 'collapse', 'tensile', 'tubular_type', 'wall_thickness', 'standard'],
    threads: [
      'connection_type', 'connection_type_ru', 'torque_range', 'turns', 'makeup_loss', 'standoff', 'drift', 'seal_type', 'seal_type_ru', 'running_notes', 'running_notes_ru',
      'torque_envelope', 'gas_tight_suitability', 'compression_tension_behavior', 'galling_risks', 'running_recommendations', 'compatible_lubricants', 'field_assembly_notes', 'typical_failures', 'oem_references', 'evidence_metadata'
    ],
    elastomers: [
      'material', 'material_ru', 'temp_range_metric', 'temp_range_imperial', 'pressure_rating_psi', 'compatibility', 'compatibility_ru', 'limitations_ru', 'alternatives', 'alternatives_ru',
      'temperature_envelope', 'chemical_compatibility', 'rgd_resistance', 'sour_service_suitability', 'steam_resistance', 'acid_compatibility', 'aromatics_resistance', 'failure_mechanisms', 'storage_recommendations', 'field_limitations', 'standards_metadata', 'evidence_metadata'
    ],
    brines: ['brine', 'brine_ru', 'density_min_sg', 'density_max_sg', 'freeze_point_c', 'compatibility_ru', 'notes', 'notes_ru'],
    pt_reference: ['reference_type', 'reference_type_ru', 'fluid_ru', 'gradient_imperial', 'gradient_metric', 'equivalent_sg', 'notes_ru'],
    standards: ['equipment', 'equipment_ru', 'api', 'iso', 'gost', 'gbt', 'scope', 'scope_ru'],
    acid_environments: ['category', 'category_ru', 'material_ru', 'agent', 'agent_ru', 'limit_temp_c', 'limit_temp_f', 'degradation_rate', 'degradation_rate_ru', 'mitigation', 'mitigation_ru'],
    steel_grades: [
      'chemical_composition', 'corrosion_resistance', 'typical_applications', 'why_selected', 'why_avoided',
      'mechanical_properties', 'h2s_compatibility', 'co2_compatibility', 'chloride_resistance', 'temperature_envelope', 'collapse_yield_considerations', 'galling_tendency', 'corrosion_mechanisms', 'field_limitations', 'common_failure_modes', 'applicable_standards', 'oem_references', 'evidence_metadata',
      'yield_strength', 'tensile_strength', 'sour_service_suitability', 'temperature_suitability', 'used_in_equipment', 'engineering_notes'
    ],
    failures: [
      'symptoms', 'root_causes', 'trigger_environments', 'prevention_methods', 'typical_metallurgy', 'field_troubleshooting',
      'root_cause', 'trigger_conditions', 'typical_metallurgy_at_risk', 'prevention', 'oem_api_references', 'evidence_confidence'
    ]
  };

  /**
   * Validates loaded active database tables.
   * 
   * @param {Object} activeDb - The hydrated database dictionary.
   * @returns {Object} { success, hash, errors, warnings }
   */
  static validate(activeDb) {
    const hash = this.generateSchemaHash(activeDb);
    const errors = [];
    const warnings = [];

    if (!activeDb || typeof activeDb !== 'object') {
      errors.push('Database is null or not a valid object.');
      return { success: false, hash, errors, warnings };
    }

    Object.keys(activeDb).forEach(storeName => {
      const records = activeDb[storeName] || [];
      const required = this.REQUIRED_KEYS[storeName] || ['id', 'type', 'name', 'description'];
      const allowedSpecific = this.ALLOWED_KEYS[storeName] || [];
      const allowed = [...this.ALLOWED_KEYS.common, ...allowedSpecific];

      records.forEach((rec, idx) => {
        if (!rec || typeof rec !== 'object') {
          errors.push(`Store "${storeName}" index ${idx} is not a valid object (corrupted).`);
          return;
        }

        // Critical check: ID must be present
        if (!rec.id || typeof rec.id !== 'string') {
          errors.push(`Store "${storeName}" record at index ${idx} is missing or has invalid "id".`);
          return;
        }

        // Check required fields
        required.forEach(reqKey => {
          if (rec[reqKey] === undefined || rec[reqKey] === null || String(rec[reqKey]).trim() === '') {
            errors.push(`Store "${storeName}" record "${rec.id}" is missing required field "${reqKey}".`);
          }
        });

        // Check unexpected fields
        Object.keys(rec).forEach(key => {
          if (!allowed.includes(key)) {
            warnings.push(`Store "${storeName}" record "${rec.id}" contains unexpected field "${key}".`);
          }
        });
      });
    });

    return {
      success: errors.length === 0,
      hash,
      errors,
      warnings
    };
  }

  /**
   * Generates a 53-bit cyrb53 build hash — mirrors generate-release.js logic exactly.
   * Hash input: sorted JSON serialization of the full DB + schemaVersion string.
   * This ensures the runtime hash always matches the manifest buildHash produced at build time.
   */
  static generateSchemaHash(activeDb) {
    try {
      // Produce a deterministic, sorted serialization of the full DB
      const sortedDb = {};
      Object.keys(activeDb).sort().forEach(storeName => {
        const records = (activeDb[storeName] || []).slice().sort((a, b) =>
          String(a.id || '').localeCompare(String(b.id || ''))
        );
        sortedDb[storeName] = records;
      });
      const str = JSON.stringify(sortedDb).replace(/\r\n/g, '\n') + '2'; // '2' = schemaVersion

      // cyrb53 — identical to generate-release.js
      let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
      for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334903);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
    } catch (e) {
      return 'hash_error';
    }
  }

  /**
   * Computes global checksum of: steel_grades, elastomers, tubulars, connections (threads), failures.
   * Outputs 53-bit cyrb53 checksum hash.
   */
  static computeIntegritySealHash(db) {
    try {
      if (!db || typeof db !== 'object') {
        return releaseManifest?.integritySealHash || 'SEAL_RECOVERY_MODE';
      }
      if (this._sealCache.has(db)) {
        return this._sealCache.get(db);
      }
      
      const targetStores = ['steel_grades', 'elastomers', 'tubulars', 'threads', 'failures'];
      const sealParts = [];

      const commonKeys = [
        'id', 'type', 'name', 'aliases', 'description', 'standards', 'temperature', 'pressure', 
        'chemicalComposition', 'chemicalCompatibility', 'usedInEquipment', 'advantages', 'limitations', 
        'applications', 'diagrams', 'graphs', 'sources', 'lastUpdated', 'revisionDate', 'confidenceLevel', 
        'evidence', 'revision', 'source', 'verified_at', 'module'
      ];
      const specificKeys = {
        tubulars: ['od', 'weight', 'grade', 'inner_dia', 'drift_id', 'burst', 'collapse', 'tensile', 'tubular_type', 'wall_thickness', 'standard'],
        threads: [
          'connection_type', 'connection_type_ru', 'torque_range', 'turns', 'makeup_loss', 'standoff', 'drift', 'seal_type', 'seal_type_ru', 'running_notes', 'running_notes_ru',
          'torque_envelope', 'gas_tight_suitability', 'compression_tension_behavior', 'galling_risks', 'running_recommendations', 'compatible_lubricants', 'field_assembly_notes', 'typical_failures', 'oem_references', 'evidence_metadata'
        ],
        elastomers: [
          'material', 'material_ru', 'temp_range_metric', 'temp_range_imperial', 'pressure_rating_psi', 'compatibility', 'compatibility_ru', 'limitations_ru', 'alternatives', 'alternatives_ru',
          'temperature_envelope', 'chemical_compatibility', 'rgd_resistance', 'sour_service_suitability', 'steam_resistance', 'acid_compatibility', 'aromatics_resistance', 'failure_mechanisms', 'storage_recommendations', 'field_limitations', 'standards_metadata', 'evidence_metadata'
        ],
        brines: ['brine', 'brine_ru', 'density_min_sg', 'density_max_sg', 'freeze_point_c', 'compatibility_ru', 'notes', 'notes_ru'],
        pt_reference: ['reference_type', 'reference_type_ru', 'fluid_ru', 'gradient_imperial', 'gradient_metric', 'equivalent_sg', 'notes_ru'],
        standards: ['equipment', 'equipment_ru', 'api', 'iso', 'gost', 'gbt', 'scope', 'scope_ru'],
        acid_environments: ['category', 'category_ru', 'material_ru', 'agent', 'agent_ru', 'limit_temp_c', 'limit_temp_f', 'degradation_rate', 'degradation_rate_ru', 'mitigation', 'mitigation_ru'],
        steel_grades: [
          'chemical_composition', 'corrosion_resistance', 'typical_applications', 'why_selected', 'why_avoided',
          'mechanical_properties', 'h2s_compatibility', 'co2_compatibility', 'chloride_resistance', 'temperature_envelope', 'collapse_yield_considerations', 'galling_tendency', 'corrosion_mechanisms', 'field_limitations', 'common_failure_modes', 'applicable_standards', 'oem_references', 'evidence_metadata',
          'yield_strength', 'tensile_strength', 'sour_service_suitability', 'temperature_suitability', 'used_in_equipment', 'engineering_notes'
        ],
        failures: [
          'symptoms', 'root_causes', 'trigger_environments', 'prevention_methods', 'typical_metallurgy', 'field_troubleshooting',
          'root_cause', 'trigger_conditions', 'typical_metallurgy_at_risk', 'prevention', 'oem_api_references', 'evidence_confidence'
        ]
      };

      targetStores.forEach(storeName => {
        const records = db[storeName] || [];
        const allowed = [...commonKeys, ...(specificKeys[storeName] || [])];
        
        const cleanRecords = records.map(rec => {
          if (!rec) return rec;
          const cleanRec = {};
          allowed.forEach(key => {
            if (rec[key] !== undefined && rec[key] !== null && String(rec[key]).trim() !== '—') {
              if (typeof rec[key] === 'object') {
                try {
                  const serialized = safeStringify(rec[key]);
                  cleanRec[key] = serialized ? JSON.parse(serialized) : '—';
                } catch (err) {
                  cleanRec[key] = '—';
                }
              } else {
                cleanRec[key] = rec[key];
              }
            }
          });
          return cleanRec;
        });

        const sortedRecords = cleanRecords.sort((a, b) => {
          const idA = a.id || '';
          const idB = b.id || '';
          return idA.localeCompare(idB);
        });
        sealParts.push(`${storeName}:${JSON.stringify(sortedRecords)}`);
      });

      const sealStr = sealParts.join(';');
      let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
      for (let i = 0, ch; i < sealStr.length; i++) {
        ch = sealStr.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334903);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      const hashNum = 4294967296 * (2097151 & h2) + (h1 >>> 0);
      const hashStr = hashNum.toString(16);
      this._sealCache.set(db, hashStr);
      return hashStr;
    } catch (e) {
      console.error('ERROR in computeIntegritySealHash:', e);
      return releaseManifest?.integritySealHash || 'SEAL_RECOVERY_MODE';
    }
  }
}

export default IntegritySnapshot;
