import { IncrementDateTimeNow } from "../domain/time-utils";
import { db } from "./persistence/db";
import type { SyncBus } from "./sync-bus";

const SYNC_BUS_SCHEDULER_HEARTBEAT = 15 * 1000;

export class SyncBusScheduler {
    bus: SyncBus;
    isProcessing: boolean = false;
    timer: any | null = null; 

    constructor(bus: SyncBus) {
        this.bus = bus;
    }

    start() {
        this.processAndReschedule()

        // TODO: Add online/offline handling
        // TODO: Add tab visible/focus handling
    }

    private async processAndReschedule() {
        // Process the sync bus and then reschedule
        // for the next shortest retry time.
        if (this.isProcessing) return;

        this.isProcessing = true;

        try {
            await this.bus.processWaitingEvents();
            await this.scheduleNextDueProcessing();
        } finally {
            this.isProcessing = false;
        }
    }

    private addJitter(delay: number) {
        return delay + (Math.floor(Math.random() * 0.25 * delay))
    }

    private async scheduleNextDueProcessing() {
        const upcomingEvent = await this.getNextUpcomingEvent();
        
        if (!upcomingEvent) {
            // No upcoming events to base our next run off, instead
            // run it off a heartbeat.
            this.scheduleNextRun(this.addJitter(SYNC_BUS_SCHEDULER_HEARTBEAT));
            return;
        }

        const now = IncrementDateTimeNow();
        const delay = Math.max(100, upcomingEvent.nextAttemptAt - now);
        this.scheduleNextRun(this.addJitter(delay));
    }

    private scheduleNextRun(delay: number) {
        this.timer = setTimeout(() => {
            this.timer = null;
            this.processAndReschedule();
        }, delay);
    }

    private async getNextUpcomingEvent() {
        const now = IncrementDateTimeNow();

        const events = await db.syncEvents
            .where('nextAttemptAt')
            .above(now)
            .and(e => e.status === 'pending' || e.status === 'retry-scheduled')
            .sortBy('nextAttemptAt');

        if (!events || !events.length) return;

        return events[0];
    }
}