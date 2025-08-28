// This is a fake sync engine used in development for 
// testing the sync engine and UI in various states
// of sync success or sync failure.
//
// You can simulate arbitrary backend changes, set up 
// sync failures, and control syncing. This can be set
// up via the FakeSyncEngine panel in the app.
//
// In production, this app uses a CloudKit sync engine,
// and can also use a REST-based sync engine.

import type { SyncEvent } from "../../domain/types";
import { type SyncEngineHandlerResult, type SyncEngine } from "./sync-engine";

export class FakeSyncEngine implements SyncEngine {
    name = "fake-sync-engine";

    isOffline: boolean = false;
    trapNextEvent: boolean = false;
    trapData?: SyncEngineHandlerResult;
    throwErrorNext?: Error;
    pendingTrapPromise?: Promise<SyncEngineHandlerResult>;
    trappedSyncEvent?: SyncEvent;
    pendingTrapResolve?: (result: SyncEngineHandlerResult) => void;
    pendingTrapReject?: (err: Error) => void;

    async addTrap(trap: any) {
        this.trapNextEvent = true;
    }

    setResultForTrap(result: SyncEngineHandlerResult) {
        this.trapData = result;
    }

    setThrowError(to: Error) {
        this.throwErrorNext = to;
    }

    async resolveTrap() {
        console.log('FakeSyncEngine Trap resolve called for event', this.trappedSyncEvent);
        this.trapNextEvent = false;
        this.trappedSyncEvent = undefined;

        if (!this.pendingTrapResolve || !this.pendingTrapReject) {
            console.log('FakeSyncEngine Trap resolve had no promise');
            return;
        }

        if (this.throwErrorNext) {
            console.log('FakeSyncEngine Trap resolve throwing', this.throwErrorNext)
            this.pendingTrapReject(this.throwErrorNext);
            this.throwErrorNext = undefined;
            this.trapData = undefined;
            this.pendingTrapPromise = undefined;
            return;
        }

        if (!this.trapData) {
            console.log('FakeSyncEngine Trap resolve had no data set');
            
            return this.pendingTrapResolve!({
                patches: [],
                followUps: []
            })
        }

        console.log('FakeSyncEngine Trap resolve with result', this.trapData);
        this.pendingTrapResolve!(this.trapData)

        this.trapData = undefined;
        this.pendingTrapPromise = undefined;
    }

    async handle(event: SyncEvent) {
        if (this.isOffline) {
            throw new Error('FakeSyncEngineOffline')
        }

        if (!this.trapNextEvent) {
            return {
                patches: [],
                followUps: []
            }
        }

        this.pendingTrapPromise = new Promise<SyncEngineHandlerResult>((resolve, reject) => {
            this.trappedSyncEvent = event;
            this.pendingTrapResolve = resolve;
            this.pendingTrapReject= reject;
        });

        return this.pendingTrapPromise;

    }
}

export const fakeSyncEngine = new FakeSyncEngine();
