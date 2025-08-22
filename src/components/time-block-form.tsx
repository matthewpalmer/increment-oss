import { Button, Flex, Select, Text, TextField } from "@radix-ui/themes";
import { Label } from "radix-ui";
import { CreateUUID, zGoal, zTimeBlock, type Goal, type TimeBlock, type UUID } from "../domain/types";
import { useState } from "react";
import { convertDurationToHoursMinutes, convertHoursMinutesToDuration, IncrementDateTimeNow } from "../domain/time-utils";
import { ZodError } from "zod";
import { ErrorsList } from "./errors-list";
import { useCreateTimeBlock, useUpdateTimeBlock } from "../data/hooks/useTimeBlocks";
import { DatePicker } from "./date-picker";

export type TimeBlockFormProps =
    | { mode: 'create', projectId: UUID, onFormSaved: () => void }
    | { mode: 'edit', timeBlock: TimeBlock, onFormSaved: () => void }

const zNewTimeBlockInput = zTimeBlock.omit({ id: true, createdAt: true });
const zEditTimeBlockInput = zTimeBlock.omit({ id: true }).partial();

export function TimeBlockForm(props: TimeBlockFormProps) {
    const isNewTimeBlock = props.mode === 'create';

    const createTimeBlock = useCreateTimeBlock();
    const updateTimeBlock = useUpdateTimeBlock();

    const [timeHours, setTimeHours] = useState('');
    const [timeMinutes, setTimeMinutes] = useState('');

    const [values, setValues] = useState(() => {
        if (isNewTimeBlock) {
            return {
                id: CreateUUID(),
                projectId: props.projectId,
                startedAt: IncrementDateTimeNow(),
                type: 'time',
                amount: 0,
                notes: ''
            }
        } else {
            const initial = { ...props.timeBlock }

            if (initial.type === 'time') {
                const { hours, minutes } = convertDurationToHoursMinutes(initial.amount);
                setTimeHours(hours);
                setTimeMinutes(minutes);
            }

            return initial
        }
    });

    const [error, setError] = useState<ZodError | undefined>(undefined);

    const handleSave = (event: React.FormEvent) => {
        event.preventDefault();

        const valuesCopy = { ...values };

        if (valuesCopy.type === 'time') {
            valuesCopy.amount = convertHoursMinutesToDuration(timeHours, timeMinutes);
        }

        if (isNewTimeBlock) {
            const parsed = zNewTimeBlockInput.safeParse(valuesCopy);

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

        const parsed = zEditTimeBlockInput.safeParse(valuesCopy);
        if (!parsed.success) return setError(parsed.error);

        updateTimeBlock.mutate({
            id: props.timeBlock.id,
            patch: parsed.data
        });

        props.onFormSaved();
    };

    const handleTypeChanged = (newValue: string) => {
        if (newValue === 'time') {
            setValues({ ...values, type: 'time', amount: 0 })
        } else {
            setValues({ ...values, type: 'count', amount: 1 })
        }
    };

    return (
        <form onSubmit={handleSave} autoComplete="off">
            <Flex direction="column" gap="4">
                <Flex direction="row" justify="between" align="center">
                    <Label.Root className="text-md" htmlFor="type">
                        Type
                    </Label.Root>

                    <Select.Root size="3" value={values.type} defaultValue={values.type} onValueChange={handleTypeChanged}>
                        <Select.Trigger />
                        <Select.Content>
                            <Select.Item value="time">Time</Select.Item>
                            <Select.Item value="count">Count</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Flex direction="row" justify="between" align="center">
                    <Label.Root className="text-md" htmlFor="type">
                        {values.type === 'time' ? 'Duration' : 'Amount'}
                    </Label.Root>

                    {
                        values.type === 'time'
                            ? (
                                <Flex direction="row" align="center" gap="3">
                                    <Flex direction="row" align="center" gap="1" width="72px">
                                        <TextField.Root
                                            id="timeHours" size="3"
                                            value={timeHours}
                                            onChange={(e) => {
                                                setTimeHours(e.target.value);
                                            }}>
                                        </TextField.Root>
                                        <Text color="gray">h</Text>
                                    </Flex>

                                    <Flex direction="row" align="center" gap="1" width="72px">
                                        <TextField.Root
                                            id="timeMinutes" size="3"
                                            value={timeMinutes}
                                            onChange={(e) => {
                                                setTimeMinutes(e.target.value);
                                            }}>
                                        </TextField.Root>
                                        <Text color="gray">m</Text>
                                    </Flex>
                                </Flex>
                            )
                            : (
                                <TextField.Root
                                    id="countAmount" size="3"
                                    value={values.amount}
                                    onChange={(e) => {
                                        setValues({ ...values, amount: Number(e.target.value) })
                                    }}>
                                </TextField.Root>
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
