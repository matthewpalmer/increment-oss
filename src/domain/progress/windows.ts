import type { Calendar, ProgressWindow } from "../cadence/calendar";
import type { GoalVersion, TimeBlock } from "../types";
import { aggregateBlocks } from "./aggregation";
import { getActiveVersion } from "./choose-goal-version";

export function bucketBlocksByWindows(
    calendar: Calendar, 
    windows: ProgressWindow[], 
    blocks: TimeBlock[]
): TimeBlock[][] {
    if (!windows.length) return []

    const result: TimeBlock[][] = windows.map(() => []);
    if (!blocks.length) return result;

    const sorted = [...blocks].sort((a, b) => a.startedAt < b.startedAt ? -1 : 1);

    let currentWindowIndex = 0;

    for (let i = 0; i < sorted.length; i++) {
        const block = sorted[i];
        const blockStartTime = new Date(block.startedAt);

        // Move to the window where this block falls
        while (currentWindowIndex < windows.length && blockStartTime >= windows[currentWindowIndex].end) {
            currentWindowIndex++;
        }

        if (currentWindowIndex >= windows.length) break;

        if (blockStartTime < windows[currentWindowIndex].start) continue;

        if (blockStartTime >= windows[currentWindowIndex].start
            && blockStartTime < windows[currentWindowIndex].end) {
                result[currentWindowIndex].push(block);
        }
    }

    return result;
}

export function getGoalVersionForWindows(
    goalVersions: GoalVersion[],
    windows: ProgressWindow[]
): (GoalVersion | null)[] {
    return windows.map(window => {
        return getActiveVersion(goalVersions, window.start)
    })
}

export interface WindowGoalResult {
    window: ProgressWindow;
    value: number;
    hitTarget: boolean;
    goalVersion?: GoalVersion;
}

export function evaluateWindows(
    windows: ProgressWindow[],
    windowBlocks: TimeBlock[][],
    windowTargets: (GoalVersion | null)[]
): WindowGoalResult[] {
    return windows.map((window, index) => {
        const blocks = windowBlocks[index] || [];
        const goalVersion = windowTargets[index];

        if (!goalVersion) {
            return {
                window: window,
                value: aggregateBlocks(blocks, 'sum', 'seconds'),
                goalVersion: undefined,
                hitTarget: false
            }
        }

        const value = aggregateBlocks(blocks, goalVersion.aggregation, goalVersion.unit);
        const hitTarget = value >= goalVersion.target;

        return {
            window,
            value,
            hitTarget,
            goalVersion
        }
    })
}


