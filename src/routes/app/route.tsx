import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
    component: AppLayoutComponent,
})

function AppLayoutComponent() {
    return (
        <div>
            <h1>App Layout</h1>
            <Outlet />
        </div>
    )
}
