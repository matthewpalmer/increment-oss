import { SYNC_EVENT_NOT_STARTED, SyncEventTimeNow, type SyncEvent } from "../domain/types";
import { db } from "./persistence/db";

type SyncBusListener = (event: SyncEvent) => Promise<any>

export class SyncBus {
    listeners: SyncBusListener[] = []

    async addEvent(event: SyncEvent) {
        await db.syncEvents.add(event);
        this.distributeEvents();
    }

    addEventListener(listener: SyncBusListener) {
        this.listeners.push(listener)
    }

    async distributeEvents() {
        const events = await db.syncEvents
            .where('startedAt')
            .equals(SYNC_EVENT_NOT_STARTED)
            .toArray();
        
        for (let event of events) {
            await db.syncEvents.update(event.id, { 
                startedAt: SyncEventTimeNow(),
                status: 'in-progress',
                attempts: (event.attempts || 0) + 1
            });

            const updated = await db.syncEvents.get(event.id);

            if (!updated) throw new Error('Invalid event bus state');

            for (let listener of this.listeners) {
                try {
                    const result = await listener(updated);

                    await db.syncEvents.update(event.id, { 
                        completedAt: SyncEventTimeNow(),
                        status: 'success',
                        result: result
                    });
                } catch (err: any) {
                    await db.syncEvents.update(event.id, { 
                        completedAt: SyncEventTimeNow(),
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
