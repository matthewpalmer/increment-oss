import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../../test/dbTestUtils';
import { calculateBackoff } from './retry';

describe('retry calculator', () => {
    beforeEach(async () => {
        await resetDb();
    });

    it('calculates retry backoff', async () => {
        const attempt0 = calculateBackoff(0);
        expect(attempt0).toBeGreaterThan(0);
        expect(attempt0).toBeLessThan(1000);

        const attempt1 = calculateBackoff(1);
        expect(attempt1).toBeGreaterThan(1000);
        expect(attempt1).toBeLessThan(2000);

        const attempt2 = calculateBackoff(2);
        expect(attempt2).toBeGreaterThan(2000);
        expect(attempt2).toBeLessThan(3000);

        const attempt3 = calculateBackoff(3);
        expect(attempt3).toBeGreaterThan(4000);
        expect(attempt3).toBeLessThan(5000);

        const attempt4 = calculateBackoff(4);
        expect(attempt4).toBeGreaterThan(8000);
        expect(attempt4).toBeLessThan(10000);

        const attempt5 = calculateBackoff(5);
        expect(attempt5).toBeGreaterThan(16000);
        expect(attempt5).toBeLessThan(20000);

        const attempt6 = calculateBackoff(6);
        expect(attempt6).toBeGreaterThan(30000);
        expect(attempt6).toBeLessThan(40000);
    });
});