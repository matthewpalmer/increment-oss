import type { GoalCadence, IncrementTimestamp } from "../domain/types";

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
        // TODO: Seems bad to have goals:$goalId and goals:$goalVersionId
        list: () => ['goals'],
        listInProject: (projectId: string) => ['goals', projectId],
        get: (id: string) => ['goals', id]
    },
    goalVersions: {
        // TODO: Seems bad to have goalVersions:$goalId and goalVersions:$goalVersionId
        list: () => ['goalVersions'],
        listInGoal: (goalId: string) => ['goalVersions', goalId],
        get: (id: string) => ['goalVersions', id],
    },
    dashboardWidgets: {
        // TODO: Seems bad to have goalVersions:$goalId and goalVersions:$goalVersionId
        listInProject: (projectId: string) => ['dashboardWidgets', projectId],
    },

    progress: {
        all: () => [
            'progress'
        ],
        atDate: (projectId: string, goalId: string, at: IncrementTimestamp, timezoneKey: string) => [
            'progress', 'atDate', projectId, goalId, at, timezoneKey
        ],
        projectTotal: (projectId: string, cadence: GoalCadence, windowStart: Date, timezoneKey: string) => [
            'progress', 'projectTotal', projectId, cadence, windowStart.toISOString(), timezoneKey
        ],
        calendar: (projectId: string, monthStart: Date, timezoneKey: string) => [
            'progress', 'calendarProgress', projectId, monthStart.toISOString(), timezoneKey
        ]
    }
}
