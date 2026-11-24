import Dexie, { type EntityTable } from 'dexie';
import type { SavedCase } from './cases';
let database: (Dexie & { cases: EntityTable<SavedCase, 'id'> }) | undefined;
export function getDatabase() {
  if (!database) {
    database = new Dexie('hermes-trutine-laboratory') as Dexie & { cases: EntityTable<SavedCase, 'id'> };
    database.version(1).stores({ cases: 'id, updatedAt, name' });
  }
  return database;
}
