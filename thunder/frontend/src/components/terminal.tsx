import { useEffect, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import axios from 'axios';
import { FileItem } from '../types';
import { BACKEND_URL } from '../config';

interface TerminalProps {
  webContainer: WebContainer | null;
  onCommand: (command: string) => void;
  files?: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  prompt: string;
  githubToken: string | null;
  githubUser: string | null;
  deployToGitHub: (repoName: string) => Promise<void>;
  isWebContainerLoading: boolean;
  webContainerError: Error | null;
}

export const Terminal: React.FC<TerminalProps> = ({
  webContainer,
  onCommand,
  files,
  setFiles,
  prompt,
  githubToken,
  githubUser,
  deployToGitHub,
  isWebContainerLoading,
  webContainerError,
}) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const executeCommand = async (cmd: string) => {
    if (!webContainer) {
      const errorMsg = 'Error: WebContainer not initialized';
      setOutput((prev) => [...prev, errorMsg]);
      setError(errorMsg);
      return;
    }

    const args = cmd.trim().split(' ');
    const commandName = args[0];
    const commandArgs = args.slice(1);

    setOutput((prev) => [...prev, `> ${cmd}`]);
    setError(null);

    try {
      if (commandName === 'deploy') {
        if (!githubToken || !githubUser) {
          const errorMsg = 'Error: Not authenticated with GitHub. Please log in.';
          setOutput((prev) => [...prev, errorMsg]);
          setError(errorMsg);
          return;
        }
        const repoName = commandArgs[0] || `project-${Date.now()}`;
        setOutput((prev) => [...prev, `Deploying to GitHub repository: ${githubUser}/${repoName}`]);
        await deployToGitHub(repoName);
        setOutput((prev) => [...prev, `Successfully deployed to https://github.com/${githubUser}/${repoName}`]);
      } else if (commandName === 'bolt.new') {
        setOutput((prev) => [...prev, 'Executing bolt.new...']);
        const process = await webContainer.spawn('pnpm', ['init']);
        process.output.pipeTo(
          new WritableStream({
            write(chunk) {
              setOutput((prev) => [...prev, chunk]);
            },
          })
        );
        const exitCode = await process.exit;
        if (exitCode !== 0) {
          const errorMsg = `Command "${cmd}" failed with exit code ${exitCode}`;
          setOutput((prev) => [...prev, errorMsg]);
          setError(errorMsg);
        } else {
          setOutput((prev) => [...prev, 'Project initialized with bolt.new']);
        }
      } else if (commandName === 'netlify') {
        setOutput((prev) => [...prev, 'Executing Netlify deploy...']);
        const process = await webContainer.spawn('netlify', commandArgs);
        let deployOutput = '';
        process.output.pipeTo(
          new WritableStream({
            write(chunk) {
              deployOutput += chunk;
              setOutput((prev) => [...prev, chunk]);
            },
          })
        );
        const exitCode = await process.exit;
        if (exitCode !== 0) {
          const errorMsg = `Netlify deploy failed with exit code ${exitCode}: ${deployOutput}`;
          setOutput((prev) => [...prev, errorMsg]);
          setError(errorMsg);
        } else {
          setOutput((prev) => [...prev, 'Successfully deployed to Netlify']);
        }
      } else {
        const process = await webContainer.spawn(commandName, commandArgs);
        process.output.pipeTo(
          new WritableStream({
            write(chunk) {
              setOutput((prev) => [...prev, chunk]);
            },
          })
        );
        const exitCode = await process.exit;
        if (exitCode !== 0) {
          const errorMsg = `Command "${cmd}" failed with exit code ${exitCode}`;
          setOutput((prev) => [...prev, errorMsg]);
          setError(errorMsg);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fullError = `Error executing "${cmd}": ${errorMessage}`;
      setOutput((prev) => [...prev, fullError]);
      setError(fullError);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onCommand(command);
      executeCommand(command);
      setCommand('');
    }
  };

  const handleFixError = async () => {
    if (!error) return;
    try {
      setOutput((prev) => [...prev, 'Attempting to fix error...']);
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
        error,
      });
      const { files: newFiles } = response.data;
      setFiles(newFiles);
      setOutput((prev) => [...prev, 'Project files updated to fix error']);
      setError(null);
      if (webContainer) {
        const mountStructure = createMountStructure(newFiles);
        await webContainer.mount(mountStructure);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fix error';
      setOutput((prev) => [...prev, `Error fixing project: ${errorMessage}`]);
      setError(`Error fixing project: ${errorMessage}`);
    }
  };

  const fixDependencyError = async () => {
    if (!webContainer) {
      setOutput((prev) => [...prev, 'Error: WebContainer not initialized']);
      return;
    }

    setOutput((prev) => [...prev, 'Attempting to fix dependency installation...']);

    try {
      setOutput((prev) => [...prev, 'Clearing pnpm cache...']);
      await webContainer.spawn('pnpm', ['cache', 'clear']);
      setOutput((prev) => [...prev, 'pnpm cache cleared']);

      const packageJsonExists = files?.some((file) => file.name === 'package.json');
      if (!packageJsonExists) {
        setOutput((prev) => [...prev, 'No package.json found. Creating minimal package.json...']);
        const minimalPackageJson = {
          name: 'project',
          version: '1.0.0',
          private: true,
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
          },
          dependencies: {},
          devDependencies: {
            'netlify-cli': 'latest'
          }
        };
        await webContainer.fs.writeFile('package.json', JSON.stringify(minimalPackageJson, null, 2));
        setFiles((prev) => [
          ...prev,
          {
            name: 'package.json',
            type: 'file',
            path: '/package.json',
            content: JSON.stringify(minimalPackageJson, null, 2),
          },
        ]);
        setOutput((prev) => [...prev, 'Minimal package.json created']);
      }

      setOutput((prev) => [...prev, 'Retrying pnpm install...']);
      const installProcess = await webContainer.spawn('pnpm', [
        'install',
        '--registry=https://registry.npmjs.org',
        '--prefer-offline',
      ]);
      let installOutput = '';
      installProcess.output.pipeTo(
        new WritableStream({
          write(chunk) {
            installOutput += chunk;
            setOutput((prev) => [...prev, chunk]);
          },
        })
      );
      const exitCode = await installProcess.exit;
      if (exitCode !== 0) {
        const errorMsg = `pnpm install failed with exit code ${exitCode}: ${installOutput}`;
        setOutput((prev) => [...prev, errorMsg]);
        setError(errorMsg);
        return;
      }
      setOutput((prev) => [...prev, 'Dependencies installed successfully']);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fix dependencies';
      setOutput((prev) => [...prev, `Error fixing dependencies: ${errorMessage}`]);
      setError(`Error fixing dependencies: ${errorMessage}`);
    }
  };

  const createMountStructure = (files: FileItem[]): Record<string, any> => {
    const mountStructure: Record<string, any> = {};
    const processFile = (file: FileItem, isRootFolder: boolean) => {
      if (file.type === 'folder') {
        mountStructure[file.name] = {
          directory: file.children
            ? Object.fromEntries(file.children.map((child) => [child.name, processFile(child, false)]))
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
    files.forEach((file) => processFile(file, true));
    return mountStructure;
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    // Display WebContainer initialization status
    if (isWebContainerLoading) {
      setOutput((prev) => [...prev, 'Initializing WebContainer environment...']);
    } else if (webContainerError) {
      const errorMsg = `WebContainer failed to initialize: ${webContainerError.message}`;
      setOutput((prev) => [...prev, errorMsg]);
      setError(errorMsg);
    } else if (webContainer) {
      setOutput((prev) => [...prev, 'WebContainer initialized successfully']);
    }
  }, [isWebContainerLoading, webContainerError, webContainer]);

  useEffect(() => {
    if (!webContainer) return;

    const installDependencies = async () => {
      try {
        setOutput((prev) => [...prev, 'Installing dependencies with pnpm...']);
        const installProcess = await webContainer.spawn('pnpm', [
          'install',
          '--registry=https://registry.npmjs.org',
          '--prefer-offline',
        ]);
        let installOutput = '';
        installProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              installOutput += chunk;
              setOutput((prev) => [...prev, chunk]);
            },
          })
        );
        const exitCode = await installProcess.exit;
        if (exitCode !== 0) {
          const errorMsg = `pnpm install failed with exit code ${exitCode}: ${installOutput}`;
          setOutput((prev) => [...prev, errorMsg]);
          setError(errorMsg);
          await fixDependencyError();
        } else {
          setOutput((prev) => [...prev, 'Dependencies installed successfully']);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setOutput((prev) => [...prev, `Error installing dependencies: ${errorMessage}`]);
        setError(`Error installing dependencies: ${errorMessage}`);
        fixDependencyError();
      }
    };

    installDependencies();

    webContainer.on('server-ready', (_port: number, url: string) => {
      setOutput((prev) => [...prev, `Server running at: ${url}`]);
    });
  }, [webContainer]);

  return (
    <div className="bg-gray-900/80 backdrop-blur-2xl rounded-xl p-4 border border-blue-500/40 h-[15vh] sm:h-[20vh] min-h-[80px] flex flex-col shadow-lg shadow-blue-500/30">
      <div className="flex-1 overflow-y-auto mb-2 font-mono text-xs sm:text-sm text-blue-100" ref={terminalRef}>
        {output.map((line, index) => (
          <div
            key={index}
            className={`whitespace-pre-wrap ${line.includes('Error') ? 'text-red-400' : ''}`}
          >
            {line}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <form onSubmit={handleSubmit} className="flex flex-1">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command (e.g., pnpm install, netlify deploy --prod)"
            className="flex-1 bg-gray-800/50 border border-blue-500/40 rounded-l-lg p-2 text-xs sm:text-sm text-blue-100 placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
            disabled={isWebContainerLoading}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-r-lg text-xs sm:text-sm font-medium"
            disabled={isWebContainerLoading}
          >
            Run
          </button>
        </form>
        {error && (
          <button
            onClick={handleFixError}
            className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium"
          >
            Fix
          </button>
        )}
      </div>
    </div>
  );
};