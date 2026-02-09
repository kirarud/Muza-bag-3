
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { blobToBase64 } from "../utils/audioUtils";
import { GenerationResponse, SelectedElementData, AppSettings } from "../types";
import { Sentinel } from "./sentinelService";

const MODEL_NAME = 'gemini-3-pro-preview'; 

const getPiiContext = (settings: AppSettings): string => {
  let piiContext = '';
  if (settings.userEmail || settings.userPhoneNumber) {
    piiContext += '\n\nИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ:';
    if (settings.userEmail) piiContext += ` Email: ${settings.userEmail}`;
    if (settings.userPhoneNumber) piiContext += ` Тел: ${settings.userPhoneNumber}`;
  }
  return piiContext;
};

export const evolveSystem = async (
  currentCode: string,
  audioBlob: Blob,
  settings: AppSettings
): Promise<GenerationResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Audio = await blobToBase64(audioBlob);
    const piiContext = getPiiContext(settings);
    const learningContext = Sentinel.getLearningContext(); // Получаем опыт системы

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_PROMPT + "\n\n" + learningContext, // Добавляем опыт в инструкции
        responseMimeType: "application/json"
      },
      contents: {
        parts: [
          {
            text: `SOURCE CODE:\n${currentCode}\n\nCOMMAND (AUDIO):${piiContext}`
          },
          {
            inlineData: {
              mimeType: audioBlob.type || 'audio/webm',
              data: base64Audio
            }
          }
        ]
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");

    let cleanText = text.replace(/```(?:json)?|```/g, '').trim();
    const firstOpen = cleanText.indexOf('{');
    const lastClose = cleanText.lastIndexOf('}');
    cleanText = cleanText.substring(firstOpen, lastClose + 1);

    const result = JSON.parse(cleanText);
    return { code: result.html || result.code, summary: result.summary };

  } catch (error) {
    console.error("Evolution failed:", error);
    throw error;
  }
};

export const improveElement = async (
  fullCode: string,
  elementData: SelectedElementData,
  userInstruction: string | undefined,
  settings: AppSettings
): Promise<GenerationResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const piiContext = getPiiContext(settings);
    
    const prompt = `
    ИЗМЕНЕНИЕ ЭЛЕМЕНТА:
    Tag: ${elementData.tagName}
    Selector: ${elementData.selector}
    
    ИНСТРУКЦИЯ: "${userInstruction || 'Сделай лучше'}"
    ВЕРНИ ПОЛНЫЙ HTML СТРАНИЦЫ В JSON {summary, html}
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        config: { responseMimeType: "application/json" },
        contents: { parts: [{ text: `FULL CODE:\n${fullCode}\n\n${prompt}${piiContext}` }] }
    });

    const text = response.text;
    let cleanText = text.replace(/```(?:json)?|```/g, '').trim();
    const firstOpen = cleanText.indexOf('{');
    const lastClose = cleanText.lastIndexOf('}');
    return JSON.parse(cleanText.substring(firstOpen, lastClose + 1));
};

export const generateSystemReport = async (code: string, settings: AppSettings): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: { parts: [{ text: `СДЕЛАЙ ОТЧЕТ ПО ЭТОМУ КОДУ:\n${code}` }] }
    });
    return response.text || "Отчет пуст.";
};