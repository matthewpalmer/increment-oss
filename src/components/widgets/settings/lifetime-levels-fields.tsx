import { Flex, Select, TextField } from "@radix-ui/themes";
import type { GoalAggregation, GoalUnit, LevelsWidgetConfig } from "../../../domain/types";
import { Label } from "radix-ui";
import type { WidgetConfigurationFieldsProps } from "./widget-configuration-fields";

export function LifetimeLevelsFields(props: WidgetConfigurationFieldsProps) {
    const config = props.widgetConfig as LevelsWidgetConfig;

    const handleLevelLabelChange = (level, newLabel) => {

    };

    const handleLevelTargetChange = (level, target) => {

    };

    return (
        <Flex direction="column" gap="2">
            {
                config.levels.map(level => {
                    return (
                        <Flex key={`${level.label}-${level.target}`} direction="row" justify="between" align="center" gap="2">
                            <Label.Root className="text-sm">
                                Level
                            </Label.Root>

                            <TextField.Root
                                size="2"
                                placeholder="Label"
                                value={level.label}
                                style={{ maxWidth: '100px' }}
                                onChange={(e) => {
                                    handleLevelLabelChange(level, e.currentTarget.value)
                                }}>
                            </TextField.Root>

                            <TextField.Root
                                size="2"
                                placeholder="Target"
                                value={level.target}
                                style={{ maxWidth: '100px' }}
                                onChange={(e) => {
                                    handleLevelTargetChange(level, e.currentTarget.value)
                                }}>
                            </TextField.Root>
                        </Flex>
                    )
                })
            }

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
