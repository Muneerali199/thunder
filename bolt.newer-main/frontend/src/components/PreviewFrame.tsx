import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState, useRef } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
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

  async function main() {
    const installProcess = await webContainer.spawn('npm', ['install']);
    installProcess.output.pipeTo(new WritableStream({ write: console.log }));
    await webContainer.spawn('npm', ['run', 'dev']);

    webContainer.on('server-ready', (port, url) => {
      setUrl(url);
    });
  }

  useEffect(() => {
    main();
  }, []);

  return (
    <div className="h-full flex items-center justify-center text-gray-400 relative">
      {!url && (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      )}
      {url && (
        <div ref={previewRef} className="relative h-full w-full">
          <iframe
            width="100%"
            height="100%"
            src={url}
            className="h-full w-full"
          />
          <button
            onClick={toggleFullScreen}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700/90 backdrop-blur-sm transition-all z-50"
            aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
          >
            {isFullScreen ? (
              // Exit icon (X)
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-300 w-5 h-5"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              // Enter fullscreen icon (Arrow expand)
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-300 w-5 h-5"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}