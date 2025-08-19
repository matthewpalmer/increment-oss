import { BuildNewSyncEvent, type Project } from "../../domain/types";
import { db } from "../persistence/db";
import { keys } from "../queries"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { syncBus } from "../sync-bus";

export function useProjectsList() {
    return useQuery({
        queryKey: keys.projects.list(),
        queryFn: () => {
            return db.projects.toArray()
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
            const id = await db.projects.add(project)
            return db.projects.get(id)
        },
        onSuccess: (project: Project | undefined) => {
            queryClient.invalidateQueries({ queryKey: keys.projects.list() })
            
            syncBus.dispatchEvent(BuildNewSyncEvent(
                { type: 'create', data: project }
            ))
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
                data: projectId
            }))
        }
    })
}
