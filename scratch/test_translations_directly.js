import { translateDbText } from '../src/utils/databaseTranslator.js';
import mockDb from '../src/data/mock-db.json' assert { type: 'json' };
import { alignRecordToStandard } from '../src/utils/standardAligner.js';

console.log('Testing advantage translation:');
const advantage = "Controlled yield strength for mild sour service";
console.log('Original:', advantage);
console.log('Translated (ru):', translateDbText(advantage, 'ru'));

console.log('\nTesting alignRecordToStandard for L80 record:');
// Let's find an L80 record
const l80Rec = mockDb.tubulars.find(t => t.name.toLowerCase().includes('l80'));
if (l80Rec) {
  console.log('Found L80 record:', l80Rec.name);
  const profile = alignRecordToStandard(l80Rec);
  console.log('Profile:', profile);
  console.log('apiReference translated:', translateDbText(profile.apiReference, 'ru'));
  console.log('isoReference translated:', translateDbText(profile.isoReference, 'ru'));
  console.log('materialClass translated:', translateDbText(profile.materialClass, 'ru'));
  console.log('serviceEnvironment translated:', translateDbText(profile.serviceEnvironment, 'ru'));
  console.log('envelopeLimits translated:', translateDbText(profile.envelopeLimits, 'ru'));
} else {
  console.log('No L80 record found!');
}
