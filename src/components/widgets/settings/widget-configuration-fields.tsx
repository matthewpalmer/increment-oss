import { Flex, Select } from "@radix-ui/themes";
import type { GoalAggregation, GoalUnit, OverallTotalWidgetConfig, WidgetConfig } from "../../../domain/types";
import { Label } from "radix-ui";

export interface WidgetConfigurationFieldsProps {
    widgetConfig?: WidgetConfig;
    onWidgetConfigChanged: (widgetConfig: WidgetConfig) => void;
}

export function OverallTotalFields(props: WidgetConfigurationFieldsProps) {
    const config = props.widgetConfig as OverallTotalWidgetConfig;
    
    return (
        <Flex direction="column" gap="2">
            <Flex direction="row" justify="between" align="center" gap="2">
                <Label.Root className="text-sm" htmlFor="unit">
                    Unit
                </Label.Root>

                <Select.Root
                    value={config.unit}
                    defaultValue={config.unit}
                    onValueChange={(value: GoalUnit) => {
                        props.onWidgetConfigChanged({ ...config, unit: value })
                    }}>
                    <Select.Trigger style={{ minWidth: '212px' }} />

                    <Select.Content>
                        <Select.Item value="seconds">Time</Select.Item>
                        <Select.Item value="count">Count</Select.Item>
                        <Select.Item value="meters">Distance</Select.Item>
                        <Select.Item value="words">Words</Select.Item>
                    </Select.Content>
                </Select.Root>
            </Flex>

            <Flex direction="row" justify="between" align="center" gap="2">
                <Label.Root className="text-sm" htmlFor="aggregation">
                    Aggregation
                </Label.Root>

                <Select.Root
                    value={config.aggregation}
                    defaultValue={config.aggregation}
                    onValueChange={(value: GoalAggregation) => {
                        props.onWidgetConfigChanged({ ...config, aggregation: value })
                    }}>
                    <Select.Trigger style={{ minWidth: '212px' }} />

                    <Select.Content>
                        <Select.Item value="sum">Sum</Select.Item>
                        <Select.Item value="count">Sessions</Select.Item>
                        <Select.Item value="max">Maximum</Select.Item>
                    </Select.Content>
                </Select.Root>
            </Flex>
        </Flex>
    )
}