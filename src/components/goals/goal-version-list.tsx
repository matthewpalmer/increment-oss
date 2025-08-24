import { Button, Flex, Heading, Popover } from "@radix-ui/themes";
import { INCREMENT_TIMESTAMP_FOREVER, type Goal, type GoalVersion } from "../../domain/types";
import { useGoalVersions } from "../../data/hooks/useGoalVersions";
import { CounterClockwiseClockIcon, SewingPinIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { GoalVersionForm } from "./goal-version-form";
import { GoalVersionSummary } from "./goal-version-summary";

export type GoalVersionListProps = {
    goal: Goal,
    showVersionCreation: boolean,
    newGoalVersion: GoalVersion,
    onNewGoalVersionUpdated: (goalVersion: GoalVersion) => void
}

export function GoalVersionList(props: GoalVersionListProps) {
    const { data: goalVersions = [], isLoading, error } = useGoalVersions(props.goal.id);
    const [isCreatingVersion, setIsCreatingVersion] = useState(props.showVersionCreation);

    const handleGoalVersionChanged = (updatedGoalVersion: GoalVersion) => {
        props.onNewGoalVersionUpdated(updatedGoalVersion);
    };

    if (isLoading) {
        return (<p className='text-gray-400'>Loading…</p>)
    }

    if (error) {
        return (<p className='text-red-600'>An error occurred</p>)
    }

    const sortedGoalVersions = [...goalVersions].sort((a, b) => {
        if (a.validTo === INCREMENT_TIMESTAMP_FOREVER) return -1;
        return a.validTo < b.validTo ? -1 : 1;
    });

    if (!sortedGoalVersions.length && !isCreatingVersion) {
        return (<p className='text-red-600'>Invalid goal versions</p>)
    }

    return (
        <Flex direction="column" gap="2">
            {
                isCreatingVersion
                    ? (
                        <GoalVersionForm goalVersion={props.newGoalVersion} onGoalVersionChanged={handleGoalVersionChanged} />
                    )
                    : (
                        <Flex direction="row" justify="between" align="center">
                            <Button onClick={(e) => {
                                e.preventDefault();
                                setIsCreatingVersion(true);
                            }} variant="soft" size="2">
                                <SewingPinIcon /> Change Target
                            </Button>

                            <Flex direction="row" gap="3" align="center" className="font-semibold text-gray-500 text-sm">
                                <GoalVersionSummary goalVersion={sortedGoalVersions[0]} />

                                <Popover.Root>
                                    <Popover.Trigger>
                                        <Button color="gray" variant="ghost" size="1"><CounterClockwiseClockIcon /></Button>
                                    </Popover.Trigger>

                                    <Popover.Content size="1" maxWidth="300px">
                                        <Heading size="3">Past Targets</Heading>
                                        <ul>
                                            {
                                                sortedGoalVersions.map(gv => {
                                                    return <li className="text-sm [&:not(:last-child)]:border-b-1 py-2 border-gray-200" key={gv.id}><GoalVersionSummary goalVersion={gv} /></li>
                                                })
                                            }
                                        </ul>
                                    </Popover.Content>
                                </Popover.Root>
                            </Flex>
                        </Flex>
                    )
            }
        </Flex>
    )
}