import { Badge, Flex, Grid, IconButton, Text } from "@radix-ui/themes";
import type { DashboardWidgetProps } from "../grid/widget-vendor";
import { WidgetLoading } from "./widget-loading";
import { WidgetError } from "./widget-error";
import { useRef, useState } from "react";
import { useStreakAt } from "../../../data/hooks/useStreaks";
import { goalForWidget } from "./widget-utils";
import type { ProgressWindow } from "../../../domain/cadence/calendar";
import { makeCalendar } from "../../../data/calendar-context";
import { CaretDownIcon, CaretUpIcon, CheckIcon } from "@radix-ui/react-icons";

export function StreaksWidget(props: DashboardWidgetProps) {
    const [showHistory, setShowHistory] = useState(false);
    if (!props.dashboardWidget.goalId) {
        return <WidgetError {...props} />;
    }

    const atRef = useRef(new Date());
    const goal = goalForWidget(props.dashboardWidget, props.goals);

    const {
        data: streaks,
        isLoading,
        isError,
        error
    } = useStreakAt(
        props.project.id,
        props.dashboardWidget.goalId,
        atRef.current,
    );

    if (isLoading) return <WidgetLoading {...props} />
    if (isError) return <WidgetError {...props} />
    if (!streaks) return <WidgetError {...props} message="Unable to load streaks" />

    return (
        <Flex direction="column" gap="4" pb="4">
            <Flex direction="row" align="center" justify="between">
                <Text className="text-gray-400 font-semibold" size="2">
                    {goal?.name}
                </Text>

                {props.menuSlot}
            </Flex>

            <Flex direction="column" justify="center" align="center" mb="2">
                <Text weight="bold" className="text-5xl">
                    {streaks.length}
                </Text>
                <Text size="2" className="text-gray-400 font-medium">Current Streak</Text>
            </Flex>

            <Flex direction="row" justify="end" mt="-8">
                <IconButton color="gray" radius="full" size="1" variant="soft" onClick={() => setShowHistory(!showHistory)}>
                    {
                        showHistory
                            ? (<CaretUpIcon />)
                            : (<CaretDownIcon />)
                    }
                </IconButton>
            </Flex>

            {
                showHistory
                    ? (
                        <Flex gap="1" direction="row" wrap="wrap" align="center" justify="center">
                            {
                                (streaks).map(entry => {
                                    return (
                                        <Badge radius="large" key={entry.progress.window.start.toISOString()}>
                                            <CheckIcon />
                                            {formatWindowForStreak(entry.progress.window)}
                                        </Badge>
                                    )
                                })
                            }
                        </Flex>
                    )
                    : null
            }
        </Flex>
    )
}

const formatWindowForStreak = (window: ProgressWindow): string => {
    const calendar = makeCalendar();
    const daysInWindow = Math.round(Math.abs(window.end.getTime() - window.start.getTime()) / (1000 * 60 * 60 * 24));
    const monthLabels = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    if (daysInWindow === 1) {
        return `${calendar.dayOfMonth(window.start)} ${monthLabels[calendar.monthOfYear(window.start)]}`
    } else if (daysInWindow === 7) {
        return `${calendar.dayOfMonth(window.start)} ${monthLabels[calendar.monthOfYear(window.start)]}`
    } else {
        return `${monthLabels[calendar.monthOfYear(window.start)]}`
    }
}
