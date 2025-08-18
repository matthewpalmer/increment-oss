import type { SyncEvent } from "../../domain/types";
import type { SyncBus } from "../sync-bus";

export interface SyncEngine {
    name: string;
    handleEvent: (event: SyncEvent) => Promise<any>;
}

export class SyncRuntime {
    engine: SyncEngine;
    bus: SyncBus;

    constructor(engine: SyncEngine, bus: SyncBus) {
        this.engine = engine;
        this.bus = bus;
    }

    start() {
        this.bus.addEventListener(async (event) => {
            const result = await this.engine.handleEvent(event);
            return result;
        });
    }
}
