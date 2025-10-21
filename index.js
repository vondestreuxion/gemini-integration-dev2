import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

//import path/url package
import path from "node:path";
import { fileURLToPath } from "node:url";

import 'dotenv/config';
import { text } from "node:stream/consumers";

const app = express();
const upload = multer();

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//initialize static directory
app.use(
    express.static(
        path.join(__dirname, 'static'), //rootdirectory 
    ),
);

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}

app.use(cors());
app.use(express.json());

app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;
    console.log(prompt);

    if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({
            success: false, 
            message: "Prompt is required and must be a string!",
            data: null
        });
        return;
    }

    try{
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL, 
            contents: [
                { role: 'user', parts: [{ text: prompt }] }
            ],
            config: {
                systemInstruction: "You are a helpful pirate assistant",
                temperature: 0.9,
                maxOutputTokens: 1024
            }
        });
        
        res.status(200).json({ 
            success: true,
            message: "Text generated successfully!",
            data: response.text
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            data: null
       });
    }

});


app.post("/api/chat",  async (req, res) => {
    const { conversation } = req.body;
    console.log(conversation);

    try{
        //check convo for array
        if (!Array.isArray(conversation)) {
            throw new Error("Conversation must be an array!");
        }
        let messageisValid = true;

        if (conversation.length === 0) {
            throw new Error("Conversation must have at least one message!");    
        }

        conversation.forEach((message) => {

            // 1st condition -- message must be an object and not null
            if (!message || typeof message !== 'object') {
                messageisValid = false;
                return;
            }

            const keys = Object.keys(message);
            const objectHasValidKeys = keys.every(key => 
                ["text", "role"].includes(key));

            // 2nd condition -- message must have valid structure        
            if (keys.length !== 2 || !objectHasValidKeys) {
                messageisValid = false;
                return;
            }

            const { text, role } = message;

            //3rd condition -- valid role
            if (!["model", "user"].includes(role)) {
                messageisValid = false;
                return;
            }

            //3rd condition -- valid text
            if (!text || typeof text !== "string") {
                messageisValid = false;
                return;
            }
        
            })
            if (!messageisValid) {
                throw new Error("Invalid message structure!");

            }
            const contents = conversation.map(({text, role}) => {
                return {role, parts: [{ text }]};
            });

            const response = await ai.models.generateContent({
                model: GEMINI_MODEL, 
                contents,
                config: {
                    systemInstruction: "You are a helpful pirate assistant",
                    temperature: 0.9,
                    maxOutputTokens: 1024
                }
            });

            res.status(200).json({
                success:true,
                message: "Text generated successfully!",
                data: response.text
            });
        } catch (e) {
            res.status(500).json({
                success: false,
                message: e.message,
                data: null
            })
    }
})

app.listen(
    PORT, // Use the PORT constant defined earlier.
    () => {
        console.log("Server is running on port ${PORT}");
    }
);