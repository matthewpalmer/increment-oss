import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { keys } from "../queries"
import { db } from "../persistence/db"
import { BuildNewSyncEvent, type DashboardWidget, type UUID } from "../../domain/types"
import { syncBus } from "../sync-bus"

export function useDashboardWidgets(projectId: string) {
    return useQuery({
        queryKey: keys.dashboardWidgets.listInProject(projectId),
        queryFn: () => {
            return db.dashboardWidgets.where('projectId').equals(projectId).sortBy('order')
        },
        staleTime: Infinity
    })
}


export function useCreateDashboardWidget() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (dashboardWidget: DashboardWidget) => {
            const id = await db.dashboardWidgets.add(dashboardWidget);
            return db.dashboardWidgets.get(id);
        },
        onSuccess: (dashboardWidget: DashboardWidget | undefined) => {
            if (!dashboardWidget) return;

            queryClient.invalidateQueries({ queryKey: keys.dashboardWidgets.listInProject(dashboardWidget.projectId) })
            
            syncBus.dispatchEvent(BuildNewSyncEvent(
                { type: 'create', data: dashboardWidget, table: 'dashboardWidgets' }
            ))
        }
    })
}

export function useUpdateDashboardWidget() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, patch }: { id: UUID, patch: Partial<DashboardWidget>}) => {
            await db.dashboardWidgets.update(id, patch);
            return db.dashboardWidgets.get(id)
        },
        onSuccess: (dashboardWidget: DashboardWidget | undefined) => {
            if (!dashboardWidget) return;
            queryClient.invalidateQueries({ queryKey: keys.dashboardWidgets.listInProject(dashboardWidget.projectId) })

            // TODO: invalidate the correct queries (only this ID?)
            // TODO: Dispatch an event to the sync bus
        }
    })
}

export function useDeleteDashboardWidget() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (dashboardWidget: DashboardWidget) => {
            const deleted = { ...dashboardWidget }
            await db.dashboardWidgets.delete(dashboardWidget.id);
            return deleted;
        },
        onSuccess: (deleted: DashboardWidget) => {
            queryClient.invalidateQueries({ queryKey: keys.dashboardWidgets.listInProject(deleted.projectId) })
            
            syncBus.dispatchEvent(BuildNewSyncEvent({
                type: 'delete',
                data: deleted,
                table: 'dashboardWidgets'
            }))
        }
    })
}

