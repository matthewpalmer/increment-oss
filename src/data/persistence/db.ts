// Dexie schemas & migrations

import Dexie, { type EntityTable } from 'dexie';
import type { Goal, GoalVersion, Project, SyncEvent, TimeBlock } from '../../domain/types';

const db = new Dexie('IncrementDatabase') as Dexie & {
    projects: EntityTable<Project, 'id'>;
    syncEvents: EntityTable<SyncEvent, 'id'>;
    timeBlocks: EntityTable<TimeBlock, 'id'>;
    goals: EntityTable<Goal, 'id'>;
    goalVersions: EntityTable<GoalVersion, 'id'>;
}

db.version(4).stores({
    projects: 'id, name',
    syncEvents: 'id, type, completedAt, startedAt',
    timeBlocks: 'id, projectId',
    goals: 'id, projectId',
    goalVersions: 'id, goalId',
})

export { db };
