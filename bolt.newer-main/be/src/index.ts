import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";

// Define interface for message type
interface Message {
    role: "user" | "assistant";
    content: string;
}

const genAI = new GoogleGenerativeAI("AIzaSyC5WkD2dN09wd0ypYwL_FlvsKUgm9gPgyQ");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const app = express();
app.use(cors());
app.use(express.json());

app.post("/template", async (req, res) => {
    const prompt = req.body.prompt;
    
    const result = await model.generateContent({
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7
        },
        systemInstruction: "Return either node or react based on what you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
    });

    const answer = (await result.response.text()).trim(); // react or node
    if (answer === "react") {
        res.json({
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        });
        return;
    }

    if (answer === "node") {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        });
        return;
    }

    res.status(403).json({ message: "You can't access this" });
    return;
});

app.post("/chat", async (req, res) => {
    const messages: Message[] = req.body.messages;
    const chatSession = model.startChat({
        history: messages.map((msg: Message) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        })),
        generationConfig: {
            maxOutputTokens: 9000,
            temperature: 0.7
        }
    });

    const systemPrompt = getSystemPrompt();
    const result = await chatSession.sendMessage(`${systemPrompt}\n${messages[messages.length - 1].content}`);
    const responseText = await result.response.text();

    res.json({
        response: responseText
    });
});

app.listen(3000);