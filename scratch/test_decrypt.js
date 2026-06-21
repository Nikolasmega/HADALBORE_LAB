import crypto from 'crypto';
import { dbEncrypted } from '../src/data/mock-db-encrypted.js';

const PASSWORD = 'HADALBORE2026';
const webCrypto = globalThis.crypto || crypto.webcrypto;

function base64ToUint8Array(base64) {
  return Buffer.from(base64, 'base64');
}

async function testDecryption() {
  try {
    const saltBytes = base64ToUint8Array(dbEncrypted.salt);
    const ivBytes = base64ToUint8Array(dbEncrypted.iv);
    const ciphertextBytes = base64ToUint8Array(dbEncrypted.ciphertext);

    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(PASSWORD);

    const keyMaterial = await webCrypto.subtle.importKey(
      "raw",
      passwordBytes,
      "PBKDF2",
      false,
      ["deriveBits", "deriveKey"]
    );

    const key = await webCrypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const decrypted = await webCrypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBytes
      },
      key,
      ciphertextBytes
    );

    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(decrypted);
    const data = JSON.parse(jsonStr);
    
    console.log("Decryption SUCCESS!");
    console.log("Database Keys: ", Object.keys(data));
  } catch (err) {
    console.error("Decryption FAILED:", err);
  }
}

testDecryption();
