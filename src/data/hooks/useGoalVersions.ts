import { BuildNewSyncEvent, type Goal, type GoalVersion } from "../../domain/types";
import { db } from "../persistence/db";
import { keys } from "../queries"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { syncBus } from "../sync-bus";

export function useGoalVersions(goalId: string) {
    return useQuery({
        queryKey: keys.goalVersions.listInGoal(goalId),
        queryFn: () => {
            return db.goalVersions.where('goalId').equals(goalId).toArray()
        },
        staleTime: Infinity
    })
}

export function useCreateGoalVersion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (goalVersion: GoalVersion) => {
            const id = await db.goalVersions.add(goalVersion);
            return db.goalVersions.get(id);
        },
        onSuccess: (goalVersion: GoalVersion | undefined) => {
            if (!goalVersion) return;

            queryClient.invalidateQueries({ queryKey: keys.goalVersions.listInGoal(goalVersion.goalId) })
            
            syncBus.dispatchEvent(BuildNewSyncEvent(
                { type: 'create', data: goalVersion, table: 'goalVersions' }
            ))
        }
    })
}
