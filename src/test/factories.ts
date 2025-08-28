import type { UUID } from "crypto";
import { db } from "../data/persistence/db";
import { IncrementDateTimeNow } from "../domain/time-utils";
import { CreateUUID, type DashboardWidget, type DashboardWidgetType, type Goal, type GoalUnit, type GoalVersion, type IncrementTimestamp, type Project, type TimeBlock } from "../domain/types";

export async function makeProject(partial: Partial<Project> = {}) {
    const project: Project = {
        id: CreateUUID(),
        name: 'Test Project',
        createdAt: IncrementDateTimeNow(),
        ...partial,
    };

    await db.projects.put(project);

    return project;
}

export async function makeGoal(projectId: string, partial: Partial<Goal> = {}) {
    const goal: Goal = {
        id: CreateUUID(),
        projectId,
        name: 'Test Goal',
        createdAt: IncrementDateTimeNow(),
        ...partial,
    };

    await db.goals.put(goal);

    return goal;
}

export async function makeGoalVersion(
    goalId: string, 
    target: number, 
    validFrom: IncrementTimestamp,
    validTo: IncrementTimestamp,
    partial: Partial<GoalVersion> = {}) {

    const goalVersion: GoalVersion = {
        id: CreateUUID(),
        goalId: goalId,
        target,
        validFrom,
        validTo,
        unit: 'seconds',
        cadence: 'daily',
        aggregation: 'sum',
        notes: '',
        ...partial
    }

    await db.goalVersions.put(goalVersion);

    return goalVersion;
}

export async function makeWidget(projectId: string, goalId: string, type: DashboardWidgetType, partial: Partial<DashboardWidget> = {}) {
    const widget: DashboardWidget = {
        id: CreateUUID(),
        projectId,
        goalId,
        type: type,
        xSize: 2,
        ySize: 2,
        ...partial,
    };
    await db.dashboardWidgets.put(widget);
    return widget;
}

export async function makeTimeBlock(projectId: string, type: GoalUnit, amount: number, partial: Partial<TimeBlock> = {}) {
    const timeBlock: TimeBlock = {
        id: CreateUUID(),
        projectId,
        type,
        amount,
        createdAt: IncrementDateTimeNow(),
        startedAt: IncrementDateTimeNow(),
        notes: '',
        ...partial
    }

    await db.timeBlocks.put(timeBlock);

    return timeBlock;
}

export function buildTimeBlocks(projectId: string, type: GoalUnit, amounts: number[]): TimeBlock[] {
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

export async function makeTimeBlocks(projectId: string, type: GoalUnit, amounts: number[]): Promise<TimeBlock[]> {
    const blocks = buildTimeBlocks(projectId, type, amounts);
    await db.timeBlocks.bulkPut(blocks);
    return blocks;
}
