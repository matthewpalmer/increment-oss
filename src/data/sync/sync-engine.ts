import type { SyncEvent, Table } from "../../domain/types";
import type { SyncBus } from "../sync-bus";

export type SyncEnginePatch = 
    | { type: 'upsert', table: Table, rows: any[] }
    | { type: 'delete', table: Table, ids: string[] }

export type SyncEngineHandlerResult = { patches: SyncEnginePatch[], followUps?: SyncEvent[] };

export interface SyncEngine {
    name: string;
    handle: (event: SyncEvent) => Promise<SyncEngineHandlerResult>;
}

export type SyncPatchApplier = (patches: SyncEnginePatch[]) => Promise<void>;

export class SyncRuntime {
    engine: SyncEngine;
    bus: SyncBus;
    apply: SyncPatchApplier;

    constructor(engine: SyncEngine, bus: SyncBus, apply: SyncPatchApplier) {
        this.engine = engine;
        this.bus = bus;
        this.apply = apply;
    }

    start() {
        this.bus.addEventListener(async (event) => {
            const { patches, followUps = [] } = await this.engine.handle(event);

            await this.apply(patches);

            for (let followUp of followUps) {
                await this.bus.dispatchEvent(followUp);
            }

            return {
                applied: patches,
                enqueued: followUps.length,
                completed: (new Date).getTime()
            };
        });
    }
}
