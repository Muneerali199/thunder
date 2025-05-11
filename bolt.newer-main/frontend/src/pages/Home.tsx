import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-react';
import { Home as HomeIcon, File, Settings, LayoutDashboard, Plus, History, DollarSign, Eye } from 'lucide-react';

// Lightning Component
const Lightning: React.FC<{
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
}> = ({ hue = 230, xOffset = 0, speed = 1, intensity = 1, size = 1 }) => {
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

  return <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />;
};

// SVG Logo Component with Lightning Colors
const ThunderLogoSVG = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L3 14h9l-1 8l10-12h-9l1-8z" fill="url(#grad)" />
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#C026D3', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
  </svg>
);

type UserMetadata = {
  tier: 'free' | 'pro' | 'enterprise';
  remainingTokens: number;
};

type Project = {
  id: string;
  prompt: string;
  createdAt: string;
};

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [usage, setUsage] = useState<UserMetadata>({ 
    tier: 'free', 
    remainingTokens: 3 
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProjects = () => {
    try {
      const storedProjects = localStorage.getItem('projects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        console.log('Loaded projects from localStorage:', parsedProjects);
        setProjects(parsedProjects);
      } else {
        console.log('No projects found in localStorage');
      }
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
    }
  };

  useEffect(() => {
    const loadUsage = async () => {
      if (isSignedIn && user) {
        const metadata = user.unsafeMetadata as UserMetadata;
        setUsage({
          tier: metadata.tier || 'free',
          remainingTokens: metadata.remainingTokens || 3
        });
      } else {
        const localUsage = localStorage.getItem('usage');
        if (localUsage) {
          setUsage(JSON.parse(localUsage));
        }
      }
    };

    loadUsage();
    loadProjects();

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'projects') {
        loadProjects();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isSignedIn, user]);

  const recommendations = [
    'Design a futuristic portfolio for my digital art',
    'Create an online store for sustainable fashion',
    'Build a tech blog with interactive demos',
    'Make a vibrant landing page for my app'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      alert('Please sign in to submit prompts');
      return;
    }

    if (usage.remainingTokens <= 0 && usage.tier === 'free') {
      alert('You\'ve reached your free limit. Please upgrade to continue.');
      navigate('/pricing');
      return;
    }

    if (prompt.trim()) {
      const newUsage = {
        ...usage,
        remainingTokens: usage.remainingTokens - 1
      };

      const newProject: Project = {
        id: crypto.randomUUID(),
        prompt,
        createdAt: new Date().toISOString()
      };

      const updatedProjects = [newProject, ...projects];
      try {
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        console.log('Saved project to localStorage:', newProject);
        setProjects(updatedProjects);
      } catch (error) {
        console.error('Error saving project to localStorage:', error);
        alert('Failed to save project history. Please try again.');
        return;
      }

      setUsage(newUsage);
      
      if (user) {
        try {
          await user.update({ unsafeMetadata: newUsage });
        } catch (error) {
          console.error('Error updating user metadata:', error);
        }
      } else {
        localStorage.setItem('usage', JSON.stringify(newUsage));
      }

      navigate('/builder', { state: { prompt } });
      setPrompt('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) console.log('Uploaded file:', file);
  };

  const viewProject = (projectPrompt: string) => {
    navigate('/builder', { state: { prompt: projectPrompt } });
  };

  return (
    <div className={`min-h-screen bg-[#0F172A] flex flex-col items-center justify-start p-10 relative overflow-hidden font-sans transition-all duration-300 ${
      isSignedIn ? 'ml-16' : ''
    }`}>
      {/* Lightning Background */}
      <Lightning hue={230} intensity={1.2} speed={0.8} size={1.5} />

      {/* Sidebar */}
      <SignedIn>
        <motion.div
          className={`fixed left-0 top-0 h-screen bg-gray-900/80 backdrop-blur-2xl border-r border-blue-500/40 z-50 ${
            isSidebarExpanded ? 'w-64' : 'w-16'
          } transition-all duration-300`}
          onMouseEnter={() => setIsSidebarExpanded(true)}
          onMouseLeave={() => setIsSidebarExpanded(false)}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
          <div className="flex flex-col p-4 space-y-2 h-full">
            {/* Logo */}
            <div className="flex items-center mb-6 p-2">
              <ThunderLogoSVG />
              {isSidebarExpanded && (
                <span className="text-blue-400 text-lg font-bold ml-2">Thunder</span>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 space-y-2">
              <motion.button 
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <HomeIcon className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Home</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Dashboard</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/projects')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <File className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Projects</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/history')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <History className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">History</span>}
              </motion.button>

              <motion.button
                onClick={() => navigate('/pricing')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <DollarSign className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Pricing</span>}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                className="w-full mt-4 bg-blue-500/30 hover:bg-blue-500/40 text-blue-400 p-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                onClick={() => navigate('/')}
              >
                <Plus className="h-5 w-5" />
                {isSidebarExpanded && <span className="text-sm">New Project</span>}
              </motion.button>

              {/* Last Project */}
              {projects.length > 0 && (
                <motion.button
                  onClick={() => viewProject(projects[0].prompt)}
                  whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                  className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
                >
                  <Eye className="h-5 w-5 flex-shrink-0" />
                  {isSidebarExpanded && (
                    <span className="text-sm truncate">
                      Last: {projects[0].prompt.substring(0, 20)}{projects[0].prompt.length > 20 ? '...' : ''}
                    </span>
                  )}
                </motion.button>
              )}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto space-y-2">
              <motion.div
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-5 h-5",
                      userButtonPopoverCard: "bg-gray-900/80 border border-blue-500/40 backdrop-blur-2xl",
                      userPreviewMainIdentifier: "text-blue-400",
                      userButtonPopoverActionButtonText: "text-blue-200 hover:text-blue-400"
                    }
                  }}
                />
                {isSidebarExpanded && <span className="text-sm">Profile</span>}
              </motion.div>

              <motion.button
                onClick={() => navigate('/settings')}
                whileHover={{ scale: 1.05, backgroundColor: '#1E3A8A' }}
                className="flex items-center space-x-3 text-blue-200 hover:text-blue-400 w-full p-2 rounded-lg hover:bg-blue-900/60 transition-colors"
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {isSidebarExpanded && <span className="text-sm">Settings</span>}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </SignedIn>

      {/* Usage Indicator */}
      <SignedIn>
        <div className="absolute top-4 right-4 z-50">
          <motion.div 
            className="bg-gray-900/80 backdrop-blur-2xl px-4 py-2 rounded-full text-sm border border-blue-500/40"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {usage.tier === 'free' ? (
              <span className="text-blue-400">
                Free Tokens: {usage.remainingTokens}/3
              </span>
            ) : (
              <span className="text-purple-400">
                ⚡ Premium Access (Unlimited)
              </span>
            )}
          </motion.div>
        </div>
      </SignedIn>

      {/* Navbar (Only for signed-out users) */}
      <SignedOut>
        <nav className="w-full max-w-4xl mb-10 relative z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ThunderLogoSVG />
              <span className="text-blue-400 text-lg font-bold ml-2">Thunder</span>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button 
                onClick={() => navigate('/pricing')}
                className="text-blue-200 hover:text-blue-400 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                Pricing
              </motion.button>
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="text-blue-200 hover:text-blue-400 font-medium px-4 py-2 transition-colors duration-200"
                >
                  Sign In
                </motion.button>
              </SignInButton>
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-full transition-all duration-200 shadow-lg shadow-blue-500/40 hover:shadow-purple-600/50"
                >
                  Sign Up
                </motion.button>
              </SignUpButton>
            </div>
          </div>
        </nav>
      </SignedOut>

      {/* Content Section */}
      <div className="max-w-4xl w-full space-y-14 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center space-y-7"
        >
          <motion.h1
            className="text-7xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight tracking-tighter"
            animate={{ backgroundPosition: '200%' }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            style={{ backgroundSize: '200%' }}
          >
            What do you want to build?
          </motion.h1>
          <motion.p
            className="text-blue-200 text-xl font-light max-w-xl mx-auto tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Prompt, run, edit, and deploy full-stack web and mobile apps with Thunder.
          </motion.p>
        </motion.div>

        {/* Input Section */}
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
          >
            <div className="relative">
              <div className="bg-gray-900/60 backdrop-blur-2xl border border-blue-500/40 rounded-3xl p-4 shadow-2xl shadow-blue-500/30">
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.2, rotate: 15, boxShadow: '0 0 25px rgba(96, 165, 250, 0.8)' }}
                  whileTap={{ scale: 0.85 }}
                  className="absolute bottom-5 left-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-4 shadow-lg shadow-blue-500/60 hover:shadow-purple-600/80 transition-all duration-500"
                >
                  <Plus className="h-6 w-6" />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".jpg,.png,.pdf,.doc,.md"
                  />
                </motion.button>

                <motion.textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A modern SaaS website with animations and 3D assets"
                  rows={6}
                  className="w-full p-6 px-16 bg-transparent text-blue-100 rounded-xl border-none placeholder-blue-200/60 focus:outline-none focus:ring-4 focus:ring-blue-500/70 transition-all duration-500 text-lg resize-none"
                  whileFocus={{ scale: 1.03, boxShadow: '0 0 20px rgba(96, 165, 250, 0.5)' }}
                />

                {prompt.trim() && (
                  <motion.button
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(96, 165, 250, 0.8)' }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-8 right-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg px-8 py-3 text-sm font-semibold shadow-lg shadow-purple-600/60 hover:shadow-purple-600/80 transition-all duration-500 animate-pulse-glow"
                  >
                    Generate →
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </SignedIn>

        <SignedOut>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="bg-gray-900/60 backdrop-blur-2xl border border-blue-500/40 rounded-3xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Join Thunder to Unleash Creativity
            </h2>
            <p className="text-blue-200 mb-6">Sign up to start generating amazing website designs</p>
            <div className="flex justify-center gap-4">
              <SignUpButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-blue-500/40 hover:shadow-purple-600/50 transition-all"
                >
                  Get Started Free
                </motion.button>
              </SignUpButton>
            </div>
          </motion.div>
        </SignedOut>

        {/* Recommendations Section */}
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="flex flex-wrap gap-5 justify-center"
          >
            {recommendations.map((rec, index) => (
              <motion.button
                key={index}
                onClick={() => setPrompt(rec)}
                whileHover={{ scale: 1.15, y: -5, boxShadow: '0 0 20px rgba(192, 38, 211, 0.6)' }}
                whileTap={{ scale: 0.9 }}
                className="bg-gray-900/60 backdrop-blur-2xl hover:bg-gray-800/70 border border-blue-500/40 text-blue-100 hover:text-blue-400 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-purple-600/50"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * index + 0.7, duration: 0.6 }}
              >
                {rec}
              </motion.button>
            ))}
          </motion.div>
        </SignedIn>

        {/* Project History Section */}
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.6, -0.05, 0.01, 0.99] }}
            className="bg-gray-900/60 backdrop-blur-2xl border border-blue-500/40 rounded-3xl p-8 shadow-2xl shadow-blue-500/30"
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Your Project History
            </h2>
            {projects.length === 0 ? (
              <p className="text-blue-200 text-center">No projects yet. Start creating!</p>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project, index) => (
                  <motion.div
                    key={project.id}
                    className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-blue-500/20"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div>
                      <p className="text-blue-100 font-medium">{project.prompt}</p>
                      <p className="text-blue-400 text-sm">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <motion.button
                      onClick={() => viewProject(project.prompt)}
                      whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(96, 165, 250, 0.6)' }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-2 rounded-full shadow-lg hover:shadow-purple-600/50 transition-all"
                    >
                      <Eye className="h-5 w-5" />
                    </motion.button>
                  </motion.div>
                ))}
                {projects.length > 5 && (
                  <motion.button
                    onClick={() => navigate('/history')}
                    whileHover={{ scale: 1.05 }}
                    className="w-full text-blue-400 hover:text-blue-300 mt-4"
                  >
                    View All Projects
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </SignedIn>

        {/* Upgrade Banner */}
        {usage.tier === 'free' && usage.remainingTokens <= 1 && (
          <motion.div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl mt-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h3 className="text-white font-bold text-lg mb-2">
              ⚡ Upgrade for Unlimited Access
            </h3>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-opacity-90 transition-all"
            >
              Upgrade Now
            </button>
          </motion.div>
        )}
      </div>

      {/* Animation Styles */}
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