import { createFileRoute, Link } from '@tanstack/react-router'
import { useCreateTimeBlock, useTimeBlocks } from '../../../../data/hooks/useTimeBlocks';
import { CreateUUID } from '../../../../domain/types';
import { IncrementDateTimeNow, TimeDurationToString, TimestampToLocalDate, TimestampToLocalTime } from '../../../../domain/time-utils';
import { useProject } from '../../../../data/hooks/useProjects';
import { useCreateGoal, useDeleteGoal, useGoals } from '../../../../data/hooks/useGoals';
import { Button, Dialog, Flex, Heading } from '@radix-ui/themes';
import { ProjectForm } from '../../../../components/project-form';
import { useState } from 'react';

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
                            <td className="p-2 border border-gray-300">{TimestampToLocalTime(timeBlock.createdAt)}</td>
                            <td className="p-2 border border-gray-300">{TimestampToLocalDate(timeBlock.createdAt)}</td>
                            <td className="p-2 border border-gray-300">{timeBlock.notes}</td>
                        </tr>
                    )
                })
            }
            </tbody>
        </table>
    )
}

function ProjectInfo({ projectId }: { projectId: string }) {
    const {
        data: project,
        isLoading,
        isError,
        error
    } = useProject(projectId);

    const [projectDialogOpen, setProjectDialogOpen] = useState(false);

    if (isLoading) return <p>Loading…</p>

    if (isError) return <p>An error occurred {error.message}</p>

    if (!project) return <p>Unable to load project</p>

    return (
        <Flex direction={"row"} justify={"between"} align={"center"} mt="4">
            <Heading size="8" style={{color: project.color || 'black' }}>{ project.name }</Heading>

            <Dialog.Root open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                <Dialog.Trigger>
                    <Button variant="soft" size="2">Edit Project</Button>
                </Dialog.Trigger>

                <Dialog.Content>
                    <Dialog.Title size="6">{ project?.name }</Dialog.Title>
                    <ProjectForm mode="edit" onFormSaved={() => setProjectDialogOpen(false)} project={project}></ProjectForm>
                </Dialog.Content>
            </Dialog.Root>
        </Flex>
    )
}

function GoalsList({ projectId }: { projectId: string }) {
    const deleteGoal = useDeleteGoal();

    const {
        data: goals = [],
        isLoading,
        isError,
        error
    } = useGoals(projectId);

    if (isLoading) {
        return <p>Loading goals…</p>
    }

    if (isError) {
        return <p>Error loading goals: {error.message}</p>
    }

    return (
        <div>
            <h2 className='text-3xl font-extrabold mt-4'>Goals</h2>

            <div>
                {
                    goals.map(goal => {
                        return (
                            <div key={goal.id} className='p-4 border-2 m-4 rounded-md border-gray-300'>
                                <h3 className='font-bold text-lg'>{ goal.name }</h3>
                                <Link 
                                    className="text-blue-800 bg-blue-100 rounded-sm p-2 m-2 text-sm hover:cursor-pointer hover:bg-blue-200"
                                    to="/app/projects/$projectId/goals/$goalId" 
                                    params={{projectId: projectId, goalId: goal.id}}>
                                        Edit
                                </Link>

                                <button 
                                    className='text-red-800 bg-red-100 rounded-sm p-2 m-2 text-sm hover:cursor-pointer hover:bg-red-200'
                                    onClick={() => {
                                        console.log('starting the delete....')
                                        deleteGoal.mutate(goal);
                                        console.log('done the delete....');
                                    }}>
                                    Delete Goal
                                </button>

                                <pre>
                                    {goal.id} | 
                                    {goal.color} |
                                    {goal.projectId} |
                                    {goal.aggregation} |
                                    {goal.cadence} |
                                    {goal.unit} |
                                </pre>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

function ProjectDetails() {
    const { projectId } = Route.useParams();
    const createTimeBlock = useCreateTimeBlock();
    const createGoal = useCreateGoal();

    return (
        <div>
            <ProjectInfo projectId={projectId} />

            <GoalsList projectId={projectId} />
            <button
                className='rounded-sm bg-blue-300 p-4 m-4'
                onClick={() => {
                    const id = CreateUUID();

                    createGoal.mutate({
                        id: id,
                        projectId: projectId,
                        name: 'New Goal ' + (Math.floor(Math.random() * 100)),
                        color: '',
                        createdAt: IncrementDateTimeNow(),
                        unit: 'seconds',
                        cadence: 'daily',
                        aggregation: 'sum',
                    })
                }}>
                Add Goal
            </button>

            <h2 className='text-3xl font-extrabold mt-8'>Time Blocks</h2>
            <TimeBlocksList projectId={projectId} />

            <button
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
            </button>

        </div>
    )
}
