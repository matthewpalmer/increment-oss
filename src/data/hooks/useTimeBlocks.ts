import { BuildNewSyncEvent, type TimeBlock } from "../../domain/types";
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
                { type: 'create', data: timeBlock }
            ))
        }
    })
}