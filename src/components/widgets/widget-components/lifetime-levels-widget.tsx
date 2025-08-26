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

    return (
        <Flex direction="column" gap="4">
            <Flex direction="row" align="center" justify="between">
                <Text className="text-gray-400 font-semibold" size="2">
                    Levels
                </Text>

                {props.menuSlot}
            </Flex>
            
            <Flex direction="column" justify="center" align="center">
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

                <Text m="4" mb="6" weight="medium" size="3" color="gray">
                    { formatNumber(progress.value, progressConfig.unit) } – { sortedLevels[currentLevelIndex].label }
                </Text>
            </Flex>
        </Flex>
    )
}