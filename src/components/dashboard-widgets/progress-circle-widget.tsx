import { Box, Flex } from "@radix-ui/themes";
import type { DashboardWidget, Goal, Project } from "../../domain/types";
import { goalForWidget } from "./widget-utils";
import type { DashboardWidgetProps } from "../widget-vendor";
import { WidgetError } from "./widget-error";

export function ProgressCircleWidget(props: DashboardWidgetProps) {
    const goal = goalForWidget(props.dashboardWidget, props.goals);

    if (!goal) {
        return <WidgetError {...props} />
    }

    return (
        <h1>Progress Circleeeee Widget!</h1>
    )
}