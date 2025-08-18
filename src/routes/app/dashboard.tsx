import { createFileRoute } from '@tanstack/react-router'
import { useCreateProject, useProjectsList } from '../../data/useProjects';

export const Route = createFileRoute('/app/dashboard')({
    component: RouteComponent
})

function RouteComponent() {
    const { data = [], isLoading, error } = useProjectsList();
    const createProject = useCreateProject();


    if (isLoading) {
        return (<p className='text-gray-400'>Loading…</p>)
    }

    if (error) {
        return (<p className='text-red-600'>An error occurred</p>)
    }

    return (
        <div>
            <h2>Hello "/app/dashboard"!</h2>

            {data.length === 0
                ? (<p className='text-gray-400'>No projects yet…</p>)
                : null}

            {
                data.map(project => {
                    return <p key={project.id} className='text-purple-700'>– {project.name}</p>
                })
            }

            <button
                className='rounded-sm bg-blue-300 p-4 m-4'
                onClick={() => {
                    const ts = (new Date).getTime();

                    createProject.mutate({
                        id: 'test-' + ts,
                        name: 'Project ' + ts
                    })

                }}>Create new project</button>
        </div>
    )
}
