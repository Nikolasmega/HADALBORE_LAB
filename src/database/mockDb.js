import realDb from '../data/mock-db.json';
import { store } from '../core/State.js';

// Adapt real database to the schema expected by the quality compliance tests
export const mockDb = {
  ...realDb,
  equipment: realDb.standards || [{}],
  fluids: realDb.brines || [{}],
  metadata: { version: "1.3.0" }
};

export const compareQueue = store.getState().compareQueue;
