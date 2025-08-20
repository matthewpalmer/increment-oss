import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDb } from '../../test/dbTestUtils';
import type { InversePatchCalculator, SyncEngine, SyncEngineHandlerResult, SyncEnginePatch, SyncPatchApplier } from './sync-engine';
import { BuildNewSyncEvent, type SyncEvent } from '../../domain/types';
import { SyncBus } from '../sync-bus';
import { SyncRuntime } from './sync-runtime';
import { waitFor } from '@testing-library/dom';

import { calculateBackoff } from './retry';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class StubEngine implements SyncEngine {
    name = "stub-engine";

    events: SyncEvent[] = []

    throwSyncFailure: boolean = false; 

    handle: (event: SyncEvent) => Promise<SyncEngineHandlerResult> = async (event) => {
        this.events.push(event);

        if (this.throwSyncFailure) {
            throw new Error('StubEngine sync failure')
        }

        return {
            patches: [],
            followUps: []
        }
    }
}

describe('sync runtime', () => {
    let syncEngine: StubEngine;
    let syncBus: SyncBus;
    let stubPatchApplier: SyncPatchApplier;
    let stubInverse: InversePatchCalculator;
    let inverseCallEvent: any | undefined;

    beforeEach(async () => {
        await resetDb();

        vi.mock('../sync/retry', () => ({
            calculateBackoff: vi.fn(() => {
                return 1;
            }),
        }));

        inverseCallEvent = undefined;
        syncEngine = new StubEngine();
        syncBus = new SyncBus();

        stubPatchApplier = async (patches: SyncEnginePatch[]) => {
            return;
        };

        stubInverse = async (event: SyncEvent) => {
            inverseCallEvent = event;

            return {
                patches: [],
                followUps: []
            }
        }
    });

    it('sets up the sync runtime', async () => {
        const syncRuntime = new SyncRuntime(
            syncEngine,
            syncBus,
            stubPatchApplier,
            stubInverse
        );

        syncRuntime.start();

        await waitFor(() => expect(syncEngine.events.length).toBe(0));

        // When an event is added to the sync bus, it's processed 
        // and delivered to the sync engine. The sync engine 
        // patches are applied.
        await syncBus.dispatchEvent(BuildNewSyncEvent({
            type: 'create',
            data: {
                test: 'data'
            },
            table: 'projects'
        }))

        await waitFor(() => expect(syncEngine.events.length).toBe(1));
    });

    it('handles rollbacks after sync failure', async () => {
        const syncRuntime = new SyncRuntime(
            syncEngine,
            syncBus,
            stubPatchApplier,
            stubInverse
        );

        syncRuntime.start();

        await waitFor(() => expect(syncEngine.events.length).toBe(0));

        syncEngine.throwSyncFailure = true;

        const syncEvent = BuildNewSyncEvent({
            type: 'create',
            data: {
                test: 'data'
            },
            table: 'projects'
        })

        await syncBus.dispatchEvent(syncEvent);

        await waitFor(() => expect(syncEngine.events.length).toBe(1));

        await syncBus.processWaitingEvents();
        await sleep(20);
        await syncBus.processWaitingEvents();
        await sleep(20);
        await syncBus.processWaitingEvents();
        await sleep(20);
        await syncBus.processWaitingEvents();

        expect(inverseCallEvent.id).toBe(syncEvent.id);        
        expect(inverseCallEvent.status).toBe('failed');
        expect(inverseCallEvent.attempts).toBe(5);
    });
});