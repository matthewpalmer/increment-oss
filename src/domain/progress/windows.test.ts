import { describe, expect, it } from 'vitest';
import { CreateUUID, type TimeBlock } from '../types';
import { makeTimeBlocks } from './progress-test-utils';
import { bucketBlocksByWindows } from './windows';
import { makeCalendar } from '../../data/calendar-context';
import type { ProgressWindow } from '../cadence/calendar';

describe('domain/progress/windows', () => {
    it('buckets time blocks into windows', () => {
        const calendar = makeCalendar();

        const windows: ProgressWindow[] = [
            { start: new Date('2025-08-05'), end: new Date('2025-08-07') },
            { start: new Date('2025-08-08'), end: new Date('2025-08-10') },
            { start: new Date('2025-08-10'), end: new Date('2025-08-12') },
        ]

        const timeBlocks: TimeBlock[] = makeTimeBlocks(
            CreateUUID(),
            'seconds',
            [400, 700, 900, 1300, 300, 500, 600]
        );

        timeBlocks[0].createdAt = (new Date('2025-08-05')).getTime();
        timeBlocks[0].startedAt = (new Date('2025-08-05')).getTime();

        timeBlocks[1].createdAt = (new Date('2025-08-06')).getTime();
        timeBlocks[1].startedAt = (new Date('2025-08-06')).getTime();

        timeBlocks[2].createdAt = (new Date('2025-08-08')).getTime();
        timeBlocks[2].startedAt = (new Date('2025-08-08')).getTime();

        timeBlocks[3].createdAt = (new Date('2025-08-08')).getTime();
        timeBlocks[3].startedAt = (new Date('2025-08-08')).getTime();

        timeBlocks[4].createdAt = (new Date('2025-08-09')).getTime();
        timeBlocks[4].startedAt = (new Date('2025-08-09')).getTime();

        timeBlocks[5].createdAt = (new Date('2025-08-10')).getTime();
        timeBlocks[5].startedAt = (new Date('2025-08-10')).getTime();

        timeBlocks[6].createdAt = (new Date('2025-08-11')).getTime();
        timeBlocks[6].startedAt = (new Date('2025-08-11')).getTime();

        const bucketed = bucketBlocksByWindows(
            calendar,
            windows,
            timeBlocks
        );

        expect(bucketed[0][0]).toBe(timeBlocks[0])
        expect(bucketed[0][1]).toBe(timeBlocks[1])

        expect(bucketed[1][0]).toBe(timeBlocks[2])
        expect(bucketed[1][1]).toBe(timeBlocks[3])
        expect(bucketed[1][2]).toBe(timeBlocks[4])

        expect(bucketed[2][0]).toBe(timeBlocks[5])
        expect(bucketed[2][1]).toBe(timeBlocks[6])
    });
});