import { CalendarIcon } from "@radix-ui/react-icons";
import { Button, Flex, Popover } from "@radix-ui/themes";
import { useState } from "react";
import { DayPicker } from "react-day-picker";

interface DatePickerProps {
    selectedDay?: Date;
    onSelectedDayChange: (date: Date | undefined) => void;
}

export function DatePicker(props: DatePickerProps) {
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const formatted = (props.selectedDay || new Date).toISOString().split('T')[0];

    return (
        <div>
            <Popover.Root open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <Popover.Trigger>
                    <Button variant="soft" size="3">
                        <CalendarIcon />
                        { formatted }
                    </Button>
                </Popover.Trigger>

                <Popover.Content size="1">
                    <Flex>
                        <DayPicker
                            animate
                            timeZone="UTC"
                            mode="single"
                            selected={props.selectedDay}
                            onSelect={(v) => {
                                setDatePickerOpen(false)
                                props.onSelectedDayChange(v)
                            }}
                            // Styled with variables in index.css
                        />
                    </Flex>
                </Popover.Content>
            </Popover.Root>
        </div>
    )
}