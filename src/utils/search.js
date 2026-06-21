import searchIndex from '../data/search-index.json';
import { alignRecordToStandard } from './standardAligner.js';
import { deepFreeze } from '../core/LibraryFreezeGuard.js';

// Enforce read-only freeze on search index snapshot
deepFreeze(searchIndex);

const PHRASE_SYNONYMS = {
  '13 chrome': '13cr',
  '13 хром': '13cr',
  'drill pipe': 'sbt',
  'бурильная труба': 'sbt',
  'бурильные трубы': 'sbt',
  'обсадная труба': 'casing',
  'обсадные трубы': 'casing',
  'нкт': 'tubing',
  'нкт трубы': 'tubing'
};

const TOKEN_SYNONYMS = {
  'viton': ['fkm', 'фторкаучук', 'fkm viton', 'elastomer_viton_fkm'],
  'fkm': ['viton', 'фторкаучук', 'elastomer_viton_fkm'],
  'фторкаучук': ['viton', 'fkm', 'elastomer_viton_fkm'],
  'kalrez': ['ffkm', 'перфторкаучук', 'kalres', 'elastomer_kalrez_ffkm'],
  'kalres': ['kalrez', 'ffkm', 'elastomer_kalrez_ffkm'],
  'ffkm': ['kalrez', 'перфторкаучук', 'elastomer_kalrez_ffkm'],
  'tubing': ['nkt', 'нкт', 'tubular'],
  'nkt': ['tubing', 'нкт'],
  'нкт': ['tubing', 'nkt'],
  'casing': ['obsadnaya', 'обсадная', 'tubular'],
  'obsadnaya': ['casing', 'обсадная'],
  'обсадная': ['casing', 'obsadnaya'],
  '13cr': ['13chrome', '13-chrome', 'chrome', 'steel_grade_13cr', 'steel_grade_super_13cr', 'steel_grade_l80_13cr'],
  'super 13cr': ['super 13cr', 'hp2-13cr', 'steel_grade_super_13cr'],
  'p110': ['p-110', 'п-110', 'п110', 'steel_grade_p110'],
  'p-110': ['p110', 'п-110', 'п110', 'steel_grade_p110'],
  'п-110': ['p110', 'p-110', 'п110', 'steel_grade_p110'],
  'q125': ['q-125', 'steel_grade_q125'],
  'sbt': ['drillpipe', 'drill-pipe', 'сбт', 'бурильная', 'tubular'],
  'сбт': ['sbt', 'drillpipe', 'бурильная'],
  'ssc': ['sulfide', 'stress', 'cracking', 'ssc cracking', 'failure_ssc'],
  'hic': ['hydrogen', 'induced', 'cracking', 'failure_hic'],
  'sohic': ['stress', 'oriented', 'hydrogen', 'induced', 'cracking', 'failure_sohic'],
  'vam': ['vam', 'vam top', 'vam 21', 'vam ht', 'blue dopeless', 'thread_vam_top', 'thread_vam_21', 'thread_vam_ht'],
  'hydril': ['hydril', 'ph6', 'cs', 'tenarishydril', 'wedge', 'thread_hydril_ph6', 'thread_hydril_cs', 'thread_hydril_wedge'],
  'duplex': ['22cr', '25cr', 'duplex', 'super duplex', 'steel_grade_duplex', 'steel_grade_25cr'],
  'super duplex': ['25cr', 'super duplex', 'steel_grade_25cr']
};

/**
 * Computes Levenshtein distance between two strings.
 */
export function levenshteinDistance(s, t) {
  if (!s || !t) return 999;
  if (s === t) return 0;
  const d = [];
  const m = s.length;
  const n = t.length;

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return d[m][n];
}

/**
 * Checks if a string property contains a token or matches it within Levenshtein distance 2.
 */
function propertyMatchesTokenTypoTolerant(propVal, token) {
  if (!propVal) return false;
  const valLower = String(propVal).toLowerCase();
  if (valLower.includes(token)) return true;

  if (token.length > 4) {
    const words = valLower.split(/[^a-z0-9а-яё\-]+/i).filter(Boolean);
    return words.some(word => levenshteinDistance(word, token) <= 2);
  }
  return false;
}

export function expandPhraseSynonyms(query) {
  if (!query) return '';
  let q = query.toLowerCase();
  Object.keys(PHRASE_SYNONYMS).forEach(phrase => {
    if (q.includes(phrase)) {
      q = q.replace(new RegExp(phrase, 'g'), PHRASE_SYNONYMS[phrase]);
    }
  });
  return q;
}

/**
 * Utility function to parse fraction queries (e.g. "2-7/8", "2 7/8", "7/8")
 * and convert them to decimals.
 */
export function parseFractions(query) {
  if (!query) return '';

  let normalized = query;

  // Match mixed fractions: "2-7/8", "2 7/8", "2-7\8"
  const mixedFractionRegex = /(\d+)\s*[- ]\s*(\d+)\s*[\/\\]\s*(\d+)/g;
  normalized = normalized.replace(mixedFractionRegex, (match, whole, num, denom) => {
    const w = parseInt(whole, 10);
    const n = parseInt(num, 10);
    const d = parseInt(denom, 10);
    if (d === 0) return match;
    return (w + (n / d)).toFixed(3).replace(/\.?0+$/, ''); // convert e.g. 2.8750 to 2.875
  });

  // Match standalone fractions: "7/8", "1/2" (not preceded by another digit + spacer)
  const standaloneFractionRegex = /(?<!\d\s*[- ])\b(\d+)\s*[\/\\]\s*(\d+)\b/g;
  normalized = normalized.replace(standaloneFractionRegex, (match, num, denom) => {
    const n = parseInt(num, 10);
    const d = parseInt(denom, 10);
    if (d === 0) return match;
    return (n / d).toFixed(3).replace(/\.?0+$/, '');
  });

  return normalized;
}

/**
 * Hybrid Search Engine: Index-First with Property Fallback
 * Resolves search queries using the pre-computed search-index.json and
 * falls back to property scanning when needed to support massive scale.
 */
export function searchMockDb(db, moduleType, query) {
  const records = db[moduleType] || [];
  if (!query) return records;

  const normalizedQuery = parseFractions(expandPhraseSynonyms(query.trim().toLowerCase()));
  const rawTokens = normalizedQuery.split(/\s+/).filter(Boolean);

  if (rawTokens.length === 0) return records;

  // Expand rawTokens with token synonyms
  const tokens = [];
  rawTokens.forEach(t => {
    if (!tokens.includes(t)) tokens.push(t);
    if (TOKEN_SYNONYMS[t]) {
      TOKEN_SYNONYMS[t].forEach(syn => {
        if (!tokens.includes(syn)) tokens.push(syn);
      });
    }
  });

  // 1. INDEX-FIRST: Match tokens against pre-computed search-index (with typo tolerance)
  const matchedIds = new Set();
  const indexMap = searchIndex.index || {};

  tokens.forEach(token => {
    // Direct token lookup
    if (indexMap[token]) {
      indexMap[token].forEach(id => matchedIds.add(id));
    }
    
    // Partial and typo-tolerant lookup on index keys
    Object.keys(indexMap).forEach(key => {
      if (key.includes(token)) {
        indexMap[key].forEach(id => matchedIds.add(id));
      } else if (token.length > 4 && levenshteinDistance(key, token) <= 2) {
        indexMap[key].forEach(id => matchedIds.add(id));
      }
    });
  });

  // Filter records in the active module by matched IDs
  let results = records.filter(record => matchedIds.has(record.id));

  // 2. PROPERTY FALLBACK: Scan elements directly (typo tolerant) if pre-index yields no results or to enrich
  if (results.length === 0) {
    results = records.filter(record => {
      const profile = alignRecordToStandard(record);
      return tokens.every(token => {
        const nameMatch = propertyMatchesTokenTypoTolerant(record.name, token);
        const descMatch = propertyMatchesTokenTypoTolerant(record.description, token);
        
        let aliasesMatch = false;
        if (record.aliases && Array.isArray(record.aliases)) {
          aliasesMatch = record.aliases.some(alias => propertyMatchesTokenTypoTolerant(alias, token));
        }

        let standardsMatch = false;
        if (record.standards && Array.isArray(record.standards)) {
          standardsMatch = record.standards.some(std => propertyMatchesTokenTypoTolerant(std, token));
        }

        let profileMatch = false;
        if (profile) {
          profileMatch = 
            propertyMatchesTokenTypoTolerant(profile.apiReference, token) ||
            propertyMatchesTokenTypoTolerant(profile.isoReference, token) ||
            propertyMatchesTokenTypoTolerant(profile.materialClass, token) ||
            propertyMatchesTokenTypoTolerant(profile.serviceEnvironment, token) ||
            propertyMatchesTokenTypoTolerant(profile.envelopeLimits, token);
        }

        return nameMatch || descMatch || aliasesMatch || standardsMatch || profileMatch;
      });
    });
  } else {
    // Even if there are indexed results, do a standards classification scan to enrich them
    const standardsMatched = records.filter(record => {
      const profile = alignRecordToStandard(record);
      if (!profile) return false;
      return tokens.every(token => {
        return (
          propertyMatchesTokenTypoTolerant(profile.apiReference, token) ||
          propertyMatchesTokenTypoTolerant(profile.isoReference, token) ||
          propertyMatchesTokenTypoTolerant(profile.materialClass, token) ||
          propertyMatchesTokenTypoTolerant(profile.serviceEnvironment, token) ||
          propertyMatchesTokenTypoTolerant(profile.envelopeLimits, token)
        );
      });
    });

    if (standardsMatched.length > 0) {
      const mergedMap = new Map();
      results.forEach(r => mergedMap.set(r.id, r));
      standardsMatched.forEach(r => mergedMap.set(r.id, r));
      results = Array.from(mergedMap.values());
    }
  }

  return results;
}
