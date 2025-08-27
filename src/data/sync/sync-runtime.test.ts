import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDb } from '../../test/dbTestUtils';
import type { InversePatchCalculator, SyncEngine, SyncEngineHandlerResult, SyncEnginePatch, SyncPatchApplier } from './sync-engine';
import { BuildNewSyncEvent, type SyncEvent } from '../../domain/types';
import { SyncBus } from './sync-bus';
import { SyncRuntime } from './sync-runtime';

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

    afterEach(() => {
        vi.useRealTimers();
    })

    it('sets up the sync runtime', async () => {
        const syncRuntime = new SyncRuntime(
            syncEngine,
            syncBus,
            stubPatchApplier,
            stubInverse
        );

        syncRuntime.start();

        expect(syncEngine.events.length).toBe(0);

        // When an event is added to the sync bus, it's processed 
        // and delivered to the sync engine. The sync engine 
        // patches are applied.
        
        vi.useFakeTimers();

        syncBus.dispatchEvent(BuildNewSyncEvent({
            type: 'create',
            data: {
                test: 'data'
            },
            table: 'projects'
        }))

        await vi.runAllTimersAsync();
        expect(syncEngine.events.length).toBe(1)
    });

    it('handles rollbacks after sync failure', async () => {
        const syncRuntime = new SyncRuntime(
            syncEngine,
            syncBus,
            stubPatchApplier,
            stubInverse
        );

        syncRuntime.start();

        expect(syncEngine.events.length).toBe(0);

        syncEngine.throwSyncFailure = true;

        const syncEvent = BuildNewSyncEvent({
            type: 'create',
            data: {
                test: 'fail to create'
            },
            table: 'projects'
        })

        vi.useFakeTimers();

        // This fails immediately, and schedules a retry for ~1s
        syncBus.dispatchEvent(syncEvent);

        await vi.advanceTimersByTimeAsync(1300);
        syncBus.processWaitingEvents();
        await vi.runAllTimersAsync();

        // Next retry in ~2s
        await vi.advanceTimersByTimeAsync(2500);
        syncBus.processWaitingEvents();
        await vi.runAllTimersAsync();

        // Next retry in ~4s
        await vi.advanceTimersByTimeAsync(5500);
        syncBus.processWaitingEvents();
        await vi.runAllTimersAsync();

        // Next retry in ~8s
        await vi.advanceTimersByTimeAsync(14000);
        syncBus.processWaitingEvents();
        await vi.runAllTimersAsync();

        expect(syncEngine.events.length).toBe(5);
        expect(inverseCallEvent).toBeDefined();
        expect(inverseCallEvent.id).toBe(syncEvent.id);        
        expect(inverseCallEvent.status).toBe('failed');
        expect(inverseCallEvent.attempts).toBe(5);
    });
});