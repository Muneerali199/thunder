import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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

// Terminal Component
const Terminal: React.FC<{
  webContainer: WebContainer | undefined;
  onCommand: (command: string) => void;
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  prompt: string;
}> = ({ webContainer, onCommand, files, setFiles, prompt }) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Handle command execution
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
    setError(null); // Clear previous errors

    try {
      let process;
      if (commandName === 'bolt.new') {
        setOutput(prev => [...prev, 'Executing bolt.new...']);
        process = await webContainer.spawn('npm', ['init', '-y']);
      } else {
        process = await webContainer.spawn(commandName, commandArgs);
      }

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
      } else if (commandName === 'bolt.new') {
        setOutput(prev => [...prev, 'Project initialized with bolt.new']);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fullError = `Error executing "${cmd}": ${errorMessage}`;
      setOutput(prev => [...prev, fullError]);
      setError(fullError);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onCommand(command);
      executeCommand(command);
      setCommand('');
    }
  };

  // Fix error by calling /template endpoint
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
      setError(null); // Clear error
      // Remount files to WebContainer
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

  // Helper to create mount structure (same as in Builder)
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

  // Scroll to bottom of terminal output
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Capture installation output and server URL
  useEffect(() => {
    if (!webContainer) return;

    // Capture npm install output
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

    // Capture server URL
    webContainer.on('server-ready', (_port: number, url: string) => {
      setOutput(prev => [...prev, `Server running at: ${url}`]);
    });
  }, [webContainer]);

  return (
    <div className="bg-gray-900/80 backdrop-blur-2xl rounded-xl p-4 border border-blue-500/40 h-[20vh] min-h-[100px] flex flex-col shadow-lg shadow-blue-500/30">
      <div className="flex-1 overflow-y-auto mb-2 font-mono text-sm text-blue-100" ref={terminalRef}>
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
            placeholder="Enter command (e.g., npm install, bolt.new)"
            className="flex-1 bg-gray-800/50 border border-blue-500/40 rounded-l-lg p-2 text-sm text-blue-100 placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/70"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg text-sm font-medium"
          >
            Run
          </button>
        </form>
        {error && (
          <button
            onClick={handleFixError}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Fix Error
          </button>
        )}
      </div>
    </div>
  );
};

// Lightning Component (unchanged)
const Lightning: React.FC<{
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
}> = ({ hue = 230, xOffset = 0, speed = 0.8, intensity = 1.2, size = 1.5 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      
      #define OCTAVE_COUNT 10

      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }

      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.45);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 uv = fragCoord / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          uv.x += uXOffset;
          
          uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;
          
          float dist = abs(uv.x);
          vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
          vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
          col = pow(col, vec3(1.0));
          fragColor = vec4(col, 1.0);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    const iTimeLocation = gl.getUniformLocation(program, "iTime");
    const uHueLocation = gl.getUniformLocation(program, "uHue");
    const uXOffsetLocation = gl.getUniformLocation(program, "uXOffset");
    const uSpeedLocation = gl.getUniformLocation(program, "uSpeed");
    const uIntensityLocation = gl.getUniformLocation(program, "uIntensity");
    const uSizeLocation = gl.getUniformLocation(program, "uSize");

    const startTime = performance.now();
    const render = () => {
      resizeCanvas();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
      const currentTime = performance.now();
      gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);
      gl.uniform1f(uHueLocation, hue);
      gl.uniform1f(uXOffsetLocation, xOffset);
      gl.uniform1f(uSpeedLocation, speed);
      gl.uniform1f(uIntensityLocation, intensity);
      gl.uniform1f(uSizeLocation, size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [hue, xOffset, speed, intensity, size]);

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0 z-0" />;
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
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  // Handle terminal commands
  const handleTerminalCommand = (command: string) => {
    setLlmMessages(prev => [...prev, { role: "user", content: `Terminal command: ${command}` }]);
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

    const mountStructure = createMountStructure(files);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
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
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col relative overflow-hidden font-sans">
      {/* Lightning Background */}
      <Lightning hue={230} intensity={1.2} speed={0.8} size={1.5} />

      <motion.header
        className="bg-gray-900/80 backdrop-blur-2xl border-b border-blue-500/40 px-6 py-4 relative z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <motion.h1
          className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Thunder
        </motion.h1>
        <motion.p
          className="text-sm text-blue-200 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Crafting: <span className="text-blue-400">{prompt}</span>
        </motion.p>
      </motion.header>

      <div className="flex-1 overflow-hidden relative z-10">
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
                          const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                            messages: [...llmMessages, newMessage]
                          });
                          setLoading(false);

                          setLlmMessages((x: { role: "user" | "assistant"; content: string }[]) => [...x, newMessage]);
                          setLlmMessages((x: { role: "user" | "assistant"; content: string }[]) => [...x, {
                            role: "assistant",
                            content: stepsResponse.data.response
                          }]);

                          setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                            ...x,
                            status: "pending" as const
                          }))]);
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
                      <PreviewFrame webContainer={webcontainer} files={files} />
                    </div>
                    <Terminal
                      webContainer={webcontainer}
                      onCommand={handleTerminalCommand}
                      files={files}
                      setFiles={setFiles}
                      prompt={prompt}
                    />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
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