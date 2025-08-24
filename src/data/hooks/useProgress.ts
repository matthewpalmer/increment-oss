import { useQuery } from "@tanstack/react-query";
import { makeCalendar } from "../calendar-context";
import { keys } from "../queries";
import { fetchGoalVersions } from "./fetch-goal-versions";
import { getActiveVersion, getEarliestVersionStartDate } from "../../domain/progress/choose-goal-version";
import { fetchTimeBlocks } from "./fetch-time-blocks";
import { calculateProgressAt } from "../../domain/progress/calculator";

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