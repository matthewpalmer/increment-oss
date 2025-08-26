import { Flex, Text } from "@radix-ui/themes";
import type { DashboardWidgetProps } from "../grid/widget-vendor";
import { WidgetError } from "./widget-error";
import { WidgetLoading } from "./widget-loading";
import { useLifetimeProgress } from "../../../data/hooks/useProgress";
import { useRef } from "react";
import { formatNumber } from "../../common/target-formatting";
import type { GoalAggregation, GoalUnit, OverallTotalWidgetConfig } from "../../../domain/types";

export function OverallTotalWidget(props: DashboardWidgetProps) {
    const atRef = useRef(new Date());

    let progressConfig: { unit: GoalUnit, aggregation: GoalAggregation } = {
        unit: 'seconds',
        aggregation: 'sum'
    };

    if (props.dashboardWidget.config) {
        const config = props.dashboardWidget.config as OverallTotalWidgetConfig;
        progressConfig.aggregation = config.aggregation;
        progressConfig.unit = config.unit;
    } 
    
    const {
        data: progress,
        isLoading,
        isError,
        error
    } = useLifetimeProgress(
        props.project.id,
        atRef.current,
        progressConfig.unit,
        progressConfig.aggregation
    );

    if (isLoading) return <WidgetLoading {...props} />
    if (isError) return <WidgetError {...props} />
    if (!progress) return <WidgetError {...props} message="Unable to load progress…" />

    return (
        <Flex direction="column" gap="4">
            <Flex direction="row" align="center" justify="between">
                <Text className="text-gray-400 font-semibold" size="2">
                    Lifetime Total
                </Text>

                {props.menuSlot}
            </Flex>
            
            <Flex direction="row" justify="center" align="center">
                <Text m="4" mb="6" weight="bold" size="8">
                    { formatNumber(progress.value, progressConfig.unit) }
                </Text>
            </Flex>
        </Flex>
    )
}