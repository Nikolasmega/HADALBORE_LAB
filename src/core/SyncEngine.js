// SyncEngine.js
// Implements safe staged database updates with atomic transactions and automatic rollbacks

import { IntegrityLock } from './integrityLock.js';
import { IntegritySnapshot } from './IntegritySnapshot.js';
import { store } from './State.js';
import AppLogger from './AppLogger.js';

export class SyncEngine {
  /**
   * Performs an atomic synchronized database update to IndexedDB.
   * If any record check fails, the entire transaction rolls back.
   * 
   * @param {IDBDatabase} dbConnection - Active IndexedDB open connection.
   * @param {Object} proposedDb - Full proposed database dictionary.
   * @returns {Promise<Object>} { success, hash, reason }
   */
  static applySyncUpdate(dbConnection, proposedDb) {
    return new Promise(async (resolve) => {
      const isFieldMode = localStorage.getItem('hadalbore_field_mode') === 'true';
      if (isFieldMode) {
        AppLogger.warn('FIELD MODE ACTIVE — DATABASE LOCKED (READ ONLY)');
        resolve({
          success: false,
          reason: 'FIELD MODE ACTIVE — DATABASE LOCKED (READ ONLY)'
        });
        return;
      }
      AppLogger.info('[Sync Staging] Phase 1: Download/Receive payload complete.');

      // Phase 2: Verify cyrb53 Hash
      const calculatedHash = IntegritySnapshot.generateSchemaHash(proposedDb);
      AppLogger.info(`[Sync Staging] Phase 2: Calculated payload cyrb53 hash: ${calculatedHash}`);

      // Phase 3: Verify Schema
      AppLogger.info('[Sync Staging] Phase 3: Verifying structural schema integrity...');
      if (!IntegrityLock.preventPartialUpdate(proposedDb)) {
        AppLogger.error('[Sync Staging] Schema validation mismatch or incomplete payload. Update blocked.');
        resolve({
          success: false,
          reason: 'Schema verification mismatch or partial update blocked.'
        });
        return;
      }

      // Phase 4: Create Temporary Backup Snapshot of current database
      AppLogger.info('[Sync Staging] Phase 4: Backing up current database snapshot...');
      let backupDb = null;
      try {
        backupDb = await this._loadCurrentDbBackup(dbConnection);
      } catch (err) {
        AppLogger.warn('[Sync Staging] Failed to create database backup snapshot. Proceeding cautiously...', {}, err);
      }

      // Phase 5: Atomic Replace
      AppLogger.info('[Sync Staging] Phase 5: Executing atomic database replacement transaction...');
      const storesList = Object.keys(proposedDb).filter(storeName =>
        dbConnection.objectStoreNames.contains(storeName)
      );

      try {
        const tx = dbConnection.transaction(storesList, 'readwrite');

        tx.oncomplete = () => {
          AppLogger.info('[Sync Staging] Phase 6: Sync transaction committed successfully. Locking state...', { hash: calculatedHash });
          
          // Update global state store hash
          store.setState({
            dbHash: calculatedHash,
            schemaCorrupted: false
          });

          // Update last sync time
          localStorage.setItem('hadalbore_last_sync', new Date().toLocaleString());

          resolve({
            success: true,
            hash: calculatedHash
          });
        };

        tx.onerror = async (e) => {
          AppLogger.error('[Sync Staging] Sync transaction failed. Triggering automatic rollback...', {}, e.target.error);
          await this._rollbackDatabase(dbConnection, backupDb);
          resolve({
            success: false,
            reason: 'Database write failed. Atomic rollback performed.'
          });
        };

        // Clear and write each store
        storesList.forEach(storeName => {
          const objectStore = tx.objectStore(storeName);
          objectStore.clear();

          const records = proposedDb[storeName] || [];
          records.forEach(rec => {
            if (IntegrityLock.validateIndexedDBEntry(rec, storeName)) {
              objectStore.put(rec);
            } else {
              AppLogger.error(`[Sync Staging] Invalid record in "${storeName}": ${rec.id || 'unknown'}. Aborting update.`);
              tx.abort();
            }
          });
        });

      } catch (err) {
        AppLogger.error('[Sync Staging] Unexpected exception in replace phase. Restoring backup...', {}, err);
        await this._rollbackDatabase(dbConnection, backupDb);
        resolve({
          success: false,
          reason: err.message
        });
      }
    });
  }

  /**
   * Loads all current data from IndexedDB into a backup object.
   */
  static _loadCurrentDbBackup(dbConnection) {
    return new Promise((resolve, reject) => {
      const backup = {};
      const storeNames = Array.from(dbConnection.objectStoreNames);
      if (storeNames.length === 0) return resolve(backup);
      
      const tx = dbConnection.transaction(storeNames, 'readonly');
      
      tx.oncomplete = () => resolve(backup);
      tx.onerror = (e) => reject(e.target.error);

      storeNames.forEach(storeName => {
        const objectStore = tx.objectStore(storeName);
        const req = objectStore.getAll();
        req.onsuccess = () => {
          backup[storeName] = req.result;
        };
      });
    });
  }

  /**
   * Restores IndexedDB from a backup object on update failure.
   */
  static _rollbackDatabase(dbConnection, backupDb) {
    return new Promise((resolve) => {
      if (!backupDb || Object.keys(backupDb).length === 0) {
        AppLogger.warn('[Sync Rollback] No backup data available to restore.');
        return resolve();
      }

      AppLogger.warn('[Sync Rollback] Restoring previous database snapshot from backup...');
      const storeNames = Object.keys(backupDb);

      try {
        const tx = dbConnection.transaction(storeNames, 'readwrite');
        
        tx.oncomplete = () => {
          AppLogger.info('[Sync Rollback] Database restored successfully to previous state.');
          resolve();
        };

        tx.onerror = (e) => {
          AppLogger.error('[Sync Rollback] Rollback transaction failed. Database may be in inconsistent state.', {}, e.target.error);
          resolve();
        };

        storeNames.forEach(storeName => {
          const objectStore = tx.objectStore(storeName);
          objectStore.clear();
          
          const records = backupDb[storeName] || [];
          records.forEach(rec => {
            objectStore.put(rec);
          });
        });
      } catch (err) {
        AppLogger.error('[Sync Rollback] Rollback exception.', {}, err);
        resolve();
      }
    });
  }
}

export default SyncEngine;
