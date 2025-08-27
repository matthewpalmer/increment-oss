import { render } from '@testing-library/react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { createMemoryHistory } from '@tanstack/history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { routeTree } from '../routeTree.gen';
import { SyncRuntime } from '../data/sync/sync-runtime';
import { fakeSyncEngine } from '../data/sync/fake-sync-engine';
import { syncBus } from '../data/sync/sync-bus';
import { createDexieApplier, dexieInverseCalculator } from '../data/sync/dexie-applier';
import { SyncBusScheduler } from '../data/sync/sync-bus-scheduler';

type Options = {
    route?: string;
};

export function renderApp(ui?: ReactNode, opts: Options = {}) {
    const {
        route = '/',
    } = opts;

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, networkMode: 'always' },
            mutations: { networkMode: 'always' },
        },
    });

    const history = createMemoryHistory({ initialEntries: [route] });

    const router = createRouter({
        routeTree,
        history,
        context: { queryClient }
    })

    const runtime = new SyncRuntime(
        fakeSyncEngine,
        syncBus,
        createDexieApplier(queryClient),
        dexieInverseCalculator
    );

    runtime.start();

    const scheduler = new SyncBusScheduler(syncBus);
    scheduler.start();

    const wrapped = (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    )

    const result = render(wrapped);

    const cleanupApp = () => {
        scheduler.stop?.();
        queryClient.clear();
        result.unmount();
    };

    return {
        ...result,
        router,
        queryClient,
        cleanupApp,
        history,
    };
}
