
import React, { useEffect, useState, useRef } from 'react';
import { HyperbitMessage, HyperbitPayload, HyperbitMetadata } from '../types';
import { neuralConduitService } from '../services/neuralConduitService';

interface HyperClipboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCode: (code: string, summary: string) => void;
  onSendMessage?: (type: HyperbitMessage['type'], payloadData: any, hyperbitMetadata?: Partial<HyperbitMetadata>) => void;
}

// Helper to render Hyperbit Metadata
const HyperbitDisplay: React.FC<{ metadata: HyperbitMetadata }> = ({ metadata }) => (
  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
    <span className="bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700">BASE: {metadata.BASE.toFixed(1)}</span>
    <span className="bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700">ENERGY: {metadata.ENERGY.toFixed(1)}</span>
    <span className={`px-2 py-0.5 rounded-full border ${metadata.COLOR === 'Синий' ? 'border-blue-500/50 text-blue-400 bg-blue-900/20' : metadata.COLOR === 'Желтый' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-900/20' : metadata.COLOR === 'Крас' ? 'border-red-500/50 text-red-400 bg-red-900/20' : 'border-slate-700 text-slate-400 bg-slate-800/20'}`}>COLOR: {metadata.COLOR}</span>
  </div>
);

// Helper to render payload content
const PayloadPreview: React.FC<{ payload: string, type: HyperbitMessage['type'] }> = ({ payload, type }) => {
  const [expanded, setExpanded] = useState(false);
  const data = JSON.parse(payload);
  let preview = '';

  switch (type) {
    case 'CODE_FRAGMENT':
      preview = data.data.substring(0, 150) + (data.data.length > 150 ? '...' : '');
      break;
    case 'ELEMENT_DATA':
      preview = `Элемент: <${data.data.tagName}> | Селектор: ${data.data.selector}`;
      break;
    case 'RAW_INSTRUCTION':
      preview = data.data.substring(0, 150) + (data.data.length > 150 ? '...' : '');
      break;
    case 'SYSTEM_REPORT':
      preview = data.data.substring(0, 150) + (data.data.length > 150 ? '...' : '');
      break;
    default:
      preview = payload.substring(0, 150) + (payload.length > 150 ? '...' : '');
  }

  return (
    <div className="font-mono text-xs text-slate-400">
      <p className="mb-1 text-slate-500 uppercase text-[10px]">Тип: {type}</p>
      <div className={`bg-slate-950/50 p-3 rounded border border-slate-800 break-words ${!expanded ? 'line-clamp-3' : ''}`}>
        {expanded ? (typeof data.data === 'string' ? data.data : JSON.stringify(data.data, null, 2)) : preview}
      </div>
      {payload.length > 150 && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="mt-2 text-cyan-400 hover:underline text-xs"
        >
          {expanded ? 'Свернуть' : 'Развернуть'}
        </button>
      )}
    </div>
  );
};

export const HyperClipboardModal: React.FC<HyperClipboardModalProps> = ({ isOpen, onClose, onLoadCode }) => {
  const [messages, setMessages] = useState<HyperbitMessage[]>([]);
  const [processingMessageId, setProcessingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages(neuralConduitService.getMessages().reverse()); // Reverse to show latest first
      const unsubscribe = neuralConduitService.onNewMessage(() => {
        setMessages(neuralConduitService.getMessages().reverse());
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearAll = () => {
    if (window.confirm("Вы уверены, что хотите очистить весь Гипербуфер?")) {
      neuralConduitService.clearMessages();
      setMessages([]);
    }
  };

  const handleDeleteMessage = (id: string) => {
    // This requires adding a deleteMessageById to neuralConduitService
    // For now, we'll just re-fetch after a simulated delete
    setMessages(prev => prev.filter(msg => msg.id !== id));
    // In a real scenario, you'd update localStorage and broadcast this change
    const updatedMessages = neuralConduitService.getMessages().filter(msg => msg.id !== id);
    localStorage.setItem('nexus_hyperbit_messages', JSON.stringify(updatedMessages));
  };

  const handleLoadCode = (message: HyperbitMessage) => {
    const payloadContent: HyperbitPayload = JSON.parse(message.payload);
    if (payloadContent.type === 'CODE_FRAGMENT') {
      onLoadCode(payloadContent.data, `Загружен код из Гипербуфера (${message.senderId}).`);
      onClose();
    } else {
      alert("Это сообщение не содержит кода для загрузки.");
    }
  };

  const handleSendToMuza = async (message: HyperbitMessage) => {
    setProcessingMessageId(message.id);
    console.log(`[NeuralConduit] Отправка сообщения ${message.id} в Muza AI (симуляция)...`, message);
    
    // Simulate API call to local Muza AI / Olama server
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate network delay

    console.log(`[NeuralConduit] Muza AI завершила обработку сообщения ${message.id} (симуляция).`);
    alert(`Сообщение (${message.type}) успешно отправлено в Muza AI для анализа.`);
    setProcessingMessageId(null);
  };

  return (
    <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/30 rounded-xl shadow-[0_0_50px_rgba(139,92,246,0.2)] max-w-3xl w-full h-[80vh] overflow-hidden relative flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-purple-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h1a4 4 0 0 0 0 8h-1"/><path d="M7 3v3"/><path d="M17 3v3"/><path d="M7 18v3"/><path d="M17 18v3"/><path d="M5 12h14"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">НЕЙРОННЫЙ КАНАЛ</h2>
              <p className="text-xs text-purple-400 uppercase tracking-wider">ГИПЕРБУФЕР ОБМЕНА</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-lg">
              <p className="mb-2">Гипербуфер пуст.</p>
              <p className="text-sm">Отправляйте данные из разных вкладок Nexus!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 relative">
                {processingMessageId === message.id && (
                    <div className="absolute inset-0 bg-purple-900/30 flex items-center justify-center rounded-lg backdrop-blur-sm">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-4 text-purple-400 font-bold text-sm">ОТПРАВКА В MUZA AI...</span>
                    </div>
                )}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs text-slate-500 font-mono">
                      Отправитель: {message.senderId.substring(0, 8)}... | {new Date(message.timestamp).toLocaleTimeString('ru-RU')}
                    </span>
                    <p className="text-sm font-bold text-slate-200">
                      Сообщение типа: <span className="text-cyan-400">{message.type.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <button onClick={() => handleDeleteMessage(message.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
                <HyperbitDisplay metadata={message.hyperbit} />
                <div className="mt-3">
                  <PayloadPreview payload={message.payload} type={message.type} />
                </div>
                <div className="flex gap-3 mt-4">
                    {message.type === 'CODE_FRAGMENT' && (
                        <button 
                            onClick={() => handleLoadCode(message)}
                            className="px-4 py-2 bg-emerald-700/30 border border-emerald-500/50 text-emerald-400 rounded text-xs font-bold hover:bg-emerald-700/50 transition-colors"
                        >
                            Загрузить в Nexus
                        </button>
                    )}
                    <button 
                        onClick={() => handleSendToMuza(message)}
                        disabled={processingMessageId !== null}
                        className="px-4 py-2 bg-purple-700/30 border border-purple-500/50 text-purple-400 rounded text-xs font-bold hover:bg-purple-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Отправить в Muza AI
                    </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 flex justify-between items-center px-6">
            <button 
              onClick={handleClearAll} 
              className="text-red-400 hover:text-red-300 text-xs hover:underline"
            >
                ОЧИСТИТЬ ВСЕ СООБЩЕНИЯ
            </button>
            <p className="text-[10px] text-slate-600">NEURAL CONDUIT v1.0</p>
        </div>
      </div>
    </div>
  );
};
