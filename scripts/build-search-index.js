import fs from 'fs';
import path from 'path';

// 1. Read mock-db.json
const dbPath = path.resolve(process.cwd(), 'src/data/mock-db.json');
if (!fs.existsSync(dbPath)) {
  console.error('Error: mock-db.json not found at', dbPath);
  process.exit(1);
}
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 2. Simple fractions parser mirroring src/utils/search.js
function parseFractions(query) {
  if (!query) return '';
  let normalized = query;
  const mixedFractionRegex = /(\d+)\s*[- ]\s*(\d+)\s*[\/\\]\s*(\d+)/g;
  normalized = normalized.replace(mixedFractionRegex, (match, whole, num, denom) => {
    const w = parseInt(whole, 10);
    const n = parseInt(num, 10);
    const d = parseInt(denom, 10);
    if (d === 0) return match;
    return (w + (n / d)).toFixed(3).replace(/\.?0+$/, '');
  });
  const standaloneFractionRegex = /(?<!\d\s*[- ])\b(\d+)\s*[\/\\]\s*(\d+)\b/g;
  normalized = normalized.replace(standaloneFractionRegex, (match, num, denom) => {
    const n = parseInt(num, 10);
    const d = parseInt(denom, 10);
    if (d === 0) return match;
    return (n / d).toFixed(3).replace(/\.?0+$/, '');
  });
  return normalized;
}

const index = {};

function addToken(token, id) {
  if (!token || typeof token !== 'string') return;
  const t = token.trim().toLowerCase();
  if (t.length < 2) return;
  if (!index[t]) {
    index[t] = [];
  }
  if (!index[t].includes(id)) {
    index[t].push(id);
  }
}

// Tokenize text into words/tokens
function tokenize(text, id) {
  if (!text) return;
  
  // Convert fractions
  const parsed = parseFractions(text);
  
  // Add full phrase
  addToken(parsed, id);
  addToken(text, id);
  
  // Split into words
  const words = parsed.split(/[^a-z0-9а-яё\-.]+/i).filter(Boolean);
  words.forEach(word => {
    addToken(word, id);
    // If it has a dot or dash, also index parts
    if (word.includes('.') || word.includes('-')) {
      word.split(/[.-]/).forEach(part => addToken(part, id));
    }
  });
}

// Traverse all records in db
Object.keys(db).forEach(category => {
  const records = db[category];
  if (!Array.isArray(records)) return;
  
  records.forEach(rec => {
    if (!rec || !rec.id) return;
    const id = rec.id;
    
    // Index ID itself
    addToken(id, id);
    tokenize(id, id);
    
    // Index Name (EN & RU)
    tokenize(rec.name, id);
    tokenize(rec.name_ru, id);
    
    // Index type
    tokenize(rec.type, id);
    tokenize(rec.type_ru, id);
    
    // Index aliases
    if (rec.aliases && Array.isArray(rec.aliases)) {
      rec.aliases.forEach(alias => tokenize(alias, id));
    }
    
    // Index key attributes
    const fieldsToScan = ['grade', 'od', 'connection_type', 'connection_type_ru', 'material', 'material_ru', 'standards'];
    fieldsToScan.forEach(field => {
      const val = rec[field];
      if (typeof val === 'string') {
        tokenize(val, id);
      } else if (Array.isArray(val)) {
        val.forEach(item => {
          if (typeof item === 'string') tokenize(item, id);
        });
      }
    });
  });
});

// Sort index keys and record arrays for determinism
const sortedIndex = {};
Object.keys(index).sort().forEach(key => {
  sortedIndex[key] = index[key].sort();
});

const outputPath = path.resolve(process.cwd(), 'src/data/search-index.json');
fs.writeFileSync(outputPath, JSON.stringify({ index: sortedIndex }, null, 2), 'utf8');
console.log(`Successfully built search index containing ${Object.keys(sortedIndex).length} tokens.`);
