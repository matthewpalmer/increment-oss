import type { SyncBus } from "./sync-bus";
import type { InversePatchCalculator, SyncEngine, SyncPatchApplier } from "./sync-engine";
import { IncrementDateTimeNow } from "../../domain/time-utils";

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

            await this.apply(patches);

            for (let followUp of followUps) {
                await this.bus.dispatchEvent(followUp);
            }

            return {
                applied: patches,
                enqueued: followUps.length,
                completed: IncrementDateTimeNow()
            };
        });

        this.bus.addRollbackListener(async (event) => {
            const { patches, followUps = [] } = await this.inverse(event);
            
            // TODO: Refactor this duplicated code if the structure works.
            
            await this.apply(patches);

            for (let followUp of followUps) {
                await this.bus.dispatchEvent(followUp);
            }

            return {
                rolledBack: patches,
                enqueued: followUps.length,
                completed: IncrementDateTimeNow()
            }
        });
    }
}
