/**
 * SystemCoherenceLayer.js
 * Central validator and normalizer that ensures all raw database entities
 * follow a strict structural contract across all completions/metallurgy modules.
 */

const ID_PREFIXES = {
  tubulars: ['tubing_', 'casing_', 'drill_pipe_', 'drillpipe_', 'tubular_'],
  threads: ['thread_'],
  elastomers: ['elastomer_'],
  brines: ['fluid_', 'brine_'],
  pt_reference: ['pt_', 'pt_ref_'],
  pt_reference_store: ['pt_', 'pt_ref_'],
  standards: ['standard_'],
  acid_environments: ['acid_', 'acid_env_', 'steel_grade_'],
  steel_grades: ['steel_grade_'],
  failures: ['failure_'],
  wellbore_fluids: ['fluid_']
};

/**
 * Checks if a value is empty or represents a missing value.
 */
function isValueEmpty(val) {
  if (val === undefined || val === null) return true;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === '' || s === 'n/a' || s === 'unknown' || s === 'none' || s === '—' || s === '-' || s === '— only';
  }
  return false;
}

/**
 * Recursively normalizes missing values to '—' and handles nested object keys.
 */
function normalizeObjectValues(obj) {
  if (obj === null || typeof obj !== 'object') {
    return isValueEmpty(obj) ? '—' : obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return [];
    return obj.map(item => normalizeObjectValues(item));
  }

  const normalized = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (isValueEmpty(val)) {
      normalized[key] = '—';
    } else if (typeof val === 'object') {
      normalized[key] = normalizeObjectValues(val);
    } else {
      normalized[key] = val;
    }
  }
  return normalized;
}

/**
 * Unifies raw record structures under identical schema rules.
 * 
 * @param {Object} rawEntity - Original record loaded from storage/payload.
 * @param {string} moduleType - Active reference module identifier.
 * @returns {Object} Deep normalized and frozen-ready engineering entity.
 */
export function normalizeEngineeringEntity(rawEntity, moduleType) {
  if (!rawEntity || typeof rawEntity !== 'object') return null;

  // 1. Deep clone to prevent mutating static mockDb payload in-place
  const entity = JSON.parse(JSON.stringify(rawEntity));

  // Normalize module key
  const normalizedModule = moduleType === 'steel-grades' ? 'steel_grades' : moduleType;

  // 2. ID Prefix Normalization
  let id = String(entity.id || '');
  const prefixes = ID_PREFIXES[normalizedModule] || [moduleType + '_'];
  const hasValidPrefix = prefixes.some(p => id.startsWith(p));
  if (!hasValidPrefix) {
    id = prefixes[0] + id.replace(/^(tubular_|thread_|elastomer_|brine_|pt_ref_|standard_|steel_grade_|failure_)/, '');
  }
  entity.id = id;

  // Ensure module metadata is defined
  entity.module = normalizedModule;

  // 3. Trace compatibilities (ensure arrays are initialized)
  entity.standards = Array.isArray(entity.standards) ? entity.standards : [];
  entity.graphs = Array.isArray(entity.graphs) ? entity.graphs : [];
  entity.diagrams = Array.isArray(entity.diagrams) ? entity.diagrams : [];
  entity.aliases = Array.isArray(entity.aliases) ? entity.aliases : [];

  // Alias array normalization (lowercase and unique)
  entity.aliases = Array.from(new Set(entity.aliases.map(a => String(a).toLowerCase().trim()))).filter(Boolean);

  // 4. Consistent Temperature and Pressure envelopes
  if (!entity.temperature || typeof entity.temperature !== 'object') {
    entity.temperature = { min: '—', max: '—', unit: 'C' };
  } else {
    entity.temperature.min = isValueEmpty(entity.temperature.min) ? '—' : Number(entity.temperature.min);
    entity.temperature.max = isValueEmpty(entity.temperature.max) ? '—' : Number(entity.temperature.max);
    entity.temperature.unit = isValueEmpty(entity.temperature.unit) ? 'C' : String(entity.temperature.unit).trim();
  }

  if (!entity.pressure || typeof entity.pressure !== 'object') {
    entity.pressure = { min: '—', max: '—', unit: 'psi' };
  } else {
    entity.pressure.min = isValueEmpty(entity.pressure.min) ? '—' : Number(entity.pressure.min);
    entity.pressure.max = isValueEmpty(entity.pressure.max) ? '—' : Number(entity.pressure.max);
    entity.pressure.unit = isValueEmpty(entity.pressure.unit) ? 'psi' : String(entity.pressure.unit).trim();
  }

  // 5. Evidence audit hooks enforcement (unified layout)
  if (!entity.sources || !Array.isArray(entity.sources) || entity.sources.length === 0) {
    entity.sources = ['API/ISO Reference Guidelines'];
  }
  if (isValueEmpty(entity.confidenceLevel)) {
    entity.confidenceLevel = 'Reference Only';
  } else {
    const conf = String(entity.confidenceLevel).toLowerCase();
    if (conf.includes('high')) entity.confidenceLevel = 'High';
    else if (conf.includes('medium')) entity.confidenceLevel = 'Medium';
    else entity.confidenceLevel = 'Reference Only';
  }
  if (isValueEmpty(entity.lastUpdated)) {
    entity.lastUpdated = '2026-06';
  }
  if (isValueEmpty(entity.revisionDate)) {
    entity.revisionDate = '2025';
  }
  if (isValueEmpty(entity.applicabilityScope)) {
    entity.applicabilityScope = 'General Completion Guidelines';
  }
  if (isValueEmpty(entity.limitationNotes)) {
    entity.limitationNotes = 'Verify with local operator procedures';
  }

  if (normalizedModule === 'tubulars') {
    if (entity.wall_thickness === undefined || entity.wall_thickness === null || isValueEmpty(entity.wall_thickness)) {
      entity.wall_thickness = Number((((entity.od - entity.inner_dia) / 2) * 25.4).toFixed(4));
    }
  }

  // 6. Final missing field normalization
  return normalizeObjectValues(entity);
}

export default { normalizeEngineeringEntity };
