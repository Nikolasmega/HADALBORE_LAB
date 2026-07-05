import fs from 'fs';
import path from 'path';
import { normalizeEngineeringEntity } from '../src/core/SystemCoherenceLayer.js';

// cyrb53 hash function
function cyrb53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334903);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

const dbPath = path.resolve(process.cwd(), 'src/data/mock-db.json');
const mockDbContent = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(mockDbContent);

const REQUIRED_KEYS = {
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

function normalizeDatabase(database) {
  Object.keys(database).forEach(storeName => {
    const records = database[storeName];
    if (!Array.isArray(records)) return;

    const required = REQUIRED_KEYS[storeName] || ['id', 'type', 'name', 'description'];
    records.forEach(rec => {
      if (!rec || typeof rec !== 'object') return;
      required.forEach(key => {
        if (rec[key] === undefined || rec[key] === null || String(rec[key]).trim() === '') {
          rec[key] = '—';
        }
      });
    });
  });
}

normalizeDatabase(db);

// Mirror SystemCoherenceLayer normalization on all records
Object.keys(db).forEach(storeName => {
  const records = db[storeName];
  if (!Array.isArray(records)) return;
  db[storeName] = records.map(rec => normalizeEngineeringEntity(rec, storeName));
});

// 1. Compute buildHash — sorted deterministic serialization.
//    Mirrors IntegritySnapshot.generateSchemaHash() in the browser exactly:
//    sort stores alphabetically, sort each store's records by id, then cyrb53(JSON + schemaVersion).
const sortedDbForHash = {};
Object.keys(db).sort().forEach(storeName => {
  const records = (db[storeName] || []).slice().sort((a, b) =>
    String(a.id || '').localeCompare(String(b.id || ''))
  );
  sortedDbForHash[storeName] = records;
});
const buildHashInput = JSON.stringify(sortedDbForHash).replace(/\r\n/g, '\n') + '2';
const buildHash = cyrb53(buildHashInput);

// 2. Compute integritySealHash
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
        if (rec[key] !== null && typeof rec[key] === 'object') {
          try {
            cleanRec[key] = JSON.parse(JSON.stringify(rec[key]));
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

  const sortedRecords = cleanRecords.sort((a, b) => a.id.localeCompare(b.id));
  sealParts.push(`${storeName}:${JSON.stringify(sortedRecords)}`);
});
const sealStr = sealParts.join(';');
const integritySealHash = cyrb53(sealStr);

// 3. Compile metadata
const totalRecords = Object.keys(db).reduce((acc, cat) => acc + (db[cat] || []).length, 0);
const storeCounts = {};
Object.keys(db).forEach(cat => {
  storeCounts[cat] = (db[cat] || []).length;
});

const versionData = {
  product: "HADALBORE_LAB",
  creator: "Niko Y",
  officialSource: "GitHub",
  buildVersion: "1.3.1",
  schemaVersion: 2,
  datasetVersion: "2.9.1"
};

const releaseManifest = {
  product: "HADALBORE_LAB",
  creator: "Niko Y",
  officialSource: "GitHub",
  buildVersion: "1.3.1",
  schemaVersion: 2,
  datasetVersion: "2.9.1",
  timestamp: new Date().toISOString(),
  buildHash,
  integritySealHash,
  stores: storeCounts,
  totalRecords
};

// 4. Output files
const versionPath = path.resolve(process.cwd(), 'src/data/version.json');
const manifestPath = path.resolve(process.cwd(), 'src/data/release_manifest.json');

// Ensure parent directories exist
const dataDir = path.dirname(versionPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let isUnchanged = false;
if (fs.existsSync(manifestPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (existing.buildHash === buildHash && existing.integritySealHash === integritySealHash) {
      releaseManifest.timestamp = existing.timestamp;
      isUnchanged = true;
    }
  } catch (err) {
    // ignore
  }
}

fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2), 'utf8');
fs.writeFileSync(manifestPath, JSON.stringify(releaseManifest, null, 2), 'utf8');

const swPath = path.resolve(process.cwd(), 'public/sw.js');
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/const\s+BASE_VERSION\s*=\s*['"][^'"]+['"]/g, `const BASE_VERSION = '${buildHash}'`);
  fs.writeFileSync(swPath, swContent, 'utf8');
  console.log('Updated public/sw.js cache version to buildHash:', buildHash);
}

console.log('====================================');
console.log('HADALBORE LAB RELEASE PACKAGING COMPLETED');
console.log('====================================');
console.log('Build Version:     ', versionData.buildVersion);
console.log('Dataset Version:   ', versionData.datasetVersion);
console.log('Build Hash:        ', buildHash);
console.log('Integrity Seal:    ', integritySealHash);
console.log('Total Records:     ', totalRecords);
console.log('Written version.json and release_manifest.json');
console.log('====================================');
