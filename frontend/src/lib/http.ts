const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiRequest<T>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        cache: 'no-store',
    });

    if (!response.ok) {
        const message = await getErrorMessage(response);
        throw new Error(message);
    }

    return (await response.json()) as T;
}

async function getErrorMessage(response: Response): Promise<string> {
    try {
        const body = (await response.json()) as {
            message?: string | string[];
            error?: string;
        };

        if (Array.isArray(body.message)) {
            return body.message.join(', ');
        }

        return body.message ?? body.error ?? 'Request failed';
    } catch {
        return 'Request failed';
    }
}
