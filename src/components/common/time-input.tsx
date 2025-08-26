import { Flex, Text, TextField } from "@radix-ui/themes";
import type { IncrementDuration } from "../../domain/types";
import { useEffect, useState } from "react";
import { convertDurationToHoursMinutes, convertHoursMinutesToDuration } from "../../domain/time-utils";

interface TimeInputProps {
    initialTime: IncrementDuration;
    onTimeChanged: (time: IncrementDuration) => void;
}

export function TimeInput(props: TimeInputProps) {
    const [timeHours, setTimeHours] = useState('');
    const [timeMinutes, setTimeMinutes] = useState('');

    useEffect(() => {
        if (!props.initialTime) return;

        const { hours, minutes } = convertDurationToHoursMinutes(props.initialTime);
        setTimeHours(hours);
        setTimeMinutes(minutes);
    }, [])

    const handleChange = (hours: string, minutes: string) => {
        const duration = convertHoursMinutesToDuration(hours, minutes);
        props.onTimeChanged(duration);
    };

    return (
        <Flex direction="row" align="center" gap="3">
            <Flex direction="row" align="center" gap="1" width="100px">
                <TextField.Root
                    id="timeHours"
                    value={timeHours}
                    placeholder="0"
                    onChange={(e) => {
                        setTimeHours(e.target.value);
                        handleChange(e.target.value, timeMinutes);
                    }}>
                </TextField.Root>
                <Text color="gray" className="text-sm">hours</Text>
            </Flex>

            <Flex direction="row" align="center" gap="1" width="100px">
                <TextField.Root
                    id="timeMinutes"
                    value={timeMinutes}
                    placeholder="0"
                    onChange={(e) => {
                        setTimeMinutes(e.target.value);
                        handleChange(timeHours, e.target.value);
                    }}>
                </TextField.Root>
                <Text color="gray" className="text-sm">mins</Text>
            </Flex>
        </Flex>
    )
}