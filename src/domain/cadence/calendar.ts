import type { GoalCadence } from "../types";

export interface ProgressWindow { start: Date; end: Date }

export interface Calendar {
    timezoneKey: string;

    startOfDay(date: Date): Date;
    startOfISOWeek(date: Date): Date;
    startOfMonth(date: Date): Date;

    dayOfWeek(date: Date): number;
    dayOfMonth(date: Date): number;
    monthOfYear(date: Date): number;

    addDays(date: Date, numberOfDays: number): Date;
    addMonths(date: Date, numberOfMonths: number): Date;

    now(): Date;

    windowForCadence(cadence: GoalCadence, at: Date, startOfLifetime?: Date): ProgressWindow;


}

export function iterateWindows(
    calendar: Calendar,
    cadence: GoalCadence,
    start: Date,
    end: Date
): ProgressWindow[] {
    const windows: ProgressWindow[] = [];

    let currentWindowStart = calendar.windowForCadence(cadence, start).start;
    const startOfLastWindow = calendar.windowForCadence(cadence, end).start;

    while (currentWindowStart <= startOfLastWindow) {
        const window = calendar.windowForCadence(cadence, currentWindowStart);
        windows.push(window);
        currentWindowStart = window.end;
    }

    return windows;
}
