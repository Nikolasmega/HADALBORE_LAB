import { store } from '../core/State.js';

// Adapt real database to the schema expected by the quality compliance tests
export const mockDb = {
  metadata: { version: "1.3.0" }
};

export function populateMockDb(decryptedDb) {
  Object.assign(mockDb, decryptedDb);
  mockDb.equipment = decryptedDb.standards || [{}];
  mockDb.fluids = decryptedDb.brines || [{}];
  mockDb.wellbore_fluids = decryptedDb.wellbore_fluids || [{}];
}

export const compareQueue = store.getState().compareQueue;
