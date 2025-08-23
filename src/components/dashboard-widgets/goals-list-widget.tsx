import { Box, Button, Dialog, Flex, Heading, Text } from "@radix-ui/themes";
import { useGoals } from "../../data/hooks/useGoals";
import { useState } from "react";
import { GoalForm } from "../goal-form";
import { Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";
import type { Goal, Project } from "../../domain/types";
import type { DashboardWidgetProps } from "../widget-vendor";

export function GoalsListWidget(props: DashboardWidgetProps) {
    const { data = [], isLoading, isError } = useGoals(props.project.id);
    const [newGoalDialogOpen, setNewGoalDialogOpen] = useState(false);
    const [editGoalDialogOpen, setEditGoalDialogOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

    return (
        <Box>
            <Flex direction="column" pb="2">
                <Flex direction="row" justify="between" align="center" mb="4">
                    <Heading size="5">My Goals</Heading>

                    <Flex direction="row" align="center" gap="3">
                        <Dialog.Root open={newGoalDialogOpen} onOpenChange={setNewGoalDialogOpen}>
                            <Dialog.Trigger>
                                <Button variant="soft" size="1"><PlusIcon /> New</Button>
                            </Dialog.Trigger>

                            <Dialog.Content>
                                <Dialog.Title size="6">New Goal</Dialog.Title>

                                <GoalForm
                                    mode="create"
                                    projectId={props.project.id}
                                    onFormSaved={() => setNewGoalDialogOpen(false)}>
                                </GoalForm>
                            </Dialog.Content>

                            {props.menuSlot}
                        </Dialog.Root>
                    </Flex>
                </Flex>

                {isLoading ? <p>Loading goals…</p> : null}
                {isError ? <p>Unable to load goals</p> : null}

                <Flex direction="column" gap="4">
                    {
                        data?.map(goal => {
                            return (
                                <Flex key={goal.id} direction="row" justify={"between"} align={"center"}>
                                    <Text weight="bold">{goal.name}</Text>

                                    <Button color="gray" variant="ghost" size="1" onClick={() => {
                                        setEditingGoal(goal);
                                        setEditGoalDialogOpen(true);
                                    }}><Pencil1Icon /></Button>
                                </Flex>
                            )
                        })
                    }
                </Flex>
            </Flex>

            <Dialog.Root open={editGoalDialogOpen} onOpenChange={setEditGoalDialogOpen}>
                <Dialog.Content>
                    <Dialog.Title size="6">Edit Goal</Dialog.Title>

                    {
                        editingGoal
                            ? (
                                <GoalForm
                                    key={editingGoal.id}
                                    mode="edit"
                                    goal={editingGoal}
                                    onFormSaved={() => setEditGoalDialogOpen(false)}>
                                </GoalForm>
                            )
                            : null
                    }

                </Dialog.Content>
            </Dialog.Root>
        </Box>
    )
}