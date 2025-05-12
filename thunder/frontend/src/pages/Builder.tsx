
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';
import { WebContainer } from '@webcontainer/api';
import { Lightning } from '../components/lightning';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Octokit } from '@octokit/core';
import CryptoJS from 'crypto-js';
import { useMediaQuery } from 'react-responsive';

// Terminal Component
const Terminal: React.FC<{
  webContainer: WebContainer | undefined;
  onCommand: (command: string) => void;
  files?: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  prompt: string;
  githubToken: string | null;
  githubUser: string | null;
  deployToGitHub: (repoName: string) => Promise<void>;
}> = ({ webContainer, onCommand, files, setFiles, prompt, githubToken, githubUser, deployToGitHub }) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const executeCommand = async (cmd: string) => {
    if (!webContainer) {
      const errorMsg = 'Error: WebContainer not initialized';
      setOutput(prev => [...prev, errorMsg]);
      setError(errorMsg);
      return;
    }

    const args = cmd.trim().split(' ');
    const commandName = args[0];
    const commandArgs = args.slice(1);

    setOutput(prev => [...prev, `> ${cmd}`]);
    setError(null);

    try {
      if (commandName === 'deploy') {
        if (!githubToken || !githubUser) {
          const errorMsg = 'Error: Not authenticated with GitHub. Please log in.';
          setOutput(prev => [...prev, errorMsg]);
          setError(errorMsg);
          return;
        }
        const repoName = commandArgs[0] || `project-${Date.now()}`;
        setOutput(prev => [...prev, `Deploying to GitHub repository: ${githubUser}/${repoName}`]);
        await deployToGitHub(repoName);
        setOutput(prev => [...prev, `Successfully deployed to https://github.com/${githubUser}/${repoName}`]);
      } else if (commandName === 'bolt.new') {
        setOutput(prev => [...prev, 'Executing bolt.new...']);
        const process = await webContainer.spawn('npm', ['init', '-y']);
        process.output.pipeTo(new WritableStream({
          write(chunk) {
            setOutput(prev => [...prev, chunk]);
          }
        }));
        const exitCode = await process.exit;
        if (exitCode !== 0) {
          const errorMsg = `Command "${cmd}" failed with exit code ${exitCode}`;
          setOutput(prev => [...prev, errorMsg]);
          setError(errorMsg);
        } else {
          setOutput(prev => [...prev, 'Project initialized with bolt.new']);
        }
      } else {
        const process = await webContainer.spawn(commandName, commandArgs);
        process.output.pipeTo(new WritableStream({
          write(chunk) {
            setOutput(prev => [...prev, chunk]);
          }
        }));
        const exitCode = await process.exit;
        if (exitCode !== 0) {
          const errorMsg = `Command "${cmd}" failed with exit code ${exitCode}`;
          setOutput(prev => [...prev, errorMsg]);
          setError(errorMsg);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fullError = `Error executing "${cmd}": ${errorMessage}`;
      setOutput(prev => [...prev, fullError]);
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
      setOutput(prev => [...prev, 'Attempting to fix error...']);
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim(),
        error
      });
      const { files: newFiles } = response.data;
      setFiles(newFiles);
      setOutput(prev => [...prev, 'Project files updated to fix error']);
      setError(null);
      if (webContainer) {
        const mountStructure = createMountStructure(newFiles);
        await webContainer.mount(mountStructure);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fix error';
      setOutput(prev => [...prev, `Error fixing project: ${errorMessage}`]);
      setError(`Error fixing project: ${errorMessage}`);
    }
  };

  const createMountStructure = (files: FileItem[]): Record<string, any> => {
    const mountStructure: Record<string, any> = {};
    const processFile = (file: FileItem, isRootFolder: boolean) => {
      if (file.type === 'folder') {
        mountStructure[file.name] = {
          directory: file.children ?
            Object.fromEntries(
              file.children.map(child => [child.name, processFile(child, false)])
            )
            : {}
        };
      } else if (file.type === 'file') {
        if (isRootFolder) {
          mountStructure[file.name] = {
            file: {
              contents: file.content || ''
            }
          };
        } else {
          return {
            file: {
              contents: file.content || ''
            }
          };
        }
      }
      return mountStructure[file.name];
    };
    files.forEach(file => processFile(file, true));
    return mountStructure;
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (!webContainer) return;

    webContainer.spawn('npm', ['install']).then(installProcess => {
      installProcess.output.pipeTo(new WritableStream({
        write(chunk) {
          setOutput(prev => [...prev, chunk]);
        }
      }));
      installProcess.exit.then(exitCode => {
        if (exitCode !== 0) {
          const errorMsg = `npm install failed with exit code ${exitCode}`;
          setOutput(prev => [...prev, errorMsg]);
          setError(errorMsg);
        }
      });
    });

    webContainer.on('server-ready', (_port: number, url: string) => {
      setOutput(prev => [...prev, `Server running at: ${url}`]);
    });
  }, [webContainer]);

  return (
    <div className="bg-gray-900/80 backdrop-blur-2xl rounded-xl p-4 border border-blue-500/40 h-[15vh] sm:h-[20vh] min-h-[80px] flex flex-col shadow-lg shadow-blue-500/30">
      <div className="flex-1 overflow-y-auto mb-2 font-mono text-xs sm:text-sm text-blue-100" ref={terminalRef}>
        {output.map((line, index) => (
          <div key={index} className={`whitespace-pre-wrap ${line.includes('Error') ? 'text-red-400' : ''}`}>
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
            placeholder="Enter command (e.g., npm install, deploy [repo-name])"
            className="flex-1 bg-gray-800/50 border border-blue-500/40 rounded-l-lg p-2 text-xs sm:text-sm text-blue-100 placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-r-lg text-xs sm:text-sm font-medium"
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export function Builder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prompt } = (location.state || {}) as { prompt?: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webContainer = useWebContainer();
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState<string | null>(null);
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeSection, setActiveSection] = useState<'steps' | 'files' | 'editor' | 'terminal'>('steps');
  const isMobile = useMediaQuery({ maxWidth: 640 });

  useEffect(() => {
    if (!prompt && location.pathname === '/github-callback') {
      // OAuth callback: wait for token processing
    } else if (!prompt) {
      navigate('/', { replace: true });
    }
  }, [prompt, location.pathname, navigate]);

  const generateCodeVerifier = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const verifier = Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return verifier;
  };

  const generateCodeChallenge = (verifier: string) => {
    const hashed = CryptoJS.SHA256(verifier);
    const base64 = CryptoJS.enc.Base64.stringify(hashed);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const handleGithubLogin = () => {
    const verifier = generateCodeVerifier();
    const challenge = generateCodeChallenge(verifier);
    setCodeVerifier(verifier);

    const clientId = 'Ov23lihKpcUrawEIsn9B';
    const redirectUri = `${window.location.origin}/github-callback`;
    const scope = 'repo';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&code_challenge=${challenge}&code_challenge_method=S256`;
    window.location.href = githubAuthUrl;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && codeVerifier) {
      const clientId = 'Ov23lihKpcUrawEIsn9B';
      const redirectUri = `${window.location.origin}/github-callback`;
      const tokenUrl = 'https://github.com/login/oauth/access_token';
      const body = {
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      };

      fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      })
        .then(response => response.json())
        .then(data => {
          if (data.access_token) {
            setGithubToken(data.access_token);
            const octokit = new Octokit({ auth: data.access_token });
            octokit.request('GET /user').then(userResponse => {
              setGithubUser(userResponse.data.login);
              window.history.replaceState({}, document.title, window.location.pathname);
              setCodeVerifier(null);
              if (prompt) {
                navigate('/builder', { state: { prompt }, replace: true });
              } else {
                navigate('/', { replace: true });
              }
            });
          } else {
            console.error('Error retrieving access token:', data);
            navigate('/', { replace: true });
          }
        })
        .catch(error => {
          console.error('Error exchanging GitHub token:', error);
          navigate('/', { replace: true });
        });
    }
  }, [codeVerifier, navigate, prompt]);

  const handleGithubLogout = () => {
    setGithubToken(null);
    setGithubUser(null);
    setCodeVerifier(null);
  };

  const handleDeployToGitHub = async (repoName: string) => {
    if (!githubToken || !githubUser) {
      throw new Error('Not authenticated with GitHub');
    }
    const octokit = new Octokit({ auth: githubToken });

    try {
      try {
        await octokit.request('GET /repos/{owner}/{repo}', {
          owner: githubUser,
          repo: repoName
        });
      } catch (error) {
        await octokit.request('POST /user/repos', {
          name: repoName,
          description: `Project created from prompt: ${prompt}`,
          private: false,
          auto_init: true
        });
      }

      const fileContents: { path: string; content: string }[] = [];
      const addFileToCommit = (file: FileItem, path: string) => {
        if (file.type === 'file' && file.content) {
          fileContents.push({ path, content: file.content });
        } else if (file.type === 'folder' && file.children) {
          file.children.forEach(child => {
            addFileToCommit(child, `${path}/${child.name}`);
          });
        }
      };
      files.forEach(file => addFileToCommit(file, file.name));

      const repoResponse = await octokit.request('GET /repos/{owner}/{repo}/branches/main', {
        owner: githubUser,
        repo: repoName
      });
      const latestCommitSha = repoResponse.data.commit.sha;
      const treeSha = repoResponse.data.commit.commit.tree.sha;

      const newTree = await octokit.request('POST /repos/{owner}/{repo}/git/trees', {
        owner: githubUser,
        repo: repoName,
        base_tree: treeSha,
        tree: fileContents.map(file => ({
          path: file.path,
          mode: '100644',
          type: 'blob',
          content: file.content
        }))
      });

      const newCommit = await octokit.request('POST /repos/{owner}/{repo}/git/commits', {
        owner: githubUser,
        repo: repoName,
        message: 'Initial project files from Thunder',
        tree: newTree.data.sha,
        parents: [latestCommitSha]
      });

      await octokit.request('PATCH /repos/{owner}/{repo}/git/refs/heads/main', {
        owner: githubUser,
        repo: repoName,
        sha: newCommit.data.sha
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deploy to GitHub';
      throw new Error(errorMessage);
    }
  };

  const handleTerminalCommand = (command: string) => {
    setLlmMessages(prev => [...prev, { role: "user", content: `Terminal command: ${command}` }]);
  };

  const handleExportZip = async () => {
    const zip = new JSZip();
    const addFileToZip = (file: FileItem, path: string) => {
      if (file.type === 'file' && file.content) {
        zip.file(path, file.content);
      } else if (file.type === 'folder' && file.children) {
        file.children.forEach(child => {
          addFileToZip(child, `${path}/${child.name}`);
        });
      }
    };
    files.forEach(file => addFileToZip(file, file.name));
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'project-files.zip');
    } catch (error) {
      console.error('Error generating zip file:', error);
    }
  };

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;

    steps.filter(({ status }) => status === "pending").forEach(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles];
        let finalAnswerRef = currentFileStructure;

        let currentFolder = "";
        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);

          if (!parsedPath.length) {
            let file = currentFileStructure.find(x => x.path === currentFolder);
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              });
            } else {
              file.content = step.code;
            }
          } else {
            let folder = currentFileStructure.find(x => x.path === currentFolder);
            if (!folder) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              });
            }
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }
    });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps(steps => steps.map((s: Step) => ({
        ...s,
        status: "completed"
      })));
    }
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === 'folder') {
          mountStructure[file.name] = {
            directory: file.children ?
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              )
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
        return mountStructure[file.name];
      };
      files.forEach(file => processFile(file, true));
      return mountStructure;
    };
    if (webContainer && files.length > 0) {
      const mountStructure = createMountStructure(files);
      webContainer.mount(mountStructure);
    }
  }, [files, webContainer]);

  async function init() {
    if (!prompt) return;
    try {
      const response = await axios.post(`${BACKEND_URL}/template`, {
        prompt: prompt.trim()
      });
      setTemplateSet(true);

      const { prompts, uiPrompts } = response.data;

      setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        status: "pending"
      })));

      setLoading(true);
      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
        messages: [...prompts, prompt].map(content => ({
          role: "user",
          content
        }))
      });

      setLoading(false);
      setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
        ...x,
        status: "pending" as const
      }))]);

      setLlmMessages([...prompts, prompt].map(content => ({
        role: "user",
        content
      })));

      setLlmMessages(x => [...x, { role: "assistant", content: stepsResponse.data.response }]);
    } catch (error) {
      console.error('Error initializing project:', error);
    }
  }

  useEffect(() => {
    if (prompt) {
      init();
    }
  }, [prompt]);

  if (!prompt && location.pathname !== '/github-callback') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
        <p>No project prompt provided. Please start a new project from the home page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col relative overflow-hidden font-sans">
      {/* Lightning Background (Disabled on Mobile) */}
      {!isMobile && <Lightning hue={230} intensity={1.2} speed={0.8} size={1.5} />}

      <motion.header
        className="bg-gray-900/80 backdrop-blur-2xl border-b border-blue-500/40 px-4 sm:px-6 py-4 relative z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <div className="text-center sm:text-left">
            <motion.h1
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Thunder
            </motion.h1>
            <motion.p
              className="text-xs sm:text-sm text-blue-200 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Crafting: <span className="text-blue-400">{prompt}</span>
            </motion.p>
            {githubUser && (
              <motion.p
                className="text-xs sm:text-sm text-blue-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                GitHub: <span className="text-blue-400">{githubUser}</span>
              </motion.p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {githubToken ? (
              <motion.button
                onClick={handleGithubLogout}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(96, 165, 250, 0.8)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-red-500/40 hover:shadow-red-600/50 transition-all animate-pulse-glow"
              >
                GitHub Logout
              </motion.button>
            ) : (
              <motion.button
                onClick={handleGithubLogin}
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(96, 165, 250, 0.8)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-blue-500/40 hover:shadow-purple-600/50 transition-all animate-pulse-glow flex items-center gap-2"
              >
                <svg
                  className="w-4 sm:w-5 h-4 sm:h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"
                  />
                </svg>
                GitHub Login
              </motion.button>
            )}
            <motion.button
              onClick={handleExportZip}
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(96, 165, 250, 0.8)' }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-blue-500/40 hover:shadow-purple-600/50 transition-all animate-pulse-glow"
            >
              Export as ZIP
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-hidden relative z-10">
        {isMobile ? (
          <motion.div
            className="h-full flex flex-col p-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Mobile Navigation Tabs */}
            <div className="flex justify-around bg-gray-900/60 backdrop-blur-2xl rounded-xl border border-blue-500/40 p-2 shadow-lg shadow-blue-500/30">
              <motion.button
                onClick={() => setActiveSection('steps')}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${activeSection === 'steps' ? 'bg-blue-500/40 text-blue-100' : 'text-blue-200 hover:text-blue-400'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Steps
              </motion.button>
              <motion.button
                onClick={() => setActiveSection('files')}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${activeSection === 'files' ? 'bg-blue-500/40 text-blue-100' : 'text-blue-200 hover:text-blue-400'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Files
              </motion.button>
              <motion.button
                onClick={() => setActiveSection('editor')}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${activeSection === 'editor' ? 'bg-blue-500/40 text-blue-100' : 'text-blue-200 hover:text-blue-400'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Editor
              </motion.button>
              <motion.button
                onClick={() => setActiveSection('terminal')}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${activeSection === 'terminal' ? 'bg-blue-500/40 text-blue-100' : 'text-blue-200 hover:text-blue-400'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Terminal
              </motion.button>
            </div>

            {/* Mobile Sections */}
            {activeSection === 'steps' && (
              <motion.div
                className="bg-gray-900/60 backdrop-blur-2xl rounded-xl p-4 border border-blue-500/40 h-[calc(100vh-12rem)] overflow-hidden flex flex-col shadow-lg shadow-blue-500/30"
                variants={itemVariants}
              >
                <div className="flex-1 overflow-y-auto pr-2">
                  <StepsList
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={setCurrentStep}
                  />
                </div>
                <div className="pt-4 border-t border-blue-500/40">
                  <div className="flex flex-col gap-3">
                    {(loading || !templateSet) && (
                      <motion.div
                        className="flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader />
                      </motion.div>
                    )}
                    {!(loading || !templateSet) && (
                      <motion.div
                        className="flex flex-col gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <textarea
                          value={userPrompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Add more instructions..."
                          className="w-full bg-gray-800/50 border border-blue-500/40 rounded-lg p-3 text-xs text-blue-100 placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition-all resize-none"
                          rows={3}
                        />
                        <motion.button
                          onClick={async () => {
                            const newMessage = {
                              role: "user" as const,
                              content: userPrompt
                            };
                            setLoading(true);
                            try {
                              const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                                messages: [...llmMessages, newMessage]
                              });
                              setLlmMessages((x: { role: "user" | "assistant"; content: string }[]) => [...x, newMessage]);
                              setLlmMessages((x: { role: "user" | "assistant"; content: string }[]) => [...x, {
                                role: "assistant",
                                content: stepsResponse.data.response
                              }]);
                              setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                                ...x,
                                status: "pending" as const
                              }))]);
                            } catch (error) {
                              console.error('Error enhancing request:', error);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(96, 165, 250, 0.8)' }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-lg shadow-blue-500/40 hover:shadow-purple-600/50 transition-all animate-pulse-glow"
                        >
                          Enhance Request
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === 'files' && (
              <motion.div
                className="bg-gray-900/60 backdrop-blur-2xl rounded-xl p-4 border border-blue-500/40 h-[calc(100vh-12rem)] shadow-lg shadow-blue-500/30"
                variants={itemVariants}
              >
                <FileExplorer
                  files={files}
                  onFileSelect={setSelectedFile}
                />
              </motion.div>
            )}

            {activeSection === 'editor' && (
              <motion.div
                className="bg-gray-900/60 backdrop-blur-2xl rounded-xl border border-blue-500/40 h-[calc(100vh-12rem)] flex flex-col shadow-lg shadow-blue-500/30"
                variants={itemVariants}
              >
                <TabView activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="flex-1 overflow-hidden flex flex-col">
                  {activeTab === 'code' ? (
                    <div className="flex-1">
                      <CodeEditor file={selectedFile} />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <PreviewFrame webContainer={webContainer} files={files} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeSection === 'terminal' && (
              <motion.div
                className="bg-gray-900/60 backdrop-blur-2xl rounded-xl border border-blue-500/40 h-[calc(100vh-12rem)] flex flex-col shadow-lg shadow-blue-500/30"
                variants={itemVariants}
              >
                <Terminal
                  webContainer={webContainer}
                  onCommand={handleTerminalCommand}
                  files={files}
                  setFiles={setFiles}
                  prompt={prompt || ''}
                  githubToken={githubToken}
                  githubUser={githubUser}
                  deployToGitHub={handleDeployToGitHub}
                />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="h-full grid grid-cols-4 gap-6 p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="col-span-1 space-y-6"
              variants={itemVariants}
            >
              <div className="bg-gray-900/60 backdrop-blur-2xl rounded-xl p-4 border border-blue-500/40 h-[calc(100vh-8rem)] overflow-hidden flex flex-col shadow-lg shadow-blue-500/30">
                <div className="flex-1 overflow-y-auto pr-2">
                  <StepsList
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={setCurrentStep}
                  />
                </div>
                <div className="pt-4 border-t border-blue-500/40">
                  <div className="flex flex-col gap-3">
                    {(loading || !templateSet) && (
                      <motion.div
                        className="flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Loader />
                      </motion.div>
                    )}
                    {!(loading || !templateSet) && (
                      <motion.div
                        className="flex flex-col gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <textarea
                          value={userPrompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Add more instructions..."
                          className="w-full bg-gray-800/50 border border-blue-500/40 rounded-lg p-3 text-sm text-blue-100 placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition-all resize-none"
                          rows={3}
                        />
                        <motion.button
                          onClick={async () => {
                            const newMessage = {
                              role: "user" as const,
                              content: userPrompt
                            };
                            setLoading(true);
                            try {
                              const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                                messages: [...llmMessages, newMessage]
                              });
                              setLlmMessages((x: { role: "user" | "assistant"; content: string }[]) => [...x, newMessage]);
                              setLlmMessages((x: { role: "user" | "assistant"; content: string }[]) => [...x, {
                                role: "assistant",
                                content: stepsResponse.data.response
                              }]);
                              setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                                ...x,
                                status: "pending" as const
                              }))]);
                            } catch (error) {
                              console.error('Error enhancing request:', error);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(96, 165, 250, 0.8)' }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-blue-500/40 hover:shadow-purple-600/50 transition-all animate-pulse-glow"
                        >
                          Enhance Request
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="col-span-1"
              variants={itemVariants}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-gray-900/60 backdrop-blur-2xl rounded-xl p-4 border border-blue-500/40 h-[calc(100vh-8rem)] shadow-lg shadow-blue-500/30">
                <FileExplorer
                  files={files}
                  onFileSelect={setSelectedFile}
                />
              </div>
            </motion.div>

            <motion.div
              className="col-span-2"
              variants={itemVariants}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-gray-900/60 backdrop-blur-2xl rounded-xl border border-blue-500/40 h-[calc(100vh-8rem)] flex flex-col shadow-lg shadow-blue-500/30">
                <TabView activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="flex-1 overflow-hidden flex flex-col">
                  {activeTab === 'code' ? (
                    <div className="flex-1">
                      <CodeEditor file={selectedFile} />
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <PreviewFrame webContainer={webContainer} files={files} />
                      </div>
                      <Terminal
                        webContainer={webContainer}
                        onCommand={handleTerminalCommand}
                        files={files}
                        setFiles={setFiles}
                        prompt={prompt || ''}
                        githubToken={githubToken}
                        githubUser={githubUser}
                        deployToGitHub={handleDeployToGitHub}
                      />
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      <style>
        {`
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 10px rgba(96, 165, 250, 0.5); }
            50% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.8); }
            100% { box-shadow: 0 0 10px rgba(96, 165, 250, 0.5); }
          }
          .animate-pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}
