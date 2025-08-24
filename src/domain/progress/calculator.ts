import type { Calendar, ProgressWindow } from "../cadence/calendar";
import type { GoalVersion, TimeBlock } from "../types";
import { aggregateBlocks } from "./aggregation";
import { getActiveVersion, getEarliestVersionStartDate } from "./choose-goal-version";

export interface ProgressResult {
    value: number;
    target?: number;
    percentage?: number;
    window: ProgressWindow;
    version?: GoalVersion | null;
}

export function calculateProgressAt(
    at: Date,
    calendar: Calendar,
    goalVersions: GoalVersion[],
    blocksInRange: TimeBlock[]
): ProgressResult {
    const version = getActiveVersion(goalVersions, at);

    if (!version) {
        const window = calendar.windowForCadence('daily', at);
        const amount = aggregateBlocks(blocksInRange, 'sum', 'seconds');
        return { value: amount, window, version: null };
    }

    const earliestVersionStart = getEarliestVersionStartDate(goalVersions) || at;
    const window = calendar.windowForCadence(version.cadence, at, earliestVersionStart);
    const amount = aggregateBlocks(blocksInRange, version.aggregation, version.unit);
    const percentage = version.target > 0 ? amount / version.target : undefined;

    return {
        value: amount,
        target: version.target,
        percentage, window, version
    }
}
