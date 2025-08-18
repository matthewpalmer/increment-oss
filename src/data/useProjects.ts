import type { Project } from "../domain/types";
import { db } from "./persistence/db";
import { keys } from "./queries"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProjectsList() {
    return useQuery({
        queryKey: keys.projects.list(),
        queryFn: () => {
            return db.projects.toArray()
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.projects.list() })
        }
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (project: Project) => {
            return await db.projects.delete(project.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: keys.projects.list() })
        }
    })
}
