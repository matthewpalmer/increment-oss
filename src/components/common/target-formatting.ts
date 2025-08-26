import type { ProgressResult } from "../../domain/progress/calculator";
import { convertDurationToHoursMinutes } from "../../domain/time-utils";
import { type GoalUnit, type GoalVersion, type IncrementDuration } from "../../domain/types";

export const formatNumber = (
    value: number,
    unit: GoalUnit,
    style: FormatStyle = 'normal'
): string => {
    if (unit === 'seconds') {
        return formatDuration(value);
    }

    if (unit === 'count') {
        if (style === 'short') return `${value}`

        return `${value} times`
    }

    if (unit === 'words') {
        if (style === 'short') return `${value}w`
        return `${value} words`
    }

    if (unit === 'meters') {
        if (value > 1000) {
            return `${Math.round(value / 1000)}km`
        }

        return `${value}m`
    }

    return `${value}`
}

const unitFromProgress = (
    progress: ProgressResult
): GoalUnit => {
    if (!progress.goalVersion) return 'count';
    return progress.goalVersion.unit
}

export type FormatStyle = 'short' | 'normal';

export const formatProgress = (
    progress: ProgressResult,
    style: FormatStyle = 'normal'
): string => {
    return formatNumber(progress.value, unitFromProgress(progress), style)
}

export const formatProgressTarget = (
    progress: ProgressResult
): string => {
    return formatNumber(progress.target || 0, unitFromProgress(progress))
};

export const formatDuration = (duration: IncrementDuration): string => {
    const { hours, minutes } = convertDurationToHoursMinutes(duration);

    if (hours === '0') {
        return `${minutes}m`
    }

    if (minutes === '0') {
        return `${hours}h`
    }

    return `${hours}h ${minutes}m`
}

const TargetUnitsLabel: Record<GoalUnit, string> = {
    'count': 'times',
    'meters': 'meters',
    'words': 'words',
    'seconds': 'seconds'
};

export const formatUnits = (unit: GoalUnit): string => {
    return TargetUnitsLabel[unit]
}

export const targetString = (goalVersion: GoalVersion) => {
    if (goalVersion.unit === 'seconds') {
        return formatDuration(goalVersion.target);
    }

    if (goalVersion.unit === 'count') {
        return `${goalVersion.target} times`
    }

    if (goalVersion.unit === 'meters') {
        return `${goalVersion.target} meters`
    }
};