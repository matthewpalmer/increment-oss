import { describe, expect, it } from 'vitest';
import { CreateUUID, type GoalVersion, type TimeBlock } from '../../domain/types';
import { calculateProgressAt } from '../../domain/progress/calculator';
import { makeCalendar } from '../../data/calendar-context';
import { buildTimeBlocks } from '../factories';

describe('domain/progress/calculator', () => {
    it('calculates progress on a single day', async () => {
        const calendar = makeCalendar();

        const now = new Date('2025-08-25');

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
            }
        ]

        const timeBlocks: TimeBlock[] = buildTimeBlocks(
            CreateUUID(),
            'seconds',
            [300, 300, 600, 450]
        ).map(tb => {
            return { ...tb, createdAt: now.getTime(), startedAt: now.getTime() }
        })

        const progress = calculateProgressAt(
            now,
            calendar,
            goalVersions,
            timeBlocks
        );

        expect(progress.value).toBe(1650)
        expect(progress.percentage).toBeCloseTo(0.458333)
        expect(progress.target).toBe(3600)
    });

    it('calculates progress across a month', async () => {
        const calendar = makeCalendar();

        const now = new Date('2025-08-25');

        const goalVersions: GoalVersion[] = [
            {
                id: CreateUUID(),
                goalId: CreateUUID(),
                target: 10 * 3600,
                validFrom: (new Date('2025-08-05')).getTime(),
                validTo: -1,
                unit: 'seconds',
                cadence: 'daily',
                aggregation: 'sum',
                notes: ''
            }
        ]

        const timeBlocks: TimeBlock[] = buildTimeBlocks(
            CreateUUID(),
            'seconds',
            [400, 700, 900, 1300, 300, 500, 600]
        );

        timeBlocks[0].createdAt = (new Date('2025-08-05')).getTime();
        timeBlocks[0].startedAt = (new Date('2025-08-05')).getTime();

        timeBlocks[1].createdAt = (new Date('2025-08-06')).getTime();
        timeBlocks[1].startedAt = (new Date('2025-08-06')).getTime();

        timeBlocks[2].createdAt = (new Date('2025-08-07')).getTime();
        timeBlocks[2].startedAt = (new Date('2025-08-07')).getTime();

        timeBlocks[3].createdAt = (new Date('2025-08-08')).getTime();
        timeBlocks[3].startedAt = (new Date('2025-08-08')).getTime();

        timeBlocks[4].createdAt = (new Date('2025-08-09')).getTime();
        timeBlocks[4].startedAt = (new Date('2025-08-09')).getTime();

        timeBlocks[5].createdAt = (new Date('2025-08-10')).getTime();
        timeBlocks[5].startedAt = (new Date('2025-08-10')).getTime();

        timeBlocks[6].createdAt = (new Date('2025-08-11')).getTime();
        timeBlocks[6].startedAt = (new Date('2025-08-11')).getTime();


        const progress = calculateProgressAt(
            now,
            calendar,
            goalVersions,
            timeBlocks
        );

        expect(progress.value).toBe(4700)
        expect(progress.percentage).toBeCloseTo(0.130555)
        expect(progress.target).toBe(36000);
    });
});