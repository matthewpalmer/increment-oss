/*
We need to be able to calculate progress for the following DashboardWidgets

DashboardWidget is set to a Goal. Goal has GoalVersions. 

Here is the GoalVersions type

id: zUUID,
goalId: zUUID,
target: zTimeBlockAmount,
validFrom: zTimestamp,
validTo: zTimestamp,
unit: zGoalUnit,
cadence: zGoalCadence,
aggregation: zGoalAggregation,
notes: z.string().default(""),

Here is the TimeBlock type

id: zUUID,
projectId: zUUID,
type: zTimeBlockType,
amount: zTimeBlockAmount, // Varies based on `type`, either seconds or count
createdAt: zTimestamp,
startedAt: zTimestamp,
notes: z.string().default(""),

*/

