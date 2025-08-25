import { INCREMENT_TIMESTAMP_FOREVER, type GoalVersion } from "../types";

export function getActiveVersion(goalVersions: GoalVersion[], at: Date): GoalVersion | null {
    let bestFit: GoalVersion | null = null;

    for (let goalVersion of goalVersions) {
        const start = new Date(goalVersion.validFrom);
        const end = (goalVersion.validTo !== INCREMENT_TIMESTAMP_FOREVER) 
            ? new Date(goalVersion.validTo) 
            : null;

        let isWithinVersion = false;

        if (end) {
            isWithinVersion = start <= at && at < end;
        } else {
            isWithinVersion = true;
        }

        if (!isWithinVersion) continue;

        if (!bestFit) {
            bestFit = goalVersion;
        } else {
            // In case there is already an overlapping version, choose the version
            // that has the latest start date.
            if (start > new Date(bestFit.validFrom)) {
                bestFit = goalVersion;
            }
        }
    }

    return bestFit;
}

export function getEarliestVersionStartDate(goalVersions: GoalVersion[]): Date | null {
    let firstValidDate: Date | null = null;

    for (let goalVersion of goalVersions) {
        const start = new Date(goalVersion.validFrom);

        if (!firstValidDate) {
            firstValidDate = start;
        } else if (start < firstValidDate) {
            firstValidDate = start;
        }
    }

    return firstValidDate;
}
