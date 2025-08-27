import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds delay between retries

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout | null = null;

        async function initWebContainer() {
            try {
                setIsLoading(true);
                setError(null);
                const webcontainerInstance = await WebContainer.boot();
                if (isMounted) {
                    setWebcontainer(webcontainerInstance);
                    setRetryCount(0); // Reset retry count on success
                }
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to initialize WebContainer');
                if (isMounted) {
                    setError(error);
                    if (retryCount < maxRetries) {
                        // Schedule a retry
                        timeoutId = setTimeout(() => {
                            setRetryCount(prev => prev + 1);
                            initWebContainer();
                        }, retryDelay);
                    }
                }
            } finally {
                if (isMounted && !webcontainer) {
                    setIsLoading(false);
                }
            }
        }

        initWebContainer();

        return () => {
            isMounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (webcontainer) {
                try {
                    webcontainer.teardown();
                } catch (err) {
                    console.warn('Error during WebContainer teardown:', err);
                }
            }
        };
    }, [retryCount]);

    return { 
        webcontainer, 
        isLoading, 
        error,
        retryCount,
        maxRetries
    };
}