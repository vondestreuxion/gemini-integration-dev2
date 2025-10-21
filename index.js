import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const app = express();
const upload = multer();

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

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
            message: 'Prompt is required and must be a string!',
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
                systemInstruction: 'You are a helpful pirate assistant',
                temperature: 0.9,
                maxOutputTokens: 1024
            }
        });
        
        res.status(200).json({ 
            success: true,
            message: 'Text generated successfully!',
            data: response.text
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
            data: null
       });
    }

});

app.listen(
    PORT, // Use the PORT constant defined earlier.
    () => {
        console.log(`Server is running on port ${PORT}`);
    }
);