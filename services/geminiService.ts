
import { GoogleGenAI, Type } from "@google/genai";
import { Course } from "../types";

// In Vite, environment variables are accessed via import.meta.env
// We also keep a fallback to process.env for local development compatibility
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process.env as any).API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getAIRecommendations = async (userInterests: string[], currentCourses: Course[]) => {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing. Check your GitHub Secrets.");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 new AI or research course ideas for a researcher interested in: ${userInterests.join(', ')}. 
      Existing hub courses are: ${currentCourses.map(c => c.title).join(', ')}.
      Format the response as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'description', 'category', 'tags']
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini AI error:", error);
    return [];
  }
};

export const generateCourseSummary = async (title: string, description: string) => {
    if (!API_KEY) return description;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a 1-sentence catchy professional summary for a course titled "${title}" with description: "${description}".`
        });
        return response.text;
    } catch (e) {
        return description;
    }
}
