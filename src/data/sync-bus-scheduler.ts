import { IncrementDateTimeNow } from "../domain/time-utils";
import { db } from "./persistence/db";
import type { SyncBus } from "./sync-bus";

const SYNC_BUS_SCHEDULER_HEARTBEAT = 15 * 1000;
const SYNC_BUS_SCHEDULER_OFFLINE_POLL = 30 * 1000;

export class SyncBusScheduler {
    bus: SyncBus;
    isProcessing: boolean = false;
    timer: any | null = null;

    constructor(bus: SyncBus) {
        this.bus = bus;
    }

    start() {
        window.addEventListener('online', this.handleOnlineEvent);
        window.addEventListener('offline', this.handleOfflineEvent);

        this.processAndReschedule()
    }

    stop() {
        this.clearTimer();
        window.removeEventListener('online', this.handleOnlineEvent);
        window.removeEventListener('offline', this.handleOfflineEvent);
    }

    private clearTimer() {
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
    }

    private handleOnlineEvent = () => {
        if (this.isProcessing) return;
        this.clearTimer();
        this.processAndReschedule();
    };

    private handleOfflineEvent = () => {
        this.clearTimer();
        this.processAndReschedule();
    };

    private async processAndReschedule() {
        // Process the sync bus and then reschedule
        // for the next shortest retry time.
        if (this.isProcessing) return;

        if (!navigator.onLine) {
            // We are offline -- wait and try again.
            this.scheduleNextRun(this.addJitter(SYNC_BUS_SCHEDULER_OFFLINE_POLL));
            return;
        }

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