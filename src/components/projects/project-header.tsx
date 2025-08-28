import { Button, Dialog, DropdownMenu, Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import type { Project } from "../../domain/types";
import { getNameForColor } from "../colors/colors";
import { DashboardIcon, Pencil1Icon, PlusIcon, SewingPinIcon } from "@radix-ui/react-icons";
import { ProjectForm } from "./project-form";
import { GoalForm } from "../goals/goal-form";
import { WidgetForm } from "../widgets/settings/widget-form";
import { TimeBlockForm } from "../time-blocks/time-block-form";

export function ProjectHeader({ project }: { project: Project }) {
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [timeBlockDialogOpen, setTimeBlockDialogOpen] = useState(false);
    const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
    const [goalDialogOpen, setGoalDialogOpen] = useState(false);

    return (
        <Flex direction="row" justify="between" align="center" mt="2" mb="6" pb="4" className='border-b-2 border-dotted' style={{ borderColor: project.color }}>
            <Heading size="8" color={getNameForColor(project.color)}>{project.name}</Heading>

            <Flex direction="row" align="center" gap="3">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                        <Button variant="soft">Customize <DropdownMenu.TriggerIcon /></Button>
                    </DropdownMenu.Trigger>

                    <DropdownMenu.Content>
                        <DropdownMenu.Item onClick={() => setProjectDialogOpen(true)}><Pencil1Icon /> Edit Project</DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => setGoalDialogOpen(true)}><SewingPinIcon /> Add Goal</DropdownMenu.Item>
                        <DropdownMenu.Item onClick={() => setWidgetDialogOpen(true)}><DashboardIcon /> Add Widget</DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Root>

                <Button size="2" onClick={() => setTimeBlockDialogOpen(!timeBlockDialogOpen)}><PlusIcon /> Add Entry</Button>

                <Dialog.Root open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                    <Dialog.Content>
                        <Dialog.Title size="6">{project?.name}</Dialog.Title>
                        <Dialog.Description>Edit the project details</Dialog.Description>
                        <ProjectForm mode="edit" onFormSaved={() => setProjectDialogOpen(false)} project={project}></ProjectForm>
                    </Dialog.Content>
                </Dialog.Root>

                <Dialog.Root open={widgetDialogOpen} onOpenChange={setWidgetDialogOpen}>
                    <Dialog.Content>
                        <Dialog.Title size="6">Add Widget</Dialog.Title>
                        <Dialog.Description>Add a widget to the project dashboard</Dialog.Description>
                        <WidgetForm mode="create" projectId={project.id} onFormSaved={() => setWidgetDialogOpen(false)} />
                    </Dialog.Content>
                </Dialog.Root>

                <Dialog.Root open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                    <Dialog.Content>
                        <Dialog.Title size="6">Add Goal</Dialog.Title>
                        <Dialog.Description>Add goal to the project</Dialog.Description>
                        <GoalForm
                            mode="create"
                            projectId={project.id}
                            onFormSaved={() => setGoalDialogOpen(false)}>
                        </GoalForm>
                    </Dialog.Content>
                </Dialog.Root>

                <Dialog.Root open={timeBlockDialogOpen} onOpenChange={setTimeBlockDialogOpen}>
                    <Dialog.Content>
                        <Dialog.Title size="6">Add Entry</Dialog.Title>
                        <Dialog.Description>Add an entry to track time in the project</Dialog.Description>
                        <TimeBlockForm mode="create" onFormSaved={() => setTimeBlockDialogOpen(false)} projectId={project.id}></TimeBlockForm>
                    </Dialog.Content>
                </Dialog.Root>
            </Flex>
        </Flex>
    )
}