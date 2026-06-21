import mockDb from '../src/data/mock-db.json' assert { type: 'json' };

console.log('Current tubulars in DB:');
mockDb.tubulars.forEach((t, i) => {
  console.log(`${i + 1}. ID: ${t.id} | Name: ${t.name} | OD: ${t.od} | Grade: ${t.grade} | Type: ${t.tubular_type}`);
});
