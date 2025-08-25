import { useRef, useState, type ReactNode } from "react";
import type { DashboardWidgetProps } from "../grid/widget-vendor";
import { Button, Flex, Text } from "@radix-ui/themes";
import { makeCalendar } from "../../../data/calendar-context";
import { WidgetLoading } from "./widget-loading";
import { WidgetError } from "./widget-error";
import { type WindowGoalResult } from "../../../domain/progress/windows";
import { useCalendarProgress, type MonthMatrixEntry } from "../../../data/hooks/useProgress";
import { goalForWidget } from "./widget-utils";
import type { Calendar } from "../../../domain/cadence/calendar";
import { formatDuration } from "../../goals/goal-version-summary";
import type { Project } from "../../../domain/types";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";


function CalendarHeadingCell(props: { children: ReactNode }) {
    return (
        <Text className="w-12" align="center" color="gray" size="2">{props.children}</Text>
    )
}

function CalendarEntryCell(props: {
    calendar: Calendar,
    project: Project,
    entry: { day: MonthMatrixEntry; result: WindowGoalResult; }
}) {
    const hitTarget = props.entry.result.hitTarget;

    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            className="w-12 h-12 rounded-md p-0.5"
            style={{
                opacity: props.entry.day.isInsideMonth ? '1' : '0.35',
                backgroundColor: hitTarget ? props.project.color : 'transparent',
                color: hitTarget ? 'white' : 'inherit'
            }}>
            {
                props.entry.day.isInsideMonth
                    ? (<>
                        <Text mb="-1" size="3" weight="bold">{props.calendar.dayOfMonth(props.entry.day.start)}</Text>
                        <Text className="text-[11px]" style={{
                            color: hitTarget ? 'white' : '#8f8f8f'
                        }}>{formatDuration(props.entry.result.value)}</Text>
                    </>
                    )
                    : null
            }

        </Flex>
    )
}

export function CalendarWidget(props: DashboardWidgetProps) {
    if (!props.dashboardWidget.goalId) {
        return <WidgetError {...props} />;
    }

    // const atRef = useRef(new Date());
    const goal = goalForWidget(props.dashboardWidget, props.goals);
    const calendar = makeCalendar();

    const [visibleDate, setVisibleDate] = useState(new Date())

    const {
        data: calendarProgress,
        isLoading,
        isError,
        error
    } = useCalendarProgress(props.project.id, props.dashboardWidget.goalId, visibleDate)

    if (isLoading) return <WidgetLoading {...props} overrideHeight="300px" />
    if (isError) return <WidgetError {...props} message={error.message} />
    if (!calendarProgress) return <WidgetError {...props} message="Unable to load progress…" />

    return (
        <Flex direction="column" gap="1" align="center">
            <Flex className="w-full" direction="row" align="center" justify="between" gap="4" mb="3">
                <Flex className="w-full" direction="row" align="center" justify="center" gap="4">
                    <Button variant="ghost" onClick={() => {
                        setVisibleDate(calendar.addMonths(visibleDate, -1))
                    }}><ArrowLeftIcon /></Button>

                    <Text weight="bold">
                        {calendar.startOfMonth(visibleDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                    <Button variant="ghost" onClick={() => {
                        setVisibleDate(calendar.addMonths(visibleDate, 1))
                    }}><ArrowRightIcon /></Button>
                </Flex>

                <Flex direction="row" mr="0">
                {props.menuSlot}
                </Flex>
            </Flex>

            <Flex direction="row" gap="1">
                <CalendarHeadingCell>S</CalendarHeadingCell>
                <CalendarHeadingCell>M</CalendarHeadingCell>
                <CalendarHeadingCell>T</CalendarHeadingCell>
                <CalendarHeadingCell>W</CalendarHeadingCell>
                <CalendarHeadingCell>T</CalendarHeadingCell>
                <CalendarHeadingCell>F</CalendarHeadingCell>
                <CalendarHeadingCell>S</CalendarHeadingCell>
            </Flex>

            {
                calendarProgress.map((entries, index) => {
                    return (
                        <Flex gap="1" direction="row" key={`${visibleDate.toISOString()}-${index}`}>
                            {
                                entries.map((entry, entryIndex) => {
                                    return (
                                        <CalendarEntryCell key={`${index}-${entryIndex}`}
                                            calendar={calendar}
                                            project={props.project}
                                            entry={entry}>
                                        </CalendarEntryCell>
                                    )
                                })
                            }
                        </Flex>
                    )
                })
            }
        </Flex>
    )
}