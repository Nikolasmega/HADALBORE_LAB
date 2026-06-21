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

// Derive key using PBKDF2
const salt = crypto.randomBytes(16);
const key = crypto.pbkdf2Sync(PASSWORD, salt, ITERATIONS, KEY_LEN, 'sha256');

// Encrypt using AES-256-GCM
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

const encrypted = Buffer.concat([
  cipher.update(jsonStr, 'utf8'),
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
