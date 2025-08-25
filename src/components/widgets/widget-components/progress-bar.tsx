import { Flex, Progress, Text } from "@radix-ui/themes";
import type { DashboardWidgetProps } from "../grid/widget-vendor";
import { goalForWidget } from "./widget-utils";
import { WidgetError } from "./widget-error";
import { WidgetLoading } from "./widget-loading";
import { useProgressForGoalAt } from "../../../data/hooks/useProgress";
import { useRef } from "react";
import { formatDuration } from "../../goals/goal-version-summary";

export function ProgressBarWidget(props: DashboardWidgetProps) {
    if (!props.dashboardWidget.goalId) {
        return <WidgetError {...props} />;
    }

    const atRef = useRef(new Date());
    const goal = goalForWidget(props.dashboardWidget, props.goals);

    const {
        data: progress,
        isLoading,
        isError,
        error
    } = useProgressForGoalAt(
        props.project.id,
        props.dashboardWidget.goalId,
        atRef.current
    );

    if (!goal) return <WidgetError {...props} />
    if (isLoading) return <WidgetLoading {...props} />
    if (isError) return <WidgetError {...props} />

    if (!progress) return <WidgetError {...props} message="Unable to load progress…" />

    return (
        <Flex direction="row" gap="4" align="center">
            <Text className="text-gray-400 font-semibold" size="2">
                { goal.name }
            </Text>
            <Progress size="3" value={Math.min(Math.ceil((progress.percentage || 0) * 100), 100)}></Progress>
            <Text className="text-gray-400" size="2">
                { formatDuration(progress.value) }
                {
                    progress.target
                    ? <span> / {formatDuration(progress.target)}</span>
                    : null
                }
            </Text>
            {props.menuSlot}
        </Flex>
    )
}