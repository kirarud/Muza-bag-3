
import { GoogleGenAI } from "@google/genai";
import { GenerationResponse } from "../types";

declare global {
  interface Window {
    __NEXUS_SUPERVISOR__?: {
      integrity: number;
      failures: Array<{ error: string; timestamp: number }>;
      status: string;
    };
  }
}

const SANDBOX_IMPORTMAP = `
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@18.2.0?bundle",
    "react-dom": "https://esm.sh/react-dom@18.2.0?bundle",
    "react-dom/client": "https://esm.sh/react-dom@18.2.0/client?bundle",
    "react/jsx-runtime": "https://esm.sh/react@18.2.0/jsx-runtime?bundle"
  }
}
</script>
`;

export const Sentinel = {
  sanitizeCode: (rawCode: string): string => {
    let code = rawCode;
    
    // Удаление потенциально конфликтующих тегов
    code = code.replace(/<script type="importmap">[\s\S]*?<\/script>/gi, '');
    code = code.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/gi, '');
    code = code.replace(/https:\/\/esm\.sh\/react@\^?19[\d\.]*/g, 'https://esm.sh/react@18.2.0');

    const headInjection = `
      <head>
        <meta charset="UTF-8">
        ${SANDBOX_IMPORTMAP}
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { background: transparent !important; margin: 0; padding: 0; overflow-x: hidden; color: white; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-thumb { background: rgba(34,211,238,0.2); border-radius: 10px; }
        </style>
    `;

    if (code.includes('<head>')) {
      code = code.replace('<head>', headInjection);
    } else {
      code = `<!DOCTYPE html><html>${headInjection}<body>${code}</body></html>`;
    }

    const healthMonitor = `
    <script>
      (function() {
        const ping = (status, err = null) => {
          try {
            window.parent.postMessage({ type: 'NEXUS_HEALTH_CHECK', status, error: err }, '*');
          } catch(e) {}
        };
        window.onerror = (m) => ping('ERROR', m);
        window.addEventListener('load', () => ping('OK'));
        setInterval(() => ping('OK'), 1000);
      })();
    </script>
    `;

    return code.replace('</body>', `${healthMonitor}</body>`);
  },

  logFailure: (error: string) => {
    if (window.__NEXUS_SUPERVISOR__) {
      window.__NEXUS_SUPERVISOR__.failures.push({ error, timestamp: Date.now() });
      window.__NEXUS_SUPERVISOR__.integrity = Math.max(0, window.__NEXUS_SUPERVISOR__.integrity - 20);
    }
  },

  getLearningContext: (): string => {
    const f = window.__NEXUS_SUPERVISOR__?.failures || [];
    if (f.length === 0) return "";
    return `\n\nИЗВЛЕЧЕННЫЙ ОПЫТ СБОЕВ:\n${f.map(x => `- Ошибка: ${x.error}`).join('\n')}`;
  },

  attemptSingularityRepair: async (brokenCode: string, errorLog: string): Promise<GenerationResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `ПРОТОКОЛ ВОССТАНОВЛЕНИЯ: Обнаружена ошибка "${errorLog}". 
    Твоя задача — исправить код, удалив причину сбоя (особенно проверь импорты React и синтаксис хуков). 
    Верни JSON {summary, html}. Используй ТОЛЬКО React 18.2.0.
    
    ИСХОДНЫЙ КОД:
    ${brokenCode}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      config: { responseMimeType: "application/json" },
      contents: { parts: [{ text: prompt }] }
    });

    return JSON.parse(response.text.replace(/```json|```/g, '').trim());
  },

  isCodeRunable: (code: string): boolean => {
    return code.length > 50 && code.includes('react');
  }
};
