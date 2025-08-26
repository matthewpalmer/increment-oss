import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { QueryClient } from '@tanstack/react-query'
import { FakeSyncEngineControlPanel } from '../components/common/fake-sync-engine-control-panel'
import { Theme } from "@radix-ui/themes";
import { HomeIcon, ShadowOuterIcon } from '@radix-ui/react-icons';
import { SyncStatusDisplay } from '../components/sync/sync-status';
export interface AppRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
    component: () => (
        <div>
            <Theme>
                <div className="flex gap-2  p-4 justify-between align-bottom">
                    <Link to="/app" className="text-xs gap-1 text-gray-400 hover:text-gray-600 font-semibold flex items-center"><ShadowOuterIcon /> Increment</Link>

                    <SyncStatusDisplay />
                </div>
                
                <Outlet />
                {/* <TanStackRouterDevtools /> */}
                <FakeSyncEngineControlPanel />
            </Theme>
        </div>
    )
})
