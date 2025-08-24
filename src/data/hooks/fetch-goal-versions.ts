import type { GoalVersion } from "../../domain/types";
import { db } from "../persistence/db";

export async function fetchGoalVersions(goalId: string): Promise<GoalVersion[]> {
    return db.goalVersions.where('goalId').equals(goalId).toArray();
}

