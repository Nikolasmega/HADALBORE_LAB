import crypto from 'crypto';

const PASSWORD = 'HADALBORE2026';
const ITERATIONS = 100000;
const KEY_LEN = 32; // 256 bits

// 1. Node.js pbkdf2Sync
const salt = crypto.randomBytes(16);
const keyNode = crypto.pbkdf2Sync(PASSWORD, salt, ITERATIONS, KEY_LEN, 'sha256');

// 2. Web Crypto API PBKDF2 (using Node's globalThis.crypto)
const webCrypto = globalThis.crypto || crypto.webcrypto;
const encoder = new TextEncoder();
const passwordBytes = encoder.encode(PASSWORD);

const keyMaterial = await webCrypto.subtle.importKey(
  "raw",
  passwordBytes,
  "PBKDF2",
  false,
  ["deriveBits", "deriveKey"]
);

const keyWeb = await webCrypto.subtle.deriveKey(
  {
    name: "PBKDF2",
    salt: salt,
    iterations: ITERATIONS,
    hash: "SHA-256"
  },
  keyMaterial,
  { name: "AES-GCM", length: 256 },
  true, // exportable
  ["decrypt", "encrypt"]
);

const exportedKeyWeb = await webCrypto.subtle.exportKey("raw", keyWeb);
const keyWebBuffer = Buffer.from(exportedKeyWeb);

console.log("Node Key: ", keyNode.toString('hex'));
console.log("Web Key:  ", keyWebBuffer.toString('hex'));
console.log("Match:     ", keyNode.equals(keyWebBuffer));
