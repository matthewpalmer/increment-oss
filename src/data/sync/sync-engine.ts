import { type SyncEvent, type Table } from "../../domain/types";

export interface SyncEngine {
    name: string;
    handle: (event: SyncEvent) => Promise<SyncEngineHandlerResult>;
}

export type SyncEnginePatch = 
    | { type: 'upsert', table: Table, rows: any[] }
    | { type: 'delete', table: Table, ids: string[] }

export type SyncEngineHandlerResult = { patches: SyncEnginePatch[], followUps?: SyncEvent[] };

export type SyncPatchApplier = (patches: SyncEnginePatch[]) => Promise<void>;

export type InversePatchCalculator = (event: SyncEvent) => Promise<SyncEngineHandlerResult>;
