import { useQuery } from "@tanstack/react-query";
import { makeCalendar } from "../calendar-context";
import { keys } from "../queries";
import { fetchGoalVersions } from "./fetch-goal-versions";
import { getActiveVersion, getEarliestVersionStartDate } from "../../domain/progress/choose-goal-version";
import { calculateProgressAt, completedGoalTarget, type ProgressResult } from "../../domain/progress/calculator";
import { fetchTimeBlocks } from "./fetch-time-blocks";
import type { GoalVersion } from "../../domain/types";
import type { Calendar } from "../../domain/cadence/calendar";

export function useStreakAt(projectId: string, goalId: string, at: Date) {
    const calendar = makeCalendar();

    return useQuery({
        queryKey: keys.progress.streaks(projectId, goalId, at, calendar.timezoneKey),
        queryFn: async () => {
            const goalVersions = await fetchGoalVersions(goalId);

            
            let currentDate = at;
            
            const streakDays = [];
            let hitTargetToday = await hitTargetOnDay(projectId, goalVersions, currentDate, calendar);

            if (!hitTargetToday) {
                // If we haven't hit the target yet today, start
                // the streak calculation from yesterday.
                currentDate = calendar.addDays(at, -1);
                hitTargetToday = await hitTargetOnDay(projectId, goalVersions, currentDate, calendar);
            }

            while (hitTargetToday) {
                streakDays.push(hitTargetToday);

                currentDate = calendar.addDays(hitTargetToday.progress.window.start, -1);
                hitTargetToday = await hitTargetOnDay(projectId, goalVersions, currentDate, calendar);
            }

            return streakDays;
        },
        staleTime: 30000
    })
}

const hitTargetOnDay = async (
    projectId: string, 
    goalVersions: GoalVersion[], 
    at: Date, 
    calendar: Calendar
): Promise<{ progress: ProgressResult, hitTarget: boolean} | undefined> => {
    const fallbackDate = getEarliestVersionStartDate(goalVersions) || at;
    const activeVersion = getActiveVersion(goalVersions, at);

    if (!activeVersion) {
        return;
    }
    
    const window = activeVersion
            ? calendar.windowForCadence(activeVersion.cadence, at, fallbackDate)
            : calendar.windowForCadence('daily', at);

    const blocks = await fetchTimeBlocks(projectId, window.start, window.end);

    const progress = calculateProgressAt(at, calendar, goalVersions, blocks);
    
    const hitTarget = completedGoalTarget(progress.value, activeVersion);

    if (!hitTarget) {
        return;
    }

    return {
        progress,
        hitTarget
    };
}
