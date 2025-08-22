import { createFileRoute, Link } from '@tanstack/react-router'
import { useCreateTimeBlock, useTimeBlocks } from '../../../../data/hooks/useTimeBlocks';
import { CreateUUID, type Project } from '../../../../domain/types';
import { IncrementDateTimeNow, TimeDurationToString, TimestampToLocalDate, TimestampToLocalTime } from '../../../../domain/time-utils';
import { useProject } from '../../../../data/hooks/useProjects';
import { useCreateGoal, useDeleteGoal, useGoals } from '../../../../data/hooks/useGoals';
import { Button, Dialog, Flex, Heading, Theme } from '@radix-ui/themes';
import { ProjectForm } from '../../../../components/project-form';
import { useState } from 'react';
import { getNameForColor } from '../../../../components/colors';
import { GoalForm } from '../../../../components/goal-form';
import { GoalsListWidget } from '../../../../components/dashboard-widgets/goals-list-widget';
import { Widget, WidgetGrid } from '../../../../components/widget-grid';
import { TimeBlockForm } from '../../../../components/time-block-form';
import { PlusIcon } from '@radix-ui/react-icons';

export const Route = createFileRoute('/app/projects/$projectId/')({
    component: ProjectDetails
})

function TimeBlocksList({ projectId }: { projectId: string }) {
    const {
        data: timeBlocks = [],
        isLoading,
        isError,
        error
    } = useTimeBlocks(projectId);

    if (isLoading) {
        return (
            <div>
                Loading…
            </div>
        )
    }

    if (isError) {
        return (
            <div>
                An error occurred: {error.message}
            </div>
        )
    }

    return (
        <table className='border-collapse border border-gray-400'>
            <thead>
                <tr>
                    <th className='border border-gray-300'>ID</th>
                    <th className='border border-gray-300'>Amount</th>
                    <th className='border border-gray-300'>Time</th>
                    <th className='border border-gray-300'>Date</th>
                    <th className='border border-gray-300'>Notes</th>
                </tr>
            </thead>
            <tbody>
                {
                    timeBlocks.map(timeBlock => {


                        return (
                            <tr key={timeBlock.id}>
                                <td className="p-2 border border-gray-300">{timeBlock.id.split('-')[0]}</td>
                                <td className="p-2 border border-gray-300">{TimeDurationToString(timeBlock.amount)}</td>
                                <td className="p-2 border border-gray-300">{TimestampToLocalTime(timeBlock.startedAt)}</td>
                                <td className="p-2 border border-gray-300">{TimestampToLocalDate(timeBlock.startedAt)}</td>
                                <td className="p-2 border border-gray-300">{timeBlock.notes}</td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}

function ProjectInfo({ project }: { project: Project }) {
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [timeBlockDialogOpen, setTimeBlockDialogOpen] = useState(false);

    return (
        <Flex direction="row" justify="between" align="center" mt="2" mb="6" pb="4" className='border-b-2 border-dotted' style={{ borderColor: project.color }}>
            <Heading size="8" color={getNameForColor(project.color)}>{project.name}</Heading>

            <Flex direction="row" align="center" gap="4">
                <Dialog.Root open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                    <Dialog.Trigger>
                        <Button variant="ghost" size="2">Edit Project</Button>
                    </Dialog.Trigger>

                    <Dialog.Content>
                        <Dialog.Title size="6">{project?.name}</Dialog.Title>
                        <ProjectForm mode="edit" onFormSaved={() => setProjectDialogOpen(false)} project={project}></ProjectForm>
                    </Dialog.Content>
                </Dialog.Root>

                <Dialog.Root open={timeBlockDialogOpen} onOpenChange={setTimeBlockDialogOpen}>
                    <Dialog.Trigger>
                        <Button variant="soft" size="2"><PlusIcon /> Add Time</Button>
                    </Dialog.Trigger>

                    <Dialog.Content>
                        <Dialog.Title size="6">Add Time</Dialog.Title>
                        <TimeBlockForm mode="create" onFormSaved={() => setTimeBlockDialogOpen(false)} projectId={project.id}></TimeBlockForm>
                    </Dialog.Content>
                </Dialog.Root>
            </Flex>
        </Flex>
    )
}

function ProjectDetails() {
    const { projectId } = Route.useParams();
    const createTimeBlock = useCreateTimeBlock();

    const {
        data: project,
        isLoading,
        isError,
        error
    } = useProject(projectId);

    if (isLoading) return <p>Loading…</p>

    if (isError) return <p>An error occurred {error.message}</p>

    if (!project) return <p>Unable to load project</p>

    return (
        <div className='bg-white w-screen h-screen'>
            <div className='max-w-4xl m-auto px-2'>
                <Theme accentColor={getNameForColor(project.color)}>
                    <ProjectInfo project={project} />

                    <WidgetGrid>
                        <Widget size={{ columns: 2, rows: 1 }} className='bg-white border-0 p-4 rounded-lg' borderColor={project.color}>
                            <GoalsListWidget projectId={project.id} />
                        </Widget>

                        <Widget size={{ columns: 2, rows: 1 }} className='bg-slate-100/80 p-4 rounded-lg'>
                            <h2>Test</h2>
                        </Widget>

                        <Widget size={{ columns: 4, rows: 1 }} className='bg-slate-100/80 p-4 rounded-lg'>
                            <h2>Test</h2>
                        </Widget>

                        <Widget size={{ columns: 1, rows: 1 }} className='bg-slate-100/80 p-4 rounded-lg'>
                            <h2>Test</h2>
                        </Widget>

                        <Widget size={{ columns: 3, rows: 1 }} className='bg-slate-100/80 p-4 rounded-lg'>
                            <h2>Test</h2>
                        </Widget>

                        <Widget size={{ columns: 3, rows: 1 }} className='bg-slate-100/80 p-4 rounded-lg'>
                            <h2>Test</h2>
                        </Widget>

                        <Widget size={{ columns: 4, rows: 1 }} className='bg-slate-100/80 p-4 rounded-lg'>
                            <h2>Test</h2>
                        </Widget>
                    </WidgetGrid>
                </Theme>
                <h2 className='text-3xl font-extrabold mt-8'>Time Blocks</h2>
                <TimeBlocksList projectId={projectId} />

                {/* <button
                    className='rounded-sm bg-blue-300 p-4 m-4'
                    onClick={() => {
                        const id = CreateUUID();

                        createTimeBlock.mutate({
                            id: id,
                            notes: 'Time block ' + id,
                            projectId: projectId,
                            amount: Math.floor(Math.random() * 7200),
                            createdAt: IncrementDateTimeNow(),
                            startedAt: IncrementDateTimeNow()
                        })
                    }}>
                    Add Time Block
                </button> */}
            </div>
        </div>
    )
}
