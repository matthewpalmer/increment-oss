import type { DashboardWidget, Goal } from "../../../domain/types";

export function goalForWidget(dashboardWidget: DashboardWidget, goals: Goal[]) {
    if (dashboardWidget.type === 'goals-list') return;
    return goals.find(goal => goal.id === dashboardWidget.goalId);
}