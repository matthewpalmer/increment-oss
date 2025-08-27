import type { SyncBus } from "./sync-bus";
import type { InversePatchCalculator, SyncEngine, SyncEnginePatch, SyncPatchApplier } from "./sync-engine";
import { IncrementDateTimeNow } from "../../domain/time-utils";
import type { SyncEvent } from "../../domain/types";

export class SyncRuntime {
    engine: SyncEngine;
    bus: SyncBus;
    apply: SyncPatchApplier;
    inverse: InversePatchCalculator;

    constructor(engine: SyncEngine, bus: SyncBus, apply: SyncPatchApplier, inverse: InversePatchCalculator) {
        this.engine = engine;
        this.bus = bus;
        this.apply = apply;
        this.inverse = inverse;
    }

    start() {
        this.bus.addEventListener(async (event) => {
            const { patches, followUps = [] } = await this.engine.handle(event);
            await this.applyAndDispatch(patches, followUps);
        });

        this.bus.addRollbackListener(async (event) => {
            const { patches, followUps = [] } = await this.inverse(event);
            await this.applyAndDispatch(patches, followUps);
        });
    }

    stop() {
        this.bus.removeEventListener();
        this.bus.removeRollbackListener();
        this.bus.removeStatusListener();
    }

    private async applyAndDispatch(patches: SyncEnginePatch[], followUps: SyncEvent[]) {
        await this.apply(patches);

        for (let followUp of followUps) {
            await this.bus.dispatchEvent(followUp);
        }

        return {
            applied: patches,
            enqueued: followUps.length,
            completed: IncrementDateTimeNow()
        };
    }
}
