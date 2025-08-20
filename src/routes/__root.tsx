import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient } from '@tanstack/react-query'
import { FakeSyncEngineControlPanel } from '../components/fake-sync-engine-control-panel'

export interface AppRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
    component: () => (
        <>
            <div className="p-2 flex gap-2">
                <Link to="/" className="[&.active]:font-bold">Home</Link>
                <Link to="/about" className="[&.active]:font-bold">About</Link>
                <Link to="/app" className="[&.active]:font-bold">App</Link>
            </div>
            <hr />
            <Outlet />
            <TanStackRouterDevtools />
            <FakeSyncEngineControlPanel />
        </>
    )
})
