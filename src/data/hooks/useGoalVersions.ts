import { BuildNewSyncEvent, INCREMENT_TIMESTAMP_FOREVER, type Goal, type GoalVersion } from "../../domain/types";
import { db } from "../persistence/db";
import { keys } from "../queries"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { syncBus } from "../sync-bus";
import { IncrementDateTimeNow } from "../../domain/time-utils";

export function useGoalVersions(goalId: string) {
    return useQuery({
        queryKey: keys.goalVersions.listInGoal(goalId),
        queryFn: async () => {
            console.log('LOADING GOAL VERSIONS FOR', goalId)
            const gvs: GoalVersion[] = await db.goalVersions.where('goalId').equals(goalId).toArray()
            return gvs;
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

export function useReplaceActiveGoalVersion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (goalVersion: GoalVersion) => {
            const now = IncrementDateTimeNow()

            // Find the previously active goal version for this project
            const open = await db.goalVersions
                .where('goalId').equals(goalVersion.goalId)
                .filter(v => v.validTo === INCREMENT_TIMESTAMP_FOREVER)
                .toArray();

            const previousVersion = open.sort((a, b) => b.validFrom - a.validFrom)[0];

            // Close it
            if (previousVersion) {
                const updatedPrevious = { ...previousVersion, validTo: now }
                await db.goalVersions.put(updatedPrevious)
            }

            // Create the new goal version
            const newVersion = {
                ...goalVersion,
                validFrom: now,
                validTo: INCREMENT_TIMESTAMP_FOREVER
            };

            await db.goalVersions.add(newVersion);

            return { newVersion, previousVersion };
        },
        onSuccess: (result: { newVersion: GoalVersion, previousVersion?: GoalVersion }) => {
            queryClient.invalidateQueries({ queryKey: keys.goalVersions.listInGoal(result.newVersion.goalId) })

            if (result.previousVersion) {
                syncBus.dispatchEvent(
                    BuildNewSyncEvent({ type: 'update', data: result.previousVersion, table: 'goalVersions' })
                );
            }

            syncBus.dispatchEvent(BuildNewSyncEvent(
                { type: 'create', data: result.newVersion, table: 'goalVersions' }
            ))
        }
    })
}
