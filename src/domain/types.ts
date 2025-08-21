// types.ts
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { IncrementDateTimeNow } from "./time-utils"

// ───────────────────────────────────────────────────────────────────────────────
// Primitives & constants
// ───────────────────────────────────────────────────────────────────────────────

export type UUID = string
export type IncrementTimestamp = number // ms since epoch (or -1 sentinel)
export type IncrementDuration = number

export const INCREMENT_TIMESTAMP_FOREVER = -1 as const
export const SYNC_EVENT_NOT_STARTED = -1 as const

// Reusable validators
export const zUUID = z.string().uuid()
export const zTimestamp = z
    .number()
    .int()
    .refine(
        (n) => n === INCREMENT_TIMESTAMP_FOREVER || n >= 0,
        { message: "Timestamp must be >= 0 or -1 (sentinel)" }
    )
export const zDuration = z.number().int().min(0)
export const zNonEmpty = z.string().trim().min(1)

// ───────────────────────────────────────────────────────────────────────────────
// Enums
// ───────────────────────────────────────────────────────────────────────────────

export const zTable = z.enum(["projects", "goals", "goalVersions", "timeBlocks"])
export type Table = z.infer<typeof zTable>

export const zGoalUnit = z.enum(["seconds", "count", "meters"])
export type GoalUnit = z.infer<typeof zGoalUnit>

export const zGoalCadence = z.enum(["daily", "weekly", "monthly", "lifetime"])
export type GoalCadence = z.infer<typeof zGoalCadence>

export const zGoalAggregation = z.enum(["sum", "count", "max"])
export type GoalAggregation = z.infer<typeof zGoalAggregation>

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

// ───────────────────────────────────────────────────────────────────────────────
// Schemas & Types
// ───────────────────────────────────────────────────────────────────────────────

export const zProject = z.object({
    id: zUUID,
    name: zNonEmpty,
    icon: z.string().optional(),
    color: z.string().optional(),
})
export type Project = z.infer<typeof zProject>

export const zTimeBlock = z.object({
    id: zUUID,
    projectId: zUUID,
    amount: zDuration, // IncrementDuration
    createdAt: zTimestamp,
    startedAt: zTimestamp,
    notes: z.string().default(""),
})
export type TimeBlock = z.infer<typeof zTimeBlock>

export const zGoal = z.object({
    id: zUUID,
    projectId: zUUID,
    name: zNonEmpty,
    color: zNonEmpty,
    createdAt: zTimestamp,
    unit: zGoalUnit,
    cadence: zGoalCadence,
    aggregation: zGoalAggregation,
})
export type Goal = z.infer<typeof zGoal>

export const zGoalVersion = z
    .object({
        id: zUUID,
        goalId: zUUID,
        target: z.number(),
        validFrom: zTimestamp,
        validTo: zTimestamp,
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

// ───────────────────────────────────────────────────────────────────────────────
/** Input-only schemas (omit system-populated fields) */
// ───────────────────────────────────────────────────────────────────────────────

export const zNewSyncEventInput = z.object({
    type: zSyncEventType,
    table: zTable,
    data: z.unknown().optional(),
})
export type NewSyncEventInput = z.infer<typeof zNewSyncEventInput>

// (Add similar "input" schemas for Project/Goal/etc. if you want builders)

// ───────────────────────────────────────────────────────────────────────────────
// Builders & utilities
// ───────────────────────────────────────────────────────────────────────────────

export function CreateUUID(): UUID {
    return uuidv4()
}

export function DisplayUUID(uuid: UUID): string {
    return uuid.split("-")[0]
}

/** Backward-compatible builder that returns a validated SyncEvent */
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

// ───────────────────────────────────────────────────────────────────────────────
// Convenience guards (optional)
// ───────────────────────────────────────────────────────────────────────────────

export const isProject = (v: unknown): v is Project => zProject.safeParse(v).success
export const isTimeBlock = (v: unknown): v is TimeBlock => zTimeBlock.safeParse(v).success
export const isGoal = (v: unknown): v is Goal => zGoal.safeParse(v).success
export const isGoalVersion = (v: unknown): v is GoalVersion => zGoalVersion.safeParse(v).success
export const isSyncEvent = (v: unknown): v is SyncEvent => zSyncEvent.safeParse(v).success
