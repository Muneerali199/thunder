import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import PreviewModal from '../Builder/PreviewModal';

// Define the shape of the template
interface Template {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  prompt: string;
  files: { [key: string]: string };
}

const templates: Template[] = [
  {
    id: 1,
    title: 'Futuristic Portfolio',
    description: 'A sleek, animated portfolio perfect for showcasing digital art or creative projects.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182380-1e8a40ed6650?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    prompt: 'Design a futuristic portfolio for my digital art',
    files: {
      'index.html': `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Futuristic Portfolio</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#portfolio">Portfolio</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section id="home">
      <h1>Welcome to My Portfolio</h1>
      <p>Showcasing digital art with a futuristic twist.</p>
    </section>
    <section id="portfolio">
      <div class="gallery">
        <img src="https://images.unsplash.com/photo-1618005182380-1e8a40ed6650?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Art 1">
        <img src="https://images.unsplash.com/photo-1618005182380-1e8a40ed6650?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="Art 2">
      </div>
    </section>
    <section id="contact">
      <form>
        <input type="text" placeholder="Name">
        <input type="email" placeholder="Email">
        <textarea placeholder="Message"></textarea>
        <button type="submit">Send</button>
      </form>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>
      `,
      'styles.css': `
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #0d1b2a, #1b263b);
  color: #e0e1dd;
}
header {
  background: rgba(0, 0, 0, 0.5);
  padding: 1rem;
}
nav ul {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 2rem;
}
nav a {
  color: #00d4ff;
  text-decoration: none;
  font-weight: bold;
}
nav a:hover {
  color: #ff0077;
}
#home, #portfolio, #contact {
  padding: 4rem 2rem;
  text-align: center;
}
h1 {
  font-size: 3rem;
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
.gallery img {
  width: 100%;
  border-radius: 10px;
  transition: transform 0.3s;
}
.gallery img:hover {
  transform: scale(1.05);
}
form {
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: 0 auto;
  gap: 1rem;
}
input, textarea, button {
  padding: 0.5rem;
  border: none;
  border-radius: 5px;
}
button {
  background: #00d4ff;
  color: #fff;
  cursor: pointer;
}
button:hover {
  background: #ff0077;
}
      `,
      'script.js': `
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Message sent!');
});
      `
    }
  },
  {
    id: 2,
    title: 'Sustainable E-Shop',
    description: 'An eco-friendly online store with clean design and smooth navigation.',
    thumbnail: 'https://images.unsplash.com/photo-1555529669-22413aa4e3e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    prompt: 'Create an online store for sustainable fashion',
    files: {
      'index.html': `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sustainable E-Shop</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Eco Fashion</h1>
    <nav>
      <ul>
        <li><a href="#shop">Shop</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#cart">Cart</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <section id="shop">
      <div class="products">
        <div class="product">
          <img src="https://images.unsplash.com/photo-1555529669-22413aa4e3e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Eco Shirt">
          <h3>Eco Shirt</h3>
          <p>$29.99</p>
          <button>Add to Cart</button>
        </div>
        <div class="product">
          <img src="https://images.unsplash.com/photo-1555529669-22413aa4e3e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Eco Pants">
          <h3>Eco Pants</h3>
          <p>$49.99</p>
          <button>Add to Cart</button>
        </div>
      </div>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>
      `,
      'styles.css': `
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background: #f4f4f4;
}
header {
  background: #2ecc71;
  padding: 1rem;
  text-align: center;
}
header h1 {
  color: #fff;
  margin: 0;
}
nav ul {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 2rem;
}
nav a {
  color: #fff;
  text-decoration: none;
}
.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding: 2rem;
}
.product {
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
}
.product img {
  width: 100%;
  border-radius: 10px;
}
button {
  background: #2ecc71;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background: #27ae60;
}
      `,
      'script.js': `
document.querySelectorAll('.product button').forEach(button => {
  button.addEventListener('click', () => {
    alert('Added to cart!');
  });
});
      `
    }
  }
];

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const recommendations = [
    'Design a futuristic portfolio for my digital art',
    'Create an online store for sustainable fashion',
    'Build a tech blog with interactive demos',
    'Make a vibrant landing page for my app'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
      setPrompt('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
    }
  };

  const handleTemplateSelect = (templatePrompt: string) => {
    navigate('/builder', { state: { prompt: templatePrompt } });
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleClosePreview = () => {
    setSelectedTemplate(null);
  };

  const handleDownload = async (template: Template) => {
    const zip = new JSZip();
    Object.entries(template.files).forEach(([fileName, content]) => {
      zip.file(fileName, content);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${template.title.replace(/\s+/g, '-')}.zip`);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start p-10 relative overflow-hidden font-sans">
      {/* Aurora Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-pink-900/20 animate-aurora-bg opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-700/10 via-purple-700/10 to-pink-700/10 animate-aurora-bg-delayed opacity-50" />
      </div>

      {/* Particle System */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="animate-particles absolute w-2 h-2 bg-cyan-400/60 rounded-full" style={{ top: '15%', left: '25%' }} />
        <div className="animate-particles-delayed absolute w-3 h-3 bg-purple-400/60 rounded-full" style={{ top: '65%', left: '75%' }} />
        <div className="animate-particles absolute w-1.5 h-1.5 bg-pink-400/60 rounded-full" style={{ top: '35%', left: '55%' }} />
        <div className="animate-particles-delayed absolute w-2.5 h-2.5 bg-cyan-400/60 rounded-full" style={{ top: '85%', left: '35%' }} />
        <div className="animate-particles absolute w-2 h-2 bg-purple-400/60 rounded-full" style={{ top: '25%', left: '85%' }} />
      </div>

      <div className="max-w-4xl w-full space-y-14 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="text-center space-y-7"
        >
          <motion.h1
            className="text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tighter"
            animate={{ backgroundPosition: '200%' }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
            style={{ backgroundSize: '200%' }}
          >
            Arcane Construct
          </motion.h1>
          <motion.p
            className="text-gray-100 text-xl font-light max-w-xl mx-auto tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Ignite your vision and craft stunning websites with a spark of brilliance.
          </motion.p>
        </motion.div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.6, -0.05, 0.01, 0.99] }}
        >
          <div className="relative">
            <div className="bg-gray-900/15 backdrop-blur-2xl border border-gray-700/30 rounded-3xl p-4 shadow-2xl shadow-cyan-500/15">
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.2, rotate: 15, boxShadow: '0 0 25px rgba(34, 211, 238, 0.7)' }}
                whileTap={{ scale: 0.85 }}
                className="absolute bottom-5 left-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-full p-4 shadow-lg shadow-cyan-500/60 hover:shadow-cyan-500/80 transition-all duration-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
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
                className="w-full p-6 px-16 bg-transparent text-white rounded-xl border-none placeholder-gray-200/50 focus:outline-none focus:ring-4 focus:ring-cyan-500/70 transition-all duration-500 text-lg resize-none"
                whileFocus={{ scale: 1.03, boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
              />

              {prompt.trim() && (
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.15, boxShadow: '0 0 25px rgba(34, 211, 238, 0.7)' }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-8 right-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg px-8 py-3 text-sm font-semibold shadow-lg shadow-purple-500/60 hover:shadow-purple-500/80 transition-all duration-500 animate-pulse-glow"
                >
                  Generate →
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
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
              whileHover={{ scale: 1.15, y: -5, boxShadow: '0 0 20px rgba(192, 38, 211, 0.5)' }}
              whileTap={{ scale: 0.9 }}
              className="bg-gray-900/20 backdrop-blur-lg hover:bg-gray-800/40 border border-gray-600/30 text-gray-50 hover:text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-purple-500/40"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * index + 0.7, duration: 0.6 }}
            >
              {rec}
            </motion.button>
          ))}
        </motion.div>

        {/* Templates Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-center text-gray-100 tracking-wide">
            Explore Our Templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                className="bg-gray-900/30 backdrop-blur-lg border border-gray-700/30 rounded-xl p-4 flex flex-col space-y-4 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-500"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * index + 0.9, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <img
                  src={template.thumbnail}
                  alt={template.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold text-gray-50">{template.title}</h3>
                  <p className="text-sm text-gray-200">{template.description}</p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handlePreview(template)}
                    whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(34, 211, 238, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Preview
                  </motion.button>
                  <motion.button
                    onClick={() => handleTemplateSelect(template.prompt)}
                    whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(34, 211, 238, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Use Template
                  </motion.button>
                </div>
                <motion.button
                  onClick={() => handleDownload(template)}
                  whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(192, 38, 211, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800/50 hover:bg-gray-700/50 text-gray-50 rounded-lg px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Download Code
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <PreviewModal template={selectedTemplate} onClose={handleClosePreview} />
      )}

      {/* Custom CSS for Animations */}
      <style jsx>{`
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

        @keyframes particles {
          0% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(-30px) scale(1.3); opacity: 0.3; }
          100% { transform: translateY(0) scale(1); opacity: 0.7; }
        }
        .animate-particles {
          animation: particles 7s ease-in-out infinite;
        }
        .animate-particles-delayed {
          animation: particles 7s ease-in-out infinite 3s;
        }

        @keyframes pulse-glow {
          0% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
          50% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.7); }
          100% { box-shadow: 0 0 10px rgba(34, 211, 238, 0.5); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}