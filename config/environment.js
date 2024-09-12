import dotenv from 'dotenv';
dotenv.config();

export const cohereApiKey = process.env.COHERE_API_KEY;
export const jinaApiKey = process.env.JINA_API_KEY;
export const serperApiKey = process.env.SERPER_API_KEY;
export const groqApiKey = process.env.GROQ_API_KEY;
export const port = process.env.PORT || 3000;