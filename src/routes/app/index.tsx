import { createFileRoute, Link } from '@tanstack/react-router'
import { useCreateProject, useProjectsList } from '../../data/hooks/useProjects';
import { Flex, Text, Button, Dialog, Heading, Box, Grid } from "@radix-ui/themes";
import { ProjectForm } from '../../components/project-form';
import { useState } from 'react';
import { ArrowRightIcon, CaretRightIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { getNameForColor } from '../../components/colors';

export const Route = createFileRoute('/app/')({
    component: RouteComponent
})

function RouteComponent() {
    const { data = [], isLoading, error } = useProjectsList();
    const createProject = useCreateProject();

    const [projectDialogOpen, setProjectDialogOpen] = useState(false);

    if (isLoading) {
        return (<p className='text-gray-400'>Loading…</p>)
    }

    if (error) {
        return (<p className='text-red-600'>An error occurred</p>)
    }

    return (
        <div className='max-w-4xl m-auto p-2'>
            <Flex mb="6" direction="row" align="center" justify="between">
                <Heading size="8">
                    My Projects
                </Heading>

                <Dialog.Root open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                    <Dialog.Trigger>
                        <Button size="3">New Project</Button>
                    </Dialog.Trigger>

                    <Dialog.Content>
                        <Dialog.Title size="6">New Project</Dialog.Title>
                        <ProjectForm mode="create" onFormSaved={() => setProjectDialogOpen(false)}></ProjectForm>
                    </Dialog.Content>
                </Dialog.Root>
            </Flex>

            {data.length === 0
                ? (
                    <div className='bg-gray-100 py-8 px-8 rounded-xl'>
                        <p className='text-gray-500 font-bold text-lg'>
                            No projects
                        </p>
                        <p className='text-gray-500 font-semi-bold '>
                            Create your first project to get started
                        </p>
                    </div>)
                : null}

            <Flex direction="column" wrap="wrap" gap="2">
                {
                    data.map(project => {
                        return (
                            <Link
                                key={project.id}
                                to="/app/projects/$projectId"
                                params={{ projectId: project.id }}
                                className='overflow-ellipsis min-w-64 border-b-2 border-dotted pb-2 mb-4'
                                style={{ borderColor: project.color || '#0091ff'}}>

                                <Flex justify="between" align="center" style={{ color: project.color || '#0091ff' }}>
                                    <Heading size="6" color={getNameForColor(project.color)}>{project.name}</Heading>
                                    <ArrowRightIcon />
                                </Flex>
                            </Link>
                        )
                    })
                }
            </Flex>
        </div>
    )
}
