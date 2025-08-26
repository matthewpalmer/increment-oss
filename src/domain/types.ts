import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { IncrementDateTimeNow } from "./time-utils"

export type UUID = string
export type IncrementTimestamp = number // ms since epoch (or -1 sentinel)
export type IncrementDuration = number

export const INCREMENT_TIMESTAMP_FOREVER = -1 as const
export const SYNC_EVENT_NOT_STARTED = -1 as const

export const zUUID = z.string().uuid()
export const zTimestamp = z
    .number()
    .int()
    .refine(
        (n) => n === INCREMENT_TIMESTAMP_FOREVER || n >= 0,
        { message: "Timestamp must be >= 0 or -1 (sentinel)" }
    )
export const zTimeBlockAmount = z.number().int().min(1)
export const zNonEmpty = z.string().trim().min(1)

export const zTable = z.enum(["projects", "goals", "goalVersions", "timeBlocks", "dashboardWidgets"])
export type Table = z.infer<typeof zTable>

export const zGoalUnit = z.enum(["seconds", "count", "meters", "words"])
export type GoalUnit = z.infer<typeof zGoalUnit>

export const zGoalCadence = z.enum(["daily", "weekly", "monthly", "lifetime"])
export type GoalCadence = z.infer<typeof zGoalCadence>

export const zGoalAggregation = z.enum(["sum", "count", "max"])
export type GoalAggregation = z.infer<typeof zGoalAggregation>

export const zTimeBlockType = z.enum(["time", "count"])
export type TimeBlockType = z.infer<typeof zTimeBlockType>

export const zSyncEventType = z.enum(["create", "update", "delete"])
export type SyncEventType = z.infer<typeof zSyncEventType>

export const zSyncEventStatus = z.enum([
    "pending",
    "in-progress",
    "retry-scheduled",
    "done",
    "failed",
])

export type SyncEventStatus = z.infer<typeof zSyncEventStatus>

export const zProject = z.object({
    id: zUUID,
    name: zNonEmpty,
    createdAt: zTimestamp,
    icon: z.string().optional(),
    color: z.string().optional(),
})

export type Project = z.infer<typeof zProject>

export const zTimeBlock = z.object({
    id: zUUID,
    projectId: zUUID,
    type: zTimeBlockType,
    amount: zTimeBlockAmount, // Varies based on `type`, either seconds or count
    createdAt: zTimestamp,
    startedAt: zTimestamp,
    notes: z.string().default(""),
})

export type TimeBlock = z.infer<typeof zTimeBlock>

export const zGoal = z.object({
    id: zUUID,
    projectId: zUUID,
    name: zNonEmpty,
    createdAt: zTimestamp,
})

export type Goal = z.infer<typeof zGoal>

export const zGoalVersion = z
    .object({
        id: zUUID,
        goalId: zUUID,
        target: zTimeBlockAmount,
        validFrom: zTimestamp,
        validTo: zTimestamp,
        unit: zGoalUnit,
        cadence: zGoalCadence,
        aggregation: zGoalAggregation,
        notes: z.string().default(""),
    })
    .superRefine((v, ctx) => {
        if (v.validTo !== INCREMENT_TIMESTAMP_FOREVER && v.validTo < v.validFrom) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "validTo must be >= validFrom (or -1)",
                path: ["validTo"],
            })
        }
    })

export type GoalVersion = z.infer<typeof zGoalVersion>

export const zDashboardWidgetType = z.enum([
    "goals-list", 
    "progress-bar", 
    "progress-circle",
    "total-time",
    "calendar",
    "streaks"
])

export type DashboardWidgetType = z.infer<typeof zDashboardWidgetType>

export const zDashboardWidget = z
    .object({
        id: zUUID,
        projectId: zUUID,
        goalId: zUUID.optional(),
        type: zDashboardWidgetType,
        order: z.number().optional(),
        xSize: z.number(),
        ySize: z.number(),
    })

export type DashboardWidget = z.infer<typeof zDashboardWidget>

export const zSyncEvent = z.object({
    id: zUUID,
    type: zSyncEventType,
    table: zTable,
    data: z.unknown().optional(),
    result: z.unknown().optional(),
    addedAt: zTimestamp,
    startedAt: zTimestamp,
    nextAttemptAt: zTimestamp,
    completedAt: zTimestamp,
    status: zSyncEventStatus,
    statusMessage: z.string().optional(),
    attempts: z.number().int().min(0),
})

export type SyncEvent = z.infer<typeof zSyncEvent>

export const zNewSyncEventInput = z.object({
    type: zSyncEventType,
    table: zTable,
    data: z.unknown().optional(),
})
export type NewSyncEventInput = z.infer<typeof zNewSyncEventInput>

export function CreateUUID(): UUID {
    return uuidv4()
}

export function DisplayUUID(uuid: UUID): string {
    return uuid.split("-")[0]
}

export function BuildNewSyncEvent(args: NewSyncEventInput): SyncEvent {
    const now = IncrementDateTimeNow()
    const obj: SyncEvent = {
        id: CreateUUID(),
        type: args.type,
        table: args.table,
        data: args.data,
        result: undefined,
        addedAt: now,
        nextAttemptAt: now,
        startedAt: SYNC_EVENT_NOT_STARTED,
        completedAt: SYNC_EVENT_NOT_STARTED,
        status: "pending",
        statusMessage: undefined,
        attempts: 0,
    }
    return zSyncEvent.parse(obj)
}
