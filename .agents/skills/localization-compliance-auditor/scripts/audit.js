import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve(process.cwd(), 'src');
const EN_JSON_PATH = path.resolve(SRC_DIR, 'i18n/en.json');
const RU_JSON_PATH = path.resolve(SRC_DIR, 'i18n/ru.json');

const IGNORED_STRINGS = [
  'RU', 'EN', 'PDF', 'Obsidian', 'FPS', '-- FPS', 'Vite', 'N/A', 'ok', 'OK',
  'cancel', 'Cancel', 'close', 'Close', 'beta', 'Beta', 'TRUE', 'FALSE',
  'calcs', 'guide', 'limits', 'offline', 'mockDb', 'Product', 'Creator',
  'Official Build', 'Official Source Warning', 'Официальный источник',
  'Highlight Diffs', 'Различия', 'Export to Obsidian', 'Экспорт в Obsidian',
  'IndexedDB Status:', 'Service Worker:', 'Dataset Hash:', 'Device ID',
  'Product:', 'Creator:', 'Official Build:', 'Hadalbore QA Live Auditor',
  'Вторая память ИИ:', 'AI Second Memory:', 'Расширение базы данных:', 'Database Expansion:',
  'PPG (US)', 'psi', 'МПа (MPa)', 'API', 'ISO', 'ГОСТ', 'NACE',
  '-- cP', 'Flow index (n):', '--', 'Consistency (K):', '-- eq. cP', 'Bingham', 'H-B',
  '-- SG', '-- kg', '-- L', 'Engineering Calculation Sheet', 'Niko Y',
  'levenshteinDistance(word, token)', 'levenshteinDistance', 'Fann'
];

const IGNORED_ORPHAN_PREFIXES = [
  'nav.', 'modules.', 'columns.', 'filters.', 'validation.', 'run_notes.',
  'calculations.', 'elastomer_card.', 'failures.', 'acid.',
  'failures_library.', 'failures_detail.', 'tally_', 'disp_', 'thermal_', 'hook_',
  'compare_', 'about_', 'lang_', 'units_', 'theme_'
];

// Helper to walk directory
function walkDir(dir, filterFn) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath, filterFn));
    } else if (filterFn(filePath)) {
      results.push(filePath);
    }
  });
  return results;
}

// Find duplicate keys in a raw JSON string using a stack-based parser
function findDuplicateKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const duplicates = [];
  const stack = [new Set()];
  
  // Tokenizer to track braces and keys
  const tokenRegex = /({|}|"([^"\\]*(?:\\.[^"\\]*)*)"\s*:)/g;
  let match;
  while ((match = tokenRegex.exec(content)) !== null) {
    if (match[1] === '{') {
      stack.push(new Set());
    } else if (match[1] === '}') {
      stack.pop();
    } else {
      const key = match[2];
      const currentLevel = stack[stack.length - 1];
      if (currentLevel) {
        if (currentLevel.has(key)) {
          duplicates.push(key);
        } else {
          currentLevel.add(key);
        }
      }
    }
  }
  return duplicates;
}

// Flatten nested JSON translation structures
function flattenObject(obj, prefix = '') {
  let results = {};
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      const newKey = prefix ? `${prefix}.${k}` : k;
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(results, flattenObject(obj[k], newKey));
      } else {
        results[newKey] = obj[k];
      }
    }
  }
  return results;
}

function runAudit() {
  console.log('==================================================');
  console.log('RUNNING LOCALIZATION COMPLIANCE AUDIT...');
  console.log('==================================================\n');

  const criticalIssues = [];
  const warnings = [];
  let totalChecks = 0;

  // 1. Load and parse translation files
  let enData = {};
  let ruData = {};

  try {
    enData = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf8'));
    ruData = JSON.parse(fs.readFileSync(RU_JSON_PATH, 'utf8'));
  } catch (err) {
    criticalIssues.push({
      filePath: 'src/i18n/',
      lineNumber: 0,
      type: 'JSON_PARSE_ERROR',
      text: err.message,
      fix: 'Fix syntax error in translation JSON files.'
    });
  }

  // 2. Detect duplicate keys (using parser stack)
  const enDuplicates = findDuplicateKeys(EN_JSON_PATH);
  enDuplicates.forEach(key => {
    criticalIssues.push({
      filePath: 'src/i18n/en.json',
      lineNumber: 1,
      type: 'DUPLICATE_KEY',
      text: `Duplicate key: "${key}"`,
      fix: `Remove duplicate entry for "${key}" in en.json.`
    });
  });

  const ruDuplicates = findDuplicateKeys(RU_JSON_PATH);
  ruDuplicates.forEach(key => {
    criticalIssues.push({
      filePath: 'src/i18n/ru.json',
      lineNumber: 1,
      type: 'DUPLICATE_KEY',
      text: `Duplicate key: "${key}"`,
      fix: `Remove duplicate entry for "${key}" in ru.json.`
    });
  });

  // 3. Flatten keys and check for mismatches
  const enFlat = flattenObject(enData);
  const ruFlat = flattenObject(ruData);
  const enKeys = Object.keys(enFlat);
  const ruKeys = Object.keys(ruFlat);

  enKeys.forEach(key => {
    totalChecks++;
    if (!ruKeys.includes(key)) {
      criticalIssues.push({
        filePath: 'src/i18n/ru.json',
        lineNumber: 1,
        type: 'MISSING_KEY',
        text: `Key "${key}" is defined in en.json but missing in ru.json`,
        fix: `Add "${key}" to ru.json.`
      });
    }
  });

  ruKeys.forEach(key => {
    totalChecks++;
    if (!enKeys.includes(key)) {
      criticalIssues.push({
        filePath: 'src/i18n/en.json',
        lineNumber: 1,
        type: 'MISSING_KEY',
        text: `Key "${key}" is defined in ru.json but missing in en.json`,
        fix: `Add "${key}" to en.json.`
      });
    }
  });

  // 4. Scan codebase for hardcoded text and used keys
  const jsFiles = walkDir(SRC_DIR, (p) => p.endsWith('.js') && !p.includes('mock-db-encrypted.js'));
  const usedKeys = new Set();

  jsFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineIdx) => {
      totalChecks++;
      const lineNum = lineIdx + 1;

      // Skip comment lines
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

      // Detect t("key") or i18n.t("key") calls
      const tCallRegex = /\bt\(\s*(['"`])([a-zA-Z0-9_.-]+)\1\s*\)/g;
      let tMatch;
      while ((tMatch = tCallRegex.exec(line)) !== null) {
        const key = tMatch[2];
        usedKeys.add(key);

        // Verify key exists in JSON files
        if (!enKeys.includes(key) || !ruKeys.includes(key)) {
          criticalIssues.push({
            filePath: relativePath,
            lineNumber: lineNum,
            type: 'UNDEFINED_I18N_KEY',
            text: `t("${key}") references undefined key in translation files`,
            fix: `Define key "${key}" in en.json and ru.json.`
          });
        }
      }

      // Detect hardcoded key-value pairs (e.g., label: "Tubulars")
      const forbiddenPropertyRegex = /\b(title|label|button|placeholder|tooltip|error|notification|heading)\s*:\s*(['"`])([a-zA-Zа-яА-ЯёЁ\s:!?-]{2,})\2/g;
      let propMatch;
      while ((propMatch = forbiddenPropertyRegex.exec(line)) !== null) {
        const prop = propMatch[1];
        const val = propMatch[3].trim();
        
        // Skip ignored strings
        if (IGNORED_STRINGS.includes(val)) continue;

        criticalIssues.push({
          filePath: relativePath,
          lineNumber: lineNum,
          type: 'HARDCODED_PROPERTY',
          text: `Forbidden hardcoded property: "${prop}: ${val}"`,
          fix: `Replace hardcoded text "${val}" with a t("...") translation call.`
        });
      }

      // Detect plain text between HTML tags in JS files
      const htmlTextRegex = />\s*([a-zA-Zа-яА-ЯёЁ\s,.:!?()-]{2,})\s*</g;
      let htmlMatch;
      while ((htmlMatch = htmlTextRegex.exec(line)) !== null) {
        const text = htmlMatch[1].trim();
        
        // Skip common false-positives
        if (text === '' || text === '—' || text === '-' || text.startsWith('$') || text.includes('VITE_') || text === 'N/A') continue;
        if (IGNORED_STRINGS.includes(text)) continue;

        criticalIssues.push({
          filePath: relativePath,
          lineNumber: lineNum,
          type: 'HARDCODED_HTML_TEXT',
          text: `Forbidden hardcoded text inside HTML tags: "${text}"`,
          fix: `Replace hardcoded text "${text}" with a \${t("...")} translation template.`
        });
      }
    });
  });

  // 5. Detect Orphan keys
  enKeys.forEach(key => {
    // Exclude special dynamic keys or prefixes
    const isIgnored = IGNORED_ORPHAN_PREFIXES.some(prefix => key.startsWith(prefix));
    if (isIgnored) return;

    if (!usedKeys.has(key)) {
      warnings.push({
        filePath: 'src/i18n/en.json',
        lineNumber: 1,
        type: 'ORPHAN_KEY',
        text: `Orphan key: "${key}" is defined but never called in code`,
        fix: `Remove "${key}" from en.json and ru.json if it is no longer used.`
      });
    }
  });

  // 6. Calculate compliance score (based on critical issues)
  const criticalCount = criticalIssues.length;
  const complianceScore = Math.max(0, 100 - (criticalCount * 5.0));

  // 7. Output report
  if (criticalCount > 0 || warnings.length > 0) {
    console.log('--------------------------------------------------');
    console.log('AUDIT REPORT: ISSUES DETECTED');
    console.log('--------------------------------------------------');
    criticalIssues.forEach(issue => {
      console.log(`[CRITICAL] [${issue.type}] File: ${issue.filePath}:${issue.lineNumber}`);
      console.log(`  Detected: "${issue.text}"`);
      console.log(`  Fix:      ${issue.fix}`);
      console.log();
    });

    warnings.forEach(warn => {
      console.log(`[WARNING] [${warn.type}] File: ${warn.filePath}:${warn.lineNumber}`);
      console.log(`  Detected: "${warn.text}"`);
      console.log(`  Fix:      ${warn.fix}`);
      console.log();
    });
  } else {
    console.log('✅ Localization compliance validation passed with NO issues!');
  }

  console.log('--------------------------------------------------');
  console.log(`Localization Compliance Score: ${complianceScore.toFixed(1)}%`);
  console.log(`Total Checks Executed:        ${totalChecks}`);
  console.log(`Total Critical Violations:    ${criticalCount}`);
  console.log(`Total Warnings (Orphans):     ${warnings.length}`);
  console.log('--------------------------------------------------\n');

  if (complianceScore < 100) {
    console.error('❌ Build check failed: Localization compliance is below the 100% target.');
    process.exit(1);
  } else {
    console.log('🚀 Build check passed successfully.');
    process.exit(0);
  }
}

runAudit();
