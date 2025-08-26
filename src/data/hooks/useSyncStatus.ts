import { useEffect, useState } from "react";
import { syncBus } from "../sync/sync-bus";
import { type SyncStatus } from "../../domain/types";

export function useSyncStatus() {
    const [status, setStatus] = useState<SyncStatus | null>(null);

    useEffect(() => {
        syncBus.addStatusListener(async (newStatus) => {
            setStatus(newStatus)
        })
    }, [])

    return status;
}
