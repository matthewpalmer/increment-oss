import { useSyncStatus } from "../../data/hooks/useSyncStatus"

interface SyncStatusDisplayProps {

}

export function SyncStatusDisplay(props: SyncStatusDisplayProps) {
    const status = useSyncStatus();

    return (
        <div>
            <h1>SYNC STATUS</h1>
            <h2>{ status }</h2>
        </div>
    )
}