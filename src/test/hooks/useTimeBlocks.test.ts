import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { resetDb } from '../../test/dbTestUtils';
import { TestQueryClientProvider } from '../../test/TestQueryClientProvider';
import { CreateUUID } from '../../domain/types';
import { makeTimeBlock, makeTimeBlocks } from '../factories';
import { useCreateTimeBlock, useTimeBlocks } from '../../data/hooks/useTimeBlocks';

describe('useTimeBlocks hooks', () => {
    beforeEach(async () => {
        await resetDb();
    });

    it('lists time blocks', async () => {
        const projectId = CreateUUID();

        await makeTimeBlock(projectId,'seconds', 830, {
            createdAt: new Date('2025-08-01').getTime(),
            startedAt: new Date('2025-08-01').getTime(),
        })

        await makeTimeBlock(projectId,'seconds', 120, {
            createdAt: new Date('2025-07-26').getTime(),
            startedAt: new Date('2025-07-26').getTime(),
        })

        await makeTimeBlock(projectId,'seconds', 945, {
            createdAt: new Date('2025-08-19').getTime(),
            startedAt: new Date('2025-08-19').getTime(),
        })

        const { result } = renderHook(() => useTimeBlocks(projectId), { wrapper: TestQueryClientProvider() });
        
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.length).toBe(3);
        expect((result.current.data || [])[0].amount).toEqual(945);
        expect((result.current.data || [])[1].amount).toEqual(830);
        expect((result.current.data || [])[2].amount).toEqual(120);
    });

    it('adds time blocks', async () => {
        const projectId = CreateUUID();
        const provider = TestQueryClientProvider();

        const { result: list } = renderHook(() => useTimeBlocks(projectId), { wrapper: provider });
        const { result: create } = renderHook(useCreateTimeBlock, { wrapper: provider });

        await waitFor(() => expect(list.current.isSuccess).toBe(true));
        expect(list.current.data?.length).toBe(0);

        await act(async () => {
            await create.current.mutateAsync({
                id: 'tb-1',
                projectId: projectId,
                type: 'seconds',
                amount: 111,
                createdAt: (new Date('2025-08-20').getTime()),
                startedAt: (new Date('2025-08-20').getTime()),
                notes: ''
            })

            await create.current.mutateAsync({
                id: 'tb-2',
                projectId: projectId,
                type: 'seconds',
                amount: 222,
                createdAt: (new Date('2025-08-24').getTime()),
                startedAt: (new Date('2025-08-24').getTime()),
                notes: ''
            })
        })

        await waitFor(() => expect(list.current.data?.length).toBe(2));

        
        expect((list.current.data || [])[0].id).toEqual('tb-2');
        expect((list.current.data || [])[0].amount).toEqual(222);
        expect((list.current.data || [])[1].id).toEqual('tb-1');
        expect((list.current.data || [])[1].amount).toEqual(111);
    })
});
