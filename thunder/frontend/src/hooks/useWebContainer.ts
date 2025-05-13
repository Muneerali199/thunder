import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function initWebContainer() {
            try {
                setIsLoading(true);
                setError(null);
                const webcontainerInstance = await WebContainer.boot();
                setWebcontainer(webcontainerInstance);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to initialize WebContainer'));
            } finally {
                setIsLoading(false);
            }
        }

        initWebContainer();

        return () => {
            // Cleanup if needed
            webcontainer?.teardown();
        };
    }, []);

    return { 
        webcontainer, 
        isLoading, 
        error 
    };
}