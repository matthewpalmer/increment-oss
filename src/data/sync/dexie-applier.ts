import { db } from "../persistence/db";
import type { SyncPatchApplier } from "./sync-engine";

export const dexieApplier: SyncPatchApplier = async (patches) => {
    for (let patch of patches) {
        console.log('*** NEED TO APPLY DEXIE PATCH', patch);
        
        // Apply to the Dexie DB

        // Invalid TSQ queries

        
    }
}