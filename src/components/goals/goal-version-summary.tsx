import { Text } from "@radix-ui/themes";
import { INCREMENT_TIMESTAMP_FOREVER, type GoalVersion, type IncrementDuration } from "../../domain/types";
import { convertDurationToHoursMinutes, TimestampToLocalDate } from "../../domain/time-utils";

type GoalVersionSummaryPrompts = { goalVersion: GoalVersion }

export const cadenceString = (goalVersion: GoalVersion) => {
    if (goalVersion.cadence === 'daily') return 'per day';
    if (goalVersion.cadence === 'weekly') return 'per week';
    if (goalVersion.cadence === 'monthly') return 'per month';
    if (goalVersion.cadence === 'lifetime') return 'all time';
};

export const formatDuration = (duration: IncrementDuration): string => {
    const { hours, minutes } = convertDurationToHoursMinutes(duration);

    if (hours === '0') {
        return `${minutes}m`
    }

    if (minutes === '0') {
        return `${hours}h`
    }

    return `${hours}h ${minutes}min`
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

const periodString = (goalVersion: GoalVersion) => {
    const from = TimestampToLocalDate(goalVersion.validFrom);
    const to = goalVersion.validTo === INCREMENT_TIMESTAMP_FOREVER
        ? 'Now'
        : TimestampToLocalDate(goalVersion.validTo);

    return `${from} – ${to}`
};

export function GoalVersionSummary(props: GoalVersionSummaryPrompts) {
    const target = targetString(props.goalVersion);
    const cadence = cadenceString(props.goalVersion);
    const period = periodString(props.goalVersion);

    return (
        <Text>
            {target} {cadence} ({period})
        </Text>
    )
}
