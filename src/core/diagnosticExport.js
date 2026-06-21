// diagnosticExport.js
// Exports system snapshots as JSON or readable TXT format for offline support

import { store } from './State.js';
import { graph } from './EngineeringGraph.js';
import { IntegritySnapshot } from './IntegritySnapshot.js';
import { PROJECT_IDENTITY } from './projectIdentity.js';
import AppLogger from './AppLogger.js';
import mockDb from '../data/mock-db.json';
import versionJson from '../data/version.json';
import releaseManifest from '../data/release_manifest.json';

export class DiagnosticExport {
  /**
   * Generates a snapshot object of the entire system state.
   */
  static async generateSnapshot() {
    const state = store.getState();
    
    // Check IndexedDB status
    let indexedDbStatus = 'FAIL';
    let isIDBAvailable = false;
    if (typeof window !== 'undefined' && window.indexedDB) {
      isIDBAvailable = true;
      try {
        // Test open connection
        const req = window.indexedDB.open('HadalboreOfflineDB');
        await new Promise((resolve) => {
          req.onsuccess = (e) => {
            indexedDbStatus = 'ACTIVE';
            e.target.result.close();
            resolve();
          };
          req.onerror = () => {
            indexedDbStatus = 'FAIL';
            resolve();
          };
        });
      } catch (e) {
        indexedDbStatus = 'FAIL';
      }
    }

    // Verify Schema Integrity
    const integrityResult = IntegritySnapshot.validate(mockDb);
    const integrityStatus = integrityResult.success ? 'PASS' : 'FAIL';

    // Calculate Trace Coverage %
    let totalEntities = 0;
    let traceableEntities = 0;
    Object.keys(mockDb).forEach(storeName => {
      const records = mockDb[storeName] || [];
      records.forEach(rec => {
        totalEntities++;
        if (graph.adjacencyList.has(rec.id)) {
          traceableEntities++;
        }
      });
    });
    const traceCoverage = totalEntities > 0 ? `${((traceableEntities / totalEntities) * 100).toFixed(1)}%` : '0.0%';

    // Service Worker status
    const isSWActive = typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller !== null;
    const offlineReadiness = isSWActive && isIDBAvailable ? 'TRUE' : 'FALSE';

    return {
      product: PROJECT_IDENTITY.PRODUCT_NAME,
      creator: PROJECT_IDENTITY.CREATOR,
      officialBuild: PROJECT_IDENTITY.OFFICIAL_BUILD,
      appVersion: state.currentVersion || '1.2.0',
      schemaVersion: 2,
      cacheVersion: state.dbHash || 'v1.1.0',
      indexedDbStatus,
      module: state.activeModule || 'home',
      logs: AppLogger.getLogs() || [],
      compareQueue: state.compareQueue || [],
      integrityStatus,
      traceCoverage,
      offlineReadiness
    };
  }

  /**
   * Triggers a browser download of system_snapshot.json.
   */
  static async exportJson() {
    const snapshot = await this.generateSnapshot();
    const dataStr = JSON.stringify(snapshot, null, 2);
    this._downloadFile(dataStr, 'application/json', 'system_snapshot.json');
  }

  /**
   * Triggers a browser download of system_snapshot_report.txt.
   */
  static async exportTxt() {
    const snapshot = await this.generateSnapshot();
    const sourceWarningText = `${PROJECT_IDENTITY.PRODUCT_NAME} is officially maintained only by ${PROJECT_IDENTITY.CREATOR}. The official and trusted source of the project is the public GitHub repository and official project links. Unofficial copies, forks, or redistributed versions are not guaranteed to be accurate, supported, updated, or safe for engineering use.`;
    
    let report = `==================================================
${PROJECT_IDENTITY.PRODUCT_NAME} — FIELD DIAGNOSTIC REPORT
==================================================
Generated: ${new Date().toISOString()}

[SYSTEM METADATA]
Product:           ${snapshot.product}
Creator:           ${snapshot.creator}
Official Build:    ${snapshot.officialBuild ? 'TRUE' : 'FALSE'}
App Version:       ${snapshot.appVersion}
Schema Version:    ${snapshot.schemaVersion}
Cache Hash/Ver:    ${snapshot.cacheVersion}
Active Module:     ${snapshot.module}
Device ID:         ${typeof window !== 'undefined' ? localStorage.getItem('hadalbore_device_id') || '—' : '—'}

[DEPLOYMENT STATUS]
IndexedDB Engine:  ${snapshot.indexedDbStatus}
Offline Readiness: ${snapshot.offlineReadiness}
Schema Integrity:  ${snapshot.integrityStatus}
Trace Coverage:    ${snapshot.traceCoverage}

[COMPARE QUEUE]
Items in Queue:    ${snapshot.compareQueue.length}
${snapshot.compareQueue.map(item => ` - ID: ${item.id} (${item.module})`).join('\n')}

[SYSTEM LOGS]
Total Entries:     ${snapshot.logs.length}
${snapshot.logs.map(log => `[${log.timestamp}] [${log.level}] ${log.message}`).join('\n')}

==================================================
[OFFICIAL SOURCE WARNING]
${sourceWarningText}
==================================================
`;
    this._downloadFile(report, 'text/plain', 'system_snapshot_report.txt');
  }

  /**
   * Generates and downloads the full Field Package bundle containing:
   * - IndexedDB snapshot
   * - version.json
   * - release_manifest.json
   * - computed integritySealHash
   * - system_snapshot.txt report
   */
  static async exportFieldPackage() {
    let dbSnapshot = mockDb;
    if (typeof window !== 'undefined' && window.indexedDB) {
      try {
        const { default: OfflineStorage } = await import('./OfflineStorage.js');
        const db = await OfflineStorage._openDB();
        dbSnapshot = await OfflineStorage._loadAllData(db);
        db.close();
      } catch (err) {
        AppLogger.error('Failed to load live IndexedDB data for field export. Using mockDb fallback.', {}, err);
        dbSnapshot = mockDb;
      }
    }

    const integritySealHash = IntegritySnapshot.computeIntegritySealHash(dbSnapshot);
    const snapshot = await this.generateSnapshot();
    const sourceWarningText = `${PROJECT_IDENTITY.PRODUCT_NAME} is officially maintained only by ${PROJECT_IDENTITY.CREATOR}. The official and trusted source of the project is the public GitHub repository and official project links. Unofficial copies, forks, or redistributed versions are not guaranteed to be accurate, supported, updated, or safe for engineering use.`;
    
    const systemSnapshotText = `==================================================
${PROJECT_IDENTITY.PRODUCT_NAME} — FIELD DIAGNOSTIC REPORT
==================================================
Generated: ${new Date().toISOString()}

[SYSTEM METADATA]
Product:           ${snapshot.product}
Creator:           ${snapshot.creator}
Official Build:    ${snapshot.officialBuild ? 'TRUE' : 'FALSE'}
App Version:       ${snapshot.appVersion}
Schema Version:    ${snapshot.schemaVersion}
Cache Hash/Ver:    ${snapshot.cacheVersion}
Active Module:     ${snapshot.module}
Device ID:         ${typeof window !== 'undefined' ? localStorage.getItem('hadalbore_device_id') || '—' : '—'}

[DEPLOYMENT STATUS]
IndexedDB Engine:  ${snapshot.indexedDbStatus}
Offline Readiness: ${snapshot.offlineReadiness}
Schema Integrity:  ${snapshot.integrityStatus}
Trace Coverage:    ${snapshot.traceCoverage}

[COMPARE QUEUE]
Items in Queue:    ${snapshot.compareQueue.length}
${snapshot.compareQueue.map(item => ` - ID: ${item.id} (${item.module})`).join('\n')}

[SYSTEM LOGS]
Total Entries:     ${snapshot.logs.length}
${snapshot.logs.map(log => `[${log.timestamp}] [${log.level}] ${log.message}`).join('\n')}

==================================================
[OFFICIAL SOURCE WARNING]
${sourceWarningText}
==================================================
`;

    const bundle = {
      product: PROJECT_IDENTITY.PRODUCT_NAME,
      creator: PROJECT_IDENTITY.CREATOR,
      officialBuild: PROJECT_IDENTITY.OFFICIAL_BUILD,
      version: versionJson,
      release_manifest: releaseManifest,
      integritySealHash,
      db_snapshot: dbSnapshot,
      system_snapshot: systemSnapshotText
    };

    const dataStr = JSON.stringify(bundle, null, 2);
    const ver = versionJson.datasetVersion || 'latest';
    this._downloadFile(dataStr, 'application/json', `hadalbore_lab_field_package_v${ver}.json`);
  }

  static _downloadFile(content, mimeType, filename) {
    if (typeof document === 'undefined') return;
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default DiagnosticExport;
