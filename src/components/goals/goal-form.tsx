import { Button, Flex, TextField } from "@radix-ui/themes";
import { Label } from "radix-ui";
import { CreateUUID, INCREMENT_TIMESTAMP_FOREVER, zGoal, zGoalVersion, type Goal, type GoalVersion, type UUID } from "../../domain/types";
import { useState } from "react";
import { IncrementDateTimeNow } from "../../domain/time-utils";
import { ZodError } from "zod";
import { useCreateGoal, useDeleteGoal, useUpdateGoal } from "../../data/hooks/useGoals";
import { ErrorsList } from "../common/errors-list";
import { GoalVersionList } from "./goal-version-list";
import { useReplaceActiveGoalVersion } from "../../data/hooks/useGoalVersions";

export type GoalFormProps =
    | { mode: 'create', projectId: UUID, onFormSaved: () => void }
    | { mode: 'edit', goal: Goal, onFormSaved: () => void }

const zNewGoalInput = zGoal.omit({ id: true, createdAt: true });
const zEditGoalInput = zGoal.omit({ id: true }).partial();
const zGoalVersionInput = zGoalVersion.omit({ id: true });

export function GoalForm(props: GoalFormProps) {
    const isNewGoal = props.mode === 'create';

    const createGoal = useCreateGoal();
    const updateGoal = useUpdateGoal();
    const deleteGoal = useDeleteGoal();
    const replaceGoalVersion = useReplaceActiveGoalVersion();

    const [goal, setGoal] = useState(() => {
        if (isNewGoal) {
            return {
                id: CreateUUID(),
                projectId: props.projectId,
                name: '',
                color: '',
                createdAt: IncrementDateTimeNow(),
            }
        } else {
            return { ...props.goal }
        }
    });

    const makeNewGoalVersion = (goalId: UUID): GoalVersion => {
        return {
            id: CreateUUID(),
            goalId: goalId,
            target: 0,
            validFrom: IncrementDateTimeNow(),
            validTo: INCREMENT_TIMESTAMP_FOREVER,
            unit: 'seconds',
            cadence: 'daily',
            aggregation: 'sum',
            notes: ''
        }
    };

    const [newGoalVersionNeedsCreation, setNewGoalVersionNeedsCreation] = useState(isNewGoal);
    const [newGoalVersion, setNewGoalVersion] = useState(makeNewGoalVersion(goal.id));

    const [error, setError] = useState<ZodError | undefined>(undefined);

    const handleArchivingPreviousGoalVersion = async (goalId: UUID) => {
        if (!newGoalVersionNeedsCreation) {
            return;
        }

        const parsed = zGoalVersionInput.safeParse(newGoalVersion);

        if (!parsed.success) {
            throw parsed.error;
        }

        await replaceGoalVersion.mutateAsync({
            id: CreateUUID(),
            ...parsed.data,
            goalId
        });
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();

        if (isNewGoal) {
            const parsed = zNewGoalInput.safeParse(goal);
            const goalId = CreateUUID();

            if (!parsed.success) {
                return setError(parsed.error);
            }

            try {
                await handleArchivingPreviousGoalVersion(goalId);
            } catch (err) {
                return setError(err as ZodError)
            }

            createGoal.mutate({
                id: goalId,
                createdAt: IncrementDateTimeNow(),
                ...parsed.data
            })

            return props.onFormSaved();
        }

        const parsed = zEditGoalInput.safeParse(goal);
        if (!parsed.success) return setError(parsed.error);

        try {
            await handleArchivingPreviousGoalVersion(goal.id);
        } catch (err) {
            return setError(err as ZodError)
        }

        updateGoal.mutate({
            id: props.goal.id,
            patch: parsed.data
        });

        props.onFormSaved();
    };

    const handleDeleteGoal = () => {
        if (props.mode === 'create') return;

        const proceed = confirm('Are you sure you want to delete this goal?');
        if (!proceed) return;

        deleteGoal.mutate(props.goal);
        props.onFormSaved();
    };

    const handleNewGoalVersionAdded = (goalVersion: GoalVersion) => {
        setNewGoalVersionNeedsCreation(true);
        setNewGoalVersion(goalVersion);
    };

    return (
        <form onSubmit={handleSave} autoComplete="off">
            <Flex direction="column" gap="4">
                <Flex direction="column">
                    <Label.Root className="text-gray-500 text-sm" htmlFor="name">
                        Goal Name
                    </Label.Root>

                    <TextField.Root
                        id="name" size="3" placeholder="My project…"
                        value={goal.name}
                        onChange={(e) => {
                            setGoal({ ...goal, name: e.target.value })
                        }}>
                    </TextField.Root>
                </Flex>

                <GoalVersionList 
                    goal={goal} 
                    showVersionCreation={props.mode === 'create'}
                    newGoalVersion={newGoalVersion}
                    onNewGoalVersionUpdated={handleNewGoalVersionAdded} />

                <Flex direction="row" justify="between" align="center" mt="2">
                    <Button style={{ alignSelf: "flex-start" }} type="submit" size="3">
                        {isNewGoal ? 'Create Goal' : 'Save Goal'}
                    </Button>

                    {
                        isNewGoal
                            ? null
                            : (
                                <Button variant="soft" color="red" onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteGoal();
                                }}>Delete</Button>
                            )
                    }
                </Flex>

                {error ? <ErrorsList error={error} /> : null}
            </Flex>
        </form>
    )
}
