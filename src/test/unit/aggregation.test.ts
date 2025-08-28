import { describe, expect, it } from 'vitest';
import { aggregateBlocks } from '../../domain/progress/aggregation';
import { type TimeBlock } from '../../domain/types';
import { buildTimeBlocks } from '../factories';

describe('domain/progress/aggregation', () => {
    it('aggregates blocks for seconds', async () => {
        const blocks: TimeBlock[] = buildTimeBlocks('abc', 'seconds', [
            10,
            30,
            90,
            120,
            40,
            200,
            0,
            50
        ])

        const sum = aggregateBlocks(blocks, 'sum', 'seconds')
        expect(sum).toBe(540)

        const count = aggregateBlocks(blocks, 'count', 'seconds')
        expect(count).toBe(8);

        const max = aggregateBlocks(blocks, 'max', 'seconds')
        expect(max).toBe(200);
    });

    it('aggregates blocks for words', async () => {
        const blocks: TimeBlock[] = buildTimeBlocks('abc', 'words', [
            5000,
            1000,
            2500,
            3000,
            4000,
            2000,
            1000,
            5000
        ])

        const sum = aggregateBlocks(blocks, 'sum', 'words')
        expect(sum).toBe(23500)

        const count = aggregateBlocks(blocks, 'count', 'words')
        expect(count).toBe(8);

        const max = aggregateBlocks(blocks, 'max', 'words')
        expect(max).toBe(5000);
    });

    it('aggregates blocks for counts', async () => {
        const blocks: TimeBlock[] = buildTimeBlocks('abc', 'count', [
            233,
            310,
            1000,
            500,
            1,
            4,
            7,
            10,
            15,
            240,
            300
        ])

        const sum = aggregateBlocks(blocks, 'sum', 'count')
        expect(sum).toBe(2620)

        const count = aggregateBlocks(blocks, 'count', 'count')
        expect(count).toBe(11);

        const max = aggregateBlocks(blocks, 'max', 'count')
        expect(max).toBe(1000);
    });

    it('ignores irrelevant values', async () => {
        const timeBlocks = buildTimeBlocks('abc', 'seconds', [120, 130, 140]);
        const countBlocks = buildTimeBlocks('abc', 'count', [3, 5, 6]);
        const wordBlocks = buildTimeBlocks('abc', 'words', [1000, 2000, 4000]);
        const distanceBlocks = buildTimeBlocks('abc', 'meters', [5000, 10000, 7500]);

        expect(aggregateBlocks(timeBlocks, 'count', 'seconds')).toBe(3)
        expect(aggregateBlocks(timeBlocks, 'count', 'meters')).toBe(0)
        expect(aggregateBlocks(timeBlocks, 'sum', 'count')).toBe(0)
        expect(aggregateBlocks(timeBlocks, 'sum', 'seconds')).toBe(390)

        expect(aggregateBlocks(countBlocks, 'count', 'meters')).toBe(0)
        expect(aggregateBlocks(countBlocks, 'sum', 'count')).toBe(14)

        expect(aggregateBlocks(wordBlocks, 'sum', 'meters')).toBe(0)
        expect(aggregateBlocks(wordBlocks, 'sum', 'words')).toBe(7000)

        expect(aggregateBlocks(distanceBlocks, 'max', 'words')).toBe(0)
        expect(aggregateBlocks(distanceBlocks, 'max', 'meters')).toBe(10000)
    });
});
