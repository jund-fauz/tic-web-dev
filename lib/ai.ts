import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. OpenRouter Configuration (Fallback & Main Plan)
const openRouterKey = process.env.OPENROUTER_API_KEY;
export const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openRouterKey || "missing-key",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3001",
    "X-Title": "Meal Planner App",
  }
});

// 2. Google Gemini Configuration (Primary for Regeneration)
const geminiKey = process.env.GEMINI_API_KEY;
export const genAI = new GoogleGenerativeAI(geminiKey || "missing-key");

/**
 * Helper to generate text with fallback from Gemini to OpenRouter
 */
export async function generateContent(prompt: string) {
  // Try Gemini first
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (geminiError: any) {
    console.warn("Gemini limit reached or error occurred, falling back to OpenRouter:", geminiError.message);
    
    // Fallback to OpenRouter (Gemini via OpenRouter)
    try {
      const completion = await ai.chat.completions.create({
        model: "google/gemini-2.0-flash:free", // Updated from experimental to stable free identifier
        messages: [{ role: "user", content: prompt }],
      });
      return completion.choices[0].message.content;
    } catch (openRouterError: any) {
      console.error("Both AI providers failed:", openRouterError.message);
      throw new Error("All AI providers are currently unavailable.");
    }
  }
}