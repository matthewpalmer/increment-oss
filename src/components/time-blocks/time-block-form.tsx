import { Button, Flex, Select, TextField, Text } from "@radix-ui/themes";
import { Label } from "radix-ui";
import { CreateUUID, zTimeBlock, type GoalUnit, type IncrementDuration, type TimeBlock, type TimeBlockType, type UUID } from "../../domain/types";
import { useState } from "react";
import { IncrementDateTimeNow } from "../../domain/time-utils";
import { ZodError } from "zod";
import { ErrorsList } from "../common/errors-list";
import { useCreateTimeBlock, useUpdateTimeBlock } from "../../data/hooks/useTimeBlocks";
import { DatePicker } from "../common/date-picker";
import { TimeInput } from "../common/time-input";
import { formatUnits } from "../common/target-formatting";

export type TimeBlockFormProps =
    | { mode: 'create', projectId: UUID, onFormSaved: () => void }
    | { mode: 'edit', timeBlock: TimeBlock, onFormSaved: () => void }

const zNewTimeBlockInput = zTimeBlock.omit({ id: true, createdAt: true });
const zEditTimeBlockInput = zTimeBlock.omit({ id: true }).partial();

export function TimeBlockForm(props: TimeBlockFormProps) {
    const isNewTimeBlock = props.mode === 'create';

    const createTimeBlock = useCreateTimeBlock();
    const updateTimeBlock = useUpdateTimeBlock();

    const [values, setValues] = useState(() => {
        if (isNewTimeBlock) {
            return {
                id: CreateUUID(),
                projectId: props.projectId,
                startedAt: IncrementDateTimeNow(),
                type: 'seconds',
                amount: 0,
                notes: ''
            }
        } else {
            return { ...props.timeBlock }
        }
    });

    const [error, setError] = useState<ZodError | undefined>(undefined);

    const handleSave = (event: React.FormEvent) => {
        event.preventDefault();

        if (isNewTimeBlock) {
            const parsed = zNewTimeBlockInput.safeParse(values);

            if (!parsed.success) {
                return setError(parsed.error);
            }

            createTimeBlock.mutate({
                id: CreateUUID(),
                createdAt: IncrementDateTimeNow(),
                ...parsed.data
            })

            return props.onFormSaved();
        }

        const parsed = zEditTimeBlockInput.safeParse(values);
        if (!parsed.success) return setError(parsed.error);

        updateTimeBlock.mutate({
            id: props.timeBlock.id,
            patch: parsed.data
        });

        props.onFormSaved();
    };

    const handleTypeChanged = (newValue: TimeBlockType) => {
        setValues({ ...values, type: newValue, amount: 0 })
    };

    const handleTimeChanged = (time: IncrementDuration) => {
        setValues({ ...values, amount: time });
    };

    return (
        <form onSubmit={handleSave} autoComplete="off">
            <Flex direction="column" gap="4">
                <Flex direction="row" justify="between" align="center">
                    <Label.Root className="text-md" htmlFor="type">
                        Type
                    </Label.Root>

                    <Select.Root value={values.type} defaultValue={values.type} onValueChange={handleTypeChanged}>
                        <Select.Trigger style={{ minWidth: '212px' }} />
                        <Select.Content>
                            <Select.Item value="seconds">Time</Select.Item>
                            <Select.Item value="count">Count</Select.Item>
                            <Select.Item value="words">Words</Select.Item>
                            <Select.Item value="meters">Meters</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Flex direction="row" justify="between" align="center">
                    <Label.Root className="text-md" htmlFor="type">
                        {values.type === 'seconds' ? 'Duration' : 'Amount'}
                    </Label.Root>

                    {
                        values.type === 'seconds'
                            ? <TimeInput onTimeChanged={handleTimeChanged} initialTime={values.amount} />
                            : (
                                <Flex align="center" gap="2">
                                    <TextField.Root
                                        id="countAmount" size="3"
                                        value={values.amount}
                                        onChange={(e) => {
                                            setValues({ ...values, amount: Number(e.target.value) })
                                        }}>
                                    </TextField.Root>

                                    <Text size="2" color="gray">{formatUnits(values.type as GoalUnit)}</Text>
                                </Flex>
                            )
                    }
                </Flex>

                <Flex direction="row" justify="between" align="center">
                    <Label.Root className="text-md" htmlFor="startedAt">
                        Date
                    </Label.Root>

                    <DatePicker selectedDay={new Date(values.startedAt)} onSelectedDayChange={(date) => {
                        setValues({ ...values, startedAt: (date || new Date).getTime() })
                    }} />
                </Flex>

                <Flex direction="column" mb="4">
                    <Label.Root className="text-gray-500 text-sm mb-1" htmlFor="name">
                        Notes (optional)
                    </Label.Root>

                    <TextField.Root
                        id="name" size="3" placeholder="Watched a lecture…"
                        value={values.notes}
                        onChange={(e) => {
                            setValues({ ...values, notes: e.target.value })
                        }}>
                    </TextField.Root>
                </Flex>

                <Button style={{ alignSelf: "flex-start" }} type="submit" size="3">
                    {
                        isNewTimeBlock
                            ? 'Add Entry'
                            : 'Save Entry'
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
