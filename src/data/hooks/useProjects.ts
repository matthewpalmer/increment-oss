import { BuildNewSyncEvent, type Project, type UUID } from "../../domain/types";
import { db } from "../persistence/db";
import { keys } from "../queries"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { syncBus } from "../sync/sync-bus";

export function useProjectsList() {
    return useQuery({
        queryKey: keys.projects.list(),
        queryFn: () => {
            return db.projects.orderBy('createdAt').toArray()
        },
        staleTime: Infinity
    })
}

export function useProject(projectId: string) {
    return useQuery({
        queryKey: keys.projects.get(projectId),
        queryFn: () => {
            return db.projects.get(projectId);
        },
        staleTime: Infinity
    })
}

export function useCreateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (project: Project) => {
            const id = await db.projects.add(project);
            return db.projects.get(id)
        },
        onSuccess: (project: Project | undefined) => {
            if (!project) return;
            queryClient.invalidateQueries({ queryKey: keys.projects.list() })
            
            syncBus.dispatchEvent(BuildNewSyncEvent(
                { type: 'create', data: project, table: 'projects' }
            ))
        }
    })
}

export function useUpdateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, patch }: { id: UUID, patch: Partial<Project>}) => {
            await db.projects.update(id, patch);
            return db.projects.get(id)
        },
        onSuccess: (project: Project | undefined) => {
            queryClient.invalidateQueries({ queryKey: keys.projects.list() })

            // TODO: invalidate the correct queries (only this ID?)
            // TODO: Dispatch an event to the sync bus
        }
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (project: Project) => {
            await db.projects.delete(project.id);
            return project.id;
        },
        onSuccess: (projectId) => {
            queryClient.invalidateQueries({ queryKey: keys.projects.list() })
            
            syncBus.dispatchEvent(BuildNewSyncEvent({
                type: 'delete',
                data: projectId,
                table: 'projects'
            }))
        }
    })
}
