import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/app/projects/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/projects/"!</div>
}
