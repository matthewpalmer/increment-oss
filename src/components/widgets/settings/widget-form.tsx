import { Label } from "radix-ui";
import { Button, Flex, Select, Text, TextField } from "@radix-ui/themes";
import { CreateUUID, zDashboardWidget, type DashboardWidget, type DashboardWidgetType, type UUID, type WidgetConfig } from "../../../domain/types";
import { useEffect, useState, type ReactNode, type ComponentType } from "react";
import type { ZodError } from "zod";
import { ErrorsList } from "../../common/errors-list";
import { useCreateDashboardWidget, useDeleteDashboardWidget, useUpdateDashboardWidget } from "../../../data/hooks/useDashboardWidgets";
import { useGoals } from "../../../data/hooks/useGoals";
import { type WidgetConfigurationFieldsProps } from "./widget-configuration-fields";
import { BadgeIcon, BarChartIcon, CalendarIcon, LightningBoltIcon, ListBulletIcon, StopwatchIcon, TimerIcon } from "@radix-ui/react-icons";
import { OverallTotalFields } from "./overall-total-fields";
import { LifetimeLevelsFields } from "./lifetime-levels-fields";

export type WidgetFormProps =
    | { mode: 'create', projectId: UUID, onFormSaved: () => void }
    | { mode: 'edit', projectId: UUID, dashboardWidget: DashboardWidget, onFormSaved: () => void }

const zNewDashboardWidgetInput = zDashboardWidget.omit({ id: true });
const zEditDashboardWidgetInput = zDashboardWidget.omit({ id: true }).partial();

type SettingsConfigurationType = {
    needsGoalId: boolean,
    xSize: number, 
    ySize: number,
    extraFields?: ComponentType<WidgetConfigurationFieldsProps>,
    defaultExtraFields?: WidgetConfig
}

const SettingsConfiguration: Record<DashboardWidgetType, SettingsConfigurationType> = {
    'goals-list': {
        needsGoalId: false,
        xSize: 2,
        ySize: 2,
    },
    'progress-bar': {
        needsGoalId: true,
        xSize: 4, 
        ySize: 1
    },
    'progress-circle': {
        needsGoalId: true,
        xSize: 2, 
        ySize: 2
    },
    'total-time': {
        needsGoalId: false,
        xSize: 2,
        ySize: 1
    },
    'calendar': {
        needsGoalId: true,
        xSize: 2,
        ySize: 2
    },
    'streaks': {
        needsGoalId: true,
        xSize: 2,
        ySize: 1,
    },
    'overall-total': {
        needsGoalId: false,
        xSize: 2,
        ySize: 1,
        extraFields: OverallTotalFields,
        defaultExtraFields: {
            unit: 'seconds',
            aggregation: 'sum'
        }
    },
    'lifetime-levels': {
        needsGoalId: false,
        xSize: 2,
        ySize: 2,
        extraFields: LifetimeLevelsFields,
        defaultExtraFields: {
            unit: 'seconds',
            aggregation: 'sum',
            levels: [
                { target: 3000000, label: 'Level 1' },
                { target: 6000000, label: 'Level 2' },
                { target: 9000000, label: 'Level 3' },
                { target: 12000000, label: 'Level 4' },
            ]
        }
    }
};

export function WidgetForm(props: WidgetFormProps) {
    const isNewWidget = props.mode === 'create';

    const {
        data: goals = [],
        isLoading: isLoadingGoals,
        isError: isErrorGoals,
        error: errorGoals
    } = useGoals(props.projectId);

    const createDashboardWidget = useCreateDashboardWidget();
    const updateDashboardWidget = useUpdateDashboardWidget();
    const deleteDashboardWidget = useDeleteDashboardWidget();

    const [values, setValues] = useState(() => {
        if (isNewWidget) {
            const type = 'progress-bar' as DashboardWidgetType
            
            return {
                type: type,
                projectId: props.projectId,
                goalId: '',
                xSize: SettingsConfiguration[type].xSize,
                ySize: SettingsConfiguration[type].ySize,
                config: undefined
            }
        }

        return { ...props.dashboardWidget }
    });

    const [error, setError] = useState<ZodError | undefined>(undefined);

    const handleSave = (event: React.FormEvent) => {
        event.preventDefault();

        if (isNewWidget) {
            const valuesCopy = { ...values };

            if (!SettingsConfiguration[values.type].needsGoalId) {
                valuesCopy.goalId = undefined;
            }

            const parsed = zNewDashboardWidgetInput.safeParse(valuesCopy);

            if (!parsed.success) {
                return setError(parsed.error);
            }

            createDashboardWidget.mutate({
                id: CreateUUID(),
                ...parsed.data
            })

            return props.onFormSaved();
        }

        const parsed = zEditDashboardWidgetInput.safeParse(values);
        if (!parsed.success) return setError(parsed.error);

        updateDashboardWidget.mutate({
            id: props.dashboardWidget.id,
            patch: parsed.data
        });

        props.onFormSaved();
    };

    const handleDeleteWidget = () => {
        if (props.mode === 'create') return;

        const proceed = confirm('Are you sure you want to delete this widget?');
        if (!proceed) return;

        deleteDashboardWidget.mutate(props.dashboardWidget);
        props.onFormSaved();
    };

    const handleWidgetConfigChanged = (updated: WidgetConfig) => {
        const newValues = { ...values };
        newValues.config = { ...updated };
        setValues(newValues)
    }

    useEffect(() => {
        if (isNewWidget && !values.goalId && goals.length > 0) {
            setValues({ ...values, goalId: goals[0].id })
        }
    }, [isNewWidget, goals])

    if (isLoadingGoals) {
        return <p>Loading…</p>
    }

    if (isErrorGoals) {
        return <p>An error occurred: {errorGoals.message}</p>
    }

    const ExtraFieldsComponent = SettingsConfiguration[values.type].extraFields;

    return (
        <form onSubmit={handleSave} autoComplete="off">
            <Flex direction="column" gap="4">
                <Flex direction="row" justify="between" align="center" gap="2">
                    <Label.Root className="text-sm" htmlFor="type">
                        Type
                    </Label.Root>

                    <Select.Root
                        value={values.type}
                        defaultValue={values.type}
                        onValueChange={(type: DashboardWidgetType) => {
                            let defaultConfig = undefined;
                            
                            if (SettingsConfiguration[type].defaultExtraFields) {
                                defaultConfig = { ...SettingsConfiguration[type].defaultExtraFields }
                            }

                            const newValues = { ...values };
                            newValues.xSize = SettingsConfiguration[type].xSize
                            newValues.ySize = SettingsConfiguration[type].ySize
                            newValues.type = type;
                            newValues.config = defaultConfig;

                            setValues(newValues)
                        }}>
                        <Select.Trigger style={{ minWidth: '212px' }} />

                        <Select.Content>
                            <Select.Item value="progress-bar">
                                <Flex align="center" gap="2">
                                    <BadgeIcon />
                                    <Text>Progress Bar</Text>
                                </Flex>
                            </Select.Item>
                            
                            <Select.Item value="progress-circle">
                                <Flex align="center" gap="2">
                                    <TimerIcon />
                                    <Text>Progress Ring</Text>
                                </Flex>
                            </Select.Item>
                            
                            <Select.Item value="goals-list">
                                <Flex align="center" gap="2">
                                    <ListBulletIcon />
                                    <Text>Goals List</Text>
                                </Flex>
                            </Select.Item>

                            
                            <Select.Item value="calendar">
                                <Flex align="center" gap="2">
                                    <CalendarIcon />
                                    <Text>Calendar</Text>
                                </Flex>
                            </Select.Item>

                            <Select.Item value="streaks">
                                <Flex align="center" gap="2">
                                    <LightningBoltIcon />
                                    <Text>Streaks</Text>
                                </Flex>
                            </Select.Item>

                            <Select.Item value="overall-total">
                                <Flex align="center" gap="2">
                                    <StopwatchIcon />
                                    <Text>Overall Total</Text>
                                </Flex>
                            </Select.Item>

                            <Select.Item value="lifetime-levels">
                                <Flex align="center" gap="2">
                                    <BarChartIcon />
                                    <Text>Levels</Text>
                                </Flex>
                            </Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>

                <Flex direction="row" justify="between" align="center" gap="2">
                    <Label.Root className="text-sm" htmlFor="type">
                        Size
                    </Label.Root>

                    <Flex direction="row" align="center" gap="3">
                        <TextField.Root
                            id="xSize"
                            size="2"
                            placeholder="0"
                            value={values.xSize}
                            style={{ maxWidth: '50px' }}
                            onChange={(e) => {
                                setValues({ ...values, xSize: Number(e.currentTarget.value) })
                            }}>
                        </TextField.Root>

                        <Text className="text-gray-500 text-sm">×</Text>

                        <TextField.Root
                            id="ySize"
                            size="2"
                            placeholder="0"
                            value={values.ySize}
                            style={{ maxWidth: '50px' }}
                            onChange={(e) => {
                                setValues({ ...values, ySize: Number(e.currentTarget.value) })
                            }}>
                        </TextField.Root>
                    </Flex>
                </Flex>

                {
                    SettingsConfiguration[values.type].needsGoalId
                        ? (
                            <Flex direction="row" justify="between" align="center" gap="2">
                                <Label.Root className="text-sm" htmlFor="type">
                                    Goal
                                </Label.Root>

                                {
                                    goals.length === 0
                                        ? <Text color="red">Create a goal first…</Text>
                                        : (
                                            <Select.Root
                                                value={values.goalId || goals[0].id}
                                                onValueChange={(goalId: UUID) => {
                                                    setValues({
                                                        ...values,
                                                        goalId: goalId
                                                    })
                                                }}>
                                                <Select.Trigger style={{ minWidth: '212px', maxWidth: '320px' }} />

                                                <Select.Content>
                                                    {
                                                        goals.map(goal => {
                                                            return (<Select.Item key={goal.id} value={goal.id}>{goal.name}</Select.Item>)
                                                        })
                                                    }
                                                </Select.Content>
                                            </Select.Root>
                                        )
                                }
                            </Flex>
                        )
                        : null
                }

                {
                    ExtraFieldsComponent
                    ? <ExtraFieldsComponent widgetConfig={values.config} onWidgetConfigChanged={handleWidgetConfigChanged} />
                    : null
                }

                <Flex direction="row" justify="between" align="center">
                    <Button type="submit" size="3">
                        {
                            isNewWidget
                                ? 'Add Widget'
                                : 'Save Widget'
                        }
                    </Button>

                    {
                        isNewWidget
                            ? null
                            : (
                                <Button variant="soft" color="red" onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteWidget();
                                }}>Delete</Button>
                            )
                    }
                </Flex>

                {error ? <ErrorsList error={error} /> : null}
            </Flex>
        </form>
    )
}