import type { GoalAggregation, GoalUnit, TimeBlock } from "../types";

export function relevantAmountForAggregation(block: TimeBlock, unit: GoalUnit): number {
    if (unit === 'seconds') {
        if (block.type === 'time') return block.amount
        return 0;
    }

    if (unit === 'count') {
        if (block.type === 'count') return block.amount;
        return 0
    }

    return 0;
}

export function aggregateBlocks(
    blocks: TimeBlock[], 
    aggregation: GoalAggregation, 
    unit: GoalUnit
): number {
    if (aggregation === 'sum') {
        return blocks.reduce((acc, cur) => acc + relevantAmountForAggregation(cur, unit), 0);
    }

    if (aggregation === 'count') {
        return blocks.reduce((acc, cur) => {
            const amount = relevantAmountForAggregation(cur, unit);
            if (amount > 0) return acc + 1;
            return acc
        }, 0);
    }

    if (aggregation === 'max') {
        return blocks.reduce((acc, cur) => {
            return Math.max(acc, relevantAmountForAggregation(cur, unit));
        }, 0)
    }

    return 0;
}
