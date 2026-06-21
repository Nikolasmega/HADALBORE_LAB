import fs from 'fs';
import path from 'path';

const rootDir = '/Users/niko/Documents/Личное/AI/Antigravity/OmniLab';
const diagramsDir = path.join(rootDir, 'public/assets/diagrams');
const dbPath = path.join(rootDir, 'src/data/mock-db.json');

console.log('Starting SVG CAD Drawing & Diagram audit...');
console.log('=============================================');

let failed = 0;
let passed = 0;
function assertCheck(description, condition) {
  if (condition) {
    console.log(`🟢 [PASS] ${description}`);
    passed++;
  } else {
    console.error(`🔴 [FAIL] ${description}`);
    failed++;
  }
}

try {
  // 1. Gather all diagram IDs referenced in database
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const referencedDiagrams = new Set();
  
  Object.keys(db).forEach(category => {
    const records = db[category] || [];
    records.forEach(rec => {
      if (Array.isArray(rec.diagrams)) {
        rec.diagrams.forEach(d => referencedDiagrams.add(d));
      }
    });
  });

  console.log(`Found ${referencedDiagrams.size} unique diagrams referenced in mock-db.json:`, Array.from(referencedDiagrams));

  // 2. Scan diagram directories
  const folders = fs.readdirSync(diagramsDir).filter(f => {
    return fs.statSync(path.join(diagramsDir, f)).isDirectory();
  });

  let allExist = true;
  let allSvgsValid = true;
  let allAnnotationsValid = true;

  referencedDiagrams.forEach(diagId => {
    // Normalization in DiagramRenderer: folderName = diagramId.replace(/_/g, '-')
    const folderName = diagId.replace(/_/g, '-');
    const folderPath = path.join(diagramsDir, folderName);

    if (!fs.existsSync(folderPath)) {
      console.error(`  - Diagram folder missing: "${folderName}" (referenced as "${diagId}")`);
      allExist = false;
      return;
    }

    // Verify SVG file
    const svgPath = path.join(folderPath, 'diagram.svg');
    if (!fs.existsSync(svgPath)) {
      console.error(`  - SVG file missing: ${path.join(folderName, 'diagram.svg')}`);
      allSvgsValid = false;
    } else {
      const svgContent = fs.readFileSync(svgPath, 'utf8').trim();
      const hasSvgTag = svgContent.startsWith('<svg') || svgContent.includes('<svg');
      const hasCloseSvgTag = svgContent.includes('</svg>');
      if (!hasSvgTag || !hasCloseSvgTag) {
        console.error(`  - Invalid SVG file structure in: ${path.join(folderName, 'diagram.svg')}`);
        allSvgsValid = false;
      }
    }

    // Verify annotations.json if exists
    const annPath = path.join(folderPath, 'annotations.json');
    if (fs.existsSync(annPath)) {
      try {
        const anns = JSON.parse(fs.readFileSync(annPath, 'utf8'));
        if (Array.isArray(anns)) {
          anns.forEach((ann, idx) => {
            const hasX = ann.x !== undefined && typeof ann.x === 'number';
            const hasY = ann.y !== undefined && typeof ann.y === 'number';
            const hasText = !!ann.text;
            
            if (!hasX || !hasY || !hasText) {
              console.error(`  - Invalid annotation structure at index ${idx} in: ${path.join(folderName, 'annotations.json')}`);
              allAnnotationsValid = false;
            } else if (ann.x < 0 || ann.x > 100 || ann.y < 0 || ann.y > 100) {
              console.error(`  - Annotation coordinate out of bounds [0, 100] (x: ${ann.x}, y: ${ann.y}) in: ${path.join(folderName, 'annotations.json')}`);
              allAnnotationsValid = false;
            }
          });
        } else {
          console.error(`  - annotations.json is not an array in: ${folderName}`);
          allAnnotationsValid = false;
        }
      } catch (err) {
        console.error(`  - Failed to parse annotations.json in: ${folderName}`);
        allAnnotationsValid = false;
      }
    }
  });

  assertCheck('Referenced CAD diagram folders existence', allExist);
  assertCheck('SVG files structure validity', allSvgsValid);
  assertCheck('CAD annotations coordinate bounds and formats', allAnnotationsValid);

  console.log('=============================================');
  console.log(`SVG CAD audit summary: passed: ${passed}, failed: ${failed}`);
  process.exit(failed === 0 ? 0 : 1);

} catch (err) {
  console.error('SVG auditor crashed:', err);
  process.exit(1);
}
