import { Flex, Text } from "@radix-ui/themes";
import { z, ZodError } from "zod";

export function ErrorsList(props: { error: ZodError }) {
    return (
        <Flex direction="column">
            <Text weight="bold" color="red">An error occurred</Text>

            {
                props.error.issues.map(issue => {
                    const key = `${issue.path.toString()} ${issue.message}`;

                    return (
                        <Text key={key} color="red">
                            <strong>{issue.path.toString()}</strong>&nbsp;&nbsp;
                            {issue.message}
                        </Text>
                    )
                })
            }
        </Flex>
    )
}