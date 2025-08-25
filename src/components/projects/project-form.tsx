import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { Label } from "radix-ui";
import { useState } from "react";
import { ColorPicker } from "../colors/color-picker";
import { CreateUUID, zProject, type Project } from "../../domain/types";

import { ZodError } from "zod";
import { useCreateProject, useDeleteProject, useUpdateProject } from "../../data/hooks/useProjects";
import { ErrorsList } from "../common/errors-list";
import { userColorsList } from "../colors/colors";
import { IncrementDateTimeNow } from "../../domain/time-utils";
import { useNavigate } from "@tanstack/react-router";

export type ProjectFormProps =
    | { mode: 'create', onFormSaved: () => void }
    | { mode: 'edit'; project: Project, onFormSaved: () => void }

const zNewProjectInput = zProject.omit({ id: true, createdAt: true });
const zEditProjectInput = zProject.omit({ id: true }).partial();

export function ProjectForm(props: ProjectFormProps) {
    const isNewProject = props.mode === 'create';

    const createProject = useCreateProject();
    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();

    const navigate = useNavigate();

    const [values, setValues] = useState(() => {
        if (isNewProject) {
            return { name: '', icon: '', color: '' }
        } else {
            return { ...props.project }
        }
    })

    const [error, setError] = useState<ZodError | undefined>(undefined);

    const handleSave = (event: React.FormEvent) => {
        event.preventDefault();

        if (isNewProject) {
            const parsed = zNewProjectInput.safeParse(values);

            if (!parsed.success) {
                return setError(parsed.error);
            }

            createProject.mutate({
                id: CreateUUID(),
                createdAt: IncrementDateTimeNow(),
                ...parsed.data
            })

            return props.onFormSaved();
        }

        const parsed = zEditProjectInput.safeParse(values);
        if (!parsed.success) return setError(parsed.error);

        updateProject.mutate({
            id: props.project.id,
            patch: parsed.data
        });

        props.onFormSaved();
    };

    const handleDeleteProject = () => {
        if (props.mode === 'create') return;

        const proceed = confirm('Are you sure you want to delete this project?');
        if (!proceed) return;

        deleteProject.mutate(props.project);
        navigate({ to: '/app' })
    };

    return (
        <form onSubmit={handleSave} autoComplete="off">
            <Flex direction="column" gap="4">
                <Flex direction="column">
                    <Label.Root className="text-gray-500 text-sm" htmlFor="name">
                        Project Name
                    </Label.Root>

                    <TextField.Root
                        id="name" size="3" placeholder="My project…"
                        value={values.name}
                        onChange={(e) => {
                            setValues({ ...values, name: e.target.value })
                        }}>
                    </TextField.Root>
                </Flex>

                <Flex direction="column">
                    <Label.Root className="text-gray-500 text-sm" htmlFor="color">
                        Color
                    </Label.Root>

                    <ColorPicker
                        selectedColor={values.color || userColorsList[0].hex}
                        colorChanged={(color) => {
                            setValues({ ...values, color: color })
                        }} />
                </Flex>

                <Flex direction="row" justify="between" align="center">
                    <Button type="submit" size="3">
                        {
                            isNewProject
                                ? 'Create Project'
                                : 'Save Project'
                        }
                    </Button>

                    {
                        isNewProject
                            ? null
                            : (
                                <Button variant="soft" color="red" onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteProject();
                                }}>Delete</Button>
                            )
                    }
                </Flex>
                
                { error ? <ErrorsList error={error} /> : null }
            </Flex>
        </form>
    )
}