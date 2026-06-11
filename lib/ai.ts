import { OpenRouter } from "@openrouter/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. OpenRouter Configuration (Fallback & Main Plan)
const openRouterKey = process.env.OPENROUTER_API_KEY;
export const ai = new OpenRouter({
  apiKey: openRouterKey || "missing-key",
});

export const OPENROUTER_MODELS = [
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'deepseek/deepseek-v4-flash:free',
  'baidu/cobuddy:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'arcee-ai/trinity-large-thinking:free',
] as const;

// 2. Google Gemini Configuration (Primary for Regeneration)
const geminiKey = process.env.GEMINI_API_KEY;
export const genAI = new GoogleGenerativeAI(geminiKey || "missing-key");

/**
 * Helper to generate text with fallback from OpenRouter to Gemini
 */
export async function generateContent(prompt: string): Promise<string> {
  let lastOpenRouterError: unknown = null;

  for (const modelName of OPENROUTER_MODELS) {
    const startTime = Date.now();
    try {
      console.log(`Trying OpenRouter model: ${modelName}...`);
      
      // Add a 30s timeout to each OpenRouter call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const completion = await ai.chat.send({
          chatRequest: {
            model: modelName,
            messages: [{ role: "user", content: prompt }],
          }
        }, { signal: controller.signal });

        const content = completion?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error("OpenRouter returned an empty response.");
        }
        
        console.log(`Success with OpenRouter (${modelName}) in ${Date.now() - startTime}ms`);
        return content;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (openRouterError: unknown) {
      lastOpenRouterError = openRouterError;
      const errorMessage = openRouterError instanceof Error ? openRouterError.message : String(openRouterError);
      const duration = Date.now() - startTime;
      console.warn(`OpenRouter model failed (${modelName}) after ${duration}ms:`, errorMessage);
    }
  }

  const errorMessage = lastOpenRouterError instanceof Error ? lastOpenRouterError.message : String(lastOpenRouterError);
  console.warn("All OpenRouter models failed, falling back to Gemini:", errorMessage);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (geminiError: unknown) {
    const finalError = geminiError instanceof Error ? geminiError.message : String(geminiError)
    console.error("Both AI providers failed:", finalError);
    throw new Error("All AI providers are currently unavailable.");
  }
}
