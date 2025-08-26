import { createRootRouteWithContext, HeadContent, Link, Outlet } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { FakeSyncEngineControlPanel } from '../components/common/fake-sync-engine-control-panel';
import { Theme } from "@radix-ui/themes";
import { ShadowOuterIcon } from '@radix-ui/react-icons';
import { SyncStatusDisplay } from '../components/sync/sync-status';
export interface AppRouterContext {
    queryClient: QueryClient
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
    head: () => ({
        meta: [
            { title: 'Increment' }
        ]
    }),
    component: () => (
        <>
            <HeadContent />
            
            <div>
                <Theme>
                    <div className="flex gap-2  p-4 justify-between align-bottom">
                        <Link to="/app" className="text-xs gap-1 text-indigo-500 hover:text-indigo-700 font-semibold flex items-center">
                            <img className='opacity' width="20" src="/increment-favicon.svg"></img>
                             Increment
                        </Link>

                        <SyncStatusDisplay />
                    </div>

                    <Outlet />

                    {/* <TanStackRouterDevtools /> */}
                    {/* <FakeSyncEngineControlPanel /> */}
                </Theme>
            </div>
        </>
    )
})
