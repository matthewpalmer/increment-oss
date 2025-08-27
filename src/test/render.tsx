import { render } from '@testing-library/react';
import { RouterProvider, createRootRouteWithContext, createRoute, createRouter } from '@tanstack/react-router';
import { createMemoryHistory } from '@tanstack/history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { routeTree } from '../routeTree.gen';
import { SyncRuntime } from '../data/sync/sync-runtime';
import { fakeSyncEngine } from '../data/sync/fake-sync-engine';
import { syncBus } from '../data/sync/sync-bus';
import { createDexieApplier, dexieInverseCalculator } from '../data/sync/dexie-applier';
import { SyncBusScheduler } from '../data/sync/sync-bus-scheduler';
import { type AppRouterContext } from '../routes/__root';
import { Theme } from '@radix-ui/themes';

type Options = {
    route?: string;
};

export function renderApp(opts: Options = {}) {
    const { route = '/' } = opts;

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, networkMode: 'always' },
            mutations: { networkMode: 'always' },
        },
    });

    const history = createMemoryHistory({ initialEntries: [route] });

    const runtime = new SyncRuntime(
        fakeSyncEngine,
        syncBus,
        createDexieApplier(queryClient),
        dexieInverseCalculator
    );

    const scheduler = new SyncBusScheduler(syncBus);

    const router = createRouter({
        routeTree: routeTree,
        history,
        context: { queryClient }
    })

    runtime.start();
    scheduler.start();

    const result = render((
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    ));

    const cleanupApp = () => {
        scheduler.stop?.();
        runtime.stop?.();
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

export function renderComponent(ui: ReactNode, opts: Options = {}) {
    const { route = '/' } = opts;

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, networkMode: 'always' },
            mutations: { networkMode: 'always' },
        },
    });

    const history = createMemoryHistory({ initialEntries: [route] });

    const runtime = new SyncRuntime(
        fakeSyncEngine,
        syncBus,
        createDexieApplier(queryClient),
        dexieInverseCalculator
    );

    const scheduler = new SyncBusScheduler(syncBus);

    const rootRoute = createRootRouteWithContext<AppRouterContext>()({
        component: () => <Theme>{ui}</Theme>
    });

    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: () => null
    });

    const testTree = rootRoute.addChildren([indexRoute]);

    const router = createRouter({
        routeTree: testTree,
        history,
        context: { queryClient }
    });

    runtime.start();
    scheduler.start();

    const result = render((
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    ));

    const cleanupApp = () => {
        scheduler.stop?.();
        runtime.stop?.();
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