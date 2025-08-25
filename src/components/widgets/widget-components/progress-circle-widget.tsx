import { Flex, Heading, Text } from "@radix-ui/themes";
import { goalForWidget } from "./widget-utils";
import type { DashboardWidgetProps } from "../grid/widget-vendor";
import { WidgetError } from "./widget-error";
import { useEffect, useRef, useState } from "react";
import { getNameForColor } from "../../colors/colors";
import { RevolutionProgressRing } from "./revolution-progress-ring";
import { useProgressForGoalAt } from "../../../data/hooks/useProgress";
import { formatProgress } from "../../common/target-formatting";

export function ProgressCircleWidget(props: DashboardWidgetProps) {
    if (!props.dashboardWidget.goalId) {
        return <WidgetError {...props} />;
    }

    const atRef = useRef(new Date());
    const [displayProgress, setDisplayProgress] = useState(0);

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

    const animationDuration = 1.5;
    const totalProgress = Math.ceil(((progress || {}).percentage || 0) * 100);
    const turns = totalProgress / 100;
    const intervalMs = (animationDuration * 1000) / totalProgress;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDisplayProgress((previous) => {
                if (previous >= totalProgress) {
                    clearInterval(intervalId);
                    return previous;
                }

                return previous + 1;
            })
        }, intervalMs)

        return () => {
            clearInterval(intervalId)
        }
    }, [totalProgress, intervalMs])

    if (!progress) return <WidgetError {...props} message="Unable to load progress…" />

    if (!goal) {
        return <WidgetError {...props} />
    }

    return (
        <Flex direction="column" pb="2">
            <Flex direction="row" justify="between" align="center" mb="4">
                <Heading size="3">{ goal.name }</Heading>
                {props.menuSlot}
            </Flex>

            <Flex direction="row" height={`240px`} align="center" justify="center" position={"relative"}>                
                <RevolutionProgressRing
                    strokeWidth={25}
                    color={props.project.color || '#0091ff'}
                    trailColor={props.project.color || '#0091ff'}
                    trailOpacity={0.6}
                    duration={animationDuration}
                    turns={turns}
                />

                <div className="absolute w-full h-full">
                    <Flex height="100%" direction="column" justify="center" align="center">
                        <Text className="opacity-80 font-bold text-5xl" color={getNameForColor(props.project.color)}>{displayProgress}%</Text>
                        <Text size="1" color="gray">{formatProgress(progress)}</Text>
                    </Flex>
                </div>
            </Flex>
        </Flex>
    )
}