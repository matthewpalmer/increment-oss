import { Flex, Text } from "@radix-ui/themes";
import type { DashboardWidgetProps } from "../grid/widget-vendor";
import { WidgetError } from "./widget-error";
import { WidgetLoading } from "./widget-loading";
import { useLifetimeProgress } from "../../../data/hooks/useProgress";
import { useRef } from "react";
import { formatDuration } from "../../goals/goal-version-summary";

export function TotalTimeWidget(props: DashboardWidgetProps) {
    

    const atRef = useRef(new Date());
    
    const {
        data: progress,
        isLoading,
        isError,
        error
    } = useLifetimeProgress(
        props.project.id,
        atRef.current,
    );

    if (isLoading) return <WidgetLoading {...props} />
    if (isError) return <WidgetError {...props} />

    if (!progress) return <WidgetError {...props} message="Unable to load progress…" />

    return (
        <Flex direction="column" gap="4">
            <Flex direction="row" align="center" justify="between">
                <Text className="text-gray-400 font-semibold" size="2">
                    Total Time
                </Text>

                {props.menuSlot}
            </Flex>
            
            <Flex direction="row" justify="center" align="center">
                <Text m="4" mb="6" weight="bold" size="8">
                    { formatDuration(progress.seconds) }
                </Text>
            </Flex>
        </Flex>
    )
}