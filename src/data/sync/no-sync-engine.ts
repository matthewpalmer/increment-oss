// This is a stub for a sync engine that simply displays 
// the status of "Offline only".
// 
// In the released version of this app, this engine is a custom
// sync engine for CloudKit to enable syncing with the iOS apps.
//
// This engine also simulates sporadic failures to test and demo
// optimistic update and rollback of changes.

import type { SyncEvent } from "../../domain/types";
import type { SyncEngine } from "./sync-engine";

export class OfflineSyncEngine implements SyncEngine {
    name = "offline-only";

    async handle(event: SyncEvent) {
        if (Math.random() < 0.1) {
            console.error('SYNC_ENGINE_DEMO Failing sync handle() for event', event)
            throw new Error('OfflineSyncEngineFailure')
        }

        console.log('OFFLINE SYNC handleEvent', event);

        return {
            patches: [],
            followUps: []
        }
    }
}
