import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { resetDb } from '../../test/dbTestUtils';
import { TestQueryClientProvider } from '../../test/TestQueryClientProvider';
import { makeGoal, makeGoalVersion, makeProject, makeTimeBlock } from '../factories';
import { useCalendarProgress, useLifetimeProgress, useProgressForGoalAt } from '../../data/hooks/useProgress';

describe('useProgress hooks', () => {
    beforeEach(async () => {
        await resetDb();
    });

    it('calculates progress for a goal', async () => {
        const project = await makeProject();
        const goal = await makeGoal(project.id)

        await makeGoalVersion(
            goal.id,
            3600,
            new Date('2025-08-01').getTime(),
            -1
        )

        await makeTimeBlock(project.id, 'seconds', 830, {
            createdAt: new Date('2025-08-25').getTime(),
            startedAt: new Date('2025-08-25').getTime(),
        })

        await makeTimeBlock(project.id, 'seconds', 120, {
            createdAt: new Date('2025-08-25').getTime(),
            startedAt: new Date('2025-08-25').getTime(),
        })

        await makeTimeBlock(project.id, 'seconds', 945, {
            createdAt: new Date('2025-08-25').getTime(),
            startedAt: new Date('2025-08-25').getTime(),
        })

        const { result } = renderHook(() => useProgressForGoalAt(
            project.id,
            goal.id,
            new Date('2025-08-25')
        ), { wrapper: TestQueryClientProvider() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toBeDefined();
        expect(result.current.data?.value).toBe(1895);
        expect(result.current.data?.target).toBe(3600);
        expect(result.current.data?.percentage).toBeCloseTo(0.5263888);
    });

    it('calculates lifetime progress for a project', async () => {
        const project = await makeProject();

        await makeTimeBlock(project.id, 'seconds', 3930, {
            createdAt: new Date('2025-08-21').getTime(),
            startedAt: new Date('2025-08-21').getTime(),
        })

        await makeTimeBlock(project.id, 'seconds', 3220, {
            createdAt: new Date('2025-08-23').getTime(),
            startedAt: new Date('2025-08-23').getTime(),
        })

        await makeTimeBlock(project.id, 'seconds', 1945, {
            createdAt: new Date('2025-08-25').getTime(),
            startedAt: new Date('2025-08-25').getTime(),
        })

        const { result } = renderHook(() => useLifetimeProgress(
            project.id,
            new Date('2025-08-29'),
            'seconds',
            'sum'
        ), { wrapper: TestQueryClientProvider() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
        expect(result.current.data?.value).toBe(9095)
    });

    it('calculates calendar progress for a goal', async () => {
        const project = await makeProject();
        const goal = await makeGoal(project.id)

        await makeGoalVersion(
            goal.id,
            3600,
            new Date('2025-08-01').getTime(),
            -1
        )

        await makeTimeBlock(project.id, 'seconds', 3930, {
            createdAt: new Date('2025-08-21').getTime(),
            startedAt: new Date('2025-08-21').getTime(),
        })

        await makeTimeBlock(project.id, 'seconds', 3220, {
            createdAt: new Date('2025-08-23').getTime(),
            startedAt: new Date('2025-08-23').getTime(),
        })

        await makeTimeBlock(project.id, 'seconds', 1945, {
            createdAt: new Date('2025-08-25').getTime(),
            startedAt: new Date('2025-08-25').getTime(),
        })

        const { result } = renderHook(() => useCalendarProgress(
            project.id,
            goal.id,
            new Date('2025-08-25')
        ), { wrapper: TestQueryClientProvider() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
        const cal = result.current.data;
        expect(cal).toBeDefined();

        if (!cal) throw new Error('No calendar');

        expect(cal[0][0].day.isInsideMonth).toBe(false);
        expect(cal[0][6].day.isInsideMonth).toBe(true);
        expect(cal[1][0].day.isInsideMonth).toBe(true);
        expect(cal[1][6].day.isInsideMonth).toBe(true);
        expect(cal[5][0].day.isInsideMonth).toBe(true);
        expect(cal[5][6].day.isInsideMonth).toBe(false);

        expect(cal[4][1].day.start.toISOString()).toBe((new Date('2025-08-25').toISOString()))
        expect(cal[4][1].result.value).toBe(1945);
        expect(cal[4][1].result.hitTarget).toBe(false);

        expect(cal[3][6].day.start.toISOString()).toBe((new Date('2025-08-23').toISOString()))
        expect(cal[3][6].result.value).toBe(3220);
        expect(cal[3][6].result.hitTarget).toBe(false);

        expect(cal[3][4].day.start.toISOString()).toBe((new Date('2025-08-21').toISOString()))
        expect(cal[3][4].result.value).toBe(3930);
        expect(cal[3][4].result.hitTarget).toBe(true);
    })
});
