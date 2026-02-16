
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
  
  const prompt = `Ты - ведущий аналитик Инстат. Составь подробный стратегический отчет о состоянии Стандарта Общественного Капитала Бизнеса (СОКБ) на основе данных:
    
    1. Стратегия и Нацприоритеты: Прогресс ${data.nationalGoalsProgress}%, Эффективность ${data.strategicEfficiency}/100.
    2. Сотрудники: Индекс здоровья ${data.healthSafetyIndex}/100, Охват ДМС ${data.vhiCoverage}%, Обучение ${data.trainingHours}ч.
    3. Регионы: Инвестиции ${data.regionalInvestment} млн, Проектов ${data.socialProjectsCount}.
    4. Экология: Риски ${data.environmentalRiskScore}/100, Проекты ${data.conservationProjects}.
    
    Структура отчета (используй профессиональный деловой стиль, заголовки и списки):
    1. Управленческое резюме (Executive Summary).
    2. Детальный анализ по 4 векторам СОКБ (сильные стороны и зоны роста).
    3. Оценка рисков и рекомендации по минимизации.
    4. Стратегический прогноз на 3 года (качественная оценка).
    
    Объем отчета: развернутый, около 300-400 слов.`;

  try {
    const result = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.4,
      }
    }));
    // Use .text property directly as per guidelines
    return result.text || "Не удалось получить аналитику.";
  } catch (error) {
    console.error("InStat API Error:", error);
    return "Сервис аналитики временно недоступен. Пожалуйста, попробуйте позже.";
  }
};

export const askAssistant = async (question: string, data: SOKBData): Promise<string> => {
  // Always use process.env.API_KEY directly when initializing.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Ты - ИИ-консультант Инстат по СОКБ и корпоративной социальной ответственности. 
  Контекст данных компании: ${JSON.stringify(data)}.
  Ответь на вопрос пользователя кратко и профессионально: ${question}`;

  try {
    const result = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    }));
    // Use .text property directly as per guidelines
    return result.text || "Извините, я не смог сформулировать ответ.";
  } catch (error) {
    console.error("InStat API Error:", error);
    return "Извините, сервис временно перегружен. Попробуйте повторить запрос через минуту.";
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
