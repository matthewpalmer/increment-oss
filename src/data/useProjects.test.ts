import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { resetDb } from '../test/dbTestUtils';
import { db } from './persistence/db';
import { useProjectsList, useCreateProject, useDeleteProject } from './useProjects';
import { TestQueryClientProvider } from '../test/TestQueryClientProvider';

describe('useProjects hooks', () => {
    beforeEach(async () => {
        await resetDb();
    });

    it('lists projects', async () => {
        await db.projects.bulkPut([
            { id: 'a', name: 'A' },
            { id: 'b', name: 'B' },
        ]);

        const { result } = renderHook(useProjectsList, { wrapper: TestQueryClientProvider() });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        
        expect(result.current.data?.length).toBe(2);
        expect((result.current.data || [])[0].id).toEqual('a');
        expect((result.current.data || [])[1].name).toEqual('B');
    });

    it('adds to the list', async () => {
        const provider = TestQueryClientProvider();
        const { result: list } = renderHook(useProjectsList, { wrapper: provider });
        const { result: create } = renderHook(useCreateProject, { wrapper: provider });
        
        await waitFor(() => expect(list.current.isSuccess).toBe(true));
        
        expect(list.current.data?.length).toBe(0);

        await act(async () => {
            await create.current.mutateAsync({ id: 'one', name: 'P1' })
        })

        await waitFor(() => expect(list.current?.data?.length).toBe(1));

        expect((list.current.data || [])[0].id).toEqual('one');
        expect((list.current.data || [])[0].name).toEqual('P1');
    });

    it('deletes from the list', async () => {
        const provider = TestQueryClientProvider();
        const { result: list } = renderHook(useProjectsList, { wrapper: provider });
        const { result: create } = renderHook(useCreateProject, { wrapper: provider });
        const { result: deleteProject } = renderHook(useDeleteProject, { wrapper: provider });
        
        await waitFor(() => expect(list.current.isSuccess).toBe(true));
        
        expect(list.current.data?.length).toBe(0);

        await act(async () => {
            await create.current.mutateAsync({ id: 'one', name: 'P1' })
            await create.current.mutateAsync({ id: 'two', name: 'P2' })
        })

        await waitFor(() => expect(list.current?.data?.length).toBe(2));

        expect((list.current.data || [])[0].id).toEqual('one');
        expect((list.current.data || [])[1].id).toEqual('two');

        await act(async () => {
            await deleteProject.current.mutateAsync({ id: 'one', name: 'P1' })
        })

        await waitFor(() => expect(list.current?.data?.length).toBe(1));
        expect((list.current.data || [])[0].id).toEqual('two');
    });
});
