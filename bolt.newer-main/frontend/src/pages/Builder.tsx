import { useEffect, useState } from 'react';
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
import { FileNode } from '@webcontainer/api';
import { Loader } from '../components/Loader';

const MOCK_FILE_CONTENT = `// This is a sample file content
import React from 'react';

function Component() {
  return <div>Hello World</div>;
}

export default Component;`;

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
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string;}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    
    steps.filter(({status}) => status === "pending").forEach(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles];
        let finalAnswerRef = currentFileStructure;

        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
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

    // Fixed line 156: Added missing closing parenthesis
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
    // Fixed line 170: Added proper comma and closing parenthesis
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20 animate-aurora-bg opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-700/10 via-purple-700/10 to-pink-700/10 animate-aurora-bg-delayed opacity-50" />
      </div>

      <motion.header 
        className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-700/30 px-6 py-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <motion.h1 
          className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Arcane Builder
        </motion.h1>
        <motion.p 
          className="text-sm text-gray-400 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Crafting: <span className="text-cyan-300">{prompt}</span>
        </motion.p>
      </motion.header>
      
      <div className="flex-1 overflow-hidden">
        <motion.div 
          className="h-full grid grid-cols-4 gap-6 p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="col-span-1 space-y-6 overflow-auto"
            variants={itemVariants}
          >
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/30 h-[75vh] overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto pr-2">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>
              
              <div className="pt-4 border-t border-gray-700/30">
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
                        className="w-full bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
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

                          setLlmMessages(x => [...x, newMessage]);
                          setLlmMessages(x => [...x, {
                            role: "assistant",
                            content: stepsResponse.data.response
                          }]);
                          
                          setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
                            ...x,
                            status: "pending" as const
                          }))]);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-cyan-500/80 to-purple-600/80 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-cyan-500/20 hover:shadow-purple-500/30 transition-all"
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
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-700/30 h-[calc(100vh-8rem)]">
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
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/30 h-[calc(100vh-8rem)] flex flex-col">
              <TabView activeTab={activeTab} onTabChange={setActiveTab} />
              
              <div className="flex-1 overflow-hidden">
                {activeTab === 'code' ? (
                  <CodeEditor file={selectedFile} />
                ) : (
                  <PreviewFrame webContainer={webcontainer} files={files} />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style>
        {`
          @keyframes aurora {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-aurora-bg {
            background-size: 200% 200%;
            animation: aurora 10s ease infinite;
          }
          .animate-aurora-bg-delayed {
            background-size: 200% 200%;
            animation: aurora 14s ease infinite 2s;
          }
        `}
      </style>
    </div>
  );
}