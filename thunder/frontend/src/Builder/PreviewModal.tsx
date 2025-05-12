import { motion } from 'framer-motion';

// Define the shape of the template prop
interface Template {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  prompt: string;
  files: { [key: string]: string };
}

// Define the props for the PreviewModal component
interface PreviewModalProps {
  template: Template;
  onClose: () => void;
}

export default function PreviewModal({ template, onClose }: PreviewModalProps) {
  // Create a data URL for the index.html content
  const htmlContent = template.files['index.html'] || '<h1>No preview available</h1>';
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-4xl relative"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-200 hover:text-white"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-100 mb-4">{template.title}</h2>
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={dataUrl}
            title={template.title}
            className="w-full h-[500px] rounded-lg border border-gray-700"
            sandbox="allow-scripts"
          />
        </div>
        <p className="text-gray-200 mt-4">{template.description}</p>
      </motion.div>
    </motion.div>
  );
}