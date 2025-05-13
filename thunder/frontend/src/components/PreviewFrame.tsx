import { WebContainer } from '@webcontainer/api';
import { useEffect, useState, useRef } from 'react';
import { FileItem } from '../types';

interface PreviewFrameProps {
  webContainer: WebContainer | undefined;
  files: FileItem[];
  isWebContainerLoading: boolean;
  webContainerError: Error | null;
}

export function PreviewFrame({ 
  webContainer, 
  files,
  isWebContainerLoading,
  webContainerError
}: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [installOutput, setInstallOutput] = useState<string[]>([]);
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
    if (isWebContainerLoading) return;
    
    if (webContainerError) {
      setError(`WebContainer failed to initialize: ${webContainerError.message}`);
      return;
    }

    if (!webContainer) {
      setError('WebContainer not available');
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

    // Store the disposer functions
    const serverReadyDisposer = webContainer.on('server-ready', handleServerReady);
    const errorDisposer = webContainer.on('error', handleError);

    const setupServer = async () => {
      try {
        // Ensure project files are mounted
        const mountStructure = createMountStructure(files);
        await webContainer.mount(mountStructure);

        // Check if node_modules exists to skip installation
        const nodeModulesExists = await webContainer.fs.readdir('node_modules').catch(() => null);
        if (!nodeModulesExists) {
          setInstallOutput(prev => [...prev, 'Installing dependencies with pnpm...']);
          const installProcess = await webContainer.spawn('pnpm', ['install', '--registry=https://registry.npmjs.org']);
          
          installProcess.output.pipeTo(
            new WritableStream({
              write(chunk) {
                setInstallOutput(prev => [...prev, chunk]);
              },
            })
          );

          const installExitCode = await installProcess.exit;
          if (installExitCode !== 0) {
            throw new Error(`Dependency installation failed (exit code ${installExitCode})`);
          }
          setInstallOutput(prev => [...prev, 'Dependencies installed successfully!']);
        } else {
          setInstallOutput(prev => [...prev, 'Dependencies already installed, skipping...']);
        }

        // Start the dev server
        const devProcess = await webContainer.spawn('pnpm', ['run', 'dev']);
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
      // Clean up event listeners using the disposer functions
      serverReadyDisposer();
      errorDisposer();
    };
  }, [webContainer, files, isWebContainerLoading, webContainerError]);

  const createMountStructure = (files: FileItem[]): Record<string, any> => {
    const mountStructure: Record<string, any> = {};
    const processFile = (file: FileItem, isRootFolder: boolean) => {
      if (file.type === 'folder') {
        mountStructure[file.name] = {
          directory: file.children
            ? Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              )
            : {},
        };
      } else if (file.type === 'file') {
        if (isRootFolder) {
          mountStructure[file.name] = {
            file: {
              contents: file.content || '',
            },
          };
        } else {
          return {
            file: {
              contents: file.content || '',
            },
          };
        }
      }
      return mountStructure[file.name];
    };
    files.forEach(file => processFile(file, true));
    return mountStructure;
  };

  return (
    <div className="h-full flex items-center justify-center text-gray-400 relative">
      {isWebContainerLoading && (
        <div className="text-center">
          <p className="mb-2">Initializing WebContainer environment...</p>
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

      {webContainerError && (
        <div className="text-center">
          <p className="mb-2 text-red-400">Initialization Error</p>
          <p className="text-sm">{webContainerError.message}</p>
          <p className="text-xs mt-2">Please refresh the page to try again</p>
        </div>
      )}

      {!isWebContainerLoading && !webContainerError && error && !url && (
        <div className="text-center">
          <p className="mb-2 text-red-400">{error}</p>
          <p className="text-sm">Check the console for more details</p>
        </div>
      )}

      {!isWebContainerLoading && !webContainerError && !url && !error && (
        <div className="text-center">
          <p className="mb-2">Setting up project environment...</p>
          <div className="max-h-40 overflow-y-auto text-sm text-gray-500">
            {installOutput.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
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