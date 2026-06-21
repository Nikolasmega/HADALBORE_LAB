import { store } from '../core/State.js';

// Adapt real database to the schema expected by the quality compliance tests
export const mockDb = {
  metadata: { version: "1.3.1" }
};

export function populateMockDb(decryptedDb) {
  Object.assign(mockDb, decryptedDb);
  mockDb.equipment = decryptedDb.standards || [{}];
  mockDb.fluids = decryptedDb.brines || [{}];
  mockDb.wellbore_fluids = decryptedDb.wellbore_fluids || [{}];
}

export const compareQueue = store.getState().compareQueue;

export function injectObsidianRecords(notes) {
  notes.forEach(note => {
    if (note.isDatabaseRecord && note.frontmatter && note.frontmatter.type) {
      const type = note.frontmatter.type;
      if (mockDb[type]) {
        const existingIdx = mockDb[type].findIndex(r => r.id === note.id);
        const record = { ...note.frontmatter, id: note.id, _source: 'obsidian', _markdownDescription: note.content };
        if (existingIdx !== -1) {
          mockDb[type][existingIdx] = record;
        } else {
          mockDb[type].push(record);
        }
      }
    }
  });
}
