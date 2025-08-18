// This is a stub for a sync engine that simply displays 
// the status of "Offline only".
// 
// In the released version of this app, this engine is a custom
// sync engine for CloudKit to enable syncing with the iOS apps.

import type { SyncEvent } from "../../domain/types";
import type { SyncEngine } from "./sync";

export class OfflineSyncEngine implements SyncEngine {
    name = "offline-only";

    async handleEvent(event: SyncEvent) {
        console.log('OFFLINE SYNC handleEvent', event);
        return event;
    }
}
