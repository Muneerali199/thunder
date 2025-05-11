import { WebContainer } from '@webcontainer/api';
import { useEffect, useState, useRef } from 'react';
import { FileItem } from '../types';

interface PreviewFrameProps {
  webContainer: WebContainer | undefined;
}

export function PreviewFrame({ webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    if (!previewRef.current) return;

    if (!isFullScreen) {
      previewRef.current.requestFullscreen().catch(err => {
        console.error('Error entering full-screen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    if (!webContainer) {
      setError('WebContainer not initialized');
      return;
    }

    const handleServerReady = (_port: number, url: string) => {
      setUrl(url);
      setError(null);
    };

    const handleError = (err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
      setError(`Server failed to start: ${errorMsg}`);
      setUrl("");
    };

    webContainer.on('server-ready', handleServerReady);
    webContainer.on('error', handleError);

    const setupServer = async () => {
      try {
        let installProcess = await webContainer.spawn('npm', ['install']);
        let installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          console.warn('Regular install failed, attempting forced install...');
          installProcess = await webContainer.spawn('npm', ['install', '--force']);
          installExitCode = await installProcess.exit;
          
          if (installExitCode !== 0) {
            throw new Error(`Dependency installation failed (exit code ${installExitCode})`);
          }
        }

        const devProcess = await webContainer.spawn('npm', ['run', 'dev']);
        const devExitCode = await devProcess.exit;
        
        if (devExitCode !== 0) {
          throw new Error(`Server failed to start (exit code ${devExitCode})`);
        }
      } catch (err) {
        handleError(err);
      }
    };

    setupServer();

    return () => {
      // Remove event listeners if WebContainer API supports it
      // Note: The WebContainer type definition might not include 'off' method
      // This is a safe cleanup pattern regardless of API support
      (webContainer as any).off?.('server-ready', handleServerReady);
      (webContainer as any).off?.('error', handleError);
    };
  }, [webContainer]);

  return (
    <div className="h-full flex items-center justify-center text-gray-400 relative">
      {error && !url && (
        <div className="text-center">
          <p className="mb-2 text-red-400">{error}</p>
          <p className="text-sm">Check the console for more details</p>
        </div>
      )}

      {!url && !error && (
        <div className="text-center">
          <p className="mb-2">Installing dependencies...</p>
          <div className="inline-block animate-spin">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        </div>
      )}

      {url && (
        <div ref={previewRef} className="relative h-full w-full">
          <iframe
            width="100%"
            height="100%"
            src={url}
            className="h-full w-full"
            title="Live Preview"
          />
          <button
            onClick={toggleFullScreen}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700/90 backdrop-blur-sm transition-all z-50"
            aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
          >
            {isFullScreen ? (
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-300 w-5 h-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-300 w-5 h-5"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2 2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}