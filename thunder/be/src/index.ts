import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import { database } from "./database";
import cors from "cors";
import dotenv from "dotenv";

// Load .env variables
dotenv.config();

// Define interface for message type
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Request deduplication middleware
interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const REQUEST_TIMEOUT = 5000; // 5 seconds

// Clean up old pending requests
setInterval(() => {
  const now = Date.now();
  for (const [key, request] of pendingRequests.entries()) {
    if (now - request.timestamp > REQUEST_TIMEOUT) {
      pendingRequests.delete(key);
    }
  }
}, 10000); // Clean up every 10 seconds

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const app = express();
app.use(cors());
app.use(express.json());

// Create or get project with deduplication
app.post("/project", async (req: any, res: any) => {
  try {
    const { prompt, userId } = req.body;

    if (!prompt || !userId) {
      return res.status(400).json({ 
        error: "Missing required fields: prompt and userId" 
      });
    }

    // Create request signature for deduplication
    const requestSignature = `${userId}:${prompt.trim().toLowerCase()}`;
    
    // Check if there's already a pending request for this exact combination
    if (pendingRequests.has(requestSignature)) {
      console.log("Returning cached result for duplicate request");
      const cachedResult = await pendingRequests.get(requestSignature)!.promise;
      return res.json(cachedResult);
    }

    // Create promise for this request
    const requestPromise = database.createOrGetProject(userId, prompt);
    pendingRequests.set(requestSignature, {
      promise: requestPromise,
      timestamp: Date.now()
    });

    try {
      const result = await requestPromise;
      
      // Create corresponding chat entry if it's a new project
      if (result.isNew) {
        await database.createChat(
          userId, 
          result.project.id, 
          `Generated project: ${prompt}`
        );
      }

      // Clean up pending request
      pendingRequests.delete(requestSignature);

      res.json({
        project: result.project,
        isNew: result.isNew,
        isDuplicate: result.isDuplicate,
        message: result.isDuplicate 
          ? "Found existing project with same prompt" 
          : "Created new project"
      });

    } catch (dbError) {
      pendingRequests.delete(requestSignature);
      throw dbError;
    }

  } catch (error) {
    console.error('Error creating/getting project:', error);
    res.status(500).json({ 
      error: "Failed to create or retrieve project",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's projects
app.get("/projects/:userId", async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const projects = await database.getUserProjects(userId);
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      error: "Failed to fetch projects",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's chats
app.get("/chats/:userId", async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const chats = await database.getUserChats(userId);
    res.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ 
      error: "Failed to fetch chats",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post("/template", async (req: any, res: any) => {
  console.log("Received request to /template endpoint");
  const prompt = req.body.prompt;
  console.log("Received prompt:", prompt);

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
      systemInstruction:
        "Return either node or react based on what you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
    });

    console.log("Generated content result:", result);

    const answer = (await result.response.text()).trim(); // react or node
    console.log("Answer:", answer);

    if (answer === "react") {
      console.log("Returning React prompts");
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    }

    if (answer === "node") {
      console.log("Returning Node prompts");
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
      return;
    }

    console.log("Returning 403 error - unknown project type");
    res.status(403).json({ message: "Unable to determine project type" });

  } catch (error) {
    console.error('Error in template generation:', error);
    res.status(500).json({ 
      error: "Failed to generate template",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post("/chat", async (req: any, res: any) => {
  console.log("Received request to /chat endpoint");
  const messages: Message[] = req.body.messages;
  console.log("Received messages:", messages);

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    const chatSession = model.startChat({
      history: messages.map((msg: Message) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        maxOutputTokens: 100000,
        temperature: 0.9,
      },
    });

    console.log("Started chat session");

    const systemPrompt = getSystemPrompt();
    console.log("Generated system prompt");

    const result = await chatSession.sendMessage(
      `${systemPrompt}\n${messages[messages.length - 1].content}`
    );
    console.log("Sent message to chat session");

    const responseText = await result.response.text();
    console.log("Received response text");

    res.json({
      response: responseText,
    });

  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ 
      error: "Failed to process chat",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check endpoint
app.get("/health", (req: any, res: any) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  database.close();
  process.exit(0);
});