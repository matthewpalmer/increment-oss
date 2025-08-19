import { IncrementDateTimeNow } from "../domain/time-utils";
import { SYNC_EVENT_NOT_STARTED, type SyncEvent } from "../domain/types";
import { db } from "./persistence/db";

type SyncBusListener = (event: SyncEvent) => Promise<any>

export class SyncBus {
    listeners: SyncBusListener[] = []

    async dispatchEvent(event: SyncEvent) {
        await db.syncEvents.add(event);
        this.processWaitingEvents();
    }

    addEventListener(listener: SyncBusListener) {
        this.listeners.push(listener)
    }

    private async processWaitingEvents() {
        const events = await db.syncEvents
            .where('startedAt')
            .equals(SYNC_EVENT_NOT_STARTED)
            .toArray();
        
        for (let event of events) {
            await db.syncEvents.update(event.id, { 
                startedAt: IncrementDateTimeNow(),
                status: 'in-progress',
                attempts: (event.attempts || 0) + 1
            });

            const updated = await db.syncEvents.get(event.id);

            if (!updated) throw new Error('Invalid event bus state');

            for (let listener of this.listeners) {
                try {
                    const result = await listener(updated);

                    await db.syncEvents.update(event.id, { 
                        completedAt: IncrementDateTimeNow(),
                        status: 'success',
                        result: result
                    });
                } catch (err: any) {
                    await db.syncEvents.update(event.id, { 
                        completedAt: IncrementDateTimeNow(),
                        status: 'failure',
                        result: err,
                        statusMessage: err.message || 'A sync error occcured'
                    });
                }
            }
        }
    }
}

export const syncBus = new SyncBus();
