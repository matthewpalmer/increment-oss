import { useQuery } from "@tanstack/react-query";
import { makeCalendar } from "../calendar-context";
import { keys } from "../queries";
import { fetchGoalVersions } from "./fetch-goal-versions";
import { getActiveVersion, getEarliestVersionStartDate } from "../../domain/progress/choose-goal-version";
import { fetchTimeBlocks } from "./fetch-time-blocks";
import { calculateProgressAt } from "../../domain/progress/calculator";
import { aggregateBlocks } from "../../domain/progress/aggregation";

export function useProgressForGoalAt(projectId: string, goalId: string, at = new Date()) {
    const calendar = makeCalendar();
    
    return useQuery({
        queryKey: keys.progress.atDate(projectId, goalId, at.getTime(), calendar.timezoneKey),
        staleTime: 30000,
        queryFn: async () => {
            const goalVersions = await fetchGoalVersions(goalId);
            const activeVersion = getActiveVersion(goalVersions, at);
            const fallbackDate = getEarliestVersionStartDate(goalVersions) || at;

            const window = activeVersion
                ? calendar.windowForCadence(activeVersion.cadence, at, fallbackDate)
                : calendar.windowForCadence('daily', at);

            const blocks = await fetchTimeBlocks(projectId, window.start, window.end);
            const result = calculateProgressAt(at, calendar, goalVersions, blocks);
            return result;
        }
    })
}

export function useLifetimeProgress(projectId: string, at = new Date()) {
    const calendar = makeCalendar();
    const window = calendar.windowForCadence('lifetime', at, new Date(0));

    return useQuery({
        queryKey: keys.progress.projectTotal(projectId, 'lifetime', window.start, calendar.timezoneKey),
        staleTime: 30000,
        queryFn: async () => {
            const blocks = await fetchTimeBlocks(projectId, window.start, window.end);
            const seconds = aggregateBlocks(blocks, 'sum', 'seconds');
            return { window, seconds }
        }
    })
}
