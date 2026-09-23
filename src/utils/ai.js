import { GoogleGenAI } from '@google/genai';

// Ключ хранится в .env файле как VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey });