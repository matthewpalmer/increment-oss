import { createFileRoute, Link } from '@tanstack/react-router'
import { useCreateTimeBlock, useTimeBlocks } from '../../../../data/hooks/useTimeBlocks';
import { CreateUUID } from '../../../../domain/types';
import { IncrementDateTimeNow, TimeDurationToString, TimestampToLocalDate, TimestampToLocalTime } from '../../../../domain/time-utils';
import { useProject } from '../../../../data/hooks/useProjects';
import { useCreateGoal, useGoals } from '../../../../data/hooks/useGoals';

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
        <ul>
            {
                timeBlocks.map(timeBlock => {


                    return (
                        <li key={timeBlock.id}>
                            {TimeDurationToString(timeBlock.amount)},
                            {TimestampToLocalTime(timeBlock.createdAt)}, {TimestampToLocalDate(timeBlock.createdAt)},
                            {timeBlock.notes}
                        </li>
                    )
                })
            }
        </ul>
    )
}

function ProjectInfo({ projectId }: { projectId: string }) {
    const {
        data: project,
        isLoading,
        isError,
        error
    } = useProject(projectId);

    if (isLoading) return <p>Loading…</p>

    if (isError) return <p>An error occurred {error.message}</p>

    return (
        <>
            <h1>{ project?.name }</h1>
            <h1>{ project?.color }</h1>
            <h1>{ project?.icon }</h1>
        </>
    )
}

function GoalsList({ projectId }: { projectId: string }) {
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
            <h2>Goals</h2>

            <div>
                {
                    goals.map(goal => {
                        return (
                            <div key={goal.id}>
                                <h3>{ goal.name }</h3>
                                <Link 
                                    className="text-blue-800 underline"
                                    to="/app/projects/$projectId/goals/$goalId" 
                                    params={{projectId: projectId, goalId: goal.id}}>
                                        Edit
                                </Link>
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

            <h2>Time Blocks</h2>
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

            <br />
            <br />
            <br />

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
        </div>
    )
}
