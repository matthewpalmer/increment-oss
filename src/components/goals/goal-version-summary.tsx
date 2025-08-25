import { Text } from "@radix-ui/themes";
import { INCREMENT_TIMESTAMP_FOREVER, type GoalVersion, type IncrementDuration } from "../../domain/types";
import { convertDurationToHoursMinutes, TimestampToLocalDate } from "../../domain/time-utils";
import { targetString } from "../common/target-formatting";

type GoalVersionSummaryPrompts = { goalVersion: GoalVersion }

export const cadenceString = (goalVersion: GoalVersion) => {
    if (goalVersion.cadence === 'daily') return 'per day';
    if (goalVersion.cadence === 'weekly') return 'per week';
    if (goalVersion.cadence === 'monthly') return 'per month';
    if (goalVersion.cadence === 'lifetime') return 'all time';
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
