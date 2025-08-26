import { Flex, Text } from "@radix-ui/themes";
import type { DashboardWidgetProps } from "../grid/widget-vendor";
import { WidgetLoading } from "./widget-loading";
import { WidgetError } from "./widget-error";
import { useRef } from "react";
import { useStreakAt } from "../../../data/hooks/useStreaks";
import { goalForWidget } from "./widget-utils";

export function StreaksWidget(props: DashboardWidgetProps) {
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
        <Flex direction="column" gap="4">
            <Flex direction="row" align="center" justify="between">
                <Text className="text-gray-400 font-semibold" size="2">
                    { goal?.name }
                </Text>

                {props.menuSlot}
            </Flex>

            <Flex direction="column" justify="center" align="center" mb="3">
                <Text  weight="bold" className="text-5xl">
                    { streaks.length }
                </Text>
                <Text size="2" className="text-gray-400 font-medium">Current Streak</Text>
            </Flex>
        </Flex>
    )
}