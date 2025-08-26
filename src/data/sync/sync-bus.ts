import { IncrementDateTimeNow } from "../../domain/time-utils";
import { SYNC_EVENT_NOT_STARTED, type SyncEvent, type SyncStatus } from "../../domain/types";
import { db } from "../persistence/db";
import { calculateBackoff } from "./retry";

type SyncBusListener = (event: SyncEvent) => Promise<any>
type SyncBusRollbackListener = (event: SyncEvent) => Promise<any>
type SyncStatusListener = (status: SyncStatus)  => Promise<any>

const SYNC_EVENT_MAX_ATTEMPTS = 5;

export class SyncBus {
    private listener?: SyncBusListener
    private rollbackListener?: SyncBusRollbackListener
    private statusListener?: SyncStatusListener

    async dispatchEvent(event: SyncEvent) {
        await db.syncEvents.add(event);
        this.processWaitingEvents();
    }

    addEventListener(listener: SyncBusListener) {
        this.listener = listener;
    }

    addRollbackListener(listener: SyncBusRollbackListener) {
        this.rollbackListener = listener;
    }

    addStatusListener(listener: SyncStatusListener) {
        this.statusListener = listener;
    }

    async processWaitingEvents() {
        const now = IncrementDateTimeNow();

        this.statusListener?.('in-progress');

        const events = await db.syncEvents
            .where('nextAttemptAt')
            .belowOrEqual(now)
            .and(e => e.status === 'pending' || e.status === 'retry-scheduled')
            .toArray();

        let reportStatus: SyncStatus = 'done';

        for (let event of events) {
            // Claim this event in Dexie to prevent other tabs from trying to process it.
            const claimed = await db.transaction('rw', db.syncEvents, async () => {
                const latest = await db.syncEvents.get(event.id);

                if (!latest || latest.startedAt !== SYNC_EVENT_NOT_STARTED) return null;

                await db.syncEvents.update(event.id, {
                    startedAt: IncrementDateTimeNow(),
                    status: 'in-progress'
                })

                return await db.syncEvents.get(event.id);
            });

            if (!claimed) continue;
            if (!this.listener) continue;

            let result: any = null;
            let lastError: any = null;

            try {
                result = await this.listener(claimed);
            } catch (err: any) {
                lastError = err;
            }

            if (!lastError) {
                await db.syncEvents.update(claimed.id, {
                    status: 'done',
                    result: result,
                    completedAt: IncrementDateTimeNow()
                })

                continue;
            }

            // Listener threw an error. Decide if we want to retry after a backoff.
            const failureResult = await db.transaction('rw', db.syncEvents, async () => {
                const latest = await db.syncEvents.get(event.id);
                if (!latest) return;

                const nextAttempt = (latest?.attempts || 0) + 1;
                
                if (nextAttempt >= SYNC_EVENT_MAX_ATTEMPTS) {
                    // Mark as failed then process the rollback outside the transaction
                    await db.syncEvents.update(event.id, {
                        attempts: nextAttempt,
                        status: 'failed',
                        completedAt: IncrementDateTimeNow(),
                        nextAttemptAt: Number.MAX_SAFE_INTEGER,
                        result: lastError
                    })

                    return { 
                        __needsRollback: true,
                        id: latest.id
                    }
                } else {
                    await this.rescheduleEventWithBackoff(latest, nextAttempt, lastError);

                    reportStatus = 'in-progress';
                }
            })

            if (failureResult && failureResult.__needsRollback) {
                const latest = await db.syncEvents.get(failureResult.id)

                if (this.rollbackListener && latest) {
                    await this.rollbackListener(latest);
                }

                reportStatus = 'error';
            }
        }

        this.statusListener?.(reportStatus);
    }

    private async rescheduleEventWithBackoff(event: SyncEvent, attemptCount: number, lastError: any) {
        const backoff = calculateBackoff(attemptCount);

        await db.syncEvents.update(event.id, {
            attempts: attemptCount,
            status: 'retry-scheduled',
            startedAt: SYNC_EVENT_NOT_STARTED,
            nextAttemptAt: IncrementDateTimeNow() + backoff,
            result: lastError
        })
    }
}

export const syncBus = new SyncBus();
