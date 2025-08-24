import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Flex, Spinner, Text } from "@radix-ui/themes";
import type { DashboardWidgetProps } from "../grid/widget-vendor";

export function WidgetLoading(props: DashboardWidgetProps) {
    return (
        <Flex direction="column" p="2">
            <Flex direction="row" align="center" justify="between" gap="2">
                <Flex direction="row" align="center" gap="2">
                    <Spinner />
                    <Text color="gray">Loading widget…</Text>
                </Flex>

                {props.menuSlot}
            </Flex>
        </Flex>
    )
}