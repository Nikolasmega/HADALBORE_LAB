const fs = require('fs');
const path = require('path');

function logPass(message) {
  console.log(`\x1b[32m🟢 [PASS] ${message}\x1b[0m`);
}

function logFail(message) {
  console.error(`\x1b[31m🔴 [FAIL] ${message}\x1b[0m`);
}

try {
  console.log("Starting Architecture Compliance Check...");
  console.log("========================================");

  const sidebarPath = path.resolve(__dirname, '../src/components/Sidebar.js');
  const homepagePath = path.resolve(__dirname, '../src/components/Homepage.js');
  const quickNavPath = path.resolve(__dirname, '../src/components/FieldQuickAccessBar.js');
  const ruI18nPath = path.resolve(__dirname, '../src/i18n/ru.json');
  const enI18nPath = path.resolve(__dirname, '../src/i18n/en.json');

  // Helper to extract MODULE_NUMBERS
  function extractModuleNumbers(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/MODULE_NUMBERS\s*=\s*\{([\s\S]*?)\}/);
    if (!match) {
      throw new Error(`MODULE_NUMBERS object not found in ${path.basename(filePath)}`);
    }
    const objText = match[1];
    const numbers = {};
    const regex = /['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*['"]?([a-zA-Z0-9_-]+)['"]?/g;
    let m;
    while ((m = regex.exec(objText)) !== null) {
      const val = m[2];
      numbers[m[1]] = isNaN(Number(val)) ? val : Number(val);
    }
    return numbers;
  }

  // 1. Check module numbers consistency
  console.log("Checking module numbers consistency...");
  const sidebarNums = extractModuleNumbers(sidebarPath);
  const homepageNums = extractModuleNumbers(homepagePath);
  const quickNavNums = extractModuleNumbers(quickNavPath);

  // Cross-verify keys
  for (const [key, val] of Object.entries(sidebarNums)) {
    if (homepageNums[key] !== undefined && homepageNums[key] !== val) {
      throw new Error(`Mismatch for module "${key}": Sidebar has ${val}, Homepage has ${homepageNums[key]}`);
    }
    if (quickNavNums[key] !== undefined && quickNavNums[key] !== val) {
      throw new Error(`Mismatch for module "${key}": Sidebar has ${val}, QuickAccessBar has ${quickNavNums[key]}`);
    }
  }
  logPass("Module numbering matches across all navigation components");

  // 2. Check duplicate icons in Sidebar
  console.log("Checking for duplicate navigation icons...");
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  const iconsMatch = sidebarContent.match(/const\s+ICONS\s*=\s*\{([\s\S]*?)\};/);
  if (!iconsMatch) {
    throw new Error("ICONS object not found in Sidebar.js");
  }
  const iconsText = iconsMatch[1];
  const svgMap = {};
  const iconRegex = /([a-zA-Z0-9_-]+)\s*:\s*`([\s\S]*?)`/g;
  let m;
  while ((m = iconRegex.exec(iconsText)) !== null) {
    const key = m[1];
    const svg = m[2].trim().replace(/\s+/g, ' '); // normalize spaces
    if (svgMap[svg]) {
      throw new Error(`Duplicate icon detected in Sidebar.js! Same SVG used for "${svgMap[svg]}" and "${key}"`);
    }
    svgMap[svg] = key;
  }
  logPass("No duplicate icons detected in Sidebar.js");

  // 3. Check translation files keys alignment
  console.log("Checking translation keys alignment...");
  const ru = JSON.parse(fs.readFileSync(ruI18nPath, 'utf8'));
  const en = JSON.parse(fs.readFileSync(enI18nPath, 'utf8'));
  const ruNav = ru.nav || {};
  const enNav = en.nav || {};
  
  const ruKeys = Object.keys(ruNav).sort();
  const enKeys = Object.keys(enNav).sort();
  
  if (JSON.stringify(ruKeys) !== JSON.stringify(enKeys)) {
    throw new Error(`Mismatch in nav translation keys!\nRU keys: ${ruKeys.join(', ')}\nEN keys: ${enKeys.join(', ')}`);
  }
  logPass("Translation keys are perfectly aligned");

  console.log("========================================");
  logPass("All architecture checks completed successfully!");
  process.exit(0);

} catch (err) {
  logFail(err.message);
  process.exit(1);
}
