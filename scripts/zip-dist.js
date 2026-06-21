import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const versionPath = path.resolve(process.cwd(), 'src/data/version.json');
let version = '1.3.0';

try {
  const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  version = versionData.buildVersion || '1.3.0';
} catch (err) {
  console.warn('Warning: Could not read version.json, defaulting version to 1.3.0', err);
}

const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not found at', distDir);
  process.exit(1);
}

const zipName = `HADALBORE_LAB_v${version}.zip`;
const zipPath = path.resolve(process.cwd(), zipName);

// Remove existing zip if any
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log(`Packaging dist/ into ZIP archive: ${zipName}...`);

try {
  // Run native zip command inside dist folder
  execSync(`zip -q -r "${zipPath}" .`, { cwd: distDir });
  
  console.log('====================================');
  console.log('RELEASE PACKAGING ZIP COMPLETED');
  console.log('====================================');
  console.log('Output archive:  ', zipPath);
  console.log('Archive size:     ', fs.statSync(zipPath).size, 'bytes');
  console.log('====================================');
} catch (err) {
  console.error('Error executing zip command:', err);
  process.exit(1);
}
