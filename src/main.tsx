import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'

import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SyncRuntime } from './data/sync/sync'
import { OfflineSyncEngine } from './data/sync/no-sync'
import { syncBus } from './data/sync-bus'

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

const syncRuntime = new SyncRuntime(new OfflineSyncEngine(), syncBus);
syncRuntime.start();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </StrictMode>,
)
