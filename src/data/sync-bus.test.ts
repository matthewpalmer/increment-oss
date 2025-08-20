import { beforeEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { resetDb } from '../test/dbTestUtils';
import { SyncBus } from './sync-bus';
import { BuildNewSyncEvent, CreateUUID, type Project, type SyncEvent } from '../domain/types';

import { calculateBackoff } from './sync/retry';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('sync bus', () => {
    beforeEach(async () => {
        await resetDb();

        // TODO: In the future, and if the current tests are flaky,
        // switch to vitest's timer mocks. See the tests for the sync
        // bus scheduler which use these to test timings.

        vi.mock('./sync/retry', () => ({
            calculateBackoff: vi.fn(() => {
                return 1;
            }),
        }));
    });

    it('should distribute events and process rollbacks in a simple run', async () => {
        const syncBus = new SyncBus();
        const events = [];
        const rollbacks = [];

        const project: Project = {
            id: CreateUUID(),
            name: 'Test Project'
        };

        const failedProject: Project = {
            id: 'FAIL',
            name: 'Failed project'
        };

        syncBus.addEventListener(async (event: SyncEvent) => {
            if (event.data.id === failedProject.id) {
                throw new Error('Forced failure');
            }

            events.push(event);
        })

        syncBus.addRollbackListener(async (event: SyncEvent) => {
            rollbacks.push(event);
        })

        await syncBus.dispatchEvent(BuildNewSyncEvent(
            { type: 'create', data: project, table: 'projects' }
        ))

        await waitFor(() => expect(events.length).toBe(1));

        await syncBus.dispatchEvent(BuildNewSyncEvent(
            { type: 'create', data: failedProject, table: 'projects' }
        ))
        
        await waitFor(() => expect(rollbacks.length).toBe(0));
        await waitFor(() => expect(events.length).toBe(1));
        
        // Begin the processing/retry loop, ensuring that 
        // the events list doesn't increase and that the rollbacks
        // list increases after the correct number of retries.
        await syncBus.processWaitingEvents();
        await sleep(10);
        await waitFor(() => expect(events.length).toBe(1));
        await waitFor(() => expect(rollbacks.length).toBe(0));

        await syncBus.processWaitingEvents();
        await sleep(10);
        await waitFor(() => expect(events.length).toBe(1));
        await waitFor(() => expect(rollbacks.length).toBe(0));

        await syncBus.processWaitingEvents();
        await sleep(10);
        await waitFor(() => expect(events.length).toBe(1));
        await waitFor(() => expect(rollbacks.length).toBe(0));

        await syncBus.processWaitingEvents();
        await sleep(100);
        await waitFor(() => expect(rollbacks.length).toBe(0));
        await waitFor(() => expect(events.length).toBe(1));

        // We've had enough failed attempts at processing
        // this event. It should now be rolled back.
        await syncBus.processWaitingEvents();
        await sleep(10);
        await waitFor(() => expect(rollbacks.length).toBe(1));
        await waitFor(() => expect(events.length).toBe(1));
    });

    it('should not have race conditions for multiple buses (i.e. multiple tabs)', async () => {
        const bus1 = new SyncBus();
        const events1 = [];
        const rollbacks1 = [];

        bus1.addEventListener(async (event) => {
            await sleep(100);
            events1.push(event);
        })

        bus1.addRollbackListener(async (event) => {
            rollbacks1.push(event);
        })


        const bus2 = new SyncBus();
        const events2 = [];
        const rollbacks2 = [];

        bus2.addEventListener(async (event) => {
            events2.push(event);
        })

        bus2.addRollbackListener(async (event) => {
            rollbacks2.push(event);
        })

        const project: Project = {
            id: CreateUUID(),
            name: 'Test Project'
        };

        const syncEvent = BuildNewSyncEvent(
            { type: 'create', data: project, table: 'projects' }
        )

        // Start processing event on bus 1.
        // This starts processing that event immediately since
        // dispatchEvent calls processWaitingEvents
        await bus1.dispatchEvent(syncEvent);
        
        // Try to drain events on bus 2
        await bus2.processWaitingEvents();

        await waitFor(() => expect(events1.length).toBe(1));
        await waitFor(() => expect(rollbacks1.length).toBe(0));

        // Event should have been processed on bus 1 but not on bus 2
        // because bus 1 should have obtained exclusivity on that event
        await waitFor(() => expect(events2.length).toBe(0));
        await waitFor(() => expect(rollbacks2.length).toBe(0));

        // Drain events on both buses
        await bus1.processWaitingEvents();
        await bus2.processWaitingEvents();
        await waitFor(() => expect(events1.length).toBe(1));
        await waitFor(() => expect(rollbacks1.length).toBe(0));
        await waitFor(() => expect(events2.length).toBe(0));
        await waitFor(() => expect(rollbacks2.length).toBe(0));
    })
});