import { createFileRoute } from '@tanstack/react-router';
import { type DashboardWidget } from '../../../../domain/types';
import { fetchProject, useProject } from '../../../../data/hooks/useProjects';
import { useGoals } from '../../../../data/hooks/useGoals';
import { Dialog, Text, Theme } from '@radix-ui/themes';
import { useState } from 'react';
import { getNameForColor } from '../../../../components/colors/colors';
import { WidgetGrid } from '../../../../components/widgets/grid/widget-grid';
import { useDashboardWidgets } from '../../../../data/hooks/useDashboardWidgets';
import { WidgetForm } from '../../../../components/widgets/settings/widget-form';
import { WidgetVendor } from '../../../../components/widgets/grid/widget-vendor';
import { ProjectHeader } from '../../../../components/projects/project-header';

export const Route = createFileRoute('/app/projects/$projectId/')({
    component: ProjectDetails,
    loader: async (ctx) => {
        const project = await fetchProject(ctx.params.projectId);
        return {
            project
        }
    },
    head: (ctx) => ({
        meta: [
            { title: `${ctx.loaderData?.project?.name || ''} | Increment` }
        ]
    })
})

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
