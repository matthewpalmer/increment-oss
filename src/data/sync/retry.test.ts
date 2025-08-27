import { beforeEach, describe, expect, it } from 'vitest';
import { resetDb } from '../../test/dbTestUtils';
import { calculateBackoff } from './retry';

describe('retry calculator', () => {
    it('calculates retry backoff', async () => {
        const attempt0 = calculateBackoff(0);
        expect(attempt0).toBeGreaterThanOrEqual(0);
        expect(attempt0).toBeLessThan(1000);

        const attempt1 = calculateBackoff(1);
        expect(attempt1).toBeGreaterThanOrEqual(1000);
        expect(attempt1).toBeLessThan(2000);

        const attempt2 = calculateBackoff(2);
        expect(attempt2).toBeGreaterThanOrEqual(2000);
        expect(attempt2).toBeLessThan(3000);

        const attempt3 = calculateBackoff(3);
        expect(attempt3).toBeGreaterThanOrEqual(4000);
        expect(attempt3).toBeLessThan(5000);

        const attempt4 = calculateBackoff(4);
        expect(attempt4).toBeGreaterThanOrEqual(8000);
        expect(attempt4).toBeLessThan(10000);

        const attempt5 = calculateBackoff(5);
        expect(attempt5).toBeGreaterThanOrEqual(16000);
        expect(attempt5).toBeLessThan(20000);

        const attempt6 = calculateBackoff(6);
        expect(attempt6).toBeGreaterThanOrEqual(30000);
        expect(attempt6).toBeLessThan(40000);
    });
});