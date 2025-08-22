import { BuildNewSyncEvent, type TimeBlock, type UUID } from "../../domain/types";
import { db } from "../persistence/db";
import { keys } from "../queries"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { syncBus } from "../sync-bus";

export function useTimeBlocks(projectId: string) {
    return useQuery({
        queryKey: keys.timeBlocks.listInProject(projectId),
        queryFn: () => {
            return db.timeBlocks.where('projectId').equals(projectId).toArray()
        },
        staleTime: Infinity
    })
}

export function useCreateTimeBlock() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (timeBlock: TimeBlock) => {
            const id = await db.timeBlocks.add(timeBlock);
            return db.timeBlocks.get(id);
        },
        onSuccess: (timeBlock: TimeBlock | undefined) => {
            if (!timeBlock) return;

            queryClient.invalidateQueries({ queryKey: keys.timeBlocks.listInProject(timeBlock.projectId) })
            
            syncBus.dispatchEvent(BuildNewSyncEvent(
                { type: 'create', data: timeBlock, table: 'timeBlocks' }
            ))
        }
    })
}

export function useUpdateTimeBlock() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, patch }: { id: UUID, patch: Partial<TimeBlock>}) => {
            await db.timeBlocks.update(id, patch);
            return db.timeBlocks.get(id)
        },
        onSuccess: (timeBlock: TimeBlock | undefined) => {
            queryClient.invalidateQueries({ queryKey: keys.goals.list() })

            // TODO: invalidate the correct queries (only this ID?)
            // TODO: Dispatch an event to the sync bus
        }
    })
}
