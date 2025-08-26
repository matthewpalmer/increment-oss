import { Flex, Spinner, Text } from "@radix-ui/themes";
import { useSyncStatus } from "../../data/hooks/useSyncStatus";
import { CheckIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

interface SyncStatusDisplayProps { }

export function SyncStatusDisplay(props: SyncStatusDisplayProps) {
    const status = useSyncStatus();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (status !== 'done') {
            return setShowSuccess(false);
        }

        setShowSuccess(true);

        const timer = setTimeout(() => {
            setShowSuccess(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [status]);

    if (status === 'error') {
        return (
            <Flex direction="row" align="center" gap="1">
                <ExclamationTriangleIcon color="red" />
                <Text className="font-medium text-xs text-red-600">
                    A sync error occurred
                </Text>
            </Flex>
        )
    }

    if (status === 'in-progress') {
        return (
            <Flex direction="row" align="center" gap="1">
                <Spinner className="opacity-10" size="1" />
                <Text className="font-medium text-xs text-gray-400">
                    Syncing…
                </Text>
            </Flex>
        )
    }

    if (showSuccess) {
        return (
            <Flex direction="row" align="center" gap="1">
                <CheckIcon color="green" />
                <Text className="text-xs text-green-700 font-medium">Synced</Text>
            </Flex>
        );
    }

    // Maintain the space even when we aren't displaying a message
    return (
        <Flex direction="row" align="center" gap="1">
            <Text className="font-medium text-xs text-gray-400">
                &nbsp;
            </Text>
        </Flex>
    );
}
