import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";
import type { DashboardWidgetProps } from "../grid/widget-vendor";

export function WidgetError(props: DashboardWidgetProps & { message?: string }) {
    return (
        <Flex direction="column" p="2">
            <Flex direction="row" align="center" justify="between" gap="2">
                <Flex direction="row" align="center" gap="2">
                    <ExclamationTriangleIcon width="20" height="20" color="orange" />
                    <Text weight="bold" color="gray">An error occurred</Text>
                </Flex>

                {props.menuSlot}
            </Flex>

            <Text color="gray">Goal not found. It may have been deleted from your project.</Text>
        </Flex>
    )
}