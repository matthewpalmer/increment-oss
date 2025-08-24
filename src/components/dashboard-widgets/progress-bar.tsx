import { Box, Flex, Progress, Text } from "@radix-ui/themes";
import type { DashboardWidget, Goal, Project, TimeBlock } from "../../domain/types";
import type { WidgetProps } from "../widget-grid";
import type { DashboardWidgetProps } from "../widget-vendor";
import { goalForWidget } from "./widget-utils";
import { WidgetError } from "./widget-error";
import { useTimeBlocks } from "../../data/hooks/useTimeBlocks";
import { WidgetLoading } from "./widget-loading";



const calculateProgress = (dashboardWidget: DashboardWidget, timeBlocks: TimeBlock[], goal: Goal) => {
    // id: zUUID,
    // projectId: zUUID,
    // type: zTimeBlockType,
    // amount: zTimeBlockAmount, // Varies based on `type`, either seconds or count
    // createdAt: zTimestamp,
    // startedAt: zTimestamp,
    // notes: z.string().default(""),

    // TODO: Get the goal version for the given date
    // id: zUUID,
    // goalId: zUUID,
    // target: zTimeBlockAmount,
    // validFrom: zTimestamp,
    // validTo: zTimestamp,
    // unit: zGoalUnit,
    // cadence: zGoalCadence,
    // aggregation: zGoalAggregation,
    // notes: z.string().default(""),

    const relevant = timeBlocks.filter(timeBlock => {

    })
};

export function ProgressBarWidget(props: DashboardWidgetProps) {
    const goal = goalForWidget(props.dashboardWidget, props.goals);
    
    const {
        data: timeBlocks = [],
        isLoading,
        isError,
        error
    } = useTimeBlocks(props.project.id);

    if (!goal) return <WidgetError {...props} />
    if (isLoading) return <WidgetLoading {...props} />
    if (isError) return <WidgetError {...props} />



    return (
        <Flex direction="row" gap="4" align="center">
            <Text className="text-gray-400" size="2">Progress</Text>
            <Progress size="3" value={66}></Progress>
            { props.menuSlot }
        </Flex>
    )
}