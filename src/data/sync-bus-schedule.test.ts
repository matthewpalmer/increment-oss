import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { resetDb } from '../test/dbTestUtils';
import { SyncBus } from './sync-bus';
import { CreateUUID, SYNC_EVENT_NOT_STARTED, type Project, type SyncEvent } from '../domain/types';

import { SyncBusScheduler } from './sync-bus-scheduler';
import { db } from './persistence/db';
import { IncrementDateTimeNow } from '../domain/time-utils';

function setOnline(value: boolean) {
    Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        get: () => value,
    });
}

describe('sync bus scheduler', () => {
    let syncBus: SyncBus;

    beforeEach(async () => {
        await resetDb();
        setOnline(true);

        syncBus = new SyncBus();

        syncBus.processWaitingEvents = vi.fn(async () => {
            // Mock
        })
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should schedule processing on boot', async () => {
        const project: Project = {
            id: CreateUUID(),
            name: 'My first project'
        };

        const syncBusScheduler = new SyncBusScheduler(syncBus);

        const now = IncrementDateTimeNow();

        const event: SyncEvent = {
            id: CreateUUID(),
            type: 'create',
            table: 'projects',
            data: project,
            result: undefined,
            addedAt: now,
            startedAt: SYNC_EVENT_NOT_STARTED,
            nextAttemptAt: SYNC_EVENT_NOT_STARTED,
            completedAt: SYNC_EVENT_NOT_STARTED,
            status: 'pending',
            statusMessage: undefined,
            attempts: 1,
        };

        await db.syncEvents.add(event);

        vi.useFakeTimers();
        syncBusScheduler.start();
        await vi.runAllTicks();

        expect(syncBus.processWaitingEvents as Mock).toHaveBeenCalledTimes(1)
    });

    it('should schedule a follow up if there are no upcoming events', async () => {
        const project: Project = {
            id: CreateUUID(),
            name: 'My first project'
        };

        const syncBusScheduler = new SyncBusScheduler(syncBus);

        // Add an event to the db that should be processed 100ms
        // from now so that the scheduler plans a run for then.
        const now = IncrementDateTimeNow();

        const event: SyncEvent = {
            id: CreateUUID(),
            type: 'create',
            table: 'projects',
            data: project,
            result: undefined,
            addedAt: now,
            startedAt: SYNC_EVENT_NOT_STARTED,
            nextAttemptAt: SYNC_EVENT_NOT_STARTED,
            completedAt: SYNC_EVENT_NOT_STARTED,
            status: 'pending',
            statusMessage: undefined,
            attempts: 1,
        };

        await db.syncEvents.add(event);

        vi.useFakeTimers();
        syncBusScheduler.start();

        await vi.runAllTicks();
        expect(syncBus.processWaitingEvents as Mock).toHaveBeenCalledTimes(1)

        // Not enough for the heartbeat to trigger
        await vi.advanceTimersByTimeAsync(2000);
        await vi.runAllTicks();
        expect(syncBus.processWaitingEvents as Mock).toHaveBeenCalledTimes(1);

        // Enough time for the heartbeat to pass
        await vi.advanceTimersByTimeAsync(20000);
        await vi.runAllTicks();
        expect(syncBus.processWaitingEvents as Mock).toHaveBeenCalledTimes(2);
    });

    it('should schedule future processing based on upcoming events', async () => {
        const project: Project = {
            id: CreateUUID(),
            name: 'My first project'
        };

        const now = IncrementDateTimeNow();

        const event1: SyncEvent = {
            id: CreateUUID(),
            type: 'create',
            table: 'projects',
            data: project,
            result: undefined,
            addedAt: now,
            startedAt: SYNC_EVENT_NOT_STARTED,
            nextAttemptAt: now + 1000,
            completedAt: SYNC_EVENT_NOT_STARTED,
            status: 'pending',
            statusMessage: undefined,
            attempts: 1,
        };

        const event2: SyncEvent = {
            id: CreateUUID(),
            type: 'create',
            table: 'projects',
            data: project,
            result: undefined,
            addedAt: now,
            startedAt: SYNC_EVENT_NOT_STARTED,
            nextAttemptAt: now + 2000,
            completedAt: SYNC_EVENT_NOT_STARTED,
            status: 'pending',
            statusMessage: undefined,
            attempts: 1,
        };

        await db.syncEvents.add(event1);
        await db.syncEvents.add(event2);

        const syncBusScheduler = new SyncBusScheduler(syncBus);

        vi.useFakeTimers();
        syncBusScheduler.start();

        await vi.runAllTicks();
        expect(syncBus.processWaitingEvents as Mock).toHaveBeenCalledTimes(1)

        // Advance by the amount needed for event1's next attempt to occur
        await vi.advanceTimersByTimeAsync(2000);
        await vi.runAllTicks();
        expect(syncBus.processWaitingEvents as Mock).toHaveBeenCalledTimes(2);

        // Advance by the amount needed for event2's next attempt to occur after
        await vi.advanceTimersByTimeAsync(2000);
        await vi.runAllTicks();
        expect(syncBus.processWaitingEvents as Mock).toHaveBeenCalledTimes(3);
    })

    it('should handle online and offline states', async () => {
        const project: Project = {
            id: CreateUUID(),
            name: 'My first project'
        };

        const syncBusScheduler = new SyncBusScheduler(syncBus);

        const now = IncrementDateTimeNow();

        const event: SyncEvent = {
            id: CreateUUID(),
            type: 'create',
            table: 'projects',
            data: project,
            result: undefined,
            addedAt: now,
            startedAt: SYNC_EVENT_NOT_STARTED,
            nextAttemptAt: SYNC_EVENT_NOT_STARTED,
            completedAt: SYNC_EVENT_NOT_STARTED,
            status: 'pending',
            statusMessage: undefined,
            attempts: 1,
        };

        await db.syncEvents.add(event);

        vi.useFakeTimers();
        setOnline(false);
        window.dispatchEvent(new Event('offline'));

        syncBusScheduler.start();
        await vi.runAllTicks();

        // Don't sync while offline
        expect(syncBus.processWaitingEvents as Mock).toHaveBeenCalledTimes(0)

        // Still offline (testing offline poll wait time)
        await vi.advanceTimersByTimeAsync(45000);
        await vi.runAllTicks();
        expect(syncBus.processWaitingEvents as Mock).toHaveBeenCalledTimes(0)

        // Go online -- immediately should request sync
        setOnline(true);
        window.dispatchEvent(new Event('online'));

        await vi.advanceTimersByTimeAsync(1000);
        await vi.runAllTicks();
        expect(syncBus.processWaitingEvents as Mock).toHaveBeenCalledTimes(1)
    });
});