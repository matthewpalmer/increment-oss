import { Flex, Text } from "@radix-ui/themes";
import type { DashboardWidgetProps } from "../grid/widget-vendor";
import { WidgetError } from "./widget-error";
import { WidgetLoading } from "./widget-loading";
import { useLifetimeProgress } from "../../../data/hooks/useProgress";
import { useRef } from "react";
import { formatNumber } from "../../common/target-formatting";
import { CreateUUID, type GoalAggregation, type GoalUnit, type LevelsWidgetConfig } from "../../../domain/types";
import { userColorsList } from "../../colors/colors";

export function LifetimeLevelsWidget(props: DashboardWidgetProps) {
    const atRef = useRef(new Date());

    let progressConfig: { unit: GoalUnit, aggregation: GoalAggregation, levels: any[] } = {
        unit: 'seconds',
        aggregation: 'sum',
        levels: []
    };

    if (props.dashboardWidget.config) {
        const config = props.dashboardWidget.config as LevelsWidgetConfig;
        progressConfig.aggregation = config.aggregation;
        progressConfig.unit = config.unit;
        progressConfig.levels = config.levels;
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

    const sortedLevels = [...progressConfig.levels].sort((a, b) => a.target < b.target ? -1 : 1);

    if (!sortedLevels.length) {
        return <WidgetError {...props} message="Widget does not have any levels set" />
    }

    const topLevel = sortedLevels[sortedLevels.length - 1];

    let highestCompletedLevelIndex = -1;

    for (let i = 0; i < sortedLevels.length; i++) {
        const level = sortedLevels[i];

        if (level.target <= progress.value) {
            highestCompletedLevelIndex = i;

        } else {
            break;
        }
    }

    const currentLevelIndex = highestCompletedLevelIndex + 1;
    const currentLevel = sortedLevels[currentLevelIndex];

    return (
        <Flex direction="column" align="center" gap="4">
            <Flex width="100%" direction="row" align="center" justify="between">
                <Text className="text-gray-400 font-semibold" size="2">
                    Levels
                </Text>

                {props.menuSlot}
            </Flex>

            <Flex direction="row" gap="2" align="end">
                {
                    sortedLevels.map((sl, index) => {
                        const pct = sl.target / topLevel.target;
                        const scaled = Math.ceil(pct * 200);
                        const width = 300 / sortedLevels.length - 20;
                        const isColored = index <= currentLevelIndex;

                        return (
                            <div
                                key={sl.key || CreateUUID()}
                                className="rounded-sm"
                                style={{
                                    width: width,
                                    height: scaled,
                                    background: isColored ? userColorsList[index].hex : 'rgba(120, 120, 150, 0.2)',

                                }}>
                                &nbsp;
                            </div>
                        )
                    })
                }
            </Flex>

            <Flex direction="row" align="center" gap="2" mt="2">
                <Text size="5" weight="bold">Level {currentLevelIndex + 1}</Text>
            </Flex>

            {
                currentLevel
                    ? (
                        <Flex direction="row" align="center" justify="between" gap="4" mb="4">
                            <Text size="2" className="text-gray-500">Until next level</Text>
                            <Text className="text-gray-500 font-semibold" size="2">
                                { formatNumber(currentLevel.target - progress.value, progressConfig.unit) }
                            </Text>
                        </Flex>
                    )
                    : null
            }

        </Flex>
    )
}