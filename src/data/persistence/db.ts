// Dexie schemas & migrations (no React)

import Dexie, { type EntityTable } from 'dexie';
import type { Project } from '../../domain/types';

const db = new Dexie('IncrementDatabase') as Dexie & {
    projects: EntityTable<Project, 'id'>;
}

db.version(1).stores({
    projects: 'id, name'
})

export { db };
