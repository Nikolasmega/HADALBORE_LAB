/**
 * LibraryValidation.js
 * Industrial quality assurance suite for HADALBORE LAB database references.
 * Verifies schema completeness, translation coverage, search discoverability, and graph connectivity.
 */
import { graph } from './EngineeringGraph.js';
import { searchMockDb } from '../utils/search.js';
import enDict from '../i18n/en.json';
import ruDict from '../i18n/ru.json';
import { IntegritySnapshot } from './IntegritySnapshot.js';
import releaseManifest from '../data/release_manifest.json';
import pwaManifest from '../../public/manifest.json';

export class LibraryValidator {
  /**
   * Run full validation pass on the active database.
   * 
   * @param {Object} db - Active database object.
   * @returns {Object} Validation report metrics and status.
   */
  static validate(db) {
    const report = {
      success: true,
      status: 'PASS',
      totalRecords: 0,
      categoryCounts: {},
      missingMetadataCount: 0,
      missingMetadataPercent: 0,
      brokenLinksCount: 0,
      brokenLinks: [],
      duplicateIdsCount: 0,
      duplicateIds: [],
      missingTranslationsCount: 0,
      missingTranslationsPercent: 0,
      undiscoverableCount: 0,
      undiscoverableList: [],
      traceCoverageCount: 0,
      traceCoveragePercent: 0,
      details: []
    };

    if (!db) {
      report.success = false;
      report.status = 'FAIL';
      report.details.push('Database object is null or undefined.');
      return report;
    }

    // Map of all record IDs in the database for fast existence check
    const allRecordsMap = new Map();
    const idOccurrences = new Map();

    // 1. Scan and register all records
    Object.keys(db).forEach(category => {
      const records = db[category] || [];
      report.categoryCounts[category] = records.length;
      report.totalRecords += records.length;

      records.forEach(rec => {
        if (!rec || !rec.id) return;
        const id = rec.id;
        
        // Track duplicate IDs
        idOccurrences.set(id, (idOccurrences.get(id) || 0) + 1);
        
        allRecordsMap.set(id, { category, record: rec });
      });
    });

    // Register duplicate IDs in report
    idOccurrences.forEach((count, id) => {
      if (count > 1) {
        report.duplicateIdsCount++;
        report.duplicateIds.push(id);
        report.details.push(`Duplicate ID found: "${id}" occurs ${count} times.`);
      }
    });

    // 2. Validate each record individually
    let totalChecks = 0;
    let missingMetadataFields = 0;
    let recordsChecked = 0;
    let translationChecksCount = 0;
    let missingTranslationFields = 0;

    Object.keys(db).forEach(category => {
      const records = db[category] || [];
      
      records.forEach(rec => {
        if (!rec) return;
        recordsChecked++;
        const id = rec.id || 'unknown';

        // A. Missing core fields and evidence
        const coreFields = ['id', 'type', 'name', 'description'];
        coreFields.forEach(field => {
          totalChecks++;
          if (!rec[field] || String(rec[field]).trim() === '' || String(rec[field]).trim() === '—') {
            missingMetadataFields++;
            report.missingMetadataCount++;
            report.details.push(`[${category}] Record "${id}" is missing core field: "${field}"`);
          }
        });

        // Evidence integrity
        const evidenceFields = ['sources', 'confidenceLevel', 'lastUpdated'];
        evidenceFields.forEach(field => {
          totalChecks++;
          const val = rec[field];
          const isEmpty = !val || (Array.isArray(val) && val.length === 0) || String(val).trim() === '' || String(val).trim() === '—';
          if (isEmpty) {
            missingMetadataFields++;
            report.missingMetadataCount++;
            report.details.push(`[${category}] Record "${id}" is missing evidence metadata: "${field}"`);
          }
        });

        // B. Translation Completeness
        // Check database level localized field pairs
        const localizablePairs = [
          ['connection_type', 'connection_type_ru'],
          ['seal_type', 'seal_type_ru'],
          ['material', 'material_ru'],
          ['compatibility', 'compatibility_ru'],
          ['notes', 'notes_ru'],
          ['brine', 'brine_ru'],
          ['reference_type', 'reference_type_ru'],
          ['fluid', 'fluid_ru'],
          ['equipment', 'equipment_ru'],
          ['scope', 'scope_ru'],
          ['category', 'category_ru'],
          ['agent', 'agent_ru'],
          ['degradation_rate', 'degradation_rate_ru'],
          ['mitigation', 'mitigation_ru']
        ];

        localizablePairs.forEach(([enKey, ruKey]) => {
          if (rec[enKey] !== undefined && rec[enKey] !== null && String(rec[enKey]).trim() !== '' && String(rec[enKey]).trim() !== '—') {
            translationChecksCount++;
            const hasRu = rec[ruKey] !== undefined && rec[ruKey] !== null && String(rec[ruKey]).trim() !== '' && String(rec[ruKey]).trim() !== '—';
            if (!hasRu) {
              missingTranslationFields++;
              report.missingTranslationsCount++;
              report.details.push(`[${category}] Record "${id}" is missing Russian translation for "${enKey}" ("${ruKey}" is empty)`);
            }
          }
        });

        // C. Search discoverability check
        // Run search mock db on record ID, name, or aliases
        const searchTokens = [];
        if (rec.name) searchTokens.push(rec.name);
        if (rec.aliases && rec.aliases.length > 0) {
          searchTokens.push(rec.aliases[0]);
        }

        let isDiscoverable = false;

        for (const token of searchTokens) {
          const searchResults = searchMockDb(db, category, token);
          if (searchResults.some(r => r.id === id)) {
            isDiscoverable = true;
            break;
          }
        }

        if (searchTokens.length > 0 && !isDiscoverable) {
          report.undiscoverableCount++;
          report.undiscoverableList.push(id);
          report.details.push(`[${category}] Record "${id}" is undiscoverable via search token "${searchTokens[0]}"`);
        }

        // D. Graph connection check
        const relations = graph.getRelated(id);
        if (relations.size > 0) {
          report.traceCoverageCount++;
        }
      });
    });

    // Compute percentages
    if (recordsChecked > 0) {
      report.missingMetadataPercent = Math.round((report.missingMetadataCount / (recordsChecked * 7)) * 100);
      report.missingTranslationsPercent = Math.round((report.missingTranslationsCount / Math.max(1, translationChecksCount)) * 100);
      report.traceCoveragePercent = Math.round((report.traceCoverageCount / recordsChecked) * 100);
    }

    // 3. Validate graph links (check for dead references)
    graph.adjacencyList.forEach((relationsMap, sourceId) => {
      const sourceExists = allRecordsMap.has(sourceId);
      
      relationsMap.forEach((targetIds, relation) => {
        targetIds.forEach(targetId => {
          const targetExists = allRecordsMap.has(targetId);
          if (!targetExists) {
            report.brokenLinksCount++;
            report.brokenLinks.push({ sourceId, relation, targetId });
            report.details.push(`Broken Link: "${sourceId}" --(${relation})--> "${targetId}" (Target does not exist)`);
          }
          if (!sourceExists) {
            report.brokenLinksCount++;
            report.brokenLinks.push({ sourceId, relation, targetId });
            report.details.push(`Broken Link: "${sourceId}" --(${relation})--> "${targetId}" (Source does not exist)`);
          }
        });
      });
    });

    // 4. Validate localization dictionary sync
    const checkDictionarySync = (enObj, ruObj, path = '') => {
      Object.keys(enObj).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        if (ruObj[key] === undefined) {
          report.missingTranslationsCount++;
          report.details.push(`Dictionary: Key "${currentPath}" exists in en.json but is missing in ru.json`);
        } else if (typeof enObj[key] === 'object' && enObj[key] !== null) {
          checkDictionarySync(enObj[key], ruObj[key], currentPath);
        }
      });
    };
    checkDictionarySync(enDict, ruDict);

    // 4b. Validate Integrity Seal Checksum
    const computedSeal = IntegritySnapshot.computeIntegritySealHash(db);
    const expectedSeal = releaseManifest.integritySealHash;
    if (computedSeal !== expectedSeal) {
      report.details.push(`Integrity Seal Mismatch: active seal "${computedSeal}" does not match release package seal "${expectedSeal}".`);
      report.sealMismatch = true;
    } else {
      report.sealMismatch = false;
    }

    // 4c. Validate Naming & Creator Identity standards (Taboo Checks)
    const hasIdentityViolation = (text) => {
      if (typeof text !== 'string') return false;
      const cleaned = text.replace(/hadalbore_lab/gi, '');
      if (/hadalbore/i.test(cleaned)) {
        return true;
      }
      if (/nikolai/i.test(text)) {
        return true;
      }
      if (/\bnick\b/i.test(text)) {
        return true;
      }
      return false;
    };

    const identityViolationDetails = [];
    const checkObjectForIdentity = (obj, sourceName) => {
      const seen = new WeakSet();
      const walk = (item, path = '') => {
        if (item && typeof item === 'object') {
          if (seen.has(item)) return;
          seen.add(item);
        }
        if (typeof item === 'string') {
          if (hasIdentityViolation(item)) {
            identityViolationDetails.push(`${sourceName} value at "${path}": "${item}" violates naming standards.`);
          }
        } else if (Array.isArray(item)) {
          item.forEach((val, idx) => walk(val, `${path}[${idx}]`));
        } else if (item && typeof item === 'object') {
          Object.keys(item).forEach(key => {
            if (hasIdentityViolation(key)) {
              identityViolationDetails.push(`${sourceName} key at "${path ? path + '.' : ''}${key}" violates naming standards.`);
            }
            walk(item[key], `${path ? path + '.' : ''}${key}`);
          });
        }
      };
      walk(obj);
    };

    checkObjectForIdentity(db, 'Database');
    checkObjectForIdentity(enDict, 'English Dictionary');
    checkObjectForIdentity(ruDict, 'Russian Dictionary');
    checkObjectForIdentity(releaseManifest, 'Release Manifest');
    checkObjectForIdentity(pwaManifest, 'PWA Manifest');

    if (identityViolationDetails.length > 0) {
      report.success = false;
      report.status = 'FAIL — Identity Rule Violation';
      report.details.push(...identityViolationDetails);
      return report;
    }

    // 5. Determine status
    if (report.duplicateIdsCount > 0 || report.brokenLinksCount > 0) {
      report.success = false;
      report.status = 'FAIL';
    } else if (report.missingMetadataCount > 0 || report.missingTranslationsCount > 0 || report.undiscoverableCount > 0 || report.traceCoveragePercent < 90 || report.sealMismatch) {
      report.success = true;
      report.status = 'WARNING';
    } else {
      report.success = true;
      report.status = 'PASS';
    }

    return report;
  }
}

export default LibraryValidator;
