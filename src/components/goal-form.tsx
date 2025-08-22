import { Button, Flex, Select, TextField } from "@radix-ui/themes";
import { Label } from "radix-ui";
import { CreateUUID, zGoal, type Goal, type GoalAggregation, type GoalCadence, type GoalUnit, type UUID } from "../domain/types";
import { useState } from "react";
import { IncrementDateTimeNow } from "../domain/time-utils";
import { ZodError } from "zod";
import { useCreateGoal, useDeleteGoal, useUpdateGoal } from "../data/hooks/useGoals";
import { ErrorsList } from "./errors-list";

export type GoalFormProps =
    | { mode: 'create', projectId: UUID, onFormSaved: () => void }
    | { mode: 'edit', goal: Goal, onFormSaved: () => void }

const zNewGoalInput = zGoal.omit({ id: true, createdAt: true });
const zEditGoalInput = zGoal.omit({ id: true }).partial();

export function GoalForm(props: GoalFormProps) {
    const isNewGoal = props.mode === 'create';

    const createGoal = useCreateGoal();
    const updateGoal = useUpdateGoal();
    const deleteGoal = useDeleteGoal();

    const [values, setValues] = useState(() => {
        if (isNewGoal) {
            return {
                id: CreateUUID(),
                projectId: props.projectId,
                name: '',
                color: '',
                createdAt: IncrementDateTimeNow(),
                unit: 'seconds',
                cadence: 'daily',
                aggregation: 'sum'
            }
        } else {
            return { ...props.goal }
        }
    });

    const [error, setError] = useState<ZodError | undefined>(undefined);

    const handleSave = (event: React.FormEvent) => {
        event.preventDefault();

        if (isNewGoal) {
            const parsed = zNewGoalInput.safeParse(values);

            if (!parsed.success) {
                return setError(parsed.error);
            }

            createGoal.mutate({
                id: CreateUUID(),
                createdAt: IncrementDateTimeNow(),
                ...parsed.data
            })

            return props.onFormSaved();
        }

        const parsed = zEditGoalInput.safeParse(values);
        if (!parsed.success) return setError(parsed.error);

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

    const handleUnitChanged = (newValue: GoalUnit) => {
        setValues({ ...values, unit: newValue })
    };

    const handleCadenceChanged = (newValue: GoalCadence) => {
        setValues({ ...values, cadence: newValue })
    }

    const handleAggregationChanged = (newValue: GoalAggregation) => {
        setValues({ ...values, aggregation: newValue })
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
                        value={values.name}
                        onChange={(e) => {
                            setValues({ ...values, name: e.target.value })
                        }}>
                    </TextField.Root>
                </Flex>

                <Flex direction="row" justify="between" wrap="wrap" gap="2">
                    <Flex direction="row" justify="between" align="center" gap="2">
                        <Label.Root className="text-sm text-gray-500" htmlFor="type">
                            Type
                        </Label.Root>

                        <Select.Root size="3" value={values.unit} defaultValue={values.unit} onValueChange={handleUnitChanged}>
                            <Select.Trigger />
                            <Select.Content>
                                <Select.Item value="seconds">Time</Select.Item>
                                <Select.Item value="count">Count</Select.Item>
                                <Select.Item value="meters">Distance</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </Flex>

                    <Flex direction="row" justify="between" align="center" gap="2">
                        <Label.Root className="text-sm text-gray-500" htmlFor="cadence">
                            Period
                        </Label.Root>

                        <Select.Root size="3" value={values.cadence} defaultValue={values.cadence} onValueChange={handleCadenceChanged}>
                            <Select.Trigger />

                            <Select.Content>
                                <Select.Item value="daily">Daily</Select.Item>
                                <Select.Item value="weekly">Weekly</Select.Item>
                                <Select.Item value="monthly">Monthly</Select.Item>
                                <Select.Item value="lifetime">Lifetime</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </Flex>

                    <Flex direction="row" justify="between" align="center" gap="2">
                        <Label.Root className="text-sm text-gray-500" htmlFor="aggregation">
                            Aggregation
                        </Label.Root>

                        <Select.Root size="3" value={values.aggregation} defaultValue={values.aggregation} onValueChange={handleAggregationChanged}>
                            <Select.Trigger />

                            <Select.Content>
                                <Select.Item value="sum">Sum</Select.Item>
                                <Select.Item value="count">Sessions</Select.Item>
                                <Select.Item value="max">Maximum</Select.Item>
                            </Select.Content>
                        </Select.Root>
                    </Flex>

                </Flex>

                <Flex direction="row" justify="between" align="center" mt="2">
                    <Button style={{ alignSelf: "flex-start" }} type="submit" size="3">
                        {
                            isNewGoal
                                ? 'Create Goal'
                                : 'Save Goal'
                        }
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

                {
                    error
                        ? <ErrorsList error={error} />
                        : null
                }
            </Flex>
        </form>
    )
}
