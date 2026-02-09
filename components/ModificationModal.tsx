

import React, { useState } from 'react';
import { SelectedElementData, GenerationResponse, HyperbitMetadata, AppSettings } from '../types';
import { improveElement } from '../services/geminiService';

interface ModificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  elementData: SelectedElementData | null;
  currentCode: string;
  onApply: (newVersion: GenerationResponse) => void;
  sendToHyperClipboard?: (type: 'CODE_FRAGMENT', payloadData: { data: string, summary: string }, hyperbitMetadata?: Partial<HyperbitMetadata>) => void;
  settings: AppSettings; // New: Add settings prop
}

const QUICK_ACTIONS = [
  "Изменить цвет на красный",
  "Сделать шрифт крупнее",
  "Добавить тень",
  "Скруглить углы",
  "Добавить анимацию при наведении",
  "Сделать адаптивным"
];

export const ModificationModal: React.FC<ModificationModalProps> = ({ 
    isOpen, onClose, elementData, currentCode, onApply, sendToHyperClipboard, settings // Destructure settings
}) => {
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<GenerationResponse | null>(null);

  if (!isOpen || !elementData) return null;

  const handleImprove = async () => {
    setIsLoading(true);
    try {
        const result = await improveElement(currentCode, elementData, instruction, settings); // Pass settings
        setSuggestion(result);
    } catch (e) {
        console.error(e);
        alert("Ошибка анализа ИИ");
    } finally {
        setIsLoading(false);
    }
  };

  const handleApply = () => {
      if (suggestion) {
          onApply(suggestion);
          onClose();
          setSuggestion(null);
          setInstruction('');
      }
  };

  const handleSendSuggestionToHyperClipboard = () => {
    if (suggestion && sendToHyperClipboard) {
      sendToHyperClipboard(
        'CODE_FRAGMENT', 
        { data: suggestion.code, summary: suggestion.summary },
        { BASE: 0.8, ENERGY: 0.7, COLOR: 'Синий', CONTEXT: 'Предложенное изменение элемента' }
      );
      alert("Предложение отправлено в Нейронный Канал!");
    }
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-slate-900 border border-cyan-500 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.3)] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="bg-slate-950 p-4 border-b border-cyan-900 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-2 h-6 bg-cyan-500 rounded animate-pulse"></div>
                <div>
                    <h2 className="text-lg font-bold text-white tracking-widest uppercase">МОДУЛЬ МОДИФИКАЦИИ</h2>
                    <p className="text-[10px] text-cyan-500 font-mono">{elementData.selector}</p>
                </div>
             </div>
             <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
             </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
             {/* Selected Element Preview */}
             <div className="bg-black/50 p-4 rounded border border-slate-800 font-mono text-xs text-slate-400 overflow-x-auto">
                 <div className="text-[10px] text-slate-600 uppercase mb-2">ТЕКУЩИЙ КОД ЭЛЕМЕНТА:</div>
                 {elementData.html}
             </div>

             {/* Controls */}
             {!suggestion ? (
                 <div className="space-y-4">
                    <div>
                        <label className="text-xs text-cyan-400 font-bold uppercase block mb-2">ИНСТРУКЦИЯ</label>
                        <textarea 
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            placeholder="Опишите, как изменить этот элемент..."
                            className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-sm text-white focus:border-cyan-500 focus:outline-none transition-colors h-24 resize-none"
                        />
                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2 mt-2">
                           {QUICK_ACTIONS.map(action => (
                              <button 
                                key={action}
                                onClick={() => setInstruction(action)}
                                className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 hover:text-white hover:border-cyan-500 transition-all"
                              >
                                {action}
                              </button>
                           ))}
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleImprove}
                        disabled={isLoading}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                АНАЛИЗ НЕЙРОСЕТИ...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                                {instruction ? 'ПРИМЕНИТЬ ИЗМЕНЕНИЯ' : 'ПРЕДЛОЖИТЬ УЛУЧШЕНИЕ'}
                            </>
                        )}
                    </button>
                 </div>
             ) : (
                 <div className="space-y-4 animate-in slide-in-from-bottom-4">
                     <div className="bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-lg">
                        <h3 className="text-emerald-400 text-sm font-bold uppercase mb-2">ПРЕДЛОЖЕНИЕ СИСТЕМЫ:</h3>
                        <p className="text-slate-200 text-sm leading-relaxed">{suggestion.summary}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setSuggestion(null)}
                            className="py-3 px-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-bold text-sm"
                        >
                            ОТКЛОНИТЬ
                        </button>
                        <button 
                            onClick={handleApply}
                            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-500/20 transition-all font-bold text-sm flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            ПРИНЯТЬ ОБНОВЛЕНИЕ
                        </button>
                     </div>
                     {sendToHyperClipboard && (
                       <button
                         onClick={handleSendSuggestionToHyperClipboard}
                         className="w-full py-3 px-4 bg-purple-700/30 border border-purple-500/50 text-purple-400 rounded-lg text-sm font-bold hover:bg-purple-700/50 transition-colors flex items-center justify-center gap-2 mt-4"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h1a4 4 0 0 0 0 8h-1"/><path d="M7 3v3"/><path d="M17 3v3"/><path d="M7 18v3"/><path d="M17 18v3"/><path d="M5 12h14"/></svg>
                         Отправить предложение в Гипербуфер
                       </button>
                     )}
                 </div>
             )}
          </div>
       </div>
    </div>
  );
};
