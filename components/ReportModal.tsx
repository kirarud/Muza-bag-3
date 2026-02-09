

import React, { useEffect, useState } from 'react';
import { generateSystemReport } from '../services/geminiService';
import { HyperbitMetadata, AppSettings } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  sendToHyperClipboard?: (type: 'SYSTEM_REPORT', payloadData: { data: string }, hyperbitMetadata?: Partial<HyperbitMetadata>) => void;
  settings: AppSettings; // New: Add settings prop
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, currentCode, sendToHyperClipboard, settings }) => {
  const [report, setReport] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
        setLoading(true);
        generateSystemReport(currentCode, settings) // Pass settings
            .then(setReport)
            .catch(() => setReport("ОШИБКА: Не удалось сформировать отчет."))
            .finally(() => setLoading(false));
    }
  }, [isOpen, currentCode, settings]); // Add settings to dependency array

  const handleSendReportToHyperClipboard = () => {
    if (report && sendToHyperClipboard) {
      sendToHyperClipboard(
        'SYSTEM_REPORT', 
        { data: report },
        { BASE: 0.9, ENERGY: 0.8, COLOR: 'Фиолетовый', CONTEXT: 'Системный отчет для Muza AI' }
      );
      alert("Отчет отправлен в Нейронный Канал для глубокого анализа!");
    }
  };

  // Simple Markdown-like parser for visual flair
  const renderReportContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.trim().startsWith('### ')) 
        return <h3 key={i} className="text-cyan-400 font-bold mt-6 mb-2 uppercase tracking-wider text-sm border-l-2 border-cyan-500 pl-2">{line.replace('### ', '')}</h3>;
      if (line.trim().startsWith('## ')) 
        return <h2 key={i} className="text-lg text-white font-bold mt-8 mb-3 pb-2 border-b border-slate-800 flex items-center gap-2"><span className="text-cyan-500">#</span> {line.replace('## ', '')}</h2>;
      if (line.trim().startsWith('# ')) 
        return <h1 key={i} className="text-2xl text-cyan-500 font-bold mt-4 mb-6 text-center">{line.replace('# ', '')}</h1>;
      
      // List items
      if (line.trim().match(/^[-*]\s/)) 
        return <li key={i} className="ml-4 pl-2 text-slate-300 border-l border-slate-700 hover:border-cyan-500 hover:text-white transition-colors py-1">{line.replace(/^[-*]\s/, '')}</li>;
      if (line.trim().match(/^\d+\./)) 
        return <li key={i} className="ml-4 pl-2 text-slate-300 font-mono text-xs py-1">{line}</li>;

      // Empty lines
      if (!line.trim()) return <div key={i} className="h-2"></div>;

      // Bold text parsing
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="text-slate-400 leading-relaxed text-sm">
          {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                  return <span key={j} className="text-emerald-400 font-bold">{part.slice(2, -2)}</span>;
              }
              return part;
          })}
        </p>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-lg shadow-2xl max-w-3xl w-full h-[85vh] flex flex-col font-mono relative overflow-hidden">
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur z-10">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-500 rounded-sm animate-pulse"></div>
                <h2 className="text-slate-100 font-bold uppercase tracking-widest text-sm">ПРОТОКОЛ ДИАГНОСТИКИ</h2>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-xs hover:underline">ЗАКРЫТЬ [ESC]</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-700 relative z-10">
            {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-cyan-500 space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full animate-spin"></div>
                        <div className="w-16 h-16 border-4 border-t-cyan-500 rounded-full animate-spin absolute inset-0"></div>
                    </div>
                    <div className="animate-pulse tracking-widest text-xs font-bold">СКАНИРОВАНИЕ КОДА...</div>
                </div>
            ) : (
                <div className="space-y-1">
                    {renderReportContent(report)}
                    {sendToHyperClipboard && report && (
                      <button
                        onClick={handleSendReportToHyperClipboard}
                        className="mt-6 w-full py-3 px-4 bg-purple-700/30 border border-purple-500/50 text-purple-400 rounded-lg text-sm font-bold hover:bg-purple-700/50 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h1a4 4 0 0 0 0 8h-1"/><path d="M7 3v3"/><path d="M17 3v3"/><path d="M7 18v3"/><path d="M17 18v3"/><path d="M5 12h14"/></svg>
                        Отправить отчет в Нейронный Канал
                      </button>
                    )}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 text-[10px] text-slate-600 flex justify-between z-10">
             <span>SYS_ID: {Date.now().toString(16).toUpperCase()}</span>
             <span>INTEGRITY_CHECK: <span className="text-emerald-500">PASSED</span></span>
        </div>
      </div>
    </div>
  );
};
