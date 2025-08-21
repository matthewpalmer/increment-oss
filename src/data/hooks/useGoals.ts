import { BuildNewSyncEvent, type Goal, type UUID } from "../../domain/types";
import { db } from "../persistence/db";
import { keys } from "../queries"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { syncBus } from "../sync-bus";

export function useGoals(projectId: string) {
    return useQuery({
        queryKey: keys.goals.listInProject(projectId),
        queryFn: () => {
            return db.goals.where('projectId').equals(projectId).sortBy('createdAt')
        },
        staleTime: Infinity
    })
}

export function useGoal(goalId: string) {
    return useQuery({
        queryKey: keys.goals.get(goalId),
        queryFn: () => {
            return db.goals.get(goalId);
        },
        staleTime: Infinity
    })
}

export function useCreateGoal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (goal: Goal) => {
            const id = await db.goals.add(goal);
            return db.goals.get(id);
        },
        onSuccess: (goal: Goal | undefined) => {
            if (!goal) return;

            queryClient.invalidateQueries({ queryKey: keys.goals.listInProject(goal.projectId) })
            
            syncBus.dispatchEvent(BuildNewSyncEvent(
                { type: 'create', data: goal, table: 'goals' }
            ))
        }
    })
}

export function useUpdateGoal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, patch }: { id: UUID, patch: Partial<Goal>}) => {
            await db.goals.update(id, patch);
            return db.goals.get(id)
        },
        onSuccess: (goal: Goal | undefined) => {
            queryClient.invalidateQueries({ queryKey: keys.goals.list() })

            // TODO: invalidate the correct queries (only this ID?)
            // TODO: Dispatch an event to the sync bus
        }
    })
}

export function useDeleteGoal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (goal: Goal) => {
            await db.goals.delete(goal.id);
            return goal;
        },
        onSuccess: (goal) => {
            queryClient.invalidateQueries({ queryKey: keys.goals.listInProject(goal.projectId) })

            syncBus.dispatchEvent(BuildNewSyncEvent({
                type: 'delete',
                data: goal,
                table: 'goals'
            }))
        }
    })
}
