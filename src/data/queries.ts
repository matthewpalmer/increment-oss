export const keys = {
    projects: {
        list: () => ['projects'],
        get: (id: string) => ['projects', id]
    },
    timeBlocks: {
        list: () => ['timeBlocks'],
        listInProject: (projectId: string) => ['timeBlocks', projectId]
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
        get: (id: string) => ['goalVersions', id]
    },
    dashboardWidgets: {
        // TODO: Seems bad to have goalVersions:$goalId and goalVersions:$goalVersionId
        listInProject: (projectId: string) => ['dashboardWidgets', projectId],
    },
}
