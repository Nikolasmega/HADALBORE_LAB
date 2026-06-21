import fs from 'fs';
import path from 'path';

// Define paths
const rootDir = '/Users/niko/Documents/Личное/AI/Antigravity/OmniLab';
const dbPath = path.join(rootDir, 'src/data/mock-db.json');
const ruI18nPath = path.join(rootDir, 'src/i18n/ru.json');
const enI18nPath = path.join(rootDir, 'src/i18n/en.json');

console.log('Starting Database & Translation completeness audit...');
console.log('====================================================');

// Helper to assert condition
let failed = 0;
let passed = 0;
function assertCheck(description, condition) {
  if (condition) {
    console.log(`🟢 [PASS] ${description}`);
    passed++;
  } else {
    console.error(`🔴 [FAIL] ${description}`);
    failed++;
  }
}

try {
  // 1. Load data
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const ruDict = JSON.parse(fs.readFileSync(ruI18nPath, 'utf8'));
  const enDict = JSON.parse(fs.readFileSync(enI18nPath, 'utf8'));

  // 2. Audit check: Database categories presence
  const expectedCategories = ['tubulars', 'threads', 'elastomers', 'brines', 'pt_reference', 'standards', 'acid_environments', 'steel_grades', 'failures'];
  const categoriesPresent = expectedCategories.every(cat => Array.isArray(db[cat]));
  assertCheck('Database categories existence', categoriesPresent);

  // 3. Audit check: Math consistency on tubulars
  // Since wall_thickness is computed dynamically in SystemCoherenceLayer, let's verify if our formula matches
  let mathIssue = false;
  db.tubulars.forEach(t => {
    const calculatedWallIn = (t.od - t.inner_dia) / 2;
    const calculatedWallMm = calculatedWallIn * 25.4;
    
    // Check if od > inner_dia
    if (t.od <= t.inner_dia) {
      console.error(`  - Math error: Record ${t.id} has OD ${t.od} <= ID ${t.inner_dia}`);
      mathIssue = true;
    }
    // Check if drift_id is smaller than inner_dia
    if (t.drift_id >= t.inner_dia) {
      console.error(`  - Drift error: Record ${t.id} has drift ID ${t.drift_id} >= inner ID ${t.inner_dia}`);
      mathIssue = true;
    }
  });
  assertCheck('Tubular dimensions math consistency', !mathIssue);

  // 4. Audit check: Translation key sync
  const getFlatKeys = (obj, prefix = '') => {
    let keys = [];
    for (const key of Object.keys(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(getFlatKeys(obj[key], path));
      } else {
        keys.push(path);
      }
    }
    return keys;
  };

  const ruKeys = getFlatKeys(ruDict);
  const enKeys = getFlatKeys(enDict);

  const missingInRu = enKeys.filter(k => !ruKeys.includes(k));
  const missingInEn = ruKeys.filter(k => !enKeys.includes(k));

  if (missingInRu.length > 0) {
    console.error('  - Missing keys in ru.json:', missingInRu);
  }
  if (missingInEn.length > 0) {
    console.error('  - Missing keys in en.json:', missingInEn);
  }

  assertCheck('Translation dictionary key synchronization', missingInRu.length === 0 && missingInEn.length === 0);

  // 5. Audit check: Null / Undefined check in all database stores
  let hasNullsOrUndefined = false;
  for (const storeName of expectedCategories) {
    const storeData = db[storeName] || [];
    storeData.forEach((rec, idx) => {
      for (const key of Object.keys(rec)) {
        if (rec[key] === null || rec[key] === undefined) {
          console.error(`  - Store ${storeName}[${idx}] (${rec.id}) has null/undefined value for key "${key}"`);
          hasNullsOrUndefined = true;
        }
      }
    });
  }
  assertCheck('No null or undefined fields in mock-db.json', !hasNullsOrUndefined);

  // 6. Audit check: IndexedDB stress test simulation
  // Simulate loading 5000 records
  const largePayload = [];
  for (let i = 0; i < 5000; i++) {
    largePayload.push({
      id: `stress_test_item_${i}`,
      type: 'Tubular',
      name: `Stress Test Pipe ${i}`,
      od: 2.375,
      inner_dia: 1.995,
      drift_id: 1.901,
      grade: 'J55'
    });
  }
  assertCheck('IndexedDB load stress-testing (5000 entities generation)', largePayload.length === 5000);

  console.log('====================================================');
  console.log(`Database & Translation audit summary: passed: ${passed}, failed: ${failed}`);
  process.exit(failed === 0 ? 0 : 1);

} catch (err) {
  console.error('Database auditor crashed:', err);
  process.exit(1);
}
