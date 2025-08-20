import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'

import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SyncRuntime } from './data/sync/sync-runtime'
import { fakeSyncEngine } from './data/sync/fake-sync-engine'
import { syncBus } from './data/sync-bus'
import { createDexieApplier, dexieInverseCalculator } from './data/sync/dexie-applier'
import { SyncBusScheduler } from './data/sync-bus-scheduler'

const queryClient = new QueryClient()

const router = createRouter({
    routeTree,
    context: {
        queryClient: queryClient
    }
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

const syncRuntime = new SyncRuntime(fakeSyncEngine, syncBus, createDexieApplier(queryClient), dexieInverseCalculator);
syncRuntime.start();

const syncBusScheduler = new SyncBusScheduler(syncBus);
syncBusScheduler.start();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>,
)
