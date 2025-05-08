import { WebContainer, WebContainerProcess } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [serverProcess, setServerProcess] = useState<WebContainerProcess | null>(null);

  async function handleInstall() {
    try {
      setError("Installing dependencies...");
      const installProcess = await webContainer.spawn('npm', ['install']);
      
      const installExitCode = await installProcess.exit;
      if (installExitCode !== 0) {
        throw new Error(`Installation failed with exit code ${installExitCode}`);
      }

      return true;
    } catch (err) {
      if (retryCount < 2) {
        setRetryCount(c => c + 1);
        return false;
      }
      throw err;
    }
  }

  async function startServer() {
    try {
      setError("Starting server...");
      const process = await webContainer.spawn('npm', ['run', 'dev']);
      setServerProcess(process);
      
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Server failed to start within 10 seconds'));
        }, 10000);

        webContainer.on('server-ready', (port, url) => {
          clearTimeout(timeout);
          console.log('Server ready at:', url);
          setUrl(url);
          setError("");
          resolve();
        });
      });
    } catch (err) {
      throw new Error(`Failed to start server: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function main() {
    try {
      setError("Initializing environment...");
      
      // Try installation with retries
      let installed = false;
      while (!installed && retryCount < 3) {
        installed = await handleInstall();
      }

      await startServer();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      // Attempt fallback start command
      if (!serverProcess) {
        try {
          setError("Attempting fallback start...");
          const process = await webContainer.spawn('npm', ['start']);
          setServerProcess(process);
        } catch (fallbackErr) {
          setError([
            err instanceof Error ? err.message : String(err),
            'Fallback failed:',
            fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)
          ].join('\n'));
        }
      }
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    async function init() {
      await main();
    }

    init();

    return () => {
      // Cleanup web container processes
      if (serverProcess) {
        serverProcess.kill();
      }
      abortController.abort();
    };
  }, [retryCount]); // Retry when retryCount changes

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {!url && (
        <div className="text-center">
          <p className="mb-2">{error || "Loading..."}</p>
          {error && (
            <button
              onClick={() => {
                setRetryCount(0);
                setError("");
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          )}
        </div>
      )}
      {url && <iframe width={"100%"} height={"100%"} src={url} />}
    </div>
  );
}