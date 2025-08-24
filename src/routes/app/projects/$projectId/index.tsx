import { createFileRoute, Link } from '@tanstack/react-router'
import { useCreateTimeBlock, useTimeBlocks } from '../../../../data/hooks/useTimeBlocks';
import { CreateUUID, type DashboardWidget, type Project } from '../../../../domain/types';
import { IncrementDateTimeNow, TimeDurationToString, TimestampToLocalDate, TimestampToLocalTime } from '../../../../domain/time-utils';
import { useProject } from '../../../../data/hooks/useProjects';
import { useCreateGoal, useDeleteGoal, useGoals } from '../../../../data/hooks/useGoals';
import { Button, Dialog, DropdownMenu, Flex, Heading, Separator, Text, Theme } from '@radix-ui/themes';
import { ProjectForm } from '../../../../components/project-form';
import { useState } from 'react';
import { getNameForColor } from '../../../../components/colors';
import { GoalForm } from '../../../../components/goal-form';
import { GoalsListWidget } from '../../../../components/dashboard-widgets/goals-list-widget';
import { Widget, WidgetGrid } from '../../../../components/widget-grid';
import { TimeBlockForm } from '../../../../components/time-block-form';
import { DashboardIcon, DrawingPinIcon, Pencil1Icon, PlusIcon, SewingPinFilledIcon, SewingPinIcon } from '@radix-ui/react-icons';
import { ProgressBarWidget } from '../../../../components/dashboard-widgets/progress-bar';
import { useDashboardWidgets } from '../../../../data/hooks/useDashboardWidgets';
import { WidgetForm } from '../../../../components/widget-form';
import { WidgetVendor } from '../../../../components/widget-vendor';

export const Route = createFileRoute('/app/projects/$projectId/')({
    component: ProjectDetails
})

function TimeBlocksList({ projectId }: { projectId: string }) {
    const {
        data: timeBlocks = [],
        isLoading,
        isError,
        error
    } = useTimeBlocks(projectId);

    if (isLoading) {
        return (
            <div>
                Loading…
            </div>
        )
    }

    if (isError) {
        return (
            <div>
                An error occurred: {error.message}
            </div>
        )
    }

    return (
        <table className='border-collapse border border-gray-400'>
            <thead>
                <tr>
                    <th className='border border-gray-300'>ID</th>
                    <th className='border border-gray-300'>Amount</th>
                    <th className='border border-gray-300'>Time</th>
                    <th className='border border-gray-300'>Date</th>
                    <th className='border border-gray-300'>Notes</th>
                </tr>
            </thead>
            <tbody>
                {
                    timeBlocks.map(timeBlock => {


                        return (
                            <tr key={timeBlock.id}>
                                <td className="p-2 border border-gray-300">{timeBlock.id.split('-')[0]}</td>
                                <td className="p-2 border border-gray-300">{TimeDurationToString(timeBlock.amount)}</td>
                                <td className="p-2 border border-gray-300">{TimestampToLocalTime(timeBlock.startedAt)}</td>
                                <td className="p-2 border border-gray-300">{TimestampToLocalDate(timeBlock.startedAt)}</td>
                                <td className="p-2 border border-gray-300">{timeBlock.notes}</td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}

function ProjectHeader({ project }: { project: Project }) {
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [timeBlockDialogOpen, setTimeBlockDialogOpen] = useState(false);
    const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
    const [goalDialogOpen, setGoalDialogOpen] = useState(false);

    return (
        <Flex direction="row" justify="between" align="center" mt="2" mb="6" pb="4" className='border-b-2 border-dotted' style={{ borderColor: project.color }}>
            <Heading size="8" color={getNameForColor(project.color)}>{project.name}</Heading>

            <Flex direction="row" align="center" gap="3">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Button variant="soft">Customize <DropdownMenu.TriggerIcon /></Button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content>
                        <DropdownMenu.Item onClick={() => setProjectDialogOpen(true)}><Pencil1Icon /> Edit Project</DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => setGoalDialogOpen(true)}><SewingPinIcon /> Add Goal</DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => setWidgetDialogOpen(true)}><DashboardIcon /> Add Widget</DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>

                <Button size="2" onClick={() => setTimeBlockDialogOpen(!timeBlockDialogOpen)}><PlusIcon /> Add Entry</Button>

                <Dialog.Root open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                    <Dialog.Content>
                        <Dialog.Title size="6">{project?.name}</Dialog.Title>
                        <ProjectForm mode="edit" onFormSaved={() => setProjectDialogOpen(false)} project={project}></ProjectForm>
                    </Dialog.Content>
                </Dialog.Root>

                <Dialog.Root open={widgetDialogOpen} onOpenChange={setWidgetDialogOpen}>
                    <Dialog.Content>
                        <Dialog.Title size="6">Add Widget</Dialog.Title>
                        <WidgetForm mode="create" projectId={project.id} onFormSaved={() => setWidgetDialogOpen(false)} />
                    </Dialog.Content>
                </Dialog.Root>

                <Dialog.Root open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                    <Dialog.Content>
                        <Dialog.Title size="6">Add Goal</Dialog.Title>
                        <GoalForm
                            mode="create"
                            projectId={project.id}
                            onFormSaved={() => setGoalDialogOpen(false)}>
                        </GoalForm>
                    </Dialog.Content>
                </Dialog.Root>

                <Dialog.Root open={timeBlockDialogOpen} onOpenChange={setTimeBlockDialogOpen}>
                    <Dialog.Content>
                        <Dialog.Title size="6">Add Entry</Dialog.Title>
                        <TimeBlockForm mode="create" onFormSaved={() => setTimeBlockDialogOpen(false)} projectId={project.id}></TimeBlockForm>
                    </Dialog.Content>
                </Dialog.Root>
            </Flex>
        </Flex>
    )
}

function ProjectDetails() {
    const { projectId } = Route.useParams();
    const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
    const [editingDashboardWidget, setEditingDashboardWidget] = useState<DashboardWidget | undefined>(undefined);

    const {
        data: project,
        isLoading: isLoadingProject,
        isError: isErrorProject,
        error: projectError
    } = useProject(projectId);

    const {
        data: dashboardWidgets = [],
        isLoading: widgetsLoading,
        isError: widgetsHasError,
        error: widgetsError
    } = useDashboardWidgets(projectId);

    const {
        data: goals = [],
        isLoading: goalsLoading,
        isError: goalsHasError,
        error: goalsError
    } = useGoals(projectId);

    if (isLoadingProject || widgetsLoading || goalsLoading) return <p>Loading…</p>
    if (isErrorProject) return <p>An error occurred the project: {projectError.message}</p>
    if (widgetsHasError) return <p>An error occurred loading widgets: {widgetsError.message}</p>
    if (goalsHasError) return <p>An error occurred loading goals: {goalsError.message}</p>

    if (!project) return <p>Unable to load project</p>

    return (
        <div className='bg-white w-screen h-screen'>
            <div className='max-w-4xl m-auto px-2'>
                <Theme accentColor={getNameForColor(project.color)}>

                    <ProjectHeader project={project} />

                    <WidgetGrid>
                        {
                            dashboardWidgets.map((dashboardWidget) => {
                                return (
                                    <WidgetVendor
                                        key={dashboardWidget.id}
                                        widget={dashboardWidget}
                                        project={project}
                                        goals={goals}
                                        onSettingsActivated={(widget) => {
                                            setEditingDashboardWidget(widget)
                                            setWidgetDialogOpen(true);
                                        }} />
                                )
                            })
                        }
                    </WidgetGrid>
                    {/* { mode: 'edit', projectId: UUID, dashboardWidget: DashboardWidget, onFormSaved: () => void } */}
                    <Dialog.Root open={widgetDialogOpen} onOpenChange={setWidgetDialogOpen}>
                        <Dialog.Content>
                            <Dialog.Title size="6">Edit Widget</Dialog.Title>

                            {
                                editingDashboardWidget
                                    ? (
                                        <WidgetForm
                                            mode="edit"
                                            projectId={project.id}
                                            dashboardWidget={editingDashboardWidget}
                                            onFormSaved={() => setWidgetDialogOpen(false)} />
                                    )
                                    : (<Text color="red">No dashboard widget selected</Text>)
                            }
                        </Dialog.Content>
                    </Dialog.Root>
                </Theme>
            </div>
        </div>
    )
}
