import type { TimeBlock } from "../../domain/types";
import { db } from "../persistence/db";

export async function fetchTimeBlocks(
    projectId: string,
    start: Date,
    end: Date
): Promise<TimeBlock[]> {
    const startTs = start.getTime();
    const endTs = end.getTime();

    return db.timeBlocks.where('[projectId+startedAt]')
        .between([projectId, startTs], [projectId, endTs], true, false)
        .toArray();
}
