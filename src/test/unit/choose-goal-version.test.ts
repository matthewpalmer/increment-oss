import { describe, expect, it } from 'vitest';
import { CreateUUID, type GoalVersion } from '../../domain/types';
import { getActiveVersion, getEarliestVersionStartDate } from '../../domain/progress/choose-goal-version';

describe('domain/progress/choose-goal-version', () => {
    const goalVersions: GoalVersion[] = [
        {
            id: CreateUUID(),
            goalId: CreateUUID(),
            target: 3600,
            validFrom: (new Date('2025-08-20')).getTime(),
            validTo: -1,
            unit: 'seconds',
            cadence: 'daily',
            aggregation: 'sum',
            notes: ''
        },
        {
            id: CreateUUID(),
            goalId: CreateUUID(),
            target: 3600,
            validFrom: (new Date('2025-08-15')).getTime(),
            validTo: (new Date('2025-08-20')).getTime(),
            unit: 'seconds',
            cadence: 'daily',
            aggregation: 'sum',
            notes: ''
        },
        {
            id: CreateUUID(),
            goalId: CreateUUID(),
            target: 3600,
            validFrom: (new Date('2025-08-10')).getTime(),
            validTo: (new Date('2025-08-15')).getTime(),
            unit: 'seconds',
            cadence: 'daily',
            aggregation: 'sum',
            notes: ''
        },
        {
            id: CreateUUID(),
            goalId: CreateUUID(),
            target: 3600,
            validFrom: (new Date('2025-08-05')).getTime(),
            validTo: (new Date('2025-08-10')).getTime(),
            unit: 'seconds',
            cadence: 'daily',
            aggregation: 'sum',
            notes: ''
        },
    ]

    it('selects the correct goal version for a given date', () => {
        const actual0 = getActiveVersion(goalVersions, new Date('2025-08-29'));
        expect(actual0?.id).toBe(goalVersions[0].id);

        const actual1 = getActiveVersion(goalVersions, new Date('2025-08-25'));
        expect(actual1?.id).toBe(goalVersions[0].id);

        const actual2 = getActiveVersion(goalVersions, new Date('2025-08-22'));
        expect(actual2?.id).toBe(goalVersions[0].id);

        const actual3 = getActiveVersion(goalVersions, new Date('2025-08-18'));
        expect(actual3?.id).toBe(goalVersions[1].id);

        const actual4 = getActiveVersion(goalVersions, new Date('2025-08-15'));
        expect(actual4?.id).toBe(goalVersions[1].id);
        
        const actual5 = getActiveVersion(goalVersions, new Date('2025-08-11'));
        expect(actual5?.id).toBe(goalVersions[2].id);
        
        const actual6 = getActiveVersion(goalVersions, new Date('2025-08-10'));
        expect(actual6?.id).toBe(goalVersions[2].id);

        const actual7 = getActiveVersion(goalVersions, new Date('2025-08-09'));
        expect(actual7?.id).toBe(goalVersions[3].id);

        const actual8 = getActiveVersion(goalVersions, new Date('2025-08-05'));
        expect(actual8?.id).toBe(goalVersions[3].id);

        // Should fallback to the most recent unending version
        const actual9 = getActiveVersion(goalVersions, new Date('2025-08-01'));
        expect(actual9?.id).toBe(goalVersions[0].id);
    });

    it('gets the earliest start date from the versions list', () => {
        const earliest = getEarliestVersionStartDate(goalVersions);
        expect(earliest?.getTime()).toBe(new Date('2025-08-05').getTime());
    });
});