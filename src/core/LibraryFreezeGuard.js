import { IntegritySnapshot } from './IntegritySnapshot.js';
import AppLogger from './AppLogger.js';

/**
 * Recursively freezes an object/array, prevents extension, and locks prototype modifications.
 * Safely guards against circular references.
 * 
 * @param {Object} obj - The target object to freeze.
 * @returns {Object} Frozen object.
 */
export function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Guard against circular structures
  const seen = new WeakSet();

  function freezeRecursive(val) {
    if (val === null || typeof val !== 'object' || seen.has(val)) {
      return;
    }
    seen.add(val);

    // Lock down prototype modification for custom prototype hierarchies
    const proto = Object.getPrototypeOf(val);
    if (proto && proto !== Object.prototype && proto !== Array.prototype) {
      Object.freeze(proto);
    }

    // Freeze properties first recursively
    const propNames = Reflect.ownKeys(val);
    for (const name of propNames) {
      const desc = Object.getOwnPropertyDescriptor(val, name);
      if (desc && desc.value !== null && typeof desc.value === 'object') {
        freezeRecursive(desc.value);
      }
    }

    // Prevent extension and freeze self
    Object.preventExtensions(val);
    Object.freeze(val);
  }

  freezeRecursive(obj);
  return obj;
}

/**
 * Freezes comparison selections at ingestion stage.
 * 
 * @param {Object} record - The compare queue item.
 * @returns {Object} Frozen compare record.
 */
export function freezeCompareInput(record) {
  return deepFreeze(record);
}

/**
 * System Freeze Boot Procedure:
 * Loads, validates integrity snapshot, and returns frozen database.
 * 
 * @param {Object} activeDb - The loaded IndexedDB database.
 * @returns {Object} { frozenDb, snapshotResult }
 */
export function freezeLibrary(activeDb) {
  AppLogger.info('Initiating library freeze procedure...');

  // 1. Run Integrity Snapshot checks
  const snapshotResult = IntegritySnapshot.validate(activeDb);

  // 2. Deep freeze all database stores
  AppLogger.info('Enforcing hard freeze on database records.');
  const frozenDb = deepFreeze(activeDb);

  return {
    frozenDb,
    snapshotResult
  };
}
