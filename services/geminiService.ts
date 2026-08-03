
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SOKBData } from "../types";

// Helper for exponential backoff to handle 5xx errors (500, 502, 503, 504)
async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  retries = 3, 
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Check for common server errors. 
    const status = error?.status || error?.code || error?.error?.code || error?.response?.status;
    const isServerError = status === 500 || status === 502 || status === 503 || status === 504;
    
    if (retries > 0 && isServerError) {
      console.warn(`API ${status} Error. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const getESGInsights = async (data: SOKBData): Promise<string> => {
  // Always use process.env.API_KEY directly when initializing.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are a lead InStat analyst. Prepare a detailed strategic report on the Business Social Capital Standard (SOKB) based on the data:
    
    1. Strategy and National Priorities: Progress ${data.nationalGoalsProgress}%, Efficiency ${data.strategicEfficiency}/100.
    2. Employees: Health index ${data.healthSafetyIndex}/100, VHI coverage ${data.vhiCoverage}%, Training ${data.trainingHours}h.
    3. Regions: investments ${data.regionalInvestment} M, Projects ${data.socialProjectsCount}.
    4. Environment: risks ${data.environmentalRiskScore}/100, Projects ${data.conservationProjects}.
    
    Report structure: use a professional business style, headings, and lists:
    1. Executive Summary.
    2. Detailed analysis across 4 SOKB vectors: strengths and growth areas.
    3. Risk assessment and mitigation recommendations.
    4. Three-year strategic forecast: qualitative assessment.
    
    Report length: detailed, around 300-400 words.`;

  try {
    const result = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.4,
      }
    }));
    // Use .text property directly as per guidelines
    return result.text || "Unable to fetch analytics.";
  } catch (error) {
    console.error("InStat API Error:", error);
    return "The analytics service is temporarily unavailable. Please try again later.";
  }
};

export const askAssistant = async (question: string, data: SOKBData): Promise<string> => {
  // Always use process.env.API_KEY directly when initializing.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `You are the InStat AI consultant for SOKB and corporate social responsibility. 
  Company data context: ${JSON.stringify(data)}.
  Answer the user question concisely and professionally: ${question}`;

  try {
    const result = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    }));
    // Use .text property directly as per guidelines
    return result.text || "Sorry, I could not formulate an answer.";
  } catch (error) {
    console.error("InStat API Error:", error);
    return "Sorry, the service is temporarily overloaded. Please try again in a minute.";
  }
};

export const generateAvatar = async (description: string): Promise<string | null> => {
  // Always use process.env.API_KEY directly when initializing.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Professional business portrait photo of a ${description}, white background, high quality, realistic, looking at camera, soft lighting` },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      },
    }));

    // Iterate through all parts to find the image part as recommended by the guidelines.
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Avatar Gen Error:", error);
    return null;
  }
};
