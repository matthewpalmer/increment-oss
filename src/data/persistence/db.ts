// Dexie schemas & migrations

import Dexie, { type EntityTable } from 'dexie';
import type { DashboardWidget, Goal, GoalVersion, Project, SyncEvent, TimeBlock } from '../../domain/types';

const db = new Dexie('IncrementDatabase') as Dexie & {
    projects: EntityTable<Project, 'id'>;
    syncEvents: EntityTable<SyncEvent, 'id'>;
    timeBlocks: EntityTable<TimeBlock, 'id'>;
    goals: EntityTable<Goal, 'id'>;
    goalVersions: EntityTable<GoalVersion, 'id'>;
    dashboardWidgets: EntityTable<DashboardWidget, 'id'>;
}

db.version(7).stores({
    projects: 'id, name, createdAt',
    syncEvents: 'id, type, completedAt, startedAt, nextAttemptAt',
    timeBlocks: 'id, projectId',
    goals: 'id, projectId',
    goalVersions: 'id, goalId',
    dashboardWidgets: 'id, projectId, goalId, order',
})

export { db };
