import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

let aiInstance = null;

function getAI() {
  if (aiInstance) return aiInstance;
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GENAI_API_KEY;
  if (!apiKey) {
    console.warn("[geminiClient] API key not configured; SDK call skipped");
    return null;
  }
  try {
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
  } catch (e) {
    console.error(
      "[geminiClient] Failed to initialize GoogleGenAI client",
      e?.message || e
    );
    return null;
  }
}

/**
 * Generate text using the @google/genai SDK client.
 * - model: model name string (e.g. 'gemini-2.5-flash')
 * - prompt: string
 * Returns string output from model or throws.
 */
export async function generateTextWithSDK(model = "gemini-2.5-flash", prompt) {
  const ai = getAI();
  if (!ai) return null;

  if (!prompt) throw new Error("prompt required");

  const response = await ai.models.generateContent({ model, contents: prompt });

  // Try to extract text from common fields
  if (response?.text) return response.text;
  if (Array.isArray(response) && response[0]?.content)
    return response[0].content;
  if (
    response?.output &&
    Array.isArray(response.output) &&
    response.output[0]?.content
  )
    return response.output[0].content;
  if (
    response?.candidates &&
    Array.isArray(response.candidates) &&
    response.candidates[0]?.content
  )
    return response.candidates[0].content;

  // Fallback: return stringified JSON
  return JSON.stringify(response);
}

export default { generateTextWithSDK };
