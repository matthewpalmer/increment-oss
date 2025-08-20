import { v4 as uuidv4 } from 'uuid';
import { IncrementDateTimeNow } from './time-utils';

export type UUID = string;
export type IncrementTimestamp = number;
export type IncrementDuration = number;

export const INCREMENT_TIMESTAMP_FOREVER = -1;

export type Table = 'projects' | 'goals' | 'goalVersions' | 'timeBlocks';

export interface Project {
    id: UUID;
    name: string;
    icon?: string;
    color?: string;
}

export interface TimeBlock {
    id: UUID;
    projectId: UUID;
    amount: IncrementDuration;
    createdAt: IncrementTimestamp;
    startedAt: IncrementTimestamp;
    notes: string;
}

type GoalUnit = 'seconds' | 'count' | 'meters';
type GoalCadence = 'daily' | 'weekly' | 'monthly' | 'lifetime';
type GoalAggregation = 'sum' | 'count' | 'max';

export interface Goal {
    id: UUID;
    projectId: UUID;
    name: string;
    color: string;
    createdAt: IncrementTimestamp;
    unit: GoalUnit;
    cadence: GoalCadence;
    aggregation: GoalAggregation;
}

export interface GoalVersion {
    id: UUID;
    goalId: UUID;
    target: number;
    validFrom: IncrementTimestamp;
    validTo: IncrementTimestamp;
    notes: string;
}

export type SyncEventType = 'create' | 'update' | 'delete';

export type SyncEvenStatus = 'pending' | 'in-progress' | 'retry-scheduled' | 'done' | 'failed';

export const SYNC_EVENT_NOT_STARTED = -1;

export interface SyncEvent {
    id: UUID;
    type: SyncEventType;
    table: Table;
    data?: any;
    result?: any;
    addedAt: IncrementTimestamp;
    startedAt: IncrementTimestamp;
    nextAttemptAt: IncrementTimestamp;
    completedAt: IncrementTimestamp;
    status: SyncEvenStatus;
    statusMessage?: string;
    attempts: number;
}

export function BuildNewSyncEvent(args: Pick<SyncEvent, "type" | "data" | "table">): SyncEvent {
    return {
        id: CreateUUID(),
        type: args.type,
        table: args.table,
        data: args.data,
        addedAt: IncrementDateTimeNow(),
        nextAttemptAt: IncrementDateTimeNow(),
        startedAt: SYNC_EVENT_NOT_STARTED,
        completedAt: SYNC_EVENT_NOT_STARTED,
        status: 'pending',
        attempts: 0
    }
}

export function CreateUUID(): UUID {
    return uuidv4();
}

export function DisplayUUID(uuid: UUID): string {
    return uuid.split('-')[0]
}
