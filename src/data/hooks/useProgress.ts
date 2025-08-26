import { useQuery } from "@tanstack/react-query";
import { makeCalendar } from "../calendar-context";
import { keys } from "../queries";
import { fetchGoalVersions } from "./fetch-goal-versions";
import { getActiveVersion, getEarliestVersionStartDate } from "../../domain/progress/choose-goal-version";
import { fetchTimeBlocks } from "./fetch-time-blocks";
import { calculateProgressAt } from "../../domain/progress/calculator";
import { aggregateBlocks } from "../../domain/progress/aggregation";
import type { ProgressWindow } from "../../domain/cadence/calendar";
import { bucketBlocksByWindows, evaluateWindows, getGoalVersionForWindows } from "../../domain/progress/windows";
import type { GoalAggregation, GoalUnit } from "../../domain/types";

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

export function useLifetimeProgress(
    projectId: string, 
    at = new Date(), 
    unit: GoalUnit = 'seconds', 
    aggregation: GoalAggregation = 'sum'
) {
    const calendar = makeCalendar();
    const window = calendar.windowForCadence('lifetime', at, new Date(0));

    return useQuery({
        queryKey: keys.progress.projectTotal(projectId, 'lifetime', window.start, calendar.timezoneKey, unit, aggregation),
        staleTime: 30000,
        queryFn: async () => {
            const now = new Date();
            const blocks = await fetchTimeBlocks(projectId, window.start, now);
            const value = aggregateBlocks(blocks, aggregation, unit);
            console.log("LIFETIME PROGRESS UPDATE WITH", value, window.start, now)
            return { window, value }
        }
    })
}

export function useCalendarProgress(projectId: string, goalId: string, at = new Date()) {
    const calendar = makeCalendar();

    return useQuery({
        queryKey: keys.progress.calendar(projectId, calendar.startOfMonth(at), calendar.timezoneKey),
        staleTime: 30000,
        queryFn: async () => {
            const calendarMatrix = buildCalendarMatrix(at)
                .filter(week => week.filter(d => !!d).length > 0);

            const windows: ProgressWindow[] = calendarMatrix
                .map(week => {
                    return week.map(day => {
                        return { start: day.start, end: day.end }
                    })
                })
                .flat();

            const timeBlocks = await fetchTimeBlocks(
                projectId, 
                windows[0].start, 
                windows[windows.length - 1].end
            );

            const goalVersions = await fetchGoalVersions(goalId);

            const bucketedBlocks = bucketBlocksByWindows(calendar, windows, timeBlocks);
            const windowGoalVersions = getGoalVersionForWindows(goalVersions, windows);
            const evaluated = evaluateWindows(windows, bucketedBlocks, windowGoalVersions);
            
            const evaluatedMap = Object.fromEntries(evaluated.map(e => [e.window.start.getTime(), e]));

            const result = calendarMatrix.map(week => {
                return week.map(day => {
                    const found = evaluatedMap[day.start.getTime()]

                    return {
                        day,
                        result: found
                    }
                })
            })

            return result;
        }
    })
}

export interface MonthMatrixEntry {
    isInsideMonth: boolean;
    start: Date;
    end: Date;
}

const buildCalendarMatrix = (dateInMonth: Date) => {
    const calendar = makeCalendar();
    const startOfMonth = calendar.startOfMonth(dateInMonth);
    const nextMonth = calendar.addMonths(startOfMonth, 1);

    let currentDay = startOfMonth;

    let result: (MonthMatrixEntry)[][] = new Array(6).fill(null)
        .map(() => new Array(7).fill(null));


    // Add days before the start of this month
    const startDayOfWeek = calendar.dayOfWeek(startOfMonth);
    for (let i = 0; i < startDayOfWeek; i++) {
        const d = calendar.addDays(startOfMonth, -(startDayOfWeek - i));

        result[0][i] = {
            isInsideMonth: false,
            start: calendar.startOfDay(d),
            end: calendar.addDays(calendar.startOfDay(d), 1)
        }
    }

    // Add days during the month
    let weekOfMonth = 0;
    while (currentDay < nextMonth) {
        const dayOfWeek = calendar.dayOfWeek(currentDay);

        result[weekOfMonth][dayOfWeek] = {
            isInsideMonth: currentDay >= startOfMonth && currentDay < nextMonth,
            start: calendar.startOfDay(currentDay),
            end: calendar.addDays(calendar.startOfDay(currentDay), 1)
        };

        currentDay = calendar.addDays(currentDay, 1);
        if (dayOfWeek === 6) weekOfMonth++;
    }

    // Add days after the end of this month
    const endDayOfWeek = calendar.dayOfWeek(nextMonth);
    for (let i = 6; i >= endDayOfWeek; i--) {
        const d = calendar.addDays(nextMonth, -(endDayOfWeek - i));

        result[weekOfMonth][i] = {
            isInsideMonth: false,
            start: calendar.startOfDay(d),
            end: calendar.addDays(calendar.startOfDay(d), 1)
        }
    }

    return result;
};
