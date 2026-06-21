import { IntegritySnapshot } from './IntegritySnapshot.js';
import AppLogger from './AppLogger.js';

export class IntegrityLock {
  static EXPECTED_VERSION = 2; // Matches DB_VERSION in OfflineStorage.js

  /**
   * Enforce schema version match before database hydration.
   * 
   * @param {number} dbVersion - Active IndexedDB version.
   * @returns {boolean} True if versions match.
   */
  static isSchemaVersionValid(dbVersion) {
    const isValid = Number(dbVersion) === this.EXPECTED_VERSION;
    if (!isValid) {
      AppLogger.error(`Schema Version Mismatch: expected ${this.EXPECTED_VERSION}, got ${dbVersion}. Hydration blocked.`);
    }
    return isValid;
  }

  /**
   * Rejects malformed IndexedDB entries at write stage.
   * 
   * @param {Object} entry - Individual database record.
   * @param {string} storeName - IndexedDB object store name.
   * @returns {boolean} True if entry is structurally valid.
   */
  static validateIndexedDBEntry(entry, storeName) {
    if (!entry || typeof entry !== 'object') {
      AppLogger.warn(`Rejected invalid write entry to "${storeName || 'unknown'}": not a valid object.`);
      return false;
    }

    // Every record must contain unique 'id'
    if (!entry.id || typeof entry.id !== 'string') {
      AppLogger.warn(`Rejected malformed entry in "${storeName || 'unknown'}": missing or invalid ID.`);
      return false;
    }

    // Category (storeName) must be present
    if (!storeName || typeof storeName !== 'string') {
      AppLogger.warn(`Rejected entry "${entry.id}": missing or invalid category/storeName.`);
      return false;
    }

    // If type is missing, normalize it
    if (!entry.type || typeof entry.type !== 'string') {
      entry.type = '—';
      AppLogger.warn(`Record "${entry.id}" in "${storeName}" missing "type". Auto-filled with "—".`);
    }

    // Category-specific integrity validations
    const requiredKeys = IntegritySnapshot.REQUIRED_KEYS[storeName] || ['id', 'type', 'name', 'description'];
    for (const key of requiredKeys) {
      if (key === 'id') continue;
      if (entry[key] === undefined || entry[key] === null || String(entry[key]).trim() === '') {
        entry[key] = '—';
        AppLogger.warn(`Record "${entry.id}" in "${storeName}" missing optional field "${key}". Auto-filled with "—".`);
      }
    }

    return true;
  }

  /**
   * Prevents partial updates or schema drifts during writes.
   * Checks if the proposed full dataset is valid and complete.
   * 
   * @param {Object} proposedDb - Full new database dictionary.
   * @returns {boolean} True if proposed dataset is consistent.
   */
  static preventPartialUpdate(proposedDb, quiet = false) {
    if (!proposedDb || typeof proposedDb !== 'object') {
      if (!quiet) AppLogger.error('Sync block: Proposed update payload is null or not a valid object.');
      return false;
    }

    // Verify all primary stores are present in update dictionary
    const expectedStores = ['tubulars', 'threads', 'elastomers', 'failures', 'steel_grades', 'standards'];
    for (const storeName of expectedStores) {
      if (!proposedDb[storeName] || !Array.isArray(proposedDb[storeName]) || proposedDb[storeName].length === 0) {
        if (!quiet) AppLogger.error(`Sync block: Proposed update fails completeness check. Missing store "${storeName}".`);
        return false;
      }
    }

    // Run structural integrity validation check
    const validation = IntegritySnapshot.validate(proposedDb);
    if (!validation.success) {
      if (!quiet) AppLogger.error('Sync block: Schema validation mismatch in proposed update.', {}, validation.errors);
      return false;
    }

    return true;
  }
}

export default IntegrityLock;
