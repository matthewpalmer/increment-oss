import { Flex, Select, Text, TextField } from "@radix-ui/themes";
import { Label } from "radix-ui";
import type { GoalAggregation, GoalCadence, GoalUnit, GoalVersion, IncrementDuration } from "../../domain/types";
import { TimeInput } from "../common/time-input";

type GoalVersionFormProps = {
    goalVersion: GoalVersion,
    onGoalVersionChanged: (goalVersion: GoalVersion) => void
}

const TargetUnitsLabel: Record<GoalUnit, string> = {
    'count': 'times',
    'meters': 'meters',
    'words': 'words',
    'seconds': 'seconds' // Should not be used
};

export function GoalVersionForm(props: GoalVersionFormProps) {
    const handleTimeChange = (newTime: IncrementDuration) => {
        props.onGoalVersionChanged({ ...props.goalVersion, target: newTime })
    };

    const handleTargetChange = (target: number) => {
        props.onGoalVersionChanged({ ...props.goalVersion, target })
    };

    const handleUnitChanged = (unit: GoalUnit) => {
        props.onGoalVersionChanged({ ...props.goalVersion, unit })
    };

    const handleCadenceChanged = (cadence: GoalCadence) => {
        props.onGoalVersionChanged({ ...props.goalVersion, cadence })
    };

    const handleAggregationChanged = (aggregation: GoalAggregation) => {
        props.onGoalVersionChanged({ ...props.goalVersion, aggregation })
    };

    return (
        <Flex direction="column" gap="4" className="bg-gray-100 py-6 px-4 rounded-md">
            <Flex direction="row" justify="between" align="center" gap="2">
                <Label.Root className="text-sm" htmlFor="type">
                    Type
                </Label.Root>

                <Select.Root
                    size="2"
                    value={props.goalVersion.unit}
                    defaultValue={props.goalVersion.unit}
                    onValueChange={handleUnitChanged}>
                    <Select.Trigger style={{ minWidth: '212px' }} />

                    <Select.Content>
                        <Select.Item value="seconds">Time</Select.Item>
                        <Select.Item value="count">Count</Select.Item>
                        <Select.Item value="meters">Distance</Select.Item>
                        <Select.Item value="words">Words</Select.Item>
                    </Select.Content>
                </Select.Root>
            </Flex>

            <Flex direction="row" justify="between" align="center">
                <Label.Root className="text-sm" htmlFor="target">
                    Target
                </Label.Root>

                {
                    props.goalVersion.unit === 'seconds'
                        ? (
                            <TimeInput initialTime={0} onTimeChanged={handleTimeChange} />
                        )
                        : (
                            <Flex direction="row" align="center" gap="3">
                                <TextField.Root
                                    id="target"
                                    size="2"
                                    placeholder="0"
                                    value={props.goalVersion.target}
                                    onChange={(e) => {
                                        handleTargetChange(Number(e.currentTarget.value))
                                    }}>
                                </TextField.Root>

                                <Text className="text-gray-500 text-sm">
                                    {
                                        TargetUnitsLabel[props.goalVersion.unit]
                                    }
                                </Text>

                            </Flex>
                        )
                }
            </Flex>

            <Flex direction="row" justify="between" align="center" gap="2">
                <Label.Root className="text-sm" htmlFor="cadence">
                    Period
                </Label.Root>

                <Select.Root
                    size="2"
                    value={props.goalVersion.cadence}
                    defaultValue={props.goalVersion.cadence}
                    onValueChange={handleCadenceChanged}>
                    <Select.Trigger style={{ minWidth: '212px' }} />

                    <Select.Content>
                        <Select.Item value="daily">Daily</Select.Item>
                        <Select.Item value="weekly">Weekly</Select.Item>
                        <Select.Item value="monthly">Monthly</Select.Item>
                        <Select.Item value="lifetime">Lifetime</Select.Item>
                    </Select.Content>
                </Select.Root>
            </Flex>

            <Flex direction="row" justify="between" align="center" gap="2">
                <Label.Root className="text-sm" htmlFor="aggregation">
                    Aggregation
                </Label.Root>

                <Select.Root
                    size="2"
                    value={props.goalVersion.aggregation}
                    defaultValue={props.goalVersion.aggregation}
                    onValueChange={handleAggregationChanged}>
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