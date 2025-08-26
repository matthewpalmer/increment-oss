import type { GoalAggregation, GoalCadence, GoalUnit, IncrementTimestamp } from "../domain/types";

export const keys = {
    projects: {
        list: () => ['projects'],
        get: (id: string) => ['projects', id]
    },
    timeBlocks: {
        list: () => ['timeBlocks'],
        listInProject: (projectId: string) => ['timeBlocks', projectId],
        withinRangeForProject: (projectId: string, start: IncrementTimestamp, end: IncrementTimestamp) => [
            ['timeBlocks', projectId, start, end]
        ]
    },
    goals: {
        list: () => ['goals'],
        listInProject: (projectId: string) => ['goals', projectId],
        get: (id: string) => ['goals', id]
    },
    goalVersions: {
        list: () => ['goalVersions'],
        listInGoal: (goalId: string) => ['goalVersions', goalId],
        get: (id: string) => ['goalVersions', id],
    },
    dashboardWidgets: {
        listInProject: (projectId: string) => ['dashboardWidgets', projectId],
    },

    progress: {
        all: () => [
            'progress'
        ],
        atDate: (projectId: string, goalId: string, at: IncrementTimestamp, timezoneKey: string) => [
            'progress', 'atDate', projectId, goalId, at, timezoneKey
        ],
        projectTotal: (projectId: string, cadence: GoalCadence, windowStart: Date, timezoneKey: string, unit: GoalUnit, aggregation: GoalAggregation) => [
            'progress', 'projectTotal', projectId, cadence, windowStart.toISOString(), timezoneKey, unit, aggregation
        ],
        calendar: (projectId: string, monthStart: Date, timezoneKey: string) => [
            'progress', 'calendarProgress', projectId, monthStart.toISOString(), timezoneKey
        ],
        streaks: (projectId: string, goalId: string, at: Date, timezoneKey: string) => [
            'progress', 'streaks', projectId, goalId, at.toISOString(), timezoneKey
        ],
    }
}
