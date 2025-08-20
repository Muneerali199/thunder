import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";
import dotenv from "dotenv";

// Load .env variables
dotenv.config();

// Define interface for message type
interface Message {
  role: "user" | "assistant";
  content: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const app = express();
app.use(cors());
app.use(express.json());

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;

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

  const answer = (await result.response.text()).trim(); // react or node

  if (answer === "react") {
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
    res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    return;
  }

  res.status(403).json({ message: "You can't access this" });
});

app.post("/chat", async (req, res) => {
  const messages: Message[] = req.body.messages;
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

  const systemPrompt = getSystemPrompt();
  const result = await chatSession.sendMessage(
    `${systemPrompt}\n${messages[messages.length - 1].content}`
  );
  const responseText = await result.response.text();

  res.json({
    response: responseText,
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
console.log("Server is running on http://localhost:3000");

app.post("/template", async (req, res) => {
  console.log("Received request to /template endpoint");
  const prompt = req.body.prompt;
  console.log("Received prompt:", prompt);

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.9,
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
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    return;
  }

  console.log("Returning 403 error");
  res.status(403).json({ message: "You can't access this" });
});

app.post("/chat", async (req, res) => {
  console.log("Received request to /chat endpoint");
  const messages: Message[] = req.body.messages;
  console.log("Received messages:", messages);

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
  console.log("Generated system prompt:", systemPrompt);

  const result = await chatSession.sendMessage(
    `${systemPrompt}\n${messages[messages.length - 1].content}`
  );
  console.log("Sent message to chat session");

  const responseText = await result.response.text();
  console.log("Received response text:", responseText);

  res.json({
    response: responseText,
  });
});