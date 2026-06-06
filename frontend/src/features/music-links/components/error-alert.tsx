import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface ErrorAlertProps {
    message: string | null;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
    if (!message) {
        return null;
    }

    return (
        <Alert
            color="red"
            icon={<IconAlertCircle size={18} />}
            title="Une erreur est survenue"
        >
            {message}
        </Alert>
    );
}
