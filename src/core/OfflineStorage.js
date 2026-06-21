import AppLogger from './AppLogger.js';
import { normalizeEngineeringEntity } from './SystemCoherenceLayer.js';
import { IntegrityLock } from './integrityLock.js';
import { store } from './State.js';
import { IntegritySnapshot } from './IntegritySnapshot.js';
import releaseManifest from '../data/release_manifest.json';

/**
 * OfflineStorage.js
 * Manages local IndexedDB storage, versioning, migrations, and recovery.
 * Provides offline capabilities for the reference data.
 */
export class OfflineStorage {
  static DB_NAME = 'HadalboreOfflineDB';
  static DB_VERSION = 2;
  static STORES = [
    'tubulars',
    'threads',
    'elastomers',
    'brines',
    'pt_reference',
    'standards',
    'acid_environments',
    'steel_grades',
    'failures'
  ];

  /**
   * Initializes IndexedDB and synchronizes it with fallback in-memory DB.
   * 
   * @param {Object} fallbackDb - The mock-db.json static payload.
   * @returns {Promise<Object>} Resolved database object loaded from local storage.
   */
  static async init(fallbackDb) {
    AppLogger.info('Initializing offline storage subsystem...');
    const isFieldMode = localStorage.getItem('hadalbore_field_mode') === 'true';
    let bootStatus = 'BOOT_OK';
    
    if (typeof window === 'undefined' || !window.indexedDB) {
      AppLogger.warn('IndexedDB is not supported in this environment. Falling back to memory database.');
      const normalizedFallback = {};
      Object.keys(fallbackDb).forEach(key => {
        normalizedFallback[key] = (fallbackDb[key] || []).map(rec => normalizeEngineeringEntity(rec, key));
      });
      store.setState({ bootStatus: 'BOOT_OK' });
      return normalizedFallback;
    }

    try {
      const db = await this._openDB();
      let activeDb = null;
      
      // 1. Validate IndexedDB schema version
      const isSchemaValid = IntegrityLock.isSchemaVersionValid(db.version);
      if (!isSchemaValid) {
        if (isFieldMode) {
          AppLogger.warn('FIELD MODE ACTIVE — DATABASE LOCKED (READ ONLY)');
          AppLogger.warn('Database inconsistency detected. Protected offline snapshot loaded.');
          db.close();
          const normalizedFallback = {};
          Object.keys(fallbackDb).forEach(key => {
            normalizedFallback[key] = (fallbackDb[key] || []).map(rec => normalizeEngineeringEntity(rec, key));
          });
          store.setState({ bootStatus: 'BOOT_RECOVERY_LOADED', schemaCorrupted: true });
          return normalizedFallback;
        } else {
          AppLogger.warn('Database schema version mismatch. Re-seeding database...');
          bootStatus = 'BOOT_RECOVERY';
          await this._seedDatabase(db, fallbackDb);
        }
      }
      
      // 2. Check if DB is empty
      const isEmpty = await this._isDatabaseEmpty(db);
      if (isEmpty) {
        if (isFieldMode) {
          AppLogger.warn('FIELD MODE ACTIVE — DATABASE LOCKED (READ ONLY)');
          AppLogger.warn('Database inconsistency detected. Protected offline snapshot loaded.');
          db.close();
          const normalizedFallback = {};
          Object.keys(fallbackDb).forEach(key => {
            normalizedFallback[key] = (fallbackDb[key] || []).map(rec => normalizeEngineeringEntity(rec, key));
          });
          store.setState({ bootStatus: 'BOOT_RECOVERY_LOADED', schemaCorrupted: true });
          return normalizedFallback;
        } else {
          AppLogger.info('Local database is empty. Performing initial migration & seeding...');
          bootStatus = 'BOOT_REBUILD';
          await this._seedDatabase(db, fallbackDb);
        }
      } else {
        // 3. Run integrity check to ensure record count isn't completely corrupted
        const isValid = await this._runIntegrityCheck(db, fallbackDb);
        activeDb = await this._loadAllData(db);
        
        // 4. Validate dataset hash (buildHash)
        const calculatedHash = IntegritySnapshot.generateSchemaHash(activeDb);
        const isHashValid = calculatedHash === releaseManifest.buildHash;

        if (!isValid || !isHashValid) {
          if (isFieldMode) {
            AppLogger.warn('FIELD MODE ACTIVE — DATABASE LOCKED (READ ONLY)');
            AppLogger.warn('Database inconsistency detected. Protected offline snapshot loaded.');
            db.close();
            const normalizedFallback = {};
            Object.keys(fallbackDb).forEach(key => {
              normalizedFallback[key] = (fallbackDb[key] || []).map(rec => normalizeEngineeringEntity(rec, key));
            });
            store.setState({ bootStatus: 'BOOT_RECOVERY_LOADED', schemaCorrupted: true });
            return normalizedFallback;
          } else {
            AppLogger.warn(`Integrity check failed (valid=${isValid}, hashValid=${isHashValid}). Recovering...`);
            bootStatus = 'BOOT_RECOVERY';
            await this._seedDatabase(db, fallbackDb);
            activeDb = await this._loadAllData(db);
          }
        }
      }

      if (!activeDb) {
        activeDb = await this._loadAllData(db);
      }

      AppLogger.info('Offline database synchronized successfully.', {
        totalStores: this.STORES.length,
        version: this.DB_VERSION,
        bootStatus
      });

      // Update global bootStatus state
      store.setState({ bootStatus });

      db.close();
      return activeDb;
    } catch (err) {
      AppLogger.error('IndexedDB initialization failed. Falling back to static payload.', {}, err);
      const normalizedFallback = {};
      Object.keys(fallbackDb).forEach(key => {
        normalizedFallback[key] = (fallbackDb[key] || []).map(rec => normalizeEngineeringEntity(rec, key));
      });
      if (isFieldMode) {
        AppLogger.warn('Database inconsistency detected. Protected offline snapshot loaded.');
        store.setState({ bootStatus: 'BOOT_RECOVERY_LOADED', schemaCorrupted: true });
      } else {
        store.setState({ bootStatus: 'BOOT_OK' });
      }
      return normalizedFallback;
    }
  }

  /**
   * Opens the IndexedDB database connection.
   */
  static _openDB() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        AppLogger.info(`IndexedDB schema upgrade needed (version ${e.oldVersion} -> ${e.newVersion}). Creating object stores...`);
        
        this.STORES.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Checks if the database store keys are completely empty.
   */
  static _isDatabaseEmpty(db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.STORES[0], 'readonly');
      const store = tx.objectStore(this.STORES[0]);
      const countReq = store.count();

      countReq.onsuccess = () => resolve(countReq.result === 0);
      countReq.onerror = () => reject(countReq.error);
    });
  }

  /**
   * Seeds the database stores with static JSON data.
   */
  static _seedDatabase(db, fallbackDb) {
    const isFieldMode = localStorage.getItem('hadalbore_field_mode') === 'true';
    if (isFieldMode) {
      AppLogger.warn('FIELD MODE ACTIVE — DATABASE LOCKED (READ ONLY)');
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      AppLogger.info('Wiping old database stores and seeding reference data...');
      
      const tx = db.transaction(this.STORES, 'readwrite');
      
      tx.oncomplete = () => {
        AppLogger.info('IndexedDB database seeding complete.');
        resolve();
      };

      tx.onerror = (e) => {
        AppLogger.error('Error during database seeding.', {}, e.target.error);
        reject(e.target.error);
      };

      this.STORES.forEach(storeName => {
        const store = tx.objectStore(storeName);
        store.clear(); // Clear existing records

        const records = fallbackDb[storeName] || [];
        records.forEach(rec => {
          const normalized = normalizeEngineeringEntity(rec, storeName);
          if (IntegrityLock.validateIndexedDBEntry(normalized, storeName)) {
            store.put(normalized);
          }
        });
      });
    });
  }

  /**
   * Performs an integrity check on store sizes.
   */
  static _runIntegrityCheck(db, fallbackDb) {
    return new Promise((resolve) => {
      const tx = db.transaction(this.STORES, 'readonly');
      let checksCompleted = 0;
      let isCorrupted = false;

      this.STORES.forEach(storeName => {
        const store = tx.objectStore(storeName);
        const countReq = store.count();

        countReq.onsuccess = () => {
          const expectedCount = (fallbackDb[storeName] || []).length;
          // If a major store is completely empty, trigger corruption flag
          if (expectedCount > 0 && countReq.result === 0) {
            isCorrupted = true;
          }
          checksCompleted++;
          if (checksCompleted === this.STORES.length) {
            resolve(!isCorrupted);
          }
        };

        countReq.onerror = () => {
          isCorrupted = true;
          checksCompleted++;
          if (checksCompleted === this.STORES.length) {
            resolve(false);
          }
        };
      });
    });
  }

  /**
   * Loads all records from all stores.
   */
  static _loadAllData(db) {
    return new Promise((resolve, reject) => {
      const activeDb = {};
      const tx = db.transaction(this.STORES, 'readonly');

      tx.oncomplete = () => resolve(activeDb);
      tx.onerror = (e) => reject(e.target.error);

      this.STORES.forEach(storeName => {
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        
        req.onsuccess = () => {
          activeDb[storeName] = req.result.map(rec => normalizeEngineeringEntity(rec, storeName));
        };
      });
    });
  }

  /**
   * Wipes the local storage and re-seeds from memory fallback.
   */
  static async recover(fallbackDb) {
    const isFieldMode = localStorage.getItem('hadalbore_field_mode') === 'true';
    if (isFieldMode) {
      AppLogger.warn('FIELD MODE ACTIVE — DATABASE LOCKED (READ ONLY)');
      const normalizedFallback = {};
      Object.keys(fallbackDb).forEach(key => {
        normalizedFallback[key] = (fallbackDb[key] || []).map(rec => normalizeEngineeringEntity(rec, key));
      });
      return normalizedFallback;
    }
    AppLogger.warn('Manual database recovery initiated.');
    if (typeof window === 'undefined' || !window.indexedDB) return fallbackDb;

    try {
      const db = await this._openDB();
      await this._seedDatabase(db, fallbackDb);
      const activeDb = await this._loadAllData(db);
      db.close();
      AppLogger.info('Manual database recovery complete.');
      return activeDb;
    } catch (err) {
      AppLogger.error('Manual database recovery failed.', {}, err);
      return fallbackDb;
    }
  }

  /**
   * Retrieves record counts for all stores in IndexedDB.
   */
  static async getStoreCounts() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return {};
    }

    try {
      const db = await this._openDB();
      const counts = {};
      const tx = db.transaction(this.STORES, 'readonly');
      
      const promises = this.STORES.map(storeName => {
        return new Promise((resolve) => {
          try {
            const store = tx.objectStore(storeName);
            const req = store.count();
            req.onsuccess = () => {
              counts[storeName] = req.result;
              resolve();
            };
            req.onerror = () => {
              counts[storeName] = 0;
              resolve();
            };
          } catch (e) {
            counts[storeName] = 0;
            resolve();
          }
        });
      });

      await Promise.all(promises);
      db.close();
      return counts;
    } catch (err) {
      return {};
    }
  }
}

export default OfflineStorage;
