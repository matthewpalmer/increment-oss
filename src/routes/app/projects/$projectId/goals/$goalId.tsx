import { createFileRoute } from '@tanstack/react-router'
import { useGoal, useGoals } from '../../../../../data/hooks/useGoals';
import { useCreateGoalVersion, useGoalVersions } from '../../../../../data/hooks/useGoalVersions';
import { CreateUUID, INCREMENT_TIMESTAMP_FOREVER } from '../../../../../domain/types';
import { IncrementDateTimeNow } from '../../../../../domain/time-utils';

export const Route = createFileRoute('/app/projects/$projectId/goals/$goalId')({
  component: RouteComponent,
})

function RouteComponent() {
    const { projectId, goalId } = Route.useParams();

    const {
        data: goal,
        isLoading,
        isError,
        error
    } = useGoal(goalId);

    const {
        data: goalVersions
    } = useGoalVersions(goalId);

    const createGoalVersion = useCreateGoalVersion();

    if (isLoading) return <p>Loading goal…</p>

    if (isError) return <p>Error loading goal: {error.message}</p>

    return (
        <div>
            <h2>{ goal?.name }</h2>
            <p>{ goal?.unit }</p>
            <p>{ goal?.cadence }</p>
            <p>{ goal?.aggregation }</p>
            <p>{ goal?.color }</p>

            <h3>Goal Versions</h3>

            <ul>
                {
                    (goalVersions || []).map(goalVersion => {
                        return <li key={goalVersion.id}>Goal version: {goalVersion.id} {goalVersion.notes}</li>
                    })
                }
            </ul>

            <button
                className='rounded-sm bg-blue-300 p-4 m-4'
                onClick={() => {
                    const id = CreateUUID();

                    createGoalVersion.mutate({
                        id: id,
                        notes: 'Goal version notes (' + id.split('-')[0] + ')',
                        goalId: goalId,
                        target: Math.floor((Math.random() * 100)),
                        validFrom: IncrementDateTimeNow(),
                        validTo: INCREMENT_TIMESTAMP_FOREVER
                    })
                }}>
                Add Goal Version
            </button>
        </div>
    )
}
