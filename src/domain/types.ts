import { v4 as uuidv4 } from 'uuid';

export type UUID = string;

export interface Project {
    id: UUID;
    name: string;
}

export type SyncEventType = 'create' | 'update' | 'delete';

export type SyncEvenStatus = 'success' | 'failure' | 'in-progress' | 'waiting';

export const SYNC_EVENT_NOT_STARTED = -1;

export interface SyncEvent {
    id: UUID;
    type: SyncEventType;
    data?: any;
    result?: any;
    addedAt: number;
    startedAt: number;
    completedAt: number;
    status: SyncEvenStatus;
    statusMessage?: string;
    attempts: number;
}

export function BuildNewSyncEvent(args: Pick<SyncEvent, "type" | "data">): SyncEvent {
    return {
        id: CreateUUID(),
        type: args.type,
        data: args.data,
        addedAt: SyncEventTimeNow(),
        startedAt: SYNC_EVENT_NOT_STARTED,
        completedAt: SYNC_EVENT_NOT_STARTED,
        status: 'waiting',
        attempts: 0
    }
}

export function SyncEventTimeNow() {
    return (new Date).getTime();
}

export function CreateUUID(): UUID {
    return uuidv4();
}
