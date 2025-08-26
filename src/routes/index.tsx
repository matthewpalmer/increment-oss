import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Button, Callout, Flex, Heading, Text } from "@radix-ui/themes";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute('/')({
    component: Index
})

function Index() {
    return (
        <Flex direction="column" align="center" justify="center" p="4" gap="6" maxWidth={"600px"} className="m-auto">
            <Heading align="center" size="8">Welcome to Increment</Heading>

            <Text align="center" size="4">Increment is a powerful, customizable tracker for your time, goals, and progress. It’s useful for tracking your work, reading, exercise… or any other long-term goal.</Text>

            <Callout.Root>
                <Callout.Icon>
                    <InfoCircledIcon />
                </Callout.Icon>
                    
                <Callout.Text>
                In this mode, Increment can <strong>only be used offline</strong>. In production, data is synced using CloudKit.
                </Callout.Text>
            </Callout.Root>

            <Link className="mt-6" to="/app">
                <Button size="4">Launch App</Button>
            </Link>

        </Flex>
    )
}