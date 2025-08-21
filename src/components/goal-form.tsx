import { Button, Flex, TextField } from "@radix-ui/themes";
import { Label } from "radix-ui";
import { CreateUUID, zGoal, type Goal, type UUID } from "../domain/types";
import { useState } from "react";
import { IncrementDateTimeNow } from "../domain/time-utils";
import { ZodError } from "zod";
import { useCreateGoal, useUpdateGoal } from "../data/hooks/useGoals";
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

                <Button style={{ alignSelf: "flex-start" }} type="submit" size="3">
                    {
                        isNewGoal
                            ? 'Create Goal'
                            : 'Save Goal'
                    }
                </Button>

                {
                    error
                    ? <ErrorsList error={error} />
                    : null
                }
            </Flex>
        </form>
    )
}
