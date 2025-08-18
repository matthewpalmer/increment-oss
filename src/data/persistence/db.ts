// Dexie schemas & migrations (no React)

import Dexie, { type EntityTable } from 'dexie';
import type { Project, SyncEvent } from '../../domain/types';

const db = new Dexie('IncrementDatabase') as Dexie & {
    projects: EntityTable<Project, 'id'>;
    syncEvents: EntityTable<SyncEvent, 'id'>;
}

db.version(1).stores({
    projects: 'id, name'
})

db.version(2).stores({
    projects: 'id, name',
    syncEvents: 'id, type, completedAt, startedAt'
})

export { db };
