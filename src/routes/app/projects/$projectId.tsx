import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/projects/$projectId')({
    loader: async ({ params }) => {
        return { name: 'blah ' + params.projectId, id: params.projectId }
    },
    component: ProjectDetails
})

function ProjectDetails() {
    const { projectId } = Route.useParams();
    const data = Route.useLoaderData();

    return <div>Hello "/projects/$projectId"! { projectId } { data.name }</div>
}
