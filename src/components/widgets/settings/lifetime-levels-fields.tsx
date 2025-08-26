import { Badge, Flex, Select, Text, TextField, Button, IconButton, Popover } from "@radix-ui/themes";
import { CreateUUID, type GoalAggregation, type GoalUnit, type LevelsWidgetConfig } from "../../../domain/types";
import { Label } from "radix-ui";
import type { WidgetConfigurationFieldsProps } from "./widget-configuration-fields";
import { formatNumber } from "../../common/target-formatting";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { TimeInput } from "../../common/time-input";

interface NewLevelFormProps {
    unit: GoalUnit;
    onNewLevelSaved(newLevel: { label: string, target: number }): void;
}


export type LifetimeLevelItem = {
    target: number;
    label: string;
    key: string;
}


function NewLevelForm(props: NewLevelFormProps) {
    const [newLevel, setNewLevel] = useState<LifetimeLevelItem>({
        label: '',
        target: 0,
        key: CreateUUID()
    })

    const [error, setError] = useState('');

    const validateLevel = (level: LifetimeLevelItem): { valid: boolean, error?: string } => {
        if (!level.label) {
            return { valid: false, error: 'Level must have a label'}
        }
        
        if (level.target <= 0) {
            return { valid: false, error: 'Level must be above zero' }
        }

        return { valid: true }
    };

    return (
        <Flex direction="column" gap="2">
            <Flex direction="row" align="center" gap="2">
                <TextField.Root
                    size="2"
                    placeholder="Level name…"
                    value={newLevel.label}
                    onChange={(e) => {
                        setNewLevel({ ...newLevel, label: e.currentTarget.value })
                    }}>
                </TextField.Root>

                {
                    props.unit === 'seconds'
                        ? (
                            <TimeInput initialTime={0} onTimeChanged={(time) => {
                                setNewLevel({ ...newLevel, target: time })
                            }} />
                        )
                        : (
                            <TextField.Root
                                size="2"
                                placeholder="4000 words"
                                value={newLevel.target}
                                onChange={(e) => {
                                    setNewLevel({ ...newLevel, target: Number(e.currentTarget.value) })
                                }}>
                            </TextField.Root>
                        )
                }

                <Button size="1" onClick={(e) => {
                    e.preventDefault();

                    const validation = validateLevel(newLevel);

                    if (validation.valid) {
                        props.onNewLevelSaved({ ...newLevel })
                    } else {
                        setError(validation.error || 'An error occurred');
                    }
                }}>
                    Save
                </Button>
            </Flex>

            <Text size="2" color="red">{error}</Text>
        </Flex>
    )
}

interface LevelsListProps {
    levels: any[];
    unit: GoalUnit;
    aggregation: GoalAggregation;
    handleRemoveLevel(level: any): void;
}

function LevelsList(props: LevelsListProps) {
    return (
        <Flex direction="row" className="w-full" justify="end" wrap="wrap" gap="1">
            {
                props.levels.map(level => {
                    return (
                        <Badge key={level.key}>
                            <Flex direction="row" align="center" gap="2">
                                <Text weight="bold">{level.label}</Text>
                                <Text>{formatNumber(level.target, props.unit, 'short')}</Text>
                                <IconButton
                                    size="1"
                                    radius="full"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        props.handleRemoveLevel(level)
                                    }}>
                                    <Cross2Icon width="10" height="10" />
                                </IconButton>
                            </Flex>
                        </Badge>
                    )
                })
            }
        </Flex>
    )
}

export function LifetimeLevelsFields(props: WidgetConfigurationFieldsProps) {
    const config = props.widgetConfig as LevelsWidgetConfig;

    const [showNewLevelForm, setShowNewLevelForm] = useState(false);

    const unit = config.unit;
    const aggregation = config.aggregation;

    const handleRemoveLevel = (level: LifetimeLevelItem) => {
        props.onWidgetConfigChanged({
            ...config,
            levels: config.levels.filter(c => c.key !== level.key)
        })
    };

    return (
        <Flex direction="column" gap="4">
            <Flex direction="row" gap="2" align="center" justify="between">
                <Label.Root className="text-sm" htmlFor="levels">
                    Levels
                </Label.Root>

                <LevelsList
                    levels={config.levels}
                    unit={unit}
                    aggregation={aggregation}
                    handleRemoveLevel={handleRemoveLevel} />

                <Popover.Root open={showNewLevelForm} onOpenChange={setShowNewLevelForm}>
                    <Popover.Trigger>
                        <Button size="1">Add</Button>
                    </Popover.Trigger>

                    <Popover.Content align="end">
                        <NewLevelForm unit={unit} onNewLevelSaved={(newLevel: LifetimeLevelItem) => {
                            console.log('SAVING LEVEL', newLevel);

                            const newLevels = config.levels.concat({ ...newLevel });
                            newLevels.sort((a, b) => a.target < b.target ? -1 : 1);

                            props.onWidgetConfigChanged({
                                ...config,
                                levels: newLevels
                            })

                            setShowNewLevelForm(false);
                        }} />
                    </Popover.Content>
                </Popover.Root>
            </Flex>

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
        </Flex >
    )
}
