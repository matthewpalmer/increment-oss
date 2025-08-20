import type { QueryClient } from "@tanstack/react-query";
import type { SyncEvent } from "../../domain/types";
import { db } from "../persistence/db";
import { keys } from "../queries";
import type { InversePatchCalculator, SyncEnginePatch, SyncPatchApplier } from "./sync-engine";

export const createDexieApplier = (queryClient: QueryClient) => {
    const dexieApplier: SyncPatchApplier = async (patches) => {
        for (let patch of patches) {
            console.log('DexieApplier apply', patch);
    
            let dbTable = db[patch.table];
            if (!dbTable) throw new Error('Invalid table');
            
            if (patch.type === 'upsert') {
                // @ts-ignore
                await dbTable.bulkPut(patch.rows);
            } else if (patch.type === 'delete') {
                await dbTable.bulkDelete(patch.ids);
            }
    
            await cacheInvalidator(queryClient, patch);
        }
    }

    return dexieApplier;
}


const cacheInvalidator = async (queryClient: QueryClient, patch: SyncEnginePatch) => {
    console.log('  >>> Running cache invalidation');
    if (patch.table === 'projects') {
        queryClient.invalidateQueries({ queryKey: keys.projects.list() })
    } else if (patch.table === 'goals') {
        // TODO: We can narrow this cache invalidation
        queryClient.invalidateQueries({ queryKey: keys.goals.list() })
    } else if (patch.table === 'timeBlocks') {
        // TODO: We can narrow this cache invalidation
        queryClient.invalidateQueries({ queryKey: keys.timeBlocks.list() })
    } else if (patch.table === 'goalVersions') {
        // TODO: We can narrow this cache invalidation
        queryClient.invalidateQueries({ queryKey: keys.goalVersions.list() })
    }
    console.log('  >>> Cache invalidation finished');
};

export const dexieInverseCalculator: InversePatchCalculator = async (event: SyncEvent) => {
    if (event.type === 'delete') {
        return {
            patches: [
                { type: 'upsert', rows: [event.data], table: event.table }
            ],
            followUps: []
        }
    }

    if (event.type === 'update') {
        return {
            patches: [
                { type: 'upsert', rows: [event.data], table: event.table }
            ]
        }
    }

    if (event.type === 'create') {
        return {
            patches: [
                { type: 'delete', ids: [event.data.id], table: event.table }
            ]
        }
    }

    console.error('Unhandled event type for inverse calculator', event);
    throw new Error('Unhandled event!')
};
