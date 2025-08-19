export const keys = {
    projects: {
        list: () => ['projects'],
        get: (id: string) => ['projects', id]
    },
    timeBlocks: {
        listInProject: (projectId: string) => ['time-blocks', projectId]
    },
    goals: {
        // TODO: Seems bad to have goals:$projectId and goals:$goalId
        listInProject: (projectId: string) => ['goals', projectId],
        get: (id: string) => ['goals', id]
    },
    goalVersions: {
        // TODO: Seems bad to have goalVersions:$goalId and goalVersions:$goalVersionId
        listInGoal: (goalId: string) => ['goalVersions', goalId],
        get: (id: string) => ['goalVersions', id]
    }
}
