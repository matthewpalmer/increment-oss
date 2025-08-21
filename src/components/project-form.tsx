import { Button, Flex, TextField } from "@radix-ui/themes";
import { Label } from "radix-ui";
import { useState } from "react";
import { ColorPicker, ColorPickerColors } from "./color-picker";
import { CreateUUID, zProject, type Project } from "../domain/types";

import { ZodError } from "zod";
import { useCreateProject, useUpdateProject } from "../data/hooks/useProjects";
import { ErrorsList } from "./errors-list";

export type ProjectFormProps =
    | { mode: 'create', onFormSaved: () => void }
    | { mode: 'edit'; project: Project, onFormSaved: () => void }

const zNewProjectInput = zProject.omit({ id: true });
const zEditProjectInput = zProject.omit({ id: true }).partial();

export function ProjectForm(props: ProjectFormProps) {
    const isNewProject = props.mode === 'create';

    const createProject = useCreateProject();
    const updateProject = useUpdateProject();

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

            createProject.mutate({ id: CreateUUID(), ...parsed.data })
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
                        selectedColor={values.color || ColorPickerColors[0]}
                        colorChanged={(color) => {
                            setValues({ ...values, color: color })
                        }} />
                </Flex>

                <Button style={{ alignSelf: "flex-start" }} type="submit" size="3">
                    {
                        isNewProject
                            ? 'Create Project'
                            : 'Save Project'
                    }
                </Button>

                {
                    error
                    ? <ErrorsList error={error} />
                    : null
                }
            </Flex>
        </form>
    )
}