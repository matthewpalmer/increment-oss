import { Box, Flex, Progress, Text } from "@radix-ui/themes";
import type { DashboardWidget, Goal, Project } from "../../domain/types";
import type { WidgetProps } from "../widget-grid";
import type { DashboardWidgetProps } from "../widget-vendor";
import { goalForWidget } from "./widget-utils";
import { WidgetError } from "./widget-error";

export function ProgressBarWidget(props: DashboardWidgetProps) {
    const goal = goalForWidget(props.dashboardWidget, props.goals);

    if (!goal) {
        return <WidgetError {...props} />
    }

    return (
        <Flex direction="row" gap="4" align="center">
            <Text className="text-gray-400" size="2">Progress</Text>
            <Progress size="3" value={66}></Progress>
            { props.menuSlot }
        </Flex>
    )
}