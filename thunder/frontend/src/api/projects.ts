import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Client-side request deduplication
const pendingRequests = new Map<string, Promise<any>>();
const REQUEST_DEBOUNCE_TIME = 1000; // 1 second

// Cleanup function for pending requests
setInterval(() => {
  // Clear old requests after 10 seconds
  for (const [key, _] of pendingRequests.entries()) {
    setTimeout(() => {
      pendingRequests.delete(key);
    }, 10000);
  }
}, 30000);

export interface Project {
  id: string;
  user_id: string;
  prompt: string;
  prompt_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  project_id: string | null;
  message: string;
  created_at: string;
}

export interface ProjectResponse {
  project: Project;
  isNew: boolean;
  isDuplicate: boolean;
  message: string;
}

/**
 * Create or get existing project with server-side and client-side deduplication
 */
export async function createOrGetProject(userId: string, prompt: string): Promise<ProjectResponse> {
  // Normalize prompt for consistent deduplication
  const normalizedPrompt = prompt.trim().toLowerCase();
  const requestKey = `${userId}:${normalizedPrompt}`;

  // Check if there's already a pending request for this exact combination
  if (pendingRequests.has(requestKey)) {
    console.log('Returning existing request promise for:', requestKey);
    return await pendingRequests.get(requestKey)!;
  }

  // Create new request promise
  const requestPromise = axios.post(`${BACKEND_URL}/project`, {
    userId,
    prompt
  }).then(response => response.data);

  // Store the promise
  pendingRequests.set(requestKey, requestPromise);

  try {
    const result = await requestPromise;
    
    // Clean up after successful request
    setTimeout(() => {
      pendingRequests.delete(requestKey);
    }, REQUEST_DEBOUNCE_TIME);

    return result;
  } catch (error) {
    // Clean up on error
    pendingRequests.delete(requestKey);
    throw error;
  }
}

/**
 * Get user's projects
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    const response = await axios.get(`${BACKEND_URL}/projects/${userId}`);
    return response.data.projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

/**
 * Get user's chats
 */
export async function getUserChats(userId: string): Promise<Chat[]> {
  try {
    const response = await axios.get(`${BACKEND_URL}/chats/${userId}`);
    return response.data.chats;
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
}

/**
 * Get template type (React/Node) for a project
 */
export async function getProjectTemplate(prompt: string): Promise<any> {
  try {
    const response = await axios.post(`${BACKEND_URL}/template`, { prompt });
    return response.data;
  } catch (error) {
    console.error('Error getting project template:', error);
    throw error;
  }
}

/**
 * Chat with AI assistant
 */
export async function chatWithAssistant(messages: Array<{role: 'user' | 'assistant', content: string}>): Promise<string> {
  try {
    const response = await axios.post(`${BACKEND_URL}/chat`, { messages });
    return response.data.response;
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
}

/**
 * Legacy function for backward compatibility
 * This maintains existing localStorage functionality as fallback
 */
export function migrateLocalStorageToServer(userId: string) {
  try {
    // Get existing projects from localStorage
    const localProjects = localStorage.getItem('projects');
    const localChats = localStorage.getItem('chats');

    if (localProjects) {
      const projects = JSON.parse(localProjects);
      // Could implement migration API call here if needed
      console.log('Found local projects to potentially migrate:', projects.length);
    }

    if (localChats) {
      const chats = JSON.parse(localChats);
      console.log('Found local chats to potentially migrate:', chats.length);
    }
  } catch (error) {
    console.error('Error during localStorage migration:', error);
  }
}
