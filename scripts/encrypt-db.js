import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PASSWORD = 'HADALBORE2026';
const ITERATIONS = 100000;
const KEY_LEN = 32; // 256 bits

const dbPath = path.resolve(process.cwd(), 'src/data/mock-db.json');
if (!fs.existsSync(dbPath)) {
  console.error('Error: mock-db.json not found at', dbPath);
  process.exit(1);
}

const jsonStr = fs.readFileSync(dbPath, 'utf8');
const db = JSON.parse(jsonStr);

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

import { normalizeEngineeringEntity } from '../src/core/SystemCoherenceLayer.js';

normalizeDatabase(db);

// Mirror SystemCoherenceLayer normalization on all records
Object.keys(db).forEach(storeName => {
  const records = db[storeName];
  if (!Array.isArray(records)) return;
  db[storeName] = records.map(rec => normalizeEngineeringEntity(rec, storeName));
});

const normalizedJsonStr = JSON.stringify(db);

// Derive key using PBKDF2
const salt = crypto.randomBytes(16);
const key = crypto.pbkdf2Sync(PASSWORD, salt, ITERATIONS, KEY_LEN, 'sha256');

// Encrypt using AES-256-GCM
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

const encrypted = Buffer.concat([
  cipher.update(normalizedJsonStr, 'utf8'),
  cipher.final(),
  cipher.getAuthTag()
]);

// Write encrypted output as a JS module
const outputContent = `// Auto-generated encrypted database payload for HADALBORE_LAB
export const dbEncrypted = {
  salt: "${salt.toString('base64')}",
  iv: "${iv.toString('base64')}",
  ciphertext: "${encrypted.toString('base64')}"
};
`;

const outputPath = path.resolve(process.cwd(), 'src/data/mock-db-encrypted.js');
fs.writeFileSync(outputPath, outputContent, 'utf8');

console.log('====================================');
console.log('DATABASE ENCRYPTION COMPLETED');
console.log('====================================');
console.log('Output file:      ', outputPath);
console.log('Payload size (enc):', encrypted.length, 'bytes');
console.log('====================================');
