import { IncrementDateTimeNow } from "../time-utils"
import { CreateUUID, type GoalUnit, type TimeBlock, type UUID } from "../types"

export function makeTimeBlocks(projectId: UUID, type: GoalUnit, amounts: number[]): TimeBlock[] {
    return amounts.map(amount => {
        return {
            id: CreateUUID(),
            projectId: projectId,
            type: type,
            amount: amount,
            createdAt: IncrementDateTimeNow(),
            startedAt: IncrementDateTimeNow(),
            notes: ''
        }
    })
}
