import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient } from '@tanstack/react-query'
import { FakeSyncEngineControlPanel } from '../components/fake-sync-engine-control-panel'
import { Theme } from "@radix-ui/themes";
import { HomeIcon } from '@radix-ui/react-icons';
export interface AppRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
    component: () => (
        <div>
            <Theme>
                <div className="flex gap-2  p-4 justify-between align-bottom">
                    <Link to="/app" className="[&.active]:font-bold text-gray-400 hover:text-gray-600"><HomeIcon /></Link>

                    <Link to="/about" className='text-sm text-gray-400 font-semibold'>Sync Status</Link>
                </div>
                
                <Outlet />
                <TanStackRouterDevtools />
                <FakeSyncEngineControlPanel />
            </Theme>
        </div>
    )
})
